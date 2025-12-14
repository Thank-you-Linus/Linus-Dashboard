---
description: Automatically create a beta pre-release with polished release notes
agent: general
---

Create a **BETA pre-release** for community testing using the fully automated workflow.

Current version: !`node -p "require('./package.json').version"`

## 🤖 Automated Workflow

You will execute the automated beta release workflow documented in `.aidriven/prompts/create_beta_release.md`.

This includes:

1. **Generate release notes** from git commits since last tag
2. **Intelligently edit and polish** the release notes:
   - Remove noise (version bumps, chores, dependency updates)
   - Add detailed descriptions in English
   - Translate everything to French with same level of detail
   - Fill specific beta testing instructions
   - Remove all TODO markers
3. **Format** release notes for GitHub
4. **Run smoke tests** (must pass 15/15)
5. **Bump version** to next beta (auto-increment)
6. **Update** release notes with final version number
7. **Push** to GitHub to trigger pre-release workflow

## 📋 Your Tasks

### Phase 1: Preparation
- [ ] Check git status (must be clean)
- [ ] Verify on main branch
- [ ] Run `bash scripts/generate-release-notes.sh`
- [ ] Read the generated `RELEASE_NOTES.md`

### Phase 2: Intelligent Editing
- [ ] **Clean up commits** - Remove:
  - Version bump commits (`chore: Bump version`)
  - Release commits (`chore: release`)
  - CI/build commits (unless user-facing)
  - Dependency updates (unless critical)
  - Merge commits
- [ ] **Enhance descriptions** - For each remaining commit:
  - Add bold title
  - Add detailed paragraph explaining problem → solution → benefit
  - Focus on user impact, not technical details
- [ ] **Translate to French** - Full translation with same detail level
- [ ] **Remove TODO markers** - All `_📝 TODO:` must be gone
- [ ] **Fill beta testing section** - Specific, actionable test cases based on changes
- [ ] **Update version** in title if needed

### Phase 3: Validation & Release
- [ ] Commit edited release notes: `git add RELEASE_NOTES.md && git commit -m "docs: Prepare release notes for vX.Y.Z-beta.N"`
- [ ] Run `bash scripts/format-release-notes.sh`
- [ ] Run `npm run test:smoke` (must pass all tests)
- [ ] Run `printf "y\n" | bash scripts/bump-version.sh beta`
- [ ] Update RELEASE_NOTES.md with final version
- [ ] Regenerate formatted notes: `bash scripts/format-release-notes.sh`
- [ ] Amend commit: `git add RELEASE_NOTES.md RELEASE_NOTES_FORMATTED.md && git commit --amend --no-edit`
- [ ] Update tag: `git tag -d X.Y.Z-beta.N && git tag -a X.Y.Z-beta.N -m "Release X.Y.Z-beta.N"`
- [ ] Push: `git push && git push --tags`

## 🎯 Quality Standards

The release notes MUST:
- ✅ Be in both English and French with equal quality
- ✅ Have NO TODO markers
- ✅ Include detailed explanations (not just commit messages)
- ✅ Have specific beta testing instructions
- ✅ Be focused on user value (not technical implementation)
- ✅ Be clean (no noise commits like version bumps)

## 📊 Example of Good vs Bad

**❌ Bad (raw commit)**:
```markdown
- fix: Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts
```

**✅ Good (polished)**:
```markdown
- **Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts**
  Fixed a critical issue where duplicate custom element registrations could cause dashboard loading failures. The system now automatically detects and cleans up duplicate resource versions to ensure smooth operation.
```

## 🚀 After Completion

Report:
- ✅ Version created (e.g., `1.4.0-beta.3`)
- ✅ Commits pushed
- ✅ GitHub Actions URL: https://github.com/Thank-you-Linus/Linus-Dashboard/actions
- ✅ Release URL: https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/X.Y.Z-beta.N
- ✅ Summary of changes included

## ⚠️ Important Notes

- This process requires approximately **2-5 minutes**
- You MUST edit release notes intelligently (don't just use raw commits)
- All smoke tests must pass before pushing
- The workflow will automatically send Discord notifications to beta testers

**Beta releases are for**:
- ✅ Community testing
- ✅ Getting feedback before stable
- ✅ Validating new features
- ✅ Finding edge cases
- ⚠️ May contain bugs

Follow the detailed workflow in `.aidriven/prompts/create_beta_release.md` for complete instructions.
