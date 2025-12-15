#!/bin/bash

# Rollback Release Script
# Usage: ./scripts/rollback-release.sh <version>
# Example: ./scripts/rollback-release.sh 2.0.0-beta.3

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Helper functions
print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_step() {
    echo -e "\n${BLUE}▶ $1${NC}"
}

# Check if version argument is provided
if [ -z "$1" ]; then
    print_error "Version argument is required"
    echo "Usage: $0 <version>"
    echo "Example: $0 2.0.0-beta.3"
    exit 1
fi

VERSION="$1"
TAG="$VERSION"

print_info "🔄 Starting rollback for version: $VERSION"
echo ""

# Step 1: Confirm with user
print_step "Confirmation Required"
echo "This will:"
echo "  1. Delete local tag: $TAG"
echo "  2. Delete remote tag: $TAG"
echo "  3. Delete GitHub release: $TAG"
echo "  4. Revert version changes in files"
echo ""
print_warning "This action cannot be undone automatically!"
echo ""
read -p "Are you sure you want to rollback? (yes/no): " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_info "Rollback cancelled"
    exit 0
fi

echo ""

# Step 2: Delete local tag
print_step "Deleting local tag"
if git tag -l | grep -q "^$TAG$"; then
    git tag -d "$TAG"
    print_success "Local tag deleted: $TAG"
else
    print_warning "Local tag not found: $TAG"
fi

# Step 3: Delete remote tag
print_step "Deleting remote tag"
if git ls-remote --tags origin | grep -q "refs/tags/$TAG$"; then
    git push --delete origin "$TAG" 2>/dev/null || {
        print_warning "Could not delete remote tag. You may need to do this manually:"
        echo "  git push --delete origin $TAG"
    }
    print_success "Remote tag deleted: $TAG"
else
    print_warning "Remote tag not found: $TAG"
fi

# Step 4: Delete GitHub release
print_step "Deleting GitHub release"
if command -v gh &> /dev/null; then
    print_info "Attempting to delete GitHub release..."
    if gh release delete "$TAG" --yes 2>/dev/null; then
        print_success "GitHub release deleted: $TAG"
    else
        print_warning "Could not delete GitHub release automatically"
        print_info "Please delete it manually at:"
        echo "  https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/$TAG"
    fi
else
    print_warning "GitHub CLI (gh) not installed"
    print_info "Please delete the release manually at:"
    echo "  https://github.com/Thank-you-Linus/Linus-Dashboard/releases/tag/$TAG"
fi

# Step 5: Revert version in files
print_step "Reverting version changes"

# Get the previous version from git history
PREVIOUS_VERSION=$(git log --all --grep="Release $VERSION" --format=%H -1 | xargs git log --format=%H -1 --skip=1 | xargs git show:package.json | grep '"version"' | sed 's/.*"version": "\(.*\)".*/\1/')

if [ -z "$PREVIOUS_VERSION" ]; then
    print_warning "Could not determine previous version automatically"
    read -p "Enter the previous version to restore (e.g., 2.0.0-beta.2): " PREVIOUS_VERSION
fi

print_info "Restoring to version: $PREVIOUS_VERSION"

# Revert the version bump commit
RELEASE_COMMIT=$(git log --all --grep="Release $VERSION" --format=%H -1)

if [ -n "$RELEASE_COMMIT" ]; then
    print_info "Reverting commit: $RELEASE_COMMIT"
    git revert --no-commit "$RELEASE_COMMIT"
    git commit -m "chore: rollback release $VERSION"
    print_success "Version changes reverted"
else
    print_warning "Could not find release commit automatically"
    print_info "You may need to manually restore version numbers in:"
    echo "  - package.json"
    echo "  - package-lock.json"
    echo "  - custom_components/linus_dashboard/manifest.json"
    echo "  - custom_components/linus_dashboard/const.py"
    echo "  - src/linus-strategy.ts"
fi

# Step 6: Clean up release notes files
print_step "Cleaning up release notes"
if [ -f "RELEASE_NOTES.md" ]; then
    git rm RELEASE_NOTES.md 2>/dev/null || rm RELEASE_NOTES.md
    print_success "Removed RELEASE_NOTES.md"
fi

# RELEASE_NOTES_FORMATTED.md is no longer used (now using single RELEASE_NOTES.md)

# Step 7: Push changes
print_step "Final Steps"
echo ""
print_warning "Don't forget to push the changes:"
echo "  git push origin main"
echo ""

# Step 8: Summary
print_step "Rollback Summary"
echo "✅ Local tag deleted: $TAG"
echo "✅ Remote tag deleted: $TAG"
echo "✅ GitHub release deleted: $TAG"
echo "✅ Version reverted (if possible)"
echo "✅ Release notes cleaned up"
echo ""
print_success "Rollback completed for version $VERSION"
echo ""
print_info "Next steps:"
echo "1. Push changes: git push origin main"
echo "2. Fix any issues that caused the rollback"
echo "3. Create a new release when ready"
echo ""
