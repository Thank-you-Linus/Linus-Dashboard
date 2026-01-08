---
description: Create stable release with intelligent detection (finalize beta or direct release)
agent: general
---

Create a **STABLE release** for production use.

Current version: !`node -p "require('./package.json').version"`

## ⚠️ CRITICAL TAG FORMAT RULE

**NEVER use 'v' prefix in git tags!**

- ✅ CORRECT: `1.5.0`
- ❌ WRONG: `v1.5.0`

The GitHub workflows expect tags WITHOUT 'v' prefix. Using 'v' will cause workflow failures.
All scripts (`bump-version.sh`, `create-release.sh`) already create tags without 'v'.
**Never create tags manually** - always use the scripts.

## 🤖 Intelligent Workflow

The workflow adapts automatically based on the current version:

**From beta** (1.5.0-beta.3 → 1.5.0) → Automatic finalization, no analysis needed  
**Direct stable release** (1.4.0 → 1.5.0) → AI analyzes commits and suggests version type with warning

---

## 🧠 Phase 1: Release Type Detection

**I will automatically:**

1. **Detect release scenario:**
   - Current version: `1.5.0-beta.3` → **Finalize beta** (automatic, no validation)
   - Current version: `1.4.0` (stable) → **Direct release** (requires AI analysis + warning)

2. **For finalize beta:**
   - Strip `-beta.N` suffix automatically
   - Skip commit analysis (already done during beta)
   - Faster workflow (3-5 min)

3. **For direct stable release:**
   - ⚠️ **WARNING:** Skipping beta testing is risky
   - Run commit analysis: `npm run analyze:commits`
   - Analyze commit types (feat, fix, BREAKING CHANGE)
   - Determine version bump type (patch/minor/major)
   - Present detailed validation with option to create beta instead

---

## 🎯 Phase 2A: Finalize Beta (Automatic)

**Current: 1.5.0-beta.3 → Stable: 1.5.0**

```
═══════════════════════════════════════
🎉 FINALIZE BETA → STABLE RELEASE
═══════════════════════════════════════

📦 Current: 1.5.0-beta.3
🎯 Target:  1.5.0 (stable)

ℹ️  This is a beta finalization.
    Version type was already determined during beta phase.
    No additional analysis or validation required.

✅ Proceeding automatically to release notes and validation.
═══════════════════════════════════════
```

**No user validation required** → Proceeds directly to Phase 3

---

## 🎯 Phase 2B: Direct Stable Release (Requires Validation)

**Current: 1.4.0 → Proposed: 1.5.0**

### ⚠️ Beta Testing Warning

```
═══════════════════════════════════════
⚠️  DIRECT STABLE RELEASE DETECTED
═══════════════════════════════════════

You are creating a stable release without beta testing.

🚨 RISKS:
- No community feedback
- Untested in real environments
- Potential bugs reach production
- Harder to rollback if issues found

💡 RECOMMENDED: Create beta first
   Use /release-beta to create 1.5.0-beta.1
   Test with community for a few days
   Then finalize with /release-stable

❓ Do you want to proceed with direct stable release?

[1] ⚠️  YES - Continue with direct release (risky)
[2] 🎯 CREATE BETA INSTEAD - Safer approach
[3] ❌ CANCEL - Abort

Choice [1-3]:
═══════════════════════════════════════
```

**If user chooses [2] CREATE BETA:** Stop and redirect to `/release-beta`

**If user chooses [1] PROCEED:** Show detailed AI analysis:

### AI Semantic Analysis (Direct Release Only)

```
═══════════════════════════════════════
🎯 RELEASE PROPOSAL - VERSION DECISION REQUIRED
═══════════════════════════════════════

📦 CURRENT VERSION: 1.4.0
🎯 PROPOSED VERSION: 1.5.0
📊 PROPOSED TYPE: MINOR

⚠️  DIRECT STABLE RELEASE (SKIPPING BETA)

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
✓ User impact: Positive, adds new capabilities

⚠️  RECOMMENDATION: Test as beta first (1.5.0-beta.1)

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

[1] ✅ APPROVE MINOR (1.5.0 stable)
    Continue with proposed minor version bump
    ⚠️  Skipping beta testing
    
[2] ⬇️ DOWNGRADE TO PATCH (1.4.1 stable)
    These changes are small fixes, not new features
    ⚠️  Skipping beta testing
    
[3] ⬆️ UPGRADE TO MAJOR (2.0.0 stable)
    Breaking changes present, requires major bump
    ⚠️  Skipping beta testing
    
[4] 🎯 CREATE BETA INSTEAD
    Safer approach: Create 1.5.0-beta.1 first
    
[5] 🔍 VIEW COMMITS
    Show full commit list with details
    
[6] ❌ CANCEL
    Abort release process

Choice [1-6]:
═══════════════════════════════════════
```

**Your options:**

**[1] APPROVE MINOR** → Proceeds with 1.5.0 stable (skips beta)

**[2] DOWNGRADE TO PATCH** → Creates 1.4.1 stable

**[3] UPGRADE TO MAJOR** → Creates 2.0.0 stable

**[4] CREATE BETA INSTEAD** → Stops and redirects to `/release-beta` (recommended)

**[5] VIEW COMMITS** → Shows detailed commit list, returns to decision

**[6] CANCEL** → Abort safely

---

## 📝 Phase 3: Release Notes Generation & Editing

**I will automatically:**

1. **Generate release notes** (`bash scripts/generate-release-notes.sh`)
2. **AI-powered editing:**
   - Remove noise (version bumps, merges, CI commits, deps updates)
   - Enhance features/fixes (bold title + detailed description)
   - Translate to French (same detail level)
   - Remove beta testing section (not needed for stable)
   - Add upgrade instructions if needed
   - Remove TODO markers
3. **Format for GitHub** (`bash scripts/format-release-notes.sh`)

---

## ✅ Phase 4: Quality Validation (BLOCKING)

**All must pass:**

**A. Release notes validation** (`scripts/validate-release-notes.sh`)
- Required sections EN/FR ✓ No TODO ✓ No beta testing section ✓ Bold features ✓

**B. Code quality (17 checks)** (`scripts/check-release-ready.sh`)
1. Git clean 2. Branch main 3. Up-to-date 4. Deps installed 5. Lint 6. Type-check 7. Build 8. Version consistency 9. No FIXME 10. CHANGELOG 11. manifest.json 12. hacs.json 13. No secrets 14. Python syntax 15. README 16. LICENSE 17. Smoke tests ready

**C. Smoke tests (15 tests)** (`npm run test:smoke`)

---

## 🎉 Phase 5: Final Approval & Publication

**For finalize beta:**

```
═══════════════════════════════════════
✅ STABLE RELEASE READY - APPROVAL REQUIRED
═══════════════════════════════════════

📦 Version: 1.5.0 (from 1.5.0-beta.3)

🎉 Beta testing completed successfully!

📝 CHANGES SUMMARY (since 1.4.0)
═══════════════════════════════════════

✨ NEW FEATURES (10)
- **Climate view with HVAC controls** - Full temperature and mode management
- **Battery level monitoring** - Track device battery status
- **Area-specific scene chips** - Quick scene activation per room
[... more features ...]

🐛 BUG FIXES (2)
- **Version consistency** - Fixed Python/JS version mismatch
- **French translations** - Corrected climate mode terminology

✅ VALIDATIONS: Release notes ✅ | Code quality 17/17 ✅ | Smoke tests 15/15 ✅

📋 WHAT HAPPENS IF YOU APPROVE
1. Bump version to 1.5.0
2. Commit + tag
3. Push to GitHub → triggers release workflow
4. Announcement to forums (manual step)

❓ YOUR DECISION
[1] ✅ APPROVE - Publish stable release
[2] 🔄 REQUEST CHANGES - Modify release notes
[3] 🔍 VIEW FULL NOTES - See complete file
[4] ❌ CANCEL - Abort
```

**For direct stable release:**

```
═══════════════════════════════════════
✅ STABLE RELEASE READY - APPROVAL REQUIRED
═══════════════════════════════════════

📦 Version: 1.5.0 (MINOR bump from 1.4.0)

⚠️  DIRECT RELEASE (BETA TESTING SKIPPED)

📝 CHANGES SUMMARY
═══════════════════════════════════════

[... similar format ...]

⚠️  WARNING: This release has not been beta tested
    Monitor closely for issues after publication

✅ VALIDATIONS: Release notes ✅ | Code quality 17/17 ✅ | Smoke tests 15/15 ✅

❓ YOUR DECISION
[1] ✅ APPROVE - Publish stable release (skipping beta)
[2] 🎯 CREATE BETA INSTEAD - Safer approach
[3] 🔄 REQUEST CHANGES - Modify release notes
[4] 🔍 VIEW FULL NOTES - See complete file
[5] ❌ CANCEL - Abort
```

**Your options:**

**[1] APPROVE** → Proceeds to publication

**[2] CREATE BETA INSTEAD** (direct release only) → Redirects to `/release-beta`

**[3] REQUEST CHANGES** → Tell me what to modify, I'll update with AI, re-validate, and show new summary

**[4] VIEW FULL NOTES** → Display complete RELEASE_NOTES.md, then return to approval

**[5] CANCEL** → Abort safely, no changes pushed

---

## 🚀 Phase 6: Publication (Only after approval)

**For finalize beta (automatic version):**

1. **Bump version** (`bash scripts/bump-version.sh release`)
   - Strips `-beta.N`: 1.5.0-beta.3 → 1.5.0
2. **Update release notes** with final version
3. **Commit + tag** (`git commit` + `git tag`)
4. **Push** (`git push && git push --tags`)
5. **Report success** with forum links

**For direct stable release (explicit version type):**

1. **Bump version** (`bash scripts/bump-version.sh release <patch|minor|major>`)
   - Example: `bash scripts/bump-version.sh release minor` → 1.5.0
2. **Update release notes** with final version
3. **Commit + tag** (`git commit` + `git tag`)
4. **Push** (`git push && git push --tags`)
5. **Report success** with forum links

**GitHub Actions automatically:**
- Builds project
- Runs smoke tests
- Creates ZIP
- Creates stable release
- Sends Discord notification (public announcement)
- Cleans up RELEASE_NOTES.md

**Manual step:**
- Open forum threads: `npm run forums:open`
- Post release announcement (templates provided)

---

## 🎯 Quality Standards

**Release notes:** EN+FR equal quality, no TODO, detailed explanations, user-focused, clean, no beta testing section

**Code:** 17 checks passed, 15 smoke tests passed, lint+type-check passed, build succeeded

**Version decision:** 
- Finalize beta: Automatic, no validation
- Direct release: AI analyzes commits, warns about skipping beta, requires user validation

---

## 🛠️ Options

### Dry Run
```
/release-stable --dry-run
```
Runs everything, creates commit+tag locally, **STOPS before push**. Nothing published.  
To undo: `git reset HEAD~1 && git tag -d X.Y.Z`

### Skip Approval (Final approval only)
```
/release-stable --skip-approval
```
Shows summary but **auto-approves final publication**. Still shows warning and requires version decision for direct releases. ⚠️ Use with extreme caution.

---

## 📝 Logs

Every release logged to: `.opencode/logs/release-stable-{timestamp}.log`

Contains: timestamps, detection logic, commit analysis (if direct), AI reasoning, warnings shown, user decisions, git hashes, URLs, duration

---

## 🚨 Common Errors

**Validation fails** → Fix issues, re-run `/release-stable`  
**Smoke tests fail** → Check `npm run test:smoke`, fix, re-run  
**Build fails** → Run `npm run build`, fix errors, re-run  
**Push fails** → `git pull --rebase`, re-run  
**Tag exists** → `git tag -d X.Y.Z` then re-run  
**Ambiguous commits** (direct release) → AI asks you to decide manually  
**Beta recommended** → Use `/release-beta` first for safer release

---

## 📚 Related Commands

**Before stable release:**
- 🎯 Recommended: `/release-beta` (test first)
- 🔍 Check status: `/release-check`

**After stable release:**
- 🐛 Hotfix needed → `/release-stable` (creates patch: 1.5.0 → 1.5.1)
- 🚨 Critical issue → `/release-rollback X.Y.Z`
- 💬 Announce → `npm run forums:open`

---

## 🧠 Release Type Detection Logic

| Current Version | Detection | AI Analysis | Beta Warning | User Validation | Result |
|----------------|-----------|-------------|--------------|-----------------|--------|
| `1.5.0-beta.3` | Finalize | ❌ No | ❌ No | ❌ Not required | `1.5.0` (stable) |
| `1.4.0` (stable) | Direct | ✅ Yes | ✅ Yes | ✅ Required | `1.5.0` (if MINOR) |

---

## ⚠️ Important

- **Finalize beta:** Automatic and fast (no validation, already tested)
- **Direct stable:** Requires AI analysis + shows warning about skipping beta + requires your validation
- **Best practice:** Always test with beta first (`/release-beta` → test → `/release-stable`)
- All validations are blocking (must pass)
- Idempotent (safe to re-run)
- Logs everything
- Time: 3-5 min (finalize) or 5-10 min (direct release)

**Scripts Used:**
- `scripts/analyze-commits.sh` - Commit analysis (direct release only)
- `scripts/bump-version.sh release [patch|minor|major]` - Version bumping
- `scripts/generate-release-notes.sh` - Release notes generation
- `scripts/format-release-notes.sh` - Formatting
- `scripts/validate-release-notes.sh` - Validation
- `scripts/check-release-ready.sh` - Code quality checks

**Forum Announcement:**
After successful release, use `npm run forums:open` to announce:
- Home Assistant Community Forum
- HACF (Home Assistant Community France)
