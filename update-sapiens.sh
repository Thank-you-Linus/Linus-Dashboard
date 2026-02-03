#!/usr/bin/env bash

# Update SAPIENS core in DevContainer environment
# This script synchronizes the local SAPIENS copy with the source repo

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  SAPIENS Update for DevContainer${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Determine script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

# Source SAPIENS repo path
SAPIENS_SOURCE="../sapiens"

# Check if source exists
if [ ! -d "$SAPIENS_SOURCE" ]; then
    echo -e "${RED}✗ SAPIENS source not found at: $SAPIENS_SOURCE${NC}"
    echo -e "${YELLOW}  Expected structure:${NC}"
    echo "    Linus/"
    echo "    ├── dev/"
    echo "    │   ├── sapiens/        ← Source"
    echo "    │   └── Linus-Dashboard/ ← This project"
    exit 1
fi

echo -e "${BLUE}Source:${NC}  $SAPIENS_SOURCE"
echo -e "${BLUE}Target:${NC}  .sapiens/core/"
echo ""

# Check if .sapiens/core exists and is not a symlink
if [ -L ".sapiens/core" ]; then
    echo -e "${YELLOW}⚠ .sapiens/core is a symlink${NC}"
    echo -e "${YELLOW}  This script is for copied SAPIENS (DevContainer mode)${NC}"
    echo -e "${YELLOW}  If using symlink mode, no update needed${NC}"
    exit 0
fi

if [ ! -d ".sapiens/core" ]; then
    echo -e "${YELLOW}⚠ .sapiens/core does not exist${NC}"
    echo -e "${YELLOW}  Creating initial copy...${NC}"
    mkdir -p .sapiens
fi

# Backup current version (optional)
if [ -d ".sapiens/core" ]; then
    echo -e "${BLUE}Backing up current version...${NC}"
    BACKUP_DIR=".sapiens/core.backup.$(date +%Y%m%d_%H%M%S)"
    mv .sapiens/core "$BACKUP_DIR"
    echo -e "${GREEN}✓ Backup created: $BACKUP_DIR${NC}"
fi

# Copy SAPIENS
echo -e "${BLUE}Copying SAPIENS...${NC}"
cp -r "$SAPIENS_SOURCE" .sapiens/core

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SAPIENS core updated successfully${NC}"
else
    echo -e "${RED}✗ Failed to copy SAPIENS${NC}"

    # Restore backup if exists
    if [ -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}⚠ Restoring backup...${NC}"
        rm -rf .sapiens/core
        mv "$BACKUP_DIR" .sapiens/core
        echo -e "${GREEN}✓ Backup restored${NC}"
    fi

    exit 1
fi

# Verify
echo ""
echo -e "${BLUE}Verification:${NC}"

if [ -d ".sapiens/core/commands" ]; then
    COMMAND_COUNT=$(ls -1 .sapiens/core/commands | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ Commands: $COMMAND_COUNT available${NC}"
fi

if [ -d ".sapiens/core/agents" ]; then
    AGENT_COUNT=$(ls -1 .sapiens/core/agents | wc -l | tr -d ' ')
    echo -e "${GREEN}✓ Agents:   $AGENT_COUNT available${NC}"
fi

echo ""
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}  SAPIENS Update Complete!${NC}"
echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff .sapiens/core"
echo "  2. Test commands: /sapiens/quality-check"
echo "  3. Commit if satisfied: git add .sapiens/core && git commit"
echo ""
