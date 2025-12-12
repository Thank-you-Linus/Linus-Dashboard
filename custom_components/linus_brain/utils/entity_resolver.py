"""
Entity Resolver for Linus Brain

Resolves generic entity selectors (domain + device_class + area)
to concrete entity_ids at runtime, enabling dynamic rule evaluation.

CRITICAL DESIGN PATTERN:
When resolving conditions with generic selectors that match multiple entities,
this resolver ALWAYS expands to an OR condition containing ALL matching entities.
This ensures that ANY entity meeting the condition will trigger it, not just the first one.

Example: If an area has 5 occupancy sensors, checking for "occupancy ON" will
evaluate all 5 sensors, returning True if ANY of them are ON.

This prevents subtle bugs where only the first entity is checked and other
entities are ignored, leading to failed detections.
"""

import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import device_registry, entity_registry

_LOGGER = logging.getLogger(__name__)


class EntityResolver:
    """
    Resolves generic entity selectors to concrete entity IDs.

    Supports dynamic entity resolution based on:
    - Domain (e.g., "binary_sensor", "sensor", "light")
    - Device class (e.g., "motion", "illuminance")
    - Area context (e.g., "kitchen", "living_room")
    """

    def __init__(self, hass: HomeAssistant) -> None:
        """
        Initialize the entity resolver.

        Args:
            hass: Home Assistant instance
        """
        self.hass = hass
        self._entity_registry = entity_registry.async_get(hass)
        self._device_registry = device_registry.async_get(hass)

    def resolve_entity(
        self,
        domain: str,
        area_id: str,
        device_class: str | None = None,
        strategy: str = "first",
    ) -> str | list[str] | None:
        """
        Resolve generic selector to entity_id(s).

        IMPORTANT: For light domain actions (strategy="all"), this resolver returns
        the area light group entity (light.linus_brain_all_lights_{area_id}) instead
        of individual lights. This centralizes all light control logic in the light group,
        which handles smart filtering (only adjust ON lights) automatically.

        Args:
            domain: Entity domain (binary_sensor, sensor, light, etc.)
            area_id: Target area ID
            device_class: Optional device class filter (motion, illuminance, etc.)
            strategy: Resolution strategy:
                - "first": Return first matching entity (default)
                - "all": Return list of all matching entities (or light group for lights)
                - "any": Return any active entity

        Returns:
            - str: Single entity_id (strategy="first")
            - list[str]: List of entity_ids (strategy="all")
            - None: No matching entities found
        """
        _LOGGER.debug(
            f"Resolving entity: domain={domain}, area_id={area_id}, device_class={device_class}, strategy={strategy}"
        )

        # Special case: For light domain with strategy="all", return the area light group
        # This centralizes light control logic and enables smart filtering
        if domain == "light" and strategy == "all" and not device_class:
            light_group_entity = f"light.linus_brain_all_lights_{area_id}"
            
            # Check if light group exists
            if self.hass.states.get(light_group_entity):
                _LOGGER.debug(
                    f"✅ Resolved light domain to area light group: {light_group_entity}"
                )
                return light_group_entity
            
            # Fallback to individual lights if group doesn't exist yet
            _LOGGER.debug(
                f"⚠️ Light group {light_group_entity} not found, falling back to individual lights"
            )

        matching_entities = []
        all_entities_in_domain = []
        area_mismatch_entities = []

        for entity in self._entity_registry.entities.values():
            entity_domain = entity.domain

            if entity_domain != domain:
                continue

            # IMPORTANT: Skip entities that are disabled or don't have a state
            # This prevents returning obsolete/deleted entities
            if entity.disabled_by is not None:
                continue
            
            # Check if entity exists in hass.states (entity must be loaded and available)
            state = self.hass.states.get(entity.entity_id)
            if state is None:
                continue

            all_entities_in_domain.append(entity.entity_id)

            if (
                device_class
                and entity.original_device_class != device_class
                and entity.device_class != device_class
            ):
                continue

            entity_area_id = self._get_entity_area_id(entity)

            if entity_area_id != area_id:
                area_mismatch_entities.append(
                    f"{entity.entity_id} (area={entity_area_id})"
                )
                continue

            matching_entities.append(entity.entity_id)

        if not matching_entities:
            _LOGGER.debug(
                f"No entities found for domain={domain}, device_class={device_class}, area={area_id}. "
                f"Found {len(all_entities_in_domain)} entities in domain '{domain}': {all_entities_in_domain[:5]}... "
                f"Found {len(area_mismatch_entities)} entities in other areas: {area_mismatch_entities[:5]}..."
            )
            return None

        _LOGGER.debug(
            f"✅ Resolved {len(matching_entities)} entities for domain={domain}, area={area_id}: {matching_entities}"
        )

        if strategy == "first":
            return matching_entities[0]
        elif strategy == "all":
            return matching_entities
        elif strategy == "any":
            for entity_id in matching_entities:
                state = self.hass.states.get(entity_id)
                if state and state.state in ["on", "true", "active"]:
                    return entity_id
            return matching_entities[0] if matching_entities else None
        else:
            _LOGGER.warning(f"Unknown strategy: {strategy}, using 'first'")
            return matching_entities[0]

    def resolve_condition(
        self,
        condition: dict[str, Any],
        area_id: str,
    ) -> dict[str, Any] | None:
        """
        Resolve generic condition to condition with entity_id(s).

        IMPORTANT: When multiple entities match a generic selector (domain + device_class + area),
        this method automatically expands to an OR condition with all matching entities.
        This ensures that "at least one" sensor being ON triggers the condition.
        
        Example:
            Input:  {"condition": "state", "domain": "binary_sensor", "device_class": "occupancy", "state": "on"}
            
            If 5 occupancy sensors exist in the area, output will be:
            {
                "condition": "or",
                "conditions": [
                    {"condition": "state", "entity_id": "binary_sensor.occupancy_1", "state": "on"},
                    {"condition": "state", "entity_id": "binary_sensor.occupancy_2", "state": "on"},
                    {"condition": "state", "entity_id": "binary_sensor.occupancy_3", "state": "on"},
                    {"condition": "state", "entity_id": "binary_sensor.occupancy_4", "state": "on"},
                    {"condition": "state", "entity_id": "binary_sensor.occupancy_5", "state": "on"}
                ]
            }
            
            This ensures ANY of the 5 sensors being ON will trigger the condition,
            instead of only checking the first one.

        Args:
            condition: Condition with generic selectors or explicit entity_id
            area_id: Area context for resolution

        Returns:
            Resolved condition with entity_id, or OR condition with multiple entities,
            or None if resolution failed
        """
        condition_type = condition.get("condition")

        if condition_type in ["activity", "area_state"]:
            resolved_condition = condition.copy()
            area = condition.get("area")
            target_area_id = area_id if area == "current" or area is None else area
            resolved_condition["area_id"] = target_area_id
            if "area" in resolved_condition:
                del resolved_condition["area"]
            return resolved_condition

        if "entity_id" in condition:
            return condition

        if "domain" not in condition:
            _LOGGER.warning(f"Condition missing domain or entity_id: {condition}")
            return None

        domain = condition.get("domain")
        device_class = condition.get("device_class")
        area = condition.get("area")

        if not domain:
            _LOGGER.warning(f"Condition missing domain: {condition}")
            return None

        target_area_id = area_id if area == "current" or area is None else area

        # Resolve ALL matching entities instead of just first
        matching_entities = self.resolve_entity(
            domain=domain,
            area_id=target_area_id,
            device_class=device_class,
            strategy="all",  # Changed from "first" to "all"
        )

        if not matching_entities:
            _LOGGER.debug(
                f"Cannot resolve condition: domain={domain}, "
                f"device_class={device_class}, area={target_area_id}"
            )
            return None

        # Ensure matching_entities is always a list
        if isinstance(matching_entities, str):
            matching_entities = [matching_entities]

        # If only one entity matches, return simple condition
        if len(matching_entities) == 1:
            resolved_condition = condition.copy()
            resolved_condition["entity_id"] = matching_entities[0]
            
            # Cleanup generic selectors
            for key in ["domain", "device_class", "area"]:
                resolved_condition.pop(key, None)
            
            _LOGGER.debug(
                f"Resolved condition: domain={domain}, device_class={device_class} "
                f"→ entity_id={matching_entities[0]}"
            )
            
            return resolved_condition

        # Multiple entities found: expand to OR condition (at least one must match)
        # This ensures that if ANY sensor of this type is ON, the condition passes
        _LOGGER.debug(
            f"🔄 Expanding condition: {len(matching_entities)} entities found for "
            f"domain={domain}, device_class={device_class}, area={target_area_id} "
            f"→ Creating OR condition"
        )

        expanded_conditions = []
        for entity_id in matching_entities:
            entity_condition = condition.copy()
            entity_condition["entity_id"] = entity_id
            
            # Cleanup generic selectors
            for key in ["domain", "device_class", "area"]:
                entity_condition.pop(key, None)
            
            expanded_conditions.append(entity_condition)

        # Return OR condition wrapping all entity conditions
        return {
            "condition": "or",
            "conditions": expanded_conditions
        }

    def resolve_nested_conditions(
        self,
        conditions: list[dict[str, Any]],
        area_id: str,
    ) -> list[dict[str, Any]]:
        """
        Resolve nested conditions (with 'and'/'or' logic).

        Args:
            conditions: List of conditions (may contain nested conditions)
            area_id: Area context

        Returns:
            List of resolved conditions (nested structure preserved)
        """
        resolved = []

        for condition in conditions:
            condition_type = condition.get("condition")

            if condition_type in ["and", "or"]:
                nested_conditions = condition.get("conditions", [])
                resolved_nested = self.resolve_nested_conditions(
                    nested_conditions, area_id
                )

                if resolved_nested:
                    resolved.append(
                        {
                            "condition": condition_type,
                            "conditions": resolved_nested,
                        }
                    )
            else:
                resolved_condition = self.resolve_condition(condition, area_id)
                if resolved_condition:
                    resolved.append(resolved_condition)

        return resolved

    def _get_entity_area_id(
        self,
        entity: entity_registry.RegistryEntry,
    ) -> str | None:
        """
        Get area ID for entity, checking device if entity has no area.

        Args:
            entity: Entity registry entry

        Returns:
            Area ID or None
        """
        if entity.area_id:
            return entity.area_id

        if entity.device_id:
            device = self._device_registry.async_get(entity.device_id)
            if device and device.area_id:
                return device.area_id

        return None

    async def async_cleanup(self) -> None:
        pass
