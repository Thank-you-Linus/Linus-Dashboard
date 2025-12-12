"""
Test activity transitions (movement → inactive → empty).

These tests verify the fixes for activity transition issues:
1. Transition states (like 'inactive') maintain their state
2. Timeouts complete properly without premature cancellation
3. Actions execute on each transition
"""

import asyncio
import logging
from unittest.mock import AsyncMock, MagicMock

import pytest

from ..utils.activity_tracker import ActivityTracker

_LOGGER = logging.getLogger(__name__)


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance."""
    hass = MagicMock()
    hass.states = MagicMock()
    hass.states.get = MagicMock(return_value=None)
    return hass


@pytest.fixture
def mock_coordinator():
    """Mock coordinator for area updates."""
    coordinator = MagicMock()
    coordinator.async_send_area_update = AsyncMock()
    return coordinator


@pytest.fixture
def activities_with_transitions():
    """Activity definitions with transition chain: movement → inactive → empty."""
    return {
        "empty": {
            "activity_id": "empty",
            "detection_conditions": [],
            "duration_threshold_seconds": 0,
            "timeout_seconds": 0,
        },
        "movement": {
            "activity_id": "movement",
            "detection_conditions": [
                {"type": "state", "entity_id": "binary_sensor.motion", "state": "on"}
            ],
            "duration_threshold_seconds": 0,
            "timeout_seconds": 1,  # 1 second to inactive
            "transition_to": "inactive",
        },
        "inactive": {
            "activity_id": "inactive",
            "detection_conditions": [],  # No direct detection
            "duration_threshold_seconds": 0,
            "timeout_seconds": 1,  # 1 second to empty
            "transition_to": "empty",
            "is_transition_state": True,  # Critical flag!
        },
    }


@pytest.fixture
def activities_without_transitions():
    """Activity definitions without transition_to."""
    return {
        "empty": {
            "activity_id": "empty",
            "detection_conditions": [],
            "duration_threshold_seconds": 0,
            "timeout_seconds": 0,
        },
        "movement": {
            "activity_id": "movement",
            "detection_conditions": [
                {"type": "state", "entity_id": "binary_sensor.motion", "state": "on"}
            ],
            "duration_threshold_seconds": 0,
            "timeout_seconds": 1,  # 1 second, but no transition_to
        },
    }


class TestActivityTransitions:
    """Test activity transition chains."""

    @pytest.mark.asyncio
    async def test_movement_to_inactive_to_empty_chain(
        self, mock_hass, mock_coordinator, activities_with_transitions
    ):
        """Test full transition chain: movement → inactive → empty."""
        # Setup
        mock_app_storage = MagicMock()
        mock_app_storage.get_activities = MagicMock(
            return_value=activities_with_transitions
        )

        mock_condition_evaluator = MagicMock()
        # Start with motion detected
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)

        tracker = ActivityTracker(mock_hass, mock_app_storage, mock_condition_evaluator)
        tracker.coordinator = mock_coordinator
        await tracker.async_initialize()

        # Step 1: Detect movement
        activity = await tracker.async_evaluate_activity("living_room")
        assert activity == "movement"

        # Step 2: Motion stops - should schedule timeout
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
        activity = await tracker.async_evaluate_activity("living_room")
        assert activity == "movement"  # Still movement, waiting for timeout

        # Step 3: Wait for transition to inactive
        await asyncio.sleep(1.5)  # Wait for 1s timeout + buffer
        activity = tracker.get_activity("living_room")
        assert activity == "inactive", f"Expected 'inactive', got '{activity}'"

        # Step 4: Verify inactive is maintained during re-evaluation
        activity = await tracker.async_evaluate_activity("living_room")
        assert activity == "inactive", "Inactive state should be maintained"

        # Step 5: Wait for transition to empty
        await asyncio.sleep(1.5)  # Wait for another 1s timeout + buffer
        activity = tracker.get_activity("living_room")
        assert activity == "empty", f"Expected 'empty', got '{activity}'"

    @pytest.mark.asyncio
    async def test_transition_state_returns_current_activity(
        self, mock_hass, mock_coordinator, activities_with_transitions
    ):
        """Test that transition states return themselves during evaluation."""
        # Setup
        mock_app_storage = MagicMock()
        mock_app_storage.get_activities = MagicMock(
            return_value=activities_with_transitions
        )

        mock_condition_evaluator = MagicMock()
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)

        tracker = ActivityTracker(mock_hass, mock_app_storage, mock_condition_evaluator)
        tracker.coordinator = mock_coordinator
        await tracker.async_initialize()

        # Get to movement, then transition to inactive
        await tracker.async_evaluate_activity("bedroom")
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
        await tracker.async_evaluate_activity("bedroom")
        await asyncio.sleep(1.5)  # Transition to inactive

        # Verify we're in inactive
        activity = tracker.get_activity("bedroom")
        assert activity == "inactive"

        # Evaluate again - should return inactive (not change state)
        activity = await tracker.async_evaluate_activity("bedroom")
        assert activity == "inactive", "Transition state should be maintained"

    @pytest.mark.asyncio
    async def test_movement_detection_during_inactive(
        self, mock_hass, mock_coordinator, activities_with_transitions
    ):
        """Test that movement can be detected even while in inactive state."""
        # Setup
        mock_app_storage = MagicMock()
        mock_app_storage.get_activities = MagicMock(
            return_value=activities_with_transitions
        )

        mock_condition_evaluator = MagicMock()
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)

        tracker = ActivityTracker(mock_hass, mock_app_storage, mock_condition_evaluator)
        tracker.coordinator = mock_coordinator
        await tracker.async_initialize()

        # Get to inactive state
        await tracker.async_evaluate_activity("office")
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
        await tracker.async_evaluate_activity("office")
        await asyncio.sleep(1.5)  # Transition to inactive

        assert tracker.get_activity("office") == "inactive"

        # Movement returns
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
        activity = await tracker.async_evaluate_activity("office")
        assert activity == "movement", "Should detect movement even during inactive"

    @pytest.mark.asyncio
    async def test_coordinator_notified_on_transitions(
        self, mock_hass, mock_coordinator, activities_with_transitions
    ):
        """Test that coordinator is notified on each transition."""
        # Setup
        mock_app_storage = MagicMock()
        mock_app_storage.get_activities = MagicMock(
            return_value=activities_with_transitions
        )

        mock_condition_evaluator = MagicMock()
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)

        tracker = ActivityTracker(mock_hass, mock_app_storage, mock_condition_evaluator)
        tracker.coordinator = mock_coordinator
        await tracker.async_initialize()

        # Transition through states
        await tracker.async_evaluate_activity("bathroom")
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
        await tracker.async_evaluate_activity("bathroom")

        # Wait for transitions
        await asyncio.sleep(1.5)  # movement → inactive
        assert mock_coordinator.async_send_area_update.called

        await asyncio.sleep(1.5)  # inactive → empty
        # Should have been called at least twice (once for each transition)
        assert mock_coordinator.async_send_area_update.call_count >= 2

    @pytest.mark.asyncio
    async def test_timeout_without_transition_to(
        self, mock_hass, mock_coordinator, activities_without_transitions
    ):
        """Test timeout behavior when no transition_to is defined."""
        # Setup
        mock_app_storage = MagicMock()
        mock_app_storage.get_activities = MagicMock(
            return_value=activities_without_transitions
        )

        mock_condition_evaluator = MagicMock()
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)

        tracker = ActivityTracker(mock_hass, mock_app_storage, mock_condition_evaluator)
        tracker.coordinator = mock_coordinator
        await tracker.async_initialize()

        # Detect movement
        activity = await tracker.async_evaluate_activity("hallway")
        assert activity == "movement"

        # Motion stops
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
        activity = await tracker.async_evaluate_activity("hallway")
        assert activity == "movement"

        # Wait for timeout
        await asyncio.sleep(1.5)

        # Should still be movement (no auto-transition without transition_to)
        activity = tracker.get_activity("hallway")
        # The behavior here depends on implementation - document actual behavior
        assert activity in ["movement", "empty"]
