# 🚀 Release Guide

> The single reference for publishing Linus Dashboard. A release goes out **only** through two
> GitHub Actions buttons: **Beta Release (manual)** and **Stable Release (manual)**. No workflow
> listens on tags: a tag pushed by hand publishes nothing.

---

## 📋 Contents

- [Overview](#overview)
- [a. Beta Release button](#a-beta-release-button)
- [b. Stable Release button](#b-stable-release-button)
- [c. CHANGELOG (after each button)](#c-changelog-after-each-button)
- [d. Rollback (manual)](#d-rollback-manual)
- [e. Stable announcement (Discord and forums)](#e-stable-announcement-discord-and-forums)
- [Local helpers](#local-helpers)
- [Troubleshooting](#troubleshooting)

---

## Overview

### Version format

- **Stable**: `X.Y.Z` (e.g. `2.0.0`)
- **Beta**: `X.Y.Z-beta.N` (e.g. `2.0.1-beta.1`)
- **Alpha**: `X.Y.Z-alpha.N` (e.g. `2.0.1-alpha.1`)

Tags never take a `v` prefix. `package.json` is the single source of the version; `manifest.json` and
`const.py` follow it (`scripts/bump-version.sh`, called by the buttons).

### What does what

| Gesture | Who / what | Where |
|---------|-----------|-------|
| Publish a beta or an alpha | **Beta Release (manual)** button | `.github/workflows/beta-release.yml` |
| Publish a stable | **Stable Release (manual)** button | `.github/workflows/stable-release.yml` |
| Announce a beta on Discord | the Beta Release button, automatically | `scripts/notify-discord.sh prerelease` |
| Announce a stable on Discord #annonces | the Stable Release button, automatically | `scripts/notify-discord.sh release` |
| Catch up a missed stable announcement | **Announce stable release on Discord (manual)** button | `.github/workflows/announce-stable.yml` |
| Post on the forums (HA, HACF) | by hand | `npm run forums:open` |
| CHANGELOG section of the release | by hand, in a PR after the button | `npm run release:changelog` |
| Undo a failed or bad release | by hand | [§ d](#d-rollback-manual) |

Both buttons share the same guards and steps: lint, type check and build, **guard** (`package.json`
must equal the latest tag of the repository, the new tag must not exist on `origin`), release notes
(`scripts/generate-release-notes.sh --ci`, published as the release body), local bump commit
`chore: Bump version to <tag>` and tag, smoke tests (`npm run test:smoke`), ZIP of the integration,
then an atomic push of `main` and the tag (`git push --atomic origin HEAD:main "refs/tags/<tag>"`)
and the GitHub release. The push uses `GITHUB_TOKEN`, so it triggers no other workflow.

**Never replace `GITHUB_TOKEN` by a personal token** in these workflows: a tag pushed with a PAT
would trigger any future workflow listening on tags.

Before clicking, `npm run release:check` gives a local readiness report (git state, lint, types,
build, version consistency, manifest/HACS files).

---

## a. Beta Release button

1. GitHub → **Actions** → **Beta Release (manual)** → **Run workflow**.
2. **Use workflow from**: `main` for a real release. Any branch is allowed with `dry_run`.
3. **channel**: `beta` (default) or `alpha`.
   - From a stable `2.0.0`, the next version is `2.0.1-<channel>.1`.
   - From `2.0.1-beta.3` on the same channel: `2.0.1-beta.4`.
   - Switching channel on the same base starts at `.1`; an alpha after a beta of the same base is
     refused (it would sort lower for semver and HACS).
4. **dry_run**: tick it first. The run does every check, the notes and the local bump, then stops
   right before the push. Expected summary: `Dry run OK: would have released <tag>. Nothing was pushed.`
5. Run again with **dry_run** unticked, from `main`.

A real run publishes a GitHub **pre-release** named `🧪 <tag> (Pre-Release)` with the ZIP, then
announces it in the beta testers channel (secret `DISCORD_WEBHOOK_URL`). A Discord error never fails
the release; the step `Discord notified` only runs when the message was really sent. On failure, the
run summary names the failed step (and a failure message goes to the beta channel).

---

## b. Stable Release button

A stable **finalises the current pre-release** (`2.0.1-beta.3` → `2.0.1`). From a version that is
already stable the button refuses: a hotfix goes through a beta first.

1. GitHub → **Actions** → **Stable Release (manual)** → **Run workflow**, from `main`.
2. Tick **dry_run** first: the run summary shows the target version, the range, how many changes are
   kept and the full release note, without tagging, publishing or announcing anything.
3. Read the note, then run again with **dry_run** unticked.

**Release note.** The base is the last **stable** tag (`--since-stable`), not the last beta: the note
covers every change since then, so all the betas in between, each change once, under New features,
Bug fixes or Improvements (breaking changes first). Only product changes are kept (`src/` and
`custom_components/`, without the built `www/` bundle and the version bump). Each line links its
pull request and credits external contributors. The EN/FR wording of each line comes from
`.github/release-notes-i18n.tsv` (lowercased commit message, English, French, optional type
`feat`/`fix`/`other`; `-` as English drops the change). A commit missing from that file keeps its raw
subject, and the summary counts them (`untranslated`): add them before the real run. Preview locally
with `bash scripts/generate-release-notes.sh --ci --since-stable` (writes `RELEASE_NOTES.md`, do not
commit it).

**Highlights.** When `.github/release-highlights/<version>.md` exists, it opens the note as is (the
user-facing story of the release, EN and FR), followed by "All changes since <last stable>".
Screenshots are repository files (`images/release/<version>/…`), written `![alt](images/<path>)`;
they are rewritten to `raw.githubusercontent.com` URLs at the released commit. A screenshot that is
not committed, or an image written another way, fails the "Generate release notes" step. Preview with
`TAG=<version> bash scripts/generate-release-notes.sh --ci --since-stable`.

A real run publishes the final GitHub release on the tag `<tag>` (no prefix), named `v<tag>`, not a
pre-release, marked latest, so HACS offers it, then announces it in Discord #annonces ([§ e](#e-stable-announcement-discord-and-forums)).
The release body can still be edited on GitHub afterwards, but the highlights file is the place for
the wording.

---

## c. CHANGELOG (after each button)

No button commits `CHANGELOG.md`. The generator (`scripts/generate-changelog.sh`) takes its source
version from `package.json`, which the button bumps and tags in the same run, so the section of a
release cannot be generated before its tag.

After **each** button run (beta or stable), open a PR on `main`:

```bash
git switch -c "changelog-$TAG" origin/main
npm run release:changelog       # writes the section ## [<version>], dated from its tag
```

The generator inserts the new section above the first `## [` header, that is **above**
`## [Unreleased]`. In the same PR, move `## [Unreleased]` back to the top of the file (just under
the introduction), keeping under it only what is not released yet, then commit and open the PR.

Between releases, PRs keep adding their user-facing entries under `## [Unreleased]`.

---

## d. Rollback (manual)

There is no rollback script: undoing a release is a manual gesture by the maintainer.

- **The run failed before the "Push commit and tag" step**: nothing was pushed. Fix and re-run.
- **Otherwise** (the push went through: the tag and the bump commit are on `origin`, with or without
  a GitHub release):

```bash
TAG=2.0.1-beta.1
gh release delete "$TAG" --repo Thank-you-Linus/Linus-Dashboard --cleanup-tag --yes   # release + remote tag
git push origin --delete "$TAG"        # only if no release exists (failure at the "Create" step)
git fetch origin --prune --prune-tags
SHA=$(git log origin/main -1 --format=%H --grep="^chore: Bump version to $TAG\$")
git switch -c "revert-$TAG" origin/main && git revert --no-edit "$SHA" && git push -u origin HEAD
gh pr create --fill
```

Merge that PR before running a button again.

**Both gestures are needed.** Each button refuses to start while `package.json` differs from the
latest tag of the repository (guard in `beta-release.yml` and `stable-release.yml`). Deleting the
tag alone leaves `package.json` one version ahead; reverting the bump alone leaves a tag ahead of
`package.json`. Either way the next run stops at the guard.

**A release already installed via HACS cannot be taken back** from users' installations. Once a
release has been out for a while, prefer superseding it with a corrective beta (Beta Release button)
rather than deleting it.

---

## e. Stable announcement (Discord and forums)

- **Discord #annonces, automatic.** Right after publishing the release, the Stable Release button
  posts **one** announcement in Discord #annonces (secret `DISCORD_WEBHOOK_STABLE_URL`, never the
  beta channel), never in a dry run. The text is `.github/release-highlights/<version>.discord.md`
  when it exists (short curated message, EN and FR, `{{VERSION}}` and `{{RELEASE_URL}}` replaced,
  under 1900 characters: `npm run test:release` checks it), else the generic
  `.github/templates/discord-release.md`. Write it before clicking the button.
- **Missed announcement, catch-up button.** A Discord error never fails the published release: the
  run summary then says "Not announced in Discord #annonces" and shows a warning. Run **Actions →
  Announce stable release on Discord (manual)** (`announce-stable.yml`) with the tag: the release must
  be a published stable; the `.discord.md` is read from `main`, so a text added after the tag
  counts. Each run posts once: run it once per missed announcement.
- **Forums (Home Assistant, HACF), by hand:** `npm run forums:open` opens the forum pages with the
  release notes pre-filled.

Betas are announced in the beta testers channel by the Beta Release button; there is nothing to do
by hand. Webhook setup: [DISCORD_WEBHOOKS_SETUP.md](DISCORD_WEBHOOKS_SETUP.md).

---

## Local helpers

| Command | Use |
|---------|-----|
| `npm run release:check` | Readiness report before clicking a button |
| `npm run release:notes` | Local preview of the release notes (`RELEASE_NOTES.md`, not committed) |
| `npm run release:changelog` | CHANGELOG section of the current version ([§ c](#c-changelog-after-each-button)) |
| `npm run test:smoke` | Smoke tests run by both buttons |
| `npm run test:release` | Tests of the changelog generator and of the stable announcement |
| `npm run test:ci` | Local simulation of the CI and of the buttons' checks ([LOCAL_CI_TESTING.md](LOCAL_CI_TESTING.md)) |
| `npm run forums:open` | Forum posts of a stable |

`scripts/bump-version.sh` is called by the buttons. Run by hand it commits and tags locally (or, with
`--files-only`, only updates the version files): never push that tag, it publishes nothing and the
buttons would then refuse to run.

---

## Troubleshooting

- **"package.json version (X) is not the latest tag (Y)"**: a previous run pushed a tag (or a bump
  commit) that was not cleaned up. Apply [§ d](#d-rollback-manual).
- **"Tag X already exists on origin"**: same cause; delete the leftover release/tag (§ d).
- **"A real release can only run from main"**: select `main` in "Use workflow from", or tick `dry_run`.
- **"Current version X is already stable"** (Stable Release): release a beta first.
- **"Cannot release an alpha after a beta of the same base"**: use the beta channel.
- **Lint, type check or build fails**: reproduce locally with `npm run test:ci beta-release`.
- **Discord message missing**: beta, check the `DISCORD_WEBHOOK_URL` secret; stable, run the catch-up
  button (§ e).
