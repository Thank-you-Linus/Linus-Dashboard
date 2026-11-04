"""
Regression tests for TK-259: reloading the config entry failed every other
time with `RuntimeError: Added route will never be executed, method GET is
already registered`.

Every async_setup_entry registered the bundled JS files as static paths
again, while async_unload_entry only removed the panel — and an aiohttp route
cannot be removed while Home Assistant runs. The static paths are now
registered once per Home Assistant start (async_setup); each entry load only
(re)declares the Lovelace resources and the panel.

The HTTP server is a double that raises on any duplicate URL, like the real
aiohttp router does; the real-router check lives in
tests/python/integration/test_reload_integration.py.
"""

from __future__ import annotations

import asyncio
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import AsyncMock, MagicMock

import pytest

import custom_components.linus_dashboard as integration
from custom_components.linus_dashboard.const import DOMAIN

JS_FILES = [
    "custom-elements-guard.js",
    "browser_mod.js",
    "lovelace-mushroom/mushroom.js",
    "lovelace-card-mod/card-mod.js",
    "swipe-card/swipe-card.js",
    "stack-in-card/stack-in-card.js",
    "linus-strategy.js",
]
URLS = [f"/{DOMAIN}_files/www/{js_file}" for js_file in JS_FILES]
RELOADS = 5


class FakeHttp:
    """hass.http double: records each static URL, raises on a duplicate."""

    def __init__(self) -> None:
        self.urls: list[str] = []

    async def async_register_static_paths(self, configs) -> None:
        for config in configs:
            if config.url_path in self.urls:
                msg = (
                    "Added route will never be executed, "
                    "method GET is already registered"
                )
                raise RuntimeError(msg)
            self.urls.append(config.url_path)


@pytest.fixture
def harness(mock_hass, monkeypatch):
    """Drive async_setup / async_setup_entry / async_unload_entry on mock_hass."""
    ctx = SimpleNamespace(http=FakeHttp(), panels={}, resources=[])

    async def run_in_executor(func, *args):
        return func(*args)

    mock_hass.http = ctx.http
    mock_hass.async_add_executor_job = run_in_executor
    mock_hass.config = SimpleNamespace(language="en")
    mock_hass.config_entries = MagicMock()
    mock_hass.config_entries.async_forward_entry_setups = AsyncMock(return_value=True)
    mock_hass.config_entries.async_unload_platforms = AsyncMock(return_value=True)
    mock_hass.data["lovelace"] = SimpleNamespace(dashboards={})

    async def fake_init_resource(_hass, url, _ver):
        ctx.resources.append(url.split("?", maxsplit=1)[0])
        return True

    def fake_register_panel(_hass, url_path, _mode, _config, _update):
        if url_path in ctx.panels:
            msg = f"Overwriting panel {url_path}"
            raise ValueError(msg)
        ctx.panels[url_path] = _config

    def fake_remove_panel(_hass, url_path):
        ctx.panels.pop(url_path)

    async def fake_noop(*_args, **_kwargs):
        return {}

    monkeypatch.setattr(integration.utils, "init_resource", fake_init_resource)
    monkeypatch.setattr(integration, "_register_panel", fake_register_panel)
    monkeypatch.setattr(integration.frontend, "async_remove_panel", fake_remove_panel)
    monkeypatch.setattr(integration, "LovelaceYAML", MagicMock())
    monkeypatch.setattr(integration.registry_cleanup, "async_init", MagicMock())
    monkeypatch.setattr(integration.registry_cleanup, "async_unload", MagicMock())
    monkeypatch.setattr(integration, "async_get_icons", fake_noop)
    monkeypatch.setattr(integration, "async_get_translations", fake_noop)
    monkeypatch.setattr(
        integration, "async_cleanup_orphaned_aggregate_sensors", fake_noop
    )
    monkeypatch.setattr(
        integration, "async_unhide_domain_level_aggregate_sensors", fake_noop
    )
    monkeypatch.setattr(
        integration, "async_hide_group_entities_from_voice_assistants", fake_noop
    )
    monkeypatch.setattr(
        integration.websocket_api, "async_register_command", MagicMock()
    )
    return ctx


def _entry(entry_id: str) -> MagicMock:
    entry = MagicMock()
    entry.entry_id = entry_id
    entry.options = {}
    return entry


def test_setup_unload_cycle_is_idempotent(mock_hass, harness):
    entry = _entry("entry_a")

    async def run():
        assert await integration.async_setup(mock_hass, {})
        assert await integration.async_setup_entry(mock_hass, entry)
        for _ in range(RELOADS):
            assert await integration.async_unload_entry(mock_hass, entry)
            assert await integration.async_setup_entry(mock_hass, entry)

    asyncio.run(run())

    assert harness.http.urls == URLS
    assert list(harness.panels) == [DOMAIN]


def test_remove_then_readd_without_restart(mock_hass, harness):
    first = _entry("entry_a")
    second = _entry("entry_b")

    async def run():
        assert await integration.async_setup(mock_hass, {})
        assert await integration.async_setup_entry(mock_hass, first)
        assert await integration.async_unload_entry(mock_hass, first)
        assert not harness.panels
        # Removed then added again: a new entry_id, no new async_setup.
        assert await integration.async_setup_entry(mock_hass, second)

    asyncio.run(run())

    assert harness.http.urls == URLS
    assert list(harness.panels) == [DOMAIN]


def test_lovelace_resources_still_registered_each_setup(mock_hass, harness):
    entry = _entry("entry_a")

    async def run():
        assert await integration.async_setup(mock_hass, {})
        assert await integration.async_setup_entry(mock_hass, entry)
        for _ in range(2):
            assert await integration.async_unload_entry(mock_hass, entry)
            assert await integration.async_setup_entry(mock_hass, entry)

    asyncio.run(run())

    assert harness.resources == URLS * 3


def test_missing_js_file_skipped(mock_hass, harness, monkeypatch):
    missing = "swipe-card/swipe-card.js"
    real_exists = Path.exists

    def fake_exists(path: Path) -> bool:
        if path.as_posix().endswith(missing):
            return False
        return real_exists(path)

    monkeypatch.setattr(Path, "exists", fake_exists)
    entry = _entry("entry_a")

    async def run():
        assert await integration.async_setup(mock_hass, {})
        assert await integration.async_setup_entry(mock_hass, entry)

    asyncio.run(run())

    present = [url for url in URLS if not url.endswith(missing)]
    assert harness.http.urls == present
    assert harness.resources == present
