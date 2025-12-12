"""
Dynamic Entity Manager for Linus Brain.

Provides reusable logic for platforms that need to dynamically create entities
when prerequisite entities (like presence sensors) become available.

This utility solves the race condition where MQTT/Zigbee sensors load after
platform setup, causing Linus Brain entities to not be created.

Pattern:
1. Setup phase: Create entities for areas with prerequisites already present
2. Post-startup refresh: After HA starts + delay, check for newly loaded entities
3. Entity registry listener: React to new prerequisite entities being created

Used by:
- binary_sensor.py (PresenceDetectionBinarySensor)
- sensor.py (LinusAreaContextSensor, LinusInsightSensor)
- light.py (AreaLightGroup) - already has its own implementation
"""
import asyncio
import inspect
import logging
from collections.abc import Awaitable, Callable
from typing import Any

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import async_call_later

_LOGGER = logging.getLogger(__name__)


class DynamicEntityManager:
    """
    Manages dynamic entity creation based on prerequisite entities.
    
    This manager handles:
    1. Tracking which areas have entities created
    2. Listening for new prerequisite entities (e.g., presence sensors)
    3. Creating new entities when prerequisites become available
    4. Post-startup refresh to catch late-loading integrations
    
    Example:
        # In binary_sensor.py async_setup_entry()
        manager = DynamicEntityManager(
            hass=hass,
            entry=entry,
            async_add_entities=async_add_entities,
            platform_name="presence_detection",
            monitored_domains=["binary_sensor", "media_player"],
            monitored_device_classes=["motion", "presence", "occupancy"],
            should_create_for_area_callback=lambda area_id: area_manager.has_presence_detection(area_id),
            create_entities_callback=lambda area_id: [create_my_sensor(area_id)],
        )
        await manager.async_setup()
    """
    
    def __init__(
        self,
        hass: HomeAssistant,
        entry: Any,  # ConfigEntry
        async_add_entities: AddEntitiesCallback,
        platform_name: str,
        monitored_domains: list[str],
        monitored_device_classes: list[str] | None,
        should_create_for_area_callback: Callable[[str], Awaitable[bool] | bool],
        create_entities_callback: Callable[[str, str], Awaitable[list[Any]] | list[Any]],
        startup_delay: float = 2.0,
    ) -> None:
        """
        Initialize the dynamic entity manager.
        
        Args:
            hass: Home Assistant instance
            entry: Config entry
            async_add_entities: Callback to add entities to HA
            platform_name: Name for logging (e.g., "presence_detection")
            monitored_domains: Entity domains to monitor (e.g., ["binary_sensor", "media_player"])
            monitored_device_classes: Device classes to monitor (e.g., ["motion", "presence"])
                                     None means monitor all entities in monitored_domains
            should_create_for_area_callback: Function that checks if area meets prerequisites
                                            Args: (area_id) -> bool
            create_entities_callback: Function that creates entities for an area
                                     Args: (area_id, area_name) -> list[Entity]
            startup_delay: Seconds to wait after HA startup before refresh (default 2.0)
        """
        self.hass = hass
        self.entry = entry
        self._async_add_entities = async_add_entities
        self._platform_name = platform_name
        self._monitored_domains = monitored_domains
        self._monitored_device_classes = monitored_device_classes or []
        self._should_create_for_area = should_create_for_area_callback
        self._create_entities_for_area = create_entities_callback
        self._startup_delay = startup_delay
        
        # Track which areas have entities created
        self._tracked_areas: set[str] = set()
        
        # Startup state
        self._startup_complete = hass.is_running
        
        # Listener unsubscribe handles
        self._unsub_registry: Callable[[], None] | None = None
        self._unsub_startup: Callable[[], None] | None = None
    
    def mark_area_tracked(self, area_id: str) -> None:
        """Mark an area as having entities created."""
        self._tracked_areas.add(area_id)
    
    def is_area_tracked(self, area_id: str) -> bool:
        """Check if an area already has entities created."""
        return area_id in self._tracked_areas
    
    async def async_setup(self) -> None:
        """
        Set up the manager and register listeners.
        
        Call this at the end of platform's async_setup_entry().
        """
        # Handle post-startup refresh
        if self._startup_complete:
            # HA already running (reload case)
            _LOGGER.debug(
                "%s: HA running, skipping post-startup refresh",
                self._platform_name
            )
        else:
            # HA starting - schedule post-startup refresh
            @callback
            def _ha_started(_event):
                """Refresh after HA fully started."""
                _LOGGER.debug(
                    "%s: HA started, scheduling refresh in %.1fs for late-loading integrations",
                    self._platform_name,
                    self._startup_delay,
                )
                
                async def _delayed_refresh(_now):
                    """Execute refresh after delay."""
                    self._startup_complete = True
                    await self._async_refresh_all_areas()
                
                async_call_later(self.hass, self._startup_delay, _delayed_refresh)
            
            self._unsub_startup = self.hass.bus.async_listen_once(
                EVENT_HOMEASSISTANT_STARTED,
                _ha_started,
            )
        
        # Register entity registry listener
        @callback
        def _entity_registry_updated(event: Event) -> None:
            """Handle entity registry updates with filtering."""
            # Skip processing until startup is complete
            if not self._startup_complete:
                return
            
            action = event.data.get("action")
            entity_id = event.data.get("entity_id")
            
            # Only care about "create" actions
            if action != "create":
                return
            
            if not entity_id:
                return
            
            # Check if this is a monitored entity
            if not self._is_monitored_entity(entity_id):
                return
            
            # Get area for this entity
            entity_reg = er.async_get(self.hass)
            entity_entry = entity_reg.async_get(entity_id)
            if not entity_entry:
                return
            
            area_id = self._get_entity_area(entity_entry)
            if not area_id:
                return
            
            _LOGGER.debug(
                "%s: New monitored entity %s detected in area %s",
                self._platform_name,
                entity_id,
                area_id,
            )
            
            # Check if this area already has entities
            if self.is_area_tracked(area_id):
                _LOGGER.debug(
                    "%s: Area %s already tracked, entity will be picked up by group refresh",
                    self._platform_name,
                    area_id,
                )
                return
            
            # Create entities for this area
            self.hass.async_create_task(
                self._async_create_entities_for_area(area_id)
            )
        
        self._unsub_registry = self.hass.bus.async_listen(
            "entity_registry_updated",  # type: ignore[arg-type]
            _entity_registry_updated,
        )
        
        self.entry.async_on_unload(self._unsub_registry)
        if self._unsub_startup:
            self.entry.async_on_unload(self._unsub_startup)
        
        _LOGGER.info(
            "%s: Dynamic entity manager setup complete (monitoring %s)",
            self._platform_name,
            self._monitored_domains,
        )
    
    def _is_monitored_entity(self, entity_id: str) -> bool:
        """Check if entity should be monitored."""
        domain = entity_id.split(".")[0]
        
        # Check domain
        if domain not in self._monitored_domains:
            return False
        
        # If no device classes specified, monitor all entities in domain
        if not self._monitored_device_classes:
            return True
        
        # Check device class
        entity_reg = er.async_get(self.hass)
        entity_entry = entity_reg.async_get(entity_id)
        if not entity_entry:
            return False
        
        device_class = entity_entry.device_class
        return device_class in self._monitored_device_classes
    
    def _get_entity_area(self, entity_entry: er.RegistryEntry) -> str | None:
        """Get area_id for an entity."""
        from homeassistant.helpers import device_registry as dr
        
        area_id = entity_entry.area_id
        
        # If no direct area, check device
        if not area_id and entity_entry.device_id:
            device_reg = dr.async_get(self.hass)
            device = device_reg.async_get(entity_entry.device_id)
            if device and device.area_id:
                area_id = device.area_id
        
        return area_id
    
    async def _async_refresh_all_areas(self) -> None:
        """Check all areas and create entities for areas with prerequisites."""
        area_reg = ar.async_get(self.hass)
        created_count = 0
        
        for area in area_reg.async_list_areas():
            area_id = area.id
            
            # Skip if already tracked
            if self.is_area_tracked(area_id):
                continue
            
            # Check if prerequisites met
            result = self._should_create_for_area(area_id)
            if inspect.iscoroutine(result):
                should_create = await result
            else:
                should_create = result
            
            if not should_create:
                continue
            
            # Create entities
            entities = await self._async_create_entities_for_area(area_id)
            created_count += len(entities) if entities else 0
        
        if created_count > 0:
            _LOGGER.info(
                "%s: Post-startup refresh created %d entities",
                self._platform_name,
                created_count,
            )
        else:
            _LOGGER.debug(
                "%s: Post-startup refresh - no new entities needed",
                self._platform_name,
            )
    
    async def _async_create_entities_for_area(self, area_id: str) -> list[Any]:
        """Create entities for an area if prerequisites are met."""
        # Get area name
        area_reg = ar.async_get(self.hass)
        area = area_reg.async_get_area(area_id)
        if not area:
            _LOGGER.warning(
                "%s: Area %s not found in registry",
                self._platform_name,
                area_id,
            )
            return []
        
        # Check prerequisites
        result = self._should_create_for_area(area_id)
        if inspect.iscoroutine(result):
            should_create = await result
        else:
            should_create = result
        
        if not should_create:
            _LOGGER.debug(
                "%s: Prerequisites not met for area %s",
                self._platform_name,
                area.name,
            )
            return []
        
        # Create entities
        entities_result = self._create_entities_for_area(area_id, area.name)
        if inspect.iscoroutine(entities_result):
            entities = await entities_result
        else:
            entities = entities_result
        
        # Ensure we have a list
        if not isinstance(entities, list):
            _LOGGER.error(
                "%s: create_entities_callback returned non-list: %s",
                self._platform_name,
                type(entities),
            )
            return []
        
        if not entities:
            _LOGGER.warning(
                "%s: Failed to create entities for area %s",
                self._platform_name,
                area.name,
            )
            return []
        
        # Mark as tracked
        self.mark_area_tracked(area_id)
        
        # Add entities
        self._async_add_entities(entities)
        
        _LOGGER.info(
            "%s: Created %d entities for area '%s'",
            self._platform_name,
            len(entities),
            area.name,
        )
        
        return entities
