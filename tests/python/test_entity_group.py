"""Unit tests for entity_group.py's exclusion parsing and group-attribute helpers."""

from types import SimpleNamespace
from unittest.mock import MagicMock, patch

from homeassistant.const import EntityCategory

from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.entity_group import (
    ExclusionConfig,
    compute_group_attributes,
    discover_device_classes,
    domain_is_excluded,
    mean_float,
    scan_domain_members,
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
) -> SimpleNamespace:
    """
    Lightweight stand-in for an er.RegistryEntry exposing only the
    attributes scan_domain_members/discover_device_classes actually read.
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
    )


def test_mean_float_averages_with_decimal_precision():
    # group.util's own mean_int would truncate this to 21 — the whole reason
    # mean_float exists as a separate reducer for temperature/volume_level.
    assert mean_float(21.5, 22.3) == 21.9


def test_exclusion_config_from_config_entry_defaults_to_empty(mock_config_entry):
    mock_config_entry.options = {}
    exclusions = ExclusionConfig.from_config_entry(mock_config_entry)
    assert exclusions.excluded_domains == set()
    assert exclusions.excluded_entity_ids == set()
    assert exclusions.excluded_area_ids == set()


def test_exclusion_config_from_config_entry_reads_excluded_targets(mock_config_entry):
    mock_config_entry.options = {
        "excluded_domains": ["climate"],
        "excluded_device_classes": ["battery"],
        "excluded_integrations": ["mqtt"],
        "excluded_targets": {
            "entity_id": ["light.foo"],
            "device_id": ["dev1"],
            "area_id": ["garage"],
            "floor_id": ["basement"],
        },
    }
    exclusions = ExclusionConfig.from_config_entry(mock_config_entry)
    assert exclusions.excluded_domains == {"climate"}
    assert exclusions.excluded_device_classes == {"battery"}
    assert exclusions.excluded_integrations == {"mqtt"}
    assert exclusions.excluded_entity_ids == {"light.foo"}
    assert exclusions.excluded_device_ids == {"dev1"}
    assert exclusions.excluded_area_ids == {"garage"}
    assert exclusions.excluded_floor_ids == {"basement"}


def test_domain_is_excluded():
    exclusions = ExclusionConfig(excluded_domains={"switch"})
    assert domain_is_excluded("switch", exclusions) is True
    assert domain_is_excluded("light", exclusions) is False


def test_compute_group_attributes_uses_entity_id_key_for_more_info_dialog(
    mock_hass, fake_states
):
    # Must be exactly "entity_id" (ATTR_ENTITY_ID), not "entity_ids" — that's
    # the literal HA convention the more-info dialog looks for to recognize
    # and render a group's members.
    mock_hass.data[DOMAIN] = {
        "icons": {
            "light": {
                "_": {"default": "mdi:lightbulb", "state": {"off": "mdi:lightbulb-off"}}
            }
        }
    }
    fake_states.set("light.a", "on")
    fake_states.set("light.b", "off")
    attrs = compute_group_attributes(
        mock_hass,
        domain="light",
        device_class=None,
        member_entity_ids=["light.a", "light.b"],
    )
    assert attrs["entity_id"] == ["light.a", "light.b"]
    assert attrs["total"] == 2
    assert attrs["active_entity_ids"] == ["light.a"]
    assert attrs["icon"] == "mdi:lightbulb"
    assert attrs["color"] == "amber"


def test_compute_group_attributes_excludes_unavailable_members_from_active_states(
    mock_hass, fake_states
):
    fake_states.set("light.a", "unavailable")
    fake_states.set("light.b", "on")
    attrs = compute_group_attributes(
        mock_hass,
        domain="light",
        device_class=None,
        member_entity_ids=["light.a", "light.b"],
    )
    # total counts every member (including the unavailable one)...
    assert attrs["total"] == 2
    # ...but active_entity_ids must not treat "unavailable" as active.
    assert attrs["active_entity_ids"] == ["light.b"]


def test_compute_group_attributes_missing_member_state_is_skipped_not_errored(
    mock_hass, fake_states
):
    # No state registered for light.ghost at all (hass.states.get returns None).
    attrs = compute_group_attributes(
        mock_hass, domain="light", device_class=None, member_entity_ids=["light.ghost"]
    )
    assert attrs["active_entity_ids"] == []
    assert attrs["total"] == 1


def _patched_registries(entity_reg, area_reg=None):
    """Patch entity_group's module-level registry getters for scan_domain_members."""
    return (
        patch(
            "custom_components.linus_dashboard.entity_group.er.async_get",
            return_value=entity_reg,
        ),
        patch(
            "custom_components.linus_dashboard.entity_group.dr.async_get",
            return_value=MagicMock(),
        ),
        patch(
            "custom_components.linus_dashboard.entity_group.ar.async_get",
            return_value=area_reg or MagicMock(),
        ),
        patch(
            "custom_components.linus_dashboard.entity_group.fr.async_get",
            return_value=MagicMock(),
        ),
    )


def test_scan_domain_members_excludes_hidden_and_disabled_entities(
    mock_hass, fake_states
):
    entity_reg = MagicMock()
    entity_reg.entities = {
        "light.hidden": _registry_entry(
            "light.hidden", "light", hidden_by="user", area_id="area1"
        ),
        "light.disabled": _registry_entry(
            "light.disabled", "light", disabled_by="user", area_id="area1"
        ),
        "light.normal": _registry_entry("light.normal", "light", area_id="area1"),
    }
    area_reg = MagicMock()
    area_reg.async_get_area.return_value = SimpleNamespace(
        name="Living Room", floor_id=None
    )
    fake_states.set("light.normal", "on", {})

    p1, p2, p3, p4 = _patched_registries(entity_reg, area_reg)
    with p1, p2, p3, p4:
        result = scan_domain_members(
            mock_hass, domain="light", device_class=None, exclusions=ExclusionConfig()
        )

    # Only the non-hidden, non-disabled entity should survive the scan.
    assert result.area_entities == {"area1": ["light.normal"]}


def test_scan_domain_members_excludes_config_category_entities(mock_hass, fake_states):
    entity_reg = MagicMock()
    entity_reg.entities = {
        "light.config": _registry_entry(
            "light.config",
            "light",
            entity_category=EntityCategory.CONFIG,
            area_id="area1",
        ),
        "light.normal": _registry_entry("light.normal", "light", area_id="area1"),
    }
    area_reg = MagicMock()
    area_reg.async_get_area.return_value = SimpleNamespace(
        name="Living Room", floor_id=None
    )
    fake_states.set("light.normal", "on", {})
    fake_states.set("light.config", "on", {})

    p1, p2, p3, p4 = _patched_registries(entity_reg, area_reg)
    with p1, p2, p3, p4:
        result = scan_domain_members(
            mock_hass, domain="light", device_class=None, exclusions=ExclusionConfig()
        )

    # entity_category == config is the new exclusion this test guards.
    assert result.area_entities == {"area1": ["light.normal"]}


def test_discover_device_classes_excludes_hidden_and_disabled_entities(
    mock_hass, fake_states
):
    entity_reg = MagicMock()
    entity_reg.entities = {
        "binary_sensor.hidden": _registry_entry(
            "binary_sensor.hidden", "binary_sensor", hidden_by="user"
        ),
        "binary_sensor.normal": _registry_entry(
            "binary_sensor.normal", "binary_sensor"
        ),
    }
    fake_states.set("binary_sensor.hidden", "on", {"device_class": "door"})
    fake_states.set("binary_sensor.normal", "on", {"device_class": "motion"})

    with patch(
        "custom_components.linus_dashboard.entity_group.er.async_get",
        return_value=entity_reg,
    ):
        result = discover_device_classes(
            mock_hass, "binary_sensor", ExclusionConfig()
        )

    assert result == {"motion"}


def test_discover_device_classes_excludes_config_category_entities(
    mock_hass, fake_states
):
    entity_reg = MagicMock()
    entity_reg.entities = {
        "binary_sensor.config": _registry_entry(
            "binary_sensor.config",
            "binary_sensor",
            entity_category=EntityCategory.CONFIG,
        ),
        "binary_sensor.normal": _registry_entry(
            "binary_sensor.normal", "binary_sensor"
        ),
    }
    fake_states.set("binary_sensor.config", "on", {"device_class": "door"})
    fake_states.set("binary_sensor.normal", "on", {"device_class": "motion"})

    with patch(
        "custom_components.linus_dashboard.entity_group.er.async_get",
        return_value=entity_reg,
    ):
        result = discover_device_classes(
            mock_hass, "binary_sensor", ExclusionConfig()
        )

    assert result == {"motion"}
