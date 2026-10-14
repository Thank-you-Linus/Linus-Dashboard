#!/usr/bin/env bash
#
# Tests: a stable release never posts an automatic Discord announcement (#annonces).
# Stable announcements are a manual gesture by Julien; betas keep announcing automatically.
# No network: curl is replaced by a fake that logs its calls.
# Usage: npm run test:release

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCRIPT_UNDER_TEST="$ROOT/scripts/notify-discord.sh"
WORKFLOWS="$ROOT/.github/workflows"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASS=0
FAIL=0

ok()   { PASS=$((PASS + 1)); echo "  ok   - $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  FAIL - $1"; }

# Fake curl, first in PATH: logs every call (one line per call, the webhook URL),
# then prints a body followed by a final line with the HTTP code, like `curl -w "\n%{http_code}"`.
FAKE_BIN="$WORK/bin"
CURL_LOG="$WORK/curl.log"
mkdir -p "$FAKE_BIN"
cat > "$FAKE_BIN/curl" <<'EOF'
#!/usr/bin/env bash
URL=""
for a in "$@"; do
    case "$a" in http://*|https://*) URL="$a" ;; esac
done
echo "$URL" >> "$CURL_LOG"
printf 'fake body\n204'
EOF
chmod +x "$FAKE_BIN/curl"

# run_notify <type> <version> <url>: run the script with the fake curl and both webhooks set
run_notify() {
    : > "$CURL_LOG"
    CURL_LOG="$CURL_LOG" PATH="$FAKE_BIN:$PATH" \
        DISCORD_WEBHOOK_URL="https://beta.example.invalid/hook" \
        DISCORD_WEBHOOK_STABLE_URL="https://stable.example.invalid/hook" \
        bash "$SCRIPT_UNDER_TEST" "$@" > "$WORK/notify.out" 2>&1
}

curl_calls() { wc -l < "$CURL_LOG" | tr -d ' '; }

# Every workflow file, whatever its extension (.yml or .yaml)
shopt -s nullglob
WF_FILES=("$WORKFLOWS"/*.yml "$WORKFLOWS"/*.yaml)
shopt -u nullglob

echo "0. workflow files are found"
[ "${#WF_FILES[@]}" -gt 0 ] && ok "${#WF_FILES[@]} workflow file(s) scanned" || fail "no workflow file found in $WORKFLOWS"

echo "1. every workflow call to notify-discord.sh is a prerelease"
BAD=$(grep -n 'notify-discord\.sh' /dev/null "${WF_FILES[@]}" | grep -vE 'notify-discord\.sh[[:space:]]+prerelease([[:space:]]|$)')
if [ -z "$BAD" ]; then
    ok "all notify-discord.sh calls use prerelease"
else
    fail "notify-discord.sh called with another type than prerelease:"
    echo "$BAD" | sed 's/^/         /'
fi

# #annonces is only reachable through its own secret: whatever a workflow posts (notify-discord.sh
# or a direct curl, like the technical failure notifications), it can only reach DISCORD_WEBHOOK_URL.
echo "2. workflows use no Discord secret other than DISCORD_WEBHOOK_URL"
BAD=$(grep -noE 'DISCORD_WEBHOOK_[A-Z_]*' /dev/null "${WF_FILES[@]}" | grep -v ':DISCORD_WEBHOOK_URL$')
if [ -z "$BAD" ]; then
    ok "only DISCORD_WEBHOOK_URL referenced by workflows"
else
    fail "another Discord webhook secret is referenced (DISCORD_WEBHOOK_STABLE_URL reaches #annonces):"
    echo "$BAD" | sed 's/^/         /'
fi

echo "2b. no hardcoded Discord webhook URL in workflows or scripts"
BAD=$(git -C "$ROOT" grep -nE 'discord(app)?\.com/api/webhooks' -- .github scripts)
if [ -z "$BAD" ]; then
    ok "no hardcoded Discord webhook URL"
else
    fail "hardcoded Discord webhook URL found:"
    echo "$BAD" | sed 's/^/         /'
fi

echo "3. notify-discord.sh refuses a stable release, without calling curl"
run_notify release 9.9.9 u; RC=$?
[ "$RC" -ne 0 ] && ok "non-zero exit code (got $RC)" || fail "non-zero exit code (got $RC)"
N=$(curl_calls)
[ "$N" -eq 0 ] && ok "no curl call" || fail "no curl call (got $N: $(tr '\n' ' ' < "$CURL_LOG"))"

echo "4. notify-discord.sh still announces a prerelease (beta non-regression)"
run_notify prerelease 9.9.9-beta.1 https://github.com/example/releases/tag/9.9.9-beta.1; RC=$?
[ "$RC" -eq 0 ] && ok "exit code 0" || { fail "exit code 0 (got $RC)"; sed 's/^/         /' "$WORK/notify.out"; }
N=$(curl_calls)
[ "$N" -eq 1 ] && ok "exactly one curl call" || fail "exactly one curl call (got $N)"
[ "$(head -n 1 "$CURL_LOG")" = "https://beta.example.invalid/hook" ] && ok "call goes to DISCORD_WEBHOOK_URL" || fail "call goes to DISCORD_WEBHOOK_URL (got $(head -n 1 "$CURL_LOG"))"

echo "5. no file mentions the removed stable template"
BAD=$(git -C "$ROOT" grep -n "discord-release.md" -- ':!tests/release/stable-announcement.test.sh')
if [ -z "$BAD" ]; then
    ok "discord-release.md mentioned nowhere"
else
    fail "discord-release.md still mentioned:"
    echo "$BAD" | sed 's/^/         /'
fi

echo ""
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
