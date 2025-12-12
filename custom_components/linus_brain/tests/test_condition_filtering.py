"""
Unit tests for condition filtering based on presence detection configuration.

Tests that ConditionEvaluator correctly filters conditions based on the
presence detection configuration from config flow.
"""

from unittest.mock import MagicMock

import pytest

from ..utils.condition_evaluator import ConditionEvaluator
from ..utils.entity_resolver import EntityResolver


@pytest.fixture
def mock_hass():
    """Mock Home Assistant instance."""
    hass = MagicMock()
    hass.states = MagicMock()

    # Mock entity states
    states = {
        "binary_sensor.motion": MagicMock(state="on"),
        "binary_sensor.presence": MagicMock(state="on"),
        "binary_sensor.occupancy": MagicMock(state="on"),
        "media_player.tv": MagicMock(state="playing"),
    }
    hass.states.get = MagicMock(side_effect=lambda entity_id: states.get(entity_id))

    return hass


@pytest.fixture
def mock_entity_resolver():
    """Mock EntityResolver that returns conditions as-is."""
    resolver = MagicMock(spec=EntityResolver)
    resolver.resolve_nested_conditions = MagicMock(
        side_effect=lambda conditions, area_id: conditions
    )
    return resolver


@pytest.fixture
def mock_area_manager():
    """Mock AreaManager with configurable presence detection config."""
    manager = MagicMock()
    manager._get_presence_detection_config = MagicMock(
        return_value={
            "motion": True,
            "presence": True,
            "occupancy": True,
            "media_playing": True,
        }
    )
    return manager


@pytest.fixture
def condition_evaluator(mock_hass, mock_entity_resolver, mock_area_manager):
    """Create ConditionEvaluator with mocked dependencies."""
    return ConditionEvaluator(
        mock_hass,
        mock_entity_resolver,
        area_manager=mock_area_manager,
    )


class TestConditionFiltering:
    """Test condition filtering based on presence detection config."""

    @pytest.mark.asyncio
    async def test_motion_condition_evaluated_when_enabled(
        self, condition_evaluator, mock_area_manager
    ):
        """Test that motion conditions are evaluated when enabled."""
        mock_area_manager._get_presence_detection_config.return_value = {
            "motion": True,
            "presence": False,
            "occupancy": False,
            "media_playing": False,
        }

        conditions = [
            {
                "condition": "state",
                "entity_id": "binary_sensor.motion",
                "device_class": "motion",
                "state": "on",
            }
        ]

        result = await condition_evaluator.evaluate_conditions(
            conditions, "test_area", logic="or"
        )

        assert result is True

    @pytest.mark.asyncio
    async def test_motion_condition_skipped_when_disabled(
        self, condition_evaluator, mock_area_manager
    ):
        """Test that motion conditions are skipped when disabled."""
        mock_area_manager._get_presence_detection_config.return_value = {
            "motion": False,  # Motion disabled
            "presence": True,
            "occupancy": True,
            "media_playing": True,
        }

        conditions = [
            {
                "condition": "state",
                "entity_id": "binary_sensor.motion",
                "device_class": "motion",
                "state": "on",
            }
        ]

        result = await condition_evaluator.evaluate_conditions(
            conditions, "test_area", logic="or"
        )

        # Should return False because condition was skipped
        assert result is False

    @pytest.mark.asyncio
    async def test_or_condition_with_mixed_enabled_disabled(
        self, condition_evaluator, mock_area_manager
    ):
        """Test OR condition with some sensors enabled and others disabled."""
        mock_area_manager._get_presence_detection_config.return_value = {
            "motion": False,  # Motion disabled
            "presence": True,  # Presence enabled
            "occupancy": False,
            "media_playing": False,
        }

        conditions = [
            {
                "condition": "or",
                "conditions": [
                    {
                        "condition": "state",
                        "entity_id": "binary_sensor.motion",
                        "device_class": "motion",
                        "state": "on",
                    },
                    {
                        "condition": "state",
                        "entity_id": "binary_sensor.presence",
                        "device_class": "presence",
                        "state": "on",
                    },
                ],
            }
        ]

        result = await condition_evaluator.evaluate_conditions(
            conditions, "test_area", logic="and"
        )

        # Should return True because presence is enabled and active
        assert result is True

    @pytest.mark.asyncio
    async def test_media_player_condition_filtered(
        self, condition_evaluator, mock_area_manager
    ):
        """Test that media_player conditions are filtered correctly."""
        mock_area_manager._get_presence_detection_config.return_value = {
            "motion": True,
            "presence": True,
            "occupancy": True,
            "media_playing": False,  # Media disabled
        }

        conditions = [
            {
                "condition": "state",
                "entity_id": "media_player.tv",
                "domain": "media_player",
                "state": "playing",
            }
        ]

        result = await condition_evaluator.evaluate_conditions(
            conditions, "test_area", logic="or"
        )

        # Should return False because media_player is disabled
        assert result is False

    @pytest.mark.asyncio
    async def test_non_presence_conditions_not_filtered(
        self, condition_evaluator, mock_area_manager, mock_hass
    ):
        """Test that non-presence conditions are never filtered."""
        mock_area_manager._get_presence_detection_config.return_value = {
            "motion": False,
            "presence": False,
            "occupancy": False,
            "media_playing": False,
        }

        # Test with a temperature condition (not presence-related)
        conditions = [
            {
                "condition": "numeric_state",
                "entity_id": "sensor.temperature",
                "above": 20,
            }
        ]

        # Mock the temperature sensor with proper state
        temp_sensor = MagicMock()
        temp_sensor.state = "25"
        mock_hass.states.get = MagicMock(return_value=temp_sensor)

        result = await condition_evaluator.evaluate_conditions(
            conditions, "test_area", logic="and"
        )

        # Should be evaluated normally, not filtered
        assert result is True

    @pytest.mark.asyncio
    async def test_all_conditions_skipped_returns_false(
        self, condition_evaluator, mock_area_manager
    ):
        """Test that if all conditions are skipped, return False."""
        mock_area_manager._get_presence_detection_config.return_value = {
            "motion": False,
            "presence": False,
            "occupancy": False,
            "media_playing": False,
        }

        conditions = [
            {
                "condition": "state",
                "entity_id": "binary_sensor.motion",
                "device_class": "motion",
                "state": "on",
            },
            {
                "condition": "state",
                "entity_id": "binary_sensor.presence",
                "device_class": "presence",
                "state": "on",
            },
        ]

        result = await condition_evaluator.evaluate_conditions(
            conditions, "test_area", logic="or"
        )

        # All conditions skipped, should return False
        assert result is False

    @pytest.mark.asyncio
    async def test_domain_extracted_from_entity_id(
        self, condition_evaluator, mock_area_manager
    ):
        """Test that domain is correctly extracted from entity_id."""
        mock_area_manager._get_presence_detection_config.return_value = {
            "motion": False,  # Motion disabled
            "presence": True,
            "occupancy": True,
            "media_playing": True,
        }

        # Condition without explicit domain, should extract from entity_id
        conditions = [
            {
                "condition": "state",
                "entity_id": "binary_sensor.motion",  # Domain extracted from here
                "device_class": "motion",
                "state": "on",
            }
        ]

        result = await condition_evaluator.evaluate_conditions(
            conditions, "test_area", logic="or"
        )

        # Should be skipped because motion is disabled
        assert result is False
