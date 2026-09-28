import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * Non-regression for the floor → area → entities rendering shared by TagsView
 * (label popup content) and TagsChip (label popup action).
 *
 * Written before extracting `buildHierarchicalEntityCards` into SectionBuilder:
 * it goes through each caller's own popup builder, so it passes on the two
 * former private copies and on the single extracted static method alike.
 * The exact order of cards is asserted — it is also the keyboard / screen
 * reader reading order.
 */

interface MockArea { slug: string; name: string; floor_id: string | null; icon?: string }

const mockEntityArea: Record<string, MockArea | undefined> = {};

const AREA_SALON: MockArea = { slug: 'salon', name: 'Salon', floor_id: 'rdc', icon: 'mdi:sofa' };
const AREA_CUISINE: MockArea = { slug: 'cuisine_ete', name: 'Cuisine Été', floor_id: 'rdc' };
const AREA_CHAMBRE: MockArea = { slug: 'chambre', name: 'Chambre', floor_id: 'etage', icon: 'mdi:bed' };

vi.mock('../../src/Helper', () => ({
  Helper: {
    isInitialized: vi.fn(() => true),
    debug: false,
    strategyOptions: { domains: {}, debug: false, areas: {} },
    entities: {},
    devices: {},
    floors: {
      rdc: { floor_id: 'rdc', name: 'Rez-de-chaussée', icon: 'mdi:home-floor-0' },
      etage: { floor_id: 'etage', name: 'Étage' },
    },
    areas: {
      salon: { slug: 'salon', name: 'Salon', floor_id: 'rdc', icon: 'mdi:sofa' },
      cuisine_ete: { slug: 'cuisine_ete', name: 'Cuisine Été', floor_id: 'rdc' },
      chambre: { slug: 'chambre', name: 'Chambre', floor_id: 'etage', icon: 'mdi:bed' },
    },
    // Upstairs listed second on purpose: order must follow orderedFloors,
    // not the order entities are given in.
    orderedFloors: [
      { floor_id: 'rdc' },
      { floor_id: 'etage' },
    ],
    getEntityArea: (entityId: string) => mockEntityArea[entityId],
    localize: vi.fn((key: string) => key),
    logError: vi.fn(),
  },
}));

vi.mock('home-assistant-js-websocket', () => ({}));

const ENTITY_IDS = [
  'light.chambre_plafond',
  'light.salon_lampe',
  'sensor.orphan_temperature',
  // Area inherited from its device (Helper.getEntityArea resolves it).
  'switch.cuisine_prise_device',
  'light.salon_spot',
];

const EXPECTED_HIERARCHY = [
  { type: 'heading', heading: 'Rez-de-chaussée', heading_style: 'title', icon: 'mdi:home-floor-0' },
  { type: 'heading', heading: 'Salon', heading_style: 'subtitle', icon: 'mdi:sofa' },
  { type: 'tile', entity: 'light.salon_lampe' },
  { type: 'tile', entity: 'light.salon_spot' },
  { type: 'heading', heading: 'Cuisine Été', heading_style: 'subtitle', icon: 'mdi:home' },
  { type: 'tile', entity: 'switch.cuisine_prise_device' },
  { type: 'heading', heading: 'Étage', heading_style: 'title', icon: 'mdi:floor-plan' },
  { type: 'heading', heading: 'Chambre', heading_style: 'subtitle', icon: 'mdi:bed' },
  { type: 'tile', entity: 'light.chambre_plafond' },
  { type: 'heading', heading: 'ui.card.area.area_not_found', heading_style: 'subtitle', icon: 'mdi:help-circle' },
  { type: 'tile', entity: 'sensor.orphan_temperature' },
];

describe('Tags hierarchical entity cards (floor → area → entities)', () => {
  beforeEach(() => {
    Object.keys(mockEntityArea).forEach(k => delete mockEntityArea[k]);
    mockEntityArea['light.chambre_plafond'] = AREA_CHAMBRE;
    mockEntityArea['light.salon_lampe'] = AREA_SALON;
    mockEntityArea['light.salon_spot'] = AREA_SALON;
    mockEntityArea['switch.cuisine_prise_device'] = AREA_CUISINE;
    mockEntityArea['sensor.orphan_temperature'] = undefined;
  });

  it('TagsView label popup ends with the hierarchical cards in reading order', async () => {
    const { TagsView } = await import('../../src/views/TagsView');
    const view = new TagsView() as any;
    const cards: any[] = view.buildLabelPopupContent('lbl', { name: 'Label' }, ENTITY_IDS);

    expect(cards.slice(-EXPECTED_HIERARCHY.length)).toEqual(EXPECTED_HIERARCHY);
  });

  it('TagsChip label popup ends with the same hierarchical cards', async () => {
    const { TagsChip } = await import('../../src/chips/TagsChip');
    const chip = new TagsChip() as any;
    const action = chip.buildLabelPopupAction('lbl', { name: 'Label' }, ENTITY_IDS);
    const cards: any[] = action.browser_mod.data.content.cards;

    expect(cards.slice(-EXPECTED_HIERARCHY.length)).toEqual(EXPECTED_HIERARCHY);
  });
});
