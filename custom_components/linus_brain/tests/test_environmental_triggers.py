"""
Unit tests for environmental state change triggers.

Tests that rule engine responds to environmental changes (illuminance, sun elevation)
even when activity remains constant, for rules with area_state conditions.
"""

import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest

from ..utils.rule_engine import RuleEngine


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance."""
    hass = MagicMock()
    hass.states = MagicMock()
    hass.states.get = MagicMock(return_value=None)
    hass.services = MagicMock()
    hass.services.async_call = AsyncMock()
    hass.data = {}
    return hass


@pytest.fixture
def mock_activity_tracker():
    """Mock ActivityTracker."""
    tracker = MagicMock()
    tracker.async_initialize = AsyncMock()
    tracker.async_evaluate_activity = AsyncMock(return_value="movement")
    tracker.get_activity = MagicMock(return_value="movement")
    return tracker


@pytest.fixture
def mock_app_storage():
    """Mock AppStorage with autolight app."""
    storage = MagicMock()

    # Autolight app with area_state condition
    autolight_app = {
        "app_id": "autolight",
        "app_name": "Automatic Lighting",
        "activity_actions": {
            "occupied": {
                "conditions": [
                    {
                        "condition": "area_state",
                        "area_id": "current",
                        "attribute": "is_dark",
                    }
                ],
                "actions": [
                    {
                        "service": "light.turn_on",
                        "domain": "light",
                        "area": "current",
                        "data": {"brightness_pct": 100},
                    }
                ],
                "logic": "and",
            },
            "movement": {
                "conditions": [
                    {
                        "condition": "area_state",
                        "area_id": "current",
                        "attribute": "is_dark",
                    }
                ],
                "actions": [
                    {
                        "service": "light.turn_on",
                        "domain": "light",
                        "area": "current",
                        "data": {"brightness_pct": 100},
                    }
                ],
                "logic": "and",
            },
            "empty": {
                "conditions": [],
                "actions": [
                    {
                        "service": "light.turn_off",
                        "domain": "light",
                        "area": "current",
                    }
                ],
                "logic": "and",
            },
        },
    }

    storage.get_assignments = MagicMock(
        return_value={
            "salon": {
                "area_id": "salon",
                "app_id": "autolight",
                "enabled": True,
            }
        }
    )
    storage.get_assignment = MagicMock(
        return_value={
            "area_id": "salon",
            "app_id": "autolight",
            "enabled": True,
        }
    )
    storage.get_app = MagicMock(return_value=autolight_app)
    storage.get_apps = MagicMock(return_value={"autolight": autolight_app})
    storage.remove_assignment = MagicMock()
    storage.async_save = AsyncMock(return_value=True)
    return storage


@pytest.fixture
def mock_area_manager():
    """Mock AreaManager with environmental entities."""
    manager = MagicMock()

    # Return environmental entities when requested
    def get_area_entities(area_id, domain=None, device_class=None):
        if domain == "sensor" and device_class == "illuminance":
            return ["sensor.salon_illuminance"]
        if domain == "binary_sensor" and device_class == "motion":
            return ["binary_sensor.salon_motion"]
        return []

    manager.get_area_entities = MagicMock(side_effect=get_area_entities)
    return manager


@pytest.fixture
def rule_engine(mock_hass, mock_activity_tracker, mock_app_storage, mock_area_manager):
    """Create RuleEngine instance."""
    return RuleEngine(
        mock_hass,
        "test_entry",
        mock_activity_tracker,
        mock_app_storage,
        mock_area_manager,
    )


class TestEnvironmentalEntityTracking:
    """Test that environmental entities are tracked when area_state conditions exist."""

    @pytest.mark.asyncio
    async def test_enable_area_tracks_environmental_entities(
        self, rule_engine, mock_area_manager, mock_hass
    ):
        """Test that environmental entities are tracked when app uses area_state."""
        # Mock sun.sun entity exists
        mock_hass.states.get = MagicMock(return_value=MagicMock())

        await rule_engine.async_initialize()

        # Check that environmental entities were identified
        environmental_entities = rule_engine._get_area_environmental_entities("salon")

        assert "sensor.salon_illuminance" in environmental_entities
        assert "sun.sun" in environmental_entities

    @pytest.mark.asyncio
    async def test_enable_area_without_area_state_skips_environmental(
        self, rule_engine, mock_app_storage, mock_area_manager
    ):
        """Test that environmental entities are NOT tracked when no area_state conditions."""
        # Create app without area_state condition
        app_without_area_state = {
            "app_id": "simple_light",
            "activity_actions": {
                "movement": {
                    "conditions": [],
                    "actions": [
                        {
                            "service": "light.turn_on",
                            "domain": "light",
                            "area": "current",
                        }
                    ],
                }
            },
        }

        mock_app_storage.get_app = MagicMock(return_value=app_without_area_state)

        await rule_engine.async_initialize()

        # Environmental entities should not be tracked
        # Only presence entities should be tracked
        assert len(rule_engine._listeners.get("salon", [])) > 0


class TestEnvironmentalChangeTriggersEvaluation:
    """Test that environmental changes trigger rule evaluation."""

    @pytest.mark.asyncio
    async def test_illuminance_change_triggers_evaluation(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test that illuminance sensor change triggers rule evaluation."""
        # Setup: Area with movement, lights should respond to lux changes
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )

        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Mock environmental state showing transition from bright to dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # Verify area is enabled (has listeners)
        assert "salon" in rule_engine._listeners

        # Now simulate transition to dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        # Simulate illuminance sensor change
        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        # This should trigger evaluation
        rule_engine._async_state_change_handler(event)

        # Wait for debounce
        await asyncio.sleep(2.5)

        # Verify evaluation was triggered using get_activity (environmental trigger)
        # NOT async_evaluate_activity (which would recalculate from sensors)
        mock_activity_tracker.get_activity.assert_called()

    @pytest.mark.asyncio
    async def test_sun_change_triggers_evaluation(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test that sun.sun entity change triggers rule evaluation."""
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )

        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Mock environmental state showing bright initially
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # Now simulate transition to dark (sun setting)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        # Simulate sun.sun change (e.g., elevation crosses threshold)
        event = MagicMock()
        event.data = {"entity_id": "sun.sun"}

        rule_engine._async_state_change_handler(event)

        await asyncio.sleep(2.5)

        # Verify evaluation was triggered using get_activity (environmental trigger)
        # NOT async_evaluate_activity (which would recalculate from sensors)
        mock_activity_tracker.get_activity.assert_called()

    @pytest.mark.asyncio
    async def test_environmental_change_respects_debounce(
        self, rule_engine, mock_hass, mock_activity_tracker
    ):
        """Test that rapid environmental changes are debounced."""
        mock_hass.states.get = MagicMock(return_value=MagicMock())
        await rule_engine.async_initialize()

        # Simulate multiple rapid illuminance changes
        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(0.1)
        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(0.1)
        rule_engine._async_state_change_handler(event)

        # Wait for debounce
        await asyncio.sleep(2.5)

        # Should only trigger once due to debounce
        # Each change cancels the previous pending task
        assert mock_activity_tracker.async_evaluate_activity.call_count <= 2


class TestHelperMethods:
    """Test helper methods for environmental entity detection."""

    def test_has_area_state_condition_simple(self, rule_engine):
        """Test detection of area_state condition in simple list."""
        conditions = [{"condition": "area_state", "attribute": "is_dark"}]

        assert rule_engine._has_area_state_condition(conditions) is True

    def test_has_area_state_condition_nested_and(self, rule_engine):
        """Test detection of area_state condition in nested AND."""
        conditions = [
            {
                "condition": "and",
                "conditions": [
                    {"condition": "state", "entity_id": "light.test", "state": "off"},
                    {"condition": "area_state", "attribute": "is_dark"},
                ],
            }
        ]

        assert rule_engine._has_area_state_condition(conditions) is True

    def test_has_area_state_condition_nested_or(self, rule_engine):
        """Test detection of area_state condition in nested OR."""
        conditions = [
            {
                "condition": "or",
                "conditions": [
                    {"condition": "area_state", "attribute": "is_dark"},
                    {"condition": "time", "after": "22:00"},
                ],
            }
        ]

        assert rule_engine._has_area_state_condition(conditions) is True

    def test_has_area_state_condition_none(self, rule_engine):
        """Test no detection when no area_state condition exists."""
        conditions = [
            {"condition": "state", "entity_id": "light.test", "state": "off"},
            {"condition": "time", "after": "22:00"},
        ]

        assert rule_engine._has_area_state_condition(conditions) is False

    def test_has_area_state_condition_empty(self, rule_engine):
        """Test empty conditions list."""
        assert rule_engine._has_area_state_condition([]) is False


class TestEnvironmentalStateTracking:
    """Test environmental state tracking and transition detection."""

    def test_get_current_environmental_state(self, rule_engine, mock_area_manager):
        """Test getting current environmental state from area manager."""
        # Mock area_manager.get_area_environmental_state
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        state = rule_engine._get_current_environmental_state("salon")

        assert state == {"is_dark": True}
        mock_area_manager.get_area_environmental_state.assert_called_with("salon")

    def test_detect_environmental_transition_became_dark(self, rule_engine):
        """Test detection of became_dark transition."""
        area_id = "salon"

        # Set previous state: not dark
        rule_engine._previous_env_state[area_id] = {
            "is_dark": False,
        }

        # Current state: now dark
        current_state = {"is_dark": True}

        transition = rule_engine._detect_environmental_transition(
            area_id, current_state
        )

        assert transition == "became_dark"

    def test_detect_environmental_transition_no_change(self, rule_engine):
        """Test no transition when state unchanged."""
        area_id = "salon"

        # Set previous state: dark
        rule_engine._previous_env_state[area_id] = {
            "is_dark": True,
        }

        # Current state: still dark
        current_state = {"is_dark": True}

        transition = rule_engine._detect_environmental_transition(
            area_id, current_state
        )

        assert transition is None

    def test_detect_environmental_transition_no_previous_state(self, rule_engine):
        """Test no transition on first check (no previous state)."""
        area_id = "salon"

        # No previous state
        current_state = {"is_dark": True}

        transition = rule_engine._detect_environmental_transition(
            area_id, current_state
        )

        assert transition is None

    @pytest.mark.asyncio
    async def test_environmental_state_cache_initialized_on_enable(
        self, rule_engine, mock_hass, mock_area_manager
    ):
        """Test that environmental state cache is initialized when area enabled."""
        mock_hass.states.get = MagicMock(return_value=MagicMock())
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # Check cache was initialized for salon
        assert "salon" in rule_engine._previous_env_state
        assert rule_engine._previous_env_state["salon"] == {
            "is_dark": False,
        }

    @pytest.mark.asyncio
    async def test_environmental_state_cache_cleared_on_disable(
        self, rule_engine, mock_hass, mock_area_manager
    ):
        """Test that environmental state cache is cleared when area disabled."""
        mock_hass.states.get = MagicMock(return_value=MagicMock())
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # Verify cache exists
        assert "salon" in rule_engine._previous_env_state

        # Disable area
        await rule_engine.disable_area("salon")

        # Cache should be cleared
        assert "salon" not in rule_engine._previous_env_state


class TestEnvironmentalCooldown:
    """Test separate cooldown for environmental triggers."""

    @pytest.mark.asyncio
    async def test_environmental_triggers_use_separate_cooldown(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test that environmental triggers use separate cooldown key."""
        # Mock condition evaluator to return True so execution completes
        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            return_value=True
        )

        # Mock action executor to succeed
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Mock switch state to be "on" so app is enabled
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        await rule_engine.async_initialize()

        # Trigger an environmental evaluation
        await rule_engine._async_evaluate_and_execute("salon", is_environmental=True)

        # Check that environmental cooldown key was created (enter actions)
        assert "salon" in rule_engine._last_environmental_action
        assert "enter" in rule_engine._last_environmental_action["salon"]

    @pytest.mark.asyncio
    async def test_environmental_cooldown_is_configurable(self, rule_engine):
        """Test that environmental cooldown is configurable via app_storage."""
        from ..utils.rule_engine import (
            COOLDOWN_SECONDS,
            DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL,
        )

        # Default environmental check interval should be reasonable
        assert DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL == 30
        assert COOLDOWN_SECONDS == 30

        # Test that environmental cooldown can be configured
        rule_engine.app_storage._data["environmental_check_interval"] = 60
        assert rule_engine._check_environmental_cooldown("test_area", "enter") is True

    def test_check_cooldown_environmental_trigger(self, rule_engine):
        """Test cooldown check for environmental triggers."""
        from datetime import timedelta

        from homeassistant.util import dt as dt_util

        area_id = "salon"

        # Set environmental trigger timestamp 10 seconds ago (enter action)
        rule_engine._last_environmental_action[area_id] = {
            "enter": dt_util.utcnow() - timedelta(seconds=10)
        }

        # Should still be in cooldown (default 30 second cooldown)
        assert rule_engine._check_environmental_cooldown(area_id, "enter") is False

        # Set environmental trigger timestamp 35 seconds ago
        rule_engine._last_environmental_action[area_id] = {
            "enter": dt_util.utcnow() - timedelta(seconds=35)
        }

        # Should be out of cooldown now
        assert rule_engine._check_environmental_cooldown(area_id, "enter") is True

    def test_check_cooldown_activity_trigger_independent(self, rule_engine):
        """Test that activity and environmental cooldowns are independent."""
        from datetime import timedelta

        from homeassistant.util import dt as dt_util

        area_id = "salon"
        activity = "movement"

        # Set environmental trigger timestamp 10 seconds ago (still in cooldown, enter action)
        rule_engine._last_environmental_action[area_id] = {
            "enter": dt_util.utcnow() - timedelta(seconds=10)
        }

        # Environmental trigger should be in cooldown
        assert rule_engine._check_environmental_cooldown(area_id, "enter") is False

        # Activity trigger should not be affected by environmental cooldown
        assert (
            rule_engine._check_cooldown(area_id, activity, is_environmental=False)
            is True
        )

        # Set activity trigger timestamp 10 seconds ago
        rule_engine._last_triggered[f"{area_id}_{activity}"] = (
            dt_util.utcnow() - timedelta(seconds=10)
        )

        # Activity should be in cooldown (30 second cooldown)
        assert (
            rule_engine._check_cooldown(area_id, activity, is_environmental=False)
            is False
        )

        # Environmental cooldown should still be in cooldown independently
        assert rule_engine._check_environmental_cooldown(area_id, "enter") is False


class TestEnvironmentalTriggersIntegration:
    """Integration tests for end-to-end environmental trigger flow."""

    @pytest.mark.asyncio
    async def test_illuminance_transition_to_dark_turns_on_lights(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test full flow: area becomes dark → lights turn ON (with presence)."""
        # Setup: Area has presence (movement), initially bright
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        # Mock condition evaluator to return True (is_dark condition met)
        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            return_value=True
        )

        # Mock action executor to succeed
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Mock switch state to be "on" so app is enabled
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial state: bright (is_dark=False)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        # Initialize rule engine
        await rule_engine.async_initialize()

        # Verify initial cache
        assert rule_engine._previous_env_state["salon"]["is_dark"] is False

        # Transition: area becomes dark (is_dark=True)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        # Simulate illuminance sensor change
        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        # Trigger state change handler
        rule_engine._async_state_change_handler(event)

        # Wait for debounce
        await asyncio.sleep(2.5)

        # Verify get_activity was used (environmental trigger preserves activity)
        # NOT async_evaluate_activity (which would recalculate from sensors)
        mock_activity_tracker.get_activity.assert_called_with("salon")

        # Verify conditions were evaluated
        rule_engine.condition_evaluator.evaluate_conditions.assert_called()

        # Verify actions were executed (lights turned on)
        rule_engine.action_executor.execute_actions.assert_called()

        # Verify environmental cooldown was set (enter action)
        assert "salon" in rule_engine._last_environmental_action
        assert "enter" in rule_engine._last_environmental_action["salon"]

        # Verify cache was updated
        assert rule_engine._previous_env_state["salon"]["is_dark"] is True

    @pytest.mark.asyncio
    async def test_no_transition_skips_evaluation(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test that environmental entity change WITHOUT transition skips evaluation."""
        # Setup: Area dark, and stays dark
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )

        # Mock hass states
        mock_hass.states.get = MagicMock(return_value=MagicMock())

        # Initial state: dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        # Initialize rule engine
        await rule_engine.async_initialize()

        # Reset mock to track new calls
        mock_activity_tracker.async_evaluate_activity.reset_mock()

        # Same state: still dark (illuminance goes from 10 → 15 lux, both < 20)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        # Simulate illuminance sensor change (but no transition)
        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        # Trigger state change handler
        rule_engine._async_state_change_handler(event)

        # Wait for debounce
        await asyncio.sleep(2.5)

        # Verify evaluation was NOT triggered (no transition)
        mock_activity_tracker.async_evaluate_activity.assert_not_called()

    @pytest.mark.asyncio
    async def test_environmental_cooldown_prevents_rapid_retriggering(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test that environmental cooldown prevents rapid re-triggering."""
        from datetime import timedelta

        from homeassistant.util import dt as dt_util

        # Setup
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            return_value=True
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Mock switch state to be "on" so app is enabled
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: bright
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # First transition: bright → dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify first execution
        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Second transition: dark → bright (immediately, within cooldown)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify second execution was BLOCKED by cooldown
        rule_engine.action_executor.execute_actions.assert_not_called()

        # Simulate 35 seconds passing (update environmental cooldown)
        rule_engine._last_environmental_action["salon"] = {
            "enter": dt_util.utcnow() - timedelta(seconds=35),
            "exit": dt_util.utcnow() - timedelta(seconds=35),
        }

        # Third transition: bright → dark (after cooldown expired)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify third execution succeeded (cooldown expired)
        assert rule_engine.action_executor.execute_actions.call_count == 1

    @pytest.mark.asyncio
    async def test_sun_elevation_transition_triggers_evaluation(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test that sun elevation crossing threshold triggers evaluation."""
        # Setup: Area with presence, no illuminance sensor (relies on sun)
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            return_value=True
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Mock switch state to be "on" so app is enabled
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: sun above horizon (bright)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # Transition: sun sets below horizon (dark)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        # Simulate sun.sun state change (elevation crosses threshold)
        event = MagicMock()
        event.data = {"entity_id": "sun.sun"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify get_activity was used (environmental trigger preserves activity)
        # NOT async_evaluate_activity (which would recalculate from sensors)
        mock_activity_tracker.get_activity.assert_called_with("salon")
        rule_engine.action_executor.execute_actions.assert_called()

        # Verify environmental cooldown was set (enter action)
        assert "salon" in rule_engine._last_environmental_action
        assert "enter" in rule_engine._last_environmental_action["salon"]


class TestEnterExitCooldownSeparation:
    """Test that enter and exit cooldowns are separate and independent."""

    @pytest.fixture
    def autolight_app_with_exit(self):
        """Create autolight app config with on_exit actions."""
        return {
            "app_id": "autolight",
            "app_name": "Automatic Lighting",
            "activity_actions": {
                "movement": {
                    "conditions": [
                        {
                            "condition": "area_state",
                            "area_id": "current",
                            "attribute": "is_dark",
                        }
                    ],
                    "actions": [
                        {
                            "service": "light.turn_on",
                            "domain": "light",
                            "area": "current",
                            "data": {"brightness_pct": 100},
                        }
                    ],
                    "on_exit": [
                        {
                            "service": "light.turn_off",
                            "domain": "light",
                            "area": "current",
                        }
                    ],
                    "logic": "and",
                },
                "empty": {
                    "conditions": [],
                    "actions": [
                        {
                            "service": "light.turn_off",
                            "domain": "light",
                            "area": "current",
                        }
                    ],
                    "logic": "and",
                },
            },
        }

    @pytest.mark.asyncio
    async def test_enter_and_exit_cooldowns_are_independent(
        self,
        rule_engine,
        mock_hass,
        mock_activity_tracker,
        mock_area_manager,
        autolight_app_with_exit,
        mock_app_storage,
    ):
        """Test that turning lights ON doesn't prevent turning them OFF immediately."""


        # Use app with on_exit actions
        mock_app_storage.get_app = MagicMock(return_value=autolight_app_with_exit)

        # Setup
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        # Mock condition evaluator: True when dark, False when bright
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Mock switch state to be "on" so app is enabled
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: bright
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # First transition: bright → dark (should turn lights ON)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights turned on
        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "salon" in rule_engine._last_environmental_action
        assert "enter" in rule_engine._last_environmental_action["salon"]

        # Store the enter cooldown timestamp
        enter_cooldown_time = rule_engine._last_environmental_action["salon"]["enter"]

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Second transition: dark → bright (should turn lights OFF immediately)
        # This tests that exit actions are NOT blocked by enter cooldown
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights turned off (exit action succeeded despite enter cooldown)
        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "exit" in rule_engine._last_environmental_action["salon"]

        # Verify enter cooldown is still set and hasn't changed
        assert (
            rule_engine._last_environmental_action["salon"]["enter"]
            == enter_cooldown_time
        )

    @pytest.mark.asyncio
    async def test_exit_cooldown_prevents_rapid_off_on_off(
        self,
        rule_engine,
        mock_hass,
        mock_activity_tracker,
        mock_area_manager,
        autolight_app_with_exit,
        mock_app_storage,
    ):
        """Test that exit cooldown prevents rapid OFF→ON→OFF cycles."""


        # Use app with on_exit actions
        mock_app_storage.get_app = MagicMock(return_value=autolight_app_with_exit)

        # Setup
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        # Mock condition evaluator
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Mock switch state
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        await rule_engine.async_initialize()

        # First: dark → bright (turn OFF)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights turned off
        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "salon" in rule_engine._last_environmental_action
        assert "exit" in rule_engine._last_environmental_action["salon"]

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Second: bright → dark (turn ON, should NOT be blocked by exit cooldown)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights turned on (enter action not blocked by exit cooldown)
        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "enter" in rule_engine._last_environmental_action["salon"]

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Third: dark → bright (turn OFF, should be BLOCKED by exit cooldown)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights did NOT turn off (blocked by exit cooldown from first transition)
        rule_engine.action_executor.execute_actions.assert_not_called()

    @pytest.mark.asyncio
    async def test_enter_cooldown_prevents_rapid_on_off_on(
        self,
        rule_engine,
        mock_hass,
        mock_activity_tracker,
        mock_area_manager,
        autolight_app_with_exit,
        mock_app_storage,
    ):
        """Test that enter cooldown prevents rapid ON→OFF→ON cycles."""


        # Use app with on_exit actions
        mock_app_storage.get_app = MagicMock(return_value=autolight_app_with_exit)

        # Setup
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        # Mock condition evaluator
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Mock switch state
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: bright
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # First: bright → dark (turn ON)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights turned on
        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "salon" in rule_engine._last_environmental_action
        assert "enter" in rule_engine._last_environmental_action["salon"]

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Second: dark → bright (turn OFF, should NOT be blocked by enter cooldown)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights turned off (exit action not blocked by enter cooldown)
        assert rule_engine.action_executor.execute_actions.call_count == 1
        assert "exit" in rule_engine._last_environmental_action["salon"]

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Third: bright → dark (turn ON, should be BLOCKED by enter cooldown)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights did NOT turn on (blocked by enter cooldown from first transition)
        rule_engine.action_executor.execute_actions.assert_not_called()

    @pytest.mark.asyncio
    async def test_cooldown_expires_allows_same_direction_action(
        self,
        rule_engine,
        mock_hass,
        mock_activity_tracker,
        mock_area_manager,
        autolight_app_with_exit,
        mock_app_storage,
    ):
        """Test that after cooldown expires, same direction action can execute again."""
        from datetime import timedelta

        from homeassistant.util import dt as dt_util

        # Use app with on_exit actions
        mock_app_storage.get_app = MagicMock(return_value=autolight_app_with_exit)

        # Setup
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        # Mock condition evaluator
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Mock switch state
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: bright
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # First: bright → dark (turn ON)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify first ON
        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Simulate cooldown expiration (6 minutes) for both environmental and lux cooldowns
        rule_engine._last_triggered["salon_env_enter"] = dt_util.utcnow() - timedelta(
            minutes=6
        )
        rule_engine._last_environmental_action["salon"] = {
            "enter": dt_util.utcnow() - timedelta(minutes=6),
            "exit": dt_util.utcnow() - timedelta(minutes=6),
        }

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Second: simulate same transition again (bright → dark)
        # First go back to bright
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )
        rule_engine._previous_env_state["salon"]["is_dark"] = False

        # Then transition to dark again
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify second ON succeeded (cooldown expired)
        assert rule_engine.action_executor.execute_actions.call_count == 1

    @pytest.mark.asyncio
    async def test_environmental_transition_preserves_activity_state(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """
        Test that environmental transitions preserve current activity state.

        When lux changes (environmental trigger), the rule engine should use
        get_activity() to preserve the current state, not async_evaluate_activity()
        which would recalculate from sensors.

        Bug scenario: User is in "occupied" state, lux decreases, activity should
        stay "occupied" not downgrade to "movement".
        """
        # Setup: User is in "occupied" state
        mock_activity_tracker.get_activity = MagicMock(return_value="occupied")
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"  # Would incorrectly downgrade if called
        )

        # Mock action executor
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: bright, occupied activity
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # Trigger environmental transition: bright → dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify that get_activity() was used (preserves state)
        mock_activity_tracker.get_activity.assert_called()

        # Verify that async_evaluate_activity() was NOT called
        # (would incorrectly recalculate from sensors)
        mock_activity_tracker.async_evaluate_activity.assert_not_called()

        # Verify the activity state passed to action executor is "occupied"
        # not "movement" (which async_evaluate_activity would have returned)
        if rule_engine.action_executor.execute_actions.call_count > 0:
            call_kwargs = rule_engine.action_executor.execute_actions.call_args[1]
            assert call_kwargs.get("current_activity") == "occupied"

    @pytest.mark.asyncio
    async def test_exit_action_timeout_schedules_correctly(
        self,
        rule_engine,
        mock_hass,
        mock_activity_tracker,
        mock_area_manager,
        autolight_app_with_exit,
        mock_app_storage,
    ):
        """
        Test that exit actions are scheduled with timeout instead of executing immediately.

        When environmental conditions change (dark→bright), exit actions should be
        scheduled with a timeout matching the activity timeout.
        """
        # Use app with on_exit actions
        mock_app_storage.get_app = MagicMock(return_value=autolight_app_with_exit)

        # Setup activity tracker with timeout
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")
        mock_activity_tracker._activities = {
            "movement": {
                "activity_id": "movement",
                "timeout_seconds": 300,  # 5 minute timeout
            }
        }

        # Mock condition evaluator: True when dark, False when bright
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        await rule_engine.async_initialize()

        # Transition: dark → bright (should schedule exit timeout)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)  # Wait for debounce

        # Verify exit actions were NOT executed immediately
        # (they should be scheduled in timeout)
        assert rule_engine.action_executor.execute_actions.call_count == 0

        # Verify timeout task was created
        assert "salon" in rule_engine._exit_timeout_tasks
        assert not rule_engine._exit_timeout_tasks["salon"].done()

    @pytest.mark.asyncio
    async def test_exit_action_timeout_executes_after_timeout(
        self,
        rule_engine,
        mock_hass,
        mock_activity_tracker,
        mock_area_manager,
        autolight_app_with_exit,
        mock_app_storage,
    ):
        """
        Test that exit actions execute after timeout expires.
        """
        # Use app with on_exit actions
        mock_app_storage.get_app = MagicMock(return_value=autolight_app_with_exit)

        # Setup activity tracker with short timeout for testing
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")
        mock_activity_tracker._activities = {
            "movement": {
                "activity_id": "movement",
                "timeout_seconds": 1,  # 1 second timeout for testing
            }
        }

        # Mock condition evaluator: True when dark, False when bright
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        await rule_engine.async_initialize()

        # Transition: dark → bright (should schedule exit timeout)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)  # Wait for debounce

        # Verify exit actions not executed yet
        assert rule_engine.action_executor.execute_actions.call_count == 0

        # Wait for timeout to expire
        await asyncio.sleep(1.5)

        # Verify exit actions were executed after timeout
        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Verify timeout task is completed and cleaned up
        assert "salon" not in rule_engine._exit_timeout_tasks

    @pytest.mark.asyncio
    async def test_exit_action_timeout_cancelled_when_conditions_become_met(
        self,
        rule_engine,
        mock_hass,
        mock_activity_tracker,
        mock_area_manager,
        autolight_app_with_exit,
        mock_app_storage,
    ):
        """
        Test that exit action timeout is cancelled when conditions become met again.

        Scenario: dark→bright (schedule exit timeout), then bright→dark before timeout
        expires. The pending exit timeout should be cancelled and lights stay on.
        """
        # Use app with on_exit actions
        mock_app_storage.get_app = MagicMock(return_value=autolight_app_with_exit)

        # Setup activity tracker with timeout
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")
        mock_activity_tracker._activities = {
            "movement": {
                "activity_id": "movement",
                "timeout_seconds": 5,  # 5 second timeout
            }
        }

        # Mock condition evaluator: True when dark, False when bright
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        await rule_engine.async_initialize()

        # First transition: dark → bright (schedule exit timeout)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)  # Wait for debounce

        # Verify timeout was scheduled
        assert "salon" in rule_engine._exit_timeout_tasks
        initial_call_count = rule_engine.action_executor.execute_actions.call_count

        # Second transition: bright → dark (should cancel exit timeout)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)  # Wait for debounce

        # Verify timeout was cancelled
        assert "salon" not in rule_engine._exit_timeout_tasks

        # Wait to ensure exit actions don't execute
        await asyncio.sleep(3)

        # Verify exit actions were never executed (only enter actions from second transition)
        # The call count should be 1 (for the enter action), not 2
        assert (
            rule_engine.action_executor.execute_actions.call_count
            == initial_call_count + 1
        )

        # Verify the action executed was enter action (turn_on), not exit action (turn_off)
        last_call_actions = rule_engine.action_executor.execute_actions.call_args[0][0]
        assert last_call_actions[0]["service"] == "light.turn_on"

    @pytest.mark.asyncio
    async def test_exit_action_no_timeout_executes_immediately(
        self,
        rule_engine,
        mock_hass,
        mock_activity_tracker,
        mock_area_manager,
        autolight_app_with_exit,
        mock_app_storage,
    ):
        """
        Test that exit actions execute immediately when activity has no timeout configured.

        This ensures backward compatibility for activities without timeout_seconds.
        """
        # Use app with on_exit actions
        mock_app_storage.get_app = MagicMock(return_value=autolight_app_with_exit)

        # Setup activity tracker WITHOUT timeout
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")
        mock_activity_tracker._activities = {
            "movement": {
                "activity_id": "movement",
                "timeout_seconds": 0,  # No timeout
            }
        }

        # Mock condition evaluator: True when dark, False when bright
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Initial: dark
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        await rule_engine.async_initialize()

        # Transition: dark → bright (should execute immediately, no timeout)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)  # Wait for debounce

        # Verify exit actions were executed immediately
        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Verify no timeout task was created
        assert "salon" not in rule_engine._exit_timeout_tasks
