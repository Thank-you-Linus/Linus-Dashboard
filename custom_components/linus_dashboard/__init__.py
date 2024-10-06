"""
Custom integration to integrate linus_dashboard with Home Assistant.

For more details about this integration, please refer to
https://github.com/Thank-you-Linus/Linus-Dashboard
"""

from __future__ import annotations

from typing import TYPE_CHECKING

from homeassistant.const import CONF_PASSWORD, CONF_USERNAME, Platform
from homeassistant.helpers.aiohttp_client import async_get_clientsession
from homeassistant.loader import async_get_loaded_integration

from .api import IntegrationBlueprintApiClient
from .coordinator import BlueprintDataUpdateCoordinator
from .data import IntegrationBlueprintData

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

    from .data import IntegrationBlueprintConfigEntry
import yaml

PLATFORMS: list[Platform] = [
    # Platform.SENSOR,
    # Platform.BINARY_SENSOR,
    # Platform.SWITCH,
]


# https://developers.home-assistant.io/docs/config_entries_index/#setting-up-an-entry
async def async_setup_entry(
    hass: HomeAssistant,
    entry: IntegrationBlueprintConfigEntry,
) -> bool:
    """Set up this integration using UI."""
    # Load the config flow
    integration = await async_get_loaded_integration(hass, entry.domain)
    hass.config_entries.async_setup_platforms(entry, PLATFORMS)

    # Generate the dashboard
    # Assuming you have a function to generate the dashboard
    await generate_dashboard(hass, entry)

    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True

async def generate_dashboard(hass: HomeAssistant, entry: IntegrationBlueprintConfigEntry) -> None:
    """Generate the dashboard for the integration."""
    # Implement your dashboard generation logic here
    pass
    # Example of generating a dashboard based on a custom strategy
    dashboard_config = {
        "title": "Custom Dashboard",
        "views": [
            {
                "title": "Main View",
                "path": "main",
                "cards": [
                    {
                        "type": "entities",
                        "entities": [
                            "sensor.temperature",
                            "sensor.humidity",
                        ],
                        "title": "Environment Sensors",
                    },
                    {
                        "type": "history-graph",
                        "entities": [
                            "sensor.temperature",
                            "sensor.humidity",
                        ],
                        "title": "Temperature and Humidity History",
                    },
                ],
            },
        ],
    }

    # Save the dashboard configuration to the Home Assistant configuration
    dashboards = hass.data.setdefault("lovelace_dashboards", {})
    dashboards[entry.entry_id] = dashboard_config

    # Optionally, you can write the dashboard configuration to a YAML file
    dashboard_path = hass.config.path(f"custom_dashboards/{entry.entry_id}.yaml")
    with open(dashboard_path, "w") as file:
        yaml.dump(dashboard_config, file)


async def async_unload_entry(
    hass: HomeAssistant,
    entry: IntegrationBlueprintConfigEntry,
) -> bool:
    """Handle removal of an entry."""
    return await hass.config_entries.async_unload_platforms(entry, PLATFORMS)


async def async_reload_entry(
    hass: HomeAssistant,
    entry: IntegrationBlueprintConfigEntry,
) -> None:
    """Reload config entry."""
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
