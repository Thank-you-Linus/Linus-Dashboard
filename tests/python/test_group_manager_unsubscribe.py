"""
Unsubscribing the one-time STARTED listener must be safe after it fired.

HA's async_listen_once remove function raises (and logs "Unable to remove
unknown job listener" at ERROR) once the listener already removed itself.
"""

from __future__ import annotations

import asyncio
import logging
from unittest.mock import MagicMock

import pytest

from custom_components.linus_dashboard import group_manager
from custom_components.linus_dashboard.group_manager import (
    GroupManager,
    PlatformGroupManager,
)


class _FakeBus:
    """Bus whose listen_once remove function behaves like HA core's."""

    def __init__(self) -> None:
        self.once: list = []

    def async_listen_once(self, _event, cb):
        entry = [cb]
        self.once.append(entry)

        def remove() -> None:
            if entry not in self.once:
                logging.getLogger("homeassistant.core").error(
                    "Unable to remove unknown job listener"
                )
                raise ValueError("list.remove(x): x not in list")
            self.once.remove(entry)

        return remove

    def async_listen(self, _event, _cb):
        return MagicMock()

    def fire_started(self) -> None:
        for entry in list(self.once):
            self.once.remove(entry)  # one-time listeners remove themselves
            entry[0](None)


@pytest.fixture
def bus_hass(mock_hass, monkeypatch):
    mock_hass.bus = _FakeBus()
    mock_hass.is_running = False
    monkeypatch.setattr(group_manager, "async_call_later", lambda *_a, **_k: None)
    return mock_hass


def test_platform_manager_unsub_after_started_is_silent(bus_hass, caplog):
    manager = PlatformGroupManager(bus_hass, monitored_domains=["sensor"])
    unsubs = manager.setup_listeners()

    bus_hass.bus.fire_started()
    with caplog.at_level(logging.ERROR):
        for unsub in unsubs:
            unsub()

    assert not [r for r in caplog.records if r.levelno >= logging.ERROR]


def test_platform_manager_unsub_before_started_removes_listener(bus_hass):
    manager = PlatformGroupManager(bus_hass, monitored_domains=["sensor"])
    unsubs = manager.setup_listeners()

    for unsub in unsubs:
        unsub()

    assert bus_hass.bus.once == []


def test_group_manager_cleanup_after_started_is_silent(bus_hass, caplog):
    async def refresh() -> None:
        return None

    manager = GroupManager(bus_hass, refresh, monitored_domains=["light"])
    asyncio.run(manager.async_setup())

    bus_hass.bus.fire_started()
    with caplog.at_level(logging.ERROR):
        manager.cleanup()

    assert not [r for r in caplog.records if r.levelno >= logging.ERROR]
