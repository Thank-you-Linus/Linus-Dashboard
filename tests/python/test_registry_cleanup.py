"""
Registry reconciliation (#217): what no platform builds any more is removed.

Ghost groups (entity registry entries no build produces, "unavailable /
restored" forever) and their area/floor devices, which Home Assistant would
otherwise only let the user enable or disable.
"""

from __future__ import annotations

from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

import custom_components.linus_dashboard as integration
from custom_components.linus_dashboard import group_manager, registry_cleanup
from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.group_manager import PlatformGroupManager

PLATFORMS = ("light", "sensor")
AREA_SALON = (DOMAIN, "test_entry_area_salon")
AREA_CAVE = (DOMAIN, "test_entry_area_cave")


class _Registries:
    """Entity and device registries of one config entry, recording removals."""

    def __init__(self) -> None:
        self.entities: dict[str, SimpleNamespace] = {}
        self.devices: dict[str, SimpleNamespace] = {}
        self.removed_entities: list[str] = []
        self.removed_devices: list[str] = []

    def add_entity(self, entity_id: str, unique_id: str) -> None:
        self.entities[entity_id] = SimpleNamespace(
            entity_id=entity_id,
            unique_id=unique_id,
            domain=entity_id.split(".", 1)[0],
        )

    def add_device(self, device_id: str, identifier: tuple[str, str]) -> None:
        self.devices[device_id] = SimpleNamespace(
            id=device_id, name=device_id, identifiers={identifier}
        )

    # entity registry
    def async_remove(self, entity_id: str) -> None:
        self.entities.pop(entity_id)
        self.removed_entities.append(entity_id)

    # device registry
    def async_update_device(self, device_id: str, *, remove_config_entry_id: str):
        assert remove_config_entry_id == "test_entry"
        self.devices.pop(device_id)
        self.removed_devices.append(device_id)


@pytest.fixture
def regs(monkeypatch) -> _Registries:
    regs = _Registries()
    monkeypatch.setattr(er, "async_get", lambda _hass: regs)
    monkeypatch.setattr(dr, "async_get", lambda _hass: regs)
    monkeypatch.setattr(
        er,
        "async_entries_for_config_entry",
        lambda reg, _entry_id: list(reg.entities.values()),
    )
    monkeypatch.setattr(
        dr,
        "async_entries_for_config_entry",
        lambda reg, _entry_id: list(reg.devices.values()),
    )
    return regs


@pytest.fixture
def hass(mock_hass):
    mock_hass.is_running = True
    return mock_hass


def _group(unique_id: str, identifier: tuple[str, str] | None = AREA_SALON):
    device_info = {"identifiers": {identifier}} if identifier else None
    return SimpleNamespace(unique_id=unique_id, device_info=device_info)


def _start(hass, entry, platforms=PLATFORMS):
    registry_cleanup.async_init(hass, entry, platforms)


def test_nothing_is_removed_before_ready(hass, mock_config_entry, regs):
    regs.add_entity("light.ghost", "linus_dashboard_all_lights_area_cave")
    regs.add_device("cave", AREA_CAVE)
    _start(hass, mock_config_entry)

    registry_cleanup.async_report_built(hass, mock_config_entry, "light", [])
    registry_cleanup.async_report_built(hass, mock_config_entry, "sensor", [])

    assert regs.removed_entities == []
    assert regs.removed_devices == []


def test_ready_removes_entities_no_build_produces(hass, mock_config_entry, regs):
    regs.add_entity("light.salon", "linus_dashboard_all_lights_area_salon")
    regs.add_entity("light.ghost", "linus_dashboard_all_lights_area_cave")
    regs.add_entity("sensor.health", "linus_dashboard_unavailable_area_salon")
    _start(hass, mock_config_entry)
    registry_cleanup.async_report_built(
        hass,
        mock_config_entry,
        "light",
        [_group("linus_dashboard_all_lights_area_salon")],
    )

    registry_cleanup.async_schedule_ready(hass, mock_config_entry)

    # sensor has not reported: its entities are left alone.
    assert regs.removed_entities == ["light.ghost"]


def test_unused_device_removed_once_every_platform_reported(
    hass, mock_config_entry, regs
):
    regs.add_device("salon", AREA_SALON)
    regs.add_device("cave", AREA_CAVE)
    _start(hass, mock_config_entry)
    registry_cleanup.async_report_built(
        hass, mock_config_entry, "light", [_group("lights_salon", AREA_SALON)]
    )
    registry_cleanup.async_schedule_ready(hass, mock_config_entry)

    # The sensor platform may still use the cave device.
    assert regs.removed_devices == []

    registry_cleanup.async_report_built(hass, mock_config_entry, "sensor", [])

    assert regs.removed_devices == ["cave"]
    assert "salon" in regs.devices


def test_device_used_by_another_platform_is_kept(hass, mock_config_entry, regs):
    regs.add_device("cave", AREA_CAVE)
    _start(hass, mock_config_entry)
    registry_cleanup.async_report_built(hass, mock_config_entry, "light", [])
    registry_cleanup.async_report_built(
        hass, mock_config_entry, "sensor", [_group("health_cave", AREA_CAVE)]
    )

    registry_cleanup.async_schedule_ready(hass, mock_config_entry)

    assert regs.removed_devices == []


def test_rebuild_after_ready_removes_the_dropped_group(hass, mock_config_entry, regs):
    regs.add_entity("light.salon", "lights_salon")
    regs.add_device("salon", AREA_SALON)
    _start(hass, mock_config_entry)
    registry_cleanup.async_report_built(
        hass, mock_config_entry, "light", [_group("lights_salon")]
    )
    registry_cleanup.async_report_built(hass, mock_config_entry, "sensor", [])
    registry_cleanup.async_schedule_ready(hass, mock_config_entry)
    assert regs.removed_entities == []

    # The salon's last light moved out: the light rebuild builds nothing.
    registry_cleanup.async_report_built(hass, mock_config_entry, "light", [])

    assert regs.removed_entities == ["light.salon"]
    assert regs.removed_devices == ["salon"]


def test_boot_waits_for_started_plus_delay(
    mock_hass, mock_config_entry, regs, monkeypatch
):
    mock_hass.is_running = False
    started: list = []
    later: list = []
    mock_hass.bus = MagicMock()
    mock_hass.bus.async_listen_once = lambda event, cb: (
        started.append((event, cb)) or MagicMock()
    )
    monkeypatch.setattr(
        registry_cleanup,
        "async_call_later",
        lambda _hass, delay, action: later.append((delay, action)) or MagicMock(),
    )
    regs.add_entity("light.ghost", "lights_cave")
    _start(mock_hass, mock_config_entry)
    registry_cleanup.async_report_built(mock_hass, mock_config_entry, "light", [])

    registry_cleanup.async_schedule_ready(mock_hass, mock_config_entry)
    assert [event for event, _ in started] == [EVENT_HOMEASSISTANT_STARTED]
    assert regs.removed_entities == []

    started[0][1](None)
    assert [delay for delay, _ in later] == [registry_cleanup.READY_DELAY]
    assert regs.removed_entities == []

    later[0][1](None)
    assert regs.removed_entities == ["light.ghost"]


def test_report_after_unload_is_ignored(hass, mock_config_entry, regs):
    regs.add_entity("light.salon", "lights_salon")
    _start(hass, mock_config_entry)
    registry_cleanup.async_schedule_ready(hass, mock_config_entry)
    registry_cleanup.async_unload(hass, mock_config_entry)

    registry_cleanup.async_report_built(hass, mock_config_entry, "light", [])

    assert regs.removed_entities == []


def test_user_may_delete_only_an_unused_device(hass, mock_config_entry, regs):
    _start(hass, mock_config_entry)
    registry_cleanup.async_report_built(
        hass, mock_config_entry, "light", [_group("lights_salon", AREA_SALON)]
    )
    salon = SimpleNamespace(identifiers={AREA_SALON})
    cave = SimpleNamespace(identifiers={AREA_CAVE})

    assert not registry_cleanup.async_device_is_removable(
        hass, mock_config_entry, salon
    )
    assert registry_cleanup.async_device_is_removable(hass, mock_config_entry, cave)


async def test_remove_config_entry_device_hook(hass, mock_config_entry, regs):
    _start(hass, mock_config_entry)
    registry_cleanup.async_report_built(
        hass, mock_config_entry, "light", [_group("lights_salon", AREA_SALON)]
    )

    assert not await integration.async_remove_config_entry_device(
        hass, mock_config_entry, SimpleNamespace(identifiers={AREA_SALON})
    )
    assert await integration.async_remove_config_entry_device(
        hass, mock_config_entry, SimpleNamespace(identifiers={AREA_CAVE})
    )


# ---------------------------------------------------------------------------
# A device moving to another area rebuilds the groups
# ---------------------------------------------------------------------------


@pytest.fixture
def device_listener(mock_hass, monkeypatch):
    """Set up a light PlatformGroupManager; return a fire(...) -> rebuilt? helper."""
    listeners: dict = {}
    created: list = []
    mock_hass.is_running = True
    mock_hass.bus = MagicMock()
    mock_hass.bus.async_listen = lambda event, cb: (
        listeners.__setitem__(event, cb) or MagicMock()
    )
    mock_hass.async_create_task = lambda coro: created.append(coro) or coro.close()
    devices = {
        "lamp_device": [SimpleNamespace(domain="light", platform="hue")],
        "sensor_device": [SimpleNamespace(domain="sensor", platform="zha")],
        "own_group_device": [SimpleNamespace(domain="light", platform=DOMAIN)],
    }
    monkeypatch.setattr(er, "async_get", lambda _hass: None)
    monkeypatch.setattr(
        er, "async_entries_for_device", lambda _reg, device_id: devices[device_id]
    )

    async def update(*_args):
        return None

    manager = PlatformGroupManager(mock_hass, monitored_domains=["light"])
    manager.register_callbacks(startup_callback=update, update_callback=update)
    manager.setup_listeners()

    def fire(device_id, changes, action="update"):
        before = len(created)
        listeners[dr.EVENT_DEVICE_REGISTRY_UPDATED](
            SimpleNamespace(
                data={"action": action, "device_id": device_id, "changes": changes}
            )
        )
        return len(created) > before

    return fire


def test_device_area_change_triggers_rebuild(device_listener):
    assert device_listener("lamp_device", {"area_id": "salon"})


@pytest.mark.parametrize(
    ("device_id", "changes", "action"),
    [
        ("lamp_device", {"name_by_user": None}, "update"),
        ("lamp_device", {"area_id": "salon"}, "create"),
        ("sensor_device", {"area_id": "salon"}, "update"),
        ("own_group_device", {"area_id": "salon"}, "update"),
    ],
)
def test_other_device_events_do_not_rebuild(
    device_listener, device_id, changes, action
):
    assert not device_listener(device_id, changes, action)


def test_device_listener_waits_for_startup(mock_hass, monkeypatch):
    listeners: dict = {}
    mock_hass.is_running = False
    mock_hass.bus = MagicMock()
    mock_hass.bus.async_listen = lambda event, cb: (
        listeners.__setitem__(event, cb) or MagicMock()
    )
    mock_hass.bus.async_listen_once = lambda *_a: MagicMock()
    monkeypatch.setattr(group_manager, "async_call_later", lambda *_a: MagicMock())
    entries_for_device = MagicMock()
    monkeypatch.setattr(er, "async_entries_for_device", entries_for_device)

    manager = PlatformGroupManager(mock_hass, monitored_domains=["light"])
    manager.setup_listeners()
    listeners[dr.EVENT_DEVICE_REGISTRY_UPDATED](
        SimpleNamespace(
            data={"action": "update", "device_id": "x", "changes": {"area_id": "a"}}
        )
    )

    entries_for_device.assert_not_called()
