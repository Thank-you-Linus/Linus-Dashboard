"""Sensor platform for Linus Dashboard aggregate sensors."""

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
    device_registry as dr,
    entity_registry as er,
)
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_call_later, async_track_state_change_event

from .aggregate import (
    DOMAIN_ACTIVE_STATES,
    compute_active_count,
    compute_active_entity_ids,
    compute_color,
    compute_icon,
)

_LOGGER = logging.getLogger(__name__)

DEBOUNCE_SECONDS = 0.1


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard aggregate sensors."""
    sensors = await _build_aggregate_sensors(hass, config_entry)
    if sensors:
        async_add_entities(sensors)
        _LOGGER.info("Created %d aggregate sensors", len(sensors))


async def _build_aggregate_sensors(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
) -> list["LinusDashboardAggregateSensor"]:
    """Build aggregate sensors for all domain/device_class/floor combinations."""
    ent_reg = er.async_get(hass)
    dev_reg = dr.async_get(hass)
    area_reg = ar.async_get(hass)

    options = config_entry.options
    excluded_domains = set(options.get("excluded_domains") or [])
    excluded_device_classes = set(options.get("excluded_device_classes") or [])
    excluded_targets = options.get("excluded_targets") or {}
    excluded_entity_ids = set(excluded_targets.get("entity_id") or [])
    excluded_area_ids = set(excluded_targets.get("area_id") or [])
    excluded_device_ids = set(excluded_targets.get("device_id") or [])
    excluded_floor_ids = set(excluded_targets.get("floor_id") or [])
    excluded_integrations = set(options.get("excluded_integrations") or [])

    domain_entities: dict[str, list[str]] = {}
    floor_domain_entities: dict[tuple[str, str], list[str]] = {}

    for entity_entry in ent_reg.entities.values():
        if entity_entry.hidden_by or entity_entry.disabled_by:
            continue

        entity_id = entity_entry.entity_id

        if entity_id in excluded_entity_ids:
            continue
        if entity_entry.device_id and entity_entry.device_id in excluded_device_ids:
            continue
        if entity_entry.platform and entity_entry.platform in excluded_integrations:
            continue

        domain = entity_id.split(".")[0]
        if domain in excluded_domains:
            continue
        if domain not in DOMAIN_ACTIVE_STATES:
            continue

        # Determine device_class from the entity registry (populated and
        # persistent very early in startup) rather than the live state. Gating
        # membership on hass.states here races with entity/state restoration on
        # a cold boot: entities whose state hasn't been posted yet get skipped,
        # producing empty (or partially-populated) aggregates that never recover
        # until a reload. Live states are read later in _update_state instead.
        device_class = entity_entry.device_class or entity_entry.original_device_class
        if device_class and device_class in excluded_device_classes:
            continue

        # Resolve area: entity's own or inherited from device
        area_id = entity_entry.area_id
        if not area_id and entity_entry.device_id:
            device = dev_reg.async_get(entity_entry.device_id)
            if device:
                area_id = device.area_id

        if area_id and area_id in excluded_area_ids:
            continue
        if not area_id:
            continue

        # Resolve floor from area
        floor_id = None
        area = area_reg.async_get_area(area_id)
        if area:
            floor_id = area.floor_id

        if floor_id and floor_id in excluded_floor_ids:
            continue

        domain_entities.setdefault(domain, []).append(entity_id)

        if floor_id:
            floor_domain_entities.setdefault((domain, floor_id), []).append(entity_id)

    sensors: list[LinusDashboardAggregateSensor] = []

    for domain, entity_ids in domain_entities.items():
        if entity_ids:
            sensors.append(
                LinusDashboardAggregateSensor(
                    hass=hass,
                    domain=domain,
                    device_class_filter=None,
                    floor_id=None,
                    tracked_entity_ids=entity_ids,
                    config_entry=config_entry,
                )
            )

    for (domain, floor_id), entity_ids in floor_domain_entities.items():
        if entity_ids:
            sensors.append(
                LinusDashboardAggregateSensor(
                    hass=hass,
                    domain=domain,
                    device_class_filter=None,
                    floor_id=floor_id,
                    tracked_entity_ids=entity_ids,
                    config_entry=config_entry,
                )
            )

    return sensors


class LinusDashboardAggregateSensor(SensorEntity):
    """Aggregate sensor computing active count, icon, and color for a domain."""

    _attr_has_entity_name = True
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_entity_registry_visible_default = False
    _attr_should_poll = False
    _attr_native_unit_of_measurement = None

    def __init__(
        self,
        hass: HomeAssistant,
        domain: str,
        device_class_filter: str | None,
        floor_id: str | None,
        tracked_entity_ids: list[str],
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the aggregate sensor."""
        self.hass = hass
        self._domain = domain
        self._device_class_filter = device_class_filter
        self._floor_id = floor_id
        self._tracked_entities = frozenset(tracked_entity_ids)
        self._config_entry = config_entry
        self._debounce_unsub: CALLBACK_TYPE | None = None
        self._unsub_state_changed: CALLBACK_TYPE | None = None

        parts = ["linus_dashboard", domain]
        if device_class_filter:
            parts.append(device_class_filter)
        if floor_id:
            parts.append(floor_id)
        parts.append("active")

        self._attr_unique_id = "_".join(parts)
        self._attr_name = " ".join(
            p.replace("_", " ").title() for p in parts[1:]
        )
        self._attr_native_value: int = 0
        self._attr_extra_state_attributes: dict[str, Any] = {}

        # Explicit entity_id matching frontend's ID construction
        self.entity_id = f"sensor.{'_'.join(parts)}"

    async def async_added_to_hass(self) -> None:
        """Subscribe to state changes when added to HA."""
        self._update_state()

        self._unsub_state_changed = async_track_state_change_event(
            self.hass,
            list(self._tracked_entities),
            self._async_state_changed,
        )

        self.async_on_remove(
            self._config_entry.add_update_listener(self._async_config_updated)
        )

    async def async_will_remove_from_hass(self) -> None:
        """Clean up subscriptions."""
        if self._unsub_state_changed:
            self._unsub_state_changed()
            self._unsub_state_changed = None
        if self._debounce_unsub:
            self._debounce_unsub()
            self._debounce_unsub = None

    @callback
    def _async_state_changed(self, event: Event) -> None:
        """Handle state change — schedule debounced update."""
        entity_id = event.data.get("entity_id")
        if entity_id not in self._tracked_entities:
            return

        if self._debounce_unsub:
            self._debounce_unsub()

        self._debounce_unsub = async_call_later(
            self.hass, DEBOUNCE_SECONDS, self._async_debounced_update
        )

    @callback
    def _async_debounced_update(self, _now=None) -> None:
        """Recompute aggregates after debounce period."""
        self._debounce_unsub = None
        self._update_state()
        self.async_write_ha_state()

    @callback
    def _update_state(self) -> None:
        """Recompute all aggregate values from current HA state."""
        entity_states: dict[str, str] = {}
        for entity_id in self._tracked_entities:
            state_obj = self.hass.states.get(entity_id)
            if state_obj and state_obj.state not in ("unavailable", "unknown"):
                entity_states[entity_id] = state_obj.state

        active_count = compute_active_count(entity_states, self._domain)
        active_ids = compute_active_entity_ids(entity_states, self._domain)
        icon = compute_icon(self._domain, active_count)
        color = compute_color(
            self._domain, self._device_class_filter, entity_states
        )

        self._attr_native_value = active_count
        self._attr_extra_state_attributes = {
            "total": len(self._tracked_entities),
            "icon": icon,
            "color": color,
            "entity_ids": sorted(self._tracked_entities),
            "active_entity_ids": active_ids,
        }

    @staticmethod
    async def _async_config_updated(
        hass: HomeAssistant, config_entry: ConfigEntry
    ) -> None:
        """Handle config entry update — reload the platform."""
        await hass.config_entries.async_reload(config_entry.entry_id)
