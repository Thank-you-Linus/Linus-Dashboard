"""
Event Listener for Linus Brain

This module listens to Home Assistant state changes for relevant entities
and triggers immediate updates to Supabase when changes occur.

Key responsibilities:
- Register state change listeners for monitored entities
- Filter events by domain and device class
- Trigger coordinator updates for affected areas
- Handle listener lifecycle (start/stop)
"""

import asyncio
import logging
from typing import TYPE_CHECKING, Any, Callable

from homeassistant.const import EVENT_STATE_CHANGED
from homeassistant.core import Event, HomeAssistant, State, callback, split_entity_id

from .state_validator import is_state_valid
from .timeout_manager import TimeoutManager

if TYPE_CHECKING:
    from ..coordinator import LinusBrainCoordinator
    from .light_learning import LightLearning

# Type alias for JSON-like dictionaries (stats, debug info, etc.)
JsonDict = dict[str, Any]

_LOGGER = logging.getLogger(__name__)

# Device classes to monitor (for binary_sensor and sensor)
MONITORED_DEVICE_CLASSES = ["motion", "presence", "occupancy", "illuminance"]


class EventListener:
    """
    Listens to entity state changes and triggers updates.

    This class:
    - Monitors state changes for relevant entities
    - Determines which area is affected
    - Triggers immediate data sync for that area
    - Prevents unnecessary updates (debouncing)
    """

    def __init__(
        self,
        hass: HomeAssistant,
        coordinator: "LinusBrainCoordinator",
        light_learning: "LightLearning | None" = None,
    ) -> None:
        """
        Initialize the event listener.

        Args:
            hass: Home Assistant instance
            coordinator: LinusBrainCoordinator instance
            light_learning: Optional LightLearning instance for capturing manual light actions
        """
        self.hass = hass
        self.coordinator = coordinator
        self.light_learning = light_learning
        self._listeners: list[Callable[[], None]] = []
        self._last_update_times: dict[str, float] = {}

        # Use TimeoutManager for debouncing area updates
        self._debounce_manager = TimeoutManager(
            logger=_LOGGER, logger_prefix="[DEBOUNCE]"
        )

        self._debounce_interval = 5.0

    def _should_process_entity(self, entity_id: str, state: State) -> bool:
        """
        Determine if an entity should be processed based on domain and device class.

        Args:
            entity_id: The entity ID
            state: The entity's state object

        Returns:
            True if entity should be processed, False otherwise
        """
        from homeassistant.helpers import entity_registry as er
        from .area_manager import get_monitored_domains

        domain = split_entity_id(entity_id)[0]

        # IMPORTANT: Ignore Linus Brain's own entities to prevent feedback loops
        # Our sensors (context, insights, stats, etc.) should not trigger area updates
        if entity_id.startswith("sensor.linus_brain_") or entity_id.startswith(
            "switch.linus_brain_"
        ):
            return False

        # Get dynamic monitored domains (includes base + activity detection_conditions)
        monitored_domains = get_monitored_domains()

        # Check if domain is monitored
        if domain not in monitored_domains:
            return False

        # For media_player and light, always process
        if domain in ("media_player", "light"):
            return True

        # Try to get device_class from state attributes first, then from entity_registry
        device_class = state.attributes.get("original_device_class") or state.attributes.get("device_class")
        
        # If no device_class in state, check entity_registry (for entities with original_device_class set)
        if not device_class:
            ent_reg = er.async_get(self.hass)
            entity_entry = ent_reg.async_get(entity_id)
            if entity_entry:
                device_class = entity_entry.original_device_class or entity_entry.device_class

        if device_class in MONITORED_DEVICE_CLASSES:
            return True

        return False

    async def _deferred_area_update(self, area: str) -> None:
        """
        Execute a deferred update for an area.

        Args:
            area: The area ID
        """
        _LOGGER.debug(f"Executing deferred update for area {area}")
        await self.coordinator.async_send_area_update(area)

    def _should_debounce(self, area: str, entity_id: str, new_state: State) -> bool:
        """
        Check if an update for an area should be debounced.

        If debouncing is needed, schedules a deferred update that will be automatically
        cancelled and rescheduled if more events arrive.

        Special handling: Motion/presence sensors turning OFF are never debounced,
        as this is a critical event that triggers activity transitions.

        Args:
            area: The area ID
            entity_id: The entity that changed
            new_state: The new state of the entity

        Returns:
            True if update should be deferred (debounced), False if should process now
        """
        import time

        # Skip invalid states
        if not is_state_valid(new_state):
            _LOGGER.debug(
                f"Skipping debounce check for {entity_id} with invalid state: {new_state.state}"
            )
            return True  # Debounce (skip) invalid states

        domain = split_entity_id(entity_id)[0]
        device_class = new_state.attributes.get(
            "original_device_class"
        ) or new_state.attributes.get("device_class")

        if domain == "binary_sensor" and device_class in (
            "motion",
            "presence",
            "occupancy",
        ):
            if new_state.state == "off":
                _LOGGER.debug(
                    f"Sensor {entity_id} OFF, bypassing debounce"
                )
                self._last_update_times[area] = time.time()
                self._debounce_manager.cancel(area)
                return False

            if new_state.state == "on":
                current_activity = self.coordinator.get_area_activity(area)
                if current_activity == "inactive":
                    _LOGGER.debug(
                        f"Sensor {entity_id} ON while inactive, bypassing debounce"
                    )
                    self._last_update_times[area] = time.time()
                    self._debounce_manager.cancel(area)
                    return False

        current_time = time.time()
        last_update = self._last_update_times.get(area, 0)

        if current_time - last_update < self._debounce_interval:
            # Schedule deferred update using TimeoutManager
            # This automatically cancels and replaces any existing pending update
            _LOGGER.debug(f"Scheduling deferred update for area {area}")
            self._debounce_manager.schedule(
                key=area,
                delay=self._debounce_interval,
                callback=self._deferred_area_update,
                area=area,
            )
            return True

        self._last_update_times[area] = current_time
        return False

    @callback
    def _async_state_changed_listener(self, event: Event[Any]) -> None:
        """
        Handle state change events.

        This callback is invoked whenever a monitored entity changes state.
        It determines the affected area and triggers an update.

        Args:
            event: The state change event
        """
        entity_id = event.data.get("entity_id")
        new_state = event.data.get("new_state")
        old_state = event.data.get("old_state")

        if not new_state or not entity_id:
            return

        # Ignore transitions FROM invalid states (startup restoration)
        # This prevents triggering rules when HA restores states from storage
        if old_state and not is_state_valid(old_state):
            _LOGGER.debug(
                f"Ignoring {entity_id}: transition from invalid state "
                f"({old_state.state} -> {new_state.state})"
            )
            return

        if not self._should_process_entity(entity_id, new_state):
            return

        if old_state and old_state.state == new_state.state:
            return

        _LOGGER.debug(
            f"State changed for {entity_id}: {old_state.state if old_state else 'unknown'} -> {new_state.state}"
        )

        domain = split_entity_id(entity_id)[0]

        if domain == "light" and self.light_learning:
            task = self.hass.async_create_task(
                self.light_learning.capture_light_action(
                    entity_id, new_state, old_state, event.context
                )
            )
            task.add_done_callback(self._handle_task_exception)
            return

        area = self.coordinator.area_manager.get_entity_area(entity_id)

        if not area:
            # Get device class for logging
            device_class = new_state.attributes.get("device_class") or new_state.attributes.get("original_device_class")
            
            _LOGGER.debug(
                f"Entity {entity_id} (device_class={device_class}) has no associated area, skipping"
            )
            return

        if self._should_debounce(area, entity_id, new_state):
            _LOGGER.debug(
                f"Debouncing update for area {area} from {entity_id}"
            )
            return

        _LOGGER.debug(
            f"Triggering update for area {area} from {entity_id} (state={new_state.state})"
        )

        task = self.hass.async_create_task(
            self.coordinator.async_send_area_update(area)
        )
        task.add_done_callback(self._handle_task_exception)

    def _handle_task_exception(self, task: asyncio.Task[Any]) -> None:
        try:
            task.result()
        except asyncio.CancelledError:
            _LOGGER.debug("Task was cancelled")
        except Exception as err:
            _LOGGER.error(f"Task raised exception: {err}", exc_info=True)

    async def async_start_listening(self) -> None:
        """
        Start listening to state changes.

        This registers the event listener with Home Assistant's event bus.
        """
        _LOGGER.info("Starting event listener for Linus Brain")

        # Listen to all state changes and filter in the callback
        # This is more efficient than subscribing to individual entities
        remove_listener = self.hass.bus.async_listen(
            EVENT_STATE_CHANGED, self._async_state_changed_listener
        )

        self._listeners.append(remove_listener)

        # Log monitored entities summary
        from homeassistant.helpers import entity_registry as er
        from .area_manager import get_monitored_domains
        
        monitored_domains = get_monitored_domains()
        ent_reg = er.async_get(self.hass)
        
        monitored_entities = []
        
        for state in self.hass.states.async_all():
            entity_id = state.entity_id
            
            # Skip Linus Brain's own entities
            if entity_id.startswith("sensor.linus_brain_") or entity_id.startswith("switch.linus_brain_"):
                continue
                
            domain = split_entity_id(entity_id)[0]
            
            # Check if domain is monitored
            if domain not in monitored_domains:
                continue
            
            # Check if would be processed
            if self._should_process_entity(entity_id, state):
                area = self.coordinator.area_manager.get_entity_area(entity_id)
                if area:
                    device_class = state.attributes.get("original_device_class") or state.attributes.get("device_class")
                    if not device_class:
                        entity_entry = ent_reg.async_get(entity_id)
                        if entity_entry:
                            device_class = entity_entry.original_device_class or entity_entry.device_class
                    
                    monitored_entities.append({
                        "entity_id": entity_id,
                        "domain": domain,
                        "device_class": device_class,
                        "area": area
                    })
        
        # Log summary by area
        by_area: dict[str, list[JsonDict]] = {}
        for entity_info in monitored_entities:
            area = entity_info["area"]
            # Type guard: area should always be a string from entity_info
            if not isinstance(area, str):
                continue
            if area not in by_area:
                by_area[area] = []
            by_area[area].append(entity_info)
        
        _LOGGER.info(f"Monitoring {len(monitored_entities)} entities across {len(by_area)} areas")
        for area, entities in sorted(by_area.items()):
            _LOGGER.debug(f"  {area}: {len(entities)} entities")

        _LOGGER.info("Event listener started successfully")

    async def async_stop_listening(self) -> None:
        """
        Stop listening to state changes.

        This is called during integration unload to clean up listeners.
        """
        _LOGGER.info("Stopping event listener for Linus Brain")

        # Remove all registered listeners
        for remove_listener in self._listeners:
            remove_listener()

        self._listeners.clear()
        self._last_update_times.clear()

        # Cancel any pending deferred updates
        cancelled_count = self._debounce_manager.cancel_all()
        if cancelled_count > 0:
            _LOGGER.debug(f"Cancelled {cancelled_count} pending debounced updates")

        _LOGGER.info("Event listener stopped successfully")

    def get_stats(self) -> JsonDict:
        """
        Get statistics about the event listener.

        Returns:
            Dictionary with listener statistics
        """
        return {
            "active_listeners": len(self._listeners),
            "monitored_areas": len(self._last_update_times),
            "debounce_interval": self._debounce_interval,
        }
