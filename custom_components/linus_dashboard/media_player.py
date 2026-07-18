"""
Media player platform for Linus Dashboard: nested area/floor/global
media_player groups.

Deliberately deferred earlier (see plan: no simple source/volume aggregation
semantics like light/switch/fan/cover/siren) — added on explicit request for
full domain parity. v1 "dumb" aggregation: play/pause/stop/turn_on/turn_off
are forwarded blindly to every member (a member that doesn't support one
just logs a warning, doesn't fail the group), volume_level is a simple
average, and source/source_list are deliberately not aggregated — no
sensible single "source" exists across a mixed fleet of players.
"""

import logging

from homeassistant.components.media_player import (
    MediaPlayerEntity,
    MediaPlayerEntityFeature,
    MediaPlayerState,
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

_MEDIA_PLAYER_GROUPS: dict[str, "MediaPlayerGroup"] = {}

# States considered "active" for state aggregation — mirrors
# aggregate.py's DOMAIN_ACTIVE_STATES["media_player"].
_ACTIVE_STATES = ("playing", "paused", "on")


class MediaPlayerGroup(NestedGroupMixin, MediaPlayerEntity):
    """A media_player entity that forwards playback/volume to its members."""

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
        self._attr_supported_features = (
            MediaPlayerEntityFeature.PLAY
            | MediaPlayerEntityFeature.PAUSE
            | MediaPlayerEntityFeature.STOP
            | MediaPlayerEntityFeature.TURN_ON
            | MediaPlayerEntityFeature.TURN_OFF
            | MediaPlayerEntityFeature.VOLUME_SET
        )
        self._attr_state = MediaPlayerState.IDLE
        self._init_group(
            hass,
            unique_id=unique_id,
            entity_id_prefix="media_player",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )

    def _recompute(self) -> None:
        active_states: list[str] = []
        volumes: list[float] = []

        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state or state.state == STATE_UNAVAILABLE:
                continue
            if state.state in _ACTIVE_STATES:
                active_states.append(state.state)
            if (v := state.attributes.get("volume_level")) is not None:
                volumes.append(v)

        if "playing" in active_states:
            self._attr_state = MediaPlayerState.PLAYING
        elif "paused" in active_states:
            self._attr_state = MediaPlayerState.PAUSED
        elif active_states:
            self._attr_state = MediaPlayerState.ON
        else:
            self._attr_state = MediaPlayerState.IDLE

        self._attr_volume_level = sum(volumes) / len(volumes) if volumes else None

        attrs = compute_group_attributes(
            self.hass,
            domain="media_player",
            device_class=None,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_extra_state_attributes = attrs

    async def _forward(self, service: str) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "media_player",
            service,
            {"entity_id": self._member_entity_ids},
            blocking=False,
        )

    async def async_media_play(self) -> None:
        await self._forward("media_play")

    async def async_media_pause(self) -> None:
        await self._forward("media_pause")

    async def async_media_stop(self) -> None:
        await self._forward("media_stop")

    async def async_turn_on(self) -> None:
        await self._forward("turn_on")

    async def async_turn_off(self) -> None:
        await self._forward("turn_off")

    async def async_set_volume_level(self, volume: float) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "media_player",
            "volume_set",
            {"entity_id": self._member_entity_ids, "volume_level": volume},
            blocking=False,
        )


def _make_media_player_group(
    hass: HomeAssistant,
    unique_id: str,
    translation_key: str,
    translation_placeholders: dict[str, str] | None,
    device_info: dict,
    member_entity_ids: list[str],
) -> MediaPlayerGroup:
    """Idempotent factory — see light.py's _make_light_group for the full rationale."""
    existing = _MEDIA_PLAYER_GROUPS.get(unique_id)
    if existing is not None:
        hass.async_create_task(existing.async_update_members(member_entity_ids))
        return existing

    group = MediaPlayerGroup(
        hass,
        unique_id,
        translation_key,
        translation_placeholders,
        device_info,
        member_entity_ids,
    )
    _MEDIA_PLAYER_GROUPS[unique_id] = group
    return group


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard media_player groups (area/floor/global)."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    _MEDIA_PLAYER_GROUPS.clear()

    build_kwargs = {
        "domain": "media_player",
        "unique_id_prefix": f"{DOMAIN}_all_media_players",
        "translation_key": "media_player_group",
        "translation_key_global": "media_player_group_global",
        "entity_factory": _make_media_player_group,
    }

    entities = await build_nested_domain_groups(
        hass, config_entry, exclusions, **build_kwargs
    )
    if entities:
        async_add_entities(entities)
        _LOGGER.info("Created %d media_player group entities", len(entities))

    async def _rebuild(*_args) -> None:
        before_ids = set(_MEDIA_PLAYER_GROUPS.keys())
        new_groups = await build_nested_domain_groups(
            hass, config_entry, exclusions, **build_kwargs
        )
        after_ids = {group.unique_id for group in new_groups}
        to_add = [group for group in new_groups if group.unique_id not in before_ids]

        for uid in before_ids - after_ids:
            stale = _MEDIA_PLAYER_GROUPS.pop(uid)
            hass.async_create_task(stale.async_remove(force_remove=True))

        if to_add:
            async_add_entities(to_add)
            from . import async_hide_group_entities_from_voice_assistants

            await async_hide_group_entities_from_voice_assistants(hass, config_entry)

    platform_manager = PlatformGroupManager(hass, monitored_domains=["media_player"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
