"""
Unit tests for RuleEngine with app-based assignments.

Tests the new architecture:
- App assignment management
- Activity-based automation execution
- Condition evaluation with apps
- Action execution
- Cooldown and debounce behavior
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from ..const import ACTIVITY_EMPTY
from ..utils.rule_engine import RuleEngine


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance."""
    hass = MagicMock()
    hass.states = MagicMock()
    hass.states.get = MagicMock(return_value=None)
    hass.services = MagicMock()
    hass.services.async_call = AsyncMock()
    return hass


@pytest.fixture
def mock_activity_tracker():
    """Mock ActivityTracker."""
    tracker = MagicMock()
    tracker.async_initialize = AsyncMock()
    tracker.async_evaluate_activity = AsyncMock(return_value=ACTIVITY_EMPTY)
    tracker.get_activity = MagicMock(return_value=ACTIVITY_EMPTY)
    return tracker


@pytest.fixture
def mock_app_storage():
    """Mock AppStorage with test data."""
    storage = MagicMock()
    storage.get_assignments = MagicMock(return_value={})
    storage.get_assignment = MagicMock(return_value=None)
    storage.get_app = MagicMock(return_value=None)
    storage.get_apps = MagicMock(return_value={})
    storage.remove_assignment = MagicMock()
    storage.async_save = AsyncMock(return_value=True)
    return storage


@pytest.fixture
def mock_area_manager():
    """Mock AreaManager."""
    manager = MagicMock()
    manager.get_area_entities = MagicMock(return_value=set())
    return manager


@pytest.fixture
def rule_engine(mock_hass, mock_activity_tracker, mock_app_storage, mock_area_manager):
    """Create RuleEngine instance."""
    return RuleEngine(
        mock_hass,
        "test_entry",
        mock_activity_tracker,
        mock_app_storage,
        mock_area_manager,
    )


class TestRuleEngineInitialization:
    """Test RuleEngine initialization."""

    @pytest.mark.asyncio
    async def test_async_initialize_with_no_assignments(
        self, rule_engine, mock_app_storage
    ):
        """Test initialization with no assignments."""
        mock_app_storage.get_assignments.return_value = {}

        await rule_engine.async_initialize()

        assert len(rule_engine._assignments) == 0

    @pytest.mark.asyncio
    async def test_ensure_default_assignments_loads_fallback_when_no_app(
        self, rule_engine, mock_app_storage
    ):
        """Test that _ensure_default_assignments loads fallback when automatic_lighting app is missing."""
        from unittest.mock import patch

        from ..const import DEFAULT_AUTOLIGHT_APP

        # Mock no app exists yet
        mock_app_storage.get_app.return_value = None

        # Mock activity check (will need to add 3 activities)
        mock_app_storage.get_activity.return_value = None

        # Mock that user has areas configured
        mock_area1 = MagicMock()
        mock_area1.id = "kitchen"
        mock_area1.name = "Kitchen"

        mock_area2 = MagicMock()
        mock_area2.id = "bedroom"
        mock_area2.name = "Bedroom"

        # Patch area_registry at the import location
        with patch("homeassistant.helpers.area_registry.async_get") as mock_ar_get:
            mock_registry = MagicMock()
            mock_registry.async_list_areas.return_value = [mock_area1, mock_area2]
            mock_ar_get.return_value = mock_registry

            # Mock hass.data for coordinator (optional)
            rule_engine.hass.data = {"linus_brain": {"test_entry": {}}}

            # Call the method directly
            await rule_engine._ensure_default_assignments()

        # Verify app was created
        assert mock_app_storage.set_app.call_count == 1
        mock_app_storage.set_app.assert_any_call(
            "automatic_lighting", DEFAULT_AUTOLIGHT_APP
        )

        # Verify activities were created (movement, inactive, empty)
        assert mock_app_storage.set_activity.call_count == 3

        # Verify async_save was called to persist
        assert mock_app_storage.async_save.call_count >= 1

        # Verify assignments were created for both areas
        assert mock_app_storage.set_assignment.call_count == 2

    @pytest.mark.asyncio
    async def test_async_initialize_loads_assignments(
        self, rule_engine, mock_app_storage
    ):
        """Test initialization loads assignments from storage."""
        mock_app_storage.get_assignments.return_value = {
            "kitchen": {"app_id": "autolight", "area_id": "kitchen"}
        }

        await rule_engine.async_initialize()

        assert "kitchen" in rule_engine._assignments

    @pytest.mark.asyncio
    async def test_async_initialize_calls_activity_tracker(
        self, rule_engine, mock_activity_tracker
    ):
        """Test that initialization calls activity tracker."""
        await rule_engine.async_initialize()

        mock_activity_tracker.async_initialize.assert_called_once()


class TestRuleEngineAssignmentManagement:
    """Test assignment retrieval and deletion."""

    @pytest.mark.asyncio
    async def test_get_assignment_returns_data(self, rule_engine):
        """Test getting assignment returns data."""
        rule_engine._assignments = {
            "kitchen": {"app_id": "autolight", "area_id": "kitchen"}
        }

        assignment = await rule_engine.get_assignment("kitchen")

        assert assignment is not None
        assert assignment["app_id"] == "autolight"

    @pytest.mark.asyncio
    async def test_get_assignment_nonexistent(self, rule_engine):
        """Test getting nonexistent assignment returns None."""
        assignment = await rule_engine.get_assignment("nonexistent")

        assert assignment is None

    @pytest.mark.asyncio
    async def test_delete_assignment_success(self, rule_engine, mock_app_storage):
        """Test deleting assignment."""
        rule_engine._assignments = {"kitchen": {"app_id": "autolight"}}

        result = await rule_engine.delete_assignment("kitchen")

        assert result is True

    @pytest.mark.asyncio
    async def test_delete_assignment_nonexistent(self, rule_engine):
        """Test deleting nonexistent assignment returns True (save succeeded)."""
        result = await rule_engine.delete_assignment("nonexistent")

        assert result is True


class TestRuleEngineReload:
    """Test reloading assignments."""

    @pytest.mark.asyncio
    async def test_reload_assignments_success(self, rule_engine, mock_app_storage):
        """Test reloading assignments from storage."""
        mock_app_storage.get_assignments.return_value = {
            "kitchen": {"app_id": "autolight"},
            "bedroom": {"app_id": "autolight"},
        }

        count = await rule_engine.reload_assignments()

        assert count == 2
        assert "kitchen" in rule_engine._assignments


class TestRuleEngineEnableDisable:
    """Test area enable/disable functionality."""

    @pytest.mark.asyncio
    async def test_enable_area(self, rule_engine, mock_app_storage, mock_hass):
        """Test enabling an area."""
        rule_engine._assignments = {"kitchen": {"app_id": "autolight"}}
        mock_app_storage.get_app.return_value = {
            "activity_actions": {"movement": {"conditions": [], "actions": []}}
        }

        # Mock entity state for presence entities
        mock_hass.states.get.return_value = MagicMock(state="off")

        # Configure area_manager to provide presence entities
        rule_engine.area_manager.get_area_entities.return_value = {
            "binary_sensor.kitchen_motion"
        }

        await rule_engine.enable_area("kitchen")

        # In new architecture, areas are always enabled for activities
        # Feature flags control app execution, not area enablement
        assert "kitchen" in rule_engine._listeners

    @pytest.mark.asyncio
    async def test_disable_area(self, rule_engine):
        """Test disabling an area."""
        rule_engine._listeners = {"kitchen": []}

        await rule_engine.disable_area("kitchen")

        assert "kitchen" not in rule_engine._listeners


class TestRuleEngineStats:
    """Test statistics tracking."""

    @pytest.mark.asyncio
    async def test_get_stats_returns_all_metrics(self, rule_engine):
        """Test that get_stats returns all tracking metrics."""
        stats = rule_engine.get_stats()

        assert "total_triggers" in stats
        assert "successful_executions" in stats
        assert "failed_executions" in stats
        assert "cooldown_blocks" in stats

    @pytest.mark.asyncio
    async def test_stats_incremented_on_execution(
        self, rule_engine, mock_app_storage, mock_activity_tracker
    ):
        """Test that stats are incremented on successful execution."""
        rule_engine._assignments = {"kitchen": {"app_id": "autolight"}}
        mock_activity_tracker.async_evaluate_activity.return_value = "movement"
        mock_app_storage.get_app.return_value = {
            "activity_actions": {
                "movement": {
                    "conditions": [],
                    "actions": [
                        {"service": "light.turn_on", "entity_id": "light.kitchen"}
                    ],
                }
            }
        }

        await rule_engine._async_evaluate_and_execute("kitchen")

        stats = rule_engine.get_stats()
        assert stats["total_triggers"] > 0


class TestRuleEngineShutdown:
    """Test engine shutdown and cleanup."""

    @pytest.mark.asyncio
    async def test_async_shutdown_clears_listeners(self, rule_engine):
        """Test that shutdown clears all listeners."""
        mock_listener_kitchen = MagicMock()
        mock_listener_bedroom = MagicMock()
        rule_engine._listeners = {
            "kitchen": [mock_listener_kitchen],
            "bedroom": [mock_listener_bedroom],
        }
        rule_engine._assignments = {"kitchen": {}, "bedroom": {}}

        await rule_engine.async_shutdown()

        assert len(rule_engine._listeners) == 0
        mock_listener_kitchen.assert_called_once()
        mock_listener_bedroom.assert_called_once()

    @pytest.mark.asyncio
    async def test_async_shutdown_cancels_debounce_tasks(self, rule_engine):
        """Test that shutdown cancels debounce tasks."""
        mock_task = MagicMock()
        mock_task.done = MagicMock(return_value=False)
        mock_task.cancel = MagicMock()
        rule_engine._debounce_tasks = {"kitchen": mock_task}

        await rule_engine.async_shutdown()

        mock_task.done.assert_called_once()
        mock_task.cancel.assert_called_once()
