# 🚨 CRITICAL RULE: Linting Before Every Commit

## ⚡ The Golden Rule

**YOU MUST RUN `npm run lint` BEFORE EVERY COMMIT. NO EXCEPTIONS.**

## 🎯 Why This Rule Exists

**The Problem:**
- Committing code without linting introduces code quality issues
- Linting errors can break CI/CD pipelines
- Code style inconsistencies accumulate over time
- Type safety issues may be missed
- Other developers inherit broken code

**The Solution:**
- Run `npm run lint` before staging any files
- Fix ALL errors (not just warnings)
- Only commit after linting succeeds with 0 errors

## 📋 Mandatory Pre-Commit Workflow

### Step 1: Write Your Code
```bash
# Make your changes
vim src/linus-strategy.ts
vim custom_components/linus_dashboard/const.py
```

### Step 2: Run Lint (MANDATORY)
```bash
npm run lint
```

### Step 3: Analyze Results

**If you see errors:**
```
✖ 32 problems (1 error, 31 warnings)

/workspaces/Linus-Dashboard/src/linus-strategy.ts
  271:15  error  Variable name `__VERSION__` must match one of the following formats: camelCase
```

**YOU MUST FIX THE ERROR BEFORE PROCEEDING!**

### Step 4: Fix Errors
```typescript
// Add eslint-disable comment or fix the code
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __VERSION__: string;
```

### Step 5: Re-run Lint
```bash
npm run lint
```

### Step 6: Verify Success
```
✖ 31 problems (0 errors, 31 warnings)
```

**0 errors = You can proceed to commit!**

### Step 7: Additional Quality Checks
```bash
npm run type-check  # Verify TypeScript types
npm run build       # Ensure build succeeds
```

### Step 8: Commit
```bash
git add .
git commit -m "feat: your commit message"
```

## 🔴 Errors vs 🟡 Warnings

### Errors (🔴 BLOCKING)
- **Symbol:** `✖` with red color
- **Action:** MUST be fixed before commit
- **Examples:**
  - `@typescript-eslint/naming-convention` violations
  - Syntax errors
  - Undefined variables
  - Import/export errors

### Warnings (🟡 NON-BLOCKING)
- **Symbol:** `⚠` with yellow color
- **Action:** Should be addressed but won't block commit
- **Examples:**
  - `@typescript-eslint/no-shadow` - Variable shadowing
  - `@typescript-eslint/no-unused-vars` - Unused variables
  - `import/order` - Import ordering issues
  - `no-unsafe-optional-chaining` - Unsafe optional chaining

**Current State:**
- 0 errors ✅ (Required)
- 31 warnings ⚠️ (Acceptable, should be reduced over time)

## 🤖 AI Agent Rules

### When I (AI Agent) am about to commit:

1. **I MUST run `npm run lint` first**
   ```bash
   npm run lint
   ```

2. **I MUST check the exit code and output**
   - Count errors (not warnings)
   - If errors > 0, I MUST fix them

3. **I MUST fix ALL errors before proceeding**
   - Add eslint-disable comments with justification
   - OR fix the actual code issue
   - Re-run lint to verify

4. **I MUST verify 0 errors before git operations**
   ```bash
   # Only proceed if this shows 0 errors
   npm run lint
   ```

5. **I MUST NOT commit code that fails linting**
   - No exceptions
   - No "I'll fix it later"
   - No "It's just a warning"

## ✅ Correct Workflow Examples

### Example 1: Feature Implementation
```bash
# 1. Write code
vim src/cards/NewCard.ts

# 2. Run lint FIRST
npm run lint
# Output: ✖ 1 problem (1 error, 0 warnings)

# 3. Fix the error
vim src/cards/NewCard.ts
# Add: // eslint-disable-next-line @typescript-eslint/no-explicit-any

# 4. Re-run lint
npm run lint
# Output: ✖ 0 problems (0 errors, 0 warnings)

# 5. NOW commit
git add src/cards/NewCard.ts
git commit -m "feat: add new card type"
```

### Example 2: Bug Fix
```bash
# 1. Fix the bug
vim src/utils.ts

# 2. Run lint FIRST
npm run lint
# Output: ✖ 31 problems (0 errors, 31 warnings)  ← 0 errors = OK!

# 3. Run other checks
npm run type-check  # Verify types
npm run build       # Ensure build works

# 4. Commit
git add src/utils.ts
git commit -m "fix: resolve null pointer exception"
```

### Example 3: Multiple File Changes
```bash
# 1. Make changes to multiple files
vim src/linus-strategy.ts
vim custom_components/linus_dashboard/const.py
vim scripts/bump-version.sh

# 2. Run lint FIRST
npm run lint
# Output: ✖ 32 problems (1 error, 31 warnings)

# 3. Fix error in src/linus-strategy.ts
vim src/linus-strategy.ts

# 4. Re-run lint
npm run lint
# Output: ✖ 31 problems (0 errors, 31 warnings)  ← OK!

# 5. Build and commit
npm run build
git add .
git commit -m "feat: implement smart version management"
```

## ❌ Incorrect Workflow Examples

### ❌ Bad Example 1: Committing Without Linting
```bash
# Write code
vim src/linus-strategy.ts

# Commit directly (WRONG!)
git add src/linus-strategy.ts
git commit -m "feat: add version"
# This is WRONG - no linting was done!
```

### ❌ Bad Example 2: Ignoring Linting Errors
```bash
# Run lint
npm run lint
# Output: ✖ 32 problems (1 error, 31 warnings)

# Commit anyway (WRONG!)
git add .
git commit -m "feat: add feature"
# This is WRONG - there's 1 error!
```

### ❌ Bad Example 3: "I'll Fix It Later"
```bash
# Run lint
npm run lint
# Output: ✖ 1 problem (1 error, 0 warnings)

# "I'll fix this later, let me commit first" (WRONG!)
git commit -m "WIP: will fix lint later"
# This is WRONG - fix it NOW!
```

## 🔧 Common Linting Issues and Fixes

### Issue 1: Naming Convention
```typescript
// ❌ Error
declare const __VERSION__: string;

// ✅ Fix: Add disable comment
// eslint-disable-next-line @typescript-eslint/naming-convention
declare const __VERSION__: string;
```

### Issue 2: Variable Shadowing
```typescript
// ❌ Warning
function outer() {
  const data = "outer";
  function inner() {
    const data = "inner"; // Shadows outer 'data'
  }
}

// ✅ Fix: Rename variable
function outer() {
  const data = "outer";
  function inner() {
    const innerData = "inner";
  }
}
```

### Issue 3: Unused Variables
```typescript
// ❌ Warning
function process(entity, domain, area) {
  return entity.id;
  // domain and area are unused
}

// ✅ Fix: Prefix with underscore
function process(entity, _domain, _area) {
  return entity.id;
}
```

### Issue 4: Import Order
```typescript
// ❌ Warning
import { Helper } from "./Helper";
import type { LovelaceCardConfig } from "./types/homeassistant";
import { AbstractCard } from "./AbstractCard";

// ✅ Fix: Correct order (imports before types)
import { AbstractCard } from "./AbstractCard";
import { Helper } from "./Helper";
import type { LovelaceCardConfig } from "./types/homeassistant";
```

## 📊 Linting Output Format

```bash
$ npm run lint

/workspaces/Linus-Dashboard/src/linus-strategy.ts
  271:15  error  Variable name `__VERSION__` must match formats  @typescript-eslint/naming-convention
  
/workspaces/Linus-Dashboard/src/utils.ts
  228:30  warning  'area_slug' is already declared  @typescript-eslint/no-shadow
  
✖ 32 problems (1 error, 31 warnings)
```

**How to read:**
- **File path:** `/workspaces/Linus-Dashboard/src/linus-strategy.ts`
- **Location:** Line 271, Column 15
- **Severity:** `error` (MUST fix) or `warning` (should fix)
- **Message:** Description of the issue
- **Rule:** `@typescript-eslint/naming-convention`
- **Summary:** `✖ 32 problems (1 error, 31 warnings)`
  - **1 error** = BLOCKING, must fix before commit
  - **31 warnings** = Non-blocking, commit allowed

## 🎯 Success Criteria

You're following this rule correctly when:

1. ✅ **You run `npm run lint` before EVERY commit**
2. ✅ **You fix ALL errors (0 errors required)**
3. ✅ **You review warnings and fix them when possible**
4. ✅ **You verify lint success before git operations**
5. ✅ **You never commit code with linting errors**

## 🚫 What NOT to Do

1. ❌ **Committing without running lint**
2. ❌ **Ignoring linting errors**
3. ❌ **Saying "I'll fix it later"**
4. ❌ **Disabling rules without justification**
5. ❌ **Batch-committing fixes without testing**

## 📝 Documentation in Commit Messages

When you fix linting issues, mention it:

```bash
# Good commit message
git commit -m "feat: implement smart version management

- Add __VERSION__ injection in TypeScript
- Update Python to read package.json dynamically
- Fix linting error: naming-convention for __VERSION__
- Build and tests passing"
```

## 🔄 Integration with AI-Driven Workflow

Update your commit checklist:

```markdown
Before EVERY commit:
- [ ] Run `npm run lint` and fix ALL errors
- [ ] Run `npm run type-check`
- [ ] Run `npm run build`
- [ ] Test in Home Assistant
- [ ] Review changes
- [ ] Commit with descriptive message
```

## 📚 Related Rules

- **clean_code.md** - Overall code quality standards
- **testing_documentation.md** - Testing before commit
- **.aidriven/README.md** - Full AI-driven workflow

## 🎓 Remember

**Linting is NOT optional. It's a MANDATORY step before EVERY commit.**

The few seconds it takes to run `npm run lint` can save hours of debugging and prevent broken code from entering the codebase.

---

**Last Updated:** 2025-12-14  
**Enforcement Level:** 🚨 CRITICAL - MANDATORY  
**Zero Tolerance:** No commits allowed with linting errors
