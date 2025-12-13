#!/usr/bin/env bash
#
# One-command script to create a pre-release (alpha or beta)
# Usage: 
#   npm run create:beta   # Create beta pre-release
#   npm run create:alpha  # Create alpha pre-release
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
BOLD='\033[1m'
NC='\033[0m' # No Color

# Get the pre-release type from argument
PRERELEASE_TYPE="${1:-}"

if [ -z "$PRERELEASE_TYPE" ]; then
    echo -e "${RED}❌ Error: Pre-release type is required${NC}"
    echo -e "${YELLOW}Usage:${NC}"
    echo -e "  npm run create:beta   # Create beta pre-release"
    echo -e "  npm run create:alpha  # Create alpha pre-release"
    exit 1
fi

# Validate pre-release type
if [[ ! "$PRERELEASE_TYPE" =~ ^(beta|alpha)$ ]]; then
    echo -e "${RED}❌ Error: Invalid pre-release type '$PRERELEASE_TYPE'${NC}"
    echo -e "${YELLOW}Valid types: beta, alpha${NC}"
    exit 1
fi

echo -e "${BOLD}${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║           🚀 Linus Dashboard Pre-Release Creator         ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Step 1: Check git status
echo -e "${BLUE}📋 Step 1/6: Checking git status...${NC}"
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Error: Working directory is not clean${NC}"
    echo -e "${YELLOW}Please commit or stash your changes first${NC}"
    git status --short
    exit 1
fi
echo -e "${GREEN}✓ Working directory is clean${NC}\n"

# Step 2: Generate release notes
echo -e "${BLUE}📝 Step 2/6: Generating release notes...${NC}"
bash scripts/generate-release-notes.sh

if [ ! -f "RELEASE_NOTES.md" ]; then
    echo -e "${RED}❌ Error: Failed to generate RELEASE_NOTES.md${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Release notes generated${NC}\n"

# Prompt to edit release notes
echo -e "${YELLOW}${BOLD}⚠️  IMPORTANT: Please review and edit RELEASE_NOTES.md${NC}"
echo -e "${YELLOW}   - Add detailed explanations for each change${NC}"
echo -e "${YELLOW}   - Translate to French${NC}"
echo -e "${YELLOW}   - Mark main features with ** for highlighting${NC}"
echo -e "${YELLOW}   - Fill in 'For Beta Testers' sections${NC}"
echo -e "${YELLOW}   - Remove any commits that shouldn't be public${NC}\n"

read -p "Press ENTER when you're done editing RELEASE_NOTES.md..."
echo ""

# Validate release notes were edited
if grep -q "_📝 TODO:" RELEASE_NOTES.md; then
    echo -e "${YELLOW}⚠️  Warning: Found TODO markers in RELEASE_NOTES.md${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi

# Step 3: Format release notes
echo -e "${BLUE}📄 Step 3/6: Formatting release notes for GitHub...${NC}"
bash scripts/format-release-notes.sh
echo -e "${GREEN}✓ Release notes formatted${NC}\n"

# Step 4: Run smoke tests
echo -e "${BLUE}🧪 Step 4/6: Running smoke tests...${NC}"
if ! npm run test:smoke; then
    echo -e "${RED}❌ Smoke tests failed${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Smoke tests passed${NC}\n"

# Step 5: Bump version
echo -e "${BLUE}📦 Step 5/6: Bumping version...${NC}"
bash scripts/bump-version.sh "$PRERELEASE_TYPE"

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✓ Version bumped to ${NEW_VERSION}${NC}\n"

# Step 6: Push to GitHub
echo -e "${BLUE}🚀 Step 6/6: Pushing to GitHub...${NC}"
echo -e "${YELLOW}This will trigger the pre-release workflow automatically${NC}\n"

read -p "Push to GitHub and create pre-release? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Aborted before push${NC}"
    echo -e "${YELLOW}   You can manually push later with:${NC}"
    echo -e "${BLUE}   git push && git push --tags${NC}"
    exit 0
fi

git push && git push --tags

echo -e "\n${GREEN}${BOLD}✅ Success!${NC}\n"
echo -e "${BLUE}📊 Pre-release workflow started${NC}"
echo -e "${BLUE}   Monitor progress: ${NC}https://github.com/Thank-you-Linus/Linus-Dashboard/actions\n"

echo -e "${YELLOW}What happens next (automatically):${NC}"
echo -e "  1. ✅ Build the project"
echo -e "  2. ✅ Run smoke tests"
echo -e "  3. ✅ Create ZIP archive"
echo -e "  4. ✅ Create GitHub pre-release: ${BOLD}${NEW_VERSION}${NC}"
echo -e "  5. ✅ Send Discord notification to beta testers"
echo -e "  6. ✅ Clean up release notes files\n"

echo -e "${GREEN}🎉 Pre-release ${BOLD}${NEW_VERSION}${GREEN} is being created!${NC}\n"
echo -e "${BLUE}View release: ${NC}https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/${NEW_VERSION}\n"
