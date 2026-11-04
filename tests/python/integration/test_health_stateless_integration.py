"""
Health sensor and stateless entities on a real HomeAssistant (#232).

Reproduces the 2.0.1-beta.1 report: an area holding an SMLIGHT SLZB-06
coordinator and a gateway, all online, whose "Unavailable Entities" sensor
counted their three never-pressed restart buttons. Real area, device and
entity registries, real `_build_health_sensors`, real entity platform: only the
member states are set by hand. Run by the CI `python-tests-integration` job
(see test_offline_nested_integration.py for why it is a separate process).
"""

from __future__ import annotations

from typing import TYPE_CHECKING

import pytest

pytest.importorskip("pytest_homeassistant_custom_component")

from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import floor_registry as fr
from homeassistant.helpers.entity import EntityCategory
from pytest_homeassistant_custom_component.common import (
    MockConfigEntry,
    MockEntityPlatform,
)

from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.sensor import _build_health_sensors

from .helpers import settle

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

TIERS = (
    "sensor.linus_dashboard_unavailable_area_dachboden_kino",
    "sensor.linus_dashboard_unavailable_floor_dachboden",
    "sensor.linus_dashboard_unavailable_global",
)
BUTTONS = {
    "core_restart": "button.slzb_06mg24_core_restart",
    "zigbee_restart": "button.slzb_06mg24_zigbee_restart",
    "gwg3_restart": "button.dachboden_kino_gwg3_restart",
}


async def _setup(hass: HomeAssistant) -> None:
    floor = fr.async_get(hass).async_create("Dachboden")
    area = ar.async_get(hass).async_create("Dachboden Kino", floor_id=floor.floor_id)
    smlight = MockConfigEntry(domain="smlight")
    smlight.add_to_hass(hass)
    gateway = MockConfigEntry(domain="gateway")
    gateway.add_to_hass(hass)
    device_reg = dr.async_get(hass)
    devices = {}
    for key, entry, identifier, name in (
        ("slzb", smlight, ("smlight", "0c:dc:7e:37:0d:28"), "SLZB-06Mg24"),
        ("gwg3", gateway, ("gateway", "gwg3"), "Dachboden Kino GWG3"),
    ):
        device = device_reg.async_get_or_create(
            config_entry_id=entry.entry_id, identifiers={identifier}, name=name
        )
        device_reg.async_update_device(device.id, area_id=area.id)
        devices[key] = (entry, device.id)
    entity_reg = er.async_get(hass)
    for unique_id, entity_id in BUTTONS.items():
        entry, device_id = devices["gwg3" if unique_id == "gwg3_restart" else "slzb"]
        entity_reg.async_get_or_create(
            "button",
            entry.domain,
            unique_id,
            suggested_object_id=entity_id.split(".", 1)[1],
            config_entry=entry,
            device_id=device_id,
            entity_category=EntityCategory.CONFIG,
        )
        # Never pressed: a button's state is its last press time, none yet.
        hass.states.async_set(entity_id, "unknown")
    entity_reg.async_get_or_create(
        "light",
        "smlight",
        "led",
        suggested_object_id="slzb_06mg24_led",
        config_entry=smlight,
        device_id=devices["slzb"][1],
    )
    hass.states.async_set("light.slzb_06mg24_led", "on")

    entry = MockConfigEntry(domain=DOMAIN)
    entry.add_to_hass(hass)
    sensors = await _build_health_sensors(hass, entry)
    platform = MockEntityPlatform(hass, domain="sensor", platform_name=DOMAIN)
    platform.config_entry = entry
    await platform.async_add_entities(sensors)
    await settle(hass)


async def test_never_pressed_buttons_are_not_unavailable(hass: HomeAssistant):
    await _setup(hass)

    for sensor_id in TIERS:
        state = hass.states.get(sensor_id)
        assert state is not None, sensor_id
        assert state.state == "0"
        assert state.attributes["entity_id"] == []


async def test_offline_button_and_stuck_light_still_counted(hass: HomeAssistant):
    await _setup(hass)

    # The coordinator drops off the network: its button goes unavailable.
    # The light stuck at "unknown" is not stateless, so it still counts.
    hass.states.async_set(BUTTONS["core_restart"], "unavailable")
    hass.states.async_set("light.slzb_06mg24_led", "unknown")
    await settle(hass)

    expected = [BUTTONS["core_restart"], "light.slzb_06mg24_led"]
    for sensor_id in TIERS:
        state = hass.states.get(sensor_id)
        assert state.state == "2", sensor_id
        assert sorted(state.attributes["entity_id"]) == sorted(expected)

    # Pressed once and back online: a button's state becomes its press time.
    hass.states.async_set(BUTTONS["core_restart"], "2026-10-20T17:44:43+00:00")
    hass.states.async_set("light.slzb_06mg24_led", "on")
    await settle(hass)

    for sensor_id in TIERS:
        assert hass.states.get(sensor_id).state == "0", sensor_id
