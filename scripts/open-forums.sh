#!/usr/bin/env bash
#
# Open forum pages with pre-filled release notes
# Usage: npm run forums:open
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

# Get current version
VERSION=$(node -p "require('./package.json').version")
RELEASE_URL="https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/$VERSION"

echo -e "${BLUE}📝 Preparing forum posts for version ${VERSION}...${NC}\n"

# Check if templates exist
if [ ! -f ".github/templates/forum-homeassistant.md" ]; then
    echo -e "${RED}❌ Error: Home Assistant forum template not found${NC}"
    exit 1
fi

if [ ! -f ".github/templates/forum-hacf.md" ]; then
    echo -e "${RED}❌ Error: HACF forum template not found${NC}"
    exit 1
fi

# Read RELEASE_NOTES.md if it exists
if [ -f "RELEASE_NOTES.md" ]; then
    echo -e "${GREEN}✓ Found RELEASE_NOTES.md${NC}"
    
    # Extract English section
    CHANGELOG_EN=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed '1d;$d')
    
    # Extract French section
    CHANGELOG_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed '1d;$d')
else
    echo -e "${YELLOW}⚠️  RELEASE_NOTES.md not found, using git log${NC}"
    
    # Fallback: use recent commits
    LAST_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
    if [ -z "$LAST_TAG" ]; then
        COMMIT_RANGE="HEAD~10..HEAD"
    else
        COMMIT_RANGE="${LAST_TAG}..HEAD"
    fi
    
    CHANGELOG_EN=$(git log $COMMIT_RANGE --pretty=format:"- %s" --no-merges)
    CHANGELOG_FR="$CHANGELOG_EN"
fi

# Generate Home Assistant forum post (English)
HA_TEMPLATE=$(cat ".github/templates/forum-homeassistant.md")
HA_POST="${HA_TEMPLATE//\{\{VERSION\}\}/$VERSION}"
HA_POST="${HA_POST//\{\{RELEASE_URL\}\}/$RELEASE_URL}"
HA_POST="${HA_POST//\{\{CHANGELOG_EN\}\}/$CHANGELOG_EN}"

# Generate HACF forum post (French)
HACF_TEMPLATE=$(cat ".github/templates/forum-hacf.md")
HACF_POST="${HACF_TEMPLATE//\{\{VERSION\}\}/$VERSION}"
HACF_POST="${HACF_POST//\{\{RELEASE_URL\}\}/$RELEASE_URL}"
HACF_POST="${HACF_POST//\{\{CHANGELOG_FR\}\}/$CHANGELOG_FR}"

# Save to temporary files
HA_FILE="/tmp/linus-dashboard-ha-forum-post.md"
HACF_FILE="/tmp/linus-dashboard-hacf-forum-post.md"

echo "$HA_POST" > "$HA_FILE"
echo "$HACF_POST" > "$HACF_FILE"

echo -e "${GREEN}✓ Generated forum posts${NC}"
echo -e "  English: $HA_FILE"
echo -e "  French: $HACF_FILE\n"

# Forum URLs with threads
HA_FORUM_URL="https://community.home-assistant.io/t/linus-dashboard-plug-n-play-magic-dashboard-with-smart-sections-for-rooms-and-devices"
HACF_FORUM_URL="https://forum.hacf.fr/t/linus-dashboard-tableau-de-bord-magique-plug-n-play-avec-des-sections-intelligentes-pour-les-pieces-et-les-appareils"

echo -e "${BLUE}🌐 Opening forums in your browser...${NC}\n"

# Copy to clipboard if available
if command -v xclip &> /dev/null; then
    echo "$HA_POST" | xclip -selection clipboard
    echo -e "${GREEN}✓ English post copied to clipboard${NC}"
    CLIPBOARD_CMD="xclip"
elif command -v pbcopy &> /dev/null; then
    echo "$HA_POST" | pbcopy
    echo -e "${GREEN}✓ English post copied to clipboard${NC}"
    CLIPBOARD_CMD="pbcopy"
elif command -v clip.exe &> /dev/null; then
    echo "$HA_POST" | clip.exe
    echo -e "${GREEN}✓ English post copied to clipboard${NC}"
    CLIPBOARD_CMD="clip.exe"
else
    echo -e "${YELLOW}⚠️  Clipboard tool not found (xclip/pbcopy/clip.exe)${NC}"
    CLIPBOARD_CMD=""
fi

# Open Home Assistant Community Forum (English)
echo -e "${BLUE}📖 Opening Home Assistant Community Forum...${NC}"
if command -v xdg-open &> /dev/null; then
    xdg-open "$HA_FORUM_URL" &
elif command -v open &> /dev/null; then
    open "$HA_FORUM_URL" &
elif command -v start &> /dev/null; then
    start "$HA_FORUM_URL" &
else
    echo -e "${YELLOW}⚠️  Could not open browser automatically${NC}"
    echo -e "${BLUE}   Please open: $HA_FORUM_URL${NC}"
fi

echo -e "${YELLOW}📋 The English post content is in your clipboard${NC}"
echo -e "${YELLOW}   Paste it as a new reply in the thread${NC}\n"

read -p "Press Enter when ready to open HACF forum (French)..."

# Copy French post to clipboard
if [ ! -z "$CLIPBOARD_CMD" ]; then
    if [ "$CLIPBOARD_CMD" = "xclip" ]; then
        echo "$HACF_POST" | xclip -selection clipboard
    elif [ "$CLIPBOARD_CMD" = "pbcopy" ]; then
        echo "$HACF_POST" | pbcopy
    elif [ "$CLIPBOARD_CMD" = "clip.exe" ]; then
        echo "$HACF_POST" | clip.exe
    fi
    echo -e "${GREEN}✓ French post copied to clipboard${NC}"
fi

# Open HACF Forum (French)
echo -e "${BLUE}📖 Opening HACF Forum...${NC}"
if command -v xdg-open &> /dev/null; then
    xdg-open "$HACF_FORUM_URL" &
elif command -v open &> /dev/null; then
    open "$HACF_FORUM_URL" &
elif command -v start &> /dev/null; then
    start "$HACF_FORUM_URL" &
else
    echo -e "${YELLOW}⚠️  Could not open browser automatically${NC}"
    echo -e "${BLUE}   Please open: $HACF_FORUM_URL${NC}"
fi

echo -e "${YELLOW}📋 The French post content is in your clipboard${NC}"
echo -e "${YELLOW}   Paste it as a new reply in the thread${NC}\n"

echo -e "${GREEN}✅ Done!${NC}\n"
echo -e "${BLUE}📝 Post files saved at:${NC}"
echo -e "  - $HA_FILE"
echo -e "  - $HACF_FILE"
echo -e ""
echo -e "${BLUE}🔗 Forum threads:${NC}"
echo -e "  - Home Assistant: $HA_FORUM_URL"
echo -e "  - HACF: $HACF_FORUM_URL"
echo -e ""
