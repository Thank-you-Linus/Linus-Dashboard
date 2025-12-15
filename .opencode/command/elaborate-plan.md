---
description: Create detailed technical plans before implementation
agent: general
---

# 🧠 Elaborate Plan Prompt

Use this prompt to create detailed technical plans before implementation.

---

## Before Planning

**Model: Claude Opus 4.1 (Deep Thinking)**

**MANDATORY: Load Context**
1. `.aidriven/memorybank.md` - Full project architecture
2. `.aidriven/rules/*.md` - All coding rules
3. Existing codebase files (read relevant modules)
4. User's feature request

---

## Planning Mode

**Your Role:** Expert software architect analyzing requirements and designing implementation plans.

**Your Task:** Create a step-by-step technical plan that a developer can follow without making decisions.

**Output:** Detailed plan using `.aidriven/templates/plan_template.md`

---

## Planning Process

### Step 1: Understand Requirements

**Questions to Answer:**
1. What is the user trying to accomplish?
2. What files/components are involved?
3. What data needs to flow where?
4. What edge cases exist?
5. What could go wrong?

**Document:**
- User's goal (in plain language)
- Success criteria (what "done" looks like)
- Constraints (performance, compatibility, etc.)
- Assumptions (what we're assuming is true)

### Step 2: Analyze Current State

**Review:**
- Existing code that will be modified
- Related components that might be affected
- Current data structures
- Existing patterns to follow

**Document:**
- Files that exist and their purpose
- Current behavior vs desired behavior
- Tech debt or issues to address
- Dependencies between components

### Step 3: Design Solution

**Architecture Decisions:**
- Which files need to be created/modified?
- What new classes/functions are needed?
- How will data flow through the system?
- What external APIs/services are involved?
- Where should errors be handled?
- What needs to be tested?

**Consider:**
- Async/await usage (never block event loop)
- Error handling strategy
- Logging and observability
- Performance implications
- Security concerns
- Backwards compatibility

### Step 4: Break Down Into Tasks

**Task Structure:**
```markdown
### Task N: [Clear, Action-Oriented Title]

**Objective:** [One sentence: what this task accomplishes]

**Files to Modify:**
- `path/to/file.py` - [Specific changes needed]

**Implementation Steps:**
1. [Concrete step with code examples]
2. [Another concrete step]
3. [Validation step]

**Dependencies:**
- Task M must be complete first
- Requires new dependency: `package>=version`

**Acceptance Criteria:**
- [ ] [Specific, testable criterion]
- [ ] [Another criterion]

**Potential Issues:**
- [Issue 1] - Solution: [How to handle]
- [Issue 2] - Solution: [How to handle]

**Estimated Complexity:** [Low/Medium/High]
```

### Step 5: Validate Plan

**Checklist:**
- [ ] All user requirements addressed?
- [ ] Edge cases considered?
- [ ] Error handling planned?
- [ ] Tests included in tasks?
- [ ] Rules from `.aidriven/rules/` followed?
- [ ] No blocking I/O in async code?
- [ ] Security considerations addressed?
- [ ] Performance impact assessed?
- [ ] Dependencies documented?
- [ ] Backwards compatibility maintained?

---

## Plan Template Structure

```markdown
# 📋 Implementation Plan: [Feature Name]

## 🎯 Objective
[Clear description of what we're building and why]

## 📊 Current State
[What exists now, what's missing]

## 🏗️ Proposed Architecture
[High-level design with diagrams if helpful]

## 📝 Tasks

### Phase 1: [Setup/Preparation]
[Tasks that prepare the codebase]

### Phase 2: [Core Implementation]
[Main feature development tasks]

### Phase 3: [Integration & Testing]
[Connect components and test]

### Phase 4: [Polish & Documentation]
[Final touches and docs]

## 🧪 Testing Strategy
[How to verify it works]

## 🚨 Risks & Mitigation
[What could go wrong and how to handle]

## 📚 References
[Links to docs, examples, related code]

## ✅ Success Criteria
[How we know we're done]
```

---

## Example: Good vs Bad Plans

### ❌ Bad Plan (Too Vague)

```markdown
### Task 1: Add MQTT support

**Steps:**
1. Add MQTT library
2. Write MQTT code
3. Test it

**Done when:** MQTT works
```

**Problems:**
- No specific files mentioned
- No code examples
- No error handling plan
- "Test it" is not specific
- Missing dependencies

### ✅ Good Plan (Specific & Actionable)

```markdown
### Task 1: Add MQTT Client Module

**Objective:** Create async MQTT client for subscribing to light state changes

**Files to Create:**
- `custom_components/linus_brain/utils/mqtt_client.py`

**Files to Modify:**
- `custom_components/linus_brain/manifest.json` - Add `aiomqtt>=2.0.0`
- `custom_components/linus_brain/__init__.py` - Initialize MQTT client
- `custom_components/linus_brain/config_flow.py` - Add MQTT broker config

**Implementation Steps:**

1. **Create MQTT Client Class**
   ```python
   from aiomqtt import Client
   
   class MQTTClient:
       """Async MQTT client for Home Assistant."""
       
       def __init__(self, hass: HomeAssistant, broker: str, port: int):
           self.hass = hass
           self.broker = broker
           self.port = port
           self._client: Client | None = None
       
       async def async_connect(self) -> None:
           """Connect to MQTT broker with error handling."""
           try:
               self._client = Client(self.broker, self.port)
               await self._client.__aenter__()
               _LOGGER.info("Connected to MQTT broker %s:%s", ...)
           except Exception as err:
               _LOGGER.error("MQTT connection failed: %s", err)
               raise HomeAssistantError(f"Cannot connect: {err}")
   ```

2. **Add Subscription Method**
   [Specific code example]

3. **Initialize in __init__.py**
   [Exact code placement]

4. **Add Config Flow Fields**
   [Schema definition]

**Dependencies:**
- None (can start immediately)
- Requires `aiomqtt>=2.0.0` in manifest.json

**Acceptance Criteria:**
- [ ] MQTT client connects to broker on integration setup
- [ ] Connection errors are caught and logged
- [ ] Client disconnects cleanly on integration unload
- [ ] Config flow validates broker connectivity
- [ ] No blocking calls (all async)

**Potential Issues:**
- **Broker unreachable**: Implement retry with exponential backoff (max 3 attempts)
- **Authentication required**: Add username/password to config flow
- **Port conflicts**: Default to 1883, allow custom in config

**Testing:**
1. Mock broker connection in `tests/test_mqtt_client.py`
2. Test connect/disconnect cycle
3. Test error handling with unreachable broker
4. Integration test with real Mosquitto broker (if available)

**Estimated Complexity:** Medium (async patterns, error handling)
```

---

## Common Planning Mistakes

### 1. Not Loading Context

❌ **Bad:** Planning without reading memorybank.md  
✅ **Good:** Understanding current architecture first

### 2. Vague Tasks

❌ **Bad:** "Improve performance"  
✅ **Good:** "Cache entity lookups with @lru_cache to reduce registry queries"

### 3. Missing Error Handling

❌ **Bad:** Just the happy path  
✅ **Good:** Plan for network failures, timeouts, bad data

### 4. No Code Examples

❌ **Bad:** "Add a function"  
✅ **Good:** Show function signature with types and docstring

### 5. Ignoring Rules

❌ **Bad:** Suggesting blocking I/O in async  
✅ **Good:** Always using aiohttp for HTTP requests

---

## After Planning

1. **Review plan yourself** - Does it make sense?
2. **Check against rules** - All patterns followed?
3. **Present to user** - Wait for approval
4. **Don't start coding** - Plan mode = thinking only
5. **Save plan** - For reference during implementation

---

## Plan Review Questions

Ask yourself:

1. Can a developer implement this without making decisions?
2. Are all files explicitly mentioned?
3. Are code examples provided?
4. Is error handling addressed?
5. Are tests included?
6. Will this work with the current architecture?
7. Does it follow all rules from `.aidriven/rules/`?
8. Are edge cases handled?
9. Is performance considered?
10. Is security addressed?

If any answer is "no", improve the plan.

---

## Output Format

Always use this structure:

```markdown
# 📋 Implementation Plan: [Feature Name]

*Generated: [Date]*  
*Estimated Time: [X hours]*  
*Complexity: [Low/Medium/High]*

---

## 🎯 Objective
[2-3 sentences on what and why]

## 📊 Current State Analysis
[What exists, what's missing, what needs changing]

## 🏗️ Proposed Solution
[High-level architecture with diagram if helpful]

## 📝 Detailed Tasks

### Phase 1: [Name]
[Tasks for this phase]

### Phase 2: [Name]
[Tasks for this phase]

[... more phases ...]

## 🧪 Testing Strategy
[How to verify each component and the whole feature]

## 🚨 Risks & Mitigation
- **Risk 1**: [Description] → **Mitigation**: [Solution]
- **Risk 2**: [Description] → **Mitigation**: [Solution]

## 📚 References
- [HA Docs link]
- [Existing code example]
- [External API docs]

## ✅ Definition of Done
- [ ] [Specific criterion]
- [ ] [Another criterion]
- [ ] All tests pass
- [ ] No errors in HA logs
- [ ] Documentation updated
```

---

**A good plan makes implementation 5× faster. Take time to plan thoroughly.**
