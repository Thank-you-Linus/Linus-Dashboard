"""
Insights Manager for Linus Brain

This module manages AI-calculated insights that can be used by automations.
Insights are cached in memory and synced from Supabase on demand.

Key Features:
- Generic design: Works with ANY insight type without code changes
- Three-tier fallback: instance+area → global+area → global defaults
- Confidence scoring: Tracks how reliable each insight is
- Memory caching: Fast access without repeated API calls
- Async operations: Non-blocking I/O for Supabase communication

Usage Example:
    insights_manager = InsightsManager(hass, supabase_client, instance_id)
    await insights_manager.async_load()

    # Get insight with automatic fallback
    threshold = insights_manager.get_insight(
        area_id="salon",
        insight_type="dark_threshold_lux",
        default={"threshold": 200}
    )
"""

import logging
from datetime import datetime
from typing import Any

_LOGGER = logging.getLogger(__name__)


class InsightsManager:
    """
    Manages AI-calculated insights with caching and fallback logic.

    This class handles:
    - Loading insights from Supabase
    - Caching insights in memory for fast access
    - Fallback hierarchy: instance+area → global+area → global default
    - Confidence tracking for data quality assessment
    """

    def __init__(
        self,
        supabase_client: Any,
    ) -> None:
        """
        Initialize the insights manager.

        Args:
            supabase_client: SupabaseClient for API communication
        """
        self.supabase_client = supabase_client

        # Cache structure: {(instance_id, area_id, insight_type): insight_data}
        # insight_data = {
        #     "id": "uuid",
        #     "value": {...},  # JSONB data
        #     "confidence": 0.85,
        #     "metadata": {...},
        #     "source": "instance_area_specific" | "global_area_specific" | "global_default",
        #     "updated_at": "2025-10-27T23:30:00Z"
        # }
        self._cache: dict[tuple[str | None, str | None, str], dict[str, Any]] = {}

        # Track when insights were last loaded
        self._last_loaded: datetime | None = None

        _LOGGER.info("InsightsManager initialized")

    async def async_load(self, instance_id: str) -> bool:
        """
        Load all insights from Supabase into memory cache.

        This fetches:
        1. Instance-specific + area-specific insights
        2. Global + area-specific insights
        3. Global defaults (NULL + NULL)

        Args:
            instance_id: Current HA instance UUID

        Returns:
            True if successful, False otherwise
        """
        try:
            _LOGGER.debug(f"Loading insights for instance: {instance_id}")

            # Fetch all insights (instance-specific + global)
            insights = await self.supabase_client.fetch_area_insights(instance_id)

            if insights is None:
                _LOGGER.warning("Failed to fetch insights from Supabase")
                return False

            # Clear existing cache
            self._cache.clear()

            # Populate cache
            for insight in insights:
                instance_id = insight.get("instance_id")
                area_id = insight.get("area_id")
                insight_type = insight.get("insight_type")

                if not insight_type:
                    _LOGGER.warning(f"Skipping insight with missing type: {insight}")
                    continue

                # Create cache key
                cache_key = (instance_id, area_id, insight_type)

                # Store in cache
                self._cache[cache_key] = {
                    "id": insight.get("id"),
                    "value": insight.get("value", {}),
                    "confidence": insight.get("confidence", 0.0),
                    "metadata": insight.get("metadata", {}),
                    "source": self._determine_source(instance_id, area_id),
                    "updated_at": insight.get("updated_at"),
                }

            self._last_loaded = datetime.now()

            _LOGGER.info(
                f"Loaded {len(self._cache)} insights from Supabase "
                f"(instance-specific + global defaults)"
            )
            return True

        except Exception as err:
            _LOGGER.error(f"Error loading insights: {err}", exc_info=True)
            return False

    def _determine_source(self, instance_id: str | None, area_id: str | None) -> str:
        """
        Determine the source type based on instance_id and area_id.

        Args:
            instance_id: Instance UUID (None = global)
            area_id: Area identifier (None = all areas)

        Returns:
            Source type string
        """
        if instance_id and area_id:
            return "instance_area_specific"
        elif area_id:
            return "global_area_specific"
        else:
            return "global_default"

    def get_insight(
        self,
        instance_id: str,
        area_id: str | None,
        insight_type: str,
        default: Any = None,
    ) -> dict[str, Any] | None:
        """
        Get an insight with automatic fallback logic.

        Lookup priority:
        1. Instance-specific + area-specific (highest priority)
        2. Global + area-specific (medium priority)
        3. Global default (lowest priority)
        4. Provided default value (fallback if nothing found)

        Args:
            instance_id: Current HA instance UUID
            area_id: Area identifier (e.g., "salon")
            insight_type: Type of insight (e.g., "dark_threshold_lux")
            default: Fallback value if insight not found

        Returns:
            Insight data dictionary or default value

        Example:
            >>> insight = manager.get_insight(instance_id, "salon", "dark_threshold_lux")
            >>> threshold = insight["value"]["threshold"]  # 200
            >>> confidence = insight["confidence"]  # 0.85
        """
        # Priority 1: Instance-specific + area-specific
        cache_key: tuple[str | None, str | None, str] = (
            instance_id,
            area_id,
            insight_type,
        )
        if cache_key in self._cache:
            _LOGGER.debug(
                f"Found instance+area specific insight: {area_id}/{insight_type}"
            )
            return self._cache[cache_key]

        # Priority 2: Global + area-specific
        cache_key = (None, area_id, insight_type)
        if cache_key in self._cache:
            _LOGGER.debug(
                f"Found global+area specific insight: {area_id}/{insight_type}"
            )
            return self._cache[cache_key]

        # Priority 3: Global default
        cache_key = (None, None, insight_type)
        if cache_key in self._cache:
            _LOGGER.debug(f"Found global default insight: {insight_type}")
            return self._cache[cache_key]

        # Fallback to provided default
        _LOGGER.debug(f"No insight found for {area_id}/{insight_type}, using default")
        return default

    def get_all_insights_for_area(
        self, instance_id: str, area_id: str
    ) -> dict[str, dict[str, Any]]:
        """
        Get all insights for a specific area.

        Returns insights with fallback logic applied:
        - Instance+area specific takes priority
        - Falls back to global+area
        - Falls back to global defaults

        Args:
            instance_id: Current HA instance UUID
            area_id: Area identifier

        Returns:
            Dictionary mapping insight_type to insight data

        Example:
            >>> insights = manager.get_all_insights_for_area(instance_id, "salon")
            >>> {
            ...     "dark_threshold_lux": {"value": {...}, "confidence": 0.85, ...},
            ...     "dark_mode_brightness_pct": {"value": {...}, "confidence": 0.30, ...}
            ... }
        """
        result: dict[str, dict[str, Any]] = {}

        # Collect all insight types available
        all_insight_types = set()
        for _, _, insight_type in self._cache.keys():
            all_insight_types.add(insight_type)

        # For each insight type, get the best match for this area
        for insight_type in all_insight_types:
            insight = self.get_insight(instance_id, area_id, insight_type)
            if insight:
                result[insight_type] = insight

        return result

    def get_all_insight_types(self) -> list[str]:
        """
        Get a list of all available insight types.

        Returns:
            List of insight type strings

        Example:
            >>> manager.get_all_insight_types()
            ['dark_threshold_lux', 'dark_mode_brightness_pct', ...]
        """
        insight_types = set()
        for _, _, insight_type in self._cache.keys():
            insight_types.add(insight_type)
        return sorted(insight_types)

    def get_cache_stats(self) -> dict[str, Any]:
        """
        Get statistics about the insights cache.

        Returns:
            Dictionary with cache statistics

        Example:
            >>> manager.get_cache_stats()
            {
                "total_insights": 12,
                "instance_specific": 3,
                "global_area_specific": 0,
                "global_defaults": 6,
                "insight_types": 6,
                "last_loaded": "2025-10-27T23:30:00"
            }
        """
        instance_specific = 0
        global_area_specific = 0
        global_defaults = 0

        for instance_id, area_id, _ in self._cache.keys():
            if instance_id and area_id:
                instance_specific += 1
            elif area_id:
                global_area_specific += 1
            else:
                global_defaults += 1

        return {
            "total_insights": len(self._cache),
            "instance_specific": instance_specific,
            "global_area_specific": global_area_specific,
            "global_defaults": global_defaults,
            "insight_types": len(self.get_all_insight_types()),
            "last_loaded": self._last_loaded.isoformat() if self._last_loaded else None,
        }

    async def async_reload(self, instance_id: str) -> bool:
        """
        Reload insights from Supabase.

        This is useful after:
        - AI has updated insights in the database
        - Manual sync button is pressed
        - Configuration changes

        Args:
            instance_id: Current HA instance UUID

        Returns:
            True if successful, False otherwise
        """
        _LOGGER.info("Reloading insights from Supabase")
        return await self.async_load(instance_id)

    def is_loaded(self) -> bool:
        """
        Check if insights have been loaded.

        Returns:
            True if insights have been loaded at least once
        """
        return self._last_loaded is not None

    def get_last_loaded(self) -> datetime | None:
        """
        Get the timestamp of when insights were last loaded.

        Returns:
            Datetime of last load, or None if never loaded
        """
        return self._last_loaded
