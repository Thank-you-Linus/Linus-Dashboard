import { describe, it, expect, vi, beforeAll } from 'vitest';

/**
 * TK-260: the area-view Tags chip must count the distinct labels carried by
 * the area's entities, whether the HA area_id equals the dashboard area slug
 * or not, and whether the entity is attached directly or via its device.
 * Frozen dataset, real Helper (registries served by a fake callWS).
 */
vi.mock('home-assistant-js-websocket', () => ({}));

import { Helper } from '../../src/Helper';
import { TagsChip } from '../../src/chips/TagsChip';

type Registry = Record<string, unknown>;

const AREAS: Registry[] = [
  // "Stuen" slugifies to `stuen` while its area_id is `salon`.
  { area_id: 'salon', name: 'Stuen', floor_id: 'rdc' },
  { area_id: 'bureau', name: 'Bureau', floor_id: 'rdc' },
  { area_id: 'garage', name: 'Garage', floor_id: 'rdc' },
];

const LABELS: Registry[] = [
  { label_id: 'a', name: 'A' },
  { label_id: 'b', name: 'B' },
  { label_id: 'c', name: 'C' },
  { label_id: 'd', name: 'D' },
  { label_id: 'e', name: 'E' },
];

const BASE_DEVICES: Registry[] = [
  { id: 'dev_garage', area_id: 'garage', name: 'Garage device' },
];

const BASE_ENTITIES: Registry[] = [
  { entity_id: 'light.stuen_a', area_id: 'salon', device_id: null, labels: ['a', 'b'] },
  { entity_id: 'sensor.stuen_b', area_id: 'salon', device_id: null, labels: ['a'] },
  { entity_id: 'light.bureau_1', area_id: 'bureau', device_id: null, labels: ['a'] },
  { entity_id: 'sensor.bureau_2', area_id: 'bureau', device_id: null, labels: ['d'] },
  { entity_id: 'light.garage_direct', area_id: 'garage', device_id: null, labels: [] },
  { entity_id: 'sensor.garage_via_device', area_id: null, device_id: 'dev_garage', labels: [] },
  { entity_id: 'sensor.orphan', area_id: null, device_id: null, labels: ['e'] },
];

/** Variant: an entity with no own area, attached to Stuen through its device. */
const DEVICE_VARIANT_DEVICES: Registry[] = [
  ...BASE_DEVICES,
  { id: 'dev_stuen', area_id: 'salon', name: 'Stuen plug' },
];

const DEVICE_VARIANT_ENTITIES: Registry[] = [
  ...BASE_ENTITIES,
  { entity_id: 'switch.stuen_plug', area_id: null, device_id: 'dev_stuen', labels: ['c'] },
];

async function initHelper(entities: Registry[], devices: Registry[]): Promise<void> {
  const states: Record<string, unknown> = {};
  for (const entity of entities) {
    const entityId = entity.entity_id as string;
    states[entityId] = { entity_id: entityId, state: 'on', attributes: {} };
  }
  const hass: any = {
    states,
    localize: (key: string) => key,
    callWS: vi.fn(async ({ type }: { type: string }) => {
      switch (type) {
        case 'config/entity_registry/list':
          return entities.map(e => ({ ...e }));
        case 'config/device_registry/list':
          return devices.map(d => ({ ...d }));
        case 'config/area_registry/list':
          return AREAS.map(a => ({ ...a }));
        case 'config/floor_registry/list':
          return [{ floor_id: 'rdc', name: 'RDC', level: 0 }];
        case 'config/label_registry/list':
          return LABELS.map(l => ({ ...l }));
        case 'frontend/get_icons':
          return { resources: {} };
        case 'linus_dashboard/get_config':
          return {};
        default:
          return [];
      }
    }),
  };
  // initialize() has no early return and reassigns every registry map, so a
  // second call fully replaces the previous dataset.
  await Helper.initialize({ hass, config: { strategy: { options: {} } } } as any);
}

/** Top-level label cards of the chip popup (the nested "View All" button is not counted). */
function labelCards(chip: any): any[] {
  const cards: any[] = chip.tap_action.browser_mod.data.content.cards;
  return cards.filter(card => card.type === 'custom:mushroom-template-card');
}

function expectVisibleWith(chip: any, count: number): void {
  expect(chip.icon).toBe('mdi:tag-multiple');
  expect(chip.content).toBe(String(count));
  expect(labelCards(chip)).toHaveLength(Number(chip.content));
}

describe('TagsChip area scope — base dataset', () => {
  beforeAll(async () => {
    await initHelper(BASE_ENTITIES, BASE_DEVICES);
  });

  it('shows the chip in an area whose area_id differs from its slug (Stuen ⇒ 2)', () => {
    expect(Helper.areas.stuen?.area_id).toBe('salon');
    const chip: any = new TagsChip({ area_slug: 'stuen' }).getChip();
    expectVisibleWith(chip, 2);
  });

  it('keeps the count of an area whose slug equals its area_id (Bureau ⇒ 2)', () => {
    const chip: any = new TagsChip({ area_slug: 'bureau' }).getChip();
    expectVisibleWith(chip, 2);
  });

  it('hides the chip in an area without labelled entity, direct or via device (Garage)', () => {
    const chip: any = new TagsChip({ area_slug: 'garage' }).getChip();
    expect(chip.icon).toBeFalsy();
  });

  it('counts every distinct label in the Home view (A, B, D, E ⇒ 4)', () => {
    const chip: any = new TagsChip().getChip();
    expectVisibleWith(chip, 4);
  });
});

describe('TagsChip area scope — entity attached via its device', () => {
  beforeAll(async () => {
    await initHelper(DEVICE_VARIANT_ENTITIES, DEVICE_VARIANT_DEVICES);
  });

  it('counts a label carried only by an entity whose device is in the area (Stuen ⇒ 3)', () => {
    const chip: any = new TagsChip({ area_slug: 'stuen' }).getChip();
    expectVisibleWith(chip, 3);
    const primaries = labelCards(chip).map(card => card.primary);
    expect(primaries).toContain('C');
  });
});
