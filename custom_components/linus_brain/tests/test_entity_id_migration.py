"""
Test entity ID migration from localized names to English.

This test verifies that the automatic migration function correctly renames
entities from localized (e.g., French) entity_ids to English.
"""

from unittest.mock import MagicMock, patch

import pytest


# Mock entity entry for testing
class MockEntityEntry:
    """Mock entity registry entry."""

    def __init__(self, entity_id, unique_id, translation_key):
        self.entity_id = entity_id
        self.unique_id = unique_id
        self.translation_key = translation_key


@pytest.fixture
def mock_entity_registry():
    """Create a mock entity registry."""
    registry = MagicMock()

    # Create mock entities with French entity_ids
    mock_entities = [
        # Sensors with French entity_ids
        MockEntityEntry(
            "sensor.linus_brain_derniere_synchro", "linus_brain_last_sync", "last_sync"
        ),
        MockEntityEntry(
            "sensor.linus_brain_zones_surveillees",
            "linus_brain_monitored_areas",
            "monitored_areas",
        ),
        MockEntityEntry("sensor.linus_brain_erreurs", "linus_brain_errors", "errors"),
        MockEntityEntry(
            "sensor.linus_brain_etat_cloud", "linus_brain_cloud_health", "cloud_health"
        ),
        MockEntityEntry(
            "sensor.linus_brain_moteur_de_regles",
            "linus_brain_rule_engine",
            "rule_engine",
        ),
        MockEntityEntry(
            "sensor.linus_brain_activites", "linus_brain_activities", "activities"
        ),
        # Per-area activity sensor with French entity_id
        MockEntityEntry(
            "sensor.linus_brain_activite_salon",
            "linus_brain_activity_salon",
            "activity",
        ),
        # Per-app sensor with French entity_id
        MockEntityEntry(
            "sensor.linus_brain_app_lumiere_automatique",
            "linus_brain_app_automatic_lighting",
            "app",
        ),
        # Button with French entity_id
        MockEntityEntry(
            "button.linus_brain_synchroniser_maintenant", "linus_brain_sync", "sync"
        ),
        # Switch with French entity_id
        MockEntityEntry(
            "switch.linus_brain_feature_lumiere_automatique_salon",
            "linus_brain_feature_automatic_lighting_salon",
            "feature_automatic_lighting",
        ),
    ]

    # Mock the async_entries_for_config_entry to return our mock entities
    registry.async_entries_for_config_entry = MagicMock(return_value=mock_entities)

    # Mock async_get to check if target entity_id exists (always return None for testing)
    registry.async_get = MagicMock(return_value=None)

    # Track migrations
    registry.migrations = []

    def mock_update_entity(entity_id, new_entity_id=None):
        if new_entity_id:
            registry.migrations.append({"from": entity_id, "to": new_entity_id})

    registry.async_update_entity = MagicMock(side_effect=mock_update_entity)

    return registry


def test_migration_detection():
    """Test that migration function detects entities needing migration."""
    from .. import async_migrate_entity_ids

    # This test just verifies the function exists and can be imported
    assert async_migrate_entity_ids is not None


@pytest.mark.asyncio
async def test_migration_renames_french_entities(hass, mock_entity_registry):
    """Test that French entity_ids are renamed to English."""
    from .. import async_migrate_entity_ids

    # Create a mock config entry
    mock_entry = MagicMock()
    mock_entry.entry_id = "test_entry"

    # Get the mock entities list
    mock_entities = mock_entity_registry.async_entries_for_config_entry(
        mock_entry.entry_id
    )

    # Patch both er.async_get and er.async_entries_for_config_entry
    with patch("linus_brain.er.async_get", return_value=mock_entity_registry), patch(
        "linus_brain.er.async_entries_for_config_entry", return_value=mock_entities
    ):
        await async_migrate_entity_ids(hass, mock_entry)

    # Verify migrations were performed
    migrations = mock_entity_registry.migrations

    # Check that expected migrations occurred
    expected_migrations = {
        "sensor.linus_brain_derniere_synchro": "sensor.linus_brain_last_sync",
        "sensor.linus_brain_zones_surveillees": "sensor.linus_brain_monitored_areas",
        "sensor.linus_brain_erreurs": "sensor.linus_brain_errors",
        "sensor.linus_brain_etat_cloud": "sensor.linus_brain_cloud_health",
        "sensor.linus_brain_moteur_de_regles": "sensor.linus_brain_rule_engine",
        "sensor.linus_brain_activites": "sensor.linus_brain_activities",
        "sensor.linus_brain_activite_salon": "sensor.linus_brain_activity_salon",
        "sensor.linus_brain_app_lumiere_automatique": "sensor.linus_brain_app_automatic_lighting",
        "button.linus_brain_synchroniser_maintenant": "button.linus_brain_sync",
        "switch.linus_brain_feature_lumiere_automatique_salon": "switch.linus_brain_feature_automatic_lighting_salon",
    }

    # Verify each expected migration occurred
    for migration in migrations:
        from_id = migration["from"]
        to_id = migration["to"]

        assert from_id in expected_migrations, f"Unexpected migration from {from_id}"
        assert (
            expected_migrations[from_id] == to_id
        ), f"Expected {from_id} → {expected_migrations[from_id]}, got {to_id}"

    # Verify we got all expected migrations
    assert len(migrations) == len(
        expected_migrations
    ), f"Expected {len(expected_migrations)} migrations, got {len(migrations)}"


@pytest.mark.asyncio
async def test_migration_skips_english_entities(hass):
    """Test that entities with English entity_ids are not migrated."""
    from .. import async_migrate_entity_ids

    # Create mock registry with English entity_ids
    registry = MagicMock()
    english_entities = [
        MockEntityEntry(
            "sensor.linus_brain_last_sync", "linus_brain_last_sync", "last_sync"
        ),
        MockEntityEntry(
            "sensor.linus_brain_monitored_areas",
            "linus_brain_monitored_areas",
            "monitored_areas",
        ),
    ]

    registry.async_entries_for_config_entry = MagicMock(return_value=english_entities)
    registry.migrations = []
    registry.async_update_entity = MagicMock()

    mock_entry = MagicMock()
    mock_entry.entry_id = "test_entry"

    with patch("linus_brain.er.async_get", return_value=registry):
        await async_migrate_entity_ids(hass, mock_entry)

    # Verify no migrations occurred (entities already have English IDs)
    assert len(registry.migrations) == 0
    assert registry.async_update_entity.call_count == 0


def test_suggested_object_id_in_sensors():
    """Test that all sensor classes define suggested_object_id."""
    from ..sensor import (
        LinusBrainErrorsSensor,
        LinusBrainRoomsSensor,
        LinusBrainSyncSensor,
    )

    # Mock dependencies with required attributes
    mock_coordinator = MagicMock()
    mock_coordinator.data = {}
    mock_coordinator.sync_count = 0
    mock_coordinator.error_count = 0
    mock_coordinator.supabase_url = "https://test.supabase.co"
    mock_coordinator.last_update_success = True

    mock_entry = MagicMock()
    mock_entry.entry_id = "test"

    # Test sync sensor
    sensor = LinusBrainSyncSensor(mock_coordinator, mock_entry)
    assert hasattr(sensor, "_attr_suggested_object_id")
    assert sensor._attr_suggested_object_id == "linus_brain_last_sync"

    # Test rooms sensor
    sensor = LinusBrainRoomsSensor(mock_coordinator, mock_entry)
    assert hasattr(sensor, "_attr_suggested_object_id")
    assert sensor._attr_suggested_object_id == "linus_brain_monitored_areas"

    # Test errors sensor
    sensor = LinusBrainErrorsSensor(mock_coordinator, mock_entry)
    assert hasattr(sensor, "_attr_suggested_object_id")
    assert sensor._attr_suggested_object_id == "linus_brain_errors"


def test_suggested_object_id_in_switch():
    """Test that switch class defines suggested_object_id."""
    from ..switch import LinusBrainFeatureSwitch

    mock_hass = MagicMock()
    mock_entry = MagicMock()
    mock_entry.entry_id = "test"

    # Mock area registry
    with patch("linus_brain.switch.ar.async_get") as mock_ar:
        mock_registry = MagicMock()
        mock_area = MagicMock()
        mock_area.name = "Salon"
        mock_registry.async_get_area = MagicMock(return_value=mock_area)
        mock_ar.return_value = mock_registry

        feature_def = {"name": "Automatic Lighting"}
        switch = LinusBrainFeatureSwitch(
            mock_hass, mock_entry, "salon", "automatic_lighting", feature_def
        )

        assert hasattr(switch, "_attr_suggested_object_id")
        assert (
            switch._attr_suggested_object_id
            == "linus_brain_feature_automatic_lighting_salon"
        )


def test_suggested_object_id_in_button():
    """Test that button class defines suggested_object_id."""
    from ..button import LinusBrainSyncButton

    mock_coordinator = MagicMock()
    mock_insights_manager = MagicMock()
    mock_entry = MagicMock()
    mock_entry.entry_id = "test"

    button = LinusBrainSyncButton(mock_coordinator, mock_insights_manager, mock_entry)

    assert hasattr(button, "_attr_suggested_object_id")
    assert button._attr_suggested_object_id == "linus_brain_sync"
