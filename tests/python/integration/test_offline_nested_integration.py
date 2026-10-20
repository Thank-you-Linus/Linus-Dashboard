"""
End-to-end check of fully-offline nested groups on a real HomeAssistant (TK-188).

Unlike tests/python/test_offline_nested_groups.py (MagicMock hass), this goes
through the real state machine, the real entity platform, the real
async_track_state_change_event subscriptions and the real debounce: leaves are
set with hass.states.async_set, the area > floor > global groups are added
through an EntityPlatform, and nothing is ever written by hand on a group.

Needs pytest-homeassistant-custom-component, which cannot share a process with
the unit suite (its autouse fixtures call asyncio.get_event_loop(), which the
unit tests' asyncio.run() leaves unset) nor an environment with
requirements.txt (aiohasupervisor pin). It is skipped when the plugin is
absent and run on its own by the CI `python-tests-integration` job:
`python3 -m pytest tests/python/integration`.
"""

from __future__ import annotations

from datetime import timedelta
from typing import TYPE_CHECKING

import pytest

pytest.importorskip("pytest_homeassistant_custom_component")

from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import (
    MockEntityPlatform,
    async_fire_time_changed,
)

from custom_components.linus_dashboard.binary_sensor import (
    BinarySensorDeviceClassGroup,
)
from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.entity_group import DEBOUNCE_SECONDS
from custom_components.linus_dashboard.light import LightGroup

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

ICONS = {
    "binary_sensor": {
        "motion": {"default": "mdi:motion-sensor", "state": {"off": "mdi:motion"}},
    },
    "light": {"_": {"default": "mdi:lightbulb", "state": {"off": "mdi:lightbulb-off"}}},
}


def _motion(hass, unique_id, members):
    return BinarySensorDeviceClassGroup(
        hass,
        unique_id=unique_id,
        translation_key=None,
        translation_placeholders=None,
        device_info={},
        member_entity_ids=members,
        device_class="motion",
    )


def _light(hass, unique_id, members):
    return LightGroup(hass, unique_id, None, None, {}, members)


CASES = {
    "binary_sensor": (
        _motion,
        "linus_dashboard_motion",
        ["binary_sensor.salon_motion_1", "binary_sensor.salon_motion_2"],
        "off",
    ),
    "light": (
        _light,
        "linus_dashboard_all_lights",
        ["light.salon_1", "light.salon_2"],
        "off",
    ),
}


async def _settle(hass: HomeAssistant) -> None:
    """Let each tier's debounce fire in turn (area, then floor, then global)."""
    # Deliver the pending state_changed events first, so the area's debounce
    # is actually scheduled before the first time jump.
    await hass.async_block_till_done()
    now = dt_util.utcnow()
    for tier in range(1, 4):
        async_fire_time_changed(
            hass, now + timedelta(seconds=tier * (DEBOUNCE_SECONDS + 1))
        )
        await hass.async_block_till_done()


async def _build_chain(hass: HomeAssistant, domain: str):
    factory, prefix, leaves, idle = CASES[domain]
    hass.data[DOMAIN] = {"icons": ICONS}
    for leaf in leaves:
        hass.states.async_set(leaf, idle)
    area = factory(hass, f"{prefix}_area_salon", leaves)
    floor = factory(hass, f"{prefix}_floor_ground", [area.entity_id])
    glob = factory(hass, f"{prefix}_global", [floor.entity_id])
    platform = MockEntityPlatform(hass, domain=domain, platform_name=DOMAIN)
    await platform.async_add_entities([area, floor, glob])
    await _settle(hass)
    return leaves, [area.entity_id, floor.entity_id, glob.entity_id]


@pytest.mark.parametrize("domain", sorted(CASES))
async def test_offline_leaves_propagate_and_recover(hass: HomeAssistant, domain):
    leaves, group_ids = await _build_chain(hass, domain)
    area_id = group_ids[0]

    # Healthy baseline: every tier counts the two leaves.
    for group_id in group_ids:
        state = hass.states.get(group_id)
        assert state.state == "off"
        assert state.attributes["total"] == 2
        assert state.attributes["unavailable_entity_ids"] == []

    # Every leaf of the area goes offline.
    for leaf in leaves:
        hass.states.async_set(leaf, "unavailable")
    await _settle(hass)

    area = hass.states.get(area_id)
    assert area.attributes["entity_id"] == leaves
    for group_id in group_ids:
        state = hass.states.get(group_id)
        # Own state stays unavailable — never off/unknown (criterion 4).
        assert state.state == "unavailable"
        # Leaves cited, no group id, each leaf counted (criteria 1, 2, 3, 5).
        assert state.attributes["unavailable_entity_ids"] == leaves
        assert state.attributes["unavailable_count"] == 2
        assert state.attributes["total"] == 2

    # One leaf comes back: no reload, the subscriptions do the rest (crit. 6).
    hass.states.async_set(leaves[0], CASES[domain][3])
    await _settle(hass)

    for group_id in group_ids:
        state = hass.states.get(group_id)
        assert state.state == "off"
        assert state.attributes["unavailable_entity_ids"] == [leaves[1]]
        assert state.attributes["unavailable_count"] == 1
        assert state.attributes["total"] == 2
