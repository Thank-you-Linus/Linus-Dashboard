"""Utility functions for Linus Dashboard custom components."""

import logging

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.core import HomeAssistant

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
    base_url = url.split("?")[0]
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
