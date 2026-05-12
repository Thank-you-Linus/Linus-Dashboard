import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Helper before importing EntityResolver
const mockMagicAreasDevices: Record<string, any> = {};
const mockDevices: Record<string, any> = {};

vi.mock('../../src/Helper', () => ({
  Helper: {
    magicAreasDevices: mockMagicAreasDevices,
    devices: mockDevices,
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
        'sensor.linus_brain_rooms': { state: '5' },
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
