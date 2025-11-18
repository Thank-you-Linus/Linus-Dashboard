#!/usr/bin/env bash
#
# Validate RELEASE_NOTES.md format and content
# Usage: ./validate-release-notes.sh
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

echo -e "${BLUE}🔍 Validating RELEASE_NOTES.md...${NC}\n"

ERRORS=0
WARNINGS=0

# Check if file exists
if [ ! -f "RELEASE_NOTES.md" ]; then
    echo -e "${RED}❌ RELEASE_NOTES.md not found${NC}"
    echo -e "${YELLOW}💡 Run: npm run release:notes${NC}\n"
    exit 1
fi

echo -e "${GREEN}✓ File exists${NC}"

# Check for required sections
REQUIRED_SECTIONS=(
    "## 🇬🇧 English"
    "## 🇫🇷 Français"
    "### ✨ New Features"
    "### ✨ Nouvelles fonctionnalités"
)

for section in "${REQUIRED_SECTIONS[@]}"; do
    if grep -q "^${section}" RELEASE_NOTES.md; then
        echo -e "${GREEN}✓ Found: ${section}${NC}"
    else
        echo -e "${RED}❌ Missing: ${section}${NC}"
        ((ERRORS++))
    fi
done

# Check for at least one bold feature in English
BOLD_FEATURES_EN=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | grep -E '^\s*-\s*\*\*' | wc -l)
if [ "$BOLD_FEATURES_EN" -gt 0 ]; then
    echo -e "${GREEN}✓ Found ${BOLD_FEATURES_EN} bold feature(s) in English${NC}"
else
    echo -e "${YELLOW}⚠️  No bold features found in English section${NC}"
    echo -e "${YELLOW}💡 Mark main features with **bold** for better visibility${NC}"
    ((WARNINGS++))
fi

# Check for at least one bold feature in French
BOLD_FEATURES_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | grep -E '^\s*-\s*\*\*' | wc -l)
if [ "$BOLD_FEATURES_FR" -gt 0 ]; then
    echo -e "${GREEN}✓ Found ${BOLD_FEATURES_FR} bold feature(s) in French${NC}"
else
    echo -e "${YELLOW}⚠️  No bold features found in French section${NC}"
    echo -e "${YELLOW}💡 Mark main features with **bold** for better visibility${NC}"
    ((WARNINGS++))
fi

# Check for beta testing section if version is beta
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")
if echo "$VERSION" | grep -q "beta\|alpha"; then
    if grep -q "### 🧪 For Beta Testers" RELEASE_NOTES.md; then
        echo -e "${GREEN}✓ Found beta testing section${NC}"
        
        # Check for testing notes
        TESTING_NOTES=$(sed -n '/### 🧪 For Beta Testers/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | grep -E '^\s*-\s*\[' | wc -l)
        if [ "$TESTING_NOTES" -gt 0 ]; then
            echo -e "${GREEN}✓ Found ${TESTING_NOTES} testing note(s)${NC}"
        else
            echo -e "${YELLOW}⚠️  No testing checkboxes found${NC}"
            echo -e "${YELLOW}💡 Add testing instructions with [ ] checkboxes${NC}"
            ((WARNINGS++))
        fi
    else
        echo -e "${YELLOW}⚠️  Missing beta testing section for beta version${NC}"
        ((WARNINGS++))
    fi
fi

# Check file size (should not be empty)
FILE_SIZE=$(wc -c < "RELEASE_NOTES.md")
if [ "$FILE_SIZE" -lt 500 ]; then
    echo -e "${YELLOW}⚠️  File seems too short (${FILE_SIZE} bytes)${NC}"
    echo -e "${YELLOW}💡 Make sure to fill in all sections with detailed information${NC}"
    ((WARNINGS++))
fi

# Check for common placeholders that should be replaced
PLACEHOLDERS=("TODO" "_Add" "_Ex:" "lorem ipsum")
for placeholder in "${PLACEHOLDERS[@]}"; do
    if grep -qi "$placeholder" RELEASE_NOTES.md; then
        echo -e "${YELLOW}⚠️  Found placeholder text: ${placeholder}${NC}"
        ((WARNINGS++))
    fi
done

# Summary
echo -e "\n${BLUE}═══════════════════════════════════════${NC}"
if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ Validation passed with no issues!${NC}"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  Validation passed with ${WARNINGS} warning(s)${NC}"
    echo -e "${YELLOW}💡 Consider addressing warnings for better quality${NC}"
    exit 0
else
    echo -e "${RED}❌ Validation failed with ${ERRORS} error(s) and ${WARNINGS} warning(s)${NC}"
    echo -e "${RED}💡 Please fix the errors before releasing${NC}"
    exit 1
fi
