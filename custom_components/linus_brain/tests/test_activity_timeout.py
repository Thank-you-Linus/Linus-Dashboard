import asyncio
from unittest.mock import AsyncMock, MagicMock, patch

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
def mock_app_storage():
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
            "timeout_seconds": 2,
            "transition_to": "empty",
            "is_system": True,
        },
    }
    return app_storage


@pytest.fixture
def mock_condition_evaluator():
    evaluator = MagicMock(spec=ConditionEvaluator)
    return evaluator


@pytest_asyncio.fixture
async def activity_tracker(hass, mock_app_storage, mock_condition_evaluator):
    tracker = ActivityTracker(hass, mock_app_storage, mock_condition_evaluator)
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
async def test_movement_detected_state_changes_to_movement(
    hass: HomeAssistant,
    activity_tracker: ActivityTracker,
    mock_condition_evaluator: MagicMock,
):
    area_id = "living_room"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)

    activity = await activity_tracker.async_evaluate_activity(area_id)

    assert activity == "movement"
    assert activity_tracker._area_states[area_id]["activity"] == "movement"


@pytest.mark.asyncio
async def test_movement_stops_state_remains_movement_during_timeout(
    hass: HomeAssistant,
    activity_tracker: ActivityTracker,
    mock_condition_evaluator: MagicMock,
):
    area_id = "living_room"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker.async_evaluate_activity(area_id)
    assert activity == "movement"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)

    activity = await activity_tracker.async_evaluate_activity(area_id)

    assert activity == "movement"
    assert area_id in activity_tracker._timeout_tasks


@pytest.mark.asyncio
async def test_timeout_expires_state_changes_to_empty(
    hass: HomeAssistant,
    activity_tracker: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area_id = "living_room"
    activity_tracker.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker.async_evaluate_activity(area_id)
    assert activity == "movement"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    activity = await activity_tracker.async_evaluate_activity(area_id)
    assert activity == "movement"

    await asyncio.sleep(2.5)

    mock_coordinator.async_send_area_update.assert_called_once_with(area_id)

    activity = await activity_tracker.async_evaluate_activity(area_id)
    assert activity == "empty"


@pytest.mark.asyncio
async def test_timeout_cancelled_on_reactivation(
    hass: HomeAssistant,
    activity_tracker: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area_id = "living_room"
    activity_tracker.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker.async_evaluate_activity(area_id)
    assert activity == "movement"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    activity = await activity_tracker.async_evaluate_activity(area_id)
    assert activity == "movement"
    timeout_task = activity_tracker._timeout_tasks.get(area_id)
    assert timeout_task is not None

    await asyncio.sleep(1)

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity = await activity_tracker.async_evaluate_activity(area_id)
    assert activity == "movement"

    await asyncio.sleep(0.1)
    assert timeout_task.cancelled() or timeout_task.done()

    await asyncio.sleep(2)

    mock_coordinator.async_send_area_update.assert_not_called()

    activity = await activity_tracker.async_evaluate_activity(area_id)
    assert activity == "movement"


@pytest.mark.asyncio
async def test_multiple_areas_independent_timeouts(
    hass: HomeAssistant,
    activity_tracker: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area1 = "living_room"
    area2 = "kitchen"
    activity_tracker.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    activity1 = await activity_tracker.async_evaluate_activity(area1)
    assert activity1 == "movement"

    await asyncio.sleep(0.5)

    activity2 = await activity_tracker.async_evaluate_activity(area2)
    assert activity2 == "movement"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    await activity_tracker.async_evaluate_activity(area1)
    await asyncio.sleep(0.5)
    await activity_tracker.async_evaluate_activity(area2)

    await asyncio.sleep(2)

    assert mock_coordinator.async_send_area_update.call_count == 1
    assert mock_coordinator.async_send_area_update.call_args_list[0][0][0] == area1

    await asyncio.sleep(1)

    assert mock_coordinator.async_send_area_update.call_count == 2
    assert mock_coordinator.async_send_area_update.call_args_list[1][0][0] == area2


@pytest.mark.skip(reason="Requires mocking coordinator internal methods")
@pytest.mark.asyncio
async def test_activity_change_triggers_coordinator_update(
    hass: HomeAssistant,
    mock_coordinator: MagicMock,
    mock_condition_evaluator: MagicMock,
):
    area_id = "living_room"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)

    old_activity = "movement"

    mock_coordinator.last_rules = {area_id: {"activity": old_activity}}
    mock_coordinator.rule_engine = MagicMock()
    mock_coordinator.rule_engine._enabled_areas = {area_id}
    mock_coordinator.rule_engine._async_evaluate_and_execute = AsyncMock()

    mock_coordinator.activity_tracker = MagicMock()
    mock_coordinator.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="empty"
    )

    area_data = {
        "area_id": area_id,
        "active_presence_entities": [],
    }
    mock_coordinator.area_manager = MagicMock()
    mock_coordinator.area_manager.get_all_area_states = AsyncMock(
        return_value=[area_data]
    )

    mock_coordinator.active_presence_entities = {}

    await mock_coordinator._async_update_data()

    mock_coordinator.rule_engine._async_evaluate_and_execute.assert_called_once_with(
        area_id
    )


@pytest.mark.skip(reason="Requires full Home Assistant infrastructure and registries")
@pytest.mark.asyncio
async def test_lights_turn_off_when_empty_state_reached(
    hass: HomeAssistant,
    mock_condition_evaluator: MagicMock,
):
    from custom_components.linus_brain.utils.action_executor import ActionExecutor
    from custom_components.linus_brain.utils.rule_engine import RuleEngine

    area_id = "living_room"

    mock_app_storage = MagicMock(spec=AppStorage)
    mock_app_storage.get_assignments.return_value = {
        area_id: {
            "area_id": area_id,
            "app_id": "autolight",
            "enabled": True,
        }
    }
    mock_app_storage.get_app.return_value = {
        "app_id": "autolight",
        "app_name": "Automatic Lighting",
        "activity_actions": {
            "movement": {
                "activity_id": "movement",
                "conditions": [],
                "actions": [
                    {
                        "service": "light.turn_on",
                        "domain": "light",
                        "area": "current",
                    }
                ],
                "logic": "and",
            },
            "empty": {
                "activity_id": "empty",
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

    mock_activity_tracker = MagicMock()
    mock_activity_tracker.async_evaluate_activity = AsyncMock(return_value="empty")

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)

    rule_engine = RuleEngine(
        hass,
        "test_entry_id",
        activity_tracker=mock_activity_tracker,
        app_storage=mock_app_storage,
        area_manager=None,
    )

    with patch.object(
        ActionExecutor, "execute_actions", new_callable=AsyncMock
    ) as mock_execute:
        mock_execute.return_value = True

        rule_engine._assignments = mock_app_storage.get_assignments()

        await rule_engine._async_evaluate_and_execute(area_id)

        mock_execute.assert_called_once()
        args = mock_execute.call_args[0]
        actions = args[0]
        assert len(actions) == 1
        assert actions[0]["service"] == "light.turn_off"


@pytest.mark.asyncio
async def test_rapid_state_changes_handle_timeout_correctly(
    hass: HomeAssistant,
    activity_tracker: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area_id = "living_room"
    activity_tracker.coordinator = mock_coordinator

    for i in range(5):
        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
        activity = await activity_tracker.async_evaluate_activity(area_id)
        assert activity == "movement"

        await asyncio.sleep(0.1)

        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
        activity = await activity_tracker.async_evaluate_activity(area_id)
        assert activity == "movement"

        await asyncio.sleep(0.1)

    await asyncio.sleep(2.5)

    mock_coordinator.async_send_area_update.assert_called_once_with(area_id)


@pytest.mark.asyncio
async def test_no_timeout_for_empty_activity(
    hass: HomeAssistant,
    activity_tracker: ActivityTracker,
    mock_condition_evaluator: MagicMock,
):
    area_id = "living_room"

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)

    activity = await activity_tracker.async_evaluate_activity(area_id)

    assert activity == "empty"
    assert area_id not in activity_tracker._timeout_tasks


@pytest.mark.asyncio
async def test_timeout_task_cleanup_on_completion(
    hass: HomeAssistant,
    activity_tracker: ActivityTracker,
    mock_condition_evaluator: MagicMock,
    mock_coordinator: MagicMock,
):
    area_id = "living_room"
    activity_tracker.coordinator = mock_coordinator

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)
    await activity_tracker.async_evaluate_activity(area_id)

    mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=False)
    await activity_tracker.async_evaluate_activity(area_id)

    assert area_id in activity_tracker._timeout_tasks

    await asyncio.sleep(2.5)

    task = activity_tracker._timeout_tasks.get(area_id)
    assert task is None or task.done()


@pytest.mark.skip(reason="Requires full Home Assistant infrastructure (Frame helper)")
@pytest.mark.asyncio
async def test_coordinator_immediate_update_triggers_rule_engine(
    hass: HomeAssistant,
):
    from custom_components.linus_brain.coordinator import LinusBrainCoordinator

    area_id = "living_room"

    coordinator = LinusBrainCoordinator(
        hass,
        "http://test.supabase.co",
        "test_key",
    )

    coordinator.area_manager.get_area_state = AsyncMock(
        return_value={
            "area_id": area_id,
            "active_presence_entities": [],
        }
    )

    coordinator.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="empty"
    )

    mock_rule_engine = MagicMock()
    mock_rule_engine._enabled_areas = {area_id}
    mock_rule_engine._async_evaluate_and_execute = AsyncMock()
    coordinator.rule_engine = mock_rule_engine

    await coordinator.async_send_area_update(area_id)

    mock_rule_engine._async_evaluate_and_execute.assert_called_once_with(area_id)


@pytest.mark.skip(reason="Requires full Home Assistant infrastructure and registries")
@pytest.mark.asyncio
async def test_full_scenario_movement_to_empty_with_light_control(
    hass: HomeAssistant,
    mock_app_storage: MagicMock,
    mock_condition_evaluator: MagicMock,
):
    from custom_components.linus_brain.utils.action_executor import ActionExecutor
    from custom_components.linus_brain.utils.rule_engine import RuleEngine

    area_id = "living_room"

    mock_app_storage.get_assignments.return_value = {
        area_id: {
            "area_id": area_id,
            "app_id": "autolight",
            "enabled": True,
        }
    }
    mock_app_storage.get_app.return_value = {
        "app_id": "autolight",
        "app_name": "Automatic Lighting",
        "activity_actions": {
            "movement": {
                "activity_id": "movement",
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
                    }
                ],
                "logic": "and",
            },
            "empty": {
                "activity_id": "empty",
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

    activity_tracker = ActivityTracker(hass, mock_app_storage, mock_condition_evaluator)
    await activity_tracker.async_initialize()

    rule_engine = RuleEngine(
        hass,
        "test_entry_id",
        activity_tracker=activity_tracker,
        app_storage=mock_app_storage,
        area_manager=None,
    )
    rule_engine._assignments = mock_app_storage.get_assignments()

    action_calls = []

    async def mock_execute_actions(actions, area):
        action_calls.append({"actions": actions, "area": area})
        return True

    with patch.object(
        ActionExecutor, "execute_actions", side_effect=mock_execute_actions
    ):
        mock_condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=[True, True]
        )

        activity = await activity_tracker.async_evaluate_activity(area_id)
        assert activity == "movement"

        await rule_engine._async_evaluate_and_execute(area_id)

        assert len(action_calls) == 1
        assert action_calls[0]["actions"][0]["service"] == "light.turn_on"

        action_calls.clear()

        mock_condition_evaluator.evaluate_conditions = AsyncMock(
            side_effect=[False, True]
        )

        activity = await activity_tracker.async_evaluate_activity(area_id)
        assert activity == "movement"

        await asyncio.sleep(2.5)

        activity = await activity_tracker.async_evaluate_activity(area_id)
        assert activity == "empty"

        mock_condition_evaluator.evaluate_conditions = AsyncMock(return_value=True)

        await rule_engine._async_evaluate_and_execute(area_id)

        assert len(action_calls) == 1
        assert action_calls[0]["actions"][0]["service"] == "light.turn_off"
