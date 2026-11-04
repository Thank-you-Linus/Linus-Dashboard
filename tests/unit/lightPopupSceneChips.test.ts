import { describe, it, expect, vi } from 'vitest';

// LightPopup pulls in AggregatePopup -> Helper. The chip builder under test is
// pure, so Helper is stubbed away rather than initialized.
const helperMock = vi.hoisted(() => ({
  getEntityIds: vi.fn((): string[] => []),
  getEntityState: vi.fn((): unknown => undefined),
  localize: vi.fn((key: string) => key),
  linus_dashboard_config: undefined as unknown,
}));

vi.mock('../../src/Helper', () => ({ Helper: helperMock }));

vi.mock('home-assistant-js-websocket', () => ({}));

import { buildSceneChips, LightPopup } from '../../src/popups/LightPopup';

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

describe('buildSceneChips — colors', () => {
  it('adds no icon_color when the scene has no color (neutral look)', () => {
    const [chip] = buildSceneChips([
      { entity_id: 'scene.salon_soiree', name: 'Soirée' },
    ]);

    expect(chip).not.toHaveProperty('icon_color');
    expect(chip.icon).toBe(
      "{{ state_attr('scene.salon_soiree', 'icon') or 'mdi:palette' }}"
    );
  });

  it('sets icon_color to the scene color, keeping icon and name', () => {
    const [chip] = buildSceneChips([
      { entity_id: 'scene.salon_soiree', name: 'Soirée', color: '#ff0000' },
    ]);

    expect(chip.icon_color).toBe('#ff0000');
    expect(chip.content).toBe('Soirée');
    expect(chip.icon).toBe(
      "{{ state_attr('scene.salon_soiree', 'icon') or 'mdi:palette' }}"
    );
  });
});

describe('LightPopup scene section — colors from the backend config', () => {
  interface ChipsSection { chips: Record<string, unknown>[] }

  const sceneChips = (): Record<string, unknown>[] => {
    helperMock.getEntityIds.mockReturnValue(['scene.salon_soiree', 'scene.salon_hue']);
    // buildExtraSections only reads Helper, not the popup instance
    const sections = (LightPopup.prototype as unknown as {
      buildExtraSections: (config: unknown) => unknown[];
    }).buildExtraSections.call({}, { scope: 'area', area_slug: 'salon' });
    return (sections[1] as ChipsSection).chips;
  };

  it('stays neutral when the backend sends no scene_colors (older backend)', () => {
    helperMock.linus_dashboard_config = {};

    expect(sceneChips().every(chip => !('icon_color' in chip))).toBe(true);
  });

  it('stays neutral when the config itself is undefined', () => {
    helperMock.linus_dashboard_config = undefined;

    expect(sceneChips().every(chip => !('icon_color' in chip))).toBe(true);
  });

  it('colors detected scenes, manual color winning, unknown scene neutral', () => {
    helperMock.linus_dashboard_config = {
      scene_colors: { 'scene.salon_soiree': [{ kelvin: 2700 }] },
      scene_color_overrides: {},
    };
    const [soiree, hue] = sceneChips();
    expect(soiree.icon_color).toBe('amber');
    expect(hue).not.toHaveProperty('icon_color');

    helperMock.linus_dashboard_config = {
      scene_colors: { 'scene.salon_soiree': [{ kelvin: 2700 }] },
      scene_color_overrides: { 'scene.salon_soiree': '#00ff00', 'scene.salon_hue': '#0080ff' },
    };
    const [soireeManual, hueManual] = sceneChips();
    expect(soireeManual.icon_color).toBe('#00ff00');
    expect(hueManual.icon_color).toBe('#0080ff');
  });
});
