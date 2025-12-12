"""
Pytest configuration and fixtures for Linus Brain tests.
"""

from unittest.mock import MagicMock

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from ..const import CONF_SUPABASE_KEY, CONF_SUPABASE_URL, DOMAIN

# Import pytest-homeassistant-custom-component plugin fixtures
pytest_plugins = ["pytest_homeassistant_custom_component"]


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance."""
    hass = MagicMock(spec=HomeAssistant)
    hass.data = {DOMAIN: {}}
    hass.config.language = "en"
    hass.states = MagicMock()
    hass.states.get = MagicMock(return_value=None)
    return hass


@pytest.fixture
def mock_hass_fr():
    """Mock Home Assistant instance with French language."""
    hass = MagicMock(spec=HomeAssistant)
    hass.data = {DOMAIN: {}}
    hass.config.language = "fr"
    hass.states = MagicMock()
    hass.states.get = MagicMock(return_value=None)
    return hass


@pytest.fixture
def mock_config_entry():
    """Mock config entry."""
    entry = MagicMock()
    entry.entry_id = "test_entry"
    entry.data = {
        CONF_SUPABASE_URL: "https://test.supabase.co",
        CONF_SUPABASE_KEY: "test_key",
    }
    return entry


@pytest.fixture
def mock_area_registry():
    """Mock area registry."""
    registry = MagicMock(spec=ar.AreaRegistry)
    registry.async_get_area = MagicMock(return_value=None)
    registry.async_list_areas = MagicMock(return_value=[])
    return registry


@pytest.fixture
def mock_entity_registry():
    """Mock entity registry."""
    registry = MagicMock(spec=er.EntityRegistry)
    registry.entities = MagicMock()
    registry.entities.get_entries_for_area = MagicMock(return_value=[])
    return registry


@pytest.fixture
def mock_device_registry():
    """Mock device registry."""
    registry = MagicMock(spec=dr.DeviceRegistry)
    registry.devices = MagicMock()
    return registry
