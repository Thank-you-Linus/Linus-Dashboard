"""
Tests for Feature Flag Manager (simplified version).

After refactoring, FeatureFlagManager only provides feature definitions.
Feature states (ON/OFF) are managed by Home Assistant switch entities using RestoreEntity.

Tests cover:
- Feature definition loading
- Feature existence checking
- Validation methods
- Debug/export functionality
"""

import json

import pytest

from ..const import AVAILABLE_FEATURES
from ..utils.feature_flag_manager import FeatureFlagManager, ValidationResult


@pytest.fixture
def feature_flag_manager():
    """Create a FeatureFlagManager instance."""
    return FeatureFlagManager()


# ===== INITIALIZATION TESTS =====


def test_feature_flag_manager_initializes_with_defaults(feature_flag_manager):
    """Test that FeatureFlagManager initializes with feature definitions."""
    assert feature_flag_manager._feature_definitions == AVAILABLE_FEATURES
    assert len(feature_flag_manager._feature_definitions) > 0


def test_get_feature_definitions(feature_flag_manager):
    """Test getting all feature definitions."""
    definitions = feature_flag_manager.get_feature_definitions()

    assert isinstance(definitions, dict)
    assert len(definitions) == len(AVAILABLE_FEATURES)

    # Verify it returns a copy, not the original
    definitions["test"] = {"name": "Test"}
    assert "test" not in feature_flag_manager._feature_definitions


def test_get_feature_definition(feature_flag_manager):
    """Test getting a specific feature definition."""
    # Assuming automatic_lighting exists in AVAILABLE_FEATURES
    definition = feature_flag_manager.get_feature_definition("automatic_lighting")

    if "automatic_lighting" in AVAILABLE_FEATURES:
        assert definition is not None
        assert "name" in definition
        assert "description" in definition

    # Test non-existent feature
    assert feature_flag_manager.get_feature_definition("nonexistent") is None


def test_feature_exists(feature_flag_manager):
    """Test checking if a feature exists."""
    # Assuming automatic_lighting exists in AVAILABLE_FEATURES
    if "automatic_lighting" in AVAILABLE_FEATURES:
        assert feature_flag_manager.feature_exists("automatic_lighting") is True

    assert feature_flag_manager.feature_exists("nonexistent_feature") is False


# ===== VALIDATION TESTS =====


def test_validate_feature_definition_valid(feature_flag_manager):
    """Test validating a valid feature definition."""
    # Assuming automatic_lighting exists in AVAILABLE_FEATURES
    if "automatic_lighting" not in AVAILABLE_FEATURES:
        pytest.skip("automatic_lighting not in AVAILABLE_FEATURES")

    result = feature_flag_manager.validate_feature_definition("automatic_lighting")

    assert isinstance(result, ValidationResult)
    # Result validity depends on whether the feature has all required fields
    assert isinstance(result.is_valid, bool)
    assert isinstance(result.errors, list)
    assert isinstance(result.warnings, list)
    assert isinstance(result.suggestions, list)


def test_validate_feature_definition_nonexistent(feature_flag_manager):
    """Test validating a non-existent feature."""
    result = feature_flag_manager.validate_feature_definition("nonexistent_feature")

    assert result.is_valid is False
    assert len(result.errors) == 1
    assert "not defined" in result.errors[0]
    assert len(result.suggestions) > 0


def test_validation_result_has_issues():
    """Test ValidationResult.has_issues method."""
    # No issues
    result = ValidationResult(True, [], [], [])
    assert result.has_issues() is False

    # Has errors
    result = ValidationResult(False, ["error"], [], [])
    assert result.has_issues() is True

    # Has warnings
    result = ValidationResult(True, [], ["warning"], [])
    assert result.has_issues() is True


def test_validation_result_get_summary():
    """Test ValidationResult.get_summary method."""
    # Valid with no warnings
    result = ValidationResult(True, [], [], [])
    assert "✅" in result.get_summary()

    # Valid with warnings
    result = ValidationResult(True, [], ["warning"], [])
    assert "⚠️" in result.get_summary()
    assert "1 warning" in result.get_summary()

    # Invalid with errors
    result = ValidationResult(False, ["error1", "error2"], [], [])
    assert "❌" in result.get_summary()
    assert "2 error" in result.get_summary()


# ===== DEBUGGING TESTS =====


def test_get_system_overview(feature_flag_manager):
    """Test getting system overview."""
    overview = feature_flag_manager.get_system_overview()

    assert isinstance(overview, dict)
    assert "feature_definitions" in overview
    assert "total_features" in overview
    assert "system_health" in overview

    assert overview["total_features"] == len(AVAILABLE_FEATURES)
    assert isinstance(overview["system_health"], dict)


def test_system_health_assessment(feature_flag_manager):
    """Test system health assessment."""
    health = feature_flag_manager._assess_system_health()

    assert isinstance(health, dict)
    assert "overall_status" in health
    assert "checks" in health
    assert "score" in health

    # With features loaded, should be healthy
    assert health["score"] > 0
    assert "feature_definitions" in health["checks"]


def test_export_debug_data_json(feature_flag_manager):
    """Test exporting debug data in JSON format."""
    json_data = feature_flag_manager.export_debug_data("json")

    assert isinstance(json_data, str)

    # Verify it's valid JSON
    parsed = json.loads(json_data)
    assert isinstance(parsed, dict)
    assert "feature_definitions" in parsed
    assert "system_health" in parsed


def test_export_debug_data_txt(feature_flag_manager):
    """Test exporting debug data in text format."""
    txt_data = feature_flag_manager.export_debug_data("txt")

    assert isinstance(txt_data, str)
    assert "Feature Flag Debug Report" in txt_data
    assert "System Health:" in txt_data
    assert "Feature Definitions:" in txt_data


def test_export_debug_data_invalid_format(feature_flag_manager):
    """Test exporting debug data with invalid format."""
    with pytest.raises(ValueError, match="Unsupported format"):
        feature_flag_manager.export_debug_data("invalid_format")


# ===== EDGE CASES =====


def test_feature_flag_manager_without_available_features():
    """Test FeatureFlagManager handles missing feature definitions gracefully."""
    # Create a manager and clear its definitions to simulate failed import
    manager = FeatureFlagManager()
    manager._feature_definitions = {}

    # Should return empty dict, not crash
    definitions = manager.get_feature_definitions()
    assert definitions == {}
    assert manager.feature_exists("anything") is False

    # System health should reflect missing features
    health = manager._assess_system_health()
    assert health["score"] < 100  # Not perfect health with no features
    assert health["overall_status"] != "healthy"  # Should not be healthy

    # Check that feature_definitions check failed
    assert "feature_definitions" in health["checks"]
    assert health["checks"]["feature_definitions"]["status"] == "fail"
