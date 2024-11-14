import { configurationDefaults } from "./configurationDefaults";
import { HassEntities, HassEntity } from "home-assistant-js-websocket";
import deepmerge from "deepmerge";
import { DeviceRegistryEntry } from "./types/homeassistant/data/device_registry";
import { AreaRegistryEntry } from "./types/homeassistant/data/area_registry";
import { generic } from "./types/strategy/generic";
import StrategyArea = generic.StrategyArea;
import StrategyFloor = generic.StrategyFloor;
import StrategyEntity = generic.StrategyEntity;
import StrategyDevice = generic.StrategyDevice;
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { FloorRegistryEntry } from "./types/homeassistant/data/floor_registry";
import { DEVICE_CLASSES, DOMAIN } from "./variables";
import { groupEntitiesByDomain, slugify } from "./utils";
import { EntityRegistryEntry } from "./types/homeassistant/data/entity_registry";

/**
 * Helper Class
 *
 * Contains the objects of Home Assistant's registries and helper methods.
 */
class Helper {
  /**
   * An array of entities from Home Assistant's entity registry.
   *
   * @type {Record<string, StrategyEntity>}
   * @private
   */
  static #entities: Record<string, StrategyEntity>;

  /**
   * An array of entities from Home Assistant's entity registry.
   *
   * @type {Record<string, StrategyEntity[]}
   * @private
   */
  static #domains: Record<string, StrategyEntity[]> = {};

  /**
   * An array of entities from Home Assistant's device registry.
   *
   * @type {Record<string, StrategyDevice>}
   * @private
   */
  static #devices: Record<string, StrategyDevice>;

  /**
   * An array of entities from Home Assistant's area registry.
   *
   * @type {Record<string, StrategyArea>}
   * @private
   */
  static #areas: Record<string, StrategyArea> = {};

  /**
   * An array of entities from Home Assistant's area registry.
   *
   * @type {Record<string, StrategyFloor>}
   * @private
   */
  static #floors: Record<string, StrategyFloor> = {};

  /**
   * An array of state entities from Home Assistant's Hass object.
   *
   * @type {HassEntities}
   * @private
   */
  static #hassStates: HassEntities;

  /**
   * Translation method.
   *
   * @type {any}
   * @private
   */
  static #hassLocalize: any;

  /**
   * Indicates whether this module is initialized.
   *
   * @type {boolean} True if initialized.
   * @private
   */
  static #initialized: boolean = false;

  /**
   * The Custom strategy configuration.
   *
   * @type {generic.StrategyConfig}
   * @private
   */
  static #strategyOptions: generic.StrategyConfig;

  /**
   * The magic areas devices.
   *
   * @type {Record<string, MagicAreaRegistryEntry>}
   * @private
   */
  static #magicAreasDevices: Record<string, MagicAreaRegistryEntry> = {};

  /**
   * Set to true for more verbose information in the console.
   *
   * @type {boolean}
   * @private
   */
  static #debug: boolean;

  /**
   * Class constructor.
   *
   * This class shouldn't be instantiated directly.
   * Instead, it should be initialized with method initialize().
   *
   * @throws {Error} If trying to instantiate this class.
   */
  constructor() {
    throw new Error("This class should be invoked with method initialize() instead of using the keyword new!");
  }

  /**
   * Custom strategy configuration.
   *
   * @returns {generic.StrategyConfig}
   * @static
   */
  static get strategyOptions(): generic.StrategyConfig {
    return this.#strategyOptions;
  }

  /**
   * Custom strategy configuration.
   *
   * @returns {Record<string, MagicAreaRegistryEntry>}
   * @static
   */
  static get magicAreasDevices(): Record<string, MagicAreaRegistryEntry> {
    return this.#magicAreasDevices;
  }

  /**
   * Get the entities from Home Assistant's area registry.
   *
   * @returns {Record<string, StrategyArea>}
   * @static
   */
  static get areas(): Record<string, StrategyArea> {
    return this.#areas;
  }

  /**
   * Get the entities from Home Assistant's floor registry.
   *
   * @returns {StrategyArea[]}
   * @static
   */
  static get orderedAreas(): StrategyArea[] {
    return Object.values(this.#areas).sort((a, b) => {
      // Check if 'level' is undefined in either object
      if (a.order === undefined) return 1; // a should come after b
      if (b.order === undefined) return -1; // b should come after a

      // Both 'order' values are defined, compare them
      return a.order - b.order;
    });
  }

  /**
   * Get the entities from Home Assistant's floor registry.
   *
   * @returns {Record<string, StrategyFloor>}
   * @static
   */
  static get floors(): Record<string, StrategyFloor> {
    return this.#floors
  }

  /**
   * Get the entities from Home Assistant's floor registry.
   *
   * @returns {StrategyFloor[]}
   * @static
   */
  static get orderedFloors(): StrategyFloor[] {
    return Object.values(this.#floors).sort((a, b) => {
      // Check if 'level' is undefined in either object
      if (a.level === undefined) return 1; // a should come after b
      if (b.level === undefined) return -1; // b should come after a

      // Both 'level' values are defined, compare them
      return a.level - b.level;
    });
  }

  /**
   * Get the devices from Home Assistant's device registry.
   *
   * @returns {Record<string, StrategyDevice>}
   * @static
   */
  static get devices(): Record<string, StrategyDevice> {
    return this.#devices;
  }

  /**
   * Get the entities from Home Assistant's entity registry.
   *
   * @returns {Record<string, StrategyEntity>}
   * @static
   */
  static get entities(): Record<string, StrategyEntity> {
    return this.#entities;
  }

  /**
   * Get the domains from Home Assistant's entity registry.
   *
   * @returns {Record<string, StrategyEntity[]>}
   * @static
   */
  static get domains(): Record<string, StrategyEntity[]> {
    return this.#domains;
  }

  /**
   * Get the current debug mode of the mushroom strategy.
   *
   * @returns {boolean}
   * @static
   */
  static get debug(): boolean {
    return this.#debug;
  }

  /**
   * Initialize this module.
   *
   * @param {generic.DashBoardInfo} info Strategy information object.
   * @returns {Promise<void>}
   * @static
   */
  static async initialize(info: generic.DashBoardInfo): Promise<void> {
    // Initialize properties.
    this.#hassStates = info.hass.states;
    this.#hassLocalize = info.hass.localize;
    console.log('info.hass.resources.fr', info.hass.resources.fr)
    this.#strategyOptions = deepmerge(configurationDefaults, info.config?.strategy?.options ?? {});
    this.#debug = this.#strategyOptions.debug;

    let homeAssistantRegistries = []

    try {
      // Query the registries of Home Assistant.

      homeAssistantRegistries = await Promise.all([
        info.hass.callWS({ type: "config/entity_registry/list" }) as Promise<EntityRegistryEntry[]>,
        info.hass.callWS({ type: "config/device_registry/list" }) as Promise<DeviceRegistryEntry[]>,
        info.hass.callWS({ type: "config/area_registry/list" }) as Promise<AreaRegistryEntry[]>,
        info.hass.callWS({ type: "config/floor_registry/list" }) as Promise<FloorRegistryEntry[]>,
      ]);

    } catch (e) {
      Helper.logError("An error occurred while querying Home assistant's registries!", e);
      throw 'Check the console for details';
    }

    const [entities, devices, areas, floors] = homeAssistantRegistries;

    // Dictionnaires pour un accès rapide
    const areasById = Object.fromEntries(areas.map(a => [a.area_id, a]));
    const floorsById = Object.fromEntries(floors.map(f => [f.floor_id, f]));
    const entitiesByDeviceId: Record<string, StrategyEntity[]> = {};
    const entitiesByAreaId: Record<string, StrategyEntity[]> = {};
    const devicesByAreaId: Record<string, StrategyDevice[]> = {};

    this.#entities = entities.reduce((acc, entity) => {

      const area = entity.area_id ? areasById[entity.area_id] : {} as StrategyArea;
      const floor = area.floor_id ? floorsById[area.floor_id] : {} as StrategyFloor;
      const enrichedEntity = {
        ...entity,
        floor_id: floor.floor_id || null,
      };

      acc[entity.entity_id] = enrichedEntity;

      const areaId = entity.area_id ?? "undisclosed";
      if (!entitiesByAreaId[areaId]) entitiesByAreaId[areaId] = [];
      entitiesByAreaId[areaId].push(enrichedEntity);

      if (entity.device_id) {
        if (!entitiesByDeviceId[entity.device_id]) entitiesByDeviceId[entity.device_id] = [];
        entitiesByDeviceId[entity.device_id].push(enrichedEntity);
      }


      let domain = entity.entity_id.split(".")[0];
      if (Object.keys(DEVICE_CLASSES).includes(domain)) {
        const entityState = Helper.getEntityState(entity.entity_id);
        if (entityState?.attributes?.device_class) domain = entityState.attributes.device_class
      }
      if (!this.#domains[domain]) this.#domains[domain] = [];
      this.#domains[domain].push(enrichedEntity);

      return acc;
    }, {} as Record<string, StrategyEntity>);

    // Enrichir les appareils
    this.#devices = devices.reduce((acc, device) => {
      const entitiesInDevice = entitiesByDeviceId[device.id] || [];
      const area = device.area_id ? areasById[device.area_id] : {} as StrategyArea;
      const floor = area.floor_id ? floorsById[area.floor_id] : {} as StrategyFloor;

      const enrichedDevice = {
        ...device,
        floor_id: floor.floor_id || null,
        entities: entitiesInDevice.map(entity => entity.entity_id),
      };

      acc[device.id] = enrichedDevice;


      const areaId = device.area_id ?? "undisclosed";
      if (!devicesByAreaId[areaId]) devicesByAreaId[areaId] = [];
      devicesByAreaId[areaId].push(enrichedDevice);

      if (device.manufacturer === 'Magic Areas') {
        this.#magicAreasDevices[slugify(device.name)] = {
          ...device,
          area_name: device.name!,
          entities: entitiesInDevice
            .reduce((entities: Record<string, StrategyEntity>, entity) => {
              entities[entity.translation_key!] = entity;
              return entities;
            }, {})
        }
      }

      return acc;
    }, {} as Record<string, StrategyDevice>);


    // Create and add the undisclosed area if not hidden in the strategy options.
    if (!this.#strategyOptions.areas.undisclosed?.hidden) {

      this.#strategyOptions.areas.undisclosed = {
        ...configurationDefaults.areas.undisclosed,
        ...this.#strategyOptions.areas.undisclosed,
      };

      areas.push(this.#strategyOptions.areas.undisclosed);
    }

    // Enrichir les zones
    this.#areas = areas.reduce((acc, area) => {

      const areaEntities = entitiesByAreaId[area.area_id]?.map(entity => entity.entity_id) || [];
      devicesByAreaId[area.area_id]?.forEach(device => areaEntities.push(...device.entities));

      const enrichedArea = {
        ...area,
        slug: slugify(area.name),
        domains: groupEntitiesByDomain(areaEntities) ?? {},
        devices: devicesByAreaId[area.area_id]?.map(device => device.id) || [],
        magicAreaDevice: Object.values(this.#devices).find(device => device.manufacturer === "Magic Areas" && device.name === area.name),
        entities: areaEntities,
      };

      acc[area.area_id] = enrichedArea;
      return acc;
    }, {} as Record<string, StrategyArea>);

    // Enrichir les étages
    this.#floors = floors.reduce((acc, floor) => {
      const areasInFloor = areas.filter(area => area.floor_id === floor.floor_id);

      acc[floor.floor_id] = {
        ...floor,
        areas: areasInFloor.map(area => area.area_id),
      };

      return acc;
    }, {} as Record<string, StrategyFloor>);


    // Sort custom and default views of the strategy options by order first and then by title.
    this.#strategyOptions.views = Object.fromEntries(
      Object.entries(this.#strategyOptions.views).sort(([, a], [, b]) => {
        return (a.order ?? Infinity) - (b.order ?? Infinity) || (a.title ?? "undefined").localeCompare(b.title ?? "undefined");
      }),
    );

    // Sort custom and default domains of the strategy options by order first and then by title.
    this.#strategyOptions.domains = Object.fromEntries(
      Object.entries(this.#strategyOptions.domains).sort(([, a], [, b]) => {
        return (a.order ?? Infinity) - (b.order ?? Infinity) || (a.title ?? "undefined").localeCompare(b.title ?? "undefined");
      }),
    );

    console.log('this.#areas', this.#areas)

    this.#initialized = true;
  }

  /**
   * Get the initialization status of the Helper class.
   *
   * @returns {boolean} True if this module is initialized.
   * @static
   */
  static isInitialized(): boolean {
    return this.#initialized;
  }

  /**
   * Get a template string to define the number of a given domain's entities with a certain state.
   *
   * States are compared against a given value by a given operator.
   *
   * @param {string} domain The domain of the entities.
   * @param {string} operator The Comparison operator between state and value.
   * @param {string} value The value to which the state is compared against.
   * @param {string} area_id
   *
   * @return {string} The template string.
   * @static
   */
  static getCountTemplate(domain: string, operator: string, value: string, area_id?: string): string {
    // noinspection JSMismatchedCollectionQueryUpdate (False positive per 17-04-2023)
    /**
     * Array of entity state-entries, filtered by domain.
     *
     * Each element contains a template-string which is used to access home assistant's state machine (state object) in
     * a template.
     * E.g. "states['light.kitchen']"
     *
     * The array excludes hidden and disabled entities.
     *
     * @type {string[]}
     */
    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    // Get the ID of the devices which are linked to the given area.
    for (const area of Object.values(this.#areas)) {
      if (area_id && area.area_id !== area_id) continue

      // const areaDeviceIds = this.#devices.filter((device) => {
      //   return device.area_id === area.area_id;
      // }).map((device) => {
      //   return device.id;
      // });

      // // Get the entities of which all conditions of the callback function are met. @see areaFilterCallback.
      // const newStates = this.#areas[area.area_id].domains[domain].filter(
      //   this.#areaFilterCallback, {
      //   area: area,
      //   domain: domain,
      //   areaDeviceIds: areaDeviceIds,
      // })
      //   .map((entity) => `states['${entity.entity_id}']`);

      const newStates = this.#areas[area.area_id].domains[domain]?.map((entity_id) => `states['${entity_id}']`);
      if (newStates)
        states.push(...newStates);
    }

    return `{% set entities = [${states}] %} {{ entities | selectattr('state','${operator}','${value}') | list | count }}`;
  }

  /**
   * Get a template string to define the number of a given device_class's entities with a certain state.
   *
   * States are compared against a given value by a given operator.
   *
   * @param {string} domain The domain of the entities.
   * @param {string} device_class The device class of the entities.
   * @param {string} operator The Comparison operator between state and value.
   * @param {string} value The value to which the state is compared against.
   * @param {string} area_id
   *
   * @return {string} The template string.
   * @static
   */
  static getDeviceClassCountTemplate(domain: string, device_class: string, operator: string, value: string, area_id?: string): string {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }
    // const states: string[] = this.#areas
    //   .filter(area => !area_id || area.area_id === area_id)
    //   .flatMap(area => {
    //     const areaDeviceIds = this.#devices
    //       .filter(device => device.area_id === area.area_id)
    //       .map(device => device.id);

    //     return this.#entities
    //       .filter(entity =>
    //         entity.entity_id.startsWith(`${domain}.`) &&
    //         entity.hidden_by === null &&
    //         entity.disabled_by === null &&
    //         (area.area_id === "undisclosed"
    //           ? !entity.area_id && (areaDeviceIds.includes(entity.device_id ?? "") || !entity.device_id)
    //           : areaDeviceIds.includes(entity.device_id ?? "") || entity.area_id === area.area_id)
    //       )
    //       .map(entity => `states['${entity.entity_id}']`);
    //   });

    const states = area_id ? this.#areas[area_id].domains[domain] : this.#domains[domain]?.map(entity => entity.entity_id);

    return `{% set entities = [${states}] %} {{ entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | selectattr('state','${operator}','${value}') | list | count }}`;
  }

  /**
   * Get a template string to define the average state of sensor entities with a given device class.
   *
   * States are compared against a given value by a given operator.
   *
   * @param {string} device_class The device class of the entities.
   * @param {string} area_id
   *
   * @return {string} The template string.
   * @static
   */
  static getAverageStateTemplate(device_class: string, area_id?: string): string {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    // const states: string[] = this.#areas
    //   .filter(area => !area_id || area.area_id === area_id)
    //   .flatMap(area => {
    //     const areaDeviceIds = this.#devices
    //       .filter(device => device.area_id === area.area_id)
    //       .map(device => device.id);

    //     return this.#entities
    //       .filter(entity =>
    //         entity.entity_id.startsWith("sensor.") &&
    //         entity.hidden_by === null &&
    //         entity.disabled_by === null &&
    //         (area.area_id === "undisclosed"
    //           ? !entity.area_id && (areaDeviceIds.includes(entity.device_id ?? "") || !entity.device_id)
    //           : areaDeviceIds.includes(entity.device_id ?? "") || entity.area_id === area.area_id)
    //       )
    //       .map(entity => `states['${entity.entity_id}']`);
    //   });

    const states = area_id ? this.#areas[area_id].domains["sensor"] : this.#domains["sensor"].map(entity => entity.entity_id);


    // Todo: fix that because the temperature not working
    return `{% set entities = [${states}] %} {{ entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute='state') | map('float') | sum / entities | length }} {{ state_attr('sensor.outside_temperature', 'unit_of_measurement')}}`;
  }

  /**
   * Get device entities from the entity registry, filtered by area and domain.
   *
   * The entity registry is a registry where Home-Assistant keeps track of all entities.
   * A device is represented in Home Assistant via one or more entities.
   *
   * The result excludes hidden and disabled entities.
   *
   * @param {AreaRegistryEntry} area Area entity.
   * @param {string} domain The domain of the entity-id.
   *
   * @return {StrategyEntity[]} Array of device entities.
   * @static
   */
  static getDeviceEntities(area: AreaRegistryEntry, domain: string): StrategyEntity[] {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    // // Get the ID of the devices which are linked to the given area.
    // const areaDeviceIds = this.#devices.filter((device) => {
    //   return (device.area_id ?? "undisclosed") === area.area_id;
    // }).map((device: DeviceRegistryEntry) => device.id);

    // // Return the entities of which all conditions of the callback function are met. @see areaFilterCallback.
    // let device_entities = this.#entities.filter(
    //   this.#areaFilterCallback, {
    //   area: area,
    //   domain: domain,
    //   areaDeviceIds: areaDeviceIds,
    // })
    //   .sort((a, b) => {
    //     return (a.original_name ?? "undefined").localeCompare(b.original_name ?? "undefined");
    //   });

    // if (domain === "light") {
    //   const deviceLights = Object.values(this.#magicAreasDevices[area.name]?.entities ?? [])
    //     .filter(e => e.translation_key !== 'all_lights' && e.entity_id.endsWith('_lights'));

    //   deviceLights.forEach(light => {
    //     const childLights = Helper.#hassStates[light.entity_id]?.attributes?.entity_id ?? [];
    //     device_entities = device_entities.filter(entity => !childLights.includes(entity.entity_id));
    //     device_entities.unshift(light);
    //   });
    // }

    // const device_entities = getMAEntity(this.#areas[area.area_id].magicAreaDevice, domain) ?? [];
    const device_entities = this.#areas[area.area_id].domains[domain]?.map(entity_id => this.#entities[entity_id]) ?? [];

    return device_entities;
  }

  /**
   * Get state entities, filtered by area and domain.
   *
   * The result excludes hidden and disabled entities.
   *
   * @param {AreaRegistryEntry} area Area entity.
   * @param {string} domain Domain of the entity-id.
   *
   * @return {HassEntity[]} Array of state entities.
   */
  static getStateEntities(area: AreaRegistryEntry, domain: string): HassEntity[] {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const states: HassEntity[] = [];

    // Get states whose entity-id starts with the given string.
    const stateEntities = this.#areas[area.area_id].domains[domain]?.map(entity_id => this.#hassStates[entity_id]);

    // for (const state of stateEntities) {
    //   const hassEntity = this.#entities[state.entity_id];
    //   const device = this.#devices[hassEntity?.device_id ?? ""];

    //   // Collect states of which any (whichever comes first) of the conditions below are met:
    //   // 1. The linked entity is linked to the given area.
    //   // 2. The entity is linked to a device, and the linked device is linked to the given area.
    //   if (
    //     (hassEntity?.area_id === area.area_id)
    //     || (device && device.area_id === area.area_id)
    //   ) {
    //     states.push(state);
    //   }
    // }

    return stateEntities;
  }

  /**
   * Sanitize a classname.
   *
   * The name is sanitized by capitalizing the first character of the name or after an underscore.
   * Underscores are removed.
   *
   * @param {string} className Name of the class to sanitize.
   * @returns {string} The sanitized classname.
   */
  static sanitizeClassName(className: string): string {
    className = className.charAt(0).toUpperCase() + className.slice(1);

    return className.replace(/([-_][a-z])/g, (group) => group
      .toUpperCase()
      .replace("-", "")
      .replace("_", ""),
    );
  }

  /**
   * Get the ids of the views which aren't set to hidden in the strategy options.
   *
   * @return {string[]} An array of view ids.
   */
  static getExposedViewIds(): string[] {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    return this.#getObjectKeysByPropertyValue(this.#strategyOptions.views, "hidden", false);
  }

  /**
   * Get the ids of the domain ids which aren't set to hidden in the strategy options.
   *
   * @return {string[]} An array of domain ids.
   */
  static getExposedDomainIds(): string[] {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    return this.#getObjectKeysByPropertyValue(this.#strategyOptions.domains, "hidden", false);
  }

  /**
   * Callback function for filtering entities.
   *
   * Entities of which all the conditions below are met are kept:
   * 1. The entity is not hidden and is not disabled.
   * 2. The entity's domain matches the given domain.
   * 3. Or/Neither the entity's linked device (if any) or/nor the entity itself is linked to the given area.
   *    (See variable areaMatch)
   *
   * @param {StrategyEntity} entity The current hass entity to evaluate.
   * @this {AreaFilterContext}
   *
   * @return {boolean} True to keep the entity.
   * @static
   */
  static #areaFilterCallback(
    this: {
      area: StrategyArea,
      areaDeviceIds: string[],
      domain: string,
    },
    entity: StrategyEntity): boolean {
    const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
    const domainMatches = entity.entity_id.startsWith(`${this.domain}.`);
    // const linusDeviceIds = Helper.#devices.filter(d => [DOMAIN, "adaptive_lighting"].includes(d.identifiers[0]?.[0])).map(e => e.id)
    const linusDeviceIds = ["linus", "linus2"]
    const isLinusEntity = linusDeviceIds.includes(entity.device_id ?? "") || entity.platform === DOMAIN
    const entityLinked = this.area.area_id === "undisclosed"
      // Undisclosed area;
      // nor the entity itself, neither the entity's linked device (if any) is linked to any area.
      ? !entity.area_id && (this.areaDeviceIds.includes(entity.device_id ?? "") || !entity.device_id)
      // Area is a hass entity;
      // The entity's linked device or the entity itself is linked to the given area.
      : this.areaDeviceIds.includes(entity.device_id ?? "") || entity.area_id === this.area.area_id;

    return (!isLinusEntity && entityUnhidden && domainMatches && entityLinked);
  }

  /**
   * Get the keys of nested objects by its property value.
   *
   * @param {Object<string, any>} object An object of objects.
   * @param {string|number} property The name of the property to evaluate.
   * @param {*} value The value which the property should match.
   *
   * @return {string[]} An array with keys.
   */
  static #getObjectKeysByPropertyValue(
    object: { [k: string]: any },
    property: string, value: any
  ): string[] {
    const keys: string[] = [];

    for (const key of Object.keys(object)) {
      if (object[key][property] === value) {
        keys.push(key);
      }
    }

    return keys;
  }

  /**
   * Logs an error message to the console.
   *
   * @param {string} userMessage - The error message to display.
   * @param {unknown} [e] - (Optional) The error object or additional information.
   *
   * @return {void}
   */
  static logError(userMessage: string, e?: unknown): void {
    if (Helper.debug) {
      console.error(userMessage, e);

      return;
    }

    console.error(userMessage);
  }

  /**
   * Get entity state.
   *
   * @return {HassEntity}
   */
  static getEntityState(entity_id: string): HassEntity {
    return this.#hassStates[entity_id]
  }

  /**
   * Get entity domain.
   *
   * @return {string}
   */
  static getEntityDomain(entityId: string): string {
    return entityId.split(".")[0];
  }

  /**
   * Get translation.
   *
   * @return {string}
   */
  static localize(translationKey: string): string | undefined {
    return this.#hassLocalize(translationKey);
  }

  /**
   * Get valid entity.
   *
   * @return {StrategyEntity}
   */
  static getValidEntity(entity: StrategyEntity): Boolean {
    return entity.disabled_by === null && entity.hidden_by === null
  }
}

export { Helper };
