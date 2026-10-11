"""Options form on an install without other Lovelace dashboards."""

from __future__ import annotations

import asyncio
import json
import logging
from pathlib import Path

import pytest

from custom_components.linus_dashboard import config_flow
from custom_components.linus_dashboard.config_flow import LinusDashboardEditFlow

TRANSLATIONS = Path(config_flow.__file__).parent / "translations"


@pytest.fixture
def flow(mock_hass, mock_config_entry, monkeypatch):
    edit_flow = LinusDashboardEditFlow(mock_config_entry)
    edit_flow.hass = mock_hass
    notice_key = "component.linus_dashboard.options.step.init.no_dashboards_notice"

    async def fake_views():
        return []

    async def fake_options():
        return []

    async def fake_class_options():
        return {}

    async def fake_lang():
        return "en"

    async def fake_translations(_hass, _lang, _category, integrations=None):
        english = json.loads((TRANSLATIONS / "en.json").read_text())
        return {notice_key: english["options"]["step"]["init"]["no_dashboards_notice"]}

    monkeypatch.setattr(edit_flow, "_get_available_dashboard_views", fake_views)
    monkeypatch.setattr(edit_flow, "_get_domain_options", fake_options)
    monkeypatch.setattr(edit_flow, "_get_integration_options", fake_options)
    monkeypatch.setattr(edit_flow, "_get_device_class_options", fake_class_options)
    monkeypatch.setattr(edit_flow, "_get_current_language", fake_lang)
    monkeypatch.setattr(config_flow, "async_get_translations", fake_translations)
    return edit_flow


def test_no_dashboards_logs_nothing_above_debug(flow, caplog):
    with caplog.at_level(logging.INFO):
        asyncio.run(flow._build_form_schema())

    assert not [
        r
        for r in caplog.records
        if r.name.startswith("custom_components.linus_dashboard")
        and r.levelno > logging.DEBUG
    ]


def test_no_dashboards_form_carries_a_notice(flow):
    async def run():
        await flow._build_form_schema()
        return await flow.async_step_init()

    result = asyncio.run(run())

    notice = result["description_placeholders"]["dashboards_notice"]
    assert "No other dashboard was detected" in notice


def test_with_dashboards_the_notice_is_empty(flow, monkeypatch):
    async def fake_views():
        return [{"label": "Energy", "value": "energy||"}]

    monkeypatch.setattr(flow, "_get_available_dashboard_views", fake_views)

    async def run():
        await flow._build_form_schema()
        return await flow._get_dashboards_notice()

    assert asyncio.run(run()) == ""


@pytest.mark.parametrize("lang", ["en", "fr"])
def test_translations_carry_the_notice_and_placeholder(lang):
    init = json.loads((TRANSLATIONS / f"{lang}.json").read_text())["options"]["step"][
        "init"
    ]
    assert init["no_dashboards_notice"]
    assert "{dashboards_notice}" in init["description"]
