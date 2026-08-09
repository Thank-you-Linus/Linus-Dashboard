import { describe, it, expect, vi } from 'vitest';

// HomeAreaCard.getLightCard() doesn't touch `this`, so it can be called via
// prototype without constructing an instance — avoids dragging in the full
// Helper/area/entityResolver setup the constructor and other methods need.
vi.mock('../../src/Helper', () => ({
  Helper: {
    lightSupportsBrightness: vi.fn(() => true),
  },
}));

vi.mock('home-assistant-js-websocket', () => ({}));

import { HomeAreaCard } from '../../src/cards/HomeAreaCard';
import { UNAVAILABLE } from '../../src/variables';

describe('HomeAreaCard.getLightCard', () => {
  it('wraps the tile in a conditional card gated on the group being available', () => {
    const entity_id = 'light.linus_dashboard_all_lights_area_kokken';
    // getLightCard() also calls this.getLightCardModStyle(), the only other
    // `this` access it makes — stub it rather than dragging in the real
    // implementation, which is irrelevant to what this test checks.
    const self = { getLightCardModStyle: () => ({}) };
    const card: any = (HomeAreaCard.prototype as any).getLightCard.call(self, entity_id);

    // Regression guard: the strategy runs once per dashboard load, and
    // all_lights groups are routinely "unavailable" for a few seconds after
    // a HA restart before their members report in. If the tile were pushed
    // in directly instead of wrapped, hitting that window would permanently
    // drop the slider from the generated dashboard until a manual regenerate.
    expect(card.type).toBe('conditional');
    expect(card.conditions).toEqual([{ entity: entity_id, state_not: UNAVAILABLE }]);
    expect(card.card.type).toBe('tile');
    expect(card.card.entity).toBe(entity_id);
  });
});
