# 🚀 Release Management Guide | Guide de Gestion des Releases

> This guide explains the complete release process for Linus Dashboard, from development to publication.
>
> Ce guide explique le processus complet de release pour Linus Dashboard, du développement à la publication.

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

### Step 1: Generate Release Notes

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

### Step 2: Verify Changes

Review your changes before releasing:

```bash
npm run release:check
```

This validates:
- Build succeeds
- Tests pass (if any)
- Version consistency
- RELEASE_NOTES.md exists

### Step 3: Bump Version

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

### Step 4: Push to GitHub

Push your changes and tag:

```bash
git push && git push --tags
```

### Step 5: Automated CI/CD

GitHub Actions will automatically:
1. ✅ Validate tag format
2. ✅ Checkout code
3. ✅ Install dependencies
4. ✅ Run linting and type checking
5. ✅ Build the project
6. ✅ Verify build output
7. ✅ Create ZIP archive
8. ✅ Create GitHub pre-release
9. ✅ Send Discord notification to beta testers
10. ✅ Clean up RELEASE_NOTES.md

**View the workflow**: `.github/workflows/prerelease.yml`

### Step 6: Monitor Release

1. Check GitHub Actions workflow status
2. Verify the release was created on GitHub
3. Check Discord for notification
4. Respond to beta tester feedback

---

## Stable Release Process

### Step 1: Ensure Beta Testing is Complete

Before releasing stable:
- ✅ Beta version has been tested
- ✅ No critical bugs reported
- ✅ All feedback addressed
- ✅ Documentation updated

### Step 2: Generate Final Release Notes

If you haven't already:

```bash
npm run release:notes
```

Edit `RELEASE_NOTES.md` for the final stable version.

### Step 3: Bump to Stable Version

```bash
npm run bump:release
```

This removes the pre-release suffix (e.g., `1.3.1-beta.1` → `1.3.1`).

### Step 4: Push to GitHub

```bash
git push && git push --tags
```

### Step 5: Create GitHub Release

1. Go to: https://github.com/Thank-you-Linus/Linus-Dashboard/releases
2. Click "Draft a new release"
3. Select your tag (e.g., `1.3.1`)
4. Copy content from `RELEASE_NOTES.md`
5. Mark as "Latest release"
6. Click "Publish release"

### Step 6: Automated CI/CD

GitHub Actions will automatically:
1. ✅ Validate it's not a pre-release
2. ✅ Build the project
3. ✅ Run quality checks
4. ✅ Create ZIP archive
5. ✅ Upload to release
6. ✅ Send Discord notification to public channel

**View the workflow**: `.github/workflows/release.yml`

### Step 7: Publish to Forums

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

### Step 8: Update HACS (if needed)

For major releases, HACS should automatically detect the new version.

Verify in HACS:
1. Open HACS
2. Search "Linus Dashboard"
3. Check version is updated

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

### Full Release Cycle | Cycle complet de release

```bash
# 1. Generate release notes
npm run release:notes

# 2. Edit RELEASE_NOTES.md (add explanations, translations)
vim RELEASE_NOTES.md

# 3. Verify everything is ready
npm run release:check

# 4. Bump version (choose one)
npm run bump:alpha    # For alpha testing
npm run bump:beta     # For beta testing
npm run bump:release  # For stable release

# 5. Push to GitHub
git push && git push --tags

# 6. Wait for GitHub Actions to complete

# 7. For stable releases only: Publish to forums
npm run forums:open
```

### Available NPM Scripts | Scripts NPM disponibles

```bash
npm run release:notes    # Generate RELEASE_NOTES.md
npm run release:check    # Validate release is ready
npm run bump:alpha       # Bump to alpha version
npm run bump:beta        # Bump to beta version
npm run bump:release     # Bump to stable version
npm run forums:open      # Open forum announcement pages
```

---

## Best Practices | Bonnes Pratiques

### ✅ DO | À FAIRE

- Always generate release notes
- Test beta versions before stable release
- Use semantic versioning correctly
- Write clear commit messages
- Update documentation
- Respond to beta tester feedback

### ❌ DON'T | À NE PAS FAIRE

- Skip beta testing for major changes
- Push directly to stable without testing
- Forget to update version in all files
- Ignore build/lint errors
- Release without release notes
- Delete tags without good reason

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
