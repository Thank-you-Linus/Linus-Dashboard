import { describe, it, expect, vi } from 'vitest';

// LightPopup pulls in AggregatePopup -> Helper. The chip builder under test is
// pure, so Helper is stubbed away rather than initialized.
vi.mock('../../src/Helper', () => ({
  Helper: {
    getEntityIds: vi.fn(() => []),
    getEntityState: vi.fn(() => undefined),
    localize: vi.fn((key: string) => key),
  },
}));

vi.mock('home-assistant-js-websocket', () => ({}));

import { buildSceneChips } from '../../src/popups/LightPopup';

describe('buildSceneChips', () => {
  it('returns no chip for an empty scene list (no orphan section)', () => {
    expect(buildSceneChips([])).toEqual([]);
  });

  it('builds one template chip per scene', () => {
    const chips = buildSceneChips([
      { entity_id: 'scene.salon_soiree', name: 'Soirée' },
      { entity_id: 'scene.salon_lecture', name: 'Lecture' },
    ]);

    expect(chips).toHaveLength(2);
    expect(chips.every(chip => chip.type === 'template')).toBe(true);
    expect(chips.map(chip => chip.entity)).toEqual([
      'scene.salon_soiree',
      'scene.salon_lecture',
    ]);
  });

  it('taps call scene.turn_on on the chip own entity, without leaving the popup', () => {
    const [chip] = buildSceneChips([
      { entity_id: 'scene.salon_soiree', name: 'Soirée' },
    ]);

    expect(chip.tap_action).toEqual({
      action: 'call-service',
      service: 'scene.turn_on',
      data: { entity_id: 'scene.salon_soiree' },
    });
  });

  it('keeps more-info on hold only', () => {
    const [chip] = buildSceneChips([
      { entity_id: 'scene.salon_soiree', name: 'Soirée' },
    ]);

    expect(chip.hold_action).toEqual({ action: 'more-info' });
  });

  it('always carries the scene name as text content (accessibility)', () => {
    const chips = buildSceneChips([
      { entity_id: 'scene.salon_soiree', name: 'Soirée' },
      { entity_id: 'scene.cuisine_diner', name: 'Dîner' },
    ]);

    expect(chips.map(chip => chip.content)).toEqual(['Soirée', 'Dîner']);
  });

  it('templates the icon with a palette fallback', () => {
    const [chip] = buildSceneChips([
      { entity_id: 'scene.salon_soiree', name: 'Soirée' },
    ]);

    expect(chip.icon).toBe(
      "{{ state_attr('scene.salon_soiree', 'icon') or 'mdi:palette' }}"
    );
  });
});
