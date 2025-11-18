#!/usr/bin/env bash
#
# Format RELEASE_NOTES.md for GitHub release with collapsible sections
# Usage: ./format-release-notes.sh
#
# This script takes RELEASE_NOTES.md and formats it for GitHub with:
# - Main feature highlights visible
# - Detailed descriptions in collapsible sections
# - Compact bilingual format
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

# Check if RELEASE_NOTES.md exists
if [ ! -f "RELEASE_NOTES.md" ]; then
    echo -e "${RED}❌ Error: RELEASE_NOTES.md not found${NC}"
    exit 1
fi

echo -e "${BLUE}📝 Formatting release notes for GitHub...${NC}\n"

# Create temporary file for formatted notes
TEMP_FILE=$(mktemp)
OUTPUT_FILE="$PROJECT_ROOT/RELEASE_NOTES_FORMATTED.md"

# Extract version info
VERSION=$(node -p "require('./package.json').version" 2>/dev/null || echo "")
IS_BETA=$(echo "$VERSION" | grep -q "beta\|alpha" && echo "true" || echo "false")

# Start with header
if [ "$IS_BETA" = "true" ]; then
    cat > "$TEMP_FILE" << 'EOF'
# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

EOF
else
    cat > "$TEMP_FILE" << 'EOF'
# 🎉 Stable Release

---

EOF
fi

# Extract English features (only bold items)
echo "## ✨ What's New" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

FEATURES_EN=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### ✨ New Features/,/^### /p' | grep -E '^[[:space:]]*-[[:space:]]*\*\*' || echo "")
FEATURES_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### ✨ Nouvelles fonctionnalités/,/^### /p' | grep -E '^[[:space:]]*-[[:space:]]*\*\*' || echo "")

if [ -n "$FEATURES_EN" ]; then
    # Show main features (bold items only)
    echo "$FEATURES_EN" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    
    # Add collapsible section with full details in both languages
    echo "<details>" >> "$TEMP_FILE"
    echo "<summary>📖 <b>View detailed descriptions / Voir les descriptions détaillées</b></summary>" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "### 🇬🇧 English" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    
    # Extract full features section EN
    sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### ✨ New Features/,/^### /p' | tail -n +2 | head -n -1 >> "$TEMP_FILE"
    
    echo "" >> "$TEMP_FILE"
    echo "### 🇫🇷 Français" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    
    # Extract full features section FR
    sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### ✨ Nouvelles fonctionnalités/,/^### /p' | tail -n +2 | head -n -1 >> "$TEMP_FILE"
    
    echo "" >> "$TEMP_FILE"
    echo "</details>" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
else
    echo "_No new features in this release_" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
fi

# Extract bug fixes
echo "## 🐛 Bug Fixes" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

FIXES_EN=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### 🐛 Bug Fixes/,/^### /p' | grep -E '^[[:space:]]*-[[:space:]]*\*\*' || echo "")

if [ -n "$FIXES_EN" ]; then
    echo "$FIXES_EN" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    
    # Check if there are detailed descriptions (non-bold items)
    HAS_DETAILS=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### 🐛 Bug Fixes/,/^### /p' | grep -v -E '^[[:space:]]*-[[:space:]]*\*\*' | grep -E '^[[:space:]]*-' || echo "")
    
    if [ -n "$HAS_DETAILS" ]; then
        echo "<details>" >> "$TEMP_FILE"
        echo "<summary>📖 <b>View details / Voir les détails</b></summary>" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
        echo "### 🇬🇧 English" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
        sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### 🐛 Bug Fixes/,/^### /p' | tail -n +2 | head -n -1 >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
        echo "### 🇫🇷 Français" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
        sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### 🐛 Corrections de bugs/,/^### /p' | tail -n +2 | head -n -1 >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
        echo "</details>" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
    fi
else
    echo "_No bug fixes in this release_" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
fi

# Extract improvements
echo "## ⚡ Improvements" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

IMPROVEMENTS_EN=$(sed -n '/## 🇬🇧 English/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/### ⚡ Improvements/,/^### /p' | grep -E '^[[:space:]]*-' | head -3 || echo "")

if [ -n "$IMPROVEMENTS_EN" ]; then
    echo "$IMPROVEMENTS_EN" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    
    # Add French improvements in collapsible section
    echo "<details>" >> "$TEMP_FILE"
    echo "<summary>🇫🇷 <b>Version française</b></summary>" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    
    IMPROVEMENTS_FR=$(sed -n '/## 🇫🇷 Français/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/### ⚡ Améliorations/,/^### /p' | grep -E '^[[:space:]]*-' | head -3 || echo "")
    echo "$IMPROVEMENTS_FR" >> "$TEMP_FILE"
    
    echo "" >> "$TEMP_FILE"
    echo "</details>" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
else
    echo "_No improvements in this release_" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
fi

# Add testing section for beta releases
if [ "$IS_BETA" = "true" ]; then
    echo "---" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    echo "## 🧪 For Beta Testers" >> "$TEMP_FILE"
    echo "" >> "$TEMP_FILE"
    
    TESTING_EN=$(sed -n '/### 🧪 For Beta Testers/,/## 🇫🇷 Français/p' RELEASE_NOTES.md | sed -n '/What to test:/,/Known Issues:/p' | grep -E '^[[:space:]]*-' | head -5 || echo "")
    
    if [ -n "$TESTING_EN" ]; then
        echo "**What to test:**" >> "$TEMP_FILE"
        echo "$TESTING_EN" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
        
        # French testing notes in collapsible
        echo "<details>" >> "$TEMP_FILE"
        echo "<summary>🇫🇷 <b>Quoi tester</b></summary>" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
        
        TESTING_FR=$(sed -n '/### 🧪 Pour les Beta Testeurs/,/## 📊 Technical Details/p' RELEASE_NOTES.md | sed -n '/Quoi tester/,/Problèmes connus/p' | grep -E '^[[:space:]]*-' | head -5 || echo "")
        echo "$TESTING_FR" >> "$TEMP_FILE"
        
        echo "" >> "$TEMP_FILE"
        echo "</details>" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
    fi
    
    # Known issues
    KNOWN_ISSUES=$(sed -n '/Known Issues:/,/How to Report/p' RELEASE_NOTES.md | grep -E '^[[:space:]]*-' || echo "")
    if [ -n "$KNOWN_ISSUES" ]; then
        echo "**Known Issues:**" >> "$TEMP_FILE"
        echo "$KNOWN_ISSUES" >> "$TEMP_FILE"
        echo "" >> "$TEMP_FILE"
    fi
fi

# Add technical details in collapsible section
echo "---" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"
echo "<details>" >> "$TEMP_FILE"
echo "<summary>📊 <b>Technical Details</b></summary>" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Extract commits
sed -n '/## 📊 Technical Details/,/###/p' RELEASE_NOTES.md | tail -n +2 >> "$TEMP_FILE"

echo "" >> "$TEMP_FILE"
echo "</details>" >> "$TEMP_FILE"
echo "" >> "$TEMP_FILE"

# Add installation section
cat >> "$TEMP_FILE" << 'EOF'

---

## 📦 Installation

**Via HACS (Recommended):**
1. Open HACS → Integrations
2. Search for "Linus Dashboard"
3. Click Update (if already installed) or Install
4. Restart Home Assistant
5. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

**Manual Installation:**
1. Download the `linus_dashboard.zip` file from this release
2. Extract to `custom_components/linus_dashboard/`
3. Restart Home Assistant
4. Clear browser cache

---

## 🔗 Links

- 📖 [Documentation](https://github.com/Thank-you-Linus/Linus-Dashboard)
- 🐛 [Report Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)
- 💬 [Discord Community](https://discord.gg/your-discord-link)

EOF

# Move temp file to output
mv "$TEMP_FILE" "$OUTPUT_FILE"

echo -e "${GREEN}✅ Formatted release notes created!${NC}"
echo -e "${BLUE}📄 File: ${OUTPUT_FILE}${NC}\n"
echo -e "${YELLOW}💡 This file will be used for GitHub release${NC}"
