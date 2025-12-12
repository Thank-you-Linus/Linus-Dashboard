"""
Light Learning Module for Linus Brain

This module captures manual light actions with environmental context for AI learning.

Key responsibilities:
- Detect manual light state changes (vs automated)
- Collect environmental context (presence, illuminance, sun elevation)
- Format and send light actions to Supabase
- Support for turn_on, turn_off, brightness, color_temp, color actions
"""

import logging
from datetime import datetime
from typing import Any

from homeassistant.core import Context, HomeAssistant, State

_LOGGER = logging.getLogger(__name__)


class LightLearning:
    """
    Captures manual light actions with context for AI pattern learning.

    This class:
    - Identifies manual vs automated light actions
    - Collects environmental context (presence, illuminance, sun)
    - Sends structured data to Supabase for AI analysis
    """

    def __init__(
        self,
        hass: HomeAssistant,
        coordinator: Any,
    ) -> None:
        """
        Initialize the light learning module.

        Args:
            hass: Home Assistant instance
            coordinator: LinusBrainCoordinator instance
        """
        self.hass = hass
        self.coordinator = coordinator

    def _is_manual_action(self, context: Context) -> bool:
        """
        Determine if a light action was triggered manually by a user.

        Manual actions have a user_id in the context, while automated actions
        (from automations, scenes, scripts) do not.

        Args:
            context: The event context

        Returns:
            True if manual action, False if automated
        """
        return context.user_id is not None

    def _determine_action_type(self, new_state: State, old_state: State | None) -> str:
        """
        Determine the type of light action that occurred.

        Args:
            new_state: New state of the light
            old_state: Previous state of the light

        Returns:
            Action type: turn_on, turn_off, brightness, color_temp, or color
        """
        if new_state.state == "off":
            return "turn_off"

        if not old_state or old_state.state == "off":
            return "turn_on"

        old_brightness = old_state.attributes.get("brightness")
        new_brightness = new_state.attributes.get("brightness")

        old_color_temp = old_state.attributes.get("color_temp")
        new_color_temp = new_state.attributes.get("color_temp")

        old_rgb_color = old_state.attributes.get("rgb_color")
        new_rgb_color = new_state.attributes.get("rgb_color")

        old_hs_color = old_state.attributes.get("hs_color")
        new_hs_color = new_state.attributes.get("hs_color")

        if old_rgb_color != new_rgb_color and new_rgb_color is not None:
            return "color"

        if old_hs_color != new_hs_color and new_hs_color is not None:
            return "color"

        if old_color_temp != new_color_temp and new_color_temp is not None:
            return "color_temp"

        if old_brightness != new_brightness and new_brightness is not None:
            return "brightness"

        return "turn_on"

    def _build_state_dict(self, state: State) -> dict[str, Any]:
        """
        Build a dictionary representation of light state.

        Args:
            state: The light state object

        Returns:
            Dictionary with state information
        """
        state_dict = {
            "state": state.state,
        }

        if state.state == "on":
            brightness = state.attributes.get("brightness")
            if brightness is not None:
                state_dict["brightness"] = brightness

            color_temp = state.attributes.get("color_temp")
            if color_temp is not None:
                state_dict["color_temp"] = color_temp

            rgb_color = state.attributes.get("rgb_color")
            if rgb_color is not None:
                state_dict["rgb_color"] = rgb_color

            hs_color = state.attributes.get("hs_color")
            if hs_color is not None:
                state_dict["hs_color"] = hs_color

        return state_dict

    async def capture_light_action(
        self,
        entity_id: str,
        new_state: State,
        old_state: State | None,
        context: Context,
    ) -> None:
        """
        Capture a light action with environmental context and send to Supabase.

        This is the main entry point called by the event listener when a light
        state change is detected.

        Args:
            entity_id: The light entity ID
            new_state: New state of the light
            old_state: Previous state of the light (may be None)
            context: Event context containing user_id and other metadata
        """
        try:
            # Check if this is a manual action
            is_manual = self._is_manual_action(context)

            if not is_manual:
                _LOGGER.debug(f"Skipping automated action for {entity_id}")
                return

            # Determine action type
            action_type = self._determine_action_type(new_state, old_state)

            _LOGGER.debug(
                f"Capturing light action: {entity_id} - {action_type} "
                f"(manual={is_manual})"
            )

            # Get the area for this light
            area_id = self.coordinator.area_manager.get_entity_area(entity_id)
            if not area_id:
                _LOGGER.debug(
                    f"Light {entity_id} has no area, skipping learning capture"
                )
                return

            area = self.coordinator.area_manager._area_registry.async_get_area(area_id)
            if not area:
                _LOGGER.debug(f"Area {area_id} not found for light {entity_id}")
                return

            area_name = area.name

            # Collect environmental context
            presence_detected = self.coordinator.area_manager.get_area_presence_binary(
                area_id
            )

            # Update activity tracker and get current activity
            activity = await self.coordinator.activity_tracker.async_evaluate_activity(
                area_id
            )
            activity_duration = self.coordinator.activity_tracker.get_activity_duration(
                area_id
            )

            illuminance = self.coordinator.area_manager.get_area_illuminance(area_id)

            sun_elevation = self.coordinator.area_manager.get_sun_elevation()

            # Get timestamp info
            now = datetime.now()
            hour = now.hour
            day_of_week = now.weekday()

            # Get instance ID (ensure we have one)
            try:
                instance_id = await self.coordinator.get_or_create_instance_id()
            except Exception as err:
                _LOGGER.error(f"Failed to get instance ID for light action: {err}")
                return

            # Build payload
            payload = {
                "instance_id": instance_id,
                "area_id": area_id,
                "area": area_name,
                "action_type": action_type,
                "entity_id": entity_id,
                "old_state": self._build_state_dict(old_state) if old_state else None,
                "new_state": self._build_state_dict(new_state),
                "activity": activity,
                "activity_duration": round(activity_duration, 1),
                "presence_detected": presence_detected,
                "illuminance": illuminance,
                "sun_elevation": sun_elevation,
                "hour": hour,
                "day_of_week": day_of_week,
                "is_manual": is_manual,
                "context_id": context.id,
            }

            # Send to Supabase
            await self.coordinator.supabase_client.send_light_action(payload)

            _LOGGER.info(
                f"Captured light action: {entity_id} ({action_type}) "
                f"in {area_name} - manual={is_manual}"
            )

        except Exception as err:
            _LOGGER.error(f"Error capturing light action for {entity_id}: {err}")
