"""
Local storage for automation rules.

Provides persistent storage for rules in .storage/linus_rules.json.
Handles atomic writes, corruption recovery, and offline-first architecture.
Rules are keyed by area_id for consistency with Home Assistant terminology.
"""

import asyncio
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.storage import Store

from ..const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}.rules"


class LocalStorage:
    """
    Manages persistent local storage for automation rules.

    Uses Home Assistant's Store helper for atomic writes and corruption handling.
    Storage location: .storage/linus_rules.json
    """

    def __init__(self, hass: HomeAssistant) -> None:
        """
        Initialize local storage.

        Args:
            hass: Home Assistant instance
        """
        self.hass = hass
        self._store: Store = Store(hass, STORAGE_VERSION, STORAGE_KEY)
        self._lock = asyncio.Lock()
        self._rules: dict[str, dict[str, Any]] = {}

    async def async_load(self) -> dict[str, dict[str, Any]]:
        """
        Load rules from storage.

        Returns:
            Dictionary mapping area_id to rule data
        """
        async with self._lock:
            try:
                data = await self._store.async_load()

                if data is None:
                    _LOGGER.info("No existing rules found in storage")
                    self._rules = {}
                    return self._rules

                self._rules = data.get("rules", {})
                _LOGGER.info(f"Loaded {len(self._rules)} rules from storage")

                return self._rules

            except Exception as err:
                _LOGGER.error(f"Failed to load rules from storage: {err}")
                self._rules = {}
                return self._rules

    async def async_save(self, rules: dict[str, dict[str, Any]]) -> bool:
        """
        Save rules to storage.

        Args:
            rules: Dictionary mapping area_id to rule data

        Returns:
            True if save was successful, False otherwise
        """
        async with self._lock:
            try:
                self._rules = rules

                data = {
                    "version": STORAGE_VERSION,
                    "rules": rules,
                }

                await self._store.async_save(data)
                _LOGGER.debug(f"Saved {len(rules)} rules to storage")

                return True

            except Exception as err:
                _LOGGER.error(f"Failed to save rules to storage: {err}")
                return False

    async def async_get_rule(self, area_id: str) -> dict[str, Any] | None:
        """
        Get rule for a specific area.

        Args:
            area_id: Area ID

        Returns:
            Rule data or None if not found
        """
        return self._rules.get(area_id)

    async def async_set_rule(self, area_id: str, rule_data: dict[str, Any]) -> bool:
        """
        Set rule for a specific area.

        Args:
            area_id: Area ID
            rule_data: Rule data (conditions, actions, version, etc.)

        Returns:
            True if saved successfully
        """
        self._rules[area_id] = rule_data
        return await self.async_save(self._rules)

    async def async_delete_rule(self, area_id: str) -> bool:
        """
        Delete rule for a specific area.

        Args:
            area_id: Area ID

        Returns:
            True if deleted successfully
        """
        if area_id in self._rules:
            del self._rules[area_id]
            return await self.async_save(self._rules)

        return True

    async def async_get_all_rules(self) -> dict[str, dict[str, Any]]:
        """
        Get all rules.

        Returns:
            Dictionary mapping area_id to rule data
        """
        return self._rules.copy()

    async def async_clear(self) -> bool:
        """
        Clear all rules from storage.

        Returns:
            True if cleared successfully
        """
        self._rules = {}
        return await self.async_save(self._rules)
