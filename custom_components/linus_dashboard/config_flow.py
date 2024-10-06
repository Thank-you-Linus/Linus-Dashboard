"""Adds config flow for Linus Dashboard."""

from __future__ import annotations

import voluptuous as vol
from homeassistant import config_entries, data_entry_flow
from homeassistant.helpers import selector

from .const import DOMAIN, LOGGER


class BlueprintFlowHandler(config_entries.ConfigFlow, domain=DOMAIN):
    """Config flow for Linus Dashboard."""

    VERSION = 1

    async def async_step_user(self, user_input: dict | None = None) -> data_entry_flow.FlowResult:
        """Handle a flow initialized by the user."""
        _errors = {}
        if user_input is not None:
            return self.async_create_entry(
                title="Configuration",
                data=user_input,
            )

        return self.async_show_form(
            step_id="user",
            data_schema=vol.Schema(
                {
                    vol.Required("alarm_entity_id"): selector.EntitySelector(
                        selector.EntitySelectorConfig(
                            domain="alarm_control_panel",
                        ),
                    ),
                    vol.Required("weather_entity_id"): selector.EntitySelector(
                        selector.EntitySelectorConfig(
                            domain="weather",
                        ),
                    ),
                },
            ),
            errors=_errors,
        )