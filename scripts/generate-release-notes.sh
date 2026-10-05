#!/usr/bin/env bash
#
# Generate release notes from git commits since last release
# Usage: npm run release:notes
#        bash scripts/generate-release-notes.sh --ci
#
# --ci: non-interactive mode (GitHub Actions). Produces publishable FR/EN notes
#       without the "Instructions" block, tester placeholders or TODO lines.
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

CI_MODE=0
for arg in "$@"; do
    case "$arg" in
        --ci) CI_MODE=1 ;;
        *)
            echo "Unknown option: $arg" >&2
            echo "Usage: $0 [--ci]" >&2
            exit 1
            ;;
    esac
done

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Temporary file for release notes
TEMP_FILE=$(mktemp)
OUTPUT_FILE="$PROJECT_ROOT/RELEASE_NOTES.md"

# Append a titled commit section. Matches "type: msg" and "type(scope): msg".
# In CI mode, empty sections are omitted; otherwise the "empty" placeholder is kept.
# usage: add_section "<heading>" "<type regex>" "<empty placeholder>" ["todo" -> add FR TODO line, non-CI only]
add_section() {
    local heading="$1" types="$2" empty="$3" todo="${4:-}" items
    items=$(git log $COMMIT_RANGE --pretty=format:"%s" --no-merges | grep -iE "^(${types})(\([^)]*\))?!?:" | sed -E 's/^[A-Za-z]+(\([^)]*\))?!?: */- /' || true)
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
if [ "$CI_MODE" = "1" ]; then
    cat > "$TEMP_FILE" << 'HEADER_CI'
# 🎉 Release Notes

## 🇬🇧 English

HEADER_CI
else
    cat > "$TEMP_FILE" << 'HEADER'
# 🎉 Release Notes

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

git log $COMMIT_RANGE --pretty=format:"- %s (%h)" --no-merges >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

echo "### Contributors" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
git log $COMMIT_RANGE --pretty=format:"%an" --no-merges | sort -u | sed 's/^/- @/' >> "$TEMP_FILE"
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
