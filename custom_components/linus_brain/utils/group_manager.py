"""
Group Entity Manager for Linus Brain.

This utility provides reusable logic for managing group entities that:
1. Wait for HA startup before processing (MQTT entities)
2. Filter entity registry events intelligently
3. Refresh member lists dynamically
4. Handle automatic entity removal when groups become empty
5. Provides extensible base for shared group logic

Used by:
- binary_sensor.py (PresenceDetectionBinarySensor)
- light.py (AreaLightGroup)
"""
import logging
from collections.abc import Awaitable, Callable
from typing import Any

from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.event import async_call_later

_LOGGER = logging.getLogger(__name__)


class GroupManager:
    """
    Manages startup timing and event filtering for group entities.
    
    This class handles:
    1. Waiting for EVENT_HOMEASSISTANT_STARTED + buffer
    2. Filtering entity registry events by domain and changes
    3. Triggering refresh callbacks when appropriate
    
    Two usage patterns:
    - Per-entity: Each group entity creates its own manager
    - Platform-level: Single manager for all groups with manual filtering
    """
    
    def __init__(
        self,
        hass: HomeAssistant,
        refresh_callback: Callable[[], Awaitable[None]],
        monitored_domains: list[str],
        startup_delay: float = 2.0,
        log_prefix: str = "GroupManager",
        removal_callback: Callable[[], Awaitable[None]] | None = None,
        check_empty_callback: Callable[[], bool] | None = None,
    ) -> None:
        """
        Initialize the group refresh manager.
        
        Args:
            hass: Home Assistant instance
            refresh_callback: Async function to call when refresh needed
            monitored_domains: List of entity domains to monitor (e.g., ["binary_sensor", "media_player"])
            startup_delay: Seconds to wait after HA startup (default 2.0 for MQTT)
            log_prefix: Prefix for log messages
            removal_callback: Optional async function to call when group should be removed
            check_empty_callback: Optional function to check if group is empty (returns True if empty)
        """
        self.hass = hass
        self._refresh_callback = refresh_callback
        self._monitored_domains = monitored_domains
        self._startup_delay = startup_delay
        self._log_prefix = log_prefix
        self._removal_callback = removal_callback
        self._check_empty_callback = check_empty_callback
        
        # Startup state
        self._startup_complete = hass.is_running
        
        # Listener unsubscribe handles
        self._unsub_registry: Callable[[], None] | None = None
        self._unsub_startup: Callable[[], None] | None = None
    
    async def async_setup(self) -> None:
        """
        Set up the manager and register listeners.
        
        Call this in async_added_to_hass() or async_setup_entry().
        """
        # Handle startup refresh
        if self._startup_complete:
            # HA already running (reload case)
            _LOGGER.debug("%s: HA running, refreshing immediately", self._log_prefix)
            await self._async_refresh()
        else:
            # HA starting - wait for EVENT_HOMEASSISTANT_STARTED
            @callback
            def _ha_started(_event):
                """Refresh after HA fully started."""
                _LOGGER.debug(
                    "%s: HA started, scheduling refresh in %.1fs",
                    self._log_prefix,
                    self._startup_delay,
                )
                
                async def _delayed_refresh(_now):
                    """Execute refresh after delay."""
                    self._startup_complete = True
                    await self._async_refresh()
                
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
            if action != "update":
                return
            
            entity_id = event.data.get("entity_id")
            if not entity_id:
                return
            
            # Check if area-related field changed
            changes = event.data.get("changes", {})
            if "area_id" not in changes and "device_id" not in changes:
                return
            
            # Check if monitored domain
            domain = entity_id.split(".")[0]
            if domain not in self._monitored_domains:
                return
            
            # Trigger refresh
            _LOGGER.info(
                "%s: Entity %s area changed, triggering refresh",
                self._log_prefix,
                entity_id,
            )
            self.hass.async_create_task(self._async_refresh())
        
        self._unsub_registry = self.hass.bus.async_listen(
            "entity_registry_updated",  # type: ignore[arg-type]
            _entity_registry_updated,
        )
        
        _LOGGER.debug("%s: Setup complete", self._log_prefix)
    
    async def _async_refresh(self) -> None:
        """Execute the refresh callback and check if removal is needed."""
        try:
            await self._refresh_callback()
            
            # After refresh, check if group is now empty and should be removed
            if self._check_empty_callback and self._removal_callback:
                if self._check_empty_callback():
                    _LOGGER.info("%s: Group is empty, triggering removal", self._log_prefix)
                    await self._removal_callback()
        except Exception as err:
            _LOGGER.error(
                "%s: Failed to refresh: %s",
                self._log_prefix,
                err,
                exc_info=True,
            )
    
    def cleanup(self) -> None:
        """
        Clean up listeners.
        
        Call this in async_will_remove_from_hass().
        """
        if self._unsub_registry:
            self._unsub_registry()
            self._unsub_registry = None
        
        if self._unsub_startup:
            self._unsub_startup()
            self._unsub_startup = None


class PlatformGroupManager:
    """
    Platform-level manager for managing multiple group entities.
    
    Similar to GroupManager but designed for platform-level registration
    where a single listener manages multiple groups.
    
    Usage:
    - Create one instance in async_setup_entry()
    - Provide a callback that determines which groups to refresh
    - Cleanup is handled via entry.async_on_unload()
    """
    
    def __init__(
        self,
        hass: HomeAssistant,
        monitored_domains: list[str],
        startup_delay: float = 2.0,
    ) -> None:
        """
        Initialize the platform-level refresh manager.
        
        Args:
            hass: Home Assistant instance
            monitored_domains: List of entity domains to monitor
            startup_delay: Seconds to wait after HA startup
        """
        self.hass = hass
        self._monitored_domains = monitored_domains
        self._startup_delay = startup_delay
        
        # Startup state
        self._startup_complete = hass.is_running
        
        # Callbacks registered by platform
        self._startup_callback: Callable[[], Awaitable[None]] | None = None
        self._update_callback: Callable[[str, dict[str, Any]], Awaitable[None]] | None = None
    
    def register_callbacks(
        self,
        startup_callback: Callable[[], Awaitable[None]],
        update_callback: Callable[[str, dict[str, Any]], Awaitable[None]],
    ) -> None:
        """
        Register callbacks for startup and updates.
        
        Args:
            startup_callback: Called after HA startup + delay
            update_callback: Called when entity area changes (entity_id, changes)
        """
        self._startup_callback = startup_callback
        self._update_callback = update_callback
    
    def setup_listeners(self) -> tuple[Callable[[], None], ...]:
        """
        Set up event listeners.
        
        Returns:
            Tuple of unsubscribe functions to register with entry.async_on_unload()
        """
        unsubs = []
        
        # Startup handler
        if not self._startup_complete:
            @callback
            def _ha_started(_event):
                """Handle HA startup."""
                _LOGGER.debug(
                    "PlatformGroupManager: HA started, scheduling refresh in %.1fs",
                    self._startup_delay,
                )
                
                async def _delayed_refresh(_now):
                    """Execute refresh after delay."""
                    self._startup_complete = True
                    if self._startup_callback:
                        await self._startup_callback()
                
                async_call_later(self.hass, self._startup_delay, _delayed_refresh)
            
            unsubs.append(
                self.hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _ha_started)
            )
        else:
            _LOGGER.debug("PlatformGroupManager: HA already running")
        
        # Entity registry listener
        @callback
        def _entity_registry_updated(event: Event) -> None:
            """Handle entity registry updates."""
            # Skip processing until startup is complete
            if not self._startup_complete:
                return
            
            action = event.data.get("action")
            if action != "update":
                return
            
            entity_id = event.data.get("entity_id")
            if not entity_id:
                return
            
            # Check if area-related field changed
            changes = event.data.get("changes", {})
            if "area_id" not in changes and "device_id" not in changes:
                return
            
            # Check if monitored domain
            domain = entity_id.split(".")[0]
            if domain not in self._monitored_domains:
                return
            
            # Trigger update callback
            if self._update_callback:
                _LOGGER.debug(
                    "PlatformGroupManager: Entity %s area changed",
                    entity_id,
                )
                # Ensure we create a coroutine for async_create_task
                coro = self._update_callback(entity_id, changes)
                self.hass.async_create_task(coro)  # type: ignore[arg-type]
        
        unsubs.append(
            self.hass.bus.async_listen(
                "entity_registry_updated",  # type: ignore[arg-type]
                _entity_registry_updated,
            )
        )
        
        return tuple(unsubs)
