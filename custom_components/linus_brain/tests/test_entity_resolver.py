"""
Tests for EntityResolver.

Tests dynamic entity resolution based on domain, device class, and area.
"""

from unittest.mock import MagicMock

import pytest

from ..utils.entity_resolver import EntityResolver


@pytest.fixture
def mock_hass():
    """Create a mock Home Assistant instance."""
    hass = MagicMock()

    entity_reg = MagicMock()
    device_reg = MagicMock()
    area_reg = MagicMock()

    kitchen_area = MagicMock()
    kitchen_area.id = "kitchen_area_id"
    kitchen_area.name = "Kitchen"

    living_room_area = MagicMock()
    living_room_area.id = "living_room_area_id"
    living_room_area.name = "Living Room"

    kitchen_device = MagicMock()
    kitchen_device.id = "kitchen_device_id"
    kitchen_device.area_id = "kitchen_area_id"

    living_room_device = MagicMock()
    living_room_device.id = "living_room_device_id"
    living_room_device.area_id = "living_room_area_id"

    motion_entity = MagicMock()
    motion_entity.entity_id = "binary_sensor.kitchen_motion"
    motion_entity.domain = "binary_sensor"
    motion_entity.device_class = "motion"
    motion_entity.device_id = "kitchen_device_id"
    motion_entity.area_id = None

    illuminance_entity = MagicMock()
    illuminance_entity.entity_id = "sensor.kitchen_illuminance"
    illuminance_entity.domain = "sensor"
    illuminance_entity.device_class = "illuminance"
    illuminance_entity.device_id = "kitchen_device_id"
    illuminance_entity.area_id = None

    light1_entity = MagicMock()
    light1_entity.entity_id = "light.kitchen_light_1"
    light1_entity.domain = "light"
    light1_entity.device_class = None
    light1_entity.device_id = "kitchen_device_id"
    light1_entity.area_id = None

    light2_entity = MagicMock()
    light2_entity.entity_id = "light.kitchen_light_2"
    light2_entity.domain = "light"
    light2_entity.device_class = None
    light2_entity.device_id = "kitchen_device_id"
    light2_entity.area_id = None

    entity_reg.entities.values.return_value = [
        motion_entity,
        illuminance_entity,
        light1_entity,
        light2_entity,
    ]

    device_reg.async_get.side_effect = lambda device_id: {
        "kitchen_device_id": kitchen_device,
        "living_room_device_id": living_room_device,
    }.get(device_id)

    hass.data = {}

    with pytest.MonkeyPatch.context() as m:
        m.setattr(
            "homeassistant.helpers.entity_registry.async_get", lambda h: entity_reg
        )
        m.setattr(
            "homeassistant.helpers.device_registry.async_get", lambda h: device_reg
        )
        m.setattr("homeassistant.helpers.area_registry.async_get", lambda h: area_reg)

    return hass, entity_reg, device_reg, area_reg


@pytest.mark.asyncio
async def test_resolve_entity_first_strategy(mock_hass):
    """Test resolving entity with 'first' strategy."""
    hass, entity_reg, device_reg, area_reg = mock_hass

    with pytest.MonkeyPatch.context() as m:
        m.setattr(
            "homeassistant.helpers.entity_registry.async_get", lambda h: entity_reg
        )
        m.setattr(
            "homeassistant.helpers.device_registry.async_get", lambda h: device_reg
        )
        m.setattr("homeassistant.helpers.area_registry.async_get", lambda h: area_reg)

        resolver = EntityResolver(hass)

        entity_id = resolver.resolve_entity(
            domain="binary_sensor",
            device_class="motion",
            area_id="kitchen_area_id",
            strategy="first",
        )

        assert entity_id == "binary_sensor.kitchen_motion"


@pytest.mark.asyncio
async def test_resolve_entity_all_strategy(mock_hass):
    """Test resolving entities with 'all' strategy."""
    hass, entity_reg, device_reg, area_reg = mock_hass

    with pytest.MonkeyPatch.context() as m:
        m.setattr(
            "homeassistant.helpers.entity_registry.async_get", lambda h: entity_reg
        )
        m.setattr(
            "homeassistant.helpers.device_registry.async_get", lambda h: device_reg
        )
        m.setattr("homeassistant.helpers.area_registry.async_get", lambda h: area_reg)

        resolver = EntityResolver(hass)

        entity_ids = resolver.resolve_entity(
            domain="light",
            area_id="kitchen_area_id",
            strategy="all",
        )

        assert isinstance(entity_ids, list)
        assert len(entity_ids) == 2
        assert "light.kitchen_light_1" in entity_ids
        assert "light.kitchen_light_2" in entity_ids


@pytest.mark.asyncio
async def test_resolve_entity_no_match(mock_hass):
    """Test resolving entity with no matches."""
    hass, entity_reg, device_reg, area_reg = mock_hass

    with pytest.MonkeyPatch.context() as m:
        m.setattr(
            "homeassistant.helpers.entity_registry.async_get", lambda h: entity_reg
        )
        m.setattr(
            "homeassistant.helpers.device_registry.async_get", lambda h: device_reg
        )
        m.setattr("homeassistant.helpers.area_registry.async_get", lambda h: area_reg)

        resolver = EntityResolver(hass)

        entity_id = resolver.resolve_entity(
            domain="switch",
            area_id="kitchen_area_id",
            strategy="first",
        )

        assert entity_id is None


@pytest.mark.asyncio
async def test_resolve_condition(mock_hass):
    """Test resolving generic condition to entity_id."""
    hass, entity_reg, device_reg, area_reg = mock_hass

    with pytest.MonkeyPatch.context() as m:
        m.setattr(
            "homeassistant.helpers.entity_registry.async_get", lambda h: entity_reg
        )
        m.setattr(
            "homeassistant.helpers.device_registry.async_get", lambda h: device_reg
        )
        m.setattr("homeassistant.helpers.area_registry.async_get", lambda h: area_reg)

        resolver = EntityResolver(hass)

        condition = {
            "condition": "state",
            "domain": "binary_sensor",
            "device_class": "motion",
            "area": "current",
            "state": "on",
        }

        resolved = resolver.resolve_condition(condition, "kitchen_area_id")

        assert resolved is not None
        assert "entity_id" in resolved
        assert resolved["entity_id"] == "binary_sensor.kitchen_motion"
        assert "domain" not in resolved
        assert "device_class" not in resolved
        assert "area" not in resolved
        assert resolved["state"] == "on"


@pytest.mark.asyncio
async def test_resolve_condition_already_has_entity_id(mock_hass):
    """Test resolving condition that already has entity_id."""
    hass, _, _, _ = mock_hass

    with pytest.MonkeyPatch.context() as m:
        m.setattr(
            "homeassistant.helpers.entity_registry.async_get", lambda h: MagicMock()
        )
        m.setattr(
            "homeassistant.helpers.device_registry.async_get", lambda h: MagicMock()
        )
        m.setattr(
            "homeassistant.helpers.area_registry.async_get", lambda h: MagicMock()
        )

        resolver = EntityResolver(hass)

        condition = {
            "condition": "state",
            "entity_id": "sun.sun",
            "state": "below_horizon",
        }

        resolved = resolver.resolve_condition(condition, "any_area")

        assert resolved == condition


@pytest.mark.asyncio
async def test_resolve_nested_conditions(mock_hass):
    """Test resolving nested AND/OR conditions."""
    hass, entity_reg, device_reg, area_reg = mock_hass

    with pytest.MonkeyPatch.context() as m:
        m.setattr(
            "homeassistant.helpers.entity_registry.async_get", lambda h: entity_reg
        )
        m.setattr(
            "homeassistant.helpers.device_registry.async_get", lambda h: device_reg
        )
        m.setattr("homeassistant.helpers.area_registry.async_get", lambda h: area_reg)

        resolver = EntityResolver(hass)

        conditions = [
            {
                "condition": "and",
                "conditions": [
                    {
                        "condition": "state",
                        "domain": "binary_sensor",
                        "device_class": "motion",
                        "area": "current",
                        "state": "on",
                    },
                    {
                        "condition": "numeric_state",
                        "domain": "sensor",
                        "device_class": "illuminance",
                        "area": "current",
                        "below": 20,
                    },
                ],
            }
        ]

        resolved = resolver.resolve_nested_conditions(conditions, "kitchen_area_id")

        assert len(resolved) == 1
        assert resolved[0]["condition"] == "and"
        assert len(resolved[0]["conditions"]) == 2
        assert "entity_id" in resolved[0]["conditions"][0]
        assert "entity_id" in resolved[0]["conditions"][1]
