#!/usr/bin/env bash
#
# One-command script to create a stable release
# Usage: 
#   npm run create:release
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

echo -e "${BOLD}${BLUE}"
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║                                                           ║"
echo "║          🎉 Linus Dashboard Stable Release Creator       ║"
echo "║                                                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo -e "${NC}\n"

# Get current version
CURRENT_VERSION=$(node -p "require('./package.json').version")

# Step 0: Check if we're on a pre-release version
if [[ ! "$CURRENT_VERSION" =~ (alpha|beta) ]]; then
    echo -e "${YELLOW}⚠️  Current version is ${BOLD}${CURRENT_VERSION}${NC}${YELLOW} (already stable)${NC}"
    echo -e "${YELLOW}   This will create a patch release${NC}\n"
    read -p "Continue? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✓ Current version: ${BOLD}${CURRENT_VERSION}${NC}${GREEN} (pre-release)${NC}"
    echo -e "${GREEN}  Will be converted to stable release${NC}\n"
fi

# Step 1: Check git status
echo -e "${BLUE}📋 Step 1/7: Checking git status...${NC}"
if [[ -n $(git status --porcelain) ]]; then
    echo -e "${RED}❌ Error: Working directory is not clean${NC}"
    echo -e "${YELLOW}Please commit or stash your changes first${NC}"
    git status --short
    exit 1
fi
echo -e "${GREEN}✓ Working directory is clean${NC}\n"

# Step 2: Ensure we're up to date
echo -e "${BLUE}🔄 Step 2/7: Checking remote updates...${NC}"
git fetch
if [[ $(git rev-list HEAD...origin/main --count) -ne 0 ]]; then
    echo -e "${YELLOW}⚠️  Your branch is not up to date with origin/main${NC}"
    read -p "Continue anyway? (y/N) " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${RED}❌ Aborted${NC}"
        exit 1
    fi
fi
echo -e "${GREEN}✓ Branch is up to date${NC}\n"

# Step 3: Check if beta testing was done
echo -e "${YELLOW}${BOLD}⚠️  Before releasing stable version, ensure:${NC}"
echo -e "${YELLOW}   ✓ Beta version has been tested${NC}"
echo -e "${YELLOW}   ✓ No critical bugs reported${NC}"
echo -e "${YELLOW}   ✓ All feedback addressed${NC}"
echo -e "${YELLOW}   ✓ Documentation updated${NC}\n"

read -p "Has beta testing been completed successfully? (y/N) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}❌ Aborted - Complete beta testing first${NC}"
    exit 1
fi

# Step 4: Generate/verify release notes
echo -e "${BLUE}📝 Step 3/7: Checking release notes...${NC}"
if [ ! -f "RELEASE_NOTES.md" ]; then
    echo -e "${YELLOW}⚠️  RELEASE_NOTES.md not found, generating...${NC}"
    bash scripts/generate-release-notes.sh
fi

echo -e "${GREEN}✓ Release notes exist${NC}\n"

# Prompt to edit release notes
echo -e "${YELLOW}${BOLD}⚠️  IMPORTANT: Please review RELEASE_NOTES.md for the stable release${NC}"
echo -e "${YELLOW}   - Ensure all changes are documented${NC}"
echo -e "${YELLOW}   - French translations are complete${NC}"
echo -e "${YELLOW}   - Main features are marked with **${NC}"
echo -e "${YELLOW}   - Remove beta testing sections${NC}\n"

read -p "Press ENTER when you're done reviewing RELEASE_NOTES.md..."
echo ""

# Step 5: Format release notes
echo -e "${BLUE}📄 Step 4/7: Formatting release notes for GitHub...${NC}"
bash scripts/format-release-notes.sh
echo -e "${GREEN}✓ Release notes formatted${NC}\n"

# Step 6: Run smoke tests
echo -e "${BLUE}🧪 Step 5/7: Running smoke tests...${NC}"
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

# Step 7: Bump version
echo -e "${BLUE}📦 Step 6/7: Bumping to stable version...${NC}"
bash scripts/bump-version.sh release

# Get the new version
NEW_VERSION=$(node -p "require('./package.json').version")
echo -e "${GREEN}✓ Version bumped to ${BOLD}${NEW_VERSION}${NC}\n"

# Step 8: Push and create tag
echo -e "${BLUE}🚀 Step 7/7: Pushing to GitHub...${NC}"
echo -e "${YELLOW}This will push the tag and allow you to create the release${NC}\n"

read -p "Push to GitHub? (y/N) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}⚠️  Aborted before push${NC}"
    echo -e "${YELLOW}   You can manually push later with:${NC}"
    echo -e "${BLUE}   git push && git push --tags${NC}"
    exit 0
fi

git push && git push --tags

echo -e "\n${GREEN}${BOLD}✅ Success!${NC}\n"
echo -e "${BLUE}📊 Next step: Create the GitHub Release manually${NC}\n"

echo -e "${YELLOW}${BOLD}Manual Step Required:${NC}"
echo -e "${YELLOW}GitHub Actions will NOT automatically create the stable release.${NC}"
echo -e "${YELLOW}You need to create it manually on GitHub:${NC}\n"

echo -e "${BOLD}${BLUE}1. Go to: ${NC}https://github.com/Thank-you-Linus/Linus-Dashboard/releases/new\n"

echo -e "${BOLD}${BLUE}2. Fill in the form:${NC}"
echo -e "   • Tag: ${BOLD}${NEW_VERSION}${NC}"
echo -e "   • Title: ${BOLD}v${NEW_VERSION}${NC}"
echo -e "   • Description: Copy from ${BOLD}RELEASE_NOTES_FORMATTED.md${NC}"
echo -e "   • ✅ Set as latest release"
echo -e "   • ⬜ Pre-release (leave unchecked)\n"

echo -e "${BOLD}${BLUE}3. Click 'Publish release'${NC}\n"

echo -e "${YELLOW}What happens after publishing (automatically):${NC}"
echo -e "  1. ✅ Build the project"
echo -e "  2. ✅ Run smoke tests"
echo -e "  3. ✅ Create ZIP archive"
echo -e "  4. ✅ Upload ZIP to release"
echo -e "  5. ✅ Send Discord notification (public announcement)"
echo -e "  6. ✅ HACS will detect the new version\n"

echo -e "${BOLD}${BLUE}4. After GitHub release is published, announce on forums:${NC}"
echo -e "   ${BLUE}npm run forums:open${NC}\n"

echo -e "${GREEN}🎉 Stable release ${BOLD}${NEW_VERSION}${GREEN} is ready to publish!${NC}\n"
