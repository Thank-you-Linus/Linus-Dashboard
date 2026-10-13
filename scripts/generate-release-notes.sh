#!/usr/bin/env bash
#
# Generate release notes from git commits since last release
# Usage: npm run release:notes
#        bash scripts/generate-release-notes.sh --ci
#        bash scripts/generate-release-notes.sh --ci --since-stable
#
# --ci: non-interactive mode (GitHub Actions). Produces publishable FR/EN notes
#       without the "Instructions" block, tester placeholders or TODO lines.
#
# --since-stable (requires --ci): notes for a stable release. Covers everything since the
#       previous stable tag (so all the betas in between), each change once, grouped under
#       new features / fixes / other. Only product changes are kept (src and
#       custom_components, minus the generated www bundle and the manifest version bump).
#       No hash, no "type(scope):" prefix, no "All Commits" section: the document can be
#       inserted as-is in the changelog fields of .github/templates/discord-release.md.
#       Also prints "kept=<n> excluded=<n> untranslated=<n> base=<tag>" on stdout for the workflow summary.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

CI_MODE=0
SINCE_STABLE=0
for arg in "$@"; do
    case "$arg" in
        --ci) CI_MODE=1 ;;
        --since-stable) SINCE_STABLE=1 ;;
        *)
            echo "Unknown option: $arg" >&2
            echo "Usage: $0 [--ci [--since-stable]]" >&2
            exit 1
            ;;
    esac
done

if [ "$SINCE_STABLE" = "1" ] && [ "$CI_MODE" != "1" ]; then
    echo "--since-stable requires --ci" >&2
    exit 1
fi

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ---------------------------------------------------------------------------
# External contributors (beta and stable): anyone who is neither a maintainer nor a bot
# (definition in release-contributors.sh). The notes start with a thank-you to their GitHub
# accounts and each of their lines ends with "by @<account>". Without one, nothing changes.
# ---------------------------------------------------------------------------
EXTERNAL_FILE=$(mktemp)
trap 'rm -f "$EXTERNAL_FILE"' EXIT

# usage: load_external_contributors <range>  ->  "<sha>\t<login>" lines in $EXTERNAL_FILE
load_external_contributors() {
    bash "$SCRIPT_DIR/release-contributors.sh" --external "$1" > "$EXTERNAL_FILE" || : > "$EXTERNAL_FILE"
}

# Prints the thank-you block, or nothing when the release has no external contributor.
thanks_block() {
    local logins
    logins=$(cut -f2 "$EXTERNAL_FILE" | grep . | sort -fu | sed 's/^/@/' | paste -sd, - | sed 's/,/, /g' || true)
    [ -z "$logins" ] && return 0
    printf '## 🙏 Thank you %s\n\nThis release includes contributions from the community — thank you!\n\n' "$logins"
}

# Reads "<sha>\t<line>" lines, prints "<line>" plus " by @<login>" for an external contribution.
credit_lines() {
    awk -F'\t' '
        FILENAME == ARGV[1] { by[$1] = $2; next }
        { sha = $1; line = substr($0, length(sha) + 2); print line ((sha in by) ? " by @" by[sha] : "") }
    ' "$EXTERNAL_FILE" -
}

# ---------------------------------------------------------------------------
# --since-stable: notes covering everything since the previous stable release
# ---------------------------------------------------------------------------
if [ "$SINCE_STABLE" = "1" ]; then
    BASE_TAG=$(git describe --tags --abbrev=0 --exclude='*-*' HEAD 2>/dev/null || true)
    if [ -z "$BASE_TAG" ]; then
        echo "No stable tag found in the history of HEAD." >&2
        exit 1
    fi
    PRERELEASES=$(git tag --merged HEAD --no-merged "$BASE_TAG" -l '*-*' 2>/dev/null | sort -V | paste -sd, - | sed 's/,/, /g' || true)
    PATHSPEC=(src custom_components ':(exclude)custom_components/linus_dashboard/www' ':(exclude)custom_components/linus_dashboard/manifest.json')
    OUTPUT_FILE="$PROJECT_ROOT/RELEASE_NOTES.md"

    TOTAL_COUNT=$(git rev-list --count --no-merges "$BASE_TAG..HEAD")
    SUBJECTS=$(git log "$BASE_TAG..HEAD" --no-merges --pretty=format:"%s" -- "${PATHSPEC[@]}" || true)
    REPO_SLUG="${GITHUB_REPOSITORY:-Thank-you-Linus/Linus-Dashboard}"
    I18N_FILE="$PROJECT_ROOT/.github/release-notes-i18n.tsv"
    [ -f "$I18N_FILE" ] || I18N_FILE=/dev/null

    # Development noise that means nothing to a user (lint, import sorting, dev environment,
    # vague one-liners) is dropped before anything else.
    NOISE_RE='\b(lint|linting|ruff)\b|sort imports|devbox|devcontainer|dev-env|fake house|^performance improvements[[:space:]]'

    load_external_contributors "$BASE_TAG..HEAD"

    # One line per change, tab-separated: "<type>\t<message>\t<pr number or empty>\t<sha>".
    # Message = subject without "type(scope)!:" and without a trailing "(#123)"; dedupe on the
    # lowercased message; reverts and noise are dropped.
    RAW_ENTRIES=$(git log "$BASE_TAG..HEAD" --no-merges --pretty=format:"%s%x09%H" -- "${PATHSPEC[@]}" |
        grep -v '^$' | grep -ivE '^revert(\([^)]*\))?!?:|^revert ' | grep -ivE "$NOISE_RE" | awk -F'\t' '
        {
            type = "other"; msg = $1; sha = $2; pr = ""
            if (match(msg, /^[A-Za-z]+(\([^)]*\))?!?: */)) {
                head = substr(msg, 1, RLENGTH); msg = substr(msg, RLENGTH + 1)
                t = tolower(head); sub(/[(!:].*$/, "", t)
                type = (t == "feat" || t == "fix") ? t : "other"
            }
            if (match(msg, / *\(#[0-9]+\)$/)) {
                pr = substr(msg, RSTART, RLENGTH); gsub(/[^0-9]/, "", pr); msg = substr(msg, 1, RSTART - 1)
            }
            key = tolower(msg)
            if (msg != "" && !seen[key]++) print type "\t" msg "\t" pr "\t" sha
        }' || true)

    # Optional wording file (.github/release-notes-i18n.tsv): "<lowercased message>\t<EN>\t<FR>[\t<type>]".
    # Gives each change a user-facing English and French wording; "-" as EN drops the change
    # (e.g. a fix for something that only existed in a beta). Changes without a line keep the raw
    # commit subject in both languages and are counted in "untranslated".
    # External contributors are credited "by @<account>" on their lines (see credit_lines).
    ENTRIES=$(printf '%s\n' "$RAW_ENTRIES" | grep . | awk -F'\t' -v repo="$REPO_SLUG" '
        BEGIN { OFS = "\t" }
        FILENAME == ARGV[1] { by[$1] = $2; next }
        FILENAME == ARGV[2] { en[$1] = $2; fr[$1] = $3; ty[$1] = $4; next }
        {
            key = tolower($2); type = $1; e = $2; f = $2
            if (key in en) {
                if (en[key] == "-") next
                e = en[key]; f = (fr[key] != "" ? fr[key] : en[key])
                if (ty[key] != "") type = ty[key]
            } else missing++
            link = ""
            if ($3 != "") link = " ([#" $3 "](https://github.com/" repo "/pull/" $3 "))"
            credit = ($4 in by) ? " by @" by[$4] : ""
            print type, e link credit, f link credit
        }
        END { print "#missing", missing + 0 > "/dev/stderr" }' "$EXTERNAL_FILE" "$I18N_FILE" - 2> "$PROJECT_ROOT/.release-notes-missing")
    UNTRANSLATED_COUNT=$(sed -n 's/^#missing\t//p' "$PROJECT_ROOT/.release-notes-missing")
    rm -f "$PROJECT_ROOT/.release-notes-missing"
    KEPT_COUNT=$(printf '%s\n' "$ENTRIES" | grep -c . || true)
    EXCLUDED_COUNT=$((TOTAL_COUNT - KEPT_COUNT))

    # Print one titled list. usage: ci_section "<heading>" "<type: feat|fix|other>" "<column: 2 = EN, 3 = FR>"
    ci_section() {
        local items
        items=$(printf '%s\n' "$ENTRIES" | awk -F'\t' -v t="$2" -v c="$3" '$1 == t { print "- " $c }')
        [ -z "$items" ] && return 0
        printf '### %s\n\n%s\n\n' "$1" "$items"
    }

    # Breaking changes: "!" marker in the subject, or a BREAKING CHANGE footer
    BREAKING=$( {
        printf '%s\n' "$SUBJECTS" | grep -E '^[A-Za-z]+(\([^)]*\))?!:' | sed -E 's/^[A-Za-z]+(\([^)]*\))?!: */- /' || true
        git log "$BASE_TAG..HEAD" --no-merges --pretty=format:"%b" -- "${PATHSPEC[@]}" | grep -E '^BREAKING[ -]CHANGE' | sed -E 's/^BREAKING[ -]CHANGE: */- /' || true
    } | awk '!seen[$0]++')

    ci_breaking() {
        [ -z "$BREAKING" ] && return 0
        printf '### ⚠️ Breaking Changes\n\n%s\n\n' "$BREAKING"
    }

    {
        thanks_block
        echo "## 🇬🇧 English"
        echo ""
        if [ -n "$PRERELEASES" ]; then
            echo "_Everything since ${BASE_TAG}, including the pre-releases: ${PRERELEASES}._"
            echo ""
        fi
        ci_breaking
        ci_section "✨ New Features" feat 2
        ci_section "🐛 Bug Fixes" fix 2
        ci_section "⚡ Improvements" other 2
        echo "---"
        echo ""
        echo "## 🇫🇷 Français"
        echo ""
        if [ -n "$PRERELEASES" ]; then
            echo "_Tout depuis ${BASE_TAG}, pré-releases incluses : ${PRERELEASES}._"
            echo ""
        fi
        ci_breaking
        ci_section "✨ Nouvelles fonctionnalités" feat 3
        ci_section "🐛 Corrections de bugs" fix 3
        ci_section "⚡ Améliorations" other 3
    } > "$OUTPUT_FILE"

    echo "base=${BASE_TAG} range=${BASE_TAG}..HEAD kept=${KEPT_COUNT} excluded=${EXCLUDED_COUNT} untranslated=${UNTRANSLATED_COUNT}"
    echo "File: ${OUTPUT_FILE}"
    exit 0
fi

echo -e "${BLUE}🔍 Generating release notes...${NC}\n"

# Get the last release tag (including pre-releases like beta/alpha)
# First try to get the most recent tag of any kind
LAST_TAG=$(git -c versionsort.suffix=- tag --sort=-version:refname | head -1)

# If no tags found at all
if [ -z "$LAST_TAG" ]; then
    echo -e "${YELLOW}⚠️  No previous tag found. Using all commits.${NC}"
    COMMIT_RANGE="HEAD"
else
    echo -e "${GREEN}📌 Last tag found: ${LAST_TAG}${NC}"
    COMMIT_RANGE="${LAST_TAG}..HEAD"
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}📦 Current version: ${CURRENT_VERSION}${NC}\n"

# Count commits
COMMIT_COUNT=$(git rev-list --count $COMMIT_RANGE 2>/dev/null || echo "0")
echo -e "${BLUE}📝 Found ${COMMIT_COUNT} commits since last release${NC}\n"

if [ "$COMMIT_COUNT" -eq "0" ]; then
    echo -e "${YELLOW}⚠️  No new commits found. Nothing to generate.${NC}"
    if [ "$CI_MODE" = "1" ]; then
        # Keep the pipeline going with a minimal, publishable note
        printf '# Release Notes\n\n_No changes since %s._\n' "${LAST_TAG:-the beginning}" > "$PROJECT_ROOT/RELEASE_NOTES.md"
    fi
    exit 0
fi

load_external_contributors "$COMMIT_RANGE"

# Temporary file for release notes
TEMP_FILE=$(mktemp)
OUTPUT_FILE="$PROJECT_ROOT/RELEASE_NOTES.md"

# Append a titled commit section. Matches "type: msg" and "type(scope): msg".
# In CI mode, empty sections are omitted; otherwise the "empty" placeholder is kept.
# usage: add_section "<heading>" "<type regex>" "<empty placeholder>" ["todo" -> add FR TODO line, non-CI only]
add_section() {
    local heading="$1" types="$2" empty="$3" todo="${4:-}" items
    items=$(git log $COMMIT_RANGE --pretty=format:"%H%x09%s" --no-merges | awk -F'\t' -v types="$types" '
        {
            subject = substr($0, length($1) + 2)
            if (match(tolower(subject), "^(" types ")(\\([^)]*\\))?!?: *")) print $1 "\t- " substr(subject, RLENGTH + 1)
        }' | credit_lines || true)
    if [ -z "$items" ] && [ "$CI_MODE" = "1" ]; then
        return 0
    fi
    {
        echo "### ${heading}"
        echo ""
        if [ -n "$items" ]; then echo "$items"; else echo "$empty"; fi
        if [ "$todo" = "todo" ] && [ "$CI_MODE" != "1" ]; then
            echo "_📝 TODO: Traduire et détailler en français_"
        fi
        echo ""
    } >> "$TEMP_FILE"
}

# Start generating the release notes
printf '# 🎉 Release Notes\n\n' > "$TEMP_FILE"
thanks_block >> "$TEMP_FILE"
if [ "$CI_MODE" = "1" ]; then
    cat >> "$TEMP_FILE" << 'HEADER_CI'
## 🇬🇧 English

HEADER_CI
else
    cat >> "$TEMP_FILE" << 'HEADER'
> **Instructions:** This file was auto-generated from git commits.
> Please review and edit the sections below, especially:
> - Add detailed explanations in English and French
> - Fill in the "For Beta Testers" section
> - Remove any commits that shouldn't be in release notes

---

## 🇬🇧 English

HEADER
fi

# Function to categorize and format commits
add_section "✨ New Features" "feat" "_No new features_"

add_section "🐛 Bug Fixes" "fix" "_No bug fixes_"

add_section "⚡ Improvements" "perf|refactor|style|chore" "_No improvements_"

add_section "📝 Documentation" "docs" "_No documentation changes_"

if [ "$CI_MODE" != "1" ]; then
    echo "### 🧪 For Beta Testers" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "**What to test:**" >> "$TEMP_FILE"
    echo "- [ ] _Add specific testing instructions here_" >> "$TEMP_FILE"
    echo "- [ ] _E.g., Test the new embedded dashboard feature_" >> "$TEMP_FILE"
    echo "- [ ] _E.g., Verify admin access control works correctly_" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "**Known Issues:**" >> "$TEMP_FILE"
    echo "- _None currently_ or _List any known issues_" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
fi

cat >> "$TEMP_FILE" << 'FRENCH_HEADER'

---

## 🇫🇷 Français

FRENCH_HEADER

add_section "✨ Nouvelles fonctionnalités" "feat" "_Aucune nouvelle fonctionnalité_" "todo"

add_section "🐛 Corrections de bugs" "fix" "_Aucune correction_" "todo"

add_section "⚡ Améliorations" "perf|refactor|style|chore" "_Aucune amélioration_" "todo"

add_section "📝 Documentation" "docs" "_Aucun changement de documentation_"

if [ "$CI_MODE" != "1" ]; then
    echo "### 🧪 Pour les Beta Testeurs" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "**Quoi tester :**" >> "$TEMP_FILE"
    echo "- [ ] _Ajouter des instructions de test spécifiques ici_" >> "$TEMP_FILE"
    echo "- [ ] _Ex: Tester la nouvelle fonctionnalité de dashboard embarqué_" >> "$TEMP_FILE"
    echo "- [ ] _Ex: Vérifier que le contrôle d'accès admin fonctionne correctement_" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "**Problèmes connus :**" >> "$TEMP_FILE"
    echo "- _Aucun actuellement_ ou _Lister les problèmes connus_" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
fi

cat >> "$TEMP_FILE" << 'FOOTER'

---

## 📊 Technical Details

### All Commits

FOOTER

git log $COMMIT_RANGE --pretty=format:"%H%x09- %s (%h)" --no-merges | credit_lines >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

echo "### Contributors" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
# GitHub accounts, never git author names ("Juicy" would mention someone else): see the script.
bash "$SCRIPT_DIR/release-contributors.sh" "$COMMIT_RANGE" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Check for breaking changes
BREAKING_CHANGES=$(git log $COMMIT_RANGE --pretty=format:"%b" --no-merges | grep -i "BREAKING CHANGE" || echo "")
if [ ! -z "$BREAKING_CHANGES" ]; then
    echo "" >> "$TEMP_FILE"
    echo "### ⚠️ Breaking Changes" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "$BREAKING_CHANGES" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
fi

# Move temp file to final location
mv "$TEMP_FILE" "$OUTPUT_FILE"

echo -e "${GREEN}✅ Release notes generated successfully!${NC}"
echo -e "${BLUE}📄 File: ${OUTPUT_FILE}${NC}\n"

if [ "$CI_MODE" = "1" ]; then
    exit 0
fi

echo -e "${YELLOW}⚠️  Please review and edit the file before creating a release:${NC}"
echo -e "   1. Add detailed explanations in English"
echo -e "   2. Add translations in French"
echo -e "   3. Fill in the 'For Beta Testers' sections"
echo -e "   4. Remove any commits that shouldn't be public\n"
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "   1. Edit: ${YELLOW}$OUTPUT_FILE${NC}"
echo -e "   2. Bump version: ${YELLOW}npm run bump:beta${NC} or ${YELLOW}npm run bump:release${NC}"
echo -e "   3. Push: ${YELLOW}git push && git push --tags${NC}\n"
