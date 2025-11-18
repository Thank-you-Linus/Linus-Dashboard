---
description: Create a patch release (bug fixes only)
agent: general
---

Create a **PATCH release** for bug fixes only.

Current version: !`node -p "require('./package.json').version"`

## Steps to perform:

1. **Generate release notes** optimized for bug fixes:
   - Run: `npm run release:notes`
   - Edit RELEASE_NOTES.md focusing on:
     - Bug fixes (mark main fixes with **)
     - No new features
     - No breaking changes

2. **Validate everything**:
   - Run: `npm run release:validate`
   - Run: `npm run release:check` (17 validations)

3. **Format release notes**:
   - Run: `npm run release:format`

4. **Bump version** (X.Y.Z → X.Y.Z+1):
   - Run: `npm run bump:release`
   - This creates a patch version increment

5. **Push to trigger release**:
   - Run: `git push && git push --tags`

6. **Monitor workflow**:
   - Check GitHub Actions for build status
   - Verify release creation
   - Check Discord notification

**Patch releases are for**:
- ✅ Bug fixes
- ✅ Security patches
- ✅ Documentation updates
- ❌ No new features
- ❌ No breaking changes

After running these commands, guide me through editing RELEASE_NOTES.md if needed.
