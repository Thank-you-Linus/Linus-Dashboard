"""
Unit tests for the pure aggregation helpers in aggregate.py.

Most functions here take plain dicts/lists and need no mocking. compute_icon
is the exception — it reads HA's own icon_translations data from
hass.data[DOMAIN]["icons"] (populated at integration setup via
homeassistant.helpers.icon.async_get_icons) rather than a hardcoded table,
so its tests populate that cache with the same shape HA core's real
icons.json files use.
"""

from custom_components.linus_dashboard.aggregate import (
    compute_active_count,
    compute_active_entity_ids,
    compute_color,
    compute_icon,
    compute_numeric_aggregate,
    resolve_numeric_aggregation_mode,
)
from custom_components.linus_dashboard.const import DOMAIN


def set_icon_cache(hass, icons: dict) -> None:
    """icons: {domain: {device_class_or_'_': {"default": ..., "state": {...}}}}."""
    hass.data[DOMAIN] = {"icons": icons}


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


def test_compute_icon_generic_domain_on_vs_off(mock_hass):
    # Shape taken directly from HA core's light/icons.json entity_component._.
    set_icon_cache(
        mock_hass,
        {
            "light": {
                "_": {"default": "mdi:lightbulb", "state": {"off": "mdi:lightbulb-off"}}
            }
        },
    )
    assert compute_icon(mock_hass, "light", {"light.a": "on"}) == "mdi:lightbulb"
    assert compute_icon(mock_hass, "light", {"light.a": "off"}) == "mdi:lightbulb-off"


def test_compute_icon_binary_sensor_uses_device_class_pair(mock_hass):
    # Shape taken directly from HA core's binary_sensor/icons.json.
    set_icon_cache(
        mock_hass,
        {
            "binary_sensor": {
                "motion": {
                    "default": "mdi:motion-sensor-off",
                    "state": {"on": "mdi:motion-sensor"},
                }
            }
        },
    )
    assert (
        compute_icon(mock_hass, "binary_sensor", {"binary_sensor.a": "on"}, "motion")
        == "mdi:motion-sensor"
    )
    assert (
        compute_icon(mock_hass, "binary_sensor", {"binary_sensor.a": "off"}, "motion")
        == "mdi:motion-sensor-off"
    )


def test_compute_icon_binary_sensor_unknown_device_class_falls_back_to_generic(
    mock_hass,
):
    set_icon_cache(
        mock_hass,
        {
            "binary_sensor": {
                "_": {
                    "default": "mdi:radiobox-blank",
                    "state": {"on": "mdi:checkbox-marked-circle"},
                }
            }
        },
    )
    icon = compute_icon(
        mock_hass,
        "binary_sensor",
        {"binary_sensor.a": "on"},
        "some_future_device_class",
    )
    assert icon == "mdi:checkbox-marked-circle"


def test_compute_icon_cover_uses_device_class_specific_icon_not_generic_opening(
    mock_hass,
):
    # The exact bug reported live: cover.gate/garage always showed the
    # generic "Opening" icon instead of their own — shape taken directly
    # from HA core's cover/icons.json (note: cover has no explicit "open"
    # state key at all; "default" covers it).
    set_icon_cache(
        mock_hass,
        {
            "cover": {
                "_": {
                    "default": "mdi:window-open",
                    "state": {"closed": "mdi:window-closed"},
                },
                "gate": {
                    "default": "mdi:gate-open",
                    "state": {
                        "closed": "mdi:gate",
                        "closing": "mdi:arrow-right",
                        "opening": "mdi:arrow-right",
                    },
                },
            }
        },
    )
    assert (
        compute_icon(mock_hass, "cover", {"cover.a": "open"}, "gate") == "mdi:gate-open"
    )
    assert compute_icon(mock_hass, "cover", {"cover.a": "closed"}, "gate") == "mdi:gate"
    # No device_class given still falls back to the generic cover icon.
    assert compute_icon(mock_hass, "cover", {"cover.a": "open"}) == "mdi:window-open"


def test_compute_icon_media_player_prefers_specific_state_icon_over_default(mock_hass):
    set_icon_cache(
        mock_hass,
        {
            "media_player": {
                "tv": {
                    "default": "mdi:television",
                    "state": {
                        "off": "mdi:television-off",
                        "playing": "mdi:television-play",
                    },
                }
            }
        },
    )
    # "playing" has its own icon distinct from the generic active default.
    assert (
        compute_icon(mock_hass, "media_player", {"media_player.a": "playing"}, "tv")
        == "mdi:television-play"
    )
    assert (
        compute_icon(mock_hass, "media_player", {"media_player.a": "off"}, "tv")
        == "mdi:television-off"
    )


def test_compute_icon_no_matching_state_falls_back_to_default(mock_hass):
    set_icon_cache(
        mock_hass, {"light": {"_": {"default": "mdi:lightbulb", "state": {}}}}
    )
    assert compute_icon(mock_hass, "light", {}) == "mdi:lightbulb"


def test_compute_icon_missing_domain_in_cache_falls_back_to_generic_help_icon(
    mock_hass,
):
    set_icon_cache(mock_hass, {})
    assert compute_icon(mock_hass, "vacuum", {"vacuum.a": "on"}) == "mdi:help-circle"


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
