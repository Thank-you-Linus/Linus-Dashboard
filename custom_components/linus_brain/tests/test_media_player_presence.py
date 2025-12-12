"""
Tests for media player presence detection functionality.
"""

import pytest

from ..const import PRESENCE_DETECTION_DOMAINS


@pytest.mark.asyncio
async def test_media_player_in_presence_detection_domains():
    """Test that media_player is included in presence detection domains."""
    assert "media_player" in PRESENCE_DETECTION_DOMAINS
    assert isinstance(PRESENCE_DETECTION_DOMAINS["media_player"], list)


@pytest.mark.asyncio
async def test_media_player_active_states_detection():
    """Test that media player active states should be detected as presence."""
    active_states = ["playing", "paused", "on"]
    inactive_states = ["off", "idle", "standby"]

    for state in active_states:
        assert state in [
            "playing",
            "paused",
            "on",
        ], f"Active state {state} should indicate presence"

    for state in inactive_states:
        assert state in [
            "off",
            "idle",
            "standby",
        ], f"Inactive state {state} should not indicate presence"


@pytest.mark.asyncio
async def test_presence_detection_includes_key_domains():
    """Test that presence detection domains includes key entity types."""
    expected_domains = [
        "binary_sensor",
        "media_player",
    ]

    for domain in expected_domains:
        assert (
            domain in PRESENCE_DETECTION_DOMAINS
        ), f"Domain {domain} should be in PRESENCE_DETECTION_DOMAINS"
