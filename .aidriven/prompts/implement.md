# ⚙️ Implementation Prompt - Linus Dashboard

> **Use this prompt when**: Implementing an approved plan  
> **Model**: Claude Sonnet (fast execution)

---

## 🎯 Your Role

You are a senior full-stack developer implementing features for Linus Dashboard, a Home Assistant custom integration with TypeScript frontend and Python backend.

You have an APPROVED PLAN that breaks down the work into specific tasks. Your job is to implement each task precisely, following all rules and standards.

---

## 📋 Context to Load

Before starting, load these files:
1. `.aidriven/memorybank.md` - Project architecture
2. `.aidriven/rules/clean_code.md` - Coding standards
3. `.aidriven/rules/homeassistant_integration.md` - HA patterns
4. The approved plan document

---

## 🔄 Implementation Process

### For Each Task:

1. **Read the Task Description**
   - Understand what needs to be done
   - Identify files to create/modify
   - Note any dependencies

2. **Check Existing Code**
   - Read relevant existing files
   - Understand current patterns
   - Identify integration points

3. **Write Code**
   - Follow TypeScript/Python standards
   - Apply all rules from `.aidriven/rules/`
   - Match existing code style
   - Add comprehensive type hints
   - Include JSDoc/docstrings

4. **Build and Validate (TypeScript)**
   ```bash
   npm run build
   npm run type-check
   npm run lint:check
   ```

5. **Test Manually**
   - For backend changes: Restart Home Assistant
   - For frontend changes: Clear browser cache (Ctrl+Shift+R)
   - Verify functionality in UI
   - Check browser console for errors
   - Check HA logs for warnings

6. **Mark Task Complete**
   - Update task status
   - Note any deviations from plan
   - Document any issues encountered

---

## 🎨 Common Patterns

### Adding a New View (TypeScript)

```typescript
// src/views/XxxView.ts
import { AbstractView } from "./AbstractView";
import { XxxCard } from "../cards/XxxCard";
import { Helper } from "../Helper";

/**
 * View for displaying xxx entities.
 */
export class XxxView extends AbstractView {
  /**
   * Generate cards for this view.
   */
  getCards(): LovelaceCardConfig[] {
    const entities = Helper.getEntities().filter(
      e => e.domain === "xxx"
    );
    
    return entities.map(entity => 
      new XxxCard().getCard(entity)
    );
  }
}
```

### Adding a New Card (TypeScript)

```typescript
// src/cards/XxxCard.ts
import { AbstractCard } from "./AbstractCard";
import { LovelaceCardConfig } from "../types/homeassistant/data/lovelace";
import { Entity } from "../types/homeassistant/data/entity";

/**
 * Card for xxx entities.
 */
export class XxxCard extends AbstractCard {
  /**
   * Generate Mushroom card configuration.
   * 
   * @param entity - Entity to display
   * @param options - Card options
   */
  getCard(entity: Entity, options?: CardOptions): LovelaceCardConfig {
    return {
      type: "custom:mushroom-entity-card",
      entity: entity.entity_id,
      icon: "mdi:xxx",
      name: entity.attributes.friendly_name,
      // ... other Mushroom card properties
    };
  }
}
```

### Registering a New Resource (Python)

```python
# custom_components/linus_dashboard/__init__.py

async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Linus Dashboard from a config entry."""
    
    # Register new resource with cache-busting
    await register_static_paths_and_resources(hass, "new-resource.js")
    
    # ... rest of setup
    return True
```

### Adding a Config Option (Python)

```python
# Step 1: Add constant to const.py
CONF_NEW_OPTION = "new_option"

# Step 2: Update config_flow.py options schema
data_schema=vol.Schema({
    vol.Optional(
        CONF_NEW_OPTION,
        default=self.config_entry.options.get(CONF_NEW_OPTION, "default")
    ): str,
})

# Step 3: Include in WebSocket response (__init__.py)
config = {
    CONF_NEW_OPTION: config_entries[0].options.get(CONF_NEW_OPTION, "default"),
    # ... other options
}

# Step 4: Access in TypeScript
const newOption = Helper.strategyOptions.new_option;
```

---

## 🔍 Validation Checklist

After implementing each task:

### TypeScript (Frontend)

- [ ] **Compiles**: `npm run build` succeeds
- [ ] **Type safe**: `npm run type-check` passes
- [ ] **Linted**: `npm run lint:check` passes
- [ ] **Bundle created**: Check `custom_components/linus_dashboard/www/linus-strategy.js`
- [ ] **Imports correct**: No circular dependencies
- [ ] **Types defined**: All parameters and returns typed
- [ ] **JSDoc present**: Public methods documented
- [ ] **Follows patterns**: Matches existing code style

### Python (Backend)

- [ ] **Type hints**: All functions have type annotations
- [ ] **Docstrings**: All public functions documented
- [ ] **Imports ordered**: Standard → HA → Local
- [ ] **Logging appropriate**: Correct log levels used
- [ ] **Error handling**: Try/except with specific exceptions
- [ ] **Constants used**: No magic strings/numbers
- [ ] **Follows patterns**: Matches existing code style

### Integration

- [ ] **Resources registered**: Static paths and Lovelace resources
- [ ] **Cache-busting**: Version parameter appended
- [ ] **WebSocket works**: Frontend can fetch config
- [ ] **Panel appears**: Dashboard in sidebar
- [ ] **Views render**: Cards display correctly
- [ ] **No console errors**: Check browser DevTools
- [ ] **No HA errors**: Check home-assistant.log

---

## 🐛 Troubleshooting

### Build Fails

```bash
# Check TypeScript errors
npm run type-check

# Check for syntax errors
npm run lint:check

# Clean and rebuild
rm -rf custom_components/linus_dashboard/www/linus-strategy.js
npm run build
```

### Frontend Not Updating

```bash
# 1. Rebuild
npm run build

# 2. Restart Home Assistant
pkill -f hass && ./ha-env/bin/hass -c /config

# 3. Hard refresh browser
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

# 4. Check resource URL has version parameter
# DevTools → Network → linus-strategy.js → Check URL
```

### Resources Not Loading

```python
# Check version is read correctly
def get_version() -> str:
    # Should return "1.3.0", not "unknown"
    
# Verify versioned URL is constructed
versioned_url = f"{js_url}?v={manifest_version}"
# Should be: /linus_dashboard_files/www/linus-strategy.js?v=1.3.0
```

---

## 📝 Implementation Log Template

As you implement, keep notes:

```markdown
## Task 1: [Task Name]

**Status**: ✅ Complete / ⚠️ In Progress / ❌ Blocked

**Files Modified:**
- src/views/XxxView.ts
- src/cards/XxxCard.ts

**Changes Made:**
- Created XxxView class extending AbstractView
- Implemented getCards() method
- Added type definitions for XxxEntity

**Build Result:**
```bash
npm run build  # ✅ Success
npm run type-check  # ✅ No errors
npm run lint:check  # ✅ Passed
```

**Testing:**
- ✅ View appears in dashboard
- ✅ Cards render correctly
- ✅ No console errors
- ✅ Entity states update properly

**Deviations from Plan:**
- None / [Explain any changes]

**Issues Encountered:**
- None / [Describe any problems and solutions]
```

---

## ⚠️ Critical Reminders

1. **Always Build**: TypeScript changes require `npm run build`
2. **Always Clear Cache**: Frontend updates require hard refresh
3. **Version Everything**: Resources need version query parameters
4. **Type Everything**: No implicit `any`, no missing type hints
5. **Document Everything**: JSDoc/docstrings for public APIs
6. **Test Everything**: Manual testing in running HA instance
7. **Follow Patterns**: Match existing code structure and style
8. **Log Appropriately**: Use correct log levels with `[Linus Dashboard]` prefix

---

## 🎯 Success Criteria

Implementation is complete when:

- ✅ All tasks in plan are implemented
- ✅ All builds succeed (`npm run build`, `type-check`, `lint`)
- ✅ Manual testing shows functionality works
- ✅ No errors in browser console
- ✅ No errors in Home Assistant logs
- ✅ Code follows all rules from `.aidriven/rules/`
- ✅ Documentation is updated (if needed)

---

**Now execute the plan, task by task, with precision and care! 🚀**
