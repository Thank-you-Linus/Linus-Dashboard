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


# ---------------------------------------------------------------------------
# Recursive (leaf-level) aggregation — the chip-count bug.
#
# A floor group's members are area group entities, and a global group's
# members are floor group entities. Counting those members as units made the
# chip show "how many rooms have at least one light on" instead of "how many
# lights are on". active_entity_ids/active_count/total must always describe
# leaves, at every scope.
# ---------------------------------------------------------------------------

LIGHT_ICONS = {
    "light": {"_": {"default": "mdi:lightbulb", "state": {"off": "mdi:lightbulb-off"}}}
}
COVER_ICONS = {
    "cover": {
        "_": {"default": "mdi:window-open", "state": {"closed": "mdi:window-closed"}}
    }
}


def set_sub_group(
    fake_states,
    entity_id: str,
    state: str,
    *,
    active_entity_ids: list[str],
    total: int,
    members: list[str] | None = None,
) -> None:
    """Register a state shaped exactly like a Linus Dashboard group entity's."""
    fake_states.set(
        entity_id,
        state,
        {
            "entity_id": list(members or []),
            "total": total,
            "active_entity_ids": list(active_entity_ids),
            "active_count": len(active_entity_ids),
        },
    )


def test_floor_light_group_counts_lamps_not_rooms(mock_hass, fake_states):
    # Two rooms, three lamps on across them: the floor chip must read 3, not 2.
    mock_hass.data[DOMAIN] = {"icons": LIGHT_ICONS}
    set_sub_group(
        fake_states,
        "light.linus_dashboard_all_lights_area_salon",
        "on",
        active_entity_ids=["light.salon_1", "light.salon_2"],
        total=3,
    )
    set_sub_group(
        fake_states,
        "light.linus_dashboard_all_lights_area_cuisine",
        "on",
        active_entity_ids=["light.cuisine_1"],
        total=2,
    )

    attrs = compute_group_attributes(
        mock_hass,
        domain="light",
        device_class=None,
        member_entity_ids=[
            "light.linus_dashboard_all_lights_area_salon",
            "light.linus_dashboard_all_lights_area_cuisine",
        ],
    )

    assert attrs["active_entity_ids"] == [
        "light.salon_1",
        "light.salon_2",
        "light.cuisine_1",
    ]
    assert attrs["active_count"] == 3
    # total follows the leaves too (3 + 2), not the two member groups.
    assert attrs["total"] == 5
    # ATTR_ENTITY_ID still lists DIRECT members — HA's more-info dialog needs it.
    assert attrs["entity_id"] == [
        "light.linus_dashboard_all_lights_area_salon",
        "light.linus_dashboard_all_lights_area_cuisine",
    ]


def test_floor_cover_group_counts_covers_not_rooms(mock_hass, fake_states):
    mock_hass.data[DOMAIN] = {"icons": COVER_ICONS}
    set_sub_group(
        fake_states,
        "cover.linus_dashboard_all_covers_area_salon",
        "open",
        active_entity_ids=["cover.salon_1", "cover.salon_2"],
        total=2,
    )
    set_sub_group(
        fake_states,
        "cover.linus_dashboard_all_covers_area_chambre",
        "open",
        active_entity_ids=["cover.chambre_1"],
        total=4,
    )

    attrs = compute_group_attributes(
        mock_hass,
        domain="cover",
        device_class=None,
        member_entity_ids=[
            "cover.linus_dashboard_all_covers_area_salon",
            "cover.linus_dashboard_all_covers_area_chambre",
        ],
    )

    assert attrs["active_count"] == 3
    assert attrs["active_entity_ids"] == [
        "cover.salon_1",
        "cover.salon_2",
        "cover.chambre_1",
    ]
    assert attrs["total"] == 6


def test_area_floor_global_chain_keeps_leaf_count(mock_hass, fake_states):
    """
    Feed each tier's computed attributes back in as the next tier's member
    state, exactly as HA does at runtime — the global chip must still read the
    raw lamp count, and the hierarchy must terminate (no group reading itself).
    """
    mock_hass.data[DOMAIN] = {"icons": LIGHT_ICONS}
    for entity_id, state in (
        ("light.salon_1", "on"),
        ("light.salon_2", "on"),
        ("light.cuisine_1", "on"),
        ("light.cuisine_2", "off"),
        ("light.chambre_1", "off"),
    ):
        fake_states.set(entity_id, state)

    def publish(group_id: str, members: list[str]) -> dict:
        attrs = compute_group_attributes(
            mock_hass,
            domain="light",
            device_class=None,
            member_entity_ids=members,
        )
        fake_states.set(group_id, "on" if attrs["active_count"] else "off", dict(attrs))
        return attrs

    publish("light.area_salon", ["light.salon_1", "light.salon_2"])
    publish("light.area_cuisine", ["light.cuisine_1", "light.cuisine_2"])
    publish("light.area_chambre", ["light.chambre_1"])

    ground = publish("light.floor_ground", ["light.area_salon", "light.area_cuisine"])
    assert ground["active_count"] == 3

    upstairs = publish("light.floor_upstairs", ["light.area_chambre"])
    assert upstairs["active_count"] == 0

    global_attrs = publish(
        "light.global", ["light.floor_ground", "light.floor_upstairs"]
    )
    assert global_attrs["active_count"] == 3
    assert global_attrs["active_entity_ids"] == [
        "light.salon_1",
        "light.salon_2",
        "light.cuisine_1",
    ]
    assert global_attrs["total"] == 5


def test_leaf_shared_between_two_sub_groups_is_counted_once(mock_hass, fake_states):
    # A leaf reachable through two sub-groups must not inflate the count.
    mock_hass.data[DOMAIN] = {"icons": LIGHT_ICONS}
    set_sub_group(
        fake_states,
        "light.group_a",
        "on",
        active_entity_ids=["light.shared", "light.only_a"],
        total=2,
    )
    set_sub_group(
        fake_states,
        "light.group_b",
        "on",
        active_entity_ids=["light.shared"],
        total=1,
    )

    attrs = compute_group_attributes(
        mock_hass,
        domain="light",
        device_class=None,
        member_entity_ids=["light.group_a", "light.group_b"],
    )

    assert attrs["active_entity_ids"] == ["light.shared", "light.only_a"]
    assert attrs["active_count"] == 2


def test_unavailable_sub_group_contributes_no_active_leaves(mock_hass, fake_states):
    mock_hass.data[DOMAIN] = {"icons": LIGHT_ICONS}
    set_sub_group(
        fake_states,
        "light.group_a",
        "unavailable",
        active_entity_ids=["light.stale"],
        total=1,
    )
    set_sub_group(
        fake_states,
        "light.group_b",
        "on",
        active_entity_ids=["light.live"],
        total=2,
    )

    attrs = compute_group_attributes(
        mock_hass,
        domain="light",
        device_class=None,
        member_entity_ids=["light.group_a", "light.group_b"],
    )

    assert attrs["active_entity_ids"] == ["light.live"]
    assert attrs["active_count"] == 1
    # total still describes the perimeter, unavailable sub-group included.
    assert attrs["total"] == 3


def test_area_scope_behaviour_is_unchanged_by_recursion(mock_hass, fake_states):
    # Raw leaves expose no active_entity_ids attribute, so nothing recurses.
    mock_hass.data[DOMAIN] = {"icons": LIGHT_ICONS}
    fake_states.set("light.a", "on")
    fake_states.set("light.b", "off")
    attrs = compute_group_attributes(
        mock_hass,
        domain="light",
        device_class=None,
        member_entity_ids=["light.a", "light.b"],
    )
    assert attrs["active_entity_ids"] == ["light.a"]
    assert attrs["active_count"] == 1
    assert attrs["total"] == 2


def test_active_states_override_replaces_the_domain_table(mock_hass, fake_states):
    # Composite groups (binary_sensor.py's presence) mix domains and need their
    # own active-state set; without the override they'd silently fall back to
    # DOMAIN_ACTIVE_STATES["binary_sensor"] == ["on"] and drop "playing".
    mock_hass.data[DOMAIN] = {
        "icons": {"binary_sensor": {"occupancy": {"default": "mdi:home"}}}
    }
    fake_states.set("binary_sensor.motion", "off")
    fake_states.set("media_player.tv", "playing")
    attrs = compute_group_attributes(
        mock_hass,
        domain="binary_sensor",
        device_class="occupancy",
        member_entity_ids=["binary_sensor.motion", "media_player.tv"],
        active_states=["on", "playing"],
    )
    assert attrs["active_entity_ids"] == ["media_player.tv"]
    assert attrs["active_count"] == 1
