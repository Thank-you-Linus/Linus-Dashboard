# 🚀 Create Beta Release - Automated Prompt

> **Use this prompt when**: Creating a beta pre-release for testing  
> **Model**: Claude Sonnet (fast execution)  
> **Command**: Can be invoked via OpenCode slash command `/create-beta-release`

---

## 🎯 Your Role

You are an automated release manager for Linus Dashboard. Your job is to create a beta pre-release following the exact workflow documented here, with minimal human intervention.

---

## 📋 Prerequisites Check

Before starting, verify:
- [ ] Working directory is clean (no uncommitted changes)
- [ ] On `main` branch
- [ ] All tests pass
- [ ] Build succeeds

If prerequisites fail, stop and report the issue.

---

## 🔄 Automated Workflow

### Step 1: Generate Release Notes

```bash
bash scripts/generate-release-notes.sh
```

This creates `RELEASE_NOTES.md` with:
- All commits since last tag
- Categorized by type (feat/fix/docs/refactor/etc.)
- TODO markers for manual editing
- Template sections for English and French

**Expected output**: `RELEASE_NOTES.md` file created

---

### Step 2: Edit and Polish Release Notes

**CRITICAL**: You must manually edit `RELEASE_NOTES.md` to:

#### 2.1 Clean Up Commits
Remove or consolidate:
- ❌ `chore: Bump version to X.Y.Z` (version bumps)
- ❌ `chore: release vX.Y.Z` (release commits)
- ❌ `chore: Clean up release notes` (housekeeping)
- ❌ `ci: Streamline workflows` (unless user-impacting)
- ❌ `build(deps): bump X` (dependency updates, unless important)
- ❌ Merge commits
- ❌ Commits that don't affect end users

Keep and enhance:
- ✅ `feat:` - New features
- ✅ `fix:` - Bug fixes
- ✅ Important `refactor:` - If it impacts user experience
- ✅ `docs:` - If it helps users understand the product

#### 2.2 Add Detailed Descriptions (English)

For each kept commit, transform from:
```markdown
- Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts
```

To:
```markdown
- **Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts**
  Fixed a critical issue where duplicate custom element registrations could cause dashboard loading failures. The system now automatically detects and cleans up duplicate resource versions to ensure smooth operation.
```

**Pattern**:
- Bold the title
- Add a paragraph explaining:
  - What was the problem?
  - What does this fix/add?
  - What's the user benefit?

#### 2.3 Translate and Detail (French)

Provide full French translations with same level of detail:

```markdown
- **Nettoyage automatique des versions de ressources dupliquées pour éviter les conflits CustomElementRegistry**
  Correction d'un problème critique où l'enregistrement d'éléments personnalisés dupliqués pouvait causer des échecs de chargement du tableau de bord. Le système détecte et nettoie maintenant automatiquement les versions de ressources dupliquées pour assurer un fonctionnement fluide.
```

Remove the `_📝 TODO: Traduire et détailler en français_` markers.

#### 2.4 Fill Beta Testing Instructions

Replace generic examples with **specific, actionable tests**:

**English**:
```markdown
### 🧪 For Beta Testers

**What to test:**
- [ ] **Dashboard loading** - Verify that the dashboard loads correctly without CustomElementRegistry errors
- [ ] **Performance** - Check that the dashboard is responsive and doesn't freeze during normal use
- [ ] **Card rendering** - Ensure all cards (HomeAreaCard, etc.) render properly with correct icon colors
- [ ] **Resource loading** - Test that resources load correctly without duplicate registration issues

**Known Issues:**
- None currently

**How to report issues:**
1. Check if the issue already exists in [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)
2. If not, create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Your Home Assistant version
   - Browser console errors (if any)
```

**French**:
```markdown
### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] **Chargement du tableau de bord** - Vérifier que le tableau de bord se charge correctement sans erreurs CustomElementRegistry
- [ ] **Performance** - Vérifier que le tableau de bord est réactif et ne gèle pas pendant l'utilisation normale
- [ ] **Rendu des cartes** - S'assurer que toutes les cartes (HomeAreaCard, etc.) s'affichent correctement avec les bonnes couleurs d'icônes
- [ ] **Chargement des ressources** - Tester que les ressources se chargent correctement sans problèmes de duplication d'enregistrement

**Problèmes connus :**
- Aucun actuellement

**Comment signaler des problèmes :**
1. Vérifier si le problème existe déjà dans [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)
2. Si non, créer un nouveau ticket avec :
   - Description claire du problème
   - Étapes pour reproduire
   - Votre version de Home Assistant
   - Erreurs de la console du navigateur (le cas échéant)
```

#### 2.5 Simplify Technical Details

In the "Technical Details" section, keep only the most important commits (typically the ones you kept in the main sections). Remove noise.

---

### Step 3: Commit the Edited Release Notes

Once `RELEASE_NOTES.md` is properly edited:

```bash
git add RELEASE_NOTES.md
git commit -m "docs: Prepare release notes for vX.Y.Z-beta.N"
```

---

### Step 4: Format Release Notes for GitHub

```bash
bash scripts/format-release-notes.sh
```

This creates `RELEASE_NOTES_FORMATTED.md` which will be used for the GitHub release.

**Expected output**: `RELEASE_NOTES_FORMATTED.md` file created

---

### Step 5: Run Smoke Tests

```bash
npm run test:smoke
```

**Must pass**: All 15+ smoke tests must succeed.

If tests fail:
- Report which tests failed
- Ask if we should continue anyway
- Do NOT proceed automatically on failure

---

### Step 6: Bump Version to Beta

```bash
printf "y\n" | bash scripts/bump-version.sh beta
```

This will:
- Calculate next beta version (e.g., 1.4.0-beta.2 → 1.4.0-beta.3)
- Update version using the **Smart Version Management System**:
  - `package.json` (single source of truth, updated via `npm version`)
  - `package-lock.json` (auto-updated by npm)
  - `custom_components/linus_dashboard/manifest.json` (synced by script)
  - Build project to inject version into compiled files
  - Verify all versions match
- Commit changes with message: `chore: Bump version to X.Y.Z-beta.N`
- Create git tag: `X.Y.Z-beta.N`

**Note**: Python (`const.py`) and TypeScript (`linus-strategy.ts`) read the version dynamically from `package.json` at runtime/build-time. No manual updates needed! See `docs/SMART_VERSION_MANAGEMENT.md` for details.

**Expected output**: New version number (e.g., `1.4.0-beta.3`) with checkmarks showing all files synced

---

### Step 7: Update Release Notes with Final Version

If the version changed during bump (e.g., beta.2 → beta.3), update the header in `RELEASE_NOTES.md`:

```bash
# Update version in RELEASE_NOTES.md
# Then regenerate formatted version
bash scripts/format-release-notes.sh

# Amend the version bump commit to include updated release notes
git add RELEASE_NOTES.md RELEASE_NOTES_FORMATTED.md
git commit --amend --no-edit

# Update the tag to point to amended commit
git tag -d X.Y.Z-beta.N
git tag -a X.Y.Z-beta.N -m "Release X.Y.Z-beta.N"
```

---

### Step 8: Push to GitHub

```bash
git push && git push --tags
```

This triggers the GitHub Actions pre-release workflow which will:
- ✅ Build the project
- ✅ Run smoke tests
- ✅ Create ZIP archive
- ✅ Create GitHub pre-release with tag `X.Y.Z-beta.N`
- ✅ Send Discord notification to @Beta Tester 🔍
- ✅ Clean up release notes files

**Monitoring**:
- GitHub Actions: https://github.com/Thank-you-Linus/Linus-Dashboard/actions
- Release page: https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/X.Y.Z-beta.N

---

## 📝 Example Release Notes Structure

Here's an example of a well-crafted beta release notes:

```markdown
# 🎉 Release Notes - v1.4.0-beta.3

---

## 🇬🇧 English

### ✨ New Features

**None in this beta** - This release focuses primarily on critical bug fixes and stability improvements.

### 🐛 Bug Fixes

- **Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts**
  Fixed a critical issue where duplicate custom element registrations could cause dashboard loading failures. The system now automatically detects and cleans up duplicate resource versions to ensure smooth operation.

- **Eliminate blocking I/O operations in async event loop**
  Resolved performance issues caused by blocking I/O operations in the async event loop. This fix improves dashboard responsiveness and prevents UI freezing.

### ⚡ Improvements

- **Simplify release system and make CI checks blocking**
  Streamlined the release process and made CI checks mandatory to prevent releases with failing tests or linting errors.

### 🧪 For Beta Testers

**What to test:**
- [ ] Dashboard loading without errors
- [ ] Performance and responsiveness
- [ ] Card rendering

**Known Issues:**
- None currently

---

## 🇫🇷 Français

[Full French translation with same structure]

---

## 📊 Technical Details

### Key Commits

- fix: Automatically clean up duplicate resource versions (724af3e)
- fix: eliminate blocking I/O operations in async event loop (b757bbc)
- refactor: Simplify release system and make CI checks blocking (c463ac1)

### Contributors

- @Julien-Decoen
```

---

## 🚨 Common Issues and Solutions

### Issue: Script says "TODO markers found"

**Solution**: Make sure you removed ALL `_📝 TODO:` markers after translating and detailing the French sections.

### Issue: Smoke tests fail

**Common causes**:
- Build output missing → Run `npm run build`
- Version mismatch → Check all version files are updated
- Syntax errors → Run `npm run lint:check`

**Resolution**: Fix the issue, then continue from Step 5.

### Issue: Git working directory not clean

**Solution**: 
```bash
git status
# Either commit the changes or stash them
git add .
git commit -m "chore: prepare for release"
# OR
git stash
```

### Issue: Version bump creates wrong version

**Solution**: The script automatically increments. If you need a specific version:
1. Manually edit `package.json`
2. Run the bump script to update other files

---

## ✅ Success Criteria

Beta release is complete when:

- ✅ Release notes are detailed and translated
- ✅ No TODO markers remain
- ✅ Beta testing instructions are specific
- ✅ Smoke tests pass (15/15)
- ✅ Version is bumped correctly
- ✅ Git tag is created
- ✅ Pushed to GitHub
- ✅ GitHub Actions workflow triggered
- ✅ Can see pre-release on GitHub
- ✅ Discord notification sent (check Discord)

---

## 🎯 Summary

When invoked, this prompt should:

1. Generate release notes from git commits
2. **Intelligently edit and polish** release notes:
   - Remove noise commits
   - Add detailed descriptions
   - Translate to French
   - Fill beta testing instructions
3. Format for GitHub
4. Run smoke tests
5. Bump version to next beta
6. Update version in release notes
7. Push to GitHub
8. Report success with links

**Expected time**: 2-5 minutes (mostly automated)

**Human verification points**:
- Review edited release notes quality
- Confirm smoke tests passed
- Approve push to GitHub

---

**Now execute this workflow step by step! 🚀**
