"""
Reloading the config entry on a real HomeAssistant (TK-259).

Every other reload used to end in setup_error: `RuntimeError: Added route will
never be executed, method GET is already registered`, because each
async_setup_entry registered the bundled JS files as static paths again on a
router that cannot drop a route while Home Assistant runs. Depending on the
registration order, main fails either with that RuntimeError on reload or
silently, with the same GET route registered twice; the one-route-per-URL
assertion below catches both. The unit tests
(tests/python/test_reload_static_paths.py) use an HTTP double; this goes
through the real `http` component and its aiohttp router, the real config
entries manager, the real platforms and the real options update listener.
Only what needs the frontend is replaced: the Lovelace dashboards collection,
the panel registration/removal and the Lovelace resources.

Run by the CI `python-tests-integration` job (see
test_offline_nested_integration.py for why it is a separate process).
"""

from __future__ import annotations

from types import SimpleNamespace
from typing import TYPE_CHECKING

import pytest

pytest.importorskip("pytest_homeassistant_custom_component")

from homeassistant.config_entries import ConfigEntryState
from homeassistant.setup import async_setup_component
from pytest_homeassistant_custom_component.common import MockConfigEntry

import custom_components.linus_dashboard as integration
from custom_components.linus_dashboard.const import CONF_HIDE_GREETING, DOMAIN

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant

URL_PREFIX = f"/{DOMAIN}_files/www/"
JS_FILES = [
    "custom-elements-guard.js",
    "browser_mod.js",
    "lovelace-mushroom/mushroom.js",
    "lovelace-card-mod/card-mod.js",
    "swipe-card/swipe-card.js",
    "stack-in-card/stack-in-card.js",
    "linus-strategy.js",
]
RELOADS = 5


@pytest.fixture
async def frontend_stub(
    hass: HomeAssistant, enable_custom_integrations, monkeypatch
) -> SimpleNamespace:
    """Real `http`; panel and Lovelace resources counted instead of served."""
    ctx = SimpleNamespace(panels={}, loads=0)
    assert await async_setup_component(hass, "http", {})
    hass.data["lovelace"] = SimpleNamespace(dashboards={})

    def fake_register_panel(_hass, url_path, _mode, config, _update):
        if url_path in ctx.panels:
            msg = f"Overwriting panel {url_path}"
            raise ValueError(msg)
        ctx.panels[url_path] = config
        ctx.loads += 1

    def fake_remove_panel(_hass, url_path):
        ctx.panels.pop(url_path)

    async def fake_init_resource(_hass, _url, _ver):
        return True

    monkeypatch.setattr(integration, "_register_panel", fake_register_panel)
    monkeypatch.setattr(integration.frontend, "async_remove_panel", fake_remove_panel)
    monkeypatch.setattr(integration.utils, "init_resource", fake_init_resource)
    return ctx


def _static_get_routes(hass: HomeAssistant) -> list[str]:
    return [
        route.resource.canonical
        for route in hass.http.app.router.routes()
        if route.method == "GET"
        and route.resource is not None
        and route.resource.canonical.startswith(URL_PREFIX)
    ]


def _assert_one_route_per_file_and_one_panel(
    hass: HomeAssistant, ctx: SimpleNamespace
) -> None:
    assert sorted(_static_get_routes(hass)) == sorted(
        URL_PREFIX + js_file for js_file in JS_FILES
    )
    assert list(ctx.panels) == [DOMAIN]


async def test_reload_via_config_entries_five_times(
    hass: HomeAssistant, frontend_stub: SimpleNamespace
):
    entry = MockConfigEntry(domain=DOMAIN)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    assert entry.state is ConfigEntryState.LOADED

    for _ in range(RELOADS):
        assert await hass.config_entries.async_reload(entry.entry_id)
        await hass.async_block_till_done()
        assert entry.state is ConfigEntryState.LOADED

    assert frontend_stub.loads == RELOADS + 1
    _assert_one_route_per_file_and_one_panel(hass, frontend_stub)


async def test_options_change_reloads_entry(
    hass: HomeAssistant, frontend_stub: SimpleNamespace
):
    entry = MockConfigEntry(domain=DOMAIN)
    entry.add_to_hass(hass)
    assert await hass.config_entries.async_setup(entry.entry_id)
    await hass.async_block_till_done()
    for _ in range(2):
        assert await hass.config_entries.async_reload(entry.entry_id)
        await hass.async_block_till_done()
        assert entry.state is ConfigEntryState.LOADED
    loads_before = frontend_stub.loads

    hass.config_entries.async_update_entry(entry, options={CONF_HIDE_GREETING: True})
    await hass.async_block_till_done()

    assert frontend_stub.loads == loads_before + 1
    assert entry.state is ConfigEntryState.LOADED
    _assert_one_route_per_file_and_one_panel(hass, frontend_stub)
