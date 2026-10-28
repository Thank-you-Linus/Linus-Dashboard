"""
Unit tests for LinusDashboardAggregateSensor's unavailable-member attributes.

The binary_sensor aggregate sensor publishes `unavailable_entity_ids` /
`unavailable_count` like the group entities do: a tracked member absent from
HA, or in state unavailable/unknown, is listed (sorted). `total` and the
`active_*` attributes are unaffected.
"""

from custom_components.linus_dashboard.sensor import LinusDashboardAggregateSensor

MEMBERS = [
    "binary_sensor.window_on",
    "binary_sensor.door_unknown",
    "binary_sensor.ghost",
    "binary_sensor.contact_unavailable",
    "binary_sensor.motion_off",
]


def make_sensor(mock_hass, mock_config_entry, tracked_entity_ids):
    return LinusDashboardAggregateSensor(
        mock_hass, "binary_sensor", None, None, tracked_entity_ids, mock_config_entry
    )


def set_states(fake_states):
    fake_states.set("binary_sensor.window_on", "on")
    fake_states.set("binary_sensor.door_unknown", "unknown")
    fake_states.set("binary_sensor.contact_unavailable", "unavailable")
    fake_states.set("binary_sensor.motion_off", "off")
    # binary_sensor.ghost: no state at all in HA.


def test_absent_unavailable_and_unknown_members_are_listed_sorted(
    mock_hass, fake_states, mock_config_entry
):
    set_states(fake_states)
    sensor = make_sensor(mock_hass, mock_config_entry, MEMBERS)

    sensor._update_state()

    attrs = sensor._attr_extra_state_attributes
    assert attrs["unavailable_entity_ids"] == [
        "binary_sensor.contact_unavailable",
        "binary_sensor.door_unknown",
        "binary_sensor.ghost",
    ]
    assert attrs["unavailable_count"] == 3
    assert attrs["total"] == len(MEMBERS)
    assert attrs["active_entity_ids"] == ["binary_sensor.window_on"]
    assert attrs["active_count"] == 1
    assert sensor._attr_native_value == 1


def test_member_back_online_leaves_the_unavailable_list(
    mock_hass, fake_states, mock_config_entry
):
    set_states(fake_states)
    sensor = make_sensor(mock_hass, mock_config_entry, MEMBERS)
    sensor._update_state()

    fake_states.set("binary_sensor.ghost", "on")
    fake_states.set("binary_sensor.contact_unavailable", "off")
    sensor._update_state()

    attrs = sensor._attr_extra_state_attributes
    assert attrs["unavailable_entity_ids"] == ["binary_sensor.door_unknown"]
    assert attrs["unavailable_count"] == 1
    assert attrs["total"] == len(MEMBERS)
    assert sorted(attrs["active_entity_ids"]) == [
        "binary_sensor.ghost",
        "binary_sensor.window_on",
    ]
    assert attrs["active_count"] == 2


def test_all_members_available_publishes_empty_unavailable_list(
    mock_hass, fake_states, mock_config_entry
):
    fake_states.set("binary_sensor.a", "on")
    fake_states.set("binary_sensor.b", "off")
    sensor = make_sensor(
        mock_hass, mock_config_entry, ["binary_sensor.a", "binary_sensor.b"]
    )

    sensor._update_state()

    attrs = sensor._attr_extra_state_attributes
    assert attrs["unavailable_entity_ids"] == []
    assert attrs["unavailable_count"] == 0
    assert attrs["total"] == 2
