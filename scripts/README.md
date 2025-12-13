# 📜 Scripts Directory

This directory contains all automation scripts for the Linus Dashboard project.

## 📁 Organization

### 🚀 Release Management (Main Entry Points)

These are the primary scripts you should use:

- **`create-prerelease.sh`** - 🎯 ONE-COMMAND beta/alpha release creator
  - Usage: `npm run create:beta` or `npm run create:alpha`
  - Does everything: generate notes, test, bump, tag, push
  
- **`create-release.sh`** - 🎯 ONE-COMMAND stable release creator
  - Usage: `npm run create:release`
  - Does everything: validate, test, bump, tag, push

### 📦 Release Support Scripts

These scripts are used by the main release scripts or manually:

- **`bump-version.sh`** - Bump version numbers across all files
  - Usage: `npm run bump:beta`, `npm run bump:alpha`, `npm run bump:release`
  - Called automatically by create-* scripts

- **`generate-release-notes.sh`** - Generate RELEASE_NOTES.md from git commits
  - Usage: `npm run release:notes`
  - Called automatically by create-* scripts

- **`format-release-notes.sh`** - Format release notes for GitHub (collapsible sections)
  - Usage: `npm run release:format`
  - Called automatically by create-* scripts and CI/CD

- **`generate-changelog.sh`** - Generate CHANGELOG.md for HACS
  - Usage: `npm run release:changelog`
  - Called automatically by prerelease workflow

- **`validate-release-notes.sh`** - Validate RELEASE_NOTES.md format
  - Usage: `npm run release:validate`

- **`check-release-ready.sh`** - Run 17 checks before releasing (smoke tests++)
  - Usage: `npm run release:check`

- **`rollback-release.sh`** - Rollback a failed release (delete tag, revert version)
  - Usage: `npm run release:rollback <version>`

### 🔔 Notification Scripts

- **`notify-discord.sh`** - Send release notifications to Discord
  - Called automatically by GitHub Actions workflows
  - Handles both pre-release and stable release notifications

- **`open-forums.sh`** - Open forum pages in browser for manual posting
  - Usage: `npm run forums:open`

### 🧪 Testing Scripts

- **`smoke-tests.sh`** - Run pre-release validation tests (17 checks)
  - Usage: `npm run test:smoke`
  - Called automatically by create-* scripts and CI/CD
  - Validates: build output, versions, manifests, Python syntax, etc.

### 🛠 Development Scripts

- **`setup`** - Set up development environment (Python venv, dependencies)
  - Usage: `./scripts/setup`
  - Creates ha-env, installs dependencies, creates config directory

- **`develop`** - Start Home Assistant development server
  - Usage: `./scripts/develop`
  - Starts HA with local config and custom_components

- **`dev`** - Simple development server (alternative to develop)
  - Usage: `./scripts/dev`

- **`lint`** - Run Python and TypeScript linting
  - Usage: `./scripts/lint`
  - Runs ruff (Python) and tsc (TypeScript)

### 🔧 Utility Scripts

- **`update-ha-version.sh`** - Update Home Assistant version in requirements
  - Usage: `npm run update:ha`
  - Interactive script to update HA to latest version

- **`sync-dependencies.js`** - Sync package.json and package-lock.json versions
  - Usage: `npm run sync:deps`

### 📖 Documentation

- **`README-RELEASE.md`** - Quick reference for the release system
  - Explains the new one-command release process
  - Documents fixes and improvements

## 🎯 Quick Reference

### Creating Releases

```bash
# Pre-release (beta testing)
npm run create:beta

# Stable release
npm run create:release
```

### Development

```bash
# First time setup
./scripts/setup

# Start dev server
./scripts/develop

# Run linting
./scripts/lint
```

### Testing

```bash
# Run smoke tests
npm run test:smoke

# Check if ready for release
npm run release:check
```

### Maintenance

```bash
# Update Home Assistant version
npm run update:ha

# Rollback failed release
npm run release:rollback 1.4.0-beta.2
```

## 📚 Documentation

For complete release documentation, see:
- `docs/RELEASE_GUIDE.md` - Complete release process guide
- `scripts/README-RELEASE.md` - Quick reference for new release system

## 🗑️ Removed Scripts (Dec 2025)

The following scripts were removed as they were redundant or obsolete:

- ~~`notify-discord-embeds.sh`~~ - Obsolete version with embeds
- ~~`notify-discord-v2.sh`~~ - Obsolete version
- ~~`notify-forums.sh`~~ - Redundant with `open-forums.sh`

## 🔧 Maintenance

When adding new scripts:
1. Make them executable: `chmod +x scripts/new-script.sh`
2. Add them to this README
3. Add npm script entry in `package.json` if user-facing
4. Document in `docs/RELEASE_GUIDE.md` if related to releases
