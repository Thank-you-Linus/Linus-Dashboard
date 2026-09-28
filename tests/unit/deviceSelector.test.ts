import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * getDevicesForScope / getDeviceEntityIds / getDeviceName (TK-60).
 *
 * Helper is mocked with the entityResolver.test.ts pattern: module-level
 * mutable records, `areas` indexed by slug (never by area_id), exclusions
 * driven by Sets. OWN_AGGREGATE_PLATFORMS is NOT mocked: the real platform
 * rule is exercised.
 */

const mockAreas: Record<string, any> = {};
const mockFloors: any[] = [];
const mockDevices: Record<string, any> = {};
const mockEntities: Record<string, any> = {};
const mockAreaOptions: Record<string, any> = {};
const excludedFloors = new Set<string>();
const excludedAreas = new Set<string>();
const excludedDevices = new Set<string>();
let mockLocalize: (key: string) => string = () => 'translation not found';

vi.mock('../../src/Helper', () => ({
  Helper: {
    isInitialized: vi.fn(() => true),
    debug: false,
    get areas() { return mockAreas; },
    get orderedFloors() { return mockFloors; },
    get devices() { return mockDevices; },
    get entities() { return mockEntities; },
    strategyOptions: { areas: mockAreaOptions, domains: {}, debug: false },
    isFloorExcluded: (id: string | undefined) => !!id && excludedFloors.has(id),
    isAreaExcluded: (id: string | undefined) => !!id && excludedAreas.has(id),
    isDeviceExcluded: (id: string | undefined) => !!id && excludedDevices.has(id),
    localize: (key: string) => mockLocalize(key),
  },
}));

vi.mock('home-assistant-js-websocket', () => ({}));

function device(id: string, extra: Record<string, any> = {}): any {
  return {
    id,
    area_id: null,
    name: `Device ${id}`,
    name_by_user: null,
    model: null,
    manufacturer: 'Acme',
    entry_type: null,
    disabled_by: null,
    floor_id: null,
    entities: [`light.${id}`],
    ...extra,
  };
}

function entity(entity_id: string, platform = 'hue'): any {
  return { entity_id, platform };
}

/** Registers an area (indexed by slug) and its devices + their entities. */
function addArea(area_id: string, slug: string, name: string, floor_id: string, devices: any[]): void {
  mockAreas[slug] = { area_id, slug, name, floor_id, devices: devices.map(d => d.id), entities: [] };
  for (const d of devices) {
    mockDevices[d.id] = { ...d, area_id };
    for (const e of d.entities) {
      if (!mockEntities[e]) mockEntities[e] = entity(e);
    }
  }
}

function ids(devices: any[]): string[] {
  return devices.map(d => d.id);
}

describe('deviceSelector', () => {
  let getDevicesForScope: any;
  let getDeviceEntityIds: any;

  beforeEach(async () => {
    for (const rec of [mockAreas, mockDevices, mockEntities, mockAreaOptions]) {
      Object.keys(rec).forEach(k => delete rec[k]);
    }
    mockFloors.length = 0;
    excludedFloors.clear();
    excludedAreas.clear();
    excludedDevices.clear();

    const mod = await import('../../src/utils/deviceSelector');
    getDevicesForScope = mod.getDevicesForScope;
    getDeviceEntityIds = mod.getDeviceEntityIds;
  });

  describe('area scope — slug !== area_id (AC 2)', () => {
    beforeEach(() => {
      mockFloors.push({ floor_id: 'rdc', areas_slug: ['cuisine_ete'] });
      addArea('cuisine', 'cuisine_ete', 'Cuisine Été', 'rdc', [device('frigo'), device('four')]);
    });

    it('returns the devices of the area addressed by its slug', () => {
      expect(ids(getDevicesForScope({ scope: 'area', area_slug: 'cuisine_ete' }))).toEqual(['frigo', 'four']);
    });

    it('does not resolve an area by its area_id', () => {
      expect(getDevicesForScope({ scope: 'area', area_slug: 'cuisine' })).toEqual([]);
    });

    it('never indexes Helper.areas by an area_id in the source', () => {
      const source = readFileSync(resolve(__dirname, '../../src/utils/deviceSelector.ts'), 'utf8');
      const lookups = source.split('\n').filter(line => line.includes('Helper.areas['));
      expect(lookups.length).toBeGreaterThan(0);
      for (const line of lookups) {
        expect(line).not.toMatch(/Helper\.areas\[[^\]]*area_id/);
      }
    });
  });

  describe('global scope — visibility and exclusions (AC 3)', () => {
    beforeEach(() => {
      mockFloors.push(
        { floor_id: 'rdc', areas_slug: ['salon', 'bureau', 'garage', 'cellier'] },
        { floor_id: 'etage', areas_slug: ['chambre'] },
        { floor_id: 'grenier', hidden: true, areas_slug: ['combles'] },
      );
      addArea('salon', 'salon', 'Salon', 'rdc', [
        device('lampe'),
        device('tv_exclue'),
        device('prise_desactivee', { disabled_by: 'user' }),
      ]);
      addArea('bureau', 'bureau', 'Bureau', 'rdc', [device('ecran')]);
      addArea('garage', 'garage', 'Garage', 'rdc', [device('porte_garage')]);
      addArea('cellier', 'cellier', 'Cellier', 'rdc', [device('congelateur')]);
      addArea('chambre', 'chambre', 'Chambre', 'etage', [device('chevet')]);
      addArea('combles', 'combles', 'Combles', 'grenier', [device('ventilo_combles')]);
      // Magic Areas device: Helper never puts it in StrategyArea.devices,
      // but it IS in Helper.devices — must not leak into any scope.
      mockDevices['ma_salon'] = device('ma_salon', { manufacturer: 'Magic Areas', area_id: 'salon' });

      excludedAreas.add('garage');
      excludedFloors.add('etage');
      excludedDevices.add('tv_exclue');
      mockAreaOptions['cellier'] = { hidden: true };
    });

    it('keeps only devices of visible areas and floors, minus excluded / disabled / Magic Areas devices', () => {
      expect(ids(getDevicesForScope({ scope: 'global' }))).toEqual(['lampe', 'ecran']);
    });

    it.each([
      ['a device of an excluded area', 'porte_garage'],
      ['a device of an excluded floor', 'chevet'],
      ['a device of a hidden area', 'congelateur'],
      ['a device of a hidden floor', 'ventilo_combles'],
      ['an excluded device', 'tv_exclue'],
      ['a Magic Areas device', 'ma_salon'],
      ['a disabled device', 'prise_desactivee'],
    ])('global scope excludes %s', (_label, deviceId) => {
      expect(ids(getDevicesForScope({ scope: 'global' }))).not.toContain(deviceId);
    });

    it('floor scope applies the same exclusions', () => {
      expect(ids(getDevicesForScope({ scope: 'floor', floor_id: 'rdc' }))).toEqual(['lampe', 'ecran']);
      expect(getDevicesForScope({ scope: 'floor', floor_id: 'etage' })).toEqual([]);
      expect(getDevicesForScope({ scope: 'floor', floor_id: 'grenier' })).toEqual([]);
    });

    it('area scope applies the same exclusions', () => {
      expect(ids(getDevicesForScope({ scope: 'area', area_slug: 'salon' }))).toEqual(['lampe']);
      expect(getDevicesForScope({ scope: 'area', area_slug: 'garage' })).toEqual([]);
      expect(getDevicesForScope({ scope: 'area', area_slug: 'cellier' })).toEqual([]);
      expect(getDevicesForScope({ scope: 'area', area_slug: 'chambre' })).toEqual([]);
    });

    it('returns [] without throwing for an unknown scope, slug or floor', () => {
      expect(getDevicesForScope({ scope: 'device' as any })).toEqual([]);
      expect(getDevicesForScope({ scope: 'area', area_slug: 'inconnue' })).toEqual([]);
      expect(getDevicesForScope({ scope: 'area' })).toEqual([]);
      expect(getDevicesForScope({ scope: 'floor', floor_id: 'inconnu' })).toEqual([]);
      expect(getDevicesForScope({ scope: 'floor' })).toEqual([]);
    });
  });

  describe('device entities, disabled and service devices (AC 4)', () => {
    beforeEach(() => {
      mockFloors.push({ floor_id: 'rdc', areas_slug: ['salon'] });
      addArea('salon', 'salon', 'Salon', 'rdc', [
        device('plafonnier', {
          entities: ['light.linus_dashboard_all_lights_area_salon', 'light.salon_plafond'],
        }),
        device('desactive', { disabled_by: 'user' }),
        device('service_vide', { entry_type: 'service', entities: ['sensor.ma_aggregate'] }),
        device('service_utile', { entry_type: 'service', entities: ['sensor.meteo_temperature'] }),
      ]);
      mockEntities['light.linus_dashboard_all_lights_area_salon'] = entity('light.linus_dashboard_all_lights_area_salon', 'linus_dashboard');
      mockEntities['sensor.ma_aggregate'] = entity('sensor.ma_aggregate', 'magic_areas');
    });

    it('getDeviceEntityIds drops our own aggregate entities', () => {
      expect(getDeviceEntityIds(mockDevices['plafonnier'])).toEqual(['light.salon_plafond']);
    });

    it('getDeviceEntityIds drops entities Helper did not keep', () => {
      const d = device('fantome', { entities: ['light.excluded_by_helper', 'light.salon_plafond'] });
      mockEntities['light.salon_plafond'] = entity('light.salon_plafond');
      expect(getDeviceEntityIds(d)).toEqual(['light.salon_plafond']);
    });

    it('a disabled device is absent from every scope', () => {
      for (const opts of [{ scope: 'global' }, { scope: 'floor', floor_id: 'rdc' }, { scope: 'area', area_slug: 'salon' }]) {
        expect(ids(getDevicesForScope(opts))).not.toContain('desactive');
      }
    });

    it('a service device is kept only if an entity remains after filtering', () => {
      for (const opts of [{ scope: 'global' }, { scope: 'floor', floor_id: 'rdc' }, { scope: 'area', area_slug: 'salon' }]) {
        const result = ids(getDevicesForScope(opts));
        expect(result).toContain('service_utile');
        expect(result).not.toContain('service_vide');
      }
    });
  });
});

describe('getDeviceName (AC 4)', () => {
  let getDeviceName: any;

  beforeEach(async () => {
    mockLocalize = () => 'translation not found';
    const mod = await import('../../src/utils');
    getDeviceName = mod.getDeviceName;
  });

  it('prefers name_by_user', () => {
    expect(getDeviceName(device('a', { name: 'Hue bulb', name_by_user: 'Lampe salon' }))).toBe('Lampe salon');
  });

  it('falls back to name when name_by_user is null or empty', () => {
    expect(getDeviceName(device('b', { name: 'Hue bulb', name_by_user: null }))).toBe('Hue bulb');
    expect(getDeviceName(device('c', { name: 'Hue bulb', name_by_user: '' }))).toBe('Hue bulb');
  });

  it('falls back to model, then to the localized label', () => {
    expect(getDeviceName(device('d', { name: null, model: 'LCT015' }))).toBe('LCT015');
    mockLocalize = (key) => (key === 'ui.panel.config.devices.unnamed_device' ? 'Appareil sans nom' : 'translation not found');
    expect(getDeviceName(device('e', { name: null }))).toBe('Appareil sans nom');
  });

  it('never returns a string containing device.id', () => {
    const uuid = '8f3c1e2a9b7d4c6e8f0a1b2c3d4e5f60';
    for (const localized of ['translation not found', '', 'Device {id}']) {
      mockLocalize = () => localized;
      const name = getDeviceName(device(uuid, { name: null, name_by_user: null, model: null }));
      expect(name).toBe('Unnamed device');
      expect(name).not.toContain(uuid);
    }
  });

  it('is memoized by object identity', () => {
    const d = device('f', { name: 'Avant' });
    expect(getDeviceName(d)).toBe('Avant');
    d.name = 'Après';
    expect(getDeviceName(d)).toBe('Avant');
    expect(getDeviceName({ ...d })).toBe('Après');
  });
});
