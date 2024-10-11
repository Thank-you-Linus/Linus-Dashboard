"""Linus Dashboard integration for Home Assistant."""

import logging
import os

from homeassistant.components.frontend import (
    add_extra_js_url,
    async_register_built_in_panel,
    async_remove_panel,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)

DOMAIN = "linus_dashboard"


async def async_setup(hass: HomeAssistant, _config: dict) -> bool:
    """Set up Linus Dashboard."""
    _LOGGER.info("Setting up Linus Dashboard")
    hass.data.setdefault(DOMAIN, {})
    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Linus Dashboard from a config entry."""
    _LOGGER.info("Setting up Linus Dashboard entry")

    # Path to the YAML file for the dashboard
    dashboard_path = os.path.join(
        hass.config.path(f"custom_components/{DOMAIN}/lovelace/ui-lovelace.yaml")
    )

    # Path to the JavaScript file for the strategy
    strategy_js_url = f"/{DOMAIN}/js/linus-strategy.js"
    strategy_js_path = hass.config.path(
        f"custom_components/{DOMAIN}/js/linus-strategy.js"
    )
    hass.http.register_static_path(strategy_js_url, strategy_js_path, False)

    # Add the JavaScript file as a frontend resource
    add_extra_js_url(hass, strategy_js_url)

    # Use a unique name for the panel to avoid conflicts
    sidebar_title = "Linus Dashboard"
    sidebar_icon = "mdi:bow-tie"
    panel_url = DOMAIN
    async_register_built_in_panel(
        hass,
        panel_url,
        sidebar_title,
        sidebar_icon,
        config={
            "mode": "yaml",
            "icon": sidebar_icon,
            "title": sidebar_title,
            "filename": dashboard_path,
        },
    )

    # Store the entry
    hass.data[DOMAIN][entry.entry_id] = panel_url
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Linus Dashboard entry")

    # Retrieve and remove the panel name
    panel_url = hass.data[DOMAIN].pop(entry.entry_id, None)
    if panel_url:
        async_remove_panel(hass, panel_url)

    return True
