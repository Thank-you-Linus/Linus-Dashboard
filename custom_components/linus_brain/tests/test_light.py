"""
Tests for Linus Brain light groups.

Tests area-based light grouping with smart filtering and dynamic updates.
"""

import pytest
from unittest.mock import AsyncMock
from homeassistant.core import HomeAssistant
from homeassistant.helpers import entity_registry as er, device_registry as dr, area_registry as ar
from homeassistant.const import STATE_ON, STATE_OFF
from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_RGB_COLOR,
    ATTR_SUPPORTED_COLOR_MODES,
)
from homeassistant.components.light.const import (
    ColorMode,
    LightEntityFeature,
)

from custom_components.linus_brain.light import AreaLightGroup


@pytest.fixture
def mock_area_registry(hass):
    """Create a mock area registry."""
    registry = ar.async_get(hass)
    
    # Create test areas
    living_room = registry.async_create("Living Room")
    kitchen = registry.async_create("Kitchen")
    bedroom = registry.async_create("Bedroom")
    
    return {
        "living_room": living_room.id,
        "kitchen": kitchen.id,
        "bedroom": bedroom.id,
    }


@pytest.fixture
def mock_entity_registry(hass, mock_area_registry):
    """Create a mock entity registry with test lights."""
    registry = er.async_get(hass)
    
    # Living room lights (directly assigned to area)
    entry = registry.async_get_or_create(
        "light",
        "test",
        "living_room_ceiling",
        suggested_object_id="living_room_ceiling",
    )
    registry.async_update_entity(entry.entity_id, area_id=mock_area_registry["living_room"])
    
    entry = registry.async_get_or_create(
        "light",
        "test",
        "living_room_lamp",
        suggested_object_id="living_room_lamp",
    )
    registry.async_update_entity(entry.entity_id, area_id=mock_area_registry["living_room"])
    
    # Kitchen lights
    entry = registry.async_get_or_create(
        "light",
        "test",
        "kitchen_ceiling",
        suggested_object_id="kitchen_ceiling",
    )
    registry.async_update_entity(entry.entity_id, area_id=mock_area_registry["kitchen"])
    
    # Bedroom lights
    entry = registry.async_get_or_create(
        "light",
        "test",
        "bedroom_ceiling",
        suggested_object_id="bedroom_ceiling",
    )
    registry.async_update_entity(entry.entity_id, area_id=mock_area_registry["bedroom"])
    
    # Disabled light in living room (should be excluded)
    entry = registry.async_get_or_create(
        "light",
        "test",
        "living_room_disabled",
        suggested_object_id="living_room_disabled",
        disabled_by=er.RegistryEntryDisabler.USER,
    )
    registry.async_update_entity(entry.entity_id, area_id=mock_area_registry["living_room"])
    
    # Linus Brain entity in living room (should be excluded)
    entry = registry.async_get_or_create(
        "light",
        "linus_brain",
        f"all_lights_{mock_area_registry['living_room']}",
        suggested_object_id=f"linus_brain_all_lights_{mock_area_registry['living_room']}",
    )
    registry.async_update_entity(entry.entity_id, area_id=mock_area_registry["living_room"])
    
    return registry


@pytest.fixture
def mock_device_registry(hass, mock_area_registry, mock_config_entry):
    """Create a mock device registry with devices."""
    # Add config entry to hass
    mock_config_entry.add_to_hass(hass)
    
    registry = dr.async_get(hass)
    
    # Create a device in living room
    device = registry.async_get_or_create(
        config_entry_id=mock_config_entry.entry_id,
        identifiers={("test", "living_room_device")},
        name="Living Room Device",
    )
    registry.async_update_device(device.id, area_id=mock_area_registry["living_room"])
    
    return registry, device.id


def get_lights_for_area(hass, area_id, entity_registry, device_registry):
    """Helper to get lights for an area (mimics _rebuild_area_lights)."""
    lights = []
    for entity_id, entity_entry in entity_registry.entities.items():
        if entity_entry.domain != "light":
            continue
        if entity_entry.disabled:
            continue
        if entity_id.startswith("light.linus_brain_"):
            continue
        
        # Get area from entity or device
        entry_area_id = entity_entry.area_id
        if not entry_area_id and entity_entry.device_id:
            device = device_registry.async_get(entity_entry.device_id)
            if device:
                entry_area_id = device.area_id
        
        if entry_area_id == area_id:
            lights.append(entity_id)
    
    return lights


async def test_light_group_includes_only_area_lights(
    hass: HomeAssistant,
    mock_area_registry,
    mock_entity_registry,
    mock_device_registry,
):
    """Test that light group includes only lights in the same area."""
    device_reg, _ = mock_device_registry
    
    # Setup states for all lights
    hass.states.async_set("light.living_room_ceiling", STATE_OFF)
    hass.states.async_set("light.living_room_lamp", STATE_OFF)
    hass.states.async_set("light.kitchen_ceiling", STATE_OFF)
    hass.states.async_set("light.bedroom_ceiling", STATE_OFF)
    
    # Get lights for living room
    living_room_lights = get_lights_for_area(
        hass,
        mock_area_registry["living_room"],
        mock_entity_registry,
        device_reg,
    )
    
    # Create light group for living room
    light_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["living_room"],
        area_name="Living Room",
        light_entity_ids=living_room_lights,
    )
    
    # Get member lights
    members = light_group._light_entity_ids
    
    # Should include only living room lights (not disabled, not linus_brain entities)
    assert "light.living_room_ceiling" in members
    assert "light.living_room_lamp" in members
    assert len(members) == 2
    
    # Should NOT include lights from other areas
    assert "light.kitchen_ceiling" not in members
    assert "light.bedroom_ceiling" not in members
    
    # Should NOT include disabled lights
    assert "light.living_room_disabled" not in members
    
    # Should NOT include linus_brain entities
    assert f"light.linus_brain_all_lights_{mock_area_registry['living_room']}" not in members


async def test_light_group_includes_device_area_lights(
    hass: HomeAssistant,
    mock_area_registry,
    mock_entity_registry,
    mock_device_registry,
):
    """Test that light group includes lights whose device is in the area."""
    device_reg, device_id = mock_device_registry
    
    # Create a light without direct area assignment but device has area
    mock_entity_registry.async_get_or_create(
        "light",
        "test",
        "device_light",
        suggested_object_id="device_light",
        device_id=device_id,
        # No area_id - should inherit from device
    )
    
    hass.states.async_set("light.device_light", STATE_OFF)
    
    # Get lights for living room
    living_room_lights = get_lights_for_area(
        hass,
        mock_area_registry["living_room"],
        mock_entity_registry,
        device_reg,
    )
    
    # Create light group for living room
    light_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["living_room"],
        area_name="Living Room",
        light_entity_ids=living_room_lights,
    )
    
    # Should include light that belongs to a device in the area
    assert "light.device_light" in light_group._light_entity_ids


async def test_light_group_excludes_other_areas(
    hass: HomeAssistant,
    mock_area_registry,
    mock_entity_registry,
    mock_device_registry,
):
    """Test that light group strictly excludes lights from other areas."""
    device_reg, _ = mock_device_registry
    
    # Setup states
    hass.states.async_set("light.living_room_ceiling", STATE_OFF)
    hass.states.async_set("light.kitchen_ceiling", STATE_OFF)
    
    # Get lights for kitchen
    kitchen_lights = get_lights_for_area(
        hass,
        mock_area_registry["kitchen"],
        mock_entity_registry,
        device_reg,
    )
    
    # Create light group for kitchen
    light_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["kitchen"],
        area_name="Kitchen",
        light_entity_ids=kitchen_lights,
    )
    
    members = light_group._light_entity_ids
    
    # Should only include kitchen light
    assert "light.kitchen_ceiling" in members
    assert len(members) == 1
    
    # Should NOT include living room lights
    assert "light.living_room_ceiling" not in members
    assert "light.living_room_lamp" not in members


async def test_light_group_excludes_disabled_lights(
    hass: HomeAssistant,
    mock_area_registry,
    mock_entity_registry,
    mock_device_registry,
):
    """Test that light group excludes disabled lights."""
    device_reg, _ = mock_device_registry
    
    hass.states.async_set("light.living_room_ceiling", STATE_OFF)
    
    # Get lights for living room
    living_room_lights = get_lights_for_area(
        hass,
        mock_area_registry["living_room"],
        mock_entity_registry,
        device_reg,
    )
    
    # Create light group
    light_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["living_room"],
        area_name="Living Room",
        light_entity_ids=living_room_lights,
    )
    
    members = light_group._light_entity_ids
    
    # Should NOT include disabled light
    assert "light.living_room_disabled" not in members
    
    # Should still include active lights
    assert "light.living_room_ceiling" in members


async def test_light_group_excludes_linus_brain_entities(
    hass: HomeAssistant,
    mock_area_registry,
    mock_entity_registry,
    mock_device_registry,
):
    """Test that light group excludes all linus_brain light entities."""
    device_reg, _ = mock_device_registry
    
    hass.states.async_set("light.living_room_ceiling", STATE_OFF)
    
    # Get lights for living room
    living_room_lights = get_lights_for_area(
        hass,
        mock_area_registry["living_room"],
        mock_entity_registry,
        device_reg,
    )
    
    # Create light group
    light_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["living_room"],
        area_name="Living Room",
        light_entity_ids=living_room_lights,
    )
    
    members = light_group._light_entity_ids
    
    # Should NOT include any linus_brain entities
    linus_brain_entities = [m for m in members if m.startswith("light.linus_brain")]
    assert len(linus_brain_entities) == 0
    
    # Should include regular lights
    assert "light.living_room_ceiling" in members
    assert "light.living_room_lamp" in members


async def test_light_group_empty_area(
    hass: HomeAssistant,
    mock_area_registry,
    mock_entity_registry,
    mock_device_registry,
):
    """Test light group behavior with an area that has no lights."""
    # Create new area with no lights
    area_registry = ar.async_get(hass)
    empty_area = area_registry.async_create("Empty Area")
    
    # Create light group
    light_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=empty_area.id,
        area_name="Empty Area",
        light_entity_ids=[],
    )
    
    members = light_group._light_entity_ids
    
    # Should have no members
    assert len(members) == 0
    
    # Group should still function (just do nothing)
    assert light_group.is_on is False
    assert light_group.available is True


async def test_light_group_smart_filtering_brightness(
    hass: HomeAssistant,
    mock_area_registry,
    mock_entity_registry,
    mock_device_registry,
):
    """Test smart filtering: brightness adjustment only affects ON lights."""
    device_reg, _ = mock_device_registry
    
    # Setup: one light ON, one light OFF
    hass.states.async_set(
        "light.living_room_ceiling",
        STATE_ON,
        {ATTR_BRIGHTNESS: 255, ATTR_SUPPORTED_COLOR_MODES: [ColorMode.BRIGHTNESS]},
    )
    hass.states.async_set(
        "light.living_room_lamp",
        STATE_OFF,
        {ATTR_SUPPORTED_COLOR_MODES: [ColorMode.BRIGHTNESS]},
    )
    
    # Get lights for living room
    living_room_lights = get_lights_for_area(
        hass,
        mock_area_registry["living_room"],
        mock_entity_registry,
        device_reg,
    )
    
    # Create light group
    light_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["living_room"],
        area_name="Living Room",
        light_entity_ids=living_room_lights,
    )
    
    # Add to hass to trigger state updates
    light_group.hass = hass
    await light_group.async_added_to_hass()
    await light_group.async_update()
    
    # Mock service call
    hass.services.async_call = AsyncMock()
    
    # Call turn_on with brightness (should only target ON lights)
    await light_group.async_turn_on(brightness=128)
    
    # Should call service with only the ON light
    hass.services.async_call.assert_called_once()
    call_args = hass.services.async_call.call_args
    
    assert call_args[0][0] == "light"  # domain
    assert call_args[0][1] == "turn_on"  # service
    
    service_data = call_args[1]
    assert "light.living_room_ceiling" in service_data["entity_id"]
    assert "light.living_room_lamp" not in service_data["entity_id"]


async def test_light_group_turn_on_all_without_params(
    hass: HomeAssistant,
    mock_area_registry,
    mock_entity_registry,
    mock_device_registry,
):
    """Test turn_on without params turns on ALL lights (including OFF ones)."""
    device_reg, _ = mock_device_registry
    
    # Setup: both lights OFF
    hass.states.async_set(
        "light.living_room_ceiling",
        STATE_OFF,
        {ATTR_SUPPORTED_COLOR_MODES: [ColorMode.BRIGHTNESS]},
    )
    hass.states.async_set(
        "light.living_room_lamp",
        STATE_OFF,
        {ATTR_SUPPORTED_COLOR_MODES: [ColorMode.BRIGHTNESS]},
    )
    
    # Get lights for living room
    living_room_lights = get_lights_for_area(
        hass,
        mock_area_registry["living_room"],
        mock_entity_registry,
        device_reg,
    )
    
    # Create light group
    light_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["living_room"],
        area_name="Living Room",
        light_entity_ids=living_room_lights,
    )
    
    # Add to hass
    light_group.hass = hass
    await light_group.async_added_to_hass()
    
    # Mock service call
    hass.services.async_call = AsyncMock()
    
    # Call turn_on without params
    await light_group.async_turn_on()
    
    # Should call service with ALL lights
    hass.services.async_call.assert_called_once()
    call_args = hass.services.async_call.call_args
    service_data = call_args[1]
    
    assert "light.living_room_ceiling" in service_data["entity_id"]
    assert "light.living_room_lamp" in service_data["entity_id"]


async def test_light_group_multiple_areas_isolation(
    hass: HomeAssistant,
    mock_area_registry,
    mock_entity_registry,
    mock_device_registry,
):
    """Test that multiple light groups don't interfere with each other."""
    device_reg, _ = mock_device_registry
    
    # Setup states
    hass.states.async_set("light.living_room_ceiling", STATE_OFF)
    hass.states.async_set("light.kitchen_ceiling", STATE_OFF)
    hass.states.async_set("light.bedroom_ceiling", STATE_OFF)
    
    # Get lights for each area
    living_room_lights = get_lights_for_area(
        hass, mock_area_registry["living_room"], mock_entity_registry, device_reg
    )
    kitchen_lights = get_lights_for_area(
        hass, mock_area_registry["kitchen"], mock_entity_registry, device_reg
    )
    bedroom_lights = get_lights_for_area(
        hass, mock_area_registry["bedroom"], mock_entity_registry, device_reg
    )
    
    # Create light groups for different areas
    living_room_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["living_room"],
        area_name="Living Room",
        light_entity_ids=living_room_lights,
    )
    
    kitchen_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["kitchen"],
        area_name="Kitchen",
        light_entity_ids=kitchen_lights,
    )
    
    bedroom_group = AreaLightGroup(
        entry_id="test_entry",
        area_id=mock_area_registry["bedroom"],
        area_name="Bedroom",
        light_entity_ids=bedroom_lights,
    )
    
    # Verify each group has only its own lights
    lr_members = living_room_group._light_entity_ids
    k_members = kitchen_group._light_entity_ids
    b_members = bedroom_group._light_entity_ids
    
    # Living room
    assert "light.living_room_ceiling" in lr_members
    assert "light.kitchen_ceiling" not in lr_members
    assert "light.bedroom_ceiling" not in lr_members
    
    # Kitchen
    assert "light.kitchen_ceiling" in k_members
    assert "light.living_room_ceiling" not in k_members
    assert "light.bedroom_ceiling" not in k_members
    
    # Bedroom
    assert "light.bedroom_ceiling" in b_members
    assert "light.living_room_ceiling" not in b_members
    assert "light.kitchen_ceiling" not in b_members
