import { describe, it, expect } from 'vitest';
import { getDomainTranslationKey } from '../../src/utils';

describe('getDomainTranslationKey', () => {
  it('uses the device_class-specific key for cover, not just binary_sensor/sensor', () => {
    // This is the exact bug: cover device_class labels ("Portail", "Porte de
    // garage", ...) were silently falling back to the generic cover name
    // ("Ouverture"/"Opening") everywhere covers are grouped by device_class
    // (Home/Area/Floor/Security views), because the check only allowed
    // AGGREGATE_DOMAINS (binary_sensor/sensor) to use their device_class.
    expect(getDomainTranslationKey('cover', 'gate')).toBe('component.cover.entity_component.gate.name');
    expect(getDomainTranslationKey('cover', 'garage')).toBe('component.cover.entity_component.garage.name');
  });

  it('uses the device_class-specific key for media_player too', () => {
    expect(getDomainTranslationKey('media_player', 'tv')).toBe('component.media_player.entity_component.tv.name');
  });

  it('still uses the device_class-specific key for binary_sensor/sensor (unchanged behavior)', () => {
    expect(getDomainTranslationKey('binary_sensor', 'motion')).toBe('component.binary_sensor.entity_component.motion.name');
    expect(getDomainTranslationKey('sensor', 'temperature')).toBe('component.sensor.entity_component.temperature.name');
  });

  it('falls back to the generic domain name when no device_class is given', () => {
    expect(getDomainTranslationKey('cover')).toBe('component.cover.entity_component._.name');
    expect(getDomainTranslationKey('light')).toBe('component.light.entity_component._.name');
  });

  it('special-cases scene regardless of device_class', () => {
    expect(getDomainTranslationKey('scene', 'whatever')).toBe('ui.dialogs.quick-bar.commands.navigation.scene');
  });
});
