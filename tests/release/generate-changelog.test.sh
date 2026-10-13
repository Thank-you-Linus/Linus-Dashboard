#!/usr/bin/env bash
#
# Tests for scripts/generate-changelog.sh (throwaway repositories, no network).
# Usage: npm run test:release

set -u

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
SCRIPT_UNDER_TEST="$ROOT/scripts/generate-changelog.sh"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

PASS=0
FAIL=0

ok()   { PASS=$((PASS + 1)); echo "  ok   - $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  FAIL - $1"; }
check() { # check <description> <command...>
    local d="$1"; shift
    if "$@" >/dev/null 2>&1; then ok "$d"; else fail "$d"; fi
}

# new_repo <dir>: throwaway repository with a copy of the script under test
new_repo() {
    mkdir -p "$1/scripts"
    git -C "$1" init -q
    git -C "$1" config user.email "test@example.com"
    git -C "$1" config user.name "Test"
    git -C "$1" config commit.gpgsign false
    git -C "$1" config tag.gpgsign false
    cp "$SCRIPT_UNDER_TEST" "$1/scripts/generate-changelog.sh"
}

set_version() { # set_version <dir> <version>
    printf '{\n  "name": "demo",\n  "version": "%s"\n}\n' "$2" > "$1/package.json"
}

commit() { # commit <dir> <message>
    echo "$2" >> "$1/log.txt"
    git -C "$1" add -A
    git -C "$1" commit -q -m "$2"
}

gen() { # gen <dir> : run the generator inside <dir>
    (cd "$1" && bash scripts/generate-changelog.sh >"$1/.gen.out" 2>&1)
}

# Body of the section "## [<version>]" (up to the next "## [" or "---")
section() { # section <file> <version>
    awk -v h="## [$2]" '
        index($0, h) == 1 { on = 1; print; next }
        on && (/^## \[/ || /^---$/) { exit }
        on { print }' "$1"
}

# Same file with the section "## [<version>]" removed
without_section() { # without_section <file> <version>
    awk -v h="## [$2]" '
        index($0, h) == 1 { skip = 1; next }
        skip && (/^## \[/ || /^---$/) { skip = 0 }
        !skip { print }' "$1"
}

export GIT_COMMITTER_DATE="2026-01-15T12:00:00" GIT_AUTHOR_DATE="2026-01-15T12:00:00"

echo "1. repository without any tag"
R="$WORK/notag"
new_repo "$R"
set_version "$R" "0.1.0"
commit "$R" "feat: first feature"
gen "$R"; RC=$?
[ "$RC" -eq 0 ] && ok "exit code 0" || fail "exit code 0 (got $RC)"
check "CHANGELOG.md is not empty" test -s "$R/CHANGELOG.md"
grep -q '^## \[0.1.0\] - 2026-01-15' "$R/CHANGELOG.md" && ok "section of the source version, dated by the commit" || fail "section of the source version"
grep -q 'first feature' "$R/CHANGELOG.md" && ok "commit listed" || fail "commit listed"

echo "2. tags 0.5.0-beta.2 then 0.5.0"
R="$WORK/semver"
new_repo "$R"
set_version "$R" "0.5.0-beta.2"
commit "$R" "feat: alpha-one-feature"
commit "$R" "fix: beta-fix"
git -C "$R" tag -a 0.5.0-beta.2 -m beta2
gen "$R"
commit "$R" "fix: stable-fix"
commit "$R" "feat: stable-feature"
set_version "$R" "0.5.0"
git -C "$R" tag -a 0.5.0 -m stable
gen "$R"; RC=$?
[ "$RC" -eq 0 ] && ok "exit code 0" || fail "exit code 0 (got $RC)"
CL="$R/CHANGELOG.md"
section "$CL" 0.5.0 | grep -q 'stable-fix' && section "$CL" 0.5.0 | grep -q 'stable-feature' && ok "0.5.0 contains its own commits" || fail "0.5.0 contains its own commits"
section "$CL" 0.5.0 | grep -q 'beta-fix' && fail "0.5.0 must not contain beta commits" || ok "0.5.0 does not contain beta commits"
section "$CL" 0.5.0-beta.2 | grep -q 'beta-fix' && ok "0.5.0-beta.2 contains its own commits" || fail "0.5.0-beta.2 contains its own commits"
section "$CL" 0.5.0-beta.2 | grep -q 'stable-fix' && fail "beta.2 must not contain stable commits" || ok "beta.2 does not contain stable commits"
L1=$(grep -n '^## \[0.5.0\]' "$CL" | head -n 1 | cut -d: -f1)
L2=$(grep -n '^## \[0.5.0-beta.2\]' "$CL" | head -n 1 | cut -d: -f1)
{ [ -n "$L1" ] && [ -n "$L2" ] && [ "$L1" -lt "$L2" ]; } && ok "0.5.0 above 0.5.0-beta.2" || fail "0.5.0 above 0.5.0-beta.2 ($L1/$L2)"

echo "3. existing CHANGELOG with history, two runs"
R="$WORK/frozen"
new_repo "$R"
set_version "$R" "1.0.0"
commit "$R" "feat: v1 feature"
git -C "$R" tag -a 1.0.0 -m v1
cat > "$R/CHANGELOG.md" <<'EOC'
# Changelog

Hand written intro.

## [1.0.0] - 2020-01-01

### Added

- feat: hand-edited entry that must stay as is
- trailing spaces   

---

Footer text
EOC
commit "$R" "fix: second fix"
set_version "$R" "1.1.0-beta.1"
git -C "$R" tag -a 1.1.0-beta.1 -m b1
BEFORE="$WORK/frozen.before"; cp "$R/CHANGELOG.md" "$BEFORE"
gen "$R"
FIRST="$WORK/frozen.first"; cp "$R/CHANGELOG.md" "$FIRST"
gen "$R"
check "two runs give an identical file" cmp -s "$R/CHANGELOG.md" "$FIRST"
section "$R/CHANGELOG.md" 1.1.0-beta.1 | grep -q 'second fix' && ok "new section written" || fail "new section written"
without_section "$R/CHANGELOG.md" 1.1.0-beta.1 > "$WORK/frozen.a"
cp "$BEFORE" "$WORK/frozen.b"
check "everything outside the source section is byte for byte unchanged" cmp -s "$WORK/frozen.a" "$WORK/frozen.b"
# source section already present: replaced only, the rest stays byte for byte identical
set_version "$R" "1.0.0"
git -C "$R" tag -d 1.1.0-beta.1 >/dev/null
gen "$R"
check "replacing an existing section keeps the rest unchanged" \
    cmp -s <(without_section "$R/CHANGELOG.md" 1.0.0) <(without_section "$FIRST" 1.0.0)
grep -q 'hand-edited' "$R/CHANGELOG.md" && fail "source section 1.0.0 was not regenerated" || ok "source section 1.0.0 regenerated"

echo "4. shallow clone of a tag"
R="$WORK/origin"
new_repo "$R"
set_version "$R" "0.9.0"
commit "$R" "feat: old feature"
git -C "$R" tag -a 0.9.0 -m old
gen "$R"
git -C "$R" add -A; git -C "$R" commit -q -m "docs: commit changelog"
commit "$R" "fix: new fix"
set_version "$R" "1.0.0-beta.1"
git -C "$R" add -A; git -C "$R" commit -q -m "chore: bump"
git -C "$R" tag -a 1.0.0-beta.1 -m b1
C="$WORK/clone"
git clone -q --depth 1 --branch 1.0.0-beta.1 "file://$R" "$C" 2>/dev/null
cp "$SCRIPT_UNDER_TEST" "$C/scripts/generate-changelog.sh" 2>/dev/null || { mkdir -p "$C/scripts"; cp "$SCRIPT_UNDER_TEST" "$C/scripts/generate-changelog.sh"; }
[ "$(git -C "$C" rev-parse --is-shallow-repository)" = "true" ] && ok "clone is shallow" || fail "clone is shallow"
gen "$C"; RC=$?
[ "$RC" -eq 0 ] && ok "exit code 0" || fail "exit code 0 (got $RC)"
section "$C/CHANGELOG.md" 1.0.0-beta.1 | grep -q '^- ' && ok "source section is not empty" || fail "source section is not empty"
section "$C/CHANGELOG.md" 1.0.0-beta.1 | grep -qi 'historique partiel' && ok "partial history mentioned" || fail "partial history mentioned"
check "history section 0.9.0 intact" cmp -s <(section "$R/CHANGELOG.md" 0.9.0) <(section "$C/CHANGELOG.md" 0.9.0)
grep -q 'old feature' "$C/CHANGELOG.md" && ok "committed history preserved" || fail "committed history preserved"

echo ""
echo "Result: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
