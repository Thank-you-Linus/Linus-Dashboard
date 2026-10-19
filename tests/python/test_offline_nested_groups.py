"""
Regression tests for fully-offline nested groups (TK-188, #216).

When every member of an area/floor group is unavailable, HA core's group
classes set `_attr_available = False`, and HA core then writes NO attributes
for that entity (helpers/entity.py, `__async_calculate_state`: attributes are
merged only `if available`). The parent group no longer saw
`active_entity_ids` on it, treated the sub-group as a leaf, counted it as one
unit and listed the GROUP id in `unavailable_entity_ids`.

These tests never hand-build a sub-group's attributes (no `set_sub_group`):
every tier is a real group entity, and `publish()` writes what HA itself would
write — `_async_calculate_state()`, HA's own state/attribute computation.
"""

from __future__ import annotations

import inspect
from unittest.mock import MagicMock

from homeassistant.helpers.entity import Entity

from custom_components.linus_dashboard.binary_sensor import (
    BinarySensorDeviceClassGroup,
    PresenceGroup,
)
from custom_components.linus_dashboard.climate import ClimateGroup
from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.light import LightGroup

ICONS = {
    "binary_sensor": {
        "motion": {"default": "mdi:motion-sensor", "state": {"off": "mdi:motion"}},
        "occupancy": {"default": "mdi:home", "state": {"off": "mdi:home-outline"}},
    },
    "light": {"_": {"default": "mdi:lightbulb", "state": {"off": "mdi:lightbulb-off"}}},
    "climate": {"_": {"default": "mdi:thermostat"}},
}

AREA_MOTION = "binary_sensor.linus_dashboard_motion_area_salon"
FLOOR_MOTION = "binary_sensor.linus_dashboard_motion_floor_ground"
GLOBAL_MOTION = "binary_sensor.linus_dashboard_motion_global"
SENSORS = ["binary_sensor.salon_motion_1", "binary_sensor.salon_motion_2"]

AREA_LIGHT = "light.linus_dashboard_all_lights_area_salon"
FLOOR_LIGHT = "light.linus_dashboard_all_lights_floor_ground"
GLOBAL_LIGHT = "light.linus_dashboard_all_lights_global"
LAMPS = ["light.salon_1", "light.salon_2"]


def publish(fake_states, group):
    """Recompute a group and write exactly what HA itself would write."""
    group._recompute()
    calculated = group._async_calculate_state()
    fake_states.set(group.entity_id, calculated.state, dict(calculated.attributes))
    return fake_states.get(group.entity_id)


def motion_group(mock_hass, unique_id, members):
    return BinarySensorDeviceClassGroup(
        mock_hass,
        unique_id=unique_id,
        translation_key=None,
        translation_placeholders=None,
        device_info={},
        member_entity_ids=members,
        device_class="motion",
    )


def light_group(mock_hass, unique_id, members):
    return LightGroup(mock_hass, unique_id, None, None, {}, members)


def build_motion_chain(mock_hass):
    mock_hass.data[DOMAIN] = {"icons": ICONS}
    area = motion_group(mock_hass, "linus_dashboard_motion_area_salon", SENSORS)
    floor = motion_group(
        mock_hass, "linus_dashboard_motion_floor_ground", [AREA_MOTION]
    )
    glob = motion_group(mock_hass, "linus_dashboard_motion_global", [FLOOR_MOTION])
    return area, floor, glob


def build_light_chain(mock_hass):
    mock_hass.data[DOMAIN] = {"icons": ICONS}
    area = light_group(mock_hass, "linus_dashboard_all_lights_area_salon", LAMPS)
    floor = light_group(
        mock_hass, "linus_dashboard_all_lights_floor_ground", [AREA_LIGHT]
    )
    glob = light_group(mock_hass, "linus_dashboard_all_lights_global", [FLOOR_LIGHT])
    return area, floor, glob


def assert_offline_chain(fake_states, area, floor, glob, leaves):
    area_state = publish(fake_states, area)
    floor_state = publish(fake_states, floor)
    global_state = publish(fake_states, glob)

    # Criterion 4: own state of a fully-offline group stays unavailable.
    assert area_state.state == "unavailable"
    assert floor_state.state == "unavailable"
    assert global_state.state == "unavailable"

    # Criterion 3: the area group still carries its members and their status.
    assert area_state.attributes["entity_id"] == leaves
    assert area_state.attributes["unavailable_entity_ids"] == leaves

    # Criteria 1, 2, 5: leaves cited at every level, never a group id, and
    # every leaf counted once.
    for state in (area_state, floor_state, global_state):
        assert state.attributes["unavailable_entity_ids"] == leaves
        assert state.attributes["unavailable_count"] == len(leaves)
        assert state.attributes["total"] == len(leaves)
        assert state.attributes["active_entity_ids"] == []


def test_fully_offline_motion_chain_cites_sensors_not_groups(mock_hass, fake_states):
    for sensor_id in SENSORS:
        fake_states.set(sensor_id, "unavailable")
    area, floor, glob = build_motion_chain(mock_hass)

    assert_offline_chain(fake_states, area, floor, glob, SENSORS)


def test_fully_offline_light_chain_cites_lamps_not_groups(mock_hass, fake_states):
    for lamp_id in LAMPS:
        fake_states.set(lamp_id, "unavailable")
    area, floor, glob = build_light_chain(mock_hass)

    assert_offline_chain(fake_states, area, floor, glob, LAMPS)


def test_leaf_back_online_restores_lists_and_counters(mock_hass, fake_states):
    # Criterion 6: no restart, no reload — just the next recompute.
    for sensor_id in SENSORS:
        fake_states.set(sensor_id, "unavailable")
    area, floor, glob = build_motion_chain(mock_hass)
    assert_offline_chain(fake_states, area, floor, glob, SENSORS)

    fake_states.set(SENSORS[0], "off")
    area_state = publish(fake_states, area)
    floor_state = publish(fake_states, floor)
    global_state = publish(fake_states, glob)

    for state in (area_state, floor_state, global_state):
        assert state.state == "off"
        assert state.attributes["unavailable_entity_ids"] == [SENSORS[1]]
        assert state.attributes["unavailable_count"] == 1
        assert state.attributes["total"] == 2

    fake_states.set(SENSORS[1], "on")
    for group in (area, floor, glob):
        state = publish(fake_states, group)
        assert state.state == "on"
        assert state.attributes["unavailable_entity_ids"] == []
        assert state.attributes["unavailable_count"] == 0
        assert state.attributes["active_entity_ids"] == [SENSORS[1]]
        assert state.attributes["total"] == 2


def test_offline_sub_groups_sum_without_double_counting(mock_hass, fake_states):
    # The tree is disjoint: total stays a plain sum over sub-groups, and the
    # unavailable list stays deduplicated by id.
    mock_hass.data[DOMAIN] = {"icons": ICONS}
    salon = ["binary_sensor.salon_motion_1", "binary_sensor.salon_motion_2"]
    chambre = ["binary_sensor.chambre_motion"]
    for sensor_id in (*salon, *chambre):
        fake_states.set(sensor_id, "unavailable")
    area_salon = motion_group(mock_hass, "linus_dashboard_motion_area_salon", salon)
    area_chambre = motion_group(
        mock_hass, "linus_dashboard_motion_area_chambre", chambre
    )
    floor = motion_group(
        mock_hass,
        "linus_dashboard_motion_floor_ground",
        [area_salon.entity_id, area_chambre.entity_id],
    )
    publish(fake_states, area_salon)
    publish(fake_states, area_chambre)

    floor_state = publish(fake_states, floor)

    assert floor_state.state == "unavailable"
    assert floor_state.attributes["total"] == 3
    assert floor_state.attributes["unavailable_entity_ids"] == [*salon, *chambre]
    assert floor_state.attributes["unavailable_count"] == 3


def test_restored_sub_group_is_pending_not_a_leaf(mock_hass, fake_states):
    # Startup order: HA restores the sub-group as `unavailable` with
    # `restored: true` (no active_entity_ids) before it is added and written.
    # The parent must not count it as a leaf nor list the group id.
    mock_hass.data[DOMAIN] = {"icons": ICONS}
    fake_states.set("binary_sensor.chambre_motion", "off")
    area_salon = motion_group(mock_hass, "linus_dashboard_motion_area_salon", SENSORS)
    area_chambre = motion_group(
        mock_hass,
        "linus_dashboard_motion_area_chambre",
        ["binary_sensor.chambre_motion"],
    )
    fake_states.set(area_salon.entity_id, "unavailable", {"restored": True})
    publish(fake_states, area_chambre)
    floor = motion_group(
        mock_hass,
        "linus_dashboard_motion_floor_ground",
        [area_salon.entity_id, area_chambre.entity_id],
    )

    floor_state = publish(fake_states, floor)

    assert area_salon.entity_id not in floor_state.attributes["unavailable_entity_ids"]
    assert floor_state.attributes["unavailable_entity_ids"] == []
    assert floor_state.attributes["total"] == 1


def test_not_yet_written_sub_group_is_pending(mock_hass, fake_states):
    # Same startup race, sub-group not even restored yet (no state at all).
    mock_hass.data[DOMAIN] = {"icons": ICONS}
    area_salon = motion_group(mock_hass, "linus_dashboard_motion_area_salon", SENSORS)
    floor = motion_group(
        mock_hass, "linus_dashboard_motion_floor_ground", [area_salon.entity_id]
    )

    floor_state = publish(fake_states, floor)

    assert floor_state.attributes["unavailable_entity_ids"] == []
    assert floor_state.attributes["total"] == 0


# ---------------------------------------------------------------------------
# Non-regression: groups whose own availability never comes from HA core, and
# groups with at least one available member, behave exactly as before.
# ---------------------------------------------------------------------------


def test_presence_group_with_offline_members_unchanged(mock_hass, fake_states):
    mock_hass.data[DOMAIN] = {"icons": ICONS}
    fake_states.set("binary_sensor.motion", "unavailable")
    fake_states.set("media_player.tv", "unavailable")
    group = PresenceGroup(
        mock_hass,
        unique_id="test_presence",
        translation_key=None,
        translation_placeholders=None,
        device_info={},
        member_entity_ids=["binary_sensor.motion", "media_player.tv"],
    )

    state = publish(fake_states, group)

    assert state.state == "off"
    assert state.attributes["unavailable_entity_ids"] == [
        "binary_sensor.motion",
        "media_player.tv",
    ]
    assert state.attributes["total"] == 2


def test_climate_group_with_offline_members_unchanged(mock_hass, fake_states):
    mock_hass.data[DOMAIN] = {"icons": ICONS}
    mock_hass.config = MagicMock()
    mock_hass.config.units.temperature_unit = "°C"
    fake_states.set("climate.salon", "unavailable")
    group = ClimateGroup(mock_hass, "test_climate", None, None, {}, ["climate.salon"])

    state = publish(fake_states, group)

    assert state.state == "off"
    assert state.attributes["unavailable_entity_ids"] == ["climate.salon"]
    assert state.attributes["total"] == 1


def test_partially_available_group_unchanged(mock_hass, fake_states):
    mock_hass.data[DOMAIN] = {"icons": ICONS}
    fake_states.set(LAMPS[0], "on")
    fake_states.set(LAMPS[1], "unavailable")
    area, floor, _glob = build_light_chain(mock_hass)

    area_state = publish(fake_states, area)
    floor_state = publish(fake_states, floor)

    for state in (area_state, floor_state):
        assert state.state == "on"
        assert state.attributes["active_entity_ids"] == [LAMPS[0]]
        assert state.attributes["unavailable_entity_ids"] == [LAMPS[1]]
        assert state.attributes["total"] == 2


# ---------------------------------------------------------------------------
# Version guard: the fix overrides Entity._stringify_state, a single-underscore
# HA method. If HA changes its signature or stops writing attributes through
# it, these fail loudly instead of the offline bug silently coming back.
# ---------------------------------------------------------------------------


def test_entity_stringify_state_signature_is_still_available_bool():
    params = inspect.signature(Entity._stringify_state).parameters
    assert list(params) == ["self", "available"]


def test_fully_offline_group_writes_unavailable_with_attributes(mock_hass, fake_states):
    mock_hass.data[DOMAIN] = {"icons": ICONS}
    for sensor_id in SENSORS:
        fake_states.set(sensor_id, "unavailable")
    group = motion_group(mock_hass, "linus_dashboard_motion_area_salon", SENSORS)
    group._recompute()

    calculated = group._async_calculate_state()

    assert calculated.state == "unavailable"
    assert calculated.attributes["entity_id"] == SENSORS
    assert calculated.attributes["active_entity_ids"] == []
    assert calculated.attributes["unavailable_entity_ids"] == SENSORS
