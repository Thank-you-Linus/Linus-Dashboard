/**
 * Device Class Helper Module
 * 
 * Provides utility functions for creating device_class-specific chips and
 * standard extraControls implementations across all domains.
 * 
 * This module eliminates code duplication in configurationDefaults.ts by
 * providing reusable functions for common patterns.
 */

/**
 * Create device_class-specific aggregate chips for a domain.
 * 
 * Groups entities by their device_class attribute and creates separate chips
 * for each device_class. If no device_class is found, creates a single chip
 * for all entities (fallback behavior).
 * 
 * @param domain - Domain name (e.g., "climate", "cover", "media_player")
 * @param contextData - Device context (floor or area)
 * @param contextType - Type of context ("floor" or "area")
 * @returns Array of chip configurations
 */
export function createDeviceClassChips(
  domain: string,
  contextData: any,
  contextType: "floor" | "area"
): any[] {
  const chips: any[] = [];
  const Helper = require("../Helper").Helper;
  
  if (!Helper.isInitialized()) return chips;

  // Import AggregateChip dynamically
  const { AggregateChip } = require("../chips/AggregateChip");

  // Get entities for this context
  let entities: any[] = [];
  
  if (contextType === "floor") {
    const floor = Helper.floors[contextData.floor_id];
    if (!floor?.areas_slug) return chips;
    
    // Get all entities from all areas in this floor
    for (const areaSlug of floor.areas_slug) {
      const area = Helper.areas[areaSlug];
      if (area) {
        const areaEntities = Helper.getAreaEntities(area, domain);
        entities.push(...areaEntities);
      }
    }
  } else {
    // Area context
    const area = Helper.areas[contextData.area_slug];
    if (!area) return chips;
    entities = Helper.getAreaEntities(area, domain);
  }

  if (entities.length === 0) return chips;

  // Group entities by device_class
  const deviceClassMap: Record<string, string[]> = {};
  
  for (const entity of entities) {
    const entityState = Helper.getEntityState(entity.entity_id);
    const deviceClass = entityState?.attributes?.device_class || "_";
    
    if (!deviceClassMap[deviceClass]) {
      deviceClassMap[deviceClass] = [];
    }
    deviceClassMap[deviceClass].push(entity.entity_id);
  }

  const deviceClasses = Object.keys(deviceClassMap);
  
  // Sort device classes: named classes first (alphabetically), then "_" (no class) last
  const sortedDeviceClasses = deviceClasses.sort((a, b) => {
    if (a === "_") return 1;  // "_" goes last
    if (b === "_") return -1; // "_" goes last
    return a.localeCompare(b); // Alphabetical for named classes
  });

  console.log(`[DeviceClass] ${domain} ${contextType} "${contextData.floor_id || contextData.area_slug}" - Found device_classes: ${sortedDeviceClasses.join(", ")}`);

  // If only "_" (no device_class), create single fallback chip
  if (sortedDeviceClasses.length === 1 && sortedDeviceClasses[0] === "_") {
    console.log(`[DeviceClass] ${domain} ${contextType} - No device_class found, creating single fallback chip`);
    chips.push(new AggregateChip({
      domain,
      device_class: undefined,
      scope: contextType,
      ...(contextType === "floor" 
        ? { floor_id: contextData.floor_id } 
        : { area_slug: contextData.area_slug, magic_device_id: contextData.magic_device_id }
      )
    }).getChip());
  } else {
    // Create a chip per device_class (including "_" if mixed with others)
    console.log(`[DeviceClass] ${domain} ${contextType} - Creating ${sortedDeviceClasses.length} chip(s) by device_class`);
    for (const deviceClass of sortedDeviceClasses) {
      if (deviceClassMap[deviceClass].length > 0) {
        chips.push(new AggregateChip({
          domain,
          device_class: deviceClass === "_" ? undefined : deviceClass,
          scope: contextType,
          ...(contextType === "floor" 
            ? { floor_id: contextData.floor_id } 
            : { area_slug: contextData.area_slug, magic_device_id: contextData.magic_device_id }
          )
        }).getChip());
      }
    }
  }
  
  return chips;
}

/**
 * Factory function to create a standard extraControls implementation
 * This eliminates code duplication across domain configurations
 * 
 * @param domain - Domain name
 * @param options - Optional configuration
 * @returns extraControls function
 */
export function createStandardExtraControls(
  domain: string,
  options?: {
    controlChipEntity?: string; // e.g., "switch_control", "media_player_control"
  }
) {
  return (device: any) => {
    const chips: any[] = [];
    const Helper = require("../Helper").Helper;
    
    if (!Helper.isInitialized()) return chips;
    
    const floor = Helper.floors[device.slug];
    const area = Helper.areas[device.slug];
    
    if (floor) {
      // Floor context: create device_class-specific chips
      chips.push(...createDeviceClassChips(domain, { floor_id: device.slug }, "floor"));
    } else if (area) {
      // Area context: create device_class-specific chips
      chips.push(...createDeviceClassChips(domain, { 
        area_slug: device.slug,
        magic_device_id: area.magicAreaDevice?.id 
      }, "area"));
      
      // Add control chip if specified (e.g., switch_control, media_player_control)
      if (options?.controlChipEntity) {
        const controlEntity = area.domains?.[options.controlChipEntity];
        if (controlEntity?.length) {
          const { ControlChip } = require("../chips/ControlChip");
          chips.push(new ControlChip({
            area_slug: device.slug,
            magic_device_id: area.magicAreaDevice?.id,
          }).getChip());
        }
      }
    }
    
    return chips;
  };
}
