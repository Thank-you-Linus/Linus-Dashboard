"""
Regression tests for binary_sensor.py's composite PresenceGroup.

PresenceGroup used to build its attribute dict by hand, duplicating
entity_group.compute_group_attributes with a hardcoded ("on", "playing")
active-state set — so it did not inherit the leaf-level count fix and showed
"rooms with presence" instead of "sensors reporting presence" at floor and
global scope. Routing it through the shared function must keep its two
distinctive behaviours intact:

- a *playing* media_player still marks presence (its active-state set is
  wider than DOMAIN_ACTIVE_STATES["binary_sensor"] == ["on"]);
- a *paused* one still does not (it is narrower than
  DOMAIN_ACTIVE_STATES["media_player"], which includes "paused").

Constructed directly and driven through _recompute(), bypassing
async_added_to_hass — same pattern as test_device_class_groups.py.
"""

from custom_components.linus_dashboard.binary_sensor import PresenceGroup
from custom_components.linus_dashboard.const import DOMAIN

PRESENCE_ICONS = {
    "binary_sensor": {
        "occupancy": {"default": "mdi:home", "state": {"off": "mdi:home-outline"}}
    }
}


def make_group(mock_hass, member_entity_ids, breakdown=None):
    """Build an area/floor/global presence group with no registry plumbing."""
    mock_hass.data[DOMAIN] = {"icons": PRESENCE_ICONS}
    return PresenceGroup(
        mock_hass,
        unique_id="test_presence",
        translation_key="presence_detection",
        translation_placeholders=None,
        device_info={},
        member_entity_ids=member_entity_ids,
        breakdown=breakdown,
    )


def test_playing_media_player_still_marks_presence(mock_hass, fake_states):
    fake_states.set("binary_sensor.motion", "off")
    fake_states.set("media_player.tv", "playing")
    group = make_group(mock_hass, ["binary_sensor.motion", "media_player.tv"])

    group._recompute()

    assert group.is_on is True
    attrs = group.extra_state_attributes
    assert attrs["active_entity_ids"] == ["media_player.tv"]
    assert attrs["active_count"] == 1


def test_paused_media_player_does_not_mark_presence(mock_hass, fake_states):
    fake_states.set("binary_sensor.motion", "off")
    fake_states.set("media_player.tv", "paused")
    group = make_group(mock_hass, ["binary_sensor.motion", "media_player.tv"])

    group._recompute()

    assert group.is_on is False
    assert group.extra_state_attributes["active_count"] == 0


def test_floor_presence_group_counts_sensors_not_rooms(mock_hass, fake_states):
    # Two rooms, three triggered sensors across them: the chip must read 3.
    fake_states.set(
        "binary_sensor.presence_area_salon",
        "on",
        {
            "entity_id": ["binary_sensor.salon_motion", "media_player.salon_tv"],
            "total": 2,
            "active_entity_ids": [
                "binary_sensor.salon_motion",
                "media_player.salon_tv",
            ],
            "active_count": 2,
        },
    )
    fake_states.set(
        "binary_sensor.presence_area_cuisine",
        "on",
        {
            "entity_id": ["binary_sensor.cuisine_motion"],
            "total": 1,
            "active_entity_ids": ["binary_sensor.cuisine_motion"],
            "active_count": 1,
        },
    )
    group = make_group(
        mock_hass,
        ["binary_sensor.presence_area_salon", "binary_sensor.presence_area_cuisine"],
    )

    group._recompute()

    attrs = group.extra_state_attributes
    assert attrs["active_count"] == 3
    assert attrs["active_entity_ids"] == [
        "binary_sensor.salon_motion",
        "media_player.salon_tv",
        "binary_sensor.cuisine_motion",
    ]
    assert attrs["total"] == 3
    assert group.is_on is True


def test_area_breakdown_attributes_are_preserved(mock_hass, fake_states):
    fake_states.set("binary_sensor.motion", "on")
    fake_states.set("media_player.tv", "off")
    group = make_group(
        mock_hass,
        ["binary_sensor.motion", "media_player.tv"],
        breakdown={"motion": ["binary_sensor.motion"], "media": ["media_player.tv"]},
    )

    group._recompute()

    attrs = group.extra_state_attributes
    assert attrs["motion_entity_ids"] == ["binary_sensor.motion"]
    assert attrs["media_entity_ids"] == ["media_player.tv"]
    assert attrs["active_count"] == 1
    assert attrs["entity_id"] == ["binary_sensor.motion", "media_player.tv"]
