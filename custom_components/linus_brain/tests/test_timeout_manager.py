"""Tests for TimeoutManager utility."""

import asyncio
import logging
from unittest.mock import AsyncMock, MagicMock

import pytest

from ..utils.timeout_manager import TimeoutManager


class TestTimeoutManager:
    """Test the TimeoutManager utility class."""

    @pytest.fixture
    def mock_logger(self):
        """Create a mock logger."""
        return MagicMock(spec=logging.Logger)

    @pytest.fixture
    def manager(self, mock_logger):
        """Create a TimeoutManager instance."""
        return TimeoutManager(logger=mock_logger, logger_prefix="[TEST]")

    @pytest.mark.asyncio
    async def test_schedule_executes_after_delay(self, manager):
        """Test that scheduled callback executes after delay."""
        callback = AsyncMock()

        manager.schedule(key="test_key", delay=0.1, callback=callback, kwarg1="value2")

        # Wait for task to complete
        await asyncio.sleep(0.15)

        # Verify callback was called with correct arguments
        callback.assert_called_once_with(kwarg1="value2")

    @pytest.mark.asyncio
    async def test_schedule_cancels_existing_task(self, manager):
        """Test that scheduling with same key cancels previous task."""
        callback1 = AsyncMock()
        callback2 = AsyncMock()

        # Schedule first task
        task1 = manager.schedule(key="test_key", delay=0.2, callback=callback1)

        # Wait a bit
        await asyncio.sleep(0.05)

        # Schedule second task with same key
        manager.schedule(key="test_key", delay=0.1, callback=callback2)

        # Wait for second task to complete
        await asyncio.sleep(0.15)

        # First task should be cancelled
        assert task1.cancelled()
        callback1.assert_not_called()

        # Second task should execute
        callback2.assert_called_once()

    @pytest.mark.asyncio
    async def test_cancel_specific_task(self, manager):
        """Test cancelling a specific task."""
        callback = AsyncMock()

        manager.schedule(key="test_key", delay=0.2, callback=callback)

        # Cancel before execution
        result = manager.cancel("test_key")

        assert result is True

        # Wait to ensure it doesn't execute
        await asyncio.sleep(0.25)

        callback.assert_not_called()

    @pytest.mark.asyncio
    async def test_cancel_nonexistent_task(self, manager):
        """Test cancelling a task that doesn't exist."""
        result = manager.cancel("nonexistent_key")
        assert result is False

    @pytest.mark.asyncio
    async def test_cancel_all_tasks(self, manager):
        """Test cancelling all pending tasks."""
        callback1 = AsyncMock()
        callback2 = AsyncMock()
        callback3 = AsyncMock()

        # Schedule multiple tasks
        manager.schedule(key="task1", delay=0.2, callback=callback1)
        manager.schedule(key="task2", delay=0.2, callback=callback2)
        manager.schedule(key="task3", delay=0.2, callback=callback3)

        # Cancel all
        cancelled_count = manager.cancel_all()

        assert cancelled_count == 3

        # Wait to ensure none execute
        await asyncio.sleep(0.25)

        callback1.assert_not_called()
        callback2.assert_not_called()
        callback3.assert_not_called()

    @pytest.mark.asyncio
    async def test_has_task(self, manager):
        """Test checking if a task exists."""
        callback = AsyncMock()

        # No task initially
        assert manager.has_task("test_key") is False

        # Schedule task
        manager.schedule(key="test_key", delay=0.2, callback=callback)

        # Task should exist
        assert manager.has_task("test_key") is True

        # Wait for completion
        await asyncio.sleep(0.25)

        # Task should be cleaned up
        assert manager.has_task("test_key") is False

    @pytest.mark.asyncio
    async def test_get_task_count(self, manager):
        """Test getting pending task count."""
        callback = AsyncMock()

        assert manager.get_task_count() == 0

        # Schedule multiple tasks
        manager.schedule(key="task1", delay=0.2, callback=callback)
        manager.schedule(key="task2", delay=0.2, callback=callback)

        assert manager.get_task_count() == 2

        # Cancel one
        manager.cancel("task1")

        # Wait for cancellation to process
        await asyncio.sleep(0.01)

        # One task remaining (cancelled tasks might still be in dict briefly)
        assert manager.get_task_count() <= 1

        # Wait for all to complete
        await asyncio.sleep(0.25)

        assert manager.get_task_count() == 0

    @pytest.mark.asyncio
    async def test_get_all_keys(self, manager):
        """Test getting all task keys."""
        callback = AsyncMock()

        assert manager.get_all_keys() == set()

        # Schedule tasks
        manager.schedule(key="task1", delay=0.1, callback=callback)
        manager.schedule(key="task2", delay=0.1, callback=callback)

        keys = manager.get_all_keys()
        assert keys == {"task1", "task2"}

    @pytest.mark.asyncio
    async def test_exception_handling(self, manager, mock_logger):
        """Test that exceptions in callbacks are logged."""

        async def failing_callback():
            raise ValueError("Test error")

        manager.schedule(key="test_key", delay=0.1, callback=failing_callback)

        # Wait for task to complete
        await asyncio.sleep(0.15)

        # Verify error was logged
        mock_logger.error.assert_called_once()
        error_msg = mock_logger.error.call_args[0][0]
        assert "Error executing callback" in error_msg

    @pytest.mark.asyncio
    async def test_task_cleanup_after_completion(self, manager):
        """Test that tasks are cleaned up after completion."""
        callback = AsyncMock()

        manager.schedule(key="test_key", delay=0.1, callback=callback)

        # Task should exist initially
        assert "test_key" in manager.get_all_keys()

        # Wait for completion
        await asyncio.sleep(0.15)

        # Task should be cleaned up
        assert "test_key" not in manager.get_all_keys()

    @pytest.mark.asyncio
    async def test_task_cleanup_after_cancellation(self, manager):
        """Test that cancelled tasks don't execute their callbacks."""
        callback = AsyncMock()

        manager.schedule(key="test_key", delay=0.1, callback=callback)

        # Cancel task immediately
        result = manager.cancel("test_key")
        assert result is True

        # Wait to ensure callback doesn't execute
        await asyncio.sleep(0.2)

        # Callback should not have been called
        callback.assert_not_called()

    @pytest.mark.asyncio
    async def test_multiple_rapid_reschedules(self, manager):
        """Test multiple rapid reschedules of the same key."""
        execution_count = 0

        async def counting_callback():
            nonlocal execution_count
            execution_count += 1

        # Rapidly schedule same key multiple times
        # The delay needs to be longer than total schedule time (10 * 0.01 = 0.1s)
        for i in range(10):
            manager.schedule(
                key="test_key",
                delay=0.5,  # Long enough that all but last get cancelled
                callback=counting_callback,
            )
            await asyncio.sleep(0.01)  # Small delay between schedules

        # Wait for final task to complete (0.1s schedule time + 0.5s delay + buffer)
        await asyncio.sleep(0.7)

        # Only the last scheduled task should execute
        assert execution_count == 1

    @pytest.mark.asyncio
    async def test_logger_prefix_in_logs(self, manager, mock_logger):
        """Test that logger prefix appears in log messages."""
        callback = AsyncMock()

        manager.schedule(key="test_key", delay=0.1, callback=callback)

        # Check debug logs contain prefix
        debug_calls = mock_logger.debug.call_args_list
        assert any("[TEST]" in str(call) for call in debug_calls)

    @pytest.mark.asyncio
    async def test_default_logger(self):
        """Test that TimeoutManager works with default logger."""
        # Create manager without custom logger
        manager = TimeoutManager()
        callback = AsyncMock()

        # Should not raise exception
        manager.schedule(key="test_key", delay=0.1, callback=callback)
        await asyncio.sleep(0.15)

        callback.assert_called_once()

    @pytest.mark.asyncio
    async def test_concurrent_different_keys(self, manager):
        """Test that multiple tasks with different keys run concurrently."""
        execution_times = {}

        async def timed_callback(task_key: str):
            execution_times[task_key] = asyncio.get_event_loop().time()

        asyncio.get_event_loop().time()

        # Schedule multiple tasks with different keys at same time
        manager.schedule(
            key="task1", delay=0.1, callback=timed_callback, task_key="task1"
        )
        manager.schedule(
            key="task2", delay=0.1, callback=timed_callback, task_key="task2"
        )
        manager.schedule(
            key="task3", delay=0.1, callback=timed_callback, task_key="task3"
        )

        # Wait for all to complete
        await asyncio.sleep(0.15)

        # All should have executed
        assert len(execution_times) == 3

        # All should have executed around the same time (within 0.05s of each other)
        times = list(execution_times.values())
        assert max(times) - min(times) < 0.05
