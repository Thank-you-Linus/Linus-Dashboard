# Agent Guidelines for Linus Dashboard

## Build/Lint/Test Commands

### Frontend (TypeScript)
- **Build production**: `npm run build` or `make build`
- **Build development**: `npm run build-dev` or `make dev` (watch mode)
- **Type check**: `npm run type-check`
- **Type check watch**: `npm run type-check:watch`
- **Lint**: `npm run lint` or `make lint`
- **Lint check**: `npm run lint:check`
- **Build analyze**: `npm run build:analyze` (with bundle size analysis)

### Backend (Python)
- **Format**: `black custom_components/linus_dashboard/`
- **Lint**: `ruff check custom_components/linus_dashboard/`
- **Type check**: `mypy custom_components/linus_dashboard/`

### Home Assistant
- **Start HA**: `./ha-env/bin/hass -c /config` or `make develop`
- **Check config**: `./ha-env/bin/hass -c /config --script check_config`
- **Stop HA**: `pkill -f "hass -c /config"`

## Testing on Home Assistant

### Starting Home Assistant
```bash
# From workspace root
cd /workspaces/Linus-Dashboard

# Start HA (normal mode)
./ha-env/bin/hass -c /config

# Start in debug mode
./ha-env/bin/hass -c /config --debug
```

### Access
- **Web UI**: http://localhost:8123
- **Config directory**: `/config/`
- **Custom component**: `/config/custom_components/linus_dashboard/`
- **Frontend bundles**: `/config/custom_components/linus_dashboard/www/`
- **Logs**: `/config/home-assistant.log`

### Useful Commands
```bash
# Stop HA
pkill -f "hass -c /config"

# Watch logs (filter for Linus Dashboard)
tail -f /config/home-assistant.log | grep linus_dashboard

# Watch logs (all)
tail -f /config/home-assistant.log

# Check integration is loaded
grep "Setting up Linus Dashboard" /config/home-assistant.log

# Clear browser cache after updates
# Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
```

### Testing Workflow

1. **Make changes** to TypeScript files in `src/`
2. **Build** the frontend:
   ```bash
   npm run build  # or npm run build-dev for watch mode
   ```
3. **Verify output** in `custom_components/linus_dashboard/www/linus-strategy.js`
4. **Restart Home Assistant**:
   ```bash
   pkill -f hass && ./ha-env/bin/hass -c /config
   ```
5. **Clear browser cache** (Ctrl+Shift+R)
6. **Open Linus Dashboard** (bow-tie icon in sidebar)
7. **Check browser console** (F12) for errors
8. **Test features**:
   - Navigate to different views (areas, domains)
   - Test embedded dashboards (if configured)
   - Check version compatibility warning
   - Verify card rendering

### Important Notes
- Custom component is in `/config/custom_components/linus_dashboard/`
- Frontend bundles MUST be rebuilt after TypeScript changes
- Always clear browser cache after updates (cache issues are common)
- Version in `manifest.json` must match version in `package.json` and `src/linus-strategy.ts`
- Resources are cache-busted with `?v=X.X.X` query parameter

## Code Style Guidelines

### TypeScript (Frontend)
- **Naming**: 
  - Classes: `PascalCase` (e.g., `LinusStrategy`, `AreaView`)
  - Functions/methods: `camelCase` (e.g., `getCards`, `generateDashboard`)
  - Constants: `UPPER_SNAKE_CASE` (e.g., `AGGREGATE_DOMAINS`, `DOMAIN`)
  - Private methods: `_camelCase` (e.g., `_processView`)
- **Functions**: 
  - Max 50 lines
  - Type all parameters and return values
  - JSDoc comments for public methods
  - Single responsibility principle
  - Early returns for guard clauses
- **Async**: 
  - Use `async/await` for asynchronous operations
  - Handle errors with try/catch
  - No blocking operations in dashboard generation
- **Imports**: 
  - Group imports: External → Home Assistant types → Local
  - Use path aliases when configured
- **Error handling**: 
  - Log errors to console with `[Linus Dashboard]` prefix
  - Provide fallbacks for non-critical failures
  - Throw errors for critical failures (breaks dashboard)
- **Types**: 
  - Define interfaces for complex objects
  - Use type aliases for unions
  - Avoid `any` (use `unknown` if necessary)

### Python (Backend)
- **Naming**: 
  - snake_case for functions/variables
  - PascalCase for classes
  - UPPER_SNAKE_CASE for constants
  - _private for private methods
- **Functions**: 
  - Max 50 lines
  - Type hints required
  - Docstrings for public functions
  - Single responsibility
  - Early returns
- **Async**: 
  - Always await async calls
  - Use `asyncio.gather()` for parallel operations
  - Use `aiohttp` not `requests`
  - Handle `CancelledError`
- **Imports**: 
  - Standard lib → Third-party → Home Assistant → Local
- **Error handling**: 
  - Specific exceptions
  - Appropriate logging levels
  - `HomeAssistantError` for user-facing errors
- **HA patterns**: 
  - Use `async_setup` and `async_setup_entry`
  - Store data in `hass.data[DOMAIN][entry_id]`
  - Cleanup in `async_unload_entry`
  - Register resources with cache-busting

### Build Configuration
- **Rspack**: 
  - Production config: `rspack.config.cjs` (minified)
  - Development config: `rspack.dev.config.cjs` (source maps, watch)
  - Output to `custom_components/linus_dashboard/www/`
- **Babel**: 
  - Transpile for browser compatibility
  - Target modern browsers (ES2020)
- **TypeScript**: 
  - Strict mode enabled
  - No implicit any
  - Check all files

## Debugging Tips

### Frontend Issues
1. **Dashboard not appearing**:
   - Check integration is loaded: `grep "Setting up Linus Dashboard" /config/home-assistant.log`
   - Check panel registration: Look for "Registered WebSocket command"
   - Check resources are loaded: Browser DevTools → Network tab

2. **Cards not rendering**:
   - Check browser console for errors
   - Verify Mushroom and other cards are loaded
   - Check entity IDs are valid
   - Verify area assignments

3. **Cache issues**:
   - Always clear cache after updates (Ctrl+Shift+R)
   - Check version query parameter is appended to resources
   - Check manifest version matches bundle version

4. **TypeScript errors**:
   - Run `npm run type-check` to find issues
   - Check imports are correct
   - Verify types match Home Assistant data structures

### Backend Issues
1. **Integration not loading**:
   - Check `manifest.json` is valid JSON
   - Check `requirements` are satisfied
   - Check Python syntax errors
   - Check logs for stack traces

2. **Resources not loading**:
   - Check files exist in `www/` directory
   - Check static path registration succeeded
   - Check resource registration logs
   - Verify version query parameter

3. **WebSocket errors**:
   - Check command is registered in `async_setup`
   - Verify command decorator syntax
   - Check response format matches expected schema

## Version Management

### Updating Version
When releasing a new version, update ALL of these files:
1. `package.json` → `"version": "X.X.X"`
2. `custom_components/linus_dashboard/manifest.json` → `"version": "X.X.X"`
3. `custom_components/linus_dashboard/const.py` → `VERSION = "X.X.X"`
4. `src/linus-strategy.ts` → Update version comment if present
5. `README.md` → Update badge if present

**Use version-bump-prompt**:
```bash
npm run bump  # Automatically updates all files
```

### Cache-Busting
- Resources are loaded with `?v=X.X.X` query parameter
- This forces browsers to fetch new version after updates
- Version is read from `manifest.json` via `get_version()` function
- Critical for avoiding "red error" issues after updates

## Common Patterns

### Adding a New View
1. Create `src/views/XxxView.ts` extending `AbstractView`
2. Implement `getCards()` method
3. Register in `src/linus-strategy.ts` → `createDomainSubviews()`
4. Add icon to `src/variables.ts` → `VIEWS_ICONS`
5. Test card generation and navigation

### Adding a New Card Type
1. Create `src/cards/XxxCard.ts` extending `AbstractCard`
2. Implement `getCard(entity, options)` method
3. Use in relevant view's `getCards()` method
4. Test rendering with sample entities

### Adding a New Configuration Option
1. Add constant to `custom_components/linus_dashboard/const.py`
2. Update `config_flow.py` to include in options flow
3. Update `websocket_get_entities` in `__init__.py` to include in response
4. Access in TypeScript via `Helper.strategyOptions.xxx`
5. Add translations to `translations/en.json` and `translations/fr.json`

### Embedded Dashboard Support
1. User configures embedded dashboard in integration options
2. Frontend receives list via WebSocket
3. `embedLovelace.ts` → `loadEmbeddedDashboard()` fetches dashboard config
4. `processEmbeddedViews()` extracts cards and metadata
5. Views are injected into Linus Dashboard with proper styling

## Performance Considerations

- **Lazy Loading**: Views are generated on-demand, not all at once
- **Entity Filtering**: Filter entities early in the pipeline
- **Caching**: Helper singleton caches hass state
- **Debouncing**: Avoid regenerating dashboard on every state change
- **Bundle Size**: Monitor bundle size with `npm run build:analyze`
- **Large Installs**: Test with 500+ entities to ensure performance

## Testing Checklist

Before releasing:
- [ ] TypeScript compiles without errors (`npm run type-check`)
- [ ] ESLint passes (`npm run lint:check`)
- [ ] Production build succeeds (`npm run build`)
- [ ] Bundle size is reasonable (check `build:analyze`)
- [ ] Home Assistant loads integration without errors
- [ ] Dashboard appears in sidebar with bow-tie icon
- [ ] All views render correctly (areas, domains, home)
- [ ] Cards interact correctly (click, toggle, etc.)
- [ ] Embedded dashboards work (if configured)
- [ ] Version check works (test with mismatched versions)
- [ ] Translations are complete (English and French)
- [ ] Cache-busting works (test by updating version)
- [ ] Works on mobile devices (responsive design)
- [ ] No console errors in browser
- [ ] No errors in Home Assistant logs
