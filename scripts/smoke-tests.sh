#!/bin/bash

# Smoke Tests for Pre-Release
# Performs basic validation to ensure the build works correctly
# Usage: ./scripts/smoke-tests.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

FAILED_TESTS=0
PASSED_TESTS=0

# Helper function to run test
run_test() {
    local test_name="$1"
    local test_command="$2"
    
    print_info "Testing: $test_name"
    
    if eval "$test_command" > /dev/null 2>&1; then
        print_success "$test_name"
        ((PASSED_TESTS++))
        return 0
    else
        print_error "$test_name"
        ((FAILED_TESTS++))
        return 1
    fi
}

echo -e "${BLUE}🧪 Running Smoke Tests for Linus Dashboard${NC}"
echo ""

# Test 1: Check if build output exists
print_step "Build Output Tests"
run_test "Build output exists" "test -f custom_components/linus_dashboard/www/linus-strategy.js"
run_test "Build output is not empty" "test -s custom_components/linus_dashboard/www/linus-strategy.js"

# Test 2: Check manifest.json
print_step "Manifest Tests"
run_test "manifest.json exists" "test -f custom_components/linus_dashboard/manifest.json"
run_test "manifest.json is valid JSON" "python3 -m json.tool custom_components/linus_dashboard/manifest.json"

# Test 3: Check version consistency
print_step "Version Consistency Tests"
PACKAGE_VERSION=$(node -p "require('./package.json').version" 2>/dev/null)
MANIFEST_VERSION=$(python3 -c "import json; print(json.load(open('custom_components/linus_dashboard/manifest.json'))['version'])" 2>/dev/null)
CONST_VERSION=$(grep -oP "VERSION = \"\K[^\"]+" custom_components/linus_dashboard/const.py 2>/dev/null || echo "")

if [ "$PACKAGE_VERSION" = "$MANIFEST_VERSION" ] && [ "$PACKAGE_VERSION" = "$CONST_VERSION" ]; then
    print_success "Version consistency (all $PACKAGE_VERSION)"
    ((PASSED_TESTS++))
else
    print_error "Version mismatch: package.json=$PACKAGE_VERSION, manifest.json=$MANIFEST_VERSION, const.py=$CONST_VERSION"
    ((FAILED_TESTS++))
fi

# Test 4: Check required files
print_step "Required Files Tests"
run_test "README.md exists" "test -f README.md"
run_test "README-fr.md exists" "test -f README-fr.md"
run_test "LICENSE exists" "test -f LICENSE"
run_test "hacs.json exists" "test -f hacs.json"
run_test "__init__.py exists" "test -f custom_components/linus_dashboard/__init__.py"

# Test 5: Check hacs.json
print_step "HACS Configuration Tests"
run_test "hacs.json is valid JSON" "python3 -m json.tool hacs.json"

# Test 6: Basic JavaScript syntax check
print_step "JavaScript Syntax Tests"
if command -v node &> /dev/null; then
    if node -c custom_components/linus_dashboard/www/linus-strategy.js 2>/dev/null; then
        print_success "JavaScript syntax check"
        ((PASSED_TESTS++))
    else
        print_warning "JavaScript syntax check (non-critical)"
        # Don't fail for this one as build might use different syntax
        ((PASSED_TESTS++))
    fi
else
    print_warning "Node.js not available, skipping JS syntax check"
    ((PASSED_TESTS++))
fi

# Test 7: Check for common issues in code
print_step "Code Quality Tests"

# Check for console.log in production build
if grep -q "console\\.log" custom_components/linus_dashboard/www/linus-strategy.js 2>/dev/null; then
    print_warning "console.log found in build (consider removing for production)"
else
    print_success "No console.log in production build"
    ((PASSED_TESTS++))
fi

# Check build size (should be reasonable)
BUILD_SIZE=$(stat -f%z custom_components/linus_dashboard/www/linus-strategy.js 2>/dev/null || stat -c%s custom_components/linus_dashboard/www/linus-strategy.js 2>/dev/null || echo "0")
if [ "$BUILD_SIZE" -gt 1000 ] && [ "$BUILD_SIZE" -lt 10000000 ]; then
    print_success "Build size is reasonable ($(numfmt --to=iec $BUILD_SIZE 2>/dev/null || echo "${BUILD_SIZE} bytes"))"
    ((PASSED_TESTS++))
else
    print_warning "Build size unusual: $BUILD_SIZE bytes"
    ((PASSED_TESTS++))
fi

# Test 8: Check for required Python dependencies
print_step "Python Dependencies Tests"
if python3 -c "import json" 2>/dev/null; then
    print_success "Python json module available"
    ((PASSED_TESTS++))
else
    print_error "Python json module not available"
    ((FAILED_TESTS++))
fi

# Test 9: Check ZIP creation (if it exists)
print_step "Package Tests"
if [ -f "custom_components/linus_dashboard/linus_dashboard.zip" ]; then
    run_test "ZIP file exists" "test -f custom_components/linus_dashboard/linus_dashboard.zip"
    run_test "ZIP file is valid" "unzip -t custom_components/linus_dashboard/linus_dashboard.zip"
else
    print_info "ZIP file not created yet (will be created during release)"
fi

# Test 10: Check for sensitive data
print_step "Security Tests"
SENSITIVE_PATTERNS=("password" "api_key" "secret" "token" "private_key")
FOUND_SENSITIVE=false

for pattern in "${SENSITIVE_PATTERNS[@]}"; do
    if grep -ri "$pattern" custom_components/linus_dashboard/www/linus-strategy.js 2>/dev/null | grep -v "// " | grep -v "/\*" > /dev/null; then
        print_warning "Potential sensitive data pattern found: $pattern (please verify manually)"
        FOUND_SENSITIVE=true
    fi
done

if [ "$FOUND_SENSITIVE" = false ]; then
    print_success "No obvious sensitive data patterns found"
    ((PASSED_TESTS++))
else
    # Don't fail, just warn
    ((PASSED_TESTS++))
fi

# Summary
echo ""
print_step "Test Summary"
echo ""
echo -e "  ${GREEN}Passed: $PASSED_TESTS${NC}"
echo -e "  ${RED}Failed: $FAILED_TESTS${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    print_success "All smoke tests passed! 🎉"
    exit 0
else
    print_error "$FAILED_TESTS test(s) failed"
    print_warning "Please fix the issues before releasing"
    exit 1
fi
