import { describe, it, expect, vi, beforeEach } from 'vitest';

import { numericFallbackTemplate } from '../../src/utils/numericAggregate';

/**
 * TK-157: a `sensor` device_class chip reads the backend numeric aggregate
 * (`sensor.linus_dashboard_<dc>_...`), whose unit is already consistent, instead
 * of re-aggregating raw members (first member's unit, sum of voltages...).
 * Without the aggregate (absent or unavailable) it falls back to a template
 * that only combines members sharing one unit.
 */

const SLUG = 'garage_slug';
const AREA_ID = 'garage';
const FLOOR_ID = 'rez_de_chaussee';

const mockAreaIdBySlug: Record<string, string> = {};
const mockStates: Record<string, { state: string; attributes?: Record<string, unknown> }> = {};

const MEMBERS = ['sensor.plug', 'sensor.plug2', 'sensor.zb'];

vi.mock('../../src/Helper', () => ({
  Helper: {
    isInitialized: vi.fn(() => true),
    debug: false,
    strategyOptions: { domains: {}, debug: false },
    areas: { [SLUG]: { area_id: AREA_ID, name: 'Garage', slug: SLUG } },
    floors: { [FLOOR_ID]: { floor_id: FLOOR_ID, name: 'Rez-de-chaussée' } },
    entities: {},
    getAreaIdBySlug: (slug: string) => mockAreaIdBySlug[slug],
    getEntityState: (entity_id: string) => mockStates[entity_id],
    getEntityIds: vi.fn(() => MEMBERS),
    getIcon: vi.fn((_d: string, _dc: string, ids: string[]) => `icon:${ids.join(',')}`),
    getIconColor: vi.fn((_d: string, _dc: string, ids: string[]) => `color:${ids.join(',')}`),
    // Real fallback template, fed with the fake states.
    getContent: vi.fn((_d: string, dc: string, ids: string[]) =>
      numericFallbackTemplate(ids, dc, id => mockStates[id])
    ),
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

vi.mock('../../src/services/PopupFactory', () => ({
  PopupFactory: {
    createPopup: vi.fn(() => ({ action: 'fire-dom-event', browser_mod: {} })),
  },
}));

describe('AggregateChip — numeric sensor aggregates', () => {
  let AggregateChip: any;

  beforeEach(async () => {
    Object.keys(mockAreaIdBySlug).forEach(k => delete mockAreaIdBySlug[k]);
    Object.keys(mockStates).forEach(k => delete mockStates[k]);
    mockAreaIdBySlug[SLUG] = AREA_ID;
    // Garage: 2 mains plugs in V, 1 Zigbee battery sensor in mV.
    mockStates['sensor.plug'] = { state: '234', attributes: { unit_of_measurement: 'V' } };
    mockStates['sensor.plug2'] = { state: '236', attributes: { unit_of_measurement: 'V' } };
    mockStates['sensor.zb'] = { state: '3000', attributes: { unit_of_measurement: 'mV' } };

    const mod = await import('../../src/chips/AggregateChip');
    AggregateChip = mod.AggregateChip;
  });

  const build = (options: Record<string, unknown>): any =>
    new AggregateChip({ domain: 'sensor', device_class: 'voltage', show_content: true, ...options }).getChip();

  it.each([
    ['area', { scope: 'area', area_slug: SLUG }, `sensor.linus_dashboard_voltage_area_${AREA_ID}`],
    ['floor', { scope: 'floor', floor_id: FLOOR_ID }, `sensor.linus_dashboard_voltage_floor_${FLOOR_ID}`],
    ['global', { scope: 'global' }, 'sensor.linus_dashboard_voltage_global'],
  ])('%s scope reads the backend aggregate state and unit', (_name, options, expected) => {
    mockStates[expected] = { state: '105.7', attributes: { unit_of_measurement: 'V', mode: 'average' } };

    const chip = build(options);

    expect(chip.entity_id).toEqual([expected]);
    expect(chip.icon).toContain(expected);
    expect(chip.icon_color).toContain(expected);
    expect(chip.content).toContain(`states('${expected}')`);
    expect(chip.content).toContain(`state_attr('${expected}', 'unit_of_measurement')`);
    // Same entity as the member-less read: no re-aggregation of the raw members.
    expect(chip.content).not.toContain('sensor.plug');
  });

  it('names the area aggregate from the real area_id, not from the name slug', () => {
    mockStates[`sensor.linus_dashboard_voltage_area_${SLUG}`] = { state: '1', attributes: {} };
    const chip = build({ scope: 'area', area_slug: SLUG });
    expect(chip.entity_id).toEqual(MEMBERS);
  });

  it.each([
    ['absent', undefined],
    ['unavailable', { state: 'unavailable', attributes: {} }],
  ])('falls back to the single-unit template when the aggregate is %s', (_name, aggregate) => {
    const id = `sensor.linus_dashboard_voltage_area_${AREA_ID}`;
    if (aggregate) mockStates[id] = aggregate;

    const chip = build({ scope: 'area', area_slug: SLUG });

    expect(chip.entity_id).toEqual(MEMBERS);
    // Majority unit (V) only: the mV member is never combined with the others,
    // and voltage is averaged, not summed.
    expect(chip.content).toContain("'eq', 'V')");
    expect(chip.content).not.toContain("'mV'");
    expect(chip.content).toContain('(vals | sum) / (vals | length)');
  });

  it('falls back when the slug maps to no area_id', () => {
    delete mockAreaIdBySlug[SLUG];
    mockStates[`sensor.linus_dashboard_voltage_area_${AREA_ID}`] = { state: '105.7', attributes: {} };

    const chip = build({ scope: 'area', area_slug: SLUG });

    expect(chip.entity_id).toEqual(MEMBERS);
  });

  it('an `unknown` aggregate is still read (empty content), never replaced by raw members', () => {
    const id = 'sensor.linus_dashboard_voltage_global';
    mockStates[id] = { state: 'unknown', attributes: {} };

    const chip = build({ scope: 'global' });

    expect(chip.entity_id).toEqual([id]);
    expect(chip.content).toContain('{% if v is number %}');
  });

  it('non-regression: a non-sensor chip does not look for a numeric aggregate', () => {
    mockStates['sensor.linus_dashboard_voltage_global'] = { state: '1', attributes: {} };
    const chip = build({ domain: 'light', device_class: undefined, scope: 'global' });
    expect(chip.entity_id).not.toContain('sensor.linus_dashboard_voltage_global');
  });
});
