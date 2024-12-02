"""Linus Dashboard integration for Home Assistant."""

import logging
from pathlib import Path

import voluptuous as vol
from homeassistant.components import websocket_api
from homeassistant.components.frontend import async_remove_panel
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace import _register_panel
from homeassistant.components.lovelace.dashboard import LovelaceYAML
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from custom_components.linus_dashboard import utils
from custom_components.linus_dashboard.const import DOMAIN

from .const import (
    CONF_ALARM_ENTITY,
    CONF_ALARM_ENTITY_ID,
    CONF_WEATHER_ENTITY,
    CONF_WEATHER_ENTITY_ID,
)

_LOGGER = logging.getLogger(__name__)


async def async_setup(hass: HomeAssistant, _config: dict) -> bool:
    """Set up Linus Dashboard."""
    _LOGGER.info("Setting up Linus Dashboard")
    hass.data.setdefault(DOMAIN, {})

    hass.components.websocket_api.async_register_command(websocket_get_entities)

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Linus Dashboard from a config entry."""
    _LOGGER.info("Setting up Linus Dashboard entry")

    # Path to the JavaScript file for the strategy
    await register_static_paths_and_resources(hass, "linus-strategy.js")
    await register_static_paths_and_resources(hass, "browser_mod.js")
    await register_static_paths_and_resources(hass, "lovelace-mushroom/mushroom.js")
    await register_static_paths_and_resources(hass, "lovelace-card-mod/card-mod.js")
    await register_static_paths_and_resources(hass, "swipe-card/swipe-card.js")
    await register_static_paths_and_resources(hass, "stack-in-card/stack-in-card.js")
    await register_static_paths_and_resources(
        hass, "mini-graph-card/mini-graph-card-bundle.js"
    )

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
    # Check if the file is already installed via HACS
    if js_file == "browser_mod.js":
        hacs_installed_path = Path(hass.config.path("custom_components/browser_mod"))
    else:
        hacs_installed_path = Path(hass.config.path(f"www/community/{js_file}"))
    if hacs_installed_path.exists():
        _LOGGER.info(
            "%s is already installed via HACS, skipping registration.", js_file
        )
        return

    js_url = f"/{DOMAIN}_files/www/{js_file}"
    js_path = Path(__file__).parent / f"www/{js_file}"

    await hass.http.async_register_static_paths(
        [
            StaticPathConfig(js_url, str(js_path), cache_headers=False),
        ]
    )

    # fix from https://github.com/hmmbob/WebRTC/blob/a0783df2e5426118599edc50bfd0466b1b0f0716/custom_components/webrtc/__init__.py#L83
    version = getattr(hass.data["integrations"][DOMAIN], "version", 0)
    await utils.init_resource(hass, js_url, str(version))


@websocket_api.websocket_command({vol.Required("type"): "linus_dashboard/get_config"})
@websocket_api.async_response
async def websocket_get_entities(
    hass: HomeAssistant, connection: websocket_api.ActiveConnection, msg: dict
) -> None:
    """Handle request for getting entities."""
    config_entries = hass.config_entries.async_entries(DOMAIN)
    config = {
        CONF_ALARM_ENTITY_ID: config_entries[0].options.get(CONF_ALARM_ENTITY),
        CONF_WEATHER_ENTITY_ID: config_entries[0].options.get(CONF_WEATHER_ENTITY),
    }

    connection.send_message(websocket_api.result_message(msg["id"], config))
