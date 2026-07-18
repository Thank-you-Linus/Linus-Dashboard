"""
Cover platform for Linus Dashboard: nested area/floor/global cover groups.

State computation (position/tilt aggregation, feature intersection)
delegates to HA core's own homeassistant.components.group.cover.CoverGroup
(multiply-inherited below) — see light.py's module docstring for the general
pattern. open_cover/close_cover/stop_cover and the tilt equivalents are also
inherited unchanged: HA's own versions already forward only to members that
actually support the relevant feature (self._covers/self._tilts sets, built
from async_update_supported_features), same safety property this platform
had to hand-roll before.

async_set_cover_position stays overridden for the one genuinely different
behavior: a position adjustment only targets already-open members (a closed
cover, opening to a specific %, is a bigger surprise than nudging an already-
open one) — except position=0 (== close) always applies to everyone, and a
nonzero position with nothing currently open opens every member to that
position. HA's own async_set_cover_position has no such filtering.
"""

import logging
from typing import Any

from homeassistant.components.cover import ATTR_POSITION, CoverEntityFeature
from homeassistant.components.group.cover import CoverGroup as HACoverGroup
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN
from .entity_group import ExclusionConfig, NestedGroupMixin, build_nested_domain_groups
from .group_manager import PlatformGroupManager

_LOGGER = logging.getLogger(__name__)

_COVER_GROUPS: dict[str, "CoverGroup"] = {}

_OPEN_STATES = ("open", "opening")


class CoverGroup(NestedGroupMixin, HACoverGroup):
    """A cover entity that forwards open/close/stop/position/tilt to its members."""

    def __init__(
        self,
        hass: HomeAssistant,
        unique_id: str,
        translation_key: str,
        translation_placeholders: dict[str, str] | None,
        device_info: dict,
        member_entity_ids: list[str],
    ) -> None:
        HACoverGroup.__init__(self, unique_id, "", list(member_entity_ids))
        del self._attr_name
        self._init_group(
            hass,
            unique_id=unique_id,
            entity_id_prefix="cover",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )

    def _recompute(self) -> None:
        self._sync_ha_group_state(domain="cover")

    def _cover_supports(self, entity_id: str, feature: CoverEntityFeature) -> bool:
        state = self.hass.states.get(entity_id)
        if not state:
            return False
        return bool(state.attributes.get("supported_features", 0) & feature)

    def _members_open(self) -> list[str]:
        return [
            entity_id
            for entity_id in self._member_entity_ids
            if (state := self.hass.states.get(entity_id)) is not None
            and state.state in _OPEN_STATES
        ]

    async def async_set_cover_position(self, position: int, **kwargs: Any) -> None:
        """Set position — see module docstring for the smart-filtering rules."""
        if position == 0:
            targets = list(self._member_entity_ids)
        else:
            targets = self._members_open() or list(self._member_entity_ids)

        targets = [
            e
            for e in targets
            if self._cover_supports(e, CoverEntityFeature.SET_POSITION)
        ]
        if not targets:
            return
        await self.hass.services.async_call(
            "cover",
            "set_cover_position",
            {"entity_id": targets, ATTR_POSITION: position},
            blocking=False,
        )


def _make_cover_group(
    hass,
    unique_id,
    translation_key,
    translation_placeholders,
    device_info,
    member_entity_ids,
):
    """Idempotent factory — see light.py's _make_light_group for the full rationale."""
    existing = _COVER_GROUPS.get(unique_id)
    if existing is not None:
        hass.async_create_task(existing.async_update_members(member_entity_ids))
        return existing
    group = CoverGroup(
        hass,
        unique_id,
        translation_key,
        translation_placeholders,
        device_info,
        member_entity_ids,
    )
    _COVER_GROUPS[unique_id] = group
    return group


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard cover groups (area/floor/global)."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    _COVER_GROUPS.clear()

    build_kwargs = {
        "domain": "cover",
        "unique_id_prefix": f"{DOMAIN}_all_covers",
        "translation_key": "cover_group",
        "translation_key_global": "cover_group_global",
        "entity_factory": _make_cover_group,
    }

    entities = await build_nested_domain_groups(
        hass, config_entry, exclusions, **build_kwargs
    )
    if entities:
        async_add_entities(entities)
        _LOGGER.info("Created %d cover group entities", len(entities))

    async def _rebuild(*_args) -> None:
        before_ids = set(_COVER_GROUPS.keys())
        new_groups = await build_nested_domain_groups(
            hass, config_entry, exclusions, **build_kwargs
        )
        after_ids = {group.unique_id for group in new_groups}
        to_add = [group for group in new_groups if group.unique_id not in before_ids]

        for uid in before_ids - after_ids:
            stale = _COVER_GROUPS.pop(uid)
            hass.async_create_task(stale.async_remove(force_remove=True))

        if to_add:
            async_add_entities(to_add)
            # See light.py's _rebuild for why this is needed here too.
            from . import async_hide_group_entities_from_voice_assistants

            await async_hide_group_entities_from_voice_assistants(hass, config_entry)

    platform_manager = PlatformGroupManager(hass, monitored_domains=["cover"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
