---
description: Create a beta pre-release for testing
agent: general
---

Create a **BETA pre-release** for community testing.

Current version: !`node -p "require('./package.json').version"`

## Steps to perform:

1. **Generate release notes** for beta testers:
   - Run: `npm run release:notes`
   - Edit RELEASE_NOTES.md focusing on:
     - Features to test (mark with **)
     - Known issues
     - What to test specifically
     - How to report bugs

2. **Beta-specific testing notes**:
   - Add "For Beta Testers" section
   - List specific testing scenarios
   - Include rollback instructions if needed

3. **Validate everything**:
   - Run: `npm run release:validate`
   - Run: `npm run release:check` (17 validations)
   - Run: `npm run test:smoke`

4. **Format release notes**:
   - Run: `npm run release:format`

5. **Bump to beta version**:
   - Run: `npm run bump:beta`
   - This creates version like: X.Y.Z-beta.N

6. **Push to trigger pre-release**:
   - Run: `git push && git push --tags`

7. **Workflow will automatically**:
   - Generate CHANGELOG.md
   - Run smoke tests
   - Build and create ZIP
   - Create GitHub pre-release (marked as beta)
   - Send Discord notification to @Beta Tester 🔍
   - Clean up release notes files

8. **Monitor beta testing**:
   - Watch for Discord feedback
   - Check GitHub issues
   - Respond to beta tester reports
   - Plan fixes or stable release

**Beta releases are for**:
- ✅ Community testing
- ✅ Getting feedback before stable
- ✅ Validating new features
- ✅ Finding edge cases
- ✅ Limited distribution
- ⚠️ May contain bugs

**After beta testing**:
- If successful: Create stable release with `/release-patch`, `/release-minor`, or `/release-major`
- If issues found: Fix and create new beta with incremented beta number
- If critical issues: Use `npm run release:rollback X.Y.Z-beta.N`

After running these commands, guide me through editing the beta testing instructions in RELEASE_NOTES.md.
