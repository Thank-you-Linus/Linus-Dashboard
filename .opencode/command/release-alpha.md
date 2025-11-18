---
description: Create an alpha pre-release for early testing
agent: general
---

Create an **ALPHA pre-release** for very early testing.

Current version: !`node -p "require('./package.json').version"`

⚠️ **ALPHA**: Very early stage, expect issues, limited distribution.

## Steps to perform:

1. **Generate minimal release notes**:
   - Run: `npm run release:notes`
   - Edit RELEASE_NOTES.md with:
     - Experimental features
     - Known limitations
     - Warning about instability
     - Core team testing instructions

2. **Alpha-specific warnings**:
   - Add prominent "ALPHA - NOT FOR PRODUCTION" warning
   - List what's NOT working yet
   - Explain this is for internal/core team testing

3. **Quick validation**:
   - Run: `npm run release:check`
   - Run: `npm run test:smoke`
   - Manual code review

4. **Format release notes**:
   - Run: `npm run release:format`

5. **Bump to alpha version**:
   - Run: `npm run bump:alpha`
   - This creates version like: X.Y.Z-alpha.N

6. **Push to trigger pre-release**:
   - Run: `git push && git push --tags`

7. **Workflow will automatically**:
   - Run smoke tests
   - Build and create ZIP
   - Create GitHub pre-release (marked as alpha)
   - Send Discord notification
   - Clean up release notes files

8. **Alpha testing scope**:
   - Core team only
   - Developers with test environments
   - Not for production use
   - Fast iteration expected

**Alpha releases are for**:
- ✅ Very early testing
- ✅ Core team feedback
- ✅ Experimental features
- ✅ Proof of concepts
- ✅ Rapid iteration
- ⚠️ Expect bugs and issues
- ❌ NOT for production
- ❌ NOT for general users

**Progression path**:
1. **Alpha** → Fix major issues → **Beta** → Community testing → **Stable**
2. If critical issues: Use `npm run release:rollback X.Y.Z-alpha.N`

After running these commands, guide me through marking this as an experimental alpha release in RELEASE_NOTES.md.
