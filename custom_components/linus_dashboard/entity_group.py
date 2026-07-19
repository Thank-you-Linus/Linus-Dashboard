"""
Shared scanning/nesting logic for Linus Dashboard area/floor/global group entities.

Used by binary_sensor.py, light.py, switch.py, fan.py, cover.py, siren.py,
climate.py and media_player.py to build the same three-tier hierarchy
(global > floor > area > raw entities) without duplicating the
entity-registry scanning and exclusion-filtering logic in every platform.

CRITICAL PATTERN - self-exclusion:
When iterating over entity_registry.entities.values(), always skip entities
created by this integration itself (entity.platform == DOMAIN). Area group
devices are placed in their real HA area, so their entities inherit that
area_id — without this filter, a group would include itself as a member,
causing perpetual recompute loops and, for controllable domains, recursive
service calls. See Linus Brain's area_manager.py for the same documented
pitfall this pattern is ported from.

NESTING:
Floor-scope groups contain the area-scope group entity_ids of that floor as
members (not raw entities). Global-scope groups contain the floor-scope group
entity_ids as members. This is a strict, one-directional hierarchy
(global > floor > area > raw entities) — never the reverse, never circular.
Only area-scope groups scan raw entities, so the self-exclusion risk above
only applies at that level.
"""

import logging
from collections.abc import Callable
from dataclasses import dataclass, field

from homeassistant.config_entries import ConfigEntry
from homeassistant.const import ATTR_ENTITY_ID
from homeassistant.core import HomeAssistant, callback
from homeassistant.helpers import (
    area_registry as ar,
)
from homeassistant.helpers import (
    device_registry as dr,
)
from homeassistant.helpers import (
    entity_registry as er,
)
from homeassistant.helpers import (
    floor_registry as fr,
)
from homeassistant.helpers.event import async_call_later, async_track_state_change_event

from .aggregate import (
    compute_active_entity_ids,
    compute_color,
    compute_icon,
)
from .const import (
    DOMAIN,
    get_area_device_info,
    get_floor_device_info,
    get_global_device_info,
)

_LOGGER = logging.getLogger(__name__)


@dataclass
class ExclusionConfig:
    """Resolved exclusion options read from the config entry, once per setup."""

    excluded_domains: set[str] = field(default_factory=set)
    excluded_device_classes: set[str] = field(default_factory=set)
    excluded_entity_ids: set[str] = field(default_factory=set)
    excluded_device_ids: set[str] = field(default_factory=set)
    excluded_area_ids: set[str] = field(default_factory=set)
    excluded_floor_ids: set[str] = field(default_factory=set)
    excluded_integrations: set[str] = field(default_factory=set)

    @classmethod
    def from_config_entry(cls, config_entry: ConfigEntry) -> "ExclusionConfig":
        """Build from the same options keys used by _build_aggregate_sensors."""
        options = config_entry.options
        excluded_targets = options.get("excluded_targets") or {}
        return cls(
            excluded_domains=set(options.get("excluded_domains") or []),
            excluded_device_classes=set(options.get("excluded_device_classes") or []),
            excluded_entity_ids=set(excluded_targets.get("entity_id") or []),
            excluded_device_ids=set(excluded_targets.get("device_id") or []),
            excluded_area_ids=set(excluded_targets.get("area_id") or []),
            excluded_floor_ids=set(excluded_targets.get("floor_id") or []),
            excluded_integrations=set(options.get("excluded_integrations") or []),
        )


@dataclass
class ScopedMembers:
    """Result of scanning the registries for a domain (+ optional device_class)."""

    # area_id -> raw member entity_ids in that area
    area_entities: dict[str, list[str]]
    # area_id -> area name
    area_names: dict[str, str]
    # floor_id -> list of area_ids on that floor that have members
    floor_areas: dict[str, list[str]]
    # floor_id -> floor name
    floor_names: dict[str, str]


def _resolve_entity_area_id(
    entity_entry: er.RegistryEntry, device_registry: dr.DeviceRegistry
) -> str | None:
    """Resolve an entity's area, falling back to its device's area."""
    if entity_entry.area_id:
        return entity_entry.area_id
    if entity_entry.device_id:
        device = device_registry.async_get(entity_entry.device_id)
        if device:
            return device.area_id
    return None


def domain_is_excluded(domain: str, exclusions: ExclusionConfig) -> bool:
    """
    Whether a whole domain's group platform should skip entity creation.

    Excluding a domain must suppress creation of its dedicated group entities
    entirely (at every scope), not just filter it out of some other count.
    """
    return domain in exclusions.excluded_domains


def scan_domain_members(
    hass: HomeAssistant,
    *,
    domain: str,
    device_class: str | None,
    exclusions: ExclusionConfig,
) -> ScopedMembers:
    """
    Scan entity/area/floor registries for entities of a domain (optionally
    filtered to a single device_class), grouped by area and by floor.

    Always excludes this integration's own entities (entity.platform == DOMAIN),
    any *other* group entity (anything whose own state already carries an
    `entity_id` attribute — the same ATTR_ENTITY_ID convention this
    integration, Linus Brain, and HA's native `group:` entities all use to
    mark "I am a group of other entities" — so a foreign group never gets
    scanned in as if it were a raw leaf, which would double-count its
    members and skew averaged attributes like brightness), disabled
    entities, entities without a current state, and anything matched by the
    configured exclusions.
    """
    entity_reg = er.async_get(hass)
    device_reg = dr.async_get(hass)
    area_reg = ar.async_get(hass)
    floor_reg = fr.async_get(hass)

    area_entities: dict[str, list[str]] = {}
    area_names: dict[str, str] = {}
    floor_areas: dict[str, list[str]] = {}
    floor_names: dict[str, str] = {}

    for entity_entry in entity_reg.entities.values():
        if entity_entry.domain != domain:
            continue

        # Self-exclusion: never let a Dashboard-created entity include itself.
        if entity_entry.platform == DOMAIN:
            continue

        if entity_entry.hidden_by or entity_entry.disabled_by:
            continue

        entity_id = entity_entry.entity_id
        if entity_id in exclusions.excluded_entity_ids:
            continue
        if (
            entity_entry.device_id
            and entity_entry.device_id in exclusions.excluded_device_ids
        ):
            continue
        if (
            entity_entry.platform
            and entity_entry.platform in exclusions.excluded_integrations
        ):
            continue

        state_obj = hass.states.get(entity_id)
        if not state_obj:
            continue

        # Foreign group exclusion: see docstring above.
        if ATTR_ENTITY_ID in state_obj.attributes:
            continue

        entity_device_class = state_obj.attributes.get("device_class")
        if device_class is not None and entity_device_class != device_class:
            continue
        if (
            entity_device_class
            and entity_device_class in exclusions.excluded_device_classes
        ):
            continue

        area_id = _resolve_entity_area_id(entity_entry, device_reg)
        if not area_id or area_id in exclusions.excluded_area_ids:
            continue

        area = area_reg.async_get_area(area_id)
        if not area:
            continue

        area_entities.setdefault(area_id, []).append(entity_id)
        area_names[area_id] = area.name

        floor_id = area.floor_id
        if floor_id and floor_id not in exclusions.excluded_floor_ids:
            areas_on_floor = floor_areas.setdefault(floor_id, [])
            if area_id not in areas_on_floor:
                areas_on_floor.append(area_id)
            if floor_id not in floor_names:
                floor = floor_reg.async_get_floor(floor_id)
                if floor:
                    floor_names[floor_id] = floor.name

    return ScopedMembers(
        area_entities=area_entities,
        area_names=area_names,
        floor_areas=floor_areas,
        floor_names=floor_names,
    )


def resolve_floors_for_areas(
    hass: HomeAssistant,
    area_ids: set[str],
    exclusions: ExclusionConfig,
) -> tuple[dict[str, list[str]], dict[str, str]]:
    """
    Map a set of area_ids (that already have members) to their floors.

    Used when merging several single-criterion scans into one composite
    group (e.g. presence: motion + presence + occupancy + media_player) so
    floor grouping is computed once from the merged area set rather than
    reconciling floor_areas/floor_names across multiple separate scans.
    """
    area_reg = ar.async_get(hass)
    floor_reg = fr.async_get(hass)

    floor_areas: dict[str, list[str]] = {}
    floor_names: dict[str, str] = {}

    for area_id in area_ids:
        area = area_reg.async_get_area(area_id)
        if not area or not area.floor_id:
            continue
        floor_id = area.floor_id
        if floor_id in exclusions.excluded_floor_ids:
            continue

        areas_on_floor = floor_areas.setdefault(floor_id, [])
        if area_id not in areas_on_floor:
            areas_on_floor.append(area_id)

        if floor_id not in floor_names:
            floor = floor_reg.async_get_floor(floor_id)
            if floor:
                floor_names[floor_id] = floor.name

    return floor_areas, floor_names


def compute_group_attributes(
    hass: HomeAssistant,
    *,
    domain: str,
    device_class: str | None,
    member_entity_ids: list[str],
) -> dict:
    """
    Build the standard extra_state_attributes for a group entity.

    `entity_id` (ATTR_ENTITY_ID) is the HA convention that makes the more-info
    dialog recognize this entity as a group and display its members — it must
    use exactly that attribute key, not a custom plural name. Works the same
    whether members are raw entities (area scope) or nested group entities
    (floor/global scope): both expose a plain HA state, so reading
    `hass.states.get(member_id).state` is valid either way.
    """
    entity_states: dict[str, str] = {}
    for entity_id in member_entity_ids:
        state_obj = hass.states.get(entity_id)
        if state_obj and state_obj.state not in ("unavailable", "unknown"):
            entity_states[entity_id] = state_obj.state

    active_ids = compute_active_entity_ids(entity_states, domain)
    icon = compute_icon(hass, domain, entity_states, device_class)
    color = compute_color(domain, device_class, entity_states)

    return {
        ATTR_ENTITY_ID: list(member_entity_ids),
        "total": len(member_entity_ids),
        "active_entity_ids": active_ids,
        "icon": icon,
        "color": color,
    }


# Entity factory signature shared by every simple single-domain group
# (light/switch/fan/cover/siren): construct one group entity instance.
EntityFactory = Callable[
    [HomeAssistant, str, str, dict[str, str] | None, dict, list[str]],  # noqa: UP007
    object,
]


def mean_float(*args: float) -> float:
    """
    Float-precision mean, for use as homeassistant.components.group.util's
    reduce_attribute(reduce=...) argument on non-integer attributes (e.g.
    temperature, volume_level). group.util's own default reducer, mean_int,
    truncates to an int — fine for brightness (0-255), wrong for anything
    with meaningful decimal precision.
    """
    return sum(args) / len(args)


def ensure_area_device_placed(
    hass: HomeAssistant, entry_id: str, area_id: str, device_info: dict
) -> None:
    """
    Explicitly place an area-scoped Linus Dashboard device in its real HA
    area.

    get_area_device_info()/get_floor_device_info() deliberately omit
    `suggested_area` (a name-matching heuristic with a duplicate-area risk —
    see their docstrings); the actual placement was meant to happen here,
    via device_registry.async_update_device(area_id=...) using the area's
    real registry ID directly, no name-matching involved. This had never
    actually been called anywhere, so every area-scoped device has been
    sitting with no area assigned at all since the feature first shipped —
    none of the "open Settings > Areas > Salon and see its Linus Dashboard
    device" UX the plan described was actually happening.

    Proactively get-or-create the device here (idempotent — resolves to the
    same device HA creates lazily later from the entity's own
    _attr_device_info, since both share the same `identifiers`) so area_id
    can be set immediately rather than racing a device creation that
    otherwise only happens on a background task scheduled by
    async_add_entities().
    """
    device_reg = dr.async_get(hass)
    device = device_reg.async_get_or_create(
        config_entry_id=entry_id,
        identifiers=device_info["identifiers"],
        name=device_info["name"],
        manufacturer=device_info["manufacturer"],
        model=device_info["model"],
        sw_version=device_info["sw_version"],
    )
    if device.area_id != area_id:
        device_reg.async_update_device(device.id, area_id=area_id)


async def build_nested_domain_groups(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    exclusions: ExclusionConfig,
    *,
    domain: str,
    unique_id_prefix: str,
    translation_key: str,
    translation_key_global: str,
    entity_factory: EntityFactory,
) -> list:
    """
    Build area/floor/global group entities for a single-domain, no-device_class
    group (light, switch, fan, cover, siren) using the shared nested hierarchy.

    `entity_factory(hass, unique_id, translation_key, placeholders, device_info,
    member_entity_ids)` must construct and return one group entity; this
    function only handles scanning, exclusion, and nesting — not the
    domain-specific control behavior (turn_on/turn_off/...), which stays in
    each platform's entity class.
    """
    if domain_is_excluded(domain, exclusions):
        return []

    scoped = scan_domain_members(
        hass, domain=domain, device_class=None, exclusions=exclusions
    )
    entry_id = config_entry.entry_id
    entities: list = []
    area_group_ids: dict[str, str] = {}

    for area_id, member_ids in scoped.area_entities.items():
        if not member_ids:
            continue
        area_device_info = get_area_device_info(
            entry_id, area_id, scoped.area_names[area_id]
        )
        ensure_area_device_placed(hass, entry_id, area_id, area_device_info)
        unique_id = f"{unique_id_prefix}_area_{area_id}"
        entity = entity_factory(
            hass,
            unique_id,
            translation_key,
            {"name": scoped.area_names[area_id]},
            area_device_info,
            member_ids,
        )
        entities.append(entity)
        area_group_ids[area_id] = entity.entity_id

    floor_group_ids: list[str] = []
    for floor_id, areas_on_floor in scoped.floor_areas.items():
        member_ids = [area_group_ids[a] for a in areas_on_floor if a in area_group_ids]
        if not member_ids:
            continue
        unique_id = f"{unique_id_prefix}_floor_{floor_id}"
        entity = entity_factory(
            hass,
            unique_id,
            translation_key,
            {"name": scoped.floor_names.get(floor_id, floor_id)},
            get_floor_device_info(
                entry_id, floor_id, scoped.floor_names.get(floor_id, floor_id)
            ),
            member_ids,
        )
        entities.append(entity)
        floor_group_ids.append(entity.entity_id)

    if floor_group_ids:
        unique_id = f"{unique_id_prefix}_global"
        entity = entity_factory(
            hass,
            unique_id,
            translation_key_global,
            None,
            get_global_device_info(entry_id),
            floor_group_ids,
        )
        entities.append(entity)

    return entities


def discover_device_classes(
    hass: HomeAssistant, domain: str, exclusions: ExclusionConfig
) -> set[str]:
    """
    Find every device_class actually present among `domain`'s entities.

    Used to build one set of area/floor/global groups per device_class
    without a hardcoded list — a fixed list can't cover every device_class
    an integration might report, and silently ignoring unlisted ones is
    exactly the shape of bug this replaces (cover's gate/garage groups
    never existed at all until device_class discovery was generalized
    beyond binary_sensor).
    """
    entity_reg = er.async_get(hass)
    device_classes: set[str] = set()
    for entity_entry in entity_reg.entities.values():
        if entity_entry.domain != domain or entity_entry.platform == DOMAIN:
            continue
        if entity_entry.hidden_by or entity_entry.disabled_by:
            continue
        state_obj = hass.states.get(entity_entry.entity_id)
        if not state_obj:
            continue
        device_class = state_obj.attributes.get("device_class")
        if not device_class:
            continue
        if device_class in exclusions.excluded_device_classes:
            continue
        device_classes.add(device_class)
    return device_classes


# Entity factory signature for build_nested_device_class_groups: like
# EntityFactory above, but with a trailing device_class argument.
DeviceClassEntityFactory = Callable[
    [HomeAssistant, str, str | None, dict[str, str] | None, dict, list[str], str],  # noqa: UP007
    object,
]


async def build_nested_device_class_groups(
    hass: HomeAssistant,
    config_entry: ConfigEntry,
    exclusions: ExclusionConfig,
    *,
    domain: str,
    unique_id_prefix: str,
    entity_factory: DeviceClassEntityFactory,
) -> list:
    """
    Build one set of area/floor/global group entities per device_class
    discovered for `domain` (e.g. cover's gate/garage/shutter/...).

    `entity_factory(hass, unique_id, translation_key, placeholders,
    device_info, member_entity_ids, device_class)` must construct or reuse
    (idempotently) one group entity. translation_key/placeholders are
    always None here: with the group's own _attr_device_class set instead,
    HA falls back to its own core per-device_class entity name combined
    with the device's own name — see binary_sensor.py's
    BinarySensorDeviceClassGroup for why that's preferred over a hand-
    rolled placeholder string.
    """
    entry_id = config_entry.entry_id
    entities: list = []

    for device_class in discover_device_classes(hass, domain, exclusions):
        scoped = scan_domain_members(
            hass, domain=domain, device_class=device_class, exclusions=exclusions
        )
        area_group_ids: dict[str, str] = {}

        for area_id, member_ids in scoped.area_entities.items():
            if not member_ids:
                continue
            area_device_info = get_area_device_info(
                entry_id, area_id, scoped.area_names[area_id]
            )
            ensure_area_device_placed(hass, entry_id, area_id, area_device_info)
            unique_id = f"{unique_id_prefix}_{device_class}_area_{area_id}"
            entity = entity_factory(
                hass,
                unique_id,
                None,
                None,
                area_device_info,
                member_ids,
                device_class,
            )
            entities.append(entity)
            area_group_ids[area_id] = entity.entity_id

        floor_group_ids: list[str] = []
        for floor_id, areas_on_floor in scoped.floor_areas.items():
            member_ids = [
                area_group_ids[a] for a in areas_on_floor if a in area_group_ids
            ]
            if not member_ids:
                continue
            unique_id = f"{unique_id_prefix}_{device_class}_floor_{floor_id}"
            entity = entity_factory(
                hass,
                unique_id,
                None,
                None,
                get_floor_device_info(
                    entry_id, floor_id, scoped.floor_names.get(floor_id, floor_id)
                ),
                member_ids,
                device_class,
            )
            entities.append(entity)
            floor_group_ids.append(entity.entity_id)

        if floor_group_ids:
            unique_id = f"{unique_id_prefix}_{device_class}_global"
            entity = entity_factory(
                hass,
                unique_id,
                None,
                None,
                get_global_device_info(entry_id),
                floor_group_ids,
                device_class,
            )
            entities.append(entity)

    return entities


DEBOUNCE_SECONDS = 0.1


class NestedGroupMixin:
    """
    Shared plumbing for a group entity living at area/floor/global scope.

    Handles member subscription (debounced), the entity_id member-list
    attribute, and empty-group detection. Domain-specific state computation
    (`_recompute`) and control forwarding (turn_on/turn_off/...) stay in each
    platform's own entity class — this mixin only owns the parts that are
    identical across light/switch/fan/cover/siren/binary_sensor.

    Several platforms (light.py, switch.py, fan.py, cover.py,
    binary_sensor.py's per-device_class groups) additionally inherit HA
    core's own homeassistant.components.group.<domain> class alongside this
    mixin, to reuse its state-computation logic (async_update_group_state)
    instead of hand-rolling it — see _sync_ha_group_state below. Those core
    classes are themselves built on GroupEntity, whose own
    async_added_to_hass sets up an *undebounced* subscription — exactly what
    this mixin's own debounce (DEBOUNCE_SECONDS) exists to avoid (see PR
    #152's "flatline" performance issue). async_added_to_hass below
    deliberately does not call super() to avoid ever reaching that
    ancestor's version through the MRO.
    """

    _attr_has_entity_name = True
    _attr_should_poll = False
    _attr_entity_registry_visible_default = True

    def _init_group(
        self,
        hass: HomeAssistant,
        *,
        unique_id: str,
        entity_id_prefix: str,
        translation_key: str | None,
        translation_placeholders: dict[str, str] | None,
        device_info: dict,
        member_entity_ids: list[str],
    ) -> None:
        self.hass = hass
        self._attr_unique_id = unique_id
        self._attr_suggested_object_id = unique_id
        self._attr_translation_key = translation_key
        if translation_placeholders:
            self._attr_translation_placeholders = translation_placeholders
        self._attr_device_info = device_info
        self.entity_id = f"{entity_id_prefix}.{unique_id}"
        self._member_entity_ids: list[str] = list(member_entity_ids)
        self._unsub_state_changed: Callable[[], None] | None = None
        self._debounce_unsub: Callable[[], None] | None = None

    def is_empty(self) -> bool:
        """Whether this group has no members (used to trigger auto-removal)."""
        return len(self._member_entity_ids) == 0

    async def async_update_members(self, member_entity_ids: list[str]) -> None:
        """Replace the member list and recompute state (dynamic refresh)."""
        self._member_entity_ids = list(member_entity_ids)
        await self._async_resubscribe()
        self._recompute()
        if self.hass:
            self.async_write_ha_state()

    async def _async_resubscribe(self) -> None:
        if self._unsub_state_changed:
            self._unsub_state_changed()
        self._unsub_state_changed = async_track_state_change_event(
            self.hass, self._member_entity_ids, self._async_state_changed
        )

    @callback
    def _async_state_changed(self, _event) -> None:
        if self._debounce_unsub:
            self._debounce_unsub()
        self._debounce_unsub = async_call_later(
            self.hass, DEBOUNCE_SECONDS, self._async_debounced_update
        )

    @callback
    def _async_debounced_update(self, _now=None) -> None:
        self._debounce_unsub = None
        self._recompute()
        self.async_write_ha_state()

    async def async_added_to_hass(self) -> None:
        """
        Deliberately does NOT call super().async_added_to_hass() — see class
        docstring. When a platform also inherits an HA core group.* class,
        that ancestor's own async_added_to_hass (via GroupEntity) would set
        up its own undebounced subscription if reached through the MRO;
        skipping the chain entirely here is simpler than fighting the MRO to
        bypass just that one ancestor.
        """
        await self._async_resubscribe()
        self._recompute()

    async def async_will_remove_from_hass(self) -> None:
        await super().async_will_remove_from_hass()
        if self._unsub_state_changed:
            self._unsub_state_changed()
            self._unsub_state_changed = None
        if self._debounce_unsub:
            self._debounce_unsub()
            self._debounce_unsub = None

    def _recompute(self) -> None:
        raise NotImplementedError

    def _sync_ha_group_state(
        self, *, domain: str, device_class: str | None = None
    ) -> None:
        """
        Drive an inherited HA core group.<domain> class's own
        async_update_group_state() using this mixin's debounced
        subscription instead of GroupEntity's own. For use by _recompute()
        implementations that multiply-inherit e.g.
        homeassistant.components.group.light.LightGroup alongside this
        mixin — see class docstring.

        - `self._entity_ids` is kept as an alias of `self._member_entity_ids`
          because that's the attribute name every HA core group.* class
          reads from internally; we can't rename theirs, so we mirror ours.
        - async_update_supported_features(entity_id, state) is called for
          every member first, for platforms whose HA class tracks features
          incrementally per-member (fan.py/cover.py's FanGroup/CoverGroup);
          it's a no-op on the base GroupEntity for platforms that don't
          (light/switch/binary_sensor), so calling it unconditionally here
          is harmless.
        - async_update_group_state() is HA's own — sets is_on/brightness/
          hvac_mode/percentage/position/etc. depending on which class this
          is mixed into.
        - compute_group_attributes() then *replaces*
          extra_state_attributes wholesale with our own entity_id/total/
          active_entity_ids/icon/color, same as every non-HA-inherited
          platform (climate.py, media_player.py, siren.py) — it already
          covers everything HA's own init sets there (just entity_id), so
          there's nothing worth preserving from it.
        """
        self._entity_ids = self._member_entity_ids
        for entity_id in self._member_entity_ids:
            self.async_update_supported_features(
                entity_id, self.hass.states.get(entity_id)
            )
        self.async_update_group_state()

        self._attr_extra_state_attributes = compute_group_attributes(
            self.hass,
            domain=domain,
            device_class=device_class,
            member_entity_ids=self._member_entity_ids,
        )
