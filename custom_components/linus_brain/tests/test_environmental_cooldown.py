"""
Unit tests for environmental cooldown feature.

Tests that the environmental_check_interval prevents rapid light flickering
when environmental values fluctuate near the threshold (e.g., 19→21→19 lux).
"""

import asyncio
from datetime import timedelta
from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.util import dt as dt_util

from ..utils.rule_engine import DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL, RuleEngine


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
def mock_app_storage_with_cooldown():
    """Mock AppStorage with configurable environmental_check_interval."""
    storage = MagicMock()

    # Autolight app with is_dark condition
    autolight_app = {
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
    storage.get_app = MagicMock(return_value=autolight_app)

    # Mock _data with configurable environmental_check_interval
    storage._data = {"environmental_check_interval": 30}

    return storage


@pytest.fixture
def mock_area_manager():
    """Mock AreaManager with environmental entities."""
    manager = MagicMock()

    def get_area_entities(area_id, domain=None, device_class=None):
        if domain == "sensor" and device_class == "illuminance":
            return ["sensor.salon_illuminance"]
        if domain == "binary_sensor" and device_class == "motion":
            return ["binary_sensor.salon_motion"]
        return []

    manager.get_area_entities = MagicMock(side_effect=get_area_entities)
    return manager


@pytest.fixture
def rule_engine(
    mock_hass, mock_activity_tracker, mock_app_storage_with_cooldown, mock_area_manager
):
    """Create RuleEngine instance."""
    return RuleEngine(
        mock_hass,
        "test_entry",
        mock_activity_tracker,
        mock_app_storage_with_cooldown,
        mock_area_manager,
    )


class TestEnvironmentalCooldownBasics:
    """Test basic environmental cooldown functionality."""

    def test_default_environmental_check_interval_constant(self):
        """Test that default environmental check interval is 30 seconds."""
        assert DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL == 30

    def test_has_lux_condition_detects_is_dark(self, rule_engine):
        """Test that _has_lux_condition detects is_dark area_state conditions."""
        conditions = [
            {
                "condition": "area_state",
                "area_id": "current",
                "attribute": "is_dark",
            }
        ]

        assert rule_engine._has_lux_condition(conditions) is True

    def test_has_lux_condition_detects_is_dark_with_state_key(self, rule_engine):
        """Test that _has_lux_condition detects is_dark with 'state' key."""
        conditions = [
            {
                "condition": "area_state",
                "area_id": "current",
                "state": "is_dark",
            }
        ]

        assert rule_engine._has_lux_condition(conditions) is True

    def test_has_lux_condition_nested_and(self, rule_engine):
        """Test detection in nested AND conditions."""
        conditions = [
            {
                "condition": "and",
                "conditions": [
                    {"condition": "state", "entity_id": "light.test", "state": "off"},
                    {"condition": "area_state", "attribute": "is_dark"},
                ],
            }
        ]

        assert rule_engine._has_lux_condition(conditions) is True

    def test_has_lux_condition_no_lux(self, rule_engine):
        """Test no detection when no is_dark condition exists."""
        conditions = [
            {"condition": "state", "entity_id": "light.test", "state": "off"},
            {"condition": "time", "after": "22:00"},
        ]

        assert rule_engine._has_lux_condition(conditions) is False

    def test_check_environmental_cooldown_no_previous_action(self, rule_engine):
        """Test cooldown check when no previous lux action."""
        # Should return True (not in cooldown) when no previous action
        assert rule_engine._check_environmental_cooldown("salon", "enter") is True

    def test_check_environmental_cooldown_within_cooldown(self, rule_engine):
        """Test cooldown check when within cooldown period."""
        # Set lux action 10 seconds ago
        rule_engine._last_environmental_action["salon"] = {
            "enter": dt_util.utcnow() - timedelta(seconds=10)
        }

        # Should be in cooldown (30 second default)
        assert rule_engine._check_environmental_cooldown("salon", "enter") is False

    def test_check_environmental_cooldown_after_cooldown(self, rule_engine):
        """Test cooldown check when cooldown period expired."""
        # Set lux action 40 seconds ago
        rule_engine._last_environmental_action["salon"] = {
            "enter": dt_util.utcnow() - timedelta(seconds=40)
        }

        # Should be out of cooldown (30 second default)
        assert rule_engine._check_environmental_cooldown("salon", "enter") is True

    def test_update_environmental_cooldown(self, rule_engine):
        """Test updating lux cooldown timestamp."""
        # Update cooldown
        rule_engine._update_environmental_cooldown("salon", "enter")

        # Verify timestamp was set
        assert "salon" in rule_engine._last_environmental_action
        assert "enter" in rule_engine._last_environmental_action["salon"]
        assert isinstance(
            rule_engine._last_environmental_action["salon"]["enter"],
            type(dt_util.utcnow()),
        )


class TestEnvironmentalCooldownSeparateEnterExit:
    """Test that enter and exit environmental cooldowns are tracked separately."""

    def test_enter_and_exit_cooldowns_independent(self, rule_engine):
        """Test that enter and exit cooldowns don't interfere."""
        # Set enter cooldown 10 seconds ago (in cooldown)
        rule_engine._last_environmental_action["salon"] = {
            "enter": dt_util.utcnow() - timedelta(seconds=10)
        }

        # Enter should be in cooldown
        assert rule_engine._check_environmental_cooldown("salon", "enter") is False

        # Exit should NOT be in cooldown (no exit action yet)
        assert rule_engine._check_environmental_cooldown("salon", "exit") is True

    def test_exit_cooldown_independent_from_enter(self, rule_engine):
        """Test that exit cooldown doesn't affect enter cooldown."""
        # Set exit cooldown 10 seconds ago
        rule_engine._last_environmental_action["salon"] = {
            "exit": dt_util.utcnow() - timedelta(seconds=10)
        }

        # Exit should be in cooldown
        assert rule_engine._check_environmental_cooldown("salon", "exit") is False

        # Enter should NOT be in cooldown
        assert rule_engine._check_environmental_cooldown("salon", "enter") is True

    def test_both_cooldowns_can_be_active(self, rule_engine):
        """Test that both enter and exit can be in cooldown simultaneously."""
        now = dt_util.utcnow()
        rule_engine._last_environmental_action["salon"] = {
            "enter": now - timedelta(seconds=10),
            "exit": now - timedelta(seconds=5),
        }

        # Both should be in cooldown
        assert rule_engine._check_environmental_cooldown("salon", "enter") is False
        assert rule_engine._check_environmental_cooldown("salon", "exit") is False


class TestEnvironmentalCooldownConfiguration:
    """Test configurable environmental cooldown values."""

    def test_default_cooldown_used_when_no_config(self, rule_engine):
        """Test that default 30s cooldown is used when no config."""
        # Remove config
        rule_engine.app_storage._data = {}

        # Set action 20 seconds ago
        rule_engine._last_environmental_action["salon"] = {
            "enter": dt_util.utcnow() - timedelta(seconds=20)
        }

        # Should still be in cooldown with default 30s
        assert rule_engine._check_environmental_cooldown("salon", "enter") is False

    def test_custom_cooldown_from_config(self, rule_engine):
        """Test that custom cooldown value is used from config."""
        # Set custom cooldown to 60 seconds
        rule_engine.app_storage._data["environmental_check_interval"] = 60

        # Set action 40 seconds ago
        rule_engine._last_environmental_action["salon"] = {
            "enter": dt_util.utcnow() - timedelta(seconds=40)
        }

        # Should still be in cooldown with custom 60s
        assert rule_engine._check_environmental_cooldown("salon", "enter") is False

        # Set action 70 seconds ago
        rule_engine._last_environmental_action["salon"] = {
            "enter": dt_util.utcnow() - timedelta(seconds=70)
        }

        # Should be out of cooldown now
        assert rule_engine._check_environmental_cooldown("salon", "enter") is True


class TestEnvironmentalCooldownIntegration:
    """Integration tests for environmental cooldown with rule engine."""

    @pytest.mark.asyncio
    async def test_environmental_flickering_prevented_by_cooldown(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test that rapid environmental fluctuations near threshold are prevented."""
        # Setup
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        # Mock switch state to be "on"
        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        # Mock condition evaluator: True when dark, False when bright
        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Initial: bright
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # First: 19 lux (dark) - lights should turn ON
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights turned on
        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Second: 21 lux (bright) - lights should turn OFF (exit action, different cooldown)
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights turned off (exit cooldown is separate)
        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Third: 19 lux (dark again) - should be BLOCKED by enter environmental cooldown
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights did NOT turn on (blocked by environmental cooldown)
        rule_engine.action_executor.execute_actions.assert_not_called()

        # Fourth: 21 lux (bright again) - should be BLOCKED by exit environmental cooldown
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify lights did NOT turn off (blocked by exit environmental cooldown)
        rule_engine.action_executor.execute_actions.assert_not_called()

    @pytest.mark.asyncio
    async def test_environmental_cooldown_expires_allows_action(
        self, rule_engine, mock_hass, mock_activity_tracker, mock_area_manager
    ):
        """Test that after environmental cooldown expires, same action can execute."""
        # Setup
        mock_activity_tracker.async_evaluate_activity = AsyncMock(
            return_value="movement"
        )
        mock_activity_tracker.get_activity = MagicMock(return_value="movement")

        mock_switch_state = MagicMock()
        mock_switch_state.state = "on"
        mock_hass.states.get = MagicMock(return_value=mock_switch_state)

        async def mock_conditions(conditions, area_id, logic):
            env_state = mock_area_manager.get_area_environmental_state(area_id)
            return env_state.get("is_dark", False)

        rule_engine.condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=mock_conditions
        )
        rule_engine.action_executor.execute_actions = AsyncMock(return_value=True)

        # Initial: bright
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": False}
        )

        await rule_engine.async_initialize()

        # First: dark - lights turn ON
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        event = MagicMock()
        event.data = {"entity_id": "sensor.salon_illuminance"}

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify first ON
        assert rule_engine.action_executor.execute_actions.call_count == 1

        # Simulate cooldown expiration (40 seconds for both cooldowns)
        rule_engine._last_triggered["salon_env_enter"] = dt_util.utcnow() - timedelta(
            seconds=400
        )
        rule_engine._last_environmental_action["salon"] = {
            "enter": dt_util.utcnow() - timedelta(seconds=40),
            "exit": dt_util.utcnow() - timedelta(seconds=40),
        }

        # Reset mock
        rule_engine.action_executor.execute_actions.reset_mock()

        # Reset previous env state to bright
        rule_engine._previous_env_state["salon"]["is_dark"] = False

        # Second: dark again (after cooldown) - should succeed
        mock_area_manager.get_area_environmental_state = MagicMock(
            return_value={"is_dark": True}
        )

        rule_engine._async_state_change_handler(event)
        await asyncio.sleep(2.5)

        # Verify second ON succeeded (cooldown expired)
        assert rule_engine.action_executor.execute_actions.call_count == 1
