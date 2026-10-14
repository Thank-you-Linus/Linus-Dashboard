#!/usr/bin/env bash
#
# Tests: a stable release is announced ONCE in Discord #annonces, automatically.
# - Only stable-release.yml (right after publishing) and the manual catch-up announce-stable.yml call
#   `notify-discord.sh release`; release.yml (tag push / release published) never calls the script,
#   otherwise a stable would be announced twice.
# - DISCORD_WEBHOOK_STABLE_URL (#annonces) is read by those two workflows only.
# - notify-discord.sh release posts once to the stable webhook: the curated
#   .github/release-highlights/<version>.discord.md, else the generic template; betas are unchanged.
# No network: curl is replaced by a fake that logs its calls.
# Usage: npm run test:release

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCRIPT_UNDER_TEST="$ROOT/scripts/notify-discord.sh"
WORKFLOWS="$ROOT/.github/workflows"
STABLE_WF="$WORKFLOWS/stable-release.yml"
CATCHUP_WF="$WORKFLOWS/announce-stable.yml"
GENERIC_TEMPLATE="$ROOT/.github/templates/discord-release.md"
STABLE_HOOK="https://stable.example.invalid/hook"
BETA_HOOK="https://beta.example.invalid/hook"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASS=0
FAIL=0

ok()   { PASS=$((PASS + 1)); echo "  ok   - $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  FAIL - $1"; }

# Fake curl, first in PATH: logs every call (one line per call, the webhook URL) and the JSON
# payload of each call (one line per call), then prints a body followed by a final line with the
# HTTP code, like `curl -w "\n%{http_code}"`.
FAKE_BIN="$WORK/bin"
CURL_LOG="$WORK/curl.log"
PAYLOAD_LOG="$WORK/payload.log"
mkdir -p "$FAKE_BIN"
cat > "$FAKE_BIN/curl" <<'EOF'
#!/usr/bin/env bash
URL=""
PREV=""
for a in "$@"; do
    case "$a" in http://*|https://*) URL="$a" ;; esac
    if [ "$PREV" = "-d" ]; then printf '%s' "$a" | tr -d '\n' >> "$PAYLOAD_LOG"; echo >> "$PAYLOAD_LOG"; fi
    PREV="$a"
done
echo "$URL" >> "$CURL_LOG"
printf 'fake body\n204'
EOF
chmod +x "$FAKE_BIN/curl"

# run_notify <type> <version> <url>: run the script with the fake curl and both test webhooks set.
# `NO_STABLE_HOOK=1 run_notify ...` runs it without DISCORD_WEBHOOK_STABLE_URL.
run_notify() {
    : > "$CURL_LOG"
    : > "$PAYLOAD_LOG"
    local stable="$STABLE_HOOK"
    [ "${NO_STABLE_HOOK:-}" = 1 ] && stable=""
    CURL_LOG="$CURL_LOG" PAYLOAD_LOG="$PAYLOAD_LOG" PATH="$FAKE_BIN:$PATH" \
        DISCORD_WEBHOOK_URL="$BETA_HOOK" \
        DISCORD_WEBHOOK_STABLE_URL="$stable" \
        bash "$SCRIPT_UNDER_TEST" "$@" > "$WORK/notify.out" 2>&1
}

curl_calls() { wc -l < "$CURL_LOG" | tr -d ' '; }
# Content of the first message sent (the "content" field of the JSON payload)
sent_content() { head -n 1 "$PAYLOAD_LOG" | jq -r '.content'; }

# render <file> <version> <url>: the message the script must send for that file
render() {
    local m
    m=$(cat "$1")
    m="${m//\{\{VERSION\}\}/$2}"
    m="${m//\{\{RELEASE_URL\}\}/$3}"
    printf '%s' "$m"
}

# step_block <file> <step name>: the lines of one workflow step, from its "- name:" to the next one
step_block() {
    awk -v name="- name: \"$2\"" '
        index($0, name) { inside = 1; print; next }
        inside && /^[[:space:]]*- name:/ { exit }
        inside { print }' "$1"
}

# Every workflow file, whatever its extension (.yml or .yaml)
shopt -s nullglob
WF_FILES=("$WORKFLOWS"/*.yml "$WORKFLOWS"/*.yaml)
shopt -u nullglob

echo "0. workflow files are found"
[ "${#WF_FILES[@]}" -gt 0 ] && ok "${#WF_FILES[@]} workflow file(s) scanned" || fail "no workflow file found in $WORKFLOWS"
[ -f "$STABLE_WF" ] && ok "stable-release.yml exists" || fail "stable-release.yml exists"
[ -f "$CATCHUP_WF" ] && ok "announce-stable.yml exists" || fail "announce-stable.yml exists"

echo "1. notify-discord.sh is called with prerelease or release only"
BAD=$(grep -n 'notify-discord\.sh' /dev/null "${WF_FILES[@]}" | grep -vE 'notify-discord\.sh[[:space:]]+(prerelease|release)([[:space:]]|$)')
if [ -z "$BAD" ]; then
    ok "every notify-discord.sh call has a known type"
else
    fail "notify-discord.sh called with another type:"
    echo "$BAD" | sed 's/^/         /'
fi

echo "2. a stable is announced once: release calls only in stable-release.yml and announce-stable.yml, one each"
BAD=$(grep -nE 'notify-discord\.sh[[:space:]]+release([[:space:]]|$)' /dev/null "${WF_FILES[@]}" | grep -vF -e "$STABLE_WF:" -e "$CATCHUP_WF:")
if [ -z "$BAD" ]; then
    ok "no other workflow announces a stable"
else
    fail "another workflow announces a stable (double announcement):"
    echo "$BAD" | sed 's/^/         /'
fi
for wf in "$STABLE_WF" "$CATCHUP_WF"; do
    N=$(grep -cE 'notify-discord\.sh[[:space:]]+release([[:space:]]|$)' "$wf" 2>/dev/null)
    [ "${N:-0}" -eq 1 ] && ok "$(basename "$wf"): exactly one stable announcement" || fail "$(basename "$wf"): exactly one stable announcement (got ${N:-0})"
done

echo "3. release.yml (tag push / release published) never calls notify-discord.sh"
if grep -q 'notify-discord' "$WORKFLOWS/release.yml"; then
    fail "release.yml calls notify-discord.sh (a stable would be announced twice)"
else
    ok "release.yml does not call notify-discord.sh"
fi

echo "4. DISCORD_WEBHOOK_STABLE_URL is read by stable-release.yml and announce-stable.yml only"
BAD=$(grep -n 'DISCORD_WEBHOOK_STABLE_URL' /dev/null "${WF_FILES[@]}" | grep -vF -e "$STABLE_WF:" -e "$CATCHUP_WF:")
if [ -z "$BAD" ]; then
    ok "no other workflow reads the #annonces webhook"
else
    fail "another workflow reads DISCORD_WEBHOOK_STABLE_URL (#annonces):"
    echo "$BAD" | sed 's/^/         /'
fi
BAD=$(grep -noE 'DISCORD_WEBHOOK_[A-Z_]*' /dev/null "${WF_FILES[@]}" | grep -vE ':DISCORD_WEBHOOK_(URL|STABLE_URL)$')
if [ -z "$BAD" ]; then
    ok "no Discord secret other than DISCORD_WEBHOOK_URL and DISCORD_WEBHOOK_STABLE_URL"
else
    fail "unknown Discord secret referenced:"
    echo "$BAD" | sed 's/^/         /'
fi

echo "4b. no hardcoded Discord webhook URL in workflows or scripts"
BAD=$(git -C "$ROOT" grep -nE 'discord(app)?\.com/api/webhooks' -- .github scripts)
if [ -z "$BAD" ]; then
    ok "no hardcoded Discord webhook URL"
else
    fail "hardcoded Discord webhook URL found:"
    echo "$BAD" | sed 's/^/         /'
fi

echo "5. stable-release.yml announces after the release is created, never in a dry run"
STEP=$(step_block "$STABLE_WF" "Send Discord Notification")
[ -n "$STEP" ] && ok "step \"Send Discord Notification\" exists" || fail "step \"Send Discord Notification\" exists"
echo "$STEP" | grep -qE 'if:.*inputs\.dry_run != true' && ok "step skipped in a dry run" || fail "step skipped in a dry run (if: inputs.dry_run != true)"
echo "$STEP" | grep -q 'continue-on-error: true' && ok "a Discord failure never fails the published release" || fail "continue-on-error: true"
echo "$STEP" | grep -q 'secrets.DISCORD_WEBHOOK_STABLE_URL' && ok "step reads DISCORD_WEBHOOK_STABLE_URL" || fail "step reads DISCORD_WEBHOOK_STABLE_URL"
echo "$STEP" | grep -q 'secrets.DISCORD_WEBHOOK_URL' && fail "step must not read the beta webhook" || ok "step does not read the beta webhook"
echo "$STEP" | grep -q 'sent=true' && ok "step reports sent=true" || fail "step reports sent=true"
L_RELEASE=$(grep -n 'name: "Create GitHub Release"' "$STABLE_WF" | head -1 | cut -d: -f1)
L_DISCORD=$(grep -n 'name: "Send Discord Notification"' "$STABLE_WF" | head -1 | cut -d: -f1)
if [ -n "$L_RELEASE" ] && [ -n "$L_DISCORD" ] && [ "$L_DISCORD" -gt "$L_RELEASE" ]; then
    ok "announcement comes after \"Create GitHub Release\""
else
    fail "announcement comes after \"Create GitHub Release\" (lines ${L_RELEASE:-?} / ${L_DISCORD:-?})"
fi
PROOF=$(step_block "$STABLE_WF" "Discord notified")
echo "$PROOF" | grep -qF "steps.discord.outputs.sent == 'true'" && ok "proof step \"Discord notified\" runs only when sent" || fail "proof step \"Discord notified\" runs only when sent"

echo "6. announce-stable.yml is a manual catch-up only"
ON=$(awk '/^on:/ { inside = 1; next } inside && /^[^[:space:]#]/ { exit } inside { print }' "$CATCHUP_WF" 2>/dev/null)
echo "$ON" | grep -q 'workflow_dispatch:' && ok "triggered by workflow_dispatch" || fail "triggered by workflow_dispatch"
echo "$ON" | grep -qE '^[[:space:]]{2}(push|release|pull_request|pull_request_target|schedule|workflow_run|workflow_call|repository_dispatch):' \
    && fail "announce-stable.yml has an automatic trigger (double announcement)" || ok "no automatic trigger"
grep -qF '^[0-9]+\.[0-9]+\.[0-9]+$' "$CATCHUP_WF" 2>/dev/null && ok "tag validated as X.Y.Z" || fail "tag validated as X.Y.Z"
grep -q 'gh release view' "$CATCHUP_WF" 2>/dev/null && ok "release must exist (gh release view)" || fail "release must exist (gh release view)"
grep -qE '^[[:space:]]+ref:[[:space:]]+main$' "$CATCHUP_WF" 2>/dev/null && ok "checks out main (curated text added after the tag)" || fail "checks out main"
if grep -qE '^[[:space:]]+contents:[[:space:]]+read$' "$CATCHUP_WF" 2>/dev/null && ! grep -qE ':[[:space:]]+write$' "$CATCHUP_WF"; then
    ok "permissions: contents read, no write"
else
    fail "permissions: contents read, no write"
fi

echo "7. notify-discord.sh release posts the curated .discord.md of the version, once, to #annonces"
CURATED=$(ls "$ROOT"/.github/release-highlights/*.discord.md 2>/dev/null | head -1)
if [ -z "$CURATED" ]; then
    fail "a curated announcement exists in .github/release-highlights/"
else
    V=$(basename "$CURATED" .discord.md)
    URL="https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/$V"
    run_notify release "$V" "$URL"; RC=$?
    [ "$RC" -eq 0 ] && ok "exit code 0 ($V)" || { fail "exit code 0 (got $RC)"; sed 's/^/         /' "$WORK/notify.out"; }
    N=$(curl_calls)
    [ "$N" -eq 1 ] && ok "exactly one curl call" || fail "exactly one curl call (got $N)"
    [ "$(head -n 1 "$CURL_LOG")" = "$STABLE_HOOK" ] && ok "call goes to DISCORD_WEBHOOK_STABLE_URL" || fail "call goes to DISCORD_WEBHOOK_STABLE_URL (got $(head -n 1 "$CURL_LOG"))"
    EXPECTED=$(render "$CURATED" "$V" "$URL")
    [ "$(sent_content)" = "$EXPECTED" ] && ok "content = $(basename "$CURATED") with {{VERSION}} and {{RELEASE_URL}} replaced" || fail "content = $(basename "$CURATED") rendered"
    sent_content | grep -q '{{' && fail "no placeholder left" || ok "no placeholder left"
    sent_content | grep -qF "$URL" && ok "release URL in the message" || fail "release URL in the message"
fi

echo "7b. every curated announcement fits in one Discord message (no truncation)"
shopt -s nullglob
for f in "$ROOT"/.github/release-highlights/*.discord.md; do
    V=$(basename "$f" .discord.md)
    BYTES=$(render "$f" "$V" "https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/$V" | wc -c | tr -d ' ')
    # Bytes >= characters: under 1900 bytes, the script never truncates, whatever the locale.
    [ "$BYTES" -le 1900 ] && ok "$(basename "$f"): $BYTES bytes, at most 1900" || fail "$(basename "$f"): $BYTES bytes, more than 1900 (would be truncated)"
done
shopt -u nullglob

echo "8. without a curated file, the generic template is sent"
[ -f "$GENERIC_TEMPLATE" ] && ok "generic template exists" || fail "generic template exists ($GENERIC_TEMPLATE)"
run_notify release 9.9.9 https://github.com/example/releases/tag/9.9.9; RC=$?
[ "$RC" -eq 0 ] && ok "exit code 0" || { fail "exit code 0 (got $RC)"; sed 's/^/         /' "$WORK/notify.out"; }
N=$(curl_calls)
[ "$N" -eq 1 ] && ok "exactly one curl call" || fail "exactly one curl call (got $N)"
[ "$(head -n 1 "$CURL_LOG")" = "$STABLE_HOOK" ] && ok "call goes to DISCORD_WEBHOOK_STABLE_URL" || fail "call goes to DISCORD_WEBHOOK_STABLE_URL"
EXPECTED=$(render "$GENERIC_TEMPLATE" 9.9.9 https://github.com/example/releases/tag/9.9.9)
[ "$(sent_content)" = "$EXPECTED" ] && ok "content = generic template rendered" || fail "content = generic template rendered"
sent_content | grep -qF '9.9.9' && ok "version in the message" || fail "version in the message"
sent_content | grep -q '{{' && fail "no placeholder left" || ok "no placeholder left"

echo "9. without the stable webhook, a stable fails without calling curl (never the beta channel)"
NO_STABLE_HOOK=1 run_notify release 9.9.9 u; RC=$?
[ "$RC" -eq 1 ] && ok "exit code 1" || fail "exit code 1 (got $RC)"
N=$(curl_calls)
[ "$N" -eq 0 ] && ok "no curl call" || fail "no curl call (got $N: $(tr '\n' ' ' < "$CURL_LOG"))"

echo "10. a stable version that is not X.Y.Z is refused without calling curl"
run_notify release 9.9.9-beta.1 u; RC=$?
[ "$RC" -eq 2 ] && ok "exit code 2" || fail "exit code 2 (got $RC)"
N=$(curl_calls)
[ "$N" -eq 0 ] && ok "no curl call" || fail "no curl call (got $N)"

echo "11. an unknown type exits 2 without calling curl"
for t in stable beta announce; do
    run_notify "$t" 9.9.9 u; RC=$?
    [ "$RC" -eq 2 ] && ok "type '$t': exit code 2" || fail "type '$t': exit code 2 (got $RC)"
    N=$(curl_calls)
    [ "$N" -eq 0 ] && ok "type '$t': no curl call" || fail "type '$t': no curl call (got $N)"
done

echo "12. notify-discord.sh still announces a prerelease (beta non-regression)"
run_notify prerelease 9.9.9-beta.1 https://github.com/example/releases/tag/9.9.9-beta.1; RC=$?
[ "$RC" -eq 0 ] && ok "exit code 0" || { fail "exit code 0 (got $RC)"; sed 's/^/         /' "$WORK/notify.out"; }
N=$(curl_calls)
[ "$N" -eq 1 ] && ok "exactly one curl call" || fail "exactly one curl call (got $N)"
[ "$(head -n 1 "$CURL_LOG")" = "$BETA_HOOK" ] && ok "call goes to DISCORD_WEBHOOK_URL" || fail "call goes to DISCORD_WEBHOOK_URL (got $(head -n 1 "$CURL_LOG"))"
sent_content | grep -qF 'Beta Release 9.9.9-beta.1' && ok "beta template used" || fail "beta template used"

echo ""
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
