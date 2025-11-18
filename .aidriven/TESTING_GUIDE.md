# 🧪 Linus Dashboard - Testing Guide

> **Purpose**: Complete testing methodology for Linus Dashboard features  
> **Updated**: 2025-11-17

---

## 📋 Table of Contents

1. [Testing Environment Setup](#testing-environment-setup)
2. [Embedded Dashboard Tests](#embedded-dashboard-tests)
3. [Admin-Only Feature Tests](#admin-only-feature-tests)
4. [View Display Logic Tests](#view-display-logic-tests)
5. [Regression Tests](#regression-tests)
6. [Debugging Tools](#debugging-tools)

---

## 🔧 Testing Environment Setup

### Prerequisites

1. **Home Assistant Instance** (version 2023.9+)
2. **Two User Accounts**:
   - Admin user (e.g., `admin`)
   - Regular user (e.g., `user`)
3. **Test Dashboards** configured in HA

### User Setup

```bash
# In Home Assistant UI:
# Settings → People → Add Person
# Name: Test User
# Username: user
# Admin: NO
```

### Build and Deploy

```bash
# 1. Build the project
cd /workspaces/Linus-Dashboard
npm run build

# 2. Check output
ls -lh custom_components/linus_dashboard/www/linus-strategy.js

# 3. Restart Home Assistant
# Developer Tools → YAML → Restart

# 4. Clear browser cache
# Ctrl+Shift+R (hard refresh)
```

---

## 📊 Embedded Dashboard Tests

### Test 1: Basic Dashboard Embedding

**Setup**:
```yaml
# Create a test dashboard: config/dashboards/test-basic.yaml
title: Basic Dashboard
icon: mdi:test-tube
views:
  - title: Test View
    icon: mdi:home
    cards:
      - type: markdown
        content: "Test content"
```

**Linus Dashboard Config**:
```yaml
# In Linus Dashboard config flow → Extra Views:
embedded_dashboards:
  - dashboard: lovelace-test-basic
```

**Expected Result**:
- ✅ Dashboard loads without errors
- ✅ View appears in horizontal menu
- ✅ View icon and title are displayed
- ✅ Cards render correctly

**Console Logs to Check**:
```
[Linus Dashboard] Processing extra_views
[Linus Dashboard] Loading dashboard: "lovelace-test-basic"
[Linus Dashboard] Loaded dashboard "lovelace-test-basic" with 1 view(s)
[Linus Dashboard] Dashboard metadata - Title: "Basic Dashboard", Icon: mdi:test-tube
[Linus Dashboard] Processed 1 views from "lovelace-test-basic" with display logic
[Linus Dashboard] Added 1 view(s) from "lovelace-test-basic"
```

---

### Test 2: Multiple Views Dashboard

**Setup**:
```yaml
# config/dashboards/test-multi.yaml
title: Multi View Dashboard
icon: mdi:view-dashboard
views:
  - title: View 1
    icon: mdi:numeric-1
    cards: [...]
  - title: View 2
    icon: mdi:numeric-2
    cards: [...]
  - title: View 3
    icon: mdi:numeric-3
    cards: [...]
```

**Expected Result**:
- ✅ All 3 views appear in horizontal menu
- ✅ Each view has its own icon
- ✅ Each view has its own title
- ✅ Can navigate between views

---

## 🔐 Admin-Only Feature Tests

### Test 3: Admin-Only Dashboard (Admin User)

**Setup**:
```yaml
# config/dashboards/admin-panel.yaml
title: Admin Panel
icon: mdi:shield-account
require_admin: true  # ← Important!
views:
  - title: System Settings
    icon: mdi:cog
    cards:
      - type: markdown
        content: "Admin-only content"
```

**Test Steps**:
1. Login as **admin** user
2. Navigate to Linus Dashboard
3. Check browser console logs

**Expected Result for Admin**:
- ✅ Dashboard views are visible
- ✅ Can access admin panel
- ✅ Console log: `[Linus Dashboard] ✓ User is admin, showing dashboard "lovelace-admin-panel"`

**Console Logs**:
```
[Linus Dashboard] Dashboard "lovelace-admin-panel" requires admin access (from panel config)
[Linus Dashboard] Dashboard "lovelace-admin-panel" - User: admin, Is Admin: true
[Linus Dashboard] ✓ User is admin, showing dashboard "lovelace-admin-panel"
[Linus Dashboard] Loaded dashboard "lovelace-admin-panel" with 1 view(s)
```

---

### Test 4: Admin-Only Dashboard (Regular User)

**Test Steps**:
1. Logout from admin account
2. Login as **user** (non-admin)
3. Navigate to Linus Dashboard
4. Check browser console logs

**Expected Result for Regular User**:
- ✅ Admin panel views are **NOT visible**
- ✅ No error messages shown to user
- ✅ Other dashboards still work
- ✅ Console log: `[Linus Dashboard] ⊘ Skipping dashboard "lovelace-admin-panel" - requires admin access (user: user)`

**Console Logs**:
```
[Linus Dashboard] Dashboard "lovelace-admin-panel" requires admin access (from panel config)
[Linus Dashboard] Dashboard "lovelace-admin-panel" - User: user, Is Admin: false
[Linus Dashboard] ⊘ Skipping dashboard "lovelace-admin-panel" - requires admin access (user: user)
[Linus Dashboard] Added 0 view(s) from "lovelace-admin-panel"
```

---

## 🎨 View Display Logic Tests

### Test 5: Single View with Default Name

**Setup**:
```yaml
# config/dashboards/test-energy.yaml (simulating Energy dashboard)
title: Energy Dashboard
icon: mdi:lightning-bolt
views:
  - title: Home  # ← Default name
    cards:
      - type: energy-distribution
```

**Expected Result**:
- ✅ Horizontal menu shows **ONLY icon** (mdi:lightning-bolt)
- ✅ **NO title** displayed next to icon
- ✅ Matches Home Assistant's native Energy dashboard behavior

**Console Logs to Check**:
```
[Linus Dashboard] View 0: "Home" - Applying display info: { showIcon: true, icon: "mdi:lightning-bolt", title: undefined }
```

---

### Test 6: Single View with Custom Name

**Setup**:
```yaml
# config/dashboards/test-custom.yaml
title: My Custom Dashboard
icon: mdi:star
views:
  - title: Custom View  # ← NOT "Home"
    icon: mdi:view-dashboard
    cards: [...]
```

**Expected Result**:
- ✅ Horizontal menu shows view icon (mdi:view-dashboard)
- ✅ Title "Custom View" displayed
- ✅ Dashboard icon (mdi:star) appears in sidebar only

**Console Logs to Check**:
```
[Linus Dashboard] View 0: "Custom View" - Applying display info: { showIcon: true, icon: "mdi:view-dashboard", title: "Custom View" }
```

---

## 🔄 Regression Tests

### Test 7: Native Linus Views Still Work

**Test Steps**:
1. Navigate to Linus Dashboard
2. Check default views (Home, Lights, Switches, etc.)

**Expected Result**:
- ✅ Home view loads
- ✅ Domain views (Lights, Switches, Covers, etc.) load
- ✅ Area views load for each room
- ✅ Floor views load if floors configured
- ✅ Cards display correctly

---

### Test 8: Mixed Configuration

**Setup**:
```yaml
# Linus Dashboard config with both embedded and native views
embedded_dashboards:
  - dashboard: lovelace-energy
  - dashboard: lovelace-admin-panel
```

**Expected Result**:
- ✅ Native Linus views appear first
- ✅ Embedded dashboard views appear after
- ✅ All views accessible
- ✅ No duplicate views
- ✅ Admin-only filtering works

---

### Test 9: Error Handling

**Setup**:
```yaml
# Reference a non-existent dashboard
embedded_dashboards:
  - dashboard: lovelace-does-not-exist
```

**Expected Result**:
- ✅ No crash
- ✅ Error logged to console
- ✅ Dashboard continues to load
- ✅ Other views still accessible

**Console Logs**:
```
[Linus Dashboard] Dashboard "lovelace-does-not-exist" not found or has no views
[Linus Dashboard] Error loading dashboard "lovelace-does-not-exist": ...
```

---

## 🛠️ Debugging Tools

### Enable Verbose Logging

Add to browser console:
```javascript
// Enable debug mode
localStorage.setItem('linus_dashboard_debug', 'true');

// Reload page
location.reload();
```

### Check Home Assistant User Info

Open browser console:
```javascript
// Get current user
hass.user
// Output: { name: "user", is_admin: false, ... }

// Check panels
Object.keys(hass.panels)
// Output: ["lovelace", "lovelace-energy", "lovelace-admin-panel", ...]

// Check panel config
hass.panels["lovelace-admin-panel"]
// Output: { config: { require_admin: true, ... } }
```

### View Dashboard Configuration

```javascript
// Fetch dashboard config
hass.callWS({
  type: "lovelace/config",
  url_path: "lovelace-admin-panel"
}).then(config => console.log(config));
```

### Check Embedded Views in Linus Config

```javascript
// Check strategy options
hass.callWS({
  type: "linus_dashboard/get_config"
}).then(config => console.log(config.embedded_dashboards));
```

---

## 📸 Visual Comparison

### Home Assistant Native Energy Dashboard

**Expected Appearance**:
```
┌─────────────────────────────────────┐
│ 🏠 Linus   [⚡]                      │  ← Icon only, no "Home" text
├─────────────────────────────────────┤
│                                     │
│   Energy Distribution Card          │
│                                     │
└─────────────────────────────────────┘
```

### Custom Dashboard with Multiple Views

**Expected Appearance**:
```
┌─────────────────────────────────────┐
│ 🏠 Linus   [🏡 Home] [💡 Lights]    │  ← Icon + Title for each
├─────────────────────────────────────┤
│                                     │
│   Cards...                          │
│                                     │
└─────────────────────────────────────┘
```

---

## ✅ Test Checklist

### Before Release

- [ ] All embedded dashboards load without errors
- [ ] Admin-only filtering works for admin users
- [ ] Admin-only filtering works for non-admin users
- [ ] Single view with default name shows icon only
- [ ] Single view with custom name shows icon + title
- [ ] Multiple views show all icons + titles
- [ ] Native Linus views still work
- [ ] Error handling works for missing dashboards
- [ ] Console logs are informative (no spam)
- [ ] No JavaScript errors in console
- [ ] Performance is acceptable (< 2s load time)

---

## 🐛 Known Issues to Monitor

1. **Panels not available**: If `hass.panels` is undefined, admin check may fail
2. **Dashboard config caching**: Home Assistant may cache dashboard configs
3. **User switching**: May need to clear cache when switching users
4. **Mobile browsers**: Test on iOS Safari and Android Chrome

---

## 📞 Reporting Issues

When reporting bugs, include:

1. **Browser console logs** (full output)
2. **Home Assistant version**
3. **User role** (admin or regular)
4. **Dashboard configuration** (YAML)
5. **Steps to reproduce**
6. **Expected vs actual behavior**
7. **Screenshots** (if visual issue)

---

**This testing guide ensures complete coverage of all Linus Dashboard features and helps catch regressions early.**
