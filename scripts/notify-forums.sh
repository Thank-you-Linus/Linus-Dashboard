#!/bin/bash

# Notify Forums Script
# This script prepares forum notifications but does NOT post them automatically
# Forums require manual posting due to their authentication requirements
# 
# Usage: ./scripts/notify-forums.sh <release-type> <version> <release-url>
# Example: ./scripts/notify-forums.sh release 2.0.0 https://github.com/.../releases/tag/2.0.0

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Check arguments
if [ $# -lt 3 ]; then
    print_warning "Usage: $0 <release-type> <version> <release-url>"
    echo "Example: $0 release 2.0.0 https://github.com/.../releases/tag/2.0.0"
    exit 1
fi

RELEASE_TYPE="$1"
VERSION="$2"
RELEASE_URL="$3"

print_info "Preparing forum notifications for $RELEASE_TYPE $VERSION"
echo ""

# Only send for stable releases (not beta/alpha)
if [[ "$RELEASE_TYPE" != "release" ]]; then
    print_warning "Forum notifications are only sent for stable releases"
    print_info "Current type: $RELEASE_TYPE"
    print_info "Skipping forum notifications"
    exit 0
fi

# Read RELEASE_NOTES.md if available
if [ ! -f "RELEASE_NOTES.md" ]; then
    print_warning "RELEASE_NOTES.md not found"
    print_info "Generating from git log..."
    
    LAST_TAG=$(git describe --tags --abbrev=0 HEAD^ 2>/dev/null || echo "")
    if [ -z "$LAST_TAG" ]; then
        CHANGELOG="- Recent updates\n$(git log --pretty=format:'- %s' --no-merges -10)"
    else
        CHANGELOG="- Recent updates\n$(git log ${LAST_TAG}..HEAD --pretty=format:'- %s' --no-merges)"
    fi
    
    CHANGELOG_EN="$CHANGELOG"
    CHANGELOG_FR="$CHANGELOG"
else
    print_success "Found RELEASE_NOTES.md"
    
    # Extract English section (only bold features for concise notification)
    CHANGELOG_EN=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | grep -E '^\s*-\s*\*\*' | head -5 || echo "")
    
    # Extract French section (only bold features for concise notification)
    CHANGELOG_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | grep -E '^\s*-\s*\*\*' | head -5 || echo "")
    
    # Fallback if no bold items found
    if [ -z "$CHANGELOG_EN" ]; then
        CHANGELOG_EN=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | grep -E '^\s*-' | head -5 || echo "- See release notes for details")
    fi
    
    if [ -z "$CHANGELOG_FR" ]; then
        CHANGELOG_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | grep -E '^\s*-' | head -5 || echo "- Voir les notes de version pour plus de détails")
    fi
fi

# Generate forum post templates
HA_POST="🎉 **Linus Dashboard $VERSION is now available!**

$CHANGELOG_EN

📥 **Download:** [GitHub Release]($RELEASE_URL)
📚 **Documentation:** [README](https://github.com/Thank-you-Linus/Linus-Dashboard)

Happy automating! 🏠✨"

HACF_POST="🎉 **Linus Dashboard $VERSION est maintenant disponible !**

$CHANGELOG_FR

📥 **Télécharger :** [GitHub Release]($RELEASE_URL)
📚 **Documentation :** [README-fr](https://github.com/Thank-you-Linus/Linus-Dashboard/blob/main/README-fr.md)

Bonne automation ! 🏠✨"

# Save posts to temporary files
HA_FILE="/tmp/linus-dashboard-ha-notification.md"
HACF_FILE="/tmp/linus-dashboard-hacf-notification.md"

echo "$HA_POST" > "$HA_FILE"
echo "$HACF_POST" > "$HACF_FILE"

print_success "Forum notification templates generated"
print_info "English: $HA_FILE"
print_info "French: $HACF_FILE"
echo ""

# Show preview
print_info "Preview (Home Assistant Community - English):"
echo "-------------------------------------------"
cat "$HA_FILE"
echo ""
echo "-------------------------------------------"
echo ""

print_info "Preview (HACF - French):"
echo "-------------------------------------------"
cat "$HACF_FILE"
echo "-------------------------------------------"
echo ""

# Instructions for manual posting
print_warning "Forum notifications require MANUAL posting"
print_info "To post to forums:"
echo ""
echo "1. Home Assistant Community Forum (English):"
echo "   URL: https://community.home-assistant.io/t/linus-dashboard-plug-n-play-magic-dashboard-with-smart-sections-for-rooms-and-devices"
echo "   Content: $HA_FILE"
echo ""
echo "2. HACF Forum (French):"
echo "   URL: https://forum.hacf.fr/t/linus-dashboard-tableau-de-bord-magique-plug-n-play-avec-des-sections-intelligentes-pour-les-pieces-et-les-appareils"
echo "   Content: $HACF_FILE"
echo ""
echo "OR use: npm run forums:open"
echo ""

print_success "Forum notification preparation complete"
