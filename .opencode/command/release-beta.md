---
description: Create beta pre-release with AI-powered editing and manual approval
agent: general
---

Create a **BETA pre-release** for community testing.

Current version: !`node -p "require('./package.json').version"`

## 🤖 Workflow

**Automated (2-3 min):** AI generates & polishes release notes + runs validations  
**Manual approval:** You review and approve before publishing  
**Publication (1-2 min):** Bumps version and pushes to GitHub

---

## Phase 1: Automated Preparation

**I will automatically:**

1. **Verify prerequisites** (git clean, main branch, up-to-date)
2. **Generate release notes** (`bash scripts/generate-release-notes.sh`)
3. **AI-powered editing:**
   - Remove noise (version bumps, merges, CI commits, deps updates)
   - Enhance features/fixes (bold title + detailed description)
   - Translate to French (same detail level)
   - Fill beta testing instructions
   - Remove TODO markers
4. **Format for GitHub** (`bash scripts/format-release-notes.sh`)

---

## Phase 2: Quality Validation (BLOCKING)

**All must pass:**

**A. Release notes validation** (`scripts/validate-release-notes.sh`)
- Required sections EN/FR ✓ No TODO ✓ Beta testing filled ✓ Bold features ✓

**B. Code quality (17 checks)** (`scripts/check-release-ready.sh`)
1. Git clean 2. Branch main 3. Up-to-date 4. Deps installed 5. Lint 6. Type-check 7. Build 8. Version consistency 9. No FIXME 10. CHANGELOG 11. manifest.json 12. hacs.json 13. No secrets 14. Python syntax 15. README 16. LICENSE 17. Smoke tests ready

**C. Smoke tests (15 tests)** (`npm run test:smoke`)

---

## Phase 3: Manual Approval ⏸️

**I will present:**

```
═══════════════════════════════════════
✅ RELEASE READY - APPROVAL REQUIRED
═══════════════════════════════════════

📦 Version: X.Y.Z-beta.N (was X.Y.Z-beta.N-1)

📝 CHANGES SUMMARY
═══════════════════════════════════════

✨ NEW FEATURES (2)
- **Smart version management** - Centralized system using package.json
- **Real-time dashboard sync** - WebSocket support for multi-device sync

🐛 BUG FIXES (3)
- **Fixed version consistency** - Uses proper Python import
- **Eliminated race condition** - Fixed card rendering timing
- **Corrected French translations** - Updated HVAC terminology

⚡ IMPROVEMENTS (1)
- **Optimized bundle size** - Reduced by 15% via tree-shaking

🧪 BETA TESTING (4 items)
- [ ] Version consistency across UI/logs/manifest
- [ ] Dashboard loading performance
- [ ] Real-time sync between devices
- [ ] French translation accuracy

✅ VALIDATIONS: Release notes ✅ | Code quality 17/17 ✅ | Smoke tests 15/15 ✅

📋 WHAT HAPPENS IF YOU APPROVE
1. Bump version to X.Y.Z-beta.N
2. Commit + tag
3. Push to GitHub → triggers pre-release workflow

❓ YOUR DECISION
[1] ✅ APPROVE - Publish
[2] 🔄 REQUEST CHANGES - Modify release notes
[3] 🔍 VIEW FULL NOTES - See complete file
[4] ❌ CANCEL - Abort
```

**Your options:**

**[1] APPROVE** → Proceeds to Phase 4

**[2] REQUEST CHANGES** → Tell me what to modify, I'll update with AI, re-validate, and show new summary

**[3] VIEW FULL NOTES** → Display complete RELEASE_NOTES.md, then return to approval

**[4] CANCEL** → Abort safely, no changes pushed

---

## Phase 4: Publication (Only after approval)

1. **Bump version** (`bash scripts/bump-version.sh beta`)
2. **Update release notes** with final version
3. **Commit + tag** (`git commit` + `git tag`)
4. **Push** (`git push && git push --tags`)
5. **Report success** with monitoring links

**GitHub Actions automatically:**
- Builds project
- Runs smoke tests
- Creates ZIP
- Creates pre-release
- Sends Discord notification to @Beta Tester 🔍
- Cleans up RELEASE_NOTES*.md

---

## 🎯 Quality Standards

**Release notes:** EN+FR equal quality, no TODO, detailed explanations, specific beta testing, user-focused, clean

**Code:** 17 checks passed, 15 smoke tests passed, lint+type-check passed, build succeeded

---

## 🛠️ Options

### Dry Run
```
/release-beta --dry-run
```
Runs everything, creates commit+tag locally, **STOPS before push**. Nothing published.  
To undo: `git reset HEAD~1 && git tag -d X.Y.Z-beta.N`

### Skip Approval
```
/release-beta --skip-approval
```
Shows summary but **auto-approves**. Publishes immediately. ⚠️ Use with caution.

---

## 📝 Logs

Every release logged to: `.opencode/logs/release-beta-{timestamp}.log`

Contains: timestamps, validations, user decisions, git hashes, URLs, duration

---

## 🚨 Common Errors

**Validation fails** → Fix issues, re-run `/release-beta`  
**Smoke tests fail** → Check `npm run test:smoke`, fix, re-run  
**Build fails** → Run `npm run build`, fix errors, re-run  
**Push fails** → `git pull --rebase`, re-run  
**Tag exists** → `git tag -d X.Y.Z-beta.N` or re-run (auto-increments)

---

## 📚 Related Commands

**After beta:**
- ✅ Successful → `/release-patch`, `/release-minor`, `/release-major`
- 🐛 Issues → Fix, then `/release-beta` (increments beta.N)
- 🚨 Critical → `/release-rollback X.Y.Z-beta.N`

---

## ⚠️ Important

- Manual approval required (cannot push without consent)
- All validations blocking (must pass)
- Idempotent (safe to re-run)
- Logs everything
- Time: 3-7 min (2-3 automated + review)

**Documentation:** `.aidriven/prompts/create_beta_release.md`
