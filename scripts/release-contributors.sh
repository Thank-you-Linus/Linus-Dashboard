#!/usr/bin/env bash
#
# List the contributors of a commit range for the release notes, as GitHub accounts.
# Usage: bash scripts/release-contributors.sh <range>      (e.g. 2.0.0-beta.2..HEAD)
#        bash scripts/release-contributors.sh --external <range>
#
# --external: one "<sha>\t<login>" line per commit of an EXTERNAL contributor (an account
# that is neither a maintainer nor a bot, see is_maintainer). generate-release-notes.sh
# thanks them at the top of the notes and credits their lines "by @login". A commit whose
# account cannot be resolved is left out: nobody is thanked or mentioned at random.
#
# Never the git author NAME: the same person commits as "Julien-Decoen", "Juicy" or
# "root" depending on the machine, and "@Juicy" mentions someone else on GitHub
# (2.0.0-beta.3 dry run, 2026-10-05). GitHub links each commit's email to an account:
# one lookup per email, the first commit found for it. A noreply address already
# carries the login. An email linked to no account falls back to the author of the
# merged pull request that brought the commit. When nothing links a commit to an account
# (API unreachable, email not verified, no merged PR), the name is written WITHOUT "@", so
# the notes never mention an unrelated account.
#
# Env: GITHUB_REPOSITORY (owner/repo, default: from the origin remote), GITHUB_API
# (default https://api.github.com), GH_TOKEN or GITHUB_TOKEN (optional, raises the
# rate limit; the repository is public).

set -u

MODE=list
if [ "${1:-}" = "--external" ]; then
    MODE=external
    shift
fi
RANGE="${1:-HEAD}"
API="${GITHUB_API:-https://api.github.com}"
TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
REPO="${GITHUB_REPOSITORY:-$(git remote get-url origin 2>/dev/null | sed -E 's#^(git@github\.com:|https://github\.com/)##; s#\.git$##')}"

api_get() {
    if [ -n "$TOKEN" ]; then
        curl -fsS -H "Authorization: Bearer $TOKEN" "$API/$1" 2>/dev/null
    else
        curl -fsS "$API/$1" 2>/dev/null
    fi
}

login_of() {
    local email="$1" sha="$2" login
    case "$email" in
        *@users.noreply.github.com)
            local local_part="${email%@users.noreply.github.com}"
            echo "${local_part#*+}"
            return
            ;;
    esac
    [ -n "$REPO" ] || return
    login=$(api_get "repos/$REPO/commits/$sha" | node -e '
        let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
            try { const a = JSON.parse(s).author; if (a && a.login) process.stdout.write(a.login); } catch {}
        });')
    if [ -z "$login" ]; then
        # Email linked to no account: the author of the merged pull request that brought the
        # commit. "flatline84 <peterkydas@github.com>" is @flatline-84 (PR #152), not @flatline84.
        login=$(api_get "repos/$REPO/commits/$sha/pulls" | node -e '
            let s = ""; process.stdin.on("data", d => s += d).on("end", () => {
                try {
                    const p = JSON.parse(s).find(p => p && p.merged_at && p.user && p.user.login);
                    if (p) process.stdout.write(p.user.login);
                } catch {}
            });')
    fi
    printf '%s' "$login"
}

# Maintainers and bots: listed under Contributors, never thanked as external contributors.
# Same person under several names: s4piens, Julien-Decoen, Juicy, root.
is_maintainer() {
    case "$1" in
        *"[bot]") return 0 ;;
    esac
    case "$(printf '%s' "$1" | tr '[:upper:]' '[:lower:]')" in
        s4piens | julien-decoen | juicy | root) return 0 ;;
    esac
    return 1
}

if [ "$MODE" = "external" ]; then
    # one lookup per email (bash 3 compatible: no associative array), then one line per commit
    EXTERNAL_EMAILS=$(git log "$RANGE" --no-merges --format='%ae%x09%H' |
        awk -F'\t' '!seen[$1]++' |
        while IFS=$'\t' read -r email sha; do
            login=$(login_of "$email" "$sha")
            if [ -n "$login" ] && ! is_maintainer "$login"; then
                printf '%s\t%s\n' "$email" "$login"
            fi
        done)
    [ -n "$EXTERNAL_EMAILS" ] || exit 0
    git log "$RANGE" --no-merges --format='%ae%x09%H' |
        awk -F'\t' 'NR == FNR { by[$1] = $2; next } $1 in by { print $2 "\t" by[$1] }' <(printf '%s\n' "$EXTERNAL_EMAILS") -
    exit 0
fi

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
