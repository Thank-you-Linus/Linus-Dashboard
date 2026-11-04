"""Scene chip colors (TK-124): detection, WebSocket payload and manual colors."""

from __future__ import annotations

import asyncio
import json
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import MagicMock

import pytest
from homeassistant.components.homeassistant.scene import SceneConfig
from homeassistant.core import State

import custom_components.linus_dashboard as integration
from custom_components.linus_dashboard import config_flow, utils
from custom_components.linus_dashboard.config_flow import (
    LinusDashboardEditFlow,
    merge_scene_color_overrides,
)
from custom_components.linus_dashboard.const import CONF_SCENE_COLOR_OVERRIDES

TRANSLATIONS = Path(config_flow.__file__).parent / "translations"

RED = {"rgb": [255, 0, 0]}


# ---------------------------------------------------------------------------
# Fixtures reproducing hass.data["homeassistant_scene"].
#
# Same structure in HA 2025.5.0 (minimum in hacs.json) and 2026.4.0, file
# homeassistant/components/homeassistant/scene.py:
#   L84  DATA_PLATFORM = "homeassistant_scene"
#   L129-135 class SceneConfig(NamedTuple): id, name, icon, states: dict[str, State]
#   L182 hass.data[DATA_PLATFORM] = entity_platform.async_get_current_platform()
#   L338 HomeAssistantScene.scene_config
# The platform is faked (only `.entities`, entity_id -> scene); SceneConfig and
# State are HA's real classes.
# ---------------------------------------------------------------------------


def _light(entity_id: str, state: str = "on", **attributes) -> tuple[str, State]:
    return entity_id, State(entity_id, state, attributes)


def _scene(name: str, *lights: tuple[str, State]) -> SimpleNamespace:
    return SimpleNamespace(
        scene_config=SceneConfig(id=name, name=name, icon=None, states=dict(lights))
    )


def _install(hass, scenes: dict[str, SimpleNamespace]) -> None:
    hass.data[utils.SCENE_PLATFORM_DATA_KEY] = SimpleNamespace(entities=scenes)


def test_each_color_format_is_normalized(mock_hass):
    _install(
        mock_hass,
        {
            "scene.rgb": _scene("rgb", _light("light.a", rgb_color=[255, 0, 0])),
            "scene.hs": _scene("hs", _light("light.a", hs_color=[240, 100])),
            "scene.xy": _scene("xy", _light("light.a", xy_color=[0.17, 0.7])),
            "scene.kelvin": _scene(
                "kelvin",
                _light("light.a", color_mode="color_temp", color_temp_kelvin=2700),
            ),
            "scene.mireds": _scene("mireds", _light("light.a", color_temp=153)),
            "scene.off": _scene(
                "off", _light("light.a", state="off", rgb_color=[255, 0, 0])
            ),
            "scene.brightness": _scene("brightness", _light("light.a", brightness=200)),
            "scene.white_rgb": _scene(
                "white_rgb", _light("light.a", rgb_color=[255, 250, 245])
            ),
        },
    )

    colors = utils.scene_colors(mock_hass)

    assert colors["scene.rgb"] == [RED]
    assert colors["scene.hs"] == [{"rgb": [0, 0, 255]}]
    green = colors["scene.xy"][0]["rgb"]
    assert green[1] > green[0]
    assert green[1] > green[2]
    assert colors["scene.kelvin"] == [{"kelvin": 2700}]
    assert colors["scene.mireds"] == [{"kelvin": 6535}]
    # Lamp off, brightness only, quasi-white RGB: no color, scene absent
    assert "scene.off" not in colors
    assert "scene.brightness" not in colors
    assert "scene.white_rgb" not in colors
    json.dumps(colors)


def test_color_temp_mode_wins_over_snapshotted_rgb(mock_hass):
    # A scene snapshotted by the UI carries rgb_color even in color_temp mode
    _install(
        mock_hass,
        {
            "scene.snap": _scene(
                "snap",
                _light(
                    "light.a",
                    color_mode="color_temp",
                    color_temp_kelvin=6500,
                    rgb_color=[255, 254, 250],
                ),
            )
        },
    )

    assert utils.scene_colors(mock_hass) == {"scene.snap": [{"kelvin": 6500}]}


def test_only_lights_are_read(mock_hass):
    _install(
        mock_hass,
        {
            "scene.mixed": _scene(
                "mixed",
                ("switch.plug", State("switch.plug", "on", {"rgb_color": [0, 0, 255]})),
                _light("light.a", rgb_color=[255, 0, 0]),
            )
        },
    )

    assert utils.scene_colors(mock_hass) == {"scene.mixed": [RED]}


def test_dominant_color_first_then_scene_order_max_three(mock_hass):
    _install(
        mock_hass,
        {
            "scene.party": _scene(
                "party",
                _light("light.1", rgb_color=[0, 0, 255]),  # blue x1
                _light("light.2", rgb_color=[255, 0, 0]),  # red x3 (close hues)
                _light("light.3", rgb_color=[255, 20, 0]),
                _light("light.4", rgb_color=[255, 10, 5]),
                _light("light.5", color_temp_kelvin=2700),  # warm x1
                _light("light.6", rgb_color=[0, 255, 0]),  # green x1
            )
        },
    )

    colors = utils.scene_colors(mock_hass)["scene.party"]

    assert colors == [RED, {"rgb": [0, 0, 255]}, {"kelvin": 2700}]


def test_no_scene_platform_gives_empty(mock_hass):
    assert utils.scene_colors(mock_hass) == {}


@pytest.mark.parametrize(
    "platform",
    [
        SimpleNamespace(),  # no `entities`
        SimpleNamespace(entities=42),
        SimpleNamespace(entities={"scene.a": SimpleNamespace()}),  # no scene_config
        SimpleNamespace(
            entities={
                "scene.a": SimpleNamespace(scene_config=SimpleNamespace(states=[1]))
            }
        ),  # states not a mapping
        SimpleNamespace(
            entities={
                "scene.a": SimpleNamespace(
                    scene_config=SimpleNamespace(
                        states={"light.a": SimpleNamespace(state="on")}
                    )
                )
            }
        ),  # target without attributes
    ],
)
def test_unknown_shape_gives_empty(mock_hass, platform):
    mock_hass.data[utils.SCENE_PLATFORM_DATA_KEY] = platform

    assert utils.scene_colors(mock_hass) == {}


def test_exception_gives_empty(mock_hass, monkeypatch):
    _install(
        mock_hass, {"scene.a": _scene("a", _light("light.a", rgb_color=[1, 2, 3]))}
    )

    def boom(_attributes):
        raise RuntimeError

    monkeypatch.setattr(utils, "_normalize_light_color", boom)

    assert utils.scene_colors(mock_hass) == {}


def test_overrides_are_returned_as_hex():
    assert utils.scene_color_overrides_hex({
        "scene.a": [255, 0, 16],
        "scene.bad": [300, 0, 0],
        "scene.short": [1, 2],
        "scene.bool": [True, 0, 0],
    }) == {"scene.a": "#ff0010"}
    assert utils.scene_color_overrides_hex(None) == {}


# ---------------------------------------------------------------------------
# WebSocket handler
# ---------------------------------------------------------------------------


def _get_config(mock_hass, *, is_admin: bool) -> dict:
    entry = MagicMock()
    entry.options = {CONF_SCENE_COLOR_OVERRIDES: {"scene.hue": [0, 128, 255]}}
    mock_hass.config_entries = MagicMock()
    mock_hass.config_entries.async_entries = lambda _domain: [entry]
    tasks = []
    mock_hass.async_create_background_task = lambda coro, *_a, **_k: tasks.append(coro)
    sent = []
    connection = MagicMock()
    connection.user.is_admin = is_admin
    connection.send_message = sent.append

    integration.websocket_get_entities(
        mock_hass, connection, {"id": 1, "type": "linus_dashboard/get_config"}
    )
    for task in tasks:
        asyncio.run(task)

    assert len(sent) == 1
    return json.loads(json.dumps(sent[0]))["result"]


def test_websocket_admin_gets_detected_colors(mock_hass):
    _install(
        mock_hass, {"scene.a": _scene("a", _light("light.a", rgb_color=[255, 0, 0]))}
    )

    result = _get_config(mock_hass, is_admin=True)

    assert result["scene_colors"] == {"scene.a": [RED]}
    assert result["scene_color_overrides"] == {"scene.hue": "#0080ff"}


def test_websocket_non_admin_gets_no_detected_colors(mock_hass):
    _install(
        mock_hass, {"scene.a": _scene("a", _light("light.a", rgb_color=[255, 0, 0]))}
    )

    result = _get_config(mock_hass, is_admin=False)

    assert result["scene_colors"] == {}
    assert result["scene_color_overrides"] == {"scene.hue": "#0080ff"}


# ---------------------------------------------------------------------------
# Manual colors: merge and options flow
# ---------------------------------------------------------------------------


def test_merge_scene_color_overrides():
    previous = {
        "scene.modified": [1, 1, 1],
        "scene.cleared": [2, 2, 2],
        "scene.gone": [3, 3, 3],
        "scene.kept_on_invalid": [4, 4, 4],
    }
    submitted = {
        "scene.added": [10, 20, 30],
        "scene.modified": [5, 5, 5],
        "scene.kept_on_invalid": [999, 0, 0],
        "scene.invalid_new": "red",
    }
    present = [
        "scene.added",
        "scene.modified",
        "scene.cleared",
        "scene.kept_on_invalid",
        "scene.invalid_new",
    ]

    assert merge_scene_color_overrides(previous, submitted, present) == {
        "scene.added": [10, 20, 30],
        "scene.modified": [5, 5, 5],
        "scene.gone": [3, 3, 3],
        "scene.kept_on_invalid": [4, 4, 4],
    }


@pytest.fixture
def flow(mock_hass, mock_config_entry, fake_states, entity_reg, monkeypatch):
    fake_states.async_entity_ids = lambda domain: [
        entity_id
        for entity_id in fake_states._states
        if entity_id.startswith(f"{domain}.")
    ]
    mock_config_entry.options = {
        "hide_greeting": False,
        CONF_SCENE_COLOR_OVERRIDES: {
            "scene.salon": [255, 0, 0],
            "scene.removed_from_ha": [0, 255, 0],
        },
    }
    edit_flow = LinusDashboardEditFlow(mock_config_entry)
    edit_flow.hass = mock_hass

    async def fake_views():
        return []

    async def fake_options():
        return []

    monkeypatch.setattr(edit_flow, "_get_available_dashboard_views", fake_views)
    monkeypatch.setattr(edit_flow, "_get_domain_options", fake_options)
    monkeypatch.setattr(edit_flow, "_get_integration_options", fake_options)
    monkeypatch.setattr(edit_flow, "_get_device_class_options", fake_options)
    monkeypatch.setattr(edit_flow, "_get_device_options", fake_options)
    return edit_flow


def test_flow_init_then_scene_colors_keeps_options_and_colors(flow, fake_states):
    fake_states.set("scene.salon", "scening")
    fake_states.set("scene.cuisine", "scening")

    async def run():
        form = await flow.async_step_init({"hide_greeting": True})
        done = await flow.async_step_scene_colors({"scene.cuisine": [0, 0, 255]})
        return form, done

    form, done = asyncio.run(run())

    assert form["type"] == "form"
    assert form["step_id"] == "scene_colors"
    fields = {str(key): key for key in form["data_schema"].schema}
    assert list(fields) == ["scene.cuisine", "scene.salon", "reset_scene_colors"]
    assert fields["scene.salon"].description == {"suggested_value": [255, 0, 0]}
    assert done["type"] == "create_entry"
    assert done["data"] == {
        "hide_greeting": True,
        "embedded_dashboards": [],
        CONF_SCENE_COLOR_OVERRIDES: {
            # salon cleared in the form -> removed; cuisine added;
            # scene absent from HA -> kept
            "scene.cuisine": [0, 0, 255],
            "scene.removed_from_ha": [0, 255, 0],
        },
    }


def _ui_submit(flow, fake_states, reset=None):
    """
    Drive init -> scene_colors as HA's UI submits it.

    A color input can't be emptied: a pre-filled field always comes back with
    its saved value; a field never touched is not sent.
    """
    fake_states.set("scene.salon", "scening", {"friendly_name": "Salon soirée"})
    fake_states.set("scene.cuisine", "scening")

    async def run():
        form = await flow.async_step_init({"hide_greeting": True})
        submitted = {
            "scene.salon": [255, 0, 0],  # pre-filled, sent back unchanged
        }
        if reset is not None:
            submitted["reset_scene_colors"] = reset
        return form, await flow.async_step_scene_colors(submitted)

    return asyncio.run(run())


def test_flow_reset_removes_a_color_as_the_ui_submits_it(flow, fake_states):
    form, done = _ui_submit(flow, fake_states, reset=["scene.salon"])

    reset_field = next(
        key for key in form["data_schema"].schema if str(key) == "reset_scene_colors"
    )
    selector = form["data_schema"].schema[reset_field]
    assert selector.config["multiple"] is True
    assert selector.config["options"] == [
        {"value": "scene.removed_from_ha", "label": "scene.removed_from_ha"},
        {"value": "scene.salon", "label": "Salon soirée (scene.salon)"},
    ]
    overrides = done["data"][CONF_SCENE_COLOR_OVERRIDES]
    assert "scene.salon" not in overrides
    assert overrides["scene.removed_from_ha"] == [0, 255, 0]
    assert "reset_scene_colors" not in done["data"]


def test_flow_without_reset_keeps_saved_colors_unchanged(flow, fake_states):
    _form, done = _ui_submit(flow, fake_states)

    assert done["data"][CONF_SCENE_COLOR_OVERRIDES] == {
        "scene.salon": [255, 0, 0],
        "scene.removed_from_ha": [0, 255, 0],
    }


def test_flow_hides_scenes_of_linus_and_magic_areas(flow, fake_states, entity_reg):
    fake_states.set("scene.salon", "scening")
    for entity_id, platform in [
        ("scene.magic", "magic_areas"),
        ("scene.brain", "linus_brain"),
        ("scene.dashboard", "linus_dashboard"),
        ("scene.hue", "hue"),
    ]:
        fake_states.set(entity_id, "scening")
        entity_reg.add(entity_id, platform=platform)

    async def run():
        return await flow.async_step_init({"hide_greeting": True})

    form = asyncio.run(run())

    scenes = [str(key) for key in form["data_schema"].schema]
    assert scenes == ["scene.hue", "scene.salon", "reset_scene_colors"]


def test_merge_applies_reset_whatever_the_color_field():
    assert merge_scene_color_overrides(
        {"scene.a": [1, 2, 3], "scene.b": [4, 5, 6], "scene.gone": [7, 8, 9]},
        {"scene.a": [1, 2, 3], "scene.b": [4, 5, 6]},
        ["scene.a", "scene.b"],
        reset=["scene.a", "scene.gone"],
    ) == {"scene.b": [4, 5, 6]}


def test_flow_without_scene_skips_the_step_and_keeps_colors(flow):
    async def run():
        return await flow.async_step_init({"hide_greeting": True})

    done = asyncio.run(run())

    assert done["type"] == "create_entry"
    assert done["data"][CONF_SCENE_COLOR_OVERRIDES] == {
        "scene.salon": [255, 0, 0],
        "scene.removed_from_ha": [0, 255, 0],
    }
    assert done["data"]["hide_greeting"] is True


@pytest.mark.parametrize("lang", ["en", "fr"])
def test_translations_carry_the_scene_colors_step(lang):
    step = json.loads((TRANSLATIONS / f"{lang}.json").read_text())["options"]["step"][
        "scene_colors"
    ]
    assert step["title"]
    assert step["description"]
    assert step["data"]["reset_scene_colors"]
    assert step["data_description"]["reset_scene_colors"]
