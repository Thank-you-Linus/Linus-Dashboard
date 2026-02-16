"""Linus Dashboard integration for Home Assistant."""

import asyncio
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
from homeassistant.helpers import config_validation as cv

from custom_components.linus_dashboard import utils
from custom_components.linus_dashboard.const import (
    CONF_ALARM_ENTITY_IDS,
    CONF_EMBEDDED_DASHBOARDS,
    CONF_EXCLUDED_DEVICE_CLASSES,
    CONF_EXCLUDED_DOMAINS,
    CONF_EXCLUDED_INTEGRATIONS,
    CONF_EXCLUDED_TARGETS,
    CONF_HIDE_GREETING,
    CONF_WEATHER_ENTITY,
    CONF_WEATHER_ENTITY_ID,
    DOMAIN,
    VERSION,
    is_logger_debug,
)

_LOGGER = logging.getLogger(__name__)

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


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

    # Register all static paths and resources for bundled JS files.
    # Phase 1: Check file existence and register static paths in parallel (I/O-bound).
    # Phase 2: Register lovelace resources sequentially (shared storage, not parallelizable).
    js_files = [
        "browser_mod.js",
        "lovelace-mushroom/mushroom.js",
        "lovelace-card-mod/card-mod.js",
        "swipe-card/swipe-card.js",
        "stack-in-card/stack-in-card.js",
        "linus-strategy.js",
    ]

    base_path = Path(__file__).parent / "www"
    manifest_version = VERSION

    # Phase 1: Check existence in parallel and register static paths
    async def register_static_path(js_file: str) -> str | None:
        """Register static path if file exists. Returns js_file if successful, None otherwise."""
        js_path = base_path / js_file
        if not await hass.async_add_executor_job(js_path.exists):
            _LOGGER.warning(
                "JavaScript file not found: %s - skipping registration", js_path
            )
            return None
        js_url = f"/{DOMAIN}_files/www/{js_file}"
        await hass.http.async_register_static_paths([
            StaticPathConfig(js_url, str(js_path), cache_headers=False),
        ])
        return js_file

    registered = await asyncio.gather(*(register_static_path(f) for f in js_files))

    # Phase 2: Register lovelace resources sequentially (shared ResourceStorageCollection)
    for js_file in registered:
        if js_file is None:
            continue
        js_url = f"/{DOMAIN}_files/www/{js_file}"
        versioned_url = f"{js_url}?v={manifest_version}"
        await utils.init_resource(hass, versioned_url, str(manifest_version))
        _LOGGER.debug(
            "Registered resource: %s (version: %s)", versioned_url, manifest_version
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


@websocket_command({
    "type": "linus_dashboard/get_config",
})
@async_response
async def websocket_get_entities(
    hass: HomeAssistant, connection: ActiveConnection, msg: dict
) -> None:
    """Handle request for getting entities and version info."""
    config_entries = hass.config_entries.async_entries(DOMAIN)

    # Auto-detect debug mode from logger level
    import logging as log

    debug_enabled = is_logger_debug()
    _LOGGER.info(
        "🔍 Debug mode detection: enabled=%s, logger_level=%s, effective_level=%s",
        debug_enabled,
        log.getLevelName(_LOGGER.level) if _LOGGER.level != log.NOTSET else "NOTSET",
        log.getLevelName(_LOGGER.getEffectiveLevel()),
    )

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
        CONF_EMBEDDED_DASHBOARDS: config_entries[0].options.get(
            CONF_EMBEDDED_DASHBOARDS, []
        ),
        "debug": debug_enabled,
        "version": VERSION,  # Include version for frontend version check
    }

    _LOGGER.info(
        "WebSocket sending config: debug=%s, embedded_dashboards=%s",
        config["debug"],
        config[CONF_EMBEDDED_DASHBOARDS],
    )

    connection.send_message(result_message(msg["id"], config))
