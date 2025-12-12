"""Tests for invalid state handling."""

from homeassistant.core import State

from custom_components.linus_brain.utils import INVALID_STATES, is_state_valid


def test_is_state_valid_with_none():
    """Test is_state_valid returns False for None."""
    assert is_state_valid(None) is False


def test_is_state_valid_with_unavailable():
    """Test is_state_valid returns False for unavailable state."""
    state = State("binary_sensor.motion", "unavailable")
    assert is_state_valid(state) is False


def test_is_state_valid_with_unknown():
    """Test is_state_valid returns False for unknown state."""
    state = State("binary_sensor.motion", "unknown")
    assert is_state_valid(state) is False


def test_is_state_valid_with_undefined():
    """Test is_state_valid returns False for undefined state."""
    state = State("binary_sensor.motion", "undefined")
    assert is_state_valid(state) is False


def test_is_state_valid_with_none_string():
    """Test is_state_valid returns False for 'none' state."""
    state = State("binary_sensor.motion", "none")
    assert is_state_valid(state) is False


def test_is_state_valid_with_valid_on():
    """Test is_state_valid returns True for valid 'on' state."""
    state = State("binary_sensor.motion", "on")
    assert is_state_valid(state) is True


def test_is_state_valid_with_valid_off():
    """Test is_state_valid returns True for valid 'off' state."""
    state = State("binary_sensor.motion", "off")
    assert is_state_valid(state) is True


def test_is_state_valid_with_valid_playing():
    """Test is_state_valid returns True for valid 'playing' state."""
    state = State("media_player.tv", "playing")
    assert is_state_valid(state) is True


def test_is_state_valid_case_insensitive():
    """Test is_state_valid is case insensitive for invalid states."""
    assert is_state_valid(State("sensor.test", "UNAVAILABLE")) is False
    assert is_state_valid(State("sensor.test", "Unknown")) is False
    assert is_state_valid(State("sensor.test", "UNDEFINED")) is False


def test_invalid_states_constant():
    """Test INVALID_STATES constant contains expected values."""
    assert "unavailable" in INVALID_STATES
    assert "unknown" in INVALID_STATES
    assert "undefined" in INVALID_STATES
    assert "none" in INVALID_STATES
    assert len(INVALID_STATES) == 4
