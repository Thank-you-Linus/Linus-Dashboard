"""
Unit tests for InsightsManager.

Tests the insights system:
- Loading insights from Supabase with instance-specific + global defaults
- Three-tier fallback logic (instance+area → global+area → global default)
- Caching mechanism and cache statistics
- Reload functionality
- Error handling and edge cases
"""

from unittest.mock import AsyncMock, MagicMock

import pytest

from ..utils.insights_manager import InsightsManager


@pytest.fixture
def mock_supabase_client():
    """Mock SupabaseClient."""
    client = MagicMock()
    client.fetch_area_insights = AsyncMock(return_value=[])
    return client


@pytest.fixture
def insights_manager(mock_supabase_client):
    """Create InsightsManager instance."""
    return InsightsManager(mock_supabase_client)


@pytest.fixture
def sample_insights():
    """Sample insights data for testing."""
    return [
        # Instance-specific + area-specific
        {
            "id": "insight-1",
            "instance_id": "inst-123",
            "area_id": "salon",
            "insight_type": "dark_threshold_lux",
            "value": {"threshold": 150},
            "confidence": 0.9,
            "metadata": {"sample_size": 100},
            "updated_at": "2025-10-27T23:30:00Z",
        },
        # Global + area-specific
        {
            "id": "insight-2",
            "instance_id": None,
            "area_id": "cuisine",
            "insight_type": "dark_threshold_lux",
            "value": {"threshold": 180},
            "confidence": 0.7,
            "metadata": {"sample_size": 50},
            "updated_at": "2025-10-27T20:00:00Z",
        },
        # Global defaults
        {
            "id": "insight-3",
            "instance_id": None,
            "area_id": None,
            "insight_type": "dark_threshold_lux",
            "value": {"threshold": 200},
            "confidence": 0.3,
            "metadata": {"source": "default"},
            "updated_at": "2025-10-26T00:00:00Z",
        },
        {
            "id": "insight-5",
            "instance_id": None,
            "area_id": None,
            "insight_type": "dark_mode_brightness_pct",
            "value": {"brightness": 30},
            "confidence": 0.3,
            "metadata": {"source": "default"},
            "updated_at": "2025-10-26T00:00:00Z",
        },
    ]


class TestInsightsManagerInitialization:
    """Test InsightsManager initialization."""

    def test_initialization(self, mock_supabase_client):
        """Test that manager initializes with correct state."""
        manager = InsightsManager(mock_supabase_client)

        assert manager.supabase_client == mock_supabase_client
        assert manager._cache == {}
        assert manager._last_loaded is None
        assert not manager.is_loaded()

    def test_get_last_loaded_before_loading(self, insights_manager):
        """Test that get_last_loaded returns None before loading."""
        assert insights_manager.get_last_loaded() is None


class TestAsyncLoad:
    """Test async_load functionality."""

    @pytest.mark.asyncio
    async def test_load_success(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test successful loading of insights."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights

        result = await insights_manager.async_load("inst-123")

        assert result is True
        assert insights_manager.is_loaded()
        assert insights_manager._last_loaded is not None
        assert len(insights_manager._cache) == 4
        mock_supabase_client.fetch_area_insights.assert_called_once_with("inst-123")

    @pytest.mark.asyncio
    async def test_load_clears_existing_cache(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test that loading clears existing cache."""
        # First load
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")
        assert len(insights_manager._cache) == 4

        # Second load with different data
        new_insights = [sample_insights[0]]  # Only one insight
        mock_supabase_client.fetch_area_insights.return_value = new_insights
        await insights_manager.async_load("inst-123")

        assert len(insights_manager._cache) == 1

    @pytest.mark.asyncio
    async def test_load_failure_returns_false(
        self, insights_manager, mock_supabase_client
    ):
        """Test that load returns False when Supabase fails."""
        mock_supabase_client.fetch_area_insights.return_value = None

        result = await insights_manager.async_load("inst-123")

        assert result is False
        assert len(insights_manager._cache) == 0

    @pytest.mark.asyncio
    async def test_load_handles_exception(self, insights_manager, mock_supabase_client):
        """Test that load handles exceptions gracefully."""
        mock_supabase_client.fetch_area_insights.side_effect = Exception(
            "Network error"
        )

        result = await insights_manager.async_load("inst-123")

        assert result is False
        assert len(insights_manager._cache) == 0

    @pytest.mark.asyncio
    async def test_load_skips_insights_without_type(
        self, insights_manager, mock_supabase_client
    ):
        """Test that insights without insight_type are skipped."""
        insights = [
            {
                "id": "insight-1",
                "instance_id": "inst-123",
                "area_id": "salon",
                "insight_type": "dark_threshold_lux",
                "value": {"threshold": 150},
                "confidence": 0.9,
                "metadata": {},
                "updated_at": "2025-10-27T23:30:00Z",
            },
            {
                "id": "insight-2",
                "instance_id": None,
                "area_id": None,
                # Missing insight_type
                "value": {"threshold": 200},
                "confidence": 0.3,
                "metadata": {},
                "updated_at": "2025-10-27T23:30:00Z",
            },
        ]
        mock_supabase_client.fetch_area_insights.return_value = insights

        result = await insights_manager.async_load("inst-123")

        assert result is True
        assert len(insights_manager._cache) == 1  # Only one valid insight

    @pytest.mark.asyncio
    async def test_cache_structure(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test that cache has correct structure."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights

        await insights_manager.async_load("inst-123")

        # Check cache key structure
        cache_key = ("inst-123", "salon", "dark_threshold_lux")
        assert cache_key in insights_manager._cache

        # Check cached data structure
        cached = insights_manager._cache[cache_key]
        assert cached["id"] == "insight-1"
        assert cached["value"] == {"threshold": 150}
        assert cached["confidence"] == 0.9
        assert cached["metadata"] == {"sample_size": 100}
        assert cached["source"] == "instance_area_specific"
        assert cached["updated_at"] == "2025-10-27T23:30:00Z"


class TestDetermineSource:
    """Test _determine_source method."""

    def test_instance_area_specific(self, insights_manager):
        """Test instance + area specific source."""
        source = insights_manager._determine_source("inst-123", "salon")
        assert source == "instance_area_specific"

    def test_global_area_specific(self, insights_manager):
        """Test global + area specific source."""
        source = insights_manager._determine_source(None, "salon")
        assert source == "global_area_specific"

    def test_global_default(self, insights_manager):
        """Test global default source."""
        source = insights_manager._determine_source(None, None)
        assert source == "global_default"


class TestGetInsight:
    """Test get_insight fallback logic."""

    @pytest.mark.asyncio
    async def test_instance_area_specific_priority(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test that instance+area specific insights have highest priority."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        insight = insights_manager.get_insight(
            "inst-123", "salon", "dark_threshold_lux"
        )

        assert insight is not None
        assert insight["value"]["threshold"] == 150  # Instance-specific value
        assert insight["confidence"] == 0.9
        assert insight["source"] == "instance_area_specific"

    @pytest.mark.asyncio
    async def test_global_area_specific_fallback(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test fallback to global+area specific when instance+area not found."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        # Request for "cuisine" area (no instance-specific, has global+area)
        insight = insights_manager.get_insight(
            "inst-123", "cuisine", "dark_threshold_lux"
        )

        assert insight is not None
        assert insight["value"]["threshold"] == 180  # Global+area value
        assert insight["confidence"] == 0.7
        assert insight["source"] == "global_area_specific"

    @pytest.mark.asyncio
    async def test_global_default_fallback(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test fallback to global default when area-specific not found."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        # Request for "chambre" area (no instance-specific, no global+area)
        insight = insights_manager.get_insight(
            "inst-123", "chambre", "dark_threshold_lux"
        )

        assert insight is not None
        assert insight["value"]["threshold"] == 200  # Global default value
        assert insight["confidence"] == 0.3
        assert insight["source"] == "global_default"

    @pytest.mark.asyncio
    async def test_provided_default_fallback(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test fallback to provided default when insight not found."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        # Request for non-existent insight type
        default_value = {"threshold": 999}
        insight = insights_manager.get_insight(
            "inst-123", "salon", "non_existent_insight", default=default_value
        )

        assert insight == default_value

    @pytest.mark.asyncio
    async def test_returns_none_when_no_default_provided(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test that None is returned when insight not found and no default provided."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        insight = insights_manager.get_insight(
            "inst-123", "salon", "non_existent_insight"
        )

        assert insight is None


class TestGetAllInsightsForArea:
    """Test get_all_insights_for_area aggregation."""

    @pytest.mark.asyncio
    async def test_get_all_insights_for_area(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test getting all insights for a specific area."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        insights = insights_manager.get_all_insights_for_area("inst-123", "salon")

        # Should include all insight types available
        assert "dark_threshold_lux" in insights
        assert "dark_mode_brightness_pct" in insights

        # Should use instance-specific for dark_threshold_lux
        assert insights["dark_threshold_lux"]["value"]["threshold"] == 150
        assert insights["dark_threshold_lux"]["source"] == "instance_area_specific"

        # Should use global defaults for dark_mode_brightness_pct
        assert insights["dark_mode_brightness_pct"]["value"]["brightness"] == 30
        assert insights["dark_mode_brightness_pct"]["source"] == "global_default"

    @pytest.mark.asyncio
    async def test_get_all_insights_empty_cache(self, insights_manager):
        """Test getting insights when cache is empty."""
        insights = insights_manager.get_all_insights_for_area("inst-123", "salon")

        assert insights == {}

    @pytest.mark.asyncio
    async def test_get_all_insights_applies_fallback_logic(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test that get_all_insights applies fallback logic correctly."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        # "cuisine" has global+area specific for dark_threshold_lux
        insights = insights_manager.get_all_insights_for_area("inst-123", "cuisine")

        assert "dark_threshold_lux" in insights
        assert insights["dark_threshold_lux"]["value"]["threshold"] == 180
        assert insights["dark_threshold_lux"]["source"] == "global_area_specific"


class TestGetAllInsightTypes:
    """Test get_all_insight_types."""

    @pytest.mark.asyncio
    async def test_get_all_insight_types(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test getting list of all insight types."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        insight_types = insights_manager.get_all_insight_types()

        assert len(insight_types) == 2
        assert "dark_threshold_lux" in insight_types
        assert "dark_mode_brightness_pct" in insight_types
        # Should be sorted
        assert insight_types == sorted(insight_types)

    def test_get_all_insight_types_empty_cache(self, insights_manager):
        """Test getting insight types when cache is empty."""
        insight_types = insights_manager.get_all_insight_types()

        assert insight_types == []


class TestGetCacheStats:
    """Test get_cache_stats."""

    @pytest.mark.asyncio
    async def test_cache_stats(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test cache statistics calculation."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        stats = insights_manager.get_cache_stats()

        assert stats["total_insights"] == 4
        assert stats["instance_specific"] == 1  # inst-123 + salon
        assert stats["global_area_specific"] == 1  # None + cuisine
        assert stats["global_defaults"] == 2  # None + None (2 types)
        assert stats["insight_types"] == 2
        assert stats["last_loaded"] is not None

    def test_cache_stats_empty(self, insights_manager):
        """Test cache stats when cache is empty."""
        stats = insights_manager.get_cache_stats()

        assert stats["total_insights"] == 0
        assert stats["instance_specific"] == 0
        assert stats["global_area_specific"] == 0
        assert stats["global_defaults"] == 0
        assert stats["insight_types"] == 0
        assert stats["last_loaded"] is None


class TestAsyncReload:
    """Test async_reload functionality."""

    @pytest.mark.asyncio
    async def test_reload_calls_async_load(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test that reload calls async_load."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights

        result = await insights_manager.async_reload("inst-123")

        assert result is True
        assert insights_manager.is_loaded()
        mock_supabase_client.fetch_area_insights.assert_called_once_with("inst-123")

    @pytest.mark.asyncio
    async def test_reload_refreshes_cache(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test that reload refreshes the cache."""
        # Initial load
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")
        first_load_time = insights_manager._last_loaded

        # Wait a bit and reload
        import asyncio

        await asyncio.sleep(0.01)

        # Reload with updated data
        updated_insights = [
            {
                "id": "insight-1",
                "instance_id": "inst-123",
                "area_id": "salon",
                "insight_type": "dark_threshold_lux",
                "value": {"threshold": 175},  # Changed value
                "confidence": 0.95,  # Changed confidence
                "metadata": {"sample_size": 200},
                "updated_at": "2025-10-27T23:45:00Z",
            }
        ]
        mock_supabase_client.fetch_area_insights.return_value = updated_insights
        result = await insights_manager.async_reload("inst-123")

        assert result is True
        assert insights_manager._last_loaded > first_load_time

        # Verify cache was updated
        insight = insights_manager.get_insight(
            "inst-123", "salon", "dark_threshold_lux"
        )
        assert insight["value"]["threshold"] == 175
        assert insight["confidence"] == 0.95


class TestIsLoaded:
    """Test is_loaded method."""

    def test_is_loaded_before_load(self, insights_manager):
        """Test is_loaded returns False before loading."""
        assert not insights_manager.is_loaded()

    @pytest.mark.asyncio
    async def test_is_loaded_after_load(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test is_loaded returns True after loading."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        assert insights_manager.is_loaded()

    @pytest.mark.asyncio
    async def test_is_loaded_after_failed_load(
        self, insights_manager, mock_supabase_client
    ):
        """Test is_loaded returns False after failed load."""
        mock_supabase_client.fetch_area_insights.return_value = None
        await insights_manager.async_load("inst-123")

        assert not insights_manager.is_loaded()


class TestEdgeCases:
    """Test edge cases and error conditions."""

    @pytest.mark.asyncio
    async def test_empty_insights_list(self, insights_manager, mock_supabase_client):
        """Test loading when Supabase returns empty list."""
        mock_supabase_client.fetch_area_insights.return_value = []

        result = await insights_manager.async_load("inst-123")

        assert result is True  # Still succeeds
        assert len(insights_manager._cache) == 0
        assert insights_manager.is_loaded()

    @pytest.mark.asyncio
    async def test_insight_with_missing_fields(
        self, insights_manager, mock_supabase_client
    ):
        """Test handling insights with missing optional fields."""
        insights = [
            {
                "id": "insight-1",
                "instance_id": "inst-123",
                "area_id": "salon",
                "insight_type": "dark_threshold_lux",
                # Missing value, confidence, metadata, updated_at
            }
        ]
        mock_supabase_client.fetch_area_insights.return_value = insights

        result = await insights_manager.async_load("inst-123")

        assert result is True
        insight = insights_manager.get_insight(
            "inst-123", "salon", "dark_threshold_lux"
        )
        assert insight["value"] == {}
        assert insight["confidence"] == 0.0
        assert insight["metadata"] == {}
        assert insight["updated_at"] is None

    @pytest.mark.asyncio
    async def test_get_insight_with_none_area_id(
        self, insights_manager, mock_supabase_client, sample_insights
    ):
        """Test getting insight with None as area_id."""
        mock_supabase_client.fetch_area_insights.return_value = sample_insights
        await insights_manager.async_load("inst-123")

        # Should return global default
        insight = insights_manager.get_insight("inst-123", None, "dark_threshold_lux")

        assert insight is not None
        assert insight["value"]["threshold"] == 200
        assert insight["source"] == "global_default"
