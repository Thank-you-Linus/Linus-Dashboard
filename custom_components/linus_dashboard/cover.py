"""
Cover platform for Linus Dashboard: nested area/floor/global cover groups.

Feature aggregation follows the same pattern as light.py's LightGroup (ported
from Linus Brain): supported_features is the intersection of members (only
advertise set_position/tilt if every member actually supports it), current
position is the average across currently-open members, and a position/tilt
adjustment only targets already-open members — same "don't wake a member just
to nudge a setting" spirit Brain applies to light brightness — except
position=0 (== close) always applies to everyone, and a nonzero position with
nothing currently open opens every member to that position.
"""

import logging
from typing import Any

from homeassistant.components.cover import (
    ATTR_CURRENT_POSITION,
    ATTR_CURRENT_TILT_POSITION,
    ATTR_POSITION,
    ATTR_TILT_POSITION,
    CoverEntity,
    CoverEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import STATE_UNAVAILABLE
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

_COVER_GROUPS: dict[str, "CoverGroup"] = {}

_ACTIVE_STATES = ("open", "opening")


class CoverGroup(NestedGroupMixin, CoverEntity):
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
        super().__init__()
        self._init_group(
            hass,
            unique_id=unique_id,
            entity_id_prefix="cover",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )
        self._covers_open: list[str] = []
        self._attr_supported_features = CoverEntityFeature(0)

    def _detect_features_from_members(self) -> None:
        """Intersection — only advertise a feature every member actually supports."""
        all_features: list[int] = []
        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state or state.state == STATE_UNAVAILABLE:
                continue
            all_features.append(state.attributes.get("supported_features", 0))

        if not all_features:
            self._attr_supported_features = CoverEntityFeature(0)
            return

        common_features = all_features[0]
        for features in all_features[1:]:
            common_features &= features
        self._attr_supported_features = CoverEntityFeature(common_features)

    def _recompute(self) -> None:
        self._detect_features_from_members()

        covers_open: list[str] = []
        positions: list[int] = []
        tilt_positions: list[int] = []

        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state:
                continue
            if state.state in _ACTIVE_STATES:
                covers_open.append(entity_id)
                # Read the *state* attributes (current_position/
                # current_tilt_position) here — ATTR_POSITION/ATTR_TILT_POSITION
                # are the set_cover_position/set_cover_tilt_position *service
                # call* parameter names, a different pair of constants, used
                # below when forwarding a set-position command instead.
                if (v := state.attributes.get(ATTR_CURRENT_POSITION)) is not None:
                    positions.append(int(v))
                if (v := state.attributes.get(ATTR_CURRENT_TILT_POSITION)) is not None:
                    tilt_positions.append(int(v))

        self._covers_open = covers_open

        # Average position across open members only — averaging in closed
        # (position=0) members would drag the group's reported position down
        # even though "how open is this group" is really about the open ones.
        self._attr_current_cover_position = (
            int(sum(positions) / len(positions)) if positions else None
        )
        self._attr_current_cover_tilt_position = (
            int(sum(tilt_positions) / len(tilt_positions)) if tilt_positions else None
        )

        attrs = compute_group_attributes(
            self.hass,
            domain="cover",
            device_class=None,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_is_closed = len(covers_open) == 0
        attrs["covers_open"] = covers_open
        self._attr_extra_state_attributes = attrs

    def _cover_supports(self, entity_id: str, feature: CoverEntityFeature) -> bool:
        state = self.hass.states.get(entity_id)
        if not state:
            return False
        return bool(state.attributes.get("supported_features", 0) & feature)

    async def async_open_cover(self, **kwargs: Any) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "cover",
            "open_cover",
            {"entity_id": self._member_entity_ids},
            blocking=False,
        )

    async def async_close_cover(self, **kwargs: Any) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "cover",
            "close_cover",
            {"entity_id": self._member_entity_ids},
            blocking=False,
        )

    async def async_stop_cover(self, **kwargs: Any) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "cover",
            "stop_cover",
            {"entity_id": self._member_entity_ids},
            blocking=False,
        )

    async def async_set_cover_position(self, position: int, **kwargs: Any) -> None:
        """Set position — see module docstring for the smart-filtering rules."""
        if position == 0:
            targets = list(self._member_entity_ids)
        else:
            targets = list(self._covers_open) or list(self._member_entity_ids)

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

    async def async_open_cover_tilt(self, **kwargs: Any) -> None:
        targets = [
            e
            for e in self._member_entity_ids
            if self._cover_supports(e, CoverEntityFeature.OPEN_TILT)
        ]
        if not targets:
            return
        await self.hass.services.async_call(
            "cover", "open_cover_tilt", {"entity_id": targets}, blocking=False
        )

    async def async_close_cover_tilt(self, **kwargs: Any) -> None:
        targets = [
            e
            for e in self._member_entity_ids
            if self._cover_supports(e, CoverEntityFeature.CLOSE_TILT)
        ]
        if not targets:
            return
        await self.hass.services.async_call(
            "cover", "close_cover_tilt", {"entity_id": targets}, blocking=False
        )

    async def async_stop_cover_tilt(self, **kwargs: Any) -> None:
        targets = [
            e
            for e in self._member_entity_ids
            if self._cover_supports(e, CoverEntityFeature.STOP_TILT)
        ]
        if not targets:
            return
        await self.hass.services.async_call(
            "cover", "stop_cover_tilt", {"entity_id": targets}, blocking=False
        )

    async def async_set_cover_tilt_position(
        self, tilt_position: int, **kwargs: Any
    ) -> None:
        targets = [
            e
            for e in self._member_entity_ids
            if self._cover_supports(e, CoverEntityFeature.SET_TILT_POSITION)
        ]
        if not targets:
            return
        await self.hass.services.async_call(
            "cover",
            "set_cover_tilt_position",
            {"entity_id": targets, ATTR_TILT_POSITION: tilt_position},
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
