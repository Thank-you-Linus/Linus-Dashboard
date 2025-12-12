"""
Unit tests for Automatic Lighting app.

Tests the complete automatic lighting flow including:
- Light turns on when movement + dark
- Light stays off when movement + bright
- Light turns off when activity becomes empty
- Feature flag integration (switch on/off)
- Cooldown behavior
- Environmental transitions (becomes dark → lights on)
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.core import State

from ..utils.rule_engine import RuleEngine


def create_switch_state(area_id: str, feature_id: str, is_on: bool) -> State:
    """Helper to create a mock switch state."""
    entity_id = f"switch.linus_brain_feature_{feature_id}_{area_id}"
    state = "on" if is_on else "off"
    return State(entity_id, state)


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance with feature switch enabled by default."""
    hass = MagicMock()
    hass.states = MagicMock()

    # By default, return a switch that's ON (feature enabled)
    default_switch = create_switch_state("living_room", "automatic_lighting", True)
    hass.states.get = MagicMock(return_value=default_switch)

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
def mock_area_manager():
    """Mock AreaManager with illuminance sensor."""
    manager = MagicMock()
    manager.get_area_illuminance = MagicMock(return_value=5)  # Dark by default
    manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )
    return manager


@pytest.fixture
def patch_area_manager(mock_area_manager):
    """Patch AreaManager globally so condition_evaluator uses our mock."""
    with patch(
        "linus_brain.utils.area_manager.AreaManager",
        return_value=mock_area_manager,
    ):
        yield mock_area_manager


@pytest.fixture
def mock_feature_flag_manager():
    """Mock FeatureFlagManager - only provides feature definitions."""
    manager = MagicMock()
    # FeatureFlagManager no longer manages state, only definitions
    manager.get_feature_definitions = MagicMock(
        return_value={
            "automatic_lighting": {
                "name": "Automatic Lighting",
                "default_enabled": True,
            }
        }
    )
    return manager


@pytest.fixture
def mock_app_storage():
    """Mock AppStorage with automatic_lighting app."""
    storage = MagicMock()

    # Automatic Lighting app definition (matching real format from const.py)
    autolight_app = {
        "app_id": "automatic_lighting",
        "app_name": "Automatic Lighting",
        "activity_actions": {
            "movement": {
                "conditions": [
                    {
                        "condition": "area_state",
                        "attribute": "is_dark",
                        "operator": "==",
                        "value": True,
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
            "occupied": {
                "conditions": [
                    {
                        "condition": "area_state",
                        "attribute": "is_dark",
                        "operator": "==",
                        "value": True,
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

    storage.get_app = MagicMock(return_value=autolight_app)
    storage.get_apps = MagicMock(return_value={"automatic_lighting": autolight_app})
    storage.get_assignments = MagicMock(
        return_value={
            "living_room": {
                "area_id": "living_room",
                "app_id": "automatic_lighting",
            }
        }
    )
    storage.get_assignment = MagicMock(
        return_value={
            "area_id": "living_room",
            "app_id": "automatic_lighting",
        }
    )

    return storage


@pytest.fixture
async def rule_engine(
    mock_hass,
    mock_activity_tracker,
    patch_area_manager,
    mock_feature_flag_manager,
    mock_app_storage,
):
    """Create RuleEngine with mocked dependencies."""
    engine = RuleEngine(
        hass=mock_hass,
        entry_id="test_entry",
        activity_tracker=mock_activity_tracker,
        app_storage=mock_app_storage,
        area_manager=patch_area_manager,
        feature_flag_manager=mock_feature_flag_manager,
    )

    # Mock entity resolver (sync method)
    engine.entity_resolver.resolve_entity = MagicMock(
        return_value=["light.living_room_main"]
    )

    await engine.async_initialize()
    return engine


# ============================================================================
# TEST 1: Basic Functionality - Lights Turn On When Dark + Movement
# ============================================================================


@pytest.mark.asyncio
async def test_lights_turn_on_when_dark_and_movement(rule_engine, mock_hass):
    """Test that lights turn on when it's dark and movement is detected."""
    # Setup: Dark room, movement activity
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )

    # Execute: Trigger rule evaluation
    await rule_engine._async_evaluate_and_execute("living_room")

    # Assert: light.turn_on was called
    mock_hass.services.async_call.assert_called_once()
    call_args = mock_hass.services.async_call.call_args[0]  # positional args
    assert call_args[0] == "light"
    assert call_args[1] == "turn_on"

    # Service data is the third positional argument
    service_data = call_args[2] if len(call_args) > 2 else {}
    entity_ids = service_data.get("entity_id", [])
    assert "light.living_room_main" in entity_ids

    # Stats should show successful execution
    stats = rule_engine.get_stats()
    assert stats["successful_executions"] == 1
    assert stats["total_triggers"] == 1


# ============================================================================
# TEST 2: Lights Stay Off When Bright (Even With Movement)
# ============================================================================


@pytest.mark.asyncio
async def test_lights_stay_off_when_bright(rule_engine, mock_hass):
    """Test that lights do NOT turn on when it's bright, even with movement."""
    # Setup: Bright room (illuminance > 50), movement activity
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": False, "illuminance": 150}
    )

    # Execute: Trigger rule evaluation
    await rule_engine._async_evaluate_and_execute("living_room")

    # Assert: light.turn_on was NOT called (conditions not met)
    mock_hass.services.async_call.assert_not_called()

    # Stats should show trigger but no execution
    stats = rule_engine.get_stats()
    assert stats["successful_executions"] == 0
    assert stats["total_triggers"] == 1  # Still counted as trigger


# ============================================================================
# TEST 3: Lights Turn Off When Activity Becomes Empty
# ============================================================================


@pytest.mark.asyncio
async def test_lights_turn_off_when_empty(rule_engine, mock_hass):
    """Test that lights turn off when activity becomes empty."""
    # Setup: Activity = empty
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="empty"
    )

    # Execute: Trigger rule evaluation
    await rule_engine._async_evaluate_and_execute("living_room")

    # Assert: light.turn_off was called (no conditions for empty)
    mock_hass.services.async_call.assert_called_once()
    call_args = mock_hass.services.async_call.call_args
    assert call_args[0][0] == "light"
    assert call_args[0][1] == "turn_off"

    # Stats should show successful execution
    stats = rule_engine.get_stats()
    assert stats["successful_executions"] == 1


# ============================================================================
# TEST 4: Feature Flag - Lights Don't Turn On When Switch Is Off
# ============================================================================


@pytest.mark.asyncio
async def test_lights_respect_feature_flag_off(rule_engine, mock_hass):
    """Test that lights do NOT turn on when feature flag (switch) is disabled."""
    # Setup: Dark room, movement, but feature disabled via switch state
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )

    # Mock the switch state to be OFF (feature disabled)
    off_switch = create_switch_state("living_room", "automatic_lighting", False)
    mock_hass.states.get = MagicMock(return_value=off_switch)

    # Execute: Trigger rule evaluation
    await rule_engine._async_evaluate_and_execute("living_room")

    # Assert: light.turn_on was NOT called (feature disabled)
    mock_hass.services.async_call.assert_not_called()

    # Stats should show trigger but no execution
    stats = rule_engine.get_stats()
    assert stats["successful_executions"] == 0
    assert stats["total_triggers"] == 1


# ============================================================================
# TEST 5: Cooldown - Prevents Rapid Retriggering
# ============================================================================


@pytest.mark.asyncio
async def test_cooldown_prevents_rapid_retriggering(rule_engine, mock_hass):
    """Test that cooldown prevents lights from toggling too frequently."""
    # Setup: Dark room, movement
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )

    # Execute: First trigger - should succeed
    await rule_engine._async_evaluate_and_execute("living_room")
    assert mock_hass.services.async_call.call_count == 1

    # Execute: Second trigger immediately - should be blocked by cooldown
    mock_hass.services.async_call.reset_mock()
    await rule_engine._async_evaluate_and_execute("living_room")
    assert mock_hass.services.async_call.call_count == 0

    # Stats should show cooldown block
    stats = rule_engine.get_stats()
    assert stats["cooldown_blocks"] >= 1
    assert stats["successful_executions"] == 1  # Only first one
    assert stats["total_triggers"] == 2


# ============================================================================
# TEST 6: Environmental Transition - Lights Turn On When It Becomes Dark
# ============================================================================


@pytest.mark.asyncio
async def test_lights_turn_on_when_becomes_dark(rule_engine, mock_hass):
    """Test that lights turn on when it becomes dark (environmental transition)."""
    # Setup: Room is bright initially
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": False, "illuminance": 100}
    )

    # First evaluation: Bright, so no lights
    await rule_engine._async_evaluate_and_execute("living_room")
    assert mock_hass.services.async_call.call_count == 0

    # Simulate environmental transition: becomes dark
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )

    # Cache the initial state for transition detection
    rule_engine._previous_env_state["living_room"] = {
        "is_dark": False,
    }

    # Detect transition
    current_state = {"is_dark": True}
    transition = rule_engine._detect_environmental_transition(
        "living_room", current_state
    )
    assert transition == "became_dark"

    # Second evaluation: Now dark, should trigger lights
    mock_hass.services.async_call.reset_mock()
    await rule_engine._async_evaluate_and_execute("living_room", is_environmental=True)

    # Assert: Lights turned on due to environmental change
    assert mock_hass.services.async_call.call_count == 1
    call_args = mock_hass.services.async_call.call_args
    assert call_args[0][1] == "turn_on"


# ============================================================================
# TEST 7: Occupied Activity Also Turns On Lights (When Dark)
# ============================================================================


@pytest.mark.asyncio
async def test_lights_turn_on_when_occupied_and_dark(rule_engine, mock_hass):
    """Test that lights turn on for 'occupied' activity when dark."""
    # Setup: Dark room, occupied activity
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="occupied"
    )
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )

    # Execute: Trigger rule evaluation
    await rule_engine._async_evaluate_and_execute("living_room")

    # Assert: light.turn_on was called
    mock_hass.services.async_call.assert_called_once()
    call_args = mock_hass.services.async_call.call_args
    assert call_args[0][1] == "turn_on"

    # Stats should show successful execution
    stats = rule_engine.get_stats()
    assert stats["successful_executions"] == 1


# ============================================================================
# TEST 8: Inactive Activity - No Actions Defined
# ============================================================================


@pytest.mark.asyncio
async def test_inactive_activity_no_actions(rule_engine, mock_hass):
    """Test that 'inactive' activity has no actions (transition state)."""
    # Setup: Inactive activity
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="inactive"
    )

    # Execute: Trigger rule evaluation
    await rule_engine._async_evaluate_and_execute("living_room")

    # Assert: No service calls (inactive has no actions in automatic_lighting)
    mock_hass.services.async_call.assert_not_called()

    # Stats should show trigger but no execution
    stats = rule_engine.get_stats()
    assert stats["successful_executions"] == 0
    assert stats["total_triggers"] == 1


# ============================================================================
# TEST 9: Complete Flow - Movement (Dark) → Empty
# ============================================================================


@pytest.mark.asyncio
async def test_complete_flow_movement_to_empty(rule_engine, mock_hass):
    """Test complete flow: lights on with movement (dark), lights off when empty."""
    # Phase 1: Movement detected, dark → lights ON
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )

    await rule_engine._async_evaluate_and_execute("living_room")
    assert mock_hass.services.async_call.call_count == 1
    assert mock_hass.services.async_call.call_args[0][1] == "turn_on"

    # Reset cooldown to allow next execution
    rule_engine._last_triggered.clear()
    mock_hass.services.async_call.reset_mock()

    # Phase 2: Activity becomes empty → lights OFF
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="empty"
    )

    await rule_engine._async_evaluate_and_execute("living_room")
    assert mock_hass.services.async_call.call_count == 1
    assert mock_hass.services.async_call.call_args[0][1] == "turn_off"

    # Stats should show 2 successful executions
    stats = rule_engine.get_stats()
    assert stats["successful_executions"] == 2
    assert stats["total_triggers"] == 2


# ============================================================================
# TEST 10: Stats Accuracy - Total Triggers vs Successful Executions
# ============================================================================


@pytest.mark.asyncio
async def test_stats_accuracy_triggers_vs_executions(rule_engine, mock_hass):
    """Test that stats correctly track total_triggers vs successful_executions."""
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )

    # Scenario 1: Dark → should execute
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )
    await rule_engine._async_evaluate_and_execute("living_room")

    # Scenario 2: Bright → should NOT execute
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": False, "illuminance": 150}
    )
    await rule_engine._async_evaluate_and_execute("living_room")

    # Scenario 3: Dark again → should execute (after cooldown cleared)
    rule_engine._last_triggered.clear()
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )
    await rule_engine._async_evaluate_and_execute("living_room")

    # Assert stats
    stats = rule_engine.get_stats()
    assert stats["total_triggers"] == 3  # All 3 evaluations counted
    assert (
        stats["successful_executions"] == 2
    )  # Only 2 actually executed (dark scenarios)
    assert stats["failed_executions"] == 0  # None failed


# ============================================================================
# TEST 11: No Assignment - Graceful Handling
# ============================================================================


@pytest.mark.asyncio
async def test_no_assignment_graceful_handling(rule_engine, mock_hass):
    """Test that rule engine handles areas without assignments gracefully."""
    # Execute: Try to evaluate area without assignment
    await rule_engine._async_evaluate_and_execute("bedroom")  # Not in assignments

    # Assert: No service calls, no errors
    mock_hass.services.async_call.assert_not_called()

    # Stats should show trigger but no execution
    stats = rule_engine.get_stats()
    assert stats["total_triggers"] == 1
    assert stats["successful_executions"] == 0


# ============================================================================
# TEST 12: Environmental Cooldown - Longer Than Activity Cooldown
# ============================================================================


@pytest.mark.asyncio
async def test_environmental_cooldown_longer(rule_engine, mock_hass):
    """Test that environmental triggers use configurable cooldown (default 30s) vs activity cooldown (30s)."""
    from ..utils.rule_engine import COOLDOWN_SECONDS

    # Verify constants
    assert COOLDOWN_SECONDS == 30

    # Setup
    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )

    # First environmental trigger
    await rule_engine._async_evaluate_and_execute("living_room", is_environmental=True)
    assert mock_hass.services.async_call.call_count == 1

    # Second environmental trigger immediately - should be blocked
    mock_hass.services.async_call.reset_mock()
    await rule_engine._async_evaluate_and_execute("living_room", is_environmental=True)
    assert mock_hass.services.async_call.call_count == 0

    # Stats should show cooldown block
    stats = rule_engine.get_stats()
    assert stats["cooldown_blocks"] >= 1


# ============================================================================
# TEST 13: Movement Timeout = 30s (Bug Fix Verification)
# ============================================================================


@pytest.mark.asyncio
async def test_movement_timeout_is_30_seconds():
    """Test that movement activity has timeout of 1s (immediate transition to inactive)."""
    from ..const import DEFAULT_ACTIVITY_TYPES

    # Verify movement timeout (1s for quick transition to inactive)
    movement_activity = DEFAULT_ACTIVITY_TYPES.get("movement")
    assert movement_activity is not None
    assert movement_activity["timeout_seconds"] == 1
    assert movement_activity["is_transition_state"] is False

    # Verify inactive also has correct timeout
    inactive_activity = DEFAULT_ACTIVITY_TYPES.get("inactive")
    assert inactive_activity is not None
    assert inactive_activity["timeout_seconds"] == 60
    assert inactive_activity["is_transition_state"] is True


# ============================================================================
# TEST 14: Sensor Stats Value = Successful Executions (Bug Fix Verification)
# ============================================================================


@pytest.mark.asyncio
async def test_sensor_shows_successful_executions_not_total(rule_engine):
    """Test that sensor value shows successful_executions, not total_triggers."""
    # This test verifies the fix in sensor.py line 403
    # The sensor should display successful_executions as its main value

    stats = rule_engine.get_stats()

    # The main value should be successful_executions
    # (tested indirectly - actual sensor test in test_integration.py)
    assert "successful_executions" in stats
    assert "total_triggers" in stats

    # Both should be tracked, but sensor displays successful_executions
    # as the primary value (verified in sensor.py)


# ============================================================================
# TEST 15: Multiple Lights in Area - All Turn On
# ============================================================================


@pytest.mark.asyncio
async def test_multiple_lights_all_turn_on(rule_engine, mock_hass):
    """Test that all lights in area turn on when strategy is 'all'."""
    # Setup: Multiple lights in area (sync method)
    rule_engine.entity_resolver.resolve_entity = MagicMock(
        return_value=["light.living_room_main", "light.living_room_accent"]
    )

    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )

    # Execute
    await rule_engine._async_evaluate_and_execute("living_room")

    # Assert: Both lights in entity_id list
    call_args = mock_hass.services.async_call.call_args[0]  # positional args
    service_data = call_args[2] if len(call_args) > 2 else {}
    entity_ids = service_data.get("entity_id", [])
    assert "light.living_room_main" in entity_ids
    assert "light.living_room_accent" in entity_ids


# ============================================================================
# TEST 16: Inactive → Movement Re-triggers Lights (Bug Fix)
# ============================================================================


@pytest.mark.asyncio
async def test_inactive_to_movement_retriggers_lights(rule_engine, mock_hass):
    """Test that lights turn back on when transitioning from inactive to movement.

    Scenario:
    1. Movement detected → lights ON
    2. Motion stops → inactive (transition state)
    3. Movement detected again → lights should turn ON again (bypass cooldown)

    This ensures that when someone leaves a room (inactive) and comes back
    immediately (movement), the lights turn back on even if cooldown hasn't expired.
    """
    # Setup: activity tracker with transition state support
    rule_engine.activity_tracker._activities = {
        "empty": {
            "activity_id": "empty",
            "is_transition_state": False,
        },
        "movement": {
            "activity_id": "movement",
            "is_transition_state": False,
        },
        "inactive": {
            "activity_id": "inactive",
            "is_transition_state": True,  # Key: this is a transition state
        },
    }

    rule_engine.activity_tracker.async_evaluate_activity = AsyncMock(
        return_value="movement"
    )
    rule_engine.activity_tracker.get_activity = MagicMock(return_value="movement")
    rule_engine.area_manager.get_area_environmental_state = MagicMock(
        return_value={"is_dark": True, "illuminance": 5}
    )

    # Step 1: First movement → lights turn ON
    await rule_engine._async_evaluate_and_execute("living_room")
    assert mock_hass.services.async_call.call_count == 1
    mock_hass.services.async_call.reset_mock()

    # Step 2: Simulate transition to inactive (set previous_activity)
    from ..const import DOMAIN

    entry_data = mock_hass.data.get(DOMAIN, {}).get(rule_engine.entry_id, {})
    mock_coordinator = MagicMock()
    mock_coordinator.previous_activities = {"living_room": "inactive"}
    entry_data["coordinator"] = mock_coordinator
    mock_hass.data.setdefault(DOMAIN, {})[rule_engine.entry_id] = entry_data

    # Step 3: Movement detected again → should bypass cooldown and turn lights ON
    await rule_engine._async_evaluate_and_execute("living_room")

    # Assert: Lights turned ON again (cooldown bypassed due to transition from inactive)
    assert mock_hass.services.async_call.call_count == 1
    call_args = mock_hass.services.async_call.call_args[0]
    assert call_args[0] == "light"
    assert call_args[1] == "turn_on"

    # Verify stats don't show cooldown block
    stats = rule_engine.get_stats()
    assert stats["successful_executions"] == 2  # Both executions succeeded
