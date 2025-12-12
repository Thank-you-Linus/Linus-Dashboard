"""
Linus Brain - Home Assistant Custom Integration

This component serves as an AI bridge between Home Assistant and a cloud brain (Supabase).
It learns presence patterns per area by collecting local signals and can later return
automation rules based on AI analysis.

Main responsibilities:
- Initialize the integration with Supabase credentials
- Set up the data coordinator for state management
- Register event listeners for entity state changes
- Load diagnostic sensor platforms
- Manage integration lifecycle (setup/unload)
"""

import logging
from typing import TYPE_CHECKING

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import Platform
from homeassistant.core import HomeAssistant
from homeassistant.exceptions import ConfigEntryNotReady
from homeassistant.helpers import area_registry
from homeassistant.helpers import entity_registry as er

if TYPE_CHECKING:
    from homeassistant.helpers.entity_registry import RegistryEntry

from .const import CONF_SUPABASE_KEY, CONF_SUPABASE_URL, DOMAIN
from .coordinator import LinusBrainCoordinator
from .services import async_setup_services, async_unload_services
from .utils.event_listener import EventListener
from .utils.insights_manager import InsightsManager
from .utils.light_learning import LightLearning
from .utils.rule_engine import RuleEngine

_LOGGER = logging.getLogger(__name__)

PLATFORMS = [Platform.BINARY_SENSOR, Platform.BUTTON, Platform.LIGHT, Platform.SENSOR, Platform.SWITCH]


async def async_migrate_device_areas(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """
    Migrate Linus Brain devices to their correct areas.

    This function ensures that area-specific Linus Brain devices are assigned
    to their corresponding Home Assistant areas via the device registry.

    This is necessary because we removed 'suggested_area' from device_info
    to prevent creating duplicate areas when area_id is a hash.

    Instead, we directly assign devices to areas using the device_registry API.

    This migration is safe to run multiple times - it will only update devices
    that need updating.

    Args:
        hass: Home Assistant instance
        entry: Config entry for this integration
    """
    from homeassistant.helpers import device_registry as dr

    device_reg = dr.async_get(hass)
    area_reg = area_registry.async_get(hass)

    # Get all devices for this integration
    devices = dr.async_entries_for_config_entry(device_reg, entry.entry_id)

    if not devices:
        _LOGGER.debug("No devices found for area migration")
        return

    migrations_needed = []

    for device in devices:
        # Skip the main integration device (no area assignment needed)
        for identifier in device.identifiers:
            if identifier[0] == DOMAIN and identifier[1] == entry.entry_id:
                # This is the main integration device
                continue

            # Check if this is an area-specific device
            # Format: (DOMAIN, f"{entry_id}_{area_id}")
            if identifier[0] == DOMAIN and "_" in identifier[1]:
                # Extract area_id from identifier
                identifier_str = identifier[1]
                if identifier_str.startswith(f"{entry.entry_id}_"):
                    area_id = identifier_str.replace(f"{entry.entry_id}_", "")

                    # Verify this area exists in Home Assistant
                    area = area_reg.async_get_area(area_id)
                    if not area:
                        _LOGGER.warning(
                            f"Device {device.name} references non-existent area: {area_id}"
                        )
                        continue

                    # Check if device needs migration
                    if device.area_id != area_id:
                        migrations_needed.append(
                            {
                                "device": device,
                                "current_area": device.area_id,
                                "target_area": area_id,
                                "area_name": area.name,
                            }
                        )

    if not migrations_needed:
        _LOGGER.info("Device area migration check: All devices correctly assigned ✓")
        return

    # Perform migrations
    _LOGGER.info(
        f"Device area migration: Found {len(migrations_needed)} devices to migrate"
    )

    migrated_count = 0
    for migration in migrations_needed:
        device_entry = migration["device"]
        target_area_id = migration["target_area"]
        area_name = migration["area_name"]
        
        # Type assertions: validate types from migration dict
        assert isinstance(target_area_id, str)
        if not hasattr(device_entry, 'id'):
            _LOGGER.error(f"Invalid device entry in migration: {device_entry}")
            continue

        try:
            # Update device area using device_registry
            device_reg.async_update_device(device_entry.id, area_id=target_area_id)  # type: ignore[union-attr]

            _LOGGER.info(
                f"Migrated device '{device_entry.name}' to area '{area_name}' ({target_area_id})"  # type: ignore[union-attr]
            )
            migrated_count += 1

        except Exception as err:
            _LOGGER.error(
                f"Failed to migrate device '{device_entry.name}' to area '{area_name}': {err}"  # type: ignore[union-attr]
            )

    if migrated_count > 0:
        _LOGGER.info(
            f"Device area migration complete: {migrated_count} devices assigned to areas"
        )
    else:
        _LOGGER.warning("Device area migration complete: No devices could be migrated")


async def async_migrate_entity_ids(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """
    Migrate entity IDs from localized names to English.

    This function automatically renames entities that were created with localized
    entity_ids (e.g., French) to their proper English equivalents.

    This migration is safe to run multiple times - it will only rename entities
    that need renaming.

    Args:
        hass: Home Assistant instance
        entry: Config entry for this integration
    """
    entity_reg = er.async_get(hass)

    # Get all entities for this integration
    entities = er.async_entries_for_config_entry(entity_reg, entry.entry_id)

    if not entities:
        _LOGGER.debug("No entities found for migration check")
        return

    # Define the mapping from translation_key to expected English entity_id suffix
    # These are the patterns we expect for properly named entities
    EXPECTED_ENTITY_IDS = {
        # Button entities
        "sync": "sync",
        # Sensor entities (global)
        "last_sync": "last_sync",
        "monitored_areas": "monitored_areas",
        "errors": "errors",
        "cloud_health": "cloud_health",
        "rule_engine": "rule_engine",
        "activities": "activities",
        # Sensor entities (per-area activity sensors use pattern: activity_{area_id})
        "activity": "activity",
        # Sensor entities (per-app sensors use pattern: app_{app_id})
        "app": "app",
        # Sensor entities (per-area insight sensors use pattern: {insight_type}_{area_id})
        "dark_threshold": "dark_threshold",
        "bright_threshold": "bright_threshold",
        "default_brightness": "default_brightness",
        # Binary sensor entities (per-area presence detection use pattern: presence_detection_{area_id})
        "presence_detection": "presence_detection",
        # Switch entities (per-area feature switches use pattern: feature_{feature_id}_{area_id})
        "feature_automatic_lighting": "feature_automatic_lighting",
        # Light entities (per-area light groups use pattern: all_lights_{area_id})
        "area_lights": "all_lights",
    }

    migrations_needed = []

    for entity_entry in entities:
        # Skip entities without translation_key
        if not entity_entry.translation_key:
            continue

        current_entity_id = entity_entry.entity_id
        platform, current_name = current_entity_id.split(".", 1)

        # Determine expected entity_id based on translation_key
        translation_key = entity_entry.translation_key

        # Handle different entity types
        if translation_key == "activity":
            # Activity sensors: sensor.linus_brain_activity_{area_id}
            # Extract area_id from unique_id which is: linus_brain_activity_{area_id}
            if entity_entry.unique_id and entity_entry.unique_id.startswith(
                "linus_brain_activity_"
            ):
                area_id = entity_entry.unique_id.replace("linus_brain_activity_", "")
                expected_name = f"linus_brain_activity_{area_id}"
            else:
                continue

        elif translation_key == "presence_detection":
            # Presence detection binary sensors: binary_sensor.linus_brain_presence_detection_{area_id}
            # Extract area_id from unique_id which is: linus_brain_presence_detection_{area_id}
            if entity_entry.unique_id and entity_entry.unique_id.startswith(
                "linus_brain_presence_detection_"
            ):
                area_id = entity_entry.unique_id.replace("linus_brain_presence_detection_", "")
                expected_name = f"linus_brain_presence_detection_{area_id}"
            else:
                continue

        elif translation_key in ["dark_threshold", "bright_threshold", "default_brightness"]:
            # Insight sensors: sensor.linus_brain_{insight_type}_{area_id}
            # Extract area_id from unique_id which is: linus_brain_insight_{insight_type}_{area_id}
            if entity_entry.unique_id and entity_entry.unique_id.startswith("linus_brain_insight_"):
                # unique_id format: linus_brain_insight_{insight_type}_{area_id}
                parts = entity_entry.unique_id.split("_", 3)  # Split into ["linus", "brain", "insight", "{type}_{area}"]
                if len(parts) >= 4:
                    # parts[3] is "{insight_type}_{area_id}"
                    type_and_area = parts[3]
                    # Find the insight type
                    for insight_type in ["dark_threshold", "bright_threshold", "default_brightness"]:
                        if type_and_area.startswith(insight_type + "_"):
                            area_id = type_and_area.replace(insight_type + "_", "")
                            expected_name = f"linus_brain_{insight_type}_{area_id}"
                            break
                    else:
                        continue
                else:
                    continue
            else:
                continue

        elif translation_key == "app":
            # App sensors: sensor.linus_brain_app_{app_id}
            # Extract app_id from unique_id which is: linus_brain_app_{app_id}
            if entity_entry.unique_id and entity_entry.unique_id.startswith(
                "linus_brain_app_"
            ):
                app_id = entity_entry.unique_id.replace("linus_brain_app_", "")
                expected_name = f"linus_brain_app_{app_id}"
            else:
                continue

        elif translation_key == "area_lights":
            # Light groups: light.linus_brain_all_lights_{area_id}
            # Extract area_id from unique_id which is: linus_brain_all_lights_{area_id}
            if entity_entry.unique_id and entity_entry.unique_id.startswith(
                "linus_brain_all_lights_"
            ):
                area_id = entity_entry.unique_id.replace("linus_brain_all_lights_", "")
                expected_name = f"linus_brain_all_lights_{area_id}"
            else:
                continue

        elif translation_key.startswith("feature_"):
            # Feature switches: switch.linus_brain_feature_{feature_id}_{area_id}
            # Extract from unique_id which is: linus_brain_feature_{feature_id}_{area_id}
            if entity_entry.unique_id and entity_entry.unique_id.startswith(
                "linus_brain_feature_"
            ):
                suffix = entity_entry.unique_id.replace("linus_brain_", "")
                expected_name = f"linus_brain_{suffix}"
            else:
                continue

        elif translation_key in EXPECTED_ENTITY_IDS:
            # Standard entities: use direct mapping
            expected_name = f"linus_brain_{EXPECTED_ENTITY_IDS[translation_key]}"
        else:
            # Unknown translation_key, skip
            continue

        expected_entity_id = f"{platform}.{expected_name}"

        # Check if migration is needed
        if current_entity_id != expected_entity_id:
            migrations_needed.append(
                {
                    "entity_entry": entity_entry,
                    "current": current_entity_id,
                    "expected": expected_entity_id,
                    "translation_key": translation_key,
                }
            )

    if not migrations_needed:
        _LOGGER.info(
            "Entity ID migration check: All entities already have English entity_ids ✓"
        )
        return

    # Perform migrations
    _LOGGER.info(
        f"Entity ID migration: Found {len(migrations_needed)} entities to migrate"
    )

    migrated_count = 0
    for migration in migrations_needed:
        entity_reg_entry: "RegistryEntry" = migration["entity_entry"]  # type: ignore[assignment]
        current_id: str = migration["current"]  # type: ignore[assignment]
        expected_id: str = migration["expected"]  # type: ignore[assignment]

        try:
            # Check if target entity_id already exists
            if entity_reg.async_get(expected_id):
                _LOGGER.warning(
                    f"Cannot migrate {current_id} → {expected_id}: Target entity_id already exists"
                )
                continue

            # Perform the migration
            entity_reg.async_update_entity(
                entity_reg_entry.entity_id, new_entity_id=expected_id
            )

            _LOGGER.info(f"Migrated: {current_id} → {expected_id}")
            migrated_count += 1

        except Exception as err:
            _LOGGER.error(f"Failed to migrate {current_id} → {expected_id}: {err}")

    if migrated_count > 0:
        _LOGGER.info(
            f"Entity ID migration complete: {migrated_count} entities renamed to English"
        )
    else:
        _LOGGER.warning("Entity ID migration complete: No entities could be migrated")


async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """
    Set up Linus Brain from a config entry.

    This function is called when the user has configured the integration via the UI.
    It initializes the coordinator, event listener, and loads platforms.

    Args:
        hass: Home Assistant instance
        entry: Config entry containing Supabase URL and API key

    Returns:
        True if setup was successful, False otherwise
    """
    _LOGGER.info("Setting up Linus Brain integration")

    # Retrieve configuration from the config entry
    supabase_url = entry.data.get(CONF_SUPABASE_URL)
    supabase_key = entry.data.get(CONF_SUPABASE_KEY)

    if not supabase_url or not supabase_key:
        _LOGGER.error("Missing Supabase URL or API key in configuration")
        raise ConfigEntryNotReady("Missing Supabase credentials")

    # Initialize the data coordinator
    # This manages periodic updates and state aggregation
    coordinator = LinusBrainCoordinator(
        hass=hass,
        supabase_url=supabase_url,
        supabase_key=supabase_key,
        config_entry=entry,
    )

    # Initialize app storage with cloud sync BEFORE first refresh
    # This ensures ActivityTracker has activities available when it initializes
    instance_id = await coordinator.get_or_create_instance_id()
    area_ids = [area.id for area in area_registry.async_get(hass).async_list_areas()]

    _LOGGER.info(
        f"Initializing app storage for instance {instance_id} with {len(area_ids)} areas"
    )
    await coordinator.app_storage.async_initialize(
        coordinator.supabase_client, instance_id, area_ids
    )

    # Apply user configuration overrides to activity timeouts
    from .const import (
        CONF_ENVIRONMENTAL_CHECK_INTERVAL,
        CONF_INACTIVE_TIMEOUT,
        CONF_OCCUPIED_INACTIVE_TIMEOUT,
        CONF_OCCUPIED_THRESHOLD,
        DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL,
    )

    inactive_timeout = entry.options.get(CONF_INACTIVE_TIMEOUT)
    occupied_threshold = entry.options.get(CONF_OCCUPIED_THRESHOLD)
    occupied_inactive_timeout = entry.options.get(CONF_OCCUPIED_INACTIVE_TIMEOUT)
    environmental_check_interval = entry.options.get(
        CONF_ENVIRONMENTAL_CHECK_INTERVAL, DEFAULT_ENVIRONMENTAL_CHECK_INTERVAL
    )
    await coordinator.app_storage.apply_config_overrides_async(
        inactive_timeout=inactive_timeout,
        occupied_threshold=occupied_threshold,
        occupied_inactive_timeout=occupied_inactive_timeout,
        environmental_check_interval=environmental_check_interval,
    )

    # Initialize insights manager and load insights from Supabase
    insights_manager = InsightsManager(coordinator.supabase_client)
    await insights_manager.async_load(instance_id)
    _LOGGER.info(f"Loaded {len(insights_manager._cache)} insights from Supabase")

    # Pass insights_manager to area_manager for AI-learned thresholds
    coordinator.area_manager._insights_manager = insights_manager

    # DON'T do the first refresh here - wait until after platforms are loaded
    # This prevents race conditions where entities try to access coordinator.data before it exists
    _LOGGER.debug(
        "Deferring first coordinator refresh until after platforms are loaded. "
        "coordinator.data is: %s",
        "None" if coordinator.data is None else f"dict with {len(coordinator.data)} keys"
    )

    light_learning = LightLearning(hass, coordinator)

    _LOGGER.info("🎧 Creating EventListener...")
    event_listener = EventListener(hass, coordinator, light_learning)

    _LOGGER.info("🎧 Starting EventListener...")
    await event_listener.async_start_listening()
    _LOGGER.info("🎧 EventListener started successfully!")
    entry.async_on_unload(event_listener.async_stop_listening)

    async def async_check_activity_timeouts(_now=None):
        """Check and update activity states based on timeouts."""
        # Check activity states for all areas (activity tracking is always active)
        for area_id in coordinator.activity_tracker._area_states:
            await coordinator.activity_tracker.async_evaluate_activity(area_id)
        coordinator.async_update_listeners()

    from datetime import timedelta

    from homeassistant.helpers.event import async_track_time_interval

    timeout_checker = async_track_time_interval(
        hass, async_check_activity_timeouts, timedelta(seconds=30)
    )
    entry.async_on_unload(timeout_checker)

    async def async_refresh_remote_config(_now=None):
        """
        Refresh remote configuration from cloud.

        NOTE: Activities (movement, inactive, occupied) are now LOCAL only.
        This function is kept for future expansion (e.g., refreshing apps from cloud).
        """
        try:
            _LOGGER.debug("Remote config refresh triggered (activities are local only)")

            # Future: Could refresh apps from Supabase here if needed
            # For now, activities are local and don't need cloud refresh

        except Exception as err:
            _LOGGER.warning(f"Failed to refresh remote configuration: {err}")

    # Refresh remote config every hour
    remote_config_refresher = async_track_time_interval(
        hass, async_refresh_remote_config, timedelta(hours=1)
    )
    entry.async_on_unload(remote_config_refresher)

    rule_engine = RuleEngine(
        hass,
        entry.entry_id,
        coordinator.activity_tracker,
        coordinator.app_storage,
        coordinator.area_manager,
        coordinator.feature_flag_manager,
    )
    await rule_engine.async_initialize()
    entry.async_on_unload(rule_engine.async_shutdown)

    # Link rule_engine to coordinator for activity-triggered evaluations
    coordinator.rule_engine = rule_engine

    # Link coordinator to activity_tracker for timeout-triggered updates
    coordinator.activity_tracker.coordinator = coordinator

    hass.data.setdefault(DOMAIN, {})
    hass.data[DOMAIN][entry.entry_id] = {
        "coordinator": coordinator,
        "event_listener": event_listener,
        "light_learning": light_learning,
        "rule_engine": rule_engine,
        "area_manager": coordinator.area_manager,
        "activity_tracker": coordinator.activity_tracker,
        "insights_manager": insights_manager,
    }

    # Register services (only once, not per config entry)
    if len(hass.data[DOMAIN]) == 1:
        await async_setup_services(hass)
        entry.async_on_unload(lambda: async_unload_services(hass))

    # Migrate entity IDs from localized names to English (if needed)
    # This runs before platforms are loaded, so it renames existing entities
    # before new ones are created
    await async_migrate_entity_ids(hass, entry)

    # Migrate devices to their correct areas (if needed)
    # This ensures area-specific devices are assigned to the right areas
    # without using suggested_area (which causes duplicate areas with hash IDs)
    await async_migrate_device_areas(hass, entry)

    # Forward the setup to sensor platform
    _LOGGER.debug("Loading platforms: %s", PLATFORMS)
    _LOGGER.debug(
        "coordinator.data before platform load: %s",
        "None" if coordinator.data is None else f"dict with {len(coordinator.data)} keys"
    )
    try:
        await hass.config_entries.async_forward_entry_setups(entry, PLATFORMS)
        _LOGGER.debug("All platforms loaded successfully")
    except Exception as err:
        _LOGGER.error(f"Failed to load platforms: {err}", exc_info=True)
        raise

    # NOW do the first refresh - all entities are created and can handle the data
    # This prevents race conditions where entities try to access coordinator.data before it exists
    _LOGGER.debug("Performing first coordinator refresh (after platforms loaded)")
    _LOGGER.debug(
        "coordinator.data before refresh: %s",
        "None" if coordinator.data is None else f"dict with {len(coordinator.data)} keys"
    )
    
    import time
    refresh_start = time.time()
    
    try:
        await coordinator.async_config_entry_first_refresh()
        _LOGGER.debug("async_config_entry_first_refresh succeeded")
    except RuntimeError as err:
        # During reload, entry is already LOADED, use async_refresh instead
        _LOGGER.debug(
            "async_config_entry_first_refresh failed (likely during reload): %s, using async_refresh instead",
            err
        )
        await coordinator.async_refresh()
    
    refresh_duration = time.time() - refresh_start
    _LOGGER.debug(
        "First coordinator refresh completed in %.3f seconds. "
        "coordinator.data is now: %s",
        refresh_duration,
        "None" if coordinator.data is None else f"dict with {len(coordinator.data)} keys"
    )
    
    # Trigger entity updates explicitly to ensure they get the data
    _LOGGER.debug("Triggering entity updates with coordinator.async_update_listeners()")
    coordinator.async_update_listeners()
    _LOGGER.debug("Entity updates triggered")

    # Register options update listener
    entry.async_on_unload(entry.add_update_listener(async_reload_entry))

    _LOGGER.info("Linus Brain integration setup completed successfully")
    return True


async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """
    Unload a config entry.

    This function is called when the integration is being removed or reloaded.
    It ensures proper cleanup of listeners and resources.

    Args:
        hass: Home Assistant instance
        entry: Config entry to unload

    Returns:
        True if unload was successful
    """
    _LOGGER.info("Unloading Linus Brain integration")

    # Unload platforms with graceful error handling
    # Some platforms might not have been loaded if setup failed
    unload_results = []
    for platform in PLATFORMS:
        try:
            result = await hass.config_entries.async_unload_platforms(entry, [platform])
            unload_results.append(result)
            _LOGGER.debug(f"Unloaded platform {platform}: {result}")
        except ValueError as err:
            # Platform was never loaded, this is OK during reload after failed setup
            _LOGGER.debug(f"Platform {platform} was not loaded, skipping: {err}")
            unload_results.append(True)  # Consider this successful
        except Exception as err:
            _LOGGER.error(f"Failed to unload platform {platform}: {err}")
            unload_results.append(False)

    unload_ok = all(unload_results)

    if unload_ok:
        # Only cleanup if entry data exists (might not exist if setup failed)
        if entry.entry_id in hass.data.get(DOMAIN, {}):
            entry_data = hass.data[DOMAIN][entry.entry_id]

            event_listener = entry_data.get("event_listener")
            if event_listener:
                await event_listener.async_stop_listening()

            rule_engine = entry_data.get("rule_engine")
            if rule_engine:
                await rule_engine.async_shutdown()

            hass.data[DOMAIN].pop(entry.entry_id)
        else:
            _LOGGER.debug("Entry data not found, setup may have failed previously")

        # Unload services if this was the last config entry
        if not hass.data.get(DOMAIN):
            await async_unload_services(hass)

        _LOGGER.info("Linus Brain integration unloaded successfully")
    else:
        _LOGGER.warning("Some platforms failed to unload, but continuing anyway")

    return unload_ok


async def async_reload_entry(hass: HomeAssistant, entry: ConfigEntry) -> None:
    """
    Reload config entry.

    Called when the user updates the configuration.

    Args:
        hass: Home Assistant instance
        entry: Config entry to reload
    """
    _LOGGER.info("Reloading Linus Brain integration")
    await async_unload_entry(hass, entry)
    await async_setup_entry(hass, entry)
