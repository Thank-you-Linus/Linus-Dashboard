import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest';

/**
 * TK-159: diagnostic/config `sensor` and `binary_sensor` entities must never
 * be aggregated as measurements (e.g. Linus Brain's diagnostic illuminance
 * threshold counted as a real lux reading). Exception: device_class battery.
 * Other domains (switch, light, ...) keep counting their config entities.
 * Frontend mirror of the backend `is_aggregatable_entry` predicate.
 */
vi.mock('home-assistant-js-websocket', () => ({}));

import { Helper } from '../../src/Helper';
import * as utils from '../../src/utils';

type Category = 'config' | 'diagnostic' | null;

const TABLE: Array<[string, Category, string | undefined, boolean]> = [
  ['sensor.a', 'diagnostic', undefined, false],
  ['sensor.a', 'config', undefined, false],
  ['sensor.a', 'diagnostic', 'battery', true],
  ['binary_sensor.a', 'diagnostic', 'battery', true],
  ['binary_sensor.a', 'diagnostic', 'occupancy', false],
  ['binary_sensor.a', 'config', undefined, false],
  ['sensor.a', null, 'illuminance', true],
  ['switch.a', 'config', undefined, true],
  ['light.a', 'diagnostic', undefined, true],
];

describe('isAggregatableEntity', () => {
  beforeEach(() => {
    vi.spyOn(Helper, 'getEntityState').mockReturnValue(undefined as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(TABLE)('%s category=%s class=%s -> %s', (entity_id, category, deviceClass, expected) => {
    const entity = { entity_id, entity_category: category } as any;
    expect(utils.isAggregatableEntity(entity, deviceClass)).toBe(expected);
  });

  it('reads device_class from the state when not provided', () => {
    vi.restoreAllMocks();
    vi.spyOn(Helper, 'getEntityState').mockReturnValue({ attributes: { device_class: 'battery' } } as any);
    const entity = { entity_id: 'sensor.remote_battery', entity_category: 'diagnostic' } as any;
    expect(utils.isAggregatableEntity(entity)).toBe(true);
  });
});

describe('Helper.getEntityIds({ aggregate: true })', () => {
  const states: Record<string, any> = {
    'sensor.lux_real': { entity_id: 'sensor.lux_real', state: '120', attributes: { device_class: 'illuminance' } },
    'sensor.lux_threshold': { entity_id: 'sensor.lux_threshold', state: '20', attributes: { device_class: 'illuminance' } },
    'sensor.remote_battery': { entity_id: 'sensor.remote_battery', state: '80', attributes: { device_class: 'battery' } },
    'binary_sensor.link': { entity_id: 'binary_sensor.link', state: 'on', attributes: { device_class: 'connectivity' } },
    'switch.child_lock': { entity_id: 'switch.child_lock', state: 'on', attributes: {} },
  };
  const registry = [
    { entity_id: 'sensor.lux_real', area_id: 'salon', entity_category: null },
    { entity_id: 'sensor.lux_threshold', area_id: 'salon', entity_category: 'diagnostic' },
    { entity_id: 'sensor.remote_battery', area_id: 'salon', entity_category: 'diagnostic' },
    { entity_id: 'binary_sensor.link', area_id: 'salon', entity_category: 'diagnostic' },
    { entity_id: 'switch.child_lock', area_id: 'salon', entity_category: 'config' },
  ];

  beforeAll(async () => {
    const hass: any = {
      states,
      localize: (key: string) => key,
      callWS: vi.fn(async ({ type }: { type: string }) => {
        switch (type) {
          case 'config/entity_registry/list':
            return registry;
          case 'config/area_registry/list':
            return [{ area_id: 'salon', name: 'Salon', floor_id: 'rdc' }];
          case 'config/floor_registry/list':
            return [{ floor_id: 'rdc', name: 'RDC', level: 0 }];
          case 'frontend/get_icons':
            return { resources: {} };
          case 'linus_dashboard/get_config':
            return {};
          default:
            return [];
        }
      }),
    };
    await Helper.initialize({ hass, config: { strategy: { options: {} } } } as any);
  });

  it('keeps every entity when the option is not set', () => {
    expect(Helper.getEntityIds({ domain: 'sensor', device_class: 'illuminance', area_slug: 'salon' }))
      .toEqual(['sensor.lux_real', 'sensor.lux_threshold']);
  });

  it('drops diagnostic sensors but keeps real ones', () => {
    expect(Helper.getEntityIds({ domain: 'sensor', device_class: 'illuminance', area_slug: 'salon', aggregate: true }))
      .toEqual(['sensor.lux_real']);
  });

  it('applies the filter on the floor path too', () => {
    expect(Helper.getEntityIds({ domain: 'sensor', device_class: 'illuminance', floor_id: 'rdc', aggregate: true }))
      .toEqual(['sensor.lux_real']);
  });

  it('keeps a diagnostic battery sensor', () => {
    expect(Helper.getEntityIds({ domain: 'sensor', device_class: 'battery', area_slug: 'salon', aggregate: true }))
      .toEqual(['sensor.remote_battery']);
  });

  it('filters binary_sensor but not switch', () => {
    expect(Helper.getEntityIds({ domain: 'binary_sensor', area_slug: 'salon', aggregate: true })).toEqual([]);
    expect(Helper.getEntityIds({ domain: 'switch', area_slug: 'salon', aggregate: true }))
      .toEqual(['switch.child_lock']);
  });
});
