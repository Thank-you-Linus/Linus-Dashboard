# Copilot Instructions for Linus Dashboard

## Big Picture Architecture
- **Linus Dashboard** is a Home Assistant custom integration and frontend dashboard, designed for plug-and-play use. It auto-organizes devices into smart sections by room and type.
- Main components:
  - `custom_components/linus_dashboard/`: Python backend for Home Assistant integration (setup, config flow, entity management).
  - `src/`: TypeScript/JS frontend (Lovelace UI cards, chips, popups, views, helpers, types).
  - `config/`: Home Assistant configuration, scenes, blueprints, logs, and database files.
  - `custom_components/magic_areas/`: Optional integration for advanced room logic.
- **Data flow:** Home Assistant core → custom_components (Python) → Lovelace frontend (TypeScript) → User UI.

## Developer Workflows
- **Install/Run:**
  - **Dev Container (Recommended):** Open in VS Code, container auto-installs dependencies, run `make dev`
  - **Manual:** Use HACS for easy install, or copy `linus_dashboard` to `custom_components` and restart Home Assistant.
  - For local dev, run `./scripts/develop` to start Home Assistant on port 8123.
- **Build frontend:**
  - Use `npm install` then `npm run build` or `make build` (see `package.json` scripts).
  - Development: `npm run build-dev` for watch mode with source maps.
  - Production: `make build-prod` for optimized build.
  - **Build system**: Uses Rspack (like Home Assistant) instead of Webpack for faster builds and better compatibility.
  - TypeScript config: `tsconfig.json`, Rspack configs: `rspack.config.cjs` / `rspack.dev.config.cjs`.
  - Babel config: `babel.config.js` for transpilation, `.browserslistrc` for browser support.
- **Debugging:**
  - Python: Use VS Code debug configs (F5) for Home Assistant and integration debugging.
  - Frontend: Source maps enabled, use browser dev tools for TypeScript debugging.
- **Linting:**
  - Run `./scripts/lint` or `make lint` for Python (Ruff) and TypeScript (ESLint) linting.
  - Auto-formatting with Prettier and Ruff on save.
  - ESLint config follows Home Assistant patterns with lit-element and unused-imports plugins.
- **Python environment:**
  - Uses local venv in `ha-env/`. Interpreter path: `./ha-env/bin/python`.
  - Extra Python paths set in `.vscode/settings.json` for custom components and site-packages.
  - Setup via `./scripts/setup` or `make setup`.

## Project-Specific Conventions
- **TypeScript types** in `src/types/` are adapted from upstream Home Assistant and Mushroom projects; properties may differ from originals.
- **Frontend UI** is organized by cards, chips, popups, and views in `src/`.
- **Custom Python components** follow Home Assistant integration patterns (manifest, config_flow, entity, diagnostics, etc.).
- **Magic Areas** integration is optional but supported for advanced room logic.
- **Images/screenshots** in `images/` are used for documentation and UI previews.

## Integration Points & Dependencies
- **Home Assistant** (core platform, required)
- **HACS** (optional, for install/update)
- **magic_areas** (optional, for room logic)
- **Lovelace Mushroom** (frontend UI types, see `src/types/lovelace-mushroom/`)
- **Home Assistant Frontend** (see `src/types/homeassistant/`)

## Examples & Patterns
- **Add a new Lovelace card:** Place in `src/cards/`, update `src/views/` as needed.
- **Add a new Python entity:** Place in `custom_components/linus_dashboard/`, update `manifest.json` and `config_flow.py`.
- **Update types:** Edit files in `src/types/`, respecting project-specific adaptations.

## Troubleshooting
- **Timeout errors:** See README troubleshooting section; clear cache, force refresh, check network setup.
- **Icon missing:** Restart Home Assistant after install.

## Key Files & Directories
- `custom_components/linus_dashboard/` — backend integration
- `src/` — frontend UI
- `config/` — Home Assistant config
- `ha-env/` — Python environment
- `scripts/` — dev scripts
- `images/` — documentation assets
- `.devcontainer/` — portable dev environment
- `Makefile` — convenient dev commands

---
For more details, see [README.md](../README.md) and [thankyou-linus.com](https://thankyou-linus.com/).
