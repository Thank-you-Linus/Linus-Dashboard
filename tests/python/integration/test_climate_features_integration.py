"""
End-to-end check of climate groups over members with presets (#233).

Unlike tests/python/test_climate_group.py (MagicMock hass), this goes through
the real state machine, the real entity platform, the real state-change
subscriptions and the real debounce: the member is set with
hass.states.async_set, the area > floor > global groups are added through an
EntityPlatform, and nothing is ever written by hand on a group. Before the
fix, every write of the area group raised AttributeError on
_attr_preset_modes and the three groups stayed frozen.

Run on its own by the CI `python-tests-integration` job (see
test_offline_nested_integration.py for why).
"""

from __future__ import annotations

import logging
from typing import TYPE_CHECKING

import pytest

pytest.importorskip("pytest_homeassistant_custom_component")

from homeassistant.components.climate import ClimateEntityFeature
from pytest_homeassistant_custom_component.common import MockEntityPlatform

from custom_components.linus_dashboard.climate import ClimateGroup
from custom_components.linus_dashboard.const import DOMAIN

from .helpers import settle

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

MEMBER = "climate.tim"
OWN_FEATURES = int(
    ClimateEntityFeature.TARGET_TEMPERATURE
    | ClimateEntityFeature.TURN_ON
    | ClimateEntityFeature.TURN_OFF
)


def _set_member(hass, state, *, temperature, current_temperature):
    # A Versatile Thermostat: supported_features 401 = TARGET_TEMPERATURE 1
    # + PRESET_MODE 16 + TURN_OFF 128 + TURN_ON 256.
    hass.states.async_set(
        MEMBER,
        state,
        {
            "hvac_modes": ["off", "heat"],
            "supported_features": 401,
            "preset_modes": ["frost", "eco", "comfort", "boost"],
            "preset_mode": "comfort",
            "temperature": temperature,
            "current_temperature": current_temperature,
            "min_temp": 7.0,
            "max_temp": 35.0,
        },
    )


async def test_preset_member_updates_area_floor_and_global(hass: HomeAssistant, caplog):
    caplog.set_level(logging.ERROR)
    hass.data[DOMAIN] = {"icons": {}}
    _set_member(hass, "off", temperature=19.0, current_temperature=18.0)
    area = ClimateGroup(
        hass, "linus_dashboard_all_climates_area_chambre", None, None, {}, [MEMBER]
    )
    floor = ClimateGroup(
        hass, "linus_dashboard_all_climates_floor_2", None, None, {}, [area.entity_id]
    )
    glob = ClimateGroup(
        hass, "linus_dashboard_all_climates_global", None, None, {}, [floor.entity_id]
    )
    platform = MockEntityPlatform(hass, domain="climate", platform_name=DOMAIN)
    await platform.async_add_entities([area, floor, glob])
    await settle(hass)
    group_ids = [area.entity_id, floor.entity_id, glob.entity_id]

    # heat -> setpoint -> measured temperature -> off, as in the ticket.
    steps = [
        ("heat", 19.0, 18.0),
        ("heat", 21.0, 18.0),
        ("heat", 21.0, 20.5),
        ("off", 21.0, 20.5),
    ]
    for hvac_mode, temperature, current in steps:
        _set_member(
            hass, hvac_mode, temperature=temperature, current_temperature=current
        )
        await settle(hass)
        for group_id in group_ids:
            state = hass.states.get(group_id)
            assert state.state == hvac_mode
            assert state.attributes["temperature"] == temperature
            assert state.attributes["current_temperature"] == current
            assert state.attributes["supported_features"] == OWN_FEATURES
            assert "preset_modes" not in state.attributes

    errors = [r for r in caplog.records if r.levelno >= logging.ERROR]
    assert errors == []
