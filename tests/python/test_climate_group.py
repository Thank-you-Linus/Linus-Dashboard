"""
Regression tests for climate.py's ClimateGroup fan/preset/swing mode handling.

ClimateGroup only ever set _attr_hvac_modes/_attr_supported_features.
HA core's ClimateEntity.capability_attributes/state_attributes read
self.fan_modes/preset_modes/swing_modes (and their singular "current value"
counterparts) unconditionally whenever the matching ClimateEntityFeature bit
is set on supported_features — and that bit is a straight intersection of
the *real* member entities' own supported_features, so it gets set the
moment an area's thermostat is more capable than the plain generic_thermostat
test fixture (fan mode, preset mode, or swing mode support). An attribute
that was never assigned at all (not even to None) raises AttributeError out
of async_write_ha_state the first time that happens, which aborts
add_to_platform_finish() entirely and leaves the entity stuck
unavailable/restored forever (HA does not retry a failed add). Floor/global
groups never hit this because their only members are other Linus Dashboard
groups, whose own supported_features never carries those bits unless an area
member actually has them (see test_floor_group_inherits_fan_modes_from_area
member below).
"""

from custom_components.linus_dashboard.climate import ClimateGroup


def make_group(mock_hass, member_entity_ids):
    return ClimateGroup(
        mock_hass,
        unique_id="test_climate",
        translation_key="climate_group",
        translation_placeholders=None,
        device_info={},
        member_entity_ids=member_entity_ids,
    )


def test_fan_preset_swing_default_to_none_before_any_recompute(mock_hass):
    # The crash happened on the very first async_write_ha_state(), before
    # _recompute() could ever run — so the __init__ defaults are what
    # actually matters here, not just the computed values below.
    group = make_group(mock_hass, ["climate.thermostat"])
    assert group.fan_modes is None
    assert group.preset_modes is None
    assert group.swing_modes is None


def test_member_without_fan_support_keeps_fan_modes_none(mock_hass, fake_states):
    fake_states.set(
        "climate.thermostat",
        "heat",
        {"hvac_modes": ["off", "heat"], "supported_features": 1},
    )
    group = make_group(mock_hass, ["climate.thermostat"])

    group._recompute()

    assert group.fan_modes is None
    assert group.preset_modes is None
    assert group.swing_modes is None


def test_fan_capable_member_populates_fan_modes_without_raising(mock_hass, fake_states):
    # FAN_MODE = 8: a real smart thermostat (unlike generic_thermostat)
    # commonly reports this. Before the fix, computing supported_features
    # with this bit set — and then capability_attributes reading
    # self.fan_modes — raised AttributeError.
    fake_states.set(
        "climate.thermostat",
        "heat",
        {
            "hvac_modes": ["off", "heat"],
            "supported_features": 8,
            "fan_modes": ["low", "high"],
        },
    )
    group = make_group(mock_hass, ["climate.thermostat"])

    group._recompute()

    assert group.fan_modes == ["high", "low"]
    assert group.capability_attributes is not None


def test_floor_group_inherits_fan_modes_from_area_member(mock_hass, fake_states):
    # The area group's own *state* carries supported_features=8 (computed
    # from its one fan-capable member) once it's recomputed — a floor group
    # reading that area group as a member must pick the bit up the same way
    # a raw climate entity would, and must not crash reading its fan_modes.
    fake_states.set(
        "climate.thermostat",
        "heat",
        {
            "hvac_modes": ["off", "heat"],
            "supported_features": 8,
            "fan_modes": ["low", "high"],
        },
    )
    area_group = make_group(mock_hass, ["climate.thermostat"])
    area_group._recompute()
    fake_states.set(
        area_group.entity_id,
        area_group.state,
        {**area_group.capability_attributes, **area_group.extra_state_attributes},
    )

    floor_group = ClimateGroup(
        mock_hass, "test_floor", "climate_group", None, {}, [area_group.entity_id]
    )
    floor_group._recompute()

    assert floor_group.fan_modes == ["high", "low"]
    assert floor_group.capability_attributes is not None
