import { configurationDefaults } from "./configurationDefaults";
import { HassEntities, HassEntity } from "home-assistant-js-websocket";
import merge from "lodash.merge";
import { DeviceRegistryEntry } from "./types/homeassistant/data/device_registry";
import { AreaRegistryEntry } from "./types/homeassistant/data/area_registry";
import { generic } from "./types/strategy/generic";
import StrategyArea = generic.StrategyArea;
import StrategyFloor = generic.StrategyFloor;
import StrategyEntity = generic.StrategyEntity;
import StrategyDevice = generic.StrategyDevice;
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { FloorRegistryEntry } from "./types/homeassistant/data/floor_registry";
import { DEVICE_CLASSES, MAGIC_AREAS_DOMAIN, MAGIC_AREAS_NAME, SENSOR_STATE_CLASS_TOTAL, SENSOR_STATE_CLASS_TOTAL_INCREASING, UNDISCLOSED, colorMapping, ALL_HOME_ASSISTANT_DOMAINS } from "./variables";
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
    this.#strategyOptions = merge(configurationDefaults, info.config?.strategy?.options ?? {});
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

    this.#icons = merge(entity_component_icons.resources, services_icons.resources);
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
   * @param {object} options The options object containing the parameters.
   * @param {string} options.domain The domain of the entities.
   * @param {string} options.operator The Comparison operator between state and value.
   * @param {string | string[]} options.value The value to which the state is compared against.
   * @param {string | string[]} [options.area_slug] The area slug(s) to filter entities by.
   * @param {string | string[]} [options.device_class] The device class of the entities.
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
    domain: string;
    operator: string;
    value: string | string[];
    area_slug?: string | string[];
    device_class?: string;
    allowUnavailable?: boolean;
    prefix?: string;
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

    if (domain) {
      if (device_class) {
        const domainTag = `${domain}:${device_class}`;
        return area.domains?.[domainTag]?.map(entity_id => this.#entities[entity_id]) ?? [];
      } else {
        // If device_class is not specified, get all entities of the domain regardless of device class
        const domainTags = Object.keys(area.domains || {}).filter(tag => tag.startsWith(`${domain}:`) || tag === domain);
        return domainTags.flatMap(tag => area.domains?.[tag]?.map(entity_id => this.#entities[entity_id]) ?? []);
      }
    } else {
      // If domain is not specified, return all entities in the area
      return area.entities.map(entity_id => this.#entities[entity_id]) ?? [];
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

    // Si le domaine est "all", on traite tous les domaines directement pour optimiser les performances
    if (domain === "all") {
      const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];

      for (const slug of areaSlugs) {
        if (slug) {
          // Pour chaque area, récupérer toutes les entités de tous les domaines
          if (slug === "global") {
            // Mode global : récupérer toutes les entités sauf undisclosed
            for (const cardDomain of ALL_HOME_ASSISTANT_DOMAINS) {
              const entities = getGlobalEntitiesExceptUndisclosed(device_class ?? cardDomain);
              const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
              if (newStates) states.push(...newStates);
            }
          } else {
            // Mode area spécifique : récupérer toutes les entités de l'area pour tous les domaines
            const area = this.#areas[slug];
            if (area?.domains) {
              for (const domainKey of Object.keys(area.domains)) {
                // Filtrer par device_class si spécifié
                if (!device_class || domainKey.includes(device_class)) {
                  const entities = area.domains[domainKey];
                  const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
                  if (newStates) states.push(...newStates);
                }
              }
            }
          }
        } else {
          // Mode toutes les areas : récupérer toutes les entités de toutes les areas pour tous les domaines
          for (const area of Object.values(this.#areas)) {
            if (area.area_id === UNDISCLOSED) continue;

            if (area.domains) {
              for (const domainKey of Object.keys(area.domains)) {
                // Filtrer par device_class si spécifié
                if (!device_class || domainKey.includes(device_class)) {
                  const entities = area.domains[domainKey];
                  const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
                  if (newStates) states.push(...newStates);
                }
              }
            }
          }
        }
      }
      return states;
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

          const newStates = this.#areas[area.slug]?.domains?.[device_class ?? domain]?.map((entity_id) => `states['${entity_id}']`);
          if (newStates) states.push(...newStates);
        }
      }
    }

    return states
  }

  /**
   * Get the entity IDs from the entity registry, filtered by domain, device class, and area slug.
   *
   * @param {object} options The options object containing the parameters.
   * @param {string} options.domain The domain of the entities.
   * @param {string} [options.device_class] The device class of the entities.
   * @param {string | string[]} [options.area_slug] The area slug(s) to filter entities by.
   *
   * @return {string[]} An array of entity IDs.
   * @static
   */
  static getEntityIds({
    domain,
    device_class,
    area_slug = "global"
  }: {
    domain: string;
    device_class?: string;
    area_slug?: string | string[];
  }): string[] {

    const entityIds: string[] = [];

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    // Si le domaine est "all", on traite tous les domaines directement pour optimiser les performances
    if (domain === "all") {
      const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];

      for (const slug of areaSlugs) {
        if (slug) {
          // Pour chaque area, récupérer toutes les entités de tous les domaines
          if (slug === "global") {
            // Mode global : récupérer toutes les entités sauf undisclosed
            for (const cardDomain of ALL_HOME_ASSISTANT_DOMAINS) {
              if (device_class) {
                const entities = getGlobalEntitiesExceptUndisclosed(cardDomain, device_class);
                if (entities) entityIds.push(...entities);
              } else {
                // Récupérer toutes les device classes pour ce domaine
                const domainTags = Object.keys(this.#domains).filter(tag => tag.startsWith(`${cardDomain}:`));
                if (domainTags.length > 0) {
                  for (const domainTag of domainTags) {
                    const entities = getGlobalEntitiesExceptUndisclosed(cardDomain, domainTag.split(":")[1]);
                    if (entities) entityIds.push(...entities);
                  }
                } else {
                  const entities = getGlobalEntitiesExceptUndisclosed(cardDomain);
                  if (entities) entityIds.push(...entities);
                }
              }
            }
          } else {
            // Mode area spécifique : récupérer toutes les entités de l'area pour tous les domaines
            const area = this.#areas[slug];
            if (area?.domains) {
              for (const domainKey of Object.keys(area.domains)) {
                // Filtrer par device_class si spécifié
                if (!device_class || domainKey.includes(device_class)) {
                  const entities = area.domains[domainKey];
                  if (entities) entityIds.push(...entities);
                }
              }
            }
          }
        } else {
          // Mode toutes les areas : récupérer toutes les entités de toutes les areas pour tous les domaines
          for (const area of Object.values(this.#areas)) {
            if (area.area_id === UNDISCLOSED) continue;

            if (area.domains) {
              for (const domainKey of Object.keys(area.domains)) {
                // Filtrer par device_class si spécifié
                if (!device_class || domainKey.includes(device_class)) {
                  const entities = area.domains[domainKey];
                  if (entities) entityIds.push(...entities);
                }
              }
            }
          }
        }
      }
      return entityIds;
    }

    const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];

    for (const slug of areaSlugs) {
      if (slug) {
        if (device_class) {
          const magic_entity = getMAEntity(slug!, domain, device_class);
          const entities = magic_entity ? [magic_entity.entity_id] : area_slug === "global" ? getGlobalEntitiesExceptUndisclosed(domain, device_class) : this.#areas[slug]?.domains?.[`${domain}:${device_class}`];
          if (entities) entityIds.push(...entities);
        } else {
          // If device_class is undefined, get all device_classes for the domain
          const domainTags = Object.keys(this.#domains).filter(tag => tag.startsWith(`${domain}:`));
          if (domainTags.length > 0) {
            for (const domainTag of domainTags) {
              const magic_entity = getMAEntity(slug!, domain, domainTag.split(":")[1]);
              const entities = magic_entity ? [magic_entity.entity_id] : area_slug === "global" ? getGlobalEntitiesExceptUndisclosed(domain, domainTag.split(":")[1]) : this.#areas[slug]?.domains?.[domainTag];
              if (entities) entityIds.push(...entities);
            }
          } else {
            // If no device class exists for this domain, get all entities of the domain
            const entities = area_slug === "global" ? getGlobalEntitiesExceptUndisclosed(domain) : this.#areas[slug]?.domains?.[domain];
            if (entities) entityIds.push(...entities);
          }
        }
      } else {
        for (const area of Object.values(this.#areas)) {
          if (area.area_id === UNDISCLOSED) continue;
          if (device_class) {
            const entities = this.#areas[area.slug]?.domains?.[`${domain}:${device_class}`];
            if (entities) entityIds.push(...entities);
          } else {
            // If device_class is undefined, get all device_classes for the domain
            const domainTags = Object.keys(this.#domains).filter(tag => tag.startsWith(`${domain}:`));
            for (const domainTag of domainTags) {
              const entities = this.#areas[area.slug]?.domains?.[domainTag];
              if (entities) entityIds.push(...entities);
            }
          }
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
  static getFromDomainState({ domain, device_class, operator = 'eq', value, ifReturn, elseReturn, area_slug, allowUnavailable }: { domain: string, device_class?: string, operator?: string, value?: string | string[], ifReturn?: string, elseReturn?: string, area_slug?: string | string[], allowUnavailable?: boolean }): string {

    if (!this.isInitialized()) {
      console.warn("Helper class should be initialized before calling this method!");
    }

    const states = this.getStateStrings(this.getEntityIds({ domain, device_class, area_slug }));

    const domainColors = colorMapping[domain] || {};
    let defaultColor: string = "grey";

    if (device_class && domainColors[device_class] && typeof domainColors[device_class] === "object") {
      const thresholds = domainColors[device_class] as Record<number, string>;
      const thresholdKeys = Object.keys(thresholds).map(Number).sort((a, b) => b - a);
      const matchingThreshold = thresholdKeys.find(threshold => Number(value) >= threshold);
      defaultColor = matchingThreshold !== undefined ? thresholds[matchingThreshold] : "grey";
    } else {
      const colorValue = domainColors[device_class as string];
      defaultColor = typeof colorValue === "string" ? colorValue : (typeof domainColors.default === "string" ? domainColors.default : "grey");
    }

    ifReturn = ifReturn ?? defaultColor;

    const formattedValue = Array.isArray(value) ? JSON.stringify(value).replaceAll('"', "'") : `'${value ?? 'on'}'`;

    return `{% set entities = [${states}] %}{{ '${ifReturn}' if entities ${allowUnavailable ? "" : "| selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable')"}| selectattr('state','${operator}', ${formattedValue}) | list | count > 0 else '${elseReturn ?? 'grey'}' }}`;
  }

  /**
   * Get an icon based on domain, device_class, and optionally state.
   *
   * @param {string} domain - The domain of the entity (e.g., "sensor", "binary_sensor").
   * @param {string | undefined} device_class - The device class of the entity (e.g., "temperature", "motion").
   * @param {string | undefined} state - The state of the entity (e.g., "on", "off").
   * @returns {string} - The icon string (e.g., "mdi:thermometer").
   */
  static getIcon(domain: string, device_class = '_', entity_ids?: string[]): string {
    const domainIcons = Helper.icons[domain as keyof IconResources];
    if (!domainIcons) {
      return "mdi:help-circle-circle"; // Default icon if domain is not found
    }

    const states = entity_ids?.length ? Helper.getStateStrings(entity_ids) : [];

    if (domain === "sensor" && device_class === "battery") {
      // Handle battery level icons
      if (states.length) {
        return `{% set entities = [${states}] %}{% set valid_states = entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | map('float') | list %}{% if valid_states | length > 0 %}{% set battery_level = valid_states | max %}{% if battery_level >= 95 %}mdi:battery{% elif battery_level >= 85 %}mdi:battery-90{% elif battery_level >= 75 %}mdi:battery-80{% elif battery_level >= 65 %}mdi:battery-70{% elif battery_level >= 55 %}mdi:battery-60{% elif battery_level >= 45 %}mdi:battery-50{% elif battery_level >= 35 %}mdi:battery-40{% elif battery_level >= 25 %}mdi:battery-30{% elif battery_level >= 15 %}mdi:battery-20{% elif battery_level >= 5 %}mdi:battery-10{% else %}mdi:battery-outline{% endif %}{% else %}mdi:battery-outline{% endif %}`;
      }
      return "mdi:battery-outline"; // Default battery icon if no states are available
    }

    if (domain === "sensor" && device_class === "temperature") {
      // Handle temperature icons
      if (states.length) {
        return `{% set entities = [${states}] %}{% set valid_states = entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | map('float') | list %}{% set temperature = valid_states | max if valid_states | length > 0 else 0 %}{% if temperature >= 30 %}mdi:thermometer-high{% elif temperature >= 20 %}mdi:thermometer{% elif temperature >= 10 %}mdi:thermometer-low{% else %}mdi:snowflake{% endif %}`;
      }
      return "mdi:thermometer"; // Default temperature icon if no states are available
    }

    if (device_class && domainIcons[device_class as keyof IconResources[keyof IconResources]]) {
      const deviceClassIcons = domainIcons[device_class as keyof IconResources[keyof IconResources]];

      if (deviceClassIcons?.state) {
        let stateIconTemplate = states.length
          ? `{% set entities = [${states}] %}{% set state = entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | list %}`
          : '{% set state = [] %}';
        for (const [stateKey, icon] of Object.entries(deviceClassIcons.state)) {
          stateIconTemplate += `{% if state | select('eq', '${stateKey}') | list | count > 0 %}${icon}{% else %}`;
        }
        stateIconTemplate += `${deviceClassIcons.default || "mdi:help-circle"}` + "{% endif %}".repeat(Object.keys(deviceClassIcons.state).length);
        return stateIconTemplate;
      }
      return deviceClassIcons?.default || "mdi:help-circle";
    }

    if (domainIcons.state && states.length) {
      let stateIconTemplate = `{% set entities = [${states}] %}{% set state = entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | list %}`

      for (const [stateKey, icon] of Object.entries(domainIcons.state)) {
        stateIconTemplate += `{% if state | select('eq', '${stateKey}') | list | count > 0 %}${icon}{% else %}`;
      }
      stateIconTemplate += `${domainIcons.default || "mdi:help-circle"}` + "{% endif %}".repeat(Object.keys(domainIcons.state).length);

      return stateIconTemplate;
    }

    return typeof domainIcons.default === "string" ? domainIcons.default : "mdi:help-circle"; // Default icon for domain
  }

  /**
   * Get the color of an icon based on domain, device_class, and optionally state.
   *
   * @param {string} domain - The domain of the entity (e.g., "sensor", "binary_sensor").
   * @param {string | undefined} device_class - The device class of the entity (e.g., "temperature", "motion").
   * @param {string[]} entity_ids - The list of entity IDs to evaluate.
   * @returns {string} - The color string (e.g., "red", "blue").
   */
  static getIconColor(domain: string, device_class: string = '_', entity_ids: string[] = []): string {
    const states = entity_ids.length ? Helper.getStateStrings(entity_ids) : [];
    const domainColors = colorMapping[domain] || colorMapping.default;
    let defaultColor = "grey";

    if (device_class && domainColors?.[device_class] && typeof domainColors[device_class] === "object") {
      const deviceClassColors = domainColors[device_class] as Record<string | number, string | Record<string, string>>;
      if (domain === "sensor" && typeof deviceClassColors === "object") {
        // Handle threshold-based color mapping for sensors
        const thresholds = deviceClassColors.state as Record<number, string>;
        const thresholdKeys = Object.keys(thresholds).map(Number).sort((a, b) => b - a); // Sort descending for maximum value
        const aggregation = SENSOR_STATE_CLASS_TOTAL.includes(device_class) || SENSOR_STATE_CLASS_TOTAL_INCREASING.includes(device_class) ? 'sum' : 'sum / valid_states | length';
        defaultColor = states.length
          ? `{% set entities = [${states}] %}{% set valid_states = entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | map('float') | list %}{% set aggregated_state = valid_states | ${aggregation} if valid_states | length > 0 else 0 %}`
          : `{% set aggregated_state = 0 %}`;
        for (const threshold of thresholdKeys) {
          defaultColor += `{% if aggregated_state >= ${threshold} %}${thresholds[threshold]}{% else %}`;
        }
        defaultColor += "grey" + "{% endif %}".repeat(thresholdKeys.length);
        return defaultColor;
      } else if (deviceClassColors.state) {
        // Handle state-based color mapping for non-sensors
        let stateColorTemplate = states.length
          ? `{% set entities = [${states}] %}{% set state = entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | list %}`
          : '';
        for (const [stateKey, color] of Object.entries(deviceClassColors.state)) {
          stateColorTemplate += `{% if state | select('eq', '${stateKey}') | list | count > 0 %}${color}{% else %}`;
        }
        stateColorTemplate += "grey" + "{% endif %}".repeat(Object.keys(deviceClassColors.state).length);
        return stateColorTemplate;
      }
    } else {
      // Handle state-based color mapping even without device_class
      if (domainColors?.state) {
        let stateColorTemplate = states.length
          ? `{% set entities = [${states}] %}{% set state = entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | list %}`
          : '';
        for (const [stateKey, color] of Object.entries(domainColors.state)) {
          stateColorTemplate += `{% if state | select('eq', '${stateKey}') | list | count > 0 %}${color}{% else %}`;
        }
        stateColorTemplate += "grey" + "{% endif %}".repeat(Object.keys(domainColors.state).length);
        return stateColorTemplate;
      }

      if (domainColors?.default && typeof domainColors.default === "string") {
        defaultColor = domainColors.default;
      }
    }

    return states.length
      ? `{% set entities = [${states}] %}{% set valid_states = entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | list %}{% if valid_states | count > 0 %}${defaultColor}{% else %}grey{% endif %}`
      : defaultColor;
  }

  /**
   * Get the content for an entity based on domain, device_class, and optionally state.
   *
   * @param {string} domain - The domain of the entity (e.g., "sensor", "binary_sensor").
   * @param {string | undefined} device_class - The device class of the entity (e.g., "temperature", "motion").
   * @param {string} entity_id - The entity ID.
   * @returns {string} - The content string.
   */
  static getContent(domain: string, device_class?: string, entity_ids: string[] = [], as_icon: boolean = false): string {
    const stateStrings = Helper.getStateStrings(entity_ids);

    // Define templates for each domain/device_class combination
    const templates: Record<string, { filter: string, default: string, icon?: string, icon_max?: string }> = {
      "sensor:battery": {
        filter: `valid_states = entities | selectattr('attributes.device_class', 'eq', 'battery') | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | map('float') | list`,
        default: `{{ (valid_states | max if valid_states | length > 0 else 0) | round(0, 'floor') }}%`,
        icon: "mdi:battery",
        icon_max: "mdi:battery-90"
      },
      "sensor:temperature": {
        filter: `valid_states = entities | selectattr('attributes.device_class', 'eq', 'temperature') | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | map('float') | list`,
        default: `{{ (valid_states | max if valid_states | length > 0 else 0) | round(1) }}°`,
        icon: "mdi:thermometer",
        icon_max: "mdi:thermometer-high"
      },
      sensor: {
        filter: `valid_states = entities${device_class ? " | selectattr('attributes.device_class', 'eq', '" + device_class + "')" : ""} | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='state') | map('float') | list`,
        default: `{% set state_class = entities[0].attributes.state_class if entities[0].attributes.state_class is defined else 'measurement' %}
                  {% if state_class in ['total', 'total_increasing'] %}
                    {{ (valid_states | sum) | round(1, 'floor') }}
                  {% else %}
                    {{ (valid_states | sum / valid_states | length) | round(1, 'floor') }}
                  {% endif %}
                  {% if entities[0].attributes.unit_of_measurement is defined %} {{ entities[0].attributes.unit_of_measurement }}{% endif %}`,
        icon: "mdi:numeric-{count}",
        icon_max: "mdi:numeric-9-plus"
      },
      binary_sensor: {
        filter: `active_states = entities${device_class ? " | selectattr('attributes.device_class', 'eq', '" + device_class + "')" : ""} | selectattr('state', 'eq', 'on') | list`,
        default: `{{ active_states | length }}`,
        icon: "mdi:numeric-{count}",
        icon_max: "mdi:numeric-9-plus"
      },
      light: {
        filter: `active_lights = entities | selectattr('state', 'eq', 'on')${device_class ? " | selectattr('attributes.device_class', 'eq', '" + device_class + "')" : ""} | list`,
        default: `{{ active_lights | length }}`,
        icon: "mdi:numeric-{count}",
        icon_max: "mdi:numeric-9-plus"
      },
      cover: {
        filter: `open_covers = entities | selectattr('state', 'eq', 'open')${device_class ? " | selectattr('attributes.device_class', 'eq', '" + device_class + "')" : ""} | list`,
        default: `{{ open_covers | length }}`,
        icon: "mdi:numeric-{count}",
        icon_max: "mdi:numeric-9-plus"
      },
      climate: {
        filter: `active_climates = entities | selectattr('state', 'in', ['heat', 'cool', 'auto'])${device_class ? " | selectattr('attributes.device_class', 'eq', '" + device_class + "')" : ""} | list`,
        default: `{{ active_climates | length }}`,
        icon: "mdi:numeric-{count}",
        icon_max: "mdi:numeric-9-plus"
      },
      switch: {
        filter: `active_switches = entities | selectattr('state', 'eq', 'on')${device_class ? " | selectattr('attributes.device_class', 'eq', '" + device_class + "')" : ""} | list`,
        default: `{{ active_switches | length }}`,
        icon: "mdi:numeric-{count}",
        icon_max: "mdi:numeric-9-plus"
      },
      media_player: {
        filter: `active_players = entities | selectattr('state', 'in', ['playing', 'on'])${device_class ? " | selectattr('attributes.device_class', 'eq', '" + device_class + "')" : ""} | list`,
        default: `{{ active_players | length }}`,
        icon: "mdi:numeric-{count}",
        icon_max: "mdi:numeric-9-plus"
      },
      default: {
        filter: `interesting_states = entities${device_class ? " | selectattr('attributes.device_class', 'eq', '" + device_class + "')" : ""} | selectattr('state', 'in', ['on', 'open', 'playing', 'heat', 'cool', 'auto']) | list`,
        default: `{{ interesting_states | length }}`,
        icon: "mdi:numeric-{count}",
        icon_max: "mdi:numeric-9-plus"
      }
    };

    // Prefer device_class-specific template if available
    const templateKey = device_class ? `${domain}:${device_class}` : domain;
    const template = templates[templateKey] || templates[domain] || templates.default;

    // Compose the filter variable name (e.g., valid_states, active_lights, etc.)
    const filterVar = template.filter.split('=')[0].trim();

    // If as_icon is true, return an mdi icon with the count, and if count > 9, use the "9-plus" icon
    if (as_icon) {
      return `
        {% set entities = [${stateStrings}] %}
        {% set ${template.filter} %}
        {% set count = ${filterVar} | length %}
        {% if count > 0 %}
          {% if count > 9 %}
            ${template.icon_max}
          {% else %}
            ${template.icon?.replace('{count}', '{{ count }}')}
          {% endif %}
        {% else %}
        {% endif %}
      `;
    }

    // Default: return the value as before, but return nothing if count is zero
    return `
      {% set entities = [${stateStrings}] %}
      {% set ${template.filter} %}
      {% if ${filterVar} | length > 0 %}
      ${template.default}
      {% else %}
      {% endif %}
    `;
  }
}

export { Helper };
