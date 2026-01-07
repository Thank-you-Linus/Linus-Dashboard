import { describe, it, expect } from 'vitest';
import {
  createDomainTag,
  parseDomainTag,
  matchesDomainTag,
  extractDeviceClass,
  createDomainTagFromEntity,
} from '../../src/utils/domainTagHelper';

describe('domainTagHelper', () => {
  describe('createDomainTag', () => {
    it('should create tag without device_class', () => {
      expect(createDomainTag('light')).toBe('light');
      expect(createDomainTag('switch')).toBe('switch');
      expect(createDomainTag('climate')).toBe('climate');
    });

    it('should create tag with device_class', () => {
      expect(createDomainTag('cover', 'blind')).toBe('cover:blind');
      expect(createDomainTag('sensor', 'temperature')).toBe('sensor:temperature');
      expect(createDomainTag('binary_sensor', 'motion')).toBe('binary_sensor:motion');
    });

    it('should handle explicit null device_class', () => {
      expect(createDomainTag('cover', null)).toBe('cover');
      expect(createDomainTag('sensor', null)).toBe('sensor');
    });

    it('should handle undefined device_class', () => {
      expect(createDomainTag('cover', undefined)).toBe('cover');
      expect(createDomainTag('sensor', undefined)).toBe('sensor');
    });

    it('should handle empty string device_class', () => {
      expect(createDomainTag('cover', '')).toBe('cover');
      expect(createDomainTag('sensor', '')).toBe('sensor');
    });
  });

  describe('parseDomainTag', () => {
    it('should parse tag with device_class', () => {
      expect(parseDomainTag('cover:blind')).toEqual({
        domain: 'cover',
        device_class: 'blind',
      });
      expect(parseDomainTag('sensor:temperature')).toEqual({
        domain: 'sensor',
        device_class: 'temperature',
      });
    });

    it('should parse tag without device_class', () => {
      expect(parseDomainTag('light')).toEqual({
        domain: 'light',
        device_class: undefined,
      });
      expect(parseDomainTag('switch')).toEqual({
        domain: 'switch',
        device_class: undefined,
      });
    });

    it('should handle tag with multiple colons (edge case)', () => {
      // Should only split on first colon
      expect(parseDomainTag('sensor:temperature:extra')).toEqual({
        domain: 'sensor',
        device_class: 'temperature',
      });
    });
  });

  describe('matchesDomainTag', () => {
    it('should match exact domain and device_class', () => {
      expect(matchesDomainTag('cover:blind', 'cover', 'blind')).toBe(true);
      expect(matchesDomainTag('sensor:temperature', 'sensor', 'temperature')).toBe(true);
    });

    it('should not match different device_class', () => {
      expect(matchesDomainTag('cover:blind', 'cover', 'curtain')).toBe(false);
      expect(matchesDomainTag('sensor:temperature', 'sensor', 'humidity')).toBe(false);
    });

    it('should match domain-only when device_class is undefined', () => {
      expect(matchesDomainTag('cover:blind', 'cover', undefined)).toBe(true);
      expect(matchesDomainTag('cover', 'cover', undefined)).toBe(true);
      expect(matchesDomainTag('sensor:temperature', 'sensor', undefined)).toBe(true);
    });

    it('should not match domain-only when device_class is different', () => {
      expect(matchesDomainTag('cover:blind', 'light', undefined)).toBe(false);
      expect(matchesDomainTag('sensor:temperature', 'binary_sensor', undefined)).toBe(false);
    });

    it('should match strict null - tag without device_class', () => {
      expect(matchesDomainTag('cover', 'cover', null)).toBe(true);
      expect(matchesDomainTag('light', 'light', null)).toBe(true);
    });

    it('should not match strict null - tag with device_class', () => {
      expect(matchesDomainTag('cover:blind', 'cover', null)).toBe(false);
      expect(matchesDomainTag('sensor:temperature', 'sensor', null)).toBe(false);
    });
  });

  describe('extractDeviceClass', () => {
    it('should extract device_class from supported domain', () => {
      const state = {
        attributes: {
          device_class: 'temperature',
        },
      };
      expect(extractDeviceClass(state, 'sensor', ['sensor', 'cover'])).toBe('temperature');
    });

    it('should return undefined for unsupported domain', () => {
      const state = {
        attributes: {
          device_class: 'temperature',
        },
      };
      expect(extractDeviceClass(state, 'light', ['sensor', 'cover'])).toBeUndefined();
    });

    it('should return undefined when device_class is missing', () => {
      const state = {
        attributes: {},
      };
      expect(extractDeviceClass(state, 'sensor', ['sensor', 'cover'])).toBeUndefined();
    });

    it('should handle null or undefined state gracefully', () => {
      expect(extractDeviceClass(null, 'sensor', ['sensor'])).toBeUndefined();
      expect(extractDeviceClass(undefined, 'sensor', ['sensor'])).toBeUndefined();
      expect(extractDeviceClass({}, 'sensor', ['sensor'])).toBeUndefined();
    });
  });

  describe('createDomainTagFromEntity', () => {
    it('should create tag from entity with device_class', () => {
      const entity_id = 'sensor.living_room_temperature';
      const state = {
        attributes: {
          device_class: 'temperature',
        },
      };
      expect(createDomainTagFromEntity(entity_id, state, ['sensor', 'cover'])).toBe(
        'sensor:temperature'
      );
    });

    it('should create tag from entity without device_class', () => {
      const entity_id = 'light.living_room';
      const state = {
        attributes: {},
      };
      expect(createDomainTagFromEntity(entity_id, state, ['sensor', 'cover'])).toBe('light');
    });

    it('should handle entity from unsupported domain', () => {
      const entity_id = 'light.living_room';
      const state = {
        attributes: {
          device_class: 'something', // Will be ignored because light doesn't support device_class
        },
      };
      expect(createDomainTagFromEntity(entity_id, state, ['sensor', 'cover'])).toBe('light');
    });

    it('should handle invalid state gracefully', () => {
      const entity_id = 'sensor.temperature';
      expect(createDomainTagFromEntity(entity_id, null, ['sensor'])).toBe('sensor');
      expect(createDomainTagFromEntity(entity_id, undefined, ['sensor'])).toBe('sensor');
    });

    it('should handle entity with multiple dots in ID', () => {
      const entity_id = 'sensor.living.room.temperature';
      const state = {
        attributes: {
          device_class: 'temperature',
        },
      };
      expect(createDomainTagFromEntity(entity_id, state, ['sensor'])).toBe('sensor:temperature');
    });

    it('should handle cover entities', () => {
      const entity_id = 'cover.living_room_blind';
      const state = {
        attributes: {
          device_class: 'blind',
        },
      };
      expect(createDomainTagFromEntity(entity_id, state, ['cover'])).toBe('cover:blind');
    });
  });
});
