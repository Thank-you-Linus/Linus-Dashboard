# Testing & Documentation Requirements

## Purpose

This document defines mandatory practices for testing and documentation to maintain code quality and keep project documentation up-to-date.

---

## Testing Requirements

### Always Run Tests After Implementation

**Rule:** After implementing any code changes, you MUST run the full test suite before marking the task as complete.

**Commands:**
```bash
# Format code
black custom_components/linus_brain/

# Run linting
ruff check custom_components/linus_brain/

# Run type checking (optional but recommended)
mypy custom_components/linus_brain/

# Run all tests
pytest custom_components/linus_brain/tests/

# Run tests with coverage
pytest --cov=custom_components/linus_brain
```

**Why:**
- Ensures code changes don't break existing functionality
- Verifies new code integrates correctly with existing codebase
- Catches regressions early
- Maintains code quality standards

**Exceptions:**
- Documentation-only changes (no code modifications)
- Configuration file updates that don't affect code behavior

---

## Documentation Requirements

### Always Update Documentation for Public API Changes

**Rule:** When adding, modifying, or removing public-facing features, you MUST update relevant documentation.

**Documentation Files to Consider:**

| File | Update When... |
|------|---------------|
| `README.md` | Adding/removing major features, changing core functionality |
| `CONFIGURATION.md` | Adding/changing configuration options, entity behavior |
| `RULE_FORMAT.md` | Adding/changing condition types, action formats, rule structure |
| `QUICKSTART.md` | Changing setup steps, initial configuration |
| `docs/STRUCTURE.md` | Adding/removing modules, changing architecture |
| `docs/DATA_FLOW.md` | Changing data flow, API contracts, integration points |

**What to Update:**
1. **Examples** - Update code examples to reflect new API
2. **Descriptions** - Add descriptions for new features
3. **Tables** - Update tables listing features, options, or conditions
4. **Migration Notes** - Document breaking changes or deprecations

**Why:**
- Keeps documentation synchronized with code
- Helps users understand new features
- Prevents confusion from outdated documentation
- Reduces support burden

**Example Scenarios:**

✅ **Update required:**
- Added new condition type `area_state` → Update `RULE_FORMAT.md`
- Renamed `room_state` to `area_state` → Update all docs with examples
- Added new service → Update `README.md` services section

❌ **Update not required:**
- Refactored internal helper function (private API)
- Fixed typo in code comment
- Updated test file

---

## Workflow

### Standard Development Workflow

1. **Implement** the feature/fix
2. **Update tests** if needed (add new tests for new features)
3. **Run test suite** (black, ruff, pytest)
4. **Update documentation** for public API changes
5. **Verify documentation** renders correctly (check markdown formatting)
6. **Mark task complete** only after all above steps are done

### Quick Checklist

Before marking any implementation task as complete:

- [ ] Code implemented
- [ ] Tests updated (if adding new functionality)
- [ ] Test suite passes (black, ruff, pytest)
- [ ] Documentation updated (if public API changed)
- [ ] Examples updated (if behavior changed)
- [ ] No broken links in documentation

---

## Documentation Style Guide

### Code Examples

Always use proper markdown code fences with language hints:

````markdown
```python
# Python code example
from custom_components.linus_brain import EntityResolver
```

```yaml
# YAML configuration example
condition: activity
area: current
activity: presence
```
````

### Condition/Action Listings

Use tables for structured information:

```markdown
| Condition Type | Description | Example |
|---------------|-------------|---------|
| `activity` | Check activity level | `activity: presence` |
| `area_state` | Check environmental state | `state: is_dark` |
```

### Cross-References

Always link to related documentation:

```markdown
For complete rule format documentation, see [RULE_FORMAT.md](RULE_FORMAT.md).
```

---

## Testing Patterns to Catch Production Bugs

### Test Continuous Re-evaluation for Transition States

**Rule:** When testing state machines with transition states (like activity transitions), ALWAYS add tests that simulate continuous re-evaluation during transition periods.

**Why:** Production systems often have heartbeats or continuous evaluation loops that can interfere with timeouts. Tests that evaluate once and wait don't catch these issues.

**Example Pattern:**

```python
# ❌ BAD: Test only evaluates once, then waits
async def test_transition():
    await tracker.evaluate()  # Triggers transition
    await asyncio.sleep(timeout)  # Just wait
    assert tracker.get_state() == "final"

# ✅ GOOD: Test simulates continuous re-evaluation
async def test_transition_with_reevaluation():
    await tracker.evaluate()  # Triggers transition
    
    # Simulate continuous re-evaluation (like heartbeat)
    for _ in range(3):
        await asyncio.sleep(0.5)
        await tracker.evaluate()  # Re-evaluate during transition
    
    await asyncio.sleep(remaining_time)
    assert tracker.get_state() == "final"
```

**Real Bug Caught:** Activity tracker would cancel transition timeouts when re-evaluated during transition state, causing activities to get stuck on "inactive" instead of transitioning to "empty".

**Test File:** `test_inactive_transition.py::test_inactive_transitions_to_empty_despite_continuous_reevaluation`

---

## Common Pitfalls

### ❌ Don't Do This

```markdown
# Task complete! ✅

I've updated the code to use `area_state` instead of `room_state`.
```

**Problem:** No tests run, no documentation updated.

### ✅ Do This Instead

```markdown
# Task complete! ✅

Changes:
1. Updated condition_evaluator.py to use `area_state`
2. Updated test_switch_rule_display.py references
3. Ran full test suite (48 passed)
4. Updated RULE_FORMAT.md with `area_state` documentation
5. Added activity vs area_state philosophy section
```

---

## Integration with AI Agents

When working with AI coding assistants:

1. **Before completing a task:**
   - Ask: "Have I run the tests?"
   - Ask: "Have I updated relevant documentation?"

2. **Use TODO tracking:**
   - Create separate todos for "Run tests" and "Update docs"
   - Don't mark parent task complete until all sub-tasks done

3. **Session handoff:**
   - Include "Tests status" and "Docs status" in session summaries
   - Clearly mark what documentation still needs updating

---

## Rationale

### Why Mandatory Testing?

Without systematic testing:
- Silent bugs creep into codebase
- Refactoring becomes risky
- Confidence in code quality erodes
- Development velocity slows down

### Why Mandatory Documentation?

Without updated documentation:
- Users can't discover new features
- Old examples mislead users
- Support burden increases
- Adoption suffers

---

## Summary

✅ **Test every code change** before marking complete  
✅ **Update docs for public API changes** immediately  
✅ **Follow the workflow checklist** consistently  
✅ **Cross-reference related docs** for discoverability  
✅ **Keep examples up-to-date** with current API  

These practices ensure Linus Brain maintains high quality code and documentation standards throughout its development lifecycle.
