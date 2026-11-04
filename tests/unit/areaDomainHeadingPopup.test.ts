import { describe, it, expect, vi, beforeAll } from 'vitest';

/**
 * In a room view, tapping a domain heading (e.g. "Lights") opens a pop-up
 * listing only that room's entities of that domain — the same pop-up as the
 * room's chip — instead of navigating to the house-wide domain view (PR #224).
 * Frozen dataset, real Helper (registries served by a fake callWS).
 */
vi.mock('home-assistant-js-websocket', () => ({}));

// PopupFactory loads each pop-up class with require(), which rspack resolves
// in the bundle but Node cannot for .ts sources: record the pop-up config
// instead (same approach as aggregateChipGroupResolution.test.ts).
vi.mock('../../src/services/PopupFactory', () => ({
  PopupFactory: {
    createPopup: vi.fn((config: any) => ({ action: 'fire-dom-event', popupConfig: config })),
  },
}));

import { Helper } from '../../src/Helper';
import { ControllerCard } from '../../src/cards/ControllerCard';
import { getAreaDomainPopupAction } from '../../src/utils';

type Registry = Record<string, unknown>;

const AREAS: Registry[] = [
  { area_id: 'kitchen', name: 'Kitchen', floor_id: 'ground' },
  { area_id: 'bedroom', name: 'Bedroom', floor_id: 'ground' },
];

const ENTITIES: Registry[] = [
  { entity_id: 'light.kitchen_ceiling', area_id: 'kitchen', device_id: null, labels: [] },
  { entity_id: 'light.kitchen_counter', area_id: 'kitchen', device_id: null, labels: [] },
  { entity_id: 'light.kitchen_island', area_id: 'kitchen', device_id: null, labels: [] },
  { entity_id: 'light.bedroom_lamp', area_id: 'bedroom', device_id: null, labels: [] },
];

async function initHelper(): Promise<void> {
  const states: Record<string, unknown> = {};
  for (const entity of ENTITIES) {
    const entityId = entity.entity_id as string;
    states[entityId] = { entity_id: entityId, state: 'on', attributes: { friendly_name: entityId } };
  }
  const hass: any = {
    states,
    localize: (key: string) => key,
    callWS: vi.fn(async ({ type }: { type: string }) => {
      switch (type) {
        case 'config/entity_registry/list':
          return ENTITIES.map(e => ({ ...e }));
        case 'config/device_registry/list':
          return [];
        case 'config/area_registry/list':
          return AREAS.map(a => ({ ...a }));
        case 'config/floor_registry/list':
          return [{ floor_id: 'ground', name: 'Ground', level: 0 }];
        case 'config/label_registry/list':
          return [];
        case 'frontend/get_icons':
          return { resources: {} };
        case 'linus_dashboard/get_config':
          return {};
        default:
          return [];
      }
    }),
  };
  await Helper.initialize({ hass, config: { strategy: { options: {} } } } as any);
  // generateView() waits for this too: it sets up the EntityResolver the
  // area-scoped AggregateChip uses to find the room's light group.
  await Helper.awaitDeferredInit();
}

describe('room view domain heading opens a room-scoped pop-up', () => {
  beforeAll(async () => {
    await initHelper();
  });

  it('builds the light pop-up scoped to the room', () => {
    const action: any = getAreaDomainPopupAction('light', undefined, 'kitchen');
    expect(action).toBeDefined();
    expect(action.action).not.toBe('navigate');
    expect(action.popupConfig).toMatchObject({ domain: 'light', scope: 'area', area_slug: 'kitchen' });
  });

  it('returns undefined when the room has no entity of that domain', () => {
    expect(getAreaDomainPopupAction('cover', undefined, 'kitchen')).toBeUndefined();
  });

  it('ControllerCard uses title_tap_action over titleNavigate', () => {
    const popup = { action: 'fire-dom-event', browser_mod: { service: 'browser_mod.popup' } };
    const [heading]: any[] = new ControllerCard(
      { title: 'Lights', titleNavigate: 'light', title_tap_action: popup as any, showControls: false },
      'light',
      'kitchen'
    ).createCard();
    expect(heading.tap_action).toBe(popup);
  });

  it('ControllerCard still navigates when no title_tap_action is given', () => {
    const [heading]: any[] = new ControllerCard(
      { title: 'Lights', titleNavigate: 'light', showControls: false },
      'light',
      'kitchen'
    ).createCard();
    expect(heading.tap_action).toEqual({ action: 'navigate', navigation_path: 'light' });
  });
});
