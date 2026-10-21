"""
Sensor platform for Linus Dashboard.

Three families of sensors:
1. Generic hidden diagnostic aggregate sensors (`LinusDashboardAggregateSensor`)
   — pure rendering cache for AggregateChip's floor/global-scope fast path
   (`getAggregateSensorId()` in src/chips/AggregateChip.ts), at global and
   floor scope only (AggregateChip never queries these at area scope — it
   renders area-scope chips client-side instead, from the raw entities
   directly). AggregateChip now prefers a domain's own dedicated group
   entity when one exists — every domain in DOMAIN_ACTIVE_STATES has a flat
   single-domain group (light.py/switch.py/fan.py/cover.py/siren.py/
   climate.py/media_player.py), and binary_sensor/cover/media_player also
   each have one per device_class (entity_group.py's
   build_nested_device_class_groups) — falling back to this generic system
   only when it doesn't. That leaves exactly one case: binary_sensor's
   domain-level (no device_class) bucket, since "every binary_sensor
   regardless of device_class" has no sensible single dedicated group to
   build.
2. Numeric sensor aggregates (`LinusDashboardNumericAggregateSensor`) — sum,
   average or minimum (depending on state_class/device_class) of a `sensor`
   domain device_class across a zone/floor/global, e.g. average temperature.
   Visible by default: unlike (1), these are meant to be looked at directly
   (a "room climate" card), not just an internal rendering cache.
3. Health/availability sensor (`LinusDashboardHealthSensor`) — count and list
   of unavailable/unknown entities per zone/floor/global, across every
   domain (not just the ones covered by (1)/(2)).

(2) is discovered from the entity registry (not from live states) and rebuilt
once after EVENT_HOMEASSISTANT_STARTED (PlatformGroupManager, same pattern as
light.py/cover.py): entities of late-loading integrations (MQTT, tuya_local,
...) have no state when the platform is first set up, so a single startup
scan would silently drop them. The rebuild is idempotent: an existing
aggregate (same unique_id) gets its members/mode/unit refreshed in place,
only missing ones are added.

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
from homeassistant.const import ATTR_ENTITY_ID
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
    convert_member_value,
    resolve_numeric_aggregation_mode,
    resolve_reference_unit,
)
from .const import (
    DOMAIN,
    get_area_device_info,
    get_floor_device_info,
    get_global_device_info,
)
from .entity_group import (
    ExclusionConfig,
    is_aggregatable_entry,
    resolve_floors_for_areas,
    scan_domain_members,
)
from .group_manager import PlatformGroupManager
from .registry_cleanup import async_report_built

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

# Live numeric aggregates by unique_id. Module-level (like light.py's
# _LIGHT_GROUPS) so `_rebuild` can tell entities that already exist (refresh
# their members in place) from genuinely new ones (async_add_entities).
# Cleared at the start of every async_setup_entry.
_NUMERIC_SENSORS: dict[str, "LinusDashboardNumericAggregateSensor"] = {}

# Sentinel: "leave this attribute untouched" in async_update_members (None is
# a meaningful value for unit/official_entity_id).
_UNSET: Any = object()


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard sensors (generic counts, numeric aggregates, health)."""
    # A previous load of this config entry (reload after an options change)
    # leaves stale entries — those entities were torn down by HA already.
    _NUMERIC_SENSORS.clear()

    aggregate_sensors = await _build_aggregate_sensors(hass, config_entry)
    numeric_sensors = await _build_numeric_sensors(hass, config_entry)
    health_sensors = await _build_health_sensors(hass, config_entry)
    # Built once per setup; only the numeric aggregates are rebuilt below.
    static_sensors: list[SensorEntity] = [*aggregate_sensors, *health_sensors]
    sensors: list[SensorEntity] = [
        *aggregate_sensors,
        *numeric_sensors,
        *health_sensors,
    ]

    if sensors:
        async_add_entities(sensors)
        _LOGGER.info("Created %d sensors", len(sensors))

    async_report_built(hass, config_entry, "sensor", sensors)

    async def _rebuild(*_args) -> None:
        """Re-run numeric discovery: refresh existing aggregates, add/remove the rest."""
        before_ids = set(_NUMERIC_SENSORS)

        new_sensors = await _build_numeric_sensors(hass, config_entry)

        after_ids = {sensor.unique_id for sensor in new_sensors}
        to_add = [s for s in new_sensors if s.unique_id not in before_ids]

        for uid in before_ids - after_ids:
            _NUMERIC_SENSORS.pop(uid)

        # Record the new build: the registry cleanup removes the dropped ones.
        async_report_built(
            hass, config_entry, "sensor", [*static_sensors, *new_sensors]
        )

        if to_add:
            async_add_entities(to_add)
            _LOGGER.info(
                "Created %d numeric aggregate sensors after startup", len(to_add)
            )
            # See light.py's _rebuild for why this is needed here too.
            from . import async_hide_group_entities_from_voice_assistants

            await async_hide_group_entities_from_voice_assistants(hass, config_entry)

    platform_manager = PlatformGroupManager(hass, monitored_domains=["sensor"])
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    for unsub in platform_manager.setup_listeners():
        config_entry.async_on_unload(unsub)


async def _build_aggregate_sensors(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
) -> list["LinusDashboardAggregateSensor"]:
    """
    Build the generic hidden counting sensor at global and floor scope (no
    area scope — see module docstring, AggregateChip never queries this
    system at area scope): domain-level buckets only for
    GENERIC_DOMAIN_LEVEL_DOMAINS.

    No more device_class buckets here: binary_sensor/cover/media_player (the
    only domains that ever populated one — light/switch/fan/siren/climate
    have no device_class values in practice) now each have a real dedicated
    group entity per device_class (build_nested_device_class_groups in
    entity_group.py), so this hidden fallback would just be dead weight
    AggregateChip never reads once a dedicated group exists — which it now
    always does for these domains.
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

    # Domain-level buckets serve chips without a device_class — the only
    # remaining case, now that device_class buckets are covered by real
    # dedicated group entities instead (see docstring above).
    domain_entities: dict[str, list[str]] = {}
    floor_domain_entities: dict[tuple[str, str], list[str]] = {}

    for entity_entry in ent_reg.entities.values():
        if not is_aggregatable_entry(entity_entry):
            continue

        # Self-exclusion: Linus Dashboard's own diagnostic groups (presence,
        # per-device_class) must not be counted again as raw binary_sensors.
        if entity_entry.platform == DOMAIN:
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

        if floor_id and domain in GENERIC_DOMAIN_LEVEL_DOMAINS:
            floor_domain_entities.setdefault((domain, floor_id), []).append(entity_id)

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

    return sensors


class LinusDashboardAggregateSensor(SensorEntity):
    """
    Visible sensor computing active count, icon, and color for a whole
    domain, regardless of device_class.

    Only still built for GENERIC_DOMAIN_LEVEL_DOMAINS (binary_sensor) — the
    one domain with no dedicated group entity to show a real count/control
    tile instead ("every binary_sensor regardless of device_class" has no
    sensible single group). Every device_class-specific bucket this used to
    also build is gone: binary_sensor/cover/media_player now each have a
    real dedicated group entity per device_class instead (see
    entity_group.py's build_nested_device_class_groups).
    """

    _attr_has_entity_name = True
    _attr_entity_category = None
    _attr_entity_registry_visible_default = True
    _attr_should_poll = False
    _attr_native_unit_of_measurement = None

    def __init__(
        self,
        hass: HomeAssistant,
        domain: str,
        device_class_filter: None,
        scope_id: str | None,
        tracked_entity_ids: list[str],
        config_entry: ConfigEntry,
    ) -> None:
        """Initialize the aggregate sensor."""
        self.hass = hass
        self._domain = domain
        self._tracked_entities = frozenset(tracked_entity_ids)
        self._config_entry = config_entry
        self._debounce_unsub: CALLBACK_TYPE | None = None
        self._unsub_state_changed: CALLBACK_TYPE | None = None

        parts = ["linus_dashboard", domain]
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
        icon = compute_icon(self.hass, self._domain, entity_states, None)
        color = compute_color(self._domain, None, entity_states)

        self._attr_native_value = active_count
        self._attr_extra_state_attributes = {
            "total": len(self._tracked_entities),
            "icon": icon,
            "color": color,
            ATTR_ENTITY_ID: sorted(self._tracked_entities),
            "active_entity_ids": active_ids,
            # Redundant with this sensor's own state (which IS the count), but
            # published so every aggregate entity answers `active_count` the
            # same way and a chip template never has to branch on which kind
            # of aggregate it is reading. This sensor only ever tracks raw
            # entities, so no leaf-level recursion applies here.
            "active_count": active_count,
        }


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

    async def async_update_members(
        self,
        member_entity_ids: list[str],
        mode: str | None = None,
        unit_of_measurement: str | None = _UNSET,
        official_entity_id: str | None = _UNSET,
    ) -> None:
        """
        Refresh members (and optionally mode/unit/official sensor) in place.

        `mode` is left untouched when None; unit and official sensor when not
        passed (None is a meaningful value for both). Safe on an entity that
        was constructed but not added to HA yet: subscription and state write
        are then left to async_added_to_hass.
        """
        self._member_entity_ids = list(member_entity_ids)
        if mode is not None:
            self._mode = mode
        if unit_of_measurement is not _UNSET:
            self._attr_native_unit_of_measurement = unit_of_measurement
        if official_entity_id is not _UNSET:
            self._official_entity_id = official_entity_id
        if not (self.hass and self.platform):
            return
        await self._async_resubscribe()
        self._update_state()
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

    def _member_value(self, entity_id: str) -> tuple[float | None, bool]:
        """
        A member's numeric value in this aggregate's unit.

        Returns (value, excluded). `excluded` is True only when the member has
        a numeric state that can't be expressed in the aggregate's unit
        (unit missing, unknown or of another quantity): it is then left out
        and reported, never combined as is. Unavailable/unknown/non-numeric
        members are simply skipped (value None, not excluded), as before.
        """
        state_obj = self.hass.states.get(entity_id)
        if not state_obj or state_obj.state in ("unavailable", "unknown"):
            return None, False
        try:
            raw = float(state_obj.state)
        except (ValueError, TypeError):
            return None, False
        converted = convert_member_value(
            self._device_class,
            raw,
            state_obj.attributes.get("unit_of_measurement"),
            self._attr_native_unit_of_measurement,
        )
        return converted, converted is None

    @callback
    def _update_state(self) -> None:
        if self._official_entity_id:
            value, excluded = self._member_value(self._official_entity_id)
            self._attr_native_value = round(value, 1) if value is not None else None
            self._attr_extra_state_attributes = {
                ATTR_ENTITY_ID: [self._official_entity_id],
                "total": 1,
                "source": "area_registry_configured_sensor",
            }
            if excluded:
                self._attr_extra_state_attributes["excluded_entity_ids"] = [
                    self._official_entity_id
                ]
            return

        values: list[float] = []
        excluded_ids: list[str] = []
        for entity_id in self._member_entity_ids:
            value, excluded = self._member_value(entity_id)
            if excluded:
                excluded_ids.append(entity_id)
            elif value is not None:
                values.append(value)

        aggregate = compute_numeric_aggregate(values, self._mode)
        self._attr_native_value = round(aggregate, 1) if aggregate is not None else None
        self._attr_extra_state_attributes = {
            ATTR_ENTITY_ID: list(self._member_entity_ids),
            "total": len(self._member_entity_ids),
            "mode": self._mode,
        }
        if excluded_ids:
            self._attr_extra_state_attributes["excluded_entity_ids"] = excluded_ids


def _declares_enum_options(entity_entry: er.RegistryEntry) -> bool:
    """Whether a registry entry is an enum-style sensor (has an `options` list)."""
    capabilities = entity_entry.capabilities or {}
    return bool(capabilities.get("options"))


def _discover_numeric_device_classes(
    hass: HomeAssistant, exclusions: ExclusionConfig
) -> set[str]:
    """
    Find the sensor device_classes that deserve a numeric aggregate.

    Registry-based, not state-based: entities of late-loading integrations
    (MQTT, tuya_local, ...) have no state when this runs at startup, so a
    device_class is retained as soon as one non-hidden, non-disabled,
    non-excluded sensor declares it in the entity registry
    (`device_class or original_device_class`). Skipped:
    - NUMERIC_DEVICE_CLASS_EXCLUSIONS (timestamp/date/enum) and
      user-excluded device_classes;
    - sensors with an `options` list in their registry capabilities (enum
      sensors — a type declared only by such sensors is not numeric);
    - sensors whose live state exists but is neither numeric nor
      unavailable/unknown (nothing to sum or average).
    """
    entity_reg = er.async_get(hass)
    device_classes: set[str] = set()
    for entity_entry in entity_reg.entities.values():
        if entity_entry.domain != "sensor" or entity_entry.platform == DOMAIN:
            continue
        if not is_aggregatable_entry(entity_entry):
            continue
        device_class = entity_entry.device_class or entity_entry.original_device_class
        if not device_class or device_class in NUMERIC_DEVICE_CLASS_EXCLUSIONS:
            continue
        if device_class in exclusions.excluded_device_classes:
            continue
        if entity_entry.entity_id in exclusions.excluded_entity_ids:
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
        if _declares_enum_options(entity_entry):
            continue
        state_obj = hass.states.get(entity_entry.entity_id)
        if state_obj and state_obj.state not in ("unavailable", "unknown"):
            try:
                float(state_obj.state)
            except (ValueError, TypeError):
                continue
        device_classes.add(device_class)
    return device_classes


def _resolve_state_class(hass: HomeAssistant, member_ids: list[str]) -> str | None:
    """
    State class of a device_class, sampled from its members.

    Per member: the real state if it exists and is not a `restored`
    placeholder, else the entity registry (`capabilities["state_class"]`) —
    late integrations have no live state at startup. None when nothing is
    known (mode then falls back to mean).
    """
    entity_reg = er.async_get(hass)
    for entity_id in member_ids:
        state_obj = hass.states.get(entity_id)
        if state_obj and not state_obj.attributes.get("restored"):
            state_class = state_obj.attributes.get("state_class")
            if state_class is not None:
                return state_class
        entry = entity_reg.async_get(entity_id)
        if entry is not None:
            state_class = (entry.capabilities or {}).get("state_class")
            if state_class is not None:
                return state_class
    return None


def _member_unit(hass: HomeAssistant, entity_id: str) -> str | None:
    """
    Unit a member reports: the live state's, else the registry's.

    Same source `_update_state` converts from (the live state attribute), with
    the registry as the startup fallback for late-loading integrations.
    """
    state_obj = hass.states.get(entity_id)
    if state_obj and not state_obj.attributes.get("restored"):
        unit = state_obj.attributes.get("unit_of_measurement")
        if unit is not None:
            return unit
    entry = er.async_get(hass).async_get(entity_id)
    return entry.unit_of_measurement if entry is not None else None


def _make_numeric_sensor(
    hass: HomeAssistant,
    *,
    unique_id: str,
    device_info: dict,
    device_class: str,
    mode: str,
    member_entity_ids: list[str],
    official_entity_id: str | None = None,
    unit_of_measurement: str | None = None,
) -> LinusDashboardNumericAggregateSensor:
    """
    Idempotent factory: reuse the existing entity for this unique_id (and
    schedule an in-place refresh of members/mode/unit) instead of building a
    duplicate, so `_rebuild` can tell new aggregates (need async_add_entities)
    from existing ones. The unique_id format is unchanged, so an aggregate
    already in the entity registry is re-adopted under the same identity.
    """
    existing = _NUMERIC_SENSORS.get(unique_id)
    if existing is not None:
        hass.async_create_task(
            existing.async_update_members(
                member_entity_ids,
                mode,
                unit_of_measurement,
                official_entity_id,
            )
        )
        return existing

    sensor = LinusDashboardNumericAggregateSensor(
        hass,
        unique_id=unique_id,
        # No custom translation_key/placeholders — same reasoning as
        # binary_sensor.py's per-device_class groups: with _attr_device_class
        # set and no translation_key, HA falls back to its own core
        # per-device_class sensor name (already localized for every standard
        # device_class) combined with the device's own name for the
        # area/floor distinction. A hand-written "numeric_{device_class}" key
        # can't scale to a dynamically-discovered device_class list anyway.
        translation_key=None,
        translation_placeholders=None,
        device_info=device_info,
        device_class=device_class,
        mode=mode,
        member_entity_ids=member_entity_ids,
        official_entity_id=official_entity_id,
        unit_of_measurement=unit_of_measurement,
    )
    _NUMERIC_SENSORS[unique_id] = sensor
    return sensor


async def _build_numeric_sensors(
    hass: HomeAssistant, config_entry: ConfigEntry
) -> list[LinusDashboardNumericAggregateSensor]:
    """
    Build one numeric aggregate sensor per sensor device_class present, nested area/floor/global.

    Returns every aggregate (existing ones refreshed in place, new ones
    constructed) — the caller decides which still need async_add_entities.
    """
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    entry_id = config_entry.entry_id
    area_reg = ar.async_get(hass)
    entities: list[LinusDashboardNumericAggregateSensor] = []

    for device_class in sorted(_discover_numeric_device_classes(hass, exclusions)):
        scoped = scan_domain_members(
            hass,
            domain="sensor",
            device_class=device_class,
            exclusions=exclusions,
            require_state=False,
        )
        area_group_ids: dict[str, str] = {}
        area_official: dict[str, str | None] = {}

        # Sample members' real state_class rather than assuming "measurement"
        # for every device_class — sum-type sensors (energy, water, gas, ...)
        # need resolve_numeric_aggregation_mode to actually see
        # "total"/"total_increasing" or they'd get averaged instead of summed.
        # All members of a given device_class are expected to share the same
        # state_class in practice, so the first one found is enough.
        sample_ids = next((ids for ids in scoped.area_entities.values() if ids), [])
        state_class = _resolve_state_class(hass, sample_ids)
        mode = resolve_numeric_aggregation_mode(device_class, state_class)

        # One unit per device_class for the whole house (area, floor and
        # global alike): members reporting another convertible unit (mV vs V,
        # kW vs W, °F vs °C...) are converted to it at every update instead
        # of being averaged raw under the first member's label.
        unit = resolve_reference_unit(
            device_class,
            (
                _member_unit(hass, entity_id)
                for member_ids in scoped.area_entities.values()
                for entity_id in member_ids
            ),
        )

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

            sensor = _make_numeric_sensor(
                hass,
                unique_id=f"{DOMAIN}_{device_class}_area_{area_id}",
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
            sensor = _make_numeric_sensor(
                hass,
                unique_id=f"{DOMAIN}_{device_class}_floor_{floor_id}",
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
            sensor = _make_numeric_sensor(
                hass,
                unique_id=f"{DOMAIN}_{device_class}_global",
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

# Stateless entities: their state is the time of their last press, activation,
# event or message, so they stay "unknown" until the first one — their normal
# resting state, not a fault (a never-pressed restart button). Only
# "unavailable" means one of them is down.
STATELESS_DOMAINS = frozenset({
    "ai_task",
    "button",
    "conversation",
    "event",
    "input_button",
    "notify",
    "scene",
    "stt",
    "tts",
    "wake_word",
})


def _is_down(entity_id: str, state: str) -> bool:
    """Whether a raw entity state counts as unavailable for the health sensor."""
    if state == "unavailable":
        return True
    return state == "unknown" and entity_id.split(".", 1)[0] not in STATELESS_DOMAINS


class LinusDashboardHealthSensor(SensorEntity):
    """
    Count and list of unavailable/unknown entities in a zone/floor/global
    ("unknown" not counted for STATELESS_DOMAINS, see above).

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
                and _is_down(eid, state.state)
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
        if not is_aggregatable_entry(entity_entry):
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
