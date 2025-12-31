# 🚨 CRITICAL RULE: Linting Before Every Commit

## ⚡ The Golden Rule

**YOU MUST RUN `npm run lint` BEFORE EVERY COMMIT. NO EXCEPTIONS.**

## 🎯 Why This Matters

- ❌ Committing without linting breaks CI/CD pipelines
- ❌ Code quality issues accumulate
- ❌ Other developers inherit broken code

## 📋 Mandatory Workflow

```bash
# 1. Write code
vim src/linus-strategy.ts

# 2. Run lint (MANDATORY)
npm run lint

# 3. Fix ALL errors (warnings are OK)
# Re-run until: ✖ 0 problems (0 errors, X warnings)

# 4. ONLY THEN commit
git add .
git commit -m "feat: your feature"
```

## ✅ Success Criteria

**Acceptable output:**
```
✖ 0 problems (0 errors, 31 warnings)
```

**NOT acceptable (has 1 error):**
```
✖ 32 problems (1 error, 31 warnings)
```

## 🚫 Common Mistakes

**DON'T:**
- ❌ Commit with linting errors
- ❌ Skip linting "because it's a small change"
- ❌ Use `--no-verify` flag

**DO:**
- ✅ Run `npm run lint` before every commit
- ✅ Fix ALL errors (0 errors required)
- ✅ Warnings are acceptable

## 🛠️ Quick Fixes

**If you see naming errors:**
```typescript
// Add eslint-disable comment
// eslint-disable-next-line @typescript-eslint/naming-convention
const __VERSION__ = "1.4.0";
```

**If you see unused variables:**
```typescript
// Prefix with underscore
const _unusedVar = something;
```

## 📝 Remember

**LINT → FIX → COMMIT (in that order, always)**
