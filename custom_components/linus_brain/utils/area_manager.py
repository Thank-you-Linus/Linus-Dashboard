"""
Area Manager for Linus Brain

This module handles the grouping of entities by area and computes
binary presence detection based on multiple sensor inputs.

Key responsibilities:
- Discover entities by domain and device class
- Group entities by area_id
- Compute binary presence detection
- Generate JSON payloads for Supabase

CRITICAL PATTERN - Entity Filtering:
When iterating over entity_registry.entities.values(), ALWAYS filter out:
1. Linus Brain's own entities (entity.platform == DOMAIN)
2. Disabled entities (entity.disabled_by is not None)
3. Entities without state (hass.states.get(entity_id) is None)

The entity registry contains ALL entities ever created, including deleted/disabled ones.
Failing to filter will cause obsolete entities to be included in results, leading to
incorrect evaluations, false negatives, and circular dependencies (e.g., presence
detection binary sensors including themselves).
"""

import logging
from datetime import UTC, datetime
from typing import TYPE_CHECKING, Any

from homeassistant.core import HomeAssistant, State, split_entity_id
from homeassistant.helpers import area_registry, device_registry, entity_registry

if TYPE_CHECKING:
    from homeassistant.config_entries import ConfigEntry
    from ..utils.insights_manager import InsightsManager

# Type alias for JSON-like dictionaries (API payloads, etc.)
JsonDict = dict[str, Any]

from ..const import (
    CONF_PRESENCE_DETECTION_CONFIG,
    DEFAULT_ACTIVITY_TYPES,
    DEFAULT_AUTOLIGHT_APP,
    DEFAULT_DARK_THRESHOLD_LUX,
    DEFAULT_DARK_THRESHOLD_SUN_ELEVATION,
    DEFAULT_PRESENCE_DETECTION_CONFIG,
    DOMAIN,
    MONITORED_DOMAINS,
    PRESENCE_DETECTION_DOMAINS,
)
from .state_validator import is_state_valid

_LOGGER = logging.getLogger(__name__)


def _extract_domains_from_conditions(conditions: list) -> dict[str, set[str]]:
    """
    Recursively extract domains and device_classes from condition structures.

    Args:
        conditions: List of condition dictionaries

    Returns:
        Dictionary mapping domain to set of device_classes
    """
    result: dict[str, set[str]] = {}

    if not conditions:
        return result

    for condition in conditions:
        # Handle nested OR/AND conditions
        if condition.get("condition") in ("or", "and"):
            nested = _extract_domains_from_conditions(condition.get("conditions", []))
            for domain, device_classes in nested.items():
                if domain not in result:
                    result[domain] = set()
                result[domain].update(device_classes)

        # Handle state conditions with domain/device_class
        elif condition.get("condition") == "state":
            domain = condition.get("domain")
            device_class = condition.get("device_class")

            if domain:
                if domain not in result:
                    result[domain] = set()
                if device_class:
                    result[domain].add(device_class)

    return result


def get_monitored_domains() -> dict[str, list[str]]:
    """
    Dynamically compute monitored domains from activity detection conditions.

    Returns:
        Dictionary mapping domain to list of device_classes (empty list = monitor all)
    """
    domains: dict[str, set[str]] = {}

    # 1. Extract from activity detection conditions
    for activity in DEFAULT_ACTIVITY_TYPES.values():
        conditions = activity.get("detection_conditions", [])
        # Ensure conditions is a list before passing to extraction function
        if not isinstance(conditions, list):
            continue
        extracted = _extract_domains_from_conditions(conditions)
        for domain, device_classes in extracted.items():
            if domain not in domains:
                domains[domain] = set()
            domains[domain].update(device_classes)

    # 2. Extract from app conditions (e.g., automatic_lighting)
    activity_actions = DEFAULT_AUTOLIGHT_APP.get("activity_actions", {})
    if isinstance(activity_actions, dict):
        for activity_action in activity_actions.values():
            conditions = activity_action.get("conditions", [])
            # Ensure conditions is a list before passing to extraction function
            if not isinstance(conditions, list):
                continue
            extracted = _extract_domains_from_conditions(conditions)
            for domain, device_classes in extracted.items():
                if domain not in domains:
                    domains[domain] = set()
                domains[domain].update(device_classes)

    # 3. Add base sensors for insights (illuminance, temperature, humidity, presence)
    # These are always monitored from MONITORED_DOMAINS constant
    for domain, device_classes_list in MONITORED_DOMAINS.items():  # type: ignore[attr-defined]
        if domain not in domains:
            domains[domain] = set()
        if isinstance(device_classes_list, list):
            domains[domain].update(device_classes_list)

    # Convert sets to lists (empty list means monitor all entities in that domain)
    result = {}
    for domain, device_classes in domains.items():
        result[domain] = sorted(list(device_classes)) if device_classes else []

    return result


def get_presence_detection_domains() -> dict[str, list[str]]:
    """
    Dynamically compute presence detection domains from activity detection conditions.
    Only includes domains/device_classes used for presence/movement detection.

    Returns:
        Dictionary mapping domain to list of device_classes (empty list = monitor all)
    """
    domains: dict[str, set[str]] = {}

    # 1. Extract only from activities that detect presence (movement, occupied)
    presence_activities = ["movement", "occupied"]
    for activity_id in presence_activities:
        activity = DEFAULT_ACTIVITY_TYPES.get(activity_id)
        if activity:
            conditions = activity.get("detection_conditions", [])
            # Ensure conditions is a list before passing to extraction function
            if not isinstance(conditions, list):
                continue
            extracted = _extract_domains_from_conditions(conditions)
            for domain, device_classes in extracted.items():
                if domain not in domains:
                    domains[domain] = set()
                domains[domain].update(device_classes)

    # 2. Add base presence detection domains (e.g., 'presence' device class)
    # These are always monitored from PRESENCE_DETECTION_DOMAINS constant
    for domain, device_classes_list in PRESENCE_DETECTION_DOMAINS.items():  # type: ignore[attr-defined]
        if domain not in domains:
            domains[domain] = set()
        if isinstance(device_classes_list, list):
            domains[domain].update(device_classes_list)

    # Convert sets to lists
    result = {}
    for domain, device_classes in domains.items():
        result[domain] = sorted(list(device_classes)) if device_classes else []

    return result


class AreaManager:
    """
    Manages area-based entity grouping and binary presence detection.

    This class is responsible for:
    - Identifying relevant entities in each area
    - Reading their current states
    - Computing binary presence detection for each area
    - Formatting data for transmission to Supabase
    """

    def __init__(
        self,
        hass: HomeAssistant,
        insights_manager: "InsightsManager | None" = None,
        config_entry: "ConfigEntry | None" = None,
    ) -> None:
        """
        Initialize the area manager.

        Args:
            hass: Home Assistant instance
            insights_manager: Optional InsightsManager for AI-learned thresholds
            config_entry: Optional config entry for user preferences
        """
        self.hass = hass
        self._entity_registry = entity_registry.async_get(hass)
        self._area_registry = area_registry.async_get(hass)
        self._insights_manager = insights_manager
        self._config_entry = config_entry

    def _get_monitored_entities(self) -> dict[str, list[str]]:
        """
        Get all entities that should be monitored, grouped by area.

        Returns:
            Dictionary mapping area_id to list of entity_ids
        """
        area_entities: dict[str, list[str]] = {}

        # Get dynamically computed monitored domains
        monitored_domains = get_monitored_domains()

        # Iterate through all registered entities
        for entity in self._entity_registry.entities.values():
            # Check if entity is in a monitored domain
            domain = entity.domain

            if domain not in monitored_domains:
                continue

            # IMPORTANT: Skip Linus Brain's own entities to prevent self-inclusion
            # This prevents presence detection binary sensors from including themselves
            if entity.platform == DOMAIN:
                continue

            # IMPORTANT: Skip entities that are disabled or don't have a state
            # This prevents including obsolete/deleted entities
            if entity.disabled_by is not None:
                continue
            
            # Check if entity exists in hass.states (entity must be loaded and available)
            state = self.hass.states.get(entity.entity_id)
            if state is None:
                continue

            # Check device class (if applicable)
            device_classes = monitored_domains[domain]
            if device_classes and entity.original_device_class not in device_classes:
                continue

            # Get the area for this entity
            area_id = entity.area_id

            # If entity doesn't have an area, try to get it from device
            if not area_id and entity.device_id:
                device_registry_instance = device_registry.async_get(self.hass)
                device = device_registry_instance.async_get(entity.device_id)
                if device:
                    area_id = device.area_id

            # Skip entities without an area
            if not area_id:
                continue

            # Add to area's entity list
            if area_id not in area_entities:
                area_entities[area_id] = []
            area_entities[area_id].append(entity.entity_id)

        _LOGGER.debug(f"Found monitored entities in {len(area_entities)} areas")
        return area_entities

    def _get_entity_state(self, entity_id: str) -> State | None:
        """
        Get the current state of an entity.

        Args:
            entity_id: The entity ID

        Returns:
            State object or None if entity doesn't exist
        """
        return self.hass.states.get(entity_id)

    @staticmethod
    def _get_device_class(state: State) -> str | None:
        """
        Get device class from entity state, trying both original_device_class and device_class.

        In Home Assistant, device_class can be in different attributes depending on timing:
        - original_device_class: Set during entity initialization
        - device_class: May not be available immediately after startup

        Args:
            state: Entity state object

        Returns:
            Device class string or None
        """
        return state.attributes.get("original_device_class") or state.attributes.get(
            "device_class"
        )

    def _compute_presence_detected(self, entity_states: dict[str, str | float]) -> bool:
        """
        Compute binary presence detection based on entity states and configuration.

        Dynamically checks enabled detection types based on user configuration.
        Priority order: Config Flow > Cloud > Hardcoded Defaults

        Args:
            entity_states: Dictionary of entity types to their values

        Returns:
            True if presence detected, False otherwise
        """
        # Get the current presence detection configuration
        config = self._get_presence_detection_config()

        # Check each configured detection type
        presence_checks = []

        if config.get("motion", False):
            presence_checks.append(entity_states.get("motion") == "on")

        if config.get("presence", False):
            presence_checks.append(entity_states.get("presence") == "on")

        if config.get("occupancy", False):
            presence_checks.append(entity_states.get("occupancy") == "on")

        if config.get("media_playing", False):
            presence_checks.append(entity_states.get("media") in ["playing", "on"])

        # Return True if ANY enabled detection type is active
        return any(presence_checks) if presence_checks else False

    def _get_presence_detection_config(self) -> dict[str, bool]:
        """
        Get the presence detection configuration based on priority order:
        1. Config Flow (user's personal preference) - Primary source
        2. Cloud (Supabase ha_instances.presence_detection_config) - Secondary/shared default
        3. Hardcoded Defaults (const.py) - Ultimate fallback

        Returns:
            Dictionary mapping detection types to enabled state:
            {
                "motion": True/False,
                "presence": True/False,
                "occupancy": True/False,
                "media_playing": True/False,
            }
        """
        # Priority 1: Config Flow (user's personal preference)
        if self._config_entry and self._config_entry.options:
            config_list = self._config_entry.options.get(CONF_PRESENCE_DETECTION_CONFIG)
            if config_list is not None:
                # Convert list of enabled detection types to dict
                _LOGGER.debug(
                    f"Using presence detection config from config flow: {config_list}"
                )
                return {
                    "motion": "motion" in config_list,
                    "presence": "presence" in config_list,
                    "occupancy": "occupancy" in config_list,
                    "media_playing": "media_playing" in config_list,
                }

        # Priority 2: Cloud (Supabase ha_instances.presence_detection_config)
        # TODO: Implement cloud fetch in future iteration
        # This would query Supabase for ha_instances.presence_detection_config
        # Example implementation:
        # if self._coordinator and hasattr(self._coordinator, 'ha_instance_data'):
        #     cloud_config = self._coordinator.ha_instance_data.get('presence_detection_config')
        #     if cloud_config:
        #         _LOGGER.debug(f"Using presence detection config from cloud: {cloud_config}")
        #         return cloud_config
        # For now, we skip this and fall through to defaults

        # Priority 3: Hardcoded Defaults
        _LOGGER.debug("Using hardcoded default presence detection config")
        default_config: dict[str, JsonDict] = DEFAULT_PRESENCE_DETECTION_CONFIG  # type: ignore[assignment]
        return {
            key: config["enabled"]
            for key, config in default_config.items()
        }

    async def get_area_state(self, area_id: str) -> JsonDict | None:
        """
        Get the current state for a specific area.

        Args:
            area_id: The area ID

        Returns:
            Dictionary containing area data, or None if no data
        """
        # Get area name
        area = self._area_registry.async_get_area(area_id)
        if not area:
            return None

        area_name = area.name

        # Get entities in this area
        area_entities_map = self._get_monitored_entities()
        entity_ids = area_entities_map.get(area_id, [])

        if not entity_ids:
            return None

        # Collect entity states
        entity_states: dict[str, str | float] = {}
        active_presence_entities: list[str] = []

        for entity_id in entity_ids:
            state = self._get_entity_state(entity_id)
            if not is_state_valid(state):
                _LOGGER.debug(
                    f"Skipping entity {entity_id} with invalid state: {state.state if state else 'None'}"
                )
                continue

            domain = split_entity_id(entity_id)[0]

            # Binary sensors (motion, presence, occupancy)
            if domain == "binary_sensor":
                device_class = self._get_device_class(state)
                if device_class in ["motion", "presence", "occupancy"]:
                    entity_states[device_class] = state.state
                    if state.state == "on":
                        active_presence_entities.append(entity_id)

            # Illuminance sensors
            elif domain == "sensor":
                device_class = self._get_device_class(state)
                if device_class == "illuminance":
                    try:
                        entity_states["luminosity"] = float(state.state)
                    except (ValueError, TypeError):
                        pass

            # Media players
            elif domain == "media_player":
                entity_states["media"] = state.state
                if state.state in ["playing", "on"]:
                    active_presence_entities.append(entity_id)

        # Compute binary presence detection
        presence_detected = self._compute_presence_detected(entity_states)

        # Build payload
        payload = {
            "area_id": area_id,
            "area_name": area_name,
            "timestamp": datetime.now().astimezone().isoformat(),
            "entities": {
                "motion": entity_states.get("motion", "off"),
                "presence": entity_states.get("presence", "off"),
                "occupancy": entity_states.get("occupancy", "off"),
                "media": entity_states.get("media", "off"),
                "luminosity": entity_states.get("luminosity", 0.0),
            },
            "presence_detected": presence_detected,
            "active_presence_entities": active_presence_entities,
        }

        return payload

    async def get_all_area_states(self) -> list[JsonDict]:
        """
        Get current states for all areas with monitored entities.

        Returns:
            List of area state dictionaries
        """
        area_entities_map = self._get_monitored_entities()
        area_states = []

        for area_id in area_entities_map.keys():
            area_data = await self.get_area_state(area_id)
            if area_data:
                area_states.append(area_data)

        return area_states

    def get_all_areas(self) -> dict[str, str]:
        """
        Get all areas with monitored entities.

        Returns:
            Dictionary mapping area_id to area_name
        """
        area_entities_map = self._get_monitored_entities()
        areas = {}

        for area_id in area_entities_map.keys():
            area = self._area_registry.async_get_area(area_id)
            if area:
                areas[area_id] = area.name

        return areas

    def get_presence_entities_for_area(self, area_id: str) -> dict[str, list[str]]:
        """
        Get all presence detection entities for a specific area.

        Returns entities grouped by type, regardless of their current state.
        Used by binary_sensor to get the complete list of entities to track.

        Args:
            area_id: The area ID

        Returns:
            Dictionary with lists of entity_ids:
            {
                "motion": [entity_ids...],
                "presence": [entity_ids...],
                "occupancy": [entity_ids...],
                "media": [entity_ids...],
            }
        """
        result: dict[str, list[str]] = {
            "motion": [],
            "presence": [],
            "occupancy": [],
            "media": [],
        }

        # Get all entities in this area
        area_entities_map = self._get_monitored_entities()
        entity_ids = area_entities_map.get(area_id, [])

        for entity_id in entity_ids:
            # Skip disabled entities
            entity = self._entity_registry.async_get(entity_id)
            if not entity or entity.disabled_by is not None:
                continue

            # Skip Linus Brain's own entities to prevent self-inclusion
            if entity.platform == DOMAIN:
                continue

            # Skip entities without state
            state = self.hass.states.get(entity_id)
            if not state:
                continue

            domain = split_entity_id(entity_id)[0]

            # Binary sensors (motion, presence, occupancy)
            if domain == "binary_sensor":
                device_class = self._get_device_class(state)
                if device_class in ["motion", "presence", "occupancy"]:
                    result[device_class].append(entity_id)

            # Media players
            elif domain == "media_player":
                result["media"].append(entity_id)

        return result

    def _get_entity_area_id(self, entity: entity_registry.RegistryEntry) -> str | None:
        """
        Get the area ID for an entity, checking device if entity has no area.

        Args:
            entity: Entity registry entry

        Returns:
            Area ID or None if not found
        """
        if entity.area_id:
            return entity.area_id

        if entity.device_id:
            device_registry_instance = device_registry.async_get(self.hass)
            device = device_registry_instance.async_get(entity.device_id)
            if device and device.area_id:
                return device.area_id

        return None

    def _has_entities_in_area(
        self, area_id: str, domain: str, device_class: str | None = None
    ) -> bool:
        """
        Check if area has entities matching domain and optional device class.

        Args:
            area_id: Area ID to check
            domain: Entity domain (e.g., "light", "binary_sensor")
            device_class: Optional device class filter

        Returns:
            True if matching entities found in area
        """
        _LOGGER.debug(
            f"Checking for entities in area {area_id} with domain {domain} and device_class {device_class}"
        )
        entities = self._entity_registry.entities.values()
        for entity in entities:
            # Skip disabled entities or entities without state
            if entity.disabled_by is not None:
                continue
            if self.hass.states.get(entity.entity_id) is None:
                continue

            entity_area_id = self._get_entity_area_id(entity)

            if entity_area_id != area_id:
                continue

            entity_domain = entity.domain
            if entity_domain != domain:
                continue

            if device_class is not None:
                entity_device_class = (
                    entity.original_device_class or entity.device_class
                )
                if entity_device_class != device_class:
                    continue

            return True

        return False

    def has_presence_detection(
        self,
        area_id: str,
        presence_config: dict[str, list[str]] | None = None,
    ) -> bool:
        """
        Check if area has presence detection capabilities.

        Uses dynamically computed presence detection domains by default, or custom config.

        Args:
            area_id: Area ID to check
            presence_config: Optional custom presence detection config
                           Format: {"domain": ["device_class1", "device_class2"]}
                           Example: {"binary_sensor": ["motion", "presence"]}

        Returns:
            True if area has at least one presence detection entity
        """
        config = presence_config or get_presence_detection_domains()

        for domain, device_classes in config.items():
            if not device_classes:
                if self._has_entities_in_area(area_id, domain):
                    return True
            else:
                for device_class in device_classes:
                    if self._has_entities_in_area(area_id, domain, device_class):
                        return True

        return False

    def get_activity_tracking_areas(self) -> dict[str, str]:
        """
        Get areas with activity tracking capability (presence detection).

        Returns areas that have presence detection entities, regardless of
        whether they have lights or other automation prerequisites.
        Used for creating diagnostic sensors that display area context.

        Returns:
            Dictionary mapping area_id to area_name for areas with presence detection
        """
        eligible_areas = {}

        for area in self._area_registry.async_list_areas():
            if self.has_presence_detection(area.id):
                eligible_areas[area.id] = area.name

        _LOGGER.debug(
            f"Found {len(eligible_areas)} areas with activity tracking capability"
        )
        return eligible_areas

    def get_light_automation_eligible_areas(self) -> dict[str, str]:
        """
        Get areas eligible for light automation switches.

        An area is eligible if it has:
        - At least one light entity
        - At least one presence detection entity (configured in PRESENCE_DETECTION_DOMAINS)

        Returns:
            Dictionary mapping area_id to area_name for eligible areas
        """
        eligible_areas = {}

        for area in self._area_registry.async_list_areas():
            area_id = area.id

            has_light = self._has_entities_in_area(area_id, "light")
            if not has_light:
                continue

            if self.has_presence_detection(area_id):
                eligible_areas[area_id] = area.name

        _LOGGER.debug(
            f"Found {len(eligible_areas)} areas eligible for light automation"
        )
        return eligible_areas

    def get_entity_area(self, entity_id: str) -> str | None:
        """
        Get the area ID for a specific entity.

        Args:
            entity_id: The entity ID to look up

        Returns:
            Area ID or None if not found
        """
        entity = self._entity_registry.async_get(entity_id)
        if not entity:
            return None

        area_id = entity.area_id

        # Try to get from device if entity doesn't have area
        if not area_id and entity.device_id:
            device_registry_instance = device_registry.async_get(self.hass)
            device = device_registry_instance.async_get(entity.device_id)
            if device:
                area_id = device.area_id

        return area_id

    def _get_presence_sensors_for_area(self, area_id: str) -> list[str]:
        """
        Get list of presence sensor entity IDs for a specific area.

        Args:
            area_id: The area ID to get sensors for

        Returns:
            List of entity IDs that can detect presence in the area
        """
        presence_sensors = []
        presence_config = get_presence_detection_domains()

        for entity in self._entity_registry.entities.values():
            # Skip disabled entities or entities without state
            if entity.disabled_by is not None:
                continue
            if self.hass.states.get(entity.entity_id) is None:
                continue

            # Check if entity belongs to this area
            entity_area = entity.area_id
            if not entity_area and entity.device_id:
                device_registry_instance = device_registry.async_get(self.hass)
                device = device_registry_instance.async_get(entity.device_id)
                if device:
                    entity_area = device.area_id

            if entity_area != area_id:
                continue

            # Check if entity is a presence detection entity
            domain = entity.domain
            if domain not in presence_config:
                continue

            device_classes = presence_config[domain]
            if device_classes and entity.original_device_class not in device_classes:
                continue

            presence_sensors.append(entity.entity_id)

        return presence_sensors

    def get_area_presence_binary(
        self, area_id: str, presence_sensors: list[str] | None = None
    ) -> JsonDict:
        """
        Get binary presence detection for an area.

        This method checks if any presence sensor in the area indicates presence.

        Args:
            area_id: The area ID to check
            presence_sensors: Optional list of entity_ids to check.
                            If not provided, will automatically discover
                            presence sensors in the area.

        Returns:
            Dictionary with binary presence and detection reasons:
            {
                "presence_detected": true,
                "detection_reasons": ["binary_sensor.kitchen_motion", ...],
                "timestamp": "2025-10-22T21:00:00Z"
            }
        """
        # If presence_sensors not provided, get them automatically
        if presence_sensors is None:
            presence_sensors = self._get_presence_sensors_for_area(area_id)

        detection_reasons = []

        for entity_id in presence_sensors:
            state = self._get_entity_state(entity_id)
            if not state:
                continue

            domain = split_entity_id(entity_id)[0]

            # Check binary sensors in "on" state
            if domain == "binary_sensor" and state.state == "on":
                detection_reasons.append(entity_id)
            # Check media players playing
            elif domain == "media_player" and state.state == "playing":
                detection_reasons.append(entity_id)

        return {
            "presence_detected": len(detection_reasons) > 0,
            "detection_reasons": detection_reasons,
            "timestamp": datetime.now(UTC).isoformat(),
        }

    # ========================================================================
    # Sensor Aggregation Helper (reduce duplication)
    # ========================================================================

    def _get_area_sensor_average(
        self,
        area_id: str,
        device_class: str,
        registry_attr: str | None = None,
        round_digits: int | None = None,
    ) -> float | None:
        """
        Get average value from sensors of a specific device_class in an area.

        This helper consolidates the duplicated logic in get_area_illuminance,
        get_area_temperature, and get_area_humidity.

        Args:
            area_id: The area ID to check
            device_class: Device class to filter (e.g., "illuminance", "temperature", "humidity")
            registry_attr: Optional area registry attribute to check first (e.g., "temperature_entity_id")
            round_digits: Number of decimal places to round to (None = no rounding)

        Returns:
            Average sensor value, or None if no sensors found
        """
        # Priority 1: Check user-configured sensor from area registry
        if registry_attr:
            area = self._area_registry.async_get_area(area_id)
            if area:
                registry_entity_id = getattr(area, registry_attr, None)
                if registry_entity_id:
                    state = self._get_entity_state(registry_entity_id)
                    if state:
                        try:
                            value = float(state.state)
                            return (
                                round(value, round_digits)
                                if round_digits is not None
                                else value
                            )
                        except (ValueError, TypeError):
                            pass

        # Priority 2: Average all sensors of this device_class in the area
        area_entities_map = self._get_monitored_entities()
        entity_ids = area_entities_map.get(area_id, [])

        sensor_values = []

        for entity_id in entity_ids:
            state = self._get_entity_state(entity_id)
            if not state:
                continue

            domain = split_entity_id(entity_id)[0]

            if domain == "sensor":
                entity_device_class = self._get_device_class(state)
                if entity_device_class == device_class:
                    try:
                        value = float(state.state)
                        sensor_values.append(value)
                    except (ValueError, TypeError):
                        continue

        if sensor_values:
            average = sum(sensor_values) / len(sensor_values)
            return round(average, round_digits) if round_digits is not None else average

        return None

    # ========================================================================
    # Sensor Aggregation Methods (use helper above)
    # ========================================================================

    def get_area_illuminance(self, area_id: str) -> float | None:
        """
        Get average illuminance (lux) for an area.

        This calculates the average lux value from all illuminance sensors in the area.
        Used for light learning context capture.

        Args:
            area_id: The area ID to check

        Returns:
            Average lux value, or None if no illuminance sensors found
        """
        return self._get_area_sensor_average(area_id, "illuminance")

    def get_sun_elevation(self) -> float | None:
        """
        Get the current sun elevation angle.

        This is used as a fallback for illuminance when no area sensors are available.
        The sun elevation indicates how high the sun is in the sky.

        Returns:
            Sun elevation in degrees above horizon, or None if sun.sun entity not available
        """
        sun_state = self._get_entity_state("sun.sun")
        if not sun_state:
            return None

        try:
            elevation = sun_state.attributes.get("elevation")
            if elevation is not None:
                return float(elevation)
        except (ValueError, TypeError):
            pass

        return None

    def get_area_environmental_state(
        self, area_id: str, instance_id: str | None = None
    ) -> JsonDict:
        """
        Get the complete area environmental state for an area.

        Computes:
        - illuminance: Average lux value from sensors
        - temperature: Temperature from configured sensor or average
        - humidity: Humidity from configured sensor or average
        - sun_elevation: Current sun angle
        - is_dark: True if lux < dark_threshold OR sun < 3 degrees

        Thresholds are AI-learned via InsightsManager if available,
        otherwise fall back to defaults (dark=20).

        Args:
            area_id: The area ID to check
            instance_id: Optional instance ID for insights lookup

        Returns:
            Dictionary with all environmental data
        """
        illuminance = self.get_area_illuminance(area_id)
        temperature = self.get_area_temperature(area_id)
        humidity = self.get_area_humidity(area_id)
        sun_elevation = self.get_sun_elevation()

        # Check if sun elevation should be used (default: True)
        use_sun_elevation = True
        if self._config_entry:
            from ..const import CONF_USE_SUN_ELEVATION

            use_sun_elevation = self._config_entry.options.get(
                CONF_USE_SUN_ELEVATION, True
            )

        # If sun elevation is disabled, ignore it
        if not use_sun_elevation:
            original_sun_elevation = sun_elevation
            sun_elevation = None
            _LOGGER.debug(
                f"Sun elevation disabled by config for {area_id}: "
                f"ignoring sun_elevation={original_sun_elevation}"
            )

        _LOGGER.debug(
            f"Raw environmental data for {area_id}: "
            f"illuminance={illuminance}, sun_elevation={sun_elevation}, "
            f"use_sun_elevation={use_sun_elevation}"
        )

        # Determine dark threshold with priority: AI Insight > User Config > Default Constant
        # 1. Start with hardcoded default
        dark_threshold = DEFAULT_DARK_THRESHOLD_LUX  # 20.0 lux

        # 2. Override with user-configured value if available (local default)
        if self._config_entry:
            from ..const import CONF_DARK_LUX_THRESHOLD

            dark_threshold = self._config_entry.options.get(
                CONF_DARK_LUX_THRESHOLD, DEFAULT_DARK_THRESHOLD_LUX
            )

        # 3. Override with AI-learned threshold if available (highest priority)
        if self._insights_manager and instance_id:
            dark_insight = self._insights_manager.get_insight(
                instance_id, area_id, "dark_threshold_lux"
            )
            if dark_insight and "value" in dark_insight:
                # AI insight wins - this is the learned optimal value
                dark_threshold = float(
                    dark_insight["value"].get("threshold", dark_threshold)
                )

        is_dark = False

        if illuminance is not None and sun_elevation is not None:
            _LOGGER.debug(
                f"Area {area_id}: Using both illuminance AND sun_elevation "
                f"(illuminance={illuminance} < {dark_threshold} OR sun_elevation={sun_elevation} < {DEFAULT_DARK_THRESHOLD_SUN_ELEVATION})"
            )
            is_dark = (
                illuminance < dark_threshold
                or sun_elevation < DEFAULT_DARK_THRESHOLD_SUN_ELEVATION
            )
        elif illuminance is not None:
            _LOGGER.debug(
                f"Area {area_id}: Using ONLY illuminance "
                f"(illuminance={illuminance} < {dark_threshold})"
            )
            is_dark = illuminance < dark_threshold
        elif sun_elevation is not None:
            _LOGGER.debug(
                f"Area {area_id}: Using ONLY sun_elevation "
                f"(sun_elevation={sun_elevation} < {DEFAULT_DARK_THRESHOLD_SUN_ELEVATION})"
            )
            is_dark = sun_elevation < DEFAULT_DARK_THRESHOLD_SUN_ELEVATION

        _LOGGER.debug(
            f"Environmental state for {area_id}: "
            f"dark_threshold={dark_threshold}, "
            f"is_dark={is_dark}"
        )

        return {
            "illuminance": illuminance,
            "temperature": temperature,
            "humidity": humidity,
            "sun_elevation": sun_elevation,
            "is_dark": is_dark,
        }

    def get_area_temperature(self, area_id: str) -> float | None:
        """
        Get temperature for an area.

        Priority:
        1. User-configured temperature sensor from area registry
        2. Average of all temperature sensors in the area

        Args:
            area_id: The area ID to check

        Returns:
            Temperature value, or None if no temperature sensors found
        """
        return self._get_area_sensor_average(
            area_id,
            "temperature",
            registry_attr="temperature_entity_id",
            round_digits=1,
        )

    def get_area_humidity(self, area_id: str) -> float | None:
        """
        Get humidity for an area.

        Priority:
        1. User-configured humidity sensor from area registry
        2. Average of all humidity sensors in the area

        Args:
            area_id: The area ID to check

        Returns:
            Humidity value, or None if no humidity sensors found
        """
        return self._get_area_sensor_average(
            area_id, "humidity", registry_attr="humidity_entity_id", round_digits=1
        )

    def get_area_entities(
        self,
        area_id: str,
        domain: str | None = None,
        device_class: str | None = None,
    ) -> list[str]:
        """
        Get all entity IDs in an area, optionally filtered by domain and device_class.

        Args:
            area_id: The area ID to search
            domain: Optional domain filter (e.g., "light", "binary_sensor")
            device_class: Optional device class filter (e.g., "motion", "illuminance")

        Returns:
            List of entity IDs matching the filters
        """
        matching_entities = []

        for entity in self._entity_registry.entities.values():
            # Skip disabled entities or entities without state
            if entity.disabled_by is not None:
                continue
            if self.hass.states.get(entity.entity_id) is None:
                continue

            entity_area_id = self._get_entity_area_id(entity)

            if entity_area_id != area_id:
                continue

            if domain is not None:
                entity_domain = entity.domain
                if entity_domain != domain:
                    continue

            if device_class is not None:
                entity_device_class = (
                    entity.original_device_class or entity.device_class
                )
                if entity_device_class != device_class:
                    continue

            matching_entities.append(entity.entity_id)

        return matching_entities

    def get_tracking_entities(self, area_id: str) -> list[str]:
        """
        Get entity IDs used for activity tracking and environmental state in an area.

        Returns entities from dynamically computed monitored domains (motion, presence,
        illuminance, media_player, etc.) that are actually tracked for area state.

        Args:
            area_id: The area ID

        Returns:
            List of entity IDs used for tracking
        """
        area_entities_map = self._get_monitored_entities()
        return area_entities_map.get(area_id, [])
