"""
Utils package for Linus Brain integration.

This package contains utility modules for:
- Area management and entity grouping
- Event listening and state changes
- Supabase HTTP client
- Rule engine for AI-generated automations
- Entity resolution for generic selectors
"""

from .app_storage import AppStorage
from .entity_resolver import EntityResolver
from .feature_flag_manager import FeatureFlagManager, ValidationResult
from .state_validator import INVALID_STATES, is_state_valid

__all__ = [
    "AppStorage",
    "EntityResolver",
    "FeatureFlagManager",
    "ValidationResult",
    "is_state_valid",
    "INVALID_STATES",
]
