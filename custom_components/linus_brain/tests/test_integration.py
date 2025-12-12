"""
Example test file for Linus Brain integration.

This is a starting point for unit tests. A complete test suite should be
developed before production deployment.
"""

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from homeassistant.core import HomeAssistant
from homeassistant.setup import async_setup_component

from ..const import (
    CONF_SUPABASE_KEY,
    CONF_SUPABASE_URL,
    DOMAIN,
)


@pytest.fixture
def mock_supabase_client():
    """Mock the Supabase client."""
    with patch("linus_brain.utils.supabase_client.SupabaseClient") as mock:
        client = mock.return_value
        client.fetch_rules = AsyncMock(return_value=[])
        client.test_connection = AsyncMock(return_value=True)
        yield client


@pytest.fixture
def mock_config_entry():
    """Mock a config entry."""
    entry = MagicMock()
    entry.data = {
        CONF_SUPABASE_URL: "https://test.supabase.co",
        CONF_SUPABASE_KEY: "test_key_12345",
    }
    entry.entry_id = "test_entry_id"
    return entry


@pytest.mark.skip(reason="Requires proper Home Assistant test fixture setup")
@pytest.mark.asyncio
async def test_setup_integration(
    hass: HomeAssistant, mock_config_entry, mock_supabase_client
):
    """Test integration setup."""
    with patch("linus_brain.coordinator.LinusBrainCoordinator"):
        result = await async_setup_component(
            hass, DOMAIN, {DOMAIN: mock_config_entry.data}
        )
        assert result is True


# More tests should be added for:
# - Event listener functionality
# - Area state aggregation
# - Error handling
# - Service calls
# - Config flow validation
