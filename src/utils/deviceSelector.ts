import { Helper } from "../Helper";
import type { PopupConfig } from "../services/PopupFactory";
import { generic } from "../types/strategy/generic";
import { OWN_AGGREGATE_PLATFORMS } from "../variables";

import StrategyArea = generic.StrategyArea;
import StrategyDevice = generic.StrategyDevice;

/**
 * Device selection by scope (global / floor / area).
 *
 * Reads what Helper already loaded — no websocket call. Devices are always
 * reached through `StrategyArea.devices` (never `Helper.devices` directly), so
 * Magic Areas' own devices are already filtered out upstream.
 *
 * Visibility mirrors HomeView exactly, for every scope (global included):
 * - floor: not `hidden`, not `Helper.isFloorExcluded`;
 * - area: not `strategyOptions.areas[slug].hidden`, not `Helper.isAreaExcluded`;
 * - a floor whose areas are all excluded contributes nothing.
 *
 * Device-level decisions (see TK-60):
 * - `Helper.isDeviceExcluded` devices are dropped (Helper only drops their entities);
 * - `disabled_by !== null` devices are dropped;
 * - `entry_type === "service"` devices are kept only if at least one entity
 *   remains after `getDeviceEntityIds` filtering.
 */

/** Scope vocabulary, shared with popups. */
export type DeviceScope = PopupConfig["scope"];

export interface DeviceScopeOptions {
  scope: DeviceScope;
  /** Area slug (not area_id) — required for the "area" scope. */
  area_slug?: string;
  /** Floor id — required for the "floor" scope. */
  floor_id?: string;
}

/**
 * Entity ids of a device, restricted to entities kept by Helper and without
 * our own aggregate/group entities (Magic Areas, Linus Brain, Linus Dashboard),
 * which `StrategyDevice.entities` still contains.
 *
 * @param device - The device.
 * @returns Entity ids of the device's "real" entities.
 */
export function getDeviceEntityIds(device: StrategyDevice): string[] {
  return (device.entities ?? []).filter(entityId => {
    const entity = Helper.entities[entityId];
    if (!entity) return false;
    return !OWN_AGGREGATE_PLATFORMS.has(entity.platform);
  });
}

/**
 * Areas visible in Linus Dashboard, in floor order, with the same filters as HomeView.
 *
 * @param floorId - Optional floor id to restrict to.
 * @returns Visible areas.
 */
function getVisibleAreas(floorId?: string): StrategyArea[] {
  const areas: StrategyArea[] = [];

  for (const floor of Helper.orderedFloors) {
    if (floorId !== undefined && floor.floor_id !== floorId) continue;
    if (floor.hidden) continue;
    if (Helper.isFloorExcluded(floor.floor_id)) continue;

    for (const areaSlug of floor.areas_slug) {
      const area = Helper.areas[areaSlug];
      if (!area) continue;
      if (Helper.strategyOptions.areas[area.slug]?.hidden) continue;
      if (Helper.isAreaExcluded(area.area_id)) continue;
      areas.push(area);
    }
  }

  return areas;
}

/**
 * Whether a device should be listed.
 *
 * @param device - The device.
 * @returns True if the device is kept.
 */
function isDeviceKept(device: StrategyDevice): boolean {
  if (Helper.isDeviceExcluded(device.id)) return false;
  if (device.disabled_by !== null && device.disabled_by !== undefined) return false;
  if (device.entry_type === "service" && getDeviceEntityIds(device).length === 0) return false;
  return true;
}

/**
 * Devices of a scope.
 *
 * Unknown scope, or unknown / hidden / excluded area or floor, returns `[]`.
 *
 * @param options - Scope and its target (area_slug or floor_id).
 * @returns Devices in floor → area order.
 */
export function getDevicesForScope(options: DeviceScopeOptions): StrategyDevice[] {
  const { scope, area_slug, floor_id } = options;

  let areas: StrategyArea[];
  switch (scope) {
    case "global":
      areas = getVisibleAreas();
      break;
    case "floor":
      if (!floor_id) return [];
      areas = getVisibleAreas(floor_id);
      break;
    case "area":
      if (!area_slug) return [];
      areas = getVisibleAreas().filter(area => area.slug === area_slug);
      break;
    default:
      return [];
  }

  const devices: StrategyDevice[] = [];
  for (const area of areas) {
    for (const deviceId of area.devices ?? []) {
      const device = Helper.devices[deviceId];
      if (device && isDeviceKept(device)) devices.push(device);
    }
  }

  return devices;
}
