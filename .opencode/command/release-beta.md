---
description: Create beta pre-release with intelligent version detection
agent: general
---

Create a **BETA pre-release** for community testing.

Current version: !`node -p "require('./package.json').version"`

## 🤖 Intelligent Workflow

The workflow adapts automatically based on the current version:

**First beta after stable release** → AI analyzes commits and suggests version type (patch/minor/major)  
**Incremental beta** (beta.2 → beta.3) → Automatically increments without user validation

---

## 🧠 Phase 1: Version Detection & Analysis

**I will automatically:**

1. **Detect release type:**
   - Current version: `1.4.0` → **First beta** (requires AI analysis)
   - Current version: `1.4.0-beta.2` → **Incremental beta** (auto-increment to beta.3)

2. **For first beta after stable:**
   - Run commit analysis: `npm run analyze:commits`
   - Analyze commit types (feat, fix, BREAKING CHANGE)
   - Count semantic changes
   - Determine version bump type (patch/minor/major)

3. **For incremental beta:**
   - Skip analysis (already determined)
   - Auto-increment beta counter

---

## 🎯 Phase 2: Version Type Decision (First Beta Only)

### AI Semantic Analysis Rules:

**MAJOR (X.0.0):**
- Commits contain `BREAKING CHANGE:` in footer
- Commits use `!` after type (e.g., `feat!:`, `fix!:`)
- API incompatible changes detected
- Database schema changes
- Major architecture refactoring

**MINOR (X.Y.0):**
- New features detected (`feat:` commits)
- Backward-compatible additions
- New components, views, cards
- Significant enhancements

**PATCH (X.Y.Z):**
- Only bug fixes (`fix:` commits)
- Documentation updates (`docs:`)
- Small improvements/refactoring
- Translation updates
- Dependency updates

**AMBIGUOUS:**
- Mixed signals (e.g., 5 feat + 1 BREAKING)
- Unclear impact
- → Ask user to decide manually

### Validation Prompt Format:

**I will present detailed analysis:**

```
═══════════════════════════════════════
🎯 RELEASE PROPOSAL - VERSION DECISION REQUIRED
═══════════════════════════════════════

📦 CURRENT VERSION: 1.4.0
🎯 PROPOSED VERSION: 1.5.0-beta.1
📊 PROPOSED TYPE: MINOR

═══════════════════════════════════════
📊 COMMIT ANALYSIS (since v1.4.0)
═══════════════════════════════════════

Total commits: 12

Breakdown:
✨ 10 feat:         New features
🐛 2 fix:          Bug fixes
💥 0 BREAKING:     Breaking changes
♻️  0 refactor:     Code refactoring
📝 0 docs:         Documentation
🔧 0 chore:        Maintenance

═══════════════════════════════════════
🤖 AI DECISION: MINOR VERSION BUMP
═══════════════════════════════════════

REASONING:
✓ Substantial new functionality detected (10 features)
✓ New components added:
  - Climate view with HVAC controls
  - Battery level sensor cards
  - Area-specific scene chips
✓ Backward compatible with existing configurations
✓ No API breaking changes detected
✓ User impact: Positive, adds new capabilities without disruption

CONFIDENCE: HIGH

═══════════════════════════════════════
🔍 KEY COMMITS (most impactful)
═══════════════════════════════════════

feat: Add climate view with HVAC controls (a1b2c3d)
feat: Implement battery level monitoring cards (d4e5f6g)
feat: Add area-specific scene chips (g7h8i9j)
fix: Correct version consistency across components (k1l2m3n)
fix: Fix French translation for climate modes (n4o5p6q)

═══════════════════════════════════════
❓ YOUR DECISION
═══════════════════════════════════════

[1] ✅ APPROVE MINOR (1.5.0-beta.1)
    Continue with proposed minor version bump
    
[2] ⬇️ DOWNGRADE TO PATCH (1.4.1-beta.1)
    These changes are small fixes, not new features
    
[3] ⬆️ UPGRADE TO MAJOR (2.0.0-beta.1)
    Breaking changes present, requires major bump
    
[4] 🔍 VIEW COMMITS
    Show full commit list with details
    
[5] ❌ CANCEL
    Abort release process

Choice [1-5]:
═══════════════════════════════════════
```

**Your options:**

**[1] APPROVE** → Proceeds with AI suggestion (MINOR → 1.5.0-beta.1)

**[2] DOWNGRADE TO PATCH** → Overrides AI, bumps to 1.4.1-beta.1

**[3] UPGRADE TO MAJOR** → Overrides AI, bumps to 2.0.0-beta.1

**[4] VIEW COMMITS** → Shows detailed commit list, then returns to decision

**[5] CANCEL** → Abort safely, no changes

---

## 📝 Phase 3: Release Notes Generation & Editing

**I will automatically:**

1. **Generate release notes** (`bash scripts/generate-release-notes.sh`)
2. **AI-powered editing:**
   - Remove noise (version bumps, merges, CI commits, deps updates)
   - Enhance features/fixes (bold title + detailed description)
   - Translate to French (same detail level)
   - Fill beta testing instructions
   - Remove TODO markers
3. **Format for GitHub** (`bash scripts/format-release-notes.sh`)

---

## ✅ Phase 4: Quality Validation (BLOCKING)

**All must pass:**

**A. Release notes validation** (`scripts/validate-release-notes.sh`)
- Required sections EN/FR ✓ No TODO ✓ Beta testing filled ✓ Bold features ✓

**B. Code quality (17 checks)** (`scripts/check-release-ready.sh`)
1. Git clean 2. Branch main 3. Up-to-date 4. Deps installed 5. Lint 6. Type-check 7. Build 8. Version consistency 9. No FIXME 10. CHANGELOG 11. manifest.json 12. hacs.json 13. No secrets 14. Python syntax 15. README 16. LICENSE 17. Smoke tests ready

**C. Smoke tests (15 tests)** (`npm run test:smoke`)

---

## 🎉 Phase 5: Final Approval & Publication

**For first beta (after AI analysis):**

```
═══════════════════════════════════════
✅ RELEASE READY - FINAL APPROVAL REQUIRED
═══════════════════════════════════════

📦 Version: 1.5.0-beta.1 (MINOR bump from 1.4.0)

📝 CHANGES SUMMARY
═══════════════════════════════════════

✨ NEW FEATURES (10)
- **Climate view with HVAC controls** - Full temperature and mode management
- **Battery level monitoring** - Track device battery status
- **Area-specific scene chips** - Quick scene activation per room
[... more features ...]

🐛 BUG FIXES (2)
- **Version consistency** - Fixed Python/JS version mismatch
- **French translations** - Corrected climate mode terminology

🧪 BETA TESTING (5 items)
- [ ] Climate controls work across different HVAC systems
- [ ] Battery monitoring displays correctly
- [ ] Scene activation triggers proper automations
- [ ] French translations are accurate
- [ ] Version shows consistently in UI/logs

✅ VALIDATIONS: Release notes ✅ | Code quality 17/17 ✅ | Smoke tests 15/15 ✅

📋 WHAT HAPPENS IF YOU APPROVE
1. Bump version to 1.5.0-beta.1
2. Commit + tag
3. Push to GitHub → triggers pre-release workflow

❓ YOUR DECISION
[1] ✅ APPROVE - Publish beta release
[2] 🔄 REQUEST CHANGES - Modify release notes
[3] 🔍 VIEW FULL NOTES - See complete file
[4] ❌ CANCEL - Abort
```

**For incremental beta (auto-incremented):**

```
═══════════════════════════════════════
✅ INCREMENTAL BETA RELEASE
═══════════════════════════════════════

📦 Version: 1.5.0-beta.3 (from 1.5.0-beta.2)

ℹ️  This is an incremental beta release.
    Version was automatically incremented (no analysis required).

📝 CHANGES SUMMARY
[... similar format ...]

✅ VALIDATIONS: Release notes ✅ | Code quality 17/17 ✅ | Smoke tests 15/15 ✅

❓ YOUR DECISION
[1] ✅ APPROVE - Publish beta release
[2] 🔄 REQUEST CHANGES - Modify release notes
[3] 🔍 VIEW FULL NOTES - See complete file
[4] ❌ CANCEL - Abort
```

**Your options:**

**[1] APPROVE** → Proceeds to publication

**[2] REQUEST CHANGES** → Tell me what to modify, I'll update with AI, re-validate, and show new summary

**[3] VIEW FULL NOTES** → Display complete RELEASE_NOTES.md, then return to approval

**[4] CANCEL** → Abort safely, no changes pushed

---

## 🚀 Phase 6: Publication (Only after approval)

**For first beta with explicit version type:**

1. **Bump version** (`bash scripts/bump-version.sh beta <patch|minor|major>`)
   - Example: `bash scripts/bump-version.sh beta minor` → 1.5.0-beta.1
2. **Update release notes** with final version
3. **Commit + tag** (`git commit` + `git tag`)
4. **Push** (`git push && git push --tags`)
5. **Report success** with monitoring links

**For incremental beta:**

1. **Bump version** (`bash scripts/bump-version.sh beta`)
   - Auto-increment: 1.5.0-beta.2 → 1.5.0-beta.3
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
- Cleans up RELEASE_NOTES.md

---

## 🎯 Quality Standards

**Release notes:** EN+FR equal quality, no TODO, detailed explanations, specific beta testing, user-focused, clean

**Code:** 17 checks passed, 15 smoke tests passed, lint+type-check passed, build succeeded

**Version decision:** AI analyzes commits semantically, presents detailed justification, user validates when needed

---

## 🛠️ Options

### Dry Run
```
/release-beta --dry-run
```
Runs everything, creates commit+tag locally, **STOPS before push**. Nothing published.  
To undo: `git reset HEAD~1 && git tag -d X.Y.Z-beta.N`

### Skip Approval (Final approval only)
```
/release-beta --skip-approval
```
Shows summary but **auto-approves final publication**. Still requires version decision validation if first beta. ⚠️ Use with caution.

---

## 📝 Logs

Every release logged to: `.opencode/logs/release-beta-{timestamp}.log`

Contains: timestamps, commit analysis, AI reasoning, user decisions, git hashes, URLs, duration

---

## 🚨 Common Errors

**Validation fails** → Fix issues, re-run `/release-beta`  
**Smoke tests fail** → Check `npm run test:smoke`, fix, re-run  
**Build fails** → Run `npm run build`, fix errors, re-run  
**Push fails** → `git pull --rebase`, re-run  
**Tag exists** → `git tag -d X.Y.Z-beta.N` or re-run (auto-increments)  
**Ambiguous commits** → AI asks you to decide manually between patch/minor/major

---

## 📚 Related Commands

**After beta testing:**
- ✅ Beta successful → `/release-stable` (finalizes beta → stable)
- 🐛 Issues found → Fix, then `/release-beta` (increments beta.N automatically)
- 🚨 Critical issue → `/release-rollback X.Y.Z-beta.N`

---

## 🧠 Version Detection Logic Summary

| Current Version | Detection | AI Analysis | User Validation | Result |
|----------------|-----------|-------------|-----------------|--------|
| `1.4.0` (stable) | First beta | ✅ Yes | ✅ Required | `1.5.0-beta.1` (if MINOR) |
| `1.4.0-beta.2` | Incremental | ❌ No | ❌ Not required | `1.4.0-beta.3` |
| `1.4.0-beta.5` | Incremental | ❌ No | ❌ Not required | `1.4.0-beta.6` |

---

## ⚠️ Important

- **First beta:** AI analyzes commits, presents detailed reasoning, requires your validation
- **Incremental beta:** Automatic increment, no analysis, faster workflow
- All validations are blocking (must pass)
- Idempotent (safe to re-run)
- Logs everything
- Time: 5-10 min (first beta) or 3-5 min (incremental)

**Scripts Used:**
- `scripts/analyze-commits.sh` - Commit analysis (first beta only)
- `scripts/bump-version.sh beta [patch|minor|major]` - Version bumping
- `scripts/generate-release-notes.sh` - Release notes generation
- `scripts/format-release-notes.sh` - Formatting
- `scripts/validate-release-notes.sh` - Validation
- `scripts/check-release-ready.sh` - Code quality checks
