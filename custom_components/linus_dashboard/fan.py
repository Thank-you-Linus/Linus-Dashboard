"""
Fan platform for Linus Dashboard: nested area/floor/global fan groups.

Feature aggregation follows the same pattern as light.py's LightGroup (ported
from Linus Brain): supported_features is the intersection of members (only
forward what every member understands), percentage is the average across
currently-on members, and adjustments (percentage/preset_mode) only target
already-on members — same "don't wake a fan just to nudge a setting" spirit
Brain applies to light brightness — except a percentage adjustment with
nothing on turns everything on at that percentage, since there's no "off"
state to preserve.
"""

import logging
from typing import Any

from homeassistant.components.fan import (
    ATTR_PERCENTAGE,
    ATTR_PRESET_MODE,
    FanEntity,
    FanEntityFeature,
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

_FAN_GROUPS: dict[str, "FanGroup"] = {}


class FanGroup(NestedGroupMixin, FanEntity):
    """A fan entity that forwards on/off/percentage/preset_mode to its members."""

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
            entity_id_prefix="fan",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )
        self._fans_on: list[str] = []
        self._attr_supported_features = FanEntityFeature(0)
        self._attr_preset_modes: list[str] | None = None

    def _detect_features_from_members(self) -> None:
        """Intersection of supported_features, union of preset_modes."""
        all_features: list[int] = []
        all_presets: list[str] = []

        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state or state.state == STATE_UNAVAILABLE:
                continue
            all_features.append(state.attributes.get("supported_features", 0))
            all_presets.extend(state.attributes.get("preset_modes") or [])

        if not all_features:
            self._attr_supported_features = FanEntityFeature(0)
            self._attr_preset_modes = None
            return

        common_features = all_features[0]
        for features in all_features[1:]:
            common_features &= features
        self._attr_supported_features = FanEntityFeature(common_features)
        self._attr_preset_modes = sorted(set(all_presets)) if all_presets else None

    def _recompute(self) -> None:
        self._detect_features_from_members()

        fans_on: list[str] = []
        percentages: list[int] = []
        presets: list[str] = []

        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state:
                continue
            if state.state == STATE_ON:
                fans_on.append(entity_id)
                if (v := state.attributes.get(ATTR_PERCENTAGE)) is not None:
                    percentages.append(int(v))
                if v := state.attributes.get(ATTR_PRESET_MODE):
                    presets.append(str(v))

        self._fans_on = fans_on

        # Average percentage across on members — same averaging spirit as
        # light.py's brightness (and the numeric temperature/humidity sensors).
        self._attr_percentage = (
            int(sum(percentages) / len(percentages)) if percentages else None
        )
        self._attr_preset_mode = (
            presets[0] if presets and all(p == presets[0] for p in presets) else None
        )

        attrs = compute_group_attributes(
            self.hass,
            domain="fan",
            device_class=None,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_is_on = len(fans_on) > 0
        attrs["fans_on"] = fans_on
        self._attr_extra_state_attributes = attrs

    def _fan_supports_preset(self, entity_id: str, preset_mode: str) -> bool:
        state = self.hass.states.get(entity_id)
        if not state:
            return False
        return preset_mode in (state.attributes.get("preset_modes") or [])

    async def async_turn_on(
        self,
        percentage: int | None = None,
        preset_mode: str | None = None,
        **kwargs: Any,
    ) -> None:
        """Turn the group on — see module docstring for the smart-filtering rules."""
        is_adjustment = percentage is not None or preset_mode is not None

        if is_adjustment:
            targets = list(self._fans_on)
            if not targets:
                if percentage is not None:
                    targets = list(self._member_entity_ids)
                else:
                    return

            if preset_mode is not None:
                targets = [
                    e for e in targets if self._fan_supports_preset(e, preset_mode)
                ]
                if not targets:
                    return
        else:
            targets = list(self._member_entity_ids)

        if not targets:
            return

        service_data: dict[str, Any] = {"entity_id": targets}
        if percentage is not None:
            service_data[ATTR_PERCENTAGE] = percentage
        if preset_mode is not None:
            service_data[ATTR_PRESET_MODE] = preset_mode
        await self.hass.services.async_call(
            "fan", "turn_on", service_data, blocking=False
        )

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn every member off."""
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "fan", "turn_off", {"entity_id": self._member_entity_ids}, blocking=False
        )

    async def async_set_percentage(self, percentage: int) -> None:
        """
        Set fan speed — same on-members-only targeting as async_turn_on,
        except percentage=0 (== turn_off in HA's fan convention) always
        applies to every member, and a nonzero percentage with nothing
        currently on turns every member on at that percentage.
        """
        if percentage == 0:
            await self.async_turn_off()
            return

        targets = list(self._fans_on) or list(self._member_entity_ids)
        if not targets:
            return
        await self.hass.services.async_call(
            "fan",
            "set_percentage",
            {"entity_id": targets, ATTR_PERCENTAGE: percentage},
            blocking=False,
        )

    async def async_set_preset_mode(self, preset_mode: str) -> None:
        """Set preset mode on already-on members that support it."""
        targets = [
            e for e in self._fans_on if self._fan_supports_preset(e, preset_mode)
        ]
        if not targets:
            return
        await self.hass.services.async_call(
            "fan",
            "set_preset_mode",
            {"entity_id": targets, ATTR_PRESET_MODE: preset_mode},
            blocking=False,
        )


def _make_fan_group(
    hass,
    unique_id,
    translation_key,
    translation_placeholders,
    device_info,
    member_entity_ids,
):
    """Idempotent factory — see light.py's _make_light_group for the full rationale."""
    existing = _FAN_GROUPS.get(unique_id)
    if existing is not None:
        hass.async_create_task(existing.async_update_members(member_entity_ids))
        return existing
    group = FanGroup(
        hass,
        unique_id,
        translation_key,
        translation_placeholders,
        device_info,
        member_entity_ids,
    )
    _FAN_GROUPS[unique_id] = group
    return group


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard fan groups (area/floor/global)."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    _FAN_GROUPS.clear()

    build_kwargs = {
        "domain": "fan",
        "unique_id_prefix": f"{DOMAIN}_all_fans",
        "translation_key": "fan_group",
        "translation_key_global": "fan_group_global",
        "entity_factory": _make_fan_group,
    }

    entities = await build_nested_domain_groups(
        hass, config_entry, exclusions, **build_kwargs
    )
    if entities:
        async_add_entities(entities)
        _LOGGER.info("Created %d fan group entities", len(entities))

    async def _rebuild(*_args) -> None:
        before_ids = set(_FAN_GROUPS.keys())
        new_groups = await build_nested_domain_groups(
            hass, config_entry, exclusions, **build_kwargs
        )
        after_ids = {group.unique_id for group in new_groups}
        to_add = [group for group in new_groups if group.unique_id not in before_ids]

        for uid in before_ids - after_ids:
            stale = _FAN_GROUPS.pop(uid)
            hass.async_create_task(stale.async_remove(force_remove=True))

        if to_add:
            async_add_entities(to_add)
            # See light.py's _rebuild for why this is needed here too.
            from . import async_hide_group_entities_from_voice_assistants

            await async_hide_group_entities_from_voice_assistants(hass, config_entry)

    platform_manager = PlatformGroupManager(hass, monitored_domains=["fan"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
