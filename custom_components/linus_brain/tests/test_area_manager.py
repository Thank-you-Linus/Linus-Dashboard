"""
Unit tests for AreaManager.

Tests the area management logic including:
- Entity discovery and grouping by area
- Presence detection capabilities
- Environmental state (illuminance, temperature, humidity, sun elevation)
- Area eligibility checks (tracking, light automation)
- Entity queries by area
"""

from unittest.mock import MagicMock, PropertyMock

import pytest
from homeassistant.core import State
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from ..utils.area_manager import AreaManager


@pytest.fixture
def hass():
    """Mock Home Assistant instance."""
    hass_mock = MagicMock()
    hass_mock.states = MagicMock()
    hass_mock.states.get = MagicMock(return_value=None)
    return hass_mock


@pytest.fixture
def area_registry_mock():
    """Mock area registry with test areas."""
    registry = MagicMock(spec=ar.AreaRegistry)

    living_room = MagicMock()
    living_room.id = "living_room"
    living_room.name = "Living Room"
    living_room.temperature_entity_id = None
    living_room.humidity_entity_id = None

    bedroom = MagicMock()
    bedroom.id = "bedroom"
    bedroom.name = "Bedroom"
    bedroom.temperature_entity_id = "sensor.bedroom_temperature"
    bedroom.humidity_entity_id = "sensor.bedroom_humidity"

    kitchen = MagicMock()
    kitchen.id = "kitchen"
    kitchen.name = "Kitchen"
    kitchen.temperature_entity_id = None
    kitchen.humidity_entity_id = None

    registry.async_get_area = MagicMock(
        side_effect=lambda area_id: {
            "living_room": living_room,
            "bedroom": bedroom,
            "kitchen": kitchen,
        }.get(area_id)
    )

    registry.async_list_areas = MagicMock(return_value=[living_room, bedroom, kitchen])

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
        "binary_sensor.living_room_motion": _create_mock_entity(
            "binary_sensor.living_room_motion", "living_room", None, "motion"
        ),
        "binary_sensor.living_room_presence": _create_mock_entity(
            "binary_sensor.living_room_presence", "living_room", None, "presence"
        ),
        "sensor.living_room_illuminance": _create_mock_entity(
            "sensor.living_room_illuminance", "living_room", None, "illuminance"
        ),
        "light.living_room": _create_mock_entity(
            "light.living_room", "living_room", None, None
        ),
        "media_player.living_room_tv": _create_mock_entity(
            "media_player.living_room_tv", "living_room", None, None
        ),
        "binary_sensor.bedroom_motion": _create_mock_entity(
            "binary_sensor.bedroom_motion", "bedroom", None, "motion"
        ),
        "sensor.bedroom_temperature": _create_mock_entity(
            "sensor.bedroom_temperature", "bedroom", None, "temperature"
        ),
        "sensor.bedroom_humidity": _create_mock_entity(
            "sensor.bedroom_humidity", "bedroom", None, "humidity"
        ),
        "light.bedroom": _create_mock_entity("light.bedroom", "bedroom", None, None),
        "sensor.kitchen_temperature": _create_mock_entity(
            "sensor.kitchen_temperature", "kitchen", None, "temperature"
        ),
        "light.kitchen": _create_mock_entity("light.kitchen", "kitchen", None, None),
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
def area_manager(
    hass, area_registry_mock, entity_registry_mock, device_registry_mock, monkeypatch
):
    """Create AreaManager instance with mocked registries."""
    # Clear module-level caches to prevent stale data between tests
    from ..utils import area_manager as am

    am._MONITORED_DOMAINS_CACHE = None
    am._PRESENCE_DETECTION_DOMAINS_CACHE = None

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

    return AreaManager(hass)


class TestAreaManagerEntityDiscovery:
    """Test entity discovery and grouping."""

    def test_get_monitored_entities_groups_by_area(self, area_manager):
        """Test that monitored entities are correctly grouped by area."""
        result = area_manager._get_monitored_entities()

        assert "living_room" in result
        assert "bedroom" in result

        living_room_entities = result["living_room"]
        assert "binary_sensor.living_room_motion" in living_room_entities
        assert "binary_sensor.living_room_presence" in living_room_entities
        assert "sensor.living_room_illuminance" in living_room_entities
        assert "media_player.living_room_tv" in living_room_entities

        bedroom_entities = result["bedroom"]
        assert "binary_sensor.bedroom_motion" in bedroom_entities

    def test_get_monitored_entities_excludes_lights(self, area_manager):
        """Test that light entities are not included in monitored entities."""
        result = area_manager._get_monitored_entities()

        living_room_entities = result["living_room"]
        assert "light.living_room" not in living_room_entities

        bedroom_entities = result["bedroom"]
        assert "light.bedroom" not in bedroom_entities

    def test_get_monitored_entities_filters_by_device_class(self, area_manager):
        """Test that only entities with correct device class are included."""
        result = area_manager._get_monitored_entities()

        living_room_entities = result["living_room"]

        assert "binary_sensor.living_room_motion" in living_room_entities
        assert "binary_sensor.living_room_presence" in living_room_entities


class TestAreaManagerPresenceDetection:
    """Test presence detection capabilities."""

    def test_has_presence_detection_returns_true_for_area_with_motion(
        self, area_manager
    ):
        """Test that area with motion sensor has presence detection."""
        assert area_manager.has_presence_detection("living_room") is True
        assert area_manager.has_presence_detection("bedroom") is True

    def test_has_presence_detection_returns_false_for_area_without_sensors(
        self, area_manager
    ):
        """Test that area without presence sensors returns False."""
        assert area_manager.has_presence_detection("kitchen") is False

    def test_get_area_presence_binary_returns_true_when_motion_active(
        self, area_manager, hass
    ):
        """Test binary presence detection with active motion sensor."""
        motion_state = State("binary_sensor.living_room_motion", "on")
        hass.states.get = MagicMock(return_value=motion_state)

        result = area_manager.get_area_presence_binary("living_room")
        assert result["presence_detected"] is True
        assert "binary_sensor.living_room_motion" in result["detection_reasons"]

    def test_get_area_presence_binary_returns_false_when_no_motion(
        self, area_manager, hass
    ):
        """Test binary presence detection with inactive sensors."""
        motion_state = State("binary_sensor.living_room_motion", "off")
        hass.states.get = MagicMock(return_value=motion_state)

        result = area_manager.get_area_presence_binary("living_room")
        assert result["presence_detected"] is False
        assert len(result["detection_reasons"]) == 0

    def test_get_area_presence_binary_checks_multiple_sensors(self, area_manager, hass):
        """Test that binary presence checks all presence sensors."""

        def get_state(entity_id):
            states = {
                "binary_sensor.living_room_motion": State(
                    "binary_sensor.living_room_motion", "off"
                ),
                "binary_sensor.living_room_presence": State(
                    "binary_sensor.living_room_presence", "on"
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_presence_binary("living_room")
        assert result["presence_detected"] is True
        assert "binary_sensor.living_room_presence" in result["detection_reasons"]


class TestAreaManagerEnvironmentalState:
    """Test environmental state readings."""

    def test_get_area_illuminance_returns_lux_value(self, area_manager, hass):
        """Test getting illuminance from area sensor."""
        lux_state = State(
            "sensor.living_room_illuminance",
            "50.5",
            attributes={"device_class": "illuminance"},
        )
        hass.states.get = MagicMock(return_value=lux_state)

        result = area_manager.get_area_illuminance("living_room")
        assert result == 50.5

    def test_get_area_illuminance_returns_none_when_no_sensor(self, area_manager, hass):
        """Test illuminance returns None when no sensor available."""
        hass.states.get = MagicMock(return_value=None)

        result = area_manager.get_area_illuminance("bedroom")
        assert result is None

    def test_get_area_illuminance_averages_multiple_sensors(
        self, area_manager, entity_registry_mock, hass
    ):
        """Test that illuminance averages values from multiple sensors."""
        entities = entity_registry_mock.entities.copy()
        entities["sensor.living_room_illuminance_2"] = _create_mock_entity(
            "sensor.living_room_illuminance_2", "living_room", None, "illuminance"
        )
        type(entity_registry_mock).entities = PropertyMock(return_value=entities)

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "50",
                    attributes={"device_class": "illuminance"},
                ),
                "sensor.living_room_illuminance_2": State(
                    "sensor.living_room_illuminance_2",
                    "100",
                    attributes={"device_class": "illuminance"},
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_illuminance("living_room")
        assert result == 75.0

    def test_get_sun_elevation_returns_degrees(self, area_manager, hass):
        """Test getting sun elevation angle."""
        sun_state = State("sun.sun", "above_horizon", attributes={"elevation": 45.5})
        hass.states.get = MagicMock(return_value=sun_state)

        result = area_manager.get_sun_elevation()
        assert result == 45.5

    def test_get_sun_elevation_returns_none_when_unavailable(self, area_manager, hass):
        """Test sun elevation returns None when sun entity unavailable."""
        hass.states.get = MagicMock(return_value=None)

        result = area_manager.get_sun_elevation()
        assert result is None

    def test_get_area_temperature_uses_configured_sensor(self, area_manager, hass):
        """Test that configured temperature sensor takes priority."""
        temp_state = State(
            "sensor.bedroom_temperature",
            "22.5",
            attributes={"device_class": "temperature"},
        )
        hass.states.get = MagicMock(return_value=temp_state)

        result = area_manager.get_area_temperature("bedroom")
        assert result == 22.5

    def test_get_area_temperature_averages_when_no_configured_sensor(
        self, area_manager, hass
    ):
        """Test that temperature returns None when area has no temperature sensors in MONITORED_DOMAINS."""
        result = area_manager.get_area_temperature("kitchen")
        assert result is None

    def test_get_area_humidity_uses_configured_sensor(self, area_manager, hass):
        """Test that configured humidity sensor takes priority."""
        humidity_state = State(
            "sensor.bedroom_humidity", "65.5", attributes={"device_class": "humidity"}
        )
        hass.states.get = MagicMock(return_value=humidity_state)

        result = area_manager.get_area_humidity("bedroom")
        assert result == 65.5

    def test_get_area_environmental_state_computes_is_dark(self, area_manager, hass):
        """Test that is_dark is True when illuminance < 20 or sun < 3."""

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "15",
                    attributes={"device_class": "illuminance"},
                ),
                "sun.sun": State(
                    "sun.sun", "below_horizon", attributes={"elevation": -10}
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_environmental_state("living_room")
        assert result["is_dark"] is True
        assert result["illuminance"] == 15.0
        assert result["sun_elevation"] == -10.0

    def test_get_area_environmental_state_uses_insights_dark_threshold(
        self, area_manager, hass
    ):
        """Test that is_dark uses AI-learned threshold from insights manager."""
        # Set up mock insights manager
        mock_insights = MagicMock()
        mock_insights.get_insight = MagicMock(
            return_value={"value": {"threshold": 30.0}}
        )
        area_manager._insights_manager = mock_insights

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "25",  # Between default (20) and custom (30)
                    attributes={"device_class": "illuminance"},
                ),
                "sun.sun": State(
                    "sun.sun", "above_horizon", attributes={"elevation": 15}
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_environmental_state(
            "living_room", instance_id="test_instance"
        )

        # With custom threshold of 30, lux=25 should be dark
        assert result["is_dark"] is True
        assert result["illuminance"] == 25.0

        # Verify insights manager was called
        mock_insights.get_insight.assert_called()

    def test_get_area_environmental_state_falls_back_to_defaults_when_no_insights(
        self, area_manager, hass
    ):
        """Test that default thresholds are used when insights return None."""
        # Set up mock insights manager that returns None
        mock_insights = MagicMock()
        mock_insights.get_insight = MagicMock(return_value=None)
        area_manager._insights_manager = mock_insights

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "15",  # Below default dark threshold (20)
                    attributes={"device_class": "illuminance"},
                ),
                "sun.sun": State(
                    "sun.sun", "above_horizon", attributes={"elevation": 5}
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_environmental_state(
            "living_room", instance_id="test_instance"
        )

        # Should use default threshold (20.0)
        assert result["is_dark"] is True
        assert result["illuminance"] == 15.0

    def test_get_area_environmental_state_works_without_insights_manager(
        self, area_manager, hass
    ):
        """Test that environmental state works without insights manager."""
        # No insights manager set
        area_manager._insights_manager = None

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "600",  # Above default bright threshold (500)
                    attributes={"device_class": "illuminance"},
                ),
                "sun.sun": State(
                    "sun.sun", "above_horizon", attributes={"elevation": 45}
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_environmental_state(
            "living_room", instance_id="test_instance"
        )

        # Should use default thresholds
        assert result["is_dark"] is False
        assert result["illuminance"] == 600.0

    def test_get_area_environmental_state_works_without_instance_id(
        self, area_manager, hass
    ):
        """Test that environmental state falls back to defaults without instance_id."""
        # Set up insights manager but don't provide instance_id
        mock_insights = MagicMock()
        area_manager._insights_manager = mock_insights

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "10",
                    attributes={"device_class": "illuminance"},
                ),
                "sun.sun": State(
                    "sun.sun", "below_horizon", attributes={"elevation": -5}
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        # Call without instance_id
        result = area_manager.get_area_environmental_state("living_room")

        # Should use default thresholds and NOT call insights manager
        assert result["is_dark"] is True
        mock_insights.get_insight.assert_not_called()


class TestAreaManagerAreaQueries:
    """Test area eligibility and query methods."""

    def test_get_activity_tracking_areas_returns_areas_with_presence(
        self, area_manager
    ):
        """Test getting areas with activity tracking capability."""
        result = area_manager.get_activity_tracking_areas()

        assert "living_room" in result
        assert result["living_room"] == "Living Room"
        assert "bedroom" in result
        assert result["bedroom"] == "Bedroom"
        assert "kitchen" not in result

    def test_get_light_automation_eligible_areas_requires_lights_and_presence(
        self, area_manager
    ):
        """Test that light automation requires both lights and presence detection."""
        result = area_manager.get_light_automation_eligible_areas()

        assert "living_room" in result
        assert "bedroom" in result
        assert "kitchen" not in result

    def test_get_all_areas_returns_all_monitored_areas(self, area_manager):
        """Test getting all areas with monitored entities."""
        result = area_manager.get_all_areas()

        assert "living_room" in result
        assert result["living_room"] == "Living Room"
        assert "bedroom" in result
        assert result["bedroom"] == "Bedroom"

    @pytest.mark.asyncio
    async def test_get_all_area_states_returns_list_of_area_data(
        self, area_manager, hass
    ):
        """Test getting state data for all areas."""

        def get_state(entity_id):
            states = {
                "binary_sensor.living_room_motion": State(
                    "binary_sensor.living_room_motion", "on"
                ),
                "binary_sensor.living_room_presence": State(
                    "binary_sensor.living_room_presence", "off"
                ),
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "50",
                    attributes={"device_class": "illuminance"},
                ),
                "media_player.living_room_tv": State(
                    "media_player.living_room_tv", "playing"
                ),
                "binary_sensor.bedroom_motion": State(
                    "binary_sensor.bedroom_motion", "off"
                ),
                "sensor.bedroom_temperature": State(
                    "sensor.bedroom_temperature",
                    "22",
                    attributes={"device_class": "temperature"},
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = await area_manager.get_all_area_states()

        assert len(result) >= 2
        area_ids = [area["area_id"] for area in result]
        assert "living_room" in area_ids
        assert "bedroom" in area_ids


class TestAreaManagerEntityQueries:
    """Test entity query methods."""

    def test_get_entity_area_returns_area_id(self, area_manager):
        """Test getting area ID for specific entity."""
        result = area_manager.get_entity_area("binary_sensor.living_room_motion")
        assert result == "living_room"

    def test_get_entity_area_returns_none_for_unknown_entity(self, area_manager):
        """Test that unknown entity returns None."""
        result = area_manager.get_entity_area("sensor.unknown")
        assert result is None

    def test_get_area_entities_returns_all_entities_in_area(self, area_manager):
        """Test getting all entities in an area."""
        result = area_manager.get_area_entities("living_room")

        assert "binary_sensor.living_room_motion" in result
        assert "binary_sensor.living_room_presence" in result
        assert "sensor.living_room_illuminance" in result
        assert "light.living_room" in result
        assert "media_player.living_room_tv" in result

    def test_get_area_entities_filters_by_domain(self, area_manager):
        """Test filtering entities by domain."""
        result = area_manager.get_area_entities("living_room", domain="binary_sensor")

        assert "binary_sensor.living_room_motion" in result
        assert "binary_sensor.living_room_presence" in result
        assert "sensor.living_room_illuminance" not in result
        assert "light.living_room" not in result

    def test_get_area_entities_filters_by_device_class(self, area_manager):
        """Test filtering entities by device class."""
        result = area_manager.get_area_entities(
            "living_room", domain="binary_sensor", device_class="motion"
        )

        assert "binary_sensor.living_room_motion" in result
        assert "binary_sensor.living_room_presence" not in result

    def test_get_tracking_entities_returns_monitored_entities(self, area_manager):
        """Test getting entities used for activity tracking."""
        result = area_manager.get_tracking_entities("living_room")

        assert "binary_sensor.living_room_motion" in result
        assert "binary_sensor.living_room_presence" in result
        assert "sensor.living_room_illuminance" in result
        assert "media_player.living_room_tv" in result
        assert "light.living_room" not in result


class TestAreaManagerBinaryPresence:
    """Test binary presence detection."""

    def test_compute_presence_detected_motion_on(self, area_manager):
        """Test presence detected with motion sensor on."""
        entity_states = {"motion": "on"}
        detected = area_manager._compute_presence_detected(entity_states)
        assert detected is True

    def test_compute_presence_detected_all_off(self, area_manager):
        """Test no presence when all sensors off."""
        entity_states = {"motion": "off", "presence": "off", "occupancy": "off"}
        detected = area_manager._compute_presence_detected(entity_states)
        assert detected is False

    def test_compute_presence_detected_any_sensor_triggers(self, area_manager):
        """Test that any active sensor triggers presence."""
        assert area_manager._compute_presence_detected({"presence": "on"}) is True
        assert area_manager._compute_presence_detected({"occupancy": "on"}) is True
        assert area_manager._compute_presence_detected({"media": "playing"}) is True
        assert area_manager._compute_presence_detected({"media": "on"}) is True

    def test_compute_presence_detected_media_off_state(self, area_manager):
        """Test media player off state doesn't trigger presence."""
        entity_states = {"media": "off"}
        detected = area_manager._compute_presence_detected(entity_states)
        assert detected is False

    @pytest.mark.asyncio
    async def test_get_area_state_returns_presence_detected(self, area_manager, hass):
        """Test that area state includes presence_detected boolean."""

        def get_state(entity_id):
            states = {
                "binary_sensor.living_room_motion": State(
                    "binary_sensor.living_room_motion",
                    "on",
                    attributes={"device_class": "motion"},
                ),
                "binary_sensor.living_room_presence": State(
                    "binary_sensor.living_room_presence",
                    "on",
                    attributes={"device_class": "presence"},
                ),
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "50",
                    attributes={"device_class": "illuminance"},
                ),
                "media_player.living_room_tv": State(
                    "media_player.living_room_tv", "playing"
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = await area_manager.get_area_state("living_room")

        assert result is not None
        assert "presence_detected" in result
        assert result["presence_detected"] is True
        assert "active_presence_entities" in result
        assert "binary_sensor.living_room_motion" in result["active_presence_entities"]
        assert "media_player.living_room_tv" in result["active_presence_entities"]


class TestAreaManagerEdgeCases:
    """Test edge cases and error handling."""

    def test_is_dark_with_exact_threshold_illuminance(self, area_manager, hass):
        """Test is_dark when illuminance exactly equals threshold (20)."""

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "20.0",  # Exactly at threshold
                    attributes={"device_class": "illuminance"},
                ),
                "sun.sun": State(
                    "sun.sun", "above_horizon", attributes={"elevation": 45}
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_environmental_state("living_room")

        # At threshold should be NOT dark (< is strictly less than)
        assert result["is_dark"] is False
        assert result["illuminance"] == 20.0

    def test_is_dark_with_exact_sun_elevation_threshold(self, area_manager, hass):
        """Test is_dark when sun elevation exactly equals threshold (3)."""

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "100",
                    attributes={"device_class": "illuminance"},
                ),
                "sun.sun": State(
                    "sun.sun", "above_horizon", attributes={"elevation": 3.0}
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_environmental_state("living_room")

        # At threshold should be NOT dark (< is strictly less than)
        assert result["is_dark"] is False
        assert result["sun_elevation"] == 3.0

    def test_is_dark_just_below_illuminance_threshold(self, area_manager, hass):
        """Test is_dark when illuminance is just below threshold."""

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "19.9",  # Just below threshold
                    attributes={"device_class": "illuminance"},
                ),
                "sun.sun": State(
                    "sun.sun", "above_horizon", attributes={"elevation": 45}
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_environmental_state("living_room")

        assert result["is_dark"] is True
        assert result["illuminance"] == 19.9

    def test_illuminance_with_invalid_numeric_value(self, area_manager, hass):
        """Test illuminance handles invalid numeric values gracefully."""

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "unavailable",  # Invalid value
                    attributes={"device_class": "illuminance"},
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_illuminance("living_room")

        # Should return None when value is invalid
        assert result is None

    def test_temperature_with_non_numeric_state(self, area_manager, hass):
        """Test temperature sensor with non-numeric state."""

        def get_state(entity_id):
            states = {
                "sensor.bedroom_temperature": State(
                    "sensor.bedroom_temperature",
                    "unknown",
                    attributes={"device_class": "temperature"},
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_temperature("bedroom")

        # Should return None when all sensors are invalid
        assert result is None

    def test_humidity_with_unavailable_state(self, area_manager, hass):
        """Test humidity sensor with unavailable state."""

        def get_state(entity_id):
            states = {
                "sensor.bedroom_humidity": State(
                    "sensor.bedroom_humidity",
                    "unavailable",
                    attributes={"device_class": "humidity"},
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_humidity("bedroom")

        # Should return None when sensor unavailable
        assert result is None

    @pytest.mark.asyncio
    async def test_get_area_state_with_nonexistent_area(self, area_manager):
        """Test getting state for area that doesn't exist."""
        result = await area_manager.get_area_state("nonexistent_area")

        assert result is None

    @pytest.mark.asyncio
    async def test_get_area_state_with_no_entities(self, area_manager, hass):
        """Test area with no monitored entities."""
        # Kitchen has no presence sensors in fixture
        result = await area_manager.get_area_state("empty_area")

        # Should return None for areas with no entities
        assert result is None

    def test_get_entity_area_with_none_entity(self, area_manager):
        """Test get_entity_area with None entity result."""
        result = area_manager.get_entity_area("sensor.does_not_exist")

        assert result is None

    def test_illuminance_averaging_with_one_invalid_sensor(
        self, area_manager, entity_registry_mock, hass
    ):
        """Test illuminance averaging when one sensor has invalid value."""
        entities = entity_registry_mock.entities.copy()
        entities["sensor.living_room_illuminance_2"] = _create_mock_entity(
            "sensor.living_room_illuminance_2", "living_room", None, "illuminance"
        )
        type(entity_registry_mock).entities = PropertyMock(return_value=entities)

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "50",
                    attributes={"device_class": "illuminance"},
                ),
                "sensor.living_room_illuminance_2": State(
                    "sensor.living_room_illuminance_2",
                    "unavailable",  # Invalid
                    attributes={"device_class": "illuminance"},
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_illuminance("living_room")

        # Should average only valid sensors
        assert result == 50.0

    def test_illuminance_averaging_with_multiple_valid_sensors(
        self,
        hass,
        area_registry_mock,
        entity_registry_mock,
        device_registry_mock,
        monkeypatch,
    ):
        """Test illuminance averaging with 3+ valid sensors."""
        # Add more illuminance sensors to living room
        entities = entity_registry_mock.entities.copy()
        entities["sensor.living_room_illuminance_2"] = _create_mock_entity(
            "sensor.living_room_illuminance_2", "living_room", None, "illuminance"
        )
        entities["sensor.living_room_illuminance_3"] = _create_mock_entity(
            "sensor.living_room_illuminance_3", "living_room", None, "illuminance"
        )
        type(entity_registry_mock).entities = PropertyMock(return_value=entities)

        def get_state(entity_id):
            states = {
                "sensor.living_room_illuminance": State(
                    "sensor.living_room_illuminance",
                    "10.0",
                    attributes={"device_class": "illuminance"},
                ),
                "sensor.living_room_illuminance_2": State(
                    "sensor.living_room_illuminance_2",
                    "20.0",
                    attributes={"device_class": "illuminance"},
                ),
                "sensor.living_room_illuminance_3": State(
                    "sensor.living_room_illuminance_3",
                    "30.0",
                    attributes={"device_class": "illuminance"},
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        # Create new AreaManager instance after modifying entities
        monkeypatch.setattr(
            "homeassistant.helpers.area_registry.async_get",
            lambda h: area_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.entity_registry.async_get",
            lambda h: entity_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.device_registry.async_get",
            lambda h: device_registry_mock,
        )
        area_manager = AreaManager(hass)

        result = area_manager.get_area_illuminance("living_room")

        # Should average all 3 sensors: (10 + 20 + 30) / 3 = 20.0
        assert result == 20.0

    def test_humidity_averaging_ignores_invalid_values(
        self, area_manager, entity_registry_mock, hass
    ):
        """Test humidity averaging ignores invalid sensor values."""
        entities = entity_registry_mock.entities.copy()
        entities["sensor.bedroom_humidity_2"] = _create_mock_entity(
            "sensor.bedroom_humidity_2", "bedroom", None, "humidity"
        )
        type(entity_registry_mock).entities = PropertyMock(return_value=entities)

        def get_state(entity_id):
            states = {
                "sensor.bedroom_humidity": State(
                    "sensor.bedroom_humidity",
                    "65.0",
                    attributes={"device_class": "humidity"},
                ),
                "sensor.bedroom_humidity_2": State(
                    "sensor.bedroom_humidity_2",
                    "unknown",  # Invalid
                    attributes={"device_class": "humidity"},
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        result = area_manager.get_area_humidity("bedroom")

        # Should only use valid sensor
        assert result == 65.0

    def test_sun_elevation_with_missing_elevation_attribute(self, area_manager, hass):
        """Test sun elevation when elevation attribute is missing."""
        sun_state = State("sun.sun", "above_horizon", attributes={})
        hass.states.get = MagicMock(return_value=sun_state)

        result = area_manager.get_sun_elevation()

        assert result is None

    def test_sun_elevation_with_non_numeric_value(self, area_manager, hass):
        """Test sun elevation with non-numeric elevation value."""
        sun_state = State(
            "sun.sun", "above_horizon", attributes={"elevation": "invalid"}
        )
        hass.states.get = MagicMock(return_value=sun_state)

        result = area_manager.get_sun_elevation()

        assert result is None


class TestAreaManagerDeviceAreaLookup:
    """Test device-based area lookup for entities without direct area assignment."""

    def test_entity_without_area_but_with_device(
        self,
        hass,
        area_registry_mock,
        entity_registry_mock,
        device_registry_mock,
        monkeypatch,
    ):
        """Test entity lookup when entity has no area but device does."""
        # Create entity with device_id but no area_id
        test_entity = _create_mock_entity(
            "sensor.test_sensor", None, "device_123", "temperature"
        )

        # Mock entity registry to return our test entity
        entity_registry_mock.async_get = MagicMock(return_value=test_entity)

        # Create mock device with area
        mock_device = MagicMock()
        mock_device.area_id = "living_room"
        device_registry_mock.async_get = MagicMock(return_value=mock_device)

        monkeypatch.setattr(
            "homeassistant.helpers.area_registry.async_get",
            lambda h: area_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.entity_registry.async_get",
            lambda h: entity_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.device_registry.async_get",
            lambda h: device_registry_mock,
        )

        area_manager = AreaManager(hass)

        # Should find area via device
        result = area_manager.get_entity_area("sensor.test_sensor")

        assert result == "living_room"
        entity_registry_mock.async_get.assert_called_with("sensor.test_sensor")
        device_registry_mock.async_get.assert_called_with("device_123")

    def test_entity_without_area_and_device_without_area(
        self,
        hass,
        area_registry_mock,
        entity_registry_mock,
        device_registry_mock,
        monkeypatch,
    ):
        """Test entity lookup when neither entity nor device has area."""
        # Create entity with device_id but no area_id
        test_entity = _create_mock_entity(
            "sensor.test_sensor", None, "device_123", "temperature"
        )

        # Mock entity registry to return our test entity
        entity_registry_mock.async_get = MagicMock(return_value=test_entity)

        # Create mock device WITHOUT area
        mock_device = MagicMock()
        mock_device.area_id = None
        device_registry_mock.async_get = MagicMock(return_value=mock_device)

        monkeypatch.setattr(
            "homeassistant.helpers.area_registry.async_get",
            lambda h: area_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.entity_registry.async_get",
            lambda h: entity_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.device_registry.async_get",
            lambda h: device_registry_mock,
        )

        area_manager = AreaManager(hass)

        # Should return None when no area found
        result = area_manager.get_entity_area("sensor.test_sensor")

        assert result is None

    def test_entity_without_area_and_without_device(
        self,
        hass,
        area_registry_mock,
        entity_registry_mock,
        device_registry_mock,
        monkeypatch,
    ):
        """Test entity lookup when entity has no area and no device."""
        # Create entity without device_id and without area_id
        test_entity = _create_mock_entity(
            "sensor.test_sensor", None, None, "temperature"
        )

        # Mock entity_registry.async_get() to return our test entity
        entity_registry_mock.async_get.return_value = test_entity

        monkeypatch.setattr(
            "homeassistant.helpers.area_registry.async_get",
            lambda h: area_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.entity_registry.async_get",
            lambda h: entity_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.device_registry.async_get",
            lambda h: device_registry_mock,
        )

        area_manager = AreaManager(hass)

        # Should return None
        result = area_manager.get_entity_area("sensor.test_sensor")

        assert result is None


class TestAreaManagerInvalidStates:
    """Test handling of invalid states (unavailable, unknown, etc.)."""

    def test_presence_with_multiple_motion_sensors_some_unavailable(
        self,
        hass,
        area_registry_mock,
        entity_registry_mock,
        device_registry_mock,
        monkeypatch,
    ):
        """Test presence detection when some motion sensors are unavailable.

        Scenario: 3 motion sensors in garage
        - 2 sensors are unavailable
        - 1 sensor is on
        Expected: Presence should be detected (True)
        """
        # Add 2 more motion sensors to living_room
        entities = entity_registry_mock.entities.copy()
        entities["binary_sensor.living_room_motion_2"] = _create_mock_entity(
            "binary_sensor.living_room_motion_2", "living_room", None, "motion"
        )
        entities["binary_sensor.living_room_motion_3"] = _create_mock_entity(
            "binary_sensor.living_room_motion_3", "living_room", None, "motion"
        )
        type(entity_registry_mock).entities = PropertyMock(return_value=entities)

        def get_state(entity_id):
            states = {
                "binary_sensor.living_room_motion": State(
                    "binary_sensor.living_room_motion", "unavailable"
                ),
                "binary_sensor.living_room_motion_2": State(
                    "binary_sensor.living_room_motion_2", "unavailable"
                ),
                "binary_sensor.living_room_motion_3": State(
                    "binary_sensor.living_room_motion_3", "on"
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        monkeypatch.setattr(
            "homeassistant.helpers.area_registry.async_get",
            lambda h: area_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.entity_registry.async_get",
            lambda h: entity_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.device_registry.async_get",
            lambda h: device_registry_mock,
        )

        area_manager = AreaManager(hass)

        # Test presence detection
        result = area_manager.get_area_presence_binary("living_room")

        # Should detect presence because one valid sensor is "on"
        assert result["presence_detected"] is True

    def test_presence_with_all_motion_sensors_unavailable(
        self,
        hass,
        area_registry_mock,
        entity_registry_mock,
        device_registry_mock,
        monkeypatch,
    ):
        """Test presence detection when all motion sensors are unavailable.

        Scenario: 3 motion sensors in garage, all unavailable
        Expected: No presence detected (False)
        """
        # Add 2 more motion sensors to living_room
        entities = entity_registry_mock.entities.copy()
        entities["binary_sensor.living_room_motion_2"] = _create_mock_entity(
            "binary_sensor.living_room_motion_2", "living_room", None, "motion"
        )
        entities["binary_sensor.living_room_motion_3"] = _create_mock_entity(
            "binary_sensor.living_room_motion_3", "living_room", None, "motion"
        )
        type(entity_registry_mock).entities = PropertyMock(return_value=entities)

        def get_state(entity_id):
            # All sensors unavailable
            return State(entity_id, "unavailable")

        hass.states.get = MagicMock(side_effect=get_state)

        monkeypatch.setattr(
            "homeassistant.helpers.area_registry.async_get",
            lambda h: area_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.entity_registry.async_get",
            lambda h: entity_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.device_registry.async_get",
            lambda h: device_registry_mock,
        )

        area_manager = AreaManager(hass)

        # Test presence detection
        result = area_manager.get_area_presence_binary("living_room")

        # Should NOT detect presence when all sensors are unavailable
        assert result["presence_detected"] is False

    def test_presence_with_mixed_invalid_states(
        self,
        hass,
        area_registry_mock,
        entity_registry_mock,
        device_registry_mock,
        monkeypatch,
    ):
        """Test presence detection with various invalid states.

        Scenario: 4 motion sensors with different invalid states + 1 valid "off"
        - 1 sensor is unknown
        - 1 sensor is unavailable
        - 1 sensor is undefined
        - 1 sensor is off (valid)
        Expected: No presence detected (False)
        """
        # Add 3 more motion sensors to living_room
        entities = entity_registry_mock.entities.copy()
        entities["binary_sensor.living_room_motion_2"] = _create_mock_entity(
            "binary_sensor.living_room_motion_2", "living_room", None, "motion"
        )
        entities["binary_sensor.living_room_motion_3"] = _create_mock_entity(
            "binary_sensor.living_room_motion_3", "living_room", None, "motion"
        )
        entities["binary_sensor.living_room_motion_4"] = _create_mock_entity(
            "binary_sensor.living_room_motion_4", "living_room", None, "motion"
        )
        type(entity_registry_mock).entities = PropertyMock(return_value=entities)

        def get_state(entity_id):
            states = {
                "binary_sensor.living_room_motion": State(
                    "binary_sensor.living_room_motion", "unknown"
                ),
                "binary_sensor.living_room_motion_2": State(
                    "binary_sensor.living_room_motion_2", "unavailable"
                ),
                "binary_sensor.living_room_motion_3": State(
                    "binary_sensor.living_room_motion_3", "undefined"
                ),
                "binary_sensor.living_room_motion_4": State(
                    "binary_sensor.living_room_motion_4", "off"
                ),
            }
            return states.get(entity_id)

        hass.states.get = MagicMock(side_effect=get_state)

        monkeypatch.setattr(
            "homeassistant.helpers.area_registry.async_get",
            lambda h: area_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.entity_registry.async_get",
            lambda h: entity_registry_mock,
        )
        monkeypatch.setattr(
            "homeassistant.helpers.device_registry.async_get",
            lambda h: device_registry_mock,
        )

        area_manager = AreaManager(hass)

        # Test presence detection
        result = area_manager.get_area_presence_binary("living_room")

        # Should NOT detect presence (only valid sensor is "off")
        assert result["presence_detected"] is False
