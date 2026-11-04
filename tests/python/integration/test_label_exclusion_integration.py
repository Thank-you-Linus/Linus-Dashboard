"""
Excluded labels on a real HomeAssistant's registries.

A label in excluded_targets must exclude whatever carries it, not only an
entity labelled directly: a labelled device's sensors (e.g. its temperature,
shown on the room tile) and a labelled room. The unit test in
tests/python/test_entity_group.py fakes the registry lookups; this runs
ExclusionConfig and scan_domain_members against the real label/area/device/
entity registries.

Run by the CI `python-tests-integration` job.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

import pytest

pytest.importorskip("pytest_homeassistant_custom_component")

from homeassistant.helpers import area_registry as ar
from homeassistant.helpers import device_registry as dr
from homeassistant.helpers import entity_registry as er
from homeassistant.helpers import label_registry as lr
from pytest_homeassistant_custom_component.common import MockConfigEntry

from custom_components.linus_dashboard.const import DOMAIN
from custom_components.linus_dashboard.entity_group import (
    ExclusionConfig,
    scan_domain_members,
)

if TYPE_CHECKING:
    from homeassistant.core import HomeAssistant


def _temperature_sensor(
    hass: HomeAssistant,
    source: MockConfigEntry,
    unique_id: str,
    *,
    area_id: str | None = None,
    device_id: str | None = None,
) -> str:
    entry = er.async_get(hass).async_get_or_create(
        "sensor",
        "test",
        unique_id,
        config_entry=source,
        device_id=device_id,
        original_device_class="temperature",
    )
    if area_id:
        er.async_get(hass).async_update_entity(entry.entity_id, area_id=area_id)
    hass.states.async_set(
        entry.entity_id,
        "21",
        {"device_class": "temperature", "unit_of_measurement": "°C"},
    )
    return entry.entity_id


async def test_excluded_label_on_device_entity_and_area(hass: HomeAssistant):
    source = MockConfigEntry(domain="test")
    source.add_to_hass(hass)

    ignore = lr.async_get(hass).async_create("Ignore").label_id
    kitchen = ar.async_get(hass).async_create("Kitchen").id
    attic = ar.async_get(hass).async_create("Attic", labels={ignore}).id

    # A labelled thermometer device in the kitchen, and an unlabelled one.
    dev_reg = dr.async_get(hass)
    labelled_device = dev_reg.async_get_or_create(
        config_entry_id=source.entry_id, identifiers={("test", "thermo_ignored")}
    )
    dev_reg.async_update_device(labelled_device.id, area_id=kitchen, labels={ignore})
    kept_device = dev_reg.async_get_or_create(
        config_entry_id=source.entry_id, identifiers={("test", "thermo_kept")}
    )
    dev_reg.async_update_device(kept_device.id, area_id=kitchen)

    via_device = _temperature_sensor(hass, source, "t1", device_id=labelled_device.id)
    kept = _temperature_sensor(hass, source, "t2", device_id=kept_device.id)
    labelled_entity = _temperature_sensor(hass, source, "t3", area_id=kitchen)
    er.async_get(hass).async_update_entity(labelled_entity, labels={ignore})
    in_attic = _temperature_sensor(hass, source, "t4", area_id=attic)

    entry = MockConfigEntry(
        domain=DOMAIN, options={"excluded_targets": {"label_id": [ignore]}}
    )
    exclusions = ExclusionConfig.from_config_entry(entry, hass)

    assert exclusions.excluded_device_ids == {labelled_device.id}
    assert exclusions.excluded_entity_ids == {labelled_entity}
    assert exclusions.excluded_area_ids == {attic}

    scoped = scan_domain_members(
        hass, domain="sensor", device_class="temperature", exclusions=exclusions
    )
    # Only the unlabelled kitchen thermometer feeds the kitchen's temperature;
    # the labelled room has no member at all.
    assert scoped.area_entities == {kitchen: [kept]}
    assert via_device not in scoped.area_entities[kitchen]
    all_members = [eid for members in scoped.area_entities.values() for eid in members]
    assert in_attic not in all_members
