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
import { DEVICE_CLASSES, MAGIC_AREAS_DOMAIN, MAGIC_AREAS_NAME, SENSOR_STATE_CLASS_TOTAL, SENSOR_STATE_CLASS_TOTAL_INCREASING, UNDISCLOSED } from "./variables";
import { getEntityDomain, getGlobalEntitiesExceptUndisclosed, getMAEntity, getMagicAreaSlug, groupEntitiesByDomain, slugify } from "./utils";
import { EntityRegistryEntry } from "./types/homeassistant/data/entity_registry";
import { FrontendEntityComponentIconResources, IconResources } from "./types/homeassistant/data/frontend";
import { LinusDashboardConfig } from "./types/homeassistant/data/linus_dashboard";

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
   * @type {Record<string, StrategyEntity[]>}
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
   * Set to true for more verbose information in the console.
   *
   * @type {IconResources}
   * @private
   */
  static #icons: IconResources;

  /**
   * Set to true for more verbose information in the console.
   *
   * @type {LinusDashboardConfig}
   * @private
   */
  static #linus_dashboard_config: LinusDashboardConfig;

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
   * Get the icons from Home Assistant's frontend.
   *
   * @returns {IconResources}
   * @static
   */
  static get icons(): IconResources {
    return this.#icons;
  }

  /**
   * Get the linus_dashboard_config from Home Assistant's frontend.
   *
   * @returns {LinusDashboardConfig}
   * @static
   */
  static get linus_dashboard_config(): LinusDashboardConfig {
    return this.#linus_dashboard_config;
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

    // console.log('this.#', info.hass)

    let homeAssistantRegistries = [];

    try {
      // Query the registries of Home Assistant.
      homeAssistantRegistries = await Promise.all([
        info.hass.callWS({ type: "config/entity_registry/list" }) as Promise<EntityRegistryEntry[]>,
        info.hass.callWS({ type: "config/device_registry/list" }) as Promise<DeviceRegistryEntry[]>,
        info.hass.callWS({ type: "config/area_registry/list" }) as Promise<AreaRegistryEntry[]>,
        info.hass.callWS({ type: "config/floor_registry/list" }) as Promise<FloorRegistryEntry[]>,
        info.hass.callWS({ type: "frontend/get_icons", category: "entity_component" }) as Promise<FrontendEntityComponentIconResources>,
        info.hass.callWS({ type: "frontend/get_icons", category: "services" }) as Promise<FrontendEntityComponentIconResources>,
        info.hass.callWS({ type: "linus_dashboard/get_config" }) as Promise<LinusDashboardConfig>,
      ]);
    } catch (e) {
      Helper.logError("An error occurred while querying Home assistant's registries!", e);
      throw 'Check the console for details';
    }

    const [entities, devices, areas, floors, entity_component_icons, services_icons, linus_dashboard_config] = homeAssistantRegistries;

    this.#icons = deepmerge(entity_component_icons.resources, services_icons.resources);
    this.#linus_dashboard_config = linus_dashboard_config;

    // Dictionaries for quick access
    const areasById = Object.fromEntries(areas.map(a => [a.area_id, a]));
    const floorsById = Object.fromEntries(floors.map(f => [f.floor_id, f]));
    const devicesByAreaIdMap = Object.fromEntries(devices.map(device => [device.id, device.area_id]));
    const entitiesByDeviceId: Record<string, StrategyEntity[]> = {};
    const entitiesByAreaId: Record<string, StrategyEntity[]> = {};
    const devicesByAreaId: Record<string, StrategyDevice[]> = {};

    this.#entities = entities.reduce((acc, entity) => {
      if (!(entity.entity_id in this.#hassStates) || entity.hidden_by) return acc;
      if (Helper.linus_dashboard_config?.excluded_entities?.includes(entity.entity_id)) return acc;

      let domain = getEntityDomain(entity.entity_id);
      let device_class

      if (Object.keys(DEVICE_CLASSES).includes(domain)) {
        const entityState = Helper.getEntityState(entity.entity_id);
        if (entityState?.attributes?.device_class) device_class = entityState.attributes.device_class;
      }

      const domainTag = `${domain}${device_class ? ":" + device_class : ""}`;

      if (!this.#domains[domainTag]) this.#domains[domainTag] = [];

      if (Helper.linus_dashboard_config?.excluded_domains?.includes(domain)) return acc;

      const area = entity.area_id ? areasById[entity.area_id] : {} as StrategyArea;
      const floor = area?.floor_id ? floorsById[area?.floor_id] : {} as StrategyFloor;
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

      if (entity.platform !== MAGIC_AREAS_DOMAIN) this.#domains[domainTag].push(enrichedEntity);

      return acc;
    }, {} as Record<string, StrategyEntity>);

    // Enrich devices
    this.#devices = devices.reduce((acc, device) => {
      const entitiesInDevice = entitiesByDeviceId[device.id] || [];
      const area = device.area_id ? areasById[device.area_id] : {} as StrategyArea;
      const floor = area?.floor_id ? floorsById[area?.floor_id] : {} as StrategyFloor;

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
          entities: entitiesInDevice.reduce((entities: Record<string, StrategyEntity>, entity) => {
            entities[entity.translation_key!] = entity;
            return entities;
          }, {})
        };
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

    // Enrich areas
    this.#areas = areas.reduce((acc, area) => {
      const areaEntities = entitiesByAreaId[area.area_id]?.map(entity => entity.entity_id) || [];
      const slug = area.area_id === UNDISCLOSED ? area.area_id : slugify(area.name);

      const enrichedArea = {
        ...area,
        floor_id: area?.floor_id || UNDISCLOSED,
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

    // Enrich floors
    this.#floors = floors.reduce((acc, floor) => {
      const areasInFloor = Object.values(this.#areas).filter(area => area?.floor_id === floor.floor_id);

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
   * @param {object} options The options object containing the parameters.
   * @param {string} options.domain The domain of the entities.
   * @param {string} options.operator The Comparison operator between state and value.
   * @param {string | string[]} options.value The value to which the state is compared against.
   * @param {string | string[]} [options.area_slug] The area slug(s) to filter entities by.
   * @param {string} [options.device_class] The device class of the entities.
   * @param {boolean} [options.allowUnavailable] Whether to allow unavailable states.
   * @param {string} [options.prefix] The prefix to add to the result.
   *
   * @return {string} The template string.
   * @static
   */
  static getCountTemplate({
    domain,
    operator,
    value,
    area_slug,
    device_class,
    allowUnavailable,
    prefix
  }: {
    domain: string,
    operator: string,
    value: string | string[],
    area_slug?: string | string[],
    device_class?: string,
    allowUnavailable?: boolean,
    prefix?: string
  }): string {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const entitiesId = this.getEntityIds({ domain, device_class, area_slug });
    const states = this.getStateStrings(entitiesId);

    const formattedValue = Array.isArray(value) ? JSON.stringify(value).replaceAll('"', "'") : `'${value}'`;

    return `{% set entities = [${states}] %}{% set count = entities ${allowUnavailable ? "" : "| selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable')"}| selectattr('state','${operator}',${formattedValue}) | list | count %}{% if count > 0 %}{{ '${prefix ?? ""}' ~ count }}{% else %}{% endif %}`;
  }

  /**
   * Generates a Jinja2 template string to filter and transform a list of sensor entities.
   *
   * This function constructs a Jinja2 template string that filters the provided list of entities
   * based on their state and attributes, specifically targeting entities with a defined device class
   * that matches the provided `device_class` parameter. The resulting template string can be used
   * to extract and convert the states of the matching entities to a list of floating-point numbers.
   *
   * @param entities - An array of entity IDs to be filtered and transformed.
   * @param device_class - The device class to filter the entities by.
   * @returns A Jinja2 template string that filters and transforms the entities.
   */
  static getSensorEntities(entities: string[], device_class: string): string {
    return `[${entities}] | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | selectattr('attributes', 'defined') | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute='state') | map('float') | list`
  }

  /**
   * Get a template string to define the sum or average state of sensor entities with a given device class.
   *
   * @param {string} device_class The device class of the entities.
   * @param {string | string[]} area_slug The area slug(s) to filter entities by.
   *
   * @return {string} The template string.
   * @static
   */
  static getSensorStateTemplate(device_class: string, area_slug: string | string[] = "global"): string {
    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];

    for (const slug of areaSlugs) {
      const magic_entity = getMAEntity(slug!, "sensor", device_class);
      const entities = magic_entity ? [magic_entity.entity_id] : slug === "global" ? getGlobalEntitiesExceptUndisclosed(device_class) : this.#areas[slug]?.domains?.[device_class]
      const newStates = entities?.map((entity_id: string) => `states['${entity_id}']`);
      if (newStates) states.push(...newStates);
    }

    const isSum = SENSOR_STATE_CLASS_TOTAL.includes(device_class) || SENSOR_STATE_CLASS_TOTAL_INCREASING.includes(device_class);

    return `
      {% set entities = ${Helper.getSensorEntities(states, device_class)} %}
      {% if entities | length > 0 %}
        {{ (entities ${isSum ? '| sum' : '| sum / entities | length'}) | round(1) }} {% if ${states[0]}.attributes.unit_of_measurement is defined %} {{ ${states[0]}.attributes.unit_of_measurement }}{% endif %}
      {% endif %}`;
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
  static getAreaEntities(area: StrategyArea, domain?: string, device_class?: string): StrategyEntity[] {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const dc = domain === "binary_sensor" || domain === "sensor" ? device_class : undefined;
    const domainTag = `${domain}${dc ? ":" + dc : ""}`;

    if (domainTag) {
      if (domain === "cover") {
        return DEVICE_CLASSES.cover.flatMap(d => area.domains?.[`cover:${d}`]?.map(entity_id => this.#entities[entity_id]) ?? []);
      } else {
        return area.domains?.[domainTag]?.map(entity_id => this.#entities[entity_id]) ?? [];
      }
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
    const stateEntities = this.#areas[area.slug].domains?.[domain]?.map(entity_id => this.#hassStates[entity_id]);

    return stateEntities ?? [];
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

  /**
   * Get valid entity.
   *
   * @return {StrategyEntity}
   */
  static getStates({ domain, device_class, area_slug }: { domain: string, device_class?: string, area_slug?: string | string[] }): string[] {
    const states: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];

    for (const slug of areaSlugs) {
      if (slug) {
        const magic_entity = device_class ? getMAEntity(slug!, domain, device_class) : getMAEntity(slug!, domain);
        const entities = magic_entity ? [magic_entity.entity_id] : area_slug === "global" ? getGlobalEntitiesExceptUndisclosed(device_class ?? domain) : this.#areas[slug]?.domains?.[device_class ?? domain];
        const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
        if (newStates) states.push(...newStates);
      } else {
        // Get the ID of the devices which are linked to the given area.
        for (const area of Object.values(this.#areas)) {
          if (area.area_id === UNDISCLOSED) continue;

          const newStates = domain === "all"
            ? this.#areas[area.slug]?.entities.map((entity_id) => `states['${entity_id}']`)
            : this.#areas[area.slug]?.domains?.[device_class ?? domain]?.map((entity_id) => `states['${entity_id}']`);
          if (newStates) states.push(...newStates);
        }
      }
    }

    return states
  }
  static getEntityIds({ domain, device_class, area_slug = 'global' }: { domain: string, device_class?: string, area_slug?: string | string[] }): string[] {
    const entityIds: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
    const domainTag = `${domain}${device_class ? ":" + device_class : ""}`;

    for (const slug of areaSlugs) {
      if (slug) {
        const magic_entity = device_class ? getMAEntity(slug!, domain, device_class) : getMAEntity(slug!, domain);
        const entities = magic_entity ? [magic_entity.entity_id] : area_slug === "global" ? getGlobalEntitiesExceptUndisclosed(domain, device_class) : this.#areas[slug]?.domains?.[domainTag];
        if (entities) entityIds.push(...entities);
      } else {
        for (const area of Object.values(this.#areas)) {
          if (area.area_id === UNDISCLOSED) continue;
          const entities = domain === "all"
            ? this.#areas[area.slug]?.entities
            : this.#areas[area.slug]?.domains?.[domainTag];
          if (entities) entityIds.push(...entities);
        }
      }
    }

    return entityIds;
  }

  static getStateStrings(entityIds: string[]): string[] {
    return entityIds.map((entity_id) => `states['${entity_id}']`);
  }

  static getLastChangedTemplate({ domain, device_class, area_slug }: { domain: string, device_class?: string, area_slug?: string | string[] }): string {


    const states = this.getStateStrings(this.getEntityIds({ domain, device_class, area_slug }));

    return `{% set entities = [${states}] %}{{ relative_time(entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='last_changed') | max) }}`;
  }

  static getLastChangedEntityIdTemplate({ domain, device_class, area_slug }: { domain: string, device_class?: string, area_slug?: string | string[] }): string {

    const states = this.getStateStrings(this.getEntityIds({ domain, device_class, area_slug }));

    return `{% set entities = [${states}] %}{{ entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | sort(attribute='last_changed', reverse=True) | first }}`;
  }
  static getFromDomainState({ domain, device_class, operator, value, ifReturn, elseReturn, area_slug, allowUnavailable }: { domain: string, device_class?: string, operator?: string, value?: string | string[], ifReturn?: string, elseReturn?: string, area_slug?: string | string[], allowUnavailable?: boolean }): string {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const states = this.getStateStrings(this.getEntityIds({ domain, device_class, area_slug }));

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

    return `{% set entities = [${states}] %}{{ '${ifReturn ?? 'white'}' if entities ${allowUnavailable ? "" : "| selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable')"}| selectattr('state','${operator ?? 'eq'}', ${formatedValue}) | list | count > 0 else '${elseReturn ?? 'grey'}' }}`;
  }

  static getBinarySensorColorFromState(device_class: string, operator: string, value: string, ifReturn: string, elseReturn: string, area_slug: string | string[] = "global"): string {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const states = this.getStateStrings(this.getEntityIds({ domain: "binary_sensor", device_class, area_slug }));

    return `
      {% set entities = [${states}] %}
      {{ '${ifReturn}' if entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | selectattr('state','${operator}','${value}') | list | count else '${elseReturn}' }}`;
  }

  static getSensorColorFromState(device_class: string, area_slug: string | string[] = "global"): string | undefined {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const states = this.getStateStrings(this.getEntityIds({ domain: "sensor", device_class, area_slug }));

    if (device_class === "battery") {
      return `
        {% set entities = ${Helper.getSensorEntities(states, device_class)} %}
        {% if entities | length > 0 %}
          {% set bl = entities  | sum / entities | length %}
          {% if bl < 20 %}
            red
          {% elif bl < 30 %}
            orange
          {% elif bl >= 30 %}
            green
          {% else %}
            disabled
          {% endif %}
        {% else %}
        {% endif %}
      `;
    }

    if (device_class === "temperature") {
      return `
        {% set entities = ${Helper.getSensorEntities(states, device_class)} %}
        {% if entities | length > 0 %}
          {% set bl = entities  | sum / entities | length %}
          {% if bl < 20 %}
            blue
          {% elif bl < 30 %}
            orange
          {% elif bl >= 30 %}
            red
          {% else %}
            disabled
          {% endif %}
        {% else %}
        {% endif %}
      `;
    }

    if (device_class === "humidity") {
      return `
        {% set entities = ${Helper.getSensorEntities(states, device_class)} %}
        {% if entities | length > 0 %}
          {% set humidity = entities  | sum / entities | length %}
          {% if humidity < 30 %}
            blue
          {% elif humidity >= 30 and humidity <= 60 %}
            green
          {% else %}
            red
          {% endif %}
        {% else %}
        {% endif %}
      `;
    }

    return undefined;
  }

  static getSensorIconFromState(device_class: string, area_slug: string | string[] = "global"): string | undefined {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const states = this.getStateStrings(this.getEntityIds({ domain: "sensor", device_class, area_slug }));

    if (device_class === "battery") {
      return `
        {% set entities = ${Helper.getSensorEntities(states, device_class)} %}
        {% if entities | length > 0 %}
          {% set bl = entities  | sum / entities | length %}
          {% if bl < 10 %} mdi:battery-outline
          {% elif bl < 20 %} mdi:battery-10
          {% elif bl < 30 %} mdi:battery-20
          {% elif bl < 40 %} mdi:battery-30
          {% elif bl < 50 %} mdi:battery-40
          {% elif bl < 60 %} mdi:battery-50
          {% elif bl < 70 %} mdi:battery-60
          {% elif bl < 80 %} mdi:battery-70
          {% elif bl < 90 %} mdi:battery-80
          {% elif bl < 100 %} mdi:battery-90
          {% elif bl == 100 %} mdi:battery
          {% else %} mdi:battery{% endif %}
        {% else %}
          mdi:battery-alert
        {% endif %}
      `;
    }

    if (device_class === "temperature") {
      return `
        {% set entities = ${Helper.getSensorEntities(states, device_class)} %}
        {% if entities | length > 0 %}
          {% set bl = entities  | sum / entities | length %}
          {% if bl < 20 %}
            mdi:thermometer-low
          {% elif bl < 30 %}
            mdi:thermometer
          {% elif bl >= 30 %}
            mdi:thermometer-high
          {% endif %}
        {% else %}
          mdi:thermometer-alert
        {% endif %}
      `;
    }

    return undefined;
  }
}

export { Helper };
