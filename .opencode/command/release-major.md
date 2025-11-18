---
description: Create a major release (breaking changes)
agent: general
---

Create a **MAJOR release** with breaking changes.

Current version: !`node -p "require('./package.json').version"`

⚠️ **WARNING**: Major releases contain breaking changes that may require user action.

## Steps to perform:

1. **Generate release notes** with breaking changes section:
   - Run: `npm run release:notes`
   - Edit RELEASE_NOTES.md focusing on:
     - **BREAKING CHANGES** section (mark clearly)
     - Migration guide
     - New features
     - What users need to do to upgrade
     - Deprecated features removed

2. **Extra validation** for major releases:
   - Run: `npm run release:validate`
   - Run: `npm run release:check` (17 validations)
   - Run: `npm run test:smoke`
   - Manual review of breaking changes

3. **Format release notes**:
   - Run: `npm run release:format`
   - Ensure breaking changes are prominently displayed

4. **Bump version** (X.Y.Z → X+1.0.0):
   - Manually edit version in files OR
   - Use: `npm version major --no-git-tag-version`
   - Then run: `npm run bump:release` to sync all files

5. **Generate CHANGELOG**:
   - Run: `npm run release:changelog`

6. **Create git tag with annotation**:
   - Run: `git add -A && git commit -m "chore: Release v$(node -p 'require(\"./package.json\").version') [BREAKING]"`
   - Run: `git tag -a "v$(node -p 'require(\"./package.json\").version')" -m "BREAKING CHANGE: [describe main breaking change]"`

7. **Push to trigger release**:
   - Run: `git push && git push --tags`

8. **Post-release communication**:
   - Forum announcements prepared automatically
   - Discord notification (with breaking change warning)
   - Update documentation immediately
   - Monitor community for upgrade issues

**Major releases are for**:
- ✅ Breaking changes
- ✅ Major refactoring
- ✅ Removed deprecated features
- ✅ API changes
- ✅ Requires user migration
- ⚠️ May break existing setups

**Before proceeding, ensure**:
- Documentation is updated
- Migration guide is complete
- Community is aware of upcoming changes
- Beta testing is complete

After running these commands, guide me through editing RELEASE_NOTES.md with proper breaking change documentation.
