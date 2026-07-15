"""
Light platform for Linus Dashboard: nested area/floor/global light groups.

Ported from Linus Brain's AreaLightGroup (the "dumb" grouping/forwarding
behavior only — activity-based learning stays in Brain). See entity_group.py
for the shared nested-hierarchy scanning logic and NestedGroupMixin for the
shared state-tracking plumbing.
"""

import logging
from typing import ClassVar

from homeassistant.components.light import ColorMode, LightEntity
from homeassistant.config_entries import ConfigEntry
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


class LightGroup(NestedGroupMixin, LightEntity):
    """A light entity that forwards on/off/brightness/color to its members."""

    _attr_color_mode = ColorMode.ONOFF
    _attr_supported_color_modes: ClassVar[set[ColorMode]] = {ColorMode.ONOFF}

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

    def _recompute(self) -> None:
        attrs = compute_group_attributes(
            self.hass,
            domain="light",
            device_class=None,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_is_on = len(attrs["active_entity_ids"]) > 0
        self._attr_extra_state_attributes = attrs

    def _members_currently_on(self) -> list[str]:
        return [
            entity_id
            for entity_id in self._member_entity_ids
            if (state := self.hass.states.get(entity_id)) is not None
            and state.state == "on"
        ]

    async def async_turn_on(self, **kwargs) -> None:
        """
        Turn the group on.

        If brightness/color attributes are supplied (an adjustment, not a
        bare "turn on"), only forward to members already on — avoids
        unexpectedly lighting up dark lights just to nudge their color, the
        same "smart filtering" spirit as Brain's AreaLightGroup. A bare
        turn_on() with no kwargs targets every member.
        """
        service_data = {k: v for k, v in kwargs.items() if v is not None}
        is_adjustment = bool(service_data)
        targets = (
            self._members_currently_on() if is_adjustment else self._member_entity_ids
        )
        if not targets:
            targets = self._member_entity_ids
        if not targets:
            return
        await self.hass.services.async_call(
            "light", "turn_on", {"entity_id": targets, **service_data}, blocking=False
        )

    async def async_turn_off(self, **kwargs) -> None:
        """Turn every member off."""
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "light", "turn_off", {"entity_id": self._member_entity_ids}, blocking=False
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
