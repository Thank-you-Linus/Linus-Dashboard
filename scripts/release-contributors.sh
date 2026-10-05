#!/usr/bin/env bash
#
# List the contributors of a commit range for the release notes, as GitHub accounts.
# Usage: bash scripts/release-contributors.sh <range>      (e.g. 2.0.0-beta.2..HEAD)
#
# Never the git author NAME: the same person commits as "Julien-Decoen", "Juicy" or
# "root" depending on the machine, and "@Juicy" mentions someone else on GitHub
# (2.0.0-beta.3 dry run, 2026-10-05). GitHub links each commit's email to an account:
# one lookup per email, the first commit found for it. A noreply address already
# carries the login. When nothing links a commit to an account (API unreachable,
# email not verified on GitHub), the name is written WITHOUT "@", so the notes never
# mention an unrelated account.
#
# Env: GITHUB_REPOSITORY (owner/repo, default: from the origin remote), GITHUB_API
# (default https://api.github.com), GH_TOKEN or GITHUB_TOKEN (optional, raises the
# rate limit; the repository is public).

set -u

RANGE="${1:-HEAD}"
API="${GITHUB_API:-https://api.github.com}"
TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
REPO="${GITHUB_REPOSITORY:-$(git remote get-url origin 2>/dev/null | sed -E 's#^(git@github\.com:|https://github\.com/)##; s#\.git$##')}"

login_of() {
    local email="$1" sha="$2" json
    case "$email" in
        *@users.noreply.github.com)
            local local_part="${email%@users.noreply.github.com}"
            echo "${local_part#*+}"
            return
            ;;
    esac
    [ -n "$REPO" ] || return
    if [ -n "$TOKEN" ]; then
        json=$(curl -fsS -H "Authorization: Bearer $TOKEN" "$API/repos/$REPO/commits/$sha" 2>/dev/null) || return
    else
        json=$(curl -fsS "$API/repos/$REPO/commits/$sha" 2>/dev/null) || return
    fi
    printf '%s' "$json" | node -e '
        let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
            try { const a = JSON.parse(s).author; if (a && a.login) process.stdout.write(a.login); } catch {}
        });'
}

git log "$RANGE" --no-merges --format='%ae%x09%an%x09%H' |
    awk -F'\t' '!seen[$1]++' |
    while IFS=$'\t' read -r email name sha; do
        login=$(login_of "$email" "$sha")
        if [ -n "$login" ]; then
            echo "- @$login"
        else
            echo "- $name"
        fi
    done | sort -u
