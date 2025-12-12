"""
Tests for performance optimizations (caching, etc.)
"""

import time
from datetime import datetime, timedelta
from unittest.mock import MagicMock, patch

import pytest

from ..utils import area_manager
from ..utils.condition_evaluator import ConditionEvaluator
from ..utils.entity_resolver import EntityResolver


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance."""
    hass = MagicMock()
    hass.states = MagicMock()
    return hass


@pytest.fixture
def mock_entity_resolver(mock_hass):
    """Mock EntityResolver."""
    with patch.multiple(
        "homeassistant.helpers.entity_registry",
        async_get=MagicMock(return_value=MagicMock()),
    ), patch.multiple(
        "homeassistant.helpers.device_registry",
        async_get=MagicMock(return_value=MagicMock()),
    ), patch.multiple(
        "homeassistant.helpers.area_registry",
        async_get=MagicMock(return_value=MagicMock()),
    ):
        return EntityResolver(mock_hass)


@pytest.fixture
def mock_area_manager():
    """Mock AreaManager with presence detection config."""
    area_mgr = MagicMock()
    area_mgr._get_presence_detection_config.return_value = {
        "motion": True,
        "presence": True,
        "occupancy": False,
        "media_playing": False,
    }
    return area_mgr


@pytest.fixture
def condition_evaluator(mock_hass, mock_entity_resolver, mock_area_manager):
    """Create ConditionEvaluator instance with mocked area_manager."""
    return ConditionEvaluator(mock_hass, mock_entity_resolver, None, mock_area_manager)


class TestPresenceConfigCaching:
    """Test presence detection config caching in ConditionEvaluator."""

    def test_cache_initialization(self, condition_evaluator):
        """Test that cache is initialized to None."""
        assert condition_evaluator._presence_config_cache is None
        assert condition_evaluator._cache_timestamp is None

    def test_cache_first_call(self, condition_evaluator, mock_area_manager):
        """Test that first call fetches from area_manager."""
        config = condition_evaluator._get_presence_config_cached()

        assert config == {
            "motion": True,
            "presence": True,
            "occupancy": False,
            "media_playing": False,
        }
        assert mock_area_manager._get_presence_detection_config.call_count == 1
        assert condition_evaluator._presence_config_cache is not None
        assert condition_evaluator._cache_timestamp is not None

    def test_cache_subsequent_calls(self, condition_evaluator, mock_area_manager):
        """Test that subsequent calls use cache."""
        # First call
        config1 = condition_evaluator._get_presence_config_cached()
        call_count_after_first = (
            mock_area_manager._get_presence_detection_config.call_count
        )

        # Second call (should use cache)
        config2 = condition_evaluator._get_presence_config_cached()
        call_count_after_second = (
            mock_area_manager._get_presence_detection_config.call_count
        )

        # Third call (should use cache)
        config3 = condition_evaluator._get_presence_config_cached()
        call_count_after_third = (
            mock_area_manager._get_presence_detection_config.call_count
        )

        # Verify cache was used
        assert config1 == config2 == config3
        assert call_count_after_first == 1
        assert call_count_after_second == 1  # No additional call
        assert call_count_after_third == 1  # No additional call

    def test_cache_expiration(self, condition_evaluator, mock_area_manager):
        """Test that cache expires after TTL."""
        # First call
        config1 = condition_evaluator._get_presence_config_cached()
        assert mock_area_manager._get_presence_detection_config.call_count == 1

        # Manually expire cache
        condition_evaluator._cache_timestamp = datetime.now() - timedelta(seconds=61)

        # Next call should fetch fresh config
        config2 = condition_evaluator._get_presence_config_cached()
        assert mock_area_manager._get_presence_detection_config.call_count == 2
        assert config1 == config2

    def test_cache_with_no_area_manager(self, mock_hass, mock_entity_resolver):
        """Test that default config is returned when no area_manager."""
        evaluator = ConditionEvaluator(mock_hass, mock_entity_resolver, None, None)

        config = evaluator._get_presence_config_cached()

        # Should return permissive default
        assert config == {
            "motion": True,
            "presence": True,
            "occupancy": True,
            "media_playing": True,
        }

    def test_cache_with_error(self, condition_evaluator, mock_area_manager):
        """Test that default is returned on error (not cached)."""
        # Make area_manager raise exception
        mock_area_manager._get_presence_detection_config.side_effect = Exception(
            "Test error"
        )

        config = condition_evaluator._get_presence_config_cached()

        # Should return default
        assert config == {
            "motion": True,
            "presence": True,
            "occupancy": True,
            "media_playing": True,
        }

        # Cache should NOT be set on error
        # (so next call will retry)
        # We can't directly check this without implementation details,
        # but we can verify it tries again next time
        mock_area_manager._get_presence_detection_config.side_effect = None
        mock_area_manager._get_presence_detection_config.return_value = {
            "motion": False,
            "presence": False,
            "occupancy": False,
            "media_playing": False,
        }

        config2 = condition_evaluator._get_presence_config_cached()
        # Should have tried again and got new config
        assert config2["motion"] is False


class TestMonitoredDomainsCaching:
    """Test monitored domains caching in area_manager."""

    def test_cache_first_call(self):
        """Test that first call computes and caches."""
        # Clear cache
        area_manager._MONITORED_DOMAINS_CACHE = None

        result = area_manager.get_monitored_domains()

        # Should return valid result
        assert isinstance(result, dict)
        assert "binary_sensor" in result
        assert "sensor" in result

        # Should be cached
        assert area_manager._MONITORED_DOMAINS_CACHE is not None
        assert area_manager._MONITORED_DOMAINS_CACHE == result

    def test_cache_subsequent_calls(self):
        """Test that subsequent calls use cache."""
        # Clear and populate cache
        area_manager._MONITORED_DOMAINS_CACHE = None
        result1 = area_manager.get_monitored_domains()

        # Second call should return exact same object (cache)
        result2 = area_manager.get_monitored_domains()

        assert result1 is result2  # Same object reference
        assert result1 == result2  # Same value

    def test_presence_detection_domains_cache_first_call(self):
        """Test presence detection domains caching."""
        # Clear cache
        area_manager._PRESENCE_DETECTION_DOMAINS_CACHE = None

        result = area_manager.get_presence_detection_domains()

        # Should return valid result
        assert isinstance(result, dict)
        assert "binary_sensor" in result

        # Should be cached
        assert area_manager._PRESENCE_DETECTION_DOMAINS_CACHE is not None
        assert area_manager._PRESENCE_DETECTION_DOMAINS_CACHE == result

    def test_presence_detection_domains_cache_subsequent_calls(self):
        """Test that subsequent calls use cache."""
        # Clear and populate cache
        area_manager._PRESENCE_DETECTION_DOMAINS_CACHE = None
        result1 = area_manager.get_presence_detection_domains()

        # Second call should return exact same object (cache)
        result2 = area_manager.get_presence_detection_domains()

        assert result1 is result2  # Same object reference
        assert result1 == result2  # Same value


class TestPerformanceBenchmarks:
    """Performance benchmarks (not strict assertions, just for monitoring)."""

    def test_cache_performance_improvement(self, condition_evaluator):
        """Benchmark cache performance improvement."""
        # Clear cache
        condition_evaluator._presence_config_cache = None
        condition_evaluator._cache_timestamp = None

        # First call (cache miss)
        start = time.perf_counter()
        for _ in range(100):
            condition_evaluator._presence_config_cache = None
            condition_evaluator._get_presence_config_cached()
        time_without_cache = time.perf_counter() - start

        # Subsequent calls (cache hit)
        start = time.perf_counter()
        for _ in range(100):
            condition_evaluator._get_presence_config_cached()
        time_with_cache = time.perf_counter() - start

        # Cache should be significantly faster (at least 5x)
        speedup = time_without_cache / time_with_cache
        print(
            f"\nCache speedup: {speedup:.1f}x "
            f"({time_without_cache:.4f}s vs {time_with_cache:.4f}s)"
        )

        # This is informational - we don't assert strict performance
        # but we can log it for regression detection
        assert speedup > 1.0, "Cache should provide some speedup"

    def test_monitored_domains_cache_performance(self):
        """Benchmark monitored domains cache performance."""
        # Clear cache
        area_manager._MONITORED_DOMAINS_CACHE = None

        # First call (compute)
        start = time.perf_counter()
        for _ in range(100):
            area_manager._MONITORED_DOMAINS_CACHE = None
            area_manager.get_monitored_domains()
        time_without_cache = time.perf_counter() - start

        # Subsequent calls (cached)
        start = time.perf_counter()
        for _ in range(100):
            area_manager.get_monitored_domains()
        time_with_cache = time.perf_counter() - start

        speedup = time_without_cache / time_with_cache
        print(
            f"\nMonitored domains cache speedup: {speedup:.1f}x "
            f"({time_without_cache:.4f}s vs {time_with_cache:.4f}s)"
        )

        # Cache should provide significant speedup (at least 10x)
        assert speedup > 10.0, f"Cache should provide major speedup, got {speedup:.1f}x"
