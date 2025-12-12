"""
Config Flow for Linus Brain Integration

This module handles the UI-based configuration flow for setting up the Linus Brain
integration. Users can input their Supabase credentials (URL and API key) through
the Home Assistant UI.
"""

import logging
from typing import Any

import aiohttp
import voluptuous as vol
from homeassistant import config_entries
from homeassistant.const import CONF_API_KEY, CONF_URL
from homeassistant.core import HomeAssistant
from homeassistant.helpers import config_validation as cv
from homeassistant.helpers.aiohttp_client import async_get_clientsession

from .const import (
    CONF_DARK_LUX_THRESHOLD,
    CONF_ENVIRONMENTAL_CHECK_INTERVAL,
    CONF_INACTIVE_TIMEOUT,
    CONF_OCCUPIED_INACTIVE_TIMEOUT,
    CONF_OCCUPIED_THRESHOLD,
    CONF_PRESENCE_DETECTION_CONFIG,
    CONF_SUPABASE_KEY,
    CONF_SUPABASE_URL,
    CONF_USE_SUN_ELEVATION,
    DEFAULT_DARK_THRESHOLD_LUX,
    DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL,
    DOMAIN,
    PRESENCE_DETECTION_OPTIONS,
)

_LOGGER = logging.getLogger(__name__)

# Configuration schema for user input
CONFIG_SCHEMA = vol.Schema(
    {
        vol.Required(CONF_URL, description="Supabase URL"): str,
        vol.Required(CONF_API_KEY, description="Supabase API Key"): str,
        vol.Optional(
            CONF_USE_SUN_ELEVATION,
            default=True,
            description="Use sun elevation for darkness detection",
        ): bool,
        vol.Optional(
            CONF_DARK_LUX_THRESHOLD,
            default=DEFAULT_DARK_THRESHOLD_LUX,
            description="Lux threshold below which area is considered dark",
        ): vol.All(vol.Coerce(float), vol.Range(min=0, max=1000)),
        vol.Optional(
            CONF_INACTIVE_TIMEOUT,
            default=60,
            description="Timeout in seconds before area becomes inactive (from movement)",
        ): vol.All(vol.Coerce(int), vol.Range(min=1, max=3600)),
        vol.Optional(
            CONF_OCCUPIED_THRESHOLD,
            default=300,
            description="Duration in seconds before area is considered occupied",
        ): vol.All(vol.Coerce(int), vol.Range(min=1, max=7200)),
        vol.Optional(
            CONF_OCCUPIED_INACTIVE_TIMEOUT,
            default=300,
            description="Timeout in seconds before area becomes inactive (from occupied)",
        ): vol.All(vol.Coerce(int), vol.Range(min=1, max=7200)),
        vol.Optional(
            CONF_ENVIRONMENTAL_CHECK_INTERVAL,
            default=DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL,
            description="Interval in seconds between environmental state checks (lux, temperature, etc.)",
        ): vol.All(vol.Coerce(int), vol.Range(min=5, max=600)),
    }
)


async def validate_supabase_connection(
    hass: HomeAssistant, url: str, api_key: str
) -> dict[str, Any]:
    """
    Validate the Supabase connection by attempting a simple request.

    This function tests the provided credentials by making a request to the
    Supabase API to ensure connectivity and authentication work.

    Args:
        hass: Home Assistant instance
        url: Supabase project URL
        api_key: Supabase API key (anon or service key)

    Returns:
        Dictionary with validation result

    Raises:
        Exception: If connection or authentication fails
    """
    session = async_get_clientsession(hass)

    # Test connection with a simple REST API call
    # We'll try to access the health endpoint or a simple query
    test_url = f"{url.rstrip('/')}/rest/v1/"
    headers = {
        "apikey": api_key,
        "Authorization": f"Bearer {api_key}",
    }

    try:
        async with session.get(
            test_url, headers=headers, timeout=aiohttp.ClientTimeout(total=10)
        ) as response:
            if response.status in (200, 401, 404):
                # 200: Success
                # 401/404: Endpoint exists but might need proper table setup
                # Either way, connection is established
                _LOGGER.info("Supabase connection validated successfully")
                return {"status": "ok"}
            else:
                _LOGGER.error(f"Supabase returned status {response.status}")
                raise Exception(f"Unexpected status code: {response.status}")

    except aiohttp.ClientError as err:
        _LOGGER.error(f"Connection error to Supabase: {err}")
        raise Exception(f"Cannot connect to Supabase: {err}")
    except Exception as err:
        _LOGGER.error(f"Validation error: {err}")
        raise


class LinusBrainConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """
    Handle a config flow for Linus Brain.

    This class manages the step-by-step configuration process through the UI.
    """

    VERSION = 1

    @staticmethod
    def async_get_options_flow(
        config_entry: config_entries.ConfigEntry,
    ) -> config_entries.OptionsFlow:
        """Get the options flow for this handler."""
        return LinusBrainOptionsFlow()

    async def async_step_user(self, user_input: dict[str, Any] | None = None) -> Any:
        """
        Handle the initial step of the config flow.

        This is called when the user initiates the integration setup from the UI.

        Args:
            user_input: Dictionary containing user input, None on first display

        Returns:
            FlowResult indicating next step or completion
        """
        errors: dict[str, str] = {}

        if user_input is not None:
            # User has submitted the form
            url = user_input[CONF_URL]
            api_key = user_input[CONF_API_KEY]

            try:
                # Validate the connection
                await validate_supabase_connection(self.hass, url, api_key)

                # Create a unique ID for this config entry
                await self.async_set_unique_id(f"{DOMAIN}_{url}")
                self._abort_if_unique_id_configured()

                # Store configuration and create entry
                return self.async_create_entry(
                    title="Linus Brain",
                    data={
                        CONF_SUPABASE_URL: url,
                        CONF_SUPABASE_KEY: api_key,
                    },
                    options={
                        CONF_USE_SUN_ELEVATION: user_input.get(
                            CONF_USE_SUN_ELEVATION, True
                        ),
                        CONF_DARK_LUX_THRESHOLD: user_input.get(
                            CONF_DARK_LUX_THRESHOLD, DEFAULT_DARK_THRESHOLD_LUX
                        ),
                        CONF_PRESENCE_DETECTION_CONFIG: user_input.get(
                            CONF_PRESENCE_DETECTION_CONFIG,
                            list(
                                PRESENCE_DETECTION_OPTIONS.keys()
                            ),  # All enabled by default
                        ),
                        CONF_INACTIVE_TIMEOUT: user_input.get(
                            CONF_INACTIVE_TIMEOUT, 60
                        ),
                        CONF_OCCUPIED_THRESHOLD: user_input.get(
                            CONF_OCCUPIED_THRESHOLD, 300
                        ),
                        CONF_OCCUPIED_INACTIVE_TIMEOUT: user_input.get(
                            CONF_OCCUPIED_INACTIVE_TIMEOUT, 300
                        ),
                        CONF_ENVIRONMENTAL_CHECK_INTERVAL: user_input.get(
                            CONF_ENVIRONMENTAL_CHECK_INTERVAL,
                            DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL,
                        ),
                    },
                )

            except Exception as err:
                _LOGGER.error(f"Configuration validation failed: {err}")
                errors["base"] = "cannot_connect"

        # Show the configuration form
        return self.async_show_form(
            step_id="user",
            data_schema=CONFIG_SCHEMA,
            errors=errors,
            description_placeholders={
                "docs_url": "https://github.com/Thank-you-Linus/Linus-Brain",
                "use_sun_elevation_info": (
                    "Utilisez l'élévation du soleil en plus de la luminosité pour détecter l'obscurité. "
                    "Recommandé pour la plupart des installations."
                ),
            },
        )

    async def async_step_import(self, import_config: dict[str, Any]) -> Any:
        """
        Handle import from configuration.yaml (legacy support).

        This allows users who have YAML configuration to migrate to UI config.

        Args:
            import_config: Configuration from YAML

        Returns:
            FlowResult for import
        """
        return await self.async_step_user(import_config)


class LinusBrainOptionsFlow(config_entries.OptionsFlow):
    """
    Handle options flow for Linus Brain.

    This allows users to modify configuration after initial setup.
    """

    # NOTE: No custom __init__ needed - config_entry is automatically available
    # from parent OptionsFlow class. Setting it manually is deprecated in HA 2025.12.

    async def async_step_init(self, user_input: dict[str, Any] | None = None) -> Any:
        """
        Manage the options.

        Args:
            user_input: User input for options

        Returns:
            FlowResult for options
        """
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)

        # Get current option values
        current_use_sun = self.config_entry.options.get(CONF_USE_SUN_ELEVATION, True)
        current_dark_lux = self.config_entry.options.get(
            CONF_DARK_LUX_THRESHOLD, DEFAULT_DARK_THRESHOLD_LUX
        )
        current_inactive_timeout = self.config_entry.options.get(
            CONF_INACTIVE_TIMEOUT, 60
        )
        current_occupied_threshold = self.config_entry.options.get(
            CONF_OCCUPIED_THRESHOLD, 300
        )
        current_occupied_inactive_timeout = self.config_entry.options.get(
            CONF_OCCUPIED_INACTIVE_TIMEOUT, 300
        )
        current_environmental_check_interval = self.config_entry.options.get(
            CONF_ENVIRONMENTAL_CHECK_INTERVAL, DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL
        )
        current_presence_detection = self.config_entry.options.get(
            CONF_PRESENCE_DETECTION_CONFIG,
            list(PRESENCE_DETECTION_OPTIONS.keys()),  # All enabled by default
        )

        # Show options form
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema(
                {
                    vol.Optional(
                        CONF_USE_SUN_ELEVATION,
                        default=current_use_sun,
                    ): bool,
                    vol.Optional(
                        CONF_DARK_LUX_THRESHOLD,
                        default=current_dark_lux,
                    ): vol.All(vol.Coerce(float), vol.Range(min=0, max=1000)),
                    vol.Optional(
                        CONF_PRESENCE_DETECTION_CONFIG,
                        default=current_presence_detection,
                    ): vol.All(
                        cv.multi_select(PRESENCE_DETECTION_OPTIONS),
                        vol.Length(min=1),
                    ),
                    vol.Optional(
                        CONF_INACTIVE_TIMEOUT,
                        default=current_inactive_timeout,
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=3600)),
                    vol.Optional(
                        CONF_OCCUPIED_THRESHOLD,
                        default=current_occupied_threshold,
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=7200)),
                    vol.Optional(
                        CONF_OCCUPIED_INACTIVE_TIMEOUT,
                        default=current_occupied_inactive_timeout,
                    ): vol.All(vol.Coerce(int), vol.Range(min=1, max=7200)),
                    vol.Optional(
                        CONF_ENVIRONMENTAL_CHECK_INTERVAL,
                        default=current_environmental_check_interval,
                    ): vol.All(vol.Coerce(int), vol.Range(min=5, max=600)),
                }
            ),
            description_placeholders={
                "use_sun_elevation_desc": (
                    "When enabled, area darkness is determined by BOTH illuminance "
                    "and sun elevation (dark if lux < 20 OR sun < 3°). "
                    "When disabled, ONLY illuminance is used (dark if lux < 20). "
                    "Disable this to test illuminance-based automation during nighttime."
                ),
                "dark_lux_threshold_desc": (
                    "Local default lux level below which an area is considered dark. "
                    "This serves as a fallback before AI-learned insights. "
                    "Cloud/AI values have priority. Default: 20 lux. Range: 0-1000 lux."
                ),
                "presence_detection_config_desc": (
                    "Select which sensor types should trigger presence detection. "
                    "Motion sensors are recommended for most setups. "
                    "Media players can detect presence when watching TV/movies. "
                    "At least one option must be selected."
                ),
                "inactive_timeout_desc": (
                    "Timeout in seconds after 'movement' stops before area becomes 'inactive'. "
                    "Default: 60 seconds. Range: 1-3600 seconds."
                ),
                "occupied_threshold_desc": (
                    "Duration in seconds of continuous movement before area transitions from 'movement' to 'occupied'. "
                    "Default: 300 seconds (5 min). Range: 1-7200 seconds."
                ),
                "occupied_inactive_timeout_desc": (
                    "Timeout in seconds after 'occupied' stops before area becomes 'inactive'. "
                    "Should typically be longer than movement timeout to avoid rapid transitions. "
                    "Default: 300 seconds (5 min). Range: 1-7200 seconds."
                ),
                "environmental_check_interval_desc": (
                    "Interval in seconds between environmental state checks (lux, temperature, humidity, etc.). "
                    "Prevents rapid lighting changes when environmental values fluctuate near thresholds. "
                    "Default: 30 seconds. Range: 5-600 seconds."
                ),
            },
        )
