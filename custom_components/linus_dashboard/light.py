"""
Light platform for Linus Dashboard: nested area/floor/global light groups.

Ported from Linus Brain's AreaLightGroup — including its smart on-members-
only filtering for adjustments, not just on/off. Activity-based learning
stays in Brain; this is the "dumb" grouping/forwarding behavior only.

State computation (brightness/color/effect/feature aggregation) delegates
entirely to HA core's own homeassistant.components.group.light.LightGroup
(multiply-inherited below) via NestedGroupMixin._sync_ha_group_state — same
class HA's own light.group platform (and Magic Areas) is built on. We only
add two things on top, both gaps in HA's own implementation:
- supported_features narrowed to the intersection across members (HA's own
  unions them) — a feature we expose must actually work on every member.
- min/max_color_temp_kelvin computed from real members' actual range (HA's
  own hardcodes a fixed 2000-6500K regardless of what members support).

async_turn_on/async_turn_off stay fully overridden for the smart on-members-
only adjustment filtering — HA's own versions just forward blindly to every
member. See entity_group.py's NestedGroupMixin for the shared nested-
hierarchy scanning/debounced-subscription plumbing every platform uses.
"""

import logging
from typing import Any

from homeassistant.components.group.light import LightGroup as HALightGroup
from homeassistant.components.group.util import find_state_attributes, reduce_attribute
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
    LightEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_ON, STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity_group import ExclusionConfig, NestedGroupMixin, build_nested_domain_groups
from .group_manager import PlatformGroupManager

_LOGGER = logging.getLogger(__name__)

_LIGHT_GROUPS: dict[str, "LightGroup"] = {}

DEFAULT_MIN_COLOR_TEMP_KELVIN = 2000
DEFAULT_MAX_COLOR_TEMP_KELVIN = 6535


class LightGroup(NestedGroupMixin, HALightGroup):
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
        # HALightGroup.__init__ sets up everything its own
        # async_update_group_state() reads (_entity_ids, color_mode,
        # supported_color_modes, ...) — called directly (not via super())
        # since it doesn't itself chain up, and we want its concrete
        # initialization without also invoking GroupEntity/Entity's.
        HALightGroup.__init__(self, unique_id, "", list(member_entity_ids), None)
        # HA's own __init__ sets _attr_name to the "name" param above; we
        # want translation_key-based naming instead (_init_group below).
        # Entity._name_internal checks `hasattr(self, "_attr_name")` — not
        # truthiness — so setting it to None here would still short-circuit
        # translation lookup. Has to be deleted, not nulled.
        del self._attr_name
        # HALightGroup itself sets a *class-level* _attr_icon =
        # "mdi:lightbulb-group" default. Entity.icon has the same
        # hasattr-based lookup as name above, but here we actually want it
        # to resolve to None (not fall through to anything) — the entity's
        # own `icon` property, when non-None, overwrites our own dynamic
        # on/off icon inside extra_state_attributes (compute_group_
        # attributes, read by the frontend via state_attr(id, 'icon')) in
        # HA's final flattened state attributes, same key name colliding.
        self._attr_icon = None
        self._init_group(
            hass,
            unique_id=unique_id,
            entity_id_prefix="light",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )

    def _recompute(self) -> None:
        self._sync_ha_group_state(domain="light")

        states = [
            state
            for entity_id in self._member_entity_ids
            if (state := self.hass.states.get(entity_id)) is not None
            and state.state != STATE_UNAVAILABLE
        ]

        # Narrower than HA's own union-based supported_features: a feature
        # this group exposes must actually work on every member, not just
        # one of them.
        features = list(find_state_attributes(states, "supported_features"))
        if features:
            common_features = features[0]
            for f in features[1:]:
                common_features &= f
            self._attr_supported_features = (
                LightEntityFeature(common_features)
                | LightEntityFeature.TRANSITION
                | LightEntityFeature.FLASH
            )

        # HA's own group.light hardcodes a fixed 2000-6500K range regardless
        # of members; compute the real widest range any member supports so
        # the group's slider never rejects a value a member could take.
        self._attr_min_color_temp_kelvin = reduce_attribute(
            states,
            "min_color_temp_kelvin",
            default=DEFAULT_MIN_COLOR_TEMP_KELVIN,
            reduce=min,
        )
        self._attr_max_color_temp_kelvin = reduce_attribute(
            states,
            "max_color_temp_kelvin",
            default=DEFAULT_MAX_COLOR_TEMP_KELVIN,
            reduce=max,
        )

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
        there's no "on" light to preserve the darkness of. HA's own
        LightGroup.async_turn_on has no such filtering (blind forward) —
        deliberately not inherited.
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
            targets = [
                entity_id
                for entity_id in self._member_entity_ids
                if (state := self.hass.states.get(entity_id)) is not None
                and state.state == STATE_ON
            ]
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
            # Entities created after initial setup (new area, entity moved
            # in, ...) bypass the one-shot hide pass in async_setup_entry —
            # without this they'd be exposed to voice assistants by default
            # even with the option enabled.
            from . import async_hide_group_entities_from_voice_assistants

            await async_hide_group_entities_from_voice_assistants(hass, config_entry)

    platform_manager = PlatformGroupManager(hass, monitored_domains=["light"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
