import { describe, it, expect, vi } from 'vitest';

// vi.mock factories are hoisted above the imports, so the fixture they read has
// to be hoisted with them — a plain top-level const would still be uninitialised.
const fx = vi.hoisted(() => {
  // Slug and area_id deliberately differ: "ø" has no canonical NFD
  // decomposition, so slugify() keeps it while HA transliterates it to "o".
  const AREA_SLUG = 'køkken';
  const AREA_ID = 'kokken';
  return {
    AREA_SLUG,
    AREA_ID,
    GROUP_ENTITY: `light.linus_dashboard_all_lights_area_${AREA_ID}`,
    areas: {
      [AREA_SLUG]: {
        slug: AREA_SLUG,
        area_id: AREA_ID,
        name: 'Kitchen',
        icon: 'mdi:countertop',
        domains: {},
      },
    } as Record<string, any>,
  };
});

vi.mock('../../src/Helper', () => ({
  Helper: {
    isInitialized: () => true,
    areas: fx.areas,
    areaIdFor: (slug: string) => fx.areas[slug]?.area_id ?? slug,
    // The group reports "unavailable" — the exact state that used to make
    // getDefaultConfig() drop the light card from the generated config.
    getEntityState: () => ({ state: 'unavailable', attributes: {} }),
    getEntityIds: () => [],
    getSensorStateTemplate: () => '',
    lightSupportsBrightness: () => true,
    entityResolver: {
      resolveAllLights: () => ({ entity_id: fx.GROUP_ENTITY, source: 'native' }),
      resolveAreaState: () => ({ entity_id: null, source: 'native' }),
      resolveLightControlSwitch: () => ({ entity_id: null, source: 'native' }),
    },
  },
}));

// Chips are irrelevant to what these tests assert, and constructing the real
// ones drags in the popup layer. Stub them to a minimal valid chip.
vi.mock('../../src/chips/ActivityDetectionChip', () => ({
  ActivityDetectionChip: class { getChip() { return { type: 'template' }; } },
}));
vi.mock('../../src/chips/AggregateChip', () => ({
  AggregateChip: class { getChip() { return { type: 'template' }; } },
}));
vi.mock('../../src/chips/ConditionalChip', () => ({
  ConditionalChip: class { getChip() { return { type: 'conditional-chip' }; } },
}));
vi.mock('../../src/chips/ControlChip', () => ({
  ControlChip: class { getChip() { return { type: 'template' }; } },
}));
vi.mock('../../src/utils', () => ({
  getAreaName: (area: any) => area.name,
}));
vi.mock('../../src/utils/activityBadgeTemplates', () => ({
  buildMediaActiveConditions: () => ({ isMediaActive: 'false' }),
}));
vi.mock('home-assistant-js-websocket', () => ({}));

import { HomeAreaCard } from '../../src/cards/HomeAreaCard';
import { UNAVAILABLE } from '../../src/variables';

describe('HomeAreaCard', () => {
  describe('getDefaultConfig', () => {
    // Regression guard for the actual defect: the light card used to be gated on
    // the group's live state. The strategy runs once per dashboard load, and
    // these groups report "unavailable" for a few seconds after a HA restart
    // while their members come up — so loading the dashboard in that window
    // baked "no slider" into the config permanently. The card must be included
    // regardless of the current state; the conditional wrapper handles hiding.
    it('includes the light card even when the group is currently unavailable', () => {
      const config: any = new HomeAreaCard({ area_slug: fx.AREA_SLUG } as any).getDefaultConfig();

      const lightCard = config.cards.find((c: any) => c.type === 'conditional');
      expect(lightCard).toBeDefined();
      expect(lightCard.card.type).toBe('tile');
      expect(lightCard.card.entity).toBe(fx.GROUP_ENTITY);
    });
  });

  describe('getLightCard', () => {
    it('wraps the tile in a conditional card gated on the group being available', () => {
      // getLightCard() also calls this.getLightCardModStyle(), the only other
      // `this` access it makes — stub it rather than dragging in the real
      // implementation, which is irrelevant to what this test checks.
      const self = { getLightCardModStyle: () => ({}) };
      const card: any = (HomeAreaCard.prototype as any).getLightCard.call(self, fx.GROUP_ENTITY);

      expect(card.type).toBe('conditional');
      expect(card.conditions).toEqual([{ entity: fx.GROUP_ENTITY, state_not: UNAVAILABLE }]);
      expect(card.card.type).toBe('tile');
      expect(card.card.entity).toBe(fx.GROUP_ENTITY);
    });
  });
});
