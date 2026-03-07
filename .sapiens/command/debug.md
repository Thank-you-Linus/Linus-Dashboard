---
description: Debug errors, bugs, and unexpected behavior systematically
agent: general
---

# 🐛 Debug Prompt

Use this prompt when investigating errors, bugs, or unexpected behavior.

---

## Context Loading

Before debugging, ALWAYS load:
1. `.aidriven/memorybank.md` - Project architecture
2. `.aidriven/rules/clean_code.md` - Code standards
3. `.aidriven/rules/homeassistant_integration.md` - HA patterns
4. `.aidriven/rules/async_patterns.md` - Async best practices

---

## Debug Process

### Step 1: Understand the Error

**Collect Information:**
- Error message (full stack trace)
- When does it occur? (startup, service call, state change)
- Which file/function is involved?
- User actions that trigger it
- Home Assistant version and logs

**Questions to Ask:**
1. Is this a Python exception or HA-specific error?
2. Does the error occur consistently or randomly?
3. Are there related errors in `home-assistant.log`?
4. What changed recently (code, config, HA version)?

### Step 2: Analyze Root Cause

**Common Error Categories:**

#### 1. Async/Await Issues
```python
# Symptoms:
# - "coroutine was never awaited"
# - Event loop blocking
# - Timeouts

# Check for:
await missing_function()  # Missing await
blocking_io_call()  # Blocking I/O in async context
```

#### 2. Home Assistant Integration Errors
```python
# Symptoms:
# - Integration fails to load
# - Config flow errors
# - Entity not showing up

# Check for:
# - Missing async_setup_entry/async_unload_entry
# - Incorrect platform registration
# - Missing unique_id on entities
# - Data not stored in hass.data correctly
```

#### 3. API/Network Errors
```python
# Symptoms:
# - Connection refused
# - Timeouts
# - 4xx/5xx HTTP errors

# Check for:
# - Supabase URL/key configuration
# - Network connectivity
# - API rate limits
# - Timeout values
```

#### 4. State Management Issues
```python
# Symptoms:
# - Entities stuck in "unknown" state
# - Attributes not updating
# - Coordinator not refreshing

# Check for:
# - async_write_ha_state() called?
# - Coordinator update interval
# - Data structure in coordinator.data
```

### Step 3: Reproduce Locally

**In Devcontainer:**

```bash
# 1. Activate environment
source ha-env/bin/activate

# 2. Start HA in debug mode
hass -c /config --debug

# 3. Watch logs in real-time
tail -f /config/home-assistant.log | grep linus_brain

# 4. Trigger the error
# (via UI, service call, or curl)
```

### Step 4: Add Debug Logging

```python
import logging

_LOGGER = logging.getLogger(__name__)

# Temporary debug statements
_LOGGER.debug("Room data before processing: %s", room_data)
_LOGGER.debug("Entity state: %s", entity.state)
_LOGGER.debug("API response status: %s", response.status)

# Log exceptions with full context
try:
    result = await risky_operation()
except Exception as err:
    _LOGGER.exception(
        "Operation failed with data: %s, config: %s",
        data,
        config,
    )
    raise
```

### Step 5: Fix and Verify

**Validation Checklist:**
- [ ] Error no longer occurs in logs
- [ ] Integration loads successfully
- [ ] Related functionality works
- [ ] No new errors introduced
- [ ] Tests pass (if applicable)
- [ ] Code follows `.aidriven/rules/`

---

## Common Errors and Solutions

### Error: "Integration linus_brain not found"

**Cause:** Integration not installed or path incorrect

**Solution:**
```bash
# Check symlink
ls -la /config/custom_components/linus_brain

# Recreate if needed
ln -sf /workspaces/Linus-Brain/custom_components/linus_brain \
       /config/custom_components/linus_brain

# Restart HA
```

### Error: "Setup failed for linus_brain: Unable to import component"

**Cause:** Python syntax error or missing import

**Solution:**
```bash
# Check for syntax errors
python3 -m py_compile custom_components/linus_brain/__init__.py

# Check imports
cd custom_components/linus_brain
python3 -c "from . import *"
```

### Error: "This error originated from a custom integration"

**Cause:** Exception in integration code

**Solution:**
1. Check full traceback in logs
2. Add try/except around failing code
3. Validate input data
4. Check async/await usage

### Error: "Updating linus_brain sensor took longer than the scheduled update interval"

**Cause:** Coordinator update too slow

**Solution:**
```python
# Increase update interval
update_interval=timedelta(minutes=20)  # Was 15

# Or optimize data fetching
async def _async_update_data():
    # Use asyncio.gather for parallel requests
    results = await asyncio.gather(
        fetch_room_1(),
        fetch_room_2(),
        return_exceptions=True,
    )
```

### Error: "Cannot connect to Supabase"

**Cause:** Network issue, wrong credentials, or rate limit

**Solution:**
```python
# Test connection manually
curl -H "apikey: YOUR_KEY" \
     -H "Authorization: Bearer YOUR_KEY" \
     https://your-project.supabase.co/rest/v1/

# Check configuration
_LOGGER.debug("Supabase URL: %s", self.supabase_url)
_LOGGER.debug("Key length: %s", len(self.supabase_key))

# Add retry logic
await send_with_retry(data, max_retries=3)
```

---

## Debugging Tools

### 1. VS Code Debugger

```json
// .vscode/launch.json
{
    "name": "Home Assistant (Debug)",
    "type": "debugpy",
    "request": "launch",
    "program": "${workspaceFolder}/ha-env/bin/hass",
    "args": ["-c", "/config", "--debug"],
    "console": "integratedTerminal"
}
```

**Usage:**
1. Set breakpoints in code (click left margin)
2. Press F5 to start debugger
3. Trigger error via HA UI
4. Inspect variables at breakpoint

### 2. Python Debugger (pdb)

```python
# Add breakpoint in code
import pdb; pdb.set_trace()

# Or use built-in breakpoint()
breakpoint()
```

### 3. Home Assistant Logs

```bash
# Real-time logs
tail -f /config/home-assistant.log

# Filter by component
grep "linus_brain" /config/home-assistant.log

# Last 100 lines
tail -n 100 /config/home-assistant.log

# Search for errors
grep "ERROR" /config/home-assistant.log | grep "linus_brain"
```

### 4. Network Debugging

```bash
# Test Supabase connection
curl -v -H "apikey: $SUPABASE_KEY" \
        -H "Authorization: Bearer $SUPABASE_KEY" \
        https://your-project.supabase.co/rest/v1/presence_data?limit=1

# Check API response time
time curl -H "apikey: $SUPABASE_KEY" \
          https://your-project.supabase.co/rest/v1/
```

---

## Debug Output Format

When providing debug analysis, use this structure:

```markdown
## 🐛 Debug Analysis: [Error Title]

### Error Message
```
[Full error message or stack trace]
```

### Root Cause
[Explanation of what's causing the error]

### Affected Code
`[file path]` - Line [X]

### Fix Strategy
1. [Step 1]
2. [Step 2]
3. [Step 3]

### Code Changes
```python
# Before
[problematic code]

# After
[fixed code with comments]
```

### Testing Steps
1. [How to verify the fix]
2. [Expected behavior]

### Prevention
[Rule to add to `.aidriven/rules/` to prevent future occurrences]
```

---

## After Fixing

1. **Remove debug logging** (unless it's valuable for future debugging)
2. **Add test case** to prevent regression
3. **Update documentation** if behavior changed
4. **Update `.aidriven/rules/`** if pattern should be avoided
5. **Commit with descriptive message**:
   ```
   fix: Handle timeout in Supabase sync (#123)
   
   - Add retry logic with exponential backoff
   - Increase default timeout to 30s
   - Log detailed error context
   ```

---

**Use this prompt every time you encounter an error. Systematic debugging saves time.**
