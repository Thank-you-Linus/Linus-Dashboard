"""
Regression tests for climate.py's ClimateGroup supported_features (#233).

ClimateGroup used to announce every feature bit its members share. Home
Assistant reads the matching mode list as soon as a bit is announced
(capability_attributes / state_attributes), and ClimateGroup sets none of
_attr_preset_modes, _attr_fan_modes, _attr_swing_modes,
_attr_swing_horizontal_modes: an area whose thermostats all had presets
(Versatile Thermostat, supported_features 401) raised AttributeError on every
state write, so the group stayed frozen and the floor/global groups built on
it aggregated a stale state.

The group now announces only what it implements: TARGET_TEMPERATURE (when
every member has it, forwarded by async_set_temperature) and TURN_ON/TURN_OFF
(always, via set_hvac_mode).
"""

from types import SimpleNamespace

import pytest
from homeassistant.components.climate import ClimateEntityFeature, HVACMode
from homeassistant.util.unit_system import METRIC_SYSTEM

from custom_components.linus_dashboard.climate import ClimateGroup

OWN_FEATURES = (
    ClimateEntityFeature.TARGET_TEMPERATURE
    | ClimateEntityFeature.TURN_ON
    | ClimateEntityFeature.TURN_OFF
)

# Feature bit -> the mode-list attribute a member carries with it.
UNIMPLEMENTED_MODES = [
    (ClimateEntityFeature.PRESET_MODE, "preset_modes", ["eco", "comfort"]),
    (ClimateEntityFeature.FAN_MODE, "fan_modes", ["low", "high"]),
    (ClimateEntityFeature.SWING_MODE, "swing_modes", ["off", "vertical"]),
    (
        ClimateEntityFeature.SWING_HORIZONTAL_MODE,
        "swing_horizontal_modes",
        ["off", "on"],
    ),
]


@pytest.fixture(autouse=True)
def metric_units(mock_hass):
    """ClimateEntity reads hass.config.units (temperature unit, precision)."""
    mock_hass.config = SimpleNamespace(units=METRIC_SYSTEM)


def make_group(mock_hass, unique_id, member_entity_ids):
    return ClimateGroup(
        mock_hass,
        unique_id=unique_id,
        translation_key="climate_group",
        translation_placeholders=None,
        device_info={},
        member_entity_ids=member_entity_ids,
    )


def written_attributes(group):
    """What async_write_ha_state serialises — raises where HA would."""
    return {
        **(group.capability_attributes or {}),
        **(group.state_attributes or {}),
        **(group.extra_state_attributes or {}),
        "supported_features": int(group.supported_features),
    }


def set_thermostat(fake_states, entity_id, state, features, **extra):
    fake_states.set(
        entity_id,
        state,
        {
            "hvac_modes": ["off", "heat"],
            "supported_features": int(features),
            "current_temperature": 19.0,
            "temperature": 20.0,
            "min_temp": 7.0,
            "max_temp": 35.0,
            **extra,
        },
    )


def publish(fake_states, group):
    """Write a group's state where its parent group reads it."""
    group._recompute()
    fake_states.set(group.entity_id, group.state, written_attributes(group))


@pytest.mark.parametrize(("feature", "attribute", "modes"), UNIMPLEMENTED_MODES)
def test_member_mode_feature_is_not_announced(
    mock_hass, fake_states, feature, attribute, modes
):
    set_thermostat(
        fake_states,
        "climate.member",
        "heat",
        ClimateEntityFeature.TARGET_TEMPERATURE | feature,
        **{attribute: modes},
    )
    group = make_group(mock_hass, "area", ["climate.member"])

    group._recompute()

    assert feature not in group.supported_features
    assert group.supported_features == OWN_FEATURES
    attrs = written_attributes(group)
    assert attribute not in attrs


@pytest.mark.parametrize(("feature", "attribute", "modes"), UNIMPLEMENTED_MODES)
def test_member_change_reaches_floor_and_global_groups(
    mock_hass, fake_states, feature, attribute, modes
):
    set_thermostat(
        fake_states,
        "climate.member",
        "heat",
        ClimateEntityFeature.TARGET_TEMPERATURE | feature,
        **{attribute: modes},
    )
    area = make_group(mock_hass, "area", ["climate.member"])
    floor = make_group(mock_hass, "floor", [area.entity_id])
    house = make_group(mock_hass, "global", [floor.entity_id])
    for group in (area, floor, house):
        publish(fake_states, group)

    set_thermostat(
        fake_states,
        "climate.member",
        "off",
        ClimateEntityFeature.TARGET_TEMPERATURE | feature,
        current_temperature=17.5,
        temperature=16.0,
        **{attribute: modes},
    )
    for group in (area, floor, house):
        publish(fake_states, group)

    for group in (area, floor, house):
        assert group.hvac_mode == HVACMode.OFF
        assert group.current_temperature == 17.5
        assert group.target_temperature == 16.0
        assert group.supported_features == OWN_FEATURES


def test_versatile_thermostat_with_presets(mock_hass, fake_states):
    # The reported case: one Versatile Thermostat, supported_features 401
    # (TARGET_TEMPERATURE 1 + PRESET_MODE 16 + TURN_OFF 128 + TURN_ON 256).
    set_thermostat(
        fake_states,
        "climate.tim",
        "heat",
        401,
        preset_modes=["frost", "eco", "comfort", "boost"],
        preset_mode="comfort",
    )
    group = make_group(mock_hass, "chambre_timo", ["climate.tim"])

    group._recompute()

    assert int(group.supported_features) == 385
    written_attributes(group)


def test_temperature_range_is_not_announced(mock_hass, fake_states):
    # The group computes no target_temperature_high/low.
    set_thermostat(
        fake_states,
        "climate.member",
        "heat_cool",
        ClimateEntityFeature.TARGET_TEMPERATURE
        | ClimateEntityFeature.TARGET_TEMPERATURE_RANGE,
        target_temp_high=24.0,
        target_temp_low=19.0,
    )
    group = make_group(mock_hass, "area", ["climate.member"])

    group._recompute()

    assert ClimateEntityFeature.TARGET_TEMPERATURE_RANGE not in group.supported_features


def test_plain_thermostats_keep_their_features(mock_hass, fake_states):
    # Members without presets/fan (BSB-LAN, spa): same behaviour as before.
    set_thermostat(fake_states, "climate.bsb_lan", "heat", OWN_FEATURES)
    set_thermostat(fake_states, "climate.spa", "heat", OWN_FEATURES)
    group = make_group(mock_hass, "area", ["climate.bsb_lan", "climate.spa"])

    group._recompute()

    assert group.supported_features == OWN_FEATURES
    assert group.hvac_modes == [HVACMode.HEAT, HVACMode.OFF]
    assert group.target_temperature == 20.0


def test_target_temperature_needs_every_member(mock_hass, fake_states):
    set_thermostat(fake_states, "climate.a", "heat", OWN_FEATURES)
    set_thermostat(fake_states, "climate.b", "heat", ClimateEntityFeature(0))
    group = make_group(mock_hass, "area", ["climate.a", "climate.b"])

    group._recompute()

    assert ClimateEntityFeature.TARGET_TEMPERATURE not in group.supported_features


def test_on_off_announced_even_when_members_lack_it(mock_hass, fake_states):
    set_thermostat(
        fake_states, "climate.member", "heat", ClimateEntityFeature.TARGET_TEMPERATURE
    )
    group = make_group(mock_hass, "area", ["climate.member"])

    group._recompute()

    assert ClimateEntityFeature.TURN_ON in group.supported_features
    assert ClimateEntityFeature.TURN_OFF in group.supported_features
