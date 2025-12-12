"""
Timeout Manager for Linus Brain

Reusable utility for managing asyncio tasks with timeout/debounce patterns.
Prevents common issues like race conditions and task leaks.

Key features:
- Safe task cancellation and replacement
- Automatic cleanup on completion
- Exception handling with logging
- Support for both timeout and debounce patterns
"""

import asyncio
import logging
from typing import Any, Awaitable, Callable

_LOGGER = logging.getLogger(__name__)


class TimeoutManager:
    """
    Manages asyncio tasks with automatic cancellation and cleanup.

    This utility prevents common async task management issues:
    - Race conditions from overlapping tasks
    - Memory leaks from uncancelled tasks
    - Exception propagation from fire-and-forget tasks

    Usage:
        manager = TimeoutManager(logger_prefix="[TIMEOUT]")

        # Schedule a timeout
        await manager.schedule(
            key="living_room_movement",
            delay=60.0,
            callback=self._handle_timeout,
            area_id="living_room",
            activity="movement"
        )

        # Cancel a specific timeout
        manager.cancel("living_room_movement")

        # Cancel all timeouts
        manager.cancel_all()
    """

    def __init__(
        self, logger: logging.Logger | None = None, logger_prefix: str = "[TASK]"
    ) -> None:
        """
        Initialize the timeout manager.

        Args:
            logger: Logger instance to use (defaults to module logger)
            logger_prefix: Prefix for log messages (e.g., "[TIMEOUT]", "[DEBOUNCE]")
        """
        self._logger = logger or _LOGGER
        self._logger_prefix = logger_prefix
        self._tasks: dict[str, asyncio.Task] = {}

    def schedule(
        self,
        key: str,
        delay: float,
        callback: Callable[..., Awaitable[Any]],
        *args: Any,
        **kwargs: Any,
    ) -> asyncio.Task:
        """
        Schedule a delayed callback.

        If a task with the same key already exists, it will be cancelled
        and replaced with the new task.

        Args:
            key: Unique identifier for this task
            delay: Delay in seconds before executing callback
            callback: Async function to call after delay
            *args: Positional arguments for callback
            **kwargs: Keyword arguments for callback

        Returns:
            The created asyncio.Task
        """
        # Cancel existing task if present
        if key in self._tasks:
            old_task = self._tasks[key]
            if not old_task.done():
                old_task.cancel()
                self._logger.debug(
                    f"{self._logger_prefix} {key}: Cancelled previous task, rescheduling"
                )

        # Create new task
        task = asyncio.create_task(
            self._execute_delayed(key, delay, callback, *args, **kwargs)
        )
        self._tasks[key] = task

        self._logger.debug(
            f"{self._logger_prefix} {key}: Scheduled task with {delay}s delay"
        )

        return task

    async def _execute_delayed(
        self,
        key: str,
        delay: float,
        callback: Callable[..., Awaitable[Any]],
        *args: Any,
        **kwargs: Any,
    ) -> None:
        """
        Internal method to execute a delayed callback.

        Args:
            key: Task identifier
            delay: Delay in seconds
            callback: Async function to call
            *args: Positional arguments for callback
            **kwargs: Keyword arguments for callback
        """
        # Get current task for identity check during cleanup
        current_task = asyncio.current_task()

        try:
            await asyncio.sleep(delay)

            self._logger.debug(
                f"{self._logger_prefix} {key}: Executing callback after {delay}s delay"
            )

            await callback(*args, **kwargs)

        except asyncio.CancelledError:
            self._logger.debug(
                f"{self._logger_prefix} {key}: Task cancelled before execution"
            )
            raise  # Re-raise to mark task as cancelled

        except Exception as err:
            self._logger.error(
                f"{self._logger_prefix} {key}: Error executing callback: {err}",
                exc_info=True,
            )

        finally:
            # Clean up task reference only if this is still the current task
            # (prevents cleaning up a replacement task that was scheduled after this one)
            if key in self._tasks and self._tasks[key] is current_task:
                del self._tasks[key]
                self._logger.debug(
                    f"{self._logger_prefix} {key}: Task completed, cleaned up"
                )

    def cancel(self, key: str) -> bool:
        """
        Cancel a specific task.

        Args:
            key: Task identifier to cancel

        Returns:
            True if task was cancelled, False if not found or already done
        """
        if key not in self._tasks:
            return False

        task = self._tasks[key]
        if task.done():
            # Clean up completed task
            del self._tasks[key]
            return False

        task.cancel()
        self._logger.debug(f"{self._logger_prefix} {key}: Cancelled task")

        # Task will clean itself up in finally block
        return True

    def cancel_all(self) -> int:
        """
        Cancel all pending tasks.

        Returns:
            Number of tasks cancelled
        """
        cancelled_count = 0

        for key, task in list(self._tasks.items()):
            if not task.done():
                task.cancel()
                cancelled_count += 1

        if cancelled_count > 0:
            self._logger.debug(
                f"{self._logger_prefix} Cancelled {cancelled_count} pending tasks"
            )

        self._tasks.clear()
        return cancelled_count

    def has_task(self, key: str) -> bool:
        """
        Check if a task exists and is pending.

        Args:
            key: Task identifier

        Returns:
            True if task exists and is not done
        """
        return key in self._tasks and not self._tasks[key].done()

    def get_task_count(self) -> int:
        """
        Get count of pending tasks.

        Returns:
            Number of tasks that are not done
        """
        return sum(1 for task in self._tasks.values() if not task.done())

    def get_all_keys(self) -> set[str]:
        """
        Get all task keys.

        Returns:
            Set of all task identifiers (including completed tasks)
        """
        return set(self._tasks.keys())
