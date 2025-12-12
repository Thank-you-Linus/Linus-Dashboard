"""
Unit tests for ConditionEvaluator.

Tests condition evaluation including nested AND/OR logic.
"""

from unittest.mock import MagicMock, patch

import pytest

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
def condition_evaluator(mock_hass, mock_entity_resolver):
    """Create ConditionEvaluator instance."""
    return ConditionEvaluator(mock_hass, mock_entity_resolver)


class TestAndConditionEvaluation:
    """Test AND condition evaluation."""

    @pytest.mark.asyncio
    async def test_and_condition_all_true(self, condition_evaluator, mock_hass):
        """Test AND condition with all conditions true."""
        # Mock entity states
        mock_state_1 = MagicMock()
        mock_state_1.state = "on"
        mock_state_2 = MagicMock()
        mock_state_2.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        condition = {
            "condition": "and",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",
                },
                {
                    "condition": "state",
                    "entity_id": "light.kitchen",
                    "state": "on",
                },
            ],
        }

        result = await condition_evaluator._evaluate_and_condition(condition)

        assert result is True

    @pytest.mark.asyncio
    async def test_and_condition_one_false(self, condition_evaluator, mock_hass):
        """Test AND condition with one condition false."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "on"
        mock_state_2 = MagicMock()
        mock_state_2.state = "off"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        condition = {
            "condition": "and",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",
                },
                {
                    "condition": "state",
                    "entity_id": "light.kitchen",
                    "state": "on",  # Will be false (actual state is "off")
                },
            ],
        }

        result = await condition_evaluator._evaluate_and_condition(condition)

        assert result is False

    @pytest.mark.asyncio
    async def test_and_condition_all_false(self, condition_evaluator, mock_hass):
        """Test AND condition with all conditions false."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "off"
        mock_state_2 = MagicMock()
        mock_state_2.state = "off"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        condition = {
            "condition": "and",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",
                },
                {
                    "condition": "state",
                    "entity_id": "light.kitchen",
                    "state": "on",
                },
            ],
        }

        result = await condition_evaluator._evaluate_and_condition(condition)

        assert result is False

    @pytest.mark.asyncio
    async def test_and_condition_empty(self, condition_evaluator):
        """Test AND condition with empty conditions list."""
        condition = {"condition": "and", "conditions": []}

        result = await condition_evaluator._evaluate_and_condition(condition)

        assert result is True  # Empty AND returns True

    @pytest.mark.asyncio
    async def test_and_condition_nested_or(self, condition_evaluator, mock_hass):
        """Test nested AND with OR inside."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "on"
        mock_state_2 = MagicMock()
        mock_state_2.state = "off"
        mock_state_3 = MagicMock()
        mock_state_3.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
            "light.bedroom": mock_state_3,
        }[eid]

        condition = {
            "condition": "and",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",
                },
                {
                    "condition": "or",
                    "conditions": [
                        {
                            "condition": "state",
                            "entity_id": "light.kitchen",
                            "state": "on",  # False
                        },
                        {
                            "condition": "state",
                            "entity_id": "light.bedroom",
                            "state": "on",  # True
                        },
                    ],
                },
            ],
        }

        result = await condition_evaluator._evaluate_and_condition(condition)

        assert result is True  # motion=on AND (kitchen=off OR bedroom=on) = True

    @pytest.mark.asyncio
    async def test_and_condition_short_circuit(self, condition_evaluator, mock_hass):
        """Test AND condition short-circuits on first false."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "off"
        # Second entity should never be checked due to short-circuit
        mock_hass.states.get.return_value = mock_state_1

        condition = {
            "condition": "and",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",  # False - should short-circuit here
                },
                {
                    "condition": "state",
                    "entity_id": "nonexistent.entity",  # Would fail if evaluated
                    "state": "on",
                },
            ],
        }

        result = await condition_evaluator._evaluate_and_condition(condition)

        assert result is False
        # Verify only first entity was checked
        mock_hass.states.get.assert_called_once_with("binary_sensor.motion")


class TestOrConditionEvaluation:
    """Test OR condition evaluation."""

    @pytest.mark.asyncio
    async def test_or_condition_one_true(self, condition_evaluator, mock_hass):
        """Test OR condition with one condition true."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "off"
        mock_state_2 = MagicMock()
        mock_state_2.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        condition = {
            "condition": "or",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",  # False
                },
                {
                    "condition": "state",
                    "entity_id": "light.kitchen",
                    "state": "on",  # True
                },
            ],
        }

        result = await condition_evaluator._evaluate_or_condition(condition)

        assert result is True

    @pytest.mark.asyncio
    async def test_or_condition_all_true(self, condition_evaluator, mock_hass):
        """Test OR condition with all conditions true."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "on"
        mock_state_2 = MagicMock()
        mock_state_2.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        condition = {
            "condition": "or",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",
                },
                {
                    "condition": "state",
                    "entity_id": "light.kitchen",
                    "state": "on",
                },
            ],
        }

        result = await condition_evaluator._evaluate_or_condition(condition)

        assert result is True

    @pytest.mark.asyncio
    async def test_or_condition_all_false(self, condition_evaluator, mock_hass):
        """Test OR condition with all conditions false."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "off"
        mock_state_2 = MagicMock()
        mock_state_2.state = "off"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        condition = {
            "condition": "or",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",  # False
                },
                {
                    "condition": "state",
                    "entity_id": "light.kitchen",
                    "state": "on",  # False
                },
            ],
        }

        result = await condition_evaluator._evaluate_or_condition(condition)

        assert result is False

    @pytest.mark.asyncio
    async def test_or_condition_empty(self, condition_evaluator):
        """Test OR condition with empty conditions list."""
        condition = {"condition": "or", "conditions": []}

        result = await condition_evaluator._evaluate_or_condition(condition)

        assert result is False  # Empty OR returns False

    @pytest.mark.asyncio
    async def test_or_condition_nested_and(self, condition_evaluator, mock_hass):
        """Test nested OR with AND inside."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "off"
        mock_state_2 = MagicMock()
        mock_state_2.state = "on"
        mock_state_3 = MagicMock()
        mock_state_3.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
            "light.bedroom": mock_state_3,
        }[eid]

        condition = {
            "condition": "or",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",  # False
                },
                {
                    "condition": "and",
                    "conditions": [
                        {
                            "condition": "state",
                            "entity_id": "light.kitchen",
                            "state": "on",  # True
                        },
                        {
                            "condition": "state",
                            "entity_id": "light.bedroom",
                            "state": "on",  # True
                        },
                    ],
                },
            ],
        }

        result = await condition_evaluator._evaluate_or_condition(condition)

        assert result is True  # motion=off OR (kitchen=on AND bedroom=on) = True

    @pytest.mark.asyncio
    async def test_or_condition_short_circuit(self, condition_evaluator, mock_hass):
        """Test OR condition short-circuits on first true."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "on"
        # Second entity should never be checked due to short-circuit
        mock_hass.states.get.return_value = mock_state_1

        condition = {
            "condition": "or",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",  # True - should short-circuit here
                },
                {
                    "condition": "state",
                    "entity_id": "nonexistent.entity",  # Would fail if evaluated
                    "state": "on",
                },
            ],
        }

        result = await condition_evaluator._evaluate_or_condition(condition)

        assert result is True
        # Verify only first entity was checked
        mock_hass.states.get.assert_called_once_with("binary_sensor.motion")


class TestNestedConditionIntegration:
    """Test integration with evaluate_conditions()."""

    @pytest.mark.asyncio
    async def test_evaluate_conditions_with_nested_and(
        self, condition_evaluator, mock_hass, mock_entity_resolver
    ):
        """Test evaluate_conditions with nested AND."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "on"
        mock_state_2 = MagicMock()
        mock_state_2.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        # Mock resolver to return conditions as-is (already resolved)
        mock_entity_resolver.resolve_nested_conditions = MagicMock(
            side_effect=lambda conds, area_id: conds
        )

        conditions = [
            {
                "condition": "and",
                "conditions": [
                    {
                        "condition": "state",
                        "entity_id": "binary_sensor.motion",
                        "state": "on",
                    },
                    {
                        "condition": "state",
                        "entity_id": "light.kitchen",
                        "state": "on",
                    },
                ],
            }
        ]

        result = await condition_evaluator.evaluate_conditions(
            conditions, "kitchen", logic="and"
        )

        assert result is True

    @pytest.mark.asyncio
    async def test_evaluate_conditions_with_nested_or(
        self, condition_evaluator, mock_hass, mock_entity_resolver
    ):
        """Test evaluate_conditions with nested OR."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "off"
        mock_state_2 = MagicMock()
        mock_state_2.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        mock_entity_resolver.resolve_nested_conditions = MagicMock(
            side_effect=lambda conds, area_id: conds
        )

        conditions = [
            {
                "condition": "or",
                "conditions": [
                    {
                        "condition": "state",
                        "entity_id": "binary_sensor.motion",
                        "state": "on",  # False
                    },
                    {
                        "condition": "state",
                        "entity_id": "light.kitchen",
                        "state": "on",  # True
                    },
                ],
            }
        ]

        result = await condition_evaluator.evaluate_conditions(
            conditions, "kitchen", logic="and"
        )

        assert result is True  # OR passed, so overall result is True

    @pytest.mark.asyncio
    async def test_evaluate_single_condition_with_and(
        self, condition_evaluator, mock_hass
    ):
        """Test _evaluate_single_condition routes AND correctly."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "on"
        mock_state_2 = MagicMock()
        mock_state_2.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        condition = {
            "condition": "and",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",
                },
                {
                    "condition": "state",
                    "entity_id": "light.kitchen",
                    "state": "on",
                },
            ],
        }

        result = await condition_evaluator._evaluate_single_condition(condition)

        assert result is True

    @pytest.mark.asyncio
    async def test_evaluate_single_condition_with_or(
        self, condition_evaluator, mock_hass
    ):
        """Test _evaluate_single_condition routes OR correctly."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "off"
        mock_state_2 = MagicMock()
        mock_state_2.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
        }[eid]

        condition = {
            "condition": "or",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",  # False
                },
                {
                    "condition": "state",
                    "entity_id": "light.kitchen",
                    "state": "on",  # True
                },
            ],
        }

        result = await condition_evaluator._evaluate_single_condition(condition)

        assert result is True

    @pytest.mark.asyncio
    async def test_deeply_nested_conditions(self, condition_evaluator, mock_hass):
        """Test deeply nested conditions (3 levels)."""
        mock_state_1 = MagicMock()
        mock_state_1.state = "on"
        mock_state_2 = MagicMock()
        mock_state_2.state = "off"
        mock_state_3 = MagicMock()
        mock_state_3.state = "on"
        mock_state_4 = MagicMock()
        mock_state_4.state = "on"
        mock_hass.states.get.side_effect = lambda eid: {
            "binary_sensor.motion": mock_state_1,
            "light.kitchen": mock_state_2,
            "light.bedroom": mock_state_3,
            "light.living_room": mock_state_4,
        }[eid]

        # AND → OR → AND structure
        condition = {
            "condition": "and",
            "conditions": [
                {
                    "condition": "state",
                    "entity_id": "binary_sensor.motion",
                    "state": "on",  # True
                },
                {
                    "condition": "or",
                    "conditions": [
                        {
                            "condition": "and",
                            "conditions": [
                                {
                                    "condition": "state",
                                    "entity_id": "light.kitchen",
                                    "state": "on",  # False
                                },
                                {
                                    "condition": "state",
                                    "entity_id": "light.bedroom",
                                    "state": "on",  # True
                                },
                            ],
                        },
                        {
                            "condition": "state",
                            "entity_id": "light.living_room",
                            "state": "on",  # True
                        },
                    ],
                },
            ],
        }

        result = await condition_evaluator._evaluate_single_condition(condition)

        # motion=on AND ((kitchen=off AND bedroom=on) OR living_room=on)
        # motion=on AND (False OR True) = True
        assert result is True
