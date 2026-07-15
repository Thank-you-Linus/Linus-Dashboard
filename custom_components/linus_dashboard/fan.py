"""
Fan platform for Linus Dashboard: nested area/floor/global fan groups.

v1 scope: on/off forwarding only, no speed/percentage aggregation — the same
deliberate, documented simplification as Brain never aggregating
device_class_filter for its light groups (an incomplete optimization, not a
bug). Revisit if a real need for grouped speed control shows up.
"""

import logging

from homeassistant.components.fan import FanEntity
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

_FAN_GROUPS: dict[str, "FanGroup"] = {}


class FanGroup(NestedGroupMixin, FanEntity):
    """A fan entity that forwards on/off to its members."""

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

    def _recompute(self) -> None:
        attrs = compute_group_attributes(
            self.hass,
            domain="fan",
            device_class=None,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_is_on = len(attrs["active_entity_ids"]) > 0
        self._attr_extra_state_attributes = attrs

    async def async_turn_on(
        self, percentage: int | None = None, preset_mode: str | None = None, **kwargs
    ) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "fan", "turn_on", {"entity_id": self._member_entity_ids}, blocking=False
        )

    async def async_turn_off(self, **kwargs) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "fan", "turn_off", {"entity_id": self._member_entity_ids}, blocking=False
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

    platform_manager = PlatformGroupManager(hass, monitored_domains=["fan"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
