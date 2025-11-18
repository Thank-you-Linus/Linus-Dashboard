# 🚀 AI-Driven Development Quick Start - Linus Dashboard

Welcome to the Linus Dashboard project! This guide will help you get started with AI-assisted development.

---

## 📋 What is Linus Dashboard?

Linus Dashboard is a Home Assistant custom integration that automatically creates beautiful, organized dashboards based on your devices and rooms. It's built with:

- **Backend**: Python (Home Assistant integration)
- **Frontend**: TypeScript (Rspack bundler)
- **UI Components**: Mushroom cards, Card Mod, Swipe Card
- **Strategy**: Custom Lovelace strategy for automatic dashboard generation

---

## 🎯 Quick Commands

### Development

```bash
# Frontend development (watch mode)
make dev
npm run build-dev

# Build production bundle
make build
npm run build

# Type checking
npm run type-check
npm run type-check:watch

# Linting
make lint
npm run lint

# Start Home Assistant
make develop
./ha-env/bin/hass -c /config
```

### Testing

```bash
# 1. Build frontend
npm run build

# 2. Start Home Assistant
./ha-env/bin/hass -c /config

# 3. Access dashboard
# http://localhost:8123 (bow-tie icon in sidebar)

# 4. Clear browser cache after updates
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# 5. Check for errors
# Browser console (F12) and HA logs
tail -f /config/home-assistant.log | grep linus_dashboard
```

---

## 🤖 AI-Driven Workflow

### Phase 1: Planning 🧠

```
User: "Claude, load .aidriven/memorybank.md and rules, then create a plan to add support for vacuum robot cards with custom icons"

AI: [Loads context]
    [Analyzes requirements]
    [Generates detailed plan with 5 tasks]
    [Estimates 3 hours]
    
    "Please review this plan before I implement"

User: "Looks good, proceed"
```

### Phase 2: Implementation ⚙️

```
AI: [Implements Task 1: Create VacuumCard.ts]
    ✅ Created src/cards/VacuumCard.ts
    ✅ Added type definitions
    ✅ Implemented getCard() method
    ✅ Build succeeded
    
    [Implements Task 2: Register in VacuumView]
    ✅ Modified src/views/VacuumView.ts
    ✅ Type check passed
    
    ... continues until done
```

### Phase 3: Review & Test 🧪

```
User: "Claude, review these changes using .aidriven/prompts/review.md"

AI: [Checks code quality]
    [Verifies type safety]
    [Confirms build succeeds]
    [Validates against rules]
    
    ✅ All checks passed
    ⚠️ Suggestion: Add JSDoc to new public method

User: [Makes suggested improvements]
    [Tests manually in HA]
    [Commits changes]
```

---

## 📚 Key Files to Know

### For AI Context

- **`.aidriven/memorybank.md`** - Complete project architecture, must read first
- **`.aidriven/AGENTS.md`** - Quick command reference
- **`.aidriven/rules/clean_code.md`** - TypeScript and Python coding standards
- **`.aidriven/rules/homeassistant_integration.md`** - HA-specific patterns

### For Development

- **`src/linus-strategy.ts`** - Main strategy class
- **`src/views/`** - View generators (AreaView, HomeView, etc.)
- **`src/cards/`** - Card generators (LightCard, SwitchCard, etc.)
- **`custom_components/linus_dashboard/__init__.py`** - Backend entry point
- **`custom_components/linus_dashboard/config_flow.py`** - UI configuration

---

## 🎨 Common Tasks

### Adding a New Card Type

1. **Plan**: Ask AI to create plan for new card type
2. **Implement**: 
   - Create `src/cards/NewCard.ts` extending `AbstractCard`
   - Implement `getCard(entity, options)` method
   - Use in relevant view
3. **Build**: `npm run build`
4. **Test**: Restart HA, clear cache, verify in UI

### Adding a Config Option

1. **Plan**: Ask AI to create plan
2. **Implement**:
   - Add constant to `const.py`
   - Update `config_flow.py` schema
   - Include in WebSocket response (`__init__.py`)
   - Access in TypeScript via `Helper.strategyOptions`
3. **Test**: Configure via UI, verify in dashboard

### Debugging Cache Issues

Users report "red error" after update:

1. **Verify cache-busting**: Check resource URL has `?v=1.3.0`
2. **Check version**: Ensure `get_version()` returns correct version
3. **Instruct users**: Clear cache with Ctrl+Shift+R
4. **Update docs**: Add to troubleshooting section

---

## ⚡ Pro Tips

### 1. Always Load Context

❌ "Add a new view"
✅ "Claude, load .aidriven/ context and plan: Add aggregate view for all climate entities grouped by floor"

### 2. Build After Every Change

TypeScript changes require rebuild:
```bash
npm run build  # Always after TypeScript changes
npm run type-check  # Verify no type errors
```

### 3. Clear Cache Always

Frontend updates require cache clear:
- Ctrl+Shift+R (Windows)
- Cmd+Shift+R (Mac)
- Check DevTools → Network for `?v=X.X.X` parameter

### 4. Test in Real HA

Don't just check build:
1. Build succeeds ✅
2. Restart HA ✅
3. Clear browser cache ✅
4. Test in UI ✅
5. Check console/logs ✅

### 5. Follow Existing Patterns

Look at existing code:
- Views: See `AreaView.ts` or `HomeView.ts`
- Cards: See `LightCard.ts` or `SwitchCard.ts`
- Backend: See `__init__.py` patterns

---

## 🐛 Common Issues

### Build Fails

```bash
npm run type-check  # Find type errors
npm run lint:check  # Find linting issues
rm -rf custom_components/linus_dashboard/www/*.js  # Clean build
npm run build  # Rebuild
```

### Frontend Not Updating

1. Rebuild: `npm run build`
2. Restart HA: `pkill -f hass && ./ha-env/bin/hass -c /config`
3. Hard refresh browser: `Ctrl+Shift+R`
4. Check version in DevTools Network tab

### Dashboard Not Appearing

1. Check integration is loaded: `grep "Setting up Linus Dashboard" /config/home-assistant.log`
2. Check panel registration: Look for "Registered WebSocket command"
3. Verify YAML file exists: `ls custom_components/linus_dashboard/lovelace/ui-lovelace.yaml`
4. Restart Home Assistant

---

## 📖 Learning Resources

### For AI Agents

Start with these files in order:
1. `.aidriven/README.md` - Workflow overview
2. `.aidriven/memorybank.md` - Project architecture (MUST READ)
3. `.aidriven/AGENTS.md` - Command reference
4. `.aidriven/rules/*.md` - Coding standards

### For Developers

1. Main README.md - User documentation
2. `src/` directory - TypeScript source code
3. `custom_components/linus_dashboard/` - Python backend
4. Mushroom cards docs - UI components

---

## ✅ Success Checklist

Before considering work complete:

- [ ] **Plan approved** - User reviewed and approved
- [ ] **Code written** - Follows all rules from `.aidriven/rules/`
- [ ] **Types added** - All parameters and returns typed
- [ ] **Docs added** - JSDoc/docstrings for public APIs
- [ ] **Build succeeds** - `npm run build`, `type-check`, `lint` pass
- [ ] **Manual testing** - Verified in running HA instance
- [ ] **No errors** - Browser console and HA logs clean
- [ ] **Cache handled** - Version parameter on resources
- [ ] **Memory updated** - `.aidriven/memorybank.md` reflects changes (if needed)

---

## 🎯 Getting Started Checklist

For new AI agents or developers:

1. [ ] Read `.aidriven/README.md` (this file)
2. [ ] Read `.aidriven/memorybank.md` (architecture)
3. [ ] Scan `.aidriven/rules/*.md` (standards)
4. [ ] Build project: `npm run build`
5. [ ] Start HA: `./ha-env/bin/hass -c /config`
6. [ ] Access dashboard: http://localhost:8123
7. [ ] Review existing code in `src/` and `custom_components/`
8. [ ] Ready to work! 🚀

---

**Questions? Check `.aidriven/README.md` for detailed workflow, or ask the AI to explain specific concepts!**
