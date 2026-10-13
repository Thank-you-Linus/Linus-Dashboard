import { describe, it, expect } from 'vitest';

import {
  fallbackMode,
  jinjaString,
  numericAggregateEntityId,
  numericAggregateValueTemplate,
  numericFallbackTemplate,
  referenceUnit,
  resolveAggregateScope,
  resolveNumericMode,
  type NumericStateLike,
} from '../../src/utils/numericAggregate';

/**
 * TK-157: numeric aggregates must never combine members of different units.
 * These helpers are pure (no Helper import), so no mock is needed.
 */

const states: Record<string, NumericStateLike> = {};
const getState = (id: string) => states[id];

const set = (id: string, state: string, unit?: string, extra: Record<string, unknown> = {}) => {
  states[id] = { state, attributes: { ...(unit ? { unit_of_measurement: unit } : {}), ...extra } };
};

describe('numericAggregateEntityId', () => {
  it('mirrors the backend unique_id per scope', () => {
    expect(numericAggregateEntityId('voltage', 'area', { areaId: 'garage' })).toBe(
      'sensor.linus_dashboard_voltage_area_garage'
    );
    expect(numericAggregateEntityId('voltage', 'floor', { floorId: 'rez' })).toBe(
      'sensor.linus_dashboard_voltage_floor_rez'
    );
    expect(numericAggregateEntityId('voltage', 'global')).toBe('sensor.linus_dashboard_voltage_global');
  });

  it('keeps a non-ASCII area_id as is (no slugification)', () => {
    expect(numericAggregateEntityId('temperature', 'area', { areaId: 'cuisine_été' })).toBe(
      'sensor.linus_dashboard_temperature_area_cuisine_été'
    );
  });

  it('returns null when the area_id or floor_id is missing', () => {
    expect(numericAggregateEntityId('voltage', 'area', {})).toBeNull();
    expect(numericAggregateEntityId('voltage', 'floor', {})).toBeNull();
  });
});

describe('resolveAggregateScope', () => {
  const byId: Record<string, string> = { garage_slug: 'garage' };
  const lookup = (slug: string) => byId[slug];

  it('resolves an area from its slug to the real area_id', () => {
    expect(resolveAggregateScope('area', { areaSlug: 'garage_slug' }, lookup)).toEqual({
      scope: 'area',
      areaId: 'garage',
    });
  });

  it('returns null for an unknown slug, an array of slugs or no slug (never a slug fallback)', () => {
    expect(resolveAggregateScope('area', { areaSlug: 'nope' }, lookup)).toBeNull();
    expect(resolveAggregateScope('area', { areaSlug: ['garage_slug'] }, lookup)).toBeNull();
    expect(resolveAggregateScope('area', {}, lookup)).toBeNull();
  });

  it('resolves a floor, and treats everything else as global', () => {
    expect(resolveAggregateScope('floor', { floorId: 'rez' }, lookup)).toEqual({ scope: 'floor', floorId: 'rez' });
    expect(resolveAggregateScope('floor', {}, lookup)).toEqual({ scope: 'global' });
    expect(resolveAggregateScope('global', {}, lookup)).toEqual({ scope: 'global' });
    expect(resolveAggregateScope(undefined, {}, lookup)).toEqual({ scope: 'global' });
  });
});

describe('resolveNumericMode (mirror of aggregate.py)', () => {
  it('battery is a minimum whatever its state_class', () => {
    expect(resolveNumericMode('battery', 'measurement')).toBe('min');
    expect(resolveNumericMode('battery', 'total')).toBe('min');
  });

  it('total / total_increasing sum, everything else averages', () => {
    expect(resolveNumericMode('energy', 'total')).toBe('sum');
    expect(resolveNumericMode('energy', 'total_increasing')).toBe('sum');
    expect(resolveNumericMode('temperature', 'measurement')).toBe('average');
    expect(resolveNumericMode('voltage', null)).toBe('average');
    expect(resolveNumericMode(null, undefined)).toBe('average');
  });
});

describe('referenceUnit', () => {
  it('picks the most frequent unit among numeric members', () => {
    set('sensor.a', '234', 'V');
    set('sensor.b', '235', 'V');
    set('sensor.c', '3000', 'mV');
    expect(referenceUnit(['sensor.a', 'sensor.b', 'sensor.c'], getState)).toBe('V');
  });

  it('breaks a tie by sort order, whatever the member order', () => {
    set('sensor.a', '1500', 'W');
    set('sensor.b', '2', 'kW');
    expect(referenceUnit(['sensor.a', 'sensor.b'], getState)).toBe('W');
    expect(referenceUnit(['sensor.b', 'sensor.a'], getState)).toBe('W');
  });

  it('ignores unavailable, non-numeric, missing and unit-less members', () => {
    set('sensor.ok', '10', 'V');
    set('sensor.off', 'unavailable', 'mV');
    set('sensor.txt', 'on', 'mV');
    set('sensor.nounit', '5');
    expect(referenceUnit(['sensor.ok', 'sensor.off', 'sensor.txt', 'sensor.nounit', 'sensor.ghost'], getState)).toBe('V');
    expect(referenceUnit(['sensor.nounit'], getState)).toBeNull();
  });
});

describe('jinjaString', () => {
  it('escapes quotes and backslashes so a unit cannot break out of the literal', () => {
    expect(jinjaString("it's")).toBe("'it\\'s'");
    expect(jinjaString('a\\b')).toBe("'a\\\\b'");
    expect(jinjaString("x' %}{{ evil")).toBe("'x\\' %}{{ evil'");
  });
});

describe('numericFallbackTemplate', () => {
  it('keeps only the members of the reference unit (garage: V wins over a single mV)', () => {
    set('sensor.plug1', '234', 'V', { state_class: 'measurement' });
    set('sensor.plug2', '236', 'V');
    set('sensor.zb', '3000', 'mV');
    const tpl = numericFallbackTemplate(['sensor.plug1', 'sensor.plug2', 'sensor.zb'], 'voltage', getState);
    expect(tpl).toContain("selectattr('attributes.unit_of_measurement', 'eq', 'V')");
    expect(tpl).not.toContain("'mV'");
    // Voltage is averaged, as the backend does (no longer summed).
    expect(tpl).toContain('(vals | sum) / (vals | length)');
    expect(tpl).toContain("{{ 'V' }}");
  });

  it('follows the backend mode: sum for total state_class, min for battery', () => {
    set('sensor.e1', '1', 'kWh', { state_class: 'total_increasing' });
    expect(fallbackMode(['sensor.e1'], 'energy', getState)).toBe('sum');
    expect(numericFallbackTemplate(['sensor.e1'], 'energy', getState)).toContain('{{ (vals | sum) | round(1) }}');

    set('sensor.b1', '80', '%');
    expect(numericFallbackTemplate(['sensor.b1'], 'battery', getState)).toContain('{{ (vals | min) | round(1) }}');
  });

  it('escapes the unit and entity ids', () => {
    set("sensor.we'ird", '1', "u'nit");
    const tpl = numericFallbackTemplate(["sensor.we'ird"], 'distance', getState);
    expect(tpl).toContain("states['sensor.we\\'ird']");
    expect(tpl).toContain("'eq', 'u\\'nit')");
  });

  it('renders the empty text only when asked to', () => {
    set('sensor.a', '1', 'V');
    expect(numericFallbackTemplate(['sensor.a'], 'voltage', getState)).not.toContain('{% else %}');
    expect(numericFallbackTemplate(['sensor.a'], 'voltage', getState, '—')).toContain('{% else %}—{% endif %}');
  });

  it('does not filter on a unit when no member has one', () => {
    set('sensor.n1', '4');
    const tpl = numericFallbackTemplate(['sensor.n1'], 'aqi', getState);
    expect(tpl).not.toContain('unit_of_measurement');
  });
});

describe('numericAggregateValueTemplate', () => {
  it('reads the state and the unit of the same entity, and is empty while not a number', () => {
    const tpl = numericAggregateValueTemplate('sensor.linus_dashboard_voltage_area_garage');
    expect(tpl).toContain("states('sensor.linus_dashboard_voltage_area_garage')");
    expect(tpl).toContain("state_attr('sensor.linus_dashboard_voltage_area_garage', 'unit_of_measurement')");
    expect(tpl).toContain('{% if v | is_number %}');
  });

  it('never uses the `is number` test: states() returns a string, so it would always be false', () => {
    const tpl = numericAggregateValueTemplate('sensor.linus_dashboard_voltage_area_garage');
    expect(tpl).not.toMatch(/\bis number\b/);
  });
});
