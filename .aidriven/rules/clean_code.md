# 🧹 Clean Code Rules - Linus Dashboard

> **Purpose**: Universal clean code standards for the Linus Dashboard project  
> **Applies to**: TypeScript (frontend) and Python (backend) code in this repository

---

## 🎯 Core Principles

1. **Readability First**: Code is read 10× more than written
2. **Explicit over Implicit**: No magic, no surprises
3. **Single Responsibility**: Each function/class does ONE thing well
4. **DRY (Don't Repeat Yourself)**: Reuse, don't copy-paste
5. **YAGNI (You Aren't Gonna Need It)**: Don't build for imaginary futures

---

## 📝 Naming Conventions

### TypeScript (Frontend)

| Element | Convention | Example |
|---------|-----------|---------|
| **Classes** | `PascalCase` | `LinusStrategy`, `AreaView`, `LightCard` |
| **Functions/Methods** | `camelCase` | `generateDashboard()`, `getCards()` |
| **Variables** | `camelCase` | `entityList`, `currentView` |
| **Constants** | `UPPER_SNAKE_CASE` | `AGGREGATE_DOMAINS`, `DOMAIN` |
| **Interfaces** | `PascalCase` | `CardOptions`, `ViewConfig` |
| **Type Aliases** | `PascalCase` | `ViewType`, `EntityDomain` |
| **Private Methods** | `_camelCase` or `#camelCase` | `_processView()`, `#buildCard()` |

### Python (Backend)

| Element | Convention | Example |
|---------|-----------|---------|
| **Variables** | `snake_case` | `config_entries`, `manifest_version` |
| **Functions** | `snake_case` | `get_version()`, `async_setup_entry()` |
| **Classes** | `PascalCase` | `LinusDashboard`, `ConfigFlow` |
| **Constants** | `UPPER_SNAKE_CASE` | `DOMAIN`, `CONF_WEATHER_ENTITY` |
| **Private** | `_leading_underscore` | `_load_manifest()`, `_validate_config()` |
| **Async Functions** | `async_` prefix | `async_setup()`, `async_unload_entry()` |

---

## 📐 Function Structure

### Maximum Length
- **Target**: 30 lines
- **Hard limit**: 50 lines
- **Solution**: Extract helper functions

### Single Responsibility Principle

❌ **Bad (TypeScript):**
```typescript
function processView(view: LovelaceViewConfig) {
  if (!view.cards) return;
  const filtered = entities.filter(e => e.domain === "light");
  const cards = filtered.map(e => createCard(e));
  saveCards(cards);
}
```

✅ **Good (TypeScript):**
```typescript
function processView(view: LovelaceViewConfig): LovelaceCardConfig[] {
  if (!isValidView(view)) return [];
  const entities = filterLightEntities(view.entities);
  return createLightCards(entities);
}

function isValidView(view: LovelaceViewConfig): boolean {
  return view?.cards !== undefined;
}

function filterLightEntities(entities: Entity[]): Entity[] {
  return entities.filter(e => e.domain === "light");
}

function createLightCards(entities: Entity[]): LovelaceCardConfig[] {
  return entities.map(e => new LightCard().getCard(e));
}
```

### Early Returns (Guard Clauses)

❌ **Bad:**
```typescript
function getCard(entity: Entity): LovelaceCardConfig | null {
  if (entity) {
    if (entity.domain === "light") {
      if (entity.state !== "unavailable") {
        return { type: "light", entity: entity.entity_id };
      }
    }
  }
  return null;
}
```

✅ **Good:**
```typescript
function getCard(entity: Entity): LovelaceCardConfig | null {
  if (!entity) return null;
  if (entity.domain !== "light") return null;
  if (entity.state === "unavailable") return null;
  
  return { type: "light", entity: entity.entity_id };
}
```

---

## 🔒 Type Safety

### TypeScript

Always provide explicit types:

```typescript
// ✅ Function parameters and return types
function generateCards(
  entities: Entity[], 
  options: CardOptions
): LovelaceCardConfig[] {
  return entities.map(e => createCard(e, options));
}

// ✅ Interface definitions
interface CardOptions {
  showIcon: boolean;
  showState: boolean;
  theme?: string; // Optional with ?
}

// ✅ Type aliases for unions
type ViewType = "home" | "area" | "floor" | "domain";
type EntityState = "on" | "off" | "unavailable" | "unknown";

// ✅ Generics when needed
function getEntitiesByDomain<T extends Entity>(
  entities: T[], 
  domain: string
): T[] {
  return entities.filter(e => e.domain === domain);
}

// ❌ Avoid 'any'
function process(data: any) { } // Bad

// ✅ Use 'unknown' if type truly unknown
function process(data: unknown) {
  if (typeof data === "string") {
    // TypeScript knows data is string here
  }
}
```

### Python

Use type hints everywhere:

```python
from typing import Dict, List, Optional, Any
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

# ✅ Function with types
async def async_setup_entry(
    hass: HomeAssistant, 
    entry: ConfigEntry
) -> bool:
    """Set up integration from config entry."""
    config: Dict[str, Any] = entry.data
    return True

# ✅ Optional types
def get_version() -> str:
    """Get version from manifest, returns 'unknown' if not found."""
    try:
        manifest: Dict[str, Any] = _load_manifest()
        return manifest.get("version", "unknown")
    except FileNotFoundError:
        return "unknown"

# ✅ Complex return types
def get_config(entry: ConfigEntry) -> Dict[str, Any]:
    """Extract configuration from entry."""
    return {
        "weather_entity": entry.options.get(CONF_WEATHER_ENTITY),
        "excluded_domains": entry.options.get(CONF_EXCLUDED_DOMAINS, []),
    }
```

---

## 📖 Documentation

### TypeScript (JSDoc)

```typescript
/**
 * Generate a complete dashboard configuration.
 * 
 * Called when a user opens the Linus Dashboard. Automatically creates views 
 * based on areas, floors, and entity domains.
 * 
 * @param info - Dashboard strategy information including hass instance and config
 * @returns Promise resolving to complete Lovelace configuration
 * 
 * @example
 * ```typescript
 * const config = await LinusStrategy.generateDashboard(info);
 * ```
 */
static async generateDashboard(info: generic.DashBoardInfo): Promise<LovelaceConfig> {
  // Implementation
}

/**
 * Create cards for entities in an area.
 * 
 * @param area - Area containing entities to display
 * @param options - Card generation options
 * @returns Array of Lovelace card configurations
 */
private createAreaCards(area: Area, options: CardOptions): LovelaceCardConfig[] {
  // Implementation
}
```

### Python (Docstrings)

```python
async def register_static_paths_and_resources(
    hass: HomeAssistant, js_file: str
) -> None:
    """
    Register static paths and resources for a JavaScript file.

    Registers bundled resources to ensure compatibility, regardless of installation method.
    Implements cache-busting by appending version query parameter to resource URLs.
    
    Args:
        hass: Home Assistant instance
        js_file: JavaScript filename (e.g., "linus-strategy.js")
        
    Example:
        >>> await register_static_paths_and_resources(hass, "linus-strategy.js")
        # Registers: /linus_dashboard_files/www/linus-strategy.js?v=1.3.0
    """
    # Implementation
```

---

## 🚨 Error Handling

### TypeScript

```typescript
// ✅ Specific error handling with logging
async function loadEmbeddedDashboard(path: string): Promise<Dashboard | null> {
  try {
    const response = await fetch(`/api/lovelace/dashboards/${path}`);
    
    if (!response.ok) {
      console.error(`[Linus Dashboard] Failed to load: ${path} - ${response.statusText}`);
      return null;
    }
    
    return await response.json();
  } catch (error) {
    console.error(`[Linus Dashboard] Error loading dashboard: ${path}`, error);
    return null;
  }
}

// ✅ Fallbacks for non-critical failures
function getAreaName(areaId: string): string {
  const area = Helper.getAreas().find(a => a.area_id === areaId);
  return area?.name ?? areaId; // Fallback to ID
}

// ✅ Throw for critical failures
function getRequiredConfig(key: string): string {
  const value = Helper.strategyOptions[key];
  if (!value) {
    throw new Error(`[Linus Dashboard] Required config missing: ${key}`);
  }
  return value;
}
```

### Python

```python
from homeassistant.exceptions import HomeAssistantError
import logging

_LOGGER = logging.getLogger(__name__)

# ✅ Specific exceptions with logging
def get_version() -> str:
    """Get version from manifest.json."""
    manifest_path = Path(__file__).parent / "manifest.json"
    try:
        with manifest_path.open(encoding="utf-8") as f:
            manifest = json.load(f)
            return manifest.get("version", "unknown")
    except FileNotFoundError:
        _LOGGER.error("Manifest not found at %s", manifest_path)
        return "unknown"
    except json.JSONDecodeError:
        _LOGGER.error("Failed to parse manifest.json")
        return "unknown"
    except Exception as err:
        _LOGGER.exception("Unexpected error reading version: %s", err)
        return "unknown"

# ✅ Use HomeAssistantError for user-facing errors
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Linus Dashboard from config entry."""
    try:
        await register_static_paths_and_resources(hass, "linus-strategy.js")
    except Exception as err:
        raise HomeAssistantError(
            f"Failed to register resources: {err}"
        ) from err
    return True
```

---

## 📊 Logging

### TypeScript (Console)

```typescript
// Error: Critical issues
console.error("[Linus Dashboard] Failed to load resource:", error);

// Warning: Non-critical issues, fallback used
console.warn("[Linus Dashboard] Dashboard not found, using default:", path);

// Info: Normal operation milestones
console.log("[Linus Dashboard] Processing extra_views, count:", views.length);

// Debug: Detailed debugging
console.debug("[Linus Dashboard] Filtered entities:", filteredEntities);
```

### Python (Logger)

```python
# Error: Critical issues
_LOGGER.error("Failed to register resource: %s", js_file)

# Warning: Non-critical issues
_LOGGER.warning("File not found: %s - skipping", js_path)

# Info: Normal operation
_LOGGER.info("Setting up Linus Dashboard entry")

# Debug: Detailed debugging (only in debug mode)
_LOGGER.debug("Registered resource: %s (v%s)", url, version)
```

---

## 📦 Import Organization

### TypeScript

```typescript
// 1. External libraries
import merge from "lodash.merge";

// 2. Home Assistant types
import { LovelaceConfig } from "./types/homeassistant/data/lovelace";
import { HassEntity } from "home-assistant-js-websocket";

// 3. Local imports
import { Helper } from "./Helper";
import { AreaView } from "./views/AreaView";
import { getAreaName } from "./utils";
```

### Python

```python
# 1. Standard library
import json
import logging
from pathlib import Path

# 2. Third-party libraries
# (none for Linus Dashboard)

# 3. Home Assistant
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

# 4. Local imports
from custom_components.linus_dashboard import utils
from custom_components.linus_dashboard.const import DOMAIN
```

---

## 🔢 Magic Numbers and Strings

Use named constants:

❌ **Bad:**
```typescript
if (entity.state === "on") {
  entity.brightness = 255;
}
setTimeout(update, 5000);
```

✅ **Good:**
```typescript
const STATE_ON = "on";
const MAX_BRIGHTNESS = 255;
const UPDATE_INTERVAL_MS = 5000;

if (entity.state === STATE_ON) {
  entity.brightness = MAX_BRIGHTNESS;
}
setTimeout(update, UPDATE_INTERVAL_MS);
```

---

## 💬 Comments

Comments should explain **WHY**, not **WHAT**:

❌ **Bad:**
```typescript
// Increment counter
counter++;

// Loop through entities
for (const entity of entities) { }
```

✅ **Good:**
```typescript
// Bump version to force cache invalidation
version++;

// Process in order to maintain view consistency
for (const entity of entities) { }

// Workaround for HA bug #12345: unavailable entities don't emit events
if (entity.state === "unavailable") {
  forceRefresh(entity);
}
```

---

## ✅ Code Review Checklist

Before committing:

- [ ] **Naming**: Follows conventions (camelCase/PascalCase/snake_case)
- [ ] **Functions**: Short (<50 lines), single responsibility
- [ ] **Types**: All parameters and returns typed
- [ ] **Documentation**: JSDoc/docstrings for public APIs
- [ ] **Error Handling**: Specific errors, appropriate logging
- [ ] **Imports**: Organized correctly
- [ ] **Constants**: No magic numbers/strings
- [ ] **Comments**: Explain why, not what
- [ ] **Consistency**: Matches existing code style
- [ ] **Build**: `npm run build` and `npm run type-check` pass
