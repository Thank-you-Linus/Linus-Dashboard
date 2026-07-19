import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockOrderedFloors: any[] = [];
const mockAreas: Record<string, any> = {};
const mockEntities: Record<string, any> = {};
const mockEntityStates: Record<string, any> = {};

vi.mock('../../src/Helper', () => ({
  Helper: {
    isInitialized: () => true,
    orderedFloors: mockOrderedFloors,
    isFloorExcluded: () => false,
    areas: mockAreas,
    entities: mockEntities,
    strategyOptions: { card_options: {} },
    getEntityState: (entityId: string) => mockEntityStates[entityId],
    localize: (key: string) => {
      const table: Record<string, string> = {
        'state.default.unavailable': 'Unavailable',
        'component.linus_dashboard.entity.text.unavailable_view.state.all_good_title': 'Everything is fine',
        'component.linus_dashboard.entity.text.unavailable_view.state.all_good_subtitle': 'No unavailable entities',
      };
      return table[key] ?? '';
    },
  },
}));

vi.mock('../../src/factories/CardFactory', () => ({
  CardFactory: {
    createCardByName: vi.fn(async () => ({ type: 'fake-entity-card' })),
  },
}));

vi.mock('../../src/cards/ControllerCard', () => ({
  ControllerCard: class {
    createCard() {
      return [{ type: 'fake-controller-card' }];
    }
  },
}));

vi.mock('../../src/cards/GroupedCard', () => ({
  GroupedCard: class {
    getCard() {
      return { type: 'fake-grouped-card' };
    }
  },
}));

describe('UnavailableView', () => {
  let UnavailableView: any;

  beforeEach(async () => {
    Object.keys(mockAreas).forEach((k) => delete mockAreas[k]);
    Object.keys(mockEntities).forEach((k) => delete mockEntities[k]);
    Object.keys(mockEntityStates).forEach((k) => delete mockEntityStates[k]);
    mockOrderedFloors.length = 0;

    const mod = await import('../../src/views/UnavailableView');
    UnavailableView = mod.UnavailableView;
  });

  function addArea(areaSlug: string, entityIds: string[]) {
    mockAreas[areaSlug] = {
      slug: areaSlug,
      area_id: areaSlug,
      name: areaSlug,
      icon: 'mdi:floor-plan',
      entities: entityIds,
    };
    for (const entityId of entityIds) {
      mockEntities[entityId] = { entity_id: entityId, device_id: null, entity_category: null };
    }
  }

  function addFloor(floorId: string, areaSlugs: string[]) {
    mockOrderedFloors.push({
      floor_id: floorId,
      name: floorId,
      icon: 'mdi:floor-plan',
      areas_slug: areaSlugs,
    });
  }

  it('shows a confirmation card when nothing is unavailable anywhere', async () => {
    addArea('salon', ['light.salon_a']);
    addFloor('rez_de_chaussee', ['salon']);
    mockEntityStates['light.salon_a'] = { state: 'on' };

    const view = new UnavailableView();
    const sections = await view.createSectionCards();

    expect(sections).toHaveLength(1);
    expect(sections[0].cards).toEqual([
      {
        type: 'custom:mushroom-template-card',
        primary: 'Everything is fine',
        secondary: 'No unavailable entities',
        icon: 'mdi:check-circle',
        icon_color: 'green',
      },
    ]);
  });

  it('shows nothing is fine card when there are no floors at all', async () => {
    const view = new UnavailableView();
    const sections = await view.createSectionCards();

    expect(sections).toHaveLength(1);
    expect(sections[0].cards[0].icon).toBe('mdi:check-circle');
  });

  it('builds real per-floor cards instead of the confirmation card when something is unavailable', async () => {
    addArea('salon', ['light.salon_a']);
    addFloor('rez_de_chaussee', ['salon']);
    mockEntityStates['light.salon_a'] = { state: 'unavailable' };

    const view = new UnavailableView();
    const sections = await view.createSectionCards();

    expect(sections).toHaveLength(1);
    const cardTypes = sections[0].cards.map((c: any) => c.type);
    expect(cardTypes).not.toContain('custom:mushroom-template-card');
    expect(cardTypes).toContain('fake-controller-card');
    expect(cardTypes).toContain('fake-grouped-card');
  });
});
