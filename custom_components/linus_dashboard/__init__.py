"""Linus Dashboard integration for Home Assistant."""

import json
import logging
from pathlib import Path

from homeassistant.components import frontend, websocket_api
from homeassistant.components.http import StaticPathConfig
from homeassistant.components.lovelace import _register_panel
from homeassistant.components.lovelace.dashboard import LovelaceYAML
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.decorators import (
    async_response,
    websocket_command,
)
from homeassistant.components.websocket_api.messages import result_message
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant

from custom_components.linus_dashboard import utils
from custom_components.linus_dashboard.const import (
    CONF_ALARM_ENTITY_IDS,
    CONF_EXCLUDED_DEVICE_CLASSES,
    CONF_EXCLUDED_DOMAINS,
    CONF_EXCLUDED_INTEGRATIONS,
    CONF_EXCLUDED_TARGETS,
    CONF_HIDE_GREETING,
    CONF_WEATHER_ENTITY,
    CONF_WEATHER_ENTITY_ID,
    DOMAIN,
)

_LOGGER = logging.getLogger(__name__)


def get_version() -> str:
    """Get the version from manifest.json."""
    manifest_path = Path(__file__).parent / "manifest.json"
    try:
        with manifest_path.open(encoding="utf-8") as manifest_file:
            manifest = json.load(manifest_file)
            return manifest.get("version", "unknown")
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        _LOGGER.exception("Failed to read version from manifest")
        return "unknown"


async def async_setup(hass: HomeAssistant, _config: dict) -> bool:
    """Set up Linus Dashboard."""
    _LOGGER.info("Setting up Linus Dashboard")
    hass.data.setdefault(DOMAIN, {})

    # Register WebSocket commands
    websocket_api.async_register_command(hass, websocket_get_entities)
    _LOGGER.info("Registered WebSocket command: linus_dashboard/get_config")

    return True


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Linus Dashboard from a config entry."""
    _LOGGER.info("Setting up Linus Dashboard entry")

    # Path to the JavaScript file for the strategy - register all static resources
    await register_static_paths_and_resources(hass, "browser_mod.js")
    await register_static_paths_and_resources(hass, "lovelace-mushroom/mushroom.js")
    await register_static_paths_and_resources(hass, "lovelace-card-mod/card-mod.js")
    await register_static_paths_and_resources(hass, "swipe-card/swipe-card.js")
    await register_static_paths_and_resources(hass, "stack-in-card/stack-in-card.js")
    await register_static_paths_and_resources(hass, "linus-strategy.js")

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

    hass.data["lovelace"].dashboards[DOMAIN] = LovelaceYAML(
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
        frontend.async_remove_panel(hass, panel_url)

    return True


async def register_static_paths_and_resources(
    hass: HomeAssistant, js_file: str
) -> None:
    """
    Register static paths and resources for a given JavaScript file.

    Always registers the bundled resources to ensure compatibility with Linus Dashboard,
    regardless of whether they are installed via HACS or other means.

    Implements cache-busting by appending version query parameter to resource URLs.
    """
    js_url = f"/{DOMAIN}_files/www/{js_file}"
    js_path = Path(__file__).parent / f"www/{js_file}"

    # Check if the file actually exists
    if not js_path.exists():
        _LOGGER.warning(
            "JavaScript file not found: %s - skipping registration", js_path
        )
        return

    # Register the static path (without version param - Home Assistant will handle it)
    await hass.http.async_register_static_paths([
        StaticPathConfig(js_url, str(js_path), cache_headers=False),
    ])

    # Get version from manifest for cache busting
    manifest_version = get_version()

    # Register as a Lovelace resource with version query param for cache busting
    # This ensures browsers fetch the new version after updates
    versioned_url = f"{js_url}?v={manifest_version}"

    await utils.init_resource(hass, versioned_url, str(manifest_version))

    _LOGGER.debug(
        "Registered resource: %s (version: %s)", versioned_url, manifest_version
    )


@websocket_command({
    "type": "linus_dashboard/get_config",
})
@async_response
async def websocket_get_entities(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict
) -> None:
    """Handle request for getting entities and version info."""
    config_entries = hass.config_entries.async_entries(DOMAIN)
    config = {
        CONF_ALARM_ENTITY_IDS: config_entries[0].options.get(CONF_ALARM_ENTITY_IDS, []),
        CONF_WEATHER_ENTITY_ID: config_entries[0].options.get(CONF_WEATHER_ENTITY),
        CONF_HIDE_GREETING: config_entries[0].options.get(CONF_HIDE_GREETING),
        CONF_EXCLUDED_DOMAINS: config_entries[0].options.get(CONF_EXCLUDED_DOMAINS),
        CONF_EXCLUDED_DEVICE_CLASSES: config_entries[0].options.get(
            CONF_EXCLUDED_DEVICE_CLASSES
        ),
        CONF_EXCLUDED_INTEGRATIONS: config_entries[0].options.get(
            CONF_EXCLUDED_INTEGRATIONS, []
        ),
        CONF_EXCLUDED_TARGETS: config_entries[0].options.get(CONF_EXCLUDED_TARGETS),
        "version": get_version(),  # Include version for frontend version check
    }

    connection.send_message(result_message(msg["id"], config))
