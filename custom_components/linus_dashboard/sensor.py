"""
Sensor platform for Linus Dashboard.

Three families of sensors:
1. Generic hidden diagnostic aggregate sensors (`LinusDashboardAggregateSensor`)
   — pure rendering caches for AggregateChip's floor/global-scope fast path
   (`getAggregateSensorId()` in src/chips/AggregateChip.ts), at global and
   floor scope only (AggregateChip never queries these at area scope — it
   renders area-scope chips client-side instead, from the raw entities
   directly). AggregateChip now prefers a domain's own dedicated group
   entity (light.py/switch.py/fan.py/cover.py/siren.py/climate.py/
   media_player.py, or a binary_sensor device_class group) when one exists,
   falling back to this generic system only when it doesn't — so this only
   still generates:
   - domain-level buckets (no device_class) for binary_sensor (no "every
     binary_sensor regardless of device_class" dedicated group exists)
   - device_class buckets for every domain, since not every device_class
     has its own dedicated group (e.g. cover doesn't split by type; binary_
     sensor's presence-related classes — motion/presence/occupancy — feed
     the presence composite instead of getting their own device_class
     group, see binary_sensor.py's PRESENCE_DEVICE_CLASSES)
2. Numeric sensor aggregates (`LinusDashboardNumericAggregateSensor`) — sum,
   average or minimum (depending on state_class/device_class) of a `sensor`
   domain device_class across a zone/floor/global, e.g. average temperature.
   Visible by default: unlike (1), these are meant to be looked at directly
   (a "room climate" card), not just an internal rendering cache.
3. Health/availability sensor (`LinusDashboardHealthSensor`) — count and list
   of unavailable/unknown entities per zone/floor/global, across every
   domain (not just the ones covered by (1)/(2)).

(2) and (3) follow the same nested hierarchy as the group entities in the
other platform files: floor aggregates read the area-scope sensors' own
computed values (not raw entities again), global reads floor-scope sensors.
See entity_group.py for the shared scanning/self-exclusion logic this reuses.
(1) only has global and floor tiers — see above.
"""

import logging
from typing import Any

from homeassistant.components.sensor import SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ENTITY_ID, EntityCategory
from homeassistant.core import CALLBACK_TYPE, Event, HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
)
from homeassistant.helpers import (
    device_registry as dr,
)
from homeassistant.helpers import (
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
    compute_numeric_aggregate,
    resolve_numeric_aggregation_mode,
)
from .const import (
    DOMAIN,
    get_area_device_info,
    get_floor_device_info,
    get_global_device_info,
)
from .entity_group import ExclusionConfig, resolve_floors_for_areas, scan_domain_members

_LOGGER = logging.getLogger(__name__)

DEBOUNCE_SECONDS = 0.1

# Domains whose domain-level (no device_class) bucket has no dedicated group
# entity to fall back to instead — see module docstring, item 1. Every other
# domain in DOMAIN_ACTIVE_STATES (light/switch/fan/cover/siren, and now
# climate/media_player too — see climate.py/media_player.py) has a full
# dedicated single-domain group, so the hidden sensor for their domain-level
# bucket would just be dead weight AggregateChip never reads.
GENERIC_DOMAIN_LEVEL_DOMAINS = ("binary_sensor",)

# Device classes to skip even though they carry a numeric-looking state —
# these are indices/identifiers, not measurements, so summing or averaging
# them across a zone produces a meaningless number.
NUMERIC_DEVICE_CLASS_EXCLUSIONS = frozenset({"timestamp", "date", "enum"})

# Area registry attribute that, if the user configured an "official" sensor
# for that area, takes priority over averaging every sensor of that
# device_class in the area (same priority order as Linus Brain's
# AreaManager._get_area_sensor_average).
AREA_REGISTRY_SENSOR_ATTR = {
    "temperature": "temperature_entity_id",
    "humidity": "humidity_entity_id",
}


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard sensors (generic counts, numeric aggregates, health)."""
    sensors: list[SensorEntity] = []
    sensors.extend(await _build_aggregate_sensors(hass, config_entry))
    sensors.extend(await _build_numeric_sensors(hass, config_entry))
    sensors.extend(await _build_health_sensors(hass, config_entry))

    if sensors:
        async_add_entities(sensors)
        _LOGGER.info("Created %d sensors", len(sensors))


async def _build_aggregate_sensors(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
) -> list["LinusDashboardAggregateSensor"]:
    """
    Build the generic hidden counting sensor at global and floor scope (no
    area scope — see module docstring, AggregateChip never queries this
    system at area scope): domain-level buckets only for
    GENERIC_DOMAIN_LEVEL_DOMAINS, device_class buckets for every domain in
    DOMAIN_ACTIVE_STATES — see module docstring, item 1, for why the split.
    """
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

    # Domain-level buckets serve chips without a device_class; the device_class
    # buckets serve device_class-scoped chips (binary_sensor/sensor/cover). An
    # entity always joins its domain bucket and additionally its device_class
    # bucket when it has one, so both frontend lookups resolve to a sensor.
    domain_entities: dict[str, list[str]] = {}
    floor_domain_entities: dict[tuple[str, str], list[str]] = {}
    device_class_entities: dict[tuple[str, str], list[str]] = {}
    floor_device_class_entities: dict[tuple[str, str, str], list[str]] = {}

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

        if domain in GENERIC_DOMAIN_LEVEL_DOMAINS:
            domain_entities.setdefault(domain, []).append(entity_id)
        if device_class:
            device_class_entities.setdefault((domain, device_class), []).append(
                entity_id
            )

        if floor_id:
            if domain in GENERIC_DOMAIN_LEVEL_DOMAINS:
                floor_domain_entities.setdefault((domain, floor_id), []).append(
                    entity_id
                )
            if device_class:
                floor_device_class_entities.setdefault(
                    (domain, device_class, floor_id), []
                ).append(entity_id)

    sensors: list[LinusDashboardAggregateSensor] = []

    for domain, entity_ids in domain_entities.items():
        if entity_ids:
            sensors.append(
                LinusDashboardAggregateSensor(
                    hass=hass,
                    domain=domain,
                    device_class_filter=None,
                    scope_id=None,
                    tracked_entity_ids=entity_ids,
                    config_entry=config_entry,
                )
            )

    for (domain, device_class), entity_ids in device_class_entities.items():
        if entity_ids:
            sensors.append(
                LinusDashboardAggregateSensor(
                    hass=hass,
                    domain=domain,
                    device_class_filter=device_class,
                    scope_id=None,
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
                    scope_id=floor_id,
                    tracked_entity_ids=entity_ids,
                    config_entry=config_entry,
                )
            )

    for (
        domain,
        device_class,
        floor_id,
    ), entity_ids in floor_device_class_entities.items():
        if entity_ids:
            sensors.append(
                LinusDashboardAggregateSensor(
                    hass=hass,
                    domain=domain,
                    device_class_filter=device_class,
                    scope_id=floor_id,
                    tracked_entity_ids=entity_ids,
                    config_entry=config_entry,
                )
            )

    return sensors


class LinusDashboardAggregateSensor(SensorEntity):
    """Hidden diagnostic sensor computing active count, icon, and color for a domain."""

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
        scope_id: str | None,
        tracked_entity_ids: list[str],
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the aggregate sensor."""
        self.hass = hass
        self._domain = domain
        self._device_class_filter = device_class_filter

        # Domain-level buckets (no device_class_filter) only still exist for
        # GENERIC_DOMAIN_LEVEL_DOMAINS (binary_sensor) — the one domain with
        # no dedicated group entity to show a real count/control tile
        # instead ("every binary_sensor regardless of device_class" has no
        # sensible single group). Unlike the device_class-specific buckets
        # (which mostly duplicate what a dedicated group already shows
        # elsewhere), this is the only aggregate such a user ever sees, so
        # keep it visible rather than tucked away as a diagnostic entity
        # nobody would think to look for.
        if device_class_filter is None:
            self._attr_entity_registry_visible_default = True
            self._attr_entity_category = None

        self._tracked_entities = frozenset(tracked_entity_ids)
        self._config_entry = config_entry
        self._debounce_unsub: CALLBACK_TYPE | None = None
        self._unsub_state_changed: CALLBACK_TYPE | None = None

        parts = ["linus_dashboard", domain]
        if device_class_filter:
            parts.append(device_class_filter)
        if scope_id:
            parts.append(scope_id)
        parts.append("active")

        self._attr_unique_id = "_".join(parts)
        self._attr_name = " ".join(p.replace("_", " ").title() for p in parts[1:])
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
        icon = compute_icon(self._domain, active_count, self._device_class_filter)
        color = compute_color(self._domain, self._device_class_filter, entity_states)

        self._attr_native_value = active_count
        self._attr_extra_state_attributes = {
            "total": len(self._tracked_entities),
            "icon": icon,
            "color": color,
            ATTR_ENTITY_ID: sorted(self._tracked_entities),
            "active_entity_ids": active_ids,
        }

    @staticmethod
    async def _async_config_updated(
        hass: HomeAssistant, config_entry: ConfigEntry
    ) -> None:
        """Handle config entry update — reload the platform."""
        await hass.config_entries.async_reload(config_entry.entry_id)


# ---------------------------------------------------------------------------
# Numeric sensor aggregates (temperature, humidity, illuminance, battery, ...)
# ---------------------------------------------------------------------------


class LinusDashboardNumericAggregateSensor(SensorEntity):
    """Sum/average/minimum of a sensor device_class across a zone/floor/global."""

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_registry_visible_default = True

    def __init__(
        self,
        hass: HomeAssistant,
        *,
        unique_id: str,
        translation_key: str | None,
        translation_placeholders: dict[str, str] | None,
        device_info: dict,
        device_class: str,
        mode: str,
        member_entity_ids: list[str],
        official_entity_id: str | None = None,
        unit_of_measurement: str | None = None,
    ) -> None:
        self.hass = hass
        self._device_class = device_class
        self._mode = mode
        self._member_entity_ids = list(member_entity_ids)
        self._official_entity_id = official_entity_id
        self._attr_device_class = device_class
        self._attr_native_unit_of_measurement = unit_of_measurement
        self._attr_unique_id = unique_id
        self._attr_suggested_object_id = unique_id
        self._attr_translation_key = translation_key
        if translation_placeholders:
            self._attr_translation_placeholders = translation_placeholders
        self._attr_device_info = device_info
        self.entity_id = f"sensor.{unique_id}"
        self._attr_native_value: float | None = None
        self._attr_extra_state_attributes: dict[str, Any] = {}
        self._unsub_state_changed: CALLBACK_TYPE | None = None
        self._debounce_unsub: CALLBACK_TYPE | None = None

    def is_empty(self) -> bool:
        return not self._member_entity_ids and not self._official_entity_id

    async def async_update_members(self, member_entity_ids: list[str]) -> None:
        self._member_entity_ids = list(member_entity_ids)
        await self._async_resubscribe()
        self._update_state()
        if self.hass:
            self.async_write_ha_state()

    async def _async_resubscribe(self) -> None:
        if self._unsub_state_changed:
            self._unsub_state_changed()
        tracked = (
            [self._official_entity_id]
            if self._official_entity_id
            else self._member_entity_ids
        )
        self._unsub_state_changed = async_track_state_change_event(
            self.hass, tracked, self._async_state_changed
        )

    @callback
    def _async_state_changed(self, _event) -> None:
        if self._debounce_unsub:
            self._debounce_unsub()
        self._debounce_unsub = async_call_later(
            self.hass, DEBOUNCE_SECONDS, self._async_debounced_update
        )

    @callback
    def _async_debounced_update(self, _now=None) -> None:
        self._debounce_unsub = None
        self._update_state()
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        await super().async_added_to_hass()
        await self._async_resubscribe()
        self._update_state()

    async def async_will_remove_from_hass(self) -> None:
        await super().async_will_remove_from_hass()
        if self._unsub_state_changed:
            self._unsub_state_changed()
            self._unsub_state_changed = None
        if self._debounce_unsub:
            self._debounce_unsub()
            self._debounce_unsub = None

    @callback
    def _update_state(self) -> None:
        if self._official_entity_id:
            state_obj = self.hass.states.get(self._official_entity_id)
            try:
                value = (
                    float(state_obj.state)
                    if state_obj and state_obj.state not in ("unavailable", "unknown")
                    else None
                )
            except (ValueError, TypeError):
                value = None
            self._attr_native_value = round(value, 1) if value is not None else None
            self._attr_extra_state_attributes = {
                ATTR_ENTITY_ID: [self._official_entity_id],
                "total": 1,
                "source": "area_registry_configured_sensor",
            }
            return

        values: list[float] = []
        for entity_id in self._member_entity_ids:
            state_obj = self.hass.states.get(entity_id)
            if not state_obj or state_obj.state in ("unavailable", "unknown"):
                continue
            try:
                values.append(float(state_obj.state))
            except (ValueError, TypeError):
                continue

        value = compute_numeric_aggregate(values, self._mode)
        self._attr_native_value = round(value, 1) if value is not None else None
        self._attr_extra_state_attributes = {
            ATTR_ENTITY_ID: list(self._member_entity_ids),
            "total": len(self._member_entity_ids),
            "mode": self._mode,
        }


def _discover_numeric_device_classes(
    hass: HomeAssistant, exclusions: ExclusionConfig
) -> set[str]:
    """
    Find sensor device_classes present with an actually-numeric state.

    Every device_class gets an aggregate now (dynamically discovered, same
    approach as binary_sensor.py's per-device_class groups) rather than a
    fixed short list — a device_class with a non-numeric state (enum,
    timestamp, date) is skipped since summing/averaging it is meaningless;
    see NUMERIC_DEVICE_CLASS_EXCLUSIONS for the ones excluded outright
    without even checking the live value.
    """
    entity_reg = er.async_get(hass)
    device_classes: set[str] = set()
    for entity_entry in entity_reg.entities.values():
        if entity_entry.domain != "sensor" or entity_entry.platform == DOMAIN:
            continue
        if entity_entry.hidden_by or entity_entry.disabled_by:
            continue
        device_class = entity_entry.device_class or entity_entry.original_device_class
        if not device_class or device_class in NUMERIC_DEVICE_CLASS_EXCLUSIONS:
            continue
        if device_class in exclusions.excluded_device_classes:
            continue
        state_obj = hass.states.get(entity_entry.entity_id)
        if not state_obj:
            continue
        try:
            float(state_obj.state)
        except (ValueError, TypeError):
            continue
        device_classes.add(device_class)
    return device_classes


async def _build_numeric_sensors(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> list[LinusDashboardNumericAggregateSensor]:
    """Build one numeric aggregate sensor per sensor device_class present, nested area/floor/global."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    entry_id = config_entry.entry_id
    area_reg = ar.async_get(hass)
    entities: list[LinusDashboardNumericAggregateSensor] = []

    for device_class in _discover_numeric_device_classes(hass, exclusions):
        scoped = scan_domain_members(
            hass, domain="sensor", device_class=device_class, exclusions=exclusions
        )
        area_group_ids: dict[str, str] = {}
        area_official: dict[str, str | None] = {}

        # Sample one member's real state_class rather than assuming
        # "measurement" for every device_class — sum-type sensors (energy,
        # water, gas, ...) need resolve_numeric_aggregation_mode to actually
        # see "total"/"total_increasing" or they'd get averaged instead of
        # summed. All members of a given device_class are expected to share
        # the same state_class in practice, so the first one found is enough.
        state_class = None
        unit = None
        for member_ids in scoped.area_entities.values():
            if not member_ids:
                continue
            first_state = hass.states.get(member_ids[0])
            if first_state:
                state_class = first_state.attributes.get("state_class")
                unit = first_state.attributes.get("unit_of_measurement")
            break
        mode = resolve_numeric_aggregation_mode(device_class, state_class)

        for area_id, member_ids in scoped.area_entities.items():
            if not member_ids:
                continue

            official_entity_id = None
            registry_attr = AREA_REGISTRY_SENSOR_ATTR.get(device_class)
            if registry_attr:
                area = area_reg.async_get_area(area_id)
                official_entity_id = (
                    getattr(area, registry_attr, None) if area else None
                )

            unique_id = f"{DOMAIN}_{device_class}_area_{area_id}"
            sensor = LinusDashboardNumericAggregateSensor(
                hass,
                unique_id=unique_id,
                # No custom translation_key/placeholders — same reasoning as
                # binary_sensor.py's per-device_class groups: with
                # _attr_device_class set and no translation_key, HA falls
                # back to its own core per-device_class sensor name
                # (already localized for every standard device_class)
                # combined with the device's own name for the area/floor
                # distinction. A hand-written "numeric_{device_class}" key
                # can't scale to a dynamically-discovered device_class list
                # anyway — there's no way to pre-write a translation for a
                # device_class we don't know about yet.
                translation_key=None,
                translation_placeholders=None,
                device_info=get_area_device_info(
                    entry_id, area_id, scoped.area_names[area_id]
                ),
                device_class=device_class,
                mode=mode,
                member_entity_ids=member_ids,
                official_entity_id=official_entity_id,
                unit_of_measurement=unit,
            )
            entities.append(sensor)
            area_group_ids[area_id] = sensor.entity_id
            area_official[area_id] = official_entity_id

        floor_areas, floor_names = resolve_floors_for_areas(
            hass, set(area_group_ids), exclusions
        )
        floor_group_ids: list[str] = []
        for floor_id, areas_on_floor in floor_areas.items():
            member_ids = [
                area_group_ids[a] for a in areas_on_floor if a in area_group_ids
            ]
            if not member_ids:
                continue
            unique_id = f"{DOMAIN}_{device_class}_floor_{floor_id}"
            sensor = LinusDashboardNumericAggregateSensor(
                hass,
                unique_id=unique_id,
                translation_key=None,
                translation_placeholders=None,
                device_info=get_floor_device_info(
                    entry_id, floor_id, floor_names.get(floor_id, floor_id)
                ),
                device_class=device_class,
                mode=mode,
                member_entity_ids=member_ids,
                unit_of_measurement=unit,
            )
            entities.append(sensor)
            floor_group_ids.append(sensor.entity_id)

        if floor_group_ids:
            unique_id = f"{DOMAIN}_{device_class}_global"
            sensor = LinusDashboardNumericAggregateSensor(
                hass,
                unique_id=unique_id,
                translation_key=None,
                translation_placeholders=None,
                device_info=get_global_device_info(entry_id),
                device_class=device_class,
                mode=mode,
                member_entity_ids=floor_group_ids,
                unit_of_measurement=unit,
            )
            entities.append(sensor)

    return entities


# ---------------------------------------------------------------------------
# Health / availability sensor
# ---------------------------------------------------------------------------

# Keeps the entity_id attribute list well under HA's 16KB state-attribute
# limit even on a large house with many entities down at once (global scope
# concatenates every floor's already-concatenated area list).
MAX_UNAVAILABLE_ENTITY_IDS = 200


class LinusDashboardHealthSensor(SensorEntity):
    """
    Count and list of unavailable/unknown entities in a zone/floor/global.

    Subscribes to its tracked entities and recomputes on change (debounced),
    same pattern as LinusDashboardAggregateSensor above — it used to just
    compute once in __init__ and never again, so it permanently froze
    whatever a handful of entities happened to report during the first
    second of HA startup (many integrations report "unknown" for a moment
    before their first real state lands), never noticing when they became
    available again, or when something newly went down after that snapshot.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_registry_visible_default = True
    _attr_native_unit_of_measurement = None

    def __init__(
        self,
        hass: HomeAssistant,
        *,
        unique_id: str,
        translation_key: str,
        translation_placeholders: dict[str, str] | None,
        device_info: dict,
        tracked_entity_ids: list[str],
        nested: bool,
    ) -> None:
        """
        tracked_entity_ids: raw entities to check directly (area scope,
        nested=False) or the child health-sensor entity_ids to read each
        one's own already-computed unavailable list from (floor/global
        scope, nested=True) — same "floor/global read the area-scope
        sensor's own computed value instead of re-scanning" pattern as every
        other nested sensor in this integration.
        """
        self.hass = hass
        self._tracked_entity_ids = list(tracked_entity_ids)
        self._nested = nested
        self._attr_unique_id = unique_id
        self._attr_suggested_object_id = unique_id
        self._attr_translation_key = translation_key
        if translation_placeholders:
            self._attr_translation_placeholders = translation_placeholders
        self._attr_device_info = device_info
        self.entity_id = f"sensor.{unique_id}"
        self._attr_native_value: int = 0
        self._attr_extra_state_attributes: dict[str, Any] = {}
        self._unsub_state_changed: CALLBACK_TYPE | None = None
        self._debounce_unsub: CALLBACK_TYPE | None = None

    def _update_state(self) -> None:
        if self._nested:
            unavailable: list[str] = []
            for child_id in self._tracked_entity_ids:
                child_state = self.hass.states.get(child_id)
                if not child_state:
                    continue
                unavailable.extend(child_state.attributes.get(ATTR_ENTITY_ID, []))
        else:
            unavailable = [
                eid
                for eid in self._tracked_entity_ids
                if (state := self.hass.states.get(eid)) is not None
                and state.state in ("unavailable", "unknown")
            ]

        self._attr_native_value = len(unavailable)
        self._attr_extra_state_attributes = {
            # Nested tiers concatenate every child's list — on a real house
            # (hundreds of entities) with many entities down at once, this
            # flat list can exceed HA's 16KB state-attribute limit and get
            # silently dropped entirely. total stays the real, uncapped
            # count; only the list itself is capped since it's meant to help
            # pinpoint what's down, not be an exhaustive audit trail.
            ATTR_ENTITY_ID: unavailable[:MAX_UNAVAILABLE_ENTITY_IDS],
            "total": len(unavailable),
        }

    async def async_added_to_hass(self) -> None:
        self._update_state()
        self._unsub_state_changed = async_track_state_change_event(
            self.hass, self._tracked_entity_ids, self._async_state_changed
        )

    async def async_will_remove_from_hass(self) -> None:
        if self._unsub_state_changed:
            self._unsub_state_changed()
            self._unsub_state_changed = None
        if self._debounce_unsub:
            self._debounce_unsub()
            self._debounce_unsub = None

    @callback
    def _async_state_changed(self, _event: Event) -> None:
        if self._debounce_unsub:
            self._debounce_unsub()
        self._debounce_unsub = async_call_later(
            self.hass, DEBOUNCE_SECONDS, self._async_debounced_update
        )

    @callback
    def _async_debounced_update(self, _now=None) -> None:
        self._debounce_unsub = None
        self._update_state()
        self.async_write_ha_state()


def _scan_all_entities_by_area(
    hass: HomeAssistant, exclusions: ExclusionConfig
) -> tuple[dict[str, list[str]], dict[str, str]]:
    """
    Every entity in every area, regardless of domain — unlike scan_domain_members,
    the health sensor isn't limited to the domains this integration already
    groups; a dead sensor.* or climate.* entity should show up too.
    """
    entity_reg = er.async_get(hass)
    device_reg = dr.async_get(hass)
    area_reg = ar.async_get(hass)

    area_entities: dict[str, list[str]] = {}
    area_names: dict[str, str] = {}

    for entity_entry in entity_reg.entities.values():
        if entity_entry.platform == DOMAIN:
            continue
        if entity_entry.hidden_by or entity_entry.disabled_by:
            continue
        entity_id = entity_entry.entity_id
        if entity_id in exclusions.excluded_entity_ids:
            continue
        if (
            entity_entry.device_id
            and entity_entry.device_id in exclusions.excluded_device_ids
        ):
            continue
        if (
            entity_entry.platform
            and entity_entry.platform in exclusions.excluded_integrations
        ):
            continue

        area_id = entity_entry.area_id
        if not area_id and entity_entry.device_id:
            device = device_reg.async_get(entity_entry.device_id)
            if device:
                area_id = device.area_id
        if not area_id or area_id in exclusions.excluded_area_ids:
            continue

        area = area_reg.async_get_area(area_id)
        if not area:
            continue

        area_entities.setdefault(area_id, []).append(entity_id)
        area_names[area_id] = area.name

    return area_entities, area_names


async def _build_health_sensors(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> list[LinusDashboardHealthSensor]:
    """Build unavailable/unknown-entity-count sensors, nested area/floor/global."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    entry_id = config_entry.entry_id
    entities: list[LinusDashboardHealthSensor] = []

    area_entities, area_names = _scan_all_entities_by_area(hass, exclusions)
    area_group_ids: dict[str, str] = {}

    for area_id, entity_ids in area_entities.items():
        unique_id = f"{DOMAIN}_unavailable_area_{area_id}"
        sensor = LinusDashboardHealthSensor(
            hass,
            unique_id=unique_id,
            translation_key="unavailable",
            translation_placeholders={"name": area_names[area_id]},
            device_info=get_area_device_info(entry_id, area_id, area_names[area_id]),
            tracked_entity_ids=entity_ids,
            nested=False,
        )
        entities.append(sensor)
        area_group_ids[area_id] = sensor.entity_id

    floor_areas, floor_names = resolve_floors_for_areas(
        hass, set(area_group_ids), exclusions
    )
    floor_group_ids: list[str] = []
    for floor_id, areas_on_floor in floor_areas.items():
        member_ids = [area_group_ids[a] for a in areas_on_floor if a in area_group_ids]
        if not member_ids:
            continue
        unique_id = f"{DOMAIN}_unavailable_floor_{floor_id}"
        sensor = LinusDashboardHealthSensor(
            hass,
            unique_id=unique_id,
            translation_key="unavailable",
            translation_placeholders={"name": floor_names.get(floor_id, floor_id)},
            device_info=get_floor_device_info(
                entry_id, floor_id, floor_names.get(floor_id, floor_id)
            ),
            tracked_entity_ids=member_ids,
            nested=True,
        )
        entities.append(sensor)
        floor_group_ids.append(sensor.entity_id)

    if floor_group_ids:
        unique_id = f"{DOMAIN}_unavailable_global"
        sensor = LinusDashboardHealthSensor(
            hass,
            unique_id=unique_id,
            translation_key="unavailable_global",
            translation_placeholders=None,
            device_info=get_global_device_info(entry_id),
            tracked_entity_ids=floor_group_ids,
            nested=True,
        )
        entities.append(sensor)

    return entities
