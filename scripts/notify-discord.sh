#!/usr/bin/env bash
#
# Send release notification to Discord
# Usage: 
#   ./notify-discord.sh [prerelease|release] <version> <release_url>
#   Or called automatically by GitHub Actions
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

# Parse arguments
RELEASE_TYPE="${1:-prerelease}"
VERSION="${2:-$(node -p "require('./package.json').version")}"
RELEASE_URL="${3:-https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/$VERSION}"

# Check if DISCORD_WEBHOOK_URL is set
if [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo -e "${RED}❌ Error: DISCORD_WEBHOOK_URL environment variable is not set${NC}"
    echo -e "${YELLOW}💡 Set it in GitHub Secrets or export it locally${NC}"
    exit 1
fi

echo -e "${BLUE}📢 Preparing Discord notification...${NC}"
echo -e "${BLUE}   Type: ${RELEASE_TYPE}${NC}"
echo -e "${BLUE}   Version: ${VERSION}${NC}"
echo -e "${BLUE}   URL: ${RELEASE_URL}${NC}\n"

# Select template based on release type
if [[ "$RELEASE_TYPE" == "prerelease" ]]; then
    TEMPLATE_FILE=".github/templates/discord-prerelease.md"
else
    TEMPLATE_FILE=".github/templates/discord-release.md"
fi

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}❌ Error: Template file not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

# Read the template
TEMPLATE_CONTENT=$(cat "$TEMPLATE_FILE")

# Read RELEASE_NOTES.md if it exists
if [ -f "RELEASE_NOTES.md" ]; then
    echo -e "${GREEN}✓ Found RELEASE_NOTES.md${NC}"
    
    # Extract English changelog (features, fixes, improvements only)
    CHANGELOG_EN=""
    
    # Get features (try bold items first, fallback to all items, limit to 5)
    FEATURES=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### ✨ New Features/,/^### /p' | grep -E '^[[:space:]]*-[[:space:]]*\*\*' | head -5)
    if [ -z "$FEATURES" ]; then
        FEATURES=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### ✨ New Features/,/^### /p' | grep -E '^[[:space:]]*-' | grep -v '^\s*$' | head -5)
    fi
    if [ -n "$FEATURES" ]; then
        CHANGELOG_EN="${CHANGELOG_EN}**✨ New Features**
${FEATURES}

"
    fi
    
    # Get bug fixes (try bold items first, fallback to all items, limit to 5)
    FIXES=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### 🐛 Bug Fixes/,/^### /p' | grep -E '^[[:space:]]*-[[:space:]]*\*\*' | head -5)
    if [ -z "$FIXES" ]; then
        FIXES=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### 🐛 Bug Fixes/,/^### /p' | grep -E '^[[:space:]]*-' | grep -v '^\s*$' | head -5)
    fi
    if [ -n "$FIXES" ]; then
        CHANGELOG_EN="${CHANGELOG_EN}**🐛 Bug Fixes**
${FIXES}

"
    fi
    
    # Get improvements (all items, limited to 3)
    IMPROVEMENTS=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### ⚡ Improvements/,/^### /p' | grep -E '^[[:space:]]*-' | grep -v '^\s*$' | head -3)
    if [ -n "$IMPROVEMENTS" ]; then
        CHANGELOG_EN="${CHANGELOG_EN}**⚡ Improvements**
${IMPROVEMENTS}"
    fi
    
    # If no changelog found, use a summary message
    if [ -z "$CHANGELOG_EN" ]; then
        CHANGELOG_EN="Multiple improvements and fixes. See full release notes for details."
    fi
    
    # Extract French changelog
    CHANGELOG_FR=""
    
    # Get features (French) (try bold items first, fallback to all items, limit to 5)
    FEATURES_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### ✨ Nouvelles fonctionnalités/,/^### /p' | grep -E '^[[:space:]]*-[[:space:]]*\*\*' | head -5)
    if [ -z "$FEATURES_FR" ]; then
        FEATURES_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### ✨ Nouvelles fonctionnalités/,/^### /p' | grep -E '^[[:space:]]*-' | grep -v '^\s*$' | head -5)
    fi
    if [ -n "$FEATURES_FR" ]; then
        CHANGELOG_FR="${CHANGELOG_FR}**✨ Nouvelles fonctionnalités**
${FEATURES_FR}

"
    fi
    
    # Get bug fixes (French) (try bold items first, fallback to all items, limit to 5)
    FIXES_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### 🐛 Corrections de bugs/,/^### /p' | grep -E '^[[:space:]]*-[[:space:]]*\*\*' | head -5)
    if [ -z "$FIXES_FR" ]; then
        FIXES_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### 🐛 Corrections de bugs/,/^### /p' | grep -E '^[[:space:]]*-' | grep -v '^\s*$' | head -5)
    fi
    if [ -n "$FIXES_FR" ]; then
        CHANGELOG_FR="${CHANGELOG_FR}**🐛 Corrections de bugs**
${FIXES_FR}

"
    fi
    
    # Get improvements (French) (all items, limited to 3)
    IMPROVEMENTS_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### ⚡ Améliorations/,/^### /p' | grep -E '^[[:space:]]*-' | grep -v '^\s*$' | head -3)
    if [ -n "$IMPROVEMENTS_FR" ]; then
        CHANGELOG_FR="${CHANGELOG_FR}**⚡ Améliorations**
${IMPROVEMENTS_FR}"
    fi
    
    # If no French changelog found, use English or summary
    if [ -z "$CHANGELOG_FR" ]; then
        if [ -n "$CHANGELOG_EN" ] && [ "$CHANGELOG_EN" != "Multiple improvements and fixes. See full release notes for details." ]; then
            CHANGELOG_FR="$CHANGELOG_EN"
        else
            CHANGELOG_FR="Plusieurs améliorations et corrections. Voir les notes complètes pour les détails."
        fi
    fi
    
    # Extract testing notes EN
    TESTING_NOTES_EN=$(sed -n '/### 🧪 For Beta Testers/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/What to test:/,/Known Issues:/p' | grep -E '^[[:space:]]*-' | grep -v '^\s*$' | head -5)
    if [ -z "$TESTING_NOTES_EN" ]; then
        TESTING_NOTES_EN="- See full release notes for testing details"
    fi
    
    # Extract testing notes FR
    TESTING_NOTES_FR=$(sed -n '/### 🧪 Pour les Beta Testeurs/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/Quoi tester/,/Problèmes connus/p' | grep -E '^[[:space:]]*-' | grep -v '^\s*$' | head -5)
    if [ -z "$TESTING_NOTES_FR" ]; then
        TESTING_NOTES_FR="- Voir les notes complètes pour les détails de test"
    fi
else
    echo -e "${YELLOW}⚠️  RELEASE_NOTES.md not found, using git log${NC}"
    
    # Fallback: use recent commits
    LAST_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
    if [ -z "$LAST_TAG" ]; then
        COMMIT_RANGE="HEAD~5..HEAD"
    else
        COMMIT_RANGE="${LAST_TAG}..HEAD"
    fi
    
    CHANGELOG_EN=$(git log $COMMIT_RANGE --pretty=format:"- %s" --no-merges | head -10)
    CHANGELOG_FR="$CHANGELOG_EN"
    TESTING_NOTES_EN="- See release notes for full details"
    TESTING_NOTES_FR="- Voir les notes de version pour plus de détails"
fi

# Replace placeholders
MESSAGE="$TEMPLATE_CONTENT"
MESSAGE="${MESSAGE//\{\{VERSION\}\}/$VERSION}"
MESSAGE="${MESSAGE//\{\{RELEASE_URL\}\}/$RELEASE_URL}"
MESSAGE="${MESSAGE//\{\{CHANGELOG_EN\}\}/$CHANGELOG_EN}"
MESSAGE="${MESSAGE//\{\{CHANGELOG_FR\}\}/$CHANGELOG_FR}"
MESSAGE="${MESSAGE//\{\{TESTING_NOTES_EN\}\}/$TESTING_NOTES_EN}"
MESSAGE="${MESSAGE//\{\{TESTING_NOTES_FR\}\}/$TESTING_NOTES_FR}"

# Truncate if too long (Discord limit is 2000 chars)
if [ ${#MESSAGE} -gt 1900 ]; then
    MESSAGE="${MESSAGE:0:1900}

_Message truncated. See full release notes at:_
$RELEASE_URL"
fi

# Create JSON payload
JSON_PAYLOAD=$(jq -n \
    --arg content "$MESSAGE" \
    '{content: $content}')

echo -e "${BLUE}📤 Sending to Discord...${NC}\n"

# Send to Discord
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$DISCORD_WEBHOOK_URL" \
    -H "Content-Type: application/json" \
    -d "$JSON_PAYLOAD")

HTTP_CODE=$(echo "$RESPONSE" | tail -n1)
RESPONSE_BODY=$(echo "$RESPONSE" | head -n-1)

if [ "$HTTP_CODE" -eq 204 ] || [ "$HTTP_CODE" -eq 200 ]; then
    echo -e "${GREEN}✅ Discord notification sent successfully!${NC}"
    echo -e "${BLUE}   Status code: $HTTP_CODE${NC}\n"
else
    echo -e "${RED}❌ Failed to send Discord notification${NC}"
    echo -e "${RED}   Status code: $HTTP_CODE${NC}"
    echo -e "${RED}   Response: $RESPONSE_BODY${NC}\n"
    exit 1
fi

echo -e "${GREEN}🎉 Done!${NC}"
