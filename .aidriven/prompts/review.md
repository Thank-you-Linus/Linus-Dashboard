# 🔍 Code Review Prompt

Use this prompt to review code before committing.

---

## Review Mode

**Model: Claude Sonnet (Fast Analysis)**

**Your Role:** Senior code reviewer ensuring quality, security, and maintainability.

**Context Required:**
1. `.aidriven/memorybank.md`
2. `.aidriven/rules/*.md`
3. Changed files (git diff)

---

## Review Checklist

### 1. Code Quality ✅

**Readability:**
- [ ] Functions < 50 lines
- [ ] Variables have descriptive names
- [ ] Complex logic has comments explaining WHY
- [ ] Code is self-documenting

**Structure:**
- [ ] Single responsibility per function/class
- [ ] No code duplication
- [ ] Logical organization
- [ ] Consistent style

**Type Safety:**
- [ ] All functions have type hints
- [ ] No `Any` without justification
- [ ] Return types specified
- [ ] Proper use of Optional/Union

### 2. Documentation 📚

- [ ] Module docstrings present
- [ ] Public functions/classes documented
- [ ] Docstrings follow Google style
- [ ] Complex algorithms explained
- [ ] No outdated comments

### 3. Error Handling 🚨

- [ ] Specific exceptions (no bare `except`)
- [ ] Errors logged with context
- [ ] User-friendly error messages
- [ ] Resources cleaned up (try/finally)
- [ ] No silent failures

### 4. Async/Await ⚡

- [ ] No blocking I/O in async functions
- [ ] All async functions awaited
- [ ] `asyncio.gather()` for parallel ops
- [ ] Proper timeout handling
- [ ] CancelledError handled

### 5. Home Assistant Patterns 🏠

- [ ] Integration lifecycle correct (setup/unload)
- [ ] Data stored in `hass.data[DOMAIN][entry_id]`
- [ ] Cleanup registered with `entry.async_on_unload()`
- [ ] Entities have unique_id
- [ ] Services registered properly
- [ ] Coordinator pattern used correctly

### 6. Security 🔒

- [ ] No hardcoded secrets
- [ ] User input validated
- [ ] SQL injection prevention (if applicable)
- [ ] XSS prevention (if web UI)
- [ ] Rate limiting considered

### 7. Performance 🚀

- [ ] No N+1 queries
- [ ] Batch operations where possible
- [ ] Caching used appropriately
- [ ] Database indexes planned
- [ ] Memory leaks prevented

### 8. Testing 🧪

- [ ] Tests cover new code
- [ ] Edge cases tested
- [ ] Error conditions tested
- [ ] Mocks used appropriately
- [ ] Tests are maintainable

---

## Review Process

### Step 1: Quick Scan

Read through all changed files to understand scope:
- What feature is being added?
- Which components are affected?
- Are changes localized or widespread?

### Step 2: Deep Review

For each file:

```markdown
## File: `path/to/file.py`

### Summary
[What changed and why]

### Issues Found

#### 🔴 Critical (Must Fix)
- Line X: [Issue] - [Why it's critical]
- Line Y: [Issue] - [Impact]

#### 🟡 Warning (Should Fix)
- Line A: [Issue] - [Suggestion]
- Line B: [Issue] - [Alternative approach]

#### 🔵 Suggestion (Nice to Have)
- Line M: [Improvement idea]
- Line N: [Alternative pattern]

### Positive Observations ✅
- [What was done well]
- [Good patterns used]
```

### Step 3: Cross-File Analysis

Check interactions between modified files:
- Data flow makes sense?
- Types are compatible?
- Error handling consistent?
- No missing pieces?

### Step 4: Rule Compliance

Verify against `.aidriven/rules/`:
- `clean_code.md` - All conventions followed?
- `homeassistant_integration.md` - HA patterns correct?
- `async_patterns.md` - Async usage proper?
- `supabase_rules.md` - API calls correct?

---

## Common Issues

### Issue: Blocking I/O in Async Function

```python
# ❌ Bad
async def fetch_data():
    response = requests.get(url)  # BLOCKS!
    return response.json()
```

**Impact:** Freezes entire Home Assistant  
**Severity:** 🔴 Critical  
**Fix:**
```python
# ✅ Good
async def fetch_data():
    session = async_get_clientsession(hass)
    async with session.get(url) as response:
        return await response.json()
```

### Issue: Missing Error Handling

```python
# ❌ Bad
async def sync_data():
    await client.post(url, data)  # No error handling!
```

**Impact:** Silent failures, no debugging info  
**Severity:** 🔴 Critical  
**Fix:**
```python
# ✅ Good
async def sync_data():
    try:
        await client.post(url, data)
    except aiohttp.ClientError as err:
        _LOGGER.error("Failed to sync data: %s", err)
        raise HomeAssistantError(f"Sync failed: {err}") from err
```

### Issue: Missing Type Hints

```python
# ❌ Bad
def process(data):
    return data["value"]
```

**Impact:** Type checkers can't help, unclear contract  
**Severity:** 🟡 Warning  
**Fix:**
```python
# ✅ Good
def process(data: dict[str, Any]) -> Any:
    """Extract value from data dict."""
    return data["value"]
```

### Issue: No Cleanup on Unload

```python
# ❌ Bad
async def async_setup_entry(hass, entry):
    listener = hass.bus.async_listen(EVENT, callback)
    return True  # Listener never removed!
```

**Impact:** Memory leak, listeners accumulate  
**Severity:** 🔴 Critical  
**Fix:**
```python
# ✅ Good
async def async_setup_entry(hass, entry):
    listener = hass.bus.async_listen(EVENT, callback)
    entry.async_on_unload(listener)  # Auto-cleanup
    return True
```

---

## Review Output Format

```markdown
# 🔍 Code Review: [Feature Name]

**Reviewer:** Claude Sonnet  
**Date:** [Date]  
**Files Changed:** [Count]  
**Overall Status:** ✅ Approved / ⚠️ Needs Changes / ❌ Rejected

---

## Executive Summary

[2-3 sentences: What was changed, overall quality assessment]

---

## Detailed Review

### Files Reviewed
- `file1.py` - ✅ Looks good
- `file2.py` - ⚠️ Minor issues
- `file3.py` - ❌ Critical issues

### Critical Issues 🔴

#### Issue 1: [Title]
**File:** `path/to/file.py:123`  
**Problem:** [Description]  
**Impact:** [Why it matters]  
**Fix:**
```python
[Code suggestion]
```

#### Issue 2: [Title]
[...]

### Warnings 🟡

[List of non-critical issues]

### Suggestions 🔵

[Optional improvements]

---

## Rule Compliance

- ✅ `clean_code.md` - All conventions followed
- ⚠️ `async_patterns.md` - One blocking call found (Line 45)
- ✅ `homeassistant_integration.md` - Patterns correct
- ✅ `supabase_rules.md` - API usage proper

---

## Security Check

- ✅ No hardcoded secrets
- ✅ Input validation present
- ✅ Error messages don't leak info
- ⚠️ Consider rate limiting for API calls

---

## Performance Notes

- ✅ Batch operations used
- ✅ No N+1 queries
- 🔵 Consider caching entity lookups

---

## Testing Coverage

- ✅ Unit tests added for new functions
- ✅ Edge cases covered
- ⚠️ Missing integration test

---

## Recommendations

### Must Do Before Merge
1. [Critical fix 1]
2. [Critical fix 2]

### Should Do
1. [Important improvement]
2. [Another improvement]

### Nice to Have
1. [Optional enhancement]

---

## Approval Status

**Decision:** [✅ Approved / ⚠️ Approved with Changes / ❌ Needs Rework]

**Next Steps:**
1. [Action item 1]
2. [Action item 2]
```

---

## After Review

### If Approved ✅
1. Merge code
2. Update documentation
3. Close related issues
4. Update memory bank if architecture changed

### If Changes Needed ⚠️
1. Create task list for developer
2. Prioritize critical issues
3. Provide code examples
4. Re-review after fixes

### If Rejected ❌
1. Explain fundamental issues
2. Suggest alternative approach
3. Point to relevant docs/examples
4. Consider updating rules if pattern should be avoided

---

## Self-Review Before Submitting

Developer should check these before requesting review:

```bash
# Format code
black custom_components/linus_brain/
ruff check custom_components/linus_brain/ --fix

# Type check
mypy custom_components/linus_brain/

# Run tests
pytest tests/ -v

# Check HA config
hass -c /config --script check_config

# Test in running HA
# 1. Reload integration
# 2. Trigger functionality
# 3. Check logs for errors
```

---

**Good code review catches bugs early. Be thorough but constructive.**
