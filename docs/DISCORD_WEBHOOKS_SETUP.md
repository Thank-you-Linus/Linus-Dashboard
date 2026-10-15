# Discord Webhooks Configuration Guide

**Scope**: automatic Discord announcements of releases: betas in the beta testers channel, stables in
#annonces (once, right after the stable is published). Forums (HA, HACF) stay manual.

---

## Required Configuration

Two Discord webhook URLs are used by the release workflows: `DISCORD_WEBHOOK_URL` (betas) and
`DISCORD_WEBHOOK_STABLE_URL` (stables, #annonces). A stable never falls back to the beta webhook.

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

### 2. `DISCORD_WEBHOOK_STABLE_URL` (Stable releases)

**Purpose**: Receives the announcement of each **stable release**

**Target Channel**: `#annonces`

Created like the beta one (webhook in `#annonces`, repository secret named `DISCORD_WEBHOOK_STABLE_URL`).
Read by `stable-release.yml` and `announce-stable.yml` only.

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

### Stable Release (`2.0.0`)

**Workflows**: `.github/workflows/stable-release.yml` (step "Send Discord Notification", right after
"Create GitHub Release", never in a dry run), and `.github/workflows/announce-stable.yml` (manual catch-up)

**Script call**:
```bash
bash scripts/notify-discord.sh release "2.0.0" "<release_url>"
```

**Behavior**:
- Uses `DISCORD_WEBHOOK_STABLE_URL` only (missing → exit 1, nothing sent)
- Posts to #annonces, once
- Message: `.github/release-highlights/<version>.discord.md` when it exists (curated text, `{{VERSION}}` and
  `{{RELEASE_URL}}` replaced, under 1900 characters), else `.github/templates/discord-release.md`
- The version must be `X.Y.Z` and the type `prerelease` or `release`, otherwise exit 2, nothing sent
- A Discord error never fails the published release: the run summary says "Not announced in Discord
  #annonces". Post it then with **Actions -> Announce stable release on Discord (manual)** (input `tag`;
  the release must exist; the `.discord.md` is read from `main`; each run posts once)
- `release.yml` (tag pushed by hand, release published in the GitHub UI) sends no announcement, so the
  button never announces twice; it only posts a technical failure notification (on `DISCORD_WEBHOOK_URL`)
  if the release fails. A stable published that way is announced with the catch-up workflow
- Forums stay manual: `npm run forums:open`

---

## Verification

After configuring the secret, you can verify the setup:

### Check GitHub Secrets

1. Go to: `https://github.com/Thank-you-Linus/Linus-Dashboard/settings/secrets/actions`
2. Verify the secrets exist:
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

### Stable Release

After the next "Stable Release (manual)" run, the "Send Discord Notification" step logs:
```
✓ Using stable release webhook → #annonces channel
📄 Using message: .github/release-highlights/2.0.0.discord.md
```
and the "Discord notified" step runs. The message appears in #annonces.

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
   Version: 2.0.0
   URL: https://github.com/.../releases/tag/2.0.0

✓ Using stable release webhook → #annonces channel
📄 Using message: .github/release-highlights/2.0.0.discord.md
```

---

## Quick Fix Checklist

- [ ] Create beta testers webhook in Discord
- [ ] Add/update `DISCORD_WEBHOOK_URL` secret in GitHub (point to beta channel)
- [ ] Add/update `DISCORD_WEBHOOK_STABLE_URL` secret in GitHub (point to #annonces)
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

**Last Updated**: 2026-10-14 (2.0.0: stable releases announced automatically in #annonces)
