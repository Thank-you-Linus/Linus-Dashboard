"""Unit tests for entity_group.py's exclusion parsing and group-attribute helpers."""

from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.entity_group import (
    ExclusionConfig,
    compute_group_attributes,
    domain_is_excluded,
    mean_float,
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
