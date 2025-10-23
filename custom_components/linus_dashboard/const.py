"""Constants for linus_dashboard."""

from logging import Logger, getLogger

LOGGER: Logger = getLogger(__package__)

NAME = "Linus Dahboard"
DOMAIN = "linus_dashboard"
VERSION = "1.3.0"
ICON = "mdi:bow-tie"

URL_PANEL = "linus_dashboard_panel"

CONF_ALARM_ENTITY_IDS = "alarm_entity_ids"
CONF_WEATHER_ENTITY = "weather_entity"
CONF_WEATHER_ENTITY_ID = "weather_entity_id"
CONF_EXCLUDED_DOMAINS = "excluded_domains"
CONF_EXCLUDED_DEVICE_CLASSES = "excluded_device_classes"
CONF_EXCLUDED_TARGETS = "excluded_targets"
CONF_HIDE_GREETING = "hide_greeting"
CONF_EXCLUDED_INTEGRATIONS = "excluded_integrations"
