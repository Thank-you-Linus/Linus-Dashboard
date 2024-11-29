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
import { DEVICE_CLASSES, MAGIC_AREAS_DOMAIN, MAGIC_AREAS_NAME, UNDISCLOSED } from "./variables";
import { getMagicAreaSlug, groupEntitiesByDomain, slugify } from "./utils";
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
    const devicesByAreaIdMap = Object.fromEntries(devices.map(device => [device.id, device.area_id]));
    const entitiesByDeviceId: Record<string, StrategyEntity[]> = {};
    const entitiesByAreaId: Record<string, StrategyEntity[]> = {};
    const devicesByAreaId: Record<string, StrategyDevice[]> = {};

    this.#entities = entities.reduce((acc, entity) => {

      if (!(entity.entity_id in this.#hassStates)) return acc;

      const area = entity.area_id ? areasById[entity.area_id] : {} as StrategyArea;
      const floor = area.floor_id ? floorsById[area.floor_id] : {} as StrategyFloor;
      const enrichedEntity = {
        ...entity,
        floor_id: floor.floor_id || null,
      };

      acc[entity.entity_id] = enrichedEntity;

      if (entity.platform !== MAGIC_AREAS_DOMAIN) {
        const areaId = entity.area_id ?? devicesByAreaIdMap[entity.device_id ?? ""] ?? UNDISCLOSED;
        if (!entitiesByAreaId[areaId]) entitiesByAreaId[areaId] = [];
        entitiesByAreaId[areaId].push(enrichedEntity);
      }

      if (entity.device_id) {
        if (!entitiesByDeviceId[entity.device_id]) entitiesByDeviceId[entity.device_id] = [];
        entitiesByDeviceId[entity.device_id].push(enrichedEntity);
      }


      let domain = this.getEntityDomain(entity.entity_id)
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

      if (device.manufacturer !== MAGIC_AREAS_NAME) {
        const areaId = device.area_id ?? UNDISCLOSED;
        if (!devicesByAreaId[areaId]) devicesByAreaId[areaId] = [];
        devicesByAreaId[areaId].push(enrichedDevice);
      }

      if (device.manufacturer === MAGIC_AREAS_NAME) {
        this.#magicAreasDevices[getMagicAreaSlug(device as MagicAreaRegistryEntry)] = {
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

      const slug = area.area_id === UNDISCLOSED ? area.area_id : slugify(area.name);

      const enrichedArea = {
        ...area,
        floor_id: area.floor_id || UNDISCLOSED,
        slug,
        domains: groupEntitiesByDomain(areaEntities) ?? {},
        devices: devicesByAreaId[area.area_id]?.map(device => device.id) || [],
        magicAreaDevice: Object.values(this.#devices).find(device => device.manufacturer === MAGIC_AREAS_NAME && device.name === area.name),
        entities: areaEntities,
      };

      acc[slug] = enrichedArea;
      return acc;
    }, {} as Record<string, StrategyArea>);


    // Create and add the undisclosed floor if not hidden in the strategy options.
    if (!this.#strategyOptions.areas.undisclosed?.hidden) {

      this.#strategyOptions.floors.undisclosed = {
        ...configurationDefaults.floors.undisclosed,
        ...this.#strategyOptions.floors.undisclosed,
      };

      floors.push(this.#strategyOptions.floors.undisclosed);
    }

    // Enrichir les étages
    this.#floors = floors.reduce((acc, floor) => {
      const areasInFloor = Object.values(this.#areas).filter(area => area.floor_id === floor.floor_id);

      acc[floor.floor_id] = {
        ...floor,
        areas_slug: areasInFloor.map(area => area.slug),
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

    console.log('this.#areas', this.#areas, this.#magicAreasDevices)

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
  static getCountTemplate(domain: string, operator: string, value: string | string[], area_slug?: string | string[]): string {
    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];

    for (const slug of areaSlugs) {
      if (slug) {
        const newStates = domain === "all"
          ? this.#areas[slug]?.entities.map((entity_id) => `states['${entity_id}']`)
          : this.#areas[slug]?.domains[domain]?.map((entity_id) => `states['${entity_id}']`);
        if (newStates) {
          states.push(...newStates);
        }
      } else {
        for (const area of Object.values(this.#areas)) {
          if (area.area_id === UNDISCLOSED) continue;

          const newStates = domain === "all"
            ? area.entities.map((entity_id) => `states['${entity_id}']`)
            : area.domains[domain]?.map((entity_id) => `states['${entity_id}']`);
          if (newStates) {
            states.push(...newStates);
          }
        }
      }
    }

    const formatedValue = Array.isArray(value) ? JSON.stringify(value).replaceAll('"', "'") : `'${value}'`;

    return `{% set entities = [${states}] %}{{ entities | selectattr('state','${operator}',${formatedValue}) | list | count }}`;
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
  static getDeviceClassCountTemplate(device_class: string, operator: string, value: string, area_id?: string | string[]): string {
    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const areaIds = Array.isArray(area_id) ? area_id : [area_id];

    for (const id of areaIds) {
      const newStates = id ? this.#areas[id]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`) || [] : [];
      states.push(...newStates);
    }

    const formattedValue = Array.isArray(value) ? JSON.stringify(value).replace(/"/g, "'") : `'${value}'`;
    return `{% set entities = [${states}] %}{{ entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | selectattr('state','${operator}',${formattedValue}) | list | count }}`;
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
  static getAverageStateTemplate(device_class: string, area_slug?: string | string[]): string {
    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];

    for (const slug of areaSlugs) {
      const newStates = slug ? this.#areas[slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`) || [] : [];
      states.push(...newStates);
    }

    return `{% set entities = [${states}] %}{{ (entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute='state') | map('float') | sum / entities | length) | round(1) }} {{ ${states[0]}.attributes.unit_of_measurement }}`;
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
  static getAreaEntities(area: StrategyArea, domain?: string): StrategyEntity[] {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    if (domain) {
      return area.domains[domain]?.map(entity_id => this.#entities[entity_id]) ?? []
    } else {
      return area.entities.map(entity_id => this.#entities[entity_id]) ?? []
    }
  }

  /**
   * Get state entities, filtered by area and domain.
   *
   * The result excludes hidden and disabled entities.
   *
   * @param {StrategyArea} area Area entity.
   * @param {string} domain Domain of the entity-id.
   *
   * @return {HassEntity[]} Array of state entities.
   */
  static getStateEntities(area: StrategyArea, domain: string): HassEntity[] {
    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    // Get states whose entity-id starts with the given string.
    const stateEntities = this.#areas[area.slug].domains[domain]?.map(entity_id => this.#hassStates[entity_id]);

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
  static localize(translationKey: string): string {
    return this.#hassLocalize(translationKey) ?? "translation not found";
  }

  /**
   * Get valid entity.
   *
   * @return {StrategyEntity}
   */
  static getValidEntity(entity: StrategyEntity): Boolean {
    return entity.disabled_by === null && entity.hidden_by === null
  }

  static getFromDomainState({ domain, operator, value, ifReturn, elseReturn, area_slug }: { domain: string, operator?: string, value?: string | string[], ifReturn?: string, elseReturn?: string, area_slug?: string | string[] }): string {
    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];

    for (const slug of areaSlugs) {
      if (slug) {
        const newStates = domain === "all"
          ? this.#areas[slug]?.entities.map((entity_id) => `states['${entity_id}']`)
          : this.#areas[slug]?.domains[domain]?.map((entity_id) => `states['${entity_id}']`);
        if (newStates) {
          states.push(...newStates);
        }
      } else {
        // Get the ID of the devices which are linked to the given area.
        for (const area of Object.values(this.#areas)) {
          if (area.area_id === UNDISCLOSED) continue

          const newStates = domain === "all"
            ? this.#areas[area.slug]?.entities.map((entity_id) => `states['${entity_id}']`)
            : this.#areas[area.slug]?.domains[domain]?.map((entity_id) => `states['${entity_id}']`);
          if (newStates) {
            states.push(...newStates);
          }
        }
      }
    }

    if (domain === "light") {
      ifReturn = ifReturn ?? "amber";
    }
    if (domain === "climate") {
      operator = operator ?? "ne";
      value = value ?? "off";
      ifReturn = ifReturn ?? "orange";
    }
    if (domain === "cover") {
      value = value ?? "open";
      ifReturn = ifReturn ?? "cyan";
    }
    if (domain === "fan") {
      ifReturn = ifReturn ?? "green";
    }
    if (domain === "media_player") {
      value = value ?? "playing";
      ifReturn = ifReturn ?? "dark-blue";
    }
    if (domain === "switch") {
      ifReturn = ifReturn ?? "blue";
    }

    const formatedValue = Array.isArray(value) ? JSON.stringify(value).replaceAll('"', "'") : `'${value ?? 'on'}'`;

    return `{% set entities = [${states}] %}{{ '${ifReturn ?? 'white'}' if entities | selectattr('state','${operator ?? 'eq'}', ${formatedValue}) | list | count > 0 else '${elseReturn ?? 'grey'}' }}`;
  }

  static getBinarySensorColorFromState(device_class: string, operator: string, value: string, ifReturn: string, elseReturn: string, area_slug?: string | string[]): string {

    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }


    if (area_slug) {
      const newStates = Array.isArray(area_slug)
        ? area_slug.flatMap(slug => this.#areas[slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`) || [])
        : this.#areas[area_slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`);
      if (newStates) {
        states.push(...newStates);
      }
    } else {
      // Get the ID of the devices which are linked to the given area.
      for (const area of Object.values(this.#areas)) {
        if (area.area_id === UNDISCLOSED) continue

        const newStates = this.#areas[area.slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`);
        if (newStates) {
          states.push(...newStates);
        }
      }
    }

    return `
      {% set entities = [${states}] %}
      {{ '${ifReturn}' if entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | selectattr('state','${operator}','${value}') | list | count else '${elseReturn}' }}`;
  }

  static getSensorColorFromState(device_class: string, area_slug?: string | string[]): string | undefined {

    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }


    if (area_slug) {
      const newStates = Array.isArray(area_slug)
        ? area_slug.flatMap(slug => this.#areas[slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`) || [])
        : this.#areas[area_slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`);
      if (newStates) {
        states.push(...newStates);
      }
    } else {
      // Get the ID of the devices which are linked to the given area.
      for (const area of Object.values(this.#areas)) {
        if (area.area_id === UNDISCLOSED) continue

        const newStates = this.#areas[area.slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`);
        if (newStates) {
          states.push(...newStates);
        }
      }
    }

    if (device_class === "battery") {
      return `
        {% set entities = [${states}] %}
        {% set bl = entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute='state') | map('float') | sum / entities | length %}
        {% if bl < 20 %}
          red
        {% elif bl < 30 %}
          orange
        {% elif bl >= 30 %}
          green
        {% else %}
          disabled
        {% endif %}
      `
    }

    if (device_class === "temperature") {
      return `
        {% set entities = [${states}] %}
        {% set bl = entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute='state') | map('float') | sum / entities | length %}
        {% if bl < 20 %}
          blue
        {% elif bl < 30 %}
          orange
        {% elif bl >= 30 %}
          red
        {% else %}
          disabled
        {% endif %}
      `
    }
    if (device_class === "humidity") {
      return `
        {% set entities = [${states}] %}
        {% set humidity = entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute='state') | map('float') | sum / entities | length %}
        {% if humidity < 30 %}
          blue
        {% elif humidity >= 30 and humidity <= 60 %}
          green
        {% else %}
          red
        {% endif %}
      `
    }

    return undefined
  }

  static getSensorIconFromState(device_class: string, area_slug?: string | string[]): string | undefined {

    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    if (area_slug) {
      const newStates = Array.isArray(area_slug)
        ? area_slug.flatMap(slug => this.#areas[slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`) || [])
        : this.#areas[area_slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`);
      if (newStates) {
        states.push(...newStates);
      }
    } else {
      // Get the ID of the devices which are linked to the given area.
      for (const area of Object.values(this.#areas)) {
        if (area.area_id === UNDISCLOSED) continue

        const newStates = this.#areas[area.slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`);
        if (newStates) {
          states.push(...newStates);
        }
      }
    }

    if (device_class === "battery") {
      return `
      {% set entities = [${states}] %}
      {% set bl = entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute = 'state') | map('float') | sum / entities | length %}
      {% if bl == 'unknown' or bl == 'unavailable' %}
      {% elif bl | int() < 10 %} mdi:battery-outline
      {% elif bl | int() < 20 %} mdi:battery-10
      {% elif bl | int() < 30 %} mdi:battery-20
      {% elif bl | int() < 40 %} mdi:battery-30
      {% elif bl | int() < 50 %} mdi:battery-40
      {% elif bl | int() < 60 %} mdi:battery-50
      {% elif bl | int() < 70 %} mdi:battery-60
      {% elif bl | int() < 80 %} mdi:battery-70
      {% elif bl | int() < 90 %} mdi:battery-80
      {% elif bl | int() < 100 %} mdi:battery-90
      {% elif bl | int() == 100 %} mdi:battery
      {% else %} mdi:battery{% endif %} `
    }

    if (device_class === "temperature") {
      return `
        {% set entities = [${states}] %}
        {% set bl = (entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute = 'state') | map('float') | sum / entities | length) %}
        {% if bl < 20 %}
          mdi:thermometer-low
        {% elif bl < 30 %}
          mdi:thermometer
        {% elif bl >= 30 %}
          mdi:thermometer-high
        {% else %}
          disabled
        {% endif %}
      `
    }

    return undefined
  }
}

export { Helper };
