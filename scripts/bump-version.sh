#!/usr/bin/env bash
#
# Bump version across all project files
# Usage: 
#   npm run bump:beta    -> 1.3.0 -> 1.3.1-beta.1
#   npm run bump:alpha   -> 1.3.0 -> 1.3.1-alpha.1
#   npm run bump:release -> 1.3.0-beta.1 -> 1.3.0
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

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")
echo -e "${BLUE}📦 Current version: ${CURRENT_VERSION}${NC}"

# Calculate new version based on bump type
if [ "$BUMP_TYPE" = "release" ]; then
    # Remove any pre-release suffix (e.g., 1.3.1-beta.1 -> 1.3.1)
    NEW_VERSION=$(echo "$CURRENT_VERSION" | sed 's/-.*$//')
    
    # If already a release version, bump patch
    if [[ ! "$CURRENT_VERSION" =~ (alpha|beta) ]]; then
        # Bump patch version
        IFS='.' read -ra VERSION_PARTS <<< "$NEW_VERSION"
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
echo -e "${YELLOW}This will update version in:${NC}"
echo "  - package.json"
echo "  - package-lock.json"
echo "  - custom_components/linus_dashboard/manifest.json"
echo "  - custom_components/linus_dashboard/const.py"
echo "  - src/linus-strategy.ts"
echo ""
read -p "Continue? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Aborted${NC}"
    exit 1
fi

echo -e "${BLUE}📝 Updating version files...${NC}\n"

# Update package.json
echo "  ✓ package.json"
node -e "
const fs = require('fs');
const pkg = require('./package.json');
pkg.version = '$NEW_VERSION';
fs.writeFileSync('./package.json', JSON.stringify(pkg, null, 2) + '\n');
"

# Update package-lock.json if it exists
if [ -f "package-lock.json" ]; then
    echo "  ✓ package-lock.json"
    node -e "
const fs = require('fs');
const lock = require('./package-lock.json');
lock.version = '$NEW_VERSION';
if (lock.packages && lock.packages['']) {
    lock.packages[''].version = '$NEW_VERSION';
}
fs.writeFileSync('./package-lock.json', JSON.stringify(lock, null, 2) + '\n');
"
fi

# Update manifest.json
echo "  ✓ custom_components/linus_dashboard/manifest.json"
node -e "
const fs = require('fs');
const manifest = require('./custom_components/linus_dashboard/manifest.json');
manifest.version = '$NEW_VERSION';
fs.writeFileSync('./custom_components/linus_dashboard/manifest.json', JSON.stringify(manifest, null, 2) + '\n');
"

# Update const.py
echo "  ✓ custom_components/linus_dashboard/const.py"
sed -i "s/^VERSION = .*/VERSION = \"$NEW_VERSION\"/" custom_components/linus_dashboard/const.py

# Update linus-strategy.ts
echo "  ✓ src/linus-strategy.ts"
sed -i "s/Linus Dashboard v[0-9.a-z-]*/Linus Dashboard v$NEW_VERSION/" src/linus-strategy.ts

echo ""
echo -e "${GREEN}✅ Version bumped successfully!${NC}\n"

# Git operations
echo -e "${BLUE}📋 Git operations:${NC}"

# Stage changes
git add package.json package-lock.json custom_components/linus_dashboard/manifest.json custom_components/linus_dashboard/const.py src/linus-strategy.ts

# Commit
COMMIT_MSG="chore: Bump version to ${NEW_VERSION}"
echo -e "  ✓ Committing: ${COMMIT_MSG}"
git commit -m "$COMMIT_MSG"

# Create tag
TAG_NAME="$NEW_VERSION"
echo -e "  ✓ Creating tag: ${TAG_NAME}"
git tag -a "$TAG_NAME" -m "Release $NEW_VERSION"

echo ""
echo -e "${GREEN}✅ Done!${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
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
