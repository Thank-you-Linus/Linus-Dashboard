# ⚡ Async/Await Patterns

> **Purpose**: Best practices for asynchronous programming in Python  
> **Context**: Home Assistant runs on asyncio event loop

---

## 🎯 Core Concepts

### Event Loop
- Single-threaded concurrent execution
- Non-blocking I/O operations
- Never block the loop (causes UI freezes)

### Coroutines
- Functions defined with `async def`
- Must be awaited or scheduled
- Return coroutine objects when called

---

## ✅ Golden Rules

### 1. Always Await Async Functions

❌ Bad:
```python
result = async_function()  # Returns coroutine object!
print(result)  # <coroutine object async_function at 0x...>
```

✅ Good:
```python
result = await async_function()
print(result)  # Actual result
```

### 2. Never Use Blocking I/O

❌ Bad:
```python
async def fetch_data():
    import requests
    response = requests.get(url)  # BLOCKS event loop!
    return response.json()
```

✅ Good:
```python
async def fetch_data():
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.json()
```

### 3. Use `asyncio.gather()` for Parallel Operations

❌ Bad (Sequential - slow):
```python
room1 = await fetch_room("kitchen")
room2 = await fetch_room("bedroom")
room3 = await fetch_room("living_room")
# Takes 3 × request_time
```

✅ Good (Parallel - fast):
```python
rooms = await asyncio.gather(
    fetch_room("kitchen"),
    fetch_room("bedroom"),
    fetch_room("living_room"),
)
# Takes 1 × request_time
```

---

## 🔄 Common Patterns

### HTTP Requests (aiohttp)

```python
import aiohttp
from homeassistant.helpers.aiohttp_client import async_get_clientsession

async def fetch_api_data(hass: HomeAssistant, url: str) -> dict:
    """Fetch data from API using HA's shared session."""
    session = async_get_clientsession(hass)
    
    async with session.get(
        url,
        headers={"Authorization": f"Bearer {token}"},
        timeout=aiohttp.ClientTimeout(total=10),
    ) as response:
        response.raise_for_status()
        return await response.json()

async def post_api_data(hass: HomeAssistant, url: str, data: dict) -> None:
    """Post data to API."""
    session = async_get_clientsession(hass)
    
    async with session.post(
        url,
        json=data,
        headers={"Authorization": f"Bearer {token}"},
        timeout=aiohttp.ClientTimeout(total=10),
    ) as response:
        response.raise_for_status()
```

### File I/O (aiofiles)

```python
import aiofiles

async def read_file_async(filepath: str) -> str:
    """Read file asynchronously."""
    async with aiofiles.open(filepath, mode="r") as f:
        content = await f.read()
    return content

async def write_file_async(filepath: str, content: str) -> None:
    """Write file asynchronously."""
    async with aiofiles.open(filepath, mode="w") as f:
        await f.write(content)
```

### Timeouts

```python
import asyncio

async def fetch_with_timeout(url: str, timeout_seconds: int = 10) -> dict:
    """Fetch with timeout using asyncio.timeout."""
    try:
        async with asyncio.timeout(timeout_seconds):
            return await fetch_data(url)
    except asyncio.TimeoutError:
        _LOGGER.error("Request timed out after %s seconds", timeout_seconds)
        raise
```

### Delays (Sleep)

```python
import asyncio

async def retry_with_delay(operation: Callable, max_retries: int = 3) -> Any:
    """Retry operation with exponential backoff."""
    for attempt in range(max_retries):
        try:
            return await operation()
        except Exception as err:
            if attempt == max_retries - 1:
                raise
            
            delay = 2 ** attempt  # 1s, 2s, 4s
            _LOGGER.warning(
                "Attempt %s failed, retrying in %ss: %s",
                attempt + 1,
                delay,
                err,
            )
            await asyncio.sleep(delay)
```

---

## 🎭 Background Tasks

### Using `hass.async_create_task()`

```python
async def start_background_sync(hass: HomeAssistant) -> None:
    """Start background sync task."""
    
    async def background_sync() -> None:
        """Sync data every 5 minutes."""
        while True:
            try:
                await sync_data()
            except Exception as err:
                _LOGGER.error("Background sync failed: %s", err)
            
            await asyncio.sleep(300)  # 5 minutes
    
    # Schedule task (don't await - runs in background)
    task = hass.async_create_task(background_sync())
    
    # Store task reference for cleanup
    return task
```

### Canceling Background Tasks

```python
async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload integration and cancel background tasks."""
    data = hass.data[DOMAIN][entry.entry_id]
    
    # Cancel background task
    if "background_task" in data:
        task = data["background_task"]
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass  # Expected
    
    return True
```

---

## 🔒 Thread Safety

### Running Blocking Code

Sometimes you need to run blocking code (legacy libraries, CPU-heavy tasks):

```python
import asyncio
from functools import partial

async def run_blocking_operation(data: dict) -> dict:
    """Run blocking operation in executor."""
    loop = asyncio.get_event_loop()
    
    # Run in thread pool executor
    result = await loop.run_in_executor(
        None,  # Use default executor
        blocking_function,
        data,
    )
    
    return result

def blocking_function(data: dict) -> dict:
    """CPU-intensive or blocking function."""
    # This runs in a separate thread
    import time
    time.sleep(2)  # OK in executor
    return {"processed": data}
```

### Calling Async from Sync (Rare!)

❌ Avoid if possible - breaks event loop!

```python
# Only use in special cases (e.g., __init__)
from homeassistant.core import async_get_hass

def sync_function():
    """Synchronous function that needs to call async."""
    hass = async_get_hass()
    
    # Schedule coroutine to run in event loop
    hass.async_create_task(async_function())
```

---

## 🧪 Testing Async Code

### Pytest Fixtures

```python
import pytest
import asyncio

@pytest.fixture
def event_loop():
    """Create event loop for tests."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()

@pytest.mark.asyncio
async def test_async_function():
    """Test async function."""
    result = await my_async_function()
    assert result == expected
```

### Mocking Async Functions

```python
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_with_mock():
    """Test with mocked async function."""
    mock_fetch = AsyncMock(return_value={"data": "test"})
    
    with patch("module.fetch_data", mock_fetch):
        result = await process_data()
    
    mock_fetch.assert_called_once()
    assert result["data"] == "test"
```

---

## ⚠️ Common Mistakes

### 1. Forgetting to Await

❌ Bad:
```python
async def process():
    async_function()  # Does nothing!
    return "done"
```

✅ Good:
```python
async def process():
    await async_function()
    return "done"
```

### 2. Mixing Sync and Async

❌ Bad:
```python
def sync_function():
    loop = asyncio.get_event_loop()
    result = loop.run_until_complete(async_function())  # Creates nested loop!
    return result
```

✅ Good:
```python
# Either make the whole function async:
async def async_function():
    result = await other_async_function()
    return result

# Or use create_task:
def sync_function():
    hass.async_create_task(async_function())
```

### 3. Not Handling CancelledError

❌ Bad:
```python
async def background_task():
    while True:
        await do_work()
        await asyncio.sleep(60)
    # Never handles cancellation!
```

✅ Good:
```python
async def background_task():
    try:
        while True:
            await do_work()
            await asyncio.sleep(60)
    except asyncio.CancelledError:
        _LOGGER.info("Background task cancelled, cleaning up...")
        await cleanup()
        raise  # Re-raise to propagate cancellation
```

### 4. Fire-and-Forget Tasks

❌ Bad:
```python
async def process():
    asyncio.create_task(background_work())  # Task reference lost!
    return "done"
```

✅ Good:
```python
async def process():
    task = asyncio.create_task(background_work())
    # Store task reference
    tasks.append(task)
    return "done"

# Later, cleanup:
async def cleanup():
    for task in tasks:
        task.cancel()
        try:
            await task
        except asyncio.CancelledError:
            pass
```

---

## 🚀 Performance Tips

### 1. Batch Operations

```python
# ❌ Bad - N sequential requests
for room in rooms:
    await send_room_data(room)

# ✅ Good - Parallel batch
await asyncio.gather(*[send_room_data(room) for room in rooms])
```

### 2. Limit Concurrency

```python
import asyncio

async def process_with_limit(items: list, limit: int = 10) -> list:
    """Process items with concurrency limit."""
    semaphore = asyncio.Semaphore(limit)
    
    async def process_one(item):
        async with semaphore:
            return await process_item(item)
    
    return await asyncio.gather(*[process_one(item) for item in items])
```

### 3. Cache Async Results

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_cached_data(key: str) -> dict:
    """Cache pure function results."""
    return expensive_computation(key)

# For async, use aiocache or manual caching:
_cache: dict[str, Any] = {}

async def get_cached_async(key: str) -> dict:
    """Cache async results."""
    if key not in _cache:
        _cache[key] = await expensive_async_call(key)
    return _cache[key]
```

---

## 📚 Best Practices Summary

| Do ✅ | Don't ❌ |
|-------|----------|
| Use `async def` for I/O operations | Use `time.sleep()` in async functions |
| Use `await` for coroutines | Call async functions without `await` |
| Use `aiohttp` for HTTP | Use `requests` library |
| Use `asyncio.gather()` for parallel | Use sequential `await` calls |
| Handle `asyncio.CancelledError` | Ignore task cancellation |
| Store task references | Fire-and-forget with `create_task()` |
| Use `async_get_clientsession(hass)` | Create new `ClientSession` per request |
| Test with `@pytest.mark.asyncio` | Test async code with sync fixtures |

---

**Follow these patterns to write efficient, non-blocking async code that plays well with Home Assistant's event loop.**
