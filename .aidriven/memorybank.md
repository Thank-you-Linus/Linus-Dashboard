# 🧠 Linus Dashboard - Memory Bank

> **Last updated**: 2025-11-30  
> **Project**: Home Assistant Custom Integration for Auto-Generated Smart Dashboards

---

## 📋 Project Overview

**Linus Dashboard** is a Home Assistant custom integration that automatically creates beautiful, organized dashboards based on your devices and rooms. It's a "Plug n Play" solution that requires minimal configuration.

### Core Purpose
- Automatically organize devices into smart sections by room
- Create device-centric views (lights, sensors, switches, etc.)
- Provide a sleek, responsive interface that adapts to any screen size
- Support embedded dashboards and custom views
- Integrate with popular Lovelace cards (Mushroom, Card Mod, Swipe Card, etc.)

---

## 🏗️ Architecture

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Integration** | Home Assistant Core 2023.9+ | Custom component framework |
| **Backend** | Python 3.13 | Integration logic, config flow |
| **Frontend** | TypeScript 5.9 | Dashboard generation strategy |
| **Build Tool** | Rspack 1.5 | Fast bundler (Webpack alternative) |
| **Cards** | Mushroom, Card Mod, Swipe Card, Stack-in-Card | UI components |
| **Package Manager** | npm | Dependency management |
| **Development** | VS Code + Devcontainer | Isolated dev environment |

### System Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     HOME ASSISTANT                          │
│                                                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐ │
│  │   Entities   │───▶│    Linus     │◀──▶│   Lovelace   │ │
│  │ (Areas/Rooms)│    │  Dashboard   │    │   Frontend   │ │
│  └──────────────┘    └──────┬───────┘    └──────────────┘ │
│                             │                              │
└─────────────────────────────┼──────────────────────────────┘
                              │
                    ┌─────────▼──────────┐
                    │  Frontend Bundle   │
                    │ (TypeScript → JS)  │
                    │                    │
                    │ ┌────────────────┐ │
                    │ │ linus-strategy │ │
                    │ └────────────────┘ │
                    │ ┌────────────────┐ │
                    │ │  Views/Cards   │ │
                    │ └────────────────┘ │
                    │ ┌────────────────┐ │
                    │ │     Helper     │ │
                    │ └────────────────┘ │
                    └────────────────────┘
```

---

## 📁 Codebase Structure

```
Linus-Dashboard/
├── custom_components/linus_dashboard/
│   ├── __init__.py              # Integration entry point (setup, resource registration)
│   ├── manifest.json            # Integration metadata (version 1.3.0)
│   ├── config_flow.py           # UI configuration flow
│   ├── const.py                 # Constants and configuration keys
│   ├── utils.py                 # Utility functions for resources
│   ├── lovelace/
│   │   └── ui-lovelace.yaml     # Dashboard YAML configuration
│   ├── translations/
│   │   ├── en.json              # English translations
│   │   └── fr.json              # French translations
│   └── www/                      # Bundled frontend assets
│       ├── linus-strategy.js    # Main strategy bundle
│       ├── browser_mod.js       # Browser mod integration
│       ├── lovelace-mushroom/
│       ├── lovelace-card-mod/
│       ├── swipe-card/
│       └── stack-in-card/
├── src/                          # TypeScript source code
│   ├── linus-strategy.ts        # Main strategy class
│   ├── Helper.ts                # Core helper functions
│   ├── utils.ts                 # Utility functions
│   ├── variables.ts             # Constants and configuration
│   ├── version-check.ts         # Version validation
│   ├── embedLovelace.ts         # Embedded dashboard support
│   ├── configurationDefaults.ts # Default configuration
│   ├── utils/                   # Utility modules
│   │   └── entityResolver.ts    # Linus Brain & Magic Areas entity resolution
│   ├── views/                   # View generators
│   │   ├── AbstractView.ts      # Base view class
│   │   ├── AreaView.ts          # Room/area views
│   │   ├── FloorView.ts         # Floor views
│   │   ├── HomeView.ts          # Home view
│   │   ├── AggregateView.ts     # Aggregate domain views
│   │   ├── LightView.ts         # Lights view
│   │   ├── SensorView.ts        # Sensors view
│   │   ├── SecurityView.ts      # Security view
│   │   ├── ClimateView.ts       # Climate view
│   │   ├── MediaPlayerView.ts   # Media players view
│   │   ├── CameraView.ts        # Cameras view
│   │   └── [others...]          # More specialized views
│   ├── cards/                   # Card generators
│   │   ├── AbstractCard.ts      # Base card class
│   │   ├── LightCard.ts         # Light entity card
│   │   ├── SensorCard.ts        # Sensor entity card
│   │   ├── ClimateCard.ts       # Climate entity card
│   │   ├── MediaPlayerCard.ts   # Media player card
│   │   ├── CameraCard.ts        # Camera card
│   │   ├── SwitchCard.ts        # Switch card
│   │   ├── CoverCard.ts         # Cover card
│   │   ├── FanCard.ts           # Fan card
│   │   ├── VacuumCard.ts        # Vacuum card
│   │   ├── LockCard.ts          # Lock card
│   │   ├── AlarmCard.ts         # Alarm card
│   │   └── [others...]          # More card types
│   ├── chips/                   # Chip generators
│   │   ├── AbstractChip.ts      # Base chip class
│   │   ├── WeatherChip.ts       # Weather chip
│   │   ├── AlarmChip.ts         # Alarm chip
│   │   ├── AreaStateChip.ts     # Area state chip
│   │   ├── PersonChip.ts        # Person chip
│   │   └── [others...]          # More chip types
│   ├── badges/                  # Badge generators
│   │   ├── AbstractBadge.ts     # Base badge class
│   │   └── AlarmBadge.ts        # Alarm badge
│   ├── popups/                  # Popup generators
│   │   ├── AbstractPopup.ts     # Base popup class
│   │   ├── WeatherPopup.ts      # Weather popup
│   │   ├── LightSettingsPopup.ts # Light settings popup
│   │   ├── SettingsPopup.ts     # Settings popup
│   │   └── [others...]          # More popup types
│   └── types/                   # TypeScript type definitions
│       ├── homeassistant/       # Home Assistant types
│       ├── lovelace-mushroom/   # Mushroom card types
│       └── strategy/            # Strategy types
├── build-scripts/               # Build configuration
│   ├── bundle.cjs               # Bundle configuration
│   ├── env.cjs                  # Environment setup
│   └── paths.cjs                # Path definitions
├── scripts/                     # Development scripts
│   ├── dev                      # Start dev mode with watch
│   ├── develop                  # Start HA dev server
│   ├── setup                    # Install dependencies
│   ├── lint                     # Run linters
│   └── sync-dependencies.js     # Sync dependencies from manifest
├── rspack.config.cjs            # Production build config
├── rspack.dev.config.cjs        # Development build config
├── babel.config.js              # Babel configuration
├── tsconfig.json                # TypeScript configuration
├── .eslintrc.json               # ESLint configuration
├── .prettierrc.json             # Prettier configuration
├── package.json                 # Node dependencies
├── Makefile                     # Build shortcuts
└── .devcontainer/
    └── devcontainer.json        # Dev container setup
```

### Key Files Explained

#### `custom_components/linus_dashboard/__init__.py`
- **Entry point** for the integration
- Functions:
  - `async_setup()` - Registers WebSocket commands
  - `async_setup_entry()` - Registers static resources and creates dashboard panel
  - `async_unload_entry()` - Cleanup on unload
  - `register_static_paths_and_resources()` - Registers JS bundles with cache-busting
- **Resource Registration**: Loads all required frontend bundles (Mushroom, Card Mod, etc.)
- **Cache Busting**: Appends version query parameter to prevent stale cache issues

#### `custom_components/linus_dashboard/config_flow.py`
- **Configuration Flow**: UI-based setup wizard
- **Optional Configuration**:
  - Weather entity selection
  - Alarm entity selection
  - Hide greeting option
  - Excluded domains/device classes
  - Excluded integrations/targets
  - Embedded dashboard configuration

#### `src/linus-strategy.ts`
- **Main Strategy Class**: `LinusStrategy extends HTMLTemplateElement`
- **Dashboard Generation**: `static async generateDashboard(info)`
- **View Creation**:
  - `createDomainSubviews()` - Creates views for each domain (lights, sensors, etc.)
  - `createAreaSubviews()` - Creates views for each room/area
  - `createFloorSubviews()` - Creates views for each floor
  - `createUnavailableEntitiesSubview()` - Lists unavailable entities
- **Embedded Dashboards**: Processes and embeds external dashboards
- **Version Check**: Validates backend/frontend version compatibility

#### `src/Helper.ts`
- **Core Helper Class**: Singleton pattern for shared state
- **Initialization**: `static async initialize(info)`
- **Entity Management**:
  - `getDevices()` - Returns all devices
  - `getEntities()` - Returns all entities
  - `getAreas()` - Returns all areas
  - `getFloors()` - Returns all floors
- **Configuration Access**: `strategyOptions` - Stores user configuration
- **Utility Methods**:
  - Entity filtering
  - Area/device association
  - Entity state access

#### `src/views/` - View Generators
- **AbstractView**: Base class for all views
- **View Types**:
  - **HomeView**: Main home screen with area overview
  - **AreaView**: Individual room/area details
  - **FloorView**: Floor-based organization
  - **AggregateView**: Domain aggregates (all lights, all sensors, etc.)
  - **Specialized Views**: SecurityView, ClimateView, MediaPlayerView, etc.
- **Common Pattern**:
  ```typescript
  class XxxView extends AbstractView {
    getCards(): LovelaceCardConfig[] {
      // Generate cards for this view
    }
  }
  ```

#### `src/cards/` - Card Generators
- **AbstractCard**: Base class for all cards
- **Card Types**: Match Home Assistant domains
- **Integration**: Uses Mushroom, Card Mod, and custom cards
- **Common Pattern**:
  ```typescript
  class XxxCard extends AbstractCard {
    getCard(entity, options): LovelaceCardConfig {
      // Generate Mushroom card config
    }
  }
  ```

#### `src/chips/` - Chip Generators
- **Small UI Elements**: Compact information display
- **Types**: Weather, Alarm, Person, Area State, etc.
- **Usage**: Typically displayed in headers or footers

#### `src/popups/` - Popup Generators
- **More Info Dialogs**: Detailed entity information
- **Types**: Weather, Light Settings, Area Information, etc.
- **Integration**: Uses browser_mod for popup display

#### Build Configuration
- **rspack.config.cjs**: Production build (minified, optimized)
- **rspack.dev.config.cjs**: Development build (watch mode, source maps)
- **build-scripts/**: Modular build configuration
- **Output**: Bundles to `custom_components/linus_dashboard/www/`

---

## 🗄️ Configuration Schema

### Integration Options

```python
CONF_WEATHER_ENTITY = "weather_entity"
CONF_WEATHER_ENTITY_ID = "weather_entity_id"
CONF_ALARM_ENTITY_IDS = "alarm_entity_ids"
CONF_HIDE_GREETING = "hide_greeting"
CONF_EXCLUDED_DOMAINS = "excluded_domains"
CONF_EXCLUDED_DEVICE_CLASSES = "excluded_device_classes"
CONF_EXCLUDED_INTEGRATIONS = "excluded_integrations"
CONF_EXCLUDED_TARGETS = "excluded_targets"
CONF_EMBEDDED_DASHBOARDS = "embedded_dashboards"
```

### WebSocket API

**Command**: `linus_dashboard/get_config`

**Response**:
```json
{
  "alarm_entity_ids": [],
  "weather_entity_id": "weather.home",
  "hide_greeting": false,
  "excluded_domains": [],
  "excluded_device_classes": [],
  "excluded_integrations": [],
  "excluded_targets": [],
  "embedded_dashboards": [],
  "version": "1.3.0"
}
```

---

## 🔄 Data Flow

### 1. Dashboard Initialization

```
User opens dashboard → Lovelace calls LinusStrategy.generateDashboard()
→ Helper.initialize() loads hass state
→ Fetch config via WebSocket (linus_dashboard/get_config)
→ Generate views based on entities, areas, and floors
→ Return LovelaceConfig to Lovelace frontend
```

### 2. Resource Loading

```
Integration setup → async_setup_entry() → register_static_paths_and_resources()
→ Register static paths for JS bundles
→ Register Lovelace resources with version query parameter
→ Frontend loads resources from /linus_dashboard_files/www/
```

### 3. View Generation

```
generateDashboard() → createDomainSubviews()
→ For each domain: Create XxxView instance
→ View.getCards() generates card configs
→ Card.getCard() creates Mushroom card configs
→ Return view config with cards
```

### 4. Version Check

```
Dashboard load → initVersionCheck() (async)
→ Fetch backend version via WebSocket
→ Compare with frontend version (embedded in bundle)
→ Display warning if mismatch detected
```

### 5. Embedded Dashboard Processing (v1.3.0+)

```
Dashboard load → Process extra_views with linus.embed_view type
→ loadEmbeddedDashboardViews(hass, dashboardPath)
→ Fetch full dashboard config via Lovelace connection
→ Load ALL views from the dashboard
→ Apply Home Assistant display logic:
  • Single view + default "home" name → use dashboard icon only
  • Single view + custom name → use view icon and title
  • Multiple views → each view uses own icon and title
→ Add all processed views to main dashboard
→ Return complete view configs ready for display
```

**Two Embedding Methods**:
1. **Dashboard-level**: Embed entire dashboards via `extra_views` (adds all views)
2. **Card-level**: Embed individual views via `linus.embed_view` cards within views

---

## 🎯 Supported Domains

### Core Domains

| Domain | Card Type | View | Icon |
|--------|-----------|------|------|
| `light` | LightCard | LightView | mdi:lightbulb |
| `sensor` | SensorCard | SensorView | mdi:eye |
| `binary_sensor` | BinarySensorCard | SensorView | mdi:checkbox-marked-circle |
| `switch` | SwitchCard | SwitchView | mdi:light-switch |
| `climate` | ClimateCard | ClimateView | mdi:thermostat |
| `cover` | CoverCard | CoverView | mdi:window-shutter |
| `fan` | FanCard | FanView | mdi:fan |
| `media_player` | MediaPlayerCard | MediaPlayerView | mdi:cast |
| `camera` | CameraCard | CameraView | mdi:cctv |
| `lock` | LockCard | SecurityView | mdi:lock |
| `vacuum` | VacuumCard | VacuumView | mdi:robot-vacuum |
| `person` | PersonCard | HomeView | mdi:account |
| `alarm_control_panel` | AlarmCard | SecurityView | mdi:shield-home |

### Aggregate Domains

Views that combine multiple entities of the same type:
- All Lights
- All Sensors
- All Switches
- All Climates
- All Covers
- All Fans
- All Media Players
- All Vacuums
- Security (Locks + Alarms)

---

## ⚙️ Development Workflow

### Setup

```bash
# Using dev container (recommended)
# 1. Open in VS Code
# 2. Reopen in Container (auto-installs dependencies)

# Manual setup
npm install
./ha-env/bin/pip install -r requirements.txt
```

### Build Commands

```bash
# Development build (watch mode)
make dev
npm run build-dev

# Production build
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

### Development Cycle

```bash
# 1. Make changes to TypeScript files in src/
# 2. Run build (or watch mode)
npm run build-dev  # Watch mode, auto-rebuilds

# 3. Output goes to custom_components/linus_dashboard/www/
# 4. Restart Home Assistant to load new bundle
pkill -f hass && ./ha-env/bin/hass -c /config

# 5. Clear browser cache (important!)
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Testing

```bash
# 1. Build production bundle
npm run build

# 2. Start Home Assistant
./ha-env/bin/hass -c /config

# 3. Access at http://localhost:8123
# 4. Navigate to Linus Dashboard (bow-tie icon)
# 5. Check browser console for errors

# 6. Test embedded dashboards
# Create test dashboard in HA
# Configure in Linus integration options

# 7. Test version check
# Change version in manifest.json
# Reload frontend
# Should show version mismatch warning
```

### Debugging

**Frontend Debugging**:
- Open browser console (F12)
- Check for TypeScript errors
- Inspect network requests
- Check resource loading

**Backend Debugging**:
- Check Home Assistant logs: `tail -f /config/home-assistant.log | grep linus_dashboard`
- Add debug logging in `__init__.py`
- Use VS Code debugger (port 5678)

**Common Issues**:
1. **Resources not loading**: Clear cache, check version query param
2. **Dashboard not appearing**: Check integration is loaded, check panel registration
3. **Embedded dashboard not working**: Check dashboard path, check user permissions
4. **Version mismatch**: Ensure manifest.json and bundle versions match

---

## 📝 Decision Log

### Why Rspack instead of Webpack?

- **Performance**: 5-10x faster build times
- **Compatibility**: Drop-in replacement for Webpack
- **Modern**: Built with Rust, optimized for TypeScript
- **Active Development**: Growing ecosystem

### Why Mushroom Cards?

- **Beautiful Design**: Modern, minimalist aesthetic
- **Wide Adoption**: Large community, well-tested
- **Comprehensive**: Covers all major entity types
- **Customizable**: Works with Card Mod for styling

### Why TypeScript?

- **Type Safety**: Catch errors at compile time
- **Intellisense**: Better IDE support
- **Maintainability**: Easier refactoring
- **Documentation**: Types serve as inline docs

### Why Custom Strategy?

- **Automatic**: No manual YAML configuration
- **Flexible**: Supports customization via options
- **Consistent**: Enforces design patterns
- **Updatable**: Easy to improve UI for all users

### Why WebSocket for Config?

- **Real-time**: Immediate config updates
- **Efficient**: No polling needed
- **Standard**: Home Assistant WebSocket API
- **Secure**: Uses HA authentication

### Why Cache-Busting with Version?

- **Problem**: Browsers cache old JS files after updates
- **Solution**: Append `?v=1.3.0` to resource URLs
- **Result**: Forces browser to fetch new version
- **Critical**: Prevents "red error" issues reported by users

### Why Embedded Dashboards?

- **Flexibility**: Allow users to add custom views
- **Integration**: Seamlessly blend with Linus Dashboard
- **Power User Feature**: Advanced users can extend functionality
- **Maintains Aesthetics**: Custom views use same styling

### Embedded Dashboard Display Logic (v1.3.0+)

**Home Assistant-Compliant View Display Rules**

Starting in v1.3.0, embedded dashboards follow Home Assistant's native display behavior:

| Scenario | Icon Display | Title Display | Behavior |
|----------|-------------|---------------|----------|
| **Single view with default "home" name** | Dashboard icon | Hidden | Shows dashboard-level icon only |
| **Single view with custom name** | View icon | View title | Shows view's own icon and title |
| **Multiple views** | Each view's icon | Each view's title | All views shown in horizontal menu |

**Implementation**:
- `src/utils/viewDisplayLogic.ts` - Core display logic utilities
- `src/embedLovelace.ts` - `loadEmbeddedDashboardViews()` function
- `src/linus-strategy.ts` - Dashboard-level embedding integration

**Key Functions**:
- `isDefaultHomeView(view)` - Detects if view has default "home" name
- `calculateViewDisplayInfo(views, dashboardIcon)` - Applies HA display rules
- `applyViewDisplayInfo(view, displayInfo)` - Modifies view with display settings
- `loadEmbeddedDashboardViews(hass, dashboardPath)` - Loads all views from dashboard with display logic applied

**Example**: Energy dashboard (single view named "home") will show only the dashboard's mdi:lightning-bolt icon without title, matching HA behavior exactly.

### Admin-Only Dashboard Support (v1.3.0+)

**Dynamic Admin Access Control**

Linus Dashboard respects Home Assistant's `require_admin` dashboard setting:

- **Dashboard with `require_admin: true`**:
  - Admin users → Dashboard views are loaded and displayed
  - Non-admin users → Dashboard views are completely hidden (empty array returned)
  - No error shown to non-admin users (seamless filtering)

**Implementation**:
```typescript
// In loadEmbeddedDashboardViews()
if (dashboardConfig.require_admin) {
    const isAdmin = hass?.user?.is_admin ?? false;
    if (!isAdmin) {
        console.info('Skipping dashboard - requires admin access');
        return [];
    }
}
```

**Use Cases**:
- Admin panels with system configuration
- Sensitive dashboards (security cameras, alarms)
- Testing/development dashboards
- Power user features

**Security**: Access control is enforced at view loading time, checked against current user's role dynamically.

### Linus Brain & Magic Areas Hybrid Support (v1.4.0+)

**Automatic Entity Resolution**

Starting in v1.4.0, Linus Dashboard supports BOTH Magic Areas AND Linus Brain integrations simultaneously through automatic entity resolution:

**Supported Entity Mappings**:

| Magic Areas Entity | Linus Brain Entity | Purpose |
|-------------------|-------------------|---------|
| `sensor.area_state_{area}` | `sensor.linus_brain_activity_{area}` | Area presence/activity state |
| N/A (binary) | `binary_sensor.linus_brain_presence_detection_{area}` | Presence detection sensor |
| `switch.magic_areas_light_control_{area}` | `switch.linus_brain_automatic_lighting_{area}` | Automatic lighting control |
| `light.all_lights_{area}` | `light.linus_brain_all_lights_{area}` | All lights group for area |

**Priority Resolution** (Linus Brain → Magic Areas → Native):
```typescript
// EntityResolver checks in order:
1. Linus Brain entities (if present)
2. Magic Areas entities (if present)  
3. Native Home Assistant entities (fallback)
```

**Implementation**:
- `src/utils/entityResolver.ts` - Core EntityResolver class with automatic detection
- `src/Helper.ts` - EntityResolver initialization and access
- `src/cards/HomeAreaCard.ts` - Area state and light control switch resolution
- `src/chips/AreaStateChip.ts` - Dual-mode chip (Linus Brain vs Magic Areas states)
- `src/chips/ConditionalLightChip.ts` - All lights entity resolution

**Key Features**:
- **Automatic Detection**: No user configuration required
- **Hybrid Mode**: Can use Linus Brain for some areas, Magic Areas for others
- **Zero Breaking Changes**: Existing Magic Areas installations work unchanged
- **State Differences Handled**: 
  - Linus Brain: `empty`, `inactive`, `movement`, `occupied`
  - Magic Areas: `occupied`, `extended`, `clear`, `bright`, `dark`, `sleep`

**Magic Areas Aggregates Preserved**:
All Magic Areas aggregate entities remain unchanged (no Linus Brain equivalent):
- `aggregate_health`, `aggregate_window`, `aggregate_door`, `aggregate_cover`
- `aggregate_climate`, `aggregate_media_player`, etc.

**Design Decision**: Hybrid approach prioritizes Linus Brain when available while maintaining full Magic Areas compatibility for features Linus Brain doesn't provide.

### Manual Area and Floor Ordering (v1.4.0+)

**Home Assistant 2025.1+ Manual Reordering Support**

Starting in v1.4.0, Linus Dashboard fully supports Home Assistant 2025.1+'s new manual reordering feature for areas and floors, while maintaining backward compatibility with older versions.

**Features**:
- **Automatic Detection**: Dashboard automatically detects and uses manual ordering when available
- **Backward Compatible**: Falls back gracefully to legacy sorting on older HA versions
- **Multi-Level Sorting**: Smart sorting priority system ensures consistent ordering

**Sorting Priority for Areas**:
1. **Manual order** (HA 2025.1+) - User-defined order from Settings > Areas, labels & zones > Reorder
2. **Areas with order** - Areas with manual order appear before areas without
3. **Alphabetical fallback** - For backward compatibility and areas without manual order

**Sorting Priority for Floors**:
1. **Manual order** (HA 2025.1+) - User-defined order from Settings > Areas, labels & zones > Reorder
2. **Floors with order** - Floors with manual order appear before floors without
3. **Numeric level** (legacy) - Traditional floor level ordering (basement=-1, ground=0, first=1, etc.)
4. **Alphabetical fallback** - Final fallback for consistency

**Implementation**:
- `src/types/homeassistant/data/area_registry.ts` - Added `order?: number` property
- `src/types/homeassistant/data/floor_registry.ts` - Added `order?: number` property
- `src/Helper.ts` - Enhanced `orderedAreas` and `orderedFloors` getters with multi-level sorting

**Use Cases**:
- Prioritize main living areas (living room before guest bathroom)
- Custom floor ordering (attic doesn't have to be first despite high level number)
- Mixed installations (some areas/floors ordered, others alphabetical)

**Example Behavior**:
```typescript
// Areas without manual order (HA < 2025.1):
// Alphabetical: Bathroom, Bedroom, Kitchen, Living Room

// Areas with manual order (HA >= 2025.1):
// User-defined: Living Room (order=0), Kitchen (order=1), Bedroom (order=2), Bathroom (order=3)

// Mixed scenario:
// Living Room (order=0), Kitchen (order=1), Bathroom (alphabetical), Bedroom (alphabetical)
// Results: Living Room, Kitchen, Bathroom, Bedroom
```

**Compatibility**: Works seamlessly with all Home Assistant versions. No user configuration required.

### Manual Registry Refresh (v1.4.1+)

**Manual Refresh Button**

Starting in v1.4.1, Linus Dashboard includes a manual refresh button that allows users to reload registry data (entities, devices, areas, floors) without clearing browser cache.

**Features**:
- Blue refresh chip displayed in HomeView chip bar (before settings chip)
- Click triggers immediate refresh of all Home Assistant registries
- Dashboard automatically reloads to apply changes
- No automatic subscriptions (manual-only to avoid performance issues)

**Implementation**:
- `src/chips/RefreshChip.ts` - Refresh button chip with mdi:refresh icon
- `src/Helper.ts` - `refresh()` method to reload registries
- `window.refreshLinusDashboard()` - Global function callable from JavaScript/browser_mod
- `linus-dashboard-refreshed` event - Custom event emitted after successful refresh

**Use Cases**:
- User adds a room to a device in Home Assistant
- User renames an area
- User adds new entities
- Configuration changes need to be reflected immediately without Ctrl+Shift+R

**Technical Details**:
- Resets `Helper.#initialized` flag to allow re-initialization
- Re-fetches all registries via WebSocket (`config/entity_registry/list`, etc.)
- Emits custom event `linus-dashboard-refreshed`
- Triggers `window.location.reload()` to regenerate all views
- Uses `fire-dom-event` action with `browser_mod.javascript` service
- Bilingual notifications (EN/FR) via `hass.language` detection
- Success notification: 2s duration
- Error notification: 3s duration
- No backend browser_mod integration required (frontend-only)

**Design Decision**: Manual refresh (not automatic) to avoid performance issues with large installations and maintain user control over when data is reloaded.

**Browser Mod Integration**:
```typescript
tap_action: {
  action: "fire-dom-event",
  browser_mod: {
    service: "javascript",
    data: {
      code: "window.refreshLinusDashboard && window.refreshLinusDashboard()"
    }
  }
}
```

---

## 🚀 Future Enhancements

1. **Auto-Update**: Check for new versions, notify users
2. **Themes**: Multiple color schemes (dark, light, custom)
3. **Layouts**: Alternative card layouts (grid, masonry, etc.)
4. **AI Integration**: Smart suggestions for dashboard organization
5. **Mobile App**: Native mobile experience
6. **Entity Filtering**: Advanced filtering options
7. **Custom Cards**: Built-in card editor
8. **Analytics**: Track dashboard usage, optimize performance
9. **Accessibility**: Improved screen reader support
10. **Documentation**: Interactive tutorial, video guides

---

## 🐛 Known Issues

1. **Cache Issues**: Users must clear cache after updates (mitigated by version query params)
2. **Resource Loading Order**: Sometimes Mushroom loads before dependencies
3. **Translation Coverage**: Some strings not translated in all languages
4. **Performance with Many Entities**: Slow generation with 500+ entities

---

## 📚 Key Dependencies

### Python (Home Assistant)
```python
homeassistant >= 2023.9.0  # Core framework
```

### TypeScript (Frontend)
```json
{
  "typescript": "5.9.2",
  "@rspack/core": "1.5.5",
  "home-assistant-js-websocket": "9.5.0",
  "lodash.merge": "^4.6.2"
}
```

### Bundled Cards
- **Mushroom**: Entity cards with modern design
- **Card Mod**: CSS styling for cards
- **Swipe Card**: Swipeable card container
- **Stack in Card**: Stack multiple cards
- **Browser Mod**: Popup and browser control

---

## 🔗 Related Documents

- `README.md` - User documentation and installation guide
- `README-fr.md` - French version
- `CONTRIBUTING.md` - Contribution guidelines
- `.devcontainer/devcontainer.json` - Dev environment setup
- `docs/AREA_SPECIFIC_ENTITIES.md` - Area-specific entity documentation
- `.aidriven/AGENTS.md` - Agent command reference
- `.aidriven/README.md` - AI-driven development workflow

---

**This memory bank is the single source of truth for AI-assisted development. Always load this context before generating code or plans.**
