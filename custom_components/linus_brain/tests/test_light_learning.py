"""
Tests for Light Learning module.

Tests the capture of manual light actions and context collection
for AI-based learning of lighting preferences.
"""

from unittest.mock import AsyncMock, MagicMock, Mock, patch

import pytest
from homeassistant.core import Context, HomeAssistant, State

from ..utils.light_learning import LightLearning


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance."""
    hass = MagicMock(spec=HomeAssistant)
    return hass


@pytest.fixture
def mock_coordinator():
    """Mock coordinator with necessary attributes."""
    coordinator = MagicMock()
    coordinator.instance_id = "test-instance-uuid"
    coordinator.get_or_create_instance_id = AsyncMock(return_value="test-instance-uuid")
    coordinator.area_manager = MagicMock()
    coordinator.supabase_client = MagicMock()
    coordinator.supabase_client.send_light_action = AsyncMock(return_value=True)
    coordinator.activity_tracker = MagicMock()
    coordinator.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="presence"
    )
    coordinator.activity_tracker.get_activity_duration = MagicMock(return_value=30.0)
    return coordinator


@pytest.fixture
def light_learning(mock_hass, mock_coordinator):
    """Create LightLearning instance with mocked dependencies."""
    return LightLearning(mock_hass, mock_coordinator)


class TestIsManualAction:
    """Tests for _is_manual_action method."""

    def test_manual_action_with_user_id(self, light_learning):
        """Test that action with user_id is detected as manual."""
        context = Context(user_id="test-user-123")
        assert light_learning._is_manual_action(context) is True

    def test_automated_action_without_user_id(self, light_learning):
        """Test that action without user_id is detected as automated."""
        context = Context()
        assert light_learning._is_manual_action(context) is False

    def test_automated_action_with_none_user_id(self, light_learning):
        """Test that explicit None user_id is detected as automated."""
        context = Context(user_id=None)
        assert light_learning._is_manual_action(context) is False


class TestDetermineActionType:
    """Tests for _determine_action_type method."""

    def test_turn_on_action(self, light_learning):
        """Test detection of turn_on action."""
        old_state = State("light.kitchen", "off", {})
        new_state = State("light.kitchen", "on", {})
        assert light_learning._determine_action_type(new_state, old_state) == "turn_on"

    def test_turn_off_action(self, light_learning):
        """Test detection of turn_off action."""
        old_state = State("light.kitchen", "on", {"brightness": 255})
        new_state = State("light.kitchen", "off", {})
        assert light_learning._determine_action_type(new_state, old_state) == "turn_off"

    def test_brightness_change(self, light_learning):
        """Test detection of brightness change."""
        old_state = State("light.kitchen", "on", {"brightness": 100})
        new_state = State("light.kitchen", "on", {"brightness": 200})
        assert (
            light_learning._determine_action_type(new_state, old_state) == "brightness"
        )

    def test_color_temp_change(self, light_learning):
        """Test detection of color temperature change."""
        old_state = State("light.kitchen", "on", {"brightness": 255, "color_temp": 300})
        new_state = State("light.kitchen", "on", {"brightness": 255, "color_temp": 400})
        assert (
            light_learning._determine_action_type(new_state, old_state) == "color_temp"
        )

    def test_color_change(self, light_learning):
        """Test detection of RGB color change."""
        old_state = State(
            "light.kitchen", "on", {"brightness": 255, "rgb_color": [255, 0, 0]}
        )
        new_state = State(
            "light.kitchen", "on", {"brightness": 255, "rgb_color": [0, 255, 0]}
        )
        assert light_learning._determine_action_type(new_state, old_state) == "color"

    def test_hs_color_change(self, light_learning):
        """Test detection of HS color change."""
        old_state = State(
            "light.kitchen", "on", {"brightness": 255, "hs_color": [120, 100]}
        )
        new_state = State(
            "light.kitchen", "on", {"brightness": 255, "hs_color": [240, 100]}
        )
        assert light_learning._determine_action_type(new_state, old_state) == "color"

    def test_turn_on_without_old_state(self, light_learning):
        """Test turn_on detection when old_state is None."""
        new_state = State("light.kitchen", "on", {"brightness": 255})
        assert light_learning._determine_action_type(new_state, None) == "turn_on"

    def test_no_change_detected(self, light_learning):
        """Test when no meaningful change is detected."""
        old_state = State("light.kitchen", "on", {"brightness": 255})
        new_state = State("light.kitchen", "on", {"brightness": 255})
        assert light_learning._determine_action_type(new_state, old_state) == "turn_on"


class TestBuildStateDict:
    """Tests for _build_state_dict method."""

    def test_basic_on_state(self, light_learning):
        """Test building state dict for simple on state."""
        state = State("light.kitchen", "on", {})
        result = light_learning._build_state_dict(state)
        assert result == {"state": "on"}

    def test_state_with_brightness(self, light_learning):
        """Test building state dict with brightness."""
        state = State("light.kitchen", "on", {"brightness": 200})
        result = light_learning._build_state_dict(state)
        assert result == {"state": "on", "brightness": 200}

    def test_state_with_color_temp(self, light_learning):
        """Test building state dict with color temperature."""
        state = State("light.kitchen", "on", {"brightness": 255, "color_temp": 350})
        result = light_learning._build_state_dict(state)
        assert result == {"state": "on", "brightness": 255, "color_temp": 350}

    def test_state_with_rgb_color(self, light_learning):
        """Test building state dict with RGB color."""
        state = State(
            "light.kitchen", "on", {"brightness": 255, "rgb_color": [255, 128, 0]}
        )
        result = light_learning._build_state_dict(state)
        assert result == {
            "state": "on",
            "brightness": 255,
            "rgb_color": [255, 128, 0],
        }

    def test_state_with_hs_color(self, light_learning):
        """Test building state dict with HS color."""
        state = State(
            "light.kitchen", "on", {"brightness": 255, "hs_color": [120.0, 75.5]}
        )
        result = light_learning._build_state_dict(state)
        assert result == {"state": "on", "brightness": 255, "hs_color": [120.0, 75.5]}

    def test_off_state(self, light_learning):
        """Test building state dict for off state."""
        state = State("light.kitchen", "off", {})
        result = light_learning._build_state_dict(state)
        assert result == {"state": "off"}

    def test_all_attributes(self, light_learning):
        """Test building state dict with all attributes."""
        state = State(
            "light.kitchen",
            "on",
            {
                "brightness": 200,
                "color_temp": 400,
                "rgb_color": [255, 255, 255],
                "hs_color": [0, 0],
            },
        )
        result = light_learning._build_state_dict(state)
        assert result == {
            "state": "on",
            "brightness": 200,
            "color_temp": 400,
            "rgb_color": [255, 255, 255],
            "hs_color": [0, 0],
        }


@pytest.mark.asyncio
class TestCaptureLightAction:
    """Tests for capture_light_action method (full flow)."""

    async def test_skip_automated_action(self, light_learning, mock_coordinator):
        """Test that automated actions are skipped."""
        context = Context()
        new_state = State("light.kitchen", "on", {})
        old_state = State("light.kitchen", "off", {})

        await light_learning.capture_light_action(
            "light.kitchen", new_state, old_state, context
        )

        mock_coordinator.supabase_client.send_light_action.assert_not_called()

    async def test_skip_no_area(self, light_learning, mock_coordinator):
        """Test that actions without area assignment are skipped."""
        context = Context(user_id="test-user-123")
        new_state = State("light.kitchen", "on", {})
        old_state = State("light.kitchen", "off", {})

        mock_coordinator.area_manager.get_entity_area.return_value = None

        await light_learning.capture_light_action(
            "light.kitchen", new_state, old_state, context
        )

        mock_coordinator.supabase_client.send_light_action.assert_not_called()

    async def test_successful_capture_with_presence(
        self, light_learning, mock_coordinator
    ):
        """Test successful capture of manual action with presence context."""
        context = Context(user_id="test-user-123")
        new_state = State("light.kitchen", "on", {"brightness": 255})
        old_state = State("light.kitchen", "off", {})

        mock_area = Mock()
        mock_area.name = "kitchen"
        mock_coordinator.area_manager.get_entity_area.return_value = "kitchen"
        mock_coordinator.area_manager._area_registry.async_get_area.return_value = (
            mock_area
        )
        mock_coordinator.area_manager.get_area_presence_binary.return_value = True
        mock_coordinator.area_manager.get_area_illuminance.return_value = 150.0
        mock_coordinator.area_manager.get_sun_elevation.return_value = None

        with patch("linus_brain.utils.light_learning.datetime") as mock_dt:
            mock_now = Mock()
            mock_now.hour = 19
            mock_now.weekday.return_value = 2
            mock_dt.now.return_value = mock_now

            await light_learning.capture_light_action(
                "light.kitchen", new_state, old_state, context
            )

        mock_coordinator.supabase_client.send_light_action.assert_called_once()
        call_args = mock_coordinator.supabase_client.send_light_action.call_args[0][0]

        assert call_args["instance_id"] == "test-instance-uuid"
        assert call_args["entity_id"] == "light.kitchen"
        assert call_args["area"] == "kitchen"
        assert call_args["action_type"] == "turn_on"
        assert call_args["new_state"] == {"state": "on", "brightness": 255}
        assert call_args["activity"] in ["none", "presence", "occupation"]
        assert "activity_duration" in call_args
        assert call_args["presence_detected"] is True
        assert call_args["illuminance"] == 150.0
        assert call_args["hour"] == 19
        assert call_args["day_of_week"] == 2

    async def test_successful_capture_with_sun_fallback(
        self, light_learning, mock_coordinator
    ):
        """Test successful capture using sun elevation fallback."""
        context = Context(user_id="test-user-123")
        new_state = State("light.kitchen", "off", {})
        old_state = State("light.kitchen", "on", {"brightness": 255})

        mock_coordinator.area_manager.get_entity_area.return_value = "kitchen"
        mock_coordinator.area_manager.get_area_presence_binary.return_value = False
        mock_coordinator.area_manager.get_area_illuminance.return_value = None
        mock_coordinator.area_manager.get_sun_elevation.return_value = -15.5

        with patch("linus_brain.utils.light_learning.datetime") as mock_dt:
            mock_now = Mock()
            mock_now.hour = 7
            mock_now.weekday.return_value = 0
            mock_dt.now.return_value = mock_now

            await light_learning.capture_light_action(
                "light.kitchen", new_state, old_state, context
            )

        mock_coordinator.supabase_client.send_light_action.assert_called_once()
        call_args = mock_coordinator.supabase_client.send_light_action.call_args[0][0]

        assert call_args["action_type"] == "turn_off"
        assert call_args["new_state"] == {"state": "off"}
        assert call_args["presence_detected"] is False
        assert call_args["illuminance"] is None
        assert call_args["sun_elevation"] == -15.5

    async def test_brightness_change_capture(self, light_learning, mock_coordinator):
        """Test capturing brightness adjustment."""
        context = Context(user_id="test-user-123")
        old_state = State("light.bedroom", "on", {"brightness": 100})
        new_state = State("light.bedroom", "on", {"brightness": 50})

        mock_coordinator.area_manager.get_entity_area.return_value = "bedroom"
        mock_coordinator.area_manager.get_room_presence_binary.return_value = True
        mock_coordinator.area_manager.get_room_illuminance.return_value = 5.0
        mock_coordinator.area_manager.get_sun_elevation.return_value = None

        with patch("linus_brain.utils.light_learning.datetime") as mock_dt:
            mock_now = Mock()
            mock_now.hour = 22
            mock_now.weekday.return_value = 6
            mock_dt.now.return_value = mock_now

            await light_learning.capture_light_action(
                "light.bedroom", new_state, old_state, context
            )

        call_args = mock_coordinator.supabase_client.send_light_action.call_args[0][0]
        assert call_args["action_type"] == "brightness"
        assert call_args["new_state"] == {"state": "on", "brightness": 50}

    async def test_error_handling(self, light_learning, mock_coordinator):
        """Test error handling during capture."""
        context = Context(user_id="test-user-123")
        new_state = State("light.kitchen", "on", {})
        old_state = State("light.kitchen", "off", {})

        mock_coordinator.area_manager.get_entity_area.return_value = "kitchen"
        mock_coordinator.area_manager.get_area_presence_binary.side_effect = Exception(
            "Test error"
        )

        await light_learning.capture_light_action(
            "light.kitchen", new_state, old_state, context
        )

        mock_coordinator.supabase_client.send_light_action.assert_not_called()
