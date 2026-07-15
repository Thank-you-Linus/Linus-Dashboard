"""Aggregate computation logic for Linus Dashboard sensors."""

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

DOMAIN_ICONS: dict[str, tuple[str, str]] = {
    "light": ("mdi:lightbulb-on", "mdi:lightbulb-off"),
    "switch": ("mdi:toggle-switch", "mdi:toggle-switch-off"),
    "fan": ("mdi:fan", "mdi:fan-off"),
    "media_player": ("mdi:cast-connected", "mdi:cast-off"),
    "climate": ("mdi:thermostat", "mdi:thermostat-box"),
    "cover": ("mdi:window-open", "mdi:window-closed"),
    "binary_sensor": (
        "mdi:checkbox-marked-circle",
        "mdi:checkbox-blank-circle-outline",
    ),
    "siren": ("mdi:alarm-light", "mdi:alarm-light-off"),
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


def compute_icon(domain: str, active_count: int) -> str:
    """Compute the appropriate icon based on active state."""
    icons = DOMAIN_ICONS.get(domain, ("mdi:help-circle", "mdi:help-circle-outline"))
    return icons[0] if active_count > 0 else icons[1]


# --- Numeric sensor aggregation (area/floor/global temperature, humidity,
# illuminance, battery, ...) ---
#
# Ported from the frontend's own sum-vs-average heuristic (src/variables.ts:
# SENSOR_STATE_CLASS_TOTAL / SENSOR_STATE_CLASS_TOTAL_INCREASING, and
# src/Helper.ts:1208 / src/popups/AggregatePopup.ts:296) so the backend and
# frontend agree on which device_class gets summed vs averaged. Kept as a
# separate reference list in Python rather than importing from the TS file
# (no cross-language import) — if variables.ts's lists change, mirror the
# change here too.

SENSOR_STATE_CLASS_TOTAL: set[str] = {
    "energy",
    "water",
    "gas",
    "monetary",
    "weight",
    "volume",
    "duration",
    "count",
}

SENSOR_STATE_CLASS_TOTAL_INCREASING: set[str] = {
    "energy",
    "water",
    "gas",
    "monetary",
    "count",
}

# Device classes where the worst case (lowest value) matters more than the
# average — a single depleted battery shouldn't be hidden by an average with
# healthy ones. Checked before the state_class-based sum/average rule.
MIN_MODE_DEVICE_CLASSES: set[str] = {"battery"}


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
    if (
        state_class in SENSOR_STATE_CLASS_TOTAL
        or state_class in SENSOR_STATE_CLASS_TOTAL_INCREASING
    ):
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
