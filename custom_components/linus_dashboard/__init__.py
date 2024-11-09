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
from custom_components.linus_dashboard.const import DOMAIN

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
    await register_static_paths_and_resources(hass, "linus-strategy.js")
    await register_static_paths_and_resources(hass, "mushroom.js")
    await register_static_paths_and_resources(hass, "card-mod.js")
    await register_static_paths_and_resources(hass, "browser_mod.js")
    await register_static_paths_and_resources(hass, "swipe-card.js")
    await register_static_paths_and_resources(hass, "layout-card.js")
    await register_static_paths_and_resources(hass, "stack-in-card.js")
    await register_static_paths_and_resources(hass, "mini-graph-card.js")

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

    hass.data["lovelace"]["dashboards"][DOMAIN] = LovelaceYAML(
        hass, DOMAIN, dashboard_config
    )

    _register_panel(hass, DOMAIN, "yaml", dashboard_config, False)  # noqa: FBT003

    # Store the entry
    hass.data[DOMAIN][entry.entry_id] = DOMAIN
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Linus Dashboard entry")

    # Retrieve and remove the panel name
    panel_url = hass.data[DOMAIN].pop(entry.entry_id, None)
    if panel_url:
        async_remove_panel(hass, panel_url)

    return True


async def register_static_paths_and_resources(
    hass: HomeAssistant, js_file: str
) -> None:
    """Register static paths and resources for a given JavaScript file."""
    js_url = f"/{DOMAIN}_files/js/{js_file}"
    js_path = Path(__file__).parent / f"js/{js_file}"

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(js_url, str(js_path), cache_headers=False),
        ]
    )

    # fix from https://github.com/hmmbob/WebRTC/blob/a0783df2e5426118599edc50bfd0466b1b0f0716/custom_components/webrtc/__init__.py#L83
    version = getattr(hass.data["integrations"][DOMAIN], "version", 0)
    await utils.init_resource(hass, js_url, str(version))
