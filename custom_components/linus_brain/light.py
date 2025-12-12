"""
Light platform for Linus Brain integration.

This module creates smart light groups for each area in Home Assistant.
Light groups:
- Aggregate all lights in an area
- Update dynamically when lights are added/removed/moved
- Provide smart filtering (only adjust ON lights when changing brightness/color)
- Support all light features (brightness, color, effects)
- Automatically removed when no lights remain in an area
"""
import asyncio
import logging
from typing import Any

from homeassistant.components.light import (
    ATTR_BRIGHTNESS,
    ATTR_COLOR_TEMP_KELVIN,
    ATTR_EFFECT,
    ATTR_EFFECT_LIST,
    ATTR_HS_COLOR,
    ATTR_RGB_COLOR,
    ATTR_RGBW_COLOR,
    ATTR_RGBWW_COLOR,
    ATTR_WHITE,
    LightEntity,
)
from homeassistant.components.light.const import (
    ColorMode,
    LightEntityFeature,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import (
    EVENT_HOMEASSISTANT_STARTED,
    EVENT_STATE_CHANGED,
    STATE_ON,
    STATE_UNAVAILABLE,
)
from homeassistant.core import Event, HomeAssistant, callback
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.event import EventStateChangedData, async_call_later

from .const import DOMAIN, get_area_device_info

_LOGGER = logging.getLogger(__name__)

# Global registry of light groups (keyed by area_id)
# This is populated in async_setup_entry and used by the event listener
_LIGHT_GROUPS: dict[str, "AreaLightGroup"] = {}


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """
    Set up Linus Brain light groups from a config entry.
    
    Uses PlatformGroupManager to handle startup and area change detection.
    """
    from .utils.group_manager import PlatformGroupManager
    
    # Get registries
    entity_reg = er.async_get(hass)
    device_reg = dr.async_get(hass)
    area_reg = ar.async_get(hass)

    # Helper function to get area_id for a light entity
    def _get_light_area_id(entity_entry: er.RegistryEntry) -> str | None:
        """Get area_id for a light entity."""
        area_id = entity_entry.area_id
        
        # If no direct area, check device
        if not area_id and entity_entry.device_id:
            device = device_reg.async_get(entity_entry.device_id)
            if device and device.area_id:
                area_id = device.area_id
        
        return area_id

    # Helper function to rebuild light list for an area
    def _rebuild_area_lights(area_id: str) -> list[str]:
        """Rebuild the list of lights for an area."""
        lights = []
        
        for entity_id, entity_entry in entity_reg.entities.items():
            # Check if light domain
            if entity_entry.domain != "light":
                continue

            # Skip disabled entities
            if entity_entry.disabled:
                continue

            # Skip Linus Brain's own entities
            if entity_id.startswith(f"light.{DOMAIN}_"):
                continue

            # Check if this light belongs to the area
            light_area_id = _get_light_area_id(entity_entry)
            if light_area_id == area_id:
                lights.append(entity_id)
        
        return lights
    
    def _async_remove_light_group(area_id: str, reason: str = "") -> None:
        """
        Remove a light group when it becomes empty.
        
        Args:
            area_id: Area ID of the group to remove
            reason: Optional reason for logging
        """
        if area_id not in _LIGHT_GROUPS:
            return
        
        group = _LIGHT_GROUPS.pop(area_id)
        
        log_msg = f"No lights remaining in area {area_id}"
        if reason:
            log_msg += f" ({reason})"
        log_msg += " - removing group entity"
        
        _LOGGER.info(log_msg)
        hass.async_create_task(group.async_remove(force_remove=True))

    # Group lights by area initially
    lights_by_area: dict[str, list[str]] = {}

    for entity_id, entity_entry in entity_reg.entities.items():
        # Check if light domain
        if entity_entry.domain != "light":
            continue

        # Skip disabled entities
        if entity_entry.disabled:
            continue

        # Skip Linus Brain's own entities to avoid recursion
        if entity_id.startswith(f"light.{DOMAIN}_"):
            continue

        # Get area_id
        area_id = _get_light_area_id(entity_entry)
        if area_id:
            lights_by_area.setdefault(area_id, []).append(entity_id)

    # Create light groups
    entities = []
    for area_id, light_ids in lights_by_area.items():
        if len(light_ids) == 0:
            continue

        area = area_reg.async_get_area(area_id)
        if not area:
            continue

        _LOGGER.debug(
            "Creating light group for area '%s' with %d lights: %s",
            area.name,
            len(light_ids),
            light_ids,
        )

        group = AreaLightGroup(
            entry.entry_id,
            area_id,
            area.name,
            light_ids,
        )
        
        entities.append(group)
        _LIGHT_GROUPS[area_id] = group

    if entities:
        async_add_entities(entities)
        _LOGGER.info("Created %d area light groups", len(entities))
    
    # Flag to prevent processing during startup period
    _startup_complete = not hass.is_running
    
    # Schedule post-startup refresh for MQTT entities
    if not hass.is_running:
        async def _ha_started(_event):
            """Refresh all light groups after HA fully started."""
            _LOGGER.debug("HA started, scheduling light groups refresh in 2s for MQTT entities")
            
            async def _delayed_refresh(_now):
                """Execute refresh after delay."""
                nonlocal _startup_complete
                _startup_complete = True
                
                # Refresh all light groups
                for area_id, group in _LIGHT_GROUPS.items():
                    new_lights = _rebuild_area_lights(area_id)
                    if set(new_lights) != set(group._light_entity_ids):
                        old_count = len(group._light_entity_ids)
                        group.update_members(new_lights)
                        _LOGGER.info(
                            "Post-startup refresh for area %s: %d → %d lights",
                            area_id,
                            old_count,
                            len(new_lights),
                        )
            
            async_call_later(hass, 2, _delayed_refresh)
        
        hass.bus.async_listen_once(EVENT_HOMEASSISTANT_STARTED, _ha_started)
    else:
        # HA already running (reload case)
        _startup_complete = True
        _LOGGER.debug("HA already running, light groups ready immediately")

    # Event listener for dynamic updates
    @callback
    def entity_registry_updated(event: Event) -> None:
        """
        Handle entity registry updates with intelligent filtering.
        
        This callback is triggered when:
        - A new light is added (action="create")
        - A light is removed (action="remove")
        - A light is updated, e.g., area changed (action="update")
        
        Optimization: Skip processing during startup period (before EVENT_HOMEASSISTANT_STARTED + 2s)
        to avoid unnecessary scans while entities are still loading.
        """
        # Skip processing until startup is complete
        if not _startup_complete:
            return
        
        data = event.data
        action = data.get("action")
        entity_id = data.get("entity_id")
        
        # Ignore if not a light
        if not entity_id or not entity_id.startswith("light."):
            return
        
        # Ignore our own entities
        if entity_id.startswith(f"light.{DOMAIN}_"):
            return
        
        _LOGGER.debug(
            "Entity registry event: action=%s, entity_id=%s",
            action,
            entity_id,
        )
        
        # Get entity entry
        entity_entry = entity_reg.async_get(entity_id)
        
        if action == "create":
            # New light added
            if not entity_entry or entity_entry.disabled:
                return
            
            area_id = _get_light_area_id(entity_entry)
            if not area_id:
                return
            
            # Check if we have a group for this area
            if area_id in _LIGHT_GROUPS:
                # Update existing group
                new_lights = _rebuild_area_lights(area_id)
                _LIGHT_GROUPS[area_id].update_members(new_lights)
                _LOGGER.info(
                    "Added light %s to group for area %s",
                    entity_id,
                    area_id,
                )
            else:
                # Create new group for this area
                area = area_reg.async_get_area(area_id)
                if not area:
                    return
                
                new_lights = _rebuild_area_lights(area_id)
                if not new_lights:
                    return
                
                group = AreaLightGroup(
                    entry.entry_id,
                    area_id,
                    area.name,
                    new_lights,
                )
                
                _LIGHT_GROUPS[area_id] = group
                async_add_entities([group])
                
                _LOGGER.info(
                    "Created new light group for area '%s' with %d lights",
                    area.name,
                    len(new_lights),
                )
        
        elif action == "remove":
            # Light removed
            # Check all groups and remove this light
            for area_id, group in list(_LIGHT_GROUPS.items()):
                if entity_id in group._light_entity_ids:
                    new_lights = _rebuild_area_lights(area_id)
                    
                    if not new_lights:
                        # No lights left in this area - remove the group entity
                        _async_remove_light_group(area_id, f"after removing {entity_id}")
                    else:
                        group.update_members(new_lights)
                        _LOGGER.info(
                            "Removed light %s from group for area %s (%d lights remaining)",
                            entity_id,
                            area_id,
                            len(new_lights),
                        )
                    break
        
        elif action == "update":
            # Light updated
            if not entity_entry:
                return
            
            changes = data.get("changes", {})
            
            # Check if area_id changed
            if "area_id" in changes:
                old_area_id = changes["area_id"]
                new_area_id = entity_entry.area_id or _get_light_area_id(entity_entry)
                
                _LOGGER.info(
                    "Light %s moved from area %s to %s",
                    entity_id,
                    old_area_id,
                    new_area_id,
                )
                
                # Remove from old group
                if old_area_id and old_area_id in _LIGHT_GROUPS:
                    old_group = _LIGHT_GROUPS[old_area_id]
                    old_lights = _rebuild_area_lights(old_area_id)
                    
                    if not old_lights:
                        # No lights left in old area - remove the group entity
                        _async_remove_light_group(old_area_id, f"after moving {entity_id}")
                    else:
                        old_group.update_members(old_lights)
                
                # Add to new group (if not disabled)
                if new_area_id and not entity_entry.disabled:
                    if new_area_id in _LIGHT_GROUPS:
                        new_lights = _rebuild_area_lights(new_area_id)
                        _LIGHT_GROUPS[new_area_id].update_members(new_lights)
                    else:
                        # Create new group for this area
                        area = area_reg.async_get_area(new_area_id)
                        if area:
                            new_lights = _rebuild_area_lights(new_area_id)
                            if new_lights:
                                group = AreaLightGroup(
                                    entry.entry_id,
                                    new_area_id,
                                    area.name,
                                    new_lights,
                                )
                                
                                _LIGHT_GROUPS[new_area_id] = group
                                async_add_entities([group])
                                
                                _LOGGER.info(
                                    "Created new light group for area '%s'",
                                    area.name,
                                )
            
            # Check if disabled status changed
            if "disabled" in changes:
                area_id = _get_light_area_id(entity_entry)
                if area_id and area_id in _LIGHT_GROUPS:
                    group = _LIGHT_GROUPS[area_id]
                    new_lights = _rebuild_area_lights(area_id)
                    
                    if not new_lights:
                        # No enabled lights left - remove the group entity
                        _async_remove_light_group(area_id, "all lights disabled")
                    else:
                        group.update_members(new_lights)
                        
                        status = "disabled" if entity_entry.disabled else "enabled"
                        _LOGGER.info(
                            "Light %s %s in area %s, updated group (%d lights)",
                            entity_id,
                            status,
                            area_id,
                            len(new_lights),
                        )

    # Register the event listener
    entry.async_on_unload(
        hass.bus.async_listen(
            "entity_registry_updated",  # type: ignore[arg-type]
            entity_registry_updated,
        )
    )
    
    _LOGGER.info("Registered entity registry listener for dynamic light group updates")


class AreaLightGroup(LightEntity):
    """
    Light group for an area in Linus Brain.
    
    This class:
    - Aggregates all lights in an area
    - Updates dynamically when lights are added/removed
    - Implements smart filtering (only adjust ON lights)
    - Provides full light control capabilities
    """

    _attr_has_entity_name = True
    _attr_translation_key = "area_lights"
    _attr_should_poll = False

    def __init__(
        self,
        entry_id: str,
        area_id: str,
        area_name: str,
        light_entity_ids: list[str],
    ) -> None:
        """Initialize area light group."""
        self._entry_id = entry_id
        self._area_id = area_id
        self._light_entity_ids = light_entity_ids

        # Entity ID setup (ENGLISH ONLY)
        self._attr_unique_id = f"{DOMAIN}_all_lights_{area_id}"
        self._attr_suggested_object_id = f"{DOMAIN}_all_lights_{area_id}"

        # Translation placeholder
        self._attr_translation_placeholders = {"area_name": area_name}

        # Device assignment
        self._attr_device_info = get_area_device_info(  # type: ignore[assignment]
            entry_id,
            area_id,
            area_name,
        )

        # Availability (False if no member lights)
        self._attr_available = len(light_entity_ids) > 0

        # Features (computed dynamically)
        self._supported_features: LightEntityFeature = LightEntityFeature(0)
        self._supported_color_modes: set[ColorMode | str] = {ColorMode.ONOFF}
        self._effect_list: list[str] = []

        # State tracking
        self._is_on = False
        self._brightness: int | None = None
        self._color_temp_kelvin: int | None = None
        self._hs_color: tuple[float, float] | None = None
        self._rgb_color: tuple[int, int, int] | None = None
        self._rgbw_color: tuple[int, int, int, int] | None = None
        self._rgbww_color: tuple[int, int, int, int, int] | None = None
        self._effect: str | None = None
        self._color_mode: ColorMode | str = ColorMode.ONOFF

        # Member states
        self._member_states: dict[str, Any] = {}
        self._lights_on: list[str] = []
        self._lights_off: list[str] = []

    def update_members(self, new_light_entity_ids: list[str]) -> None:
        """
        Update the list of member lights dynamically.
        
        This method is called by the event listener when lights are added/removed
        or moved between areas.
        
        If the list becomes empty, the group will be marked as unavailable.
        
        Args:
            new_light_entity_ids: New list of light entity IDs for this group
        """
        old_members = set(self._light_entity_ids)
        new_members = set(new_light_entity_ids)
        
        # Calculate changes
        added = new_members - old_members
        removed = old_members - new_members
        
        if not added and not removed:
            # No changes
            return
        
        _LOGGER.info(
            "%s: Updating members - added: %s, removed: %s",
            self.entity_id if hasattr(self, "entity_id") else self._attr_unique_id,
            list(added) if added else "none",
            list(removed) if removed else "none",
        )
        
        # Update the list
        self._light_entity_ids = new_light_entity_ids
        
        # Update availability based on member count
        self._attr_available = len(new_light_entity_ids) > 0
        
        # Clean up states for removed members
        for entity_id in removed:
            self._member_states.pop(entity_id, None)
        
        # Force a complete state refresh
        self.async_schedule_update_ha_state(force_refresh=True)

    @property  # type: ignore[override]
    def is_on(self) -> bool:
        """Return if the light group is on."""
        return self._is_on

    @property  # type: ignore[override]
    def brightness(self) -> int | None:
        """Return the brightness of this light group."""
        return self._brightness

    @property  # type: ignore[override]
    def color_mode(self) -> ColorMode | str:
        """Return the color mode of the light."""
        return self._color_mode

    @property  # type: ignore[override]
    def hs_color(self) -> tuple[float, float] | None:
        """Return the hs color value."""
        return self._hs_color

    @property  # type: ignore[override]
    def rgb_color(self) -> tuple[int, int, int] | None:
        """Return the rgb color value."""
        return self._rgb_color

    @property  # type: ignore[override]
    def rgbw_color(self) -> tuple[int, int, int, int] | None:
        """Return the rgbw color value."""
        return self._rgbw_color

    @property  # type: ignore[override]
    def rgbww_color(self) -> tuple[int, int, int, int, int] | None:
        """Return the rgbww color value."""
        return self._rgbww_color

    @property  # type: ignore[override]
    def color_temp_kelvin(self) -> int | None:
        """Return the color temperature in Kelvin."""
        return self._color_temp_kelvin

    @property  # type: ignore[override]
    def min_color_temp_kelvin(self) -> int:
        """
        Return minimum color temperature in Kelvin.
        
        Aggregates from member lights to find the warmest temperature supported.
        Falls back to 2000K (warm white) if no member lights support color temperature.
        """
        if not self._light_entity_ids:
            return 2000  # Default warm white
        
        min_temps = []
        for entity_id in self._light_entity_ids:
            state = self.hass.states.get(entity_id)
            if state:
                min_kelvin = state.attributes.get("min_color_temp_kelvin")
                if min_kelvin:
                    min_temps.append(min_kelvin)
        
        return min(min_temps) if min_temps else 2000

    @property  # type: ignore[override]
    def max_color_temp_kelvin(self) -> int:
        """
        Return maximum color temperature in Kelvin.
        
        Aggregates from member lights to find the coolest temperature supported.
        Falls back to 6535K (cool white) if no member lights support color temperature.
        """
        if not self._light_entity_ids:
            return 6535  # Default cool white
        
        max_temps = []
        for entity_id in self._light_entity_ids:
            state = self.hass.states.get(entity_id)
            if state:
                max_kelvin = state.attributes.get("max_color_temp_kelvin")
                if max_kelvin:
                    max_temps.append(max_kelvin)
        
        return max(max_temps) if max_temps else 6535

    @property  # type: ignore[override]
    def effect(self) -> str | None:
        """Return the current effect."""
        return self._effect

    @property  # type: ignore[override]
    def effect_list(self) -> list[str]:
        """Return the list of supported effects."""
        return self._effect_list

    @property  # type: ignore[override]
    def supported_features(self) -> LightEntityFeature:
        """Return the supported features."""
        return self._supported_features

    @property  # type: ignore[override]
    def supported_color_modes(self) -> set[ColorMode | str]:
        """Return the supported color modes."""
        return self._supported_color_modes

    async def async_added_to_hass(self) -> None:
        """Register callbacks when entity added to hass."""
        await super().async_added_to_hass()

        # Subscribe to member light state changes
        @callback
        def async_state_changed_listener(
            event: Event[EventStateChangedData],
        ) -> None:
            """Handle member light state changes."""
            new_state = event.data["new_state"]
            if new_state is None:
                return

            entity_id = new_state.entity_id
            if entity_id in self._light_entity_ids:
                self._member_states[entity_id] = new_state
                self.async_schedule_update_ha_state(force_refresh=True)

        self.async_on_remove(
            self.hass.bus.async_listen(
                EVENT_STATE_CHANGED,
                async_state_changed_listener,
            )
        )

        # Get initial states
        for entity_id in self._light_entity_ids:
            state = self.hass.states.get(entity_id)
            if state:
                self._member_states[entity_id] = state

        # Trigger initial update
        self.async_schedule_update_ha_state(force_refresh=True)

    def _compute_valid_color_modes(self, all_modes: list[ColorMode | str]) -> set[ColorMode | str]:
        """
        Compute valid color modes according to Home Assistant rules.
        
        Home Assistant does NOT allow combining BRIGHTNESS with color modes like XY or COLOR_TEMP.
        Valid combinations:
        - ONOFF only
        - BRIGHTNESS only
        - Color modes (XY, RGB, HS, COLOR_TEMP, etc.) - can be combined
        - But NOT: BRIGHTNESS + XY/RGB/COLOR_TEMP
        
        Priority: Color modes > BRIGHTNESS > ONOFF
        
        Args:
            all_modes: List of all color modes from member lights
            
        Returns:
            Set of valid color modes for the group
        """
        if not all_modes:
            return {ColorMode.ONOFF}
        
        modes_set = set(all_modes)
        
        # Remove ONOFF from consideration (always implied as fallback)
        modes_set.discard(ColorMode.ONOFF)
        
        # Define color modes (higher priority than BRIGHTNESS)
        color_modes = {
            ColorMode.XY,
            ColorMode.RGB,
            ColorMode.RGBW,
            ColorMode.RGBWW,
            ColorMode.HS,
            ColorMode.COLOR_TEMP,
        }
        
        # Check what we have
        has_color = bool(modes_set & color_modes)
        has_brightness = ColorMode.BRIGHTNESS in modes_set
        
        if has_color:
            # Use color modes only, exclude BRIGHTNESS
            # Color modes can be combined together (e.g., XY + COLOR_TEMP is valid)
            result = modes_set & color_modes
            _LOGGER.debug(
                "%s: Using color modes %s (excluding BRIGHTNESS to avoid invalid combination)",
                self.entity_id if hasattr(self, "entity_id") else "light_group",
                result
            )
            return result
        elif has_brightness:
            # Only BRIGHTNESS (no colors available)
            return {ColorMode.BRIGHTNESS}
        else:
            # Fallback to ONOFF
            return {ColorMode.ONOFF}

    def _detect_features_from_members(self) -> None:
        """
        Detect supported features from member lights.

        Strategy:
        - supported_features: Intersection (only features ALL lights support)
        - supported_color_modes: Valid combination (respecting HA rules)
        - effect_list: Union (all unique effects from all lights)

        This ensures:
        - Basic features work on all lights
        - Advanced features (color, effects) available when possible
        - Color modes follow Home Assistant validation rules
        """
        if not self._light_entity_ids:
            self._supported_features = LightEntityFeature(0)
            self._supported_color_modes = {ColorMode.ONOFF}
            self._effect_list = []
            return

        # Collect features from all lights
        all_features: list[int] = []
        all_color_modes: list[ColorMode | str] = []
        all_effects: list[str] = []

        for entity_id in self._light_entity_ids:
            state = self.hass.states.get(entity_id)
            if not state or state.state == STATE_UNAVAILABLE:
                continue

            # Get supported_features
            features = state.attributes.get("supported_features", 0)
            all_features.append(features)

            # Get supported_color_modes
            color_modes = state.attributes.get("supported_color_modes", [])
            if color_modes:
                all_color_modes.extend(color_modes)

            # Get effect_list
            effect_list = state.attributes.get(ATTR_EFFECT_LIST, [])
            if effect_list:
                all_effects.extend(effect_list)

        if not all_features:
            # No lights available
            self._supported_features = LightEntityFeature(0)
            self._supported_color_modes = {ColorMode.ONOFF}
            self._effect_list = []
            return

        # Compute intersection of features (all lights must support)
        common_features = all_features[0]
        for features in all_features[1:]:
            common_features &= features  # Bitwise AND

        # Always add transition and flash if we control lights
        common_features |= LightEntityFeature.TRANSITION
        common_features |= LightEntityFeature.FLASH

        self._supported_features = LightEntityFeature(common_features)

        # Compute valid color modes (respecting Home Assistant rules)
        self._supported_color_modes = self._compute_valid_color_modes(all_color_modes)

        # Compute unique effects
        self._effect_list = sorted(list(set(all_effects))) if all_effects else []

        _LOGGER.debug(
            "%s: Detected features=0x%x, color_modes=%s, effects=%d",
            self.entity_id,
            common_features,
            self._supported_color_modes,
            len(self._effect_list),
        )

    async def async_update(self) -> None:
        """Update the light group state."""
        if not self._light_entity_ids:
            self._is_on = False
            return

        # Detect features (may change if lights added/removed)
        self._detect_features_from_members()

        # Categorize lights
        lights_on: list[str] = []
        lights_off: list[str] = []
        brightness_values: list[int] = []
        color_temps: list[int] = []
        rgb_colors: list[tuple[int, int, int]] = []
        hs_colors: list[tuple[float, float]] = []
        rgbw_colors: list[tuple[int, int, int, int]] = []
        rgbww_colors: list[tuple[int, int, int, int, int]] = []
        effects: list[str] = []

        for entity_id in self._light_entity_ids:
            state = self._member_states.get(entity_id)
            if not state:
                state = self.hass.states.get(entity_id)
                if not state:
                    continue

            if state.state == STATE_ON:
                lights_on.append(entity_id)

                # Collect brightness
                brightness = state.attributes.get(ATTR_BRIGHTNESS)
                if brightness is not None:
                    brightness_values.append(int(brightness))

                # Collect color_temp
                color_temp = state.attributes.get(ATTR_COLOR_TEMP_KELVIN)
                if color_temp is not None:
                    color_temps.append(int(color_temp))

                # Collect RGB
                rgb = state.attributes.get(ATTR_RGB_COLOR)
                if rgb is not None:
                    rgb_colors.append(tuple(rgb))  # type: ignore[arg-type]

                # Collect HS
                hs = state.attributes.get(ATTR_HS_COLOR)
                if hs is not None:
                    hs_colors.append(tuple(hs))  # type: ignore[arg-type]

                # Collect RGBW
                rgbw = state.attributes.get(ATTR_RGBW_COLOR)
                if rgbw is not None:
                    rgbw_colors.append(tuple(rgbw))  # type: ignore[arg-type]

                # Collect RGBWW
                rgbww = state.attributes.get(ATTR_RGBWW_COLOR)
                if rgbww is not None:
                    rgbww_colors.append(tuple(rgbww))  # type: ignore[arg-type]

                # Collect effect
                effect = state.attributes.get(ATTR_EFFECT)
                if effect:
                    effects.append(str(effect))

            elif state.state != STATE_UNAVAILABLE:
                lights_off.append(entity_id)

        # Update group state
        self._is_on = len(lights_on) > 0
        self._lights_on = lights_on
        self._lights_off = lights_off

        # Aggregate brightness (average)
        if brightness_values:
            self._brightness = int(sum(brightness_values) / len(brightness_values))
        else:
            self._brightness = None

        # Aggregate color_temp (use first if all same, else None)
        if color_temps and all(ct == color_temps[0] for ct in color_temps):
            self._color_temp_kelvin = color_temps[0]
        else:
            self._color_temp_kelvin = None

        # Aggregate RGB (use first if all same, else None)
        if rgb_colors and all(rgb == rgb_colors[0] for rgb in rgb_colors):
            self._rgb_color = rgb_colors[0]
        else:
            self._rgb_color = None

        # Aggregate HS (use first if all same, else None)
        if hs_colors and all(hs == hs_colors[0] for hs in hs_colors):
            self._hs_color = hs_colors[0]
        else:
            self._hs_color = None

        # Aggregate RGBW (use first if all same, else None)
        if rgbw_colors and all(rgbw == rgbw_colors[0] for rgbw in rgbw_colors):
            self._rgbw_color = rgbw_colors[0]
        else:
            self._rgbw_color = None

        # Aggregate RGBWW (use first if all same, else None)
        if rgbww_colors and all(rgbww == rgbww_colors[0] for rgbww in rgbww_colors):
            self._rgbww_color = rgbww_colors[0]
        else:
            self._rgbww_color = None

        # Aggregate effect (use first if all same, else None)
        if effects and all(e == effects[0] for e in effects):
            self._effect = effects[0]
        else:
            self._effect = None

        # Determine color mode (must be in supported_color_modes)
        # Priority: RGBWW > RGBW > HS/RGB > XY > COLOR_TEMP > BRIGHTNESS > ONOFF
        if self._rgbww_color is not None and ColorMode.RGBWW in self._supported_color_modes:
            self._color_mode = ColorMode.RGBWW
        elif self._rgbw_color is not None and ColorMode.RGBW in self._supported_color_modes:
            self._color_mode = ColorMode.RGBW
        elif (self._rgb_color is not None or self._hs_color is not None):
            # Prefer HS if supported, otherwise try RGB, then XY
            if ColorMode.HS in self._supported_color_modes:
                self._color_mode = ColorMode.HS
            elif ColorMode.RGB in self._supported_color_modes:
                self._color_mode = ColorMode.RGB
            elif ColorMode.XY in self._supported_color_modes:
                self._color_mode = ColorMode.XY
                _LOGGER.debug(
                    "%s: Using XY color mode (HS/RGB not supported, falling back from RGB/HS)",
                    self.entity_id
                )
            elif ColorMode.COLOR_TEMP in self._supported_color_modes:
                # Fall back to color temp if color not supported
                self._color_mode = ColorMode.COLOR_TEMP
                _LOGGER.debug(
                    "%s: Using COLOR_TEMP mode (color modes not supported)",
                    self.entity_id
                )
            else:
                self._color_mode = ColorMode.BRIGHTNESS if self._brightness is not None else ColorMode.ONOFF
                _LOGGER.debug(
                    "%s: Using %s mode (no color support)",
                    self.entity_id,
                    self._color_mode
                )
        elif self._color_temp_kelvin is not None and ColorMode.COLOR_TEMP in self._supported_color_modes:
            self._color_mode = ColorMode.COLOR_TEMP
        elif self._brightness is not None and ColorMode.BRIGHTNESS in self._supported_color_modes:
            self._color_mode = ColorMode.BRIGHTNESS
        else:
            self._color_mode = ColorMode.ONOFF

    def _light_supports_effect(self, entity_id: str, effect: str) -> bool:
        """Check if a light supports a specific effect."""
        state = self._member_states.get(entity_id) or self.hass.states.get(entity_id)
        if not state:
            return False

        effect_list = state.attributes.get(ATTR_EFFECT_LIST, [])
        return effect in effect_list

    def _light_supports_color(
        self, entity_id: str, color_kwargs: dict[str, Any]
    ) -> bool:
        """Check if a light supports the requested color parameters."""
        state = self._member_states.get(entity_id) or self.hass.states.get(entity_id)
        if not state:
            return False

        color_modes = state.attributes.get("supported_color_modes", [])

        if ATTR_RGB_COLOR in color_kwargs:
            return ColorMode.RGB in color_modes or ColorMode.HS in color_modes

        if ATTR_HS_COLOR in color_kwargs:
            return ColorMode.HS in color_modes

        if ATTR_COLOR_TEMP_KELVIN in color_kwargs:
            return ColorMode.COLOR_TEMP in color_modes

        if ATTR_RGBW_COLOR in color_kwargs:
            return ColorMode.RGBW in color_modes

        if ATTR_RGBWW_COLOR in color_kwargs:
            return ColorMode.RGBWW in color_modes

        return False

    async def async_turn_on(self, **kwargs: Any) -> None:
        """
        Turn on the light group with smart filtering.
        
        Smart filtering:
        - Without parameters: Turn on ALL lights
        - With brightness/color/effect: Only adjust lights that are already ON
        """
        # Check what parameters are provided
        has_brightness = ATTR_BRIGHTNESS in kwargs
        has_color_temp = ATTR_COLOR_TEMP_KELVIN in kwargs
        has_rgb = ATTR_RGB_COLOR in kwargs
        has_hs = ATTR_HS_COLOR in kwargs
        has_effect = ATTR_EFFECT in kwargs
        has_white = ATTR_WHITE in kwargs
        has_rgbw = ATTR_RGBW_COLOR in kwargs
        has_rgbww = ATTR_RGBWW_COLOR in kwargs

        # Determine if this is an adjustment vs full turn_on
        is_adjustment = (
            has_brightness
            or has_color_temp
            or has_rgb
            or has_hs
            or has_effect
            or has_white
            or has_rgbw
            or has_rgbww
        )

        if is_adjustment:
            # Apply only to lights that are already ON
            target_lights = self._lights_on.copy()

            if not target_lights:
                # Special case: If brightness is specified but no lights are ON,
                # turn on ALL lights with the specified brightness instead of skipping
                if has_brightness:
                    _LOGGER.debug(
                        "No lights ON in %s, turning on all lights with brightness",
                        self.entity_id,
                    )
                    target_lights = self._light_entity_ids.copy()
                else:
                    _LOGGER.debug(
                        "Skipping adjustment for %s: no lights ON",
                        self.entity_id,
                    )
                    return

            # Filter target lights by capability for specific adjustments
            if has_effect:
                effect = kwargs[ATTR_EFFECT]
                # Only target lights that support this effect
                target_lights = [
                    entity_id
                    for entity_id in target_lights
                    if self._light_supports_effect(entity_id, effect)
                ]

                if not target_lights:
                    _LOGGER.warning(
                        "Effect '%s' not supported by any ON lights in %s",
                        effect,
                        self.entity_id,
                    )
                    return

            if has_color_temp or has_rgb or has_hs or has_rgbw or has_rgbww:
                # Only target lights that support color
                target_lights = [
                    entity_id
                    for entity_id in target_lights
                    if self._light_supports_color(entity_id, kwargs)
                ]

                if not target_lights:
                    _LOGGER.debug(
                        "Color adjustment not supported by any ON lights in %s",
                        self.entity_id,
                    )
                    return

            _LOGGER.debug(
                "Applying adjustment to %d/%d lights in %s: %s",
                len(target_lights),
                len(self._lights_on),
                self.entity_id,
                kwargs,
            )
        else:
            # Turn on ALL lights
            target_lights = self._light_entity_ids.copy()
            _LOGGER.debug(
                "Turning ON all %d lights in %s",
                len(target_lights),
                self.entity_id,
            )

        # Apply to target lights in parallel
        tasks = []
        for entity_id in target_lights:
            tasks.append(
                self.hass.services.async_call(
                    "light",
                    "turn_on",
                    {"entity_id": entity_id, **kwargs},
                    blocking=False,
                    context=self._context,
                )
            )

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Log any errors
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    _LOGGER.error(
                        "Failed to control %s: %s",
                        target_lights[i],
                        result,
                    )

        # Force state update after small delay for state propagation
        await asyncio.sleep(0.1)
        self.async_schedule_update_ha_state(force_refresh=True)

    async def async_turn_off(self, **kwargs: Any) -> None:
        """Turn off all lights in the group."""
        _LOGGER.debug(
            "Turning OFF all %d lights in %s",
            len(self._light_entity_ids),
            self.entity_id,
        )

        tasks = []
        for entity_id in self._light_entity_ids:
            tasks.append(
                self.hass.services.async_call(
                    "light",
                    "turn_off",
                    {"entity_id": entity_id, **kwargs},
                    blocking=False,
                    context=self._context,
                )
            )

        if tasks:
            results = await asyncio.gather(*tasks, return_exceptions=True)

            # Log any errors
            for i, result in enumerate(results):
                if isinstance(result, Exception):
                    _LOGGER.error(
                        "Failed to turn off %s: %s",
                        self._light_entity_ids[i],
                        result,
                    )

        # Force state update after small delay
        await asyncio.sleep(0.1)
        self.async_schedule_update_ha_state(force_refresh=True)

    @property  # type: ignore[override]
    def extra_state_attributes(self) -> dict[str, Any]:
        """Return extra state attributes."""
        attrs: dict[str, Any] = {
            "entity_id": self._light_entity_ids,
            "lights_on": self._lights_on,
            "lights_off": self._lights_off,
            "total_lights": len(self._light_entity_ids),
            "lights_on_count": len(self._lights_on),
        }

        # Add feature information
        attrs["supported_features"] = int(self._supported_features)
        attrs["supported_color_modes"] = [
            str(mode) for mode in self._supported_color_modes
        ]

        if self._effect_list:
            attrs["available_effects"] = self._effect_list

        # Add debug info about member capabilities
        member_info: dict[str, dict[str, Any]] = {}
        for entity_id in self._light_entity_ids:
            state = self.hass.states.get(entity_id)
            if state:
                member_info[entity_id] = {
                    "state": state.state,
                    "brightness": state.attributes.get(ATTR_BRIGHTNESS),
                    "color_mode": state.attributes.get("color_mode"),
                    "effect": state.attributes.get(ATTR_EFFECT),
                }

        attrs["members"] = member_info

        return attrs
