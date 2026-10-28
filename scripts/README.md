# 📜 Scripts Directory

This directory contains all automation scripts for the Linus Dashboard project.

## 📁 Organization

### 🚀 Releases

A release goes out **only** through the GitHub Actions buttons **Beta Release (manual)**
(`.github/workflows/beta-release.yml`) and **Stable Release (manual)**
(`.github/workflows/stable-release.yml`). No workflow listens on tags: a tag pushed by hand publishes
nothing. Full procedure, CHANGELOG, rollback and stable announcement: `docs/RELEASE_GUIDE.md`.

### 📦 Release Support Scripts

Called by the buttons, or run locally to check or preview:

- **`bump-version.sh`** - Bump the version in `package.json`, `manifest.json` and `const.py`, commit
  `chore: Bump version to X` and tag
  - Called by both buttons (`beta|alpha` and `release`)
  - `--files-only`: update the version files only (no commit, no tag)

- **`generate-release-notes.sh`** - Generate RELEASE_NOTES.md from git commits
  - Called by both buttons with `--ci` (stable: `--ci --since-stable`), published as the release body
  - Local preview: `npm run release:notes` (do not commit the file)

- **`release-contributors.sh`** - Credits external contributors in the release notes
  - Used by `generate-release-notes.sh`

- **`generate-changelog.sh`** - Generate the CHANGELOG.md section of the current version
  - Usage: `npm run release:changelog`, in a PR after each button (see `docs/RELEASE_GUIDE.md`)

- **`check-release-ready.sh`** - Readiness report before clicking a button
  - Usage: `npm run release:check`

- **`ci-local.sh`** - Local simulation of the CI and of the buttons' checks
  - Usage: `npm run test:ci [main-check|beta-release|stable-release|all]`

### 🔔 Notification Scripts

- **`notify-discord.sh`** - Send release notifications to Discord
  - `prerelease`: called by the Beta Release button (beta testers channel)
  - `release`: called by the Stable Release button and by the catch-up button
    "Announce stable release on Discord (manual)" (#annonces)

- **`open-forums.sh`** - Open forum pages in browser for manual posting
  - Usage: `npm run forums:open`

### 🧪 Testing Scripts

- **`smoke-tests.sh`** - Run pre-release validation tests (17 checks)
  - Usage: `npm run test:smoke`
  - Called by both release buttons
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

## 🎯 Quick Reference

### Creating Releases

GitHub → Actions → **Beta Release (manual)** or **Stable Release (manual)** → Run workflow (tick
`dry_run` first). See `docs/RELEASE_GUIDE.md`.

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
```

A failed or bad release is rolled back by hand: `docs/RELEASE_GUIDE.md` § Rollback.

## 📚 Documentation

For complete release documentation, see:
- `docs/RELEASE_GUIDE.md` - The single release reference

## 🗑️ Removed Scripts (Dec 2025)

The following scripts were removed as they were redundant or obsolete:

- ~~`notify-discord-embeds.sh`~~ - Obsolete version with embeds
- ~~`notify-discord-v2.sh`~~ - Obsolete version
- ~~`notify-forums.sh`~~ - Redundant with `open-forums.sh`

The local release scripts of the former tag-push path (one-command beta/stable creators, release
notes formatting and validation, commit analysis, scripted rollback) were removed in TK-170: the
buttons replace them.

## 🔧 Maintenance

When adding new scripts:
1. Make them executable: `chmod +x scripts/new-script.sh`
2. Add them to this README
3. Add npm script entry in `package.json` if user-facing
4. Document in `docs/RELEASE_GUIDE.md` if related to releases
