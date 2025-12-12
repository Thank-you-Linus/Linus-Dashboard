"""
Feature Flag Manager for Linus Brain

Provides feature flag definitions and metadata.

Architecture:
- Feature definitions (metadata) are provided here
- Feature states (ON/OFF) are managed by Home Assistant switch entities using RestoreEntity
- Feature configuration (app assignments) is stored in AppStorage/Supabase

Key responsibilities:
- Provide feature definitions (name, description, default state)
- Provide feature metadata for UI and documentation
- Validation and diagnostic utilities
"""

import logging
from dataclasses import dataclass
from typing import Any

_LOGGER = logging.getLogger(__name__)


@dataclass
class ValidationResult:
    """Result of a validation operation."""

    is_valid: bool
    errors: list[str]
    warnings: list[str]
    suggestions: list[str]

    def has_issues(self) -> bool:
        """Check if there are any issues (errors or warnings)."""
        return bool(self.errors or self.warnings)

    def get_summary(self) -> str:
        """Get a human-readable summary of validation result."""
        if self.is_valid and not self.warnings:
            return "✅ Validation passed - No issues found"
        elif self.is_valid and self.warnings:
            return f"⚠️ Validation passed with {len(self.warnings)} warning(s)"
        else:
            return f"❌ Validation failed with {len(self.errors)} error(s)"


class FeatureFlagManager:
    """
    Provides feature flag definitions and metadata.

    This class is the source of truth for feature definitions only.
    Feature states (ON/OFF) are managed by Home Assistant switch entities.

    Architecture:
    - Feature definitions stored here (metadata)
    - Feature states stored by HA (RestoreEntity in switches)
    - Feature configuration stored in Supabase (AppStorage)
    """

    def __init__(self) -> None:
        """Initialize feature flag manager."""
        self._feature_definitions = {}

        # Load feature definitions from const
        try:
            from ..const import AVAILABLE_FEATURES

            self._feature_definitions = AVAILABLE_FEATURES
        except ImportError:
            _LOGGER.warning("Could not load AVAILABLE_FEATURES from const")
            self._feature_definitions = {}

    def get_feature_definitions(self) -> dict[str, dict[str, Any]]:
        """
        Get all available feature definitions.

        Returns:
            Dictionary of feature definitions with metadata for each feature
        """
        return self._feature_definitions.copy()

    def get_feature_definition(self, feature_id: str) -> dict[str, Any] | None:
        """
        Get definition for a specific feature.

        Args:
            feature_id: The feature ID

        Returns:
            Feature definition dict or None if not found
        """
        return self._feature_definitions.get(feature_id)

    def feature_exists(self, feature_id: str) -> bool:
        """
        Check if a feature is defined.

        Args:
            feature_id: The feature ID to check

        Returns:
            True if feature is defined, False otherwise
        """
        return feature_id in self._feature_definitions

    # ===== VALIDATION METHODS =====

    def validate_feature_definition(self, feature_id: str) -> ValidationResult:
        """
        Validate that a feature is properly defined.

        Args:
            feature_id: The feature ID

        Returns:
            ValidationResult with detailed findings
        """
        errors: list[str] = []
        warnings: list[str] = []
        suggestions: list[str] = []

        # Check if feature exists
        if feature_id not in self._feature_definitions:
            errors.append(f"Feature '{feature_id}' is not defined")
            suggestions.append("Check AVAILABLE_FEATURES in const.py")
            return ValidationResult(False, errors, warnings, suggestions)

        # Check feature definition has required fields
        feature_def = self._feature_definitions[feature_id]
        required_fields = ["name", "description", "default_enabled"]

        for field in required_fields:
            if field not in feature_def:
                warnings.append(f"Feature '{feature_id}' missing field '{field}'")

        return ValidationResult(len(errors) == 0, errors, warnings, suggestions)

    # ===== DEBUGGING METHODS =====

    def get_system_overview(self) -> dict[str, Any]:
        """
        Get comprehensive system overview for debugging.

        Returns:
            Dictionary with feature definitions and system health
        """
        overview: dict[str, Any] = {
            "feature_definitions": self._feature_definitions,
            "total_features": len(self._feature_definitions),
            "system_health": self._assess_system_health(),
        }

        return overview

    def _assess_system_health(self) -> dict[str, Any]:
        """Assess overall system health."""
        health: dict[str, Any] = {
            "overall_status": "healthy",
            "checks": {},
            "score": 100,
        }
        checks: dict[str, dict[str, str]] = {}
        health["checks"] = checks

        # Check feature definitions availability
        has_features = len(self._feature_definitions) > 0
        checks["feature_definitions"] = {
            "status": "pass" if has_features else "fail",
            "message": (
                f"{len(self._feature_definitions)} feature definitions available"
                if has_features
                else "No feature definitions available"
            ),
        }

        # Calculate overall score
        failed_checks = sum(
            1 for check in health["checks"].values() if check["status"] == "fail"
        )
        health["score"] = max(0, 100 - (failed_checks * 25))

        if health["score"] < 100:
            health["overall_status"] = "warning" if health["score"] >= 75 else "error"

        return health

    def export_debug_data(self, format_type: str = "json") -> str:
        """
        Export debug data in specified format.

        Args:
            format_type: Export format ('json' or 'txt')

        Returns:
            Formatted debug data string
        """
        overview = self.get_system_overview()

        if format_type == "json":
            import json

            return json.dumps(overview, indent=2)

        elif format_type == "txt":
            lines = [
                "Feature Flag Debug Report",
                "=" * 50,
                f"System Health: {overview['system_health']['overall_status']} (Score: {overview['system_health']['score']})",
                f"Feature Definitions: {len(overview['feature_definitions'])}",
                "",
                "Feature Definitions:",
                "-" * 20,
            ]

            for feature_id, definition in overview["feature_definitions"].items():
                lines.extend(
                    [
                        f"Feature: {feature_id}",
                        f"  Name: {definition.get('name', 'Unknown')}",
                        f"  Description: {definition.get('description', 'No description')}",
                        f"  Default: {definition.get('default_enabled', False)}",
                        "",
                    ]
                )

            return "\n".join(lines)

        else:
            raise ValueError(f"Unsupported format: {format_type}")
