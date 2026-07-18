"""
Fan platform for Linus Dashboard: nested area/floor/global fan groups.

State computation (percentage/oscillating/direction/feature aggregation)
delegates to HA core's own homeassistant.components.group.fan.FanGroup
(multiply-inherited below) — see light.py's module docstring for the general
pattern. Gains oscillate/direction support and per-feature-flag-safe
turn_off targeting for free, neither of which this platform had before.

One real gap in HA's own FanGroup: it doesn't track preset_mode at all (not
in its own SUPPORTED_FLAGS) — _recompute patches that back in, same
intersection-for-features/union-for-values spirit as everything else here.

async_turn_on/async_set_percentage/async_set_preset_mode stay fully
overridden for the smart on-members-only adjustment filtering — HA's own
versions forward to every member supporting the feature, regardless of
current on/off state.
"""

import logging
from typing import Any

from homeassistant.components.fan import (
    ATTR_PERCENTAGE,
    ATTR_PRESET_MODE,
    FanEntityFeature,
)
from homeassistant.components.group.fan import FanGroup as HAFanGroup
from homeassistant.components.group.util import find_state_attributes
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_ON, STATE_UNAVAILABLE
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity_group import ExclusionConfig, NestedGroupMixin, build_nested_domain_groups
from .group_manager import PlatformGroupManager

_LOGGER = logging.getLogger(__name__)

_FAN_GROUPS: dict[str, "FanGroup"] = {}


class FanGroup(NestedGroupMixin, HAFanGroup):
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
        HAFanGroup.__init__(self, unique_id, "", list(member_entity_ids))
        del self._attr_name
        self._init_group(
            hass,
            unique_id=unique_id,
            entity_id_prefix="fan",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )

    def _recompute(self) -> None:
        self._sync_ha_group_state(domain="fan")

        # HA's own group.fan has no concept of preset_mode at all (missing
        # from its own SUPPORTED_FLAGS) — same intersection-for-features/
        # union-for-values pattern as the rest of this integration, just
        # filled in by hand since HA's doesn't cover it.
        states = [
            state
            for entity_id in self._member_entity_ids
            if (state := self.hass.states.get(entity_id)) is not None
            and state.state != STATE_UNAVAILABLE
        ]

        presets: list[str] = []
        for preset_list in find_state_attributes(states, "preset_modes"):
            presets.extend(preset_list or [])
        self._attr_preset_modes = sorted(set(presets)) if presets else None

        features = list(find_state_attributes(states, "supported_features"))
        if features:
            common_features = features[0]
            for f in features[1:]:
                common_features &= f
            if common_features & FanEntityFeature.PRESET_MODE:
                self._attr_supported_features |= FanEntityFeature.PRESET_MODE

        on_presets = [
            preset
            for state in states
            if state.state == STATE_ON
            and (preset := state.attributes.get(ATTR_PRESET_MODE))
        ]
        self._attr_preset_mode = (
            on_presets[0]
            if on_presets and all(p == on_presets[0] for p in on_presets)
            else None
        )

    def _fan_supports_preset(self, entity_id: str, preset_mode: str) -> bool:
        state = self.hass.states.get(entity_id)
        if not state:
            return False
        return preset_mode in (state.attributes.get("preset_modes") or [])

    def _members_on(self) -> list[str]:
        return [
            entity_id
            for entity_id in self._member_entity_ids
            if (state := self.hass.states.get(entity_id)) is not None
            and state.state == STATE_ON
        ]

    async def async_turn_on(
        self,
        percentage: int | None = None,
        preset_mode: str | None = None,
        **kwargs: Any,
    ) -> None:
        """
        Turn the group on — a bare turn_on() targets every member, but an
        adjustment (percentage/preset_mode) only applies to members already
        on, except a percentage adjustment with nothing on turns everything
        on at that percentage (no "on" state to preserve). HA's own
        FanGroup.async_turn_on has no such filtering — deliberately not
        inherited.
        """
        is_adjustment = percentage is not None or preset_mode is not None

        if is_adjustment:
            targets = self._members_on()
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

    async def async_set_percentage(self, percentage: int) -> None:
        """
        Set fan speed — same on-members-only targeting as async_turn_on,
        except percentage=0 (== turn_off in HA's fan convention) always
        applies to every member (HA's own FanGroup.async_turn_off, inherited
        — per-feature-flag safe, only targets members that actually support
        TURN_OFF), and a nonzero percentage with nothing currently on turns
        every member on at that percentage.
        """
        if percentage == 0:
            await self.async_turn_off()
            return

        targets = self._members_on() or list(self._member_entity_ids)
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
            e for e in self._members_on() if self._fan_supports_preset(e, preset_mode)
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
