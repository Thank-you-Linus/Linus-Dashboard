#!/bin/bash

# Generate CHANGELOG.md for HACS (incremental).
#
# Source version = "version" of package.json. Only the section `## [<source>]`
# is written: it is replaced if it exists, otherwise inserted before the first
# `## [` header. Everything else in an existing CHANGELOG.md is copied as is
# (history is frozen). Without CHANGELOG.md, the whole file is built from the
# tags (ascending semver ranges).
#
# Contract: shared/release.md ("Changelog generator contract") of
# Julien-Decoen/sapiens.
#
# Usage: ./scripts/generate-changelog.sh   (run from the repository root)

set -e
export LC_ALL=C

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}" >&2
}

# Output file
OUTPUT_FILE="CHANGELOG.md"
TEMP_FILE=$(mktemp)
SECTION_FILE=$(mktemp)
trap 'rm -f "$TEMP_FILE" "$SECTION_FILE"' EXIT

TAG_RE='^[0-9]+\.[0-9]+\.[0-9]+(-(alpha|beta)\.[0-9]+)?$'

# --- Source version (package.json) -------------------------------------------
if [ ! -f package.json ]; then
    print_error "package.json not found (run from the repository root)"
    exit 1
fi
if command -v node >/dev/null 2>&1; then
    SOURCE=$(node -p "require('./package.json').version" 2>/dev/null || true)
elif command -v jq >/dev/null 2>&1; then
    SOURCE=$(jq -r '.version // empty' package.json 2>/dev/null || true)
else
    SOURCE=$(sed -n 's/^[[:space:]]*"version"[[:space:]]*:[[:space:]]*"\([^"]*\)".*/\1/p' package.json | head -n 1)
fi
if [[ ! "$SOURCE" =~ $TAG_RE ]]; then
    print_error "package.json version '$SOURCE' does not match the tag format X.Y.Z[-alpha.N|-beta.N]"
    exit 1
fi

print_info "Generating CHANGELOG.md section for $SOURCE..."

# --- Tags, in semver order ----------------------------------------------------
# Key sorting a version in semver order: a pre-release is lower than its stable
# release (alpha < beta < stable of the same base).
version_key() {
    local v="$1" base pre a b c tail
    base="${v%%-*}"
    pre="${v#"$base"}"
    IFS=. read -r a b c <<< "$base"
    case "$pre" in
        "")        tail="z.00000000" ;;
        -alpha.*)  tail="a.$(printf '%08d' "$((10#${pre#-alpha.}))")" ;;
        -beta.*)   tail="b.$(printf '%08d' "$((10#${pre#-beta.}))")" ;;
    esac
    printf '%08d.%08d.%08d.%s' "$((10#$a))" "$((10#$b))" "$((10#$c))" "$tail"
}

TAGS=$(git -c versionsort.suffix=- tag -l --sort=v:refname 2>/dev/null | grep -E "$TAG_RE" || true)

SORTED=$(
    { printf '%s\n' $TAGS "$SOURCE"; } | sort -u | while read -r t; do
        [ -n "$t" ] && echo "$(version_key "$t") $t"
    done | sort -u | cut -d' ' -f2
)

tag_exists() {
    git rev-parse -q --verify "refs/tags/$1^{commit}" >/dev/null 2>&1
}

# Greatest non-alpha tag lower than $1 and ancestor of $2 (empty if none).
find_lower() {
    local version="$1" upper="$2" kv kt t
    kv=$(version_key "$version")
    while read -r t; do
        [[ "$t" =~ -alpha\. ]] && continue
        kt=$(version_key "$t")
        [[ "$kt" < "$kv" ]] || continue
        tag_exists "$t" || continue
        if git merge-base --is-ancestor "refs/tags/$t^{commit}" "$upper" >/dev/null 2>&1; then
            echo "$t"
            return 0
        fi
    done < <(printf '%s\n' "$SORTED" | awk '{a[NR]=$0} END {for (i=NR;i>=1;i--) print a[i]}')
    return 0
}

IS_SHALLOW=$(git rev-parse --is-shallow-repository 2>/dev/null || echo false)

# Writes the section of version $1 to stdout.
build_section() {
    local version="$1" upper lower range date log
    local FEATURES FIXES IMPROVEMENTS DOCS OTHER partial=0 any=0

    if tag_exists "$version"; then
        upper="refs/tags/$version^{commit}"
    else
        upper="HEAD"
    fi
    lower=$(find_lower "$version" "$upper")
    if [ -n "$lower" ]; then
        range="refs/tags/$lower^{commit}..$upper"
    else
        range="$upper"
        [ "$IS_SHALLOW" = "true" ] && partial=1
    fi

    date=$(git log -1 --format=%cs "$upper" 2>/dev/null || true)

    echo "## [$version] - $date"
    echo ""

    if [ "$partial" = "1" ]; then
        echo "_Historique partiel : dépôt superficiel (shallow clone), des entrées peuvent manquer._"
        echo ""
    fi

    log=$(git log "$range" --pretty=format:"- %s" --no-merges 2>/dev/null || true)

    FEATURES=$(printf '%s\n' "$log" | grep -i "^- feat\|^- add\|^- new" || true)
    FIXES=$(printf '%s\n' "$log" | grep -i "^- fix\|^- bug\|^- patch" || true)
    IMPROVEMENTS=$(printf '%s\n' "$log" | grep -i "^- improve\|^- enhance\|^- update\|^- refactor" || true)
    DOCS=$(printf '%s\n' "$log" | grep -i "^- doc\|^- readme" || true)
    # Chores (chore/release/bump) are not part of the user-facing changelog
    OTHER=$(printf '%s\n' "$log" | grep -v -i "^- feat\|^- add\|^- new\|^- fix\|^- bug\|^- patch\|^- improve\|^- enhance\|^- update\|^- refactor\|^- doc\|^- readme\|^- chore\|^- release\|^- bump" | grep -v '^$' || true)

    if [ -n "$FEATURES" ]; then
        any=1
        echo "### Added"
        echo ""
        printf '%s\n' "$FEATURES"
        echo ""
    fi

    if [ -n "$FIXES" ]; then
        any=1
        echo "### Fixed"
        echo ""
        printf '%s\n' "$FIXES"
        echo ""
    fi

    if [ -n "$IMPROVEMENTS" ]; then
        any=1
        echo "### Changed"
        echo ""
        printf '%s\n' "$IMPROVEMENTS"
        echo ""
    fi

    if [ -n "$DOCS" ]; then
        any=1
        echo "<details>"
        echo "<summary>Documentation Updates</summary>"
        echo ""
        printf '%s\n' "$DOCS"
        echo ""
        echo "</details>"
        echo ""
    fi

    if [ -n "$OTHER" ]; then
        any=1
        echo "### Other Changes"
        echo ""
        printf '%s\n' "$OTHER"
        echo ""
    fi

    if [ "$any" = "0" ]; then
        echo "- No notable changes"
        echo ""
    fi
}

is_alpha() { [[ "$1" =~ -alpha\. ]]; }

# --- Write the file -----------------------------------------------------------
if [ -f "$OUTPUT_FILE" ]; then
    # Incremental: only the source section changes.
    if is_alpha "$SOURCE"; then
        print_info "Source $SOURCE is an alpha: no section written (alphas are skipped for HACS)"
        cp "$OUTPUT_FILE" "$TEMP_FILE"
    else
        build_section "$SOURCE" > "$SECTION_FILE"

        START=$(awk -v h="## [$SOURCE]" 'index($0, h) == 1 { print NR; exit }' "$OUTPUT_FILE")
        if [ -n "$START" ]; then
            END=$(awk -v s="$START" 'NR > s && (/^## \[/ || /^---$/) { print NR; exit }' "$OUTPUT_FILE")
            TOTAL=$(wc -l < "$OUTPUT_FILE")
            [ -z "$END" ] && END=$((TOTAL + 1))
        else
            END=$(awk '/^## \[/ { print NR; exit }' "$OUTPUT_FILE")
            [ -z "$END" ] && END=$(awk '/^---$/ { print NR; exit }' "$OUTPUT_FILE")
            if [ -z "$END" ]; then
                END=$(( $(wc -l < "$OUTPUT_FILE") + 1 ))
            fi
            START="$END"
        fi
        {
            head -n $((START - 1)) "$OUTPUT_FILE"
            cat "$SECTION_FILE"
            tail -n +"$END" "$OUTPUT_FILE"
        } > "$TEMP_FILE"
    fi
else
    # Full build: header, one section per non-alpha version (ascending ranges), footer.
    cat > "$TEMP_FILE" << 'EOF2'
# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

EOF2
    # Newest first, like the existing file
    while read -r V; do
        [ -z "$V" ] && continue
        is_alpha "$V" && continue
        build_section "$V" >> "$TEMP_FILE"
    done < <(printf '%s\n' "$SORTED" | awk '{a[NR]=$0} END {for (i=NR;i>=1;i--) print a[i]}')

    cat >> "$TEMP_FILE" << 'EOF2'

---

For more details about each release, see the [GitHub Releases](https://github.com/Thank-you-Linus/Linus-Dashboard/releases) page.
EOF2
fi

# Move temp file to final location
cat "$TEMP_FILE" > "$OUTPUT_FILE"

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
