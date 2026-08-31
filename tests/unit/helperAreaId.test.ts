import { describe, it, expect, vi, afterEach } from 'vitest';

// Deliberately does NOT mock ../../src/Helper — the other unit files replace
// Helper wholesale, which meant the real areaIdFor() and the real
// lightSupportsBrightness() were never executed by any test. This file exercises
// the production implementations directly.
vi.mock('home-assistant-js-websocket', () => ({}));

import { Helper } from '../../src/Helper';

// Helper.areas returns the (initialised, mutable) private #areas object, so
// fixtures can be injected without running the full initialize() pipeline.
const FIXTURES: Record<string, any> = {
  // "ø" has no canonical NFD decomposition, so slugify() keeps it while HA
  // transliterates it — slug and area_id genuinely differ.
  'køkken': { slug: 'køkken', area_id: 'kokken', name: 'Kitchen' },
  // HA keeps the original area_id when an area is renamed, so the two can be
  // completely unrelated. No name-derived slug can reproduce this.
  'kayas_værelse': { slug: 'kayas_værelse', area_id: 'kayas_rum', name: 'Renamed room' },
  // Plain ASCII single word: slug and area_id coincide.
  'stue': { slug: 'stue', area_id: 'stue', name: 'Living room' },
};

function withAreas() {
  Object.assign(Helper.areas, FIXTURES);
}

afterEach(() => {
  Object.keys(FIXTURES).forEach(k => delete Helper.areas[k]);
  vi.restoreAllMocks();
});

describe('Helper.areaIdFor', () => {
  it('translates a slug whose transliteration differs from the area_id', () => {
    withAreas();
    expect(Helper.areaIdFor('køkken')).toBe('kokken');
  });

  it('translates a renamed area to its original area_id', () => {
    withAreas();
    expect(Helper.areaIdFor('kayas_værelse')).toBe('kayas_rum');
  });

  it('is a no-op when slug and area_id already agree', () => {
    withAreas();
    expect(Helper.areaIdFor('stue')).toBe('stue');
  });

  it('falls back to the slug for an unknown area', () => {
    withAreas();
    expect(Helper.areaIdFor('not_an_area')).toBe('not_an_area');
  });
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
