#!/usr/bin/env bash
#
# Analyze commits and determine version bump type
# Returns JSON with commit statistics and analysis
#
# Usage: bash scripts/analyze-commits.sh
#
# Output: JSON object with:
#   - commits: statistics by type
#   - commits_list: array of commit messages
#   - last_tag: last release tag
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$PROJECT_ROOT"

# Get last release tag (exclude beta/alpha tags for stable releases)
LAST_TAG=$(git describe --tags --abbrev=0 2>/dev/null || echo "")

if [ -z "$LAST_TAG" ]; then
    echo '{"error":"No previous tag found","commits":{"total":0,"breaking":0,"feat":0,"fix":0,"refactor":0,"chore":0,"docs":0},"commits_list":[],"last_tag":""}'
    exit 0
fi

# Get commits since last tag
COMMITS=$(git log ${LAST_TAG}..HEAD --pretty=format:"%s" --no-merges 2>/dev/null || echo "")

if [ -z "$COMMITS" ]; then
    echo '{"status":"none","message":"No changes since last release","commits":{"total":0,"breaking":0,"feat":0,"fix":0,"refactor":0,"chore":0,"docs":0},"commits_list":[],"last_tag":"'"$LAST_TAG"'"}'
    exit 0
fi

# Count commit types
BREAKING_COUNT=$(echo "$COMMITS" | grep -ciE "(BREAKING CHANGE|!:)" || echo "0")
FEAT_COUNT=$(echo "$COMMITS" | grep -c "^feat" || echo "0")
FIX_COUNT=$(echo "$COMMITS" | grep -c "^fix" || echo "0")
REFACTOR_COUNT=$(echo "$COMMITS" | grep -c "^refactor" || echo "0")
CHORE_COUNT=$(echo "$COMMITS" | grep -c "^chore" || echo "0")
DOCS_COUNT=$(echo "$COMMITS" | grep -c "^docs" || echo "0")
TOTAL_COUNT=$(echo "$COMMITS" | wc -l | tr -d ' ')

# Escape commits for JSON (replace quotes, newlines, etc.)
COMMITS_JSON=$(echo "$COMMITS" | jq -R -s -c 'split("\n")[:-1]')

# Output in JSON format
cat <<EOF
{
  "status": "ok",
  "commits": {
    "total": $TOTAL_COUNT,
    "breaking": $BREAKING_COUNT,
    "feat": $FEAT_COUNT,
    "fix": $FIX_COUNT,
    "refactor": $REFACTOR_COUNT,
    "chore": $CHORE_COUNT,
    "docs": $DOCS_COUNT
  },
  "commits_list": $COMMITS_JSON,
  "last_tag": "$LAST_TAG"
}
EOF
