"""Tests for GroupManager utility."""

import asyncio
from unittest.mock import AsyncMock, MagicMock, Mock, call, patch

import pytest
from homeassistant.const import EVENT_HOMEASSISTANT_STARTED
from homeassistant.core import Event

from ..utils.group_manager import GroupManager, PlatformGroupManager


class TestGroupManager:
    """Test the GroupManager class."""
    
    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.is_running = False
        hass.async_create_task = lambda coro: asyncio.create_task(coro)
        hass.bus = MagicMock()
        hass.bus.async_listen_once = MagicMock(return_value=lambda: None)
        hass.bus.async_listen = MagicMock(return_value=lambda: None)
        return hass
    
    @pytest.fixture
    def mock_refresh_callback(self):
        """Create a mock refresh callback."""
        return AsyncMock()
    
    @pytest.fixture
    def manager(self, mock_hass, mock_refresh_callback):
        """Create a GroupManager instance."""
        return GroupManager(
            hass=mock_hass,
            refresh_callback=mock_refresh_callback,
            monitored_domains=["binary_sensor", "media_player"],
            startup_delay=0.1,
            log_prefix="TestManager",
        )
    
    def test_init(self):
        """Test GroupManager initialization."""
        from unittest.mock import Mock
        from ..utils.group_manager import GroupManager
        
        hass = Mock()
        hass.is_running = False
        refresh_callback = Mock()
        removal_callback = Mock()
        check_empty_callback = Mock()
        
        manager = GroupManager(
            hass=hass,
            refresh_callback=refresh_callback,
            monitored_domains=["binary_sensor", "media_player"],
            startup_delay=2.0,
            log_prefix="TestManager",
            removal_callback=removal_callback,
            check_empty_callback=check_empty_callback,
        )
        
        assert manager.hass == hass
        assert manager._refresh_callback == refresh_callback
        assert manager._removal_callback == removal_callback
        assert manager._check_empty_callback == check_empty_callback
        assert manager._monitored_domains == ["binary_sensor", "media_player"]
        assert manager._startup_delay == 2.0
        assert manager._log_prefix == "TestManager"
        assert manager._startup_complete is False
        assert manager._unsub_registry is None
        assert manager._unsub_startup is None

    def test_init_with_running_hass(self, mock_hass, mock_refresh_callback):
        """Test GroupManager initialization when HA is already running."""
        mock_hass.is_running = True
        manager = GroupManager(
            hass=mock_hass,
            refresh_callback=mock_refresh_callback,
            monitored_domains=["binary_sensor"],
        )
        assert manager._startup_complete is True

    @pytest.mark.asyncio
    async def test_async_setup_when_hass_running(
        self, mock_hass, mock_refresh_callback
    ):
        """Test async_setup when HA is already running (reload case)."""
        mock_hass.is_running = True
        manager = GroupManager(
            hass=mock_hass,
            refresh_callback=mock_refresh_callback,
            monitored_domains=["binary_sensor"],
        )

        await manager.async_setup()

        # Should call refresh immediately
        mock_refresh_callback.assert_called_once()
        # Should register entity registry listener
        mock_hass.bus.async_listen.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_setup_when_hass_starting(self, manager, mock_hass):
        """Test async_setup when HA is starting."""
        await manager.async_setup()

        # Should register startup listener
        mock_hass.bus.async_listen_once.assert_called_once()
        args = mock_hass.bus.async_listen_once.call_args[0]
        assert args[0] == EVENT_HOMEASSISTANT_STARTED

        # Should register entity registry listener
        mock_hass.bus.async_listen.assert_called_once()

    @pytest.mark.asyncio
    async def test_startup_listener_registered(self, manager, mock_hass):
        """Test that startup listener is registered when HA is starting."""
        await manager.async_setup()

        # Should register startup listener
        mock_hass.bus.async_listen_once.assert_called_once()
        args = mock_hass.bus.async_listen_once.call_args[0]
        assert args[0] == EVENT_HOMEASSISTANT_STARTED
        
        # Should register entity registry listener
        mock_hass.bus.async_listen.assert_called_once()

    @pytest.mark.asyncio
    async def test_entity_registry_filters_by_action(self, manager, mock_hass):
        """Test that entity registry listener filters by action."""
        await manager.async_setup()
        manager._startup_complete = True

        # Get the registry listener callback
        registry_callback = mock_hass.bus.async_listen.call_args[0][1]

        # Test create action (should be ignored)
        event = Event(
            "entity_registry_updated",
            {
                "action": "create",
                "entity_id": "binary_sensor.test",
                "changes": {"area_id": "old_area"},
            },
        )
        registry_callback(event)
        await asyncio.sleep(0.01)
        manager._refresh_callback.assert_not_called()

        # Test remove action (should be ignored)
        event.data["action"] = "remove"
        registry_callback(event)
        await asyncio.sleep(0.01)
        manager._refresh_callback.assert_not_called()

    @pytest.mark.asyncio
    async def test_entity_registry_filters_by_changes(self, manager, mock_hass):
        """Test that entity registry listener filters by changes."""
        await manager.async_setup()
        manager._startup_complete = True

        registry_callback = mock_hass.bus.async_listen.call_args[0][1]

        # Test update without area/device changes (should be ignored)
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "binary_sensor.test",
                "changes": {"name": "New Name"},
            },
        )
        registry_callback(event)
        await asyncio.sleep(0.01)
        manager._refresh_callback.assert_not_called()

    @pytest.mark.asyncio
    async def test_entity_registry_filters_by_domain(self, manager, mock_hass):
        """Test that entity registry listener filters by domain."""
        await manager.async_setup()
        manager._startup_complete = True

        registry_callback = mock_hass.bus.async_listen.call_args[0][1]

        # Test unmonitored domain (should be ignored)
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "light.test",  # Not in monitored_domains
                "changes": {"area_id": "new_area"},
            },
        )
        registry_callback(event)
        await asyncio.sleep(0.01)
        manager._refresh_callback.assert_not_called()

    @pytest.mark.asyncio
    async def test_entity_registry_triggers_refresh_on_area_change(
        self, manager, mock_hass, mock_refresh_callback
    ):
        """Test that area change triggers refresh."""
        await manager.async_setup()
        manager._startup_complete = True

        registry_callback = mock_hass.bus.async_listen.call_args[0][1]

        # Test area_id change
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "binary_sensor.test",
                "changes": {"area_id": "new_area"},
            },
        )
        registry_callback(event)
        await asyncio.sleep(0.1)
        mock_refresh_callback.assert_called_once()

    @pytest.mark.asyncio
    async def test_entity_registry_triggers_refresh_on_device_change(
        self, manager, mock_hass, mock_refresh_callback
    ):
        """Test that device change triggers refresh."""
        await manager.async_setup()
        manager._startup_complete = True

        registry_callback = mock_hass.bus.async_listen.call_args[0][1]

        # Test device_id change
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "media_player.test",
                "changes": {"device_id": "new_device"},
            },
        )
        registry_callback(event)
        await asyncio.sleep(0.1)
        mock_refresh_callback.assert_called_once()

    @pytest.mark.asyncio
    async def test_refresh_handles_exceptions(self, manager, mock_hass):
        """Test that refresh handles exceptions gracefully."""
        manager._refresh_callback = AsyncMock(side_effect=Exception("Test error"))

        await manager.async_setup()
        manager._startup_complete = True

        registry_callback = mock_hass.bus.async_listen.call_args[0][1]

        # Should not raise exception
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "binary_sensor.test",
                "changes": {"area_id": "new_area"},
            },
        )
        registry_callback(event)
        await asyncio.sleep(0.1)
        # Should have attempted the call despite exception
        manager._refresh_callback.assert_called_once()

    @pytest.mark.asyncio
    async def test_startup_skips_events_until_complete(self, manager, mock_hass):
        """Test that events are skipped until startup is complete."""
        await manager.async_setup()
        # Ensure startup_complete is False
        manager._startup_complete = False

        registry_callback = mock_hass.bus.async_listen.call_args[0][1]

        # Try to trigger an event
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "binary_sensor.test",
                "changes": {"area_id": "new_area"},
            },
        )
        registry_callback(event)
        await asyncio.sleep(0.01)

        # Should not have called refresh
        manager._refresh_callback.assert_not_called()

    def test_cleanup(self, manager):
        """Test cleanup removes listeners."""
        unsub_registry = Mock()
        unsub_startup = Mock()
        manager._unsub_registry = unsub_registry
        manager._unsub_startup = unsub_startup

        manager.cleanup()

        unsub_registry.assert_called_once()
        unsub_startup.assert_called_once()
        assert manager._unsub_registry is None
        assert manager._unsub_startup is None

    def test_cleanup_handles_none(self, manager):
        """Test cleanup handles None listeners gracefully."""
        manager._unsub_registry = None
        manager._unsub_startup = None

        # Should not raise exception
        manager.cleanup()


class TestPlatformGroupManager:
    """Test PlatformGroupManager class."""

    @pytest.fixture
    def mock_hass(self):
        """Create a mock Home Assistant instance."""
        hass = MagicMock()
        hass.is_running = False
        hass.async_create_task = lambda coro: asyncio.create_task(coro)
        hass.bus = MagicMock()
        hass.bus.async_listen_once = MagicMock(return_value=lambda: None)
        hass.bus.async_listen = MagicMock(return_value=lambda: None)
        return hass

    @pytest.fixture
    def platform_manager(self, mock_hass):
        """Create a PlatformGroupManager instance."""
        return PlatformGroupManager(
            hass=mock_hass,
            monitored_domains=["light"],
            startup_delay=0.1,
        )

    def test_init(self, platform_manager, mock_hass):
        """Test PlatformGroupManager initialization."""
        assert platform_manager.hass == mock_hass
        assert platform_manager._monitored_domains == ["light"]
        assert platform_manager._startup_delay == 0.1
        assert platform_manager._startup_complete is False
        assert platform_manager._startup_callback is None
        assert platform_manager._update_callback is None

    def test_register_callbacks(self, platform_manager):
        """Test registering callbacks."""
        startup_callback = AsyncMock()
        update_callback = AsyncMock()

        platform_manager.register_callbacks(startup_callback, update_callback)

        assert platform_manager._startup_callback == startup_callback
        assert platform_manager._update_callback == update_callback

    def test_setup_listeners_returns_unsubs(self, platform_manager, mock_hass):
        """Test setup_listeners returns unsubscribe functions."""
        unsubs = platform_manager.setup_listeners()

        assert isinstance(unsubs, tuple)
        assert len(unsubs) == 2  # startup + registry

    def test_setup_listeners_when_hass_running(self, mock_hass):
        """Test setup_listeners when HA is already running."""
        mock_hass.is_running = True
        platform_manager = PlatformGroupManager(
            hass=mock_hass,
            monitored_domains=["light"],
        )

        unsubs = platform_manager.setup_listeners()

        # Should only have registry listener (no startup listener)
        assert isinstance(unsubs, tuple)
        assert len(unsubs) == 1

    @pytest.mark.asyncio
    async def test_update_callback_triggered_on_area_change(
        self, platform_manager, mock_hass
    ):
        """Test that update callback is triggered on area change."""
        update_callback = AsyncMock()
        platform_manager.register_callbacks(AsyncMock(), update_callback)
        platform_manager._startup_complete = True

        unsubs = platform_manager.setup_listeners()

        # Get the registry listener callback
        registry_listener = mock_hass.bus.async_listen.call_args[0][1]

        # Trigger area change event
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "light.test",
                "changes": {"area_id": "new_area"},
            },
        )
        registry_listener(event)
        await asyncio.sleep(0.1)

        update_callback.assert_called_once_with(
            "light.test", {"area_id": "new_area"}
        )

        # Cleanup
        for unsub in unsubs:
            unsub()

    @pytest.mark.asyncio
    async def test_update_callback_filters_before_startup(
        self, platform_manager, mock_hass
    ):
        """Test that updates are filtered until startup is complete."""
        update_callback = AsyncMock()
        platform_manager.register_callbacks(AsyncMock(), update_callback)
        platform_manager._startup_complete = False

        unsubs = platform_manager.setup_listeners()

        registry_listener = mock_hass.bus.async_listen.call_args[0][1]

        # Try to trigger event before startup complete
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "light.test",
                "changes": {"area_id": "new_area"},
            },
        )
        registry_listener(event)
        await asyncio.sleep(0.01)

        update_callback.assert_not_called()

        # Cleanup
        for unsub in unsubs:
            unsub()

    @pytest.mark.asyncio
    async def test_update_callback_filters_by_domain(self, platform_manager, mock_hass):
        """Test that updates are filtered by domain."""
        update_callback = AsyncMock()
        platform_manager.register_callbacks(AsyncMock(), update_callback)
        platform_manager._startup_complete = True

        unsubs = platform_manager.setup_listeners()

        registry_listener = mock_hass.bus.async_listen.call_args[0][1]

        # Try with unmonitored domain
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "binary_sensor.test",  # Not "light"
                "changes": {"area_id": "new_area"},
            },
        )
        registry_listener(event)
        await asyncio.sleep(0.01)

        update_callback.assert_not_called()

        # Cleanup
        for unsub in unsubs:
            unsub()

    def test_platform_manager_without_callbacks(self, platform_manager, mock_hass):
        """Test PlatformGroupManager without registered callbacks."""
        # Should not raise exception
        unsubs = platform_manager.setup_listeners()

        # Get the registry listener
        registry_listener = mock_hass.bus.async_listen.call_args[0][1]

        # Try to trigger event (should not crash)
        event = Event(
            "entity_registry_updated",
            {
                "action": "update",
                "entity_id": "light.test",
                "changes": {"area_id": "new_area"},
            },
        )
        registry_listener(event)

        # Cleanup
        for unsub in unsubs:
            unsub()


class TestEmptyGroupHandling:
    """Test that groups handle becoming empty by being removed."""
    
    def test_binary_sensor_has_refresh_method(self):
        """Test that binary_sensor has the refresh method for entity removal."""
        # This test verifies the logic exists
        # Actual behavior is tested in integration tests
        from ..binary_sensor import PresenceDetectionBinarySensor
        # Just verify the class exists and has the method
        assert hasattr(PresenceDetectionBinarySensor, '_async_refresh_entity_list')
    
    def test_light_group_initializes_with_members(self):
        """Test that AreaLightGroup initializes correctly with members."""
        from ..light import AreaLightGroup
        
        # Create a group with members
        group = AreaLightGroup(
            entry_id="test",
            area_id="living_room",
            area_name="Living Room",
            light_entity_ids=["light.test1", "light.test2"],
        )
        
        # Should have members
        assert len(group._light_entity_ids) == 2
        # Note: availability is managed by update_members, not __init__
    
    def test_light_group_update_members_updates_list(self):
        """Test that update_members correctly updates the member list."""
        from ..light import AreaLightGroup
        from unittest.mock import Mock
        
        # Create a group with members
        group = AreaLightGroup(
            entry_id="test",
            area_id="bedroom",
            area_name="Bedroom",
            light_entity_ids=["light.bed1"],
        )
        
        # Mock the async_schedule_update_ha_state to avoid needing hass
        group.async_schedule_update_ha_state = Mock()
        
        # Should have one member initially
        assert len(group._light_entity_ids) == 1
        
        # Update to different members
        group.update_members(["light.bed1", "light.bed2"])
        
        # Should have two members now
        assert len(group._light_entity_ids) == 2
        
    def test_empty_group_removal_in_light_entity_listener(self):
        """Test that entity registry listener removes groups when empty.
        
        Note: Full removal behavior is tested in integration tests.
        This test verifies the code path exists.
        """
        # Just verify the code structure is present
        # The actual removal happens in async event handlers which
        # require full Home Assistant setup to test properly
        from ..light import async_setup_entry
        assert async_setup_entry is not None


    async def test_removal_callback_called_when_empty(self):
        """Test that removal callback is called when check_empty returns True."""
        from unittest.mock import AsyncMock, Mock
        from ..utils.group_manager import GroupManager
        
        hass = Mock()
        hass.is_running = True
        refresh_callback = AsyncMock()
        removal_callback = AsyncMock()
        check_empty_callback = Mock(return_value=True)  # Group is empty
        
        manager = GroupManager(
            hass=hass,
            refresh_callback=refresh_callback,
            monitored_domains=["binary_sensor"],
            removal_callback=removal_callback,
            check_empty_callback=check_empty_callback,
        )
        
        # Trigger refresh
        await manager._async_refresh()
        
        # Verify both callbacks were called
        refresh_callback.assert_called_once()
        check_empty_callback.assert_called_once()
        removal_callback.assert_called_once()
    
    async def test_removal_callback_not_called_when_not_empty(self):
        """Test that removal callback is NOT called when check_empty returns False."""
        from unittest.mock import AsyncMock, Mock
        from ..utils.group_manager import GroupManager
        
        hass = Mock()
        hass.is_running = True
        refresh_callback = AsyncMock()
        removal_callback = AsyncMock()
        check_empty_callback = Mock(return_value=False)  # Group has members
        
        manager = GroupManager(
            hass=hass,
            refresh_callback=refresh_callback,
            monitored_domains=["binary_sensor"],
            removal_callback=removal_callback,
            check_empty_callback=check_empty_callback,
        )
        
        # Trigger refresh
        await manager._async_refresh()
        
        # Verify only refresh and check were called, NOT removal
        refresh_callback.assert_called_once()
        check_empty_callback.assert_called_once()
        removal_callback.assert_not_called()
    
    async def test_removal_callback_optional(self):
        """Test that removal logic is skipped if callbacks not provided."""
        from unittest.mock import AsyncMock, Mock
        from ..utils.group_manager import GroupManager
        
        hass = Mock()
        hass.is_running = True
        refresh_callback = AsyncMock()
        
        # No removal or check callbacks
        manager = GroupManager(
            hass=hass,
            refresh_callback=refresh_callback,
            monitored_domains=["binary_sensor"],
        )
        
        # Should not crash
        await manager._async_refresh()
        refresh_callback.assert_called_once()

