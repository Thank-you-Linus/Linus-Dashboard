# 🧪 Local CI Testing | Tests CI en Local

> Test your code locally before pushing to GitHub to catch CI failures early
>
> Testez votre code en local avant de push sur GitHub pour détecter les erreurs CI tôt

---

## 📖 Table of Contents | Table des matières

- [Overview | Vue d'ensemble](#overview--vue-densemble)
- [Quick Start | Démarrage Rapide](#quick-start--démarrage-rapide)
- [Available Workflows | Workflows Disponibles](#available-workflows--workflows-disponibles)
- [Common Use Cases | Cas d'Usage Courants](#common-use-cases--cas-dusage-courants)
- [Understanding Results | Comprendre les Résultats](#understanding-results--comprendre-les-résultats)
- [Fixing Common Issues | Résoudre les Problèmes Courants](#fixing-common-issues--résoudre-les-problèmes-courants)

---

## Overview | Vue d'ensemble

The **Local CI Testing** script (`scripts/ci-local.sh`) allows you to run the exact same checks that GitHub Actions runs in CI/CD, **before pushing your code**. This helps you:

Le script **Local CI Testing** (`scripts/ci-local.sh`) vous permet d'exécuter exactement les mêmes vérifications que GitHub Actions effectue en CI/CD, **avant de push votre code**. Cela vous aide à :

- ✅ Catch errors before they fail in CI
- ✅ Save time by not waiting for GitHub Actions
- ✅ Test specific workflows independently
- ✅ Debug issues locally with full control

---

## Quick Start | Démarrage Rapide

### Run all CI checks

```bash
npm run test:ci
```

**OR**

```bash
bash scripts/ci-local.sh
```

This will run **all checks** that GitHub Actions performs:
1. Python linting (Ruff)
2. Python formatting (Ruff)
3. ESLint check
4. TypeScript check
5. Build project
6. Verify build output
7. Smoke tests

---

## Available Workflows | Workflows Disponibles

The script can simulate different GitHub Actions workflows:

### 1. Main Branch Check (Default)

Simulates what happens when you push to `main`:

```bash
npm run test:ci main-check
```

**Runs:**
- Python Ruff linting
- Python Ruff formatting
- ESLint check
- TypeScript check
- Build project
- Build output verification
- Smoke tests

**Corresponds to:** `.github/workflows/main-check.yml`

---

### 2. Pre-Release Workflow

Simulates what happens when you create a beta/alpha tag:

```bash
npm run test:ci prerelease
```

**Runs:**
- ESLint check
- TypeScript check
- Build project
- Build output verification
- Smoke tests

**Corresponds to:** `.github/workflows/prerelease.yml`

---

### 3. Release Workflow

Simulates what happens when you publish a stable release:

```bash
npm run test:ci release
```

**Runs:**
- ESLint check
- TypeScript check
- Build project
- Build output verification
- Smoke tests

**Corresponds to:** `.github/workflows/release.yml`

---

### 4. All Checks (Comprehensive)

Run everything:

```bash
npm run test:ci all
```

**Runs:** All checks from all workflows (most comprehensive)

---

## Common Use Cases | Cas d'Usage Courants

### ✅ Use Case 1: ESLint Failed in CI

**Scenario:** You pushed to `main` and the workflow failed on ESLint.

**Solution:**

```bash
# 1. Run local CI to reproduce the failure
npm run test:ci

# 2. Fix ESLint errors automatically
npm run lint

# 3. Check if there are remaining issues
npm run lint:check

# 4. Re-run local CI to verify fixes
npm run test:ci

# 5. Commit and push
git add .
git commit -m "fix: Resolve ESLint errors"
git push
```

**Expected Output:**
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
[CHECK 3] ESLint check
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ PASSED
```

---

### ✅ Use Case 2: TypeScript Errors

**Scenario:** CI failed on TypeScript type checking.

**Solution:**

```bash
# 1. Run local CI to see TypeScript errors
npm run test:ci

# 2. Check TypeScript errors in detail
npm run type-check

# 3. Fix errors in your code editor
#    (TypeScript errors must be fixed manually)

# 4. Verify fixes
npm run type-check

# 5. Re-run local CI
npm run test:ci

# 6. Commit and push
git add .
git commit -m "fix: Resolve TypeScript type errors"
git push
```

---

### ✅ Use Case 3: Test Before Creating a Release

**Scenario:** You want to ensure everything passes before creating a beta release.

**Solution:**

```bash
# 1. Run the pre-release workflow checks
npm run test:ci prerelease

# 2. If everything passes, create the release
npm run create:prerelease
```

This ensures the release won't fail in CI/CD.

---

### ✅ Use Case 4: Python Formatting Issues

**Scenario:** CI failed on Python Ruff formatting.

**Solution:**

```bash
# 1. Run local CI to reproduce
npm run test:ci

# 2. Auto-fix Python formatting
python3 -m ruff format .

# 3. Auto-fix Python linting issues
python3 -m ruff check . --fix

# 4. Re-run local CI
npm run test:ci

# 5. Commit and push
git add .
git commit -m "style: Fix Python formatting with Ruff"
git push
```

---

### ✅ Use Case 5: Build Failures

**Scenario:** Build failed in CI.

**Solution:**

```bash
# 1. Run local CI to reproduce
npm run test:ci

# 2. Try building with dev config for more details
npm run build:dev

# 3. Fix the build errors (usually TypeScript or import issues)

# 4. Test build
npm run build

# 5. Re-run local CI
npm run test:ci

# 6. Commit and push
git add .
git commit -m "fix: Resolve build errors"
git push
```

---

## Understanding Results | Comprendre les Résultats

### ✅ Success Output

When all checks pass:

```
╔════════════════════════════════════════════════════════════════╗
║                         Summary                                ║
╚════════════════════════════════════════════════════════════════╝

✅ All checks passed! (7/7)

🎉 Your code is ready for CI/CD!
```

**What this means:**
- You can safely push your code
- CI/CD will likely pass
- Ready to create releases

---

### ❌ Failure Output

When checks fail:

```
╔════════════════════════════════════════════════════════════════╗
║                         Summary                                ║
╚════════════════════════════════════════════════════════════════╝

❌ 2 check(s) failed out of 7

💡 Quick fixes:

  For ESLint issues:
    npm run lint           # Auto-fix most issues
    npm run lint:check     # Check remaining issues

  For TypeScript issues:
    npm run type-check     # See all type errors
    # Fix manually in your code editor

  Re-run this script after fixes:
    bash scripts/ci-local.sh
```

**What this means:**
- Fix the errors shown
- Re-run the script
- **Do NOT push** until all checks pass

---

## Fixing Common Issues | Résoudre les Problèmes Courants

### 🔧 ESLint Errors

**Quick Fix (Auto):**
```bash
npm run lint
```

**Check Remaining Issues:**
```bash
npm run lint:check
```

**Common Issues:**
- Unused imports → Auto-fixed by `npm run lint`
- Missing semicolons → Auto-fixed by `npm run lint`
- Formatting issues → Auto-fixed by `npm run lint`
- Complex logic errors → Must fix manually

---

### 🔧 TypeScript Errors

**Check Errors:**
```bash
npm run type-check
```

**Common Issues:**
- Type mismatches → Add proper type annotations
- Missing types → Import or define types
- `any` usage → Replace with proper types
- Null/undefined → Use optional chaining (`?.`) or null checks

**Example Fix:**
```typescript
// ❌ Before (type error)
const value: string = someFunction(); // someFunction returns string | null

// ✅ After (fixed)
const value: string | null = someFunction();
if (value !== null) {
  // Use value safely
}
```

---

### 🔧 Python Ruff Errors

**Auto-Fix Linting:**
```bash
python3 -m ruff check . --fix
```

**Auto-Fix Formatting:**
```bash
python3 -m ruff format .
```

**Common Issues:**
- Unused imports → Auto-fixed
- Line too long → Auto-fixed
- Incorrect indentation → Auto-fixed

---

### 🔧 Build Errors

**Try Dev Build (More Details):**
```bash
npm run build:dev
```

**Common Issues:**
- TypeScript errors → Fix with `npm run type-check`
- Missing imports → Check file paths
- Circular dependencies → Refactor imports
- Syntax errors → Check recent code changes

---

## Best Practices | Bonnes Pratiques

### ✅ DO | À FAIRE

1. **Always run local CI before pushing**
   ```bash
   npm run test:ci && git push
   ```

2. **Fix errors incrementally**
   - Run `npm run test:ci`
   - Fix one type of error
   - Re-run to verify
   - Repeat until all pass

3. **Use specific workflow tests**
   - For quick checks: `npm run test:ci prerelease`
   - For comprehensive: `npm run test:ci all`

4. **Auto-fix when possible**
   - ESLint: `npm run lint`
   - Python: `python3 -m ruff check . --fix`

5. **Keep dependencies updated**
   - Run `npm ci` if checks behave differently than expected

---

### ❌ DON'T | À NE PAS FAIRE

1. **Don't push without testing**
   - Always run `npm run test:ci` first
   - CI/CD takes longer and notifies team

2. **Don't ignore warnings**
   - Even non-blocking warnings should be fixed
   - They may become blocking in the future

3. **Don't skip specific checks**
   - Run all checks relevant to your changes
   - Example: If you modified Python, run Python checks

4. **Don't commit if checks fail**
   - Fix all errors first
   - Verify with `npm run test:ci`

---

## Integration with IDE | Intégration avec IDE

### VS Code

Add to `.vscode/tasks.json`:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Run CI Tests Locally",
      "type": "shell",
      "command": "npm run test:ci",
      "problemMatcher": [],
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    }
  ]
}
```

**Usage:** `Cmd+Shift+P` → "Run Task" → "Run CI Tests Locally"

---

### Pre-Push Git Hook (Optional)

Add to `.git/hooks/pre-push`:

```bash
#!/bin/bash
echo "Running CI checks before push..."
npm run test:ci

if [ $? -ne 0 ]; then
  echo ""
  echo "❌ CI checks failed. Push aborted."
  echo "Fix the errors and try again."
  exit 1
fi

echo "✅ CI checks passed. Proceeding with push..."
```

Make executable:
```bash
chmod +x .git/hooks/pre-push
```

**This will automatically run CI checks before every push!**

---

## Troubleshooting | Dépannage

### Script Permission Denied

**Problem:** `bash: scripts/ci-local.sh: Permission denied`

**Solution:**
```bash
chmod +x scripts/ci-local.sh
npm run test:ci
```

---

### Dependencies Not Installed

**Problem:** `npm: command not found` or `python3: command not found`

**Solution:**
```bash
# Install Node.js dependencies
npm ci

# Install Python dependencies
python3 -m pip install -r requirements.txt
```

---

### Different Results than CI

**Problem:** Local CI passes but GitHub Actions fails (or vice versa).

**Possible Causes:**
1. Different dependency versions
2. Uncommitted changes
3. Environment differences

**Solution:**
```bash
# 1. Ensure clean git state
git status

# 2. Reinstall dependencies
rm -rf node_modules
npm ci

# 3. Re-run
npm run test:ci
```

---

## Support | Aide

### Issues

Report problems: https://github.com/Thank-you-Linus/Linus-Dashboard/issues

### Related Documentation

- [Release Guide](RELEASE_GUIDE.md) - Creating releases
- [Contributing Guide](../CONTRIBUTING.md) - Development workflow
- [Testing Guide](../.aidriven/TESTING_GUIDE.md) - Testing strategies

---

**Happy Testing! | Bon test !** 🧪✅
