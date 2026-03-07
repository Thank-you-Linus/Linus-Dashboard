---
description: Check if project is ready for release
agent: general
---

Run comprehensive pre-release validation checks.

Current version: !`node -p "require('./package.json').version"`

## Running validation checks:

```bash
npm run release:check
```

## What will be checked (17 validations):

1. ✅ Git status is clean
2. ✅ On correct branch (main/master)
3. ✅ Up to date with remote
4. ✅ RELEASE_NOTES.md exists
5. ✅ Dependencies installed
6. ✅ Linting passes
7. ✅ Type checking passes
8. ✅ Build succeeds
9. ✅ Version consistency across files
10. ✅ No FIXME/TODO comments
11. ✅ CHANGELOG.md exists
12. ✅ Manifest.json valid
13. ✅ HACS.json valid
14. ✅ No sensitive data
15. ✅ Python syntax valid
16. ✅ README files exist
17. ✅ LICENSE exists

## Additional pre-release checks:

**Smoke tests**:
```bash
npm run test:smoke
```

**Release notes validation**:
```bash
npm run release:validate
```

## If checks fail:

**Build errors**:
- Run: `npm run build` to see detailed errors
- Fix reported issues
- Re-run checks

**Linting errors**:
- Run: `npm run lint` to fix automatically
- Or: `npm run lint:check` to see issues

**Type errors**:
- Run: `npm run type-check` to see detailed errors
- Fix type issues in TypeScript files

**Version mismatch**:
- All files should have same version:
  - package.json
  - manifest.json
  - const.py
  - linus-strategy.ts
- Run appropriate bump command to sync

## Quick fixes:

**Missing CHANGELOG.md**:
```bash
npm run release:changelog
```

**Missing RELEASE_NOTES.md**:
```bash
npm run release:notes
```

**Dependencies out of date**:
```bash
npm install
```

## After all checks pass:

Choose release type:
- `/release-patch` - Bug fixes only
- `/release-minor` - New features, backward compatible
- `/release-major` - Breaking changes
- `/release-beta` - Pre-release for testing
- `/release-alpha` - Early pre-release

Would you like me to run the validation checks now?
