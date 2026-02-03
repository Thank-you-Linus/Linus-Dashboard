# Linus Dashboard - Project Context

## Project Overview

**Linus Dashboard** is a custom Home Assistant Lovelace dashboard strategy that provides an intelligent, auto-generated dashboard interface with 28+ specialized card types and 9 view types.

**Version:** 1.4.2-dev
**Target HA Version:** 2025.5.0+
**Repository:** https://github.com/Thank-you-Linus/Linus-Dashboard

## Technology Stack

### Frontend
- **Language:** TypeScript 5.9.2
- **UI Framework:** React with JSX support
- **Build Tool:** Rspack 1.5.5 (fast bundler, Webpack replacement)
- **Testing:** Vitest 1.6.1 with v8 coverage
- **Linting:** ESLint 9.36.0 + Prettier
- **Package Manager:** npm

### Backend
- **Runtime:** Python 3.13 (Home Assistant component)
- **HTTP Client:** aiohttp 3.8.0+
- **Integration:** Home Assistant Custom Component

### UI Libraries
- Lovelace Mushroom cards
- Mini Graph cards
- home-assistant-js-websocket 9.5.0

## Architecture

### Dashboard Strategy Pattern
The project implements a **Lovelace Strategy** that auto-generates dashboards based on Home Assistant entities and areas.

**Entry Point:** `src/linus-strategy.ts`
**Core Logic:** `src/Helper.ts` (71KB helper class)

### Card Types (28+)
Located in `src/cards/`:
- Light, Switch, Climate, Cover, Fan, Lock
- Media Player, Camera, Alarm, Battery
- Binary Sensor, Sensor, Number, Select
- Thermostat, Vacuum, Water Heater
- Grouped, Aggregate, Controller
- Home Area cards

### View Types (9)
Located in `src/views/`:
- HomeView - Main dashboard
- AreaView - Room-specific views
- FloorView - Floor organization
- SecurityView - Security entities
- AggregateView - Grouped data
- UnavailableView - Unavailable entities
- StandardDomainView - Domain-specific views

### Custom Components (4)
Located in `custom_components/`:
- **linus_dashboard/** - Main dashboard component
- **linus_brain/** - AI/Logic component (uses aiohttp)
- **magic_areas/** - Room organization
- **media_player_template/** - Template component

## Key Features

### External Dashboard Embedding
`src/embedLovelace.ts` - Fetches and integrates external Lovelace dashboards without iframes

### Service Integration
- **PopupFactory.ts** - Dynamic UI popup creation with domain routing
- **RegistryManager.ts** - Home Assistant registry management
- **WebSocket API** - Real-time entity/service communication

### Popup Architecture
The popup system uses a hierarchical inheritance pattern:
- **AggregatePopup** - Base class for all aggregate popups with Floor → Area → Entity grouping
- **LightPopup** - Light-specific popup with brightness slider inline
- **CoverPopup** - Cover-specific popup with open/close/stop controls
- **MediaPlayerPopup** - Media player popup with play/pause/volume controls

**Key concepts:**
- `scope: "global"` - Shows hierarchical grouping (Floor → Area → Entities)
- `scope: "area"` - Shows flat entity list for a single area
- **PopupFactory** routes domain to appropriate popup class

### Chip Architecture
Located in `src/chips/`:
- **AggregateChip** - Universal chip for domain aggregation with scope awareness
- **createGlobalScopeChips()** in `utils.ts` - Factory function for creating global-scope chips with filtering

**createGlobalScopeChips features:**
- Filters excluded domains/device_classes
- Validates global entities exist (excluding UNDISCLOSED areas)
- Creates AggregateChip with `scope: "global"` for hierarchical popups

### Configuration System
- **Type:** YAML-based Home Assistant config
- **Config Flow:** Python implementation in `config_flow.py`
- **Options:** Excluded domains, weather/alarm entities, embedded dashboards, admin views

## Home Assistant Integration Points

### WebSocket API
- Entity registries (devices, areas, entities)
- Service calls
- Real-time state updates
- Dashboard config fetching

**Example:**
```typescript
const result = await hass.callWS({
    type: "lovelace/config",
    url_path: dashboardId
});
```

### HTTP Integration
- Listed as dependency in `manifest.json`
- Used by linus_brain component for API calls

### Entity Organization
- Areas (rooms)
- Floors
- Devices
- Domains (light, switch, climate, etc.)
- Device classes

## Build & Development

### Scripts
- `npm run build` - Development build (Rspack)
- `npm run build:prod` - Production build
- `npm run build:dev` - Watch mode
- `npm run lint` - ESLint + Ruff format
- `npm run type-check` - TypeScript compilation
- `npm run test` - Vitest unit tests
- `npm run test:smoke` - Smoke tests
- `npm run test:ci` - CI test suite

### Configuration Files
- `rspack.config.ts` - Build configuration
- `tsconfig.json` - TypeScript settings
- `.ruff.toml` - Python linting
- `vitest.config.ts` - Test configuration

## Release & CI/CD

### Automation Tools
- **OpenCode AI** - Release automation (`.opencode/`)
- **Claude Code Skills** - Development automation (`.claude/skills/`)

### GitHub Workflows
- `ci.yml` - Main CI pipeline
- `validate.yml` - HACS validation
- `prerelease.yml` - Beta releases
- `release.yml` - Stable releases

### Release Process
- Semantic versioning with AI detection
- Discord webhook notifications
- Automated release notes
- **Tag format:** No 'v' prefix (critical!)
- HACS publishing

### Custom Skills
- `/release-beta` - Pre-release with AI version detection
- `/release-stable` - Stable release
- `/release-check` - 17 quality checks + 15 smoke tests
- `/release-rollback` - Version rollback
- `/debug` - Systematic debugging
- `/implement` - Plan-based implementation
- `/review` - Code review automation

## Development Environment

### Local Setup
- DevContainer support (`.devcontainer/`)
- Docker-based Python 3.13 environment
- Home Assistant on port 8123
- SQLite database (home-assistant_v2.db)

### Version Control
- GitHub repository
- Main branch for development and releases
- Tag-based releases (no 'v' prefix)

## Code Organization

### TypeScript Structure
```
src/
├── cards/          # 28+ card implementations
├── chips/          # Chip components
├── views/          # 9 view types
├── popups/         # UI popups
├── services/       # Registry managers
├── types/          # TypeScript definitions
├── utils/          # Helper utilities
├── factories/      # Factory patterns
├── linus-strategy.ts  # Main entry
└── Helper.ts       # Core helper (71KB)
```

### Python Structure
```
custom_components/
└── linus_dashboard/
    ├── __init__.py     # Component initialization
    ├── config_flow.py  # Configuration UI
    └── manifest.json   # Component metadata
```

## Testing Strategy

### Unit Tests
- Vitest framework
- Located alongside source files
- Coverage tracking with v8

### Smoke Tests
- 15 predefined smoke tests
- Validates core functionality
- Part of `/release-check` workflow

### Quality Checks
- ESLint (TypeScript)
- Ruff (Python)
- Type checking
- Build validation
- Test execution

## Documentation

- README.md (English & French)
- CONTRIBUTING.md - Setup instructions
- Embedded dashboard docs
- CHANGELOG.md - Release notes
- Inline code comments

## External Integrations

### HACS (Home Assistant Community Store)
- Custom integration distribution
- Automated validation workflows

### Discord
- Release notifications
- Webhook integration in OpenCode config

### Context7 MCP Server
- Documentation search capability
- API key required

### Figma MCP Server
- Design integration (optional)
- Requires access token

## Project Goals

1. **Auto-generation** - Intelligent dashboard creation without manual config
2. **Consistency** - Unified UI/UX across all entity types
3. **Extensibility** - Easy to add new card/view types
4. **Performance** - Fast builds with Rspack
5. **Quality** - Comprehensive testing and linting
6. **Automation** - AI-assisted releases and development

## Special Considerations

### Naming Conventions
- **Components:** PascalCase (e.g., `LightCard`, `HomeView`)
- **Functions:** camelCase (e.g., `generateDashboard`, `fetchEntities`)
- **Files:** PascalCase for components, camelCase for utilities
- **Interfaces:** PascalCase with `I` prefix (e.g., `ICardConfig`)

### Home Assistant Compatibility
- Must maintain compatibility with HA 2025.5.0+
- Follow Lovelace card API
- Respect HA entity/service patterns
- Use proper WebSocket message types

### Release Constraints
- **No 'v' prefix** in tags (e.g., `1.4.1`, not `v1.4.1`)
- Semantic versioning (major.minor.patch)
- Beta releases: `1.4.1-beta.4`
- HACS validation required before release

## Current Status

- **Version:** 1.4.2-dev
- **Latest Stable:** 1.4.1
- **Active Development:** Yes
- **Production Ready:** Yes
- **HACS Listed:** Yes

## Recent Changes (1.4.2-dev)

### Badge Harmonization
- Unified badge creation across HomeView, FloorView, AreaView using `createGlobalScopeChips()`
- All badge popups now display hierarchical grouping (Floor → Area → Entities)
- Pattern harmonized with StandardDomainView/AggregateView approach

### Popup Improvements
- Cleaned up unused imports in CoverPopup, MediaPlayerPopup
- Removed unused variables in AggregatePopup (`features`, `activeStates`)
- Standardized parameter naming (`_config` for intentionally unused params)
