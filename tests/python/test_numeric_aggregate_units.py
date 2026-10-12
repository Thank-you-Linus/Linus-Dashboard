"""
Regression tests for TK-157 (Linus-Dashboard#198): numeric aggregates averaged
members reporting different units (V and mV in one voltage aggregate) and
labelled the result with the first member's unit. They now convert every
member to one reference unit per device_class, and leave out (and report) a
member that cannot be converted.

Registry/platform simulation fixtures are shared with test_numeric_sensors.py
(see its docstring and conftest.py for why there is no full HA harness).
"""

from __future__ import annotations

import itertools

import pytest

from custom_components.linus_dashboard import sensor
from custom_components.linus_dashboard.aggregate import (
    convert_member_value,
    resolve_reference_unit,
)

from .conftest import FakeEntityRegistry, _setup

# ---------------------------------------------------------------------------
# Pure helpers
# ---------------------------------------------------------------------------


def test_reference_unit_is_the_most_frequent_valid_unit():
    units = ["V"] * 4 + ["mV"] * 5
    assert resolve_reference_unit("voltage", units) == "mV"


def test_reference_unit_ignores_units_the_converter_does_not_know():
    # "foo" is the most frequent but is not a voltage unit: it must not win.
    assert resolve_reference_unit("voltage", ["foo", "foo", "foo", "V"]) == "V"
    assert resolve_reference_unit("voltage", [None, "%", "foo"]) is None


def test_reference_unit_tie_is_alphabetical_whatever_the_order():
    units = ["kW", "W", "kW", "W"]
    for perm in itertools.permutations(units):
        assert resolve_reference_unit("power", perm) == "W"


def test_reference_unit_without_converter_takes_any_non_empty_unit():
    assert resolve_reference_unit("battery", ["%", None, "%", "V"]) == "%"
    assert resolve_reference_unit("battery", [None, None]) is None


@pytest.mark.parametrize(
    ("device_class", "value", "from_unit", "to_unit", "expected"),
    [
        ("voltage", 3000.0, "mV", "V", 3.0),
        ("voltage", 234.0, "V", "V", 234.0),
        ("power", 2.0, "kW", "W", 2000.0),
        ("energy", 1.5, "kWh", "Wh", 1500.0),
        ("temperature", 68.0, "°F", "°C", 20.0),
        # Same unit passes even when no converter exists for the class.
        ("humidity", 40.0, "%", "%", 40.0),
        ("battery", 80.0, None, None, 80.0),
    ],
)
def test_convert_member_value_converts(
    device_class, value, from_unit, to_unit, expected
):
    assert convert_member_value(
        device_class, value, from_unit, to_unit
    ) == pytest.approx(expected)


@pytest.mark.parametrize(
    ("device_class", "from_unit", "to_unit"),
    [
        ("voltage", "%", "V"),  # other quantity
        ("voltage", None, "V"),  # unit missing
        ("voltage", "foo", "V"),  # unknown unit
        ("battery", "V", "%"),  # no converter, different unit
        ("humidity", None, "%"),
    ],
)
def test_convert_member_value_unconvertible_is_none(device_class, from_unit, to_unit):
    assert convert_member_value(device_class, 10.0, from_unit, to_unit) is None


# ---------------------------------------------------------------------------
# Sensor entities
# ---------------------------------------------------------------------------


def _add_member(
    entity_reg: FakeEntityRegistry,
    fake_states,
    entity_id: str,
    value: str,
    unit: str | None,
    *,
    device_class: str,
    area_id: str = "salon",
    state_class: str | None = None,
) -> None:
    attributes: dict = {"device_class": device_class}
    if unit is not None:
        attributes["unit_of_measurement"] = unit
    if state_class is not None:
        attributes["state_class"] = state_class
    entity_reg.add(
        entity_id,
        device_class=device_class,
        area_id=area_id,
        unit_of_measurement=unit,
        capabilities={"state_class": state_class} if state_class else None,
    )
    fake_states.set(entity_id, value, attributes)


def _publish(fake_states, entity: sensor.LinusDashboardNumericAggregateSensor):
    """Write the aggregate's computed state like HA would (native unit)."""
    fake_states.set(
        entity.entity_id,
        str(entity._attr_native_value),
        {"unit_of_measurement": entity._attr_native_unit_of_measurement},
    )


def _garage(entity_reg, fake_states):
    for i, volts in enumerate((232, 234, 235, 236)):
        _add_member(
            entity_reg,
            fake_states,
            f"sensor.plug_{i}_voltage",
            str(volts),
            "V",
            device_class="voltage",
        )
    for i, millivolts in enumerate((3075, 3045, 3025, 3015, 2906)):
        _add_member(
            entity_reg,
            fake_states,
            f"sensor.battery_{i}_voltage",
            str(millivolts),
            "mV",
            device_class="voltage",
        )


def test_garage_mixed_v_and_mv_gives_one_true_unit(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    _garage(entity_reg, fake_states)
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_voltage_area_salon"]
    area._update_state()

    unit = area._attr_native_unit_of_measurement
    assert unit == "mV"  # 5 mV members beat 4 V members
    expected_mv = (232 + 234 + 235 + 236) * 1000 + 3075 + 3045 + 3025 + 3015 + 2906
    assert area._attr_native_value == pytest.approx(round(expected_mv / 9, 1))
    assert area._attr_native_value == pytest.approx(
        round(1000 * 105.7, -2), abs=100
    )  # ~105.7 V expressed in mV, no longer 1778.1
    assert "excluded_entity_ids" not in area._attr_extra_state_attributes
    assert area._attr_extra_state_attributes["mode"] == "average"


def test_floor_and_global_follow_the_area_unit(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    _garage(entity_reg, fake_states)
    # Second room on the same floor, one mains plug in V: 5 V vs 5 mV in the
    # house is a tie, which goes to the alphabetically first unit ("V").
    _add_member(
        entity_reg,
        fake_states,
        "sensor.chambre_plug_voltage",
        "240",
        "V",
        device_class="voltage",
        area_id="chambre",
    )
    _setup(mock_hass, mock_config_entry, platform)
    salon = sensor._NUMERIC_SENSORS["linus_dashboard_voltage_area_salon"]
    chambre = sensor._NUMERIC_SENSORS["linus_dashboard_voltage_area_chambre"]
    floor = sensor._NUMERIC_SENSORS["linus_dashboard_voltage_floor_ground"]
    glob = sensor._NUMERIC_SENSORS["linus_dashboard_voltage_global"]
    for area in (salon, chambre):
        area._update_state()
    # Same unit at every level, whatever each room holds.
    assert {
        e._attr_native_unit_of_measurement for e in (salon, chambre, floor, glob)
    } == {"V"}
    assert salon._attr_native_value == pytest.approx(105.8, abs=0.05)  # not 1778.1
    assert chambre._attr_native_value == pytest.approx(240.0)

    # HA may display an aggregate in another unit than its native one: the
    # floor must convert it back instead of averaging 105667 with 240.
    fake_states.set(
        salon.entity_id,
        str(round(salon._attr_native_value * 1000, 1)),
        {"unit_of_measurement": "mV"},
    )
    _publish(fake_states, chambre)
    floor._update_state()
    assert floor._attr_native_value == pytest.approx((105.8 + 240.0) / 2, abs=0.1)

    _publish(fake_states, floor)
    glob._update_state()
    assert glob._attr_native_value == pytest.approx(
        floor._attr_native_value
    )  # not 2788.8


def test_power_mixed_w_and_kw_averages_after_conversion(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    _add_member(
        entity_reg, fake_states, "sensor.a_power", "1500", "W", device_class="power"
    )
    _add_member(
        entity_reg, fake_states, "sensor.b_power", "500", "W", device_class="power"
    )
    _add_member(
        entity_reg, fake_states, "sensor.c_power", "2", "kW", device_class="power"
    )
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_power_area_salon"]
    area._update_state()
    assert area._attr_native_unit_of_measurement == "W"
    assert area._attr_native_value == pytest.approx((1500 + 500 + 2000) / 3, abs=0.1)


def test_energy_mixed_wh_and_kwh_sums_after_conversion(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    for entity_id, value, unit in (
        ("sensor.a_energy", "500", "Wh"),
        ("sensor.b_energy", "1500", "Wh"),
        ("sensor.c_energy", "1.5", "kWh"),
    ):
        _add_member(
            entity_reg,
            fake_states,
            entity_id,
            value,
            unit,
            device_class="energy",
            state_class="total_increasing",
        )
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_energy_area_salon"]
    area._update_state()
    assert area._mode == "sum"
    assert area._attr_native_unit_of_measurement == "Wh"
    assert area._attr_native_value == pytest.approx(500 + 1500 + 1500)


def test_temperature_mixed_c_and_f_averages_after_conversion(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    _add_member(
        entity_reg, fake_states, "sensor.a_temp", "20", "°C", device_class="temperature"
    )
    _add_member(
        entity_reg, fake_states, "sensor.b_temp", "22", "°C", device_class="temperature"
    )
    _add_member(
        entity_reg, fake_states, "sensor.c_temp", "68", "°F", device_class="temperature"
    )
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_temperature_area_salon"]
    area._update_state()
    assert area._attr_native_unit_of_measurement == "°C"
    assert area._attr_native_value == pytest.approx(round((20 + 22 + 20) / 3, 1))


def test_unconvertible_members_are_left_out_and_listed(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    _add_member(
        entity_reg, fake_states, "sensor.a_v", "230", "V", device_class="voltage"
    )
    _add_member(
        entity_reg, fake_states, "sensor.b_v", "240", "V", device_class="voltage"
    )
    _add_member(
        entity_reg, fake_states, "sensor.pct_v", "55", "%", device_class="voltage"
    )
    _add_member(
        entity_reg, fake_states, "sensor.none_v", "999", None, device_class="voltage"
    )
    _add_member(
        entity_reg, fake_states, "sensor.foo_v", "999", "foo", device_class="voltage"
    )
    # Offline members are skipped as before, not reported as excluded.
    _add_member(
        entity_reg, fake_states, "sensor.off_v", "unknown", "V", device_class="voltage"
    )
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_voltage_area_salon"]
    area._update_state()
    assert area._attr_native_unit_of_measurement == "V"
    assert area._attr_native_value == pytest.approx(235.0)
    assert sorted(area._attr_extra_state_attributes["excluded_entity_ids"]) == [
        "sensor.foo_v",
        "sensor.none_v",
        "sensor.pct_v",
    ]


def test_battery_keeps_percent_and_leaves_other_units_out(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    _add_member(
        entity_reg, fake_states, "sensor.a_bat", "80", "%", device_class="battery"
    )
    _add_member(
        entity_reg, fake_states, "sensor.b_bat", "35", "%", device_class="battery"
    )
    _add_member(
        entity_reg, fake_states, "sensor.c_bat", "3", "V", device_class="battery"
    )
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_battery_area_salon"]
    area._update_state()
    assert area._mode == "min"
    assert area._attr_native_unit_of_measurement == "%"
    assert area._attr_native_value == 35.0
    assert area._attr_extra_state_attributes["excluded_entity_ids"] == ["sensor.c_bat"]


def test_official_area_sensor_in_another_unit_is_converted(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform, monkeypatch
):
    _add_member(
        entity_reg, fake_states, "sensor.a_temp", "20", "°C", device_class="temperature"
    )
    _add_member(
        entity_reg, fake_states, "sensor.b_temp", "21", "°C", device_class="temperature"
    )
    _add_member(
        entity_reg,
        fake_states,
        "sensor.off_temp",
        "68",
        "°F",
        device_class="temperature",
    )
    _setup(mock_hass, mock_config_entry, platform)
    area = sensor._NUMERIC_SENSORS["linus_dashboard_temperature_area_salon"]
    area._official_entity_id = "sensor.off_temp"
    area._update_state()
    assert area._attr_native_value == pytest.approx(20.0)
    assert area._attr_extra_state_attributes["source"] == (
        "area_registry_configured_sensor"
    )


def test_identity_is_unchanged_and_without_duplicates(
    entity_reg, mock_hass, mock_config_entry, fake_states, platform
):
    _garage(entity_reg, fake_states)
    _setup(mock_hass, mock_config_entry, platform)
    added = [e for batch in platform.added for e in batch]
    unique_ids = [e.unique_id for e in added]
    assert sorted(unique_ids) == [
        "linus_dashboard_voltage_area_salon",
        "linus_dashboard_voltage_floor_ground",
        "linus_dashboard_voltage_global",
    ]
    assert len(set(unique_ids)) == len(unique_ids)
    assert {e.entity_id for e in added} == {f"sensor.{uid}" for uid in unique_ids}
