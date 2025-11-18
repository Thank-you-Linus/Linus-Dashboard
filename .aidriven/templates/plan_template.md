# 📋 Implementation Plan Template

*Copy this template when creating plans in `.aidriven/prompts/elaborate_plan.md`*

---

# 📋 Implementation Plan: [Feature Name]

**Generated:** [Date]  
**Estimated Time:** [X hours/days]  
**Complexity:** [Low/Medium/High]  
**Model Used:** Claude Opus 4.1 (Planning Mode)

---

## 🎯 Objective

[2-3 clear sentences explaining:]
- What we're building
- Why we're building it
- What problem it solves

**Success Criteria:**
- [Specific, measurable outcome 1]
- [Specific, measurable outcome 2]
- [Specific, measurable outcome 3]

---

## 📊 Current State Analysis

### What Exists
- **File:** `path/to/file.py` - [Current purpose and functionality]
- **Component:** [Name] - [What it does now]
- **Data Flow:** [How data currently moves]

### What's Missing
- [Gap 1]
- [Gap 2]
- [Gap 3]

### What Needs Changing
- [Change 1] - [Why]
- [Change 2] - [Why]

### Constraints
- [Technical constraint 1]
- [Performance constraint 2]
- [Compatibility constraint 3]

---

## 🏗️ Proposed Solution

### Architecture Overview

```
[ASCII diagram or description of architecture]

┌─────────────┐         ┌─────────────┐
│  Component  │────────▶│  Component  │
│      A      │         │      B      │
└─────────────┘         └─────────────┘
       │                       │
       ▼                       ▼
┌─────────────┐         ┌─────────────┐
│   Storage   │         │     API     │
└─────────────┘         └─────────────┘
```

### Key Design Decisions

**Decision 1: [Decision Name]**
- **Rationale:** [Why we chose this approach]
- **Alternatives Considered:** [What else we looked at]
- **Trade-offs:** [What we're gaining vs losing]

**Decision 2: [Decision Name]**
- [...]

### Data Flow

```
[Step-by-step data flow]
1. User action → Event listener
2. Event listener → Debounce (5s)
3. Debounce → Coordinator
4. Coordinator → API client
5. API client → Supabase
```

### Error Handling Strategy
- [Error type 1] → [Handling approach]
- [Error type 2] → [Handling approach]
- Fallback: [What happens if everything fails]

---

## 📝 Detailed Tasks

### Phase 1: [Setup/Preparation]

**Duration:** [X hours]  
**Goal:** [What this phase accomplishes]

#### Task 1.1: [Clear, Action-Oriented Title]

**Objective:** [One sentence: what this task accomplishes]

**Files to Create:**
- `path/to/new/file.py` - [Purpose]

**Files to Modify:**
- `path/to/existing/file.py` - [Specific changes]
  - Line ~X: [What to add/change]
  - Function `func_name`: [Modification needed]

**Implementation Steps:**

1. **[Step 1 Title]**
   ```python
   # Provide actual code example
   class NewClass:
       """Docstring explaining purpose."""
       
       def __init__(self, hass: HomeAssistant) -> None:
           """Initialize with dependencies."""
           self.hass = hass
       
       async def main_method(self, param: str) -> dict[str, Any]:
           """
           Main functionality.
           
           Args:
               param: Description
           
           Returns:
               Result dictionary
           
           Raises:
               HomeAssistantError: When operation fails
           """
           try:
               result = await self._process(param)
               return result
           except Exception as err:
               _LOGGER.error("Operation failed: %s", err)
               raise HomeAssistantError(f"Failed: {err}") from err
   ```

2. **[Step 2 Title]**
   [Specific instructions with code]

3. **[Step 3 Title]**
   [Validation instructions]

**Dependencies:**
- [ ] Task X must be complete first
- [ ] Requires new package: `package_name>=version`
- [ ] Needs environment variable: `VAR_NAME`

**Acceptance Criteria:**
- [ ] [Specific, testable criterion 1]
- [ ] [Specific, testable criterion 2]
- [ ] Code follows all rules in `.aidriven/rules/`
- [ ] No errors in HA logs
- [ ] Tests pass

**Potential Issues & Solutions:**

| Issue | Probability | Impact | Solution |
|-------|------------|--------|----------|
| [Issue 1] | High/Med/Low | High/Med/Low | [How to handle] |
| [Issue 2] | High/Med/Low | High/Med/Low | [How to handle] |

**Testing:**
```python
# Test code for this task
async def test_new_functionality():
    """Test description."""
    # Arrange
    hass = ...
    component = NewClass(hass)
    
    # Act
    result = await component.main_method("test")
    
    # Assert
    assert result["status"] == "success"
```

**Estimated Time:** [X hours]  
**Complexity:** [Low/Medium/High]

---

#### Task 1.2: [Next Task]
[Same structure as above]

---

### Phase 2: [Core Implementation]

**Duration:** [X hours]  
**Goal:** [What this phase accomplishes]

#### Task 2.1: [Task Title]
[Same structure...]

#### Task 2.2: [Task Title]
[Same structure...]

---

### Phase 3: [Integration & Testing]

**Duration:** [X hours]  
**Goal:** [What this phase accomplishes]

#### Task 3.1: Integration Testing
[...]

#### Task 3.2: Error Scenario Testing
[...]

---

### Phase 4: [Documentation & Polish]

**Duration:** [X hours]  
**Goal:** [What this phase accomplishes]

#### Task 4.1: Update Documentation
[...]

#### Task 4.2: Code Review
[...]

---

## 🧪 Testing Strategy

### Unit Tests

**What to Test:**
- [ ] Individual functions in isolation
- [ ] Edge cases (empty inputs, null values)
- [ ] Error conditions
- [ ] Type correctness

**Test Files:**
- `tests/test_new_module.py` - [What it tests]

**Example:**
```python
@pytest.mark.asyncio
async def test_calculation_with_valid_data():
    """Test calculation produces correct result."""
    # ...
```

### Integration Tests

**What to Test:**
- [ ] Component interaction
- [ ] Data flow end-to-end
- [ ] External API calls (mocked)
- [ ] Home Assistant lifecycle

**Scenarios:**
1. Happy path: [Description]
2. Error case: [Description]
3. Edge case: [Description]

### Manual Testing Checklist

**In Development:**
- [ ] Start HA in devcontainer
- [ ] Integration loads without errors
- [ ] Service calls work
- [ ] Entities appear in UI
- [ ] Logs show expected behavior

**In Production:**
- [ ] Upgrade from previous version works
- [ ] Config validation works
- [ ] Performance is acceptable
- [ ] No memory leaks

---

## 🚨 Risks & Mitigation

### High Risk

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| [Risk 1: API rate limits] | High | Medium | Implement caching + backoff |
| [Risk 2: Breaking change] | High | Low | Version check + migration |

### Medium Risk

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| [Risk 3: Performance] | Medium | Medium | Batch operations + profiling |

### Low Risk

| Risk | Impact | Probability | Mitigation |
|------|--------|------------|------------|
| [Risk 4: Minor bug] | Low | High | Comprehensive tests |

---

## 📚 References

### Documentation
- [Home Assistant Dev Docs](https://developers.home-assistant.io/)
- [Supabase API Docs](https://supabase.com/docs)
- [aiohttp Documentation](https://docs.aiohttp.org/)

### Related Code
- `custom_components/linus_brain/coordinator.py` - Similar pattern
- `custom_components/linus_brain/utils/supabase_client.py` - API client reference

### External Resources
- [Tutorial/Article Link]
- [GitHub Issue/Discussion]
- [Example Implementation]

---

## 💾 Database Changes

**Tables to Create:**
```sql
CREATE TABLE new_table (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    field1 TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Tables to Modify:**
```sql
ALTER TABLE existing_table
ADD COLUMN new_field JSONB DEFAULT '{}'::jsonb;
```

**Indexes to Add:**
```sql
CREATE INDEX idx_table_field
ON table_name(field_name);
```

---

## 🔄 Migration Plan

**From Version:** [X.Y.Z]  
**To Version:** [X.Y.Z]

**Breaking Changes:**
- [Change 1] - Users must: [Action]
- [Change 2] - Users must: [Action]

**Migration Steps:**
1. [Step 1]
2. [Step 2]
3. [Step 3]

**Rollback Plan:**
- If migration fails: [How to rollback]
- Data backup: [What to backup]

---

## ✅ Definition of Done

### Functional Requirements
- [ ] All user stories implemented
- [ ] All acceptance criteria met
- [ ] No known bugs
- [ ] Error handling complete

### Technical Requirements
- [ ] Code follows `.aidriven/rules/`
- [ ] All functions have type hints
- [ ] All public APIs documented
- [ ] No blocking I/O in async code
- [ ] Tests achieve >80% coverage
- [ ] Performance benchmarks met

### Quality Gates
- [ ] All tests pass (`pytest tests/`)
- [ ] Type checking passes (`mypy`)
- [ ] Linting passes (`ruff check`)
- [ ] Formatting correct (`black --check`)
- [ ] No errors in HA logs
- [ ] Integration loads/unloads cleanly

### Documentation
- [ ] README updated
- [ ] Docstrings complete
- [ ] CHANGELOG updated
- [ ] Migration guide written (if needed)

### Review
- [ ] Code reviewed by AI
- [ ] Plan reviewed by user
- [ ] No critical issues remaining

---

## 📈 Success Metrics

**How We'll Measure Success:**
- Metric 1: [Description] - Target: [Value]
- Metric 2: [Description] - Target: [Value]
- Metric 3: [Description] - Target: [Value]

**Monitoring:**
- [What to watch in logs]
- [What to measure in metrics]
- [What to validate in tests]

---

## 🔄 Post-Implementation

**Immediate Follow-up:**
1. Monitor logs for 24 hours
2. Check for user reports
3. Verify performance metrics

**Future Enhancements:**
- [Enhancement 1]
- [Enhancement 2]
- [Enhancement 3]

**Technical Debt:**
- [Debt item 1] - [Why it exists]
- [Debt item 2] - [Plan to address]

---

**END OF PLAN**

*This plan should be approved before starting implementation. Any deviations during implementation should be documented.*
