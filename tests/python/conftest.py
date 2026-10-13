"""
Pytest fixtures for Linus Dashboard backend unit tests.

Uses lightweight MagicMock(spec=HomeAssistant) fixtures rather than the full
pytest-homeassistant-custom-component plugin (not installed in this repo's
dev environment) — same convention as the sibling Linus Brain project's
tests/conftest.py for its non-integration-level tests. Sufficient for the
pure computation and single-entity logic covered here; full entity-lifecycle
(async_added_to_hass through a real entity_platform) is still only exercised
by manual live testing against the ha-test fixture.
"""

from __future__ import annotations

import asyncio
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from homeassistant.core import HomeAssistant, State
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import floor_registry as fr

import custom_components.linus_dashboard as integration
from custom_components.linus_dashboard import group_manager, sensor


class FakeStates:
    """Minimal stand-in for hass.states, backed by a plain dict of State objects."""

    def __init__(self, states: dict[str, State] | None = None) -> None:
        self._states = dict(states or {})

    def get(self, entity_id: str) -> State | None:
        return self._states.get(entity_id)

    def set(self, entity_id: str, state: str, attributes: dict | None = None) -> None:
        self._states[entity_id] = State(entity_id, state, attributes or {})


@pytest.fixture
def fake_states() -> FakeStates:
    """A settable hass.states stand-in; attach to mock_hass.states in a test."""
    return FakeStates()


@pytest.fixture
def mock_hass(fake_states: FakeStates) -> HomeAssistant:
    """
    Mock Home Assistant instance with a real, settable state machine stand-in.

    hass.loop is a real (never-run) event loop rather than a further mock —
    async_call_later/async_track_state_change_event use loop.time()/call_at()
    directly, which a plain MagicMock().loop can't satisfy realistically.
    """
    hass = MagicMock(spec=HomeAssistant)
    hass.states = fake_states
    hass.data = {}
    loop = asyncio.new_event_loop()
    hass.loop = loop
    yield hass
    loop.close()


@pytest.fixture
def mock_config_entry():
    """Mock config entry with empty exclusion options by default."""
    entry = MagicMock()
    entry.entry_id = "test_entry"
    entry.options = {}
    return entry


# ---------------------------------------------------------------------------
# Simulated registries
# ---------------------------------------------------------------------------


class FakeEntityRegistry:
    """Minimal entity registry: `.entities` plus `async_get`."""

    def __init__(self) -> None:
        self.entities: dict[str, SimpleNamespace] = {}

    def add(
        self,
        entity_id: str,
        *,
        area_id: str | None = "salon",
        device_class: str | None = None,
        original_device_class: str | None = None,
        capabilities: dict | None = None,
        unit_of_measurement: str | None = None,
        platform: str = "mqtt",
        hidden_by: str | None = None,
        disabled_by: str | None = None,
        entity_category: str | None = None,
    ) -> None:
        self.entities[entity_id] = SimpleNamespace(
            entity_id=entity_id,
            domain=entity_id.split(".", 1)[0],
            platform=platform,
            device_id=None,
            area_id=area_id,
            hidden_by=hidden_by,
            disabled_by=disabled_by,
            entity_category=entity_category,
            device_class=device_class,
            original_device_class=original_device_class,
            capabilities=capabilities,
            unit_of_measurement=unit_of_measurement,
        )

    def async_get(self, entity_id: str):
        return self.entities.get(entity_id)


class FakeAreaRegistry:
    """Areas keyed by id, each carrying a floor_id."""

    def __init__(self, areas: dict[str, str | None]) -> None:
        # area_id -> floor_id
        self._areas = {
            area_id: SimpleNamespace(
                name=area_id.title(),
                floor_id=floor_id,
                temperature_entity_id=None,
                humidity_entity_id=None,
            )
            for area_id, floor_id in areas.items()
        }

    def async_get_area(self, area_id: str):
        return self._areas.get(area_id)


class FakeFloorRegistry:
    """Floors named after their id."""

    def async_get_floor(self, floor_id: str):
        return SimpleNamespace(name=floor_id.title())


@pytest.fixture
def entity_reg(monkeypatch) -> FakeEntityRegistry:
    reg = FakeEntityRegistry()
    monkeypatch.setattr(er, "async_get", lambda _hass: reg)
    monkeypatch.setattr(
        dr, "async_get", lambda _hass: SimpleNamespace(async_get=lambda _id: None)
    )
    monkeypatch.setattr(
        ar,
        "async_get",
        lambda _hass: FakeAreaRegistry({"salon": "ground", "chambre": "ground"}),
    )
    monkeypatch.setattr(fr, "async_get", lambda _hass: FakeFloorRegistry())
    return reg


@pytest.fixture(autouse=True)
def clean_registry():
    sensor._NUMERIC_SENSORS.clear()
    yield
    sensor._NUMERIC_SENSORS.clear()


@pytest.fixture
def platform(monkeypatch, mock_hass):
    """
    Drive sensor.async_setup_entry against mock_hass.

    Returns a namespace with the captured `added` batches, the pending tasks
    scheduled through hass.async_create_task, the captured STARTED listeners
    and call_later actions, plus helpers to flush tasks.
    """
    ctx = SimpleNamespace(
        added=[],
        tasks=[],
        started_listeners=[],
        later_actions=[],
        hide_calls=0,
    )

    def create_task(coro):
        ctx.tasks.append(coro)
        return MagicMock()

    mock_hass.async_create_task = create_task
    mock_hass.bus = MagicMock()
    mock_hass.is_running = False
    mock_hass.bus.async_listen_once = lambda event, cb: (
        ctx.started_listeners.append((event, cb)) or MagicMock()
    )
    mock_hass.bus.async_listen = lambda event, cb: MagicMock()
    monkeypatch.setattr(
        group_manager,
        "async_call_later",
        lambda _hass, _delay, action: ctx.later_actions.append(action) or MagicMock(),
    )

    async def fake_empty(*_args, **_kwargs):
        return []

    monkeypatch.setattr(sensor, "_build_aggregate_sensors", fake_empty)
    monkeypatch.setattr(sensor, "_build_health_sensors", fake_empty)

    async def fake_hide(*_args, **_kwargs):
        ctx.hide_calls += 1

    monkeypatch.setattr(
        integration, "async_hide_group_entities_from_voice_assistants", fake_hide
    )

    async def flush():
        while ctx.tasks:
            await ctx.tasks.pop(0)

    ctx.flush = flush
    return ctx


def _setup(mock_hass, mock_config_entry, platform):
    def add(entities):
        platform.added.append(list(entities))

    asyncio.run(sensor.async_setup_entry(mock_hass, mock_config_entry, add))
