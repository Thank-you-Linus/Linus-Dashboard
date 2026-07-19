"""
Unit tests for the pure aggregation helpers in aggregate.py.

No hass/mocking needed — every function here takes plain dicts/lists and
returns a plain value.
"""

from custom_components.linus_dashboard.aggregate import (
    compute_active_count,
    compute_active_entity_ids,
    compute_color,
    compute_icon,
    compute_numeric_aggregate,
    resolve_numeric_aggregation_mode,
)


def test_compute_active_count_light():
    states = {"light.a": "on", "light.b": "off", "light.c": "on"}
    assert compute_active_count(states, "light") == 2


def test_compute_active_count_media_player_multiple_active_states():
    states = {
        "media_player.a": "playing",
        "media_player.b": "paused",
        "media_player.c": "off",
    }
    assert compute_active_count(states, "media_player") == 2


def test_compute_active_entity_ids_returns_only_active():
    states = {"switch.a": "on", "switch.b": "off"}
    assert compute_active_entity_ids(states, "switch") == ["switch.a"]


def test_compute_icon_generic_domain_on_vs_off():
    assert compute_icon("light", 1) == "mdi:lightbulb-on"
    assert compute_icon("light", 0) == "mdi:lightbulb-off"


def test_compute_icon_binary_sensor_uses_device_class_pair():
    assert compute_icon("binary_sensor", 1, "motion") == "mdi:motion-sensor"
    assert compute_icon("binary_sensor", 0, "motion") == "mdi:motion-sensor-off"


def test_compute_icon_binary_sensor_unknown_device_class_falls_back_to_generic():
    icon = compute_icon("binary_sensor", 1, "some_future_device_class")
    assert icon == "mdi:checkbox-marked-circle"


def test_compute_color_picks_first_matching_active_state():
    states = {"climate.a": "heat"}
    assert compute_color("climate", None, states) == "deep-orange"


def test_compute_color_defaults_to_grey_when_nothing_active():
    states = {"light.a": "off"}
    assert compute_color("light", None, states) == "grey"


def test_resolve_numeric_aggregation_mode_battery_forces_min_even_with_measurement_state_class():
    # This is the exact bug this session fixed elsewhere: battery must never
    # average (20% + 100% -> 60% would hide the depleted one), regardless of
    # its state_class being "measurement" like any other averaged sensor.
    assert resolve_numeric_aggregation_mode("battery", "measurement") == "min"


def test_resolve_numeric_aggregation_mode_total_increasing_sums():
    assert resolve_numeric_aggregation_mode("energy", "total_increasing") == "sum"


def test_resolve_numeric_aggregation_mode_measurement_averages():
    assert resolve_numeric_aggregation_mode("temperature", "measurement") == "average"


def test_resolve_numeric_aggregation_mode_unknown_state_class_defaults_to_average():
    assert resolve_numeric_aggregation_mode("illuminance", None) == "average"


def test_compute_numeric_aggregate_sum():
    assert compute_numeric_aggregate([1.0, 2.0, 3.0], "sum") == 6.0


def test_compute_numeric_aggregate_min():
    assert compute_numeric_aggregate([80.0, 20.0, 50.0], "min") == 20.0


def test_compute_numeric_aggregate_average():
    assert compute_numeric_aggregate([10.0, 20.0], "average") == 15.0


def test_compute_numeric_aggregate_empty_list_returns_none():
    assert compute_numeric_aggregate([], "sum") is None
