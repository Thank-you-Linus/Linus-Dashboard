/**
 * Home Assistant Fixture Loader
 *
 * Loads versioned HA fixture data for E2E testing.
 * Provides consistent, reproducible Home Assistant state.
 */

import * as fs from 'fs';
import * as path from 'path';

export interface HAFixture {
  version: string;
  configuration: any;
  entityRegistry: any[];
  deviceRegistry: any[];
  areaRegistry: any[];
  floorRegistry: any[];
  labelRegistry: any[];
  states: Record<string, any>;
  icons: any;
  linusConfig: any;
}

const FIXTURE_DIR = path.resolve(process.cwd(), 'tests/ha-fixture');

/**
 * Load a Home Assistant fixture by version.
 * Currently only supports 'v1.0.0'.
 */
export function loadFixture(version: string = 'v1.0.0'): HAFixture {
  if (version !== 'v1.0.0') {
    throw new Error(`Unknown fixture version: ${version}. Supported: v1.0.0`);
  }

  return {
    version,
    configuration: loadJSON('configuration.json', {}),
    entityRegistry: loadJSON('entity_registry.json', []).entities || [],
    deviceRegistry: loadJSON('device_registry.json', []).devices || [],
    areaRegistry: loadJSON('area_registry.json', []).areas || [],
    floorRegistry: loadJSON('floor_registry.json', []).floors || [],
    labelRegistry: loadJSON('label_registry.json', []).labels || [],
    states: loadJSON('states.json', {}).states || {},
    icons: loadJSON('icons.json', {}),
    linusConfig: loadJSON('linus_config.json', {}),
  };
}

/**
 * Load a JSON file from the fixture directory.
 */
function loadJSON(filename: string, defaultValue: any): any {
  const filepath = path.join(FIXTURE_DIR, filename);

  if (!fs.existsSync(filepath)) {
    console.warn(`Fixture file not found: ${filepath}, using default`);
    return defaultValue;
  }

  try {
    const content = fs.readFileSync(filepath, 'utf-8');
    return JSON.parse(content);
  } catch (e) {
    console.error(`Failed to load fixture ${filename}:`, e);
    return defaultValue;
  }
}

/**
 * Get fixture metadata.
 */
export function getFixtureInfo(): { version: string; created: string; description: string } {
  try {
    const versionPath = path.join(FIXTURE_DIR, 'fixture-version.json');
    const content = fs.readFileSync(versionPath, 'utf-8');
    const info = JSON.parse(content);
    return {
      version: info.version,
      created: info.created,
      description: info.description,
    };
  } catch (e) {
    return {
      version: 'unknown',
      created: 'unknown',
      description: 'Failed to load fixture info',
    };
  }
}

/**
 * Validate that the fixture has the expected entity↔area mappings.
 */
export function validateEntityAreaMapping(fixture: HAFixture): {
  valid: boolean;
  errors: string[];
  stats: { entities: number; areas: number; devices: number; floors: number };
} {
  const errors: string[] = [];

  const stats = {
    entities: fixture.entityRegistry.length,
    areas: fixture.areaRegistry.length,
    devices: fixture.deviceRegistry.length,
    floors: fixture.floorRegistry.length,
  };

  const validAreaIds = new Set(fixture.areaRegistry.map((a) => a.area_id));
  const validDeviceIds = new Set(fixture.deviceRegistry.map((d) => d.id));

  for (const entity of fixture.entityRegistry) {
    if (entity.area_id && !validAreaIds.has(entity.area_id)) {
      errors.push(`Entity ${entity.entity_id} references unknown area: ${entity.area_id}`);
    }
    if (entity.device_id && !validDeviceIds.has(entity.device_id)) {
      errors.push(`Entity ${entity.entity_id} references unknown device: ${entity.device_id}`);
    }
  }

  for (const device of fixture.deviceRegistry) {
    if (device.area_id && !validAreaIds.has(device.area_id)) {
      errors.push(`Device ${device.id} references unknown area: ${device.area_id}`);
    }
  }

  const validFloorIds = new Set(fixture.floorRegistry.map((f) => f.floor_id));
  for (const area of fixture.areaRegistry) {
    if (area.floor_id && !validFloorIds.has(area.floor_id)) {
      errors.push(`Area ${area.area_id} references unknown floor: ${area.floor_id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    stats,
  };
}
