# Release Notes Guidelines

## Purpose

This document defines the rules and guidelines for creating release notes that are clear, user-focused, and professional.

## Core Principles

### 1. User-Centric Content

**DO:**
- Focus on features and changes that directly impact end users
- Explain what users can do with the new features
- Use clear, non-technical language when possible
- Include configuration examples when relevant

**DON'T:**
- Include internal development processes or tooling
- Mention CI/CD pipelines, build systems, or automation tools
- Reference developer-only improvements unless they affect users
- Include commit messages verbatim without context

### 2. What to Include

**Always include:**
- New user-facing features
- Bug fixes that affect user experience
- Breaking changes that require user action
- Configuration changes or new options
- Performance improvements users will notice
- Security updates

**Never include:**
- Release automation improvements
- CI/CD workflow changes
- Development tooling updates
- Internal refactoring (unless it improves UX)
- Build process modifications
- Testing infrastructure changes

### 3. Structure and Format

```markdown
## 🇬🇧 English

### ✨ New Features
- Feature name with clear description
- What it does for the user
- How to configure/use it

### 🐛 Bug Fixes
- What was broken
- What is now fixed

### ⚡ Improvements
- Performance improvements
- UX enhancements
- Documentation updates

### 🧪 For Beta Testers
- Specific testing instructions
- Known issues
- How to report bugs

## 🇫🇷 Français
[Same structure in French]
```

### 4. Language Guidelines

**English and French:**
- Use simple, clear language
- Avoid jargon unless necessary
- Explain technical terms when used
- Be concise but complete

**Example of good release note:**
```markdown
#### Embedded Dashboard Support
- Full support for embedding external Lovelace dashboards directly within Linus Dashboard
- Allows seamless integration of custom dashboards from other integrations
- Compatible with all standard Home Assistant dashboard types
```

**Example of bad release note (too technical):**
```markdown
#### Release Management System
- Automated release workflow with NPM scripts
- GitHub Actions workflows enhanced
- 10-point validation system
- 90% automation of release process
```
*This is internal tooling and doesn't affect end users.*

### 5. Examples

#### ✅ Good Examples

**Feature Description:**
```markdown
#### Admin-Only Panel Visibility
- Configure panels to be visible only to administrator users
- Uses Home Assistant's built-in user roles and permissions system
- Perfect for debug information, system statistics, or administrative controls
```

**Configuration Example:**
```yaml
# In your Home Assistant dashboard configuration
views:
  - title: Admin Panel
    visible:
      - user: admin_user_id
    # Your admin-specific cards here
```

#### ❌ Bad Examples

**Too Vague:**
```markdown
- Added new features
- Fixed some bugs
- Improved performance
```

**Too Technical/Internal:**
```markdown
- Refactored release pipeline with 10-point validation
- Added pre-commit hooks for release automation
- Implemented Discord webhook integration for CI/CD
```

### 6. Beta Testing Section

Always include specific testing instructions:

```markdown
### 🧪 For Beta Testers

**What to test:**
- [ ] Specific feature in specific scenario
- [ ] Edge cases or compatibility issues
- [ ] Performance with large datasets
- [ ] Mobile/browser compatibility

**Known Issues:**
- List of known limitations
- Workarounds if available

**How to Report Issues:**
Link to GitHub issues with template
```

### 7. Version Numbering

Follow semantic versioning:
- **Major (X.0.0)**: Breaking changes
- **Minor (1.X.0)**: New features, backwards compatible
- **Patch (1.0.X)**: Bug fixes only
- **Pre-release**: 1.0.0-beta.1, 1.0.0-alpha.1

### 8. Bilingual Requirements

All release notes must be in both English and French:
- Translate all user-facing content
- Keep technical terms consistent
- Adapt examples to be culturally appropriate
- Maintain same structure in both languages

### 9. Commit Message Filtering

When generating from commits:

**Include:**
- feat: New features
- fix: Bug fixes
- perf: Performance improvements (user-visible)

**Exclude:**
- chore: Maintenance tasks
- ci: CI/CD changes
- build: Build system changes
- docs: Documentation (unless user-facing)
- test: Testing changes
- refactor: Code refactoring (unless UX impact)

### 10. Review Checklist

Before finalizing release notes:

- [ ] All content is user-focused
- [ ] No internal tooling mentioned
- [ ] Configuration examples included where needed
- [ ] Testing instructions are clear and specific
- [ ] Both languages are complete and accurate
- [ ] Version number follows semantic versioning
- [ ] Known issues are documented
- [ ] Links to documentation/issues are included

## Common Mistakes to Avoid

1. ❌ **Including release automation in user notes**
   - Wrong: "Added automated release workflow"
   - Right: Don't mention it at all

2. ❌ **Using developer jargon**
   - Wrong: "Refactored the redux store for better state management"
   - Right: "Improved dashboard loading performance"

3. ❌ **Vague descriptions**
   - Wrong: "Fixed bugs and improved things"
   - Right: "Fixed dashboard reload issue when switching between views"

4. ❌ **Missing configuration examples**
   - Wrong: "You can now configure admin-only panels"
   - Right: Include the YAML configuration example

5. ❌ **Forgetting translations**
   - Wrong: Only English content
   - Right: Complete bilingual content

## Template

Use this template for all releases:

```markdown
# 🎉 Release Notes

> **Beta Release** - This version includes new features for testing.
> **Version Beta** - Cette version inclut de nouvelles fonctionnalités à tester.

---

## 🇬🇧 English

### ✨ New Features

[User-facing features only]

### 🐛 Bug Fixes

[User-facing fixes only]

### ⚡ Improvements

[Performance, UX, documentation - user-visible only]

### 🧪 For Beta Testers

**What to test:**
- [ ] Specific items

**Known Issues:**
- List of issues

**How to Report Issues:**
[Link to GitHub]

---

## 🇫🇷 Français

[Same structure, fully translated]

---

## 📊 Technical Details

### Compatibility
- Home Assistant version
- Browser requirements
- Mobile requirements

### Installation
[HACS and manual instructions]

### Configuration
[YAML examples if applicable]
```

## Enforcement

This rule should be automatically checked during release note generation:
1. AI agent must filter out internal/developer content
2. AI agent must ensure bilingual completeness
3. AI agent must include configuration examples
4. Manual review must verify user-focus

## References

- [Semantic Versioning](https://semver.org/)
- [Keep a Changelog](https://keepachangelog.com/)
- [User-Centered Documentation](https://www.writethedocs.org/)

---

Last updated: 2024-11-18
