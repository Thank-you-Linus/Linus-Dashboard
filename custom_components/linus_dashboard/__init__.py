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
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import floor_registry as fr

from custom_components.linus_dashboard import utils
from custom_components.linus_dashboard.const import (
    CONF_ALARM_ENTITY_IDS,
    CONF_EMBEDDED_DASHBOARDS,
    CONF_EXCLUDED_DEVICE_CLASSES,
    CONF_EXCLUDED_DOMAINS,
    CONF_EXCLUDED_INTEGRATIONS,
    CONF_EXCLUDED_TARGETS,
    CONF_HIDE_GREETING,
    CONF_HIDE_GROUPS_FROM_VOICE_ASSISTANTS,
    CONF_WEATHER_ENTITY,
    CONF_WEATHER_ENTITY_ID,
    DOMAIN,
    VERSION,
    is_logger_debug,
)

_LOGGER = logging.getLogger(__name__)

PLATFORMS: list[Platform] = [
    Platform.SENSOR,
    Platform.BINARY_SENSOR,
    Platform.LIGHT,
    Platform.SWITCH,
    Platform.FAN,
    Platform.COVER,
    Platform.SIREN,
    Platform.CLIMATE,
    Platform.MEDIA_PLAYER,
]

CONFIG_SCHEMA = cv.config_entry_only_config_schema(DOMAIN)


async def async_setup(hass: HomeAssistant, _config: dict) -> bool:
    """Set up Linus Dashboard."""
    _LOGGER.info("Setting up Linus Dashboard")
    hass.data.setdefault(DOMAIN, {})

    # Register WebSocket commands
    websocket_api.async_register_command(hass, websocket_get_entities)
    _LOGGER.info("Registered WebSocket command: linus_dashboard/get_config")

    return True


# Domains whose generic hidden domain-level (no device_class) counting
# sensor was dropped in favor of their own dedicated group entity — see
# sensor.py's GENERIC_DOMAIN_LEVEL_DOMAINS. Any install that already ran an
# earlier version has these lingering in the registry as permanently
# "unavailable" (sensor.py stops recreating them, but nothing removes the
# old registry entry on its own).
_DEAD_GENERIC_SENSOR_DOMAINS = (
    "light",
    "switch",
    "fan",
    "cover",
    "siren",
    "climate",
    "media_player",
)


async def async_cleanup_orphaned_aggregate_sensors(
    hass: HomeAssistant, entry: ConfigEntry
) -> None:
    """
    Remove the now-dead domain-level (no device_class) generic counting
    sensors for _DEAD_GENERIC_SENSOR_DOMAINS, at global and every current
    floor scope. Built from exact expected unique_ids (not a prefix match)
    so this can't accidentally catch a same-domain device_class bucket,
    which is a different, still-live unique_id shape.
    """
    entity_reg = er.async_get(hass)
    floor_reg = fr.async_get(hass)

    dead_unique_ids = {
        f"{DOMAIN}_{domain}_active" for domain in _DEAD_GENERIC_SENSOR_DOMAINS
    }
    for floor in floor_reg.floors.values():
        dead_unique_ids.update(
            f"{DOMAIN}_{domain}_{floor.floor_id}_active"
            for domain in _DEAD_GENERIC_SENSOR_DOMAINS
        )

    for entity_entry in list(entity_reg.entities.values()):
        if (
            entity_entry.config_entry_id == entry.entry_id
            and entity_entry.unique_id in dead_unique_ids
        ):
            entity_reg.async_remove(entity_entry.entity_id)
            _LOGGER.info(
                "Removed orphaned generic aggregate sensor: %s",
                entity_entry.entity_id,
            )


# Domains whose domain-level (no device_class) generic aggregate sensor used
# to be hidden/diagnostic and is now meant to be visible (see sensor.py's
# LinusDashboardAggregateSensor.__init__). climate and media_player used to
# be here too, back when they had no dedicated group entity of their own and
# this hidden sensor was their only aggregate — now that climate.py/
# media_player.py provide a real group, their domain-level bucket is dead
# weight, cleaned up by _DEAD_GENERIC_SENSOR_DOMAINS above instead of needing
# to stay un-hidden. binary_sensor remains here since "every binary_sensor
# regardless of device_class" has no dedicated group and likely never will.
_UNHIDE_DOMAIN_LEVEL_SENSOR_DOMAINS = ("binary_sensor",)


async def async_unhide_domain_level_aggregate_sensors(
    hass: HomeAssistant, entry: ConfigEntry
) -> None:
    """
    Clear hidden_by="integration" on the binary_sensor domain-level aggregate
    sensor that an earlier version of this integration created with
    entity_registry_visible_default=False.

    HA only applies a platform's entity_registry_visible_default at first
    entity creation — bumping that default in code later doesn't
    retroactively un-hide an entity already sitting in the registry, so this
    is a one-time explicit fix rather than something the class attribute
    change alone could accomplish. Built from the exact expected unique_id
    set (global + one per current floor), same technique as
    async_cleanup_orphaned_aggregate_sensors above, so this can't
    accidentally touch a device_class-specific bucket (a different,
    still-meant-to-stay-hidden unique_id shape). Only clears hidden_by when
    it's still exactly "integration" — never touches a user's own manual
    hide (hidden_by="user").
    """
    entity_reg = er.async_get(hass)
    floor_reg = fr.async_get(hass)

    target_unique_ids = {
        f"{DOMAIN}_{domain}_active" for domain in _UNHIDE_DOMAIN_LEVEL_SENSOR_DOMAINS
    }
    for floor in floor_reg.floors.values():
        target_unique_ids.update(
            f"{DOMAIN}_{domain}_{floor.floor_id}_active"
            for domain in _UNHIDE_DOMAIN_LEVEL_SENSOR_DOMAINS
        )

    for entity_entry in list(entity_reg.entities.values()):
        if (
            entity_entry.config_entry_id == entry.entry_id
            and entity_entry.unique_id in target_unique_ids
            and entity_entry.hidden_by == "integration"
        ):
            entity_reg.async_update_entity(entity_entry.entity_id, hidden_by=None)
            _LOGGER.info(
                "Un-hid domain-level aggregate sensor: %s", entity_entry.entity_id
            )


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Linus Dashboard from a config entry."""
    _LOGGER.info("Setting up Linus Dashboard entry")

    # Register all static paths and resources for bundled JS files.
    # Phase 1: Check file existence and register static paths in parallel (I/O-bound).
    # Phase 2: Register lovelace resources sequentially (shared storage, not parallelizable).
    #
    # mushroom-loader.js MUST be first: it patches customElements.define to be idempotent,
    # preventing DOMException when HACS (or any other source) tries to re-register elements
    # that our bundled libs already defined.
    js_files = [
        "custom-elements-guard.js",
        "browser_mod.js",
        "lovelace-mushroom/mushroom.js",
        "lovelace-card-mod/card-mod.js",
        "swipe-card/swipe-card.js",
        "stack-in-card/stack-in-card.js",
        "linus-strategy.js",
    ]
    static_only: set[str] = set()

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
        if js_file is None or js_file in static_only:
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

    # Clean up sensors dropped in favor of a dedicated group entity, before
    # platforms load (same ordering as the equivalent cleanup in Linus Brain)
    await async_cleanup_orphaned_aggregate_sensors(hass, entry)
    await async_unhide_domain_level_aggregate_sensors(hass, entry)

    # Forward platforms (aggregate sensors + area/floor/global group entities)
    await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)

    await async_hide_group_entities_from_voice_assistants(hass, entry)

    # Store the entry
    hass.data[DOMAIN][entry.entry_id] = DOMAIN
    return True


async def async_hide_group_entities_from_voice_assistants(
    hass: HomeAssistant, entry: ConfigEntry
) -> None:
    """
    Mark every entity this integration created as not exposed to voice
    assistants (independent of entity_registry_visible_default, which only
    controls UI visibility — the two are separate HA settings).

    Not underscore-prefixed and exported (unlike most of this module's
    helpers) because every platform's dynamic _rebuild() callback also
    calls this after adding newly-discovered entities (a new area, a moved
    entity, ...) — this only ran once at config entry setup otherwise,
    silently leaving anything created later exposed to voice assistants by
    default even with the option enabled.

    Checks the option itself (rather than requiring every caller to) so
    call sites can stay a one-liner. Best-effort: the exposed_entities API
    has moved across HA versions, so this is wrapped defensively rather
    than treated as a hard dependency — losing voice-assistant exclusion
    isn't worth failing config entry setup, or a platform reload, over.
    Verify against the pinned HA version if this starts logging warnings.
    """
    if not entry.options.get(CONF_HIDE_GROUPS_FROM_VOICE_ASSISTANTS, True):
        return

    try:
        from homeassistant.components.homeassistant.exposed_entities import (
            async_expose_entity,
        )
    except ImportError:
        _LOGGER.warning(
            "exposed_entities API not available on this Home Assistant version; "
            "skipping voice assistant exposure for Linus Dashboard group entities"
        )
        return

    # KNOWN_ASSISTANTS replaced an earlier async_listed_assistants(hass)
    # function this used to import instead — that name no longer exists as
    # of at least 2026.4.0 (confirmed live: the whole function was silently
    # a no-op every run, caught by the ImportError above swallowing this
    # along with async_expose_entity). Importing it separately so a rename
    # here can't take async_expose_entity down with it again.
    try:
        from homeassistant.components.homeassistant.exposed_entities import (
            KNOWN_ASSISTANTS,
        )

        assistants = KNOWN_ASSISTANTS
    except ImportError:
        assistants = ("conversation", "cloud.alexa", "cloud.google_assistant")

    from homeassistant.helpers import entity_registry as er

    entity_reg = er.async_get(hass)
    entries = er.async_entries_for_config_entry(entity_reg, entry.entry_id)

    for entity_entry in entries:
        for assistant in assistants:
            try:
                async_expose_entity(hass, assistant, entity_entry.entity_id, False)
            except Exception as err:  # noqa: BLE001 - defensive, see docstring
                _LOGGER.debug(
                    "Could not hide %s from %s: %s",
                    entity_entry.entity_id,
                    assistant,
                    err,
                )


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry."""
    _LOGGER.info("Unloading Linus Dashboard entry")

    # Unload sensor platform
    unload_ok = await hass.config_entries.async_unload_platforms(entry, PLATFORMS)
    if not unload_ok:
        return False

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
