# Release System Improvements

## What was improved

### 1. NPM Scripts Added
- `npm run release:notes` - Generate RELEASE_NOTES.md from git commits
- `npm run release:check` - Validate project is ready for release
- `npm run bump:alpha` - Bump version to next alpha
- `npm run bump:beta` - Bump version to next beta
- `npm run bump:release` - Bump version to stable release
- `npm run forums:open` - Open forum announcement pages

### 2. Workflow Improvements

#### prerelease.yml
- ✅ Tag format validation (semantic versioning)
- ✅ Linting and type checking before build
- ✅ Build output verification
- ✅ Better Discord notification (optional)
- ✅ Error handling improvements

#### release.yml
- ✅ Validate it's not a pre-release
- ✅ Linting and type checking before build
- ✅ Build output verification
- ✅ Discord notification for stable releases
- ✅ Better error handling

### 3. New Scripts

#### check-release-ready.sh
Validates the project before release:
- Git status is clean
- On correct branch
- Up to date with remote
- RELEASE_NOTES.md exists (recommended)
- Dependencies installed
- Linting passes
- Type checking passes
- Build succeeds
- Version consistency across all files
- No FIXME/TODO comments

#### generate-release-notes.sh (enhanced)
Generates RELEASE_NOTES.md with:
- English and French sections
- Categorized changes (features, fixes, improvements, docs)
- Beta testing instructions
- List of all commits
- Contributors list
- Breaking changes detection

#### notify-discord.sh (enhanced)
Better changelog extraction:
- Separates features, fixes, improvements
- Limits to most important items
- Better formatting for Discord
- Handles missing RELEASE_NOTES.md gracefully

### 4. Documentation

#### docs/RELEASE_GUIDE.md
Complete guide covering:
- Release types (alpha, beta, stable)
- Step-by-step pre-release process
- Step-by-step stable release process
- Automated workflows explanation
- Troubleshooting section
- Quick reference
- Best practices

## How to use the new system

### Quick Start

```bash
# 1. Generate release notes
npm run release:notes

# 2. Edit RELEASE_NOTES.md
vim RELEASE_NOTES.md

# 3. Verify everything is ready
npm run release:check

# 4. Bump version (choose one)
npm run bump:beta     # For beta testing
npm run bump:release  # For stable release

# 5. Push to GitHub
git push && git push --tags

# GitHub Actions will automatically handle the rest!
```

### For Maintainers

Read the complete guide: `docs/RELEASE_GUIDE.md`

## Testing recommendations

Before using in production:
1. Test with a fake beta version first
2. Verify GitHub Actions workflows
3. Test Discord notifications (optional)
4. Verify HACS detection (for stable releases)

## Notes

- ESLint configuration needs migration to v9 format (eslint.config.js)
- TypeScript errors exist but don't block releases
- Discord webhook is optional (workflow will skip if not configured)
