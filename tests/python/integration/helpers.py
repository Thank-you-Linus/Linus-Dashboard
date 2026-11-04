"""Shared helpers of the integration tests (import after their importorskip)."""

from __future__ import annotations

from datetime import timedelta
from typing import TYPE_CHECKING

from homeassistant.util import dt as dt_util
from pytest_homeassistant_custom_component.common import async_fire_time_changed

from custom_components.linus_dashboard.entity_group import DEBOUNCE_SECONDS

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant


async def settle(hass: HomeAssistant) -> None:
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
