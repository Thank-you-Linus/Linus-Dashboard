"""
Light platform for Linus Dashboard: nested area/floor/global light groups.

Ported from Linus Brain's AreaLightGroup — including its full feature
aggregation (dynamic supported_color_modes/supported_features detection,
brightness/color averaging, smart on-members-only filtering for
adjustments), not just on/off. Activity-based learning stays in Brain; this
is the "dumb" grouping/forwarding behavior only. See entity_group.py for the
shared nested-hierarchy scanning logic and NestedGroupMixin for the shared
state-tracking plumbing.
"""

import logging
from typing import Any

from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_COLOR_TEMP_KELVIN,
    ATTR_EFFECT,
    ATTR_EFFECT_LIST,
    ATTR_HS_COLOR,
    ATTR_RGB_COLOR,
    ATTR_RGBW_COLOR,
    ATTR_RGBWW_COLOR,
    ATTR_WHITE,
    ColorMode,
    LightEntity,
    LightEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_ON, STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity_group import (
    ExclusionConfig,
    NestedGroupMixin,
    build_nested_domain_groups,
    compute_group_attributes,
)
from .group_manager import PlatformGroupManager

_LOGGER = logging.getLogger(__name__)

_LIGHT_GROUPS: dict[str, "LightGroup"] = {}

# Color modes that HA doesn't allow combining with BRIGHTNESS (mirrors
# Linus Brain's _compute_valid_color_modes — HA rejects BRIGHTNESS alongside
# XY/RGB/RGBW/RGBWW/HS/COLOR_TEMP in supported_color_modes).
_COLOR_MODES: set[ColorMode] = {
    ColorMode.XY,
    ColorMode.RGB,
    ColorMode.RGBW,
    ColorMode.RGBWW,
    ColorMode.HS,
    ColorMode.COLOR_TEMP,
}


class LightGroup(NestedGroupMixin, LightEntity):
    """A light entity that forwards on/off/brightness/color to its members."""

    def __init__(
        self,
        hass: HomeAssistant,
        unique_id: str,
        translation_key: str,
        translation_placeholders: dict[str, str] | None,
        device_info: dict,
        member_entity_ids: list[str],
    ) -> None:
        super().__init__()
        self._init_group(
            hass,
            unique_id=unique_id,
            entity_id_prefix="light",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )
        self._lights_on: list[str] = []
        self._lights_off: list[str] = []
        self._attr_supported_color_modes: set[ColorMode] = {ColorMode.ONOFF}
        self._attr_supported_features = LightEntityFeature(0)
        self._attr_color_mode: ColorMode = ColorMode.ONOFF

    def _detect_features_from_members(self) -> None:
        """
        Detect supported_features/supported_color_modes/effect_list from
        currently-available members.

        supported_features: intersection (only features every member
        supports, so a group action never silently no-ops on a member that
        doesn't understand it). supported_color_modes: valid combination per
        HA's rules (color modes exclude BRIGHTNESS; only one "family" wins,
        priority color > brightness > onoff). effect_list: union (any member
        offering an effect makes it selectable — actual application is
        filtered per-member in async_turn_on).
        """
        all_features: list[int] = []
        all_color_modes: list[str] = []
        all_effects: list[str] = []

        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state or state.state == STATE_UNAVAILABLE:
                continue
            all_features.append(state.attributes.get("supported_features", 0))
            all_color_modes.extend(state.attributes.get("supported_color_modes", []))
            all_effects.extend(state.attributes.get(ATTR_EFFECT_LIST) or [])

        if not all_features:
            self._attr_supported_features = LightEntityFeature(0)
            self._attr_supported_color_modes = {ColorMode.ONOFF}
            self._attr_effect_list = None
            return

        common_features = all_features[0]
        for features in all_features[1:]:
            common_features &= features
        common_features |= LightEntityFeature.TRANSITION | LightEntityFeature.FLASH
        self._attr_supported_features = LightEntityFeature(common_features)

        modes = set(all_color_modes)
        modes.discard(ColorMode.ONOFF)
        color_modes_present = modes & _COLOR_MODES
        if color_modes_present:
            self._attr_supported_color_modes = color_modes_present
        elif ColorMode.BRIGHTNESS in modes:
            self._attr_supported_color_modes = {ColorMode.BRIGHTNESS}
        else:
            self._attr_supported_color_modes = {ColorMode.ONOFF}

        self._attr_effect_list = sorted(set(all_effects)) if all_effects else None

    def _recompute(self) -> None:
        self._detect_features_from_members()

        lights_on: list[str] = []
        lights_off: list[str] = []
        brightness_values: list[int] = []
        color_temps: list[int] = []
        rgb_colors: list[tuple] = []
        hs_colors: list[tuple] = []
        rgbw_colors: list[tuple] = []
        rgbww_colors: list[tuple] = []
        effects: list[str] = []

        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state:
                continue
            if state.state == STATE_ON:
                lights_on.append(entity_id)
                if (v := state.attributes.get(ATTR_BRIGHTNESS)) is not None:
                    brightness_values.append(int(v))
                if (v := state.attributes.get(ATTR_COLOR_TEMP_KELVIN)) is not None:
                    color_temps.append(int(v))
                if (v := state.attributes.get(ATTR_RGB_COLOR)) is not None:
                    rgb_colors.append(tuple(v))
                if (v := state.attributes.get(ATTR_HS_COLOR)) is not None:
                    hs_colors.append(tuple(v))
                if (v := state.attributes.get(ATTR_RGBW_COLOR)) is not None:
                    rgbw_colors.append(tuple(v))
                if (v := state.attributes.get(ATTR_RGBWW_COLOR)) is not None:
                    rgbww_colors.append(tuple(v))
                if v := state.attributes.get(ATTR_EFFECT):
                    effects.append(str(v))
            elif state.state != STATE_UNAVAILABLE:
                lights_off.append(entity_id)

        self._lights_on = lights_on
        self._lights_off = lights_off

        # Average brightness across ON members — matches temperature/humidity
        # numeric-sensor averaging elsewhere in the integration, applied here
        # to a "measurement"-like attribute rather than a separate sensor.
        self._attr_brightness = (
            int(sum(brightness_values) / len(brightness_values))
            if brightness_values
            else None
        )
        self._attr_color_temp_kelvin = (
            color_temps[0]
            if color_temps and all(c == color_temps[0] for c in color_temps)
            else None
        )
        self._attr_rgb_color = (
            rgb_colors[0]
            if rgb_colors and all(c == rgb_colors[0] for c in rgb_colors)
            else None
        )
        self._attr_hs_color = (
            hs_colors[0]
            if hs_colors and all(c == hs_colors[0] for c in hs_colors)
            else None
        )
        self._attr_rgbw_color = (
            rgbw_colors[0]
            if rgbw_colors and all(c == rgbw_colors[0] for c in rgbw_colors)
            else None
        )
        self._attr_rgbww_color = (
            rgbww_colors[0]
            if rgbww_colors and all(c == rgbww_colors[0] for c in rgbww_colors)
            else None
        )
        self._attr_effect = (
            effects[0] if effects and all(e == effects[0] for e in effects) else None
        )

        modes = self._attr_supported_color_modes
        if self._attr_rgbww_color is not None and ColorMode.RGBWW in modes:
            self._attr_color_mode = ColorMode.RGBWW
        elif self._attr_rgbw_color is not None and ColorMode.RGBW in modes:
            self._attr_color_mode = ColorMode.RGBW
        elif self._attr_rgb_color is not None or self._attr_hs_color is not None:
            if ColorMode.HS in modes:
                self._attr_color_mode = ColorMode.HS
            elif ColorMode.RGB in modes:
                self._attr_color_mode = ColorMode.RGB
            elif ColorMode.XY in modes:
                self._attr_color_mode = ColorMode.XY
            elif ColorMode.COLOR_TEMP in modes:
                self._attr_color_mode = ColorMode.COLOR_TEMP
            else:
                self._attr_color_mode = (
                    ColorMode.BRIGHTNESS
                    if self._attr_brightness is not None
                    else ColorMode.ONOFF
                )
        elif self._attr_color_temp_kelvin is not None and ColorMode.COLOR_TEMP in modes:
            self._attr_color_mode = ColorMode.COLOR_TEMP
        elif self._attr_brightness is not None and ColorMode.BRIGHTNESS in modes:
            self._attr_color_mode = ColorMode.BRIGHTNESS
        else:
            self._attr_color_mode = ColorMode.ONOFF

        # min/max_color_temp_kelvin: widest range any member supports, so the
        # group's slider never rejects a value a member could actually take.
        min_temps = [
            self.hass.states.get(e).attributes.get("min_color_temp_kelvin")
            for e in self._member_entity_ids
            if self.hass.states.get(e)
            and self.hass.states.get(e).attributes.get("min_color_temp_kelvin")
        ]
        max_temps = [
            self.hass.states.get(e).attributes.get("max_color_temp_kelvin")
            for e in self._member_entity_ids
            if self.hass.states.get(e)
            and self.hass.states.get(e).attributes.get("max_color_temp_kelvin")
        ]
        self._attr_min_color_temp_kelvin = min(min_temps) if min_temps else 2000
        self._attr_max_color_temp_kelvin = max(max_temps) if max_temps else 6535

        attrs = compute_group_attributes(
            self.hass,
            domain="light",
            device_class=None,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_is_on = len(lights_on) > 0
        attrs["lights_on"] = lights_on
        attrs["lights_off"] = lights_off
        self._attr_extra_state_attributes = attrs

    def _light_supports_effect(self, entity_id: str, effect: str) -> bool:
        state = self.hass.states.get(entity_id)
        if not state:
            return False
        return effect in (state.attributes.get(ATTR_EFFECT_LIST) or [])

    def _light_supports_color(
        self, entity_id: str, color_kwargs: dict[str, Any]
    ) -> bool:
        state = self.hass.states.get(entity_id)
        if not state:
            return False
        color_modes = state.attributes.get("supported_color_modes", [])
        if ATTR_RGB_COLOR in color_kwargs:
            return ColorMode.RGB in color_modes or ColorMode.HS in color_modes
        if ATTR_HS_COLOR in color_kwargs:
            return ColorMode.HS in color_modes
        if ATTR_COLOR_TEMP_KELVIN in color_kwargs:
            return ColorMode.COLOR_TEMP in color_modes
        if ATTR_RGBW_COLOR in color_kwargs:
            return ColorMode.RGBW in color_modes
        if ATTR_RGBWW_COLOR in color_kwargs:
            return ColorMode.RGBWW in color_modes
        return False

    async def async_turn_on(self, **kwargs: Any) -> None:
        """
        Turn the group on, with Linus Brain's smart filtering: a bare
        turn_on() (no kwargs) targets every member, but an *adjustment*
        (brightness/color/effect/...) only applies to members already on —
        nudging a color shouldn't unexpectedly light up dark rooms. The one
        exception (also from Brain): a brightness-only adjustment with
        nothing currently on turns everything on at that brightness, since
        there's no "on" light to preserve the darkness of.
        """
        has_brightness = ATTR_BRIGHTNESS in kwargs
        is_adjustment = any(
            k in kwargs
            for k in (
                ATTR_BRIGHTNESS,
                ATTR_COLOR_TEMP_KELVIN,
                ATTR_RGB_COLOR,
                ATTR_HS_COLOR,
                ATTR_EFFECT,
                ATTR_WHITE,
                ATTR_RGBW_COLOR,
                ATTR_RGBWW_COLOR,
            )
        )

        if is_adjustment:
            targets = list(self._lights_on)
            if not targets:
                if has_brightness:
                    targets = list(self._member_entity_ids)
                else:
                    return

            if ATTR_EFFECT in kwargs:
                effect = kwargs[ATTR_EFFECT]
                targets = [e for e in targets if self._light_supports_effect(e, effect)]
                if not targets:
                    return

            if any(
                k in kwargs
                for k in (
                    ATTR_COLOR_TEMP_KELVIN,
                    ATTR_RGB_COLOR,
                    ATTR_HS_COLOR,
                    ATTR_RGBW_COLOR,
                    ATTR_RGBWW_COLOR,
                )
            ):
                targets = [e for e in targets if self._light_supports_color(e, kwargs)]
                if not targets:
                    return
        else:
            targets = list(self._member_entity_ids)

        if not targets:
            return
        await self.hass.services.async_call(
            "light", "turn_on", {"entity_id": targets, **kwargs}, blocking=False
        )

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn every member off."""
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "light",
            "turn_off",
            {"entity_id": self._member_entity_ids, **kwargs},
            blocking=False,
        )


def _make_light_group(
    hass: HomeAssistant,
    unique_id: str,
    translation_key: str,
    translation_placeholders: dict[str, str] | None,
    device_info: dict,
    member_entity_ids: list[str],
) -> LightGroup:
    """
    Idempotent factory: reuse the existing entity for this unique_id (and
    schedule a member-list update on it) instead of constructing a duplicate.
    This is what lets `_rebuild` tell genuinely new groups (need
    async_add_entities) apart from ones that already exist (just need their
    member list refreshed in place).
    """
    existing = _LIGHT_GROUPS.get(unique_id)
    if existing is not None:
        hass.async_create_task(existing.async_update_members(member_entity_ids))
        return existing

    group = LightGroup(
        hass,
        unique_id,
        translation_key,
        translation_placeholders,
        device_info,
        member_entity_ids,
    )
    _LIGHT_GROUPS[unique_id] = group
    return group


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard light groups (area/floor/global)."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)

    # Module-level registry can hold stale entries from a previous load of
    # this config entry (reload after an options change) — those entities
    # were already torn down by HA, so start from a clean slate here rather
    # than in _rebuild.
    _LIGHT_GROUPS.clear()

    entities = await build_nested_domain_groups(
        hass,
        config_entry,
        exclusions,
        domain="light",
        unique_id_prefix=f"{DOMAIN}_all_lights",
        translation_key="area_lights",
        translation_key_global="area_lights_global",
        entity_factory=_make_light_group,
    )

    if entities:
        async_add_entities(entities)
        _LOGGER.info("Created %d light group entities", len(entities))

    async def _rebuild(*_args) -> None:
        before_ids = set(_LIGHT_GROUPS.keys())

        new_groups = await build_nested_domain_groups(
            hass,
            config_entry,
            exclusions,
            domain="light",
            unique_id_prefix=f"{DOMAIN}_all_lights",
            translation_key="area_lights",
            translation_key_global="area_lights_global",
            entity_factory=_make_light_group,
        )

        after_ids = {group.unique_id for group in new_groups}
        to_add = [group for group in new_groups if group.unique_id not in before_ids]

        for uid in before_ids - after_ids:
            stale = _LIGHT_GROUPS.pop(uid)
            hass.async_create_task(stale.async_remove(force_remove=True))

        if to_add:
            async_add_entities(to_add)

    platform_manager = PlatformGroupManager(hass, monitored_domains=["light"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
