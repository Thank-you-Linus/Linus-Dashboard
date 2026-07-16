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
