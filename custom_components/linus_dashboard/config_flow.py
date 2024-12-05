"""Config flow for Linus Dashboard integration."""

import voluptuous as vol
from homeassistant import config_entries
from homeassistant.components.alarm_control_panel.const import DOMAIN as ALARM_DOMAIN
from homeassistant.components.weather.const import DOMAIN as WEATHER_DOMAIN
from homeassistant.core import callback
from homeassistant.helpers.selector import EntitySelector, EntitySelectorConfig

from .const import CONF_ALARM_ENTITY, CONF_WEATHER_ENTITY, DOMAIN


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

    def __init__(self) -> None:
        """Initialize the config flow."""
        self._config = {}

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> config_entries.ConfigFlowResult:
        """Handle the initial step."""
        if user_input is not None:
            # Sauvegarde et création de l'entrée de configuration
            self._config.update(user_input)
            return self.async_create_entry(
                title="Linus Dashboard",
                data=self._config,
            )

        # Création du schéma pour le formulaire
        schema = {
            vol.Optional(
                CONF_ALARM_ENTITY,
            ): NullableEntitySelector(
                EntitySelectorConfig(
                    domain=ALARM_DOMAIN,
                ),
            ),
            vol.Optional(
                CONF_WEATHER_ENTITY,
            ): NullableEntitySelector(
                EntitySelectorConfig(
                    domain=WEATHER_DOMAIN,
                ),
            ),
        }

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(schema),
            errors={},
        )

    @staticmethod
    @callback
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Define the options flow."""
        return LinusDashboardOptionsFlowHandler(config_entry)


class LinusDashboardOptionsFlowHandler(config_entries.OptionsFlow):
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

        # Création du schéma pour le formulaire d'options
        schema = {
            vol.Optional(
                CONF_ALARM_ENTITY,
                default=self.config_entry.options.get(CONF_ALARM_ENTITY)
                or self.config_entry.data.get(CONF_ALARM_ENTITY),
            ): NullableEntitySelector(
                EntitySelectorConfig(
                    domain=ALARM_DOMAIN,
                ),
            ),
            vol.Optional(
                CONF_WEATHER_ENTITY,
                default=self.config_entry.options.get(CONF_WEATHER_ENTITY)
                or self.config_entry.data.get(CONF_WEATHER_ENTITY),
            ): NullableEntitySelector(
                EntitySelectorConfig(
                    domain=WEATHER_DOMAIN,
                ),
            ),
        }

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(schema),
            errors={},
        )
