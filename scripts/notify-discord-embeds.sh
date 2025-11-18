#!/usr/bin/env bash
#
# Send release notification to Discord with rich embeds
# Usage: 
#   ./notify-discord-embeds.sh [--dry-run] [prerelease|release] <version> <release_url>
#
# This version uses Discord embeds for better visual presentation
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
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Parse arguments
DRY_RUN=false
if [ "$1" = "--dry-run" ]; then
    DRY_RUN=true
    shift
fi

RELEASE_TYPE="${1:-prerelease}"
VERSION="${2:-$(node -p "require('./package.json').version" 2>/dev/null || echo "unknown")}"
RELEASE_URL="${3:-https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/$VERSION}"

# Discord embed colors
COLOR_BETA=15844367  # Gold/Orange for beta
COLOR_STABLE=5763719  # Green for stable

if [[ "$RELEASE_TYPE" == "prerelease" ]]; then
    EMBED_COLOR=$COLOR_BETA
    TITLE_EMOJI="🧪"
    TITLE_TEXT="New Beta Release | Nouvelle Version Beta"
else
    EMBED_COLOR=$COLOR_STABLE
    TITLE_EMOJI="🎉"
    TITLE_TEXT="New Stable Release | Nouvelle Version Stable"
fi

# Check if DISCORD_WEBHOOK_URL is set (skip in dry-run mode)
if [ "$DRY_RUN" = false ] && [ -z "$DISCORD_WEBHOOK_URL" ]; then
    echo -e "${RED}❌ Error: DISCORD_WEBHOOK_URL environment variable is not set${NC}"
    echo -e "${YELLOW}💡 Set it in GitHub Secrets or export it locally${NC}"
    echo -e "${YELLOW}💡 Or use --dry-run to preview the message${NC}"
    exit 1
fi

if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}🧪 DRY RUN MODE - Message will not be sent${NC}\n"
fi

echo -e "${BLUE}📢 Preparing Discord notification with embeds...${NC}"
echo -e "${BLUE}   Type: ${RELEASE_TYPE}${NC}"
echo -e "${BLUE}   Version: ${VERSION}${NC}"
echo -e "${BLUE}   URL: ${RELEASE_URL}${NC}\n"

# Extract content from RELEASE_NOTES.md
if [ -f "RELEASE_NOTES.md" ]; then
    echo -e "${GREEN}✓ Found RELEASE_NOTES.md${NC}"
    
    # Get features (only bold items)
    FEATURES_EN=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### ✨ New Features/,/^### /p' | grep -E '^[[:space:]]*-[[:space:]]*\*\*' | sed 's/^[[:space:]]*//' | head -3)
    FEATURES_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### ✨ Nouvelles fonctionnalités/,/^### /p' | grep -E '^[[:space:]]*-[[:space:]]*\*\*' | sed 's/^[[:space:]]*//' | head -3)
    
    # Get improvements
    IMPROVEMENTS_EN=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### ⚡ Improvements/,/^### /p' | grep -E '^[[:space:]]*-' | sed 's/^[[:space:]]*//' | head -3)
    IMPROVEMENTS_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### ⚡ Améliorations/,/^### /p' | grep -E '^[[:space:]]*-' | sed 's/^[[:space:]]*//' | head -3)
    
    # Get testing notes for beta
    if [[ "$RELEASE_TYPE" == "prerelease" ]]; then
        TESTING_EN=$(sed -n '/### 🧪 For Beta Testers/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/What to test:/,/Known Issues:/p' | grep -E '^[[:space:]]*-' | sed 's/^[[:space:]]*//' | head -3)
        TESTING_FR=$(sed -n '/### 🧪 Pour les Beta Testeurs/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/Quoi tester/,/Problèmes connus/p' | grep -E '^[[:space:]]*-' | sed 's/^[[:space:]]*//' | head -3)
    fi
else
    echo -e "${YELLOW}⚠️  RELEASE_NOTES.md not found${NC}"
    FEATURES_EN="- See release notes for details"
    FEATURES_FR="- Voir les notes de version pour plus de détails"
    IMPROVEMENTS_EN=""
    IMPROVEMENTS_FR=""
    TESTING_EN=""
    TESTING_FR=""
fi

# Build embed fields
FIELDS="["

# Features EN
if [ -n "$FEATURES_EN" ]; then
    FEATURES_EN_ESCAPED=$(echo "$FEATURES_EN" | jq -Rs .)
    FIELDS="$FIELDS{\"name\":\"✨ What's New\",\"value\":$FEATURES_EN_ESCAPED,\"inline\":false},"
fi

# Improvements EN
if [ -n "$IMPROVEMENTS_EN" ]; then
    IMPROVEMENTS_EN_ESCAPED=$(echo "$IMPROVEMENTS_EN" | jq -Rs .)
    FIELDS="$FIELDS{\"name\":\"⚡ Improvements\",\"value\":$IMPROVEMENTS_EN_ESCAPED,\"inline\":false},"
fi

# Testing notes for beta
if [[ "$RELEASE_TYPE" == "prerelease" ]] && [ -n "$TESTING_EN" ]; then
    TESTING_EN_ESCAPED=$(echo "$TESTING_EN" | jq -Rs .)
    FIELDS="$FIELDS{\"name\":\"🧪 What to Test\",\"value\":$TESTING_EN_ESCAPED,\"inline\":false},"
fi

# French section
if [ -n "$FEATURES_FR" ]; then
    FEATURES_FR_ESCAPED=$(echo "$FEATURES_FR" | jq -Rs .)
    FIELDS="$FIELDS{\"name\":\"🇫🇷 Nouveautés\",\"value\":$FEATURES_FR_ESCAPED,\"inline\":false},"
fi

# Remove trailing comma
FIELDS="${FIELDS%,}]"

# Create JSON payload with embed
JSON_PAYLOAD=$(jq -n \
    --arg title "$TITLE_EMOJI $TITLE_TEXT" \
    --arg description "**Linus Dashboard $VERSION** is now available!\n**Linus Dashboard $VERSION** est maintenant disponible !" \
    --argjson color "$EMBED_COLOR" \
    --arg url "$RELEASE_URL" \
    --argjson fields "$FIELDS" \
    '{
        content: "'"$([ "$RELEASE_TYPE" = "prerelease" ] && echo "@Beta Tester 🔍" || echo "")"'",
        embeds: [{
            title: $title,
            description: $description,
            color: $color,
            fields: $fields,
            footer: {
                text: "Click the link above for full release notes"
            },
            url: $url
        }]
    }')

# Dry-run mode: preview
if [ "$DRY_RUN" = true ]; then
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}📨 PREVIEW: Discord Embed Message (dry-run mode)${NC}"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}\n"
    echo "$JSON_PAYLOAD" | jq '.'
    echo -e "\n${CYAN}════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}📊 Message Stats:${NC}"
    echo -e "   Type: $RELEASE_TYPE"
    echo -e "   Version: $VERSION"
    echo -e "   Color: #$(printf '%06X\n' $EMBED_COLOR)"
    echo -e "   Fields: $(echo "$FIELDS" | jq '. | length')"
    echo -e "${CYAN}════════════════════════════════════════════════════════════${NC}\n"
    echo -e "${GREEN}✅ Dry-run completed successfully!${NC}"
    echo -e "${YELLOW}💡 To send for real, remove --dry-run flag${NC}\n"
    exit 0
fi

echo -e "${BLUE}📤 Sending to Discord with embeds...${NC}\n"

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
