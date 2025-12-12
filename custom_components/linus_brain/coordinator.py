"""
Data Update Coordinator for Linus Brain

This module manages the periodic data collection and synchronization with Supabase.
It uses Home Assistant's DataUpdateCoordinator pattern to:
- Aggregate area presence data every 15 minutes (heartbeat)
- Provide a central point for data access
- Handle update errors gracefully
"""

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers.update_coordinator import DataUpdateCoordinator, UpdateFailed

from .utils.activity_tracker import ActivityTracker
from .utils.app_storage import AppStorage
from .utils.area_manager import AreaManager
from .utils.condition_evaluator import ConditionEvaluator
from .utils.entity_resolver import EntityResolver
from .utils.feature_flag_manager import FeatureFlagManager
from .utils.supabase_client import SupabaseClient

_LOGGER = logging.getLogger(__name__)

# Heartbeat disabled - using event-driven architecture via EventListener and timeout handlers
# The coordinator only updates when explicitly triggered by:
# - EventListener (entity state changes)
# - ActivityTracker timeout handlers
# - Manual service calls
UPDATE_INTERVAL = None


class LinusBrainCoordinator(DataUpdateCoordinator):
    """
    Coordinator for managing Linus Brain data updates.

    This coordinator:
    - Collects presence data from all areas every 1 minute
    - Sends aggregated data to Supabase
    - Provides data to sensor entities
    - Handles errors and retries
    """

    def __init__(
        self,
        hass: HomeAssistant,
        supabase_url: str,
        supabase_key: str,
        config_entry: Any = None,
    ) -> None:
        """
        Initialize the coordinator.

        Args:
            hass: Home Assistant instance
            supabase_url: Supabase project URL
            supabase_key: Supabase API key
            config_entry: Config entry for user preferences
        """
        super().__init__(
            hass,
            _LOGGER,
            name="Linus Brain",
            update_interval=UPDATE_INTERVAL,
            config_entry=config_entry,
        )

        self.supabase_url = supabase_url
        self.supabase_key = supabase_key

        # Initialize managers
        self.area_manager = AreaManager(hass, config_entry=config_entry)
        self.supabase_client = SupabaseClient(hass, supabase_url, supabase_key)

        # Initialize app storage (must be before activity_tracker)
        self.app_storage = AppStorage(hass)

        # Initialize feature flag manager
        self.feature_flag_manager = FeatureFlagManager()

        # Initialize utilities for activity tracker
        self.entity_resolver = EntityResolver(hass)
        self.condition_evaluator = ConditionEvaluator(
            hass, self.entity_resolver, None, self.area_manager
        )

        # Initialize activity tracker with app_storage
        self.activity_tracker = ActivityTracker(
            hass, self.app_storage, self.condition_evaluator
        )

        # Now update condition_evaluator to reference activity_tracker
        self.condition_evaluator.activity_tracker = self.activity_tracker

        # Statistics
        self.last_sync_time: str | None = None
        self.sync_count: int = 0
        self.error_count: int = 0

        # Instance management for multi-instance support
        self.instance_id: str | None = None
        self.ha_installation_id: str | None = None

        # Last triggered rules tracking (area_id -> rule_info)
        self.last_rules: dict[str, dict[str, Any]] = {}

        # Active presence entities tracking (area_id -> list of entity_ids)
        self.active_presence_entities: dict[str, list[str]] = {}

        # Previous activity tracking (area_id -> previous_activity)
        self.previous_activities: dict[str, str] = {}

        # Rule engine reference (set by __init__.py after initialization)
        self.rule_engine: Any | None = None

    async def _async_update_data(self) -> dict[str, Any]:
        """
        Fetch and update data (called every UPDATE_INTERVAL).

        This is the heartbeat mechanism that:
        1. Collects current state of all areas
        2. Sends data to Supabase
        3. Returns aggregated data for sensors

        Returns:
            Dictionary containing area states and statistics

        Raises:
            UpdateFailed: If data update fails
        """
        try:
            _LOGGER.debug(
                "🔧 [COORDINATOR DEBUG] _async_update_data called. "
                "Current self.data = %s",
                "None" if self.data is None else f"dict with {len(self.data)} keys"
            )
            _LOGGER.debug("Starting periodic data update (heartbeat)")

            # Get current state of all areas
            area_states = await self.area_manager.get_all_area_states()

            # Update activity tracker for each area
            for area_data in area_states:
                area_id = area_data.get("area_id")
                if area_id and isinstance(area_id, str):
                    active_entities = area_data.get("active_presence_entities", [])
                    old_activity = self.last_rules.get(area_id, {}).get("activity")

                    # Activities (movement/inactive/empty) always work regardless of feature flags
                    activity = await self.activity_tracker.async_evaluate_activity(
                        area_id
                    )

                    # Store active presence entities
                    self.active_presence_entities[area_id] = active_entities
                    _LOGGER.debug(
                        f"Area {area_id}: active_presence_entities = {active_entities}"
                    )

                    # Trigger rule engine if activity changed
                    if activity != old_activity and self.rule_engine:
                        _LOGGER.debug(
                            f"Heartbeat detected activity change for {area_id}: {old_activity} -> {activity}"
                        )
                        self.previous_activities[area_id] = (
                            old_activity if old_activity else "empty"
                        )
                        await self.rule_engine._async_evaluate_and_execute(area_id)

            _LOGGER.debug(f"Collected data for {len(area_states)} areas")

            # Presence data sync disabled - not needed for current usage
            # The activity tracking works in-memory via ActivityTracker
            success_count = len(area_states)

            # Update statistics
            from datetime import datetime

            self.last_sync_time = datetime.utcnow().isoformat()
            self.sync_count += 1

            _LOGGER.info(
                f"Heartbeat completed: {success_count}/{len(area_states)} areas synced"
            )

            # Return data for sensors and diagnostics
            return {
                "area_states": area_states,
                "last_sync": self.last_sync_time,
                "sync_count": self.sync_count,
                "error_count": self.error_count,
                "areas_synced": success_count,
                "total_areas": len(area_states),
                "instance_id": self.instance_id,
                "last_rules": self.last_rules,
            }

        except Exception as err:
            self.error_count += 1
            _LOGGER.error(f"Error during data update: {err}")
            raise UpdateFailed(f"Error fetching data: {err}")

    async def async_send_area_update(self, area: str) -> None:
        """
        Send an immediate update for a specific area.

        This is called when an entity state change is detected (not during heartbeat).

        Args:
            area: The area ID to update
        """
        try:
            _LOGGER.debug(f"Sending immediate update for area: {area}")

            # Get current state for this specific area
            area_data = await self.area_manager.get_area_state(area)

            if area_data:
                # Update activity tracker
                area_id = area_data.get("area_id")
                if area_id and isinstance(area_id, str):
                    active_entities = area_data.get("active_presence_entities", [])

                    # Activities (movement/inactive/empty) always work regardless of feature flags
                    activity = await self.activity_tracker.async_evaluate_activity(
                        area_id
                    )

                    if activity is not None:
                        _LOGGER.debug(f"Updated activity for {area_id}: {activity}")
                    else:
                        _LOGGER.debug(
                            f"Skipped activity evaluation for disabled area {area_id}"
                        )

                    # Store active presence entities
                    self.active_presence_entities[area_id] = active_entities
                    _LOGGER.debug(
                        f"Area {area_id}: active_presence_entities = {active_entities}"
                    )

                    # Trigger rule engine evaluation for this area
                    # Activities always trigger, but automation rules only execute if features are enabled
                    if True:
                        old_activity = self.last_rules.get(area_id, {}).get("activity")
                        self.previous_activities[area_id] = (
                            old_activity if old_activity else "empty"
                        )
                        _LOGGER.info(
                            f"Triggering rule engine evaluation for {area_id} (activity: {activity})"
                        )
                        if self.rule_engine is not None:
                            await self.rule_engine._async_evaluate_and_execute(area_id)
                    else:
                        _LOGGER.debug(
                            f"NOT triggering rule engine for {area_id}: area not enabled or feature flag check failed"
                        )

                    # Trigger sensor update for this area only
                    self.async_update_listeners()

                # Presence data sync disabled - not needed for current usage
                _LOGGER.debug(f"Successfully updated activity for area: {area}")
            else:
                _LOGGER.warning(f"No data available for area: {area}")

        except Exception as err:
            _LOGGER.error(f"Failed to send update for area {area}: {err}")
            # Don't raise - we don't want to break the event listener

    async def async_fetch_rules(self) -> list[dict[str, Any]]:
        """
        Fetch automation rules from Supabase.

        This is a placeholder for future AI-generated rule retrieval.
        Rules will be generated by the AI agent analyzing presence patterns.

        Returns:
            List of automation rules
        """
        try:
            _LOGGER.debug("Fetching automation rules from Supabase")
            rules = await self.supabase_client.fetch_rules()
            _LOGGER.info(f"Retrieved {len(rules)} automation rules")
            return rules
        except Exception as err:
            _LOGGER.error(f"Failed to fetch rules: {err}")
            return []

    async def async_fetch_and_sync_rules(self) -> None:
        """
        Fetch rules from Supabase and sync to local storage.

        This method is called by the fetch_rules service to:
        1. Ensure instance ID is available
        2. Fetch rules from Supabase for this instance (grouped by area/activity)
        3. Save rules to local storage (one entry per area with all activity types)
        """
        from .utils.local_storage import LocalStorage

        try:
            instance_id = await self.get_or_create_instance_id()
            _LOGGER.debug(f"Fetching rules for instance: {instance_id}")

            rules_by_area = await self.supabase_client.fetch_rules_for_instance(
                instance_id
            )

            if rules_by_area:
                storage = LocalStorage(self.hass)
                await storage.async_load()

                total_rules = 0
                for area_id, activity_rules in rules_by_area.items():
                    rule_data = {
                        "area": area_id,
                        "activity_rules": activity_rules,
                        "enabled": True,
                    }

                    await storage.async_set_rule(area_id, rule_data)
                    total_rules += len(activity_rules)

                _LOGGER.info(
                    f"Synced {total_rules} rules across {len(rules_by_area)} areas from Supabase"
                )
            else:
                _LOGGER.info("No rules fetched from Supabase")

        except Exception as err:
            _LOGGER.error(f"Failed to fetch and sync rules: {err}")

    def get_area_activity(self, area_id: str) -> str | None:
        """
        Get the current activity for an area.

        Args:
            area_id: The area ID to check

        Returns:
            The current activity name, or None if not found
        """
        return self.last_rules.get(area_id, {}).get("activity")

    async def get_or_create_instance_id(self) -> str:
        """
        Get or create the instance ID for this HA installation.

        This method ensures we have a persistent instance ID for multi-instance support.
        It uses the HA core.uuid as the installation fingerprint.

        Returns:
            The instance ID (UUID) for this HA installation

        Raises:
            Exception: If instance creation/lookup fails
        """
        # Get HA installation ID from core.uuid
        if not self.ha_installation_id:
            self.ha_installation_id = self.hass.data.get("core.uuid")
            if not self.ha_installation_id:
                raise Exception("Unable to get HA installation ID from core.uuid")

        # If we already have an instance ID, return it
        if self.instance_id is not None:
            # Update last_seen timestamp
            try:
                await self.supabase_client.update_instance_last_seen(self.instance_id)  # type: ignore
            except Exception as err:
                _LOGGER.warning(f"Failed to update instance last_seen: {err}")
            return self.instance_id

        try:
            _LOGGER.info(
                f"Looking up instance for HA installation: {self.ha_installation_id}"
            )

            # Try to find existing instance
            instance_data = await self.supabase_client.get_instance_by_ha_id(
                self.ha_installation_id
            )

            if instance_data:
                self.instance_id = instance_data["instance_id"]
                _LOGGER.info(f"Found existing instance: {self.instance_id}")

                if self.instance_id:
                    await self.supabase_client.update_instance_last_seen(
                        self.instance_id
                    )
            else:
                _LOGGER.info("No existing instance found, creating new one")

                # Create new instance
                instance_data = await self.supabase_client.create_new_instance(
                    self.ha_installation_id,
                    f"Home Assistant ({self.ha_installation_id[:8]})",
                )

                if instance_data:
                    self.instance_id = instance_data["instance_id"]
                    _LOGGER.info(f"Created new instance: {self.instance_id}")
                else:
                    raise Exception("Failed to create new instance")

            if not self.instance_id:
                raise Exception("Instance ID not set after creation/lookup")

            return self.instance_id

        except Exception as err:
            _LOGGER.error(f"Error getting/creating instance ID: {err}")
            raise
