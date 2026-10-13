import { describe, it, expect, vi, afterEach } from 'vitest';

// Deliberately does NOT mock ../../src/Helper — the other unit files replace
// Helper wholesale, which meant the real lightSupportsBrightness() was never
// executed by any test. This file exercises the production implementation directly.
vi.mock('home-assistant-js-websocket', () => ({}));

import { Helper } from '../../src/Helper';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Helper.lightSupportsBrightness', () => {
  const stubState = (attributes: any) => {
    vi.spyOn(Helper, 'getEntityState').mockReturnValue({ attributes } as any);
  };

  it('reports dimmable for a brightness-capable group', () => {
    stubState({ supported_color_modes: ['brightness'] });
    expect(Helper.lightSupportsBrightness('light.group')).toBe(true);
  });

  it('reports dimmable when a non-onoff mode is present alongside onoff', () => {
    stubState({ supported_color_modes: ['onoff', 'color_temp'] });
    expect(Helper.lightSupportsBrightness('light.group')).toBe(true);
  });

  it('reports not dimmable for an onoff-only group', () => {
    stubState({ supported_color_modes: ['onoff'] });
    expect(Helper.lightSupportsBrightness('light.group')).toBe(false);
  });

  // Fail-open: reporting "not dimmable" from absent capability data would bake
  // a permanently sliderless card into the generated dashboard, since the
  // strategy runs once per load. Returning true costs at most an inert feature
  // row; returning false costs the control until the dashboard is regenerated.
  it('fails open when supported_color_modes is an empty list', () => {
    stubState({ supported_color_modes: [] });
    expect(Helper.lightSupportsBrightness('light.group')).toBe(true);
  });

  it('fails open when supported_color_modes is absent', () => {
    stubState({});
    expect(Helper.lightSupportsBrightness('light.group')).toBe(true);
  });

  it('fails open when the entity has no state at all', () => {
    vi.spyOn(Helper, 'getEntityState').mockReturnValue(undefined as any);
    expect(Helper.lightSupportsBrightness('light.missing')).toBe(true);
  });
});
