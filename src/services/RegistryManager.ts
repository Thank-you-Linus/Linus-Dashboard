/**
 * Registry Manager Service
 *
 * Manages Home Assistant registries (entities, areas, floors, devices).
 * Extracted from Helper.ts to follow Single Responsibility Principle.
 */

import { HassEntities } from "home-assistant-js-websocket";

import type { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import type { DeviceRegistryEntry } from "../types/homeassistant/data/device_registry";
import type { AreaRegistryEntry } from "../types/homeassistant/data/area_registry";
import type { FloorRegistryEntry } from "../types/homeassistant/data/floor_registry";
import { generic } from "../types/strategy/generic";
import { LinusDashboardConfig } from "../types/homeassistant/data/linus_dashboard";
import { getMagicAreaSlug, groupEntitiesByDomain, slugify } from "../utils";
import { UNDISCLOSED, MAGIC_AREAS_NAME } from "../variables";

import StrategyEntity = generic.StrategyEntity;
import StrategyArea = generic.StrategyArea;
import StrategyFloor = generic.StrategyFloor;
import StrategyDevice = generic.StrategyDevice;
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;

/**
 * Extended DashBoardInfo with loaded registries
 */
export interface RegistryInitInfo {
  hass: {
    states: HassEntities;
    entities: Record<string, EntityRegistryEntry>;
    devices: Record<string, DeviceRegistryEntry>;
    areas: Record<string, AreaRegistryEntry>;
    floors: Record<string, FloorRegistryEntry>;
    [key: string]: any; // For HomeAssistant object methods
  };
  config: generic.StrategyConfig;
  linus_dashboard_config: LinusDashboardConfig;
}

/**
 * Registry Manager Class
 *
 * Centralized management of Home Assistant registries.
 */
export class RegistryManager {
  private static entities: Record<string, StrategyEntity>;
  private static domains: Record<string, StrategyEntity[]> = {};
  private static devices: Record<string, StrategyDevice>;
  private static areas: Record<string, StrategyArea> = {};
  private static floors: Record<string, StrategyFloor> = {};
  private static hassStates: HassEntities;
  private static magicAreasDevices: Record<string, MagicAreaRegistryEntry> = {};
  private static linusDashboardConfig: LinusDashboardConfig;
  private static strategyOptions: generic.StrategyConfig;
  private static entityResolver: any;
  private static initialized = false;

  /**
   * Initialize the registry manager with Home Assistant data
   *
   * @param info - Dashboard information from Home Assistant with loaded registries
   */
  static async initialize(info: RegistryInitInfo): Promise<void> {
    this.hassStates = info.hass.states;
    this.strategyOptions = info.config;
    this.linusDashboardConfig = info.linus_dashboard_config;

    // Initialize registries
    await this.#initializeEntities(info);
    await this.#initializeDevices(info);
    await this.#initializeAreas(info);
    await this.#initializeFloors(info);

    // Initialize EntityResolver (for Linus Brain / Magic Areas hybrid support)
    const { EntityResolver } = await import("../utils/entityResolver");
    this.entityResolver = new EntityResolver(info.hass as any);

    this.initialized = true;
  }

  /**
   * Initialize entities registry
   * @private
   */
  static async #initializeEntities(info: RegistryInitInfo): Promise<void> {
    const entities = info.hass.entities || {};
    this.entities = Object.fromEntries(
      Object.entries(entities).map(([entity_id, entity]) => [
        entity_id,
        { ...entity, entity_id, floor_id: null } as StrategyEntity
      ])
    );
    this.domains = groupEntitiesByDomain(this.entities);
  }

  /**
   * Initialize devices registry
   * @private
   */
  static async #initializeDevices(info: RegistryInitInfo): Promise<void> {
    const devices = info.hass.devices || {};
    this.devices = Object.fromEntries(
      Object.entries(devices).map(([device_id, device]) => [
        device_id,
        { ...device, floor_id: null, entities: [] } as StrategyDevice
      ])
    );

    // Initialize Magic Areas devices
    this.magicAreasDevices = {};
    for (const [device_id, device] of Object.entries(this.devices)) {
      if (device.manufacturer === MAGIC_AREAS_NAME) {
        const area_slug = getMagicAreaSlug(device as any);
        if (area_slug) {
          // Get all entities for this device
          const deviceEntities = Object.values(this.entities).filter(
            entity => entity.device_id === device_id
          );

          // Create entities map by translation_key
          const entitiesMap = deviceEntities.reduce((acc, entity) => {
            if (entity.translation_key) {
              acc[entity.translation_key] = entity;
            }
            return acc;
          }, {} as Record<string, EntityRegistryEntry>);

          this.magicAreasDevices[area_slug] = {
            ...device,
            area_name: device.name || area_slug,
            slug: area_slug,
            entities: entitiesMap,
          };
        }
      }
    }
  }

  /**
   * Initialize areas registry
   * @private
   */
  static async #initializeAreas(info: RegistryInitInfo): Promise<void> {
    const areas = info.hass.areas || {};

    this.areas = Object.fromEntries(
      Object.entries(areas).map(([area_id, area]) => {
        const slug = slugify(area_id);
        const areaEntities = Object.values(this.entities).filter(entity => entity.area_id === area_id);
        const areaDevices = Object.values(this.devices).filter(device => device.area_id === area_id);
        const domainGroups = groupEntitiesByDomain(Object.fromEntries(areaEntities.map(e => [e.entity_id, e])));

        return [
          slug,
          {
            ...area,
            slug,
            area_id,
            domains: domainGroups,
            entities: areaEntities.map(e => e.entity_id),
            devices: areaDevices.map(d => d.id),
          } as StrategyArea,
        ];
      })
    );

    // Add UNDISCLOSED area for entities without area
    const undisclosedEntities = Object.values(this.entities).filter(entity => !entity.area_id);
    const undisclosedDomains = groupEntitiesByDomain(Object.fromEntries(undisclosedEntities.map(e => [e.entity_id, e])));
    this.areas[UNDISCLOSED] = {
      area_id: UNDISCLOSED,
      floor_id: UNDISCLOSED,
      name: "Undisclosed",
      picture: null,
      slug: UNDISCLOSED,
      domains: undisclosedDomains,
      entities: undisclosedEntities.map(e => e.entity_id),
      devices: [],
      aliases: [],
    };
  }

  /**
   * Initialize floors registry
   * @private
   */
  static async #initializeFloors(info: RegistryInitInfo): Promise<void> {
    const floors = info.hass.floors || {};

    this.floors = Object.fromEntries(
      Object.entries(floors).map(([floor_id, floor]) => {
        const areas_slug = Object.values(this.areas)
          .filter(area => area.floor_id === floor_id)
          .map(area => area.slug);

        return [floor_id, { ...floor, floor_id, areas_slug } as StrategyFloor];
      })
    );

    // Add UNDISCLOSED floor
    this.floors[UNDISCLOSED] = {
      floor_id: UNDISCLOSED,
      name: "Undisclosed",
      level: 99,
      icon: "mdi:help-circle",
      areas_slug: [UNDISCLOSED],
      aliases: [],
    };
  }

  /**
   * Check if initialized
   */
  static isInitialized(): boolean {
    return this.initialized;
  }

  /**
   * Get entities
   */
  static getEntities(): Record<string, StrategyEntity> {
    return this.entities;
  }

  /**
   * Get domains
   */
  static getDomains(): Record<string, StrategyEntity[]> {
    return this.domains;
  }

  /**
   * Get devices
   */
  static getDevices(): Record<string, StrategyDevice> {
    return this.devices;
  }

  /**
   * Get areas
   */
  static getAreas(): Record<string, StrategyArea> {
    return this.areas;
  }

  /**
   * Get ordered areas (sorted by order property or name)
   */
  static getOrderedAreas(): StrategyArea[] {
    return Object.values(this.areas).sort((a, b) => {
      // Both have order - use it
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      // Only a has order - it comes first
      if (a.order !== undefined) return -1;
      // Only b has order - it comes first
      if (b.order !== undefined) return 1;
      // Neither has order - alphabetical by name
      return (a.name || "").localeCompare(b.name || "");
    });
  }

  /**
   * Get floors
   */
  static getFloors(): Record<string, StrategyFloor> {
    return this.floors;
  }

  /**
   * Get ordered floors (sorted by level)
   */
  static getOrderedFloors(): StrategyFloor[] {
    return Object.values(this.floors)
      .filter(floor => floor.areas_slug.length > 0)
      .sort((a, b) => (a.level ?? 0) - (b.level ?? 0));
  }

  /**
   * Get Hass states
   */
  static getHassStates(): HassEntities {
    return this.hassStates;
  }

  /**
   * Get Magic Areas devices
   */
  static getMagicAreasDevices(): Record<string, MagicAreaRegistryEntry> {
    return this.magicAreasDevices;
  }

  /**
   * Get Linus Dashboard config
   */
  static getLinusDashboardConfig(): LinusDashboardConfig {
    return this.linusDashboardConfig;
  }

  /**
   * Get strategy options
   */
  static getStrategyOptions(): generic.StrategyConfig {
    return this.strategyOptions;
  }

  /**
   * Get entity resolver
   */
  static getEntityResolver(): any {
    return this.entityResolver;
  }

  /**
   * Refresh registries (re-fetch from Home Assistant)
   */
  static async refresh(): Promise<void> {
    // This would require DashBoardInfo to be re-fetched
    // For now, mark as uninitialized to force re-init
    this.initialized = false;
  }
}
