"""
Sensor Platform for Linus Brain

This module provides diagnostic sensor entities that expose the integration's
status and statistics in the Home Assistant UI.

Sensor Types:
1. LinusBrainSyncSensor - Last sync time with Supabase (DIAGNOSTIC)
2. LinusBrainRoomsSensor - Number of areas being monitored (DIAGNOSTIC)
3. LinusBrainErrorsSensor - Integration error count (DIAGNOSTIC)
4. LinusBrainCloudHealthSensor - Cloud sync health status (DIAGNOSTIC)
5. LinusBrainRuleEngineStatsSensor - Rule engine performance and statistics (DIAGNOSTIC)
6. LinusAreaContextSensor - Per-area context (DIAGNOSTIC)
7. LinusBrainActivitiesSensor - Activities catalog from Supabase (DIAGNOSTIC)
8. LinusBrainAppSensor - Per-app details with version and actions (DIAGNOSTIC)

Setup Dependencies:
- area_manager: Must be added to hass.data[DOMAIN][entry.entry_id]["area_manager"]
- activity_tracker: Must be added to hass.data[DOMAIN][entry.entry_id]["activity_tracker"]
- rule_engine: Optional, for rule engine stats sensor
- app_storage: Required for activities and apps sensors

Area Context Sensors:
- Created for ALL areas with presence detection capability
- Independent from light automation (no light entities required)
- Displays: activity level, illuminance, sun elevation, area state (is_dark)
- DynamicEntityManager ensures late-loading integrations (MQTT, Zigbee) are included
"""

import json
import logging
from typing import Any

from homeassistant.components.sensor import SensorDeviceClass, SensorEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.update_coordinator import CoordinatorEntity

from .const import DOMAIN, get_area_device_info, get_integration_device_info
from .coordinator import LinusBrainCoordinator
from .utils.dynamic_entity_manager import DynamicEntityManager

_LOGGER = logging.getLogger(__name__)

# Module-level storage for dynamic entity managers
_ACTIVITY_DYNAMIC_MANAGER: DynamicEntityManager | None = None
_INSIGHT_DYNAMIC_MANAGER: DynamicEntityManager | None = None


def _format_activity_summary(activity_data: dict[str, Any]) -> str:
    """Create a readable text summary of an activity."""
    summary_parts = []
    
    # Basic info
    name = activity_data.get("activity_name", "Unknown")
    desc = activity_data.get("description", "")
    summary_parts.append(f"📋 {name}: {desc}")
    
    # Detection conditions
    conditions = activity_data.get("detection_conditions", [])
    if conditions:
        device_classes = set()
        for cond_group in conditions:
            if isinstance(cond_group, dict):
                for subcond in cond_group.get("conditions", []):
                    if isinstance(subcond, dict):
                        dc = subcond.get("device_class")
                        domain = subcond.get("domain")
                        if dc:
                            device_classes.add(f"{domain}.{dc}")
                        elif domain == "media_player":
                            device_classes.add("media_player")
        
        if device_classes:
            summary_parts.append(f"🔍 Detects: {', '.join(sorted(device_classes))}")
    
    # Timing
    threshold = activity_data.get("duration_threshold_seconds", 0)
    timeout = activity_data.get("timeout_seconds", 0)
    if threshold > 0:
        summary_parts.append(f"⏱️  Duration: {threshold}s")
    if timeout > 0:
        summary_parts.append(f"⏰ Timeout: {timeout}s")
    
    return "\n".join(summary_parts)


def _format_action_summary(actions: dict[str, Any]) -> str:
    """Create a readable text summary of actions."""
    if not actions:
        return "No actions"
    
    summary_parts = []
    for activity_id, activity_actions in actions.items():
        action_count = len(activity_actions) if isinstance(activity_actions, list) else 0
        summary_parts.append(f"  {activity_id}: {action_count} action(s)")
    
    return "\n".join(summary_parts)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """
    Set up Linus Brain sensor entities from a config entry.

    Args:
        hass: Home Assistant instance
        entry: Config entry
        async_add_entities: Callback to add entities
    """
    global _ACTIVITY_DYNAMIC_MANAGER, _INSIGHT_DYNAMIC_MANAGER
    
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    area_manager = hass.data[DOMAIN][entry.entry_id].get("area_manager")
    activity_tracker = hass.data[DOMAIN][entry.entry_id].get("activity_tracker")
    rule_engine = hass.data[DOMAIN][entry.entry_id].get("rule_engine")
    insights_manager = hass.data[DOMAIN][entry.entry_id].get("insights_manager")

    sensors = [
        LinusBrainSyncSensor(coordinator, entry),
        LinusBrainRoomsSensor(coordinator, entry),
        LinusBrainErrorsSensor(coordinator, entry),
        LinusBrainCloudHealthSensor(coordinator, entry),
    ]

    # Add activities catalog sensor
    _LOGGER.info("Creating activities catalog sensor")
    sensors.append(LinusBrainActivitiesSensor(coordinator, entry))

    # Add per-app sensors
    apps = coordinator.app_storage.get_apps()
    _LOGGER.info(f"Creating app sensors for {len(apps)} apps: {list(apps.keys())}")
    for app_id, app_data in apps.items():
        _LOGGER.info(f"Creating sensor for app: {app_id}")
        sensors.append(LinusBrainAppSensor(coordinator, app_id, app_data, entry))

    # Add rule engine stats sensor if available
    if rule_engine:
        sensors.append(LinusBrainRuleEngineStatsSensor(coordinator, rule_engine, entry))

    # Create area context sensors (initially for areas with presence detection already available)
    area_context_sensors = []
    if area_manager and activity_tracker:
        eligible_areas = area_manager.get_activity_tracking_areas()
        _LOGGER.info(
            f"Creating area context sensors initially for {len(eligible_areas)} areas "
            f"(rule_engine={'available' if rule_engine else 'not available'})"
        )
        for area_id, area_name in eligible_areas.items():
            _LOGGER.debug(f"Creating area context sensor for {area_name}")
            sensor = LinusAreaContextSensor(
                coordinator,
                area_manager,
                activity_tracker,
                insights_manager,
                rule_engine,
                area_id,
                area_name,
                entry,
            )
            area_context_sensors.append(sensor)
            sensors.append(sensor)
        
        # Setup dynamic entity manager for area context sensors
        async def _create_activity_sensors(area_id: str, area_name: str) -> list[Any]:
            """Create area context sensor for an area."""
            return [LinusAreaContextSensor(
                coordinator,
                area_manager,
                activity_tracker,
                insights_manager,
                rule_engine,
                area_id,
                area_name,
                entry,
            )]
        
        _ACTIVITY_DYNAMIC_MANAGER = DynamicEntityManager(
            hass=hass,
            entry=entry,
            async_add_entities=async_add_entities,
            platform_name="area_context_sensors",
            monitored_domains=["binary_sensor", "media_player"],
            monitored_device_classes=["motion", "presence", "occupancy"],
            should_create_for_area_callback=lambda area_id: area_manager.has_presence_detection(area_id),
            create_entities_callback=_create_activity_sensors,
            startup_delay=2.0,
        )
        
        # Mark areas we already created as tracked
        for sensor in area_context_sensors:
            if _ACTIVITY_DYNAMIC_MANAGER:
                _ACTIVITY_DYNAMIC_MANAGER.mark_area_tracked(sensor._area_id)

    # Create insight sensors (initially for areas with presence detection already available)
    insight_sensors_by_area: dict[str, list[Any]] = {}
    if area_manager and insights_manager:
        from .const import ENABLED_INSIGHT_SENSORS

        eligible_areas = area_manager.get_activity_tracking_areas()
        insight_types = insights_manager.get_all_insight_types()

        # Filter to only enabled insight types
        enabled_types = [it for it in insight_types if it in ENABLED_INSIGHT_SENSORS]

        if enabled_types:
            _LOGGER.info(
                f"Creating insight sensors initially for {len(eligible_areas)} areas "
                f"and {len(enabled_types)} enabled insight types: {enabled_types}"
            )

            for area_id, area_name in eligible_areas.items():
                insight_sensors_by_area[area_id] = []
                for insight_type in enabled_types:
                    _LOGGER.debug(
                        f"Creating insight sensor: {insight_type} for {area_name}"
                    )
                    sensor = LinusInsightSensor(
                        coordinator,
                        insights_manager,
                        area_id,
                        area_name,
                        insight_type,
                        entry,
                    )
                    insight_sensors_by_area[area_id].append(sensor)
                    sensors.append(sensor)
            
            # Setup dynamic entity manager for insight sensors
            async def _create_insight_sensors(area_id: str, area_name: str) -> list[Any]:
                """Create insight sensors for an area."""
                result = []
                for insight_type in enabled_types:
                    result.append(LinusInsightSensor(
                        coordinator,
                        insights_manager,
                        area_id,
                        area_name,
                        insight_type,
                        entry,
                    ))
                return result
            
            _INSIGHT_DYNAMIC_MANAGER = DynamicEntityManager(
                hass=hass,
                entry=entry,
                async_add_entities=async_add_entities,
                platform_name="insight_sensors",
                monitored_domains=["binary_sensor", "media_player"],
                monitored_device_classes=["motion", "presence", "occupancy"],
                should_create_for_area_callback=lambda area_id: area_manager.has_presence_detection(area_id),
                create_entities_callback=_create_insight_sensors,
                startup_delay=2.0,
            )
            
            # Mark areas we already created as tracked
            for area_id in insight_sensors_by_area:
                if _INSIGHT_DYNAMIC_MANAGER:
                    _INSIGHT_DYNAMIC_MANAGER.mark_area_tracked(area_id)
        else:
            _LOGGER.info(
                "No enabled insight types found. "
                f"Available: {insight_types}, Enabled: {ENABLED_INSIGHT_SENSORS}"
            )

    async_add_entities(sensors)
    _LOGGER.info(f"Added {len(sensors)} Linus Brain sensor entities initially")
    
    # Setup dynamic entity managers for late-loading integrations
    if _ACTIVITY_DYNAMIC_MANAGER:
        await _ACTIVITY_DYNAMIC_MANAGER.async_setup()
        _LOGGER.info("Dynamic entity manager setup complete for area context sensors")
    
    if _INSIGHT_DYNAMIC_MANAGER:
        await _INSIGHT_DYNAMIC_MANAGER.async_setup()
        _LOGGER.info("Dynamic entity manager setup complete for insight sensors")


class LinusBrainSyncSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor showing the last cloud sync time from Supabase.

    This tracks real cloud synchronization of apps/activities/assignments,
    not the local event-driven activity updates.
    """

    coordinator: LinusBrainCoordinator

    def __init__(self, coordinator: LinusBrainCoordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_translation_key = "last_sync"
        self._attr_unique_id = f"{DOMAIN}_last_sync"
        self._attr_has_entity_name = True
        self._attr_suggested_object_id = (
            f"{DOMAIN}_last_sync"  # Force English entity_id
        )
        self._attr_icon = "mdi:cloud-sync"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self._attr_device_info = get_integration_device_info(entry.entry_id)  # type: ignore[assignment]
        
        _LOGGER.debug(
            "🔧 [ENTITY DEBUG] LinusBrainSyncSensor.__init__ called. "
            "coordinator.data = %s",
            "None" if coordinator.data is None else f"dict with {len(coordinator.data)} keys"
        )
        self._update_from_coordinator()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        _LOGGER.debug(
            "🔧 [ENTITY DEBUG] LinusBrainSyncSensor._handle_coordinator_update called. "
            "coordinator.data = %s",
            "None" if self.coordinator.data is None else f"dict with {len(self.coordinator.data)} keys"
        )
        self._update_from_coordinator()
        super()._handle_coordinator_update()

    def _update_from_coordinator(self) -> None:
        """Update sensor attributes from coordinator data."""
        _LOGGER.debug(
            "🔧 [ENTITY DEBUG] LinusBrainSyncSensor._update_from_coordinator called. "
            "coordinator.data = %s",
            "None" if self.coordinator.data is None else f"dict with {len(self.coordinator.data)} keys"
        )
        from .utils.area_manager import (
            get_monitored_domains,
            get_presence_detection_domains,
        )

        # Get real cloud sync time from app_storage
        sync_time = self.coordinator.app_storage.get_sync_time()  # type: ignore[attr-defined]

        if sync_time:
            self._attr_native_value = sync_time.isoformat()

            # Get storage stats
            activities = self.coordinator.app_storage.get_activities()  # type: ignore[attr-defined]
            apps = self.coordinator.app_storage.get_apps()  # type: ignore[attr-defined]
            assignments = self.coordinator.app_storage.get_assignments()  # type: ignore[attr-defined]
            is_fallback = self.coordinator.app_storage.is_fallback_data()  # type: ignore[attr-defined]

            self._attr_extra_state_attributes = {
                "activities_loaded": len(activities),
                "apps_loaded": len(apps),
                "assignments_loaded": len(assignments),
                "is_fallback_data": is_fallback,
                "supabase_url": self.coordinator.supabase_url,  # type: ignore[attr-defined]
                "monitored_domains": get_monitored_domains(),
                "presence_detection_domains": get_presence_detection_domains(),
            }
        else:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {
                "status": "Never synced",
                "is_fallback_data": self.coordinator.app_storage.is_fallback_data(),  # type: ignore[attr-defined]
                "monitored_domains": get_monitored_domains(),
                "presence_detection_domains": get_presence_detection_domains(),
            }


class LinusBrainRoomsSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor showing the number of areas being monitored.
    """

    coordinator: LinusBrainCoordinator

    def __init__(self, coordinator: LinusBrainCoordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_translation_key = "monitored_areas"
        self._attr_unique_id = f"{DOMAIN}_monitored_areas"
        self._attr_has_entity_name = True
        self._attr_suggested_object_id = (
            f"{DOMAIN}_monitored_areas"  # Force English entity_id
        )
        self._attr_icon = "mdi:home-group"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self._attr_device_info = get_integration_device_info(entry.entry_id)  # type: ignore[assignment]
        self._update_from_coordinator()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_from_coordinator()
        super()._handle_coordinator_update()

    def _update_from_coordinator(self) -> None:
        """Update sensor attributes from coordinator data."""
        if self.coordinator.data:
            self._attr_native_value = self.coordinator.data.get("total_areas", 0)

            area_states = self.coordinator.data.get("area_states", [])
            occupied_areas = sum(
                1 for area in area_states if area.get("presence_detected", False)
            )

            self._attr_extra_state_attributes = {
                "occupied_areas": occupied_areas,
                "areas": [area.get("area") for area in area_states],
            }
        else:
            self._attr_native_value = None
            self._attr_extra_state_attributes = {}


class LinusBrainErrorsSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor showing the error count for the integration.
    """

    coordinator: LinusBrainCoordinator

    def __init__(self, coordinator: LinusBrainCoordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_translation_key = "errors"
        self._attr_unique_id = f"{DOMAIN}_errors"
        self._attr_has_entity_name = True
        self._attr_suggested_object_id = f"{DOMAIN}_errors"  # Force English entity_id
        self._attr_icon = "mdi:alert-circle"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self._attr_device_info = get_integration_device_info(entry.entry_id)  # type: ignore[assignment]
        self._update_from_coordinator()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_from_coordinator()
        super()._handle_coordinator_update()

    def _update_from_coordinator(self) -> None:
        """Update sensor attributes from coordinator data."""
        if self.coordinator.data:
            self._attr_native_value = self.coordinator.data.get("error_count", 0)
        else:
            self._attr_native_value = getattr(self.coordinator, "error_count", 0)

        total_syncs = getattr(self.coordinator, "sync_count", 0)
        errors = getattr(self.coordinator, "error_count", 0)

        if total_syncs > 0:
            success_rate = ((total_syncs - errors) / total_syncs) * 100
        else:
            success_rate = 100

        self._attr_extra_state_attributes = {
            "total_syncs": total_syncs,
            "success_rate": round(success_rate, 1),
            "supabase_url": getattr(self.coordinator, "supabase_url", "Unknown"),
        }


class LinusAreaContextSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor showing area context (activity + environmental state) for a specific area.
    """

    coordinator: LinusBrainCoordinator

    def __init__(
        self,
        coordinator: LinusBrainCoordinator,
        area_manager: Any,
        activity_tracker: Any,
        insights_manager: Any,
        rule_engine: Any,
        area_id: str,
        area_name: str,
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._coordinator = coordinator
        self._area_manager = area_manager
        self._activity_tracker = activity_tracker
        self._insights_manager = insights_manager
        self._rule_engine = rule_engine
        self._area_id = area_id
        self._area_name = area_name
        self._attr_unique_id = f"{DOMAIN}_activity_{area_id}"
        self._attr_translation_key = "activity"
        self._attr_has_entity_name = True
        self._attr_suggested_object_id = (
            f"{DOMAIN}_activity_{area_id}"  # Force English entity_id
        )
        self._attr_translation_placeholders = {"area_name": area_name}
        self._attr_icon = "mdi:home-analytics"
        self._attr_device_class = SensorDeviceClass.ENUM
        self._attr_options = ["empty", "movement", "occupied", "inactive"]
        self._attr_device_info = get_area_device_info(  # type: ignore[assignment]
            entry.entry_id, area_id, area_name
        )
        self._update_from_activity_tracker()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_from_activity_tracker()
        super()._handle_coordinator_update()

    def _update_from_activity_tracker(self) -> None:
        """Update sensor attributes from activity tracker and area manager."""
        activity_level = self._activity_tracker.get_activity(self._area_id)
        self._attr_native_value = activity_level
        _LOGGER.debug(f"Sensor update for {self._area_name}: activity={activity_level}")

        time_until_state_loss = self._activity_tracker.get_time_until_state_loss(
            self._area_id
        )
        # Pass instance_id to get_area_environmental_state for AI-learned thresholds
        area_state = self._area_manager.get_area_environmental_state(
            self._area_id, self._coordinator.instance_id
        )
        last_rule = (
            self.coordinator.data.get("last_rules", {}).get(self._area_id)
            if self.coordinator.data
            else None
        )

        seconds_until_timeout = None
        timeout_type = None

        # Check exit action timeout first (higher priority)
        if self._rule_engine:
            exit_timeout_remaining = self._rule_engine.get_exit_timeout_remaining(
                self._area_id
            )
            if exit_timeout_remaining is not None:
                seconds_until_timeout = round(exit_timeout_remaining, 1)
                timeout_type = "exit_action"

        # Fall back to activity timeout if no exit timeout
        if seconds_until_timeout is None and time_until_state_loss is not None:
            seconds_until_timeout = round(time_until_state_loss, 1)
            timeout_type = "activity"

        # Get insights for this area
        insights = {}
        if self._insights_manager and self._coordinator.instance_id:
            insights = self._insights_manager.get_all_insights_for_area(
                self._coordinator.instance_id, self._area_id
            )

        # Get configured timeouts for all activities
        configured_timeouts = self._activity_tracker.get_configured_timeouts()

        # Get active presence entities from coordinator (for backward compatibility)
        active_presence_entities = self._coordinator.active_presence_entities.get(self._area_id, [])

        # Activity sensor focuses on contextual activity state and environmental conditions
        # Presence detection attributes (active entities, detection sources) are now in binary_sensor
        # but we keep active_presence_entities here for backward compatibility with existing templates
        self._attr_extra_state_attributes = {
            # Activity context
            "activity_level": activity_level or "empty",
            "seconds_until_timeout": seconds_until_timeout if seconds_until_timeout is not None else 0,
            "timeout_type": timeout_type or "none",
            "configured_timeouts": configured_timeouts or {},
            
            # Environmental conditions
            "illuminance": area_state.get("illuminance") or 0,
            "temperature": area_state.get("temperature"),  # Can be None for areas without temperature sensor
            "humidity": area_state.get("humidity"),  # Can be None for areas without humidity sensor
            "sun_elevation": area_state.get("sun_elevation") or 0,
            "is_dark": area_state.get("is_dark", False),
            
            # Presence detection (backward compatibility - prefer binary_sensor for new templates)
            "active_presence_entities": active_presence_entities,
            
            # Automation context
            "last_automation_rule": last_rule,
            "insights": insights or {},
        }


class LinusBrainRuleEngineStatsSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor showing rule engine statistics and performance.
    """

    coordinator: LinusBrainCoordinator

    def __init__(
        self, coordinator: LinusBrainCoordinator, rule_engine: Any, entry: ConfigEntry
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._rule_engine = rule_engine
        self._attr_translation_key = "rule_engine"
        self._attr_has_entity_name = True
        self._attr_unique_id = f"{DOMAIN}_rule_engine"
        self._attr_suggested_object_id = (
            f"{DOMAIN}_rule_engine"  # Force English entity_id
        )
        self._attr_icon = "mdi:robot"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self._attr_device_info = get_integration_device_info(entry.entry_id)  # type: ignore[assignment]
        self._update_from_rule_engine()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_from_rule_engine()
        super()._handle_coordinator_update()

    def _update_from_rule_engine(self) -> None:
        """Update sensor attributes from rule engine stats."""
        stats = self._rule_engine.get_stats()

        total_triggers = stats.get("total_triggers", 0)
        successful = stats.get("successful_executions", 0)
        failed = stats.get("failed_executions", 0)
        cooldown_blocks = stats.get("cooldown_blocks", 0)

        # Calculate success rate
        total_executions = successful + failed
        if total_executions > 0:
            success_rate = round((successful / total_executions) * 100, 1)
        else:
            success_rate = 100.0

        self._attr_native_value = successful

        # Get enabled areas from assignments
        enabled_areas = list(self._rule_engine._assignments.keys())

        self._attr_extra_state_attributes = {
            "total_triggers": total_triggers,
            "successful_executions": successful,
            "failed_executions": failed,
            "cooldown_blocks": cooldown_blocks,
            "success_rate": success_rate,
            "enabled_areas_count": len(enabled_areas),
            "enabled_areas": enabled_areas,
            "total_assignments": stats.get("total_assignments", 0),
        }


class LinusBrainCloudHealthSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor showing cloud sync health and connection status.
    """

    coordinator: LinusBrainCoordinator

    def __init__(self, coordinator: LinusBrainCoordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_translation_key = "cloud_health"
        self._attr_has_entity_name = True
        self._attr_unique_id = f"{DOMAIN}_cloud_health"
        self._attr_suggested_object_id = (
            f"{DOMAIN}_cloud_health"  # Force English entity_id
        )
        self._attr_icon = "mdi:cloud-check"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self._attr_device_class = SensorDeviceClass.ENUM
        self._attr_options = ["connected", "disconnected", "error"]
        self._attr_device_info = get_integration_device_info(entry.entry_id)  # type: ignore[assignment]
        self._update_from_coordinator()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_from_coordinator()
        super()._handle_coordinator_update()

    def _update_from_coordinator(self) -> None:
        """Update sensor attributes from coordinator health data."""
        # Determine health status based on errors and sync success
        error_count = self.coordinator.error_count
        sync_count = self.coordinator.sync_count
        last_sync = self.coordinator.last_sync_time

        # Determine status
        if sync_count == 0:
            status = "disconnected"
        elif error_count > 0 and sync_count > 0:
            error_rate = error_count / sync_count
            if error_rate > 0.5:
                status = "error"
            elif error_rate > 0.1:
                status = "disconnected"
            else:
                status = "connected"
        else:
            status = "connected"

        self._attr_native_value = status

        # Change icon based on status
        if status == "connected":
            self._attr_icon = "mdi:cloud-check"
        elif status == "disconnected":
            self._attr_icon = "mdi:cloud-off-outline"
        else:
            self._attr_icon = "mdi:cloud-alert"

        # Get apps and activities loaded
        apps_loaded = len(self.coordinator.app_storage.get_apps())
        activities_loaded = len(self.coordinator.app_storage.get_activities())

        self._attr_extra_state_attributes = {
            "status": status,
            "last_successful_sync": last_sync,
            "total_syncs": sync_count,
            "total_errors": error_count,
            "instance_id": self.coordinator.instance_id,
            "apps_loaded": apps_loaded,
            "activities_loaded": activities_loaded,
            "supabase_url": self.coordinator.supabase_url,
        }


class LinusBrainActivitiesSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor showing all available activity types from Supabase.

    Displays the activities catalog that can be used in automation rules.
    """

    coordinator: LinusBrainCoordinator

    def __init__(self, coordinator: LinusBrainCoordinator, entry: ConfigEntry) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._attr_translation_key = "activities"
        self._attr_has_entity_name = True
        self._attr_unique_id = f"{DOMAIN}_activities"
        self._attr_suggested_object_id = (
            f"{DOMAIN}_activities"  # Force English entity_id
        )
        self._attr_icon = "mdi:run"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self._attr_device_info = get_integration_device_info(entry.entry_id)  # type: ignore[assignment]
        self._update_from_coordinator()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_from_coordinator()
        super()._handle_coordinator_update()

    def _update_from_coordinator(self) -> None:
        """Update sensor attributes from app_storage."""
        activities = self.coordinator.app_storage.get_activities()  # type: ignore[attr-defined]
        is_fallback = self.coordinator.app_storage.is_fallback_data()  # type: ignore[attr-defined]
        sync_time = self.coordinator.app_storage.get_sync_time()  # type: ignore[attr-defined]

        self._attr_native_value = len(activities)

        # Create structured attributes for each activity
        attrs = {
            "count": len(activities),
            "activity_ids": list(activities.keys()),
            "is_fallback": is_fallback,
            "synced_at": sync_time.isoformat() if sync_time else None,
        }
        
        # Add individual attributes per activity for easy reading
        for activity_id, activity_data in activities.items():
            prefix = f"{activity_id}_"
            attrs[f"{prefix}name"] = activity_data.get("activity_name", "Unknown")
            attrs[f"{prefix}description"] = activity_data.get("description", "")
            
            # Extract device classes from detection conditions
            device_classes = []
            conditions = activity_data.get("detection_conditions", [])
            for cond_group in conditions:
                if isinstance(cond_group, dict):
                    for subcond in cond_group.get("conditions", []):
                        if isinstance(subcond, dict):
                            dc = subcond.get("device_class")
                            domain = subcond.get("domain")
                            if dc:
                                device_classes.append(f"{domain}.{dc}")
                            elif domain == "media_player":
                                device_classes.append("media_player")
            
            attrs[f"{prefix}detects"] = ", ".join(sorted(set(device_classes))) if device_classes else "none"
            attrs[f"{prefix}duration_threshold"] = activity_data.get("duration_threshold_seconds", 0)
            attrs[f"{prefix}timeout"] = activity_data.get("timeout_seconds", 0)
            attrs[f"{prefix}is_system"] = activity_data.get("is_system", False)

        self._attr_extra_state_attributes = attrs


class LinusBrainAppSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor showing details for a specific app.

    Displays version, actions, and areas using this app.
    """

    coordinator: LinusBrainCoordinator

    def __init__(
        self,
        coordinator: LinusBrainCoordinator,
        app_id: str,
        app_data: dict[str, Any],
        entry: ConfigEntry,
    ) -> None:
        """Initialize the sensor."""
        super().__init__(coordinator)
        self._app_id = app_id
        self._app_name = app_data.get("name", app_id.title())
        self._attr_translation_key = "app"
        self._attr_has_entity_name = True
        self._attr_translation_placeholders = {"app_name": self._app_name}
        self._attr_unique_id = f"{DOMAIN}_app_{app_id}"
        self._attr_suggested_object_id = (
            f"{DOMAIN}_app_{app_id}"  # Force English entity_id
        )
        self._attr_icon = "mdi:application-cog"
        self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self._attr_device_info = get_integration_device_info(entry.entry_id)  # type: ignore[assignment]
        self._update_from_coordinator()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_from_coordinator()
        super()._handle_coordinator_update()

    def _update_from_coordinator(self) -> None:
        """Update sensor attributes from app_storage."""
        app_data = self.coordinator.app_storage.get_app(self._app_id)  # type: ignore[attr-defined]

        if not app_data:
            self._attr_native_value = "not_found"
            self._attr_extra_state_attributes = {"error": "App not found in storage"}
            return

        version = app_data.get("version", "default")
        self._attr_native_value = version

        activity_actions = app_data.get("activity_actions", {})
        supported_activities = list(activity_actions.keys())
        total_actions = sum(len(actions) for actions in activity_actions.values())

        assignments = self.coordinator.app_storage.get_assignments()  # type: ignore[attr-defined]
        areas_using_app = [
            area_id
            for area_id, assignment in assignments.items()
            if assignment.get("app_id") == self._app_id
        ]

        attrs = {
            "app_id": self._app_id,
            "app_name": self._app_name,
            "version": version,
            "description": app_data.get("description", ""),
            "created_by": app_data.get("created_by", "unknown"),
            "supported_activities": ", ".join(supported_activities),
            "total_actions": total_actions,
            "areas_assigned": ", ".join(areas_using_app) if areas_using_app else "none",
            "areas_count": len(areas_using_app),
        }
        
        for activity_id, actions in activity_actions.items():
            action_count = len(actions) if isinstance(actions, list) else 0
            attrs[f"actions_{activity_id}"] = action_count
            if action_count > 0 and isinstance(actions, list):
                first_action = actions[0]
                if isinstance(first_action, dict):
                    attrs[f"actions_{activity_id}_first"] = first_action.get("action", "unknown")

        self._attr_extra_state_attributes = attrs


class LinusInsightSensor(CoordinatorEntity, SensorEntity):
    """
    Sensor showing a specific insight value for an area.

    Each insight type gets its own sensor entity per area.
    For example: sensor.linus_brain_dark_threshold_salon

    Displays native value with proper unit (e.g., "20 lx", "75%")
    and includes confidence/source in attributes.
    """

    coordinator: LinusBrainCoordinator

    def __init__(
        self,
        coordinator: LinusBrainCoordinator,
        insights_manager: Any,
        area_id: str,
        area_name: str,
        insight_type: str,
        entry: ConfigEntry,
    ) -> None:
        """
        Initialize the insight sensor.

        Args:
            coordinator: Main coordinator
            insights_manager: Insights manager for data access
            area_id: Area identifier (e.g., "salon")
            area_name: Human-readable area name
            insight_type: Type of insight (e.g., "dark_threshold_lux")
            entry: Config entry
        """
        super().__init__(coordinator)
        self._coordinator = coordinator
        self._insights_manager = insights_manager
        self._area_id = area_id
        self._area_name = area_name
        self._insight_type = insight_type

        # Get config for this insight type
        from .const import INSIGHT_SENSOR_CONFIG

        self._config = INSIGHT_SENSOR_CONFIG.get(
            insight_type, INSIGHT_SENSOR_CONFIG["_default"]
        )

        # Set entity attributes
        self._attr_unique_id = f"{DOMAIN}_insight_{insight_type}_{area_id}"
        self._attr_translation_key = self._config["translation_key"]
        self._attr_has_entity_name = True
        self._attr_suggested_object_id = f"{DOMAIN}_{insight_type}_{area_id}"
        self._attr_translation_placeholders = {
            "area_name": area_name,
            "insight_type": insight_type.replace("_", " ").title(),
        }
        self._attr_icon = self._config["icon"]

        # Use string for device_class to avoid import issues
        device_class = self._config["device_class"]
        if device_class == "illuminance":
            self._attr_device_class = SensorDeviceClass.ILLUMINANCE
        else:
            self._attr_device_class = device_class

        self._attr_native_unit_of_measurement = self._config["unit"]
        self._attr_entity_category = EntityCategory.DIAGNOSTIC
        self._attr_device_info = get_area_device_info(  # type: ignore[assignment]
            entry.entry_id, area_id, area_name
        )

        # Initial update
        self._update_from_insights()

    def _handle_coordinator_update(self) -> None:
        """Handle updated data from the coordinator."""
        self._update_from_insights()
        super()._handle_coordinator_update()

    def _update_from_insights(self) -> None:
        """Update sensor value and attributes from insights manager."""
        from .const import get_insight_value

        # Get insight with 3-tier fallback
        insight = self._insights_manager.get_insight(
            instance_id=self._coordinator.instance_id,
            area_id=self._area_id,
            insight_type=self._insight_type,
            default=None,
        )

        if insight is None:
            # No insight available at any level
            _LOGGER.debug(
                "No insight available for %s in area %s",
                self._insight_type,
                self._area_id,
            )
            self._attr_native_value = None
            self._attr_available = False
            self._attr_extra_state_attributes = {
                "error": "No insight available",
            }
            return

        # Extract value using configured path
        value = get_insight_value(insight, self._config["value_path"])

        # Set native value
        self._attr_native_value = value
        self._attr_available = True

        _LOGGER.debug(
            "Updated insight sensor %s for area %s: value=%s, source=%s",
            self._insight_type,
            self._area_id,
            value,
            insight.get("source", "unknown"),
        )

        # Set attributes with metadata
        self._attr_extra_state_attributes = {
            "confidence": insight.get("confidence", 0.0),
            "source": insight.get("source", "unknown"),
            "updated_at": insight.get("updated_at"),
            "metadata": insight.get("metadata", {}),
            "full_value": insight.get(
                "value", {}
            ),  # Include full value for complex insights
        }
