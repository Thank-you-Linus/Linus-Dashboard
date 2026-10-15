"""Utility functions for Linus Dashboard custom components."""

import logging
from collections.abc import Iterator, Mapping
from typing import Any

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.core import HomeAssistant
from homeassistant.util.color import (
    color_hs_to_RGB,
    color_rgb_to_hex,
    color_RGB_to_hs,
    color_temperature_mired_to_kelvin,
    color_xy_to_RGB,
)

_LOGGER = logging.getLogger(__name__)


async def init_resource(hass: HomeAssistant, url: str, ver: str) -> bool:
    """
    Add extra JS module for lovelace mode YAML and new lovelace resource.

    Automatically cleans up old versions of the same resource to prevent
    duplicate registrations and CustomElementRegistry conflicts.

    for mode GUI. It's better to add extra JS for all modes, because it has
    random url to avoid problems with the cache. But chromecast don't support
    extra JS urls and can't load custom card.
    """
    resources: ResourceStorageCollection = hass.data["lovelace"].resources
    # force load storage
    await resources.async_get_info()

    # Extract base URL without query parameters for matching
    base_url = url.split("?", maxsplit=1)[0]
    versioned_url = f"{url}?v={ver}"

    # Find all versions of this resource
    matching_items = []
    for item in resources.async_items():
        item_url = item.get("url", "")
        item_base_url = item_url.split("?")[0]

        # Check if this is the same resource (same base URL)
        if item_base_url == base_url:
            matching_items.append(item)

    # If we found existing versions
    if matching_items:
        # Check if the current version already exists
        for item in matching_items:
            if item["url"] == versioned_url:
                _LOGGER.debug(
                    "Resource already registered with correct version: %s",
                    versioned_url,
                )
                return False

        # Remove all old versions and keep only one to update
        if isinstance(resources, ResourceStorageCollection):
            # Update the first matching item
            first_item = matching_items[0]
            _LOGGER.debug(
                "Updating resource from %s to %s", first_item["url"], versioned_url
            )
            await resources.async_update_item(
                first_item["id"], {"res_type": "module", "url": versioned_url}
            )

            # Remove all other duplicates
            for item in matching_items[1:]:
                _LOGGER.debug("Removing duplicate resource: %s", item["url"])
                await resources.async_delete_item(item["id"])
        else:
            # Fallback for non-storage collections
            matching_items[0]["url"] = versioned_url

        return True

    # No existing version found, create new resource
    if isinstance(resources, ResourceStorageCollection):
        _LOGGER.debug("Adding new lovelace resource: %s", versioned_url)
        await resources.async_create_item({"res_type": "module", "url": versioned_url})
    else:
        _LOGGER.debug("Add extra JS module: %s", versioned_url)
        add_extra_js_url(hass, versioned_url)

    return True


# ---------------------------------------------------------------------------
# Scene colors (TK-124): colors of the lights a Home Assistant scene sets,
# shown on the scene chips of the area light popup.
# ---------------------------------------------------------------------------

# hass.data key under which HA stores the platform of its own scenes
# (homeassistant/components/homeassistant/scene.py: DATA_PLATFORM).
SCENE_PLATFORM_DATA_KEY = "homeassistant_scene"

# A colored lamp below this saturation (0-100, HS space) reads as white.
_MIN_SATURATION = 15
# Hue bucket width, in degrees, used to group close colors.
_HUE_BUCKET_DEGREES = 30
# Below this temperature a white is warm (amber), above it cool (light blue).
_WARM_KELVIN_LIMIT = 4000
_MAX_SCENE_COLORS = 3


def _numbers(value: Any, count: int) -> list[float] | None:
    """Return `value` as `count` numbers, or None if it is not of that shape."""
    if not isinstance(value, (list, tuple)) or len(value) != count:
        return None
    if not all(
        isinstance(item, (int, float)) and not isinstance(item, bool) for item in value
    ):
        return None
    return [float(item) for item in value]


def is_valid_rgb(value: Any) -> bool:
    """Return True if `value` is three integers in 0-255 (ColorRGBSelector shape)."""
    return (
        isinstance(value, (list, tuple))
        and len(value) == 3  # noqa: PLR2004 - r, g, b
        and all(
            isinstance(item, int) and not isinstance(item, bool) and 0 <= item <= 255  # noqa: PLR2004
            for item in value
        )
    )


def scene_color_overrides_hex(raw: Any) -> dict[str, str]:
    """Convert saved manual scene colors to `{entity_id: "#rrggbb"}`, invalid ones dropped."""
    if not isinstance(raw, Mapping):
        return {}
    return {
        entity_id: f"#{color_rgb_to_hex(*rgb)}"
        for entity_id, rgb in raw.items()
        if isinstance(entity_id, str) and is_valid_rgb(rgb)
    }


def _iter_scene_target_states(hass: HomeAssistant) -> Iterator[tuple[str, Mapping]]:
    """
    Yield (scene entity_id, attributes) for each light a HA scene turns on.

    Adapter over Home Assistant internals, checked link by link: anything of an
    unexpected shape is skipped with a debug log, never an AttributeError.
    Shape (identical in HA 2025.5.0 and 2026.4.0, components/homeassistant/
    scene.py): hass.data["homeassistant_scene"] is an EntityPlatform whose
    `.entities` maps entity_id -> HomeAssistantScene; `.scene_config` is a
    SceneConfig NamedTuple (id, name, icon, states: dict[str, State]).
    """
    platform = hass.data.get(SCENE_PLATFORM_DATA_KEY)
    if platform is None:
        return
    entities = getattr(platform, "entities", None)
    if isinstance(entities, Mapping):
        scenes = list(entities.items())
    elif isinstance(entities, (list, tuple, set)):
        scenes = [(getattr(scene, "entity_id", None), scene) for scene in entities]
    else:
        _LOGGER.debug("Scene colors: forme de scène inconnue (entities) — ignorée")
        return

    for entity_id, scene in scenes:
        states = getattr(getattr(scene, "scene_config", None), "states", None)
        if not isinstance(entity_id, str) or not isinstance(states, Mapping):
            _LOGGER.debug(
                "Scene colors: forme de scène inconnue (%s) — ignorée", entity_id
            )
            continue
        for target_id, target in states.items():
            if not isinstance(target_id, str) or not target_id.startswith("light."):
                continue
            attributes = getattr(target, "attributes", None)
            if getattr(target, "state", None) != "on" or not isinstance(
                attributes, Mapping
            ):
                continue
            yield entity_id, attributes


def _normalize_light_color(attributes: Mapping) -> dict[str, Any] | None:
    """Return {"kelvin": K} or {"rgb": [r, g, b]} for a lamp, or None if colorless."""
    kelvin = attributes.get("color_temp_kelvin")
    mireds = attributes.get("color_temp")
    if not isinstance(kelvin, (int, float)) or isinstance(kelvin, bool):
        kelvin = None
    if isinstance(mireds, (int, float)) and not isinstance(mireds, bool) and mireds > 0:
        kelvin = kelvin or color_temperature_mired_to_kelvin(mireds)

    has_color = any(
        attributes.get(key) is not None for key in ("rgb_color", "hs_color", "xy_color")
    )
    if kelvin and (attributes.get("color_mode") == "color_temp" or not has_color):
        return {"kelvin": int(kelvin)}

    rgb: list[int] | None = None
    if (values := _numbers(attributes.get("rgb_color"), 3)) is not None:
        rgb = [max(0, min(255, round(v))) for v in values]
    elif (values := _numbers(attributes.get("hs_color"), 2)) is not None:
        rgb = list(color_hs_to_RGB(*values))
    elif (values := _numbers(attributes.get("xy_color"), 2)) is not None:
        rgb = list(color_xy_to_RGB(*values))
    if rgb is None:
        return None

    _hue, saturation = color_RGB_to_hs(*rgb)
    if saturation < _MIN_SATURATION:
        return None
    return {"rgb": rgb}


def _color_bucket(color: dict[str, Any]) -> str:
    """Group key: warm/cool for whites, a 30° hue slice for colors."""
    if "kelvin" in color:
        return "warm" if color["kelvin"] < _WARM_KELVIN_LIMIT else "cool"
    hue, _saturation = color_RGB_to_hs(*color["rgb"])
    return f"hue-{int(hue // _HUE_BUCKET_DEGREES) % (360 // _HUE_BUCKET_DEGREES)}"


def scene_colors(hass: HomeAssistant) -> dict[str, list[dict[str, Any]]]:
    """
    Return the colors of each Home Assistant scene, dominant first (max 3).

    Synchronous, memory only. Keys are scene entity_ids; scenes without any
    colored or white-temperature light are absent. Values are JSON-serializable
    ({"rgb": [r, g, b]} or {"kelvin": K}). Never raises: {} on any error.
    """
    try:
        # scene -> bucket -> [count, first position, representative color]
        groups: dict[str, dict[str, list[Any]]] = {}
        for position, (entity_id, attributes) in enumerate(
            _iter_scene_target_states(hass)
        ):
            color = _normalize_light_color(attributes)
            if color is None:
                continue
            buckets = groups.setdefault(entity_id, {})
            bucket = buckets.setdefault(_color_bucket(color), [0, position, color])
            bucket[0] += 1

        return {
            entity_id: [
                color
                for _count, _position, color in sorted(
                    buckets.values(), key=lambda item: (-item[0], item[1])
                )[:_MAX_SCENE_COLORS]
            ]
            for entity_id, buckets in groups.items()
        }
    except Exception as err:  # noqa: BLE001 - never an error at dashboard load
        _LOGGER.debug("Scene colors: could not compute (%s)", err)
        return {}
