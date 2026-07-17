"""
Binary sensor platform for Linus Dashboard.

Creates two families of nested area/floor/global group entities:
1. Presence detection — a composite OR-gate over motion/presence/occupancy
   binary_sensor device_classes plus media_player domain, mirroring what
   Linus Brain's PresenceDetectionBinarySensor used to provide before this
   feature moved here (see plan: presence/light groups are mechanical
   aggregation, not AI, so they belong in Dashboard, available to every user
   rather than gated behind an optional companion integration).
2. Generic per-device_class binary_sensor groups (door, window, smoke, ...)
   for every device_class other than the presence-related ones above, which
   are already covered by the composite group.

Both use the same nested hierarchy as light.py: global groups reference the
entity_id of floor groups, floor groups reference the entity_id of area
groups, only area groups scan raw entities. See entity_group.py for the
shared scanning/self-exclusion logic.
"""

import logging

from homeassistant.components.binary_sensor import (
    BinarySensorDeviceClass,
    BinarySensorEntity,
)
from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ENTITY_ID, EntityCategory
from homeassistant.core import HomeAssistant
from homeassistant.helpers.entity_platform import AddEntitiesCallback

from .const import (
    DOMAIN,
    get_area_device_info,
    get_floor_device_info,
    get_global_device_info,
)
from .entity_group import (
    ExclusionConfig,
    NestedGroupMixin,
    ScopedMembers,
    compute_group_attributes,
    domain_is_excluded,
    resolve_floors_for_areas,
    scan_domain_members,
)
from .group_manager import PlatformGroupManager

_LOGGER = logging.getLogger(__name__)

PRESENCE_DEVICE_CLASSES = ("motion", "presence", "occupancy")

# Platform-level registries of live entities, keyed by unique_id, so dynamic
# refreshes can update existing entities (update_members) instead of
# recreating them, and remove ones that became empty.
_PRESENCE_GROUPS: dict[str, "PresenceGroup"] = {}
_DEVICE_CLASS_GROUPS: dict[str, "BinarySensorDeviceClassGroup"] = {}


class PresenceGroup(NestedGroupMixin, BinarySensorEntity):
    """Composite presence detection group (motion/presence/occupancy/media)."""

    _attr_device_class = BinarySensorDeviceClass.OCCUPANCY
    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(
        self,
        hass: HomeAssistant,
        *,
        unique_id: str,
        translation_key: str,
        translation_placeholders: dict[str, str] | None,
        device_info: dict,
        member_entity_ids: list[str],
        breakdown: dict[str, list[str]] | None = None,
    ) -> None:
        super().__init__()
        self._init_group(
            hass,
            unique_id=unique_id,
            entity_id_prefix="binary_sensor",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )
        # Breakdown by type only meaningful at area scope (raw sensors) — kept
        # empty at floor/global scope where members are nested group entities.
        self._breakdown = breakdown or {}

    def _recompute(self) -> None:
        active_ids: list[str] = []
        for entity_id in self._member_entity_ids:
            state_obj = self.hass.states.get(entity_id)
            if not state_obj or state_obj.state in ("unavailable", "unknown"):
                continue
            if state_obj.state in ("on", "playing"):
                active_ids.append(entity_id)

        self._attr_is_on = len(active_ids) > 0
        attrs = {
            ATTR_ENTITY_ID: list(self._member_entity_ids),
            "total": len(self._member_entity_ids),
            "active_entity_ids": active_ids,
        }
        for key, entity_ids in self._breakdown.items():
            attrs[f"{key}_entity_ids"] = entity_ids
        self._attr_extra_state_attributes = attrs


class BinarySensorDeviceClassGroup(NestedGroupMixin, BinarySensorEntity):
    """Generic per-device_class binary_sensor group (door, window, smoke, ...)."""

    _attr_entity_category = EntityCategory.DIAGNOSTIC

    def __init__(
        self,
        hass: HomeAssistant,
        *,
        unique_id: str,
        translation_key: str,
        translation_placeholders: dict[str, str] | None,
        device_info: dict,
        member_entity_ids: list[str],
        device_class: str,
    ) -> None:
        super().__init__()
        self._device_class = device_class
        self._attr_device_class = device_class
        self._init_group(
            hass,
            unique_id=unique_id,
            entity_id_prefix="binary_sensor",
            translation_key=translation_key,
            translation_placeholders=translation_placeholders,
            device_info=device_info,
            member_entity_ids=member_entity_ids,
        )

    def _recompute(self) -> None:
        attrs = compute_group_attributes(
            self.hass,
            domain="binary_sensor",
            device_class=self._device_class,
            member_entity_ids=self._member_entity_ids,
        )
        self._attr_is_on = attrs["total"] > 0 and len(attrs["active_entity_ids"]) > 0
        self._attr_extra_state_attributes = attrs


def _merge_presence_scans(
    scans: dict[str, ScopedMembers],
) -> tuple[dict[str, list[str]], dict[str, str], dict[str, dict[str, list[str]]]]:
    """
    Merge motion/presence/occupancy/media scans into one composite per area.

    Returns (area_entities, area_names, area_breakdown) where area_breakdown
    maps area_id -> {"motion": [...], "presence": [...], ...}.
    """
    area_entities: dict[str, list[str]] = {}
    area_names: dict[str, str] = {}
    area_breakdown: dict[str, dict[str, list[str]]] = {}

    for kind, scoped in scans.items():
        for area_id, entity_ids in scoped.area_entities.items():
            area_entities.setdefault(area_id, []).extend(entity_ids)
            area_names[area_id] = scoped.area_names[area_id]
            area_breakdown.setdefault(area_id, {})[kind] = entity_ids

    return area_entities, area_names, area_breakdown


def _get_or_create_presence_group(
    hass: HomeAssistant,
    unique_id: str,
    translation_key: str,
    translation_placeholders: dict[str, str] | None,
    device_info: dict,
    member_entity_ids: list[str],
    breakdown: dict[str, list[str]] | None = None,
) -> PresenceGroup:
    """
    Idempotent: reuse the existing entity for this unique_id (scheduling a
    member-list update on it) instead of constructing a duplicate — lets the
    caller tell genuinely new groups apart from ones that already exist.
    """
    existing = _PRESENCE_GROUPS.get(unique_id)
    if existing is not None:
        hass.async_create_task(existing.async_update_members(member_entity_ids))
        return existing

    group = PresenceGroup(
        hass,
        unique_id=unique_id,
        translation_key=translation_key,
        translation_placeholders=translation_placeholders,
        device_info=device_info,
        member_entity_ids=member_entity_ids,
        breakdown=breakdown,
    )
    _PRESENCE_GROUPS[unique_id] = group
    return group


async def _build_presence_groups(
    hass: HomeAssistant, config_entry: ConfigEntry, exclusions: ExclusionConfig
) -> list[PresenceGroup]:
    """Build presence groups at area, floor and global scope (nested)."""
    scans = {
        "motion": scan_domain_members(
            hass, domain="binary_sensor", device_class="motion", exclusions=exclusions
        ),
        "presence": scan_domain_members(
            hass, domain="binary_sensor", device_class="presence", exclusions=exclusions
        ),
        "occupancy": scan_domain_members(
            hass,
            domain="binary_sensor",
            device_class="occupancy",
            exclusions=exclusions,
        ),
        "media": scan_domain_members(
            hass, domain="media_player", device_class=None, exclusions=exclusions
        ),
    }
    area_entities, area_names, area_breakdown = _merge_presence_scans(scans)

    entry_id = config_entry.entry_id
    entities: list[PresenceGroup] = []
    area_group_ids: dict[str, str] = {}

    for area_id, member_ids in area_entities.items():
        if not member_ids:
            continue
        unique_id = f"{DOMAIN}_presence_detection_area_{area_id}"
        group = _get_or_create_presence_group(
            hass,
            unique_id,
            "presence_detection",
            {"name": area_names[area_id]},
            get_area_device_info(entry_id, area_id, area_names[area_id]),
            member_ids,
            breakdown=area_breakdown.get(area_id),
        )
        entities.append(group)
        area_group_ids[area_id] = group.entity_id

    floor_areas, floor_names = resolve_floors_for_areas(
        hass, set(area_group_ids), exclusions
    )
    floor_group_ids: list[str] = []
    for floor_id, areas_on_floor in floor_areas.items():
        member_ids = [area_group_ids[a] for a in areas_on_floor if a in area_group_ids]
        if not member_ids:
            continue
        unique_id = f"{DOMAIN}_presence_detection_floor_{floor_id}"
        group = _get_or_create_presence_group(
            hass,
            unique_id,
            "presence_detection",
            {"name": floor_names.get(floor_id, floor_id)},
            get_floor_device_info(
                entry_id, floor_id, floor_names.get(floor_id, floor_id)
            ),
            member_ids,
        )
        entities.append(group)
        floor_group_ids.append(group.entity_id)

    if floor_group_ids:
        unique_id = f"{DOMAIN}_presence_detection_global"
        group = _get_or_create_presence_group(
            hass,
            unique_id,
            "presence_detection_global",
            None,
            get_global_device_info(entry_id),
            floor_group_ids,
        )
        entities.append(group)

    return entities


def _discover_generic_device_classes(
    hass: HomeAssistant, exclusions: ExclusionConfig
) -> set[str]:
    """Find binary_sensor device_classes present, excluding presence-related ones."""
    from homeassistant.helpers import entity_registry as er

    entity_reg = er.async_get(hass)
    device_classes: set[str] = set()
    for entity_entry in entity_reg.entities.values():
        if entity_entry.domain != "binary_sensor" or entity_entry.platform == DOMAIN:
            continue
        if entity_entry.hidden_by or entity_entry.disabled_by:
            continue
        state_obj = hass.states.get(entity_entry.entity_id)
        if not state_obj:
            continue
        device_class = state_obj.attributes.get("device_class")
        if not device_class or device_class in PRESENCE_DEVICE_CLASSES:
            continue
        if device_class in exclusions.excluded_device_classes:
            continue
        device_classes.add(device_class)
    return device_classes


def _get_or_create_device_class_group(
    hass: HomeAssistant,
    unique_id: str,
    translation_key: str,
    translation_placeholders: dict[str, str] | None,
    device_info: dict,
    member_entity_ids: list[str],
    device_class: str,
) -> BinarySensorDeviceClassGroup:
    """Idempotent get-or-create, same reasoning as _get_or_create_presence_group."""
    existing = _DEVICE_CLASS_GROUPS.get(unique_id)
    if existing is not None:
        hass.async_create_task(existing.async_update_members(member_entity_ids))
        return existing

    group = BinarySensorDeviceClassGroup(
        hass,
        unique_id=unique_id,
        translation_key=translation_key,
        translation_placeholders=translation_placeholders,
        device_info=device_info,
        member_entity_ids=member_entity_ids,
        device_class=device_class,
    )
    _DEVICE_CLASS_GROUPS[unique_id] = group
    return group


async def _build_device_class_groups(
    hass: HomeAssistant, config_entry: ConfigEntry, exclusions: ExclusionConfig
) -> list[BinarySensorDeviceClassGroup]:
    """Build one group per remaining binary_sensor device_class, nested area/floor/global."""
    entry_id = config_entry.entry_id
    entities: list[BinarySensorDeviceClassGroup] = []

    for device_class in _discover_generic_device_classes(hass, exclusions):
        scoped = scan_domain_members(
            hass,
            domain="binary_sensor",
            device_class=device_class,
            exclusions=exclusions,
        )
        area_group_ids: dict[str, str] = {}

        for area_id, member_ids in scoped.area_entities.items():
            if not member_ids:
                continue
            unique_id = f"{DOMAIN}_{device_class}_area_{area_id}"
            group = _get_or_create_device_class_group(
                hass,
                unique_id,
                "binary_sensor_group",
                {"device_class": device_class, "name": scoped.area_names[area_id]},
                get_area_device_info(entry_id, area_id, scoped.area_names[area_id]),
                member_ids,
                device_class,
            )
            entities.append(group)
            area_group_ids[area_id] = group.entity_id

        floor_group_ids: list[str] = []
        for floor_id, areas_on_floor in scoped.floor_areas.items():
            member_ids = [
                area_group_ids[a] for a in areas_on_floor if a in area_group_ids
            ]
            if not member_ids:
                continue
            unique_id = f"{DOMAIN}_{device_class}_floor_{floor_id}"
            group = _get_or_create_device_class_group(
                hass,
                unique_id,
                "binary_sensor_group",
                {
                    "device_class": device_class,
                    "name": scoped.floor_names.get(floor_id, floor_id),
                },
                get_floor_device_info(
                    entry_id, floor_id, scoped.floor_names.get(floor_id, floor_id)
                ),
                member_ids,
                device_class,
            )
            entities.append(group)
            floor_group_ids.append(group.entity_id)

        if floor_group_ids:
            unique_id = f"{DOMAIN}_{device_class}_global"
            group = _get_or_create_device_class_group(
                hass,
                unique_id,
                "binary_sensor_group_global",
                {"device_class": device_class},
                get_global_device_info(entry_id),
                floor_group_ids,
                device_class,
            )
            entities.append(group)

    return entities


async def async_setup_entry(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    async_add_entities: AddEntitiesCallback,
) -> None:
    """Set up Linus Dashboard binary_sensor groups (presence + per device_class)."""
    exclusions = ExclusionConfig.from_config_entry(config_entry)
    if domain_is_excluded("binary_sensor", exclusions):
        _LOGGER.debug("binary_sensor domain excluded, skipping group creation")
        return

    # Module-level registries can hold stale entries from a previous load of
    # this config entry (reload after an options change) — those entities
    # were already torn down by HA, so start from a clean slate here rather
    # than in _rebuild.
    _PRESENCE_GROUPS.clear()
    _DEVICE_CLASS_GROUPS.clear()

    entities: list = []
    entities.extend(await _build_presence_groups(hass, config_entry, exclusions))
    entities.extend(await _build_device_class_groups(hass, config_entry, exclusions))

    if entities:
        async_add_entities(entities)
        _LOGGER.info("Created %d binary_sensor group entities", len(entities))

    async def _rebuild(*_args) -> None:
        """Full rescan + reconcile: update existing groups, add/remove as needed."""
        before_ids = set(_PRESENCE_GROUPS.keys()) | set(_DEVICE_CLASS_GROUPS.keys())

        new_presence = await _build_presence_groups(hass, config_entry, exclusions)
        new_device_class = await _build_device_class_groups(
            hass, config_entry, exclusions
        )
        new_groups = [*new_presence, *new_device_class]

        after_ids = {group.unique_id for group in new_groups}
        to_add = [group for group in new_groups if group.unique_id not in before_ids]

        for registry in (_PRESENCE_GROUPS, _DEVICE_CLASS_GROUPS):
            for uid in list(registry.keys()):
                if uid not in after_ids:
                    stale = registry.pop(uid)
                    hass.async_create_task(stale.async_remove(force_remove=True))

        if to_add:
            async_add_entities(to_add)
            # See light.py's _rebuild for why this is needed here too.
            from . import async_hide_group_entities_from_voice_assistants

            await async_hide_group_entities_from_voice_assistants(hass, config_entry)

    platform_manager = PlatformGroupManager(
        hass, monitored_domains=["binary_sensor", "media_player"]
    )
    platform_manager.register_callbacks(
        startup_callback=_rebuild, update_callback=_rebuild
    )
    unsubs = platform_manager.setup_listeners()
    for unsub in unsubs:
        config_entry.async_on_unload(unsub)
