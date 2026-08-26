"""
Unit tests for sensor.py's registry-scanning helpers: _build_aggregate_sensors
and _discover_numeric_device_classes.

Both call er.async_get(hass)/dr.async_get(hass)/ar.async_get(hass) internally
(module-level registry helpers, not passed as arguments), so tests patch
sensor.er.async_get / sensor.dr.async_get / sensor.ar.async_get to return fake
registry objects whose .entities.values() yields lightweight SimpleNamespace
RegistryEntry stand-ins, matching the pattern used for entity_group.py's
scan_domain_members/discover_device_classes in test_entity_group.py.

_build_aggregate_sensors is async (awaited by async_setup_entry), so it's run
via asyncio.run rather than pulling in pytest-asyncio for one coroutine —
same approach as test_health_sensor.py's async_will_remove_from_hass test.
"""

import asyncio
from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from homeassistant.const import EntityCategory

from custom_components.linus_dashboard.entity_group import ExclusionConfig
from custom_components.linus_dashboard.sensor import (
    _build_aggregate_sensors,
    _discover_numeric_device_classes,
)


def _registry_entry(
    entity_id: str,
    domain: str,
    *,
    platform: str = "demo",
    hidden_by: str | None = None,
    disabled_by: str | None = None,
    entity_category: EntityCategory | None = None,
    device_id: str | None = None,
    area_id: str | None = None,
    device_class: str | None = None,
    original_device_class: str | None = None,
) -> SimpleNamespace:
    """
    Lightweight stand-in for an er.RegistryEntry exposing only the
    attributes _build_aggregate_sensors/_discover_numeric_device_classes
    actually read.
    """
    return SimpleNamespace(
        entity_id=entity_id,
        domain=domain,
        platform=platform,
        hidden_by=hidden_by,
        disabled_by=disabled_by,
        entity_category=entity_category,
        device_id=device_id,
        area_id=area_id,
        device_class=device_class,
        original_device_class=original_device_class,
    )


def test_build_aggregate_sensors_excludes_hidden_and_disabled_entities(
    mock_hass, fake_states, mock_config_entry
):
    entity_reg = MagicMock()
    entity_reg.entities = {
        "binary_sensor.hidden": _registry_entry(
            "binary_sensor.hidden", "binary_sensor", hidden_by="user", area_id="area1"
        ),
        "binary_sensor.disabled": _registry_entry(
            "binary_sensor.disabled",
            "binary_sensor",
            disabled_by="user",
            area_id="area1",
        ),
        "binary_sensor.normal": _registry_entry(
            "binary_sensor.normal", "binary_sensor", area_id="area1"
        ),
    }
    area_reg = MagicMock()
    area_reg.async_get_area.return_value = SimpleNamespace(floor_id=None)

    with (
        patch(
            "custom_components.linus_dashboard.sensor.er.async_get",
            return_value=entity_reg,
        ),
        patch(
            "custom_components.linus_dashboard.sensor.dr.async_get",
            return_value=MagicMock(),
        ),
        patch(
            "custom_components.linus_dashboard.sensor.ar.async_get",
            return_value=area_reg,
        ),
    ):
        sensors = asyncio.run(_build_aggregate_sensors(mock_hass, mock_config_entry))

    assert len(sensors) == 1
    assert sensors[0]._tracked_entities == frozenset({"binary_sensor.normal"})


def test_build_aggregate_sensors_excludes_config_category_entities(
    mock_hass, fake_states, mock_config_entry
):
    entity_reg = MagicMock()
    entity_reg.entities = {
        "binary_sensor.config": _registry_entry(
            "binary_sensor.config",
            "binary_sensor",
            entity_category=EntityCategory.CONFIG,
            area_id="area1",
        ),
        "binary_sensor.normal": _registry_entry(
            "binary_sensor.normal", "binary_sensor", area_id="area1"
        ),
    }
    area_reg = MagicMock()
    area_reg.async_get_area.return_value = SimpleNamespace(floor_id=None)

    with (
        patch(
            "custom_components.linus_dashboard.sensor.er.async_get",
            return_value=entity_reg,
        ),
        patch(
            "custom_components.linus_dashboard.sensor.dr.async_get",
            return_value=MagicMock(),
        ),
        patch(
            "custom_components.linus_dashboard.sensor.ar.async_get",
            return_value=area_reg,
        ),
    ):
        sensors = asyncio.run(_build_aggregate_sensors(mock_hass, mock_config_entry))

    # entity_category == config is the new exclusion this test guards.
    assert len(sensors) == 1
    assert sensors[0]._tracked_entities == frozenset({"binary_sensor.normal"})


def test_discover_numeric_device_classes_excludes_hidden_and_disabled_entities(
    mock_hass, fake_states
):
    entity_reg = MagicMock()
    entity_reg.entities = {
        "sensor.hidden": _registry_entry(
            "sensor.hidden", "sensor", hidden_by="user", device_class="temperature"
        ),
        "sensor.normal": _registry_entry(
            "sensor.normal", "sensor", device_class="humidity"
        ),
    }
    fake_states.set("sensor.hidden", "21.5")
    fake_states.set("sensor.normal", "45")

    with patch(
        "custom_components.linus_dashboard.sensor.er.async_get",
        return_value=entity_reg,
    ):
        result = _discover_numeric_device_classes(mock_hass, ExclusionConfig())

    assert result == {"humidity"}


def test_discover_numeric_device_classes_excludes_config_category_entities(
    mock_hass, fake_states
):
    entity_reg = MagicMock()
    entity_reg.entities = {
        "sensor.config": _registry_entry(
            "sensor.config",
            "sensor",
            entity_category=EntityCategory.CONFIG,
            device_class="temperature",
        ),
        "sensor.normal": _registry_entry(
            "sensor.normal", "sensor", device_class="humidity"
        ),
    }
    fake_states.set("sensor.config", "21.5")
    fake_states.set("sensor.normal", "45")

    with patch(
        "custom_components.linus_dashboard.sensor.er.async_get",
        return_value=entity_reg,
    ):
        result = _discover_numeric_device_classes(mock_hass, ExclusionConfig())

    # entity_category == config is the new exclusion this test guards.
    assert result == {"humidity"}
