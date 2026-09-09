import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Freezes AggregatePopup's group-tile / control-buttons exclusion rule — the
 * user-visible symptom of the area_id/slug divergence bug: when the group
 * entity fails to resolve, the popup silently degrades from a group tile
 * (with its own toggle and feature slider) to a pair of "Turn All On/Off"
 * buttons targeting N member entities.
 *
 * Invariant: exactly one of the two branches renders, and which one depends
 * only on whether a usable group entity was passed in — never on the group's
 * on/off state.
 *
 * `switch` is used as the non-`light` domain on purpose: CoverPopup and
 * MediaPlayerPopup override buildControlButtons and target entity_ids rather
 * than the group, so they exercise a different path. A switch group tile also
 * legitimately gets `features: []` (GROUP_TILE_FEATURES has no switch entry),
 * hence no assertion on features here.
 */

const GROUP_ENTITY = 'switch.linus_dashboard_all_switches_area_cuisine';
const MEMBERS = ['switch.member_one', 'switch.member_two'];

const mockStates: Record<string, { state: string }> = {};

vi.mock('../../src/Helper', () => ({
  Helper: {
    isInitialized: vi.fn(() => true),
    debug: false,
    strategyOptions: { domains: {}, debug: false },
    areas: {},
    floors: {},
    entities: {},
    getEntityIds: vi.fn(() => MEMBERS),
    getEntityState: (entity_id: string) => mockStates[entity_id],
    localize: vi.fn((key: string) => key),
    sortEntitiesByFloorAndArea: vi.fn((ids: string[]) => ids),
    getLabel: vi.fn(() => null),
    getLabelName: vi.fn((id: string) => id),
    lightSupportsBrightness: vi.fn(() => true),
  },
}));

vi.mock('home-assistant-js-websocket', () => ({}));

describe('AggregatePopup — group tile vs Turn All buttons', () => {
  let AggregatePopup: any;

  beforeEach(async () => {
    Object.keys(mockStates).forEach(k => delete mockStates[k]);
    const mod = await import('../../src/popups/AggregatePopup');
    AggregatePopup = mod.AggregatePopup;
  });

  /** Builds the popup config for an area-scope switch aggregate. */
  function build(dedicatedGroupEntity: string | null): any {
    const popup = new AggregatePopup({
      domain: 'switch',
      scope: 'area',
      scopeName: 'Køkken',
      area_slug: 'kokken',
      serviceOn: 'turn_on',
      serviceOff: 'turn_off',
      activeStates: ['on'],
      translationKey: 'switch',
      groupEntity: null,
      dedicatedGroupEntity,
      features: [],
      showNavigationButton: false,
    });

    return popup.getPopup().browser_mod.data.content.cards;
  }

  /** The group control tile, if the popup rendered one. */
  function findGroupTile(cards: any[]): any {
    return cards.find(card => card.type === 'tile' && card.entity === GROUP_ENTITY);
  }

  /** The Turn All On / Turn All Off horizontal-stack, if rendered. */
  function findControlButtons(cards: any[]): any {
    return cards.find(
      card =>
        card.type === 'horizontal-stack' &&
        Array.isArray(card.cards) &&
        card.cards.some((inner: any) => inner?.tap_action?.action === 'call-service')
    );
  }

  it('renders the group tile and no buttons when the group is on', () => {
    mockStates[GROUP_ENTITY] = { state: 'on' };
    const cards = build(GROUP_ENTITY);

    expect(findGroupTile(cards)).toBeDefined();
    expect(findControlButtons(cards)).toBeUndefined();
  });

  it('renders exactly the same popup whether the group is on or off', () => {
    mockStates[GROUP_ENTITY] = { state: 'on' };
    const whenOn = build(GROUP_ENTITY);

    mockStates[GROUP_ENTITY] = { state: 'off' };
    const whenOff = build(GROUP_ENTITY);

    // The divergence users reported does not follow the group's state.
    expect(whenOff).toEqual(whenOn);
    expect(findGroupTile(whenOff)).toBeDefined();
    expect(findControlButtons(whenOff)).toBeUndefined();
  });

  it('falls back to the Turn All buttons when the group entity is unavailable', () => {
    mockStates[GROUP_ENTITY] = { state: 'unavailable' };
    const cards = build(GROUP_ENTITY);

    expect(findGroupTile(cards)).toBeUndefined();
    expect(findControlButtons(cards)).toBeDefined();
  });

  it('falls back to the Turn All buttons when no group entity resolved', () => {
    const cards = build(null);

    expect(findGroupTile(cards)).toBeUndefined();

    const buttons = findControlButtons(cards);
    expect(buttons).toBeDefined();
    // No group to target: the buttons act on every member entity.
    expect(buttons.cards[0].tap_action.data.entity_id).toEqual(MEMBERS);
  });

  it('never renders both branches for a controllable domain', () => {
    for (const groupState of ['on', 'off', 'unavailable', undefined]) {
      Object.keys(mockStates).forEach(k => delete mockStates[k]);
      if (groupState) {
        mockStates[GROUP_ENTITY] = { state: groupState };
      }
      const cards = build(groupState ? GROUP_ENTITY : null);

      const hasTile = findGroupTile(cards) !== undefined;
      const hasButtons = findControlButtons(cards) !== undefined;

      expect(hasTile).not.toBe(hasButtons);
    }
  });

  it('targets the group entity, not the members, when the tile is shown', () => {
    mockStates[GROUP_ENTITY] = { state: 'on' };
    const cards = build(GROUP_ENTITY);

    expect(findGroupTile(cards).entity).toBe(GROUP_ENTITY);
    expect(JSON.stringify(cards)).not.toContain('Turn All');
  });
});
