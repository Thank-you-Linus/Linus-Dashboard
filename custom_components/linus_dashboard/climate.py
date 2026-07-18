"""
Climate platform for Linus Dashboard: nested area/floor/global climate groups.

Deliberately deferred earlier (see plan: no simple on/off control semantics
like light/switch/fan/cover/siren) — added on explicit request for full
domain parity. v1 "dumb" aggregation, same spirit as fan/cover's incomplete
speed/position handling: hvac_mode/supported_features are an intersection
across members (a mode the group offers must actually work everywhere),
current/target temperature are simple averages, and turn_on/turn_off are
implemented via the universal set_hvac_mode primitive rather than the
optional TURN_ON/TURN_OFF feature — so the group's own turn_on/off always
works regardless of whether every member happens to support that feature.
"""

import logging
from typing import Any

from homeassistant.components.climate import (
    ClimateEntity,
    ClimateEntityFeature,
    HVACMode,
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

_CLIMATE_GROUPS: dict[str, "ClimateGroup"] = {}

DEFAULT_MIN_TEMP = 7.0
DEFAULT_MAX_TEMP = 35.0


class ClimateGroup(NestedGroupMixin, ClimateEntity):
    """A climate entity that forwards hvac_mode/temperature to its members."""

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
        self._attr_temperature_unit = hass.config.units.temperature_unit
        self._attr_hvac_mode = HVACMode.OFF
        self._attr_hvac_modes = [HVACMode.OFF]
        self._attr_supported_features = ClimateEntityFeature(0)
        self._init_group(
            hass,
            unique_id=unique_id,
            entity_id_prefix="climate",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )

    def _detect_modes_and_features(self) -> None:
        """
        hvac_modes: intersection of members' hvac_modes (plus OFF, always
        offered) — guarantees any mode the group exposes is valid to set on
        every member. supported_features: intersection too, except
        TURN_ON/TURN_OFF which are always added regardless of member support
        (our own turn_on/off use set_hvac_mode, not the members' turn_on/off
        service, so they don't depend on members declaring that feature).
        """
        mode_sets: list[set] = []
        features: list[int] = []

        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state or state.state == STATE_UNAVAILABLE:
                continue
            hvac_modes = state.attributes.get("hvac_modes")
            if hvac_modes:
                mode_sets.append(set(hvac_modes))
            features.append(state.attributes.get("supported_features", 0))

        if mode_sets:
            common_modes = set.intersection(*mode_sets)
            common_modes.add(HVACMode.OFF)
            self._attr_hvac_modes = sorted(common_modes, key=str)
        else:
            self._attr_hvac_modes = [HVACMode.OFF]

        common_features = features[0] if features else 0
        for f in features[1:]:
            common_features &= f
        self._attr_supported_features = (
            ClimateEntityFeature(common_features)
            | ClimateEntityFeature.TURN_ON
            | ClimateEntityFeature.TURN_OFF
        )

    def _recompute(self) -> None:
        self._detect_modes_and_features()

        active_modes: list[str] = []
        current_temps: list[float] = []
        target_temps: list[float] = []
        min_temps: list[float] = []
        max_temps: list[float] = []

        for entity_id in self._member_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state or state.state == STATE_UNAVAILABLE:
                continue
            if state.state != HVACMode.OFF:
                active_modes.append(state.state)
            if (v := state.attributes.get("current_temperature")) is not None:
                current_temps.append(v)
            if (v := state.attributes.get("temperature")) is not None:
                target_temps.append(v)
            if (v := state.attributes.get("min_temp")) is not None:
                min_temps.append(v)
            if (v := state.attributes.get("max_temp")) is not None:
                max_temps.append(v)

        # Most common active mode across members, so a fleet mostly heating
        # with one outlier doesn't leave the group looking undecided.
        self._attr_hvac_mode = (
            max(set(active_modes), key=active_modes.count)
            if active_modes
            else HVACMode.OFF
        )

        self._attr_current_temperature = (
            sum(current_temps) / len(current_temps) if current_temps else None
        )
        self._attr_target_temperature = (
            sum(target_temps) / len(target_temps) if target_temps else None
        )
        # Widest range any member supports (same reasoning as light.py's
        # min/max_color_temp_kelvin) rather than the narrowest, so the
        # group's own slider never rejects a value some member could take.
        self._attr_min_temp = min(min_temps) if min_temps else DEFAULT_MIN_TEMP
        self._attr_max_temp = max(max_temps) if max_temps else DEFAULT_MAX_TEMP

        attrs = compute_group_attributes(
            self.hass,
            domain="climate",
            device_class=None,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_extra_state_attributes = attrs

    async def async_set_hvac_mode(self, hvac_mode: HVACMode) -> None:
        """Forward to every member — a member that doesn't support this exact mode just logs a warning, doesn't fail the whole call."""
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "climate",
            "set_hvac_mode",
            {"entity_id": self._member_entity_ids, "hvac_mode": hvac_mode},
            blocking=False,
        )

    async def async_set_temperature(self, **kwargs: Any) -> None:
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "climate",
            "set_temperature",
            {"entity_id": self._member_entity_ids, **kwargs},
            blocking=False,
        )

    async def async_turn_off(self) -> None:
        """Off is universal — every climate entity supports it, no feature check needed."""
        if not self._member_entity_ids:
            return
        await self.hass.services.async_call(
            "climate",
            "set_hvac_mode",
            {"entity_id": self._member_entity_ids, "hvac_mode": HVACMode.OFF},
            blocking=False,
        )

    async def async_turn_on(self) -> None:
        """
        No single "on" mode exists across HVAC systems, unlike off. v1
        simplification: pick the first non-off mode the group currently
        offers (e.g. "heat" for a house of thermostats) rather than trying
        to remember each member's last active mode.
        """
        if not self._member_entity_ids:
            return
        fallback_mode = next(
            (m for m in self._attr_hvac_modes if m != HVACMode.OFF), None
        )
        if fallback_mode is None:
            return
        await self.hass.services.async_call(
            "climate",
            "set_hvac_mode",
            {"entity_id": self._member_entity_ids, "hvac_mode": fallback_mode},
            blocking=False,
        )


def _make_climate_group(
    hass: HomeAssistant,
    unique_id: str,
    translation_key: str,
    translation_placeholders: dict[str, str] | None,
    device_info: dict,
    member_entity_ids: list[str],
) -> ClimateGroup:
    """Idempotent factory — see light.py's _make_light_group for the full rationale."""
    existing = _CLIMATE_GROUPS.get(unique_id)
    if existing is not None:
        hass.async_create_task(existing.async_update_members(member_entity_ids))
        return existing

    group = ClimateGroup(
        hass,
        unique_id,
        translation_key,
        translation_placeholders,
        device_info,
        member_entity_ids,
    )
    _CLIMATE_GROUPS[unique_id] = group
    return group


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard climate groups (area/floor/global)."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    _CLIMATE_GROUPS.clear()

    build_kwargs = {
        "domain": "climate",
        "unique_id_prefix": f"{DOMAIN}_all_climates",
        "translation_key": "climate_group",
        "translation_key_global": "climate_group_global",
        "entity_factory": _make_climate_group,
    }

    entities = await build_nested_domain_groups(
        hass, config_entry, exclusions, **build_kwargs
    )
    if entities:
        async_add_entities(entities)
        _LOGGER.info("Created %d climate group entities", len(entities))

    async def _rebuild(*_args) -> None:
        before_ids = set(_CLIMATE_GROUPS.keys())
        new_groups = await build_nested_domain_groups(
            hass, config_entry, exclusions, **build_kwargs
        )
        after_ids = {group.unique_id for group in new_groups}
        to_add = [group for group in new_groups if group.unique_id not in before_ids]

        for uid in before_ids - after_ids:
            stale = _CLIMATE_GROUPS.pop(uid)
            hass.async_create_task(stale.async_remove(force_remove=True))

        if to_add:
            async_add_entities(to_add)
            from . import async_hide_group_entities_from_voice_assistants

            await async_hide_group_entities_from_voice_assistants(hass, config_entry)

    platform_manager = PlatformGroupManager(hass, monitored_domains=["climate"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
