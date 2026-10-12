import { describe, it, expect, vi, beforeEach } from 'vitest';

/**
 * TK-157: the popup's statistics card shows the backend numeric aggregate
 * (same entity as the chip), labelled from its `mode` attribute. Without it,
 * the value is computed over members sharing one unit — voltage averaged, no
 * longer summed — and the label matches the mode used.
 */

const AREA_ID = 'garage';
const SLUG = 'garage_slug';
const FLOOR_ID = 'rez';
const AGG = `sensor.linus_dashboard_voltage_area_${AREA_ID}`;
const MEMBERS = ['sensor.plug', 'sensor.plug2', 'sensor.zb'];

const mockStates: Record<string, { state: string; attributes?: Record<string, unknown> }> = {};

vi.mock('../../src/Helper', () => ({
  Helper: {
    isInitialized: vi.fn(() => true),
    debug: false,
    strategyOptions: { domains: {}, debug: false },
    areas: {},
    floors: {},
    entities: {},
    orderedFloors: [],
    getEntityIds: vi.fn(() => MEMBERS),
    getAreaIdBySlug: (slug: string) => (slug === SLUG ? AREA_ID : undefined),
    getEntityState: (entity_id: string) => mockStates[entity_id],
    localize: vi.fn((key: string) => key),
    sortEntitiesByFloorAndArea: vi.fn((ids: string[]) => ids),
    getLabel: vi.fn(() => null),
    getLabelName: vi.fn((id: string) => id),
    lightSupportsBrightness: vi.fn(() => true),
  },
}));

vi.mock('home-assistant-js-websocket', () => ({}));

const LABEL = (key: string) => `**component.linus_dashboard.entity.text.aggregate_popup.state.${key}:**`;

describe('AggregatePopup — statistics card of numeric sensors', () => {
  let AggregatePopup: any;

  beforeEach(async () => {
    Object.keys(mockStates).forEach(k => delete mockStates[k]);
    mockStates['sensor.plug'] = { state: '234', attributes: { unit_of_measurement: 'V' } };
    mockStates['sensor.plug2'] = { state: '236', attributes: { unit_of_measurement: 'V' } };
    mockStates['sensor.zb'] = { state: '3000', attributes: { unit_of_measurement: 'mV' } };
    const mod = await import('../../src/popups/AggregatePopup');
    AggregatePopup = mod.AggregatePopup;
  });

  function statsCard(options: Record<string, unknown> = {}, deviceClass = 'voltage'): any {
    const popup = new AggregatePopup({
      domain: 'sensor',
      device_class: deviceClass,
      scope: 'area',
      scopeName: 'Garage',
      area_slug: SLUG,
      serviceOn: '',
      serviceOff: '',
      activeStates: [],
      translationKey: 'sensor',
      groupEntity: null,
      dedicatedGroupEntity: null,
      features: [],
      showNavigationButton: false,
      ...options,
    });
    return popup.getPopup().browser_mod.data.content.cards[0];
  }

  it.each([
    ['average', 'average'],
    ['sum', 'total'],
    ['min', 'minimum'],
  ])('shows the backend aggregate with the label of its mode (%s)', (mode, key) => {
    mockStates[AGG] = { state: '105.7', attributes: { unit_of_measurement: 'V', mode } };

    const card = statsCard();

    expect(card.type).toBe('markdown');
    expect(card.content).toContain(LABEL(key));
    expect(card.content).toContain(`states('${AGG}')`);
    expect(card.content).toContain(`state_attr('${AGG}', 'unit_of_measurement')`);
    // No raw member is aggregated by the popup itself any more.
    expect(card.content).not.toContain('sensor.plug');
  });

  it('shows the value without label when the aggregate has no mode (area official sensor)', () => {
    mockStates[AGG] = { state: '21.5', attributes: { unit_of_measurement: '°C' } };

    const card = statsCard();

    expect(card.content).not.toContain('**');
    expect(card.content).toContain(`states('${AGG}')`);
  });

  it.each(['unavailable', 'unknown'])('shows a dash, never a unit alone, when the aggregate is %s', state => {
    mockStates[AGG] = { state, attributes: { mode: 'average' } };

    const card = statsCard();

    expect(card.content).toBe(`${LABEL('average')} —`);
    expect(card.content).not.toContain('unit_of_measurement');
  });

  it('reads the floor and global aggregates for those scopes', () => {
    mockStates[`sensor.linus_dashboard_voltage_floor_${FLOOR_ID}`] = {
      state: '120',
      attributes: { unit_of_measurement: 'V', mode: 'average' },
    };
    mockStates['sensor.linus_dashboard_voltage_global'] = {
      state: '121',
      attributes: { unit_of_measurement: 'V', mode: 'average' },
    };

    expect(statsCard({ scope: 'floor', floor_id: FLOOR_ID, area_slug: undefined }).content).toContain(
      `states('sensor.linus_dashboard_voltage_floor_${FLOOR_ID}')`
    );
    expect(statsCard({ scope: 'global', area_slug: undefined }).content).toContain(
      "states('sensor.linus_dashboard_voltage_global')"
    );
  });

  it('without the aggregate, averages voltage over the majority unit (no longer a sum)', () => {
    const card = statsCard();

    expect(card.content).toContain(LABEL('average'));
    expect(card.content).toContain('(vals | sum) / (vals | length)');
    expect(card.content).toContain("'eq', 'V')");
    expect(card.content).not.toContain("'mV'");
    expect(card.content).not.toContain('{{ result }}');
  });

  it('without the aggregate, an energy sensor is summed and labelled Total', () => {
    mockStates['sensor.plug'] = {
      state: '1', attributes: { unit_of_measurement: 'kWh', state_class: 'total_increasing' },
    };
    const card = statsCard({}, 'energy');
    expect(card.content).toContain(LABEL('total'));
    expect(card.content).toContain('{{ (vals | sum) | round(1) }}');
  });

  it('without the aggregate, a battery popup shows the minimum', () => {
    mockStates['sensor.plug'] = { state: '80', attributes: { unit_of_measurement: '%' } };
    const card = statsCard({}, 'battery');
    expect(card.content).toContain(LABEL('minimum'));
    expect(card.content).toContain('{{ (vals | min) | round(1) }}');
  });

  it('falls back safely when the area slug maps to no area_id', () => {
    mockStates[AGG] = { state: '105.7', attributes: { unit_of_measurement: 'V', mode: 'average' } };
    const card = statsCard({ area_slug: 'unknown_slug' });
    expect(card.content).not.toContain(AGG);
    expect(card.content).toContain("'eq', 'V')");
  });
});
