"""Utility functions for Linus Dashboard custom components."""

import logging

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


async def is_resource_already_loaded_by_linus(
    hass: HomeAssistant, resource_name: str, domain: str
) -> bool:
    """
    Check if a resource is already loaded by Linus Dashboard itself.

    This prevents Linus Dashboard from loading the same resource twice,
    but intentionally allows bundled resources to be loaded even if the user
    has installed them separately via HACS.

    Args:
        hass: Home Assistant instance
        resource_name: The resource identifier (e.g., "mushroom", "swipe-card")
        domain: The domain name (e.g., "linus_dashboard")

    Returns:
        True if already loaded by Linus Dashboard, False otherwise
    """
    resources: ResourceStorageCollection = hass.data["lovelace"].resources
    # force load storage
    await resources.async_get_info()

    # Build the expected URL pattern for Linus Dashboard resources
    linus_pattern = f"/{domain}_files/www/"

    for item in resources.async_items():
        url = item.get("url", "")
        # Check if this is a Linus Dashboard resource AND matches the resource name
        if linus_pattern in url and resource_name in url:
            _LOGGER.debug(
                "Resource '%s' already loaded by Linus Dashboard: %s",
                resource_name,
                url,
            )
            return True

    return False


async def check_for_external_resource(
    hass: HomeAssistant, resource_name: str, domain: str
) -> bool:
    """
    Check if a resource is loaded from an external source (e.g., HACS).

    This is used to log a debug message informing users that Linus Dashboard
    will use its bundled version to ensure compatibility.

    Args:
        hass: Home Assistant instance
        resource_name: The resource identifier (e.g., "mushroom", "swipe-card")
        domain: The domain name (e.g., "linus_dashboard")

    Returns:
        True if an external version is detected, False otherwise
    """
    resources: ResourceStorageCollection = hass.data["lovelace"].resources
    # force load storage
    await resources.async_get_info()

    # Build the expected URL pattern for Linus Dashboard resources
    linus_pattern = f"/{domain}_files/www/"

    for item in resources.async_items():
        url = item.get("url", "")
        # Check if URL contains resource name but is NOT from Linus Dashboard
        if resource_name in url and linus_pattern not in url:
            _LOGGER.debug(
                "External resource '%s' detected from: %s", resource_name, url
            )
            return True

    return False


async def init_resource(hass: HomeAssistant, url: str, ver: str) -> bool:
    """
    Add extra JS module for lovelace mode YAML and new lovelace resource.

    for mode GUI. It's better to add extra JS for all modes, because it has
    random url to avoid problems with the cache. But chromecast don't support
    extra JS urls and can't load custom card.
    """
    resources: ResourceStorageCollection = hass.data["lovelace"].resources
    # force load storage
    await resources.async_get_info()

    url2 = f"{url}?v={ver}"

    for item in resources.async_items():
        if not item.get("url", "").startswith(url):
            continue

        # no need to update
        if item["url"].endswith(ver):
            return False

        _LOGGER.debug("Update lovelace resource to: %s", url2)

        if isinstance(resources, ResourceStorageCollection):
            await resources.async_update_item(
                item["id"], {"res_type": "module", "url": url2}
            )
        else:
            # not the best solution, but what else can we do
            item["url"] = url2

        return True

    if isinstance(resources, ResourceStorageCollection):
        _LOGGER.debug("Add new lovelace resource: %s", url2)
        await resources.async_create_item({"res_type": "module", "url": url2})
    else:
        _LOGGER.debug("Add extra JS module: %s", url2)
        add_extra_js_url(hass, url2)

    return True
