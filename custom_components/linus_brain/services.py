"""
Services for Linus Brain integration.

This module defines custom services that users can call to interact with
the Linus Brain integration programmatically.
"""

import logging

import homeassistant.helpers.config_validation as cv
import voluptuous as vol
from homeassistant.core import HomeAssistant, ServiceCall

from .const import DOMAIN

_LOGGER = logging.getLogger(__name__)

# Service names
SERVICE_SYNC_NOW = "sync_now"
SERVICE_FETCH_RULES = "fetch_rules"
SERVICE_SEND_AREA_UPDATE = "send_area_update"
SERVICE_RELOAD_RULES = "reload_rules"
SERVICE_SIMULATE_ACTIVITY = "simulate_activity"
SERVICE_LOAD_RULE_FROM_CLOUD = "load_rule_from_cloud"
SERVICE_RELOAD_APPS = "reload_apps"
SERVICE_RESET_APP_PREFERENCES = "reset_app_preferences"

# Feature flag debugging services
SERVICE_DEBUG_AREA_STATUS = "debug_area_status"
SERVICE_DEBUG_SYSTEM_OVERVIEW = "debug_system_overview"
SERVICE_DEBUG_VALIDATE_AREA = "debug_validate_area"
SERVICE_DEBUG_EXPORT_DATA = "debug_export_data"
SERVICE_DEBUG_RESET_METRICS = "debug_reset_metrics"
SERVICE_DEBUG_ACTIVITIES = "debug_activities"

# Service schemas
SERVICE_SEND_AREA_UPDATE_SCHEMA = vol.Schema(
    {
        vol.Required("area"): cv.string,
    }
)

SERVICE_SIMULATE_ACTIVITY_SCHEMA = vol.Schema(
    {
        vol.Required("area_id"): cv.string,
        vol.Required("activity"): vol.In(["empty", "inactive", "movement", "occupied"]),
        vol.Optional("duration", default=0): vol.All(
            vol.Coerce(int), vol.Range(min=0, max=3600)
        ),
    }
)

SERVICE_LOAD_RULE_FROM_CLOUD_SCHEMA = vol.Schema(
    {
        vol.Required("area_id"): cv.string,
    }
)

# Feature flag debugging service schemas
SERVICE_DEBUG_AREA_STATUS_SCHEMA = vol.Schema(
    {
        vol.Required("area_id"): cv.string,
    }
)

SERVICE_DEBUG_VALIDATE_AREA_SCHEMA = vol.Schema(
    {
        vol.Required("area_id"): cv.string,
    }
)

SERVICE_DEBUG_EXPORT_DATA_SCHEMA = vol.Schema(
    {
        vol.Optional("format", default="json"): vol.In(["json", "csv", "txt"]),
        vol.Optional("area_id", default=None): cv.string,
    }
)

SERVICE_RESET_APP_PREFERENCES_SCHEMA = vol.Schema(
    {
        vol.Required("area_id"): cv.string,
        vol.Optional("app_id"): cv.string,
    }
)


async def async_setup_services(hass: HomeAssistant) -> None:
    """
    Set up services for Linus Brain.

    Args:
        hass: Home Assistant instance
    """

    async def handle_sync_now(call: ServiceCall) -> None:
        """
        Handle the sync_now service call.

        Forces an immediate sync of:
        1. Activities and apps from Supabase (app_storage)
        2. All area states to Supabase (coordinator)
        """
        _LOGGER.info("Service sync_now called")

        # Get all coordinators for all config entries
        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            if coordinator:
                # First, sync activities/apps from cloud
                from homeassistant.helpers.area_registry import async_get as async_get_area_registry
                area_registry = async_get_area_registry(hass)
                area_ids = [area.id for area in area_registry.async_list_areas()]
                instance_id = await coordinator.get_or_create_instance_id()
                
                _LOGGER.info(f"Syncing activities and apps from cloud for entry {entry_id}")
                sync_success = await coordinator.app_storage.async_sync_from_cloud(
                    coordinator.supabase_client, instance_id, area_ids
                )
                
                if sync_success:
                    _LOGGER.info(f"Activities/apps sync successful for entry {entry_id}")
                else:
                    _LOGGER.warning(f"Activities/apps sync failed for entry {entry_id}")
                
                # Then refresh coordinator (updates sensors and sends area states)
                await coordinator.async_refresh()
                _LOGGER.info(f"Forced coordinator refresh for entry {entry_id}")

    async def handle_fetch_rules(call: ServiceCall) -> None:
        """
        Handle the fetch_rules service call.

        Fetches automation rules from Supabase and syncs to local storage.
        """
        _LOGGER.info("Service fetch_rules called")

        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            rule_engine = entry_data.get("rule_engine")
            switches = entry_data.get("switches", {})
            if coordinator and rule_engine:
                await coordinator.async_fetch_and_sync_rules()
                count = await rule_engine.reload_rules()

                for area_id, switch in switches.items():
                    rule = await rule_engine.get_rule(area_id)
                    if rule and hasattr(switch, "update_rule_data"):
                        switch.update_rule_data(rule)

                _LOGGER.info(f"Fetched and reloaded {count} rules for entry {entry_id}")

    async def handle_send_area_update(call: ServiceCall) -> None:
        """
        Handle the send_area_update service call.

        Sends an immediate update for a specific area.
        """
        area = call.data.get("area")
        _LOGGER.info(f"Service send_area_update called for area: {area}")

        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            if coordinator:
                await coordinator.async_send_area_update(area)
                _LOGGER.info(f"Sent update for area {area} (entry {entry_id})")

    async def handle_reload_rules(call: ServiceCall) -> None:
        """
        Handle the reload_rules service call.

        Reloads automation rules from local storage.
        """
        _LOGGER.info("Service reload_rules called")

        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            rule_engine = entry_data.get("rule_engine")
            switches = entry_data.get("switches", {})
            if rule_engine:
                count = await rule_engine.reload_rules()

                for area_id, switch in switches.items():
                    rule = await rule_engine.get_rule(area_id)
                    if rule and hasattr(switch, "update_rule_data"):
                        switch.update_rule_data(rule)

                _LOGGER.info(f"Reloaded {count} rules for entry {entry_id}")

    async def handle_simulate_activity(call: ServiceCall) -> None:
        """
        Handle the simulate_activity service call.

        Simulates activity for an area and triggers rule evaluation.
        """
        area_id = call.data.get("area_id")
        activity = call.data.get("activity")
        duration = call.data.get("duration", 0)

        _LOGGER.info(
            f"Service simulate_activity called: area={area_id}, activity={activity}, duration={duration}s"
        )

        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            activity_tracker = entry_data.get("activity_tracker")
            rule_engine = entry_data.get("rule_engine")

            if activity_tracker and rule_engine:
                await activity_tracker.simulate_activity(area_id, activity, duration)

                if activity != "empty":
                    await rule_engine._async_evaluate_and_execute(area_id)
                    _LOGGER.info(f"Triggered rule evaluation for area {area_id}")

    async def handle_load_rule_from_cloud(call: ServiceCall) -> None:
        """
        Handle the load_rule_from_cloud service call.

        Fetches a specific area rule from Supabase and loads it.
        """
        area_id = call.data.get("area_id")
        _LOGGER.info(f"Service load_rule_from_cloud called for area: {area_id}")

        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            rule_engine = entry_data.get("rule_engine")
            switches = entry_data.get("switches", {})

            if not coordinator or not rule_engine:
                continue

            supabase_client = coordinator.supabase_client
            instance_id = coordinator.instance_id
            local_storage = rule_engine.local_storage

            try:
                rule = await supabase_client.get_rule_for_area(instance_id, area_id)

                if not rule:
                    _LOGGER.warning(f"No rule found in cloud for area {area_id}")
                    continue

                await local_storage.save_rule(area_id, rule)
                _LOGGER.info(f"Saved rule for area {area_id} to local storage")

                await rule_engine.reload_rules()

                if area_id in switches:
                    switch = switches[area_id]
                    if hasattr(switch, "update_rule_data"):
                        switch.update_rule_data(rule)
                    _LOGGER.info(f"Updated switch display for area {area_id}")

                _LOGGER.info(f"Successfully loaded rule for area {area_id} from cloud")

            except Exception as err:
                _LOGGER.error(f"Failed to load rule for area {area_id}: {err}")

    async def handle_debug_area_status(call: ServiceCall) -> None:
        """
        Handle debug_area_status service call.

        Provides detailed debugging information for a specific area.
        """
        area_id = call.data.get("area_id")
        _LOGGER.info(f"Service debug_area_status called for area: {area_id}")

        # Get coordinator and debugger
        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            if coordinator and hasattr(coordinator, "feature_flag_manager"):
                try:
                    # Get debug information directly from feature flag manager
                    debug_info = (
                        coordinator.feature_flag_manager.get_area_status_explanation(
                            area_id
                        )
                    )

                    _LOGGER.info(f"Debug info for {area_id}: {debug_info}")

                    # Store debug info in a convenient location
                    hass.data.setdefault(f"{DOMAIN}_debug", {})
                    hass.data[f"{DOMAIN}_debug"][f"area_{area_id}"] = debug_info

                except Exception as err:
                    _LOGGER.error(f"Failed to debug area {area_id}: {err}")

    async def handle_debug_system_overview(call: ServiceCall) -> None:
        """
        Handle debug_system_overview service call.

        Provides system-wide debugging information.
        """
        _LOGGER.info("Service debug_system_overview called")

        # Get coordinator and debugger
        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            if coordinator and hasattr(coordinator, "feature_flag_manager"):
                try:
                    # Get system overview directly from feature flag manager
                    overview = coordinator.feature_flag_manager.get_system_overview()

                    _LOGGER.info(f"System overview: {overview}")

                    # Store overview in hass data
                    hass.data.setdefault(f"{DOMAIN}_debug", {})
                    hass.data[f"{DOMAIN}_debug"]["system_overview"] = overview

                except Exception as err:
                    _LOGGER.error(f"Failed to get system overview: {err}")

    async def handle_debug_validate_area(call: ServiceCall) -> None:
        """
        Handle debug_validate_area service call.

        Validates area configuration and provides recommendations.
        """
        area_id = call.data.get("area_id")
        _LOGGER.info(f"Service debug_validate_area called for area: {area_id}")

        # Get coordinator and feature flag manager
        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            if coordinator and coordinator.feature_flag_manager:
                try:
                    # Validate area
                    if area_id is not None:
                        result = (
                            await coordinator.feature_flag_manager.validate_area_state(
                                area_id
                            )
                        )

                        _LOGGER.info(
                            f"Validation result for {area_id}: {result.get_summary()}"
                        )

                        # Store validation result
                        hass.data.setdefault(f"{DOMAIN}_debug", {})
                        hass.data[f"{DOMAIN}_debug"][f"validation_{area_id}"] = {
                            "is_valid": result.is_valid,
                            "errors": result.errors,
                            "warnings": result.warnings,
                            "suggestions": result.suggestions,
                            "summary": result.get_summary(),
                        }
                    else:
                        _LOGGER.warning("No area_id provided for validation")

                except Exception as err:
                    _LOGGER.error(f"Failed to validate area {area_id}: {err}")

    async def handle_debug_export_data(call: ServiceCall) -> None:
        """
        Handle debug_export_data service call.

        Exports debug data in specified format.
        """
        format_type = call.data.get("format", "json")
        area_id = call.data.get("area_id")
        _LOGGER.info(
            f"Service debug_export_data called with format: {format_type}, area_id: {area_id}"
        )

        # Get coordinator and debugger
        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            if coordinator and hasattr(coordinator, "feature_flag_manager"):
                try:
                    # Export debug data directly from feature flag manager
                    export_data = coordinator.feature_flag_manager.export_debug_data(
                        format_type
                    )

                    _LOGGER.info(
                        f"Exported debug data ({format_type}): {len(export_data)} characters"
                    )

                    # Store export data
                    hass.data.setdefault(f"{DOMAIN}_debug", {})
                    hass.data[f"{DOMAIN}_debug"]["export"] = {
                        "format": format_type,
                        "data": export_data,
                        "timestamp": (
                            coordinator.debugger._debug_history[-1]["timestamp"]
                            if coordinator.debugger._debug_history
                            else None
                        ),
                    }

                except Exception as err:
                    _LOGGER.error(f"Failed to export debug data: {err}")

    async def handle_debug_reset_metrics(call: ServiceCall) -> None:
        """
        Handle debug_reset_metrics service call.

        Resets feature flag metrics and debug history.
        """
        _LOGGER.info("Service debug_reset_metrics called")

        # Get coordinator
        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            if coordinator and hasattr(coordinator, "feature_flag_manager"):
                try:
                    # Reset metrics
                    coordinator.feature_flag_manager.reset_metrics()

                    # Debug history is now managed within feature flag manager

                    _LOGGER.info("Feature flag metrics and debug history reset")

                except Exception as err:
                    _LOGGER.error(f"Failed to reset metrics: {err}")

    async def handle_debug_activities(call: ServiceCall) -> None:
        """
        Handle debug_activities service call.

        Shows currently loaded activity definitions and their detection conditions.
        """
        _LOGGER.info("Service debug_activities called")

        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            app_storage = entry_data.get("app_storage")

            if not coordinator or not app_storage:
                continue

            try:
                activities = app_storage.get_activities()

                _LOGGER.info("="*60)
                _LOGGER.info("CURRENTLY LOADED ACTIVITIES")
                _LOGGER.info("="*60)

                for activity_id, activity_data in activities.items():
                    _LOGGER.info(f"\n🔹 Activity: {activity_id}")
                    _LOGGER.info(f"   Name: {activity_data.get('activity_name', 'N/A')}")
                    _LOGGER.info(f"   Description: {activity_data.get('description', 'N/A')}")
                    
                    # Show detection conditions
                    conditions = activity_data.get('detection_conditions', [])
                    if conditions:
                        _LOGGER.info(f"   Detection conditions:")
                        import json
                        _LOGGER.info(json.dumps(conditions, indent=6))
                    else:
                        _LOGGER.info(f"   Detection conditions: (none)")
                    
                    # Show device classes being monitored
                    device_classes = []
                    for cond_group in conditions:
                        for cond in cond_group.get('conditions', []):
                            if cond.get('domain') == 'binary_sensor':
                                dc = cond.get('device_class')
                                if dc:
                                    device_classes.append(dc)
                    
                    if device_classes:
                        _LOGGER.info(f"   Binary sensor device classes: {device_classes}")

                _LOGGER.info("="*60)
                _LOGGER.info(f"Total activities loaded: {len(activities)}")

            except Exception as err:
                _LOGGER.error(f"Failed to debug activities: {err}", exc_info=True)

    async def handle_reset_app_preferences(call: ServiceCall) -> None:
        """
        Handle reset_app_preferences service call.

        Resets config_overrides for a specific area assignment to default values.
        If app_id is specified, only resets that app's preferences.
        """
        area_id = call.data.get("area_id")
        app_id = call.data.get("app_id")

        _LOGGER.info(
            f"Service reset_app_preferences called for area: {area_id}, app: {app_id or 'current'}"
        )

        for entry_id, entry_data in hass.data.get(DOMAIN, {}).items():
            coordinator = entry_data.get("coordinator")
            app_storage = entry_data.get("app_storage")

            if not coordinator or not app_storage:
                continue

            try:
                # Get current assignment
                assignment = app_storage.get_assignment(area_id)

                if not assignment:
                    _LOGGER.warning(f"No assignment found for area {area_id}")
                    continue

                # If app_id specified, verify it matches
                assignment_app_id = assignment.get("app_id")
                if app_id and assignment_app_id != app_id:
                    _LOGGER.warning(
                        f"Area {area_id} is assigned to {assignment_app_id}, not {app_id}"
                    )
                    continue

                # Reset config_overrides to empty dict (app defaults will be used)
                assignment["config_overrides"] = {}

                # Save to local storage
                app_storage.set_assignment(area_id, assignment)
                await app_storage.async_save()

                _LOGGER.info(
                    f"Reset preferences for area {area_id} (app: {assignment_app_id})"
                )

                # Sync to cloud if available
                try:
                    await coordinator.supabase_client.assign_app_to_area(
                        area_id=area_id,
                        app_id=assignment_app_id,
                        app_version=assignment.get("app_version"),
                        config_overrides={},
                        global_conditions=assignment.get("global_conditions", []),
                        enabled=assignment.get("enabled", True),
                        changed_by="service",
                        change_reason="Reset preferences to defaults",
                    )
                    _LOGGER.info(
                        f"Synced reset preferences to cloud for area {area_id}"
                    )
                except Exception as cloud_err:
                    _LOGGER.warning(
                        f"Failed to sync reset preferences to cloud for {area_id}: {cloud_err}"
                    )

            except Exception as err:
                _LOGGER.error(f"Failed to reset preferences for area {area_id}: {err}")

    # Register services
    hass.services.async_register(
        DOMAIN,
        SERVICE_SYNC_NOW,
        handle_sync_now,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_FETCH_RULES,
        handle_fetch_rules,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SEND_AREA_UPDATE,
        handle_send_area_update,
        schema=SERVICE_SEND_AREA_UPDATE_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_RELOAD_RULES,
        handle_reload_rules,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_SIMULATE_ACTIVITY,
        handle_simulate_activity,
        schema=SERVICE_SIMULATE_ACTIVITY_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_LOAD_RULE_FROM_CLOUD,
        handle_load_rule_from_cloud,
        schema=SERVICE_LOAD_RULE_FROM_CLOUD_SCHEMA,
    )

    # Register debugging services
    hass.services.async_register(
        DOMAIN,
        SERVICE_DEBUG_AREA_STATUS,
        handle_debug_area_status,
        schema=SERVICE_DEBUG_AREA_STATUS_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DEBUG_SYSTEM_OVERVIEW,
        handle_debug_system_overview,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DEBUG_VALIDATE_AREA,
        handle_debug_validate_area,
        schema=SERVICE_DEBUG_VALIDATE_AREA_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DEBUG_EXPORT_DATA,
        handle_debug_export_data,
        schema=SERVICE_DEBUG_EXPORT_DATA_SCHEMA,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DEBUG_RESET_METRICS,
        handle_debug_reset_metrics,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_DEBUG_ACTIVITIES,
        handle_debug_activities,
    )

    hass.services.async_register(
        DOMAIN,
        SERVICE_RESET_APP_PREFERENCES,
        handle_reset_app_preferences,
        schema=SERVICE_RESET_APP_PREFERENCES_SCHEMA,
    )

    _LOGGER.info("Linus Brain services registered")


async def async_unload_services(hass: HomeAssistant) -> None:
    """
    Unload services for Linus Brain.

    Args:
        hass: Home Assistant instance
    """
    hass.services.async_remove(DOMAIN, SERVICE_SYNC_NOW)
    hass.services.async_remove(DOMAIN, SERVICE_FETCH_RULES)
    hass.services.async_remove(DOMAIN, SERVICE_SEND_AREA_UPDATE)
    hass.services.async_remove(DOMAIN, SERVICE_RELOAD_RULES)
    hass.services.async_remove(DOMAIN, SERVICE_SIMULATE_ACTIVITY)
    hass.services.async_remove(DOMAIN, SERVICE_LOAD_RULE_FROM_CLOUD)
    hass.services.async_remove(DOMAIN, SERVICE_DEBUG_AREA_STATUS)
    hass.services.async_remove(DOMAIN, SERVICE_DEBUG_SYSTEM_OVERVIEW)
    hass.services.async_remove(DOMAIN, SERVICE_DEBUG_VALIDATE_AREA)
    hass.services.async_remove(DOMAIN, SERVICE_DEBUG_EXPORT_DATA)
    hass.services.async_remove(DOMAIN, SERVICE_DEBUG_RESET_METRICS)
    hass.services.async_remove(DOMAIN, SERVICE_DEBUG_ACTIVITIES)
    hass.services.async_remove(DOMAIN, SERVICE_RESET_APP_PREFERENCES)

    _LOGGER.info("Linus Brain services unregistered")
