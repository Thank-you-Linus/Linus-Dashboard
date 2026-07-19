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
from unittest.mock import MagicMock

import pytest
from homeassistant.core import HomeAssistant, State


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
