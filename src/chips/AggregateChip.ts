import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { navigateTo } from "../utils";
import { PopupFactory } from "../services/PopupFactory";

import { AbstractChip } from "./AbstractChip";

/**
 * Aggregate Chip Options
 * 
 * Configuration interface for creating aggregate control chips across all domains.
 */
export interface AggregateChipOptions extends chips.ChipOptions {
  /** Domain to control (light, climate, cover, etc.) */
  domain: string;
  /** Scope of control: global (all areas), floor (one floor), area (one area). Defaults to "area" if area_slug provided, else "global" */
  scope?: "global" | "floor" | "area";
  /** Display name for the scope (e.g., "Living Room", "Ground Floor"). Auto-generated if not provided */
  scopeName?: string;
  /** Service name for turning on (e.g., "turn_on", "open_cover"). Auto-detected from domain if not provided */
  serviceOn?: string;
  /** Service name for turning off (e.g., "turn_off", "close_cover"). Auto-detected from domain if not provided */
  serviceOff?: string;
  /** States considered "active" for this domain. Auto-detected from domain if not provided */
  activeStates?: string[];
  /** Translation key for domain-specific text. Defaults to domain if not provided */
  translationKey?: string;
  /** Optional features for tile cards in popup */
  features?: any[];
  /** Optional device class (for covers, sensors, binary_sensors). Pass null to get ONLY entities without device_class */
  device_class?: string | null;
  /** Optional floor ID for floor scope */
  floor_id?: string | null;
  /** Tap action mode: "popup" (default) opens popup on tap, "navigation" navigates to view on tap */
  tapActionMode?: "popup" | "navigation";
}

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Aggregate Chip Class
 *
 * Universal chip for controlling groups of entities across all domains and views.
 * Supports device_class for binary_sensor, sensor, and cover domains.
 * 
 * **Features**:
 * - Automatic group entity detection (Dashboard native / Magic Areas, passed to popup as groupEntity)
 * - Scope-aware (adapts behavior for global/floor/area)
 * - EntityResolver integration (consistent entity resolution)
 * - Centralized color management (uses colorMapping from variables.ts)
 * - Home Assistant translations (reuses HA's native translations)
 * - Device class support (for binary_sensor, sensor, cover)
 * 
 * **Behavior**:
 * - tap_action: Always opens AggregatePopup (with Linus Brain/Magic Areas entity if available)
 * - hold_action: Navigates to domain/device_class view
 */
class AggregateChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {TemplateChipConfig}
   * @readonly
   * @private
   */
  readonly #defaultConfig: TemplateChipConfig = {
    type: "template",
    icon_color: "grey",
    content: "",
    tap_action: { action: "none" },
    hold_action: { action: "none" },
  };

  /**
   * Class Constructor.
   *
   * @param {AggregateChipOptions} options - The chip options
   */
  constructor(options: AggregateChipOptions) {
    super();

    // AUTO-DETECT DEFAULTS based on domain
    const defaults = this.getDefaultsForDomain(options.domain);

    // Auto-detect scope if not provided
    const scope = options.scope ?? (options.area_slug ? "area" : "global");

    // Auto-detect tapActionMode if not provided (default: "popup")
    const tapActionMode = options.tapActionMode ?? "popup";

    // Apply defaults for missing parameters
    const config: Required<Omit<AggregateChipOptions, 'features' | 'device_class' | 'floor_id' | 'tapActionMode' | keyof chips.ChipOptions>> & AggregateChipOptions = {
      ...options,
      scope,
      tapActionMode,
      scopeName: options.scopeName ?? this.generateScopeName(options, scope),
      serviceOn: options.serviceOn ?? defaults.serviceOn,
      serviceOff: options.serviceOff ?? defaults.serviceOff,
      activeStates: options.activeStates ?? defaults.activeStates,
      translationKey: options.translationKey ?? defaults.translationKey,
      features: options.features ?? defaults.features,
    };

    // 1. Get entities for this scope
    const allEntities = this.getEntitiesForScope(config);

    if (!allEntities.length) {
      return;
    }

    // 2. Check for the area's group entity (only for area scope)
    const groupEntity = this.getGroupEntity(config);

    // 3. Configure chip appearance
    const aggregateSource = this.getAggregateSensorId(config);

    if (aggregateSource) {
      // Server-side aggregate: trivial single-entity template reads.
      // Dedicated group entities (light.py/switch.py/.../binary_sensor.py)
      // report the count via the active_entity_ids attribute (their own
      // state is on/off, not a number) — the generic hidden counting
      // sensor's own state IS the count. Same icon/color attribute either
      // way (both come from aggregate.py's compute_group_attributes /
      // compute_icon / compute_color).
      const { entityId: sensorId, isDedicatedGroup } = aggregateSource;
      (this.#defaultConfig as any).entity_id = [sensorId];
      this.#defaultConfig.icon = `{{ state_attr('${sensorId}', 'icon') }}`;
      this.#defaultConfig.icon_color = `{{ state_attr('${sensorId}', 'color') }}`;

      if (config.show_content) {
        const countExpr = isDedicatedGroup
          ? `state_attr('${sensorId}', 'active_entity_ids') | count`
          : `states('${sensorId}') | int(0)`;
        this.#defaultConfig.content = `{% set count = ${countExpr} %}{% if count > 0 %}{{ count }}{% endif %}`;
      }
    } else {
      // Fallback: inline template approach (area scope or sensor unavailable)
      (this.#defaultConfig as any).entity_id = allEntities;
      this.#defaultConfig.icon = Helper.getIcon(config.domain, config.device_class, allEntities);
      this.#defaultConfig.icon_color = Helper.getIconColor(config.domain, config.device_class, allEntities);

      if (config.show_content) {
        this.#defaultConfig.content = Helper.getContent(config.domain, config.device_class, allEntities);
      }
    }

    // 4. Configure tap/hold actions based on tapActionMode
    // Two modes:
    // - "popup" (default): tap=popup, hold=navigation
    // - "navigation" (HomeView): tap=navigation, hold=popup

    // Create popup action using PopupFactory
    const popupAction = PopupFactory.createPopup({
      domain: config.domain,
      scope: config.scope,
      scopeName: config.scopeName,
      floor_id: options.floor_id ?? undefined,
      area_slug: typeof options.area_slug === 'string' ? options.area_slug : undefined,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      groupEntity: groupEntity,
      dedicatedGroupEntity: aggregateSource?.isDedicatedGroup ? aggregateSource.entityId : null,
      features: config.features,
      device_class: config.device_class,
    });

    // Create navigation action
    const navigationPath = config.domain === 'sensor' || config.domain === "binary_sensor"
      ? config.device_class ?? config.domain
      : config.domain;
    const navigationAction = navigateTo(navigationPath);

    // Apply actions based on tapActionMode
    if (config.tapActionMode === "navigation") {
      // NAVIGATION MODE (for HomeView)
      // tap = navigate to domain view
      // hold = open popup
      this.#defaultConfig.tap_action = navigationAction;
      this.#defaultConfig.hold_action = popupAction;
    } else {
      // POPUP MODE (default for all other views)
      // tap = open popup
      // hold = navigate to domain view
      this.#defaultConfig.tap_action = popupAction;
      this.#defaultConfig.hold_action = navigationAction;
    }

    // 5. Apply configuration
    this.config = Object.assign(this.config, this.#defaultConfig, options);

  }

  /**
   * Get default configuration for a domain
   * 
   * @param domain - Domain name
   * @returns Default configuration
   * @private
   */
  private getDefaultsForDomain(domain: string): {
    serviceOn: string;
    serviceOff: string;
    activeStates: string[];
    translationKey: string;
    features: any[];
  } {
    const defaults: Record<string, any> = {
      light: {
        serviceOn: "turn_on",
        serviceOff: "turn_off",
        activeStates: ["on"],
        translationKey: "light",
        features: [
          { type: "light-brightness" }
        ],
      },
      climate: {
        serviceOn: "turn_on",
        serviceOff: "turn_off",
        activeStates: ["heat", "cool", "heat_cool", "auto", "dry", "fan_only"],
        translationKey: "climate",
        features: [{ type: "climate-hvac-modes" }],
      },
      cover: {
        serviceOn: "open_cover",
        serviceOff: "close_cover",
        activeStates: ["open", "opening"],
        translationKey: "cover",
        features: [],
      },
      fan: {
        serviceOn: "turn_on",
        serviceOff: "turn_off",
        activeStates: ["on"],
        translationKey: "fan",
        features: [{ type: "fan-speed" }],
      },
      switch: {
        serviceOn: "turn_on",
        serviceOff: "turn_off",
        activeStates: ["on"],
        translationKey: "switch",
        features: [],
      },
      media_player: {
        serviceOn: "media_play",
        serviceOff: "media_pause",
        activeStates: ["playing", "paused"],
        translationKey: "media_player",
        features: [],
      },
      binary_sensor: {
        serviceOn: "turn_on",
        serviceOff: "turn_off",
        activeStates: ["on"],
        translationKey: "binary_sensor",
        features: [],
      },
      sensor: {
        serviceOn: "turn_on",
        serviceOff: "turn_off",
        activeStates: ["on"],
        translationKey: "sensor",
        features: [],
      },
      siren: {
        serviceOn: "turn_on",
        serviceOff: "turn_off",
        activeStates: ["on"],
        translationKey: "siren",
        features: [],
      },
    };

    return defaults[domain] ?? {
      serviceOn: "turn_on",
      serviceOff: "turn_off",
      activeStates: ["on"],
      translationKey: domain,
      features: [],
    };
  }

  /**
   * Generate scope name from options
   * 
   * @param options - Chip options
   * @param scope - Detected scope
   * @returns Generated scope name
   * @private
   */
  private generateScopeName(options: AggregateChipOptions, scope: string): string {
    if (scope === "area" && options.area_slug && typeof options.area_slug === 'string') {
      const area = Helper.areas[options.area_slug];
      return area?.name ?? options.area_slug;
    }

    if (scope === "floor" && options.floor_id) {
      // Check if floor is excluded
      if (Helper.isFloorExcluded(options.floor_id)) {
        return ""; // Don't show chip for excluded floor
      }
      
      const floor = Helper.floors[options.floor_id];
      return floor?.name ?? options.floor_id;
    }

    // Global scope - use domain name
    const domainTitle = Helper.strategyOptions.domains[options.domain]?.title;
    if (domainTitle) return domainTitle;

    // Fallback: capitalize domain name
    return options.domain.charAt(0).toUpperCase() + options.domain.slice(1);
  }

  /**
   * Get entities for the specified scope
   *
   * @param options - Chip options
   * @returns Array of entity IDs
   * @private
   */
  private getEntitiesForScope(options: AggregateChipOptions): string[] {
    const getOptions: any = {
      domain: options.domain,
      device_class: options.device_class
    };

    switch (options.scope) {
      case "global":
        // All entities assigned to areas (excludes global/undisclosed)
        getOptions.area_slug = "global";
        break;

      case "floor":
        // Entities on this floor
        if (!options.floor_id) {
          if (Helper.debug) {
            console.warn("[AggregateChip] floor_id required for floor scope");
          }
          return [];
        }
        getOptions.floor_id = options.floor_id;
        break;

      case "area":
        // Entities in this area
        if (!options.area_slug) {
          if (Helper.debug) {
            console.warn("[AggregateChip] area_slug required for area scope");
          }
          return [];
        }
        getOptions.area_slug = options.area_slug;
        break;
    }

    return Helper.getEntityIds(getOptions);
  }

  /**
   * Get the area's group entity for this chip's domain, if one exists —
   * Linus Dashboard native, or Magic Areas as fallback where Dashboard has
   * no equivalent (climate). Passed to the popup so it can show a quick
   * group-control tile (see AggregatePopup.buildGroupControlSection).
   *
   * @param options - Chip options
   * @returns Entity ID or null
   * @private
   */
  private getGroupEntity(options: AggregateChipOptions): string | null {
    // Only relevant in area scope — floor/global already get their own
    // dedicated group entity as the chip's main entity_id (see
    // getAggregateSensorId), so there's no separate "quick control tile"
    // entity to resolve there.
    if (options.scope !== "area") {
      return null;
    }

    // Area slug must be a string (not array)
    if (Array.isArray(options.area_slug) || !options.area_slug) {
      return null;
    }

    const resolver = Helper.entityResolver;

    switch (options.domain) {
      case "light": {
        const lightResolution = resolver.resolveAllLights(options.area_slug);
        // Resolves to the Linus Dashboard-native light group by default
        return lightResolution.entity_id;
      }

      case "climate": {
        // Try Magic Areas climate_group entity — no Linus Dashboard-native
        // equivalent yet (deliberately deferred, see plan: climate/media_player
        // need real HVAC-mode/target-temp aggregation semantics, not just
        // on/off forwarding).
        const climateResolution = resolver.resolveClimateGroup(options.area_slug);
        return climateResolution.entity_id;
      }

      case "switch":
      case "fan":
      case "cover":
      case "siren": {
        const slug = AggregateChip.DEDICATED_GROUP_DOMAINS[options.domain];
        const resolution = resolver.resolveGroupEntity(options.domain, slug, options.area_slug);
        return resolution.entity_id;
      }

      case "media_player":
        // No Linus Dashboard-native or Magic Areas group entity for this domain.
        return null;

      default:
        return null;
    }
  }

  /**
   * Domains with their own dedicated group entity platform (light.py,
   * switch.py, fan.py, cover.py, siren.py) — value is the "all_X" slug each
   * platform uses in its unique_id (see e.g. light.py's
   * `unique_id_prefix=f"{DOMAIN}_all_lights"`). These are richer than the
   * generic hidden counting sensor (controllable, list members via
   * entity_id) and cover the same ground at floor/global scope, so they're
   * preferred over it. Only applies with no device_class filter — cover's
   * own device_class variants (if any) still fall through to the generic
   * sensor below, same as binary_sensor's presence-related device classes
   * (motion/presence/occupancy — folded into the presence composite
   * instead of their own device_class group, see binary_sensor.py's
   * PRESENCE_DEVICE_CLASSES).
   */
  private static readonly DEDICATED_GROUP_DOMAINS: Record<string, string> = {
    light: "all_lights",
    switch: "all_switches",
    fan: "all_fans",
    cover: "all_covers",
    siren: "all_sirens",
  };

  /**
   * Get the server-side aggregate entity for this chip's configuration —
   * preferring a dedicated group entity when one exists for this
   * domain/device_class, falling back to the generic hidden counting
   * sensor (sensor.py's LinusDashboardAggregateSensor) otherwise. That
   * generic sensor only still exists for climate/media_player (no
   * dedicated group — no simple on/off control semantics for either) and
   * for binary_sensor device_classes that don't get their own dedicated
   * group (the presence-related ones). It also has no area tier at all
   * (sensor.py only builds it at floor/global — AggregateChip never used
   * to query it at area scope), so at area scope this only ever tries the
   * dedicated group, never that fallback.
   *
   * Returns null (client-side rendering, same as always) if nothing
   * server-side exists for this scope/domain/device_class.
   */
  private getAggregateSensorId(
    config: AggregateChipOptions
  ): { entityId: string; isDedicatedGroup: boolean } | null {
    const hasDeviceClass = !!config.device_class && config.device_class !== "_";

    let scopeSuffix: string;
    if (config.scope === "area") {
      if (Array.isArray(config.area_slug) || !config.area_slug) return null;
      scopeSuffix = `_area_${config.area_slug}`;
    } else if (config.scope === "floor" && config.floor_id) {
      scopeSuffix = `_floor_${config.floor_id}`;
    } else {
      scopeSuffix = "_global";
    }

    const tryEntity = (entityId: string): boolean => {
      const state = Helper.getEntityState(entityId);
      return !!state && state.state !== "unavailable";
    };

    // 1. Dedicated single-domain group (light/switch/fan/cover/siren) —
    // exists at every scope, including area.
    const dedicatedSlug = AggregateChip.DEDICATED_GROUP_DOMAINS[config.domain];
    if (dedicatedSlug && !hasDeviceClass) {
      const entityId = `${config.domain}.linus_dashboard_${dedicatedSlug}${scopeSuffix}`;
      if (tryEntity(entityId)) {
        return { entityId, isDedicatedGroup: true };
      }
    }

    // 2. Dedicated binary_sensor-by-device_class group — also exists at
    // every scope, including area.
    if (config.domain === "binary_sensor" && hasDeviceClass) {
      const entityId = `binary_sensor.linus_dashboard_${config.device_class}${scopeSuffix}`;
      if (tryEntity(entityId)) {
        return { entityId, isDedicatedGroup: true };
      }
    }

    if (config.scope === "area") {
      // No area tier for the generic hidden sensor — see docstring.
      return null;
    }

    // 3. Fallback: generic hidden counting sensor (floor/global only)
    const parts = ["linus_dashboard", config.domain];
    if (hasDeviceClass) {
      parts.push(config.device_class as string);
    }
    if (config.scope === "floor" && config.floor_id) {
      parts.push(config.floor_id);
    }
    parts.push("active");

    const sensorId = `sensor.${parts.join("_")}`;
    if (tryEntity(sensorId)) {
      return { entityId: sensorId, isDedicatedGroup: false };
    }

    return null;
  }
}

export { AggregateChip };
