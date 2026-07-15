"""Switch platform for Linus Dashboard: nested area/floor/global switch groups."""

import logging

from homeassistant.components.switch import SwitchEntity
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

_SWITCH_GROUPS: dict[str, "SwitchGroup"] = {}


class SwitchGroup(NestedGroupMixin, SwitchEntity):
    """A switch entity that forwards on/off to its members."""

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
            entity_id_prefix="switch",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )

    def _recompute(self) -> None:
        attrs = compute_group_attributes(
            self.hass,
            domain="switch",
            device_class=None,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_is_on = len(attrs["active_entity_ids"]) > 0
        self._attr_extra_state_attributes = attrs

    async def async_turn_on(self, **kwargs) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "switch", "turn_on", {"entity_id": self._member_entity_ids}, blocking=False
        )

    async def async_turn_off(self, **kwargs) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "switch", "turn_off", {"entity_id": self._member_entity_ids}, blocking=False
        )


def _make_switch_group(
    hass,
    unique_id,
    translation_key,
    translation_placeholders,
    device_info,
    member_entity_ids,
):
    """Idempotent factory — see light.py's _make_light_group for the full rationale."""
    existing = _SWITCH_GROUPS.get(unique_id)
    if existing is not None:
        hass.async_create_task(existing.async_update_members(member_entity_ids))
        return existing
    group = SwitchGroup(
        hass,
        unique_id,
        translation_key,
        translation_placeholders,
        device_info,
        member_entity_ids,
    )
    _SWITCH_GROUPS[unique_id] = group
    return group


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard switch groups (area/floor/global)."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    _SWITCH_GROUPS.clear()

    build_kwargs = {
        "domain": "switch",
        "unique_id_prefix": f"{DOMAIN}_all_switches",
        "translation_key": "switch_group",
        "translation_key_global": "switch_group_global",
        "entity_factory": _make_switch_group,
    }

    entities = await build_nested_domain_groups(
        hass, config_entry, exclusions, **build_kwargs
    )
    if entities:
        async_add_entities(entities)
        _LOGGER.info("Created %d switch group entities", len(entities))

    async def _rebuild(*_args) -> None:
        before_ids = set(_SWITCH_GROUPS.keys())
        new_groups = await build_nested_domain_groups(
            hass, config_entry, exclusions, **build_kwargs
        )
        after_ids = {group.unique_id for group in new_groups}
        to_add = [group for group in new_groups if group.unique_id not in before_ids]

        for uid in before_ids - after_ids:
            stale = _SWITCH_GROUPS.pop(uid)
            hass.async_create_task(stale.async_remove(force_remove=True))

        if to_add:
            async_add_entities(to_add)

    platform_manager = PlatformGroupManager(hass, monitored_domains=["switch"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
