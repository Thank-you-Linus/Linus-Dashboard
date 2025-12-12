"""
Test immediate rule evaluation when feature switches are toggled.

These tests verify that when a feature switch is turned ON, the rule engine
is immediately triggered to evaluate and execute matching rules, providing
instant responsiveness to user actions.

EDGE CASES COVERED:
-------------------
1. Rule engine missing during switch toggle
   - Switch gracefully handles missing rule_engine in hass.data
   - No crash, switch state still updates correctly

2. Missing hass.data structure (startup race condition)
   - Switch handles incomplete hass.data during initialization
   - Normal startup sequence ensures rule_engine is available before switches load
   - Initialization order: coordinator → rule_engine → platforms (switches)

3. Rapid toggling
   - Multiple ON/OFF toggles create appropriate evaluation tasks
   - OFF toggles don't trigger evaluation (only disable future automation)
   - Each ON toggle creates a background task without blocking switch response

4. Background task execution
   - Rule evaluation runs asynchronously to avoid blocking UI
   - Switch response is immediate (doesn't wait for rule evaluation)
   - Evaluation tasks complete independently

5. Multiple areas
   - Each switch triggers evaluation for its specific area only
   - Different feature switches work independently

6. Cleanup behavior on switch OFF
   - Turning OFF doesn't trigger rule evaluation
   - Turning OFF doesn't change current device states (non-destructive)
   - Future automation is disabled until switch is turned back ON

DESIGN DECISIONS:
-----------------
- Switch OFF is non-destructive: lights stay on if they were on
  Rationale: User may want to disable automation without disrupting environment

- Evaluation happens in background task (hass.async_create_task)
  Rationale: Switch UI must respond instantly, evaluation can take time

- No retry mechanism for missing rule engine
  Rationale: If rule engine is missing, it's a system issue that will be
  resolved on next toggle or by periodic evaluations
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from ..const import DOMAIN
from ..switch import LinusBrainFeatureSwitch


@pytest.mark.asyncio
async def test_switch_turn_on_triggers_immediate_evaluation(
    hass: HomeAssistant,
) -> None:
    """Test that turning switch ON triggers immediate rule evaluation."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Mock rule engine with async evaluation method
    mock_rule_engine = MagicMock()
    mock_rule_engine._async_evaluate_and_execute = AsyncMock()

    # Setup hass.data with rule engine
    hass.data[DOMAIN] = {
        entry.entry_id: {
            "rule_engine": mock_rule_engine,
        }
    }

    # Create feature switch
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state and async_write_ha_state
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    with patch.object(switch, "async_write_ha_state"):
        # Turn switch ON
        await switch.async_turn_on()

    # Verify switch is ON
    assert switch.is_on is True

    # Verify rule engine evaluation was triggered
    mock_rule_engine._async_evaluate_and_execute.assert_called_once_with(
        "living_room", is_environmental=False
    )


@pytest.mark.asyncio
async def test_switch_turn_on_without_rule_engine_doesnt_crash(
    hass: HomeAssistant,
) -> None:
    """Test that turning switch ON without rule engine doesn't crash."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Setup hass.data WITHOUT rule engine
    hass.data[DOMAIN] = {entry.entry_id: {}}

    # Create feature switch
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state and async_write_ha_state
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    with patch.object(switch, "async_write_ha_state"):
        # Turn switch ON - should not crash
        await switch.async_turn_on()

    # Verify switch is ON
    assert switch.is_on is True


@pytest.mark.asyncio
async def test_switch_turn_on_evaluation_runs_in_background(
    hass: HomeAssistant,
) -> None:
    """Test that rule evaluation runs in background without blocking switch response."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Mock rule engine with slow async evaluation
    mock_rule_engine = MagicMock()
    evaluation_started = False
    evaluation_completed = False

    async def slow_evaluation(*args, **kwargs):
        nonlocal evaluation_started, evaluation_completed
        evaluation_started = True
        # Simulate slow evaluation
        import asyncio

        await asyncio.sleep(0.1)
        evaluation_completed = True

    mock_rule_engine._async_evaluate_and_execute = slow_evaluation

    # Setup hass.data with rule engine
    hass.data[DOMAIN] = {
        entry.entry_id: {
            "rule_engine": mock_rule_engine,
        }
    }

    # Create feature switch
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state and async_write_ha_state
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    with patch.object(switch, "async_write_ha_state"):
        # Turn switch ON - should return immediately
        await switch.async_turn_on()

    # Switch should be ON immediately
    assert switch.is_on is True

    # Evaluation should have started but may not be completed yet
    # (depends on task scheduling, but switch response shouldn't block)
    # Wait a bit to let background task complete
    import asyncio

    await asyncio.sleep(0.2)

    # Now evaluation should be completed
    assert evaluation_completed is True


@pytest.mark.asyncio
async def test_switch_turn_off_does_not_trigger_evaluation(
    hass: HomeAssistant,
) -> None:
    """Test that turning switch OFF does not trigger rule evaluation."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Mock rule engine
    mock_rule_engine = MagicMock()
    mock_rule_engine._async_evaluate_and_execute = AsyncMock()

    # Setup hass.data with rule engine
    hass.data[DOMAIN] = {
        entry.entry_id: {
            "rule_engine": mock_rule_engine,
        }
    }

    # Create feature switch (starting ON)
    feature_def = {"name": "Automatic Lighting", "default_enabled": True}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state and async_write_ha_state
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    assert switch.is_on is True

    with patch.object(switch, "async_write_ha_state"):
        # Turn switch OFF
        await switch.async_turn_off()

    # Verify switch is OFF
    assert switch.is_on is False

    # Verify rule engine evaluation was NOT triggered
    mock_rule_engine._async_evaluate_and_execute.assert_not_called()


@pytest.mark.asyncio
async def test_switch_turn_on_with_missing_hass_data_doesnt_crash(
    hass: HomeAssistant,
) -> None:
    """Test that turning switch ON with missing hass.data structure doesn't crash."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Setup hass.data as empty (simulating startup race condition)
    hass.data[DOMAIN] = {}

    # Create feature switch
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state and async_write_ha_state
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    with patch.object(switch, "async_write_ha_state"):
        # Turn switch ON - should not crash even with missing data
        await switch.async_turn_on()

    # Verify switch is ON
    assert switch.is_on is True


@pytest.mark.asyncio
async def test_switch_turn_on_evaluation_with_different_features(
    hass: HomeAssistant,
) -> None:
    """Test that different feature switches trigger evaluation with correct area."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Mock rule engine
    mock_rule_engine = MagicMock()
    mock_rule_engine._async_evaluate_and_execute = AsyncMock()

    # Setup hass.data with rule engine
    hass.data[DOMAIN] = {
        entry.entry_id: {
            "rule_engine": mock_rule_engine,
        }
    }

    # Create switches for different areas
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}

    switch_living_room = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    switch_bedroom = LinusBrainFeatureSwitch(
        hass, entry, "bedroom", "automatic_lighting", feature_def
    )

    # Initialize switches
    with patch.object(switch_living_room, "async_get_last_state", return_value=None):
        await switch_living_room.async_added_to_hass()

    with patch.object(switch_bedroom, "async_get_last_state", return_value=None):
        await switch_bedroom.async_added_to_hass()

    # Turn on living room switch
    with patch.object(switch_living_room, "async_write_ha_state"):
        await switch_living_room.async_turn_on()

    # Verify evaluation called with correct area
    mock_rule_engine._async_evaluate_and_execute.assert_called_with(
        "living_room", is_environmental=False
    )

    # Reset mock
    mock_rule_engine._async_evaluate_and_execute.reset_mock()

    # Turn on bedroom switch
    with patch.object(switch_bedroom, "async_write_ha_state"):
        await switch_bedroom.async_turn_on()

    # Verify evaluation called with correct area
    mock_rule_engine._async_evaluate_and_execute.assert_called_with(
        "bedroom", is_environmental=False
    )


@pytest.mark.asyncio
async def test_switch_rapid_toggling_creates_multiple_evaluation_tasks(
    hass: HomeAssistant,
) -> None:
    """Test that rapid switch toggling creates multiple evaluation tasks correctly."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Mock rule engine
    mock_rule_engine = MagicMock()
    evaluation_count = 0

    async def count_evaluations(*args, **kwargs):
        nonlocal evaluation_count
        evaluation_count += 1

    mock_rule_engine._async_evaluate_and_execute = count_evaluations

    # Setup hass.data with rule engine
    hass.data[DOMAIN] = {
        entry.entry_id: {
            "rule_engine": mock_rule_engine,
        }
    }

    # Create feature switch
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state and async_write_ha_state
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    with patch.object(switch, "async_write_ha_state"):
        # Rapid toggling: ON -> OFF -> ON
        await switch.async_turn_on()
        await switch.async_turn_off()
        await switch.async_turn_on()

    # Wait for background tasks
    import asyncio

    await asyncio.sleep(0.1)

    # Should have 2 evaluations (from the two ON calls)
    # OFF doesn't trigger evaluation
    assert evaluation_count == 2
    assert switch.is_on is True
