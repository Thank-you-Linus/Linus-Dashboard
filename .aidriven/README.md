# 🤖 AI-Driven Development Workflow

> **Inspired by Riven Dev Method**  
> **Goal**: Code 2-5× faster with stable, maintainable code

---

## 🎯 What is This?

This `.aidriven/` directory contains the **AI memory system** for the Linus Dashboard project. It enables systematic AI-assisted development by separating:

1. **Memory** (`memorybank.md`) - Project architecture and decisions
2. **Rules** (`rules/*.md`) - Coding standards and patterns
3. **Prompts** (`prompts/*.md`) - AI interaction workflows
4. **Templates** (`templates/*.md`) - Structured outputs

---

## 📁 Structure

```
.aidriven/
├── memorybank.md           # Single source of truth about the project
├── AGENTS.md               # Quick command reference for agents
├── rules/
│   ├── clean_code.md       # Universal clean code standards
│   ├── homeassistant_integration.md  # HA-specific patterns
│   ├── async_patterns.md   # Async/await best practices
│   ├── entity_naming.md    # Entity naming conventions
│   ├── translations.md     # Translation and i18n rules
│   └── testing_documentation.md  # Testing standards
├── prompts/
│   ├── elaborate_plan.md   # Planning phase (Thinking mode)
│   ├── implement.md        # Implementation phase (Execution mode)
│   ├── debug.md            # Debugging and troubleshooting
│   └── review.md           # Code review checklist
└── templates/
    ├── plan_template.md    # Template for technical plans
    └── implementation_template.md  # Template for implementation logs
```

---

## 🔄 Workflow

### Two-Phase Development

#### Phase 1: 🧠 Planning (Thinking Mode)
**Model:** Claude Opus 4.1 (Deep reasoning)

**Process:**
1. Load context from `memorybank.md` + `rules/*.md`
2. Analyze requirements
3. Design architecture
4. Break down into tasks
5. Generate detailed plan using `templates/plan_template.md`
6. **WAIT FOR USER APPROVAL** ✋

**Example:**
```
You: "Add TypeScript support for custom embedded card types"

AI: [Loads .aidriven/ context]
    [Creates detailed plan with:]
    - 6 specific tasks
    - Code examples for each
    - Type definitions
    - Testing approach
    - Estimated 4 hours
    
    "Please review this plan before I implement"
```

#### Phase 2: ⚙️ Implementation (Execution Mode)
**Model:** Claude Sonnet (Fast execution)

**Process:**
1. Follow approved plan step-by-step
2. Apply ALL rules from `rules/*.md`
3. Write clean, typed, documented code
4. Build and test
5. Validate against plan
6. Loop until complete

**Example:**
```
You: "Approved, proceed with implementation"

AI: [Implements Task 1]
    ✅ Created types/custom-cards.ts
    ✅ Added TypeScript definitions
    ✅ Type check passes
    
    [Implements Task 2]
    ✅ Modified embedLovelace.ts
    ✅ Added card type validation
    
    ... continues until done
```

---

## 🚀 How to Use

### For New Features

```bash
# 1. Ask AI to plan (with context loading)
"Claude, load .aidriven/ context and create a plan for: [feature description]"

# AI loads memorybank.md + rules, generates plan

# 2. Review and approve plan
"Looks good, proceed" or "Change X, then proceed"

# 3. AI implements following the plan
# AI automatically checks each step against rules

# 4. Build and test
npm run build
./ha-env/bin/hass -c /config

# 5. Review before commit
"Claude, use review.md to review these changes"
```

### For Debugging

```bash
# AI uses debug.md workflow
"Claude, use .aidriven/prompts/debug.md to investigate this error: [error message]"

# AI:
# 1. Loads context
# 2. Analyzes root cause (frontend vs backend)
# 3. Provides fix with explanation
# 4. Suggests rule update to prevent recurrence
```

### For Code Review

```bash
# Before committing
"Claude, review my changes using .aidriven/prompts/review.md"

# AI checks:
# - Code quality (TypeScript and Python)
# - Rule compliance
# - Type safety
# - Performance
# - Testing
# - Build verification
```

---

## 📚 Key Files

### `memorybank.md` - The Brain

**Contains:**
- Complete architecture overview
- Technology stack decisions (Rspack, TypeScript, Mushroom cards)
- File structure and responsibilities
- Data flow diagrams
- Configuration schema
- Decision log (why things are the way they are)
- Known issues and future plans

**Update when:**
- Architecture changes
- New patterns emerge
- Design decisions made
- Dependencies added/removed
- Build configuration changes

### `rules/*.md` - The Standards

**Purpose:** Ensure consistent, high-quality code

**clean_code.md:**
- Naming conventions (TypeScript and Python)
- Function structure
- Type hints
- Documentation (JSDoc and docstrings)
- Error handling
- Testing

**homeassistant_integration.md:**
- Integration lifecycle
- Config flow patterns
- Resource registration
- Static path handling
- WebSocket API patterns
- Cache-busting strategies

**async_patterns.md:**
- Async/await usage (TypeScript and Python)
- Non-blocking I/O
- Concurrent operations
- Error handling in async context

**entity_naming.md:**
- Entity ID conventions
- Area naming
- Domain naming
- Consistency rules

**translations.md:**
- Translation key format
- English and French translations
- Placeholder usage
- String formatting

**testing_documentation.md:**
- Testing workflow
- Manual testing checklist
- Browser cache issues
- Integration testing

### `prompts/*.md` - The Workflows

**Purpose:** Guide AI through specific tasks

**elaborate_plan.md:**
- Requirements analysis
- Architecture design (frontend and backend)
- Task breakdown
- Build strategy
- Risk assessment

**implement.md:**
- TypeScript code structure
- Python code structure
- Build process
- Common patterns (views, cards, chips)
- Validation checklist
- Testing approach

**debug.md:**
- Error analysis (frontend vs backend)
- Bundle inspection
- Root cause investigation
- Fix strategies
- Prevention measures

**review.md:**
- Code quality checks (TypeScript and Python)
- Rule compliance
- Type safety
- Build verification
- Performance analysis

---

## 💡 Examples

### Example 1: Adding New View Type

**Request:**
> "Add a new aggregate view for all vacuums with room-based grouping"

**AI Planning Response:**
```markdown
# 📋 Implementation Plan: Vacuum Aggregate View

## 🎯 Objective
Create a new aggregate view that shows all vacuum entities grouped by room/area

## 📝 Tasks

### Task 1: Create VacuumView Class
**Files to Create:**
- src/views/VacuumView.ts

**Code:**
```typescript
import { AbstractView } from "./AbstractView";
import { VacuumCard } from "../cards/VacuumCard";

export class VacuumView extends AbstractView {
  getCards(): LovelaceCardConfig[] {
    const vacuums = Helper.getEntities().filter(e => e.domain === "vacuum");
    return vacuums.map(v => new VacuumCard().getCard(v));
  }
}
```

### Task 2: Register in Strategy
**Files to Modify:**
- src/linus-strategy.ts
- src/variables.ts

[... detailed plan continues ...]

**Estimated:** 3 hours across 5 tasks
```

**After Approval:**
AI implements each task, following all rules, builds, and tests.

### Example 2: Debugging Cache Issue

**Request:**
> "Users report 'red error' after updating to v1.3.0"

**AI Debug Response:**
```markdown
## 🐛 Debug Analysis

### Root Cause
Browser is loading old JavaScript bundle from cache. The cache-busting version parameter may not be applied correctly.

### Investigation Steps
1. Check `__init__.py` → `register_static_paths_and_resources()`
2. Verify version is read from `manifest.json` via `get_version()`
3. Confirm versioned_url is constructed: `f"{js_url}?v={manifest_version}"`
4. Check resource registration logs

### Fix
Ensure `get_version()` correctly reads from manifest and returns version string:

```python
def get_version() -> str:
    """Get the version from manifest.json."""
    manifest_path = Path(__file__).parent / "manifest.json"
    try:
        with manifest_path.open(encoding="utf-8") as manifest_file:
            manifest = json.load(manifest_file)
            return manifest.get("version", "unknown")
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        _LOGGER.exception("Failed to read version from manifest")
        return "unknown"
```

### User Instructions
Add to documentation:
- Clear browser cache (Ctrl+Shift+R)
- Check version query parameter in DevTools → Network tab

### Prevention
Update `testing_documentation.md` to include cache-clearing in testing checklist.
```

---

## 🔄 Continuous Improvement

### Update Rules

When patterns emerge:
```bash
# Good pattern discovered
→ Add to relevant rules/*.md

# Bad pattern avoided
→ Document in rules/*.md with example

# New framework version (Rspack, TypeScript)
→ Update patterns in rules
```

### Update Memory Bank

When architecture changes:
```bash
# New component added
→ Document in memorybank.md structure

# Design decision made
→ Add to decision log

# Dependency changed
→ Update technology stack section

# Build configuration changed
→ Update development workflow section
```

### Refine Prompts

When workflow improves:
```bash
# Better way to plan found
→ Update elaborate_plan.md

# More efficient debugging
→ Enhance debug.md checklist

# New testing pattern
→ Update implement.md validation
```

### 📝 Documentation Updates with Bug Fixes and Features

**CRITICAL RULE:** Every bug fix and new feature MUST update documentation.

#### When a Bug is Fixed

```bash
# 1. Fix the bug
→ Implement the fix in code (TypeScript or Python)

# 2. Update component documentation
→ Update relevant README.md or inline comments
→ Add/clarify sections that would have prevented the bug

# 3. Update .aidriven/memorybank.md
→ Document architectural details that were unclear
→ Add to "Known Issues" if workarounds exist
→ Update data flow if it was misunderstood

# 4. Update rules/*.md
→ Add pattern to prevent similar bugs
→ Document correct implementation approach
→ Add validation checklist items

# 5. Build and test
→ npm run build
→ Restart Home Assistant
→ Verify fix works
```

**Example:**
```
Bug: Embedded dashboards not loading due to incorrect path resolution

Fix Applied:
✅ Code: Updated embedLovelace.ts path resolution logic
✅ Docs: Updated memorybank.md embedded dashboard flow
✅ Memory: Added to decision log explaining path format
✅ Rules: Added to homeassistant_integration.md validation checklist
✅ Build: npm run build succeeded
✅ Test: Verified embedded dashboards load correctly
```

#### When a Feature is Added

```bash
# 1. Implement the feature
→ Write code following plan (TypeScript or Python)

# 2. Add inline documentation
→ JSDoc/docstrings with examples
→ Type hints for all parameters
→ Usage examples in module docstring

# 3. Update user-facing docs
→ Add to README.md feature list
→ Update inline comments for complex logic

# 4. Update .aidriven/memorybank.md
→ Document architectural changes
→ Add to technology stack if dependencies added
→ Update data flow diagrams
→ Document design decisions

# 5. Update rules/*.md
→ Add new patterns introduced
→ Document best practices for feature usage
→ Add testing requirements

# 6. Build and test
→ npm run build
→ npm run type-check
→ npm run lint
→ Restart Home Assistant
→ Test feature thoroughly
```

**Example:**
```
Feature: Custom chip support for embedded dashboards

Implementation:
✅ Code: Added ChipProcessor class to embedLovelace.ts
✅ Types: Added CustomChipConfig interface
✅ Inline: Full JSDoc with examples
✅ User Docs: Updated README with custom chip example
✅ Memory: Added to memorybank.md "Embedded Dashboards" section
✅ Rules: Added pattern to homeassistant_integration.md
✅ Build: npm run build succeeded
✅ Test: Verified custom chips render correctly
```

#### Documentation Quality Checklist

Before considering a bug fix or feature complete:

- [ ] **Code has documentation** - JSDoc/docstrings for all public methods
- [ ] **Type hints present** - All parameters and returns typed
- [ ] **User docs updated** - README reflects change
- [ ] **Memory bank updated** - Architecture section reflects reality
- [ ] **Rules updated** - Patterns added to prevent similar issues
- [ ] **Build succeeds** - `npm run build` passes without errors
- [ ] **Type check passes** - `npm run type-check` succeeds
- [ ] **Lint passes** - `npm run lint` succeeds (MUST fix errors before commit)
- [ ] **Manual test** - Feature/fix verified in running HA instance

#### 🚨 CRITICAL: Linting Before Commit

**MANDATORY RULE:** You MUST run `npm run lint` before EVERY commit.

**Why This Matters:**
- ❌ Committing without linting introduces code quality issues
- ❌ Linting errors can break CI/CD pipelines
- ❌ Code style inconsistencies accumulate over time
- ❌ Type safety issues may be missed

**Process:**
```bash
# 1. ALWAYS run lint before staging files
npm run lint

# 2. If there are ERRORS (not just warnings), you MUST fix them
# Do NOT commit with linting errors

# 3. If lint fixes files automatically (--fix flag), review the changes
git diff

# 4. Only commit after lint succeeds (0 errors)
git add .
git commit -m "your message"
```

**Example - Correct Workflow:**
```bash
# Write code
vim src/linus-strategy.ts

# Run lint FIRST
npm run lint
# Output: ✖ 1 problem (1 error, 0 warnings)

# Fix the error
# Re-run lint
npm run lint
# Output: ✖ 0 problems (0 errors, 31 warnings)  ← Warnings are OK

# NOW you can commit
git add src/linus-strategy.ts
git commit -m "feat: implement smart version management"
```

**Warnings vs Errors:**
- **Errors (red ✖)**: MUST be fixed before commit
- **Warnings (yellow ⚠)**: Should be addressed but won't block commit

**AI Agent Rule:**
When an AI agent (like me) is about to commit code:
1. I MUST run `npm run lint` first
2. I MUST fix any errors (not just warnings)
3. I MUST verify 0 errors before proceeding with commit
4. I MUST NOT commit code that fails linting

#### Why This Matters

**Problem:** Code changes without documentation updates lead to:
- ❌ AI agents making same mistakes repeatedly
- ❌ Users unable to understand features
- ❌ Team confusion about architecture
- ❌ Memory bank becoming outdated
- ❌ Rules not preventing known issues
- ❌ Build issues not caught early

**Solution:** Systematic documentation updates ensure:
- ✅ AI agents learn from fixes
- ✅ Users have accurate information
- ✅ Team stays aligned
- ✅ Memory bank stays current
- ✅ Rules prevent regression
- ✅ Build quality maintained

---

## ⚡ Benefits

### Speed
- **2-5× faster** development
- Plans prevent back-and-forth
- Rules prevent mistakes
- Templates ensure consistency
- Build automation saves time

### Quality
- **Consistent** code style (TypeScript and Python)
- **Complete** error handling
- **Type safety** enforced
- **Comprehensive** testing
- **Maintainable** architecture

### Knowledge
- **Documented** decisions
- **Shared** patterns
- **Preserved** context
- **Onboarding** easier
- **Build process** clear

---

## 🎓 Best Practices

### 1. Always Load Context

❌ **Bad:**
```
"Add a new card type"
```

✅ **Good:**
```
"Claude, load .aidriven/memorybank.md and rules, then create a plan to add a new card type for displaying battery status with percentage and state"
```

### 2. Plan Before Building

❌ **Bad:**
```
"Build custom chip support" → Immediate coding without plan
```

✅ **Good:**
```
"Create a plan for custom chip support" → Review → "Approved" → Implementation
```

### 3. Follow the Plan

❌ **Bad:**
Deviating from approved plan without documenting

✅ **Good:**
Following plan exactly, noting any necessary deviations with rationale

### 4. Update Memory

❌ **Bad:**
Implementing feature, forgetting to update memorybank.md

✅ **Good:**
Update memorybank.md when architecture changes, document decisions

### 5. Review Before Commit

❌ **Bad:**
Committing without linting, AI review, or manual testing

✅ **Good:**
```bash
npm run lint          # MANDATORY - Fix all errors
npm run type-check    # Verify types
npm run build         # Ensure build works
# Manual test in HA
# Then: "Claude, review these changes using review.md"
git commit
```

### 6. Build and Test

❌ **Bad:**
Committing TypeScript changes without linting and building

✅ **Good:**
```bash
npm run lint          # FIRST - Fix all errors before proceeding
npm run type-check    # Verify types
npm run build         # Build the project
./ha-env/bin/hass -c /config
# Test in browser, clear cache
```

---

## 🚀 Quick Start Commands

```bash
# Planning
"Claude, load .aidriven/ and plan: [feature]"

# Implementation
"Claude, implement the approved plan using implement.md"

# Debugging
"Claude, debug using debug.md: [error]"

# Review
"Claude, review these changes using review.md"

# Update Rules
"Claude, add this pattern to rules/homeassistant_integration.md"

# Lint, Build and Test (ALWAYS in this order before commit)
npm run lint && npm run type-check && npm run build
```

---

## 📊 Metrics

Track your improvement:
- **Planning time** vs **implementation time**
- **Bugs caught** in review vs production
- **Code quality** scores (type coverage, lint errors)
- **Build time** (Rspack performance)
- **Bundle size** (monitor growth)

Expected improvements:
- 80% less back-and-forth
- 90% fewer bugs in production
- 100% consistent code style
- 200-500% faster feature development
- Faster build times with Rspack

---

## 🔗 Integration with Tools

### Optional Enhancements

- **VS Code**: TypeScript intellisense, debugging
- **Browser DevTools**: Frontend debugging, network inspection
- **Home Assistant**: Live testing, log inspection

### VS Code Integration

This workflow works in VS Code with:
- GitHub Copilot Chat
- Claude Code (Anthropic extension)
- Continue extension
- Any AI assistant with file access

---

## 📝 Maintenance

### Weekly
- Review implemented features
- Update memorybank if architecture changed
- Refine rules based on code reviews
- Check bundle size trends

### Monthly
- Audit rule compliance
- Optimize prompts
- Update dependencies (Rspack, TypeScript, etc.)
- Share learnings with team

### Per Release
- Version bump all files (`npm run bump`)
- Update changelog
- Test cache-busting
- Verify build artifacts

---

## 🤝 Team Usage

### For Solo Development
- Personal memory system
- Consistent self-review
- Knowledge preservation
- Faster onboarding to own code

### For Teams
- Shared coding standards (TypeScript and Python)
- Onboarding resource
- Design documentation
- Code review baseline
- Build process documentation

---

## ❓ FAQ

**Q: Do I need Claude Opus for everything?**  
A: No. Use Opus for planning (deep thinking), Sonnet for implementation (fast execution).

**Q: What if AI suggests something not in rules?**  
A: Either update the rule or reject the suggestion. Rules are the source of truth.

**Q: Can I use with other AI models?**  
A: Yes! The system works with GPT-4, Gemini, or any AI that can read files.

**Q: How do I handle conflicts between rules?**  
A: More specific rules override general ones. Document resolution in memorybank.md.

**Q: Do I commit `.aidriven/` to git?**  
A: Yes! It's valuable team knowledge, not secrets.

**Q: Why Rspack instead of Webpack?**  
A: Faster builds (5-10x), better TypeScript support, active development.

**Q: How do I test frontend changes?**  
A: Build (`npm run build`), restart HA, clear browser cache, test in UI.

---

## 🎯 Success Criteria

You're using this system correctly when:

1. ✅ **Every feature** starts with a plan
2. ✅ **Every plan** loads memorybank + rules
3. ✅ **Every implementation** follows the plan
4. ✅ **Every change** is linted BEFORE commit (0 errors required)
5. ✅ **Every change** builds successfully
6. ✅ **Every commit** passes AI review
7. ✅ **Every change** updates memory if needed
8. ✅ **Every release** increments version correctly

---

## 🚀 Get Started

```bash
# 1. Read memorybank.md to understand the project
cat .aidriven/memorybank.md

# 2. Review rules for your next task
cat .aidriven/rules/*.md

# 3. Ask AI to create a plan
"Claude, load .aidriven/ and plan: [your feature]"

# 4. Follow the workflow
Plan → Approve → Implement → Build → Test → Review → Commit
```

---

**Happy AI-Driven Development! 🚀🧠**

*For questions or improvements, update this README or the relevant files.*
