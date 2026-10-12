"""
Regression tests for TK-156 (Linus-Dashboard#197): numeric aggregate sensors
were built once at startup from live states only and never rebuilt, so
entities of late-loading integrations (MQTT, tuya_local, ...) were silently
dropped.

The registries are simulated by monkeypatching the `async_get` helpers with
tiny in-memory fakes (no full HA test harness in this repo's dev env, see
conftest.py). The platform's `_rebuild` closure is exercised through
`sensor.async_setup_entry` with a captured `async_add_entities`.
"""

from __future__ import annotations

import asyncio

from custom_components.linus_dashboard import sensor
from custom_components.linus_dashboard.entity_group import (
    ExclusionConfig,
    scan_domain_members,
)

from .conftest import _setup


def _members(entity: sensor.LinusDashboardNumericAggregateSensor) -> list[str]:
    return list(entity._member_entity_ids)


def _snapshot() -> dict[str, list[str]]:
    return {
        uid: sorted(s._member_entity_ids) for uid, s in sensor._NUMERIC_SENSORS.items()
    }


def _trigger_started(mock_hass, mock_config_entry, platform):
    """Simulate EVENT_HOMEASSISTANT_STARTED followed by the immediate call_later."""

    async def run():
        (_event, started_cb) = platform.started_listeners[0]
        started_cb(None)
        await platform.later_actions[0](None)
        await platform.flush()

    asyncio.run(run())


# ---------------------------------------------------------------------------
# (1) + (2) late-loading entities
# ---------------------------------------------------------------------------


def test_entity_without_state_at_setup_is_member_and_gets_a_value_later(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    entity_reg.add("sensor.cuisine_temp", device_class="temperature")
    entity_reg.add("sensor.mqtt_temp", device_class="temperature")  # late: no state
    fake_states.set("sensor.cuisine_temp", "20", {"device_class": "temperature"})

    _setup(mock_hass, mock_config_entry, platform)

    area = sensor._NUMERIC_SENSORS["linus_dashboard_temperature_area_salon"]
    assert sorted(_members(area)) == ["sensor.cuisine_temp", "sensor.mqtt_temp"]

    fake_states.set("sensor.mqtt_temp", "24", {"device_class": "temperature"})
    area._update_state()
    assert area.native_value == 22.0


def test_fully_late_device_class_exists_at_area_floor_and_global(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    # No state at all for the only voltage sensors (e.g. MQTT not loaded yet).
    entity_reg.add("sensor.v_salon", area_id="salon", original_device_class="voltage")
    entity_reg.add("sensor.v_chambre", area_id="chambre", device_class="voltage")

    _setup(mock_hass, mock_config_entry, platform)

    ids = set(sensor._NUMERIC_SENSORS)
    assert "linus_dashboard_voltage_area_salon" in ids
    assert "linus_dashboard_voltage_area_chambre" in ids
    assert "linus_dashboard_voltage_floor_ground" in ids
    assert "linus_dashboard_voltage_global" in ids
    # All of them handed to the single initial async_add_entities call.
    assert len(platform.added) == 1
    assert {e.unique_id for e in platform.added[0]} == ids


def test_aggregate_with_members_without_value_is_unknown_not_unavailable(
    entity_reg, mock_hass, mock_config_entry, platform
):
    entity_reg.add("sensor.v_salon", original_device_class="voltage")
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_voltage_area_salon"]
    area._update_state()
    assert area.native_value is None
    assert area.extra_state_attributes["total"] == 1


# ---------------------------------------------------------------------------
# (3) + (4) idempotent rebuild
# ---------------------------------------------------------------------------


def test_rebuild_twice_adds_nothing_and_keeps_same_objects(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    entity_reg.add("sensor.t1", device_class="temperature")
    fake_states.set("sensor.t1", "20", {"device_class": "temperature"})
    _setup(mock_hass, mock_config_entry, platform)
    before = dict(sensor._NUMERIC_SENSORS)

    # A late sensor appears in the same area; STARTED triggers a rebuild.
    entity_reg.add("sensor.t_late", device_class="temperature")
    _trigger_started(mock_hass, mock_config_entry, platform)

    assert len(platform.added) == 1  # nothing new to add: same aggregates
    assert sensor._NUMERIC_SENSORS.keys() == before.keys()
    for uid, obj in before.items():
        assert sensor._NUMERIC_SENSORS[uid] is obj
    area = before["linus_dashboard_temperature_area_salon"]
    assert sorted(_members(area)) == ["sensor.t1", "sensor.t_late"]

    # Second pass: still zero additions, still the same objects.
    async def again():
        await platform.later_actions[0](None)
        await platform.flush()

    asyncio.run(again())
    assert len(platform.added) == 1
    for uid, obj in before.items():
        assert sensor._NUMERIC_SENSORS[uid] is obj


def test_rebuild_adds_only_the_missing_aggregates(
    entity_reg, mock_hass, mock_config_entry, platform
):
    entity_reg.add("sensor.t1", device_class="temperature")
    _setup(mock_hass, mock_config_entry, platform)
    initial = set(sensor._NUMERIC_SENSORS)

    entity_reg.add("sensor.p1", device_class="power")
    _trigger_started(mock_hass, mock_config_entry, platform)

    assert len(platform.added) == 2
    new_ids = {e.unique_id for e in platform.added[1]}
    assert new_ids.isdisjoint(initial)
    assert "linus_dashboard_power_area_salon" in new_ids
    # Newly created entities bypass the one-shot hide pass: it must be re-run.
    assert platform.hide_calls == 1


def test_no_duplicate_unique_id_in_a_single_add_entities_call(
    entity_reg, mock_hass, mock_config_entry, platform
):
    for index, area in enumerate(["salon", "chambre", "salon"]):
        entity_reg.add(f"sensor.t{index}", area_id=area, device_class="temperature")
        entity_reg.add(f"sensor.h{index}", area_id=area, device_class="humidity")
    _setup(mock_hass, mock_config_entry, platform)
    _trigger_started(mock_hass, mock_config_entry, platform)

    for batch in platform.added:
        uids = [e.unique_id for e in batch]
        assert len(uids) == len(set(uids))


# ---------------------------------------------------------------------------
# (5) criterion 4: startup rebuild == manual reload
# ---------------------------------------------------------------------------


def test_startup_rebuild_equals_build_with_hass_running(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    entity_reg.add("sensor.t1", device_class="temperature")
    entity_reg.add("sensor.t_mqtt", area_id="chambre", device_class="temperature")
    entity_reg.add("sensor.pw_tuya", device_class="power")  # fully late class
    fake_states.set("sensor.t1", "20", {"device_class": "temperature"})

    _setup(mock_hass, mock_config_entry, platform)  # is_running False
    # Late integrations finish loading, then HA reports STARTED.
    fake_states.set("sensor.t_mqtt", "18", {"device_class": "temperature"})
    fake_states.set("sensor.pw_tuya", "50", {"device_class": "power"})
    _trigger_started(mock_hass, mock_config_entry, platform)
    after_startup = _snapshot()

    # Manual integration reload on the same install: hass is running.
    sensor._NUMERIC_SENSORS.clear()
    mock_hass.is_running = True
    _setup(mock_hass, mock_config_entry, platform)
    after_reload = _snapshot()

    assert after_startup == after_reload
    assert "linus_dashboard_power_global" in after_reload


# ---------------------------------------------------------------------------
# (6) STARTED wiring
# ---------------------------------------------------------------------------


def test_started_event_triggers_rebuild_and_not_when_already_running(
    entity_reg, mock_hass, mock_config_entry, platform
):
    entity_reg.add("sensor.t1", device_class="temperature")
    _setup(mock_hass, mock_config_entry, platform)
    assert [event for event, _ in platform.started_listeners] == [
        "homeassistant_started"
    ]
    assert len(platform.later_actions) == 0

    entity_reg.add("sensor.late_h", device_class="humidity")
    _trigger_started(mock_hass, mock_config_entry, platform)
    assert "linus_dashboard_humidity_area_salon" in sensor._NUMERIC_SENSORS

    # Options change path (#181): the entry reloads while HA is running ->
    # no STARTED listener at all.
    platform.started_listeners.clear()
    mock_hass.is_running = True
    _setup(mock_hass, mock_config_entry, platform)
    assert platform.started_listeners == []


# ---------------------------------------------------------------------------
# (7) scan_domain_members backward compatibility + new mode
# ---------------------------------------------------------------------------


def test_scan_require_state_true_is_unchanged(
    entity_reg, mock_hass, mock_config_entry, fake_states
):
    entity_reg.add("sensor.nostate", device_class="temperature")
    entity_reg.add("sensor.regonly_class", original_device_class="temperature")
    entity_reg.add("sensor.ok", original_device_class="humidity")
    fake_states.set("sensor.regonly_class", "1", {})  # state without device_class attr
    fake_states.set("sensor.ok", "1", {"device_class": "temperature"})
    exclusions = ExclusionConfig.from_config_entry(mock_config_entry)

    default = scan_domain_members(
        mock_hass, domain="sensor", device_class="temperature", exclusions=exclusions
    )
    explicit = scan_domain_members(
        mock_hass,
        domain="sensor",
        device_class="temperature",
        exclusions=exclusions,
        require_state=True,
    )
    assert default.area_entities == explicit.area_entities == {"salon": ["sensor.ok"]}


def test_scan_without_state_keeps_stateless_entity_with_registry_class(
    entity_reg, mock_hass, mock_config_entry
):
    entity_reg.add("sensor.nostate", original_device_class="temperature")
    entity_reg.add("sensor.other", device_class="humidity")
    exclusions = ExclusionConfig.from_config_entry(mock_config_entry)
    scoped = scan_domain_members(
        mock_hass,
        domain="sensor",
        device_class="temperature",
        exclusions=exclusions,
        require_state=False,
    )
    assert scoped.area_entities == {"salon": ["sensor.nostate"]}


# ---------------------------------------------------------------------------
# Risks: foreign group, enum guard, mode/unit, entity not yet added
# ---------------------------------------------------------------------------


def test_foreign_group_is_excluded_at_rebuild_once_it_has_a_state(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    entity_reg.add("sensor.t1", device_class="temperature")
    entity_reg.add("sensor.group_t", device_class="temperature", platform="group")
    fake_states.set("sensor.t1", "20", {"device_class": "temperature"})

    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_temperature_area_salon"]
    # No state yet: a foreign group cannot be told apart from a leaf.
    assert "sensor.group_t" in _members(area)

    fake_states.set(
        "sensor.group_t",
        "20",
        {"device_class": "temperature", "entity_id": ["sensor.t1"]},
    )
    _trigger_started(mock_hass, mock_config_entry, platform)
    assert _members(area) == ["sensor.t1"]


def test_device_class_declared_only_by_enum_sensors_is_ignored(
    entity_reg, mock_hass, mock_config_entry
):
    entity_reg.add(
        "sensor.mode",
        device_class="voltage",
        capabilities={"options": ["low", "high"]},
    )
    entity_reg.add("sensor.t1", device_class="temperature")
    exclusions = ExclusionConfig.from_config_entry(mock_config_entry)
    assert sensor._discover_numeric_device_classes(mock_hass, exclusions) == {
        "temperature"
    }

    # A real numeric sensor of the same type keeps it.
    entity_reg.add("sensor.volt", device_class="voltage")
    assert sensor._discover_numeric_device_classes(mock_hass, exclusions) == {
        "temperature",
        "voltage",
    }


def test_discovery_skips_hidden_disabled_excluded_and_nonnumeric_live_state(
    entity_reg, mock_hass, mock_config_entry, fake_states
):
    entity_reg.add("sensor.hid", device_class="power", hidden_by="user")
    entity_reg.add("sensor.dis", device_class="current", disabled_by="user")
    entity_reg.add("sensor.exc", device_class="gas", platform="blocked")
    entity_reg.add("sensor.txt", device_class="water")
    entity_reg.add("sensor.ts", device_class="timestamp")
    fake_states.set("sensor.txt", "open")
    mock_config_entry.options = {"excluded_integrations": ["blocked"]}
    exclusions = ExclusionConfig.from_config_entry(mock_config_entry)
    assert sensor._discover_numeric_device_classes(mock_hass, exclusions) == set()


def test_mode_and_unit_fall_back_to_registry_when_no_real_state(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    entity_reg.add(
        "sensor.water_late",
        device_class="water",
        capabilities={"state_class": "total_increasing"},
        unit_of_measurement="L",
    )
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_water_area_salon"]
    assert area._mode == "sum"
    assert area._attr_native_unit_of_measurement == "L"

    # A `restored` placeholder state must not be trusted over the registry.
    fake_states.set(
        "sensor.water_late",
        "unavailable",
        {"restored": True, "state_class": "measurement", "unit_of_measurement": "m3"},
    )
    assert sensor._resolve_state_class(mock_hass, ["sensor.water_late"]) == (
        "total_increasing"
    )
    assert sensor._member_unit(mock_hass, "sensor.water_late") == "L"


def test_rebuild_refreshes_mode_and_unit_of_existing_aggregate(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    entity_reg.add("sensor.e1", device_class="energy")  # nothing known yet
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_energy_area_salon"]
    assert area._mode == "average"

    fake_states.set(
        "sensor.e1",
        "3",
        {"state_class": "total_increasing", "unit_of_measurement": "kWh"},
    )
    _trigger_started(mock_hass, mock_config_entry, platform)
    assert area._mode == "sum"
    assert area._attr_native_unit_of_measurement == "kWh"


def test_async_update_members_on_entity_not_yet_added_does_not_touch_ha(mock_hass):
    entity = sensor.LinusDashboardNumericAggregateSensor(
        mock_hass,
        unique_id="linus_dashboard_temperature_area_salon",
        translation_key=None,
        translation_placeholders=None,
        device_info={},
        device_class="temperature",
        mode="average",
        member_entity_ids=["sensor.a"],
    )
    # Not added to a platform: no subscription, no state write, no error.
    asyncio.run(entity.async_update_members(["sensor.b"], "sum", "W", "sensor.off"))
    assert _members(entity) == ["sensor.b"]
    assert entity._mode == "sum"
    assert entity._attr_native_unit_of_measurement == "W"
    assert entity._official_entity_id == "sensor.off"
    assert entity._unsub_state_changed is None

    # Backward compatible call: members only leaves the rest untouched.
    asyncio.run(entity.async_update_members(["sensor.c"]))
    assert _members(entity) == ["sensor.c"]
    assert entity._mode == "sum"
    assert entity._official_entity_id == "sensor.off"
