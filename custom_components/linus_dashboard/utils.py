"""Utility functions for Linus Dashboard custom components."""

import logging

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.core import HomeAssistant

from custom_components.linus_dashboard.const import DOMAIN

_LOGGER = logging.getLogger(__name__)


async def should_skip_vendored_resource(
    hass: HomeAssistant, filename: str, own_base_url: str
) -> str | None:
    """
    Check whether a lovelace resource serving the same filename is already registered.

    We vendor a few popular HACS cards (mushroom, card-mod, swipe-card,
    stack-in-card, browser_mod) for convenience. Users who already installed
    one of those via HACS would otherwise end up loading both copies, which
    doubles download size and makes both copies race to register the same
    custom elements. HACS (and browser_mod's own integration) always serves
    the upstream project's unmodified build, so matching on filename alone
    (ignoring the directory/query string) is a reliable way to detect that.

    If a conflicting external resource is found, any of our own previously
    registered resources for this file (e.g. from before the user installed
    the HACS version) are removed too, so we don't leave a stale duplicate.

    Returns the conflicting resource's URL if one was found, else None.
    """
    resources: ResourceStorageCollection = hass.data["lovelace"].resources
    await resources.async_get_info()

    own_prefix = f"/{DOMAIN}_files/"
    conflicting_url: str | None = None
    own_items = []
    for item in resources.async_items():
        item_url = item.get("url", "")
        if not item_url:
            continue
        item_base_url = item_url.split("?", maxsplit=1)[0]
        if item_base_url == own_base_url:
            own_items.append(item)
            continue
        if item_url.startswith(own_prefix):
            continue
        if item_base_url.rsplit("/", maxsplit=1)[-1] == filename:
            conflicting_url = item_url

    if conflicting_url is not None and isinstance(resources, ResourceStorageCollection):
        for item in own_items:
            _LOGGER.debug(
                "Removing our own stale resource for %s now that %s provides it: %s",
                filename,
                conflicting_url,
                item["url"],
            )
            await resources.async_delete_item(item["id"])

    return conflicting_url


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
