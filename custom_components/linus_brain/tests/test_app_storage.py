"""
Unit tests for AppStorage.

Tests the 3-tier storage architecture:
- Local cache loading/saving
- Cloud sync with timeout handling
- Hardcoded fallback loading
- Data management (activities, apps, assignments)
"""

import asyncio
import json
from unittest.mock import AsyncMock, MagicMock

import pytest

from ..const import DEFAULT_ACTIVITY_TYPES, DEFAULT_AUTOLIGHT_APP
from ..utils.app_storage import STORAGE_KEY, STORAGE_VERSION, AppStorage


@pytest.fixture
def temp_storage_dir(tmp_path):
    """Create temporary storage directory."""
    storage_dir = tmp_path / ".storage"
    storage_dir.mkdir()
    return storage_dir


@pytest.fixture
def mock_hass_with_storage(temp_storage_dir):
    """Mock Home Assistant with temporary storage."""
    hass = MagicMock()
    hass.config.path.return_value = str(temp_storage_dir / STORAGE_KEY)

    # Mock async_add_executor_job to execute functions directly
    async def mock_executor_job(func, *args):
        return func(*args)

    hass.async_add_executor_job = mock_executor_job
    return hass


@pytest.fixture
def app_storage(mock_hass_with_storage, temp_storage_dir):
    """Create AppStorage instance with temp directory."""
    return AppStorage(mock_hass_with_storage, temp_storage_dir)


@pytest.fixture
def mock_supabase():
    """Mock Supabase client."""
    client = MagicMock()
    client.fetch_area_assignments = AsyncMock(return_value={})
    client.fetch_app_with_actions = AsyncMock(return_value=None)
    client.fetch_activity_types = AsyncMock(return_value={})
    return client


class TestAppStorageInitialization:
    """Test AppStorage initialization."""

    def test_init_creates_default_data(self, app_storage):
        """Test that initialization creates empty data structure."""
        assert app_storage._data["version"] == STORAGE_VERSION
        assert app_storage._data["activities"] == {}
        assert app_storage._data["apps"] == {}
        assert app_storage._data["assignments"] == {}
        assert app_storage._data["synced_at"] is None
        assert app_storage._data["is_fallback"] is False

    def test_is_empty_returns_true_for_new_instance(self, app_storage):
        """Test that new instance is considered empty."""
        assert app_storage.is_empty() is True

    def test_is_empty_returns_false_with_data(self, app_storage):
        """Test that instance with data is not empty."""
        app_storage._data["activities"] = {"presence": {}}
        assert app_storage.is_empty() is False


class TestAppStorageLocalCache:
    """Test local cache loading and saving."""

    @pytest.mark.asyncio
    async def test_async_load_nonexistent_file(self, app_storage):
        """Test loading when no cache file exists."""
        data = await app_storage.async_load()
        assert data["version"] == STORAGE_VERSION
        assert data["activities"] == {}

    @pytest.mark.asyncio
    async def test_async_save_creates_file(self, app_storage, temp_storage_dir):
        """Test that save creates cache file."""
        app_storage._data["activities"] = {"movement": {"name": "Movement"}}

        result = await app_storage.async_save()
        assert result is True

        cache_file = temp_storage_dir / STORAGE_KEY
        assert cache_file.exists()

    @pytest.mark.asyncio
    async def test_async_save_and_load_roundtrip(self, app_storage):
        """Test save/load roundtrip preserves data."""
        test_data = {
            "version": STORAGE_VERSION,
            "activities": {"movement": {"name": "Movement"}},
            "apps": {"autolight": {"version": "1.0"}},
            "assignments": {"kitchen": {"app_id": "autolight"}},
            "synced_at": "2025-01-01T12:00:00",
            "is_fallback": False,
        }

        app_storage._data = test_data
        await app_storage.async_save()

        new_storage = AppStorage(app_storage.hass, app_storage.storage_dir)
        loaded_data = await new_storage.async_load()

        assert loaded_data["activities"] == test_data["activities"]
        assert loaded_data["apps"] == test_data["apps"]
        assert loaded_data["assignments"] == test_data["assignments"]

    @pytest.mark.asyncio
    async def test_async_load_version_mismatch(self, app_storage, temp_storage_dir):
        """Test that version mismatch rejects cached data."""
        cache_file = temp_storage_dir / STORAGE_KEY

        with open(cache_file, "w") as f:
            json.dump({"version": 999, "activities": {"old": "data"}}, f)

        data = await app_storage.async_load()
        assert data["version"] == STORAGE_VERSION
        assert "old" not in data.get("activities", {})


class TestAppStorageFallback:
    """Test hardcoded fallback loading."""

    def test_load_hardcoded_fallback_sets_data(self, app_storage):
        """Test that fallback loads default activities and app."""
        app_storage.load_hardcoded_fallback()

        assert app_storage._data["activities"] == DEFAULT_ACTIVITY_TYPES
        assert "automatic_lighting" in app_storage._data["apps"]
        assert app_storage._data["apps"]["automatic_lighting"] == DEFAULT_AUTOLIGHT_APP
        assert app_storage._data["is_fallback"] is True

    def test_load_hardcoded_fallback_marks_as_fallback(self, app_storage):
        """Test that fallback data is marked correctly."""
        app_storage.load_hardcoded_fallback()
        assert app_storage.is_fallback_data() is True

    def test_fallback_has_expected_structure(self, app_storage):
        """Test that fallback data has required keys."""
        app_storage.load_hardcoded_fallback()

        assert "empty" in app_storage._data["activities"]
        assert "movement" in app_storage._data["activities"]
        assert "occupied" in app_storage._data["activities"]
        assert len(app_storage._data["apps"]) == 1


class TestAppStorageCloudSync:
    """Test cloud synchronization."""

    @pytest.mark.asyncio
    async def test_async_sync_from_cloud_success(self, app_storage, mock_supabase):
        """Test successful cloud sync - activities are LOCAL, apps from cloud."""
        mock_supabase.fetch_app_with_actions.return_value = {
            "id": "automatic_lighting",
            "name": "Automatic Lighting",
            "activity_actions": {
                "movement": {"conditions": [], "actions": []},
                "inactive": {"conditions": [], "actions": []},
            },
        }

        result = await app_storage.async_sync_from_cloud(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert result is True
        # All activities come from local const.py (4 system activities)
        assert (
            len(app_storage._data["activities"]) == 4
        )  # movement, inactive, empty, occupied
        assert len(app_storage._data["apps"]) == 1
        assert (
            len(app_storage._data["assignments"]) == 0
        )  # Assignments managed by switches
        assert app_storage._data["is_fallback"] is False

        # Verify system activities exist (loaded from local)
        assert "movement" in app_storage._data["activities"]
        assert "inactive" in app_storage._data["activities"]
        assert "empty" in app_storage._data["activities"]
        assert "occupied" in app_storage._data["activities"]

    @pytest.mark.asyncio
    async def test_async_sync_no_assignments_with_local_data(
        self, app_storage, mock_supabase
    ):
        """Test cloud sync - activities always local, assignments always empty."""
        app_storage._data["activities"] = {"movement": {}}
        app_storage._data["apps"] = {"autolight": {}}
        app_storage._data["assignments"] = {"kitchen": {"app_id": "autolight"}}

        mock_supabase.fetch_app_with_actions.return_value = None

        result = await app_storage.async_sync_from_cloud(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert result is True
        assert (
            app_storage._data["assignments"] == {}
        )  # Always empty (managed by switches)
        assert app_storage.is_fallback_data() is False
        # Activities are loaded from local const.py (4 activities)
        assert len(app_storage._data["activities"]) == 4
        # automatic_lighting injected as fallback when not in cloud
        assert len(app_storage._data["apps"]) == 1
        assert "automatic_lighting" in app_storage._data["apps"]

    @pytest.mark.asyncio
    async def test_async_sync_no_assignments_no_local_data(
        self, app_storage, mock_supabase
    ):
        """Test cloud sync with no local data - activities from local const.py."""
        mock_supabase.fetch_app_with_actions.return_value = None

        result = await app_storage.async_sync_from_cloud(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert result is True
        assert app_storage.is_fallback_data() is False
        # Activities loaded from local const.py (4 system activities)
        assert len(app_storage._data["activities"]) == 4
        # automatic_lighting injected as fallback
        assert len(app_storage._data["apps"]) == 1
        assert len(app_storage._data["assignments"]) == 0

    @pytest.mark.asyncio
    async def test_async_sync_timeout_with_empty_storage(
        self, app_storage, mock_supabase
    ):
        """Test that timeout loads fallback when storage is empty."""

        async def slow_fetch(*args, **kwargs):
            await asyncio.sleep(15)
            return {}

        mock_supabase.fetch_app_with_actions.side_effect = slow_fetch

        result = await app_storage.async_sync_from_cloud(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert result is False
        assert app_storage.is_fallback_data() is True

    @pytest.mark.asyncio
    async def test_async_sync_exception_loads_fallback(
        self, app_storage, mock_supabase
    ):
        """Test that exceptions load fallback when storage is empty."""
        mock_supabase.fetch_app_with_actions.side_effect = Exception("Network error")

        result = await app_storage.async_sync_from_cloud(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert result is False
        assert app_storage.is_fallback_data() is True


class TestAppStorageDataAccess:
    """Test data access methods."""

    def test_get_activities(self, app_storage):
        """Test getting all activities."""
        app_storage._data["activities"] = {"presence": {"name": "Presence"}}
        activities = app_storage.get_activities()
        assert "presence" in activities

    def test_get_activity(self, app_storage):
        """Test getting specific activity."""
        app_storage._data["activities"] = {"presence": {"name": "Presence"}}
        activity = app_storage.get_activity("presence")
        assert activity == {"name": "Presence"}

    def test_get_activity_nonexistent(self, app_storage):
        """Test getting nonexistent activity returns None."""
        activity = app_storage.get_activity("nonexistent")
        assert activity is None

    def test_get_apps(self, app_storage):
        """Test getting all apps."""
        app_storage._data["apps"] = {"autolight": {"version": "1.0"}}
        apps = app_storage.get_apps()
        assert "autolight" in apps

    def test_get_app(self, app_storage):
        """Test getting specific app."""
        app_storage._data["apps"] = {"autolight": {"version": "1.0"}}
        app = app_storage.get_app("autolight")
        assert app == {"version": "1.0"}

    def test_get_assignments(self, app_storage):
        """Test getting all assignments."""
        app_storage._data["assignments"] = {"kitchen": {"app_id": "autolight"}}
        assignments = app_storage.get_assignments()
        assert "kitchen" in assignments

    def test_get_assignment(self, app_storage):
        """Test getting specific assignment."""
        app_storage._data["assignments"] = {"kitchen": {"app_id": "autolight"}}
        assignment = app_storage.get_assignment("kitchen")
        assert assignment == {"app_id": "autolight"}


class TestAppStorageDataManagement:
    """Test data modification methods."""

    def test_set_activity(self, app_storage):
        """Test setting activity data."""
        app_storage.set_activity("presence", {"name": "Presence"})
        assert app_storage.get_activity("presence") == {"name": "Presence"}

    def test_set_app(self, app_storage):
        """Test setting app data."""
        app_storage.set_app("autolight", {"version": "1.0"})
        assert app_storage.get_app("autolight") == {"version": "1.0"}

    def test_set_assignment(self, app_storage):
        """Test setting assignment data."""
        app_storage.set_assignment("kitchen", {"app_id": "autolight"})
        assert app_storage.get_assignment("kitchen") == {"app_id": "autolight"}

    def test_remove_assignment(self, app_storage):
        """Test removing assignment."""
        app_storage.set_assignment("kitchen", {"app_id": "autolight"})
        result = app_storage.remove_assignment("kitchen")
        assert result is True
        assert app_storage.get_assignment("kitchen") is None

    def test_remove_nonexistent_assignment(self, app_storage):
        """Test removing nonexistent assignment returns False."""
        result = app_storage.remove_assignment("nonexistent")
        assert result is False


class TestAppStorageInitialize:
    """Test full initialization sequence."""

    @pytest.mark.asyncio
    async def test_async_initialize_cloud_success(self, app_storage, mock_supabase):
        """Test initialization with successful cloud sync."""
        mock_supabase.fetch_area_assignments.return_value = {
            "kitchen": {"app_id": "autolight"}
        }
        mock_supabase.fetch_app_with_actions.return_value = {
            "id": "autolight",
            "activity_actions": {"presence": {}},
        }
        mock_supabase.fetch_activity_types.return_value = {
            "presence": {"name": "Presence"}
        }

        data = await app_storage.async_initialize(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert len(data["apps"]) == 1
        assert data["is_fallback"] is False

    @pytest.mark.asyncio
    async def test_async_initialize_cloud_fail_uses_fallback(
        self, app_storage, mock_supabase
    ):
        """Test initialization falls back when cloud fails."""
        # Mock the actual method that's called during cloud sync
        mock_supabase.fetch_app_with_actions.side_effect = Exception("Network error")

        data = await app_storage.async_initialize(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert data["is_fallback"] is True
        assert (
            len(data["activities"]) == 4
        )  # Fallback loads from const.py (4 activities: movement, inactive, occupied, empty)
        assert "automatic_lighting" in data["apps"]

    @pytest.mark.asyncio
    async def test_async_initialize_with_cached_data(
        self, app_storage, mock_supabase, temp_storage_dir
    ):
        """Test initialization with cached data and cloud sync with system activities."""
        cache_file = temp_storage_dir / STORAGE_KEY

        with open(cache_file, "w") as f:
            json.dump(
                {
                    "version": STORAGE_VERSION,
                    "activities": {"movement": {"name": "Cached"}},
                    "apps": {"autolight": {"version": "1.0"}},
                    "assignments": {"kitchen": {"app_id": "autolight"}},
                    "synced_at": None,
                    "is_fallback": False,
                },
                f,
            )

        mock_supabase.fetch_area_assignments.return_value = {}

        data = await app_storage.async_initialize(
            mock_supabase, "test-instance", ["kitchen"]
        )

        # Cloud sync clears assignments but system activities are injected
        assert data["is_fallback"] is False  # Cloud sync succeeded
        assert data["assignments"] == {}
        # System activities (movement, inactive, occupied, empty) always present
        assert len(data["activities"]) == 4
        assert "movement" in data["activities"]
        assert "inactive" in data["activities"]
        assert "occupied" in data["activities"]
        assert "empty" in data["activities"]

    @pytest.mark.asyncio
    async def test_empty_cloud_sync_accepts_empty_state(
        self, app_storage, mock_supabase
    ):
        """Test that empty cloud sync is accepted as valid state with system activities injected."""
        # Mock empty cloud response (no apps, no activities, no assignments)
        mock_supabase.fetch_area_assignments.return_value = {}
        mock_supabase.fetch_app_with_actions.return_value = None
        mock_supabase.fetch_activity_types.return_value = {}

        # Perform cloud sync - should accept empty state without loading fallback
        success = await app_storage.async_sync_from_cloud(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert success is True
        assert app_storage.is_fallback_data() is False

        # The key assertion: synced_at should be set (cloud sync succeeded)
        sync_time = app_storage.get_sync_time()
        assert sync_time is not None, "Sync time should be set when cloud sync succeeds"

        # Verify system activities are injected (movement, inactive, occupied, empty)
        activities = app_storage.get_activities()
        assert len(activities) == 4  # System activities always injected
        assert "movement" in activities
        assert "inactive" in activities
        assert "occupied" in activities
        assert "empty" in activities

        # Verify automatic_lighting was injected as fallback when cloud had none
        apps = app_storage.get_apps()
        assert len(apps) == 1
        assert "automatic_lighting" in apps
        assignments = app_storage.get_assignments()
        assert len(assignments) == 0


class TestAppStorageDefensiveFallbacks:
    """Test defensive fallback system for critical system apps and activities."""

    def test_get_app_automatic_lighting_missing_injects_fallback(self, app_storage):
        """Test that get_app() auto-injects automatic_lighting if missing."""
        # Storage is empty, no automatic_lighting app
        # But get_app should auto-inject and return it
        app = app_storage.get_app("automatic_lighting")

        # Should have auto-injected the fallback
        assert app is not None
        assert app["app_id"] == "automatic_lighting"
        assert "activity_actions" in app

        # Verify it was persisted to storage
        stored_app = app_storage._data["apps"].get("automatic_lighting")
        assert stored_app is not None
        assert stored_app == app

    def test_get_app_automatic_lighting_exists(self, app_storage):
        """Test that get_app() returns existing automatic_lighting without fallback."""
        custom_app = {
            "app_id": "automatic_lighting",
            "app_name": "Custom AutoLight",
            "activity_actions": {"movement": {}},
        }
        app_storage.set_app("automatic_lighting", custom_app)

        app = app_storage.get_app("automatic_lighting")
        assert app == custom_app
        assert app["app_name"] == "Custom AutoLight"

    def test_get_app_other_app_missing_returns_none(self, app_storage):
        """Test that other apps return None if missing (no fallback)."""
        app = app_storage.get_app("some_other_app")
        assert app is None

    def test_get_activity_movement_missing_injects_fallback(self, app_storage):
        """Test that get_activity() auto-injects movement if missing."""
        activity = app_storage.get_activity("movement")
        assert activity is not None
        assert activity["activity_id"] == "movement"
        assert activity["is_system"] is True

    def test_get_activity_inactive_missing_injects_fallback(self, app_storage):
        """Test that get_activity() auto-injects inactive if missing."""
        activity = app_storage.get_activity("inactive")
        assert activity is not None
        assert activity["activity_id"] == "inactive"
        assert activity["is_transition_state"] is True

    def test_get_activity_empty_missing_injects_fallback(self, app_storage):
        """Test that get_activity() auto-injects empty if missing."""
        activity = app_storage.get_activity("empty")
        assert activity is not None
        assert activity["activity_id"] == "empty"
        assert activity["is_system"] is True

    def test_get_activity_other_activity_missing_returns_none(self, app_storage):
        """Test that non-system activities return None if missing (no fallback)."""
        activity = app_storage.get_activity("watching_tv")
        assert activity is None

    def test_get_activity_existing_not_replaced(self, app_storage):
        """Test that existing activities are not replaced with fallback."""
        custom_activity = {
            "activity_id": "movement",
            "activity_name": "Custom Movement",
            "timeout_seconds": 999,
        }
        app_storage.set_activity("movement", custom_activity)

        activity = app_storage.get_activity("movement")
        assert activity == custom_activity
        assert activity["timeout_seconds"] == 999

    @pytest.mark.asyncio
    async def test_cloud_sync_missing_automatic_lighting_injects_fallback(
        self, app_storage, mock_supabase
    ):
        """Test that cloud sync injects automatic_lighting fallback when not in cloud."""
        # Mock cloud returning no app (automatic_lighting missing)
        mock_supabase.fetch_app_with_actions.return_value = (
            None  # App not found in cloud
        )
        mock_supabase.fetch_activity_types.return_value = {
            "movement": {"activity_id": "movement"},
            "inactive": {"activity_id": "inactive"},
            "empty": {"activity_id": "empty"},
        }

        result = await app_storage.async_sync_from_cloud(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert result is True

        # Verify automatic_lighting was injected as fallback
        app = app_storage.get_app("automatic_lighting")
        assert app is not None
        assert app["app_id"] == "automatic_lighting"

        # Verify assignments are empty (managed locally by switches, not from cloud)
        assignment = app_storage.get_assignment("kitchen")
        assert assignment is None  # Assignments not fetched from cloud anymore

    @pytest.mark.asyncio
    async def test_cloud_sync_missing_system_activities_injects_fallback(
        self, app_storage, mock_supabase
    ):
        """Test that cloud sync injects system activities if missing."""
        # Mock cloud returning assignments but missing system activities
        mock_supabase.fetch_area_assignments.return_value = {
            "kitchen": {"app_id": "automatic_lighting"}
        }
        mock_supabase.fetch_app_with_actions.return_value = DEFAULT_AUTOLIGHT_APP
        # Only return one activity, others missing
        mock_supabase.fetch_activity_types.return_value = {
            "movement": {"activity_id": "movement"}
        }

        result = await app_storage.async_sync_from_cloud(
            mock_supabase, "test-instance", ["kitchen"]
        )

        assert result is True

        # Verify all system activities exist (should be injected)
        movement = app_storage.get_activity("movement")
        inactive = app_storage.get_activity("inactive")
        empty = app_storage.get_activity("empty")

        assert movement is not None
        assert inactive is not None
        assert empty is not None
