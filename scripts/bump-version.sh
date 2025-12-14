#!/usr/bin/env bash
#
# Smart Version Bump Script
# -------------------------
# Uses package.json as the single source of truth for versioning.
# Other files (const.py, linus-strategy.ts) read version dynamically.
#
# Usage: 
#   npm run bump:beta    -> 1.3.0 -> 1.3.1-beta.1
#   npm run bump:alpha   -> 1.3.0 -> 1.3.1-alpha.1
#   npm run bump:release -> 1.3.0-beta.1 -> 1.3.0
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Colors for better UX
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the bump type from argument
BUMP_TYPE="${1:-}"

if [ -z "$BUMP_TYPE" ]; then
    echo -e "${RED}❌ Error: Bump type is required${NC}"
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  npm run bump:beta     # Bump to next beta version"
    echo -e "  npm run bump:alpha    # Bump to next alpha version"
    echo -e "  npm run bump:release  # Bump to stable release"
    exit 1
fi

# Validate bump type
if [[ ! "$BUMP_TYPE" =~ ^(beta|alpha|release)$ ]]; then
    echo -e "${RED}❌ Error: Invalid bump type '$BUMP_TYPE'${NC}"
    echo -e "${YELLOW}Valid types: beta, alpha, release${NC}"
    exit 1
fi

# Get current version from package.json (single source of truth)
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"

# Calculate new version based on bump type
if [ "$BUMP_TYPE" = "release" ]; then
    # Remove any pre-release suffix (e.g., 1.3.1-beta.1 -> 1.3.1)
    NEW_VERSION=$(echo "$CURRENT_VERSION" | sed 's/-.*$//')
    
    # If already a release version, bump patch
    if [[ ! "$CURRENT_VERSION" =~ (alpha|beta) ]]; then
        # Use npm version to bump patch
        NEW_VERSION=$(npm version patch --no-git-tag-version | sed 's/^v//')
        npm version "$CURRENT_VERSION" --no-git-tag-version > /dev/null 2>&1 # Reset
        IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
        MAJOR="${VERSION_PARTS[0]}"
        MINOR="${VERSION_PARTS[1]}"
        PATCH="${VERSION_PARTS[2]}"
        PATCH=$((PATCH + 1))
        NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}"
    fi
else
    # For beta/alpha, bump patch and add/increment pre-release
    BASE_VERSION=$(echo "$CURRENT_VERSION" | sed 's/-.*$//')
    
    # If current version has no pre-release, bump patch
    if [[ ! "$CURRENT_VERSION" =~ (alpha|beta) ]]; then
        IFS='.' read -ra VERSION_PARTS <<< "$BASE_VERSION"
        MAJOR="${VERSION_PARTS[0]}"
        MINOR="${VERSION_PARTS[1]}"
        PATCH="${VERSION_PARTS[2]}"
        PATCH=$((PATCH + 1))
        NEW_VERSION="${MAJOR}.${MINOR}.${PATCH}-${BUMP_TYPE}.1"
    else
        # If same pre-release type, increment counter
        if [[ "$CURRENT_VERSION" =~ ${BUMP_TYPE}\.([0-9]+)$ ]]; then
            PRERELEASE_NUM="${BASH_REMATCH[1]}"
            PRERELEASE_NUM=$((PRERELEASE_NUM + 1))
            NEW_VERSION="${BASE_VERSION}-${BUMP_TYPE}.${PRERELEASE_NUM}"
        else
            # Different pre-release type, start at .1
            NEW_VERSION="${BASE_VERSION}-${BUMP_TYPE}.1"
        fi
    fi
fi

echo -e "${GREEN}🎉 New version: ${NEW_VERSION}${NC}\n"

# Confirmation
echo -e "${YELLOW}📋 Smart Version Management:${NC}"
echo -e "  ${GREEN}✓${NC} package.json & package-lock.json (via npm version)"
echo -e "  ${GREEN}✓${NC} manifest.json (synced by script)"
echo -e "  ${GREEN}✓${NC} Build project (injects __VERSION__ into compiled files)"
echo -e "  ${BLUE}ℹ${NC} const.py (reads package.json dynamically at runtime)"
echo -e "  ${BLUE}ℹ${NC} linus-strategy.ts (uses __VERSION__ injected at build time)"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Aborted${NC}"
    exit 1
fi

echo -e "${BLUE}📝 Updating version files...${NC}\n"

# Step 1: Update package.json and package-lock.json using npm (standard tool)
echo -e "  ${GREEN}✓${NC} Using npm version to update package.json & package-lock.json"
npm version "$NEW_VERSION" --no-git-tag-version > /dev/null 2>&1

# Step 2: Sync manifest.json
echo -e "  ${GREEN}✓${NC} Syncing manifest.json"
node -e "
const fs = require('fs');
const manifest = require('./custom_components/linus_dashboard/manifest.json');
manifest.version = '$NEW_VERSION';
fs.writeFileSync('./custom_components/linus_dashboard/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
"

# Step 3: Build the project to inject __VERSION__ into compiled files
echo -e "  ${GREEN}✓${NC} Building project (injecting __VERSION__)"
npm run build > /dev/null 2>&1

echo ""
echo -e "${BLUE}🔍 Verifying version consistency...${NC}\n"

# Verification: Check that all versions match
PKG_VERSION=$(node -p "require('./package.json').version")
MANIFEST_VERSION=$(node -p "require('./custom_components/linus_dashboard/manifest.json').version")

# Check Python version by running const.py
PYTHON_VERSION=$(cd custom_components/linus_dashboard && python3 -c "from const import VERSION; print(VERSION)" 2>/dev/null || echo "unknown")

# Check compiled JS for version string
JS_VERSION=$(grep -oP "version\s*=\s*\"\K[^\"]*" custom_components/linus_dashboard/www/linus-strategy.js | head -1 || echo "unknown")

echo -e "  package.json:        ${GREEN}${PKG_VERSION}${NC}"
echo -e "  manifest.json:       ${GREEN}${MANIFEST_VERSION}${NC}"
echo -e "  const.py (dynamic):  ${GREEN}${PYTHON_VERSION}${NC}"
echo -e "  linus-strategy.js:   ${GREEN}${JS_VERSION}${NC}"

# Verify all versions match
if [ "$PKG_VERSION" != "$NEW_VERSION" ] || [ "$MANIFEST_VERSION" != "$NEW_VERSION" ]; then
    echo -e "\n${RED}❌ Error: Version mismatch detected!${NC}"
    exit 1
fi

if [ "$PYTHON_VERSION" != "$NEW_VERSION" ] && [ "$PYTHON_VERSION" != "unknown" ]; then
    echo -e "\n${YELLOW}⚠ Warning: Python version mismatch (expected ${NEW_VERSION}, got ${PYTHON_VERSION})${NC}"
    echo -e "${YELLOW}   This might be okay if package.json is not accessible from Python environment${NC}"
fi

if [ "$JS_VERSION" != "$NEW_VERSION" ] && [ "$JS_VERSION" != "unknown" ]; then
    echo -e "\n${RED}❌ Error: Compiled JS version mismatch!${NC}"
    echo -e "${YELLOW}   Try running: npm run build${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}✅ Version consistency verified!${NC}\n"

# Git operations
echo -e "${BLUE}📋 Git operations:${NC}"

# Stage changes (only files that actually change)
git add package.json package-lock.json custom_components/linus_dashboard/manifest.json custom_components/linus_dashboard/www/

# Commit
COMMIT_MSG="chore: Bump version to ${NEW_VERSION}"
echo -e "  ${GREEN}✓${NC} Committing: ${COMMIT_MSG}"
git commit -m "$COMMIT_MSG"

# Create tag
TAG_NAME="$NEW_VERSION"
echo -e "  ${GREEN}✓${NC} Creating tag: ${TAG_NAME}"
git tag -a "$TAG_NAME" -m "Release $NEW_VERSION"

echo ""
echo -e "${GREEN}🎉 Version bumped successfully to ${NEW_VERSION}!${NC}\n"
echo -e "${YELLOW}📚 Next steps:${NC}"
echo -e "  1. Review the changes: ${BLUE}git show${NC}"
echo -e "  2. Push to GitHub: ${BLUE}git push && git push --tags${NC}"
echo -e "  3. GitHub Actions will automatically:"
if [[ "$BUMP_TYPE" =~ (beta|alpha) ]]; then
    echo -e "     - Build the project"
    echo -e "     - Create a pre-release on GitHub"
    echo -e "     - Send notification to Discord (beta testers)"
else
    echo -e "     - Build the project"
    echo -e "     - Create a stable release on GitHub"
    echo -e "     - Send notification to Discord (public announcement)"
    echo -e "  4. Publish to forums: ${BLUE}npm run forums:open${NC}"
fi
echo ""
echo -e "${BLUE}💡 Smart Version Management Info:${NC}"
echo -e "   package.json is the single source of truth"
echo -e "   Python reads it dynamically, TypeScript uses __VERSION__ at build time"
echo -e "   See docs/SMART_VERSION_MANAGEMENT.md for details"
echo ""
