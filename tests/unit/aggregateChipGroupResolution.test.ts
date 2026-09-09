import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * AggregateChip resolves its area-scope dedicated group entity from the real
 * `area_id` (what the Python backend names the entity from), not from the slug
 * derived from the area *name*. When the two diverge — a renamed area, or a
 * non-ASCII name such as « Køkken » on area_id "cuisine" — the old
 * name-slug lookup missed and the chip silently degraded to a client-side
 * template over the raw member entities.
 *
 * Floor and global scopes keep using the raw floor_id / "_global" suffix.
 */

const SLUG = 'kokken';
const AREA_ID = 'cuisine';
const FLOOR_ID = 'rez_de_chaussee';

/** slug -> area_id, mirroring Helper's #slugToAreaIdMap reverse index. */
const mockAreaIdBySlug: Record<string, string> = {};
/** Fake hass.states, keyed by entity_id. */
const mockStates: Record<string, { state: string }> = {};

vi.mock('../../src/Helper', () => ({
  Helper: {
    isInitialized: vi.fn(() => true),
    debug: false,
    strategyOptions: { domains: {}, debug: false },
    areas: {
      [SLUG]: { area_id: AREA_ID, name: 'Køkken', slug: SLUG },
    },
    floors: {
      [FLOOR_ID]: { floor_id: FLOOR_ID, name: 'Rez-de-chaussée' },
    },
    entities: {},
    getAreaIdBySlug: (slug: string) => mockAreaIdBySlug[slug],
    getEntityState: (entity_id: string) => mockStates[entity_id],
    getEntityIds: vi.fn(({ domain }: { domain: string }) => [`${domain}.member_one`]),
    getIcon: vi.fn(() => 'mdi:fallback'),
    getIconColor: vi.fn(() => 'grey'),
    getContent: vi.fn(() => ''),
    localize: vi.fn((key: string) => key),
    isFloorExcluded: vi.fn(() => false),
    sortEntitiesByFloorAndArea: vi.fn((ids: string[]) => ids),
    getLabel: vi.fn(() => null),
    getLabelName: vi.fn((id: string) => id),
    lightSupportsBrightness: vi.fn(() => true),
    entityResolver: {
      resolveAllLights: vi.fn(() => ({ entity_id: null, source: 'native' })),
      resolveClimateGroup: vi.fn(() => ({ entity_id: null, source: 'native' })),
      resolveMediaPlayerGroup: vi.fn(() => ({ entity_id: null, source: 'native' })),
      resolveGroupEntity: vi.fn(() => ({ entity_id: null, source: 'native' })),
      resolveAreaState: vi.fn(() => ({ entity_id: null, source: 'native' })),
      resolvePresenceSensor: vi.fn(() => ({ entity_id: null, source: 'native' })),
    },
  },
}));

vi.mock('home-assistant-js-websocket', () => ({}));

/**
 * The chip builds its tap/hold popup through PopupFactory, which instantiates
 * the real popups via CommonJS `require` — unavailable under Vitest's ESM
 * runner. The popup content is out of scope here (AggregatePopup has its own
 * test file), so the factory is stubbed and its received config captured to
 * assert what the chip threads through as `dedicatedGroupEntity`.
 */
const popupConfigs: any[] = [];
vi.mock('../../src/services/PopupFactory', () => ({
  PopupFactory: {
    createPopup: vi.fn((config: any) => {
      popupConfigs.push(config);
      return { action: 'fire-dom-event', browser_mod: {} };
    }),
  },
}));

describe('AggregateChip — group entity resolution by area_id', () => {
  let AggregateChip: any;

  /** domain -> the "all_X" slug the backend platform uses in its unique_id. */
  const DEDICATED_GROUP_DOMAINS: Record<string, string> = {
    light: 'all_lights',
    switch: 'all_switches',
    fan: 'all_fans',
    cover: 'all_covers',
    siren: 'all_sirens',
    climate: 'all_climates',
    media_player: 'all_media_players',
  };

  beforeEach(async () => {
    Object.keys(mockAreaIdBySlug).forEach(k => delete mockAreaIdBySlug[k]);
    Object.keys(mockStates).forEach(k => delete mockStates[k]);
    popupConfigs.length = 0;
    mockAreaIdBySlug[SLUG] = AREA_ID;

    const mod = await import('../../src/chips/AggregateChip');
    AggregateChip = mod.AggregateChip;
  });

  describe('area scope', () => {
    it.each(Object.entries(DEDICATED_GROUP_DOMAINS))(
      'targets the %s group named from area_id, not from the area name slug',
      (domain, groupSlug) => {
        const expected = `${domain}.linus_dashboard_${groupSlug}_area_${AREA_ID}`;
        mockStates[expected] = { state: 'on' };

        const chip: any = new AggregateChip({
          domain,
          scope: 'area',
          area_slug: SLUG,
          show_content: true,
        }).getChip();

        expect(chip.entity_id).toEqual([expected]);
        expect(chip.icon).toContain(expected);
        expect(chip.icon_color).toContain(expected);
        expect(chip.content).toContain(expected);
        // ...and the popup gets the same single controllable entity, which is
        // what makes it render the group tile instead of the Turn All buttons.
        expect(popupConfigs[0].dedicatedGroupEntity).toBe(expected);
      }
    );

    it('never falls back to the name-slug entity, even when it exists', () => {
      // A renamed area whose name slug collides with another room's area_id
      // would otherwise drive that other room's lights.
      const nameSlugEntity = `light.linus_dashboard_all_lights_area_${SLUG}`;
      mockStates[nameSlugEntity] = { state: 'on' };

      const chip: any = new AggregateChip({
        domain: 'light',
        scope: 'area',
        area_slug: SLUG,
        show_content: true,
      }).getChip();

      // No area_id-named group in states → client-side template fallback over
      // the raw members, never the name-slug entity.
      expect(chip.entity_id).toEqual(['light.member_one']);
      expect(JSON.stringify(chip)).not.toContain(nameSlugEntity);
    });

    it('falls back to the client-side template when the slug maps to no area_id', () => {
      delete mockAreaIdBySlug[SLUG];
      mockStates[`light.linus_dashboard_all_lights_area_${AREA_ID}`] = { state: 'on' };

      const chip: any = new AggregateChip({
        domain: 'light',
        scope: 'area',
        area_slug: SLUG,
        show_content: true,
      }).getChip();

      expect(chip.entity_id).toEqual(['light.member_one']);
    });

    it('skips a group entity that exists but is unavailable', () => {
      mockStates[`light.linus_dashboard_all_lights_area_${AREA_ID}`] = { state: 'unavailable' };

      const chip: any = new AggregateChip({
        domain: 'light',
        scope: 'area',
        area_slug: SLUG,
        show_content: true,
      }).getChip();

      expect(chip.entity_id).toEqual(['light.member_one']);
    });
  });

  describe('non-regression: floor and global scopes keep their own suffix', () => {
    it('floor scope uses the raw floor_id', () => {
      const expected = `light.linus_dashboard_all_lights_floor_${FLOOR_ID}`;
      mockStates[expected] = { state: 'on' };

      const chip: any = new AggregateChip({
        domain: 'light',
        scope: 'floor',
        floor_id: FLOOR_ID,
        show_content: true,
      }).getChip();

      expect(chip.entity_id).toEqual([expected]);
    });

    it('global scope uses the _global suffix', () => {
      const expected = 'light.linus_dashboard_all_lights_global';
      mockStates[expected] = { state: 'on' };

      const chip: any = new AggregateChip({
        domain: 'light',
        scope: 'global',
        show_content: true,
      }).getChip();

      expect(chip.entity_id).toEqual([expected]);
    });
  });
});
