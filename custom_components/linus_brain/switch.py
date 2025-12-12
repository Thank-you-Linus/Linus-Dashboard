"""
Switch platform for Linus Brain automation engine.

Provides per-area feature flag switches (switch.linus_brain_{area}_{feature}).
Each switch controls whether a specific feature/app is active for a specific area.
Activities (movement/inactive/empty) remain always active.

Switches are created dynamically based on feature requirements:
- Features with required_domains only get switches in areas with those entities
- Switches are created immediately at startup for areas that qualify
- DynamicEntityManager monitors for new entities and creates switches as needed
"""

import logging
from typing import Any

from homeassistant.components.switch import SwitchEntity
from homeassistant.config_entries import ConfigEntry
from homeassistant.core import HomeAssistant
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers.entity_platform import AddEntitiesCallback
from homeassistant.helpers.restore_state import RestoreEntity

from .const import DOMAIN, get_area_device_info  # type: ignore[attr-defined]

_LOGGER = logging.getLogger(__name__)


async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """
    Set up Linus Brain switches from a config entry.

    Creates feature flag switches for areas that meet feature requirements.
    Uses DynamicEntityManager to create switches as new qualifying areas emerge.

    Args:
        hass: Home Assistant instance
        entry: Config entry
        async_add_entities: Callback to add entities
    """
    from .utils.dynamic_entity_manager import DynamicEntityManager
    
    coordinator = hass.data[DOMAIN][entry.entry_id]["coordinator"]
    feature_flag_manager = coordinator.feature_flag_manager
    
    # Get registries
    entity_reg = er.async_get(hass)
    device_reg = dr.async_get(hass)
    area_reg = ar.async_get(hass)
    
    feature_definitions = feature_flag_manager.get_feature_definitions()

    def _get_entity_area_id(entity_entry: er.RegistryEntry) -> str | None:
        """Get area_id for an entity."""
        area_id = entity_entry.area_id
        
        # If no direct area, check device
        if not area_id and entity_entry.device_id:
            device = device_reg.async_get(entity_entry.device_id)
            if device and device.area_id:
                area_id = device.area_id
        
        return area_id

    def _get_areas_with_domain(domain: str) -> set[str]:
        """
        Get set of area_ids that have entities in the specified domain.
        
        Args:
            domain: Entity domain to search for (e.g., 'light', 'climate')
            
        Returns:
            Set of area_ids that contain at least one entity of that domain
        """
        areas = set()
        
        for entity_id, entity_entry in entity_reg.entities.items():
            # Check if matching domain
            if entity_entry.domain != domain:
                continue

            # Skip disabled entities
            if entity_entry.disabled:
                continue

            # Skip Linus Brain's own entities
            if entity_id.startswith(f"{domain}.{DOMAIN}_"):
                continue

            # Get area_id
            area_id = _get_entity_area_id(entity_entry)
            if area_id:
                areas.add(area_id)
        
        return areas

    def _area_meets_requirements(area_id: str, feature_def: dict[str, Any]) -> bool:
        """
        Check if an area meets the requirements for a feature.
        
        Args:
            area_id: Area ID to check
            feature_def: Feature definition with optional required_domains
            
        Returns:
            True if area meets requirements, False otherwise
        """
        required_domains = feature_def.get("required_domains", [])
        
        # If no requirements, area qualifies
        if not required_domains:
            return True
        
        # Check if area has at least one entity from each required domain
        for domain in required_domains:
            areas_with_domain = _get_areas_with_domain(domain)
            if area_id not in areas_with_domain:
                return False
        
        return True

    def _get_qualifying_areas() -> dict[str, dict[str, set[str]]]:
        """
        Get all areas that qualify for each feature.
        
        Returns:
            Dict mapping feature_id to dict of {area_id: set of entity_ids that caused qualification}
        """
        qualifying_areas: dict[str, dict[str, set[str]]] = {}
        
        for feature_id, feature_def in feature_definitions.items():
            qualifying_areas[feature_id] = {}
            required_domains = feature_def.get("required_domains", [])
            
            if not required_domains:
                # No requirements - all areas qualify
                for area in area_reg.async_list_areas():
                    qualifying_areas[feature_id][area.id] = set()
            else:
                # Find areas with all required domains
                # Start with areas that have the first required domain
                candidate_areas = _get_areas_with_domain(required_domains[0])
                
                # Intersect with areas that have other required domains
                for domain in required_domains[1:]:
                    candidate_areas &= _get_areas_with_domain(domain)
                
                # Add to qualifying areas
                for area_id in candidate_areas:
                    qualifying_areas[feature_id][area_id] = set()
        
        return qualifying_areas

    # Get initial qualifying areas
    qualifying_areas = _get_qualifying_areas()
    
    # Create switches for qualifying areas
    switches = []
    switches_by_key = {}
    
    for feature_id, areas in qualifying_areas.items():
        feature_def = feature_definitions[feature_id]
        for area_id in areas:
            switch = LinusBrainFeatureSwitch(
                hass, entry, area_id, feature_id, feature_def
            )
            switches.append(switch)
            switch_key = f"{area_id}_{feature_id}"
            switches_by_key[switch_key] = switch

    if switches:
        hass.data[DOMAIN][entry.entry_id]["feature_switches"] = switches_by_key
        async_add_entities(switches)
        
        # Count switches per feature
        feature_counts = {}
        for feature_id in qualifying_areas:
            feature_counts[feature_id] = len(qualifying_areas[feature_id])
        
        _LOGGER.info(
            f"Added {len(switches)} Linus Brain feature switches initially: "
            f"{', '.join(f'{count} {fid}' for fid, count in feature_counts.items())}"
        )
    else:
        _LOGGER.warning("No feature switches created initially - no qualifying areas")

    # Collect all domains that any feature requires
    all_required_domains = set()
    for feature_def in feature_definitions.values():
        required_domains = feature_def.get("required_domains", [])
        all_required_domains.update(required_domains)
    
    if all_required_domains:
        # Set up dynamic entity manager to monitor required domains
        monitored_domains = list(all_required_domains)
        
        # Callback to check if area should have switches created
        def _should_create_for_area(area_id: str) -> bool:
            """Check if any feature qualifies for this area."""
            for feature_id, feature_def in feature_definitions.items():
                switch_key = f"{area_id}_{feature_id}"
                if switch_key in switches_by_key:
                    continue  # Already exists
                if _area_meets_requirements(area_id, feature_def):
                    return True
            return False
        
        # Callback to create switches for an area
        def _create_entities_for_area(area_id: str, area_name: str) -> list[Any]:
            """Create all qualifying switches for an area."""
            new_switches = []
            for feature_id, feature_def in feature_definitions.items():
                switch_key = f"{area_id}_{feature_id}"
                if switch_key in switches_by_key:
                    continue
                if _area_meets_requirements(area_id, feature_def):
                    switch = LinusBrainFeatureSwitch(
                        hass, entry, area_id, feature_id, feature_def
                    )
                    new_switches.append(switch)
                    switches_by_key[switch_key] = switch
            return new_switches
        
        dynamic_manager = DynamicEntityManager(
            hass=hass,
            entry=entry,
            async_add_entities=async_add_entities,
            platform_name="feature_switches",
            monitored_domains=monitored_domains,
            monitored_device_classes=None,  # Monitor all entities in these domains
            should_create_for_area_callback=_should_create_for_area,
            create_entities_callback=_create_entities_for_area,
        )
        
        await dynamic_manager.async_setup()
        _LOGGER.info(
            f"Dynamic entity manager setup complete for feature switches (monitoring {monitored_domains})"
        )
        
        # Store for cleanup
        hass.data[DOMAIN][entry.entry_id]["feature_switch_dynamic_manager"] = dynamic_manager


class LinusBrainFeatureSwitch(RestoreEntity, SwitchEntity):
    """
    Per-area feature flag switch.

    Controls whether a specific feature/app is active for a specific area.
    Activities (movement/inactive/empty) remain always active regardless of switch state.
    Restores state after Home Assistant restart.
    """

    def __init__(
        self,
        hass: HomeAssistant,
        entry: ConfigEntry,
        area_id: str,
        feature_id: str,
        feature_def: dict[str, Any],
    ) -> None:
        """
        Initialize feature switch.

        Args:
            hass: Home Assistant instance
            entry: Config entry
            area_id: Area ID
            feature_id: Feature ID
            feature_def: Feature definition dictionary
        """
        self.hass = hass
        self._entry = entry
        self._area_id = area_id
        self._feature_id = feature_id
        self._feature_def = feature_def

        # Default OFF, will be restored from feature flag manager
        self._attr_is_on = False
        self._translations: dict[str, Any] | None = None

        # Get proper area name from area registry
        area_registry = ar.async_get(hass)
        area = area_registry.async_get_area(area_id)
        area_name = area.name if area else area_id.replace("_", " ").title()

        # Set entity attributes
        self._attr_unique_id = f"{DOMAIN}_feature_{feature_id}_{area_id}"
        self._attr_has_entity_name = True
        self._attr_suggested_object_id = (
            f"{DOMAIN}_feature_{feature_id}_{area_id}"  # Force English entity_id
        )

        # Use translation key for proper localization
        self._attr_translation_key = f"feature_{feature_id}"
        self._attr_translation_placeholders = {"area_name": area_name}

        # Associate with area-specific device
        self._attr_device_info = get_area_device_info(  # type: ignore[assignment]
            entry.entry_id, area_id, area_name
        )

        # Mark as config entity
        # self._attr_entity_category = EntityCategory.CONFIG

        # Set icon based on feature type
        if feature_id == "automatic_lighting":
            self._attr_icon = "mdi:lightbulb-auto"
        else:
            self._attr_icon = "mdi:application-cog"

    async def async_added_to_hass(self) -> None:
        """Run when entity is added to hass - restore state using RestoreEntity."""
        await super().async_added_to_hass()

        # Try to restore previous state from Home Assistant
        last_state = await self.async_get_last_state()
        if last_state is not None:
            self._attr_is_on = last_state.state == "on"
            _LOGGER.info(
                f"Restored feature state for {self.entity_id}: {self._attr_is_on} "
                f"(from previous state: {last_state.state})"
            )
        else:
            # No previous state - use feature definition default
            self._attr_is_on = self._feature_def.get("default_enabled", False)
            _LOGGER.info(
                f"No previous state for {self.entity_id}, using default: {self._attr_is_on}"
            )

    async def async_turn_on(self, **kwargs: Any) -> None:
        """Turn the feature on and evaluate rules immediately."""
        self._attr_is_on = True
        self.async_write_ha_state()
        _LOGGER.info(f"Feature {self._feature_id} ENABLED for area {self._area_id}")

        # Trigger immediate rule evaluation if rule engine is available
        from .const import DOMAIN

        rule_engine = (
            self.hass.data.get(DOMAIN, {})
            .get(self._entry.entry_id, {})
            .get("rule_engine")
        )
        if rule_engine:
            _LOGGER.info(
                f"Triggering immediate rule evaluation for {self._area_id} after enabling {self._feature_id}"
            )
            # Schedule evaluation in background to avoid blocking switch response
            self.hass.async_create_task(
                rule_engine._async_evaluate_and_execute(
                    self._area_id, is_environmental=False
                )
            )

    async def async_turn_off(self, **kwargs: Any) -> None:
        """
        Turn the feature off.

        Note: This only disables future automation. It does not change the current
        state of devices (e.g., lights remain on if they were on). This allows users
        to disable automation without disrupting their current environment.
        """
        self._attr_is_on = False
        self.async_write_ha_state()
        _LOGGER.info(
            f"Feature {self._feature_id} DISABLED for area {self._area_id}. "
            "Current device states are preserved."
        )

    @property
    def extra_state_attributes(self) -> dict[str, Any]:
        """
        Return extra state attributes for the switch.
        
        Provides useful information about the feature requirements and configuration.
        """
        attributes: dict[str, Any] = {
            "feature_id": self._feature_id,
            "area_id": self._area_id,
            "description": self._feature_def.get("description", ""),
        }
        
        # Add required_domains if present
        required_domains = self._feature_def.get("required_domains", [])
        if required_domains:
            attributes["required_domains"] = required_domains
            attributes["requirements_info"] = (
                f"This feature requires entities from: {', '.join(required_domains)}"
            )
        else:
            attributes["requirements_info"] = "No domain requirements (works in all areas)"
        
        # Add app_id for reference
        app_id = self._feature_def.get("app_id")
        if app_id:
            attributes["app_id"] = app_id
        
        return attributes
