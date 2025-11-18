# ⚙️ Implementation Template

*Use this template when implementing code from an approved plan*

---

# ✅ Implementation: [Feature Name]

**Date:** [Date]  
**Based on Plan:** [Link to plan file]  
**Model Used:** Claude Sonnet (Implementation Mode)  
**Status:** 🟢 In Progress / ✅ Complete / ⚠️ Issues

---

## 📋 Implementation Progress

### Phase 1: [Phase Name]
- [x] Task 1.1: [Task name]
- [x] Task 1.2: [Task name]
- [ ] Task 1.3: [Task name]

### Phase 2: [Phase Name]
- [ ] Task 2.1: [Task name]
- [ ] Task 2.2: [Task name]

### Phase 3: [Phase Name]
- [ ] Task 3.1: [Task name]

---

## 📝 Implementation Log

### Task [X.Y]: [Task Title]

**Status:** ✅ Complete / 🔄 In Progress / ❌ Blocked  
**Time Spent:** [X hours]  
**Completed:** [Date/Time]

#### Files Modified

**Created:**
- `path/to/new/file.py` - [Purpose and key functionality]

**Modified:**
- `path/to/existing/file.py`
  - Lines 45-67: Added error handling for API timeouts
  - Lines 120-135: Implemented retry logic with exponential backoff
  - Imports: Added `asyncio` and `aiohttp`

#### Code Changes

##### File: `custom_components/linus_brain/utils/new_module.py`

```python
"""
New module for [purpose].

This module provides [functionality description].
"""
import asyncio
import logging
from typing import Any

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

_LOGGER = logging.getLogger(__name__)


class NewClass:
    """
    [Class purpose].
    
    This class manages [what it manages] and provides [what it provides].
    
    Example:
        >>> client = NewClass(hass, "url", "key")
        >>> result = await client.method()
    """
    
    def __init__(self, hass: HomeAssistant, url: str, key: str) -> None:
        """
        Initialize the class.
        
        Args:
            hass: Home Assistant instance
            url: API base URL
            key: API authentication key
        """
        self.hass: HomeAssistant = hass
        self.url: str = url.rstrip("/")
        self.key: str = key
        self._data: dict[str, Any] = {}
    
    async def async_main_method(self, param: str) -> dict[str, Any]:
        """
        Main method that does [what it does].
        
        Fetches data from API and processes it according to [logic].
        Implements retry logic with exponential backoff.
        
        Args:
            param: Parameter description and usage
        
        Returns:
            Dictionary containing:
                - status: "success" or "error"
                - data: Processed data
                - timestamp: When the operation completed
        
        Raises:
            HomeAssistantError: If API is unreachable after retries
            ValueError: If param is invalid
        
        Example:
            >>> result = await client.async_main_method("test")
            >>> assert result["status"] == "success"
        """
        # Validate input
        if not param or not isinstance(param, str):
            raise ValueError(f"Invalid param: {param}")
        
        # Process with retry logic
        max_retries = 3
        for attempt in range(max_retries):
            try:
                async with asyncio.timeout(10):
                    data = await self._fetch_data(param)
                    result = self._process_data(data)
                    
                    _LOGGER.info(
                        "Successfully processed %s (attempt %s)",
                        param,
                        attempt + 1,
                    )
                    
                    return {
                        "status": "success",
                        "data": result,
                        "timestamp": datetime.now().isoformat(),
                    }
            
            except asyncio.TimeoutError:
                if attempt == max_retries - 1:
                    _LOGGER.error("Operation timed out after %s attempts", max_retries)
                    raise HomeAssistantError("Timeout after retries")
                
                delay = 2 ** attempt  # Exponential backoff
                _LOGGER.warning(
                    "Timeout on attempt %s, retrying in %ss",
                    attempt + 1,
                    delay,
                )
                await asyncio.sleep(delay)
            
            except Exception as err:
                _LOGGER.exception("Unexpected error processing %s", param)
                raise HomeAssistantError(f"Processing failed: {err}") from err
        
        # Should never reach here due to raises above
        raise HomeAssistantError("Unexpected retry loop exit")
    
    async def _fetch_data(self, param: str) -> dict[str, Any]:
        """
        Fetch data from API (private helper).
        
        Args:
            param: Parameter to fetch
        
        Returns:
            Raw data from API
        """
        # Implementation details...
        pass
    
    def _process_data(self, data: dict[str, Any]) -> dict[str, Any]:
        """
        Process raw data (private helper).
        
        Args:
            data: Raw data from API
        
        Returns:
            Processed data
        """
        # Implementation details...
        pass
```

##### File: `custom_components/linus_brain/__init__.py` (Modified)

```python
# Added import
from .utils.new_module import NewClass

# In async_setup_entry, added:
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up integration from config entry."""
    # ... existing code ...
    
    # Initialize new component
    new_component = NewClass(
        hass,
        entry.data["url"],
        entry.data["key"],
    )
    
    # Store in hass.data
    hass.data[DOMAIN][entry.entry_id]["new_component"] = new_component
    
    # Register cleanup
    async def cleanup() -> None:
        """Clean up new component."""
        _LOGGER.info("Cleaning up new component")
        # Add cleanup logic if needed
    
    entry.async_on_unload(cleanup)
    
    # ... rest of setup ...
    return True
```

#### Tests Added

##### File: `tests/test_new_module.py`

```python
"""Tests for new_module."""
import pytest
from unittest.mock import AsyncMock, Mock

from homeassistant.core import HomeAssistant
from homeassistant.exceptions import HomeAssistantError

from ..utils.new_module import NewClass


@pytest.fixture
def mock_hass():
    """Create mock Home Assistant instance."""
    return Mock(spec=HomeAssistant)


@pytest.mark.asyncio
async def test_main_method_success(mock_hass):
    """Test successful operation."""
    # Arrange
    client = NewClass(mock_hass, "https://test.com", "key")
    client._fetch_data = AsyncMock(return_value={"value": 42})
    client._process_data = Mock(return_value={"processed": True})
    
    # Act
    result = await client.async_main_method("test_param")
    
    # Assert
    assert result["status"] == "success"
    assert result["data"]["processed"] is True
    assert "timestamp" in result


@pytest.mark.asyncio
async def test_main_method_invalid_param(mock_hass):
    """Test with invalid parameter."""
    # Arrange
    client = NewClass(mock_hass, "https://test.com", "key")
    
    # Act & Assert
    with pytest.raises(ValueError, match="Invalid param"):
        await client.async_main_method("")


@pytest.mark.asyncio
async def test_main_method_timeout_retry(mock_hass):
    """Test retry logic on timeout."""
    # Arrange
    client = NewClass(mock_hass, "https://test.com", "key")
    
    # First 2 calls timeout, 3rd succeeds
    client._fetch_data = AsyncMock(
        side_effect=[
            asyncio.TimeoutError(),
            asyncio.TimeoutError(),
            {"value": 42},
        ]
    )
    client._process_data = Mock(return_value={"processed": True})
    
    # Act
    result = await client.async_main_method("test_param")
    
    # Assert
    assert result["status"] == "success"
    assert client._fetch_data.call_count == 3


@pytest.mark.asyncio
async def test_main_method_max_retries_exceeded(mock_hass):
    """Test failure after max retries."""
    # Arrange
    client = NewClass(mock_hass, "https://test.com", "key")
    client._fetch_data = AsyncMock(side_effect=asyncio.TimeoutError())
    
    # Act & Assert
    with pytest.raises(HomeAssistantError, match="Timeout after retries"):
        await client.async_main_method("test_param")
    
    assert client._fetch_data.call_count == 3
```

#### Validation

**Tests Run:**
```bash
$ pytest tests/test_new_module.py -v
======================== test session starts =========================
collected 4 items

tests/test_new_module.py::test_main_method_success PASSED      [ 25%]
tests/test_new_module.py::test_main_method_invalid_param PASSED [ 50%]
tests/test_new_module.py::test_main_method_timeout_retry PASSED [ 75%]
tests/test_new_module.py::test_main_method_max_retries_exceeded PASSED [100%]

========================= 4 passed in 0.23s ==========================
```

**Code Quality:**
```bash
$ ruff check custom_components/linus_brain/utils/new_module.py
All checks passed!

$ mypy custom_components/linus_brain/utils/new_module.py
Success: no issues found

$ black --check custom_components/linus_brain/utils/new_module.py
All done! ✨ 🍰 ✨
1 file would be left unchanged.
```

**Integration Test:**
```bash
$ hass -c /config --script check_config
Testing configuration at /config
✅ Configuration valid!
```

**Manual Test:**
- ✅ Integration loads without errors
- ✅ New component initializes correctly
- ✅ Method executes successfully
- ✅ Retry logic works on timeout
- ✅ Errors are logged appropriately
- ✅ No errors in home-assistant.log

#### Issues Encountered

**Issue 1: Import Error**
- **Problem:** Circular import between modules
- **Solution:** Moved import inside function
- **Time Lost:** 15 minutes

**Issue 2: Test Flakiness**
- **Problem:** Async tests occasionally failed
- **Solution:** Added proper await in fixture cleanup
- **Time Lost:** 20 minutes

#### Deviations from Plan

- **Added:** Extra validation for empty strings (plan only mentioned None)
- **Changed:** Increased timeout from 5s to 10s based on testing
- **Removed:** Caching layer (will add in Phase 3 instead)

**Justification:** Testing revealed 5s timeout insufficient for initial connection. Caching complexity warranted separate task.

#### Checklist

- [x] Code follows plan
- [x] All rules from `.aidriven/rules/` applied
- [x] Type hints on all functions
- [x] Docstrings on public functions
- [x] Error handling implemented
- [x] Logging added
- [x] Tests written and passing
- [x] Code formatted (black)
- [x] Linting passed (ruff)
- [x] Type checking passed (mypy)
- [x] Manual testing completed
- [x] No errors in HA logs

---

## 🔄 Overall Status

### Completed
- ✅ Phase 1: Setup (3 hours)
  - All foundation code implemented
  - Tests passing
  - Integration loads correctly

### In Progress
- 🔄 Phase 2: Core Features (estimated 2 more hours)
  - 2 of 4 tasks complete

### Pending
- ⏳ Phase 3: Integration
- ⏳ Phase 4: Documentation

### Blockers
- None currently

---

## 📊 Metrics

**Code Statistics:**
- Lines added: 245
- Lines deleted: 12
- Files modified: 4
- Files created: 2
- Test coverage: 87%

**Time Tracking:**
- Estimated: 8 hours
- Actual: 4.5 hours (so far)
- Remaining: 3.5 hours

**Quality Metrics:**
- Tests passing: 15/15 (100%)
- Type errors: 0
- Linting issues: 0
- Security issues: 0

---

## 🚨 Issues & Risks

### Resolved Issues
1. ✅ Circular import - Fixed with lazy import
2. ✅ Test flakiness - Fixed with proper cleanup

### Open Issues
- None

### New Risks Identified
- None

---

## 📚 Documentation Updates Needed

- [ ] Update README.md with new feature
- [ ] Add example to QUICKSTART.md
- [ ] Update API documentation
- [ ] Add to CHANGELOG.md

---

## 🔄 Next Steps

1. Complete Task 2.3: [Task name]
2. Complete Task 2.4: [Task name]
3. Begin Phase 3: Integration testing
4. Update documentation

---

**END OF IMPLEMENTATION LOG**

*Update this document as you progress through implementation. This serves as a record of what was built and how.*
