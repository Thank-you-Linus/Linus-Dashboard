"""Linus Dashboard integration for Home Assistant."""

import logging
from pathlib import Path

from homeassistant.components.frontend import (
    async_remove_panel,
)
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace import _register_panel
from homeassistant.components.lovelace.dashboard import LovelaceYAML
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from custom_components.linus_dashboard import utils
from custom_components.linus_dashboard.const import URL_PANEL

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

    # Path to the JavaScript file for the strategy
    strategy_js_url = f"/{DOMAIN}/js/linus-strategy.js"
    strategy_js_path = Path(__file__).parent / "js/linus-strategy.js"

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(
                strategy_js_url, str(strategy_js_path), cache_headers=False
            ),
        ]
    )

    # fix from https://github.com/hmmbob/WebRTC/blob/a0783df2e5426118599edc50bfd0466b1b0f0716/custom_components/webrtc/__init__.py#L83
    version = getattr(hass.data["integrations"][DOMAIN], "version", 0)
    await utils.init_resource(hass, f"/{DOMAIN}/js/linus-strategy.js", str(version))

    # Use a unique name for the panel to avoid conflicts
    sidebar_title = "Linus Dashboard"
    sidebar_icon = "mdi:bow-tie"
    filename_path = Path(__file__).parent / "lovelace/ui-lovelace.yaml"

    dashboard_config = {
        "mode": "yaml",
        "icon": sidebar_icon,
        "title": sidebar_title,
        "filename": str(filename_path),
        "show_in_sidebar": True,
        "require_admin": False,
    }

    hass.data["lovelace"]["dashboards"][URL_PANEL] = LovelaceYAML(
        hass, URL_PANEL, dashboard_config
    )

    _register_panel(hass, URL_PANEL, "yaml", dashboard_config, False)

    # Store the entry
    hass.data[DOMAIN][entry.entry_id] = URL_PANEL
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Linus Dashboard entry")

    # Retrieve and remove the panel name
    panel_url = hass.data[DOMAIN].pop(entry.entry_id, None)
    if panel_url:
        async_remove_panel(hass, panel_url)

    return True
