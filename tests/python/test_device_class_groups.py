"""
Regression tests for cover.py/media_player.py's device_class parametrization.

Direct coverage for this session's consolidation: CoverGroup/MediaPlayerGroup
now accept an optional device_class (None for the flat "all X" group, a real
device_class for a per-device_class group — binary_sensor.py's
BinarySensorDeviceClassGroup already worked this way; cover/media_player
didn't have a per-device_class group at all before this). Constructing
directly and calling _recompute() (bypassing async_added_to_hass, which
these don't need for state computation) matches the pattern already used
for LinusDashboardHealthSensor's tests.
"""

from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.cover import CoverGroup
from custom_components.linus_dashboard.media_player import MediaPlayerGroup


def test_cover_group_device_class_defaults_to_none_for_flat_group(mock_hass):
    group = CoverGroup(mock_hass, "test_all_covers", None, None, {}, ["cover.a"])
    assert group.device_class is None


def test_cover_group_sets_own_device_class_when_given(mock_hass, fake_states):
    mock_hass.data[DOMAIN] = {
        "icons": {
            "cover": {
                "gate": {
                    "default": "mdi:gate-open",
                    "state": {"closed": "mdi:gate"},
                }
            }
        },
        "names": {"component.cover.entity_component.gate.name": "Gate"},
    }
    fake_states.set("cover.portail", "closed")
    group = CoverGroup(
        mock_hass, "test_gate", None, None, {}, ["cover.portail"], "gate"
    )
    assert group.device_class == "gate"
    # Without this, this group and the flat "all covers" group in the same
    # area would show the exact same name — CoverEntity, unlike
    # BinarySensorEntity, doesn't auto-name after device_class. Checking
    # _attr_name directly rather than the resolved .name property, which
    # needs more of the real entity-platform lifecycle than this test sets up.
    assert group._attr_name == "Gate"

    group._recompute()

    # The exact bug this session found and fixed: a device_class-scoped
    # cover group must show its own device_class's icon, not the generic
    # cover icon (which this same test env's own icon cache never set here,
    # so a wrong lookup would show the FALLBACK_ICON, not mdi:gate).
    assert group.extra_state_attributes["icon"] == "mdi:gate"
    assert group.extra_state_attributes["entity_id"] == ["cover.portail"]


def test_media_player_group_device_class_defaults_to_none_for_flat_group(mock_hass):
    group = MediaPlayerGroup(
        mock_hass, "test_all_mp", None, None, {}, ["media_player.a"]
    )
    assert group.device_class is None


def test_media_player_group_sets_own_device_class_when_given(mock_hass, fake_states):
    mock_hass.data[DOMAIN] = {
        "icons": {
            "media_player": {
                "receiver": {
                    "default": "mdi:audio-video",
                    "state": {"off": "mdi:audio-video-off"},
                }
            }
        },
        "names": {"component.media_player.entity_component.receiver.name": "Receiver"},
    }
    fake_states.set("media_player.ampli_salon", "off")
    group = MediaPlayerGroup(
        mock_hass,
        "test_receiver",
        None,
        None,
        {},
        ["media_player.ampli_salon"],
        "receiver",
    )
    assert group.device_class == "receiver"
    assert group._attr_name == "Receiver"

    group._recompute()

    assert group.extra_state_attributes["icon"] == "mdi:audio-video-off"
    assert group.extra_state_attributes["entity_id"] == ["media_player.ampli_salon"]
