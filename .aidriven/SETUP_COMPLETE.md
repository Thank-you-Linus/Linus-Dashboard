# ✅ Linus Dashboard - AI-Driven Setup Complete

> **Date**: November 17, 2025  
> **Status**: ✅ Ready for AI-assisted development

---

## 📋 What Was Done

The `.aidriven/` directory has been completely updated and adapted for the **Linus Dashboard** project. All files now reflect the correct architecture, tech stack, and development practices for this Home Assistant custom integration with TypeScript frontend.

---

## 📂 Files Updated/Created

### Core Documentation

- ✅ **memorybank.md** - Complete project architecture

  - Technology stack (TypeScript, Rspack, Mushroom cards)
  - File structure and key components
  - Data flow diagrams
  - Configuration schema
  - Decision log
  - Known issues

- ✅ **README.md** - AI-driven workflow guide

  - Two-phase development (Planning → Implementation)
  - Best practices for AI collaboration
  - Documentation update rules
  - Quick start commands

- ✅ **AGENTS.md** - Quick command reference

  - Build/lint/test commands (frontend and backend)
  - Testing on Home Assistant guide
  - Code style guidelines
  - Debugging tips
  - Version management

- ✅ **AI_DRIVEN_QUICKSTART.md** - Quick start guide
  - Common tasks
  - Troubleshooting
  - Pro tips
  - Success checklist

### Rules (Coding Standards)

- ✅ **rules/clean_code.md** - Updated for TypeScript + Python

  - Naming conventions for both languages
  - Function structure
  - Type safety (TypeScript and Python)
  - Documentation (JSDoc and docstrings)
  - Error handling
  - Import organization

- ✅ **rules/homeassistant_integration.md** - New HA-specific rules
  - Integration lifecycle (setup, unload)
  - Resource registration with cache-busting
  - WebSocket API patterns
  - Config flow patterns
  - Panel registration
  - Common issues and solutions

### Prompts (AI Workflows)

- ✅ **prompts/implement.md** - Implementation guide
  - Common patterns for views, cards, resources
  - Validation checklist (TypeScript and Python)
  - Troubleshooting guide
  - Implementation log template

### Templates

- ⏳ **templates/plan_template.md** - (Existing, may need update)
- ⏳ **templates/implementation_template.md** - (Existing, may need update)

---

### 1. Technology Stack

- TypeScript frontend (Rspack bundler)
- Python backend (HA integration)
- Automatic dashboard generation
- Mushroom cards UI components

### 2. Architecture Focus

- Dashboard strategy implementation
- View and card generation
- Resource management and cache-busting
- WebSocket API for configuration
- Embedded dashboard support

### 3. Development Workflow

**Added:**

- Frontend build process (`npm run build`)
- Type checking (`npm run type-check`)
- Cache-busting strategies
- Browser testing requirements
- Version synchronization across files

---

## 🚀 Ready to Use

You can now use the AI-driven workflow for Linus Dashboard development:

### For Planning

```
"Claude, load .aidriven/memorybank.md and rules, then create a plan to [feature description]"
```

### For Implementation

```
"Claude, implement the approved plan using .aidriven/prompts/implement.md"
```

### For Debugging

```
"Claude, use .aidriven/prompts/debug.md to investigate this error: [error]"
```

### For Review

```
"Claude, review these changes using .aidriven/prompts/review.md"
```

---

## 📚 What AI Agents Should Know

### Critical Files to Load

1. **`.aidriven/memorybank.md`** - MUST READ FIRST

   - Complete architecture
   - Technology decisions
   - File structure
   - Data flows

2. **`.aidriven/rules/clean_code.md`** - Coding standards

   - TypeScript conventions
   - Python conventions
   - Type safety
   - Documentation

3. **`.aidriven/rules/homeassistant_integration.md`** - HA patterns
   - Integration lifecycle
   - Resource registration
   - Cache-busting
   - WebSocket API

### Critical Knowledge

**Build Process:**

- TypeScript changes require: `npm run build`
- Always run type check: `npm run type-check`
- Always run lint: `npm run lint:check`

**Testing:**

- Build succeeds ✅
- Restart Home Assistant ✅
- Clear browser cache (Ctrl+Shift+R) ✅
- Test in UI ✅
- Check console/logs ✅

**Cache-Busting:**

- Resources MUST have version query parameter
- Example: `/linus_dashboard_files/www/linus-strategy.js?v=1.3.0`
- Version read from `manifest.json` via `get_version()`
- Critical to prevent "red error" issues

**Version Management:**

- Update ALL files when bumping version:
  - `package.json`
  - `manifest.json`
  - `const.py`
- Use: `npm run bump`

---

## 🎯 Development Workflow Summary

1. **Plan** (Claude Opus for deep thinking)

   - Load `.aidriven/` context
   - Analyze requirements
   - Generate detailed plan
   - Get user approval

2. **Implement** (Claude Sonnet for fast execution)

   - Follow approved plan
   - Apply all rules
   - Build and type-check
   - Test manually

3. **Review** (Before commit)
   - Code quality
   - Type safety
   - Build verification
   - Manual testing

---

## ✅ Success Criteria

The `.aidriven/` setup is successful when:

- ✅ AI can understand project architecture from `memorybank.md`
- ✅ AI can follow coding standards from `rules/*.md`
- ✅ AI can execute plans using `prompts/*.md`
- ✅ Builds succeed with proper type checking
- ✅ Integration loads in Home Assistant
- ✅ Dashboard renders correctly in browser
- ✅ Cache-busting prevents update issues

---

## 🔄 Next Steps

### For AI Agents

You're ready to:

1. Receive feature requests
2. Create detailed plans
3. Implement with high quality
4. Test thoroughly
5. Handle issues systematically

### For Developers

You can now:

1. Request AI assistance with confidence
2. Trust generated code follows standards
3. Iterate faster with planning phase
4. Maintain consistent code quality
5. Document decisions automatically

---

## 📞 Support

If you encounter issues:

1. **Check memorybank.md** - Architecture questions
2. **Check AGENTS.md** - Command reference
3. **Check rules/\*.md** - Coding standards
4. **Ask AI** - "Load .aidriven/ context and explain [concept]"

---

**The Linus Dashboard project is now fully equipped for AI-driven development! 🚀🧠**

**Start building with: "Claude, load .aidriven/ context and plan: [your feature idea]"**
