"""
Siren platform for Linus Dashboard: nested area/floor/global siren groups.

Unlike light/fan/cover, siren has no persistent "current tone/volume" state
to average — HA's SirenEntity only exposes tone/volume_level/duration as
one-shot turn_on parameters, not as reportable attributes. So there's no
smart on-members-only filtering to do here (no "already on" adjustment
concept the way brightness/percentage/position have): supported_features and
available_tones are aggregated so the group can advertise what it can
actually forward, and turn_on/turn_off simply pass every kwarg straight
through to every member, same as before.
"""

import logging
from typing import Any

from homeassistant.components.siren import ATTR_TONE, SirenEntity, SirenEntityFeature
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

_SIREN_GROUPS: dict[str, "SirenGroup"] = {}


class SirenGroup(NestedGroupMixin, SirenEntity):
    """A siren entity that forwards on/off/tone/volume/duration to its members."""

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
            entity_id_prefix="siren",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )
        self._attr_supported_features = SirenEntityFeature(0)
        self._attr_available_tones: list[str] | None = None

    def _detect_features_from_members(self) -> None:
        """Intersection of supported_features, union of available_tones."""
        all_features: list[int] = []
        all_tones: list[str] = []

        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state or state.state == STATE_UNAVAILABLE:
                continue
            all_features.append(state.attributes.get("supported_features", 0))
            all_tones.extend(state.attributes.get("available_tones") or [])

        if not all_features:
            self._attr_supported_features = SirenEntityFeature(0)
            self._attr_available_tones = None
            return

        common_features = all_features[0]
        for features in all_features[1:]:
            common_features &= features
        self._attr_supported_features = SirenEntityFeature(common_features)
        self._attr_available_tones = sorted(set(all_tones)) if all_tones else None

    def _recompute(self) -> None:
        self._detect_features_from_members()
        attrs = compute_group_attributes(
            self.hass,
            domain="siren",
            device_class=None,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_is_on = len(attrs["active_entity_ids"]) > 0
        self._attr_extra_state_attributes = attrs

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn every member on, forwarding tone/volume_level/duration as given."""
        if not self._member_entity_ids:
            return
        targets = self._member_entity_ids
        if ATTR_TONE in kwargs:
            tone = kwargs[ATTR_TONE]
            targets = [
                e
                for e in self._member_entity_ids
                if tone
                in (self.hass.states.get(e).attributes.get("available_tones") or [])
            ] or self._member_entity_ids
        await self.hass.services.async_call(
            "siren", "turn_on", {"entity_id": targets, **kwargs}, blocking=False
        )

    async def async_turn_off(self, **kwargs: Any) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "siren",
            "turn_off",
            {"entity_id": self._member_entity_ids, **kwargs},
            blocking=False,
        )


def _make_siren_group(
    hass,
    unique_id,
    translation_key,
    translation_placeholders,
    device_info,
    member_entity_ids,
):
    """Idempotent factory — see light.py's _make_light_group for the full rationale."""
    existing = _SIREN_GROUPS.get(unique_id)
    if existing is not None:
        hass.async_create_task(existing.async_update_members(member_entity_ids))
        return existing
    group = SirenGroup(
        hass,
        unique_id,
        translation_key,
        translation_placeholders,
        device_info,
        member_entity_ids,
    )
    _SIREN_GROUPS[unique_id] = group
    return group


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard siren groups (area/floor/global)."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    _SIREN_GROUPS.clear()

    build_kwargs = {
        "domain": "siren",
        "unique_id_prefix": f"{DOMAIN}_all_sirens",
        "translation_key": "siren_group",
        "translation_key_global": "siren_group_global",
        "entity_factory": _make_siren_group,
    }

    entities = await build_nested_domain_groups(
        hass, config_entry, exclusions, **build_kwargs
    )
    if entities:
        async_add_entities(entities)
        _LOGGER.info("Created %d siren group entities", len(entities))

    async def _rebuild(*_args) -> None:
        before_ids = set(_SIREN_GROUPS.keys())
        new_groups = await build_nested_domain_groups(
            hass, config_entry, exclusions, **build_kwargs
        )
        after_ids = {group.unique_id for group in new_groups}
        to_add = [group for group in new_groups if group.unique_id not in before_ids]

        for uid in before_ids - after_ids:
            stale = _SIREN_GROUPS.pop(uid)
            hass.async_create_task(stale.async_remove(force_remove=True))

        if to_add:
            async_add_entities(to_add)

    platform_manager = PlatformGroupManager(hass, monitored_domains=["siren"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
