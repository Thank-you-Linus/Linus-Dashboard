# 🚀 Release Management Guide | Guide de Gestion des Releases

> This guide explains the complete release process for Linus Dashboard, from development to publication.
>
> Ce guide explique le processus complet de release pour Linus Dashboard, du développement à la publication.

---

## ⚡ Quick Start | Démarrage Rapide

**NEW: One-Command Release System! | NOUVEAU : Système de release en une commande !**

Create releases easily with a single command:

```bash
# For pre-releases (beta testing)
npm run create:beta

# For stable releases
npm run create:release
```

These scripts handle **everything automatically**:
- ✅ Generate release notes from commits
- ✅ Guide you through editing them
- ✅ Run smoke tests
- ✅ Bump version
- ✅ Create git tags
- ✅ Push to GitHub
- ✅ Trigger automated CI/CD

**Read below for detailed documentation.**

---

## 📋 Table of Contents | Table des matières

- [Overview | Vue d'ensemble](#overview--vue-densemble)
- [Release Types | Types de releases](#release-types--types-de-releases)
- [Pre-Release Process (Alpha/Beta)](#pre-release-process-alphabeta)
- [Stable Release Process](#stable-release-process)
- [Automated Workflows](#automated-workflows)
- [Troubleshooting | Dépannage](#troubleshooting--dépannage)

---

## Overview | Vue d'ensemble

Linus Dashboard uses semantic versioning with pre-release tags for alpha and beta versions.

Linus Dashboard utilise le versionnage sémantique avec des tags de pré-release pour les versions alpha et beta.

### Version Format | Format de version

- **Stable**: `X.Y.Z` (e.g., `1.3.0`)
- **Beta**: `X.Y.Z-beta.N` (e.g., `1.3.1-beta.1`)
- **Alpha**: `X.Y.Z-alpha.N` (e.g., `1.3.1-alpha.1`)

Where | Où:
- `X` = Major version (breaking changes)
- `Y` = Minor version (new features)
- `Z` = Patch version (bug fixes)
- `N` = Pre-release counter

---

## Release Types | Types de releases

### 🔬 Alpha Releases

**Purpose | Objectif**: Early testing of new features with core team
- Very early stage
- May contain bugs
- Not recommended for production
- Limited distribution

**When to use | Quand l'utiliser**:
- New experimental features
- Major refactoring
- Testing before wider beta release

### 🧪 Beta Releases

**Purpose | Objectif**: Public testing before stable release
- Feature-complete
- Needs community testing
- May still have minor bugs
- Distributed to beta testers

**When to use | Quand l'utiliser**:
- Feature is ready for testing
- Before stable release
- To gather user feedback

### ✅ Stable Releases

**Purpose | Objectif**: Production-ready version
- Fully tested
- No known critical bugs
- Ready for all users
- Published on HACS and forums

**When to use | Quand l'utiliser**:
- After successful beta testing
- Bug fixes for stable version
- Ready for production use

---

## Pre-Release Process (Alpha/Beta)

### 🚀 One-Command Release (Recommended)

**The easiest way to create a pre-release:**

```bash
# For Beta releases (most common)
npm run create:beta

# For Alpha releases (early testing)
npm run create:alpha
```

This single command will:
1. ✅ Check git status is clean
2. ✅ Generate `RELEASE_NOTES.md` from commits
3. ✅ Prompt you to edit release notes
4. ✅ Format release notes for GitHub
5. ✅ Run smoke tests
6. ✅ Bump version automatically
7. ✅ Push to GitHub and trigger CI/CD

**That's it!** GitHub Actions handles the rest automatically.

---

### 📝 Manual Step-by-Step Process (Advanced)

If you prefer more control over each step:

#### Step 1: Generate Release Notes

Generate release notes from your commits:

```bash
npm run release:notes
```

This creates `RELEASE_NOTES.md` with:
- English and French sections
- Categorized changes (features, fixes, improvements)
- Beta testing instructions
- List of contributors

**⚠️ Important**: Edit `RELEASE_NOTES.md` to:
1. Add detailed explanations for each change
2. Translate to French
3. Fill in "For Beta Testers" sections
4. Remove any commits that shouldn't be public
5. **Mark main features with bold** (`**text**`) - these will be highlighted in Discord notifications

#### Step 2: Format Release Notes for GitHub

After editing `RELEASE_NOTES.md`, format it for GitHub with collapsible sections:

```bash
npm run release:format
```

This creates `RELEASE_NOTES_FORMATTED.md` with:
- Concise summary with main features visible
- Detailed descriptions in collapsible sections
- Compact bilingual format
- Better visual organization for GitHub

**This formatted version will be used automatically for GitHub releases.**

#### Step 3: Run Smoke Tests (Optional)

Validate the build before releasing:

```bash
npm run test:smoke
```

This validates:
- Build output exists and is valid
- Version consistency across files
- Manifest.json and hacs.json syntax
- Python file syntax
- No sensitive data in build

#### Step 4: Bump Version

Choose the appropriate bump command:

**For Beta releases:**
```bash
npm run bump:beta
```

**For Alpha releases:**
```bash
npm run bump:alpha
```

This will:
1. Update version in all files:
   - `package.json`
   - `package-lock.json`
   - `custom_components/linus_dashboard/manifest.json`
   - `custom_components/linus_dashboard/const.py`
   - `src/linus-strategy.ts`
2. Create a git commit
3. Create a git tag
4. Show you the next steps

#### Step 5: Push to GitHub

Push your changes and tag:

```bash
git push && git push --tags
```

#### Step 6: Automated CI/CD

GitHub Actions will automatically:
1. ✅ Validate tag format
2. ✅ Checkout code
3. ✅ Install dependencies
4. ✅ Run linting and type checking
5. ✅ Build the project
6. ✅ Verify build output
7. ✅ Run smoke tests
8. ✅ Create ZIP archive
9. ✅ **Format release notes** with collapsible sections
10. ✅ Create GitHub pre-release with formatted notes
11. ✅ Send Discord notification to beta testers (concise format)
12. ✅ Clean up RELEASE_NOTES.md and RELEASE_NOTES_FORMATTED.md

**View the workflow**: `.github/workflows/prerelease.yml`

#### Step 7: Monitor Release

1. Check GitHub Actions workflow status
2. Verify the release was created on GitHub
3. Check Discord for notification
4. Respond to beta tester feedback

---

## Stable Release Process

### 🚀 One-Command Release (Recommended)

**The easiest way to create a stable release:**

```bash
npm run create:release
```

This single command will:
1. ✅ Check git status is clean
2. ✅ Verify you're up to date with remote
3. ✅ Prompt to confirm beta testing is complete
4. ✅ Generate/verify `RELEASE_NOTES.md`
5. ✅ Prompt you to review release notes
6. ✅ Format release notes for GitHub
7. ✅ Run smoke tests
8. ✅ Bump to stable version
9. ✅ Push to GitHub
10. ✅ Show instructions for creating GitHub release

**Then manually:**
- Create the GitHub release (instructions shown by script)
- GitHub Actions will build and publish automatically
- Announce on forums: `npm run forums:open`

---

### 📝 Manual Step-by-Step Process (Advanced)

If you prefer more control over each step:

#### Step 1: Ensure Beta Testing is Complete

Before releasing stable:
- ✅ Beta version has been tested
- ✅ No critical bugs reported
- ✅ All feedback addressed
- ✅ Documentation updated

#### Step 2: Generate Final Release Notes

If you haven't already:

```bash
npm run release:notes
```

Edit `RELEASE_NOTES.md` for the final stable version.

Remove or update the "For Beta Testers" sections.

#### Step 3: Format Release Notes

```bash
npm run release:format
```

#### Step 4: Run Smoke Tests

```bash
npm run test:smoke
```

#### Step 5: Bump to Stable Version

```bash
npm run bump:release
```

This removes the pre-release suffix (e.g., `1.3.1-beta.1` → `1.3.1`).

#### Step 6: Push to GitHub

```bash
git push && git push --tags
```

#### Step 7: Create GitHub Release

1. Go to: https://github.com/Thank-you-Linus/Linus-Dashboard/releases/new
2. Click "Draft a new release"
3. Select your tag (e.g., `1.4.0`)
4. Title: `v1.4.0`
5. Copy content from `RELEASE_NOTES_FORMATTED.md`
6. Mark as "Latest release" ✅
7. Leave "Pre-release" unchecked ⬜
8. Click "Publish release"

#### Step 8: Automated CI/CD

GitHub Actions will automatically:
1. ✅ Validate it's not a pre-release
2. ✅ Build the project
3. ✅ Run smoke tests
4. ✅ Create ZIP archive
5. ✅ Upload to release
6. ✅ Send Discord notification to public channel

**View the workflow**: `.github/workflows/release.yml`

#### Step 9: Publish to Forums

Open forum announcement pages:

```bash
npm run forums:open
```

This opens:
- Home Assistant Community Forum
- HACF (French Home Assistant Community)

Post your release announcement with:
- Release notes
- Installation instructions
- Link to GitHub release

#### Step 10: Verify HACS Update

HACS should automatically detect the new version.

Verify in HACS:
1. Open HACS
2. Search "Linus Dashboard"
3. Check version is updated (may take a few minutes)

---

## Automated Workflows

### Pre-Release Workflow

**Trigger**: Push tag matching `*-beta.*` or `*-alpha.*`

**File**: `.github/workflows/prerelease.yml`

**Steps**:
1. Validate tag format
2. Lint and type check
3. Build project
4. Create ZIP archive
5. Create GitHub pre-release
6. Notify Discord (beta channel)
7. Clean up RELEASE_NOTES.md

**Secrets required**:
- `DISCORD_WEBHOOK_URL` (optional for notifications)

### Stable Release Workflow

**Trigger**: GitHub release published

**File**: `.github/workflows/release.yml`

**Steps**:
1. Validate it's a stable release
2. Lint and type check
3. Build project
4. Create ZIP archive
5. Upload to release
6. Notify Discord (public channel)

**Secrets required**:
- `DISCORD_WEBHOOK_URL` (optional for notifications)

---

## Troubleshooting | Dépannage

### Build Fails

**Problem**: Build fails during CI/CD

**Solution**:
1. Run build locally: `npm run build`
2. Fix any TypeScript errors
3. Run type check: `npm run type-check`
4. Fix linting issues: `npm run lint`
5. Commit fixes and push

### Wrong Version Number

**Problem**: Version was bumped incorrectly

**Solution**:
```bash
# Delete the tag locally
git tag -d 1.3.1-beta.1

# Delete the tag remotely (if already pushed)
git push --delete origin 1.3.1-beta.1

# Manually update version in files
# Then create new tag
git tag -a 1.3.1-beta.1 -m "Release 1.3.1-beta.1"
git push --tags
```

### Release Notes Missing

**Problem**: RELEASE_NOTES.md not found

**Solution**:
- CI/CD will fall back to git commits
- Recommended: Create RELEASE_NOTES.md manually
- Run: `npm run release:notes`

### Discord Notification Failed

**Problem**: Discord notification not sent

**Solution**:
1. Check `DISCORD_WEBHOOK_URL` is set in GitHub Secrets
2. Manually run: `bash scripts/notify-discord.sh prerelease 1.3.1-beta.1 <release_url>`
3. Notification is optional, release will still succeed

### Tag Already Exists

**Problem**: Tag already exists on GitHub

**Solution**:
```bash
# Delete local tag
git tag -d 1.3.1-beta.1

# Delete remote tag
git push --delete origin 1.3.1-beta.1

# Delete the GitHub release if it was created

# Fix issues and create new tag with incremented version
npm run bump:beta
git push && git push --tags
```

---

## Quick Reference | Référence Rapide

### 🚀 One-Command Release (Easiest)

```bash
# Create a beta pre-release (most common)
npm run create:beta

# Create an alpha pre-release (early testing)
npm run create:alpha

# Create a stable release
npm run create:release
```

**That's it!** The script handles everything and guides you through each step.

---

### 📝 Full Release Cycle (Manual Control)

```bash
# 1. Generate release notes
npm run release:notes

# 2. Edit RELEASE_NOTES.md (add explanations, translations, mark main features with **)
vim RELEASE_NOTES.md

# 3. Format release notes for GitHub (optional, done automatically by CI)
npm run release:format

# 4. Verify everything is ready (optional)
npm run release:check

# 5. Bump version (choose one)
npm run bump:alpha    # For alpha testing
npm run bump:beta     # For beta testing
npm run bump:release  # For stable release

# 6. Push to GitHub
git push && git push --tags

# 7. Wait for GitHub Actions to complete

# 8. For stable releases: Create GitHub release manually
#    Go to: https://github.com/Thank-you-Linus/Linus-Dashboard/releases/new

# 9. For stable releases only: Publish to forums
npm run forums:open
```

### Available NPM Scripts | Scripts NPM disponibles

```bash
# 🚀 One-Command Release (Easiest)
npm run create:alpha       # Create complete alpha pre-release (one command)
npm run create:beta        # Create complete beta pre-release (one command)
npm run create:release     # Create complete stable release (one command)

# 📝 Release Preparation (Manual Control)
npm run release:notes      # Generate RELEASE_NOTES.md
npm run release:format     # Format release notes for GitHub (with collapsible sections)
npm run release:validate   # Validate RELEASE_NOTES.md
npm run release:check      # Validate release is ready (17 checks)
npm run release:changelog  # Generate CHANGELOG.md for HACS

# 📦 Version Management (Manual Control)
npm run bump:alpha         # Bump to alpha version
npm run bump:beta          # Bump to beta version
npm run bump:release       # Bump to stable version
npm run release:rollback   # Rollback a failed release

# 🧪 Testing
npm run test:smoke         # Run smoke tests on build

# 📢 Publishing
npm run forums:open        # Open forum announcement pages
```

---

## 🆕 New Features | Nouvelles Fonctionnalités

### Release Rollback | Retour en arrière de release

If a release fails, you can safely rollback:

Si une release échoue, vous pouvez revenir en arrière en toute sécurité :

```bash
npm run release:rollback 2.0.0-beta.3
```

This will | Cela va :
- Delete local and remote tags | Supprimer les tags locaux et distants
- Delete GitHub release | Supprimer la release GitHub
- Revert version changes | Annuler les changements de version
- Clean up release notes | Nettoyer les notes de version

### Smoke Tests | Tests de validation

Automated tests run before every release:

Des tests automatisés s'exécutent avant chaque release :

```bash
npm run test:smoke
```

Validates | Valide :
- Build output exists and is valid
- Version consistency across files
- Manifest.json and hacs.json syntax
- Python file syntax
- No sensitive data in build

### CHANGELOG for HACS | CHANGELOG pour HACS

Automatically generates HACS-compatible changelog:

Génère automatiquement un changelog compatible HACS :

```bash
npm run release:changelog
```

Creates `CHANGELOG.md` with:
- All releases by date
- Categorized changes (Added, Fixed, Changed)
- Links to GitHub releases

### Enhanced Validation | Validation améliorée

The `release:check` command now performs 17 checks:

La commande `release:check` effectue maintenant 17 vérifications :

1. Git status is clean
2. On correct branch
3. Up to date with remote
4. RELEASE_NOTES.md exists
5. Dependencies installed
6. Linting passes
7. Type checking passes
8. Build succeeds
9. Version consistency
10. No FIXME/TODO comments
11. CHANGELOG.md exists (NEW)
12. Manifest.json valid (NEW)
13. HACS.json valid (NEW)
14. No sensitive data (NEW)
15. Python syntax valid (NEW)
16. README files exist (NEW)
17. LICENSE exists (NEW)

---

## Best Practices | Bonnes Pratiques

### ✅ DO | À FAIRE

- **Use the one-command scripts** (`npm run create:beta`) for easier releases
- Always generate and review release notes
- **Mark main features with bold (`**text**`)** in RELEASE_NOTES.md for Discord notifications
- Format release notes for GitHub to keep them concise
- Test beta versions before stable release
- Use semantic versioning correctly
- Write clear commit messages (they become release notes!)
- Update documentation
- Respond to beta tester feedback
- Run smoke tests before releasing

### ❌ DON'T | À NE PAS FAIRE

- Skip beta testing for major changes
- Push directly to stable without testing
- Forget to update version in all files (scripts handle this)
- Ignore build/lint errors
- Release without release notes
- Delete tags without good reason
- Skip the release notes editing step

---

## Support | Aide

### Issues | Problèmes

Report issues: https://github.com/Thank-you-Linus/Linus-Dashboard/issues

### Community | Communauté

- Discord: (ask for beta tester role)
- HACF Forum: https://forum.hacf.fr/
- Home Assistant Community: https://community.home-assistant.io/

---

**Happy Releasing! | Bonne release !** 🎉
