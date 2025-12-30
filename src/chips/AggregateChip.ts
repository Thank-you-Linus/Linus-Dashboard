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
  /** Optional device class (for covers, sensors, binary_sensors) */
  device_class?: string;
  /** Optional floor ID for floor scope */
  floor_id?: string | null;
  /** DEPRECATED: Use area_slug from ChipOptions base */
  magic_device_id?: string;
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
 * - Automatic Linus Brain detection (uses more-info when LB group available)
 * - Scope-aware (adapts behavior for global/floor/area)
 * - EntityResolver integration (consistent entity resolution)
 * - Centralized color management (uses colorMapping from variables.ts)
 * - Home Assistant translations (reuses HA's native translations)
 * - Device class support (for binary_sensor, sensor, cover)
 * 
 * **Behavior**:
 * - tap_action: Opens AggregatePopup (or more-info if Linus Brain group exists)
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

    // BACKWARD COMPATIBILITY: Support old magic_device_id parameter
    if (options.magic_device_id && !options.area_slug) {
      options.area_slug = options.magic_device_id;
    }

    // AUTO-DETECT DEFAULTS based on domain
    const defaults = this.getDefaultsForDomain(options.domain);

    // Auto-detect scope if not provided
    const scope = options.scope ?? (options.area_slug ? "area" : "global");

    // Auto-detect tapActionMode if not provided (default: "popup")
    const tapActionMode = options.tapActionMode ?? "popup";

    // Apply defaults for missing parameters
    const config: Required<Omit<AggregateChipOptions, 'features' | 'device_class' | 'floor_id' | 'magic_device_id' | 'tapActionMode' | keyof chips.ChipOptions>> & AggregateChipOptions = {
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

    // 2. Check for Linus Brain group entity (only for area scope)
    const linusBrainEntity = this.getLinusBrainEntity(config);

    // 3. Configure chip appearance
    this.#defaultConfig.icon = Helper.getIcon(config.domain, config.device_class, allEntities);
    this.#defaultConfig.icon_color = Helper.getIconColor(config.domain, config.device_class, allEntities);


    if (config.show_content) {
      this.#defaultConfig.content = Helper.getContent(config.domain, config.device_class, allEntities);
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
      entity_ids: allEntities,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      linusBrainEntity: linusBrainEntity,
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
        features: [{ type: "light-brightness" }],
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
   * Get Linus Brain group entity if available (only for area scope)
   * 
   * @param options - Chip options
   * @returns Entity ID or null
   * @private
   */
  private getLinusBrainEntity(options: AggregateChipOptions): string | null {
    // Only check for Linus Brain in area scope
    if (options.scope !== "area") {
      return null;
    }

    // Area slug must be a string (not array)
    if (Array.isArray(options.area_slug) || !options.area_slug) {
      return null;
    }

    const resolver = Helper.entityResolver;

    // Check by domain
    switch (options.domain) {
      case "light": {
        const lightResolution = resolver.resolveAllLights(options.area_slug);
        return lightResolution.source === "linus_brain" ? lightResolution.entity_id : null;
      }

      case "climate":
        // Linus Brain doesn't provide climate groups yet
        return null;

      case "cover":
      case "fan":
      case "media_player":
      case "switch":
        // Linus Brain doesn't have these domain groups yet
        return null;

      default:
        return null;
    }
  }
}

export { AggregateChip };
