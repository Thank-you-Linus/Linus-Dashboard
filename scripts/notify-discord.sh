#!/usr/bin/env bash
#
# Send a release notification to Discord
# Usage:
#   ./notify-discord.sh prerelease <version> <release_url>   # beta → beta testers channel
#   ./notify-discord.sh release <X.Y.Z> <release_url>        # stable → #annonces
#   Or called automatically by the GitHub Actions workflows:
#   - prerelease: beta-release.yml, prerelease.yml (DISCORD_WEBHOOK_URL)
#   - release: stable-release.yml right after the stable is published, and the manual catch-up
#     announce-stable.yml (DISCORD_WEBHOOK_STABLE_URL only, never the beta channel)
# A stable message is .github/release-highlights/<version>.discord.md when it exists (curated text),
# else the generic template .github/templates/discord-release.md; {{VERSION}} and {{RELEASE_URL}}
# are replaced. Forums (HA, HACF) stay manual: `npm run forums:open`.
# Any other type, or a stable version that is not X.Y.Z, exits with code 2 without calling Discord.
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

echo -e "${BLUE}📢 Preparing Discord notification...${NC}"
echo -e "${BLUE}   Type: ${RELEASE_TYPE}${NC}"
echo -e "${BLUE}   Version: ${VERSION}${NC}"
echo -e "${BLUE}   URL: ${RELEASE_URL}${NC}\n"

# Truncate $MESSAGE to the Discord limit and POST it to $WEBHOOK_URL (exits 1 on failure).
# Body left unindented: the truncation notice is a multi-line string, indenting it would change it.
send_to_discord() {
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
RESPONSE=$(curl -s -w "\n%{http_code}" -X POST "$WEBHOOK_URL" \
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
}

# Only prerelease (beta) and release (stable) exist; refuse anything else before reading webhooks
if [[ "$RELEASE_TYPE" != "prerelease" && "$RELEASE_TYPE" != "release" ]]; then
    echo -e "${RED}❌ Unknown release type: ${RELEASE_TYPE} (expected prerelease or release) — refusing${NC}"
    exit 2
fi

# STABLE RELEASE: #annonces only, through its own webhook (never the beta testers channel)
if [[ "$RELEASE_TYPE" == "release" ]]; then
    if ! [[ "$VERSION" =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
        echo -e "${RED}❌ A stable release is X.Y.Z (got ${VERSION}) — refusing${NC}"
        exit 2
    fi
    if [ -n "$DISCORD_WEBHOOK_STABLE_URL" ]; then
        WEBHOOK_URL="$DISCORD_WEBHOOK_STABLE_URL"
        echo -e "${GREEN}✓ Using stable release webhook → #annonces channel${NC}"
    else
        echo -e "${RED}❌ Error: DISCORD_WEBHOOK_STABLE_URL not configured for stable release${NC}"
        echo -e "${YELLOW}💡 Set DISCORD_WEBHOOK_STABLE_URL to point to your #annonces channel${NC}"
        exit 1
    fi

    # Curated announcement of this version if it exists, else the generic template
    TEMPLATE_FILE=".github/release-highlights/${VERSION}.discord.md"
    if [ ! -f "$TEMPLATE_FILE" ]; then
        TEMPLATE_FILE=".github/templates/discord-release.md"
    fi
    echo -e "${BLUE}📄 Using message: ${TEMPLATE_FILE}${NC}\n"

    if [ ! -f "$TEMPLATE_FILE" ]; then
        echo -e "${RED}❌ Error: Template file not found: $TEMPLATE_FILE${NC}"
        exit 1
    fi

    MESSAGE=$(cat "$TEMPLATE_FILE")
    MESSAGE="${MESSAGE//\{\{VERSION\}\}/$VERSION}"
    MESSAGE="${MESSAGE//\{\{RELEASE_URL\}\}/$RELEASE_URL}"

    send_to_discord
    exit 0
fi

# PRE-RELEASE (BETA): Use default webhook for beta testers
if [ -n "$DISCORD_WEBHOOK_URL" ]; then
    WEBHOOK_URL="$DISCORD_WEBHOOK_URL"
    echo -e "${GREEN}✓ Using pre-release webhook → beta testers channel${NC}"
else
    echo -e "${RED}❌ Error: DISCORD_WEBHOOK_URL not configured for pre-release${NC}"
    echo -e "${YELLOW}💡 Set DISCORD_WEBHOOK_URL to point to your beta testers channel${NC}"
    exit 1
fi

TEMPLATE_FILE=".github/templates/discord-prerelease.md"
echo -e "${BLUE}📄 Using template: discord-prerelease.md${NC}\n"

if [ ! -f "$TEMPLATE_FILE" ]; then
    echo -e "${RED}❌ Error: Template file not found: $TEMPLATE_FILE${NC}"
    exit 1
fi

# Read the template
TEMPLATE_CONTENT=$(cat "$TEMPLATE_FILE")

# Read RELEASE_NOTES.md if it exists
if [ -f "RELEASE_NOTES.md" ]; then
    echo -e "${GREEN}✓ Found RELEASE_NOTES.md${NC}"
    
    # Extract English changelog (compact format for Discord)
    CHANGELOG_EN=""

    # Get all bullet points under Bug Fixes section (only top-level bullets with bold titles)
    FIXES=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | \
            sed -n '/### 🐛 Bug Fixes/,/^### /p' | \
            grep -E '^- \*\*' | \
            sed 's/\*\*\(.*\)\*\*.*/• **\1**/g' | \
            head -3)

    if [ -n "$FIXES" ]; then
        CHANGELOG_EN="${FIXES}"
    fi

    # Get features if available (limit to 3)
    FEATURES=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | \
               sed -n '/### ✨/,/^### /p' | \
               grep -E '^- \*\*' | \
               sed 's/\*\*\(.*\)\*\*.*/• **\1**/g' | \
               head -3)

    if [ -n "$FEATURES" ]; then
        if [ -n "$CHANGELOG_EN" ]; then
            CHANGELOG_EN="${CHANGELOG_EN}
${FEATURES}"
        else
            CHANGELOG_EN="${FEATURES}"
        fi
    fi

    # If no changelog found, use a summary message
    if [ -z "$CHANGELOG_EN" ]; then
        CHANGELOG_EN="See full release notes for details."
    fi
    
    # Extract French changelog (compact format for Discord)
    CHANGELOG_FR=""

    # Get all bullet points under Bug Fixes section (only top-level bullets with bold titles)
    FIXES_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | \
               sed -n '/### 🐛 Corrections de [Bb]ugs/,/^### /p' | \
               grep -E '^- \*\*' | \
               sed 's/\*\*\(.*\)\*\*.*/• **\1**/g' | \
               head -3)

    if [ -n "$FIXES_FR" ]; then
        CHANGELOG_FR="${FIXES_FR}"
    fi

    # Get features if available (limit to 3)
    FEATURES_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | \
                  sed -n '/### ✨/,/^### /p' | \
                  grep -E '^- \*\*' | \
                  sed 's/\*\*\(.*\)\*\*.*/• **\1**/g' | \
                  head -3)

    if [ -n "$FEATURES_FR" ]; then
        if [ -n "$CHANGELOG_FR" ]; then
            CHANGELOG_FR="${CHANGELOG_FR}
${FEATURES_FR}"
        else
            CHANGELOG_FR="${FEATURES_FR}"
        fi
    fi

    # If no French changelog found, use English or summary
    if [ -z "$CHANGELOG_FR" ]; then
        if [ -n "$CHANGELOG_EN" ] && [ "$CHANGELOG_EN" != "See full release notes for details." ]; then
            CHANGELOG_FR="$CHANGELOG_EN"
        else
            CHANGELOG_FR="Voir les notes complètes pour les détails."
        fi
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
fi

# Replace placeholders
MESSAGE="$TEMPLATE_CONTENT"
MESSAGE="${MESSAGE//\{\{VERSION\}\}/$VERSION}"
MESSAGE="${MESSAGE//\{\{RELEASE_URL\}\}/$RELEASE_URL}"
MESSAGE="${MESSAGE//\{\{CHANGELOG_EN\}\}/$CHANGELOG_EN}"
MESSAGE="${MESSAGE//\{\{CHANGELOG_FR\}\}/$CHANGELOG_FR}"

send_to_discord
