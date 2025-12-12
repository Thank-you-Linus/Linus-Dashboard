"""
Tests for reset_app_preferences service.

This service resets config_overrides for area assignments to default values.
"""

from unittest.mock import AsyncMock, MagicMock

import pytest
from homeassistant.core import HomeAssistant

from custom_components.linus_brain.const import DOMAIN
from custom_components.linus_brain.services import async_setup_services


@pytest.fixture
def mock_coordinator():
    """Create a mock coordinator."""
    coordinator = MagicMock()
    coordinator.get_or_create_instance_id = AsyncMock(return_value="test-instance-id")
    coordinator.supabase_client = MagicMock()
    coordinator.supabase_client.assign_app_to_area = AsyncMock(return_value=True)
    return coordinator


@pytest.fixture
def mock_app_storage():
    """Create a mock app storage."""
    storage = MagicMock()
    storage.get_assignment = MagicMock(return_value=None)
    storage.set_assignment = MagicMock()
    storage.async_save = AsyncMock()
    return storage


@pytest.fixture
async def setup_service(hass: HomeAssistant, mock_coordinator, mock_app_storage):
    """Set up the reset_app_preferences service."""
    # Create mock entry data
    hass.data[DOMAIN] = {
        "test_entry": {
            "coordinator": mock_coordinator,
            "app_storage": mock_app_storage,
        }
    }

    # Register services
    await async_setup_services(hass)

    yield

    # Cleanup
    hass.data.pop(DOMAIN, None)


@pytest.mark.asyncio
async def test_reset_preferences_success(
    hass, setup_service, mock_app_storage, mock_coordinator
):
    """Test successfully resetting preferences for an area."""
    # Setup: Area has assignment with custom config_overrides
    mock_app_storage.get_assignment.return_value = {
        "area_id": "kitchen",
        "app_id": "automatic_lighting",
        "app_version": None,
        "config_overrides": {
            "brightness_multiplier": 0.5,
            "transition_duration": 5,
        },
        "global_conditions": [],
        "enabled": True,
        "priority": 100,
    }

    # Call service
    await hass.services.async_call(
        DOMAIN,
        "reset_app_preferences",
        {"area_id": "kitchen"},
        blocking=True,
    )

    # Verify: config_overrides was reset to empty dict
    assert mock_app_storage.set_assignment.called
    call_args = mock_app_storage.set_assignment.call_args[0]
    assert call_args[0] == "kitchen"
    assert call_args[1]["config_overrides"] == {}

    # Verify: Local storage was saved
    assert mock_app_storage.async_save.called

    # Verify: Cloud sync was attempted
    assert mock_coordinator.supabase_client.assign_app_to_area.called
    cloud_call = mock_coordinator.supabase_client.assign_app_to_area.call_args
    assert cloud_call[1]["area_id"] == "kitchen"
    assert cloud_call[1]["config_overrides"] == {}


@pytest.mark.asyncio
async def test_reset_preferences_no_assignment(hass, setup_service, mock_app_storage):
    """Test resetting preferences when no assignment exists."""
    # Setup: No assignment for area
    mock_app_storage.get_assignment.return_value = None

    # Call service (should not raise error)
    await hass.services.async_call(
        DOMAIN,
        "reset_app_preferences",
        {"area_id": "nonexistent"},
        blocking=True,
    )

    # Verify: Nothing was saved
    assert not mock_app_storage.set_assignment.called
    assert not mock_app_storage.async_save.called


@pytest.mark.asyncio
async def test_reset_preferences_with_app_id_match(
    hass, setup_service, mock_app_storage, mock_coordinator
):
    """Test resetting preferences with matching app_id."""
    # Setup: Area has assignment
    mock_app_storage.get_assignment.return_value = {
        "area_id": "bedroom",
        "app_id": "automatic_lighting",
        "config_overrides": {"brightness_multiplier": 0.8},
        "global_conditions": [],
        "enabled": True,
    }

    # Call service with matching app_id
    await hass.services.async_call(
        DOMAIN,
        "reset_app_preferences",
        {"area_id": "bedroom", "app_id": "automatic_lighting"},
        blocking=True,
    )

    # Verify: Preferences were reset
    assert mock_app_storage.set_assignment.called
    assert mock_app_storage.async_save.called


@pytest.mark.asyncio
async def test_reset_preferences_with_app_id_mismatch(
    hass, setup_service, mock_app_storage
):
    """Test resetting preferences with non-matching app_id."""
    # Setup: Area has different app assigned
    mock_app_storage.get_assignment.return_value = {
        "area_id": "bedroom",
        "app_id": "automatic_lighting",
        "config_overrides": {"brightness_multiplier": 0.8},
    }

    # Call service with different app_id
    await hass.services.async_call(
        DOMAIN,
        "reset_app_preferences",
        {"area_id": "bedroom", "app_id": "different_app"},
        blocking=True,
    )

    # Verify: Nothing was reset
    assert not mock_app_storage.set_assignment.called
    assert not mock_app_storage.async_save.called


@pytest.mark.asyncio
async def test_reset_preferences_cloud_sync_failure(
    hass, setup_service, mock_app_storage, mock_coordinator
):
    """Test that local reset succeeds even if cloud sync fails."""
    # Setup: Area has assignment
    mock_app_storage.get_assignment.return_value = {
        "area_id": "kitchen",
        "app_id": "automatic_lighting",
        "config_overrides": {"brightness_multiplier": 0.5},
        "enabled": True,
    }

    # Setup: Cloud sync fails
    mock_coordinator.supabase_client.assign_app_to_area.side_effect = Exception(
        "Network error"
    )

    # Call service (should not raise error)
    await hass.services.async_call(
        DOMAIN,
        "reset_app_preferences",
        {"area_id": "kitchen"},
        blocking=True,
    )

    # Verify: Local storage was still updated
    assert mock_app_storage.set_assignment.called
    assert mock_app_storage.async_save.called


@pytest.mark.asyncio
async def test_reset_preferences_preserves_other_fields(
    hass, setup_service, mock_app_storage, mock_coordinator
):
    """Test that reset only clears config_overrides, not other fields."""
    # Setup: Area has assignment with multiple fields
    original_assignment = {
        "area_id": "living_room",
        "app_id": "automatic_lighting",
        "app_version": "2025-01-01T00:00:00Z",
        "config_overrides": {
            "brightness_multiplier": 0.7,
            "excluded_entities": ["light.nightlight"],
        },
        "global_conditions": [
            {
                "condition": "state",
                "entity_id": "input_select.home_mode",
                "state": "home",
            }
        ],
        "enabled": True,
        "priority": 150,
    }
    mock_app_storage.get_assignment.return_value = original_assignment

    # Call service
    await hass.services.async_call(
        DOMAIN,
        "reset_app_preferences",
        {"area_id": "living_room"},
        blocking=True,
    )

    # Verify: Only config_overrides was changed
    call_args = mock_app_storage.set_assignment.call_args[0]
    updated_assignment = call_args[1]

    assert updated_assignment["config_overrides"] == {}
    assert updated_assignment["app_id"] == "automatic_lighting"
    assert updated_assignment["app_version"] == "2025-01-01T00:00:00Z"
    assert (
        updated_assignment["global_conditions"]
        == original_assignment["global_conditions"]
    )
    assert updated_assignment["enabled"] is True
    assert updated_assignment["priority"] == 150
