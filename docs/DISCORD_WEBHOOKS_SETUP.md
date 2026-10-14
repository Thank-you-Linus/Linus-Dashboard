# Discord Webhooks Configuration Guide

**Scope**: automatic Discord announcements of beta releases. Stable releases are announced by hand by
Julien in #annonces (no automatic announcement).

---

## Required Configuration

Only **one** Discord webhook URL is used by the release workflows: `DISCORD_WEBHOOK_URL` (betas).
Stable releases are never announced automatically: Julien announces them by hand in #annonces
(+ `npm run forums:open`).

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

### 2. `DISCORD_WEBHOOK_STABLE_URL` — secret no longer used

No workflow and no script reads it anymore: stable releases are announced by hand by Julien in
#annonces. The secret can be deleted from the repository settings.

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

### Stable Release (Tag) — secret no longer used

**Workflows**: `.github/workflows/release.yml`, `.github/workflows/stable-release.yml`

**Behavior**:
- No Discord announcement is sent, whatever the gesture (Stable Release (manual) button, tag pushed by
  hand, release published or edited in the GitHub UI)
- `bash scripts/notify-discord.sh release ...` refuses with exit code 2
  ("Stable releases are announced by hand by Julien — refusing")
- Julien announces the stable release by hand in #annonces, then `npm run forums:open`
- `release.yml` only posts a technical failure notification (on `DISCORD_WEBHOOK_URL`) if the release fails

---

## Verification

After configuring the secret, you can verify the setup:

### Check GitHub Secrets

1. Go to: `https://github.com/Thank-you-Linus/Linus-Dashboard/settings/secrets/actions`
2. Verify the secret exists:
   - ✅ `DISCORD_WEBHOOK_URL`

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

### Stable Release

Nothing to test: no announcement is sent for a stable release. Julien posts it by hand in #annonces.

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

**For Stable Releases** (refused, no Discord call):
```
📢 Preparing Discord notification...
   Type: release
   Version: 1.4.1
   URL: https://github.com/.../releases/tag/1.4.1

❌ Stable releases are announced by hand by Julien — refusing
```

---

## Quick Fix Checklist

- [ ] Create beta testers webhook in Discord
- [ ] Add/update `DISCORD_WEBHOOK_URL` secret in GitHub (point to beta channel)
- [ ] Test with next beta release
- [ ] Verify logs show correct webhook selection
- [ ] Confirm messages appear in correct channels

---

## Support

If you continue to have issues:
1. Check the GitHub Actions workflow logs for the "Send Discord Notification" step
2. Look for the webhook selection messages
3. Verify the template being used matches the release type
4. Ensure `DISCORD_WEBHOOK_URL` is valid and points to the beta testers channel

---

**Last Updated**: 2026-01-10 (v1.4.1-beta.3)
