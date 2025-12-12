"""
Test feature switch state restoration after Home Assistant restart.

Tests verify that switches use RestoreEntity correctly to persist state
across Home Assistant restarts without relying on FeatureFlagManager.
"""

from unittest.mock import MagicMock, patch

import pytest
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant, State

from ..switch import LinusBrainFeatureSwitch


@pytest.mark.asyncio
async def test_feature_switch_restores_on_state(hass: HomeAssistant) -> None:
    """Test that feature switch restores to ON state after restart."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Mock previous state (ON)
    previous_state = State(
        "switch.linus_brain_feature_automatic_lighting_living_room", "on"
    )

    # Create feature switch
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state to return previous ON state
    with patch.object(switch, "async_get_last_state", return_value=previous_state):
        await switch.async_added_to_hass()

    # Verify state was restored to ON
    assert switch.is_on is True


@pytest.mark.asyncio
async def test_feature_switch_restores_off_state(hass: HomeAssistant) -> None:
    """Test that feature switch restores to OFF state after restart."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Mock previous state (OFF)
    previous_state = State(
        "switch.linus_brain_feature_automatic_lighting_living_room", "off"
    )

    # Create feature switch
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state to return previous OFF state
    with patch.object(switch, "async_get_last_state", return_value=previous_state):
        await switch.async_added_to_hass()

    # Verify state was restored to OFF
    assert switch.is_on is False


@pytest.mark.asyncio
async def test_feature_switch_defaults_to_off_when_no_previous_state(
    hass: HomeAssistant,
) -> None:
    """Test that feature switch defaults to OFF when no previous state exists."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Create feature switch
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state to return None (no previous state)
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    # Verify state defaults to OFF (from feature definition)
    assert switch.is_on is False


@pytest.mark.asyncio
async def test_feature_switch_defaults_to_on_when_feature_default_enabled(
    hass: HomeAssistant,
) -> None:
    """Test that feature switch defaults to ON when feature default_enabled is True."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Create feature switch with default_enabled=True
    feature_def = {"name": "Automatic Lighting", "default_enabled": True}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state to return None (no previous state)
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    # Verify state defaults to ON (from feature definition)
    assert switch.is_on is True


@pytest.mark.asyncio
async def test_feature_switch_turn_on_updates_state(hass: HomeAssistant) -> None:
    """Test that turning switch ON updates the switch state."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Create feature switch
    feature_def = {"name": "Automatic Lighting", "default_enabled": False}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state to return None (no previous state)
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    # Initial state should be OFF
    assert switch.is_on is False

    # Mock async_write_ha_state to avoid HA platform requirements
    with patch.object(switch, "async_write_ha_state"):
        # Turn switch ON
        await switch.async_turn_on()

    # Verify switch state is ON
    assert switch.is_on is True


@pytest.mark.asyncio
async def test_feature_switch_turn_off_updates_state(
    hass: HomeAssistant,
) -> None:
    """Test that turning switch OFF updates the switch state."""
    # Mock config entry
    entry = MagicMock(spec=ConfigEntry)
    entry.entry_id = "test_entry"

    # Create feature switch starting with ON state
    feature_def = {"name": "Automatic Lighting", "default_enabled": True}
    switch = LinusBrainFeatureSwitch(
        hass, entry, "living_room", "automatic_lighting", feature_def
    )

    # Mock async_get_last_state to return None (no previous state)
    with patch.object(switch, "async_get_last_state", return_value=None):
        await switch.async_added_to_hass()

    # Initial state should be ON (from default_enabled)
    assert switch.is_on is True

    # Mock async_write_ha_state to avoid HA platform requirements
    with patch.object(switch, "async_write_ha_state"):
        # Turn switch OFF
        await switch.async_turn_off()

    # Verify switch state is OFF
    assert switch.is_on is False
