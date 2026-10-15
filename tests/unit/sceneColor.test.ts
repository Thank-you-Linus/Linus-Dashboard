import { describe, it, expect } from 'vitest';

import { resolveSceneChipColor, toChipColor } from '../../src/utils/sceneColor';

describe('toChipColor', () => {
  it('converts an RGB color to #rrggbb', () => {
    expect(toChipColor({ rgb: [255, 0, 16] })).toBe('#ff0010');
  });

  it('gives amber for a warm white (2700 K)', () => {
    expect(toChipColor({ kelvin: 2700 })).toBe('amber');
  });

  it('gives light-blue for a cool white (6500 K)', () => {
    expect(toChipColor({ kelvin: 6500 })).toBe('light-blue');
  });

  it('gives undefined for no color', () => {
    expect(toChipColor(undefined)).toBeUndefined();
    expect(toChipColor({})).toBeUndefined();
  });
});

describe('resolveSceneChipColor', () => {
  it('prefers the manual color over the detected one', () => {
    expect(resolveSceneChipColor('#00ff00', [{ rgb: [255, 0, 0] }])).toBe('#00ff00');
  });

  it('uses the dominant detected color when no manual color', () => {
    expect(
      resolveSceneChipColor(undefined, [{ rgb: [255, 0, 0] }, { kelvin: 6500 }])
    ).toBe('#ff0000');
  });

  it('gives undefined (neutral) when nothing is known', () => {
    expect(resolveSceneChipColor(undefined, undefined)).toBeUndefined();
    expect(resolveSceneChipColor(undefined, [])).toBeUndefined();
  });
});
