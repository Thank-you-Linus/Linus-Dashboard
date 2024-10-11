"""
Custom integration to integrate linus_dashboard with Home Assistant.

For more details about this integration, please refer to
https://github.com/Thank-you-Linus/Linus-Dashboard
"""

from __future__ import annotations
from typing import TYPE_CHECKING

from homeassistant.components import frontend
from homeassistant.components.lovelace import _register_panel
from homeassistant.components.lovelace.dashboard import LovelaceYAML

from .load_dashboard import load_dashboard
from .load_plugins import load_plugins

from .const import DOMAIN, VERSION

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from homeassistant.core import HomeAssistant


async def async_setup(hass: HomeAssistant, config: ConfigEntry) -> bool:
    """Set up the Linus Dashboard integration."""
    load_plugins(hass, DOMAIN)

    return True


# https://developers.home-assistant.io/docs/config_entries_index/#setting-up-an-entry
async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> bool:
    """Set up this integration using UI."""

    load_dashboard(hass, DOMAIN)
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    return True


async def async_remove_entry(hass, config_entry):
    frontend.async_remove_panel(hass, "linus-dashboard")


async def async_reload_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
) -> None:
    """Reload config entry."""
    await async_remove_entry(hass, entry)
    await async_setup_entry(hass, entry)
