"""Adds config flow for Linus Dashboard."""

from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries, data_entry_flow
from homeassistant.helpers import selector
from homeassistant.core import callback

from .const import DOMAIN


class ConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for Linus Dashboard."""

    VERSION = 1

    async def async_step_user(
        self, user_input: dict | None = None
    ) -> data_entry_flow.FlowResult:
        """Handle a flow initialized by the user."""

        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")

        return self.async_create_entry(
            title="",
            data=user_input,
        )

    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        return EditFlow(config_entry)


class EditFlow(config_entries.OptionsFlow):
    def __init__(self, config_entry):
        self.config_entry = config_entry

    async def async_step_init(self, user_input=None):
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        schema = {
            vol.Optional("alarm_entity_id"): selector.EntitySelector(
                selector.EntitySelectorConfig(
                    domain="alarm_control_panel",
                ),
            ),
            vol.Optional("weather_entity_id"): selector.EntitySelector(
                selector.EntitySelectorConfig(
                    domain="weather",
                ),
            ),
        }

        return self.async_show_form(step_id="init", data_schema=vol.Schema(schema))
