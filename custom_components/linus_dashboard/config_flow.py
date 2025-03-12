"""Config flow for Linus Dashboard integration."""

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components.alarm_control_panel.const import DOMAIN as ALARM_DOMAIN
from homeassistant.components.binary_sensor import BinarySensorDeviceClass
from homeassistant.components.sensor.const import SensorDeviceClass
from homeassistant.components.weather.const import DOMAIN as WEATHER_DOMAIN
from homeassistant.const import (
    Platform,
)
from homeassistant.core import callback
from homeassistant.helpers.selector import (
    EntitySelector,
    EntitySelectorConfig,
    SelectSelector,
    SelectSelectorConfig,
)

from .const import (
    CONF_ALARM_ENTITY,
    CONF_EXCLUDED_DEVICE_CLASSES,
    CONF_EXCLUDED_DOMAINS,
    CONF_EXCLUDED_ENTITIES,
    CONF_HIDE_GREETING,
    CONF_WEATHER_ENTITY,
    DOMAIN,
    NAME,
)


class NullableEntitySelector(EntitySelector):
    """Entity selector that supports null values."""

    def __call__(self, data: str | None) -> str | None:
        """Validate the passed selection, if passed."""
        if data in (None, ""):
            return data

        return super().__call__(data)


class LinusDashboardConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for the Linus Dashboard component."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> config_entries.ConfigFlowResult:
        """Handle the initial step of the user flow."""
        if user_input is not None or self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        return self.async_create_entry(title=NAME, data={})

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Get the options flow for this handler."""
        return LinusDashboardEditFlow(config_entry)


class LinusDashboardEditFlow(config_entries.OptionsFlow):
    """Handle options for the Linus Dashboard component."""

    def __init__(self, config_entry: config_entries.ConfigEntry) -> None:
        """Initialize the options flow."""
        self.config_entry = config_entry

    async def async_step_init(
        self, user_input: dict | None = None
    ) -> config_entries.ConfigFlowResult:
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        # Récupération des plateforms disponibles depuis Home Assistant
        domain_list = list(Platform)

        # Récupération des classes de dispositifs disponibles depuis Home Assistant
        device_class_list = list(SensorDeviceClass) + list(BinarySensorDeviceClass)

        # Création du schéma pour le formulaire d'options
        schema = {
            vol.Optional(
                CONF_ALARM_ENTITY,
                default=self.config_entry.options.get(CONF_ALARM_ENTITY),
            ): NullableEntitySelector(
                EntitySelectorConfig(
                    domain=ALARM_DOMAIN,
                ),
            ),
            vol.Optional(
                CONF_WEATHER_ENTITY,
                default=self.config_entry.options.get(CONF_WEATHER_ENTITY),
            ): NullableEntitySelector(
                EntitySelectorConfig(
                    domain=WEATHER_DOMAIN,
                ),
            ),
            vol.Optional(
                CONF_EXCLUDED_DOMAINS,
                default=self.config_entry.options.get(CONF_EXCLUDED_DOMAINS, []),
            ): SelectSelector(
                SelectSelectorConfig(
                    options=domain_list,
                    multiple=True,
                ),
            ),
            vol.Optional(
                CONF_EXCLUDED_DEVICE_CLASSES,
                default=self.config_entry.options.get(CONF_EXCLUDED_DEVICE_CLASSES, []),
            ): SelectSelector(
                SelectSelectorConfig(
                    options=device_class_list,
                    multiple=True,
                ),
            ),
            vol.Optional(
                CONF_EXCLUDED_ENTITIES,  # Ajout du nouveau champ
                default=self.config_entry.options.get(CONF_EXCLUDED_ENTITIES, []),
            ): EntitySelector(
                EntitySelectorConfig(
                    multiple=True,
                ),
            ),
            vol.Optional(
                CONF_HIDE_GREETING,
                default=self.config_entry.options.get(CONF_HIDE_GREETING, False),
            ): bool,
        }

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(schema),
            errors={},
        )
