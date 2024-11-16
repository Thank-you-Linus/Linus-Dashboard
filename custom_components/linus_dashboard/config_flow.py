from homeassistant import config_entries
import voluptuous as vol
from homeassistant.helpers import selector
from homeassistant.core import callback
from .const import CONF_ALARM_ENTITY, CONF_WEATHER_ENTITY, DOMAIN


class LinusDashboardConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle a config flow for the Linus Dashboard component."""

    VERSION = 1

    def __init__(self):
        """Initialize the config flow."""
        self._config = {}

    async def async_step_user(self, user_input=None):
        """Handle the initial step."""
        if user_input is not None:
            # Sauvegarde et création de l'entrée de configuration
            self._config.update(user_input)
            return self.async_create_entry(
                title="",
                data=self._config,
            )

        # Récupérer les entités disponibles dans Home Assistant
        alarm_entities = [
            entity_id
            for entity_id in self.hass.states.async_entity_ids("alarm_control_panel")
        ]
        weather_entities = [
            entity_id for entity_id in self.hass.states.async_entity_ids("weather")
        ]

        # Création du schéma pour le formulaire
        schema = vol.Schema(
            {
                vol.Required(CONF_ALARM_ENTITY): vol.In(alarm_entities),
                vol.Required(CONF_WEATHER_ENTITY): vol.In(weather_entities),
            }
        )

        return self.async_show_form(
            step_id="user",
            data_schema=schema,
            errors={},
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Define the options flow."""
        return LinusDashboardOptionsFlowHandler(config_entry)


class LinusDashboardOptionsFlowHandler(config_entries.OptionsFlow):
    """Handle options for the Linus Dashboard component."""

    def __init__(self, config_entry):
        """Initialize the options flow."""
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        # Création du schéma pour le formulaire d'options
        schema = {
            vol.Optional(
                CONF_ALARM_ENTITY,
                default=self.config_entry.options.get(CONF_ALARM_ENTITY, ""),
            ): selector.EntitySelector(
                selector.EntitySelectorConfig(
                    domain="alarm_control_panel",
                ),
            ),
            vol.Optional(
                CONF_WEATHER_ENTITY,
                default=self.config_entry.options.get(CONF_WEATHER_ENTITY, ""),
            ): selector.EntitySelector(
                selector.EntitySelectorConfig(
                    domain="weather",
                ),
            ),
        }

        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(schema),
            errors={},
        )
