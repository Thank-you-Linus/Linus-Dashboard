"""
State validator utility.

Provides functions to validate Home Assistant entity states.
"""

from typing import TypeGuard

from homeassistant.core import State

# Invalid entity states that should be ignored
INVALID_STATES = {"unavailable", "unknown", "undefined", "none"}


def is_state_valid(state: State | None) -> TypeGuard[State]:
    """
    Check if an entity state is valid and usable.

    Invalid states (unavailable, unknown, undefined, none) should be
    ignored in presence detection and condition evaluation.

    This function acts as a type guard, narrowing State | None to State.

    Args:
        state: Home Assistant state object

    Returns:
        True if state is valid and usable, False if invalid or None
    """
    if state is None:
        return False

    # Check if state value is one of the invalid states
    if state.state.lower() in INVALID_STATES:
        return False

    return True
