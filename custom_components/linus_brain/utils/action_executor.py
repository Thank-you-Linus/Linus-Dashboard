"""
Action executor for automation rules.

Executes Home Assistant service calls when rule conditions are met.
Supports light control, scene activation, and generic service calls.
"""

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from .entity_resolver import EntityResolver
from .state_validator import is_state_valid

_LOGGER = logging.getLogger(__name__)


class ActionExecutor:
    """
    Executes automation actions (service calls).

    Supports various action types:
    - service: Generic service call
    - device: Device-specific action (future)
    - scene: Scene activation
    """

    def __init__(self, hass: HomeAssistant, entity_resolver: EntityResolver) -> None:
        """
        Initialize the action executor.

        Args:
            hass: Home Assistant instance
            entity_resolver: Entity resolver for generic selectors
        """
        self.hass = hass
        self.entity_resolver = entity_resolver

    async def execute_actions(
        self,
        actions: list[dict[str, Any]],
        area_id: str,
        context_id: str | None = None,
        current_activity: str | None = None,
        previous_activity: str | None = None,
    ) -> bool:
        """
        Execute a list of actions.

        Args:
            actions: List of action dictionaries
            area_id: Area context for entity resolution
            context_id: Optional context ID for tracking
            current_activity: Current activity for selective dimming
            previous_activity: Previous activity for transition detection

        Returns:
            True if all actions executed successfully
        """
        if not actions:
            _LOGGER.debug("No actions to execute")
            return True

        success_count = 0
        for action in actions:
            try:
                resolved_action = self._resolve_action(action, area_id)
                await self._execute_single_action(
                    resolved_action, context_id, current_activity, previous_activity
                )
                success_count += 1

            except Exception as err:
                _LOGGER.error(f"Failed to execute action {action}: {err}")

        _LOGGER.debug(f"Executed {success_count}/{len(actions)} actions successfully")
        return success_count == len(actions)

    async def _execute_single_action(
        self,
        action: dict[str, Any],
        context_id: str | None = None,
        current_activity: str | None = None,
        previous_activity: str | None = None,
    ) -> None:
        """
        Execute a single action.

        Supports filter_entities_by_state for filtering entities by their current state.

        Args:
            action: Action dictionary with service and data
            context_id: Optional context ID
            current_activity: Current activity for selective dimming
            previous_activity: Previous activity for transition detection

        Raises:
            HomeAssistantError: If action execution fails
        """
        service = action.get("service")

        if not service:
            raise HomeAssistantError("Action missing 'service' field")

        domain, service_name = self._parse_service(service)

        service_data = action.get("data", {})
        target = action.get("target", {})

        if target:
            service_data.update(target)

        entity_id = action.get("entity_id")
        if entity_id:
            service_data["entity_id"] = entity_id

        # Handle entity state filtering
        # IMPORTANT: Skip filtering for Linus Brain light groups - they handle smart filtering internally
        if "filter_entities_by_state" in action:
            required_state = action["filter_entities_by_state"]
            entity_id_val = service_data.get("entity_id", [])
            
            # Check if this is a Linus Brain light group (single entity starting with light.linus_brain_all_lights_)
            is_light_group = (
                isinstance(entity_id_val, str) and 
                entity_id_val.startswith("light.linus_brain_all_lights_")
            )
            
            if is_light_group:
                # Light group handles smart filtering internally - don't apply external filter
                _LOGGER.debug(
                    f"Skipping filter_entities_by_state for light group {entity_id_val} - group handles filtering internally"
                )
            else:
                # Apply filtering for non-light-group entities
                filtered_entities = self._filter_entities_by_state(
                    entity_id_val, required_state
                )
                if not filtered_entities:
                    _LOGGER.debug(
                        f"Skipping action: no entities in state '{required_state}'"
                    )
                    return
                service_data["entity_id"] = filtered_entities
                _LOGGER.debug(
                    f"Filtered entities: {len(filtered_entities)} in state '{required_state}'"
                )

        _LOGGER.debug(
            f"Calling service {domain}.{service_name} with data: {service_data}"
        )

        await self.hass.services.async_call(
            domain,
            service_name,
            service_data,
            blocking=True,
        )

    def _resolve_action(
        self,
        action: dict[str, Any],
        area_id: str,
    ) -> dict[str, Any]:
        """
        Resolve generic action selectors to concrete entity_ids.

        Args:
            action: Action with generic selectors or explicit entity_id
            area_id: Area context for resolution

        Returns:
            Resolved action with entity_id
        """
        if "entity_id" in action or "target" in action:
            return action

        if "domain" not in action:
            return action

        domain = action.get("domain")
        area = action.get("area")

        if not domain:
            _LOGGER.warning(f"Action missing domain: {action}")
            return action

        target_area_id = area_id if area == "current" or area is None else area

        entity_ids = self.entity_resolver.resolve_entity(
            domain=domain,
            area_id=target_area_id,
            strategy="all",
        )

        if not entity_ids:
            _LOGGER.warning(
                f"Cannot resolve action: domain={domain}, area={target_area_id}"
            )
            return action

        resolved_action = action.copy()
        resolved_action["entity_id"] = entity_ids

        del resolved_action["domain"]
        if "area" in resolved_action:
            del resolved_action["area"]

        _LOGGER.debug(f"Resolved action: domain={domain} → entity_id={entity_ids}")

        return resolved_action

    def _parse_service(self, service: str) -> tuple[str, str]:
        """
        Parse service string into domain and service name.

        Args:
            service: Service string (e.g., "light.turn_on")

        Returns:
            Tuple of (domain, service_name)

        Raises:
            HomeAssistantError: If service format is invalid
        """
        parts = service.split(".", 1)

        if len(parts) != 2:
            raise HomeAssistantError(
                f"Invalid service format: {service}. Expected 'domain.service'"
            )

        return parts[0], parts[1]

    def _filter_entities_by_state(
        self, entity_ids: list[str] | str, required_state: str
    ) -> list[str]:
        """
        Filter entities to only those in the required state.

        Args:
            entity_ids: Single entity_id or list of entity_ids
            required_state: Required state (e.g., "on", "off", "playing")

        Returns:
            List of entity_ids in the required state
        """
        if isinstance(entity_ids, str):
            entity_ids = [entity_ids]

        filtered = []
        for entity_id in entity_ids:
            state = self.hass.states.get(entity_id)
            if is_state_valid(state) and state.state == required_state:
                filtered.append(entity_id)
            elif not is_state_valid(state):
                _LOGGER.debug(
                    f"Skipping entity {entity_id} with invalid state: {state.state if state else 'None'}"
                )

        return filtered

    def get_referenced_entities(self, actions: list[dict[str, Any]]) -> set[str]:
        """
        Extract all entity IDs referenced in actions.

        Args:
            actions: List of action dictionaries

        Returns:
            Set of entity IDs
        """
        entities = set()

        for action in actions:
            entity_id = action.get("entity_id")
            if entity_id:
                if isinstance(entity_id, str):
                    entities.add(entity_id)
                elif isinstance(entity_id, list):
                    entities.update(entity_id)

            target = action.get("target", {})
            target_entities = target.get("entity_id")
            if target_entities:
                if isinstance(target_entities, str):
                    entities.add(target_entities)
                elif isinstance(target_entities, list):
                    entities.update(target_entities)

        return entities
