"""
Unit tests for configurable presence detection feature.

Tests the presence detection configuration system including:
- Config flow configuration (primary source)
- Cloud configuration (secondary source)
- Hardcoded defaults (fallback)
- Dynamic presence detection based on configuration
"""

from unittest.mock import MagicMock, PropertyMock

import pytest
from homeassistant.core import State
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from ..const import (
    CONF_PRESENCE_DETECTION_CONFIG,
)
from ..utils.area_manager import AreaManager


@pytest.fixture
def hass():
    """Mock Home Assistant instance."""
    hass_mock = MagicMock()
    hass_mock.states = MagicMock()

    # Mock entity states
    states = {
        "binary_sensor.motion": State("binary_sensor.motion", "on"),
        "binary_sensor.presence": State("binary_sensor.presence", "on"),
        "binary_sensor.occupancy": State("binary_sensor.occupancy", "on"),
        "media_player.tv": State("media_player.tv", "playing"),
    }
    hass_mock.states.get = MagicMock(
        side_effect=lambda entity_id: states.get(entity_id)
    )

    return hass_mock


@pytest.fixture
def area_registry_mock():
    """Mock area registry with test area."""
    registry = MagicMock(spec=ar.AreaRegistry)

    test_area = MagicMock()
    test_area.id = "test_area"
    test_area.name = "Test Area"

    registry.async_get_area = MagicMock(return_value=test_area)
    registry.async_list_areas = MagicMock(return_value=[test_area])

    return registry


def _create_mock_entity(entity_id, area_id, device_id, original_device_class):
    """Helper to create mock entity registry entry."""
    entity = MagicMock(spec=er.RegistryEntry)
    entity.entity_id = entity_id
    entity.domain = entity_id.split(".")[0]
    entity.area_id = area_id
    entity.device_id = device_id
    entity.original_device_class = original_device_class
    entity.device_class = original_device_class
    return entity


@pytest.fixture
def entity_registry_mock():
    """Mock entity registry with test entities."""
    registry = MagicMock(spec=er.EntityRegistry)

    entities = {
        "binary_sensor.motion": _create_mock_entity(
            "binary_sensor.motion", "test_area", None, "motion"
        ),
        "binary_sensor.presence": _create_mock_entity(
            "binary_sensor.presence", "test_area", None, "presence"
        ),
        "binary_sensor.occupancy": _create_mock_entity(
            "binary_sensor.occupancy", "test_area", None, "occupancy"
        ),
        "media_player.tv": _create_mock_entity(
            "media_player.tv", "test_area", None, None
        ),
    }

    type(registry).entities = PropertyMock(return_value=entities)
    registry.async_get = MagicMock(
        side_effect=lambda entity_id: entities.get(entity_id)
    )

    return registry


@pytest.fixture
def device_registry_mock():
    """Mock device registry."""
    registry = MagicMock(spec=dr.DeviceRegistry)
    registry.async_get = MagicMock(return_value=None)
    return registry


@pytest.fixture
def config_entry_mock():
    """Mock config entry with default options."""
    config_entry = MagicMock()
    config_entry.options = {}
    return config_entry


@pytest.fixture
def area_manager(
    hass,
    area_registry_mock,
    entity_registry_mock,
    device_registry_mock,
    config_entry_mock,
    monkeypatch,
):
    """Create AreaManager instance with mocked registries."""
    monkeypatch.setattr(
        "homeassistant.helpers.area_registry.async_get", lambda h: area_registry_mock
    )
    monkeypatch.setattr(
        "homeassistant.helpers.entity_registry.async_get",
        lambda h: entity_registry_mock,
    )
    monkeypatch.setattr(
        "homeassistant.helpers.device_registry.async_get",
        lambda h: device_registry_mock,
    )

    return AreaManager(hass, config_entry=config_entry_mock)


class TestPresenceDetectionConfiguration:
    """Test presence detection configuration priority order."""

    def test_default_config_all_enabled(self, area_manager):
        """Test that hardcoded defaults have all detection types enabled."""
        config = area_manager._get_presence_detection_config()

        assert config["motion"] is True
        assert config["presence"] is True
        assert config["occupancy"] is True
        assert config["media_playing"] is True

    def test_config_flow_overrides_defaults(self, area_manager, config_entry_mock):
        """Test that config flow values override hardcoded defaults."""
        # Set config flow options to only enable motion and media_playing
        config_entry_mock.options = {
            CONF_PRESENCE_DETECTION_CONFIG: ["motion", "media_playing"]
        }

        config = area_manager._get_presence_detection_config()

        assert config["motion"] is True
        assert config["presence"] is False
        assert config["occupancy"] is False
        assert config["media_playing"] is True

    def test_config_flow_single_option(self, area_manager, config_entry_mock):
        """Test that config flow can have just one option enabled."""
        # Set config flow options to only enable motion
        config_entry_mock.options = {CONF_PRESENCE_DETECTION_CONFIG: ["motion"]}

        config = area_manager._get_presence_detection_config()

        assert config["motion"] is True
        assert config["presence"] is False
        assert config["occupancy"] is False
        assert config["media_playing"] is False

    def test_config_flow_empty_list_disables_all(self, area_manager, config_entry_mock):
        """Test that empty config list disables all detection types."""
        # Note: In production, the UI enforces at least one selection
        # But we test the edge case here
        config_entry_mock.options = {CONF_PRESENCE_DETECTION_CONFIG: []}

        config = area_manager._get_presence_detection_config()

        assert config["motion"] is False
        assert config["presence"] is False
        assert config["occupancy"] is False
        assert config["media_playing"] is False


class TestDynamicPresenceDetection:
    """Test presence detection using dynamic configuration."""

    def test_presence_detected_with_motion_enabled(
        self, area_manager, config_entry_mock
    ):
        """Test that presence is detected when motion is enabled and active."""
        config_entry_mock.options = {CONF_PRESENCE_DETECTION_CONFIG: ["motion"]}

        entity_states = {
            "motion": "on",
            "presence": "off",
            "occupancy": "off",
            "media": "off",
        }

        assert area_manager._compute_presence_detected(entity_states) is True

    def test_presence_not_detected_with_motion_disabled(
        self, area_manager, config_entry_mock
    ):
        """Test that motion doesn't trigger detection when disabled."""
        config_entry_mock.options = {
            CONF_PRESENCE_DETECTION_CONFIG: ["presence"]  # Only presence enabled
        }

        entity_states = {
            "motion": "on",  # Motion active but disabled in config
            "presence": "off",
            "occupancy": "off",
            "media": "off",
        }

        assert area_manager._compute_presence_detected(entity_states) is False

    def test_presence_detected_with_media_playing(
        self, area_manager, config_entry_mock
    ):
        """Test that media playing triggers presence when enabled."""
        config_entry_mock.options = {CONF_PRESENCE_DETECTION_CONFIG: ["media_playing"]}

        entity_states = {
            "motion": "off",
            "presence": "off",
            "occupancy": "off",
            "media": "playing",
        }

        assert area_manager._compute_presence_detected(entity_states) is True

    def test_presence_detected_with_multiple_enabled(
        self, area_manager, config_entry_mock
    ):
        """Test that any enabled sensor type triggers presence."""
        config_entry_mock.options = {
            CONF_PRESENCE_DETECTION_CONFIG: ["motion", "presence"]
        }

        # Test motion trigger
        entity_states = {
            "motion": "on",
            "presence": "off",
            "occupancy": "off",
            "media": "off",
        }
        assert area_manager._compute_presence_detected(entity_states) is True

        # Test presence trigger
        entity_states = {
            "motion": "off",
            "presence": "on",
            "occupancy": "off",
            "media": "off",
        }
        assert area_manager._compute_presence_detected(entity_states) is True

    def test_no_presence_when_all_disabled(self, area_manager, config_entry_mock):
        """Test that no presence is detected when all types are disabled."""
        config_entry_mock.options = {CONF_PRESENCE_DETECTION_CONFIG: []}

        entity_states = {
            "motion": "on",
            "presence": "on",
            "occupancy": "on",
            "media": "playing",
        }

        # Even with all sensors active, presence should not be detected
        assert area_manager._compute_presence_detected(entity_states) is False

    def test_presence_detection_with_occupancy(self, area_manager, config_entry_mock):
        """Test occupancy sensor detection when enabled."""
        config_entry_mock.options = {CONF_PRESENCE_DETECTION_CONFIG: ["occupancy"]}

        entity_states = {
            "motion": "off",
            "presence": "off",
            "occupancy": "on",
            "media": "off",
        }

        assert area_manager._compute_presence_detected(entity_states) is True

    def test_media_on_state_triggers_presence(self, area_manager, config_entry_mock):
        """Test that media 'on' state also triggers presence."""
        config_entry_mock.options = {CONF_PRESENCE_DETECTION_CONFIG: ["media_playing"]}

        entity_states = {
            "motion": "off",
            "presence": "off",
            "occupancy": "off",
            "media": "on",  # "on" state should also work
        }

        assert area_manager._compute_presence_detected(entity_states) is True


class TestPresenceDetectionBackwardCompatibility:
    """Test that default behavior matches previous hardcoded implementation."""

    def test_default_behavior_unchanged(self, area_manager):
        """Test that default config provides same behavior as before."""
        # This test ensures backward compatibility
        # Default should be: all detection types enabled

        # Test 1: Motion triggers presence
        entity_states = {
            "motion": "on",
            "presence": "off",
            "occupancy": "off",
            "media": "off",
        }
        assert area_manager._compute_presence_detected(entity_states) is True

        # Test 2: Presence triggers presence
        entity_states = {
            "motion": "off",
            "presence": "on",
            "occupancy": "off",
            "media": "off",
        }
        assert area_manager._compute_presence_detected(entity_states) is True

        # Test 3: Occupancy triggers presence
        entity_states = {
            "motion": "off",
            "presence": "off",
            "occupancy": "on",
            "media": "off",
        }
        assert area_manager._compute_presence_detected(entity_states) is True

        # Test 4: Media playing triggers presence
        entity_states = {
            "motion": "off",
            "presence": "off",
            "occupancy": "off",
            "media": "playing",
        }
        assert area_manager._compute_presence_detected(entity_states) is True

        # Test 5: Media on triggers presence
        entity_states = {
            "motion": "off",
            "presence": "off",
            "occupancy": "off",
            "media": "on",
        }
        assert area_manager._compute_presence_detected(entity_states) is True

        # Test 6: No sensors active = no presence
        entity_states = {
            "motion": "off",
            "presence": "off",
            "occupancy": "off",
            "media": "off",
        }
        assert area_manager._compute_presence_detected(entity_states) is False
