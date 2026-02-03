# Linus Dashboard - Coding Standards

## TypeScript Standards

### Linting Configuration

**ESLint 9.36.0** with 9 plugins:
- `@eslint/js` - Core ESLint rules
- `eslint-plugin-lit` - Lit element best practices
- `eslint-plugin-wc` - Web Components standards
- `eslint-plugin-unused-imports` - Remove unused imports
- `eslint-plugin-import` - Import/export validation
- `eslint-config-prettier` - Prettier compatibility
- `typescript-eslint` - TypeScript rules
- Additional standard plugins

### TypeScript Configuration

**Version:** 5.9.2
**Mode:** Strict

**Key Settings:**
```json
{
  "strict": true,
  "esModuleInterop": true,
  "skipLibCheck": true,
  "resolveJsonModule": true,
  "jsx": "react"
}
```

### Naming Conventions

#### Files
- **Components:** PascalCase (e.g., `LightCard.ts`, `HomeView.ts`)
- **Utilities:** camelCase (e.g., `embedLovelace.ts`, `helpers.ts`)
- **Configuration:** lowercase with dashes (e.g., `rspack.config.ts`)
- **Tests:** Same as source with `.test.ts` suffix

#### Code
- **Classes:** PascalCase (e.g., `class Helper`, `class PopupFactory`)
- **Interfaces:** PascalCase with `I` prefix (e.g., `interface ICardConfig`)
- **Types:** PascalCase (e.g., `type CardType`)
- **Functions:** camelCase (e.g., `function generateDashboard()`)
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `const DEFAULT_TIMEOUT`)
- **Variables:** camelCase (e.g., `let entityCount`)
- **Private members:** prefix with `_` (e.g., `private _internalState`)

### Code Organization

#### Imports Order
1. External libraries (React, Lodash, etc.)
2. Home Assistant imports (`home-assistant-js-websocket`)
3. Project utilities and helpers
4. Type imports
5. Local relative imports

**Example:**
```typescript
import { h } from 'preact';
import merge from 'lodash.merge';
import { HomeAssistant } from 'home-assistant-js-websocket';

import { Helper } from './Helper';
import type { CardConfig } from './types/card';
import { AbstractCard } from './cards/AbstractCard';
```

#### File Structure
1. Imports
2. Type definitions
3. Constants
4. Main class/function
5. Helper functions
6. Exports

### Best Practices

#### Type Safety
- Always use explicit types for function parameters
- Prefer `interface` over `type` for object shapes
- Use `unknown` instead of `any` when type is truly unknown
- Enable strict null checks

#### Functions
- Keep functions small and focused (< 50 lines ideally)
- Use arrow functions for callbacks
- Prefer `const` over `let`
- Never use `var`

#### Objects & Arrays
- Use object destructuring when accessing multiple properties
- Use array spread operator over `Array.concat()`
- Prefer `for...of` over traditional `for` loops
- Use `Array.map()`, `Array.filter()`, `Array.reduce()` for transformations

#### Async/Await
- Prefer `async/await` over Promise chains
- Always handle errors with try/catch in async functions
- Use `Promise.all()` for parallel async operations

**Example:**
```typescript
async function fetchEntities(hass: HomeAssistant): Promise<Entity[]> {
  try {
    const [entities, areas, devices] = await Promise.all([
      hass.callWS({ type: 'config/entity_registry/list' }),
      hass.callWS({ type: 'config/area_registry/list' }),
      hass.callWS({ type: 'config/device_registry/list' })
    ]);
    return processEntities(entities, areas, devices);
  } catch (error) {
    console.error('Failed to fetch entities:', error);
    throw error;
  }
}
```

### Home Assistant Specific

#### Entity IDs
- Always validate entity IDs before use
- Use domain extraction: `const domain = entityId.split('.')[0]`
- Never hardcode entity IDs

#### State Access
- Use `hass.states[entityId]` for current state
- Check state exists before accessing properties
- Use state attributes safely: `state.attributes?.friendly_name`

#### Service Calls
- Always specify domain and service
- Validate entity_id before calling services
- Handle service call failures gracefully

**Example:**
```typescript
await hass.callService('light', 'turn_on', {
  entity_id: 'light.living_room',
  brightness: 255
});
```

#### WebSocket Messages
- Use typed message objects
- Check message type in responses
- Handle connection errors

## Python Standards

### Linting & Formatting

**Ruff** - Modern Python linter and formatter

**Configuration:** `.ruff.toml`
- Line length: 88 characters (Black compatible)
- Target Python version: 3.13
- Auto-fix enabled

### Naming Conventions

- **Modules:** lowercase with underscores (e.g., `config_flow.py`)
- **Classes:** PascalCase (e.g., `class LinusDashboard`)
- **Functions:** snake_case (e.g., `def setup_component()`)
- **Constants:** SCREAMING_SNAKE_CASE (e.g., `DEFAULT_NAME`)
- **Private:** prefix with `_` (e.g., `def _internal_method()`)

### Home Assistant Integration

#### Component Structure
```python
async def async_setup(hass, config):
    """Set up the component."""
    # Setup logic here
    return True

async def async_setup_entry(hass, entry):
    """Set up from config entry."""
    # Entry-specific setup
    return True
```

#### Config Flow
- Extend `config_entries.ConfigFlow`
- Use async methods
- Validate user input
- Provide clear error messages

#### Type Hints
- Always use type hints for function parameters and return values
- Import from `typing` or `collections.abc`
- Use `HomeAssistant` type from `homeassistant.core`

**Example:**
```python
from homeassistant.core import HomeAssistant
from homeassistant.config_entries import ConfigEntry

async def async_setup_entry(
    hass: HomeAssistant,
    entry: ConfigEntry
) -> bool:
    """Set up from config entry."""
    return True
```

## Testing Standards

### Unit Tests (Vitest)

#### File Naming
- Test files: `*.test.ts` or `*.spec.ts`
- Located alongside source files or in `__tests__/`

#### Test Structure
```typescript
describe('ComponentName', () => {
  it('should do something specific', () => {
    // Arrange
    const input = setupTestData();

    // Act
    const result = functionUnderTest(input);

    // Assert
    expect(result).toBe(expectedValue);
  });
});
```

#### Coverage Requirements
- Aim for > 80% coverage
- 100% coverage for critical paths
- Use `npm run test:coverage` to check

### Smoke Tests

**Location:** Defined in release-check skill
**Count:** 15 predefined tests
**Purpose:** Validate core functionality before release

## Code Review Standards

### Before Committing
1. Run `npm run lint` - No linting errors
2. Run `npm run type-check` - No type errors
3. Run `npm run test` - All tests pass
4. Run `npm run build` - Build succeeds

### Commit Messages
- Use conventional commits format
- Start with type: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`
- Be descriptive but concise
- Reference issues when applicable

**Examples:**
```
feat: add support for climate card temperature control
fix: resolve entity state update race condition
docs: update README with new configuration options
refactor: extract common card logic into AbstractCard
test: add unit tests for PopupFactory
chore: update dependencies to latest versions
```

### Pull Requests
- Provide clear description of changes
- Link related issues
- Include screenshots for UI changes
- Ensure CI passes before requesting review
- Use `/release-check` before merging

## Build & Release Standards

### Versioning
- **Semantic versioning:** major.minor.patch
- **Beta releases:** version-beta.number (e.g., `1.4.1-beta.4`)
- **No 'v' prefix** in git tags (critical!)

### Release Process
1. Create changes on feature branch
2. Run `/release-check` - Validate quality
3. Merge to main
4. Run `/release-beta` or `/release-stable`
5. Tag created automatically
6. HACS validation runs
7. Discord notification sent

### Build Outputs
- **Development:** `dist/` directory (not committed)
- **Production:** Optimized bundle in `dist/`
- **Source maps:** Generated for debugging

## Documentation Standards

### Code Comments
- Use JSDoc for public APIs
- Explain "why" not "what"
- Keep comments up to date
- Document Home Assistant specific integrations

**Example:**
```typescript
/**
 * Generates a dashboard configuration based on available entities.
 *
 * @param hass - Home Assistant instance with entity/area/device registries
 * @param options - Dashboard generation options (excluded domains, etc.)
 * @returns Complete dashboard configuration for Lovelace
 *
 * @remarks
 * This function calls multiple Home Assistant WebSocket APIs in parallel
 * for performance. It respects user-configured exclusions and filters.
 */
async function generateDashboard(
  hass: HomeAssistant,
  options: DashboardOptions
): Promise<LovelaceConfig> {
  // Implementation
}
```

### README Files
- Clear setup instructions
- Code examples
- Configuration options
- Troubleshooting section

## Performance Standards

### Build Performance
- Rspack for fast builds
- Tree shaking enabled
- Code splitting for large modules
- Watch mode for development

### Runtime Performance
- Minimize WebSocket calls
- Cache entity registry data
- Debounce frequent updates
- Lazy load card implementations when possible

### Bundle Size
- Monitor bundle size in builds
- Use dynamic imports for large dependencies
- Avoid including entire libraries when only using small parts

## Accessibility Standards

### UI Components
- Use semantic HTML elements
- Provide ARIA labels where needed
- Ensure keyboard navigation works
- Test with screen readers

### Home Assistant Integration
- Follow Lovelace card API guidelines
- Support Home Assistant themes
- Respect user's language settings
- Handle missing entities gracefully

## Security Standards

### API Keys & Secrets
- Never commit API keys
- Use environment variables
- Document required keys in README
- Use Home Assistant's credential storage when possible

### Input Validation
- Validate all user input
- Sanitize entity IDs
- Check service call parameters
- Handle WebSocket errors

### Dependencies
- Keep dependencies up to date
- Review dependency security advisories
- Use exact versions in lock file
- Audit dependencies regularly with `npm audit`

## Editor Configuration

### VS Code
- Use workspace settings (`.vscode/settings.json`)
- Install recommended extensions:
  - ESLint
  - Prettier
  - TypeScript + JavaScript Language Features
  - Python
  - Vitest

### Prettier
- Auto-format on save
- Line length: 100 characters (TypeScript)
- Single quotes for strings
- Trailing commas

## Error Handling

### TypeScript
```typescript
try {
  const result = await riskyOperation();
  processResult(result);
} catch (error) {
  if (error instanceof SpecificError) {
    // Handle specific error
    console.error('Specific error occurred:', error.message);
  } else {
    // Handle general error
    console.error('Unexpected error:', error);
    throw error; // Re-throw if cannot handle
  }
}
```

### Python
```python
try:
    result = await async_operation()
except SpecificException as err:
    _LOGGER.error("Specific error: %s", err)
    return False
except Exception as err:
    _LOGGER.exception("Unexpected error: %s", err)
    raise
```

## Deprecation Policy

### Marking Deprecated Code
```typescript
/**
 * @deprecated Use newFunction() instead. Will be removed in v2.0.0
 */
function oldFunction() {
  // Implementation
}
```

### Removal Timeline
- Mark as deprecated in version N
- Keep deprecated code in N+1
- Remove in N+2
- Document in CHANGELOG.md

## Quality Gates

All quality checks must pass before merge:

1. **ESLint** - Zero linting errors
2. **Type Check** - Zero type errors
3. **Unit Tests** - 100% pass rate
4. **Smoke Tests** - 100% pass rate (15/15)
5. **Build** - Successful production build
6. **Coverage** - Maintained or improved

Use `/sapiens/quality-check` to run all checks.
