"""Tests for EventListener debounce behavior with TimeoutManager."""

import asyncio
from unittest.mock import AsyncMock, MagicMock, Mock

import pytest
from homeassistant.core import State

from ..utils.event_listener import EventListener


class TestEventListenerDebounce:
    """Test EventListener debounce functionality."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.async_create_task = lambda coro: asyncio.create_task(coro)
        return hass

    @pytest.fixture
    def mock_coordinator(self):
        """Create a mock coordinator."""
        coordinator = MagicMock()
        coordinator.async_send_area_update = AsyncMock()
        coordinator.get_area_activity = Mock(return_value="occupied")
        coordinator.area_manager = MagicMock()
        coordinator.area_manager.get_entity_area = Mock(return_value="living_room")
        return coordinator

    @pytest.fixture
    def listener(self, mock_hass, mock_coordinator):
        """Create an EventListener instance."""
        return EventListener(mock_hass, mock_coordinator)

    @pytest.mark.asyncio
    async def test_debounce_schedules_deferred_update(self, listener, mock_coordinator):
        """Test that debouncing schedules a deferred update."""
        # Create mock state
        state = MagicMock(spec=State)
        state.state = "on"
        state.attributes = {"device_class": "occupancy"}

        # First call should not debounce (no last update time)
        should_debounce = listener._should_debounce(
            "living_room", "binary_sensor.test", state
        )
        assert should_debounce is False

        # Immediate second call should debounce
        should_debounce = listener._should_debounce(
            "living_room", "binary_sensor.test", state
        )
        assert should_debounce is True

        # Wait for debounce delay + buffer
        await asyncio.sleep(5.2)

        # Coordinator should have been called once
        mock_coordinator.async_send_area_update.assert_called_once_with("living_room")

    @pytest.mark.asyncio
    async def test_rapid_events_cancel_previous_debounce(
        self, listener, mock_coordinator
    ):
        """Test that rapid events cancel and reschedule debounce."""
        state = MagicMock(spec=State)
        state.state = "on"
        state.attributes = {"device_class": "occupancy"}

        # Trigger first update (no debounce)
        listener._should_debounce("living_room", "binary_sensor.test", state)

        # Rapidly trigger multiple updates (should debounce and reschedule)
        for _ in range(5):
            listener._should_debounce("living_room", "binary_sensor.test", state)
            await asyncio.sleep(0.5)  # Less than debounce interval

        # Wait for final debounce to complete
        await asyncio.sleep(5.5)

        # Coordinator should have been called only once (from final debounce)
        assert mock_coordinator.async_send_area_update.call_count == 1

    @pytest.mark.asyncio
    async def test_motion_off_bypasses_debounce(self, listener, mock_coordinator):
        """Test that motion sensor turning OFF bypasses debounce."""
        state = MagicMock(spec=State)
        state.state = "off"
        state.attributes = {"device_class": "motion"}

        # Motion OFF should never debounce
        should_debounce = listener._should_debounce(
            "living_room", "binary_sensor.motion", state
        )
        assert should_debounce is False

        # Even if we call it immediately again
        should_debounce = listener._should_debounce(
            "living_room", "binary_sensor.motion", state
        )
        assert should_debounce is False

    @pytest.mark.asyncio
    async def test_motion_on_inactive_area_bypasses_debounce(
        self, listener, mock_coordinator
    ):
        """Test that motion ON in inactive area bypasses debounce."""
        # Set area as inactive
        mock_coordinator.get_area_activity.return_value = "inactive"

        state = MagicMock(spec=State)
        state.state = "on"
        state.attributes = {"device_class": "motion"}

        # Motion ON in inactive area should not debounce
        should_debounce = listener._should_debounce(
            "living_room", "binary_sensor.motion", state
        )
        assert should_debounce is False

    @pytest.mark.asyncio
    async def test_stop_listening_cancels_pending_debounce(
        self, listener, mock_coordinator
    ):
        """Test that stopping listener cancels pending debounced updates."""
        state = MagicMock(spec=State)
        state.state = "on"
        state.attributes = {"device_class": "occupancy"}

        # Trigger update (no debounce)
        listener._should_debounce("living_room", "binary_sensor.test", state)

        # Trigger debounced update
        listener._should_debounce("living_room", "binary_sensor.test", state)

        # Verify task is pending
        assert listener._debounce_manager.has_task("living_room")

        # Stop listening
        await listener.async_stop_listening()

        # Task should be cancelled
        assert not listener._debounce_manager.has_task("living_room")

        # Wait to ensure update doesn't happen
        await asyncio.sleep(5.5)

        # Coordinator should not have been called (update was cancelled)
        mock_coordinator.async_send_area_update.assert_not_called()
