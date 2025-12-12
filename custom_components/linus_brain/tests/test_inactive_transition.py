import asyncio
from unittest.mock import AsyncMock, MagicMock

import pytest
import pytest_asyncio
from homeassistant.core import HomeAssistant

from ..coordinator import LinusBrainCoordinator
from ..utils.activity_tracker import ActivityTracker
from ..utils.app_storage import AppStorage
from ..utils.condition_evaluator import ConditionEvaluator


@pytest.fixture
def mock_coordinator():
    coordinator = MagicMock(spec=LinusBrainCoordinator)
    coordinator.async_send_area_update = AsyncMock()
    return coordinator


@pytest.fixture
def mock_app_storage_with_inactive():
    app_storage = MagicMock(spec=AppStorage)
    app_storage.get_activities.return_value = {
        "empty": {
            "activity_id": "empty",
            "activity_name": "No Activity",
            "description": "No presence detected in area",
            "detection_conditions": [],
            "duration_threshold_seconds": 0,
            "timeout_seconds": 0,
            "transition_to": None,
            "is_transition_state": False,
            "is_system": True,
        },
        "movement": {
            "activity_id": "movement",
            "activity_name": "Movement Detected",
            "description": "Short-term presence in area",
            "detection_conditions": [
                {
                    "condition": "state",
                    "domain": "binary_sensor",
                    "device_class": "motion",
                    "state": "on",
                }
            ],
            "duration_threshold_seconds": 0,
            "timeout_seconds": 0,
            "transition_to": "inactive",
            "is_transition_state": False,
            "is_system": True,
        },
        "inactive": {
            "activity_id": "inactive",
            "activity_name": "Inactive",
            "description": "Transition state after movement stops",
            "detection_conditions": [],
            "duration_threshold_seconds": 0,
            "timeout_seconds": 2,
            "transition_to": "empty",
            "is_transition_state": True,
            "is_system": True,
        },
    }
    return app_storage


@pytest.fixture
def mock_condition_evaluator():
    evaluator = MagicMock(spec=ConditionEvaluator)
    return evaluator


@pytest_asyncio.fixture
async def activity_tracker_with_inactive(
    hass, mock_app_storage_with_inactive, mock_condition_evaluator
):
    tracker = ActivityTracker(
        hass, mock_app_storage_with_inactive, mock_condition_evaluator
    )
    await tracker.async_initialize()
    yield tracker
    for task in tracker._timeout_tasks.values():
        if not task.done():
            task.cancel()
            try:
                await task
            except asyncio.CancelledError:
                pass


@pytest.mark.asyncio
async def test_movement_transitions_to_inactive_immediately(
    hass: HomeAssistant,
    activity_tracker_with_inactive: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area_id = "living_room"
    activity_tracker_with_inactive.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)
    assert activity == "movement"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)

    await asyncio.sleep(0.1)

    assert activity_tracker_with_inactive.get_activity(area_id) == "inactive"
    mock_coordinator.async_send_area_update.assert_called_with(area_id)


@pytest.mark.asyncio
async def test_inactive_transitions_to_empty_after_timeout(
    hass: HomeAssistant,
    activity_tracker_with_inactive: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area_id = "living_room"
    activity_tracker_with_inactive.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)
    assert activity == "movement"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    await activity_tracker_with_inactive.async_evaluate_activity(area_id)

    await asyncio.sleep(0.2)
    assert activity_tracker_with_inactive.get_activity(area_id) == "inactive"

    await asyncio.sleep(2.5)
    assert activity_tracker_with_inactive.get_activity(area_id) == "empty"
    assert mock_coordinator.async_send_area_update.call_count >= 2


@pytest.mark.asyncio
async def test_reactivation_during_inactive_returns_to_movement(
    hass: HomeAssistant,
    activity_tracker_with_inactive: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area_id = "living_room"
    activity_tracker_with_inactive.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)
    assert activity == "movement"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    await activity_tracker_with_inactive.async_evaluate_activity(area_id)

    await asyncio.sleep(0.2)
    assert activity_tracker_with_inactive.get_activity(area_id) == "inactive"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)
    assert activity == "movement"

    await asyncio.sleep(2.5)
    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)
    assert activity == "movement"


@pytest.mark.asyncio
async def test_inactive_is_not_directly_detected(
    hass: HomeAssistant,
    activity_tracker_with_inactive: ActivityTracker,
    mock_condition_evaluator: MagicMock,
):
    area_id = "living_room"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)

    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)

    assert activity == "empty"
    assert activity != "inactive"


@pytest.mark.asyncio
async def test_complete_transition_chain(
    hass: HomeAssistant,
    activity_tracker_with_inactive: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area_id = "living_room"
    activity_tracker_with_inactive.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)
    assert activity == "movement"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    await activity_tracker_with_inactive.async_evaluate_activity(area_id)

    await asyncio.sleep(0.2)
    assert activity_tracker_with_inactive.get_activity(area_id) == "inactive"

    await asyncio.sleep(2.5)
    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)
    assert activity == "empty"


@pytest.mark.asyncio
async def test_timeout_cancelled_on_inactive_reactivation(
    hass: HomeAssistant,
    activity_tracker_with_inactive: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area_id = "living_room"
    activity_tracker_with_inactive.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    await activity_tracker_with_inactive.async_evaluate_activity(area_id)

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    await activity_tracker_with_inactive.async_evaluate_activity(area_id)

    await asyncio.sleep(0.2)
    assert activity_tracker_with_inactive.get_activity(area_id) == "inactive"
    assert area_id in activity_tracker_with_inactive._timeout_tasks

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    await activity_tracker_with_inactive.async_evaluate_activity(area_id)

    await asyncio.sleep(0.1)
    timeout_task = activity_tracker_with_inactive._timeout_tasks.get(area_id)
    assert timeout_task is None or timeout_task.cancelled() or timeout_task.done()


@pytest.mark.asyncio
async def test_multiple_areas_independent_inactive_transitions(
    hass: HomeAssistant,
    activity_tracker_with_inactive: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area1 = "living_room"
    area2 = "kitchen"
    activity_tracker_with_inactive.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    await activity_tracker_with_inactive.async_evaluate_activity(area1)
    assert activity_tracker_with_inactive.get_activity(area1) == "movement"

    await asyncio.sleep(0.5)

    await activity_tracker_with_inactive.async_evaluate_activity(area2)
    assert activity_tracker_with_inactive.get_activity(area2) == "movement"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    await activity_tracker_with_inactive.async_evaluate_activity(area1)

    await asyncio.sleep(0.2)
    assert activity_tracker_with_inactive.get_activity(area1) == "inactive"

    await asyncio.sleep(1)

    await activity_tracker_with_inactive.async_evaluate_activity(area2)
    await asyncio.sleep(0.2)
    assert activity_tracker_with_inactive.get_activity(area2) == "inactive"

    await asyncio.sleep(1.5)
    assert activity_tracker_with_inactive.get_activity(area1) == "empty"
    assert activity_tracker_with_inactive.get_activity(area2) == "inactive"

    await asyncio.sleep(1)
    assert activity_tracker_with_inactive.get_activity(area2) == "empty"


@pytest.mark.asyncio
async def test_get_next_activity_returns_correct_transition(
    hass: HomeAssistant,
    activity_tracker_with_inactive: ActivityTracker,
):
    assert activity_tracker_with_inactive._get_next_activity("movement") == "inactive"
    assert activity_tracker_with_inactive._get_next_activity("inactive") == "empty"
    assert activity_tracker_with_inactive._get_next_activity("empty") is None
    assert activity_tracker_with_inactive._get_next_activity("nonexistent") is None


@pytest.mark.asyncio
async def test_inactive_transitions_to_empty_despite_continuous_reevaluation(
    hass: HomeAssistant,
    activity_tracker_with_inactive: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    """
    Test that simulates real production behavior where the coordinator
    continuously re-evaluates activities (e.g., heartbeat every 60s, state changes).

    This test catches the bug where re-evaluation during transition state
    would cancel the timeout, causing the activity to stay stuck on "inactive".
    """
    area_id = "living_room"
    activity_tracker_with_inactive.coordinator = mock_coordinator

    # Start with movement
    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker_with_inactive.async_evaluate_activity(area_id)
    assert activity == "movement"

    # Movement conditions stop, should transition to inactive
    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    await activity_tracker_with_inactive.async_evaluate_activity(area_id)

    await asyncio.sleep(0.2)
    assert activity_tracker_with_inactive.get_activity(area_id) == "inactive"

    # Simulate continuous re-evaluation (like coordinator heartbeat or state changes)
    # This should NOT cancel the timeout - the activity should still transition to empty
    for i in range(3):
        await asyncio.sleep(0.5)
        # Re-evaluate activity (conditions still false)
        await activity_tracker_with_inactive.async_evaluate_activity(area_id)
        current = activity_tracker_with_inactive.get_activity(area_id)
        # Should still be inactive until timeout expires
        if i < 2:
            assert (
                current == "inactive"
            ), f"Iteration {i}: Expected inactive, got {current}"

    # After the 2-second timeout (plus our 1.5s of re-evaluations), should transition to empty
    await asyncio.sleep(1)
    final_activity = activity_tracker_with_inactive.get_activity(area_id)
    assert (
        final_activity == "empty"
    ), f"Expected empty after timeout, got {final_activity}"
