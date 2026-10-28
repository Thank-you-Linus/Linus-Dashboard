#!/bin/bash
# Simulate GitHub Actions CI/CD workflows locally
# This script reproduces the exact checks that run in CI

set -e  # Exit on first error

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track failures
FAILURES=0
TOTAL_CHECKS=0

# Helper function to run a check
run_check() {
    local check_name="$1"
    local command="$2"
    
    TOTAL_CHECKS=$((TOTAL_CHECKS + 1))
    echo ""
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}[CHECK $TOTAL_CHECKS] $check_name${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    if eval "$command"; then
        echo -e "${GREEN}✅ PASSED${NC}"
        return 0
    else
        echo -e "${RED}❌ FAILED${NC}"
        FAILURES=$((FAILURES + 1))
        return 1
    fi
}

# Print header
echo -e "${BLUE}"
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                   Local CI/CD Simulation                       ║"
echo "║          Reproduces GitHub Actions workflows locally           ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo -e "${NC}"

# Determine which workflow to simulate
WORKFLOW="${1:-all}"

case "$WORKFLOW" in
    "main-check"|"main"|"ci")
        echo -e "${YELLOW}🔄 Simulating: Main Branch Check workflow${NC}"
        echo -e "${YELLOW}   (Runs on push to main branch)${NC}"
        ;;
    "beta-release"|"beta")
        echo -e "${YELLOW}🔄 Simulating: Beta Release (manual) button checks${NC}"
        echo -e "${YELLOW}   (Lint, type check, build and smoke tests run by beta-release.yml)${NC}"
        ;;
    "stable-release"|"stable")
        echo -e "${YELLOW}🔄 Simulating: Stable Release (manual) button checks${NC}"
        echo -e "${YELLOW}   (Lint, type check, build and smoke tests run by stable-release.yml)${NC}"
        ;;
    "all")
        echo -e "${YELLOW}🔄 Simulating: All CI checks${NC}"
        echo -e "${YELLOW}   (Python + TypeScript + ESLint + Build + Tests)${NC}"
        ;;
    *)
        echo -e "${RED}❌ Unknown workflow: $WORKFLOW${NC}"
        echo ""
        echo "Usage: $0 [workflow]"
        echo ""
        echo "Available workflows:"
        echo "  main-check    - Main branch push checks (default)"
        echo "  beta-release  - Beta Release (manual) button checks"
        echo "  stable-release - Stable Release (manual) button checks"
        echo "  all           - All checks (comprehensive)"
        echo ""
        echo "Examples:"
        echo "  $0                # Run all checks"
        echo "  $0 main-check     # Simulate main branch check"
        echo "  $0 beta-release   # Simulate the Beta Release button checks"
        exit 1
        ;;
esac

echo ""
echo -e "${YELLOW}📂 Working directory: $(pwd)${NC}"
echo -e "${YELLOW}🌿 Git branch: $(git branch --show-current)${NC}"
echo -e "${YELLOW}📝 Latest commit: $(git log -1 --oneline)${NC}"

# ============================================================================
# JOB 1: Python Linting (Ruff)
# ============================================================================

if [[ "$WORKFLOW" == "main-check" ]] || [[ "$WORKFLOW" == "main" ]] || [[ "$WORKFLOW" == "ci" ]] || [[ "$WORKFLOW" == "all" ]]; then
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                    JOB 1: Python Linting                       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    
    # Check if Python dependencies are installed
    if ! python3 -c "import ruff" 2>/dev/null; then
        echo -e "${YELLOW}⚠️  Installing Python dependencies...${NC}"
        python3 -m pip install -r requirements.txt -q
    fi
    
    run_check "Python: Ruff linting" "python3 -m ruff check ." || true
    run_check "Python: Ruff formatting" "python3 -m ruff format . --check" || true
fi

# ============================================================================
# JOB 2: TypeScript & ESLint
# ============================================================================

if [[ "$WORKFLOW" == "main-check" ]] || [[ "$WORKFLOW" == "main" ]] || [[ "$WORKFLOW" == "ci" ]] || [[ "$WORKFLOW" == "beta-release" ]] || [[ "$WORKFLOW" == "beta" ]] || [[ "$WORKFLOW" == "stable-release" ]] || [[ "$WORKFLOW" == "stable" ]] || [[ "$WORKFLOW" == "all" ]]; then
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                  JOB 2: TypeScript & ESLint                    ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    
    # Check if Node dependencies are installed
    if [ ! -d "node_modules" ]; then
        echo -e "${YELLOW}⚠️  Installing Node.js dependencies...${NC}"
        npm ci
    fi
    
    run_check "ESLint check" "npm run lint:check" || true
    run_check "TypeScript check" "npm run type-check" || true
fi

# ============================================================================
# JOB 3: Build and Smoke Tests
# ============================================================================

if [[ "$WORKFLOW" == "main-check" ]] || [[ "$WORKFLOW" == "main" ]] || [[ "$WORKFLOW" == "ci" ]] || [[ "$WORKFLOW" == "beta-release" ]] || [[ "$WORKFLOW" == "beta" ]] || [[ "$WORKFLOW" == "stable-release" ]] || [[ "$WORKFLOW" == "stable" ]] || [[ "$WORKFLOW" == "all" ]]; then
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║                 JOB 3: Build & Smoke Tests                     ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
    
    run_check "Build project" "npm run build" || true
    
    # Verify build output
    run_check "Verify build output" '
        if [ ! -f "custom_components/linus_dashboard/www/linus-strategy.js" ]; then
            echo "❌ Build output not found"
            exit 1
        fi
        FILE_SIZE=$(stat -c%s "custom_components/linus_dashboard/www/linus-strategy.js" 2>/dev/null || stat -f%z "custom_components/linus_dashboard/www/linus-strategy.js" 2>/dev/null)
        echo "✅ Build output verified ($FILE_SIZE bytes)"
    ' || true
    
    run_check "Smoke tests" "npm run test:smoke" || true
fi

# ============================================================================
# Summary
# ============================================================================

echo ""
echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║                         Summary                                ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}"
echo ""

if [ $FAILURES -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed! ($TOTAL_CHECKS/$TOTAL_CHECKS)${NC}"
    echo ""
    echo -e "${GREEN}🎉 Your code is ready for CI/CD!${NC}"
    echo ""
    exit 0
else
    echo -e "${RED}❌ $FAILURES check(s) failed out of $TOTAL_CHECKS${NC}"
    echo ""
    echo -e "${YELLOW}💡 Quick fixes:${NC}"
    echo ""
    echo -e "${YELLOW}  For ESLint issues:${NC}"
    echo "    npm run lint           # Auto-fix most issues"
    echo "    npm run lint:check     # Check remaining issues"
    echo ""
    echo -e "${YELLOW}  For TypeScript issues:${NC}"
    echo "    npm run type-check     # See all type errors"
    echo "    # Fix manually in your code editor"
    echo ""
    echo -e "${YELLOW}  For Python issues:${NC}"
    echo "    python3 -m ruff check . --fix    # Auto-fix"
    echo "    python3 -m ruff format .         # Format code"
    echo ""
    echo -e "${YELLOW}  For build issues:${NC}"
    echo "    npm run build          # Check build errors"
    echo "    npm run build:dev      # Build with dev config"
    echo ""
    echo -e "${YELLOW}  Re-run this script after fixes:${NC}"
    echo "    bash scripts/ci-local.sh"
    echo ""
    exit 1
fi
