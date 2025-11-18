---
description: Create a minor release (new features, backward compatible)
agent: general
---

Create a **MINOR release** with new features (backward compatible).

Current version: !`node -p "require('./package.json').version"`

## Steps to perform:

1. **Generate release notes** optimized for new features:
   - Run: `npm run release:notes`
   - Edit RELEASE_NOTES.md focusing on:
     - New features (mark main features with **)
     - Improvements and enhancements
     - Bug fixes (if any)
     - Ensure backward compatibility

2. **Validate everything**:
   - Run: `npm run release:validate`
   - Run: `npm run release:check` (17 validations)
   - Run: `npm run test:smoke` (optional pre-check)

3. **Format release notes**:
   - Run: `npm run release:format`

4. **Bump version** (X.Y.Z → X.Y+1.0):
   - Manually edit version in files OR
   - Use: `npm version minor --no-git-tag-version`
   - Then run: `npm run bump:release` to sync all files

5. **Generate CHANGELOG**:
   - Run: `npm run release:changelog`

6. **Push to trigger release**:
   - Run: `git add -A && git commit -m "chore: Release v$(node -p 'require(\"./package.json\").version')"`
   - Run: `git push && git push --tags`

7. **Post-release**:
   - Prepare forum notifications (automatic)
   - Check Discord notification
   - Verify HACS detects new version

**Minor releases are for**:
- ✅ New features
- ✅ New functionality
- ✅ Improvements
- ✅ Bug fixes
- ✅ Backward compatible
- ❌ No breaking changes

After running these commands, guide me through editing RELEASE_NOTES.md if needed.
