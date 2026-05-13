# Home Assistant Test Fixture

Versioned Home Assistant fixture for Linus Dashboard E2E testing.

## Purpose

This fixture provides a stable, reproducible Home Assistant environment for Playwright-based regression testing. It preserves the entity↔area↔floor mapping relationships that are critical for Linus Dashboard's view generation.

## Structure

```
ha-fixture/
├── README.md              # This file
├── fixture-version.json   # Fixture metadata and version info
├── configuration.json     # Home Assistant core configuration
├── entity_registry.json   # Entity registry entries
├── device_registry.json   # Device registry entries
├── area_registry.json     # Area definitions with floor mapping
├── floor_registry.json    # Floor definitions
├── label_registry.json    # Label definitions
├── states.json           # Representative entity states
├── icons.json            # Frontend icons (entity_component + services)
└── linus_config.json     # Linus Dashboard configuration
```

## Entity↔Area Mapping

The fixture preserves these critical relationships:

1. **Entity → Area**: Direct via `entity.area_id` or indirect via `entity.device_id` → `device.area_id`
2. **Area → Floor**: Via `area.floor_id`
3. **Device → Area**: Via `device.area_id`
4. **Entity → Device**: Via `entity.device_id`

## Test Scenarios Covered

- Living room (ground floor) with climate, media player, and lights
- Kitchen (ground floor) with sensors and appliances
- Bedroom (first floor) with climate and lights
- Garage (ground floor) with door and car entities
- Outdoor area with weather and security entities

## Updating the Fixture

To update this fixture from a real Home Assistant instance:

1. Export registry data via WebSocket commands:
   - `config/entity_registry/list`
   - `config/device_registry/list`
   - `config/area_registry/list`
   - `config/floor_registry/list`
   - `config/label_registry/list`

2. Export states from `hass.states`

3. Export icons via `frontend/get_icons`

4. Update `fixture-version.json` with new version and timestamp

## Version History

| Version | Date       | Changes |
|---------|------------|---------|
| 1.0.0   | 2025-05-13 | Initial fixture with multi-floor, multi-area setup |

## Usage

The fixture is loaded by the Playwright harness to create a mock Home Assistant environment:

```typescript
import { loadFixture } from './harness/fixture-loader';

const haData = loadFixture('v1.0.0');
```
