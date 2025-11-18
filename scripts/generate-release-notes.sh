#!/usr/bin/env bash
#
# Generate release notes from git commits since last release
# Usage: npm run release:notes
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔍 Generating release notes...${NC}\n"

# Get the last release tag
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -z "$LAST_TAG" ]; then
    echo -e "${YELLOW}⚠️  No previous tag found. Using all commits.${NC}"
    COMMIT_RANGE="HEAD"
else
    echo -e "${GREEN}📌 Last release: ${LAST_TAG}${NC}"
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
    exit 0
fi

# Temporary file for release notes
TEMP_FILE=$(mktemp)
OUTPUT_FILE="$PROJECT_ROOT/RELEASE_NOTES.md"

# Start generating the release notes
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

# Function to categorize and format commits
echo "### ✨ New Features" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
git log $COMMIT_RANGE --pretty=format:"%s" --no-merges | grep -i "^feat" | sed 's/^feat[:(].*[):] */- /' >> "$TEMP_FILE" || echo "_No new features_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

echo "### 🐛 Bug Fixes" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
git log $COMMIT_RANGE --pretty=format:"%s" --no-merges | grep -i "^fix" | sed 's/^fix[:(].*[):] */- /' >> "$TEMP_FILE" || echo "_No bug fixes_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

echo "### ⚡ Improvements" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
git log $COMMIT_RANGE --pretty=format:"%s" --no-merges | grep -iE "^(perf|refactor|style|chore)" | sed 's/^[^:]*: */- /' >> "$TEMP_FILE" || echo "_No improvements_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

echo "### 📝 Documentation" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
git log $COMMIT_RANGE --pretty=format:"%s" --no-merges | grep -i "^docs" | sed 's/^docs[:(].*[):] */- /' >> "$TEMP_FILE" || echo "_No documentation changes_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

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

cat >> "$TEMP_FILE" << 'FRENCH_HEADER'

---

## 🇫🇷 Français

FRENCH_HEADER

echo "### ✨ Nouvelles fonctionnalités" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
git log $COMMIT_RANGE --pretty=format:"%s" --no-merges | grep -i "^feat" | sed 's/^feat[:(].*[):] */- /' >> "$TEMP_FILE" || echo "_Aucune nouvelle fonctionnalité_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "_📝 TODO: Traduire et détailler en français_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

echo "### 🐛 Corrections de bugs" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
git log $COMMIT_RANGE --pretty=format:"%s" --no-merges | grep -i "^fix" | sed 's/^fix[:(].*[):] */- /' >> "$TEMP_FILE" || echo "_Aucune correction_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "_📝 TODO: Traduire et détailler en français_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

echo "### ⚡ Améliorations" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
git log $COMMIT_RANGE --pretty=format:"%s" --no-merges | grep -iE "^(perf|refactor|style|chore)" | sed 's/^[^:]*: */- /' >> "$TEMP_FILE" || echo "_Aucune amélioration_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "_📝 TODO: Traduire et détailler en français_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

echo "### 📝 Documentation" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
git log $COMMIT_RANGE --pretty=format:"%s" --no-merges | grep -i "^docs" | sed 's/^docs[:(].*[):] */- /' >> "$TEMP_FILE" || echo "_Aucun changement de documentation_" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

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
echo -e "${YELLOW}⚠️  Please review and edit the file before creating a release:${NC}"
echo -e "   1. Add detailed explanations in English"
echo -e "   2. Add translations in French"
echo -e "   3. Fill in the 'For Beta Testers' sections"
echo -e "   4. Remove any commits that shouldn't be public\n"
echo -e "${BLUE}💡 Next steps:${NC}"
echo -e "   1. Edit: ${YELLOW}$OUTPUT_FILE${NC}"
echo -e "   2. Bump version: ${YELLOW}npm run bump:beta${NC} or ${YELLOW}npm run bump:release${NC}"
echo -e "   3. Push: ${YELLOW}git push && git push --tags${NC}\n"
