"""
Binary Sensor Platform for Linus Brain

This module provides binary sensor entities that aggregate presence detection
per area, showing a simple on/off state based on all configured detection methods.

Binary Sensor Types:
1. PresenceDetectionBinarySensor - Per-area presence detection aggregator (uses GroupEntity)

Key Features:
- Aggregates motion, presence, occupancy, and media sensors
- Respects user's presence detection configuration
- Automatically tracks member entity changes (via GroupEntity)
- Dynamically updates when new entities are added (solves MQTT startup race condition)
- Shows member entities in Home Assistant UI (more-info dialog)
- Complements the activity sensor (doesn't replace it)
- Automatically removed when no presence entities remain in an area

Architecture Notes:
- binary_sensor.presence_detection → Simple presence aggregation (on/off)
- sensor.activity → Contextual activity detection (empty/movement/occupied/etc.)
- Automatic lighting uses sensor.activity for timeout-based control
- This binary sensor is for visibility and debugging purposes
- DynamicEntityManager ensures late-loading integrations (MQTT, Zigbee) are included
"""

import logging
from typing import TYPE_CHECKING, Any

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.components.group.entity import GroupEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ENTITY_ID, STATE_ON, EntityCategory
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import DOMAIN, get_area_device_info
from .utils.dynamic_entity_manager import DynamicEntityManager

if TYPE_CHECKING:
    from .utils.group_manager import GroupManager

_LOGGER = logging.getLogger(__name__)

# Module-level storage for created sensors (used by DynamicEntityManager)
_DYNAMIC_MANAGER: DynamicEntityManager | None = None


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """
    Set up binary sensor entities for Linus Brain.

    Creates one PresenceDetectionBinarySensor per area with presence capability.
    Uses DynamicEntityManager to handle late-loading integrations (MQTT, Zigbee).

    Args:
        hass: Home Assistant instance
        entry: Config entry
        async_add_entities: Callback to add entities
    """
    global _DYNAMIC_MANAGER
    
    area_manager = hass.data[DOMAIN][entry.entry_id].get("area_manager")
    
    if not area_manager:
        _LOGGER.error("area_manager not found, cannot create binary sensors")
        return

    # Create sensors for areas with presence detection already available
    entities = []
    eligible_areas = area_manager.get_activity_tracking_areas()

    for area_id, area_name in eligible_areas.items():
        # Get presence entities for this area
        presence_entities = await _async_get_presence_entities(
            hass, entry, area_manager, area_id
        )
        
        if not presence_entities:
            _LOGGER.debug(
                f"No presence entities found for area {area_name}, skipping for now (may be created later)"
            )
            continue

        sensor = PresenceDetectionBinarySensor(
            hass=hass,
            area_id=area_id,
            area_name=area_name,
            entry_id=entry.entry_id,
            entity_ids=presence_entities,
        )
        entities.append(sensor)

    if entities:
        async_add_entities(entities)
        _LOGGER.info(
            f"Created {len(entities)} presence detection binary sensors initially for areas: "
            f"{[e._area_name for e in entities]}"
        )
    else:
        _LOGGER.info("No presence sensors created initially (late-loading integrations may add them later)")

    # Setup dynamic entity manager for late-loading integrations
    async def _create_entities_for_area(area_id: str, area_name: str) -> list[Any]:
        """Create presence sensor entities for an area."""
        presence_entities = await _async_get_presence_entities(hass, entry, area_manager, area_id)
        
        if not presence_entities:
            return []
        
        sensor = PresenceDetectionBinarySensor(
            hass=hass,
            area_id=area_id,
            area_name=area_name,
            entry_id=entry.entry_id,
            entity_ids=presence_entities,
        )
        return [sensor]
    
    _DYNAMIC_MANAGER = DynamicEntityManager(
        hass=hass,
        entry=entry,
        async_add_entities=async_add_entities,
        platform_name="presence_detection",
        monitored_domains=["binary_sensor", "media_player"],
        monitored_device_classes=["motion", "presence", "occupancy"],
        should_create_for_area_callback=lambda area_id: area_manager.has_presence_detection(area_id),
        create_entities_callback=_create_entities_for_area,
        startup_delay=2.0,
    )
    
    # Mark areas we already created as tracked
    for entity in entities:
        if _DYNAMIC_MANAGER:
            _DYNAMIC_MANAGER.mark_area_tracked(entity._area_id)
    
    # Setup the dynamic manager (will listen for new entities and do post-startup refresh)
    if _DYNAMIC_MANAGER:
        await _DYNAMIC_MANAGER.async_setup()
    
    _LOGGER.info("Dynamic entity manager setup complete for presence sensors")


async def _async_get_presence_entities(
    hass: HomeAssistant,
    entry: ConfigEntry,
    area_manager: Any,
    area_id: str,
) -> list[str]:
    """
    Get list of presence detection entity IDs for an area.

    Respects the user's presence detection configuration from Config Flow.

    Args:
        hass: Home Assistant instance
        entry: Config entry
        area_manager: Area manager instance
        area_id: Area ID

    Returns:
        List of entity_id strings for presence detection
    """
    # Get presence detection config from options
    presence_config = area_manager._get_presence_detection_config()
    
    # Get ALL presence entities for this area (not just active ones)
    entities_by_type = area_manager.get_presence_entities_for_area(area_id)

    entity_ids = []

    # Motion sensors
    if presence_config.get("motion", True):
        entity_ids.extend(entities_by_type.get("motion", []))

    # Presence sensors
    if presence_config.get("presence", True):
        entity_ids.extend(entities_by_type.get("presence", []))

    # Occupancy sensors
    if presence_config.get("occupancy", True):
        entity_ids.extend(entities_by_type.get("occupancy", []))

    # Media players
    if presence_config.get("media_playing", True):
        entity_ids.extend(entities_by_type.get("media", []))

    return entity_ids


class PresenceDetectionBinarySensor(GroupEntity, BinarySensorEntity):
    """
    Binary sensor that aggregates all presence detection for an area.

    Inherits from GroupEntity to automatically:
    - Track state changes of member entities
    - Update group state when members change
    - Display member entities in Home Assistant UI (more-info)

    This sensor shows a simple on/off state based on:
    - Motion sensors (binary_sensor.motion)
    - Presence sensors (binary_sensor.presence)
    - Occupancy sensors (binary_sensor.occupancy)
    - Media players (media_player.* playing/on)

    The sensor respects the user's presence detection configuration from Config Flow.
    If a detection type is disabled, it won't be included in the entity_ids list.

    Attributes:
        - entity_id: List of member entities (automatically managed by GroupEntity)
        - detection_config: Current presence detection configuration
    """

    _attr_device_class = BinarySensorDeviceClass.OCCUPANCY
    _attr_entity_category = EntityCategory.DIAGNOSTIC
    _attr_translation_key = "presence_detection"
    _attr_has_entity_name = True
    _attr_should_poll = False

    def __init__(
        self,
        hass: HomeAssistant,
        area_id: str,
        area_name: str,
        entry_id: str,
        entity_ids: list[str],
    ) -> None:
        """
        Initialize the presence detection binary sensor.

        Args:
            hass: Home Assistant instance
            area_id: Home Assistant area ID
            area_name: Human-readable area name
            entry_id: Config entry ID
            entity_ids: List of entity IDs to aggregate
        """
        super().__init__()
        self.hass = hass
        self._area_id = area_id
        self._area_name = area_name
        self._entry_id = entry_id
        self._entity_ids = entity_ids
        self._group_manager: "GroupManager | None" = None  # Will be set in async_added_to_hass

        # Unique ID format: linus_brain_presence_detection_{area_id}
        self._attr_unique_id = f"{DOMAIN}_presence_detection_{area_id}"
        
        # Force English entity_id
        self._attr_suggested_object_id = f"{DOMAIN}_presence_detection_{area_id}"

        # Translation placeholders for area name
        self._attr_translation_placeholders = {"area_name": area_name}
        
        # Device info - link to area device
        self._attr_device_info = get_area_device_info(  # type: ignore[assignment]
            entry_id, area_id, area_name
        )

        # Initialize extra_state_attributes with entity_id list (GroupEntity manages this)
        self._attr_extra_state_attributes = {
            ATTR_ENTITY_ID: entity_ids,
        }

        _LOGGER.debug(
            f"Initialized presence detection binary sensor for area: {area_name} ({area_id}) "
            f"with {len(entity_ids)} entities: {entity_ids}"
        )

    async def async_added_to_hass(self) -> None:
        """
        Setup entity refresh triggers using GroupManager.
        
        Delegates startup, area change detection, and automatic removal to GroupManager.
        """
        await super().async_added_to_hass()
        
        from .utils.group_manager import GroupManager
        
        # Create and setup group manager with removal support
        self._group_manager = GroupManager(
            hass=self.hass,
            refresh_callback=self._async_refresh_entity_list,
            monitored_domains=["binary_sensor", "media_player"],
            startup_delay=2.0,
            log_prefix=f"PresenceDetection[{self._area_name}]",
            removal_callback=self._async_remove_self,
            check_empty_callback=self._is_empty,
        )
        
        assert self._group_manager is not None  # for type checker
        await self._group_manager.async_setup()

    async def async_will_remove_from_hass(self) -> None:
        """Called when entity is being removed from hass."""
        await super().async_will_remove_from_hass()
        
        # Cleanup group manager
        if self._group_manager:
            self._group_manager.cleanup()
            self._group_manager = None
    
    def _is_empty(self) -> bool:
        """Check if the group has no members."""
        return len(self._entity_ids) == 0
    
    async def _async_remove_self(self) -> None:
        """Remove this entity from Home Assistant."""
        _LOGGER.info(
            f"No presence entities remaining for {self._area_name} - removing binary sensor entity"
        )
        await self.async_remove(force_remove=True)
    
    async def _async_refresh_entity_list(self) -> None:
        """
        Refresh the list of presence entities for this area.
        
        This is called when new entities are added to Home Assistant,
        ensuring MQTT and other late-loading entities are included.
        
        GroupManager handles automatic removal if the list becomes empty.
        """
        try:
            area_manager = self.hass.data[DOMAIN][self._entry_id].get("area_manager")
            if not area_manager:
                return
            
            from homeassistant.config_entries import ConfigEntry
            
            # Get config entry to access presence detection config
            entry = None
            for config_entry in self.hass.config_entries.async_entries(DOMAIN):
                if config_entry.entry_id == self._entry_id:
                    entry = config_entry
                    break
            
            if not entry:
                return
            
            # Get updated list of presence entities
            new_entity_ids = await _async_get_presence_entities(
                self.hass, entry, area_manager, self._area_id
            )
            
            # Only update if the list has changed
            if set(new_entity_ids) != set(self._entity_ids):
                old_count = len(self._entity_ids)
                self._entity_ids = new_entity_ids
                
                _LOGGER.info(
                    f"Updated presence detection entities for {self._area_name}: "
                    f"{old_count} → {len(new_entity_ids)} entities"
                )
                
                # Update the group state with new entity list
                # Note: GroupManager will handle removal if list is now empty
                self.async_update_group_state()
                self.async_write_ha_state()
        
        except Exception as err:
            _LOGGER.error(
                f"Failed to refresh entity list for {self._area_name}: {err}",
                exc_info=True
            )

    @callback
    def async_update_group_state(self) -> None:
        """
        Update the group state based on member entities.

        This is called automatically by GroupEntity when any member entity changes state.
        
        Logic:
        - Group is ON if ANY member entity is ON
        - Group is OFF if ALL member entities are OFF
        - Group is UNAVAILABLE if ALL member entities are UNAVAILABLE
        """
        from homeassistant.const import STATE_UNAVAILABLE, STATE_UNKNOWN
        
        # Get states of all member entities
        states = []
        active_entities = []
        detection_sources = {
            "motion": False,
            "presence": False,
            "occupancy": False,
            "media": False,
        }
        
        for entity_id in self._entity_ids:
            state = self.hass.states.get(entity_id)
            if state is not None:
                states.append(state.state)
                
                # Track which entity is active
                if state.state in (STATE_ON, "playing"):
                    active_entities.append(entity_id)
                    
                    # Determine detection source type
                    device_class = state.attributes.get("device_class")
                    if device_class in ["motion", "presence", "occupancy"]:
                        detection_sources[device_class] = True
                    elif entity_id.startswith("media_player."):
                        detection_sources["media"] = True

        # If no states found, set as unavailable
        if not states:
            self._attr_available = False
            self._attr_is_on = False
            self._attr_icon = "mdi:home-outline"
            return

        # Group is available if at least one member is available
        available_states = [s for s in states if s not in (STATE_UNAVAILABLE, STATE_UNKNOWN)]
        self._attr_available = len(available_states) > 0

        # Group is ON if ANY member is ON (any() logic)
        is_occupied = any(state in (STATE_ON, "playing") for state in states)
        self._attr_is_on = is_occupied

        # Update icon based on state
        if is_occupied:
            self._attr_icon = "mdi:home-account"  # Occupied icon
        else:
            self._attr_icon = "mdi:home-outline"  # Empty icon

        # Get additional context from area_manager
        area_manager = self.hass.data[DOMAIN][self._entry_id].get("area_manager")
        detection_config = {}
        last_change_timestamp = None
        
        if area_manager:
            detection_config = area_manager._get_presence_detection_config()
            
            # Get last state change from most recent active entity
            if active_entities:
                for entity_id in active_entities:
                    state = self.hass.states.get(entity_id)
                    if state and state.last_changed:
                        if last_change_timestamp is None or state.last_changed > last_change_timestamp:
                            last_change_timestamp = state.last_changed

        # Build attributes with enhanced information
        self._attr_extra_state_attributes = {
            ATTR_ENTITY_ID: self._entity_ids,  # All tracked entities
            "active_entities": active_entities,  # Currently active entities
            "detection_sources": detection_sources,  # Which types are active
            "detection_config": detection_config,  # User configuration
            "entity_count": len(self._entity_ids),  # Total entities tracked
            "active_count": len(active_entities),  # Number of active entities
            "last_detected": last_change_timestamp.isoformat() if last_change_timestamp else None,
        }

