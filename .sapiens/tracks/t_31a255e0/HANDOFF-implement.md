# Implementation Handoff — 02-exclure-entites-hidden-config-scans-backend

Date: 2026-08-26
Branch: fix/t_31a255e0-backend-config-filter

## Files Modified
- `custom_components/linus_dashboard/entity_group.py` — added `EntityCategory` import; added `entity_category == EntityCategory.CONFIG` skip inline in `scan_domain_members()` and `discover_device_classes()`, next to the existing `hidden_by`/`disabled_by` check.
- `custom_components/linus_dashboard/sensor.py` — added `EntityCategory` import; added the same inline `entity_category == EntityCategory.CONFIG` skip in `_build_aggregate_sensors()` and `_discover_numeric_device_classes()`.

## Tests Added
- `tests/python/test_entity_group.py` — 4 new tests: `scan_domain_members`/`discover_device_classes` each get one regression test (hidden/disabled still excluded) and one new-behavior test (entity_category=CONFIG now excluded), via patching `entity_group.er/dr/ar/fr.async_get`.
- `tests/python/test_aggregate_sensors.py` (new file) — same pattern for `_build_aggregate_sensors` (async) and `_discover_numeric_device_classes`, patching `sensor.er/dr/ar.async_get`.

## Deviations
Sensor.py tests placed in a new file `tests/python/test_aggregate_sensors.py` rather than `test_aggregate.py`, since `test_aggregate.py`'s existing docstring scopes it explicitly to pure `aggregate.py` helpers (no hass registry mocking) — mixing in registry-scanning sensor.py tests there would break that file's stated scope.

## Follow-up
none
