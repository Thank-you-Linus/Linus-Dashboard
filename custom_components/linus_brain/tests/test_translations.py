"""
Tests for translation completeness and consistency.

This test suite ensures that all entities follow the translation requirements:
1. All entities must have translation_key set
2. All entities must have has_entity_name = True
3. All translation keys must exist in both en.json and fr.json
4. All units of measurement must be translated
5. All ENUM sensor states must be translated
"""

import json
from pathlib import Path
from typing import Any
from unittest.mock import MagicMock

import pytest
from homeassistant.core import HomeAssistant
from pytest_homeassistant_custom_component.common import MockConfigEntry

from .. import button, sensor, switch
from ..const import DOMAIN

# Path to translation files
TRANSLATIONS_DIR = Path(__file__).parent.parent / "translations"
EN_JSON = TRANSLATIONS_DIR / "en.json"
FR_JSON = TRANSLATIONS_DIR / "fr.json"


def load_translations(lang: str) -> dict[str, Any]:
    """Load translation file."""
    file_path = TRANSLATIONS_DIR / f"{lang}.json"
    with open(file_path) as f:
        return json.load(f)


@pytest.fixture
def en_translations() -> dict[str, Any]:
    """Load English translations."""
    return load_translations("en")


@pytest.fixture
def fr_translations() -> dict[str, Any]:
    """Load French translations."""
    return load_translations("fr")


class TestButtonTranslations:
    """Test button entity translations."""

    @pytest.mark.asyncio
    async def test_sync_button_has_translation_key(
        self, hass: HomeAssistant, mock_config_entry: MockConfigEntry
    ) -> None:
        """Test that sync button has translation_key set."""

        # Create coordinator mock
        class MockCoordinator:
            def __init__(self, hass_instance: HomeAssistant):
                self.hass = hass_instance

            async def async_config_entry_first_refresh(self):
                pass

            async def async_request_refresh(self):
                pass

        hass.data[DOMAIN] = {
            mock_config_entry.entry_id: {"coordinator": MockCoordinator(hass)}
        }

        entities = []

        def mock_add_entities(new_entities, update_before_add=False):
            entities.extend(new_entities)

        await button.async_setup_entry(hass, mock_config_entry, mock_add_entities)

        assert len(entities) == 1
        sync_button = entities[0]
        assert hasattr(sync_button, "_attr_translation_key")
        assert sync_button._attr_translation_key == "sync"
        assert hasattr(sync_button, "_attr_has_entity_name")
        assert sync_button._attr_has_entity_name is True

    def test_sync_button_translation_exists_in_both_languages(
        self, en_translations: dict, fr_translations: dict
    ) -> None:
        """Test that sync button translation exists in en.json and fr.json."""
        assert "entity" in en_translations
        assert "button" in en_translations["entity"]
        assert "sync" in en_translations["entity"]["button"]
        assert "name" in en_translations["entity"]["button"]["sync"]

        assert "entity" in fr_translations
        assert "button" in fr_translations["entity"]
        assert "sync" in fr_translations["entity"]["button"]
        assert "name" in fr_translations["entity"]["button"]["sync"]


class TestSensorTranslations:
    """Test sensor entity translations."""

    @pytest.mark.asyncio
    async def test_all_sensors_have_translation_key(
        self, hass: HomeAssistant, mock_config_entry: MockConfigEntry
    ) -> None:
        """Test that all sensors have translation_key set."""

        # Mock dependencies
        class MockCoordinator:
            def __init__(self, hass_instance: HomeAssistant):
                self.hass = hass_instance
                self.supabase_url = "https://test.supabase.co"
                self.error_count = 0
                self.sync_count = 1
                self.last_sync_success = True
                self.last_sync_time = None
                self.instance_id = "test_instance"

            class MockAppStorage:
                def get_apps(self):
                    return {}

                def get_activities(self):
                    return {}

                def get_sync_time(self):
                    return None

                def is_fallback_data(self):
                    return False

            app_storage = MockAppStorage()

            async def async_config_entry_first_refresh(self):
                pass

            @property
            def data(self):
                return {"total_areas": 0, "area_states": []}

        hass.data[DOMAIN] = {
            mock_config_entry.entry_id: {
                "coordinator": MockCoordinator(hass),
                "area_manager": None,
                "activity_tracker": None,
                "rule_engine": None,
            }
        }

        entities = []

        def mock_add_entities(new_entities, update_before_add=False):
            entities.extend(new_entities)

        await sensor.async_setup_entry(hass, mock_config_entry, mock_add_entities)

        # Check all sensors have translation_key and has_entity_name
        for entity in entities:
            assert hasattr(
                entity, "_attr_translation_key"
            ), f"Sensor {entity.__class__.__name__} missing translation_key"
            assert (
                entity._attr_translation_key is not None
            ), f"Sensor {entity.__class__.__name__} has None translation_key"
            assert hasattr(
                entity, "_attr_has_entity_name"
            ), f"Sensor {entity.__class__.__name__} missing has_entity_name"
            assert (
                entity._attr_has_entity_name is True
            ), f"Sensor {entity.__class__.__name__} has_entity_name = False"

    @pytest.mark.asyncio
    async def test_sensors_do_not_hardcode_unit_of_measurement(
        self, hass: HomeAssistant, mock_config_entry: MockConfigEntry
    ) -> None:
        """Test that sensors with units use translation files, not hardcoded values."""

        # Mock dependencies
        class MockCoordinator:
            def __init__(self, hass_instance: HomeAssistant):
                self.hass = hass_instance
                self.supabase_url = "https://test.supabase.co"
                self.error_count = 0
                self.sync_count = 1
                self.last_sync_success = True
                self.last_sync_time = None
                self.instance_id = "test_instance"

            class MockAppStorage:
                def get_apps(self):
                    return {}

                def get_activities(self):
                    return {}

                def get_sync_time(self):
                    return None

                def is_fallback_data(self):
                    return False

            app_storage = MockAppStorage()

            async def async_config_entry_first_refresh(self):
                pass

            @property
            def data(self):
                return {"total_areas": 0, "area_states": []}

        hass.data[DOMAIN] = {
            mock_config_entry.entry_id: {
                "coordinator": MockCoordinator(hass),
                "area_manager": None,
                "activity_tracker": None,
                "rule_engine": None,
            }
        }

        entities = []

        def mock_add_entities(new_entities, update_before_add=False):
            entities.extend(new_entities)

        await sensor.async_setup_entry(hass, mock_config_entry, mock_add_entities)

        # Sensors that should have translated units
        sensors_with_units = [
            "monitored_areas",
            "errors",
            "rule_engine",
            "activities",
        ]

        for entity in entities:
            if entity._attr_translation_key in sensors_with_units:
                # Should NOT have _attr_native_unit_of_measurement set
                assert (
                    not hasattr(entity, "_attr_native_unit_of_measurement")
                    or entity._attr_native_unit_of_measurement is None
                ), (
                    f"Sensor {entity._attr_translation_key} should not have "
                    f"hardcoded _attr_native_unit_of_measurement. Use translation files!"
                )

    def test_all_sensor_translations_exist_in_both_languages(
        self, en_translations: dict, fr_translations: dict
    ) -> None:
        """Test that all sensor translation keys exist in both en.json and fr.json."""
        # List of all translation keys that should exist
        required_sensor_keys = [
            "last_sync",
            "monitored_areas",
            "errors",
            "cloud_health",
            "rule_engine",
            "activities",
            "app",
            "activity",
        ]

        for key in required_sensor_keys:
            # Check English
            assert "entity" in en_translations
            assert "sensor" in en_translations["entity"]
            assert (
                key in en_translations["entity"]["sensor"]
            ), f"Sensor translation key '{key}' missing in en.json"
            assert (
                "name" in en_translations["entity"]["sensor"][key]
            ), f"Sensor translation key '{key}' missing 'name' in en.json"

            # Check French
            assert "entity" in fr_translations
            assert "sensor" in fr_translations["entity"]
            assert (
                key in fr_translations["entity"]["sensor"]
            ), f"Sensor translation key '{key}' missing in fr.json"
            assert (
                "name" in fr_translations["entity"]["sensor"][key]
            ), f"Sensor translation key '{key}' missing 'name' in fr.json"

    def test_sensor_units_of_measurement_translated(
        self, en_translations: dict, fr_translations: dict
    ) -> None:
        """Test that sensors with units have translated unit_of_measurement."""
        sensors_with_units = {
            "monitored_areas": {"en": "areas", "fr": "zones"},
            "errors": {"en": "errors", "fr": "erreurs"},
            "rule_engine": {"en": "triggers", "fr": "déclenchements"},
            "activities": {"en": "activities", "fr": "activités"},
        }

        for key, expected_units in sensors_with_units.items():
            # Check English
            assert (
                "unit_of_measurement" in en_translations["entity"]["sensor"][key]
            ), f"Sensor '{key}' missing unit_of_measurement in en.json"
            assert (
                en_translations["entity"]["sensor"][key]["unit_of_measurement"]
                == expected_units["en"]
            ), f"Sensor '{key}' has wrong English unit"

            # Check French
            assert (
                "unit_of_measurement" in fr_translations["entity"]["sensor"][key]
            ), f"Sensor '{key}' missing unit_of_measurement in fr.json"
            assert (
                fr_translations["entity"]["sensor"][key]["unit_of_measurement"]
                == expected_units["fr"]
            ), f"Sensor '{key}' has wrong French unit"

    def test_enum_sensor_states_translated(
        self, en_translations: dict, fr_translations: dict
    ) -> None:
        """Test that ENUM sensor states are translated."""
        # Activity sensor states
        activity_states = ["empty", "movement", "occupied", "inactive"]

        for state in activity_states:
            # Check English
            assert (
                "state" in en_translations["entity"]["sensor"]["activity"]
            ), "Activity sensor missing 'state' translations in en.json"
            assert (
                state in en_translations["entity"]["sensor"]["activity"]["state"]
            ), f"Activity state '{state}' missing in en.json"

            # Check French
            assert (
                "state" in fr_translations["entity"]["sensor"]["activity"]
            ), "Activity sensor missing 'state' translations in fr.json"
            assert (
                state in fr_translations["entity"]["sensor"]["activity"]["state"]
            ), f"Activity state '{state}' missing in fr.json"

        # Cloud health sensor states
        cloud_health_states = ["connected", "disconnected", "error"]

        for state in cloud_health_states:
            # Check English
            assert (
                "state" in en_translations["entity"]["sensor"]["cloud_health"]
            ), "Cloud health sensor missing 'state' translations in en.json"
            assert (
                state in en_translations["entity"]["sensor"]["cloud_health"]["state"]
            ), f"Cloud health state '{state}' missing in en.json"

            # Check French
            assert (
                "state" in fr_translations["entity"]["sensor"]["cloud_health"]
            ), "Cloud health sensor missing 'state' translations in fr.json"
            assert (
                state in fr_translations["entity"]["sensor"]["cloud_health"]["state"]
            ), f"Cloud health state '{state}' missing in fr.json"


class TestSwitchTranslations:
    """Test switch entity translations."""

    @pytest.mark.asyncio
    async def test_autolight_switch_has_translation_key(
        self, hass: HomeAssistant, mock_config_entry: MockConfigEntry
    ) -> None:
        """Test that autolight switch has translation_key set."""

        # Mock dependencies
        class MockAreaManager:
            def get_light_automation_eligible_areas(self):
                return {"test_area": "Test Area"}

            def get_all_areas(self):
                return ["test_area"]

        class MockCoordinator:
            def __init__(self, hass_instance):
                self.hass = hass_instance
                self.area_manager = MockAreaManager()
                self.feature_flag_manager = MagicMock()
                self.feature_flag_manager.get_feature_definitions.return_value = {
                    "automatic_lighting": {
                        "name": "Automatic Lighting",
                        "default_enabled": False,
                    }
                }

            async def async_config_entry_first_refresh(self):
                pass

        hass.data[DOMAIN] = {
            mock_config_entry.entry_id: {
                "coordinator": MockCoordinator(hass),
                "area_manager": MockAreaManager(),
                "rule_engine": None,
            }
        }

        entities = []

        def mock_add_entities(new_entities, update_before_add=False):
            entities.extend(new_entities)

        await switch.async_setup_entry(hass, mock_config_entry, mock_add_entities)

        assert len(entities) > 0
        for entity in entities:
            assert hasattr(entity, "_attr_translation_key")
            # New feature switches use feature_{feature_id} translation keys
            assert entity._attr_translation_key.startswith("feature_")
            assert hasattr(entity, "_attr_has_entity_name")
            assert entity._attr_has_entity_name is True
            assert hasattr(entity, "_attr_translation_placeholders")
            assert "area_name" in entity._attr_translation_placeholders

    def test_switch_translation_exists_in_both_languages(
        self, en_translations: dict, fr_translations: dict
    ) -> None:
        """Test that switch translation exists in en.json and fr.json."""
        assert "entity" in en_translations
        assert "switch" in en_translations["entity"]
        assert "feature_automatic_lighting" in en_translations["entity"]["switch"]
        assert (
            "name" in en_translations["entity"]["switch"]["feature_automatic_lighting"]
        )

        assert "entity" in fr_translations
        assert "switch" in fr_translations["entity"]
        assert "feature_automatic_lighting" in fr_translations["entity"]["switch"]
        assert (
            "name" in fr_translations["entity"]["switch"]["feature_automatic_lighting"]
        )


class TestTranslationFilesStructure:
    """Test translation files structure and consistency."""

    def test_translation_files_exist(self) -> None:
        """Test that both translation files exist."""
        assert EN_JSON.exists(), "en.json translation file not found"
        assert FR_JSON.exists(), "fr.json translation file not found"

    def test_translation_files_are_valid_json(
        self, en_translations: dict, fr_translations: dict
    ) -> None:
        """Test that translation files are valid JSON."""
        assert isinstance(en_translations, dict)
        assert isinstance(fr_translations, dict)

    def test_translation_files_have_same_structure(
        self, en_translations: dict, fr_translations: dict
    ) -> None:
        """Test that en.json and fr.json have the same keys (structure)."""

        def get_keys_recursive(d: dict, prefix: str = "") -> set:
            """Get all keys recursively from a nested dict."""
            keys = set()
            for key, value in d.items():
                full_key = f"{prefix}.{key}" if prefix else key
                keys.add(full_key)
                if isinstance(value, dict):
                    keys.update(get_keys_recursive(value, full_key))
            return keys

        en_keys = get_keys_recursive(en_translations)
        fr_keys = get_keys_recursive(fr_translations)

        missing_in_fr = en_keys - fr_keys
        missing_in_en = fr_keys - en_keys

        assert not missing_in_fr, f"Keys missing in fr.json: {missing_in_fr}"
        assert not missing_in_en, f"Keys missing in en.json: {missing_in_en}"

    def test_no_hardcoded_french_in_entity_ids(self) -> None:
        """Test that no entity IDs contain French words."""
        # Common French words that should never appear in entity IDs
        french_words = [
            "zones",
            "erreurs",
            "activité",
            "activités",
            "déclenchements",
            "santé",
            "nuage",
        ]

        # Read all Python files in the integration
        integration_dir = Path(__file__).parent.parent
        for py_file in integration_dir.glob("*.py"):
            if py_file.name.startswith("test_"):
                continue
            content = py_file.read_text()

            # Check for French words in entity_id patterns
            # Look for strings like 'linus_brain.french_word' or entity IDs with French
            for word in french_words:
                # Check for entity ID patterns: unique_id, entity_id assignments
                patterns_to_check = [
                    f'unique_id = "{word}"',
                    f"unique_id = '{word}'",
                    f'entity_id = "{word}"',
                    f"entity_id = '{word}'",
                    f'"{DOMAIN}.{word}"',
                    f"'{DOMAIN}.{word}'",
                    f'self._attr_unique_id = "{word}"',
                    f"self._attr_unique_id = '{word}'",
                ]

                for pattern in patterns_to_check:
                    assert pattern not in content, (
                        f"French word '{word}' found in entity ID pattern in {py_file.name}. "
                        f"Entity IDs and unique_ids must be in English!"
                    )
