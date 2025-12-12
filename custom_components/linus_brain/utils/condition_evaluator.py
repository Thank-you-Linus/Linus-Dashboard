"""
Condition evaluator for automation rules.

Evaluates rule conditions against current Home Assistant state.
Supports multi-condition rules with AND/OR logic and dynamic entity resolution.
"""

import logging
import re
from datetime import datetime
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.helpers import template
from homeassistant.util import dt as dt_util

from .entity_resolver import EntityResolver
from .state_validator import is_state_valid

_LOGGER = logging.getLogger(__name__)


class ConditionEvaluator:
    """
    Evaluates automation rule conditions.

    Supports various condition types:
    - state: Entity state equals value
    - numeric_state: Entity state compared numerically
    - template: Jinja2 template evaluation
    - time: Time-based conditions
    - activity: Activity level in area
    - area_state: Environmental state in area
    - and: Nested conditions (all must be true)
    - or: Nested conditions (at least one must be true)
    """

    def __init__(
        self,
        hass: HomeAssistant,
        entity_resolver: EntityResolver,
        activity_tracker=None,
        area_manager=None,
    ) -> None:
        """
        Initialize the condition evaluator.

        Args:
            hass: Home Assistant instance
            entity_resolver: Entity resolver for generic selectors
            activity_tracker: Optional ActivityTracker instance for activity conditions
            area_manager: Optional AreaManager instance for environmental conditions
        """
        self.hass = hass
        self.entity_resolver = entity_resolver
        self.activity_tracker = activity_tracker
        self.area_manager = area_manager

        # Cache for presence detection config (performance optimization)
        self._presence_config_cache: dict[str, bool] | None = None
        self._cache_timestamp: datetime | None = None
        self._cache_ttl_seconds = 60  # Cache for 60 seconds

    def _get_presence_config_cached(self) -> dict[str, bool]:
        """
        Get presence detection config with caching for performance.

        Cache is valid for 60 seconds to avoid repeated config lookups
        during bulk condition evaluations.

        Returns:
            Dictionary mapping detection types to enabled state
        """
        # Default permissive config
        default_config: dict[str, bool] = {
            "motion": True,
            "presence": True,
            "occupancy": True,
            "media_playing": True,
        }

        now = datetime.now()

        # Check if cache is valid
        cache_expired = (
            self._presence_config_cache is None
            or self._cache_timestamp is None
            or (now - self._cache_timestamp).total_seconds() > self._cache_ttl_seconds
        )

        if cache_expired:
            # Cache miss - fetch fresh config
            if self.area_manager:
                try:
                    config = self.area_manager._get_presence_detection_config()
                    self._presence_config_cache = config
                    self._cache_timestamp = now
                    return config
                except Exception as err:
                    _LOGGER.warning(f"Could not get presence detection config: {err}")
                    return default_config
            else:
                # No area manager - cache and return default config
                self._presence_config_cache = default_config
                self._cache_timestamp = now
                return default_config

        # Cache hit - return cached value
        # At this point cache is guaranteed to be set, but return default as fallback
        return self._presence_config_cache or default_config

    def _should_evaluate_presence_condition(self, condition: dict[str, Any]) -> bool:
        """
        Check if a presence-related condition should be evaluated based on
        the presence detection configuration.

        This filters conditions based on user config (config flow) for which
        sensor types should trigger presence detection.

        Args:
            condition: Condition dictionary to check

        Returns:
            True if condition should be evaluated, False if it should be skipped
        """
        if not self.area_manager:
            # No area manager, evaluate all conditions
            return True

        # Only filter state conditions with device_class or domain
        if condition.get("condition") != "state":
            return True

        # Get presence detection config from cache
        presence_config = self._get_presence_config_cached()

        # Check if this is a presence-related condition
        domain = condition.get("domain")
        device_class = condition.get("device_class")
        entity_id = condition.get("entity_id")

        # Extract domain/device_class from entity_id if not specified
        if entity_id and not domain:
            domain = entity_id.split(".")[0] if "." in entity_id else None

        # If domain is binary_sensor, check device_class against config
        if domain == "binary_sensor":
            # Check motion sensors
            if device_class == "motion" and not presence_config.get("motion", True):
                _LOGGER.debug(
                    f"Skipping motion condition (disabled in config): {condition}"
                )
                return False

            # Check presence sensors
            if device_class == "presence" and not presence_config.get("presence", True):
                _LOGGER.debug(
                    f"Skipping presence condition (disabled in config): {condition}"
                )
                return False

            # Check occupancy sensors
            occupancy_enabled = presence_config.get("occupancy", True)
            _LOGGER.debug(
                f"Occupancy detection check: device_class={device_class}, "
                f"enabled={occupancy_enabled}, presence_config={presence_config}"
            )
            if device_class == "occupancy" and not occupancy_enabled:
                _LOGGER.debug(
                    f"Skipping occupancy condition (disabled in config): {condition}"
                )
                return False

        # If domain is media_player, check media_playing config
        elif domain == "media_player":
            if not presence_config.get("media_playing", True):
                _LOGGER.debug(
                    f"Skipping media_player condition (disabled in config): {condition}"
                )
                return False

        # Not a presence condition, or it's enabled
        return True

    async def evaluate_conditions(
        self,
        conditions: list[dict[str, Any]],
        area_id: str,
        logic: str = "and",
    ) -> bool:
        """
        Evaluate a list of conditions with AND/OR logic.

        Filters conditions based on presence detection configuration before evaluation.

        Args:
            conditions: List of condition dictionaries
            area_id: Area context for entity resolution
            logic: "and" or "or" logic for combining conditions

        Returns:
            True if conditions are met, False otherwise
        """
        if not conditions:
            return True

        _LOGGER.debug(f"Resolving conditions for area {area_id}: {conditions}")

        resolved_conditions = self.entity_resolver.resolve_nested_conditions(
            conditions, area_id
        )

        _LOGGER.debug(f"Resolved conditions for area {area_id}: {resolved_conditions}")

        results = []
        evaluated_count = 0
        skipped_conditions = []  # Track skipped conditions for grouped logging

        for condition in resolved_conditions:
            # Check if this presence-related condition should be evaluated
            if not self._should_evaluate_presence_condition(condition):
                # Track skipped condition type for logging
                condition_type = (
                    condition.get("device_class")
                    or condition.get("domain")
                    or "unknown"
                )
                skipped_conditions.append(condition_type)
                continue

            evaluated_count += 1

            try:
                result = await self._evaluate_single_condition(condition)
                results.append(result)

                _LOGGER.debug(f"Condition {condition} evaluated to {result}")

                if logic == "or" and result:
                    return True

                if logic == "and" and not result:
                    return False

            except Exception as err:
                _LOGGER.error(f"Failed to evaluate condition {condition}: {err}")
                results.append(False)

                if logic == "and":
                    return False

        # Log all skipped conditions in one message (reduces log spam)
        if skipped_conditions:
            _LOGGER.debug(
                f"Skipped {len(skipped_conditions)} conditions (disabled in config): "
                f"{set(skipped_conditions)}"
            )

        # If no conditions were evaluated (all skipped)
        if evaluated_count == 0:
            _LOGGER.debug(
                "All conditions skipped due to presence detection config, returning False"
            )
            return False

        if logic == "and":
            return all(results)
        else:
            return any(results)

    async def _evaluate_single_condition(
        self,
        condition: dict[str, Any],
    ) -> bool:
        """
        Evaluate a single condition.

        Args:
            condition: Condition dictionary with type and parameters

        Returns:
            True if condition is met, False otherwise
        """
        condition_type = condition.get("condition")

        if condition_type == "state":
            return await self._evaluate_state_condition(condition)

        elif condition_type == "numeric_state":
            return await self._evaluate_numeric_state_condition(condition)

        elif condition_type == "template":
            return await self._evaluate_template_condition(condition)

        elif condition_type == "time":
            return await self._evaluate_time_condition(condition)

        elif condition_type == "activity":
            return await self._evaluate_activity_condition(condition)

        elif condition_type == "area_state":
            return await self._evaluate_area_state_condition(condition)

        elif condition_type == "and":
            return await self._evaluate_and_condition(condition)

        elif condition_type == "or":
            return await self._evaluate_or_condition(condition)

        else:
            _LOGGER.warning(f"Unknown condition type: {condition_type}")
            return False

    # Nested condition evaluators - support arbitrary nesting depth via recursion

    async def _evaluate_and_condition(
        self,
        condition: dict[str, Any],
    ) -> bool:
        """
        Evaluate nested AND condition (all nested conditions must be true).

        Args:
            condition: Condition dictionary with 'conditions' list
                       Format: {"condition": "and", "conditions": [condition1, condition2, ...]}

        Returns:
            True if all nested conditions are met, False otherwise
        """
        nested_conditions = condition.get("conditions", [])

        if not nested_conditions:
            _LOGGER.warning("AND condition has no nested conditions, returning True")
            return True

        _LOGGER.debug(
            f"Evaluating AND condition with {len(nested_conditions)} nested conditions"
        )

        evaluated_count = 0

        # Evaluate each nested condition
        for i, nested_condition in enumerate(nested_conditions):
            # Check if this presence-related condition should be evaluated
            if not self._should_evaluate_presence_condition(nested_condition):
                _LOGGER.debug(
                    f"AND condition {i+1}/{len(nested_conditions)}: skipped (disabled in config)"
                )
                continue

            evaluated_count += 1

            try:
                result = await self._evaluate_single_condition(nested_condition)
                _LOGGER.debug(f"AND condition {i+1}/{len(nested_conditions)}: {result}")

                # Short-circuit: if any condition is False, return False immediately
                if not result:
                    _LOGGER.debug(f"AND condition failed at condition {i+1}")
                    return False

            except Exception as err:
                _LOGGER.error(f"Failed to evaluate nested AND condition {i+1}: {err}")
                # Treat errors as False for AND conditions
                return False

        # If no conditions were evaluated (all skipped), treat as False
        if evaluated_count == 0:
            _LOGGER.debug("All AND conditions skipped due to presence detection config")
            return False

        _LOGGER.debug("All AND conditions passed")
        return True

    async def _evaluate_or_condition(
        self,
        condition: dict[str, Any],
    ) -> bool:
        """
        Evaluate nested OR condition (at least one nested condition must be true).

        Args:
            condition: Condition dictionary with 'conditions' list
                       Format: {"condition": "or", "conditions": [condition1, condition2, ...]}

        Returns:
            True if any nested condition is met, False if all fail
        """
        nested_conditions = condition.get("conditions", [])

        if not nested_conditions:
            _LOGGER.warning("OR condition has no nested conditions, returning False")
            return False

        _LOGGER.debug(
            f"Evaluating OR condition with {len(nested_conditions)} nested conditions"
        )

        # Track results for logging
        results = []
        skipped_count = 0

        # Evaluate each nested condition
        for i, nested_condition in enumerate(nested_conditions):
            # Check if this presence-related condition should be evaluated
            if not self._should_evaluate_presence_condition(nested_condition):
                _LOGGER.debug(
                    f"OR condition {i+1}/{len(nested_conditions)}: skipped (disabled in config)"
                )
                skipped_count += 1
                continue

            try:
                result = await self._evaluate_single_condition(nested_condition)
                _LOGGER.debug(f"OR condition {i+1}/{len(nested_conditions)}: {result}")
                results.append(result)

                # Short-circuit: if any condition is True, return True immediately
                if result:
                    _LOGGER.debug(f"OR condition passed at condition {i+1}")
                    return True

            except Exception as err:
                _LOGGER.error(f"Failed to evaluate nested OR condition {i+1}: {err}")
                results.append(False)
                # Continue evaluating other conditions (don't fail entire OR)

        # If all conditions were skipped, treat as False
        if skipped_count == len(nested_conditions):
            _LOGGER.debug("All OR conditions skipped due to presence detection config")
            return False

        _LOGGER.debug(f"All OR conditions failed: {results}")
        return False

    async def _evaluate_state_condition(
        self,
        condition: dict[str, Any],
    ) -> bool:
        """
        Evaluate state condition (entity state equals value).

        Args:
            condition: Condition with entity_id and state

        Returns:
            True if entity state matches
        """
        entity_id = condition.get("entity_id")
        expected_state = condition.get("state")

        if not entity_id or expected_state is None:
            _LOGGER.debug(f"State condition missing entity_id or state: {condition}")
            return False

        state = self.hass.states.get(entity_id)
        if not is_state_valid(state):
            _LOGGER.debug(
                f"Entity {entity_id} has invalid state: {state.state if state else 'None'}"
            )
            return False

        for_duration = condition.get("for")
        if for_duration:
            _LOGGER.warning("Duration conditions ('for') not yet supported")

        result = state.state == str(expected_state)
        _LOGGER.debug(
            f"State check: {entity_id} = {state.state}, expected = {expected_state}, match = {result}"
        )

        return result

    async def _evaluate_numeric_state_condition(
        self,
        condition: dict[str, Any],
    ) -> bool:
        """
        Evaluate numeric state condition (above/below thresholds).

        Args:
            condition: Condition with entity_id, above/below

        Returns:
            True if numeric condition is met
        """
        entity_id = condition.get("entity_id")
        above = condition.get("above")
        below = condition.get("below")

        if not entity_id:
            return False

        state = self.hass.states.get(entity_id)
        if not is_state_valid(state):
            _LOGGER.debug(
                f"Entity {entity_id} has invalid state: {state.state if state else 'None'}"
            )
            return False

        try:
            value = float(state.state)
        except (ValueError, TypeError):
            _LOGGER.debug(f"Cannot convert {entity_id} state to number: {state.state}")
            return False

        if above is not None and value <= float(above):
            return False

        if below is not None and value >= float(below):
            return False

        return True

    async def _evaluate_template_condition(
        self,
        condition: dict[str, Any],
    ) -> bool:
        """
        Evaluate template condition (Jinja2 template).

        Args:
            condition: Condition with value_template

        Returns:
            True if template evaluates to True
        """
        value_template = condition.get("value_template")

        if not value_template:
            return False

        try:
            tpl = template.Template(value_template, self.hass)
            result = tpl.async_render()

            return result in [True, "True", "true", "yes", "on", "1"]

        except Exception as err:
            _LOGGER.error(f"Template evaluation failed: {err}")
            return False

    async def _evaluate_time_condition(
        self,
        condition: dict[str, Any],
    ) -> bool:
        """
        Evaluate time condition (before/after times).

        Args:
            condition: Condition with before/after times

        Returns:
            True if current time is within range
        """
        after = condition.get("after")
        before = condition.get("before")

        now = dt_util.now().time()

        if after:
            after_time = self._parse_time(after)
            if after_time and now < after_time:
                return False

        if before:
            before_time = self._parse_time(before)
            if before_time and now > before_time:
                return False

        return True

    def _parse_time(self, time_str: str) -> Any:
        """
        Parse time string (HH:MM:SS or HH:MM).

        Args:
            time_str: Time string

        Returns:
            time object or None
        """
        try:
            parts = time_str.split(":")
            if len(parts) == 2:
                return datetime.strptime(time_str, "%H:%M").time()
            elif len(parts) == 3:
                return datetime.strptime(time_str, "%H:%M:%S").time()
        except Exception as err:
            _LOGGER.error(f"Failed to parse time {time_str}: {err}")

        return None

    def get_referenced_entities(
        self,
        conditions: list[dict[str, Any]],
        area_id: str | None = None,
    ) -> set[str]:
        """
        Extract all entity IDs referenced in conditions.

        Used for dynamic listener registration.

        Args:
            conditions: List of condition dictionaries
            area_id: Area context for resolving generic selectors

        Returns:
            Set of entity IDs
        """
        entities = set()

        for condition in conditions:
            condition_type = condition.get("condition")

            if condition_type in ["and", "or"]:
                nested_conditions = condition.get("conditions", [])
                nested_entities = self.get_referenced_entities(
                    nested_conditions, area_id
                )
                entities.update(nested_entities)
                continue

            if condition_type in ["activity", "area_state"]:
                continue

            entity_id = condition.get("entity_id")
            if entity_id:
                entities.add(entity_id)
                continue

            domain = condition.get("domain")
            if domain and area_id:
                device_class = condition.get("device_class")
                area = condition.get("area")
                target_area_id = area_id if area == "current" or area is None else area

                resolved_entities = self.entity_resolver.resolve_entity(
                    domain=domain,
                    area_id=target_area_id,
                    device_class=device_class,
                    strategy="all",
                )

                if resolved_entities:
                    if isinstance(resolved_entities, list):
                        entities.update(resolved_entities)
                    else:
                        entities.add(resolved_entities)
                continue

            value_template = condition.get("value_template")
            if value_template:
                template_entities = self._extract_entities_from_template(value_template)
                entities.update(template_entities)

        return entities

    def _extract_entities_from_template(self, template_str: str) -> set[str]:
        """
        Extract entity IDs from Jinja2 template.

        Args:
            template_str: Template string

        Returns:
            Set of entity IDs
        """
        entities = set()

        pattern = r"states\(['\"]([a-z_]+\.[a-z0-9_]+)['\"]\)"
        matches = re.findall(pattern, template_str)
        entities.update(matches)

        pattern = r"states\.([a-z_]+)\.([a-z0-9_]+)"
        matches = re.findall(pattern, template_str)
        for domain, object_id in matches:
            entities.add(f"{domain}.{object_id}")

        return entities

    async def _evaluate_activity_condition(
        self,
        condition: dict[str, Any],
    ) -> bool:
        """
        Evaluate activity condition (presence level in area).

        Args:
            condition: Condition with area_id and expected activity state
                      Format after resolution: {"condition": "activity", "area_id": "...", "activity": "presence|occupation|none"}

        Returns:
            True if activity matches expected state
        """
        expected_activity = condition.get("activity")
        area_id = condition.get("area_id")

        if not expected_activity or not area_id:
            _LOGGER.warning(
                f"Activity condition missing 'activity' or 'area_id': {condition}"
            )
            return False

        try:
            if self.activity_tracker:
                activity_level = await self.activity_tracker.get_activity_level(area_id)
            else:
                from .activity_tracker import ActivityTracker

                activity_tracker = ActivityTracker(self.hass)
                activity_level = await activity_tracker.get_activity_level(area_id)

            return activity_level == expected_activity

        except Exception as err:
            _LOGGER.error(f"Failed to evaluate activity condition: {err}")
            return False

    async def _evaluate_area_state_condition(
        self,
        condition: dict[str, Any],
    ) -> bool:
        """
        Evaluate area state condition (environmental attributes).

        Args:
            condition: Condition with area_id and state/attribute to check
                      Format after resolution: {"condition": "area_state", "area_id": "...", "state": "is_dark"}
                      OR: {"condition": "area_state", "area_id": "...", "attribute": "is_dark"}

        Returns:
            True if area state matches expected value
        """
        state_attr = condition.get("state") or condition.get("attribute")
        area_id = condition.get("area_id")

        if not state_attr or not area_id:
            _LOGGER.warning(
                f"Area state condition missing 'state'/'attribute' or 'area_id': {condition}"
            )
            return False

        try:
            # Use existing area_manager if available, otherwise create new one
            if self.area_manager:
                area_manager = self.area_manager
            else:
                from .area_manager import AreaManager

                area_manager = AreaManager(self.hass)

            area_state = area_manager.get_area_environmental_state(area_id)

            if state_attr not in area_state:
                _LOGGER.warning(f"Unknown area state attribute: {state_attr}")
                return False

            value = area_state[state_attr]

            if isinstance(value, bool):
                return value

            _LOGGER.warning(
                f"Area state attribute {state_attr} is not boolean: {value}"
            )
            return False

        except Exception as err:
            _LOGGER.error(f"Failed to evaluate area state condition: {err}")
            return False
