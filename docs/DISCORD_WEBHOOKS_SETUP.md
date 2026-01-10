# Discord Webhooks Configuration Guide

**Problem**: Beta releases are being posted to the stable release channel (#annonces) instead of the beta testers channel.

**Root Cause**: The GitHub Actions secrets are not configured correctly to distinguish between beta and stable release channels.

---

## Required Configuration

You need **TWO separate Discord webhook URLs** configured in your GitHub repository secrets:

### 1. `DISCORD_WEBHOOK_URL` (Beta/Pre-releases)

**Purpose**: Receives notifications for **beta and alpha releases** (pre-releases)

**Target Channel**: `#beta-testers` or similar beta testing channel

**How to create:**
1. Go to your Discord server
2. Navigate to the beta testers channel (e.g., `#beta-testers`)
3. Right-click the channel → Edit Channel → Integrations → Webhooks
4. Create a new webhook (name it "Linus Dashboard Beta Releases")
5. Copy the webhook URL
6. Add it to GitHub:
   - Go to: `https://github.com/Thank-you-Linus/Linus-Dashboard/settings/secrets/actions`
   - Click "New repository secret"
   - Name: `DISCORD_WEBHOOK_URL`
   - Value: Paste the webhook URL

### 2. `DISCORD_WEBHOOK_STABLE_URL` (Stable Releases)

**Purpose**: Receives notifications for **stable releases only**

**Target Channel**: `#annonces` or similar public announcement channel

**How to create:**
1. Go to your Discord server
2. Navigate to the announcements channel (e.g., `#annonces`)
3. Right-click the channel → Edit Channel → Integrations → Webhooks
4. Create a new webhook (name it "Linus Dashboard Stable Releases")
5. Copy the webhook URL
6. Add it to GitHub:
   - Go to: `https://github.com/Thank-you-Linus/Linus-Dashboard/settings/secrets/actions`
   - Click "New repository secret"
   - Name: `DISCORD_WEBHOOK_STABLE_URL`
   - Value: Paste the webhook URL

---

## How It Works

### Beta Release (Tag: `1.4.1-beta.3`)

**Workflow**: `.github/workflows/prerelease.yml`

**Script call**:
```bash
bash scripts/notify-discord.sh prerelease "1.4.1-beta.3" "<release_url>"
```

**Behavior**:
- Uses `DISCORD_WEBHOOK_URL` secret
- Posts to beta testers channel
- Uses template: `.github/templates/discord-prerelease.md`
- Message format: "🚨 **Beta Release 1.4.1-beta.3** 🚨"

### Stable Release (Tag: `1.4.1`)

**Workflow**: `.github/workflows/release.yml`

**Script call**:
```bash
bash scripts/notify-discord.sh release "1.4.1" "<release_url>"
```

**Behavior**:
- Uses `DISCORD_WEBHOOK_STABLE_URL` secret
- Posts to announcements channel
- Uses template: `.github/templates/discord-release.md`
- Message format: "🎉 **New Stable Release | Nouvelle Version Stable** 🎉"

---

## Verification

After configuring both secrets, you can verify the setup:

### Check GitHub Secrets

1. Go to: `https://github.com/Thank-you-Linus/Linus-Dashboard/settings/secrets/actions`
2. Verify both secrets exist:
   - ✅ `DISCORD_WEBHOOK_URL`
   - ✅ `DISCORD_WEBHOOK_STABLE_URL`

### Test Beta Release

1. Create a beta tag: `git tag 1.4.1-beta.4`
2. Push the tag: `git push --tags`
3. Check the GitHub Actions workflow logs
4. Look for this line in the "Send Discord Notification" step:
   ```
   ✓ Using pre-release webhook → beta testers channel
   📄 Using template: discord-prerelease.md
   ```
5. Verify the message appears in your beta testers channel

### Test Stable Release (when ready)

1. Create a stable tag: `git tag 1.4.1`
2. Push the tag: `git push --tags`
3. Check the GitHub Actions workflow logs
4. Look for this line in the "Send Discord Notification" step:
   ```
   ✓ Using stable release webhook → #annonces channel
   📄 Using template: discord-release.md
   ```
5. Verify the message appears in your announcements channel

---

## Current Issue

**Your current setup** likely has:
- ✅ `DISCORD_WEBHOOK_URL` configured
- ❌ `DISCORD_WEBHOOK_STABLE_URL` **NOT configured** or pointing to the **same channel**

**Result**: Both beta and stable releases go to the same channel (likely #annonces)

**Solution**: Create the `DISCORD_WEBHOOK_STABLE_URL` secret pointing to the correct stable channel, and update `DISCORD_WEBHOOK_URL` to point to the beta testers channel.

---

## Improved Script Behavior (v1.4.1-beta.3+)

The script now includes better logging:

**For Pre-releases (Beta)**:
```
📢 Preparing Discord notification...
   Type: prerelease
   Version: 1.4.1-beta.3
   URL: https://github.com/.../releases/tag/1.4.1-beta.3

✓ Using pre-release webhook → beta testers channel
📄 Using template: discord-prerelease.md
```

**For Stable Releases**:
```
📢 Preparing Discord notification...
   Type: release
   Version: 1.4.1
   URL: https://github.com/.../releases/tag/1.4.1

✓ Using stable release webhook → #annonces channel
📄 Using template: discord-release.md
```

**Warning if fallback is used**:
```
⚠️  DISCORD_WEBHOOK_STABLE_URL not set, using DISCORD_WEBHOOK_URL as fallback
⚠️  This may post to the wrong channel!
```

---

## Quick Fix Checklist

- [ ] Create beta testers webhook in Discord
- [ ] Add/update `DISCORD_WEBHOOK_URL` secret in GitHub (point to beta channel)
- [ ] Create announcements webhook in Discord
- [ ] Add `DISCORD_WEBHOOK_STABLE_URL` secret in GitHub (point to #annonces)
- [ ] Test with next beta release
- [ ] Verify logs show correct webhook selection
- [ ] Confirm messages appear in correct channels

---

## Support

If you continue to have issues:
1. Check the GitHub Actions workflow logs for the "Send Discord Notification" step
2. Look for the webhook selection messages
3. Verify the template being used matches the release type
4. Ensure both webhook URLs are valid and point to different channels

---

**Last Updated**: 2026-01-10 (v1.4.1-beta.3)
