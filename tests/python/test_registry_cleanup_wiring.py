"""
Each platform reports its full build to the registry cleanup (#217).

A report that leaves out something the platform still builds deletes it from
Home Assistant, so the platforms' reports are checked end to end: setup at
boot, then the post-start rebuild, against a config entry whose registry also
holds a ghost of an earlier run.
"""

from __future__ import annotations

import asyncio
from types import SimpleNamespace

import pytest
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er

from custom_components.linus_dashboard import (
    binary_sensor,
    light,
    registry_cleanup,
    sensor,
)

from .conftest import _setup


@pytest.fixture
def owned(entity_reg, monkeypatch):
    """The config entry's own registry entries; returns (add, removed)."""
    entries: dict[str, SimpleNamespace] = {}
    removed: list[str] = []

    def add(entity_id: str, unique_id: str) -> None:
        entries[entity_id] = SimpleNamespace(
            entity_id=entity_id,
            unique_id=unique_id,
            domain=entity_id.split(".", 1)[0],
        )

    def remove(entity_id: str) -> None:
        entries.pop(entity_id)
        removed.append(entity_id)

    entity_reg.async_remove = remove
    monkeypatch.setattr(
        er, "async_entries_for_config_entry", lambda _reg, _id: list(entries.values())
    )
    monkeypatch.setattr(dr, "async_entries_for_config_entry", lambda _reg, _id: [])
    return add, removed


def _built(unique_id: str):
    return SimpleNamespace(unique_id=unique_id, device_info=None)


def _start_up(mock_hass, platform):
    """STARTED, then PlatformGroupManager's delayed rebuild, Home Assistant running."""

    async def run():
        (_event, started_cb) = platform.started_listeners[0]
        started_cb(None)
        mock_hass.is_running = True
        await platform.later_actions[0](None)
        await platform.flush()

    asyncio.run(run())


@pytest.fixture(autouse=True)
def clean_group_registries():
    yield
    light._LIGHT_GROUPS.clear()
    binary_sensor._PRESENCE_GROUPS.clear()
    binary_sensor._DEVICE_CLASS_GROUPS.clear()


def _builder(registry: dict, builds):
    """A fake build that, like the real factories, records what it builds."""
    builds = iter(builds)

    async def build(*_args, **_kwargs):
        groups = [_built(unique_id) for unique_id in next(builds)]
        for group in groups:
            registry[group.unique_id] = group
        return groups

    return build


@pytest.fixture
def sensor_build(entity_reg, fake_states, owned, monkeypatch, mock_hass):
    """A static aggregate, a health and a numeric sensor, plus a ghost."""
    add, _removed = owned

    async def aggregates(*_args):
        return [_built("linus_dashboard_lights_area_salon")]

    async def health(*_args):
        return [_built("linus_dashboard_unavailable_area_salon")]

    monkeypatch.setattr(sensor, "_build_aggregate_sensors", aggregates)
    monkeypatch.setattr(sensor, "_build_health_sensors", health)
    entity_reg.add("sensor.t1", device_class="temperature")
    fake_states.set("sensor.t1", "20", {"device_class": "temperature"})
    add("sensor.lights_salon", "linus_dashboard_lights_area_salon")
    add("sensor.unavailable_salon", "linus_dashboard_unavailable_area_salon")
    add("sensor.temperature_salon", "linus_dashboard_temperature_area_salon")
    add("sensor.temperature_cave", "linus_dashboard_temperature_area_cave")


def test_sensor_rebuild_reports_static_and_numeric_sensors(
    mock_hass, mock_config_entry, platform, owned, sensor_build
):
    _add, removed = owned
    registry_cleanup.async_init(mock_hass, mock_config_entry, ["sensor"])

    _setup(mock_hass, mock_config_entry, platform)
    assert removed == []  # built before start: settles nothing

    _start_up(mock_hass, platform)

    assert removed == ["sensor.temperature_cave"]


def test_sensor_setup_at_reload_reports_static_and_numeric_sensors(
    mock_hass, mock_config_entry, platform, owned, sensor_build
):
    """At reload no rebuild follows: the setup report itself cleans up."""
    _add, removed = owned
    mock_hass.is_running = True
    registry_cleanup.async_init(mock_hass, mock_config_entry, ["sensor"])

    _setup(mock_hass, mock_config_entry, platform)

    assert removed == ["sensor.temperature_cave"]


def test_light_rebuild_reports_every_group(
    mock_hass, mock_config_entry, platform, owned, monkeypatch
):
    add, removed = owned
    build = _builder(
        light._LIGHT_GROUPS,
        [
            ["lights_salon"],
            ["lights_salon", "lights_chambre"],
            ["lights_salon"],
        ],
    )
    monkeypatch.setattr(light, "build_nested_domain_groups", build)
    add("light.salon", "lights_salon")
    add("light.chambre", "lights_chambre")
    add("light.cave", "lights_cave")
    registry_cleanup.async_init(mock_hass, mock_config_entry, ["light"])

    asyncio.run(light.async_setup_entry(mock_hass, mock_config_entry, lambda _e: None))
    assert removed == []

    _start_up(mock_hass, platform)
    assert removed == ["light.cave"]

    # The chambre's last light moves out; the salon group, unchanged, stays.
    async def rebuild_again():
        await platform.later_actions[0](None)
        await platform.flush()

    asyncio.run(rebuild_again())
    assert removed == ["light.cave", "light.chambre"]


def test_binary_sensor_rebuild_reports_presence_and_device_class_groups(
    mock_hass, mock_config_entry, platform, owned, monkeypatch
):
    add, removed = owned
    presence = _builder(
        binary_sensor._PRESENCE_GROUPS, [["presence_salon"], ["presence_salon"]]
    )
    device_class = _builder(
        binary_sensor._DEVICE_CLASS_GROUPS, [["door_salon"], ["door_salon"]]
    )
    monkeypatch.setattr(binary_sensor, "_build_presence_groups", presence)
    monkeypatch.setattr(binary_sensor, "_build_device_class_groups", device_class)
    add("binary_sensor.presence_salon", "presence_salon")
    add("binary_sensor.door_salon", "door_salon")
    add("binary_sensor.presence_cave", "presence_cave")
    registry_cleanup.async_init(mock_hass, mock_config_entry, ["binary_sensor"])

    asyncio.run(
        binary_sensor.async_setup_entry(mock_hass, mock_config_entry, lambda _e: None)
    )
    assert removed == []

    _start_up(mock_hass, platform)

    assert removed == ["binary_sensor.presence_cave"]


def test_excluded_binary_sensor_domain_removes_its_groups_at_boot(
    mock_hass, mock_config_entry, platform, owned
):
    add, removed = owned
    mock_config_entry.options = {"excluded_domains": ["binary_sensor"]}
    add("binary_sensor.presence_salon", "linus_dashboard_presence_area_salon")
    registry_cleanup.async_init(mock_hass, mock_config_entry, ["binary_sensor"])

    asyncio.run(
        binary_sensor.async_setup_entry(mock_hass, mock_config_entry, lambda _e: None)
    )

    assert removed == ["binary_sensor.presence_salon"]
