"""
Regression tests for LinusDashboardHealthSensor.

Direct coverage for the bug fixed in this session: the sensor used to
compute its unavailable-entity list exactly once, in __init__, with no
subscription at all — so it permanently froze whatever a handful of
entities happened to report during the first second of HA startup (many
platforms briefly report "unknown" before their first real state lands),
and never updated again even once those entities came back online.

test_debounced_update_reflects_state_that_changed_after_construction below
reproduces exactly that scenario and is the test that would have caught it:
construct while members are still "unknown" (the boot-time snapshot), then
have them settle to a real state, and assert the sensor's own state catches
up once its debounced recompute runs — it used to just stay stuck at the
construction-time count forever.
"""

import asyncio
from unittest.mock import MagicMock

from custom_components.linus_dashboard.sensor import LinusDashboardHealthSensor


def make_sensor(mock_hass, tracked_entity_ids, nested=False):
    return LinusDashboardHealthSensor(
        mock_hass,
        unique_id="linus_dashboard_unavailable_area_test",
        translation_key="unavailable",
        translation_placeholders={"name": "Test"},
        device_info={},
        tracked_entity_ids=tracked_entity_ids,
        nested=nested,
    )


def test_area_scope_counts_only_unavailable_and_unknown_members(mock_hass, fake_states):
    fake_states.set("light.a", "on")
    fake_states.set("light.b", "unavailable")
    fake_states.set("cover.c", "unknown")
    sensor = make_sensor(mock_hass, ["light.a", "light.b", "cover.c"], nested=False)

    sensor._update_state()

    assert sensor._attr_native_value == 2
    assert set(sensor._attr_extra_state_attributes["entity_id"]) == {
        "light.b",
        "cover.c",
    }
    assert sensor._attr_extra_state_attributes["total"] == 2


def test_area_scope_all_available_reports_zero(mock_hass, fake_states):
    fake_states.set("light.a", "on")
    fake_states.set("light.b", "off")
    sensor = make_sensor(mock_hass, ["light.a", "light.b"], nested=False)

    sensor._update_state()

    assert sensor._attr_native_value == 0
    assert sensor._attr_extra_state_attributes["entity_id"] == []


def test_area_scope_missing_state_entirely_is_not_counted_as_unavailable(
    mock_hass, fake_states
):
    # An entity the registry lists but that hass.states has no record of at
    # all (state is None, not "unavailable") shouldn't be silently miscounted.
    sensor = make_sensor(mock_hass, ["light.ghost"], nested=False)

    sensor._update_state()

    assert sensor._attr_native_value == 0


def test_nested_scope_reads_childrens_own_entity_id_attribute_not_raw_entities(
    mock_hass, fake_states
):
    # Floor/global-scope sensors must concatenate their children's already-
    # computed unavailable lists, not re-scan raw entities themselves.
    fake_states.set(
        "sensor.linus_dashboard_unavailable_area_salon",
        "2",
        {"entity_id": ["light.salon_a", "cover.salon_b"], "total": 2},
    )
    fake_states.set(
        "sensor.linus_dashboard_unavailable_area_cuisine",
        "0",
        {"entity_id": [], "total": 0},
    )
    sensor = make_sensor(
        mock_hass,
        [
            "sensor.linus_dashboard_unavailable_area_salon",
            "sensor.linus_dashboard_unavailable_area_cuisine",
        ],
        nested=True,
    )

    sensor._update_state()

    assert sensor._attr_native_value == 2
    assert sensor._attr_extra_state_attributes["entity_id"] == [
        "light.salon_a",
        "cover.salon_b",
    ]


def test_nested_scope_missing_child_state_is_skipped(mock_hass, fake_states):
    sensor = make_sensor(
        mock_hass, ["sensor.linus_dashboard_unavailable_area_missing"], nested=True
    )

    sensor._update_state()

    assert sensor._attr_native_value == 0


def test_debounced_update_reflects_state_that_changed_after_construction(
    mock_hass, fake_states
):
    # Simulate the boot-time race this bug came from: at construction time
    # (the old code's *only* computation point), the tracked entity is still
    # "unknown" because its own platform hasn't finished setting it up yet.
    fake_states.set("light.salon_principal", "unknown")
    sensor = make_sensor(mock_hass, ["light.salon_principal"], nested=False)
    sensor._update_state()
    assert sensor._attr_native_value == 1

    # The entity now settles to its real, available state (this is what
    # happened live on the test env seconds after boot).
    fake_states.set("light.salon_principal", "off")

    # Simulate the debounced recompute that a state_changed event schedules
    # (bypassing the real async_call_later timer, which needs a live loop).
    sensor.async_write_ha_state = MagicMock()
    sensor._async_debounced_update()

    assert sensor._attr_native_value == 0
    assert sensor._attr_extra_state_attributes["entity_id"] == []
    sensor.async_write_ha_state.assert_called_once()


def test_async_state_changed_schedules_a_debounced_update(mock_hass, fake_states):
    sensor = make_sensor(mock_hass, ["light.a"], nested=False)
    assert sensor._debounce_unsub is None

    sensor._async_state_changed(MagicMock())

    # async_call_later returns an unsubscribe callable; a mock hass makes it
    # a MagicMock rather than a real timer handle, but the important part is
    # that a debounce was actually scheduled, not silently dropped.
    assert sensor._debounce_unsub is not None


def test_async_state_changed_cancels_previous_pending_debounce(mock_hass, fake_states):
    # _debounce_unsub is `TimerHandle.cancel` (a real bound method, not a
    # mock — async_call_later schedules on the fixture's real, never-run
    # event loop), so assert on the underlying TimerHandle's own cancelled
    # flag via __self__ rather than a call count.
    sensor = make_sensor(mock_hass, ["light.a"], nested=False)
    sensor._async_state_changed(MagicMock())
    first_handle = sensor._debounce_unsub.__self__

    sensor._async_state_changed(MagicMock())

    assert first_handle.cancelled()
    assert sensor._debounce_unsub is not None
    assert sensor._debounce_unsub.__self__ is not first_handle


def test_async_will_remove_from_hass_unsubscribes_both_listeners(
    mock_hass, fake_states
):
    sensor = make_sensor(mock_hass, ["light.a"], nested=False)
    sensor._unsub_state_changed = MagicMock()
    sensor._debounce_unsub = MagicMock()
    unsub_state, debounce_unsub = sensor._unsub_state_changed, sensor._debounce_unsub

    # No real await needed — async_will_remove_from_hass has no I/O of its
    # own, so run it via asyncio.run rather than pulling in pytest-asyncio
    # for one coroutine.
    asyncio.run(sensor.async_will_remove_from_hass())

    unsub_state.assert_called_once()
    debounce_unsub.assert_called_once()
    assert sensor._unsub_state_changed is None
    assert sensor._debounce_unsub is None
