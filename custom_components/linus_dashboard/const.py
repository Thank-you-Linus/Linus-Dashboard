"""Constants for linus_dashboard."""

from logging import Logger, getLogger

LOGGER: Logger = getLogger(__package__)

NAME = "Linus Dahboard"
DOMAIN = "linus_dashboard"
VERSION = "1.2.4-alpha.2"
ICON = "mdi:bow-tie"

URL_PANEL = "linus_dashboard_panel"

CONF_ALARM_ENTITY = "alarm_entity"
CONF_ALARM_ENTITY_ID = "alarm_entity_id"
CONF_WEATHER_ENTITY = "weather_entity"
CONF_WEATHER_ENTITY_ID = "weather_entity_id"
CONF_EXCLUDED_DOMAINS = "excluded_domains"
CONF_EXCLUDED_DEVICE_CLASSES = "excluded_device_classes"
CONF_EXCLUDED_ENTITIES = "excluded_entities"
CONF_HIDE_GREETING = "hide_greeting"
