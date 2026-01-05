"""Constants for linus_dashboard."""

import json
from logging import Logger, getLogger
from pathlib import Path

LOGGER: Logger = getLogger(__package__)

NAME = "Linus Dahboard"
DOMAIN = "linus_dashboard"
ICON = "mdi:bow-tie"


def _get_version() -> str:
    """Read version from package.json (single source of truth)."""
    try:
        package_json = Path(__file__).parent.parent.parent / "package.json"
        with package_json.open(encoding="utf-8") as f:
            data = json.load(f)
            return data.get("version", "unknown")
    except Exception as e:  # noqa: BLE001
        LOGGER.warning("Failed to read version from package.json: %s", e)
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
