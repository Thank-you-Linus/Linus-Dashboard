"""
Integration tests for full automation flow.

Tests the complete architecture:
- Presence sensor change → ActivityTracker evaluation
- Activity change → RuleEngine app execution
- AppStorage loading → App assignment → Action execution
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from ..utils.activity_tracker import ActivityTracker
from ..utils.app_storage import AppStorage
from ..utils.condition_evaluator import ConditionEvaluator
from ..utils.entity_resolver import EntityResolver
from ..utils.rule_engine import RuleEngine


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance with full setup."""
    hass = MagicMock()
    hass.states = MagicMock()
    hass.states.get = MagicMock(return_value=None)
    hass.services = MagicMock()
    hass.services.async_call = AsyncMock()
    hass.bus = MagicMock()
    hass.bus.async_listen = MagicMock()

    # Mock async_add_executor_job to execute functions directly
    async def mock_executor_job(func, *args):
        return func(*args)

    hass.async_add_executor_job = mock_executor_job
    return hass


@pytest.fixture
def app_storage_with_data(mock_hass, tmp_path):
    """AppStorage with test data."""
    storage = AppStorage(mock_hass, tmp_path)

    storage._data = {
        "version": 1,
        "activities": {
            "none": {
                "activity_id": "none",
                "detection_conditions": [],
                "duration_threshold_seconds": 0,
                "timeout_seconds": 0,
            },
            "presence": {
                "activity_id": "presence",
                "detection_conditions": [
                    {
                        "condition": "state",
                        "entity_id": "binary_sensor.motion_kitchen",
                        "state": "on",
                    }
                ],
                "duration_threshold_seconds": 0,
                "timeout_seconds": 60,
            },
            "occupation": {
                "activity_id": "occupation",
                "detection_conditions": [
                    {
                        "condition": "state",
                        "entity_id": "binary_sensor.motion_kitchen",
                        "state": "on",
                    },
                    {
                        "condition": "numeric_state",
                        "entity_id": "sensor.duration",
                        "above": 60,
                    },
                ],
                "duration_threshold_seconds": 60,
                "timeout_seconds": 300,
            },
        },
        "apps": {
            "autolight": {
                "id": "autolight",
                "name": "AutoLight",
                "version": "1.0",
                "activity_actions": {
                    "presence": {
                        "conditions": [
                            {
                                "condition": "numeric_state",
                                "entity_id": "sensor.lux",
                                "below": 100,
                            }
                        ],
                        "actions": [
                            {
                                "service": "light.turn_on",
                                "entity_id": "light.kitchen",
                                "data": {"brightness": 255},
                            }
                        ],
                    },
                    "occupation": {
                        "conditions": [],
                        "actions": [
                            {
                                "service": "light.turn_on",
                                "entity_id": "light.kitchen",
                                "data": {"brightness": 150},
                            }
                        ],
                    },
                    "none": {
                        "conditions": [],
                        "actions": [
                            {"service": "light.turn_off", "entity_id": "light.kitchen"}
                        ],
                    },
                },
            }
        },
        "assignments": {
            "kitchen": {"area_id": "kitchen", "app_id": "autolight", "config": {}}
        },
        "synced_at": None,
        "is_fallback": False,
    }

    return storage


@pytest.fixture
def integrated_system(mock_hass, app_storage_with_data):
    """Fully integrated system with all components."""
    entity_resolver = EntityResolver(mock_hass)
    condition_evaluator = ConditionEvaluator(mock_hass, entity_resolver, None)

    activity_tracker = ActivityTracker(
        mock_hass, app_storage_with_data, condition_evaluator
    )

    condition_evaluator.activity_tracker = activity_tracker

    rule_engine = RuleEngine(
        mock_hass, "test_entry", activity_tracker, app_storage_with_data
    )

    return {
        "hass": mock_hass,
        "app_storage": app_storage_with_data,
        "entity_resolver": entity_resolver,
        "condition_evaluator": condition_evaluator,
        "activity_tracker": activity_tracker,
        "rule_engine": rule_engine,
    }


class TestIntegrationFullFlow:
    """Test complete automation flow from presence to action."""

    @pytest.mark.asyncio
    async def test_presence_detected_triggers_light_on(self, integrated_system):
        """Test that presence detection triggers light on when conditions met."""
        system = integrated_system

        mock_motion_state = MagicMock()
        mock_motion_state.state = "on"

        mock_lux_state = MagicMock()
        mock_lux_state.state = "50"

        def get_state_side_effect(entity_id):
            if entity_id == "binary_sensor.motion_kitchen":
                return mock_motion_state
            elif entity_id == "sensor.lux":
                return mock_lux_state
            return None

        system["hass"].states.get.side_effect = get_state_side_effect

        await system["activity_tracker"].async_initialize()
        await system["rule_engine"].async_initialize()

        activity = await system["activity_tracker"].async_evaluate_activity("kitchen")

        assert activity == "presence"

        await system["rule_engine"]._async_evaluate_and_execute("kitchen")

        system["hass"].services.async_call.assert_called()
        calls = system["hass"].services.async_call.call_args_list

        light_on_call = next(
            (c for c in calls if "light" in str(c) and "turn_on" in str(c)), None
        )
        assert light_on_call is not None
        calls = system["hass"].services.async_call.call_args_list

        light_on_call = next(
            (c for c in calls if "light" in str(c) and "turn_on" in str(c)), None
        )
        assert light_on_call is not None


class TestIntegrationAppAssignment:
    """Test app assignment and execution."""

    @pytest.mark.asyncio
    async def test_remove_assignment_disables_automation(self, integrated_system):
        """Test that removing assignment disables automation."""
        system = integrated_system

        await system["rule_engine"].async_initialize()

        result = await system["rule_engine"].delete_assignment("kitchen")

        assert result is True
        assert "kitchen" not in system["rule_engine"]._assignments


class TestIntegrationAppStorage:
    """Test AppStorage integration."""

    @pytest.mark.asyncio
    async def test_storage_provides_activities_to_tracker(self, integrated_system):
        """Test that AppStorage provides activities to ActivityTracker."""
        system = integrated_system

        await system["activity_tracker"].async_initialize()

        activities = system["activity_tracker"]._activities

        assert "presence" in activities
        assert "occupation" in activities

    @pytest.mark.asyncio
    async def test_storage_provides_apps_to_rule_engine(self, integrated_system):
        """Test that AppStorage provides apps to RuleEngine."""
        system = integrated_system

        await system["rule_engine"].async_initialize()

        app = system["app_storage"].get_app("autolight")

        assert app is not None
        assert app["id"] == "autolight"
        assert "activity_actions" in app


class TestIntegrationFallback:
    """Test fallback behavior when storage is empty."""

    @pytest.mark.asyncio
    async def test_empty_storage_uses_fallback(self, mock_hass, tmp_path):
        """Test that empty storage loads fallback data."""
        storage = AppStorage(mock_hass, tmp_path)

        storage.load_hardcoded_fallback()

        assert storage.is_fallback_data() is True
        assert len(storage.get_activities()) == 4
        assert "automatic_lighting" in storage.get_apps()

    @pytest.mark.asyncio
    async def test_system_works_with_fallback_data(self, mock_hass, tmp_path):
        """Test that complete system works with fallback data."""
        storage = AppStorage(mock_hass, tmp_path)
        storage.load_hardcoded_fallback()

        entity_resolver = EntityResolver(mock_hass)
        condition_evaluator = ConditionEvaluator(mock_hass, entity_resolver, None)

        activity_tracker = ActivityTracker(mock_hass, storage, condition_evaluator)

        await activity_tracker.async_initialize()

        assert len(activity_tracker._activities) == 4


class TestIntegrationConditionEvaluation:
    """Test condition evaluation in full flow."""

    @pytest.mark.asyncio
    async def test_numeric_condition_blocks_action(self, integrated_system):
        """Test that failing numeric condition blocks action."""
        system = integrated_system

        mock_motion_state = MagicMock()
        mock_motion_state.state = "on"

        mock_lux_state = MagicMock()
        mock_lux_state.state = "200"

        def get_state_side_effect(entity_id):
            if entity_id == "binary_sensor.motion_kitchen":
                return mock_motion_state
            elif entity_id == "sensor.lux":
                return mock_lux_state
            return None

        system["hass"].states.get.side_effect = get_state_side_effect

        await system["activity_tracker"].async_initialize()
        await system["rule_engine"].async_initialize()

        await system["activity_tracker"].async_evaluate_activity("kitchen")

        system["hass"].services.async_call.reset_mock()

        await system["rule_engine"]._async_evaluate_and_execute("kitchen")

        system["hass"].services.async_call.assert_not_called()

    @pytest.mark.asyncio
    async def test_state_condition_enables_action(self, integrated_system):
        """Test that passing state condition enables action."""
        system = integrated_system

        mock_motion_state = MagicMock()
        mock_motion_state.state = "on"

        mock_lux_state = MagicMock()
        mock_lux_state.state = "50"

        def get_state_side_effect(entity_id):
            if entity_id == "binary_sensor.motion_kitchen":
                return mock_motion_state
            elif entity_id == "sensor.lux":
                return mock_lux_state
            return None

        system["hass"].states.get.side_effect = get_state_side_effect

        await system["activity_tracker"].async_initialize()
        await system["rule_engine"].async_initialize()

        await system["activity_tracker"].async_evaluate_activity("kitchen")

        system["hass"].services.async_call.reset_mock()

        await system["rule_engine"]._async_evaluate_and_execute("kitchen")

        system["hass"].services.async_call.assert_called()
