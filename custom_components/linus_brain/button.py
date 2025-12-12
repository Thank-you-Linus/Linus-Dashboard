"""
Button Platform for Linus Brain

This module provides button entities for triggering actions in the integration.
"""

import logging

from homeassistant.components.button import ButtonEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN
from .coordinator import LinusBrainCoordinator

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """
    Set up Linus Brain button entities from a config entry.

    Args:
        hass: Home Assistant instance
        entry: Config entry
        async_add_entities: Callback to add entities
    """
    try:
        # Verify domain data exists
        if DOMAIN not in hass.data:
            _LOGGER.error(f"Domain {DOMAIN} not found in hass.data during button setup")
            return

        if entry.entry_id not in hass.data[DOMAIN]:
            _LOGGER.error(
                f"Entry {entry.entry_id} not found in hass.data[{DOMAIN}] during button setup"
            )
            return

        coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
        insights_manager = hass.data[DOMAIN][entry.entry_id].get("insights_manager")

        buttons = [
            LinusBrainSyncButton(coordinator, insights_manager, entry),
        ]

        async_add_entities(buttons)
        _LOGGER.info(f"Added {len(buttons)} Linus Brain button entities")

    except KeyError as err:
        _LOGGER.error(
            f"Failed to setup button platform - missing data: {err}. "
            f"Available data: {hass.data.get(DOMAIN, {}).get(entry.entry_id, {}).keys()}"
        )
        raise
    except Exception as err:
        _LOGGER.error(f"Failed to setup button platform: {err}", exc_info=True)
        raise


class LinusBrainSyncButton(CoordinatorEntity, ButtonEntity):
    """
    Button to trigger immediate cloud sync.
    """

    def __init__(
        self,
        coordinator: LinusBrainCoordinator,
        insights_manager,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the button."""
        super().__init__(coordinator)
        self._insights_manager = insights_manager
        self._attr_translation_key = "sync"
        self._attr_unique_id = "sync"  # Keep stable unique_id (never change this!)
        self._attr_has_entity_name = True
        self._attr_suggested_object_id = f"{DOMAIN}_sync"  # Force English entity_id
        self._attr_icon = "mdi:cloud-sync"
        self._attr_entity_category = EntityCategory.CONFIG
        self._attr_device_info = {
            "identifiers": {(DOMAIN, entry.entry_id)},
            "name": "Linus Brain",
            "manufacturer": "Linus Brain",
            "model": "Automation Engine",
        }

    async def async_press(self) -> None:
        """Handle the button press - full sync including apps and activities."""
        _LOGGER.info("Full cloud sync button pressed")

        coordinator: LinusBrainCoordinator = self.coordinator  # type: ignore

        if coordinator.instance_id:
            app_storage = coordinator.app_storage
            area_ids = list(coordinator.area_manager.get_all_areas().keys())

            _LOGGER.info("Reloading apps and activities from cloud...")
            await app_storage.async_sync_from_cloud(
                coordinator.supabase_client, coordinator.instance_id, area_ids
            )

            await coordinator.activity_tracker.async_initialize(force_reload=True)
            _LOGGER.info("Apps and activities reloaded")

            # Reload insights from cloud
            if self._insights_manager:
                _LOGGER.info("Reloading insights from cloud...")
                await self._insights_manager.async_reload(coordinator.instance_id)
                _LOGGER.info("Insights reloaded")

        _LOGGER.info("Syncing area states...")
        await self.coordinator.async_refresh()
        _LOGGER.info("Full cloud sync completed")
