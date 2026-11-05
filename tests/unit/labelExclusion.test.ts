import { describe, it, expect, vi, beforeAll } from 'vitest';

/**
 * An excluded label (excluded_targets.label_id) excludes whatever carries it:
 * a labelled device's entities (its temperature no longer shows on the room
 * tile), a labelled room (no longer listed), and a labelled entity.
 * Frozen dataset, real Helper (registries served by a fake callWS).
 */
vi.mock('home-assistant-js-websocket', () => ({}));

import { Helper } from '../../src/Helper';

type Registry = Record<string, unknown>;

const AREAS: Registry[] = [
  { area_id: 'kitchen', name: 'Kitchen', floor_id: 'ground', labels: [] },
  { area_id: 'attic', name: 'Attic', floor_id: 'ground', labels: ['ignore'] },
];

const DEVICES: Registry[] = [
  { id: 'dev_thermo_ignored', area_id: 'kitchen', name: 'Ignored thermometer', labels: ['ignore'] },
  { id: 'dev_thermo_kept', area_id: 'kitchen', name: 'Kept thermometer', labels: [] },
];

const ENTITIES: Registry[] = [
  { entity_id: 'sensor.via_ignored_device', area_id: null, device_id: 'dev_thermo_ignored', labels: [] },
  { entity_id: 'sensor.kept', area_id: null, device_id: 'dev_thermo_kept', labels: [] },
  { entity_id: 'sensor.labelled', area_id: 'kitchen', device_id: null, labels: ['ignore'] },
  { entity_id: 'light.attic', area_id: 'attic', device_id: null, labels: [] },
];

async function initHelper(): Promise<void> {
  const states: Record<string, unknown> = {};
  for (const entity of ENTITIES) {
    const entityId = entity.entity_id as string;
    states[entityId] = {
      entity_id: entityId,
      state: '21',
      attributes: entityId.startsWith('sensor.') ? { device_class: 'temperature', unit_of_measurement: '°C' } : {},
    };
  }
  const hass: any = {
    states,
    localize: (key: string) => key,
    callWS: vi.fn(async ({ type }: { type: string }) => {
      switch (type) {
        case 'config/entity_registry/list':
          return ENTITIES.map(e => ({ ...e }));
        case 'config/device_registry/list':
          return DEVICES.map(d => ({ ...d }));
        case 'config/area_registry/list':
          return AREAS.map(a => ({ ...a }));
        case 'config/floor_registry/list':
          return [{ floor_id: 'ground', name: 'Ground', level: 0 }];
        case 'config/label_registry/list':
          return [{ label_id: 'ignore', name: 'Ignore' }];
        case 'frontend/get_icons':
          return { resources: {} };
        case 'linus_dashboard/get_config':
          return { excluded_targets: { label_id: ['ignore'] } };
        default:
          return [];
      }
    }),
  };
  await Helper.initialize({ hass, config: { strategy: { options: {} } } } as any);
}

describe('excluded labels', () => {
  beforeAll(async () => {
    await initHelper();
  });

  it('excludes a labelled room', () => {
    expect(Helper.isAreaExcluded('attic')).toBe(true);
    expect(Helper.isAreaExcluded('kitchen')).toBe(false);
  });

  it('excludes a labelled device and drops its entities', () => {
    expect(Helper.isDeviceExcluded('dev_thermo_ignored')).toBe(true);
    expect(Helper.entities['sensor.via_ignored_device']).toBeUndefined();
  });

  it('still excludes a directly labelled entity', () => {
    expect(Helper.entities['sensor.labelled']).toBeUndefined();
  });

  it('keeps the room temperature to unlabelled sensors only', () => {
    expect(Helper.entities['sensor.kept']).toBeDefined();
    const kitchenSensors = Helper.getEntityIds({ domain: 'sensor', device_class: 'temperature', area_slug: 'kitchen' });
    expect(kitchenSensors).toEqual(['sensor.kept']);
  });
});
