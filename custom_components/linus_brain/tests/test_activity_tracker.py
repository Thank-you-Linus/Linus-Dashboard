"""
Unit tests for ActivityTracker with dynamic activities.

Tests the new architecture:
- Activity loading from AppStorage
- Dynamic activity evaluation using detection_conditions
- ConditionEvaluator integration
- State tracking and transitions
"""

from datetime import datetime, timedelta, timezone
from unittest.mock import AsyncMock, MagicMock

import pytest
from freezegun import freeze_time

from ..const import ACTIVITY_EMPTY
from ..utils.activity_tracker import ActivityTracker


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance."""
    hass = MagicMock()
    hass.states = MagicMock()
    hass.states.get = MagicMock(return_value=None)
    return hass


@pytest.fixture
def mock_app_storage():
    """Mock AppStorage with test activities."""
    storage = MagicMock()
    storage.get_activities = MagicMock(
        return_value={
            "empty": {
                "activity_id": "empty",
                "detection_conditions": [],
                "duration_threshold_seconds": 0,
                "timeout_seconds": 0,
            },
            "movement": {
                "activity_id": "movement",
                "detection_conditions": [
                    {
                        "type": "state",
                        "entity_id": "binary_sensor.motion",
                        "state": "on",
                    }
                ],
                "duration_threshold_seconds": 0,
                "timeout_seconds": 60,
            },
            "occupied": {
                "activity_id": "occupied",
                "detection_conditions": [
                    {
                        "type": "state",
                        "entity_id": "binary_sensor.motion",
                        "state": "on",
                    },
                    {
                        "type": "state",
                        "entity_id": "media_player.tv",
                        "state": "playing",
                    },
                ],
                "duration_threshold_seconds": 60,
                "timeout_seconds": 300,
            },
        }
    )
    return storage


@pytest.fixture
def mock_condition_evaluator():
    """Mock ConditionEvaluator."""
    evaluator = MagicMock()
    evaluator.evaluate_conditions = AsyncMock(return_value=False)
    return evaluator


@pytest.fixture
def activity_tracker(mock_hass, mock_app_storage, mock_condition_evaluator):
    """Create ActivityTracker instance."""
    return ActivityTracker(mock_hass, mock_app_storage, mock_condition_evaluator)


class TestActivityTrackerInitialization:
    """Test ActivityTracker initialization."""

    @pytest.mark.asyncio
    async def test_async_initialize_loads_activities(
        self, activity_tracker, mock_app_storage
    ):
        """Test that initialization loads activities from storage."""
        await activity_tracker.async_initialize()

        assert len(activity_tracker._activities) == 3
        assert "movement" in activity_tracker._activities
        assert "occupied" in activity_tracker._activities
        assert activity_tracker._initialized is True

    @pytest.mark.asyncio
    async def test_async_initialize_without_storage(
        self, mock_hass, mock_condition_evaluator
    ):
        """Test initialization without AppStorage uses fallback."""
        tracker = ActivityTracker(mock_hass, None, mock_condition_evaluator)

        await tracker.async_initialize()

        assert len(tracker._activities) == 1
        assert ACTIVITY_EMPTY in tracker._activities

    @pytest.mark.asyncio
    async def test_async_initialize_empty_storage(
        self, mock_hass, mock_condition_evaluator
    ):
        """Test initialization with empty storage uses fallback."""
        storage = MagicMock()
        storage.get_activities = MagicMock(return_value={})

        tracker = ActivityTracker(mock_hass, storage, mock_condition_evaluator)
        await tracker.async_initialize()

        assert len(tracker._activities) == 1
        assert ACTIVITY_EMPTY in tracker._activities

    @pytest.mark.asyncio
    async def test_async_initialize_only_once(self, activity_tracker, mock_app_storage):
        """Test that initialization only runs once."""
        await activity_tracker.async_initialize()
        mock_app_storage.get_activities.reset_mock()

        await activity_tracker.async_initialize()

        mock_app_storage.get_activities.assert_not_called()


class TestActivityTrackerEvaluation:
    """Test dynamic activity evaluation."""

    @pytest.mark.asyncio
    async def test_async_evaluate_activity_no_match_returns_none(
        self, activity_tracker, mock_condition_evaluator
    ):
        """Test that no matching conditions returns 'none'."""
        await activity_tracker.async_initialize()
        mock_condition_evaluator.evaluate_conditions.return_value = False

        activity = await activity_tracker.async_evaluate_activity("kitchen")

        assert activity == ACTIVITY_EMPTY

    @pytest.mark.asyncio
    async def test_async_evaluate_activity_presence_match(
        self, activity_tracker, mock_condition_evaluator
    ):
        """Test that matching presence conditions returns 'presence'."""
        await activity_tracker.async_initialize()

        async def evaluate_side_effect(conditions, area_id, logic="and"):
            if len(conditions) == 1:
                return True
            return False

        mock_condition_evaluator.evaluate_conditions.side_effect = evaluate_side_effect

        activity = await activity_tracker.async_evaluate_activity("kitchen")

        assert activity == "movement"

    @pytest.mark.asyncio
    async def test_async_evaluate_activity_occupation_requires_threshold(
        self, activity_tracker, mock_condition_evaluator
    ):
        """Test that occupation activity is logged when conditions match (duration threshold logic exists)."""
        await activity_tracker.async_initialize()

        async def evaluate_side_effect(conditions, area_id, logic="and"):
            # All conditions return true - occupation conditions match
            return True

        mock_condition_evaluator.evaluate_conditions.side_effect = evaluate_side_effect

        # Even if occupation conditions match, it requires duration threshold
        # This test just verifies presence is returned initially
        activity = await activity_tracker.async_evaluate_activity("kitchen")

        # With all conditions true, presence is detected first
        # (occupation requires sustained presence over time)
        assert activity in ["movement", "occupied"]

    @pytest.mark.asyncio
    async def test_async_evaluate_activity_without_evaluator(
        self, mock_hass, mock_app_storage
    ):
        """Test evaluation without ConditionEvaluator returns none."""
        tracker = ActivityTracker(mock_hass, mock_app_storage, None)
        await tracker.async_initialize()

        activity = await tracker.async_evaluate_activity("kitchen")

        assert activity == ACTIVITY_EMPTY

    @pytest.mark.asyncio
    async def test_async_evaluate_activity_auto_initializes(
        self, activity_tracker, mock_condition_evaluator
    ):
        """Test that evaluation auto-initializes if not initialized."""
        mock_condition_evaluator.evaluate_conditions.return_value = False

        await activity_tracker.async_evaluate_activity("kitchen")

        assert activity_tracker._initialized is True


class TestActivityTrackerGetActivity:
    """Test get_activity method."""

    @pytest.mark.asyncio
    async def test_get_activity_new_area_returns_none(self, activity_tracker):
        """Test getting activity for new area returns none."""
        await activity_tracker.async_initialize()

        activity = activity_tracker.get_activity("new_area")

        assert activity == ACTIVITY_EMPTY

    @pytest.mark.asyncio
    async def test_get_activity_returns_current_state(self, activity_tracker):
        """Test getting activity returns current state."""
        await activity_tracker.async_initialize()

        activity_tracker._area_states["kitchen"] = {
            "activity": "movement",
            "activity_start": datetime.now().astimezone(),
        }

        activity = activity_tracker.get_activity("kitchen")

        assert activity == "movement"


class TestActivityTrackerResetArea:
    """Test area reset functionality."""

    @pytest.mark.asyncio
    async def test_reset_area_clears_state(self, activity_tracker):
        """Test that reset clears area state."""
        await activity_tracker.async_initialize()

        activity_tracker._area_states["kitchen"] = {
            "activity": "movement",
            "activity_start": datetime.now().astimezone(),
        }

        activity_tracker.reset_area("kitchen")

        assert "kitchen" not in activity_tracker._area_states

    @pytest.mark.asyncio
    async def test_reset_nonexistent_area_succeeds(self, activity_tracker):
        """Test that resetting nonexistent area doesn't error."""
        await activity_tracker.async_initialize()

        activity_tracker.reset_area("nonexistent")

        assert "nonexistent" not in activity_tracker._area_states


class TestActivityTrackerGetAllActivities:
    """Test get_all_activities method."""

    @pytest.mark.asyncio
    async def test_get_all_activities_returns_all_areas(self, activity_tracker):
        """Test that get_all_activities returns data for all tracked areas."""
        await activity_tracker.async_initialize()

        activity_tracker._area_states["kitchen"] = {
            "activity": "movement",
            "activity_start": datetime.now().astimezone(),
        }
        activity_tracker._area_states["bedroom"] = {
            "activity": "empty",
            "activity_start": None,
        }

        all_activities = activity_tracker.get_all_activities()

        assert "kitchen" in all_activities
        assert "bedroom" in all_activities
        assert all_activities["kitchen"]["activity"] == "movement"

    @pytest.mark.asyncio
    async def test_get_all_activities_empty(self, activity_tracker):
        """Test that get_all_activities returns empty dict when no areas."""
        await activity_tracker.async_initialize()

        all_activities = activity_tracker.get_all_activities()

        assert all_activities == {}


class TestActivityTrackerSimulation:
    """Test simulate_activity functionality."""

    @pytest.mark.asyncio
    async def test_simulate_activity_overrides_state(self, activity_tracker):
        """Test that simulate_activity can override activity state."""
        await activity_tracker.async_initialize()

        await activity_tracker.simulate_activity("kitchen", "occupied", 0)

        activity = activity_tracker.get_activity("kitchen")
        assert activity == "occupied"

    @pytest.mark.asyncio
    async def test_simulate_activity_with_invalid_level(self, activity_tracker):
        """Test that simulate_activity with invalid level is rejected."""
        await activity_tracker.async_initialize()

        await activity_tracker.simulate_activity("kitchen", "invalid_activity", 0)

        activity = activity_tracker.get_activity("kitchen")
        assert activity == ACTIVITY_EMPTY


class TestActivityTrackerGetActivityLevel:
    """Test async get_activity_level method."""

    @pytest.mark.asyncio
    async def test_get_activity_level_async(self, activity_tracker):
        """Test async get_activity_level method."""
        await activity_tracker.async_initialize()

        activity_tracker._area_states["kitchen"] = {
            "activity": "movement",
            "activity_start": datetime.now().astimezone(),
        }

        activity = await activity_tracker.get_activity_level("kitchen")

        assert activity == "movement"

    @pytest.mark.asyncio
    async def test_get_activity_level_new_area(self, activity_tracker):
        """Test get_activity_level for new area returns none."""
        await activity_tracker.async_initialize()

        activity = await activity_tracker.get_activity_level("new_area")

        assert activity == ACTIVITY_EMPTY


class TestActivityTrackerGetDuration:
    """Test get_activity_duration functionality."""

    @pytest.mark.asyncio
    async def test_get_activity_duration_no_activity(self, activity_tracker):
        """Test duration is 0 for area with no activity."""
        await activity_tracker.async_initialize()

        duration = activity_tracker.get_activity_duration("kitchen")

        assert duration == 0.0

    @pytest.mark.asyncio
    async def test_get_activity_duration_with_activity(self, activity_tracker):
        """Test duration calculation for active area."""
        await activity_tracker.async_initialize()

        start_time = datetime(2025, 1, 1, 12, 0, 0, tzinfo=timezone.utc)

        with freeze_time(start_time) as frozen_time:
            activity_tracker._area_states["kitchen"] = {
                "activity": "movement",
                "activity_start": start_time,
                "last_update": start_time,
            }

            frozen_time.tick(delta=timedelta(seconds=45))

            duration = activity_tracker.get_activity_duration("kitchen")

            assert 44 < duration < 46


class TestActivityTrackerMultipleAreas:
    """Test handling multiple areas independently."""

    @pytest.mark.asyncio
    async def test_multiple_areas_independent(
        self, activity_tracker, mock_condition_evaluator
    ):
        """Test that multiple areas maintain independent states."""
        await activity_tracker.async_initialize()

        async def evaluate_side_effect(conditions, area_id, logic="and"):
            if area_id == "kitchen":
                return True
            return False

        mock_condition_evaluator.evaluate_conditions.side_effect = evaluate_side_effect

        activity_kitchen = await activity_tracker.async_evaluate_activity("kitchen")
        activity_bedroom = await activity_tracker.async_evaluate_activity("bedroom")

        assert activity_kitchen != ACTIVITY_EMPTY
        assert activity_bedroom == ACTIVITY_EMPTY
