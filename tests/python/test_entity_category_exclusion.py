"""
Regression tests for TK-159: diagnostic/config `sensor` and `binary_sensor`
entities must never be aggregated as measurements.

Bug: Linus Brain's `sensor.linus_brain_dark_threshold_lux_<area>` (entity
category diagnostic, device_class illuminance) was counted as an illuminance
reading, so a room without any illuminance sensor showed a permanent 20 lx.
Rule: a sensor/binary_sensor with entity_category diagnostic or config is
excluded from every aggregate scan, except device_class battery. Other
domains (switch, light, ...) keep counting their config entities.
"""

import asyncio
from types import SimpleNamespace

import pytest
from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import floor_registry as fr

from custom_components.linus_dashboard import entity_group, sensor
from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.entity_group import ExclusionConfig


def make_entry(
    entity_id: str,
    *,
    platform: str = "test",
    entity_category: str | None = None,
    device_class: str | None = None,
    original_device_class: str | None = None,
    hidden_by: str | None = None,
    disabled_by: str | None = None,
    area_id: str | None = "allee",
) -> SimpleNamespace:
    return SimpleNamespace(
        entity_id=entity_id,
        domain=entity_id.split(".", maxsplit=1)[0],
        platform=platform,
        entity_category=entity_category,
        device_class=device_class,
        original_device_class=original_device_class,
        hidden_by=hidden_by,
        disabled_by=disabled_by,
        area_id=area_id,
        device_id=None,
        config_entry_id=None,
        unique_id=entity_id,
        capabilities=None,
    )


@pytest.fixture
def registries(monkeypatch):
    """Patch the four registries; returns the mutable list of entity entries."""
    entity_reg = SimpleNamespace(entities={})
    device_reg = SimpleNamespace(async_get=lambda _id: None)
    area_reg = SimpleNamespace(
        async_get_area=lambda area_id: SimpleNamespace(name=area_id, floor_id=None)
    )
    floor_reg = SimpleNamespace(async_get_floor=lambda _id: None)

    class Holder(list):
        def add(self, entry: SimpleNamespace) -> SimpleNamespace:
            self.append(entry)
            entity_reg.entities[entry.entity_id] = entry
            return entry

    holder = Holder()
    monkeypatch.setattr(er, "async_get", lambda _hass: entity_reg)
    monkeypatch.setattr(dr, "async_get", lambda _hass: device_reg)
    monkeypatch.setattr(ar, "async_get", lambda _hass: area_reg)
    monkeypatch.setattr(fr, "async_get", lambda _hass: floor_reg)
    return holder


PREDICATE_TABLE = [
    ("sensor.a", {"entity_category": "diagnostic"}, False),
    ("sensor.a", {"entity_category": "config"}, False),
    ("sensor.a", {"entity_category": "diagnostic", "device_class": "battery"}, True),
    (
        "sensor.a",
        {"entity_category": "diagnostic", "original_device_class": "battery"},
        True,
    ),
    (
        "binary_sensor.a",
        {"entity_category": "diagnostic", "device_class": "battery"},
        True,
    ),
    ("binary_sensor.a", {"entity_category": "diagnostic"}, False),
    ("binary_sensor.a", {"entity_category": "config"}, False),
    ("sensor.a", {"entity_category": None}, True),
    ("switch.a", {"entity_category": "config"}, True),
    ("light.a", {"entity_category": "diagnostic"}, True),
    ("sensor.a", {"hidden_by": "user"}, False),
    ("sensor.a", {"disabled_by": "integration"}, False),
    ("switch.a", {"hidden_by": "user"}, False),
]


@pytest.mark.parametrize(("entity_id", "attrs", "expected"), PREDICATE_TABLE)
def test_is_aggregatable_entry_table(entity_id, attrs, expected):
    entry = make_entry(entity_id, **attrs)
    assert entity_group.is_aggregatable_entry(entry) is expected


def test_discover_numeric_device_classes_ignores_diagnostic_only_class(
    mock_hass, fake_states, registries
):
    # Linus Brain threshold: diagnostic illuminance, the only one around.
    registries.add(
        make_entry(
            "sensor.linus_brain_dark_threshold_lux_allee",
            platform="linus_brain",
            entity_category="diagnostic",
            device_class="illuminance",
        )
    )
    fake_states.set(
        "sensor.linus_brain_dark_threshold_lux_allee",
        "20",
        {"device_class": "illuminance"},
    )

    assert (
        sensor._discover_numeric_device_classes(mock_hass, ExclusionConfig()) == set()
    )


def test_discover_numeric_device_classes_keeps_real_sensor(
    mock_hass, fake_states, registries
):
    registries.add(
        make_entry("sensor.lux_real", device_class="illuminance", area_id="salon")
    )
    fake_states.set("sensor.lux_real", "120", {"device_class": "illuminance"})

    assert sensor._discover_numeric_device_classes(mock_hass, ExclusionConfig()) == {
        "illuminance"
    }


def test_scan_domain_members_keeps_only_the_real_illuminance_sensor(
    mock_hass, fake_states, registries
):
    registries.add(
        make_entry(
            "sensor.linus_brain_dark_threshold_lux_salon",
            platform="linus_brain",
            entity_category="diagnostic",
            device_class="illuminance",
            area_id="salon",
        )
    )
    registries.add(
        make_entry("sensor.lux_real", device_class="illuminance", area_id="salon")
    )
    fake_states.set(
        "sensor.linus_brain_dark_threshold_lux_salon",
        "20",
        {"device_class": "illuminance"},
    )
    fake_states.set("sensor.lux_real", "120", {"device_class": "illuminance"})

    members = entity_group.scan_domain_members(
        mock_hass,
        domain="sensor",
        device_class="illuminance",
        exclusions=ExclusionConfig(),
    )

    assert members.area_entities == {"salon": ["sensor.lux_real"]}


def test_scan_domain_members_room_with_only_threshold_has_no_member(
    mock_hass, fake_states, registries
):
    registries.add(
        make_entry(
            "sensor.linus_brain_dark_threshold_lux_allee",
            platform="linus_brain",
            entity_category="diagnostic",
            device_class="illuminance",
        )
    )
    fake_states.set(
        "sensor.linus_brain_dark_threshold_lux_allee",
        "20",
        {"device_class": "illuminance"},
    )

    members = entity_group.scan_domain_members(
        mock_hass,
        domain="sensor",
        device_class="illuminance",
        exclusions=ExclusionConfig(),
    )

    assert members.area_entities == {}


def test_scan_domain_members_battery_stays_even_if_diagnostic(
    mock_hass, fake_states, registries
):
    registries.add(
        make_entry(
            "sensor.remote_battery",
            entity_category="diagnostic",
            device_class="battery",
            area_id="salon",
        )
    )
    fake_states.set("sensor.remote_battery", "80", {"device_class": "battery"})

    members = entity_group.scan_domain_members(
        mock_hass,
        domain="sensor",
        device_class="battery",
        exclusions=ExclusionConfig(),
    )

    assert members.area_entities == {"salon": ["sensor.remote_battery"]}


def test_scan_domain_members_config_switch_still_counted(
    mock_hass, fake_states, registries
):
    registries.add(
        make_entry("switch.child_lock", entity_category="config", area_id="salon")
    )
    fake_states.set("switch.child_lock", "on")

    members = entity_group.scan_domain_members(
        mock_hass, domain="switch", device_class=None, exclusions=ExclusionConfig()
    )

    assert members.area_entities == {"salon": ["switch.child_lock"]}


def test_build_aggregate_sensors_excludes_own_diagnostic_groups(
    mock_hass, mock_config_entry, registries
):
    registries.add(make_entry("binary_sensor.door", device_class="door", area_id="a"))
    # Linus Dashboard's own diagnostic groups must not be double-counted:
    # PresenceGroup and the battery group (battery exception would let it in).
    registries.add(
        make_entry(
            "binary_sensor.linus_dashboard_presence_area_a",
            platform=DOMAIN,
            entity_category="diagnostic",
            device_class="occupancy",
            area_id="a",
        )
    )
    registries.add(
        make_entry(
            "binary_sensor.linus_dashboard_battery_area_a",
            platform=DOMAIN,
            entity_category="diagnostic",
            device_class="battery",
            area_id="a",
        )
    )
    # A foreign diagnostic non-battery binary_sensor is excluded too.
    registries.add(
        make_entry(
            "binary_sensor.connectivity",
            entity_category="diagnostic",
            device_class="connectivity",
            area_id="a",
        )
    )
    # A foreign diagnostic battery binary_sensor stays.
    registries.add(
        make_entry(
            "binary_sensor.lock_battery",
            entity_category="diagnostic",
            device_class="battery",
            area_id="a",
        )
    )

    sensors = asyncio.run(sensor._build_aggregate_sensors(mock_hass, mock_config_entry))

    members = set().union(*(s._tracked_entities for s in sensors))
    assert members == {"binary_sensor.door", "binary_sensor.lock_battery"}


def test_scan_all_entities_by_area_still_tracks_config_switch(mock_hass, registries):
    registries.add(
        make_entry("switch.child_lock", entity_category="config", area_id="salon")
    )
    registries.add(
        make_entry("sensor.rssi", entity_category="diagnostic", area_id="salon")
    )

    area_entities, _names = sensor._scan_all_entities_by_area(
        mock_hass, ExclusionConfig()
    )

    assert area_entities == {"salon": ["switch.child_lock"]}


def _aggregate_entry(unique_id: str, device_class: str, entry_id: str = "e1"):
    entry = make_entry(
        f"sensor.{unique_id}", platform=DOMAIN, original_device_class=device_class
    )
    entry.unique_id = unique_id
    entry.config_entry_id = entry_id
    return entry


def _run_cleanup(mock_hass, registries, monkeypatch):
    from custom_components.linus_dashboard import (
        async_cleanup_orphaned_aggregate_sensors,
    )

    entity_reg = er.async_get(mock_hass)
    removed: list[str] = []

    def async_remove(entity_id):
        removed.append(entity_id)
        entity_reg.entities.pop(entity_id)

    entity_reg.async_remove = async_remove
    monkeypatch.setattr(
        fr, "async_get", lambda _hass: SimpleNamespace(floors={}, async_get_floor=None)
    )
    asyncio.run(
        async_cleanup_orphaned_aggregate_sensors(
            mock_hass, SimpleNamespace(entry_id="e1")
        )
    )
    return removed


def test_cleanup_removes_aggregate_whose_only_member_was_diagnostic(
    mock_hass, registries, monkeypatch
):
    registries.add(
        make_entry(
            "sensor.linus_brain_dark_threshold_lux_allee",
            platform="linus_brain",
            entity_category="diagnostic",
            device_class="illuminance",
            area_id="allee",
        )
    )
    registries.add(
        make_entry("sensor.lux_real", device_class="illuminance", area_id="salon")
    )
    registries.add(
        _aggregate_entry("linus_dashboard_illuminance_area_allee", "illuminance")
    )
    registries.add(
        _aggregate_entry("linus_dashboard_illuminance_area_salon", "illuminance")
    )

    removed = _run_cleanup(mock_hass, registries, monkeypatch)

    assert removed == ["sensor.linus_dashboard_illuminance_area_allee"]


def test_cleanup_keeps_battery_and_foreign_entities(mock_hass, registries, monkeypatch):
    registries.add(
        make_entry(
            "sensor.zigbee_battery",
            entity_category="diagnostic",
            device_class="battery",
            area_id="salon",
        )
    )
    registries.add(_aggregate_entry("linus_dashboard_battery_area_salon", "battery"))
    # Another config entry's aggregate is never touched.
    registries.add(
        _aggregate_entry("linus_dashboard_illuminance_area_x", "illuminance", "other")
    )

    assert _run_cleanup(mock_hass, registries, monkeypatch) == []


def test_cleanup_removes_global_aggregate_without_any_member(
    mock_hass, registries, monkeypatch
):
    registries.add(
        _aggregate_entry("linus_dashboard_illuminance_global", "illuminance")
    )

    assert _run_cleanup(mock_hass, registries, monkeypatch) == [
        "sensor.linus_dashboard_illuminance_global"
    ]
