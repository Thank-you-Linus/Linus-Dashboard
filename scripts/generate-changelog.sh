#!/bin/bash

# Generate CHANGELOG.md for HACS
# This creates a changelog in the format expected by HACS
# Usage: ./scripts/generate-changelog.sh

set -e

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Output file
OUTPUT_FILE="CHANGELOG.md"
TEMP_FILE=$(mktemp)

print_info "Generating CHANGELOG.md from git tags..."

# Start the changelog
cat > "$TEMP_FILE" << 'EOF'
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

EOF

# Get all tags sorted by version
TAGS=$(git tag -l --sort=-version:refname | grep -E '^[0-9]+\.[0-9]+\.[0-9]+(-beta\.[0-9]+|-alpha\.[0-9]+)?$')

# If no tags found, create an unreleased section
if [ -z "$TAGS" ]; then
    echo "## [Unreleased]" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "- Initial release" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
else
    # Process each tag
    PREVIOUS_TAG=""
    for TAG in $TAGS; do
        # Skip alpha versions for HACS
        if [[ "$TAG" =~ -alpha\. ]]; then
            continue
        fi
        
        # Get release date
        TAG_DATE=$(git log -1 --format=%ai "$TAG" | cut -d' ' -f1)
        
        # Add version header
        echo "## [$TAG] - $TAG_DATE" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
        
        # Get commits between this tag and previous
        if [ -z "$PREVIOUS_TAG" ]; then
            COMMIT_RANGE="$TAG"
        else
            COMMIT_RANGE="$PREVIOUS_TAG..$TAG"
        fi
        
        # Extract commits and categorize them
        FEATURES=$(git log "$COMMIT_RANGE" --pretty=format:"- %s" --no-merges | grep -i "^- feat\|^- add\|^- new" || true)
        FIXES=$(git log "$COMMIT_RANGE" --pretty=format:"- %s" --no-merges | grep -i "^- fix\|^- bug\|^- patch" || true)
        IMPROVEMENTS=$(git log "$COMMIT_RANGE" --pretty=format:"- %s" --no-merges | grep -i "^- improve\|^- enhance\|^- update\|^- refactor" || true)
        DOCS=$(git log "$COMMIT_RANGE" --pretty=format:"- %s" --no-merges | grep -i "^- doc\|^- readme" || true)
        CHORES=$(git log "$COMMIT_RANGE" --pretty=format:"- %s" --no-merges | grep -i "^- chore\|^- release\|^- bump" || true)
        OTHER=$(git log "$COMMIT_RANGE" --pretty=format:"- %s" --no-merges | grep -v -i "^- feat\|^- add\|^- new\|^- fix\|^- bug\|^- patch\|^- improve\|^- enhance\|^- update\|^- refactor\|^- doc\|^- readme\|^- chore\|^- release\|^- bump" || true)
        
        # Add features
        if [ -n "$FEATURES" ]; then
            echo "### Added" >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
            echo "$FEATURES" | sed 's/^- [Ff]eat[:(].*[):]//; s/^- [Aa]dd[:(].*[):]//; s/^- [Nn]ew[:(].*[):]//; s/^- /- /' >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
        fi
        
        # Add fixes
        if [ -n "$FIXES" ]; then
            echo "### Fixed" >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
            echo "$FIXES" | sed 's/^- [Ff]ix[:(].*[):]//; s/^- [Bb]ug[:(].*[):]//; s/^- [Pp]atch[:(].*[):]//; s/^- /- /' >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
        fi
        
        # Add improvements
        if [ -n "$IMPROVEMENTS" ]; then
            echo "### Changed" >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
            echo "$IMPROVEMENTS" | sed 's/^- [Ii]mprove[:(].*[):]//; s/^- [Ee]nhance[:(].*[):]//; s/^- [Uu]pdate[:(].*[):]//; s/^- [Rr]efactor[:(].*[):]//; s/^- /- /' >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
        fi
        
        # Add documentation changes (optional, usually hidden)
        if [ -n "$DOCS" ]; then
            echo "<details>" >> "$TEMP_FILE"
            echo "<summary>Documentation Updates</summary>" >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
            echo "$DOCS" | sed 's/^- [Dd]oc[:(].*[):]//; s/^- [Rr]eadme[:(].*[):]//; s/^- /- /' >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
            echo "</details>" >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
        fi
        
        # Don't include chores in user-facing changelog
        
        # Add other commits
        if [ -n "$OTHER" ]; then
            echo "### Other Changes" >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
            echo "$OTHER" >> "$TEMP_FILE"
            echo "" >> "$TEMP_FILE"
        fi
        
        # Update previous tag
        PREVIOUS_TAG="$TAG"
    done
fi

# Add footer
cat >> "$TEMP_FILE" << 'EOF'

---

For more details about each release, see the [GitHub Releases](https://github.com/Thank-you-Linus/Linus-Dashboard/releases) page.
EOF

# Move temp file to final location
mv "$TEMP_FILE" "$OUTPUT_FILE"

print_success "CHANGELOG.md generated successfully"
print_info "File: $OUTPUT_FILE"

# Show preview
echo ""
echo "Preview (first 30 lines):"
echo "------------------------"
head -n 30 "$OUTPUT_FILE"
echo "..."
echo ""
print_info "Full changelog saved to: $OUTPUT_FILE"
