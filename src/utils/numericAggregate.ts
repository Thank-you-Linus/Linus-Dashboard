/**
 * Pure helpers shared by the chip, the popup and Helper for numeric sensor
 * aggregates (temperature, voltage, power...).
 *
 * The backend (`sensor.py`'s LinusDashboardNumericAggregateSensor) is the one
 * place that converts members to a common unit. The frontend reads that
 * sensor; only when it is missing does it compute a client-side value, and
 * then it keeps a single unit (no conversion: members in another unit are
 * left out) so it never mixes V with mV, W with kW, °C with °F...
 *
 * No import of Helper here: everything takes what it needs as arguments so it
 * can be unit-tested without mocks.
 */

export type NumericScope = 'area' | 'floor' | 'global';
export type NumericMode = 'average' | 'sum' | 'min';

/** Minimal shape of an entity state, as exposed by hass.states. */
export interface NumericStateLike {
  state: string;
  attributes?: Record<string, unknown>;
}

export type NumericStateGetter = (entityId: string) => NumericStateLike | undefined;

const SUM_STATE_CLASSES = ['total', 'total_increasing'];

/** Mirrors aggregate.py's MIN_MODE_DEVICE_CLASSES. */
const MIN_MODE_DEVICE_CLASSES = ['battery'];

/**
 * Entity id of the backend aggregate for a scope, or null when the id the
 * backend would use cannot be built (no real area_id / floor_id: no fallback
 * on the slug, which could resolve another area's sensor).
 *
 * Mirrors sensor.py: `sensor.linus_dashboard_<dc>_area_<area_id>`,
 * `_floor_<floor_id>` or `_global`.
 */
export function numericAggregateEntityId(
  deviceClass: string,
  scope: NumericScope,
  ids: { areaId?: string | undefined; floorId?: string | undefined } = {}
): string | null {
  const prefix = `sensor.linus_dashboard_${deviceClass}`;
  if (scope === 'global') return `${prefix}_global`;
  if (scope === 'area') return ids.areaId ? `${prefix}_area_${ids.areaId}` : null;
  return ids.floorId ? `${prefix}_floor_${ids.floorId}` : null;
}

export interface ResolvedScope {
  scope: NumericScope;
  areaId?: string;
  floorId?: string;
}

/**
 * Concrete scope of a chip/popup: an area needs a real area_id (resolved from
 * its slug, never used as a fallback), a floor needs its floor_id, and
 * anything else (incl. a floor scope without floor_id) is the global scope.
 * null when an area scope cannot be resolved to an area_id.
 *
 * Single definition of the scope rules, shared by AggregateChip (backend
 * group lookups included) and AggregatePopup.
 */
export function resolveAggregateScope(
  scope: string | undefined,
  target: { areaSlug?: string | string[] | undefined; floorId?: string | undefined },
  getAreaIdBySlug: (slug: string) => string | undefined
): ResolvedScope | null {
  if (scope === 'area') {
    if (!target.areaSlug || Array.isArray(target.areaSlug)) return null;
    const areaId = getAreaIdBySlug(target.areaSlug);
    return areaId ? { scope: 'area', areaId } : null;
  }
  if (scope === 'floor' && target.floorId) return { scope: 'floor', floorId: target.floorId };
  return { scope: 'global' };
}

/** Mirrors aggregate.py's resolve_numeric_aggregation_mode. */
export function resolveNumericMode(
  deviceClass: string | null | undefined,
  stateClass: string | null | undefined
): NumericMode {
  if (deviceClass && MIN_MODE_DEVICE_CLASSES.includes(deviceClass)) return 'min';
  if (stateClass && SUM_STATE_CLASSES.includes(stateClass)) return 'sum';
  return 'average';
}

const isNumeric = (value: string): boolean => value.trim() !== '' && Number.isFinite(Number(value));

/**
 * Unit shared by the most numeric members; a tie goes to the first one in
 * sort order. null when no numeric member reports a unit.
 */
export function referenceUnit(entityIds: string[], getState: NumericStateGetter): string | null {
  const counts = new Map<string, number>();
  for (const entityId of entityIds) {
    const state = getState(entityId);
    if (!state || !isNumeric(state.state)) continue;
    const unit = state.attributes?.unit_of_measurement;
    if (typeof unit === 'string' && unit !== '') {
      counts.set(unit, (counts.get(unit) ?? 0) + 1);
    }
  }
  const ranked = [...counts.entries()].sort(
    ([unitA, countA], [unitB, countB]) => countB - countA || (unitA < unitB ? -1 : unitA > unitB ? 1 : 0)
  );
  return ranked[0]?.[0] ?? null;
}

/** Escapes a value for use inside a single-quoted Jinja string literal. */
export function jinjaString(value: string): string {
  return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Aggregation mode the fallback uses: state_class sampled from the first member, like the backend. */
export function fallbackMode(
  entityIds: string[],
  deviceClass: string | null | undefined,
  getState: NumericStateGetter
): NumericMode {
  const first = entityIds.length ? getState(entityIds[0]!) : undefined;
  const stateClass = first?.attributes?.state_class;
  return resolveNumericMode(deviceClass, typeof stateClass === 'string' ? stateClass : null);
}

/**
 * Jinja that aggregates the members sharing the reference unit and renders
 * "value unit" (nothing, or `emptyText`, when no member qualifies). Members in
 * another unit are excluded rather than converted: the frontend does not
 * reimplement Home Assistant's unit converters.
 */
export function numericFallbackTemplate(
  entityIds: string[],
  deviceClass: string | null | undefined,
  getState: NumericStateGetter,
  emptyText = ''
): string {
  const unit = referenceUnit(entityIds, getState);
  const mode = fallbackMode(entityIds, deviceClass, getState);
  const members = entityIds.map(id => `states[${jinjaString(id)}]`).join(', ');
  const unitFilter = unit === null
    ? ''
    : ` | selectattr('attributes.unit_of_measurement', 'eq', ${jinjaString(unit)})`;
  const aggregate = {
    sum: 'vals | sum',
    min: 'vals | min',
    average: '(vals | sum) / (vals | length)',
  }[mode];
  const unitOutput = unit === null ? '' : ` {{ ${jinjaString(unit)} }}`;
  const empty = emptyText === '' ? '' : `{% else %}${emptyText}`;

  return `{% set vals = [${members}] | reject('none')${unitFilter} | selectattr('state', 'is_number') | map(attribute='state') | map('float') | list %}`
    + `{% if vals | length > 0 %}{{ (${aggregate}) | round(1) }}${unitOutput}${empty}{% endif %}`;
}

/** Jinja rendering a backend aggregate as "value unit" (nothing while it is not a number). */
export function numericAggregateValueTemplate(aggregateId: string): string {
  const id = jinjaString(aggregateId);
  return `{% set v = states(${id}) %}{% if v is number %}{{ v }} {{ state_attr(${id}, 'unit_of_measurement') or '' }}{% endif %}`;
}
