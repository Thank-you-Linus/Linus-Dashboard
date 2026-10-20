"""
Registry reconciliation (#217) on a real HomeAssistant.

The unit tests (tests/python/test_registry_cleanup.py) fake the registries;
this checks the parts only Home Assistant itself can prove: removing a
registry entry also removes the live entity, and dropping the config entry
from a device deletes the device. Run by the CI `python-tests-integration`
job (see test_offline_nested_integration.py for why it is a separate process).
"""

from __future__ import annotations

from typing import TYPE_CHECKING

import pytest

pytest.importorskip("pytest_homeassistant_custom_component")

from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    MockEntityPlatform,
)

from custom_components.linus_dashboard import registry_cleanup
from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.light import LightGroup

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

ICONS = {
    "light": {"_": {"default": "mdi:lightbulb", "state": {"off": "mdi:lightbulb-off"}}},
}
SALON = (DOMAIN, "entry_area_salon")
CAVE = (DOMAIN, "entry_area_cave")


async def test_ghosts_removed_and_dropped_group_disappears(hass: HomeAssistant):
    entry = MockConfigEntry(domain=DOMAIN)
    entry.add_to_hass(hass)
    hass.data[DOMAIN] = {"icons": ICONS}
    hass.states.async_set("light.salon_1", "off")

    salon = LightGroup(
        hass,
        "linus_dashboard_all_lights_area_salon",
        None,
        None,
        {"identifiers": {SALON}, "name": "Salon"},
        ["light.salon_1"],
    )
    platform = MockEntityPlatform(hass, domain="light", platform_name=DOMAIN)
    platform.config_entry = entry
    await platform.async_add_entities([salon])

    # A group built by an earlier run, whose area lost its last light while
    # Home Assistant was stopped: registry entry and device, nothing live.
    device_reg = dr.async_get(hass)
    entity_reg = er.async_get(hass)
    cave_device = device_reg.async_get_or_create(
        config_entry_id=entry.entry_id, identifiers={CAVE}, name="Cave"
    )
    ghost = entity_reg.async_get_or_create(
        "light",
        DOMAIN,
        "linus_dashboard_all_lights_area_cave",
        config_entry=entry,
        device_id=cave_device.id,
    )

    registry_cleanup.async_init(hass, entry, ["light"])
    registry_cleanup.async_report_built(hass, entry, "light", [salon])
    registry_cleanup.async_schedule_ready(hass, entry)
    await hass.async_block_till_done()

    assert entity_reg.async_get(ghost.entity_id) is None
    assert device_reg.async_get(cave_device.id) is None
    assert entity_reg.async_get(salon.entity_id) is not None
    assert hass.states.get(salon.entity_id) is not None
    salon_device = device_reg.async_get_device(identifiers={SALON})
    assert salon_device is not None
    assert not registry_cleanup.async_device_is_removable(hass, entry, salon_device)

    # The salon's light moves out: the rebuild builds nothing any more.
    registry_cleanup.async_report_built(hass, entry, "light", [])
    await hass.async_block_till_done()

    assert entity_reg.async_get(salon.entity_id) is None
    assert hass.states.get(salon.entity_id) is None
    assert device_reg.async_get_device(identifiers={SALON}) is None
