"""Aggregate computation logic for Linus Dashboard sensors."""

from typing import TYPE_CHECKING

from .const import DOMAIN

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

DOMAIN_ACTIVE_STATES: dict[str, list[str]] = {
    "light": ["on"],
    "switch": ["on"],
    "fan": ["on"],
    "media_player": ["playing", "paused", "on"],
    "climate": ["heat", "cool", "auto", "heat_cool", "dry", "fan_only"],
    "cover": ["open", "opening"],
    "binary_sensor": ["on"],
    "siren": ["on"],
}

DOMAIN_COLORS: dict[str, dict[str, str]] = {
    "light": {"on": "amber"},
    "switch": {"on": "yellow"},
    "fan": {"on": "cyan"},
    "climate": {
        "heat": "deep-orange",
        "cool": "blue",
        "auto": "green",
        "heat_cool": "orange",
        "dry": "amber",
        "fan_only": "cyan",
    },
    "cover": {"open": "purple", "opening": "purple"},
    "media_player": {"playing": "light-blue", "paused": "grey", "on": "light-blue"},
    "siren": {"on": "red"},
}

BINARY_SENSOR_COLORS: dict[str, dict[str, str]] = {
    "motion": {"on": "red"},
    "door": {"on": "orange"},
    "window": {"on": "red"},
    "smoke": {"on": "red"},
    "gas": {"on": "red"},
    "moisture": {"on": "lightblue"},
    "tamper": {"on": "red"},
    "battery_charging": {"on": "green"},
    "carbon_monoxide": {"on": "red"},
    "cold": {"on": "blue"},
    "connectivity": {"on": "green"},
    "garage_door": {"on": "orange"},
    "heat": {"on": "red"},
    "lock": {"on": "amber"},
    "occupancy": {"on": "green"},
    "opening": {"on": "orange"},
    "plug": {"on": "green"},
    "presence": {"on": "blue"},
    "problem": {"on": "red"},
    "running": {"on": "blue"},
    "safety": {"on": "red"},
    "sound": {"on": "blue"},
    "update": {"on": "purple"},
    "vibration": {"on": "purple"},
}


def compute_active_count(entity_states: dict[str, str], domain: str) -> int:
    """Count entities in active states."""
    active_states = DOMAIN_ACTIVE_STATES.get(domain, ["on"])
    return sum(1 for state in entity_states.values() if state in active_states)


def compute_active_entity_ids(entity_states: dict[str, str], domain: str) -> list[str]:
    """Get list of entity IDs that are currently active."""
    active_states = DOMAIN_ACTIVE_STATES.get(domain, ["on"])
    return [eid for eid, state in entity_states.items() if state in active_states]


FALLBACK_ICON = "mdi:help-circle"


def compute_icon(
    hass: "HomeAssistant",
    domain: str,
    entity_states: dict[str, str],
    device_class: str | None = None,
) -> str:
    """
    Compute the appropriate icon from HA core's own icon_translations data
    (icons.json's entity_component section, fetched once at setup via
    homeassistant.helpers.icon.async_get_icons and cached in
    hass.data[DOMAIN]["icons"]) rather than a hardcoded per-device_class
    table — stays correct across HA versions and covers every device_class
    HA defines, not just the ones we'd remember to hardcode (this is
    exactly the bug that shipped: cover's gate/garage and media_player's
    tv/speaker/receiver were silently ignored, always falling back to the
    flat per-domain icon, because only binary_sensor had a hardcoded table).

    Picks the icon for whichever state actually appears among the group's
    members — preferring one of the domain's active states (DOMAIN_ACTIVE_STATES)
    when any member is active, matching the "show the active icon if
    anything in the group is active" behavior this replaces. HA's
    icons.json convention is {"default": ..., "state": {state_name: icon}},
    where "default" covers whichever state(s) aren't explicitly listed
    (e.g. cover's "open" has no separate entry — it's covered by default),
    so state.get(target, default) is correct for every domain without
    needing to know which one "default" represents.
    """
    domain_icons = hass.data.get(DOMAIN, {}).get("icons", {}).get(domain, {})
    dc_data = domain_icons.get(device_class or "_") or domain_icons.get("_") or {}
    state_icons = dc_data.get("state", {})
    default_icon = dc_data.get("default", FALLBACK_ICON)

    active_states = DOMAIN_ACTIVE_STATES.get(domain, ["on"])
    observed = set(entity_states.values())

    active_observed = [s for s in active_states if s in observed]
    if active_observed:
        target = active_observed[0]
    else:
        inactive_observed = [s for s in observed if s not in active_states]
        target = next((s for s in inactive_observed if s in state_icons), None) or (
            inactive_observed[0] if inactive_observed else None
        )

    if target is None:
        return default_icon
    return state_icons.get(target, default_icon)


def resolve_device_class_name(
    hass: "HomeAssistant", domain: str, device_class: str | None
) -> str | None:
    """
    Look up HA's own translated per-device_class entity name ("Portail",
    "Récepteur", ...), fetched once at setup via
    homeassistant.helpers.translation.async_get_translations and cached in
    hass.data[DOMAIN]["names"].

    Only needed for domains where HA doesn't already auto-name an unnamed
    entity after its device_class — BinarySensorEntity does this
    automatically (_default_to_device_class_name returns True when
    device_class is set), CoverEntity/MediaPlayerEntity hardcode False, so
    those two must set _attr_name explicitly or every device_class group in
    an area would show the exact same name as the flat group and each
    other. Returns None if device_class is None or has no known name (the
    caller should leave _attr_name unset in that case, same as HA's own
    fallback).
    """
    if not device_class:
        return None
    names = hass.data.get(DOMAIN, {}).get("names", {})
    return names.get(f"component.{domain}.entity_component.{device_class}.name")


# --- Numeric sensor aggregation (area/floor/global temperature, humidity,
# illuminance, battery, ...) ---
#
# Reads each entity's own real state_class (HA's SensorStateClass enum:
# "total"/"total_increasing"/"measurement") rather than a hardcoded
# device_class allowlist — a device_class list can't cover every current and
# future integration, but state_class is a property every numeric sensor
# already reports. The frontend's own SENSOR_STATE_CLASS_TOTAL(_INCREASING)
# lists in src/variables.ts serve a different, device_class-keyed heuristic
# (src/Helper.ts:1240/1937, src/popups/AggregatePopup.ts:331) — not the same
# check, and not a source to port from here.

# Device classes where the worst case (lowest value) matters more than the
# average — a single depleted battery shouldn't be hidden by an average with
# healthy ones. Checked before the state_class-based sum/average rule.
MIN_MODE_DEVICE_CLASSES: set[str] = {"battery"}

SUM_STATE_CLASSES: set[str] = {"total", "total_increasing"}


def resolve_numeric_aggregation_mode(
    device_class: str | None, state_class: str | None
) -> str:
    """
    Decide whether a numeric sensor aggregate should sum, average, or take
    the minimum across its members.

    Returns one of "sum", "average", "min". Priority: explicit min-mode
    device_class override first, then state_class (total/total_increasing ->
    sum, anything else, including "measurement", -> average).
    """
    if device_class in MIN_MODE_DEVICE_CLASSES:
        return "min"
    if state_class in SUM_STATE_CLASSES:
        return "sum"
    return "average"


def compute_numeric_aggregate(values: list[float], mode: str) -> float | None:
    """Apply the resolved aggregation mode to a list of numeric member values."""
    if not values:
        return None
    if mode == "sum":
        return sum(values)
    if mode == "min":
        return min(values)
    return sum(values) / len(values)


def compute_color(
    domain: str,
    device_class: str | None,
    entity_states: dict[str, str],
) -> str:
    """Compute color based on domain, device_class, and entity states."""
    if domain == "binary_sensor" and device_class:
        color_map = BINARY_SENSOR_COLORS.get(device_class, {"on": "grey"})
    else:
        color_map = DOMAIN_COLORS.get(domain, {"on": "grey"})

    active_states = DOMAIN_ACTIVE_STATES.get(domain, ["on"])

    for entity_state in entity_states.values():
        if entity_state in active_states and entity_state in color_map:
            return color_map[entity_state]

    return "grey"
