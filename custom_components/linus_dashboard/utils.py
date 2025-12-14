"""Utility functions for Linus Dashboard custom components."""

import logging

from homeassistant.components.frontend import add_extra_js_url
from homeassistant.components.lovelace.resources import ResourceStorageCollection
from homeassistant.core import HomeAssistant

_LOGGER = logging.getLogger(__name__)


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
