# 🏠 Home Assistant Integration Rules - Linus Dashboard

> **Purpose**: Specific patterns for Home Assistant custom integrations  
> **Applies to**: Code in `custom_components/linus_dashboard/`

---

## 📋 Integration Lifecycle

### Entry Point (`__init__.py`)

#### async_setup

```python
async def async_setup(hass: HomeAssistant, _config: dict) -> bool:
    """Set up Linus Dashboard component.
    
    Called once when Home Assistant starts, before config entries are loaded.
    Use for global setup (WebSocket commands, event listeners, etc.).
    """
    _LOGGER.info("Setting up Linus Dashboard")
    hass.data.setdefault(DOMAIN, {})
    
    # Register WebSocket commands
    websocket_api.async_register_command(hass, websocket_get_entities)
    
    return True
```

#### async_setup_entry

```python
async def async_setup_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Set up Linus Dashboard from a config entry.
    
    Called when:
    - Integration is configured via UI
    - Home Assistant restarts
    - Integration is reloaded
    """
    _LOGGER.info("Setting up Linus Dashboard entry")
    
    # 1. Register static resources with cache-busting
    await register_static_paths_and_resources(hass, "linus-strategy.js")
    await register_static_paths_and_resources(hass, "lovelace-mushroom/mushroom.js")
    # ... other resources
    
    # 2. Create dashboard panel
    sidebar_title = "Linus Dashboard"
    sidebar_icon = "mdi:bow-tie"
    filename_path = Path(__file__).parent / "lovelace/ui-lovelace.yaml"
    
    dashboard_config = {
        "mode": "yaml",
        "icon": sidebar_icon,
        "title": sidebar_title,
        "filename": str(filename_path),
        "show_in_sidebar": True,
        "require_admin": False,
    }
    
    hass.data["lovelace"].dashboards[DOMAIN] = LovelaceYAML(
        hass, DOMAIN, dashboard_config
    )
    
    _register_panel(hass, DOMAIN, "yaml", dashboard_config, False)
    
    # 3. Store entry reference
    hass.data[DOMAIN][entry.entry_id] = DOMAIN
    
    return True
```

#### async_unload_entry

```python
async def async_unload_entry(hass: HomeAssistant, entry: ConfigEntry) -> bool:
    """Unload a config entry.
    
    Called when:
    - Integration is removed
    - Integration is disabled
    - Home Assistant is shutting down
    
    Must clean up ALL resources.
    """
    _LOGGER.info("Unloading Linus Dashboard entry")
    
    # Remove panel
    panel_url = hass.data[DOMAIN].pop(entry.entry_id, None)
    if panel_url:
        frontend.async_remove_panel(hass, panel_url)
    
    return True
```

---

## 📦 Resource Registration

### Static Path Registration

```python
from homeassistant.components.http import StaticPathConfig

async def register_static_paths_and_resources(
    hass: HomeAssistant, js_file: str
) -> None:
    """
    Register static paths and resources with cache-busting.
    
    CRITICAL: Cache-busting prevents users from seeing stale JavaScript
    after updates. This solves the "red error" issue.
    """
    js_url = f"/{DOMAIN}_files/www/{js_file}"
    js_path = Path(__file__).parent / f"www/{js_file}"
    
    # Check file exists
    if not js_path.exists():
        _LOGGER.warning("File not found: %s - skipping", js_path)
        return
    
    # Register static path (without version)
    await hass.http.async_register_static_paths([
        StaticPathConfig(js_url, str(js_path), cache_headers=False),
    ])
    
    # Get version for cache-busting
    manifest_version = get_version()
    
    # Register resource WITH version query parameter
    versioned_url = f"{js_url}?v={manifest_version}"
    await utils.init_resource(hass, versioned_url, str(manifest_version))
    
    _LOGGER.debug("Registered: %s (v%s)", versioned_url, manifest_version)
```

### Version Management

```python
def get_version() -> str:
    """Get version from manifest.json for cache-busting.
    
    Version is appended to resource URLs to force browser cache invalidation.
    """
    manifest_path = Path(__file__).parent / "manifest.json"
    try:
        with manifest_path.open(encoding="utf-8") as f:
            manifest = json.load(f)
            return manifest.get("version", "unknown")
    except (FileNotFoundError, json.JSONDecodeError, KeyError):
        _LOGGER.exception("Failed to read version")
        return "unknown"
```

**CRITICAL**: Version must match across:
- `package.json` → `"version": "1.3.0"`
- `manifest.json` → `"version": "1.3.0"`
- `const.py` → `VERSION = "1.3.0"`

Use `npm run bump` to update all files automatically.

---

## 🌐 WebSocket API

### Command Registration

```python
from homeassistant.components.websocket_api import (
    websocket_command,
    async_response,
)
from homeassistant.components.websocket_api.connection import ActiveConnection
from homeassistant.components.websocket_api.messages import result_message

@websocket_command({
    "type": "linus_dashboard/get_config",
})
@async_response
async def websocket_get_entities(
    hass: HomeAssistant, 
    connection: ActiveConnection, 
    msg: dict
) -> None:
    """Handle request for config and version info.
    
    Called by frontend on dashboard load to fetch configuration.
    """
    config_entries = hass.config_entries.async_entries(DOMAIN)
    
    if not config_entries:
        connection.send_error(msg["id"], "not_configured", "Integration not configured")
        return
    
    config = {
        CONF_ALARM_ENTITY_IDS: config_entries[0].options.get(CONF_ALARM_ENTITY_IDS, []),
        CONF_WEATHER_ENTITY_ID: config_entries[0].options.get(CONF_WEATHER_ENTITY),
        CONF_HIDE_GREETING: config_entries[0].options.get(CONF_HIDE_GREETING),
        CONF_EXCLUDED_DOMAINS: config_entries[0].options.get(CONF_EXCLUDED_DOMAINS),
        CONF_EMBEDDED_DASHBOARDS: config_entries[0].options.get(CONF_EMBEDDED_DASHBOARDS, []),
        "version": get_version(),  # Include for frontend version check
    }
    
    connection.send_message(result_message(msg["id"], config))
```

### Frontend Usage (TypeScript)

```typescript
// Call WebSocket command from frontend
async function fetchConfig(hass: HomeAssistant): Promise<Config> {
  const response = await hass.callWS({
    type: "linus_dashboard/get_config",
  });
  
  console.log("[Linus Dashboard] Config loaded:", response);
  return response;
}
```

---

## ⚙️ Config Flow

### Basic Config Flow (`config_flow.py`)

```python
from homeassistant import config_entries
from homeassistant.core import callback
import voluptuous as vol

class LinusDashboardConfigFlow(config_entries.ConfigFlow, domain=DOMAIN):
    """Handle config flow for Linus Dashboard."""
    
    VERSION = 1
    
    async def async_step_user(self, user_input=None):
        """Handle initial step (no configuration required)."""
        # Check if already configured
        if self._async_current_entries():
            return self.async_abort(reason="single_instance_allowed")
        
        if user_input is not None:
            return self.async_create_entry(
                title="Linus Dashboard",
                data={},
            )
        
        # Show empty form (no config needed for initial setup)
        return self.async_show_form(step_id="user")
    
    @staticmethod
    @callback
    def async_get_options_flow(config_entry):
        """Get the options flow for this handler."""
        return LinusDashboardOptionsFlow(config_entry)


class LinusDashboardOptionsFlow(config_entries.OptionsFlow):
    """Handle options flow for Linus Dashboard."""
    
    def __init__(self, config_entry):
        """Initialize options flow."""
        self.config_entry = config_entry
    
    async def async_step_init(self, user_input=None):
        """Manage the options."""
        if user_input is not None:
            return self.async_create_entry(title="", data=user_input)
        
        return self.async_show_form(
            step_id="init",
            data_schema=vol.Schema({
                vol.Optional(
                    CONF_WEATHER_ENTITY,
                    default=self.config_entry.options.get(CONF_WEATHER_ENTITY, "")
                ): str,
                vol.Optional(
                    CONF_HIDE_GREETING,
                    default=self.config_entry.options.get(CONF_HIDE_GREETING, False)
                ): bool,
            }),
        )
```

---

## 🎨 Panel Registration

### Dashboard Panel

```python
from homeassistant.components.lovelace import _register_panel
from homeassistant.components.lovelace.dashboard import LovelaceYAML

# Register dashboard panel
dashboard_config = {
    "mode": "yaml",          # Use YAML mode for strategy
    "icon": "mdi:bow-tie",   # Icon in sidebar
    "title": "Linus Dashboard",
    "filename": str(yaml_path),
    "show_in_sidebar": True,
    "require_admin": False,  # Allow non-admin access
}

# Create LovelaceYAML instance
hass.data["lovelace"].dashboards[DOMAIN] = LovelaceYAML(
    hass, DOMAIN, dashboard_config
)

# Register panel
_register_panel(hass, DOMAIN, "yaml", dashboard_config, False)
```

### YAML Strategy Configuration

```yaml
# custom_components/linus_dashboard/lovelace/ui-lovelace.yaml
strategy:
  type: custom:linus-strategy
title: Linus Dashboard
views: []
```

---

## 🔧 Constants (`const.py`)

```python
"""Constants for Linus Dashboard."""

DOMAIN = "linus_dashboard"
VERSION = "1.3.0"

# Configuration
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

---

## 📝 Manifest (`manifest.json`)

```json
{
  "domain": "linus_dashboard",
  "name": "Linus dashboard",
  "after_dependencies": [
    "sensor",
    "media_player",
    "light",
    "switch",
    "climate",
    "cover",
    "binary_sensor",
    "device_tracker",
    "person",
    "fan",
    "lock",
    "vacuum"
  ],
  "codeowners": ["@Thank-you-Linus"],
  "config_flow": true,
  "dependencies": ["http"],
  "documentation": "https://github.com/Thank-you-Linus/Linus-Dashboard",
  "iot_class": "calculated",
  "issue_tracker": "https://github.com/Thank-you-Linus/Linus-Dashboard/issues",
  "requirements": [],
  "version": "1.3.0"
}
```

**Key Fields:**
- `after_dependencies`: Load after these domains (ensures entities exist)
- `config_flow`: Enable UI configuration
- `dependencies`: Require these HA components
- `iot_class`: "calculated" (no cloud/local device communication)
- `requirements`: Python packages (none needed for Linus Dashboard)

---

## 🐛 Common Issues and Solutions

### Issue: Resources Not Loading (Red Error)

**Cause**: Browser cache serving old JavaScript files

**Solution**:
1. Ensure version query parameter is appended: `?v=1.3.0`
2. Check `get_version()` returns correct version
3. Verify `versioned_url` in resource registration
4. Users must clear cache: Ctrl+Shift+R

**Prevention**:
```python
# Always use versioned URLs
versioned_url = f"{js_url}?v={manifest_version}"
await utils.init_resource(hass, versioned_url, str(manifest_version))
```

### Issue: Dashboard Not Appearing in Sidebar

**Cause**: Panel registration failed or YAML file not found

**Solution**:
1. Check YAML file exists: `custom_components/linus_dashboard/lovelace/ui-lovelace.yaml`
2. Verify panel registration logs
3. Check `hass.data["lovelace"].dashboards` contains entry
4. Restart Home Assistant

### Issue: Frontend Can't Fetch Config

**Cause**: WebSocket command not registered

**Solution**:
1. Ensure `async_setup` registers command
2. Check command decorator syntax
3. Verify command type matches frontend call: `linus_dashboard/get_config`

### Issue: Version Mismatch Warning

**Cause**: Frontend and backend versions don't match

**Solution**:
1. Rebuild frontend: `npm run build`
2. Update all version files: `npm run bump`
3. Verify manifest version matches package.json
4. Clear browser cache

---

## ✅ Integration Checklist

Before release:

- [ ] **manifest.json**: Valid JSON, version matches package.json
- [ ] **__init__.py**: Implements async_setup, async_setup_entry, async_unload_entry
- [ ] **config_flow.py**: Config flow and options flow implemented
- [ ] **const.py**: All constants defined, version matches
- [ ] **Resources**: All JS files registered with cache-busting
- [ ] **Panel**: Dashboard appears in sidebar with correct icon
- [ ] **WebSocket**: Commands registered and working
- [ ] **YAML**: Strategy configuration file exists
- [ ] **Cleanup**: async_unload_entry removes all resources
- [ ] **Logging**: Appropriate log levels used
- [ ] **Testing**: Manual testing on Home Assistant instance
