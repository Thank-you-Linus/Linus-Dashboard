"""Constants for linus_dashboard."""

import json
from logging import Logger, getLogger
from pathlib import Path

LOGGER: Logger = getLogger(__package__)

NAME = "Linus Dahboard"
DOMAIN = "linus_dashboard"
ICON = "mdi:bow-tie"


def _get_version() -> str:
    """Read version from manifest.json (Home Assistant standard)."""
    try:
        manifest_json = Path(__file__).parent / "manifest.json"
        with manifest_json.open(encoding="utf-8") as f:
            data = json.load(f)
            return data.get("version", "unknown")
    except Exception as e:  # noqa: BLE001
        LOGGER.warning("Failed to read version from manifest.json: %s", e)
        return "unknown"


VERSION = _get_version()


def is_logger_debug() -> bool:
    """Check if the logger is in DEBUG mode."""
    import logging

    return LOGGER.isEnabledFor(logging.DEBUG)


URL_PANEL = "linus_dashboard_panel"

CONF_ALARM_ENTITY_IDS = "alarm_entity_ids"
CONF_WEATHER_ENTITY = "weather_entity"
CONF_WEATHER_ENTITY_ID = "weather_entity_id"
CONF_EXCLUDED_DOMAINS = "excluded_domains"
CONF_EXCLUDED_DEVICE_CLASSES = "excluded_device_classes"
CONF_EXCLUDED_TARGETS = "excluded_targets"
CONF_HIDE_GREETING = "hide_greeting"
CONF_EXCLUDED_INTEGRATIONS = "excluded_integrations"

# Embedded dashboards configuration
CONF_EMBEDDED_DASHBOARDS = "embedded_dashboards"

# Area/floor/global group entities configuration
CONF_HIDE_GROUPS_FROM_VOICE_ASSISTANTS = "hide_groups_from_voice_assistants"


def get_area_device_info(entry_id: str, area_id: str, area_name: str) -> dict:
    """
    Get device_info for an area-specific Linus Dashboard device.

    Creates a device per area that groups all Linus Dashboard group entities
    for that area (presence, light group, switch group, etc.).

    Note: suggested_area is deliberately omitted. Passing a raw area_id as
    suggested_area can make HA create a duplicate area when area_id isn't a
    clean human-readable slug (same pitfall documented in Linus Brain's
    get_area_device_info). Placement in the real area must go through the
    device registry (area_id=...) after creation, not this heuristic field.
    """
    return {
        "identifiers": {(DOMAIN, f"{entry_id}_area_{area_id}")},
        "name": f"Linus Dashboard - {area_name}",
        "manufacturer": "Linus Dashboard",
        "model": "Area Group",
        "sw_version": VERSION,
    }


def get_floor_device_info(entry_id: str, floor_id: str, floor_name: str) -> dict:
    """
    Get device_info for a floor-specific Linus Dashboard device.

    Unlike areas, Home Assistant devices have no native floor_id field, so
    this device is not placed in a specific HA area (it groups floor-scoped
    group entities, which nest area-scoped group entities as members rather
    than raw entities, so it doesn't need to inherit an area to avoid the
    self-inclusion pitfall the way area-scoped entities do).
    """
    return {
        "identifiers": {(DOMAIN, f"{entry_id}_floor_{floor_id}")},
        "name": f"Linus Dashboard - {floor_name}",
        "manufacturer": "Linus Dashboard",
        "model": "Floor Group",
        "sw_version": VERSION,
    }


def get_global_device_info(entry_id: str) -> dict:
    """Get device_info for the whole-house Linus Dashboard group device."""
    return {
        "identifiers": {(DOMAIN, f"{entry_id}_global")},
        "name": "Linus Dashboard - Whole House",
        "manufacturer": "Linus Dashboard",
        "model": "Global Group",
        "sw_version": VERSION,
    }
