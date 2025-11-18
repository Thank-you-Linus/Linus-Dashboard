# 📬 Notification System Improvements

## Summary of Changes

All notification issues have been resolved and the system has been improved for better user experience.

---

## ✅ Fixed Issues

### 1. Discord Role Issue
**Problem**: The role appeared as "@rôle inconnu" (unknown role)
**Solution**: Changed from Discord role ID `<@&1420724757791379576>` to role name `@Beta Tester 🔍` in `.github/templates/discord-prerelease.md`

### 2. Escaped Newlines (`\n`)
**Problem**: Literal `\n` characters appeared in Discord messages instead of actual line breaks
**Solution**: 
- Replaced all `\n` string literals with real newlines in `scripts/notify-discord.sh`
- Updated all sections: CHANGELOG_EN, CHANGELOG_FR, TESTING_NOTES_EN, TESTING_NOTES_FR

### 3. Content Mismatch
**Problem**: Discord notification didn't match the release notes content
**Solution**:
- Modified extraction to use only **bold items** (`grep -E '^[[:space:]]*-[[:space:]]*\*\*'`) for main features
- Fixed sed patterns from `/###/` to `/^### /` to correctly capture sections
- Changed `grep '^-'` to `grep -E '^[[:space:]]*-'` using `[[:space:]]` for better compatibility

### 4. Release Notes Too Long
**Problem**: GitHub release notes were very long with both languages fully expanded
**Solution**: 
- Created new script `scripts/format-release-notes.sh` that formats release notes with collapsible sections
- Main features are visible immediately
- Detailed descriptions hidden in `<details>` tags
- French version in collapsible sections for improvements
- Technical details collapsed by default

---

## 📝 New Files Created

1. **`scripts/format-release-notes.sh`**
   - Formats RELEASE_NOTES.md for GitHub with collapsible sections
   - Creates RELEASE_NOTES_FORMATTED.md
   - Executable script

2. **`RELEASE_NOTES_FORMATTED.md`** (generated)
   - Formatted version for GitHub releases
   - Automatically cleaned up after release

---

## 🔧 Modified Files

1. **`.github/templates/discord-prerelease.md`**
   - Line 2: Changed role mention to `@Beta Tester 🔍`

2. **`scripts/notify-discord.sh`**
   - Lines 62-98: Replaced `\n` with real newlines
   - Fixed grep patterns to use `[[:space:]]` instead of `\s`
   - Fixed sed patterns to properly capture sections
   - Changed to extract only bold items for features and fixes

3. **`.github/workflows/prerelease.yml`**
   - Lines 81-103: Updated to format release notes before creating GitHub release
   - Lines 132-140: Updated cleanup to remove both RELEASE_NOTES files

4. **`package.json`**
   - Added new script: `"release:format": "bash scripts/format-release-notes.sh"`

5. **`docs/RELEASE_GUIDE.md`**
   - Added section about formatting release notes
   - Updated workflow descriptions
   - Added best practice about marking main features with bold

---

## 🎯 Result

### Discord Notifications (Concise)
- ✅ Correct role mention: `@Beta Tester 🔍`
- ✅ Proper line breaks (no `\n`)
- ✅ Only main features highlighted (bold items)
- ✅ 3 improvements max
- ✅ 5 testing points max
- ✅ Bilingual but compact

### GitHub Releases (Organized)
- ✅ Main features visible immediately
- ✅ Details in collapsible sections
- ✅ Bilingual with French in collapsibles
- ✅ Technical details collapsed
- ✅ Installation instructions included
- ✅ Much more readable and professional

---

## 📖 Usage

### For Developers

When creating a release:

1. Generate release notes:
   ```bash
   npm run release:notes
   ```

2. Edit RELEASE_NOTES.md:
   - **Mark main features with bold** (`**text**`)
   - Add detailed explanations
   - Translate to French

3. (Optional) Preview formatted version:
   ```bash
   npm run release:format
   ```

4. Push tag - formatting happens automatically:
   ```bash
   git push --tags
   ```

### What Happens Automatically

- ✅ RELEASE_NOTES.md → formatted with collapsible sections
- ✅ GitHub release created with formatted notes
- ✅ Discord notification sent with concise format
- ✅ Both files cleaned up after successful release

---

## 🔗 Related Files

- Discord templates: `.github/templates/discord-*.md`
- Notification script: `scripts/notify-discord.sh`
- Format script: `scripts/format-release-notes.sh`
- Workflows: `.github/workflows/prerelease.yml`, `.github/workflows/release.yml`
- Documentation: `docs/RELEASE_GUIDE.md`

---

## 💡 Tips

1. **Always use bold** for main feature highlights:
   ```markdown
   - **Full support for embedding dashboards** directly in Linus Dashboard
   ```

2. **Preview before releasing**:
   ```bash
   npm run release:format
   cat RELEASE_NOTES_FORMATTED.md
   ```

3. **Test Discord message locally** (requires webhook):
   ```bash
   DISCORD_WEBHOOK_URL="your_webhook" ./scripts/notify-discord.sh prerelease 2.0.0-beta.3 "url"
   ```

---

**All notification issues are now resolved! 🎉**
