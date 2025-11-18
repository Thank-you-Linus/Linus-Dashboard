---
description: Rollback a failed release
agent: general
---

Rollback a failed release: $ARGUMENTS

⚠️ **This will delete the release and revert version changes.**

## Current situation check:

Recent tags: !`git tag -l --sort=-version:refname | head -5`

## Rollback process:

1. **Verify the version to rollback**: $1
   - Is this the correct version? (Y/N)

2. **Run rollback script**:
   - Command: `npm run release:rollback $1`

3. **What the script will do**:
   - ✅ Delete local git tag: $1
   - ✅ Delete remote git tag: $1  
   - ✅ Delete GitHub release: $1
   - ✅ Revert version changes in all files
   - ✅ Clean up RELEASE_NOTES files
   - ✅ Provide next steps

4. **After rollback**:
   - Check GitHub to confirm release is deleted
   - Verify tags are removed: `git tag -l`
   - Fix the issues that caused the failure
   - Run: `npm run release:check` to validate fixes

5. **Create new release** once fixed:
   - For beta: `/release-beta`
   - For stable: `/release-patch`, `/release-minor`, or `/release-major`

## Common rollback scenarios:

**Build failed**:
- Fix build errors
- Run: `npm run build` to test
- Run: `npm run test:smoke`

**Linting/Type errors**:
- Run: `npm run lint`
- Run: `npm run type-check`
- Fix reported issues

**Version mismatch**:
- Check all version files are synced
- Re-run bump command

**Validation failed**:
- Run: `npm run release:check`
- Address all errors and warnings

## Usage:

```bash
/release-rollback 2.0.0-beta.3
```

This command requires the version number as an argument.

Would you like to proceed with rollback of version: $1?
