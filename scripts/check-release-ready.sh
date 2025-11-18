#!/usr/bin/env bash
#
# Check if the project is ready for release
# Usage: npm run release:check
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

ERRORS=0
WARNINGS=0

echo -e "${BLUE}🔍 Checking if project is ready for release...${NC}\n"

# Function to print error
print_error() {
    echo -e "${RED}❌ $1${NC}"
    ERRORS=$((ERRORS + 1))
}

# Function to print warning
print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
    WARNINGS=$((WARNINGS + 1))
}

# Function to print success
print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Check 1: Git status is clean
echo -e "${BLUE}📋 Checking git status...${NC}"
if [[ -n $(git status -s) ]]; then
    print_warning "Working directory has uncommitted changes"
    git status -s
else
    print_success "Working directory is clean"
fi
echo ""

# Check 2: On correct branch
echo -e "${BLUE}🌿 Checking git branch...${NC}"
CURRENT_BRANCH=$(git branch --show-current)
if [[ "$CURRENT_BRANCH" != "main" ]] && [[ "$CURRENT_BRANCH" != "master" ]]; then
    print_warning "Not on main/master branch (current: $CURRENT_BRANCH)"
else
    print_success "On main branch"
fi
echo ""

# Check 3: Up to date with remote
echo -e "${BLUE}🔄 Checking if up to date with remote...${NC}"
git fetch origin >/dev/null 2>&1
LOCAL=$(git rev-parse @)
REMOTE=$(git rev-parse @{u} 2>/dev/null || echo "")
if [ -n "$REMOTE" ]; then
    if [ "$LOCAL" != "$REMOTE" ]; then
        print_warning "Branch is not up to date with remote"
        echo "  Run: git pull"
    else
        print_success "Up to date with remote"
    fi
else
    print_warning "No remote tracking branch found"
fi
echo ""

# Check 4: RELEASE_NOTES.md exists (recommended)
echo -e "${BLUE}📝 Checking for RELEASE_NOTES.md...${NC}"
if [ ! -f "RELEASE_NOTES.md" ]; then
    print_warning "RELEASE_NOTES.md not found"
    echo "  Recommendation: Run 'npm run release:notes' to generate it"
else
    print_success "RELEASE_NOTES.md exists"
    
    # Check if it's been edited (not just generated)
    if grep -q "_TODO: Traduire" RELEASE_NOTES.md 2>/dev/null; then
        print_warning "RELEASE_NOTES.md contains TODO markers - please complete translations"
    fi
    
    if grep -q "_No new features_\|_Aucune nouvelle" RELEASE_NOTES.md 2>/dev/null; then
        print_warning "RELEASE_NOTES.md may need manual editing (contains placeholder text)"
    fi
fi
echo ""

# Check 5: Dependencies are installed
echo -e "${BLUE}📦 Checking dependencies...${NC}"
if [ ! -d "node_modules" ]; then
    print_error "node_modules not found"
    echo "  Run: npm install"
else
    print_success "Dependencies installed"
    
    # Check if package-lock.json is up to date
    if [ -f "package-lock.json" ]; then
        if [[ $(find package.json -newer package-lock.json 2>/dev/null) ]]; then
            print_warning "package-lock.json may be out of date"
            echo "  Run: npm install"
        fi
    fi
fi
echo ""

# Check 6: Lint passes
echo -e "${BLUE}🔍 Running linter...${NC}"
if npm run lint:check >/dev/null 2>&1; then
    print_success "Linting passed"
else
    print_error "Linting failed"
    echo "  Run: npm run lint"
fi
echo ""

# Check 7: Type checking passes
echo -e "${BLUE}🔍 Running type check...${NC}"
if npm run type-check >/dev/null 2>&1; then
    print_success "Type checking passed"
else
    print_error "Type checking failed"
    echo "  Run: npm run type-check"
fi
echo ""

# Check 8: Build succeeds
echo -e "${BLUE}🏗️  Running build...${NC}"
if npm run build >/dev/null 2>&1; then
    print_success "Build succeeded"
    
    # Check if build output exists
    if [ -f "custom_components/linus_dashboard/www/linus-strategy.js" ]; then
        print_success "Build output verified"
    else
        print_error "Build output not found"
    fi
else
    print_error "Build failed"
    echo "  Run: npm run build"
fi
echo ""

# Check 9: Version consistency
echo -e "${BLUE}🔢 Checking version consistency...${NC}"
PACKAGE_VERSION=$(node -p "require('./package.json').version")
MANIFEST_VERSION=$(node -p "require('./custom_components/linus_dashboard/manifest.json').version")
CONST_VERSION=$(grep '^VERSION = ' custom_components/linus_dashboard/const.py | sed 's/VERSION = "\(.*\)"/\1/')

echo "  package.json: $PACKAGE_VERSION"
echo "  manifest.json: $MANIFEST_VERSION"
echo "  const.py: $CONST_VERSION"

if [[ "$PACKAGE_VERSION" == "$MANIFEST_VERSION" ]] && [[ "$PACKAGE_VERSION" == "$CONST_VERSION" ]]; then
    print_success "All versions match: $PACKAGE_VERSION"
else
    print_error "Version mismatch detected"
    echo "  Run: npm run bump:beta or npm run bump:release"
fi
echo ""

# Check 10: No FIXME or TODO in code (warning only)
echo -e "${BLUE}🔍 Checking for FIXME/TODO comments...${NC}"
FIXME_COUNT=$(grep -r "FIXME\|TODO" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | wc -l || echo "0")
if [ "$FIXME_COUNT" -gt 0 ]; then
    print_warning "Found $FIXME_COUNT FIXME/TODO comments in source code"
    echo "  Consider addressing these before release"
else
    print_success "No FIXME/TODO comments found"
fi
echo ""

# Summary
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}📊 Summary${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! Project is ready for release.${NC}\n"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. ${YELLOW}npm run bump:beta${NC}    # For beta release"
    echo -e "  2. ${YELLOW}npm run bump:release${NC} # For stable release"
    echo -e "  3. ${YELLOW}git push && git push --tags${NC}"
    echo ""
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $WARNINGS warning(s) found.${NC}"
    echo -e "${YELLOW}You can proceed with release, but consider addressing warnings.${NC}\n"
    echo -e "${BLUE}Next steps:${NC}"
    echo -e "  1. ${YELLOW}npm run bump:beta${NC}    # For beta release"
    echo -e "  2. ${YELLOW}npm run bump:release${NC} # For stable release"
    echo -e "  3. ${YELLOW}git push && git push --tags${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $ERRORS error(s) and $WARNINGS warning(s) found.${NC}"
    echo -e "${RED}Please fix the errors before releasing.${NC}\n"
    exit 1
fi
