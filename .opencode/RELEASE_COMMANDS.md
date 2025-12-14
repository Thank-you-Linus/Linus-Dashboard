# 🎮 OpenCode Release Commands

Custom OpenCode commands for streamlined release management.

---

## 📋 Available Commands

### 🔍 Pre-Release Validation

```bash
/release-check
```

Runs comprehensive validation (17 checks) before any release:
- Git status, branch, and sync
- Dependencies and build
- Linting and type checking
- Version consistency
- Required files validation
- Security checks

**When to use**: Before any release to ensure everything is ready.

---

### 🔧 Patch Release (X.Y.Z → X.Y.Z+1)

```bash
/release-patch
```

For bug fixes and minor updates:
- ✅ Bug fixes
- ✅ Security patches
- ✅ Documentation updates
- ❌ No new features
- ❌ No breaking changes

**Example**: `2.0.3` → `2.0.4`

---

### ✨ Minor Release (X.Y.Z → X.Y+1.0)

```bash
/release-minor
```

For new features (backward compatible):
- ✅ New features
- ✅ New functionality
- ✅ Improvements
- ✅ Bug fixes
- ✅ Backward compatible
- ❌ No breaking changes

**Example**: `2.0.4` → `2.1.0`

---

### 💥 Major Release (X.Y.Z → X+1.0.0)

```bash
/release-major
```

For breaking changes:
- ✅ Breaking changes
- ✅ Major refactoring
- ✅ API changes
- ✅ Removed deprecated features
- ⚠️ Requires user migration

**Example**: `2.1.0` → `3.0.0`

---

### 🧪 Beta Pre-Release (X.Y.Z → X.Y.Z-beta.N)

```bash
/release-beta
```

For community testing before stable:
- ✅ Feature-complete
- ✅ Needs community feedback
- ✅ May have minor bugs
- ⚠️ Limited distribution

**Example**: `2.1.0` → `2.1.0-beta.1`

**🤖 NEW: Automated Beta Release**

```bash
/create-beta-release
```

**Fully automated** beta release with intelligent release notes editing:
- ✅ Generates notes from git commits
- ✅ Automatically removes noise (version bumps, merges, etc.)
- ✅ Adds detailed descriptions in English
- ✅ Full French translation with same quality
- ✅ Specific beta testing instructions
- ✅ Runs all validations and tests
- ✅ Bumps version and pushes to GitHub

**This is the recommended way to create beta releases!**

See: `docs/AUTOMATED_BETA_RELEASE_PROCESS.md` for full details.

---

### 🔬 Alpha Pre-Release (X.Y.Z → X.Y.Z-alpha.N)

```bash
/release-alpha
```

For very early testing:
- ✅ Experimental features
- ✅ Core team only
- ⚠️ Expect bugs
- ❌ NOT for production

**Example**: `2.1.0` → `2.1.0-alpha.1`

---

### ⏮️ Rollback Failed Release

```bash
/release-rollback <version>
```

Rollback a failed release:
- Deletes local and remote tags
- Deletes GitHub release
- Reverts version changes
- Cleans up release files

**Example**: `/release-rollback 2.1.0-beta.3`

---

## 🚀 Typical Workflows

### Workflow 1: Bug Fix Release

```bash
# 1. Check if ready
/release-check

# 2. Create patch release
/release-patch

# Follow the guided steps
```

### Workflow 2: New Feature Release

```bash
# 1. Start with beta for testing
/release-beta

# Beta testers provide feedback...

# 2. If all good, create stable minor release
/release-minor

# 3. Announce on forums (automatic)
```

### Workflow 3: Major Version with Breaking Changes

```bash
# 1. Alpha testing with core team
/release-alpha

# Fix critical issues...

# 2. Beta testing with community
/release-beta

# Address feedback...

# 3. Stable major release
/release-major

# 4. Monitor for issues, help users migrate
```

### Workflow 4: Release Failed

```bash
# If release fails during CI/CD

# 1. Check what went wrong in GitHub Actions logs

# 2. Rollback
/release-rollback 2.1.0-beta.3

# 3. Fix the issues
npm run build
npm run lint

# 4. Validate fixes
/release-check

# 5. Try again
/release-beta
```

---

## 📖 Command Details

### What Each Command Does

All commands follow this general pattern:

1. **Show current version** (using shell output)
2. **Guide through release steps**:
   - Generate release notes
   - Validate everything
   - Format for GitHub
   - Bump version
   - Push to GitHub
3. **Explain what happens next** (automated workflow)
4. **Provide troubleshooting** if needed

### Features

- ✅ **Interactive**: Commands guide you through each step
- ✅ **Safe**: Validation before any changes
- ✅ **Automated**: GitHub Actions handle the rest
- ✅ **Documented**: Each step explained
- ✅ **Integrated**: Uses existing npm scripts

---

## 🎯 Quick Reference

| Release Type | Command | Version Change | Use Case |
|-------------|---------|----------------|----------|
| Patch | `/release-patch` | 2.0.3 → 2.0.4 | Bug fixes |
| Minor | `/release-minor` | 2.0.4 → 2.1.0 | New features |
| Major | `/release-major` | 2.1.0 → 3.0.0 | Breaking changes |
| Beta | `/release-beta` | 2.1.0 → 2.1.0-beta.1 | Testing |
| Alpha | `/release-alpha` | 2.1.0 → 2.1.0-alpha.1 | Early testing |
| Rollback | `/release-rollback <ver>` | Reverts version | Failed release |
| Check | `/release-check` | No change | Validation |

---

## 💡 Tips

### Before Any Release

1. Always run `/release-check` first
2. Make sure all changes are committed
3. Be on the `main` branch
4. Pull latest changes from remote

### Writing Release Notes

When editing `RELEASE_NOTES.md`:

1. **Mark main features with bold** (`**text**`)
   - These appear in Discord notifications
   - These appear prominently in GitHub
   
2. **Be specific and clear**
   - Users should understand what changed
   - Include "why" not just "what"
   
3. **Include screenshots if relevant**
   - Visual changes benefit from images
   
4. **Add beta testing instructions** (for beta/alpha)
   - What to test
   - How to report issues
   - Known limitations

### Version Numbering

Follow [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.0.0): Breaking changes
- **MINOR** (X.Y.0): New features, backward compatible
- **PATCH** (X.Y.Z): Bug fixes
- **PRE-RELEASE**: `-alpha.N` or `-beta.N`

### When to Use Each Type

**Patch** (`/release-patch`):
- Fixed a bug
- Typo corrections
- Performance improvements (no API changes)
- Documentation updates

**Minor** (`/release-minor`):
- Added new feature
- New component or view
- Enhanced existing feature
- Backward compatible improvements

**Major** (`/release-major`):
- Changed configuration format
- Removed deprecated features
- Changed Home Assistant requirements
- Incompatible API changes

**Beta** (`/release-beta`):
- Feature is ready but needs testing
- Want community feedback
- Before stable release of minor/major

**Alpha** (`/release-alpha`):
- Very experimental feature
- Core team testing only
- Proof of concept
- Frequent changes expected

---

## 🆘 Troubleshooting

### Command Not Found

If `/release-*` commands don't work:

1. Check `.opencode/command/` directory exists
2. Verify markdown files are present
3. Restart OpenCode TUI
4. Try typing `/` to see available commands

### Validation Fails

If `/release-check` shows errors:

```bash
# For build errors
npm run build

# For lint errors
npm run lint

# For type errors
npm run type-check

# For version mismatch
# Re-run the appropriate bump command
```

### Release Fails on GitHub

If GitHub Actions workflow fails:

1. Check the workflow logs for errors
2. Use `/release-rollback <version>` to clean up
3. Fix the reported issues
4. Run `/release-check` to validate
5. Try the release again

### Need to Undo a Release

If you need to undo a published release:

```bash
# Rollback the version and tags
/release-rollback 2.1.0-beta.3

# Fix issues
# Then create new release
```

---

## 📚 Related Documentation

- **Detailed Improvements**: `ADVANCED_IMPROVEMENTS.md`
- **Release Guide**: `docs/RELEASE_GUIDE.md`
- **npm Scripts**: `package.json`
- **Workflows**: `.github/workflows/`

---

## ✅ Testing the Commands

Before using in production, test the commands:

```bash
# 1. Test validation
/release-check

# 2. Test with a fake beta
/release-beta
# (Create RELEASE_NOTES.md, but DON'T push)

# 3. Test rollback with a dummy tag
git tag 999.999.999-test
/release-rollback 999.999.999-test
```

---

**These commands integrate seamlessly with the existing release system while providing a more intuitive, guided experience!** 🎉
