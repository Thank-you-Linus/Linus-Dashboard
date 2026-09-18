import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Helper before importing EntityResolver
const mockMagicAreasDevices: Record<string, any> = {};
const mockDevices: Record<string, any> = {};
// slug -> area_id, mirroring Helper's #slugToAreaIdMap reverse index.
const mockAreaIdBySlug: Record<string, string> = {};

vi.mock('../../src/Helper', () => ({
  Helper: {
    magicAreasDevices: mockMagicAreasDevices,
    devices: mockDevices,
    getAreaIdBySlug: (slug: string) => mockAreaIdBySlug[slug],
  },
}));

// Mock home-assistant-js-websocket
vi.mock('home-assistant-js-websocket', () => ({}));

describe('EntityResolver', () => {
  let EntityResolver: any;

  beforeEach(async () => {
    // Clear mocks
    Object.keys(mockMagicAreasDevices).forEach(k => delete mockMagicAreasDevices[k]);
    Object.keys(mockDevices).forEach(k => delete mockDevices[k]);
    Object.keys(mockAreaIdBySlug).forEach(k => delete mockAreaIdBySlug[k]);

    // Re-import (dynamic import bypasses cached mock issues)
    const mod = await import('../../src/utils/entityResolver');
    EntityResolver = mod.EntityResolver;
  });

  function makeHass(states: Record<string, any> = {}) {
    return { states } as any;
  }

  describe('detectMagicAreas', () => {
    it('returns false when no MA devices exist', () => {
      const resolver = new EntityResolver(makeHass({}));
      expect(resolver.getDetectionStatus().hasMagicAreas).toBe(false);
      expect(resolver.getDetectionStatus().mode).toBe('none');
    });

    it('returns true when an MA device has a non-unavailable area_state entity', () => {
      mockMagicAreasDevices['salon'] = {
        slug: 'salon',
        entities: {
          area_state: { entity_id: 'sensor.magic_areas_area_state_salon' },
        },
      };

      const resolver = new EntityResolver(makeHass({
        'sensor.magic_areas_area_state_salon': { state: 'occupied' },
      }));

      expect(resolver.getDetectionStatus().hasMagicAreas).toBe(true);
    });

    it('returns false when MA devices exist but all entities are unavailable', () => {
      mockMagicAreasDevices['salon'] = {
        slug: 'salon',
        entities: {
          area_state: { entity_id: 'sensor.magic_areas_area_state_salon' },
        },
      };

      const resolver = new EntityResolver(makeHass({
        'sensor.magic_areas_area_state_salon': { state: 'unavailable' },
      }));

      expect(resolver.getDetectionStatus().hasMagicAreas).toBe(false);
    });

    it('falls back to other MA entities when area_state is unavailable', () => {
      mockMagicAreasDevices['salon'] = {
        slug: 'salon',
        entities: {
          area_state: { entity_id: 'sensor.magic_areas_area_state_salon' },
          all_lights: { entity_id: 'light.magic_areas_all_lights_salon' },
        },
      };

      const resolver = new EntityResolver(makeHass({
        'sensor.magic_areas_area_state_salon': { state: 'unavailable' },
        'light.magic_areas_all_lights_salon': { state: 'on' },
      }));

      expect(resolver.getDetectionStatus().hasMagicAreas).toBe(true);
    });
  });

  describe('resolveMagicAreasEntity', () => {
    it('returns the MA entity when available', () => {
      mockMagicAreasDevices['salon'] = {
        slug: 'salon',
        entities: {
          climate_group: { entity_id: 'climate.magic_areas_climate_salon' },
        },
      };

      const resolver = new EntityResolver(makeHass({}));
      const result = resolver.resolveMagicAreasEntity('salon', 'climate_group');

      expect(result.entity_id).toBe('climate.magic_areas_climate_salon');
      expect(result.source).toBe('magic_areas');
    });

    it('returns null when MA entity not found', () => {
      mockMagicAreasDevices['salon'] = {
        slug: 'salon',
        entities: {},
      };

      const resolver = new EntityResolver(makeHass({}));
      const result = resolver.resolveMagicAreasEntity('salon', 'climate_group');

      expect(result.entity_id).toBeNull();
      expect(result.source).toBe('native');
    });
  });

  describe('resolveClimateControlSwitch', () => {
    it('returns MA climate_control entity when MA is available', () => {
      mockMagicAreasDevices['salon'] = {
        slug: 'salon',
        entities: {
          area_state: { entity_id: 'sensor.magic_areas_area_state_salon' },
          climate_control: { entity_id: 'switch.magic_areas_climate_control_salon' },
        },
      };

      const resolver = new EntityResolver(makeHass({
        'sensor.magic_areas_area_state_salon': { state: 'occupied' },
      }));

      const result = resolver.resolveClimateControlSwitch('salon');
      expect(result.entity_id).toBe('switch.magic_areas_climate_control_salon');
      expect(result.source).toBe('magic_areas');
    });
  });

  describe('resolveMediaPlayerControlSwitch', () => {
    it('returns MA media_player_control entity when MA is available', () => {
      mockMagicAreasDevices['salon'] = {
        slug: 'salon',
        entities: {
          area_state: { entity_id: 'sensor.magic_areas_area_state_salon' },
          media_player_control: { entity_id: 'switch.magic_areas_media_player_control_salon' },
        },
      };

      const resolver = new EntityResolver(makeHass({
        'sensor.magic_areas_area_state_salon': { state: 'occupied' },
      }));

      const result = resolver.resolveMediaPlayerControlSwitch('salon');
      expect(result.entity_id).toBe('switch.magic_areas_media_player_control_salon');
      expect(result.source).toBe('magic_areas');
    });
  });

  /**
   * Regression: the backend names its area-scope group entities from the real
   * `area_id`, while the frontend used to rebuild them from the slug derived
   * from the area *name*. On a renamed (or non-ASCII named) area the two
   * diverge and every group lookup silently missed.
   *
   * Real ha-test case: area_id "cuisine", name « Køkken » → slug "kokken".
   */
  describe('area_id / slug divergence (renamed or non-ASCII area name)', () => {
    const SLUG = 'kokken';
    const AREA_ID = 'cuisine';

    beforeEach(() => {
      mockAreaIdBySlug[SLUG] = AREA_ID;
    });

    it('resolveAllLights targets the area_id form, not the name slug', () => {
      const resolver = new EntityResolver(makeHass({
        [`light.linus_dashboard_all_lights_area_${AREA_ID}`]: { state: 'on' },
      }));

      const result = resolver.resolveAllLights(SLUG);

      expect(result.entity_id).toBe(`light.linus_dashboard_all_lights_area_${AREA_ID}`);
      expect(result.source).toBe('native');
    });

    it('resolvePresenceSensor targets the area_id form, not the name slug', () => {
      const resolver = new EntityResolver(makeHass({
        [`binary_sensor.linus_dashboard_presence_detection_area_${AREA_ID}`]: { state: 'on' },
      }));

      const result = resolver.resolvePresenceSensor(SLUG);

      expect(result.entity_id).toBe(
        `binary_sensor.linus_dashboard_presence_detection_area_${AREA_ID}`
      );
    });

    it('resolveGroupEntity targets the area_id form, not the name slug', () => {
      const resolver = new EntityResolver(makeHass({
        [`switch.linus_dashboard_all_switches_area_${AREA_ID}`]: { state: 'off' },
      }));

      const result = resolver.resolveGroupEntity('switch', 'all_switches', SLUG);

      expect(result.entity_id).toBe(`switch.linus_dashboard_all_switches_area_${AREA_ID}`);
    });

    it('never resolves the name-slug entity, even when it happens to exist', () => {
      const resolver = new EntityResolver(makeHass({
        [`light.linus_dashboard_all_lights_area_${SLUG}`]: { state: 'on' },
      }));

      // No area_id-named entity exists → nothing to resolve. Falling back to
      // the name slug is forbidden: a renamed area could otherwise resolve
      // another room's light group.
      expect(resolver.resolveAllLights(SLUG).entity_id).toBeNull();
    });

    it('returns null rather than guessing when the slug maps to no area_id', () => {
      delete mockAreaIdBySlug[SLUG];

      const resolver = new EntityResolver(makeHass({
        [`light.linus_dashboard_all_lights_area_${SLUG}`]: { state: 'on' },
        [`light.linus_dashboard_all_lights_area_${AREA_ID}`]: { state: 'on' },
      }));

      expect(resolver.resolveAllLights(SLUG).entity_id).toBeNull();
    });

    it('keeps the Magic Areas all_lights fallback indexed by the name slug', () => {
      // Helper.magicAreasDevices is keyed by a slug derived from the Magic
      // Areas *device name* (getMagicAreaSlug), never by area_id — the
      // area_id translation must not leak into this lookup.
      mockMagicAreasDevices[SLUG] = {
        slug: SLUG,
        entities: {
          area_state: { entity_id: `sensor.magic_areas_area_state_${SLUG}` },
          all_lights: { entity_id: `light.magic_areas_all_lights_${SLUG}` },
        },
      };

      const resolver = new EntityResolver(makeHass({
        [`sensor.magic_areas_area_state_${SLUG}`]: { state: 'occupied' },
      }));

      // No native entity in hass.states → falls through to Magic Areas.
      const result = resolver.resolveAllLights(SLUG);

      expect(result.entity_id).toBe(`light.magic_areas_all_lights_${SLUG}`);
      expect(result.source).toBe('magic_areas');
    });

    it('still reaches the Magic Areas fallback when the slug maps to no area_id', () => {
      delete mockAreaIdBySlug[SLUG];
      mockMagicAreasDevices[SLUG] = {
        slug: SLUG,
        entities: {
          area_state: { entity_id: `sensor.magic_areas_area_state_${SLUG}` },
          all_lights: { entity_id: `light.magic_areas_all_lights_${SLUG}` },
        },
      };

      const resolver = new EntityResolver(makeHass({
        [`sensor.magic_areas_area_state_${SLUG}`]: { state: 'occupied' },
      }));

      const result = resolver.resolveAllLights(SLUG);

      expect(result.entity_id).toBe(`light.magic_areas_all_lights_${SLUG}`);
      expect(result.source).toBe('magic_areas');
    });

    it('leaves floor-scope resolution on the raw floor_id', () => {
      const resolver = new EntityResolver(makeHass({
        'light.linus_dashboard_all_lights_floor_rez_de_chaussee': { state: 'on' },
        'binary_sensor.linus_dashboard_presence_detection_floor_rez_de_chaussee': { state: 'on' },
      }));

      expect(resolver.resolveAllLightsForFloor('rez_de_chaussee').entity_id)
        .toBe('light.linus_dashboard_all_lights_floor_rez_de_chaussee');
      expect(resolver.resolvePresenceSensorForFloor('rez_de_chaussee').entity_id)
        .toBe('binary_sensor.linus_dashboard_presence_detection_floor_rez_de_chaussee');
    });
  });

  describe('detection modes', () => {
    it('detects hybrid mode when both LB and MA are present', () => {
      mockMagicAreasDevices['salon'] = {
        slug: 'salon',
        entities: {
          area_state: { entity_id: 'sensor.magic_areas_area_state_salon' },
        },
      };
      mockDevices['lb_device'] = {
        manufacturer: 'Linus Brain',
        model: 'Area Intelligence',
      };

      const resolver = new EntityResolver(makeHass({
        'sensor.magic_areas_area_state_salon': { state: 'occupied' },
        'sensor.linus_brain_monitored_areas': { state: '5' },
      }));

      const status = resolver.getDetectionStatus();
      expect(status.hasLinusBrain).toBe(true);
      expect(status.hasMagicAreas).toBe(true);
      expect(status.mode).toBe('hybrid');
    });

    it('detects none mode when neither LB nor MA are present', () => {
      const resolver = new EntityResolver(makeHass({}));
      const status = resolver.getDetectionStatus();
      expect(status.hasLinusBrain).toBe(false);
      expect(status.hasMagicAreas).toBe(false);
      expect(status.mode).toBe('none');
    });
  });
});
