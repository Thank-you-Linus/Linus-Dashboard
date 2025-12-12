"""
App Storage Manager for Linus Brain

3-tier offline-first storage architecture with cloud-first sync:

STORAGE LAYERS:
1. Cloud (Supabase) - Source of truth for configuration
2. Local cache (.storage JSON) - Fast offline access, graceful degradation
3. Hardcoded fallback (const.py) - ONLY used to populate cache, never used directly

CLOUD-FIRST SYNC PHILOSOPHY:
- Cloud is the ALWAYS the source of truth when available
- PRIORITY 1: Fetch from cloud (Supabase)
- PRIORITY 2: If cloud fails/empty, use existing cache (.storage)
- PRIORITY 3: If no cloud AND no cache, populate cache with const.py
- const.py is NEVER used directly, only to initialize cache

SYNC SCENARIOS:
1. Cloud has activities → Download and save to cache (cloud wins)
2. Cloud empty + cache exists → Keep cache (graceful degradation)
3. Cloud empty + no cache → Populate cache with const.py
4. Cloud timeout/error + cache exists → Keep cache (graceful degradation)
5. Cloud timeout/error + no cache → Populate cache with const.py

KEY PRINCIPLE: const.py is ONLY for populating .storage, never for direct use

AUTO-CREATION BEHAVIOR:
- app_storage does NOT auto-create apps/activities
- rule_engine handles auto-creation when needed:
  * If no assignments exist → Creates default "automatic_lighting" assignments
  * If assignments exist but app missing → Loads fallback app + activities
  * This ensures automation works even when cloud returns empty data
  * Auto-created assignments are synced back to cloud (cloud-first)

TYPICAL FLOW (Empty Cloud):
1. app_storage.async_initialize() → Cloud empty → Storage has 0 apps, 0 assignments
2. rule_engine.async_initialize() → No assignments found
3. rule_engine._ensure_default_assignments() → Detects user has areas with entities
4. → Loads fallback app (automatic_lighting) + activities (movement, inactive, empty)
5. → Creates assignments for all areas
6. → Syncs assignments back to cloud
7. → Enables areas → Automation works!
"""

import asyncio
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.util import dt as dt_util

from ..const import DOMAIN

_LOGGER = logging.getLogger(__name__)

STORAGE_VERSION = 1
STORAGE_KEY = f"{DOMAIN}.apps"
CLOUD_SYNC_TIMEOUT = 10


class AppStorage:
    """
    Manages 3-tier storage for activities, apps, and assignments.

    Storage priority:
    1. Try load from local cache (.storage/linus_brain.apps)
    2. Try sync from cloud (timeout 10s)
    3. If cloud fails/empty AND no local data → load hardcoded fallback
    4. Save to local cache for next load

    All operations are non-blocking and gracefully degrade.
    """

    def __init__(self, hass: HomeAssistant, storage_dir: Path | None = None) -> None:
        """
        Initialize app storage manager.

        Args:
            hass: Home Assistant instance
            storage_dir: Optional custom storage directory (for testing)
        """
        self.hass = hass

        if storage_dir:
            self.storage_dir = storage_dir
        else:
            self.storage_dir = Path(hass.config.path(".storage"))

        self.storage_file = self.storage_dir / f"{STORAGE_KEY}"

        self._data: dict[str, Any] = {
            "version": STORAGE_VERSION,
            "activities": {},
            "apps": {},
            "assignments": {},
            "synced_at": None,
            "is_fallback": False,
        }

    def is_empty(self) -> bool:
        """
        Check if storage is empty (no activities, apps, or assignments).

        Returns:
            True if completely empty
        """
        return (
            not self._data.get("activities")
            and not self._data.get("apps")
            and not self._data.get("assignments")
        )

    def _load_file(self) -> dict[str, Any]:
        """Synchronous file load operation."""
        with open(self.storage_file, "r") as f:
            return json.load(f)

    async def async_load(self) -> dict[str, Any]:
        """
        Load data from local cache.

        Returns:
            Loaded data dictionary
        """
        try:
            if not self.storage_file.exists():
                _LOGGER.debug("No local storage file found")
                return self._data

            loaded_data = await self.hass.async_add_executor_job(self._load_file)

            if loaded_data.get("version") != STORAGE_VERSION:
                _LOGGER.warning(
                    f"Storage version mismatch: {loaded_data.get('version')} != {STORAGE_VERSION}"
                )
                return self._data

            self._data = loaded_data

            _LOGGER.info(
                f"Loaded from cache: {len(self._data.get('activities', {}))} activities, "
                f"{len(self._data.get('apps', {}))} apps, "
                f"{len(self._data.get('assignments', {}))} assignments"
            )

            return self._data

        except Exception as err:
            _LOGGER.error(f"Failed to load from cache: {err}")
            return self._data

    async def apply_config_overrides_async(
        self,
        inactive_timeout: int | None = None,
        occupied_threshold: int | None = None,
        occupied_inactive_timeout: int | None = None,
        environmental_check_interval: int | None = None,
    ) -> None:
        """
        Apply user configuration to activity timeouts (async version with save).

        PHILOSOPHY: Activity timeouts are LOCAL configuration
        - Config UI values ALWAYS override defaults (local-first for timeouts)
        - Cloud is used for apps/assignments, but NOT for activity timeouts
        - This ensures users can customize timeouts per HA instance

        Args:
            inactive_timeout: Timeout in seconds for 'inactive' activity (from movement)
            occupied_threshold: Duration threshold in seconds for 'occupied' activity
            occupied_inactive_timeout: Timeout in seconds for 'inactive' from 'occupied'
            environmental_check_interval: Interval in seconds between environmental state checks
        """
        self.apply_config_overrides(
            inactive_timeout,
            occupied_threshold,
            occupied_inactive_timeout,
            environmental_check_interval,
        )
        await self.async_save()

    def apply_config_overrides(
        self,
        inactive_timeout: int | None = None,
        occupied_threshold: int | None = None,
        occupied_inactive_timeout: int | None = None,
        environmental_check_interval: int | None = None,
    ) -> None:
        """
        Apply user configuration to activity timeouts (sync version without save).

        PHILOSOPHY: Activity timeouts are LOCAL configuration
        - Config UI values ALWAYS override defaults (local-first for timeouts)
        - Cloud is used for apps/assignments, but NOT for activity timeouts
        - This ensures users can customize timeouts per HA instance

        Args:
            inactive_timeout: Timeout in seconds for 'inactive' activity (from movement)
            occupied_threshold: Duration threshold in seconds for 'occupied' activity
            occupied_inactive_timeout: Timeout in seconds for 'inactive' from 'occupied'
            environmental_check_interval: Interval in seconds between environmental state checks
        """
        activities = self._data.get("activities", {})

        # Apply inactive timeout override (from movement)
        if inactive_timeout is not None and "inactive" in activities:
            old_timeout = activities["inactive"].get("timeout_seconds", 60)
            activities["inactive"]["timeout_seconds"] = inactive_timeout
            _LOGGER.info(
                f"Applied config override: inactive timeout (from movement) {old_timeout}s -> {inactive_timeout}s"
            )

        # Apply occupied threshold override
        if occupied_threshold is not None and "occupied" in activities:
            old_threshold = activities["occupied"].get(
                "duration_threshold_seconds", 300
            )
            activities["occupied"]["duration_threshold_seconds"] = occupied_threshold
            # Also update timeout_seconds to match threshold for occupied
            old_timeout = activities["occupied"].get("timeout_seconds", 300)
            activities["occupied"]["timeout_seconds"] = occupied_threshold
            _LOGGER.info(
                f"Applied config override: occupied threshold {old_threshold}s -> {occupied_threshold}s"
            )

        # Apply occupied inactive timeout override (separate from movement inactive timeout)
        # This is the timeout from occupied -> inactive (should be longer)
        if occupied_inactive_timeout is not None and "occupied" in activities:
            old_timeout = activities["occupied"].get("timeout_seconds", 300)
            activities["occupied"]["timeout_seconds"] = occupied_inactive_timeout
            _LOGGER.info(
                f"Applied config override: occupied timeout {old_timeout}s -> {occupied_inactive_timeout}s"
            )

        # Store environmental check interval in storage for rule engine to use
        if environmental_check_interval is not None:
            old_interval = self._data.get("environmental_check_interval", 30)
            self._data["environmental_check_interval"] = environmental_check_interval
            _LOGGER.info(
                f"Applied config override: environmental check interval {old_interval}s -> {environmental_check_interval}s"
            )

    def _save_file(self) -> None:
        """Synchronous file save operation with fsync for durability."""
        import os

        self.storage_dir.mkdir(parents=True, exist_ok=True)
        with open(self.storage_file, "w") as f:
            json.dump(self._data, f, indent=2, default=str)
            f.flush()  # Flush Python buffers
            os.fsync(f.fileno())  # Force OS to write to disk

    async def async_save(self) -> bool:
        """
        Save current data to local cache.

        Returns:
            True if successful
        """
        try:
            await self.hass.async_add_executor_job(self._save_file)
            _LOGGER.debug(f"Saved to cache: {self.storage_file}")
            return True

        except Exception as err:
            _LOGGER.error(f"Failed to save to cache: {err}")
            return False

    def load_hardcoded_fallback(
        self, preserve_sync_time: bool = False
    ) -> dict[str, Any]:
        """
        Load hardcoded fallback data from const.py.

        This is the ultimate fallback when:
        - No cloud connection AND no local data
        - First installation

        Args:
            preserve_sync_time: If True, keep existing synced_at timestamp

        Returns:
            Fallback data dictionary
        """
        from ..const import DEFAULT_ACTIVITY_TYPES, DEFAULT_AUTOLIGHT_APP

        # Preserve existing sync time if requested
        existing_sync_time = None
        if preserve_sync_time and self._data.get("synced_at"):
            existing_sync_time = self._data["synced_at"]

        self._data = {
            "version": STORAGE_VERSION,
            "activities": DEFAULT_ACTIVITY_TYPES,
            "apps": {"automatic_lighting": DEFAULT_AUTOLIGHT_APP},
            "assignments": {},
            "synced_at": existing_sync_time,
            "is_fallback": True,
        }

        _LOGGER.warning(
            "Using hardcoded fallback: 4 activities, 1 app (automatic_lighting), 0 assignments"
        )

        return self._data

    async def async_sync_from_cloud(
        self, supabase_client, instance_id: str, area_ids: list[str]
    ) -> bool:
        """
        Sync data from cloud (Supabase).

        NEW CLOUD-FIRST STRATEGY:
        - Activities are synced FROM cloud (with const.py fallback if cloud empty)
        - Apps are synced FROM cloud (with const.py fallback if cloud empty)
        - Assignments are LOCAL (managed by HA switches)

        RATIONALE:
        - Activities can be customized in Supabase (detection conditions, timeouts)
        - Apps (automation logic) are centralized and cloud-managed
        - Assignments (which areas use which apps) are local preferences
        - Config UI overrides can still be applied locally for instance-specific tuning

        Args:
            supabase_client: SupabaseClient instance
            instance_id: HA instance UUID
            area_ids: List of area IDs for this client

        Returns:
            True if sync succeeded, False otherwise
        """
        try:
            _LOGGER.info("Attempting cloud sync (timeout 10s)")

            async with asyncio.timeout(CLOUD_SYNC_TIMEOUT):
                # PRIORITY 1: Try to fetch activities from cloud
                _LOGGER.debug("Fetching activity definitions from cloud")
                
                activities = None
                activities_source = None
                
                try:
                    cloud_activities = await supabase_client.fetch_activity_types()
                    
                    if cloud_activities:
                        activities = cloud_activities
                        activities_source = "cloud"
                        _LOGGER.info(f"Loaded {len(activities)} activities from cloud")
                    else:
                        # Cloud returned empty - check if we have cached data
                        cached_activities = self._data.get("activities", {})
                        if cached_activities:
                            # PRIORITY 2: Use existing cache if cloud is empty
                            activities = cached_activities
                            activities_source = "cache (cloud empty)"
                            _LOGGER.warning("Cloud has no activities, preserving existing cache")
                        else:
                            # PRIORITY 3: No cloud, no cache - populate cache with const.py
                            _LOGGER.warning("Cloud empty and no cache, populating from const.py")
                            from ..const import DEFAULT_ACTIVITY_TYPES
                            activities = DEFAULT_ACTIVITY_TYPES.copy()
                            activities_source = "const.py (populated cache)"
                
                except Exception as err:
                    # Cloud fetch failed - check if we have cached data
                    cached_activities = self._data.get("activities", {})
                    if cached_activities:
                        # PRIORITY 2: Use existing cache if cloud fails
                        activities = cached_activities
                        activities_source = "cache (cloud error)"
                        _LOGGER.warning(f"Failed to fetch from cloud: {err}, preserving existing cache")
                    else:
                        # PRIORITY 3: No cloud, no cache - populate cache with const.py
                        _LOGGER.warning(f"Failed to fetch from cloud: {err} and no cache, populating from const.py")
                        from ..const import DEFAULT_ACTIVITY_TYPES
                        activities = DEFAULT_ACTIVITY_TYPES.copy()
                        activities_source = "const.py (populated cache)"

                apps = {}
                apps_source = None

                # Same logic for apps
                _LOGGER.debug("Fetching automatic_lighting app from cloud")
                try:
                    autolight_app = await supabase_client.fetch_app_with_actions(
                        "automatic_lighting", version=None
                    )
                    if autolight_app:
                        apps["automatic_lighting"] = autolight_app
                        apps_source = "cloud"
                        _LOGGER.info("Loaded automatic_lighting from cloud")
                    else:
                        # Cloud empty - check cache
                        cached_apps = self._data.get("apps", {})
                        if cached_apps.get("automatic_lighting"):
                            apps = cached_apps
                            apps_source = "cache (cloud empty)"
                            _LOGGER.warning("Cloud has no apps, preserving existing cache")
                        else:
                            from ..const import DEFAULT_AUTOLIGHT_APP
                            apps["automatic_lighting"] = DEFAULT_AUTOLIGHT_APP
                            apps_source = "const.py (populated cache)"
                            _LOGGER.warning("Cloud empty and no cached app, populating from const.py")
                
                except Exception as err:
                    # Cloud failed - check cache
                    cached_apps = self._data.get("apps", {})
                    if cached_apps.get("automatic_lighting"):
                        apps = cached_apps
                        apps_source = "cache (cloud error)"
                        _LOGGER.warning(f"Failed to fetch app: {err}, preserving existing cache")
                    else:
                        from ..const import DEFAULT_AUTOLIGHT_APP
                        apps["automatic_lighting"] = DEFAULT_AUTOLIGHT_APP
                        apps_source = "const.py (populated cache)"
                        _LOGGER.warning(f"Failed to fetch app: {err} and no cache, populating from const.py")

                # NOTE: We do NOT fetch assignments from cloud anymore
                # Assignments are managed by local Home Assistant switches
                # See: /docs/APP_ASSIGNMENT_ARCHITECTURE.md

                sync_time = dt_util.utcnow().isoformat()

                self._data = {
                    "version": STORAGE_VERSION,
                    "activities": activities,
                    "apps": apps,
                    "assignments": {},  # Empty - managed by switches
                    "synced_at": sync_time,
                    "is_fallback": activities_source.startswith("const") or apps_source.startswith("const"),
                }

                # Cloud sync completed (may use cache or const.py as fallback)
                await self.async_save()

                _LOGGER.info(
                    f"Sync completed: {len(self._data.get('activities', {}))} activities ({activities_source}), "
                    f"{len(self._data.get('apps', {}))} apps ({apps_source})"
                )

                return True

        except asyncio.TimeoutError:
            _LOGGER.warning("Cloud sync timeout (10s) - keeping existing local data")

            # Only load fallback if we have absolutely no local data
            if self.is_empty():
                _LOGGER.info("No local data available → loading fallback")
                self.load_hardcoded_fallback()
                await self.async_save()
            else:
                _LOGGER.info("Preserving existing local cache (graceful degradation)")

            return False

        except Exception as err:
            _LOGGER.warning(f"Cloud sync failed: {err} - keeping existing local data")

            # Only load fallback if we have absolutely no local data
            if self.is_empty():
                _LOGGER.info("No local data available → loading fallback")
                self.load_hardcoded_fallback()
                await self.async_save()
            else:
                _LOGGER.info("Preserving existing local cache (graceful degradation)")

            return False

    def get_activities(self) -> dict[str, Any]:
        """Get all activities."""
        return self._data.get("activities", {})

    def get_activity(self, activity_id: str) -> dict[str, Any] | None:
        """
        Get specific activity by ID.

        CRITICAL: System activities (movement, inactive, empty) must ALWAYS exist.
        If any are missing, auto-inject from fallback.
        """
        activity = self._data.get("activities", {}).get(activity_id)

        # Defensive fallback: System activities are INDESTRUCTIBLE
        critical_activities = ["movement", "inactive", "empty"]
        if activity_id in critical_activities and not activity:
            _LOGGER.error(
                f"CRITICAL: System activity '{activity_id}' missing from storage! "
                "Auto-injecting from fallback to ensure activity tracking works."
            )
            from ..const import DEFAULT_ACTIVITY_TYPES

            fallback_activity = DEFAULT_ACTIVITY_TYPES.get(activity_id)
            if fallback_activity:
                self.set_activity(activity_id, fallback_activity)
                return fallback_activity

        return activity

    def get_apps(self) -> dict[str, Any]:
        """Get all apps."""
        return self._data.get("apps", {})

    def get_app(self, app_id: str) -> dict[str, Any] | None:
        """
        Get specific app by ID.

        CRITICAL: automatic_lighting must ALWAYS exist as a system app.
        If it's missing, auto-inject from fallback.
        """
        app = self._data.get("apps", {}).get(app_id)

        # Defensive fallback: automatic_lighting is INDESTRUCTIBLE
        if app_id == "automatic_lighting" and not app:
            _LOGGER.error(
                "CRITICAL: automatic_lighting app missing from storage! "
                "Auto-injecting from fallback to ensure automation works."
            )
            from ..const import DEFAULT_AUTOLIGHT_APP

            self.set_app("automatic_lighting", DEFAULT_AUTOLIGHT_APP)
            return DEFAULT_AUTOLIGHT_APP

        return app

    def get_assignments(self) -> dict[str, Any]:
        """Get all area assignments."""
        return self._data.get("assignments", {})

    def get_assignment(self, area_id: str) -> dict[str, Any] | None:
        """Get assignment for specific area."""
        return self._data.get("assignments", {}).get(area_id)

    def set_activity(self, activity_id: str, activity_data: dict[str, Any]) -> None:
        """
        Set or update an activity.

        Args:
            activity_id: Activity identifier
            activity_data: Activity configuration
        """
        if "activities" not in self._data:
            self._data["activities"] = {}

        self._data["activities"][activity_id] = activity_data
        _LOGGER.debug(f"Updated activity: {activity_id}")

    def set_app(self, app_id: str, app_data: dict[str, Any]) -> None:
        """
        Set or update an app.

        Args:
            app_id: App identifier
            app_data: App configuration with activity_actions
        """
        if "apps" not in self._data:
            self._data["apps"] = {}

        self._data["apps"][app_id] = app_data
        _LOGGER.debug(f"Updated app: {app_id}")

    def set_assignment(self, area_id: str, assignment_data: dict[str, Any]) -> None:
        """
        Set or update an area assignment.

        Args:
            area_id: Area identifier
            assignment_data: Assignment configuration
        """
        if "assignments" not in self._data:
            self._data["assignments"] = {}

        self._data["assignments"][area_id] = assignment_data
        _LOGGER.debug(f"Updated assignment for area: {area_id}")

    def remove_assignment(self, area_id: str) -> bool:
        """
        Remove assignment for an area.

        Args:
            area_id: Area identifier

        Returns:
            True if removed, False if didn't exist
        """
        if area_id in self._data.get("assignments", {}):
            del self._data["assignments"][area_id]
            _LOGGER.debug(f"Removed assignment for area: {area_id}")
            return True

        return False

    def is_fallback_data(self) -> bool:
        """Check if currently using fallback data."""
        return self._data.get("is_fallback", False)

    def get_sync_time(self) -> datetime | None:
        """Get last cloud sync timestamp."""
        synced_at = self._data.get("synced_at")
        if synced_at:
            return dt_util.parse_datetime(synced_at)
        return None

    async def async_refresh_activities(
        self, supabase_client, instance_id: str | None = None
    ) -> bool:
        """
        Refresh activity configurations from local storage.

        NOTE: Activities are now LOCAL only (not fetched from cloud).
        This method reloads activities from const.py and applies config UI overrides.
        Use this after config changes to update activity timeouts.

        Args:
            supabase_client: Not used (kept for backward compatibility)
            instance_id: Not used (kept for backward compatibility)

        Returns:
            True (always succeeds with local data)
        """
        _LOGGER.debug("Refreshing activity configurations from local const.py")

        from ..const import DEFAULT_ACTIVITY_TYPES

        self._data["activities"] = DEFAULT_ACTIVITY_TYPES.copy()

        await self.async_save()
        _LOGGER.info(
            f"Refreshed {len(self._data['activities'])} activity configurations from local storage"
        )
        return True

    async def async_initialize(
        self, supabase_client, instance_id: str, area_ids: list[str]
    ) -> dict[str, Any]:
        """
        Initialize storage with full load sequence.

        LOAD SEQUENCE (cloud-first for ALL scenarios):
        1. Load from local cache
        2. Try sync from cloud (non-blocking, timeout 10s)
        3. If cloud succeeds → update cache
        4. If cloud fails/empty AND no local data → use fallback
        5. Return current data

        Args:
            supabase_client: SupabaseClient instance
            instance_id: HA instance UUID
            area_ids: List of area IDs for this client

        Returns:
            Loaded data dictionary
        """
        # Load from local cache first
        await self.async_load()

        # Try cloud sync (will handle fallback internally if needed)
        await self.async_sync_from_cloud(supabase_client, instance_id, area_ids)

        # After initialization, if still completely empty, load fallback
        # This catches the edge case where both cloud and local are empty
        if self.is_empty():
            _LOGGER.warning("After initialization, storage is empty → loading fallback")
            self.load_hardcoded_fallback()
            await self.async_save()

        return self._data
