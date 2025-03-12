/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./node_modules/deepmerge/dist/cjs.js":
/*!********************************************!*\
  !*** ./node_modules/deepmerge/dist/cjs.js ***!
  \********************************************/
/***/ ((module) => {

"use strict";


var isMergeableObject = function isMergeableObject(value) {
	return isNonNullObject(value)
		&& !isSpecial(value)
};

function isNonNullObject(value) {
	return !!value && typeof value === 'object'
}

function isSpecial(value) {
	var stringValue = Object.prototype.toString.call(value);

	return stringValue === '[object RegExp]'
		|| stringValue === '[object Date]'
		|| isReactElement(value)
}

// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
var canUseSymbol = typeof Symbol === 'function' && Symbol.for;
var REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value) {
	return value.$$typeof === REACT_ELEMENT_TYPE
}

function emptyTarget(val) {
	return Array.isArray(val) ? [] : {}
}

function cloneUnlessOtherwiseSpecified(value, options) {
	return (options.clone !== false && options.isMergeableObject(value))
		? deepmerge(emptyTarget(value), value, options)
		: value
}

function defaultArrayMerge(target, source, options) {
	return target.concat(source).map(function(element) {
		return cloneUnlessOtherwiseSpecified(element, options)
	})
}

function getMergeFunction(key, options) {
	if (!options.customMerge) {
		return deepmerge
	}
	var customMerge = options.customMerge(key);
	return typeof customMerge === 'function' ? customMerge : deepmerge
}

function getEnumerableOwnPropertySymbols(target) {
	return Object.getOwnPropertySymbols
		? Object.getOwnPropertySymbols(target).filter(function(symbol) {
			return Object.propertyIsEnumerable.call(target, symbol)
		})
		: []
}

function getKeys(target) {
	return Object.keys(target).concat(getEnumerableOwnPropertySymbols(target))
}

function propertyIsOnObject(object, property) {
	try {
		return property in object
	} catch(_) {
		return false
	}
}

// Protects from prototype poisoning and unexpected merging up the prototype chain.
function propertyIsUnsafe(target, key) {
	return propertyIsOnObject(target, key) // Properties are safe to merge if they don't exist in the target yet,
		&& !(Object.hasOwnProperty.call(target, key) // unsafe if they exist up the prototype chain,
			&& Object.propertyIsEnumerable.call(target, key)) // and also unsafe if they're nonenumerable.
}

function mergeObject(target, source, options) {
	var destination = {};
	if (options.isMergeableObject(target)) {
		getKeys(target).forEach(function(key) {
			destination[key] = cloneUnlessOtherwiseSpecified(target[key], options);
		});
	}
	getKeys(source).forEach(function(key) {
		if (propertyIsUnsafe(target, key)) {
			return
		}

		if (propertyIsOnObject(target, key) && options.isMergeableObject(source[key])) {
			destination[key] = getMergeFunction(key, options)(target[key], source[key], options);
		} else {
			destination[key] = cloneUnlessOtherwiseSpecified(source[key], options);
		}
	});
	return destination
}

function deepmerge(target, source, options) {
	options = options || {};
	options.arrayMerge = options.arrayMerge || defaultArrayMerge;
	options.isMergeableObject = options.isMergeableObject || isMergeableObject;
	// cloneUnlessOtherwiseSpecified is added to `options` so that custom arrayMerge()
	// implementations can use it. The caller may not replace it.
	options.cloneUnlessOtherwiseSpecified = cloneUnlessOtherwiseSpecified;

	var sourceIsArray = Array.isArray(source);
	var targetIsArray = Array.isArray(target);
	var sourceAndTargetTypesMatch = sourceIsArray === targetIsArray;

	if (!sourceAndTargetTypesMatch) {
		return cloneUnlessOtherwiseSpecified(source, options)
	} else if (sourceIsArray) {
		return options.arrayMerge(target, source, options)
	} else {
		return mergeObject(target, source, options)
	}
}

deepmerge.all = function deepmergeAll(array, options) {
	if (!Array.isArray(array)) {
		throw new Error('first argument should be an array')
	}

	return array.reduce(function(prev, next) {
		return deepmerge(prev, next, options)
	}, {})
};

var deepmerge_1 = deepmerge;

module.exports = deepmerge_1;


/***/ }),

/***/ "./src/types/homeassistant/README.md":
/*!*******************************************!*\
  !*** ./src/types/homeassistant/README.md ***!
  \*******************************************/
/***/ (() => {



/***/ }),

/***/ "./src/types/lovelace-mushroom/README.md":
/*!***********************************************!*\
  !*** ./src/types/lovelace-mushroom/README.md ***!
  \***********************************************/
/***/ (() => {



/***/ }),

/***/ "./src/Helper.ts":
/*!***********************!*\
  !*** ./src/Helper.ts ***!
  \***********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Helper: () => (/* binding */ Helper)
/* harmony export */ });
/* harmony import */ var _configurationDefaults__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./configurationDefaults */ "./src/configurationDefaults.ts");
/* harmony import */ var deepmerge__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! deepmerge */ "./node_modules/deepmerge/dist/cjs.js");
/* harmony import */ var deepmerge__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(deepmerge__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./variables */ "./src/variables.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _a, _Helper_entities, _Helper_domains, _Helper_devices, _Helper_areas, _Helper_floors, _Helper_hassStates, _Helper_hassLocalize, _Helper_initialized, _Helper_strategyOptions, _Helper_magicAreasDevices, _Helper_debug, _Helper_icons, _Helper_linus_dashboard_config, _Helper_getObjectKeysByPropertyValue;




/**
 * Helper Class
 *
 * Contains the objects of Home Assistant's registries and helper methods.
 */
class Helper {
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
    static get strategyOptions() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions);
    }
    /**
     * Custom strategy configuration.
     *
     * @returns {Record<string, MagicAreaRegistryEntry>}
     * @static
     */
    static get magicAreasDevices() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_magicAreasDevices);
    }
    /**
     * Get the entities from Home Assistant's area registry.
     *
     * @returns {Record<string, StrategyArea>}
     * @static
     */
    static get areas() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_areas);
    }
    /**
     * Get the entities from Home Assistant's floor registry.
     *
     * @returns {StrategyArea[]}
     * @static
     */
    static get orderedAreas() {
        return Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_areas)).sort((a, b) => {
            // Check if 'level' is undefined in either object
            if (a.order === undefined)
                return 1; // a should come after b
            if (b.order === undefined)
                return -1; // b should come after a
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
    static get floors() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_floors);
    }
    /**
     * Get the entities from Home Assistant's floor registry.
     *
     * @returns {StrategyFloor[]}
     * @static
     */
    static get orderedFloors() {
        return Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_floors)).sort((a, b) => {
            // Check if 'level' is undefined in either object
            if (a.level === undefined)
                return 1; // a should come after b
            if (b.level === undefined)
                return -1; // b should come after a
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
    static get devices() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_devices);
    }
    /**
     * Get the entities from Home Assistant's entity registry.
     *
     * @returns {Record<string, StrategyEntity>}
     * @static
     */
    static get entities() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_entities);
    }
    /**
     * Get the domains from Home Assistant's entity registry.
     *
     * @returns {Record<string, StrategyEntity[]>}
     * @static
     */
    static get domains() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_domains);
    }
    /**
     * Get the icons from Home Assistant's frontend.
     *
     * @returns {IconResources}
     * @static
     */
    static get icons() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_icons);
    }
    /**
     * Get the linus_dashboard_config from Home Assistant's frontend.
     *
     * @returns {LinusDashboardConfig}
     * @static
     */
    static get linus_dashboard_config() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_linus_dashboard_config);
    }
    /**
     * Get the current debug mode of the mushroom strategy.
     *
     * @returns {boolean}
     * @static
     */
    static get debug() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_debug);
    }
    /**
     * Initialize this module.
     *
     * @param {generic.DashBoardInfo} info Strategy information object.
     * @returns {Promise<void>}
     * @static
     */
    static async initialize(info) {
        // Initialize properties.
        __classPrivateFieldSet(this, _a, info.hass.states, "f", _Helper_hassStates);
        __classPrivateFieldSet(this, _a, info.hass.localize, "f", _Helper_hassLocalize);
        __classPrivateFieldSet(this, _a, deepmerge__WEBPACK_IMPORTED_MODULE_1___default()(_configurationDefaults__WEBPACK_IMPORTED_MODULE_0__.configurationDefaults, info.config?.strategy?.options ?? {}), "f", _Helper_strategyOptions);
        __classPrivateFieldSet(this, _a, __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).debug, "f", _Helper_debug);
        // console.log('this.#', info.hass)
        let homeAssistantRegistries = [];
        try {
            // Query the registries of Home Assistant.
            homeAssistantRegistries = await Promise.all([
                info.hass.callWS({ type: "config/entity_registry/list" }),
                info.hass.callWS({ type: "config/device_registry/list" }),
                info.hass.callWS({ type: "config/area_registry/list" }),
                info.hass.callWS({ type: "config/floor_registry/list" }),
                info.hass.callWS({ type: "frontend/get_icons", category: "entity_component" }),
                info.hass.callWS({ type: "frontend/get_icons", category: "services" }),
                info.hass.callWS({ type: "linus_dashboard/get_config" }),
            ]);
        }
        catch (e) {
            _a.logError("An error occurred while querying Home assistant's registries!", e);
            throw 'Check the console for details';
        }
        const [entities, devices, areas, floors, entity_component_icons, services_icons, linus_dashboard_config] = homeAssistantRegistries;
        __classPrivateFieldSet(this, _a, deepmerge__WEBPACK_IMPORTED_MODULE_1___default()(entity_component_icons.resources, services_icons.resources), "f", _Helper_icons);
        __classPrivateFieldSet(this, _a, linus_dashboard_config, "f", _Helper_linus_dashboard_config);
        // Dictionaries for quick access
        const areasById = Object.fromEntries(areas.map(a => [a.area_id, a]));
        const floorsById = Object.fromEntries(floors.map(f => [f.floor_id, f]));
        const devicesByAreaIdMap = Object.fromEntries(devices.map(device => [device.id, device.area_id]));
        const entitiesByDeviceId = {};
        const entitiesByAreaId = {};
        const devicesByAreaId = {};
        __classPrivateFieldSet(this, _a, entities.reduce((acc, entity) => {
            if (!(entity.entity_id in __classPrivateFieldGet(this, _a, "f", _Helper_hassStates)) || entity.hidden_by)
                return acc;
            if (_a.linus_dashboard_config?.excluded_entities?.includes(entity.entity_id))
                return acc;
            let domain = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getEntityDomain)(entity.entity_id);
            let device_class;
            if (Object.keys(_variables__WEBPACK_IMPORTED_MODULE_2__.DEVICE_CLASSES).includes(domain)) {
                const entityState = _a.getEntityState(entity.entity_id);
                if (entityState?.attributes?.device_class)
                    device_class = entityState.attributes.device_class;
            }
            const domainTag = `${domain}${device_class ? ":" + device_class : ""}`;
            if (!__classPrivateFieldGet(this, _a, "f", _Helper_domains)[domainTag])
                __classPrivateFieldGet(this, _a, "f", _Helper_domains)[domainTag] = [];
            if (_a.linus_dashboard_config?.excluded_domains?.includes(domain))
                return acc;
            const area = entity.area_id ? areasById[entity.area_id] : {};
            const floor = area?.floor_id ? floorsById[area?.floor_id] : {};
            const enrichedEntity = {
                ...entity,
                floor_id: floor.floor_id || null,
            };
            acc[entity.entity_id] = enrichedEntity;
            if (entity.platform !== _variables__WEBPACK_IMPORTED_MODULE_2__.MAGIC_AREAS_DOMAIN) {
                const areaId = entity.area_id ?? devicesByAreaIdMap[entity.device_id ?? ""] ?? _variables__WEBPACK_IMPORTED_MODULE_2__.UNDISCLOSED;
                if (!entitiesByAreaId[areaId])
                    entitiesByAreaId[areaId] = [];
                entitiesByAreaId[areaId].push(enrichedEntity);
            }
            if (entity.device_id) {
                if (!entitiesByDeviceId[entity.device_id])
                    entitiesByDeviceId[entity.device_id] = [];
                entitiesByDeviceId[entity.device_id].push(enrichedEntity);
            }
            if (entity.platform !== _variables__WEBPACK_IMPORTED_MODULE_2__.MAGIC_AREAS_DOMAIN)
                __classPrivateFieldGet(this, _a, "f", _Helper_domains)[domainTag].push(enrichedEntity);
            return acc;
        }, {}), "f", _Helper_entities);
        // Enrich devices
        __classPrivateFieldSet(this, _a, devices.reduce((acc, device) => {
            const entitiesInDevice = entitiesByDeviceId[device.id] || [];
            const area = device.area_id ? areasById[device.area_id] : {};
            const floor = area?.floor_id ? floorsById[area?.floor_id] : {};
            const enrichedDevice = {
                ...device,
                floor_id: floor.floor_id || null,
                entities: entitiesInDevice.map(entity => entity.entity_id),
            };
            acc[device.id] = enrichedDevice;
            if (device.manufacturer !== _variables__WEBPACK_IMPORTED_MODULE_2__.MAGIC_AREAS_NAME) {
                const areaId = device.area_id ?? _variables__WEBPACK_IMPORTED_MODULE_2__.UNDISCLOSED;
                if (!devicesByAreaId[areaId])
                    devicesByAreaId[areaId] = [];
                devicesByAreaId[areaId].push(enrichedDevice);
            }
            if (device.manufacturer === _variables__WEBPACK_IMPORTED_MODULE_2__.MAGIC_AREAS_NAME) {
                __classPrivateFieldGet(this, _a, "f", _Helper_magicAreasDevices)[(0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMagicAreaSlug)(device)] = {
                    ...device,
                    area_name: device.name,
                    entities: entitiesInDevice.reduce((entities, entity) => {
                        entities[entity.translation_key] = entity;
                        return entities;
                    }, {})
                };
            }
            return acc;
        }, {}), "f", _Helper_devices);
        // Create and add the undisclosed area if not hidden in the strategy options.
        if (!__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed?.hidden) {
            __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed = {
                ..._configurationDefaults__WEBPACK_IMPORTED_MODULE_0__.configurationDefaults.areas.undisclosed,
                ...__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed,
            };
            areas.push(__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed);
        }
        // Enrich areas
        __classPrivateFieldSet(this, _a, areas.reduce((acc, area) => {
            const areaEntities = entitiesByAreaId[area.area_id]?.map(entity => entity.entity_id) || [];
            const slug = area.area_id === _variables__WEBPACK_IMPORTED_MODULE_2__.UNDISCLOSED ? area.area_id : (0,_utils__WEBPACK_IMPORTED_MODULE_3__.slugify)(area.name);
            const enrichedArea = {
                ...area,
                floor_id: area?.floor_id || _variables__WEBPACK_IMPORTED_MODULE_2__.UNDISCLOSED,
                slug,
                domains: (0,_utils__WEBPACK_IMPORTED_MODULE_3__.groupEntitiesByDomain)(areaEntities) ?? {},
                devices: devicesByAreaId[area.area_id]?.map(device => device.id) || [],
                magicAreaDevice: Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_devices)).find(device => device.manufacturer === _variables__WEBPACK_IMPORTED_MODULE_2__.MAGIC_AREAS_NAME && device.name === area.name),
                entities: areaEntities,
            };
            acc[slug] = enrichedArea;
            return acc;
        }, {}), "f", _Helper_areas);
        // Create and add the undisclosed floor if not hidden in the strategy options.
        if (!__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed?.hidden) {
            __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).floors.undisclosed = {
                ..._configurationDefaults__WEBPACK_IMPORTED_MODULE_0__.configurationDefaults.floors.undisclosed,
                ...__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).floors.undisclosed,
            };
            floors.push(__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).floors.undisclosed);
        }
        // Enrich floors
        __classPrivateFieldSet(this, _a, floors.reduce((acc, floor) => {
            const areasInFloor = Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_areas)).filter(area => area?.floor_id === floor.floor_id);
            acc[floor.floor_id] = {
                ...floor,
                areas_slug: areasInFloor.map(area => area.slug),
            };
            return acc;
        }, {}), "f", _Helper_floors);
        // Sort custom and default views of the strategy options by order first and then by title.
        __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).views = Object.fromEntries(Object.entries(__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).views).sort(([, a], [, b]) => {
            return (a.order ?? Infinity) - (b.order ?? Infinity) || (a.title ?? "undefined").localeCompare(b.title ?? "undefined");
        }));
        // Sort custom and default domains of the strategy options by order first and then by title.
        __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).domains = Object.fromEntries(Object.entries(__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).domains).sort(([, a], [, b]) => {
            return (a.order ?? Infinity) - (b.order ?? Infinity) || (a.title ?? "undefined").localeCompare(b.title ?? "undefined");
        }));
        __classPrivateFieldSet(this, _a, true, "f", _Helper_initialized);
    }
    /**
     * Get the initialization status of the Helper class.
     *
     * @returns {boolean} True if this module is initialized.
     * @static
     */
    static isInitialized() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_initialized);
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
    static getCountTemplate({ domain, operator, value, area_slug, device_class, allowUnavailable, prefix }) {
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
    static getSensorEntities(entities, device_class) {
        return `[${entities}] | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | selectattr('attributes', 'defined') | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute='state') | map('float') | list`;
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
    static getSensorStateTemplate(device_class, area_slug = "global") {
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        for (const slug of areaSlugs) {
            const magic_entity = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, "sensor", device_class);
            const entities = magic_entity ? [magic_entity.entity_id] : slug === "global" ? (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getGlobalEntitiesExceptUndisclosed)(device_class) : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains?.[device_class];
            const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
            if (newStates)
                states.push(...newStates);
        }
        const isSum = _variables__WEBPACK_IMPORTED_MODULE_2__.SENSOR_STATE_CLASS_TOTAL.includes(device_class) || _variables__WEBPACK_IMPORTED_MODULE_2__.SENSOR_STATE_CLASS_TOTAL_INCREASING.includes(device_class);
        return `
      {% set entities = ${_a.getSensorEntities(states, device_class)} %}
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
    static getAreaEntities(area, domain, device_class) {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const dc = domain === "binary_sensor" || domain === "sensor" ? device_class : undefined;
        const domainTag = `${domain}${dc ? ":" + dc : ""}`;
        if (domainTag) {
            if (domain === "cover") {
                return _variables__WEBPACK_IMPORTED_MODULE_2__.DEVICE_CLASSES.cover.flatMap(d => area.domains?.[`cover:${d}`]?.map(entity_id => __classPrivateFieldGet(this, _a, "f", _Helper_entities)[entity_id]) ?? []);
            }
            else {
                return area.domains?.[domainTag]?.map(entity_id => __classPrivateFieldGet(this, _a, "f", _Helper_entities)[entity_id]) ?? [];
            }
        }
        else {
            return area.entities.map(entity_id => __classPrivateFieldGet(this, _a, "f", _Helper_entities)[entity_id]) ?? [];
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
    static getStateEntities(area, domain) {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        // Get states whose entity-id starts with the given string.
        const stateEntities = __classPrivateFieldGet(this, _a, "f", _Helper_areas)[area.slug].domains?.[domain]?.map(entity_id => __classPrivateFieldGet(this, _a, "f", _Helper_hassStates)[entity_id]);
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
    static sanitizeClassName(className) {
        className = className.charAt(0).toUpperCase() + className.slice(1);
        return className.replace(/([-_][a-z])/g, (group) => group
            .toUpperCase()
            .replace("-", "")
            .replace("_", ""));
    }
    /**
     * Get the ids of the views which aren't set to hidden in the strategy options.
     *
     * @return {string[]} An array of view ids.
     */
    static getExposedViewIds() {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        return __classPrivateFieldGet(this, _a, "m", _Helper_getObjectKeysByPropertyValue).call(this, __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).views, "hidden", false);
    }
    /**
     * Get the ids of the domain ids which aren't set to hidden in the strategy options.
     *
     * @return {string[]} An array of domain ids.
     */
    static getExposedDomainIds() {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        return __classPrivateFieldGet(this, _a, "m", _Helper_getObjectKeysByPropertyValue).call(this, __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).domains, "hidden", false);
    }
    /**
     * Logs an error message to the console.
     *
     * @param {string} userMessage - The error message to display.
     * @param {unknown} [e] - (Optional) The error object or additional information.
     *
     * @return {void}
     */
    static logError(userMessage, e) {
        if (_a.debug) {
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
    static getEntityState(entity_id) {
        return __classPrivateFieldGet(this, _a, "f", _Helper_hassStates)[entity_id];
    }
    /**
     * Get translation.
     *
     * @return {string}
     */
    static localize(translationKey) {
        return __classPrivateFieldGet(this, _a, "f", _Helper_hassLocalize).call(this, translationKey) ?? "translation not found";
    }
    /**
     * Get valid entity.
     *
     * @return {StrategyEntity}
     */
    static getValidEntity(entity) {
        return entity.disabled_by === null && entity.hidden_by === null;
    }
    /**
     * Get valid entity.
     *
     * @return {StrategyEntity}
     */
    static getStates({ domain, device_class, area_slug }) {
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        for (const slug of areaSlugs) {
            if (slug) {
                const magic_entity = device_class ? (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, domain, device_class) : (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, domain);
                const entities = magic_entity ? [magic_entity.entity_id] : area_slug === "global" ? (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getGlobalEntitiesExceptUndisclosed)(device_class ?? domain) : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains?.[device_class ?? domain];
                const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
                if (newStates)
                    states.push(...newStates);
            }
            else {
                // Get the ID of the devices which are linked to the given area.
                for (const area of Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_areas))) {
                    if (area.area_id === _variables__WEBPACK_IMPORTED_MODULE_2__.UNDISCLOSED)
                        continue;
                    const newStates = domain === "all"
                        ? __classPrivateFieldGet(this, _a, "f", _Helper_areas)[area.slug]?.entities.map((entity_id) => `states['${entity_id}']`)
                        : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[area.slug]?.domains?.[device_class ?? domain]?.map((entity_id) => `states['${entity_id}']`);
                    if (newStates)
                        states.push(...newStates);
                }
            }
        }
        return states;
    }
    static getEntityIds({ domain, device_class, area_slug = 'global' }) {
        const entityIds = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        const domainTag = `${domain}${device_class ? ":" + device_class : ""}`;
        for (const slug of areaSlugs) {
            if (slug) {
                const magic_entity = device_class ? (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, domain, device_class) : (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, domain);
                const entities = magic_entity ? [magic_entity.entity_id] : area_slug === "global" ? (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getGlobalEntitiesExceptUndisclosed)(domain, device_class) : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains?.[domainTag];
                if (entities)
                    entityIds.push(...entities);
            }
            else {
                for (const area of Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_areas))) {
                    if (area.area_id === _variables__WEBPACK_IMPORTED_MODULE_2__.UNDISCLOSED)
                        continue;
                    const entities = domain === "all"
                        ? __classPrivateFieldGet(this, _a, "f", _Helper_areas)[area.slug]?.entities
                        : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[area.slug]?.domains?.[domainTag];
                    if (entities)
                        entityIds.push(...entities);
                }
            }
        }
        return entityIds;
    }
    static getStateStrings(entityIds) {
        return entityIds.map((entity_id) => `states['${entity_id}']`);
    }
    static getLastChangedTemplate({ domain, device_class, area_slug }) {
        const states = this.getStateStrings(this.getEntityIds({ domain, device_class, area_slug }));
        return `{% set entities = [${states}] %}{{ relative_time(entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | map(attribute='last_changed') | max) }}`;
    }
    static getLastChangedEntityIdTemplate({ domain, device_class, area_slug }) {
        const states = this.getStateStrings(this.getEntityIds({ domain, device_class, area_slug }));
        return `{% set entities = [${states}] %}{{ entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | sort(attribute='last_changed', reverse=True) | first }}`;
    }
    static getFromDomainState({ domain, device_class, operator, value, ifReturn, elseReturn, area_slug, allowUnavailable }) {
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
    static getBinarySensorColorFromState(device_class, operator, value, ifReturn, elseReturn, area_slug = "global") {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const states = this.getStateStrings(this.getEntityIds({ domain: "binary_sensor", device_class, area_slug }));
        return `
      {% set entities = [${states}] %}
      {{ '${ifReturn}' if entities | selectattr('state', 'ne', 'unknown') | selectattr('state', 'ne', 'unavailable') | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | selectattr('state','${operator}','${value}') | list | count else '${elseReturn}' }}`;
    }
    static getSensorColorFromState(device_class, area_slug = "global") {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const states = this.getStateStrings(this.getEntityIds({ domain: "sensor", device_class, area_slug }));
        if (device_class === "battery") {
            return `
        {% set entities = ${_a.getSensorEntities(states, device_class)} %}
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
        {% set entities = ${_a.getSensorEntities(states, device_class)} %}
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
        {% set entities = ${_a.getSensorEntities(states, device_class)} %}
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
    static getSensorIconFromState(device_class, area_slug = "global") {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const states = this.getStateStrings(this.getEntityIds({ domain: "sensor", device_class, area_slug }));
        if (device_class === "battery") {
            return `
        {% set entities = ${_a.getSensorEntities(states, device_class)} %}
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
        {% set entities = ${_a.getSensorEntities(states, device_class)} %}
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
_a = Helper, _Helper_getObjectKeysByPropertyValue = function _Helper_getObjectKeysByPropertyValue(object, property, value) {
    const keys = [];
    for (const key of Object.keys(object)) {
        if (object[key][property] === value) {
            keys.push(key);
        }
    }
    return keys;
};
/**
 * An array of entities from Home Assistant's entity registry.
 *
 * @type {Record<string, StrategyEntity>}
 * @private
 */
_Helper_entities = { value: void 0 };
/**
 * An array of entities from Home Assistant's entity registry.
 *
 * @type {Record<string, StrategyEntity[]>}
 * @private
 */
_Helper_domains = { value: {} };
/**
 * An array of entities from Home Assistant's device registry.
 *
 * @type {Record<string, StrategyDevice>}
 * @private
 */
_Helper_devices = { value: void 0 };
/**
 * An array of entities from Home Assistant's area registry.
 *
 * @type {Record<string, StrategyArea>}
 * @private
 */
_Helper_areas = { value: {} };
/**
 * An array of entities from Home Assistant's area registry.
 *
 * @type {Record<string, StrategyFloor>}
 * @private
 */
_Helper_floors = { value: {} };
/**
 * An array of state entities from Home Assistant's Hass object.
 *
 * @type {HassEntities}
 * @private
 */
_Helper_hassStates = { value: void 0 };
/**
 * Translation method.
 *
 * @type {any}
 * @private
 */
_Helper_hassLocalize = { value: void 0 };
/**
 * Indicates whether this module is initialized.
 *
 * @type {boolean} True if initialized.
 * @private
 */
_Helper_initialized = { value: false };
/**
 * The Custom strategy configuration.
 *
 * @type {generic.StrategyConfig}
 * @private
 */
_Helper_strategyOptions = { value: void 0 };
/**
 * The magic areas devices.
 *
 * @type {Record<string, MagicAreaRegistryEntry>}
 * @private
 */
_Helper_magicAreasDevices = { value: {} };
/**
 * Set to true for more verbose information in the console.
 *
 * @type {boolean}
 * @private
 */
_Helper_debug = { value: void 0 };
/**
 * Set to true for more verbose information in the console.
 *
 * @type {IconResources}
 * @private
 */
_Helper_icons = { value: void 0 };
/**
 * Set to true for more verbose information in the console.
 *
 * @type {LinusDashboardConfig}
 * @private
 */
_Helper_linus_dashboard_config = { value: void 0 };



/***/ }),

/***/ "./src/cards/AbstractCard.ts":
/*!***********************************!*\
  !*** ./src/cards/AbstractCard.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractCard: () => (/* binding */ AbstractCard)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");

/**
 * Abstract Card Class
 *
 * To create a new card, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class AbstractCard {
    /**
     * Class constructor.
     *
     * @param {generic.RegistryEntry} entity The hass entity to create a card for.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(entity) {
        /**
         * Configuration of the card.
         *
         * @type {EntityCardConfig}
         */
        this.config = {
            type: "custom:mushroom-entity-card",
            icon: "mdi:help-circle",
        };
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
        this.entity = entity;
    }
    /**
     * Get a card.
     *
     * @return {cards.AbstractCardConfig} A card object.
     */
    getCard() {
        return {
            ...this.config,
            type: this.entity && "entity_id" in this.entity ? this.config.type : "custom:mushroom-template-card",
            entity: this.entity && "entity_id" in this.entity ? this.entity.entity_id : undefined,
        };
    }
}



/***/ }),

/***/ "./src/cards/AggregateCard.ts":
/*!************************************!*\
  !*** ./src/cards/AggregateCard.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AggregateCard: () => (/* binding */ AggregateCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class AggregateCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Default configuration of the chip.
     *
     * @type {TemplateChipConfig | undefined}
     *
     */
    getDefaultConfig({ domain, device_class, show_content = true, magic_device_id = "global", area_slug, tap_action }) {
        let icon = device_class ? device_class !== "motion" ? _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.icons[domain][device_class]?.default : _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.icons[domain][device_class]?.state?.on : device_class !== "motion" ? _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.icons[domain]["_"]?.default : _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.icons[domain]["_"]?.state?.on;
        let icon_color = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getFromDomainState({ domain, area_slug }) ?? "grey";
        let content = "";
        const device = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.magicAreasDevices[magic_device_id];
        const magicEntity = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getMAEntity)(magic_device_id, domain, device_class);
        if (domain === "binary_sensor" && device_class) {
            icon_color = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getBinarySensorColorFromState(device_class, "eq", "on", "red", "grey", area_slug);
            content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getCountTemplate({ domain, device_class, operator: "eq", value: "on", area_slug, prefix: "mdi:numeric-" }) : "";
        }
        if (domain === "sensor" && device_class) {
            content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getSensorStateTemplate(device_class, area_slug) : "";
            icon_color = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getSensorColorFromState(device_class, area_slug) ?? "white";
            icon = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getSensorIconFromState(device_class, area_slug) ?? icon;
            if (device_class === "illuminance") {
                if (magicEntity) {
                    icon_color = `{{ 'blue' if 'dark' in state_attr('${device?.entities.area_state?.entity_id}', 'states') else 'amber' }}`;
                }
            }
        }
        if (domain === "cover") {
            if (magicEntity) {
                icon_color = `{{ 'red' if is_state('${magicEntity.entity_id}', 'open') else 'grey' }}`;
            }
            content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getCountTemplate({ domain, device_class, operator: "eq", value: "open", area_slug, prefix: "mdi:numeric-" }) : "";
        }
        if (domain === "light") {
            content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getCountTemplate({ domain, device_class, operator: "eq", value: "on", area_slug, prefix: "mdi:numeric-" }) : "";
        }
        if (device_class === "health") {
            icon_color = `{{ 'red' if is_state(entity, 'on') else 'green' }}`;
        }
        const secondary = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getLastChangedTemplate({ domain, device_class, area_slug });
        return {
            type: "custom:mushroom-template-card",
            entity: magicEntity?.entity_id,
            entity_id: _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getEntityIds({ domain, device_class, area_slug }),
            primary: _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.localize((0,_utils__WEBPACK_IMPORTED_MODULE_2__.getDomainTranslationKey)(domain, device_class)),
            secondary,
            icon_color,
            icon,
            badge_icon: content,
            badge_color: "black",
            tap_action: tap_action ?? { action: "none" }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {cards.AggregateCardOptions} options The chip options.
     */
    constructor(options) {
        super(options.entity);
        const defaultConfig = this.getDefaultConfig(options);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/cards/AggregateSection.ts":
/*!***************************************!*\
  !*** ./src/cards/AggregateSection.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AggregateSection: () => (/* binding */ AggregateSection)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AggregateSection_domain, _AggregateSection_defaultConfig;



/**
 * Aggregate Card class.
 *
 * Used for creating a Title Card with controls.
 *
 * @class
 */
class AggregateSection {
    /**
     * Class constructor.
     *
     * @param {string} domain The domain to control the entities of.
     * @param {AggregateSectionConfig} options Aggregate Card options.
     */
    constructor(domain, options = {}) {
        /**
         * @type {string} The domain to control the entities of.
         * @private
         */
        _AggregateSection_domain.set(this, void 0);
        /**
         * Default configuration of the card.
         *
         * @type {AggregateSectionConfig}
         * @private
         */
        _AggregateSection_defaultConfig.set(this, {
            device_name: "Global",
        });
        __classPrivateFieldSet(this, _AggregateSection_domain, domain, "f");
        __classPrivateFieldSet(this, _AggregateSection_defaultConfig, {
            ...__classPrivateFieldGet(this, _AggregateSection_defaultConfig, "f"),
            ...options,
        }, "f");
    }
    /**
     * Create a Aggregate card.
     *
     * @return {StackCardConfig} A Aggregate card.
     */
    createCard() {
        const domains = typeof (__classPrivateFieldGet(this, _AggregateSection_domain, "f")) === "string" ? [__classPrivateFieldGet(this, _AggregateSection_domain, "f")] : __classPrivateFieldGet(this, _AggregateSection_domain, "f");
        const deviceClasses = __classPrivateFieldGet(this, _AggregateSection_defaultConfig, "f").device_class && typeof (__classPrivateFieldGet(this, _AggregateSection_defaultConfig, "f").device_class) === "string" ? [__classPrivateFieldGet(this, _AggregateSection_defaultConfig, "f").device_class] : __classPrivateFieldGet(this, _AggregateSection_defaultConfig, "f").device_class;
        const cards = [];
        const globalEntities = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getAggregateEntity)(_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.magicAreasDevices["global"], domains, deviceClasses)[0] ?? false;
        if (globalEntities) {
            cards.push({
                type: "tile",
                entity: globalEntities.entity_id,
                state_content: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getStateContent)(globalEntities.entity_id),
                color: globalEntities.entity_id.startsWith('binary_sensor.') ? 'red' : false,
                icon_tap_action: __classPrivateFieldGet(this, _AggregateSection_domain, "f") === "light" ? "more-info" : "toggle",
            });
        }
        for (const floor of _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.orderedFloors) {
            if (floor.areas_slug.length === 0)
                continue;
            let floorCards = [];
            floorCards.push({
                type: "custom:mushroom-title-card",
                subtitle: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getFloorName)(floor),
                card_mod: {
                    style: `
            ha-card.header {
              padding-top: 8px;
            }
          `,
                }
            });
            let areaCards = [];
            for (const [i, area] of floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.areas[area_slug]).entries()) {
                if (_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.areas[area?.slug]?.hidden)
                    continue;
                if (area.slug !== _variables__WEBPACK_IMPORTED_MODULE_2__.UNDISCLOSED) {
                    const areaEntities = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getAggregateEntity)(_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.magicAreasDevices[area.slug], domains, deviceClasses).map((e) => e.entity_id).filter(Boolean);
                    for (const areaEntity of areaEntities) {
                        areaCards.push({
                            type: "tile",
                            entity: areaEntity,
                            primary: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getAreaName)(area),
                            state_content: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getStateContent)(areaEntity),
                            color: areaEntity.startsWith('binary_sensor.') ? 'red' : false,
                        });
                    }
                }
                // Horizontally group every two area cards if all cards are created.
                if (i === floor.areas_slug.length - 1) {
                    for (let i = 0; i < areaCards.length; i += 2) {
                        floorCards.push({
                            type: "horizontal-stack",
                            cards: areaCards.slice(i, i + 2),
                        });
                    }
                }
            }
            if (areaCards.length === 0)
                floorCards.pop();
            if (floorCards.length > 1)
                cards.push(...floorCards);
        }
        return {
            type: "vertical-stack",
            cards: cards,
        };
    }
}
_AggregateSection_domain = new WeakMap(), _AggregateSection_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/AlarmCard.ts":
/*!********************************!*\
  !*** ./src/cards/AlarmCard.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AlarmCard: () => (/* binding */ AlarmCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AlarmCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Alarm Card Class
 *
 * Used to create a card for controlling an entity of the fan domain.
 *
 * @class
 * @extends AbstractCard
 */
class AlarmCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {TileCardConfig}
         * @private
         */
        _AlarmCard_defaultConfig.set(this, {
            type: "tile",
            entity: undefined,
            icon: undefined,
            features: [
                {
                    type: "alarm-modes",
                    modes: ["armed_home", "armed_away", "armed_night", "armed_vacation", "armed_custom_bypass", "disarmed"]
                }
            ]
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _AlarmCard_defaultConfig, "f"));
    }
}
_AlarmCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/BinarySensorCard.ts":
/*!***************************************!*\
  !*** ./src/cards/BinarySensorCard.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   BinarySensorCard: () => (/* binding */ BinarySensorCard)
/* harmony export */ });
/* harmony import */ var _SensorCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SensorCard */ "./src/cards/SensorCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _BinarySensorCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Sensor Card Class
 *
 * Used to create a card for controlling an entity of the binary_sensor domain.
 *
 * @class
 * @extends SensorCard
 */
class BinarySensorCard extends _SensorCard__WEBPACK_IMPORTED_MODULE_0__.SensorCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.EntityCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(options, entity);
        /**
         * Default configuration of the card.
         *
         * @type {EntityCardConfig}
         * @private
         */
        _BinarySensorCard_defaultConfig.set(this, {
            type: "tile",
            icon: undefined,
            state_content: "last_changed",
            vertical: false,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _BinarySensorCard_defaultConfig, "f"), options);
    }
}
_BinarySensorCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/CameraCard.ts":
/*!*********************************!*\
  !*** ./src/cards/CameraCard.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CameraCard: () => (/* binding */ CameraCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CameraCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Camera Card Class
 *
 * Used to create a card for controlling an entity of the camera domain.
 *
 * @class
 * @extends AbstractCard
 */
class CameraCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.PictureEntityCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {PictureEntityCardConfig}
         * @private
         */
        _CameraCard_defaultConfig.set(this, {
            entity: "",
            type: "picture-entity",
            show_name: false,
            show_state: false,
            // camera_view: "live",
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _CameraCard_defaultConfig, "f"), options);
    }
}
_CameraCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/ClimateCard.ts":
/*!**********************************!*\
  !*** ./src/cards/ClimateCard.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClimateCard: () => (/* binding */ ClimateCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ClimateCard_defaultConfig;


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Card Class
 *
 * Used to create a card for controlling an entity of the climate domain.
 *
 * @class
 * @extends AbstractCard
 */
class ClimateCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.ClimateCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {ClimateCardConfig}
         * @private
         */
        _ClimateCard_defaultConfig.set(this, {
            type: "tile",
            icon: undefined,
            show_current_as_primary: true,
            vertical: false,
            features: [],
            layout_options: {
                grid_columns: 2,
                grid_rows: 1,
            },
        });
        const { preset_modes, hvac_modes, fan_modes } = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getEntityState(entity.entity_id)?.attributes ?? {};
        if (preset_modes) {
            __classPrivateFieldGet(this, _ClimateCard_defaultConfig, "f").features.push({
                type: "climate-preset-modes",
                preset_modes: preset_modes
            });
        }
        else if (hvac_modes) {
            __classPrivateFieldGet(this, _ClimateCard_defaultConfig, "f").features.push({
                type: "climate-hvac-modes",
                hvac_modes: hvac_modes
            });
        }
        else if (fan_modes) {
            __classPrivateFieldGet(this, _ClimateCard_defaultConfig, "f").features.push({
                type: "climate-fan-modes",
                fan_modes: fan_modes
            });
        }
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _ClimateCard_defaultConfig, "f"), options);
    }
}
_ClimateCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/ControllerCard.ts":
/*!*************************************!*\
  !*** ./src/cards/ControllerCard.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ControllerCard: () => (/* binding */ ControllerCard)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ControllerCard_domain, _ControllerCard_magic_device_id, _ControllerCard_defaultConfig;


/**
 * Controller Card class.
 *
 * Used for creating a Title Card with controls.
 *
 * @class
 */
class ControllerCard {
    /**
     * Class constructor.
     *
     * @param {cards.ControllerCardOptions} options Controller Card options.
     */
    constructor(options = {}, domain, magic_device_id = "global") {
        /**
         * @type {string} The target to control the entities of.
         * @private
         */
        _ControllerCard_domain.set(this, void 0);
        /**
         * @type {string} The target to control the entities of.
         * @private
         */
        _ControllerCard_magic_device_id.set(this, void 0);
        /**
         * Default configuration of the card.
         *
         * @type {cards.ControllerCardConfig}
         * @private
         */
        _ControllerCard_defaultConfig.set(this, {
            type: "custom:mushroom-title-card",
            showControls: true,
            iconOn: "mdi:power-on",
            iconOff: "mdi:power-off",
            onService: "none",
            offService: "none",
        });
        __classPrivateFieldSet(this, _ControllerCard_domain, domain, "f");
        __classPrivateFieldSet(this, _ControllerCard_magic_device_id, magic_device_id, "f");
        __classPrivateFieldSet(this, _ControllerCard_defaultConfig, {
            ...__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f"),
            ...options,
        }, "f");
    }
    /**
     * Create a Controller card.
     *
     * @return {LovelaceCardConfig[]} A Controller card.
     */
    createCard() {
        const cards = [];
        if (__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").title) {
            cards.push({
                type: "heading",
                heading: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").title ?? "No title",
                icon: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").titleIcon,
                heading_style: "title",
                badges: [],
                layout_options: {
                    grid_columns: "full",
                    grid_rows: 1
                },
                ...(__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").titleNavigate && {
                    tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.navigateTo)(__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").titleNavigate)
                })
            });
        }
        if (__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").subtitle) {
            cards.push({
                type: "heading",
                heading_style: "subtitle",
                badges: [],
                heading: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").subtitle,
                icon: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").subtitleIcon,
                layout_options: {
                    grid_columns: "full",
                    grid_rows: 1
                },
                ...(__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").subtitleNavigate && {
                    tap_action: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").tap_action ?? (0,_utils__WEBPACK_IMPORTED_MODULE_1__.navigateTo)(__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").subtitleNavigate),
                })
            });
        }
        if (__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").showControls || __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").extraControls) {
            const magic_device = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[__classPrivateFieldGet(this, _ControllerCard_magic_device_id, "f") ?? ""];
            const badges = [];
            if (__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").showControls) {
                const chipModule = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _ControllerCard_domain, "f")]?.controlChip;
                const chipOptions = {
                    show_content: true,
                    magic_device_id: __classPrivateFieldGet(this, _ControllerCard_magic_device_id, "f"),
                    ...__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").controlChipOptions,
                };
                const chip = typeof chipModule === 'function' && new chipModule(chipOptions, magic_device).getChip();
                badges.push({
                    type: "custom:mushroom-chips-card",
                    chips: [chip],
                    alignment: "end",
                    card_mod: __classPrivateFieldGet(this, _ControllerCard_domain, "f") === "sensor" && {
                        style: `
            ha-card {
              min-width: 100px;
              }
              `,
                    }
                });
            }
            if (magic_device && __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").extraControls) {
                badges.push(...__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").extraControls(magic_device)?.map((chip) => {
                    return {
                        type: "custom:mushroom-chips-card",
                        chips: [chip]
                    };
                }));
            }
            if (cards[0]?.badges && badges.length) {
                cards[0].badges = badges;
            }
        }
        return cards;
    }
}
_ControllerCard_domain = new WeakMap(), _ControllerCard_magic_device_id = new WeakMap(), _ControllerCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/CoverCard.ts":
/*!********************************!*\
  !*** ./src/cards/CoverCard.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CoverCard: () => (/* binding */ CoverCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _AggregateCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AggregateCard */ "./src/cards/AggregateCard.ts");
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CoverCard_defaultConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover Card Class
 *
 * Used to create a card for controlling an entity of the cover domain.
 *
 * @class
 * @extends AbstractCard
 */
class CoverCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.CoverCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {CoverCardConfig}
         * @private
         */
        _CoverCard_defaultConfig.set(this, {
            type: "tile",
            icon: undefined,
            features: [
                {
                    type: "cover-open-close"
                }
            ]
        });
        if (!entity)
            __classPrivateFieldSet(this, _CoverCard_defaultConfig, new _AggregateCard__WEBPACK_IMPORTED_MODULE_2__.AggregateCard({ domain: "cover", device_class: options.device_class, tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.navigateTo)("cover") }).config, "f");
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _CoverCard_defaultConfig, "f"), options);
    }
}
_CoverCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/FanCard.ts":
/*!******************************!*\
  !*** ./src/cards/FanCard.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FanCard: () => (/* binding */ FanCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FanCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Fan Card Class
 *
 * Used to create a card for controlling an entity of the fan domain.
 *
 * @class
 * @extends AbstractCard
 */
class FanCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.FanCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {FanCardConfig}
         * @private
         */
        _FanCard_defaultConfig.set(this, {
            type: "tile",
            icon: undefined,
            features: [
                {
                    type: "fan-speed"
                }
            ]
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _FanCard_defaultConfig, "f"), options);
    }
}
_FanCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/GroupedCard.ts":
/*!**********************************!*\
  !*** ./src/cards/GroupedCard.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GroupedCard: () => (/* binding */ GroupedCard)
/* harmony export */ });
/* harmony import */ var _SwipeCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SwipeCard */ "./src/cards/SwipeCard.ts");

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Grouped Card Class
 *
 * Used to create a card for controlling an entity of the light domain.
 *
 * @class
 * @extends AbstractCard
 */
class GroupedCard {
    /**
     * Class constructor.
     *
     * @param {AbstractCard[]} cards The hass entity to create a card for.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(cards) {
        /**
         * Configuration of the card.
         *
         * @type {AbstractCard}
         */
        this.config = {
            cards: [],
        };
        this.config.cards = cards;
    }
    /**
     * Get a card.
     *
     * @return {AbstractCard} A card object.
     */
    getCard() {
        // Group entity cards into pairs and create vertical stacks
        const groupedEntityCards = [];
        for (let i = 0; i < this.config.cards.length; i += 2) {
            groupedEntityCards.push({
                type: "vertical-stack",
                cards: this.config.cards.slice(i, i + 2),
            });
        }
        // If there are more than 2 groups, use a GroupedCard, otherwise use a horizontal stack
        const groupedCards = groupedEntityCards.length > 2
            ? new _SwipeCard__WEBPACK_IMPORTED_MODULE_0__.SwipeCard(groupedEntityCards).getCard()
            : {
                type: "horizontal-stack",
                cards: groupedEntityCards,
            };
        return groupedCards;
    }
}



/***/ }),

/***/ "./src/cards/HomeAreaCard.ts":
/*!***********************************!*\
  !*** ./src/cards/HomeAreaCard.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HomeAreaCard: () => (/* binding */ HomeAreaCard)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _chips_ControlChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../chips/ControlChip */ "./src/chips/ControlChip.ts");
/* harmony import */ var _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../chips/AggregateChip */ "./src/chips/AggregateChip.ts");
/* harmony import */ var _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../chips/AreaStateChip */ "./src/chips/AreaStateChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _chips_ClimateChip__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../chips/ClimateChip */ "./src/chips/ClimateChip.ts");
/* harmony import */ var _chips_LightChip__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../chips/LightChip */ "./src/chips/LightChip.ts");
/* harmony import */ var _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../chips/ConditionalChip */ "./src/chips/ConditionalChip.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _chips_FanChip__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../chips/FanChip */ "./src/chips/FanChip.ts");










// Utility function to generate badge icon and color
const getBadgeIcon = (entityId) => `
  {% set bl = states('${entityId}') %}
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
  {% else %} mdi:battery-unknown
  {% endif %}
`;
const getBadgeColor = (entityId) => `
  {% set bl = states('${entityId}') %}
  {% if bl == 'unknown' or bl == 'unavailable' %} disabled
  {% elif bl | int() < 10 %} red
  {% elif bl | int() < 20 %} red
  {% elif bl | int() < 30 %} red
  {% elif bl | int() < 40 %} orange
  {% elif bl | int() < 50 %} orange
  {% elif bl | int() < 60 %} green
  {% elif bl | int() < 70 %} green
  {% elif bl | int() < 80 %} green
  {% elif bl | int() < 90 %} green
  {% elif bl | int() == 100 %} green
  {% else %} disabled
  {% endif %}
`;
class HomeAreaCard {
    constructor(options) {
        /**
         * Configuration of the card.
         *
         * @type {EntityCardConfig}
         */
        this.config = {
            type: "custom:mushroom-entity-card",
            icon: "mdi:help-circle",
        };
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
        this.magicDevice = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[options.area_slug];
        this.area = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[options.area_slug];
        this.config = { ...this.config, ...options };
    }
    getDefaultConfig(area) {
        const { all_lights } = this.magicDevice?.entities || {};
        const icon = area.icon || "mdi:home-outline";
        const cards = [
            this.getMainCard(),
        ];
        cards.push(this.getChipsCard());
        if (all_lights) {
            cards.push(this.getLightCard(all_lights));
        }
        return {
            type: "custom:stack-in-card",
            cards: cards
        };
    }
    getUndisclosedAreaConfig(area) {
        return {
            type: "custom:mushroom-template-card",
            primary: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getAreaName)(area),
            icon: "mdi:devices",
            icon_color: "grey",
            fill_container: true,
            layout: "horizontal",
            tap_action: { action: "navigate", navigation_path: area.slug },
            card_mod: { style: this.getCardModStyle() }
        };
    }
    getMainCard() {
        const { area_state, aggregate_temperature, aggregate_battery } = this.magicDevice?.entities || {};
        const icon = this.area.icon || "mdi:home-outline";
        return {
            type: "custom:mushroom-template-card",
            primary: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getAreaName)(this.area),
            secondary: aggregate_temperature && this.getTemperatureTemplate(aggregate_temperature),
            icon: icon,
            icon_color: this.getIconColorTemplate(area_state),
            fill_container: true,
            layout: "horizontal",
            badge_icon: getBadgeIcon(aggregate_battery?.entity_id),
            badge_color: getBadgeColor(aggregate_battery?.entity_id),
            tap_action: { action: "navigate", navigation_path: this.area.slug },
            card_mod: { style: this.getCardModStyle() }
        };
    }
    getChipsCard() {
        const { light_control, aggregate_health, aggregate_window, aggregate_door, aggregate_cover } = this.magicDevice?.entities || {};
        const { motion, occupancy, presence, window, climate, fan, door, cover, health, light } = this.area.domains ?? {};
        const magicLight = (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getMAEntity)(this.magicDevice?.id, "light");
        const magicClimate = (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getMAEntity)(this.magicDevice?.id, "climate");
        const magicFan = (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getMAEntity)(this.magicDevice?.id, "fan");
        return {
            type: "custom:mushroom-chips-card",
            alignment: "end",
            chips: [
                (motion || occupancy || presence) && new _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_3__.AreaStateChip({ area: this.area }).getChip(),
                health && new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__.ConditionalChip(aggregate_health ? [{ entity: aggregate_health?.entity_id, state: "on" }] : health.map(entity => ({ entity, state: "on" })), new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_2__.AggregateChip({ device_class: "health" }).getChip()).getChip(),
                window?.length && new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__.ConditionalChip(aggregate_window ? [{ entity: aggregate_window?.entity_id, state: "on" }] : window.map(entity => ({ entity, state: "on" })), new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_2__.AggregateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "window", show_content: false }).getChip()).getChip(),
                door && new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__.ConditionalChip(aggregate_door ? [{ entity: aggregate_door?.entity_id, state: "on" }] : door.map(entity => ({ entity, state: "on" })), new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_2__.AggregateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "door", show_content: false }).getChip()).getChip(),
                cover && new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__.ConditionalChip(aggregate_cover ? [{ entity: aggregate_cover?.entity_id, state: "on" }] : cover.map(entity => ({ entity, state: "on" })), new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_2__.AggregateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "cover", show_content: false }).getChip()).getChip(),
                climate && new _chips_ClimateChip__WEBPACK_IMPORTED_MODULE_5__.ClimateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug }, magicClimate).getChip(),
                fan && new _chips_FanChip__WEBPACK_IMPORTED_MODULE_9__.FanChip({ magic_device_id: this.area.slug, area_slug: this.area.slug }, magicFan).getChip(),
                light && new _chips_LightChip__WEBPACK_IMPORTED_MODULE_6__.LightChip({ area_slug: this.area.slug, magic_device_id: this.area.slug, tap_action: { action: "toggle" } }, magicLight).getChip(),
                new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__.ConditionalChip([{ entity: this.magicDevice?.entities?.all_lights?.entity_id, state_not: _variables__WEBPACK_IMPORTED_MODULE_8__.UNAVAILABLE }], new _chips_ControlChip__WEBPACK_IMPORTED_MODULE_1__.ControlChip("light", light_control?.entity_id).getChip()).getChip()
            ].filter(Boolean),
            card_mod: { style: this.getChipsCardModStyle() }
        };
    }
    getLightCard(all_lights) {
        return {
            type: "tile",
            features: [{ type: "light-brightness" }],
            hide_state: true,
            entity: all_lights.entity_id,
            card_mod: { style: this.getLightCardModStyle() }
        };
    }
    getTemperatureTemplate(aggregate_temperature) {
        if (!aggregate_temperature)
            return _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getSensorStateTemplate("temperature");
        return `
      {% set t = states('${aggregate_temperature?.entity_id}') %}
      {% if t != 'unknown' and t != 'unavailable' %}
        {{ t | float | round(1) }}{{ state_attr('${aggregate_temperature?.entity_id}', 'unit_of_measurement')}}
      {% endif %}
    `;
    }
    getIconColorTemplate(area_state) {
        const condition = area_state?.entity_id ? `"dark" in state_attr('${area_state?.entity_id}', 'states')` : `not is_state("sun.sun", "above_horizon")`;
        return `
      {{ "indigo" if ${condition} else "amber" }}
    `;
    }
    getCardModStyle() {
        return `
      :host {
        background: #1f1f1f;
        height: 66px;
      }
      mushroom-badge-icon {
        left: 24px;
        top: 0px;
      }
      ha-card {
        box-shadow: none!important;
        border: none;
      }
      ha-state-icon {
        --icon-symbol-size: 40px;
      }

    `;
    }
    getChipsCardModStyle() {
        return `
      ha-card {
        --chip-box-shadow: none;
        --chip-spacing: 0px;
        width: -webkit-fill-available;
        margin-top: -12px;
      }
    `;
    }
    getLightCardModStyle() {
        return `
      ha-card {
        box-shadow: none!important;
        border: none;
        margin-top: -12px;
      }
      ha-tile-icon {
        display: none;
      }
      ha-tile-info {
        display: none;
      }
    `;
    }
    /**
     * Get a card.
     *
     * @return {cards.AbstractCardConfig} A card object.
     */
    getCard() {
        const defaultConfig = this.area.slug === _variables__WEBPACK_IMPORTED_MODULE_8__.UNDISCLOSED ? this.getUndisclosedAreaConfig(this.area) : this.getDefaultConfig(this.area);
        const magicAreasEntity = (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getMAEntity)(this.magicDevice?.id, "area_state");
        return {
            ...defaultConfig,
            entity: magicAreasEntity ? magicAreasEntity.entity_id : undefined,
        };
    }
}



/***/ }),

/***/ "./src/cards/ImageAreaCard.ts":
/*!************************************!*\
  !*** ./src/cards/ImageAreaCard.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ImageAreaCard: () => (/* binding */ ImageAreaCard)
/* harmony export */ });
/**
 * Scene Card Class
 *
 * Used to create a card for an entity of the Scene domain.
 *
 * @class
 */
class ImageAreaCard {
    /**
     * Class constructor.
     *
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(area_slug) {
        /**
         * Configuration of the card.
         *
         * @type {EntityCardConfig}
         */
        this.config = {
            type: "area",
            area: "",
            show_camera: true,
            alert_classes: [],
            sensor_classes: [],
            card_mod: {
                style: `
        .sensors {
          display: none;
        }
        .buttons {
          display: none;
        }
      `
            }
        };
        this.config.area = area_slug;
    }
    /**
     * Get a card.
     *
     * @return {cards.AbstractCardConfig} A card object.
     */
    getCard() {
        return this.config;
    }
}



/***/ }),

/***/ "./src/cards/LightCard.ts":
/*!********************************!*\
  !*** ./src/cards/LightCard.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LightCard: () => (/* binding */ LightCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
/* harmony import */ var _AggregateCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AggregateCard */ "./src/cards/AggregateCard.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LightCard_defaultConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Card Class
 *
 * Used to create a card for controlling an entity of the light domain.
 *
 * @class
 * @extends AbstractCard
 */
class LightCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.LightCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {LightCardConfig}
         * @private
         */
        _LightCard_defaultConfig.set(this, {
            type: "tile",
            icon: undefined,
            vertical: false,
        });
        if (!entity)
            __classPrivateFieldSet(this, _LightCard_defaultConfig, new _AggregateCard__WEBPACK_IMPORTED_MODULE_1__.AggregateCard({ domain: "light", tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_2__.navigateTo)("light") }).config, "f");
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _LightCard_defaultConfig, "f"), options);
    }
}
_LightCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/LockCard.ts":
/*!*******************************!*\
  !*** ./src/cards/LockCard.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LockCard: () => (/* binding */ LockCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LockCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Lock Card Class
 *
 * Used to create a card for controlling an entity of the lock domain.
 *
 * @class
 * @extends AbstractCard
 */
class LockCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.LockCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {LockCardConfig}
         * @private
         */
        _LockCard_defaultConfig.set(this, {
            type: "custom:mushroom-lock-card",
            icon: undefined,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _LockCard_defaultConfig, "f"), options);
    }
}
_LockCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/MediaPlayerCard.ts":
/*!**************************************!*\
  !*** ./src/cards/MediaPlayerCard.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MediaPlayerCard: () => (/* binding */ MediaPlayerCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MediaPlayerCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Mediaplayer Card Class
 *
 * Used to create a card for controlling an entity of the media_player domain.
 *
 * @class
 * @extends AbstractCard
 */
class MediaPlayerCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.MediaPlayerCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {MediaPlayerCardConfig}
         * @private
         */
        _MediaPlayerCard_defaultConfig.set(this, {
            type: "custom:mushroom-media-player-card",
            use_media_info: true,
            media_controls: [
                "on_off",
                "play_pause_stop",
            ],
            show_volume_level: true,
            volume_controls: [
                "volume_mute",
                "volume_set",
                "volume_buttons",
            ],
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _MediaPlayerCard_defaultConfig, "f"), options);
    }
}
_MediaPlayerCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/MiscellaneousCard.ts":
/*!****************************************!*\
  !*** ./src/cards/MiscellaneousCard.ts ***!
  \****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MiscellaneousCard: () => (/* binding */ MiscellaneousCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MiscellaneousCard_defaultConfig;

/**
 * Miscellaneous Card Class
 *
 * Used to create a card an entity of any domain.
 *
 * @class
 * @extends AbstractCard
 */
class MiscellaneousCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.EntityCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options = {}, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {EntityCardConfig}
         * @private
         */
        _MiscellaneousCard_defaultConfig.set(this, {
            type: "tile",
            icon: undefined,
            vertical: false,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _MiscellaneousCard_defaultConfig, "f"), options);
    }
}
_MiscellaneousCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/NumberCard.ts":
/*!*********************************!*\
  !*** ./src/cards/NumberCard.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   NumberCard: () => (/* binding */ NumberCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _NumberCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported
/**
 * Number Card Class
 *
 * Used to create a card for controlling an entity of the number domain.
 *
 * @class
 * @extends AbstractCard
 */
class NumberCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.NumberCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {NumberCardConfig}
         * @private
         */
        _NumberCard_defaultConfig.set(this, {
            type: "custom:mushroom-number-card",
            icon: undefined,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _NumberCard_defaultConfig, "f"), options);
    }
}
_NumberCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/PersonCard.ts":
/*!*********************************!*\
  !*** ./src/cards/PersonCard.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   PersonCard: () => (/* binding */ PersonCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _PersonCard_defaultConfig;

/**
 * Person Card Class
 *
 * Used to create a card for an entity of the Person domain.
 *
 * @class
 * @extends AbstractCard
 */
class PersonCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.PersonCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {PersonCardConfig}
         * @private
         */
        _PersonCard_defaultConfig.set(this, {
            type: "custom:mushroom-person-card",
            icon_type: "entity-picture",
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _PersonCard_defaultConfig, "f"), options);
    }
}
_PersonCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/SceneCard.ts":
/*!********************************!*\
  !*** ./src/cards/SceneCard.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SceneCard: () => (/* binding */ SceneCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SceneCard_defaultConfig;

/**
 * Scene Card Class
 *
 * Used to create a card for an entity of the Scene domain.
 *
 * @class
 * @extends AbstractCard
 */
class SceneCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.SceneCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {SceneCardConfig}
         * @private
         */
        _SceneCard_defaultConfig.set(this, {
            type: "tile",
            icon: undefined,
            vertical: false,
            icon_type: "entity-picture",
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SceneCard_defaultConfig, "f"), options);
    }
}
_SceneCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/SensorCard.ts":
/*!*********************************!*\
  !*** ./src/cards/SensorCard.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SensorCard: () => (/* binding */ SensorCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SensorCard_defaultConfig;

/**
 * Sensor Card Class
 *
 * Used to create a card for controlling an entity of the sensor domain.
 *
 * @class
 * @extends AbstractCard
 */
class SensorCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.EntityCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {EntityCardConfig}
         * @private
         */
        _SensorCard_defaultConfig.set(this, {
            type: "custom:mushroom-entity-card",
            icon: "mdi:information",
            animate: true,
            line_color: "green",
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SensorCard_defaultConfig, "f"), options);
    }
}
_SensorCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/SwipeCard.ts":
/*!********************************!*\
  !*** ./src/cards/SwipeCard.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SwipeCard: () => (/* binding */ SwipeCard)
/* harmony export */ });
// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Swipe Card Class
 *
 * Used to create a card for controlling an entity of the light domain.
 *
 * @class
 * @extends AbstractCard
 */
class SwipeCard {
    /**
     * Class constructor.
     *
     * @param {AbstractCard[]} cards The hass entity to create a card for.
     * @param {SwiperOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(cards, options) {
        /**
         * Configuration of the card.
         *
         * @type {SwipeCardConfig}
         */
        this.config = {
            type: "custom:swipe-card",
            start_card: 1,
            parameters: {
                centeredSlides: false,
                followFinger: true,
                spaceBetween: 16,
                grabCursor: true,
            },
            cards: [],
        };
        this.config.cards = cards;
        const multipleSlicesPerView = 2.2;
        const slidesPerView = cards.length > 2 ? multipleSlicesPerView : cards.length ?? 1;
        this.config.parameters = { ...this.config.parameters, slidesPerView, ...options };
    }
    /**
     * Get a card.
     *
     * @return {SwipeCardConfig} A card object.
     */
    getCard() {
        return this.config;
    }
}



/***/ }),

/***/ "./src/cards/SwitchCard.ts":
/*!*********************************!*\
  !*** ./src/cards/SwitchCard.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SwitchCard: () => (/* binding */ SwitchCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SwitchCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Switch Card Class
 *
 * Used to create a card for controlling an entity of the switch domain.
 *
 * @class
 * @extends AbstractCard
 */
class SwitchCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.EntityCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {EntityCardConfig}
         * @private
         */
        _SwitchCard_defaultConfig.set(this, {
            type: "tile",
            icon: undefined,
            vertical: false,
            tap_action: {
                action: "toggle",
            },
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SwitchCard_defaultConfig, "f"), options);
    }
}
_SwitchCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/cards/VacuumCard.ts":
/*!*********************************!*\
  !*** ./src/cards/VacuumCard.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VacuumCard: () => (/* binding */ VacuumCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
/* harmony import */ var _types_lovelace_mushroom_cards_vacuum_card_config__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/lovelace-mushroom/cards/vacuum-card-config */ "./src/types/lovelace-mushroom/cards/vacuum-card-config.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _VacuumCard_defaultConfig;


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Vacuum Card Class
 *
 * Used to create a card for controlling an entity of the vacuum domain.
 *
 * @class
 * @extends AbstractCard
 */
class VacuumCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.VacuumCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(options, entity) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {VacuumCardConfig}
         * @private
         */
        _VacuumCard_defaultConfig.set(this, {
            type: "custom:mushroom-vacuum-card",
            icon: undefined,
            icon_animation: true,
            commands: [..._types_lovelace_mushroom_cards_vacuum_card_config__WEBPACK_IMPORTED_MODULE_1__.VACUUM_COMMANDS],
            tap_action: {
                action: "more-info",
            }
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _VacuumCard_defaultConfig, "f"), options);
    }
}
_VacuumCard_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/AbstractChip.ts":
/*!***********************************!*\
  !*** ./src/chips/AbstractChip.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractChip: () => (/* binding */ AbstractChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _types_strategy_generic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/strategy/generic */ "./src/types/strategy/generic.ts");


var isCallServiceActionConfig = _types_strategy_generic__WEBPACK_IMPORTED_MODULE_1__.generic.isCallServiceActionConfig;
/**
 * Abstract Chip class.
 *
 * To create a new chip, extend this one.
 *
 * @class
 * @abstract
 */
class AbstractChip {
    /**
     * Class Constructor.
     */
    constructor() {
        /**
         * Configuration of the chip.
         *
         * @type {LovelaceChipConfig}
         */
        this.config = {
            type: "template"
        };
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
    }
    // noinspection JSUnusedGlobalSymbols Method is called on dymanically imported classes.
    /**
     * Get the chip.
     *
     * @returns  {LovelaceChipConfig} A chip.
     */
    getChip() {
        return this.config;
    }
    /**
     * Set the target to switch.
     *
     * @param {HassServiceTarget} target Target to switch.
     */
    setTapActionTarget(target) {
        if ("tap_action" in this.config && isCallServiceActionConfig(this.config.tap_action)) {
            this.config.tap_action.target = target;
            return;
        }
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.debug) {
            console.warn(this.constructor.name
                + " - Target not set: Invalid target or tap action.");
        }
    }
}



/***/ }),

/***/ "./src/chips/AggregateChip.ts":
/*!************************************!*\
  !*** ./src/chips/AggregateChip.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AggregateChip: () => (/* binding */ AggregateChip)
/* harmony export */ });
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class AggregateChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {TemplateChipConfig | undefined}
     *
     */
    getDefaultConfig({ device_class, show_content = true, magic_device_id = "global", area_slug, tap_action }) {
        const domain = _variables__WEBPACK_IMPORTED_MODULE_0__.DEVICE_CLASSES.sensor.includes(device_class) ? "sensor" : "binary_sensor";
        let icon = device_class !== "motion" ? _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.icons[domain][device_class]?.default : _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.icons[domain][device_class]?.state?.on;
        let icon_color = "";
        let content = "";
        const device = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.magicAreasDevices[magic_device_id];
        const magicEntity = device?.entities[`aggregate_${device_class}`];
        if (domain === "binary_sensor") {
            content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getCountTemplate({ domain, device_class, operator: "eq", value: "on", area_slug }) : "";
            icon_color = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getBinarySensorColorFromState(device_class, "eq", "on", "red", "grey", area_slug);
        }
        if (domain === "sensor") {
            content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getSensorStateTemplate(device_class, area_slug) : "";
            icon_color = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getSensorColorFromState(device_class, area_slug) ?? "white";
            icon = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getSensorIconFromState(device_class, area_slug) ?? icon;
            if (device_class === "illuminance") {
                if (magicEntity) {
                    icon_color = `{{ 'blue' if 'dark' in state_attr('${device?.entities.area_state?.entity_id}', 'states') else 'amber' }}`;
                }
            }
        }
        if (device_class === "cover") {
            if (magicEntity) {
                icon_color = `{{ 'red' if is_state('${magicEntity.entity_id}', 'open') else 'grey' }}`;
                content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getCountTemplate({ domain: "cover", operator: "eq", value: "open", area_slug }) : "";
            }
        }
        if (device_class === "health") {
            icon_color = `{{ 'red' if is_state(entity, 'on') else 'green' }}`;
        }
        return {
            entity: magicEntity?.entity_id,
            icon_color,
            icon,
            content: content,
            tap_action: tap_action ?? { action: "none" }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.AggregateChipOptions} options The chip options.
     */
    constructor(options, entity) {
        super();
        const defaultConfig = this.getDefaultConfig(options);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/chips/AlarmChip.ts":
/*!********************************!*\
  !*** ./src/chips/AlarmChip.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AlarmChip: () => (/* binding */ AlarmChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _AlarmChip_defaultConfig;


// noinspection JSUnusedGlobalSymbols False positive.
/**
 * Alarm Chip class.
 *
 * Used to create a chip for showing the alarm.
 */
class AlarmChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {string} entityId Id of a alarm entity.
     * @param {chips.AlarmChipOptions} options Alarm Chip options.
     */
    constructor(entityId, options = {}) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @private
         * @readonly
         */
        _AlarmChip_defaultConfig.set(this, {
            type: "alarm-control-panel",
            tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.navigateTo)('security')
        });
        __classPrivateFieldSet(this, _AlarmChip_defaultConfig, {
            ...__classPrivateFieldGet(this, _AlarmChip_defaultConfig, "f"),
            ...{ entity: entityId },
            ...options,
        }, "f");
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _AlarmChip_defaultConfig, "f"), options);
    }
}
_AlarmChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/AreaScenesChips.ts":
/*!**************************************!*\
  !*** ./src/chips/AreaScenesChips.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AreaScenesChips: () => (/* binding */ AreaScenesChips)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area selects Chips class.
 *
 * Used to create a chip to indicate climate level.
 */
class AreaScenesChips {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(device, area) {
        const selects = _variables__WEBPACK_IMPORTED_MODULE_1__.TOD_ORDER.map(tod => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(device?.entities[`scene_${tod}`]?.entity_id)).filter(Boolean);
        const chips = [];
        if (selects.find(scene => scene?.state == "Adaptive lighting")) {
            chips.push({
                type: "template",
                icon: "mdi:theme-light-dark",
                content: "AD",
                tap_action: {
                    action: "call-service",
                    service: `${_variables__WEBPACK_IMPORTED_MODULE_1__.MAGIC_AREAS_DOMAIN}.area_light_adapt`,
                    data: {
                        area: (0,_utils__WEBPACK_IMPORTED_MODULE_2__.slugify)(device.name),
                    }
                },
            });
        }
        selects.forEach((scene, index) => {
            if (scene?.state === "Scène instantanée") {
                const entity_id = `scene.${(0,_utils__WEBPACK_IMPORTED_MODULE_2__.slugify)(device.name)}_${_variables__WEBPACK_IMPORTED_MODULE_1__.TOD_ORDER[index]}_snapshot_scene`;
                chips.push({
                    type: "template",
                    entity: scene?.entity_id,
                    icon: scene?.attributes.icon,
                    content: _variables__WEBPACK_IMPORTED_MODULE_1__.TOD_ORDER[index],
                    tap_action: {
                        action: "call-service",
                        service: "scene.turn_on",
                        data: { entity_id }
                    },
                    hold_action: {
                        action: "more-info"
                    }
                });
            }
            else if (scene?.state !== "Adaptive lighting") {
                const sceneEntity_id = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getStateEntities(area, "scene").find(s => s.attributes.friendly_name === scene?.state)?.entity_id;
                chips.push({
                    type: "template",
                    entity: scene?.entity_id,
                    icon: scene?.attributes.icon,
                    content: _variables__WEBPACK_IMPORTED_MODULE_1__.TOD_ORDER[index],
                    tap_action: {
                        action: "call-service",
                        service: "scene.turn_on",
                        data: {
                            entity_id: sceneEntity_id,
                        }
                    },
                    hold_action: {
                        action: "more-info"
                    }
                });
            }
        });
        return chips;
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, area) {
        /**
         * Configuration of the chip.
         *
         * @type {LovelaceChipConfig[]}
         */
        this.config = [];
        this.config = this.getDefaultConfig(device, area);
    }
    // noinspection JSUnusedGlobalSymbols Method is called on dymanically imported classes.
    /**
     * Get the chip.
     *
     * @returns  {LovelaceChipConfig} A chip.
     */
    getChips() {
        return this.config;
    }
}



/***/ }),

/***/ "./src/chips/AreaStateChip.ts":
/*!************************************!*\
  !*** ./src/chips/AreaStateChip.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AreaStateChip: () => (/* binding */ AreaStateChip)
/* harmony export */ });
/* harmony import */ var _popups_AreaInformationsPopup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../popups/AreaInformationsPopup */ "./src/popups/AreaInformationsPopup.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");




// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area state Chip class.
 *
 * Used to create a chip to indicate area state.
 */
class AreaStateChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_2__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig({ area, floor, showContent = false }) {
        const device_id = area?.slug ?? floor?.floor_id;
        const device = device_id ? _Helper__WEBPACK_IMPORTED_MODULE_3__.Helper.magicAreasDevices[device_id] : undefined;
        const { area_state, presence_hold, all_media_players, aggregate_motion, aggregate_presence, aggregate_occupancy } = device?.entities ?? {};
        const motion_entities = aggregate_motion ? [aggregate_motion.entity_id] : area?.domains?.motion ?? [];
        const presence_entities = aggregate_presence ? [aggregate_presence.entity_id] : area?.domains?.presence ?? [];
        const occupancy_entities = aggregate_occupancy ? [aggregate_occupancy.entity_id] : area?.domains?.occupancy ?? [];
        const media_player_entities = all_media_players ? [all_media_players.entity_id] : area?.domains?.media_player ?? [];
        const isOn = '| selectattr("state","eq", "on") | list | count > 0';
        const isSomeone = `[${[...motion_entities, ...presence_entities, ...occupancy_entities]?.map(e => `states['${e}']`)}] ${isOn}`;
        const isMotion = `[${motion_entities?.map(e => `states['${e}']`)}] ${isOn}`;
        const isPresence = `[${presence_entities?.map(e => `states['${e}']`)}] ${isOn}`;
        const isOccupancy = `[${occupancy_entities?.map(e => `states['${e}']`)}] ${isOn}`;
        const isMediaPlaying = `[${media_player_entities?.map(e => `states['${e}']`)}] | selectattr("state","eq", "playing") | list | count > 0`;
        return {
            type: "template",
            entity: area_state?.entity_id,
            icon_color: `
          {% set presence_hold = states('${presence_hold?.entity_id}')%}
          {% set motion = ${isSomeone} %}
          {% set media_player = ${isMediaPlaying} %}
          {% set bl = state_attr('${area_state?.entity_id}', 'states') or [] %}
          {% if motion %}
              red
          {% elif media_player %}
              blue
          {% elif presence_hold == 'on' %}
              red
          {% elif 'sleep' in bl %}
              blue
          {% elif 'extended' in bl %}
              orange
          {% elif 'occupied' in bl %}
              grey
          {% else %}
              transparent
          {% endif %}
        `,
            icon: `
          {% set presence_hold = states('${presence_hold?.entity_id}')%}
          {% set motion = ${isMotion} %}
          {% set presence = ${isPresence} %}
          {% set occupancy = ${isOccupancy} %}
          {% set media_player = ${isMediaPlaying} %}
          {% set bl = state_attr('${area_state?.entity_id}', 'states') or [] %}
          {% if motion %}
            ${_Helper__WEBPACK_IMPORTED_MODULE_3__.Helper.icons.binary_sensor.motion?.state?.on}
          {% elif presence %}
            ${_Helper__WEBPACK_IMPORTED_MODULE_3__.Helper.icons.binary_sensor.presence?.state?.on}
          {% elif occupancy %}
            ${_Helper__WEBPACK_IMPORTED_MODULE_3__.Helper.icons.binary_sensor.occupancy?.state?.on}
          {% elif media_player %}
            ${_Helper__WEBPACK_IMPORTED_MODULE_3__.Helper.icons.media_player._?.state?.playing}
          {% elif presence_hold == 'on' %}
            ${_variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_ICONS.presence_hold}
          {% elif 'sleep' in bl %}
            ${_variables__WEBPACK_IMPORTED_MODULE_1__.AREA_STATE_ICONS.sleep}
          {% elif 'extended' in bl %}
            ${_variables__WEBPACK_IMPORTED_MODULE_1__.AREA_STATE_ICONS.extended}
          {% elif 'occupied' in bl %}
            ${_variables__WEBPACK_IMPORTED_MODULE_1__.AREA_STATE_ICONS.occupied}
          {% else %}
            ${_variables__WEBPACK_IMPORTED_MODULE_1__.AREA_STATE_ICONS.clear}
          {% endif %}`,
            content: showContent ? `
          {% set presence_hold = states('${presence_hold?.entity_id}')%}
          {% set bl = state_attr('${area_state?.entity_id}', 'states')%}
          {% if presence_hold == 'on' %}
            presence_hold
          {% elif 'sleep' in bl %}
            sleep
          {% elif 'extended' in bl %}
            extended
          {% elif 'occupied' in bl %}
            occupied
          {% else %}
            clear
          {% endif %}` : "",
            tap_action: device ? new _popups_AreaInformationsPopup__WEBPACK_IMPORTED_MODULE_0__.AreaInformations(device, true).getPopup() : { action: "none" },
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(options) {
        super();
        const defaultConfig = this.getDefaultConfig(options);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/chips/ClimateChip.ts":
/*!**********************************!*\
  !*** ./src/chips/ClimateChip.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClimateChip: () => (/* binding */ ClimateChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ClimateChip_defaultConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate how many climates are operating.
 */
class ClimateChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.ChipOptions} options The chip options.
     */
    constructor(options, entity) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _ClimateChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:thermostat",
            content: "",
            tap_action: {
                action: "navigate",
                navigation_path: "climate",
            },
        });
        if (options?.show_content) {
            __classPrivateFieldGet(this, _ClimateChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate({ domain: "climate", operator: "ne", value: "off", area_slug: options?.area_slug });
        }
        __classPrivateFieldGet(this, _ClimateChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getFromDomainState({ domain: "climate", area_slug: options?.area_slug });
        const magicAreasEntity = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getMAEntity)(options.magic_device_id ?? "global", "climate");
        if (magicAreasEntity) {
            __classPrivateFieldGet(this, _ClimateChip_defaultConfig, "f").entity = magicAreasEntity.entity_id;
        }
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _ClimateChip_defaultConfig, "f"), options);
    }
}
_ClimateChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/ConditionalChip.ts":
/*!**************************************!*\
  !*** ./src/chips/ConditionalChip.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ConditionalChip: () => (/* binding */ ConditionalChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ConditionalChip_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Motion Chip class.
 *
 * Used to create a chip to indicate how many motions are operating.
 */
class ConditionalChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {MagicAreaRegistryEntry} device The chip device.
     * @param {ConditionalChipOptions} options The chip options.
     */
    constructor(conditions, chip) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {ConditionalChipConfig}
         *
         * @readonly
         * @private
         */
        _ConditionalChip_defaultConfig.set(this, {
            type: "conditional",
        });
        __classPrivateFieldGet(this, _ConditionalChip_defaultConfig, "f").conditions = conditions;
        __classPrivateFieldGet(this, _ConditionalChip_defaultConfig, "f").chip = chip;
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _ConditionalChip_defaultConfig, "f"));
    }
}
_ConditionalChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/ControlChip.ts":
/*!**********************************!*\
  !*** ./src/chips/ControlChip.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ControlChip: () => (/* binding */ ControlChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _ControlChip_defaultConfig;


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Control Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class ControlChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(domain, entity_id) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _ControlChip_defaultConfig.set(this, {
            type: "template",
            entity: undefined,
            content: "",
            icon: _variables__WEBPACK_IMPORTED_MODULE_1__.AREA_CONTROL_ICONS.media_player,
            icon_color: "green",
            tap_action: {
                action: "more-info"
            },
        });
        __classPrivateFieldGet(this, _ControlChip_defaultConfig, "f").entity = entity_id;
        __classPrivateFieldGet(this, _ControlChip_defaultConfig, "f").icon = _variables__WEBPACK_IMPORTED_MODULE_1__.AREA_CONTROL_ICONS[domain];
        __classPrivateFieldGet(this, _ControlChip_defaultConfig, "f").icon_color = `{{ "green" if states("${entity_id}") == "on" else "red" }}`;
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _ControlChip_defaultConfig, "f"));
    }
}
_ControlChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/CoverChip.ts":
/*!********************************!*\
  !*** ./src/chips/CoverChip.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CoverChip: () => (/* binding */ CoverChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _CoverChip_defaultConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover Chip class.
 *
 * Used to create a chip to indicate how many covers aren't closed.
 */
class CoverChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.DeviceClassChipOptions} options The chip options.
     */
    constructor(options, entity) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _CoverChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:window-shutter",
            content: "",
            tap_action: {
                action: "navigate",
                navigation_path: "cover",
            },
        });
        if (options?.show_content) {
            __classPrivateFieldGet(this, _CoverChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate({ domain: "cover", operator: "eq", value: "open", area_slug: options?.area_slug });
        }
        __classPrivateFieldGet(this, _CoverChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getFromDomainState({ domain: "cover", area_slug: options?.area_slug });
        const magicAreasEntity = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getMAEntity)(options?.magic_device_id ?? "global", "cover", options?.device_class);
        if (magicAreasEntity) {
            __classPrivateFieldGet(this, _CoverChip_defaultConfig, "f").entity = magicAreasEntity.entity_id;
        }
        else {
            const area_slug = Array.isArray(options?.area_slug) ? options?.area_slug : [options?.area_slug];
            __classPrivateFieldGet(this, _CoverChip_defaultConfig, "f").entity_id = area_slug.flatMap((area) => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area ?? "global"]?.domains?.cover ?? []);
        }
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _CoverChip_defaultConfig, "f"), options);
    }
}
_CoverChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/FanChip.ts":
/*!******************************!*\
  !*** ./src/chips/FanChip.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FanChip: () => (/* binding */ FanChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _FanChip_defaultConfig;


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Fan Chip class.
 *
 * Used to create a chip to indicate how many fans are on and to turn all off.
 */
class FanChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.ChipOptions} options The chip options.
     */
    constructor(options, entity) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _FanChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:fan",
            content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate({ domain: "fan", operator: "eq", value: "on" }),
            tap_action: {
                action: "navigate",
                navigation_path: "fan",
            },
        });
        if (options?.show_content) {
            __classPrivateFieldGet(this, _FanChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate({ domain: "fan", operator: "eq", value: "on", area_slug: options?.area_slug });
        }
        __classPrivateFieldGet(this, _FanChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getFromDomainState({ domain: "fan", area_slug: options?.area_slug });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _FanChip_defaultConfig, "f"), options);
    }
}
_FanChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/LightChip.ts":
/*!********************************!*\
  !*** ./src/chips/LightChip.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LightChip: () => (/* binding */ LightChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LightChip_defaultConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LightChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.ChipOptions} options The chip options.
     */
    constructor(options, entity) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _LightChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:lightbulb-group",
            icon_color: "amber",
            content: "",
            tap_action: {
                action: "navigate",
                navigation_path: "light",
            },
        });
        if (options?.show_content) {
            __classPrivateFieldGet(this, _LightChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate({ domain: "light", operator: "eq", value: "on", area_slug: options?.area_slug });
        }
        __classPrivateFieldGet(this, _LightChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getFromDomainState({ domain: "light", area_slug: options?.area_slug });
        const magicAreasEntity = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getMAEntity)(options?.magic_device_id ?? "global", "light");
        if (magicAreasEntity) {
            __classPrivateFieldGet(this, _LightChip_defaultConfig, "f").entity = magicAreasEntity.entity_id;
        }
        else {
            const area_slug = Array.isArray(options?.area_slug) ? options?.area_slug : [options?.area_slug];
            __classPrivateFieldGet(this, _LightChip_defaultConfig, "f").entity_id = area_slug.flatMap((area) => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area ?? "global"]?.domains?.light ?? []);
        }
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _LightChip_defaultConfig, "f"), options);
    }
}
_LightChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/MediaPlayerChip.ts":
/*!**************************************!*\
  !*** ./src/chips/MediaPlayerChip.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MediaPlayerChip: () => (/* binding */ MediaPlayerChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _MediaPlayerChip_defaultConfig;


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * MediaPlayer Chip class.
 *
 * Used to create a chip to indicate how many climates are operating.
 */
class MediaPlayerChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.ChipOptions} options The chip options.
     */
    constructor(options, entity) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _MediaPlayerChip_defaultConfig.set(this, {
            type: "template",
            icon: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons.media_player._.default,
            content: "",
            tap_action: {
                action: "navigate",
                navigation_path: "media_player",
            },
        });
        if (options?.show_content) {
            __classPrivateFieldGet(this, _MediaPlayerChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate({ domain: "media_player", operator: "eq", value: "playing", area_slug: options?.area_slug });
        }
        __classPrivateFieldGet(this, _MediaPlayerChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getFromDomainState({ domain: "media_player", area_slug: options?.area_slug });
        __classPrivateFieldGet(this, _MediaPlayerChip_defaultConfig, "f").icon = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons.media_player._.default,
            // const magicAreasEntity = getMAEntity(options?.magic_device_id ?? "global", "media_player");
            // if (magicAreasEntity) {
            //   this.#defaultConfig.entity = magicAreasEntity.entity_id;
            // }
            this.config = Object.assign(this.config, __classPrivateFieldGet(this, _MediaPlayerChip_defaultConfig, "f"), options);
    }
}
_MediaPlayerChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/SafetyChip.ts":
/*!*********************************!*\
  !*** ./src/chips/SafetyChip.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SafetyChip: () => (/* binding */ SafetyChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SafetyChip_defaultConfig;


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Safety Chip class.
 *
 * Used to create a chip to indicate how many safetys are operating.
 */
class SafetyChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(options, entity) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _SafetyChip_defaultConfig.set(this, {
            type: "template",
            icon: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons.binary_sensor.safety?.default,
            icon_color: "grey",
            content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate({ domain: "safety", operator: "ne", value: "off" }),
            tap_action: {
                action: "none",
            },
            hold_action: {
                action: "navigate",
                navigation_path: "safety",
            },
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SafetyChip_defaultConfig, "f"), options);
    }
}
_SafetyChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/SettingsChip.ts":
/*!***********************************!*\
  !*** ./src/chips/SettingsChip.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SettingsChip: () => (/* binding */ SettingsChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SettingsChip_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Settings Chip class.
 *
 * Used to create a chip to indicate how many fans are on and to turn all off.
 */
class SettingsChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(options = {}) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _SettingsChip_defaultConfig.set(this, {
            "type": "template",
            "icon": "mdi:cog",
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SettingsChip_defaultConfig, "f"), options);
    }
}
_SettingsChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/SpotifyChip.ts":
/*!**********************************!*\
  !*** ./src/chips/SpotifyChip.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SpotifyChip: () => (/* binding */ SpotifyChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Spotify Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class SpotifyChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(entityId) {
        return {
            type: "template",
            entity: entityId,
            icon_color: `{{ 'green' if is_state('${entityId}', 'playing') else 'grey' }}`,
            content: '{{ states(entity) }}',
            icon: "mdi:spotify",
            // content: show_content ? `{{ states('${entityId}') if not states('${entityId}') == 'on' else '' }}` : "",
            tap_action: {
                action: "fire-dom-event",
                browser_mod: {
                    service: "browser_mod.popup",
                    data: {
                        title: "Spotify",
                        "content": {
                            type: "vertical-stack",
                            cards: [
                                ...([entityId].map(x => {
                                    const entity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(x);
                                    const source_list = entity.attributes.source_list;
                                    const chunkSize = 3;
                                    const source_cards_chunk = [];
                                    for (let i = 0; i < source_list.length; i += chunkSize) {
                                        const chunk = source_list.slice(i, i + chunkSize);
                                        source_cards_chunk.push(chunk);
                                    }
                                    return {
                                        type: "custom:stack-in-card",
                                        cards: [
                                            {
                                                type: "custom:mushroom-media-player-card",
                                                entity: "media_player.spotify_juicy",
                                                icon: "mdi:spotify",
                                                icon_color: "green",
                                                use_media_info: true,
                                                use_media_artwork: false,
                                                show_volume_level: false,
                                                media_controls: [
                                                    "play_pause_stop",
                                                    "previous",
                                                    "next"
                                                ],
                                                volume_controls: [
                                                    "volume_buttons",
                                                    "volume_set"
                                                ],
                                                fill_container: false,
                                                card_mod: {
                                                    style: "ha-card {\n  --rgb-state-media-player: var(--rgb-green);\n}\n"
                                                }
                                            },
                                            {
                                                type: "custom:swipe-card",
                                                parameters: null,
                                                spaceBetween: 8,
                                                scrollbar: null,
                                                start_card: 1,
                                                hide: false,
                                                draggable: true,
                                                snapOnRelease: true,
                                                slidesPerView: 2.2,
                                                cards: [
                                                    ...(source_cards_chunk.map(source_cards => ({
                                                        type: "horizontal-stack",
                                                        cards: [
                                                            ...(source_cards.map((source) => ({
                                                                type: "custom:mushroom-template-card",
                                                                icon: "mdi:speaker-play",
                                                                icon_color: `{% if states[entity].attributes.source == '${source}' %}\namber\n{% else %}\ngrey\n{% endif %}`,
                                                                primary: null,
                                                                secondary: source,
                                                                entity: entity.entity_id,
                                                                multiline_secondary: false,
                                                                tap_action: {
                                                                    action: "call-service",
                                                                    service: "spotcast.start",
                                                                    data: {
                                                                        device_name: source,
                                                                        force_playback: true
                                                                    }
                                                                },
                                                                layout: "vertical",
                                                                style: "mushroom-card \n  background-size: 42px 32px;\nmushroom-shape-icon {\n  --shape-color: none !important;\n}  \n  ha-card { \n  background: rgba(#1a1a2a;, 1.25);\n  {% if is_state('media_player.cuisine_media_players', 'playing') %}\n  {% else %}\n    background: rgba(var(--rgb-primary-background-color), 0.8);\n  {% endif %}    \n    width: 115px;\n    border-radius: 30px;\n    margin-top: 10px;\n    margin-left: auto;\n    margin-right: auto;\n    margin-bottom: 20px;\n  }\n",
                                                                card_mode: {
                                                                    style: ":host {\n  background: rgba(var(--rgb-primary-background-color), 0.8);\n  border-radius: 50px;!important\n} \n"
                                                                },
                                                                line_width: 8,
                                                                line_color: "#FF6384",
                                                                card_mod: {
                                                                    style: `
                                      :host {
                                        --mush-icon-symbol-size: 0.75em;
                                      }
                                      `
                                                                }
                                                            }))).filter(Boolean),
                                                        ]
                                                    }))).filter(Boolean),
                                                ]
                                            },
                                            {
                                                type: "custom:spotify-card",
                                                always_play_random_song: true,
                                                hide_currently_playing: true,
                                                hide_playback_controls: true,
                                                hide_top_header: true,
                                                hide_warning: true,
                                                hide_chromecast_devices: true,
                                                display_style: "Grid",
                                                grid_covers_per_row: 5,
                                                limit: 20
                                            }
                                        ],
                                        card_mod: {
                                            style: "ha-card {\n  {% if not is_state('media_player.spotify_juicy', 'off') and not is_state('media_player.spotify_juicy', 'idle') %}\n    background: url( '{{ state_attr(\"media_player.spotify_juicy\", \"entity_picture\") }}' ), linear-gradient(to left, transparent, rgb(var(--rgb-card-background-color)) 100%);\n\n    {% if state_attr('media_player.spotify_juicy', 'media_content_type') == 'tvshow' %}\n      background-size: auto 100%, cover;\n    {% else %}\n      background-size: 130% auto, cover;\n    {% endif %}\n\n    background-position: top right;\n    background-repeat: no-repeat;\n    background-blend-mode: saturation;\n  {% endif %}\n}\n"
                                        }
                                    };
                                })).filter(Boolean),
                            ],
                            card_mod: {
                                style: "ha-card {\n  background:#4a1a1a;\n}\n"
                            }
                        }
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(entityId) {
        super();
        const defaultConfig = this.getDefaultConfig(entityId);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/chips/SwitchChip.ts":
/*!*********************************!*\
  !*** ./src/chips/SwitchChip.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SwitchChip: () => (/* binding */ SwitchChip)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SwitchChip_defaultConfig;


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Switch Chip class.
 *
 * Used to create a chip to indicate how many switches are on and to turn all off.
 */
class SwitchChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.ChipOptions} options The chip options.
     */
    constructor(options, entity) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _SwitchChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:dip-switch",
            content: "",
            tap_action: {
                action: "navigate",
                navigation_path: "switch",
            },
        });
        if (options?.show_content) {
            __classPrivateFieldGet(this, _SwitchChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate({ domain: "switch", operator: "eq", value: "on", area_slug: options?.area_slug });
        }
        __classPrivateFieldGet(this, _SwitchChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getFromDomainState({ domain: "switch", area_slug: options?.area_slug });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SwitchChip_defaultConfig, "f"), options);
    }
}
_SwitchChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/ToggleSceneChip.ts":
/*!**************************************!*\
  !*** ./src/chips/ToggleSceneChip.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ToggleSceneChip: () => (/* binding */ ToggleSceneChip)
/* harmony export */ });
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class ToggleSceneChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(device) {
        return {
            type: "template",
            entity: device?.entities.light_control?.entity_id,
            icon: "mdi:recycle-variant",
            // icon_color: "{% if is_state(config.entity, 'on') %}green{% else %}red{% endif %}",
            tap_action: {
                action: "call-service",
                service: `${_variables__WEBPACK_IMPORTED_MODULE_0__.MAGIC_AREAS_DOMAIN}.area_scene_toggle`,
                data: {
                    area: device?.name,
                }
            },
            hold_action: {
                action: "more-info"
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device) {
        super();
        const defaultConfig = this.getDefaultConfig(device);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/chips/UnavailableChip.ts":
/*!**************************************!*\
  !*** ./src/chips/UnavailableChip.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UnavailableChip: () => (/* binding */ UnavailableChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _UnavailableChip_defaultConfig;




// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Unavailable Chip class.
 *
 * Used to create a chip to indicate unable entities.
 */
class UnavailableChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Class Constructor.
     *
   * @param {chips.ChipOptions} options The chip options.
   */
    constructor(options = {}) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _UnavailableChip_defaultConfig.set(this, {
            type: "template",
            icon: 'mdi:alert-circle-outline',
            icon_color: "orange",
            content: "",
        });
        __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getCountTemplate({ domain: "all", operator: "eq", value: _variables__WEBPACK_IMPORTED_MODULE_3__.UNAVAILABLE, area_slug: options?.area_slug, allowUnavailable: true });
        __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").icon = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getFromDomainState({
            domain: "all",
            operator: "eq",
            value: _variables__WEBPACK_IMPORTED_MODULE_3__.UNAVAILABLE,
            ifReturn: __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").icon,
            elseReturn: "mdi:alert-circle-check-outline",
            area_slug: options?.area_slug,
            allowUnavailable: true
        });
        __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getFromDomainState({
            domain: "all",
            operator: "eq",
            value: _variables__WEBPACK_IMPORTED_MODULE_3__.UNAVAILABLE,
            ifReturn: __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").icon_color,
            elseReturn: "green",
            area_slug: options?.area_slug,
            allowUnavailable: true
        });
        __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").tap_action = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.navigateTo)("unavailable");
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f"));
    }
}
_UnavailableChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/WeatherChip.ts":
/*!**********************************!*\
  !*** ./src/chips/WeatherChip.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WeatherChip: () => (/* binding */ WeatherChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _popups_WeatherPopup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../popups/WeatherPopup */ "./src/popups/WeatherPopup.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var _WeatherChip_defaultConfig;


// noinspection JSUnusedGlobalSymbols False positive.
/**
 * Weather Chip class.
 *
 * Used to create a chip for showing the weather.
 */
class WeatherChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {string} entityId Id of a weather entity.
     * @param {chips.WeatherChipOptions} options Weather Chip options.
     */
    constructor(entityId, options = {}) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @private
         * @readonly
         */
        _WeatherChip_defaultConfig.set(this, {
            type: "weather",
            show_temperature: true,
            show_conditions: true,
        });
        __classPrivateFieldSet(this, _WeatherChip_defaultConfig, {
            ...__classPrivateFieldGet(this, _WeatherChip_defaultConfig, "f"),
            tap_action: new _popups_WeatherPopup__WEBPACK_IMPORTED_MODULE_1__.WeatherPopup(entityId).getPopup(),
            ...{ entity: entityId },
            ...options,
        }, "f");
        __classPrivateFieldGet(this, _WeatherChip_defaultConfig, "f").tap_action = new _popups_WeatherPopup__WEBPACK_IMPORTED_MODULE_1__.WeatherPopup(entityId).getPopup();
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _WeatherChip_defaultConfig, "f"), options);
    }
}
_WeatherChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/configurationDefaults.ts":
/*!**************************************!*\
  !*** ./src/configurationDefaults.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   configurationDefaults: () => (/* binding */ configurationDefaults)
/* harmony export */ });
/* harmony import */ var _chips_ControlChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chips/ControlChip */ "./src/chips/ControlChip.ts");
/* harmony import */ var _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chips/SettingsChip */ "./src/chips/SettingsChip.ts");
/* harmony import */ var _popups_LightSettingsPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./popups/LightSettingsPopup */ "./src/popups/LightSettingsPopup.ts");
/* harmony import */ var _chips_ToggleSceneChip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./chips/ToggleSceneChip */ "./src/chips/ToggleSceneChip.ts");
/* harmony import */ var _popups_SceneSettingsPopup__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./popups/SceneSettingsPopup */ "./src/popups/SceneSettingsPopup.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./variables */ "./src/variables.ts");
/* harmony import */ var _chips_ClimateChip__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ./chips/ClimateChip */ "./src/chips/ClimateChip.ts");
/* harmony import */ var _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ./chips/AggregateChip */ "./src/chips/AggregateChip.ts");
/* harmony import */ var _chips_LightChip__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ./chips/LightChip */ "./src/chips/LightChip.ts");
/* harmony import */ var _chips_MediaPlayerChip__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ./chips/MediaPlayerChip */ "./src/chips/MediaPlayerChip.ts");
/* harmony import */ var _chips_CoverChip__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(/*! ./chips/CoverChip */ "./src/chips/CoverChip.ts");
/* harmony import */ var _chips_FanChip__WEBPACK_IMPORTED_MODULE_11__ = __webpack_require__(/*! ./chips/FanChip */ "./src/chips/FanChip.ts");
/* harmony import */ var _chips_SwitchChip__WEBPACK_IMPORTED_MODULE_12__ = __webpack_require__(/*! ./chips/SwitchChip */ "./src/chips/SwitchChip.ts");













/**
 * Default configuration for the mushroom strategy.
 */
const configurationDefaults = {
    areas: {
        undisclosed: {
            slug: _variables__WEBPACK_IMPORTED_MODULE_5__.UNDISCLOSED,
            aliases: [],
            area_id: _variables__WEBPACK_IMPORTED_MODULE_5__.UNDISCLOSED,
            name: "Non assigné",
            picture: null,
            hidden: false,
            domains: {},
            devices: [],
            entities: [],
        }
    },
    floors: {
        undisclosed: {
            aliases: [],
            floor_id: _variables__WEBPACK_IMPORTED_MODULE_5__.UNDISCLOSED,
            name: "Non assigné",
            hidden: false,
            areas_slug: [_variables__WEBPACK_IMPORTED_MODULE_5__.UNDISCLOSED]
        }
    },
    debug: true,
    domains: {
        _: {
            hide_config_entities: false,
        },
        default: {
            showControls: false,
            hidden: false,
        },
        light: {
            showControls: true,
            controlChip: _chips_LightChip__WEBPACK_IMPORTED_MODULE_8__.LightChip,
            extraControls: (device) => {
                const chips = [];
                if (device?.entities.light_control?.entity_id) {
                    chips.push(new _chips_ControlChip__WEBPACK_IMPORTED_MODULE_0__.ControlChip("light", device?.entities.light_control?.entity_id).getChip());
                }
                if (device?.entities.all_lights?.entity_id) {
                    chips.push(new _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_1__.SettingsChip({ tap_action: new _popups_LightSettingsPopup__WEBPACK_IMPORTED_MODULE_2__.LightSettings(device).getPopup() }).getChip());
                }
                return chips;
            },
            controllerCardOptions: {
                onService: "light.turn_on",
                offService: "light.turn_off",
                toggleService: "light.toggle",
            },
            hidden: false,
            order: 1
        },
        climate: {
            showControls: true,
            controlChip: _chips_ClimateChip__WEBPACK_IMPORTED_MODULE_6__.ClimateChip,
            controllerCardOptions: {
                onService: "climate.turn_on",
                offService: "climate.turn_off",
                toggleService: "climate.toggle",
            },
            hidden: false,
            order: 2,
            extraControls: (device) => {
                const chips = [];
                if (device?.entities.climate_control?.entity_id) {
                    chips.push(new _chips_ControlChip__WEBPACK_IMPORTED_MODULE_0__.ControlChip("climate", device?.entities.climate_control?.entity_id).getChip());
                }
                return chips;
            },
        },
        media_player: {
            showControls: true,
            controlChip: _chips_MediaPlayerChip__WEBPACK_IMPORTED_MODULE_9__.MediaPlayerChip,
            controllerCardOptions: {
                onService: "media_player.turn_on",
                offService: "media_player.turn_off",
                toggleService: "media_player.toggle",
            },
            hidden: false,
            order: 3,
            extraControls: (device) => {
                const chips = [];
                if (device?.entities.media_player_control?.entity_id) {
                    chips.push(new _chips_ControlChip__WEBPACK_IMPORTED_MODULE_0__.ControlChip("media_player", device?.entities.media_player_control?.entity_id).getChip());
                }
                return chips;
            },
        },
        cover: {
            showControls: true,
            controlChip: _chips_CoverChip__WEBPACK_IMPORTED_MODULE_10__.CoverChip,
            controllerCardOptions: {
                onService: "cover.open_cover",
                offService: "cover.close_cover",
                toggleService: "cover.toggle",
            },
            hidden: false,
            order: 4
        },
        scene: {
            showControls: false,
            extraControls: (device) => {
                const chips = [];
                if (device?.entities.all_lights?.entity_id) {
                    chips.push(new _chips_ToggleSceneChip__WEBPACK_IMPORTED_MODULE_3__.ToggleSceneChip(device).getChip());
                    chips.push(new _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_1__.SettingsChip({ tap_action: new _popups_SceneSettingsPopup__WEBPACK_IMPORTED_MODULE_4__.SceneSettings(device).getPopup() }).getChip());
                }
                return chips;
            },
            onService: "scene.turn_on",
            offService: "scene.turn_off",
            hidden: false,
            order: 5
        },
        fan: {
            showControls: true,
            controlChip: _chips_FanChip__WEBPACK_IMPORTED_MODULE_11__.FanChip,
            controllerCardOptions: {
                onService: "fan.turn_on",
                offService: "fan.turn_off",
                toggleService: "fan.toggle",
            },
            hidden: false,
            order: 6
        },
        switch: {
            showControls: true,
            controlChip: _chips_SwitchChip__WEBPACK_IMPORTED_MODULE_12__.SwitchChip,
            controllerCardOptions: {
                onService: "switch.turn_on",
                offService: "switch.turn_off",
                toggleService: "switch.toggle",
            },
            hidden: false,
            order: 7
        },
        camera: {
            showControls: false,
            controllerCardOptions: {},
            hidden: false,
            order: 8
        },
        lock: {
            showControls: false,
            controllerCardOptions: {},
            hidden: false,
            order: 9
        },
        vacuum: {
            showControls: true,
            controllerCardOptions: {
                onService: "vacuum.start",
                offService: "vacuum.stop",
            },
            hidden: false,
            order: 10
        },
        sensor: {
            controlChip: _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_7__.AggregateChip,
            showControls: true,
            hidden: false,
        },
        binary_sensor: {
            controlChip: _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_7__.AggregateChip,
            showControls: true,
            hidden: false,
        },
        number: {
            showControls: false,
            hidden: false,
        },
    },
    home_view: {
        hidden: [],
    },
    views: {
        home: {
            order: 1,
            hidden: false,
        },
        security: {
            order: 2,
            hidden: false,
        },
        light: {
            order: 3,
            hidden: false,
        },
        climate: {
            order: 4,
            hidden: false,
        },
        media_player: {
            order: 5,
            hidden: false,
        },
        cover: {
            order: 6,
            hidden: false,
        },
        scene: {
            order: 7,
            hidden: false,
        },
        fan: {
            order: 8,
            hidden: false,
        },
        switch: {
            order: 9,
            hidden: false,
        },
        camera: {
            order: 10,
            hidden: false,
        },
        vacuum: {
            order: 11,
            hidden: false,
        },
        sensor: {
            hidden: false,
        },
        binary_sensor: {
            hidden: false,
        },
        securityDetails: {
            hidden: false,
        },
        battery: {
            hidden: false,
        },
        battery_charging: {
            hidden: false,
        },
        carbon_monoxide: {
            hidden: false,
        },
        cold: {
            hidden: false,
        },
        connectivity: {
            hidden: false,
        },
        door: {
            hidden: false,
        },
        garage_door: {
            hidden: false,
        },
        gas: {
            hidden: false,
        },
        heat: {
            hidden: false,
        },
        lock: {
            hidden: false,
        },
        moisture: {
            hidden: false,
        },
        motion: {
            hidden: false,
        },
        moving: {
            hidden: false,
        },
        occupancy: {
            hidden: false,
        },
        opening: {
            hidden: false,
        },
        plug: {
            hidden: false,
        },
        power: {
            hidden: false,
        },
        presence: {
            hidden: false,
        },
        problem: {
            hidden: false,
        },
        running: {
            hidden: false,
        },
        safety: {
            hidden: false,
        },
        smoke: {
            hidden: false,
        },
        sound: {
            hidden: false,
        },
        tamper: {
            hidden: false,
        },
        update: {
            hidden: false,
        },
        vibration: {
            hidden: false,
        },
        window: {
            hidden: false,
        },
        apparent_power: {
            hidden: false,
        },
        aqi: {
            hidden: false,
        },
        area: {
            hidden: false,
        },
        atmospheric_pressure: {
            hidden: false,
        },
        blood_glucose_concentration: {
            hidden: false,
        },
        carbon_dioxide: {
            hidden: false,
        },
        current: {
            hidden: false,
        },
        data_rate: {
            hidden: false,
        },
        data_size: {
            hidden: false,
        },
        date: {
            hidden: false,
        },
        distance: {
            hidden: false,
        },
        duration: {
            hidden: false,
        },
        energy: {
            hidden: false,
        },
        energy_storage: {
            hidden: false,
        },
        enum: {
            hidden: false,
        },
        frequency: {
            hidden: false,
        },
        humidity: {
            hidden: false,
        },
        illuminance: {
            hidden: false,
        },
        irradiance: {
            hidden: false,
        },
        monetary: {
            hidden: false,
        },
        nitrogen_dioxide: {
            hidden: false,
        },
        nitrogen_monoxide: {
            hidden: false,
        },
        nitrous_oxide: {
            hidden: false,
        },
        ozone: {
            hidden: false,
        },
        ph: {
            hidden: false,
        },
        pm1: {
            hidden: false,
        },
        pm25: {
            hidden: false,
        },
        pm10: {
            hidden: false,
        },
        power_factor: {
            hidden: false,
        },
        precipitation: {
            hidden: false,
        },
        precipitation_intensity: {
            hidden: false,
        },
        pressure: {
            hidden: false,
        },
        reactive_power: {
            hidden: false,
        },
        signal_strength: {
            hidden: false,
        },
        sound_pressure: {
            hidden: false,
        },
        speed: {
            hidden: false,
        },
        sulphur_dioxide: {
            hidden: false,
        },
        temperature: {
            hidden: false,
        },
        timestamp: {
            hidden: false,
        },
        volatile_organic_compounds: {
            hidden: false,
        },
        volatile_organic_compounds_parts: {
            hidden: false,
        },
        voltage: {
            hidden: false,
        },
        volume: {
            hidden: false,
        },
        volume_flow_rate: {
            hidden: false,
        },
        volume_storage: {
            hidden: false,
        },
        water: {
            hidden: false,
        },
        weight: {
            hidden: false,
        },
        wind_speed: {
            hidden: false,
        },
    }
};


/***/ }),

/***/ "./src/linus-strategy.ts":
/*!*******************************!*\
  !*** ./src/linus-strategy.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Helper */ "./src/Helper.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./variables */ "./src/variables.ts");
/* harmony import */ var _views_AreaView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./views/AreaView */ "./src/views/AreaView.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");
/* harmony import */ var _views_FloorView__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./views/FloorView */ "./src/views/FloorView.ts");





/**
 * Linus Dashboard Strategy.<br>
 * <br>
 * Linus dashboard strategy provides a strategy for Home-Assistant to create a dashboard automatically.<br>
 * The strategy makes use of Mushroom and Mini Graph cards to represent your entities.<br>
 * <br>
 * Features:<br>
 *     🛠 Automatically create a dashboard with minimal configuration.<br>
 *     😍 Built-in views for several standard domains.<br>
 *     🎨 Many options to customize to your needs.<br>
 * <br>
 * Check the [Repository]{@link https://github.com/AalianKhan/linus-strategy} for more information.
 */
class LinusStrategy extends HTMLTemplateElement {
    /**
     * Generate a dashboard.
     *
     * Called when opening a dashboard.
     *
     * @param {generic.DashBoardInfo} info Dashboard strategy information object.
     * @return {Promise<LovelaceConfig>}
     */
    static async generateDashboard(info) {
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized())
            await _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.initialize(info);
        const views = info.config?.views ?? [];
        LinusStrategy.createDomainSubviews(views);
        LinusStrategy.createUnavailableEntitiesSubview(views);
        LinusStrategy.createAreaSubviews(views);
        LinusStrategy.createFloorSubviews(views);
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.extra_views) {
            views.push(..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.extra_views);
        }
        return { views };
    }
    /**
     * Create subviews for each domain.
     *
     * @param {LovelaceViewConfig[]} views Array of Lovelace view configurations.
     */
    static createDomainSubviews(views) {
        const exposedViewIds = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getExposedViewIds();
        exposedViewIds.forEach(viewId => {
            if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.excluded_domains?.includes(viewId))
                return;
            if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.excluded_device_classes?.includes(viewId))
                return;
            if (![..._variables__WEBPACK_IMPORTED_MODULE_1__.CUSTOM_VIEWS, ..._variables__WEBPACK_IMPORTED_MODULE_1__.DOMAINS_VIEWS].includes(viewId))
                return;
            let domain = viewId;
            let device_class;
            if (_variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.binary_sensor.includes(viewId)) {
                domain = "binary_sensor";
                device_class = viewId;
            }
            else if (_variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.sensor.includes(viewId)) {
                domain = "sensor";
                device_class = viewId;
            }
            const entities = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getGlobalEntitiesExceptUndisclosed)(domain, device_class);
            if (_variables__WEBPACK_IMPORTED_MODULE_1__.DOMAINS_VIEWS.includes(viewId) && entities.length === 0)
                return;
            views.push({
                title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize((0,_utils__WEBPACK_IMPORTED_MODULE_3__.getDomainTranslationKey)(domain, device_class ?? "_")),
                icon: _variables__WEBPACK_IMPORTED_MODULE_1__.VIEWS_ICONS[viewId] ?? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons[device_class === "battery" ? "binary_sensor" : domain]?.[device_class ?? "_"]?.default,
                path: viewId,
                subview: !Object.keys(_variables__WEBPACK_IMPORTED_MODULE_1__.VIEWS_ICONS).includes(viewId),
                strategy: {
                    type: "custom:linus-strategy",
                    options: { viewId },
                },
            });
        });
    }
    /**
     * Create a subview for unavailable entities.
     *
     * @param {LovelaceViewConfig[]} views Array of Lovelace view configurations.
     */
    static createUnavailableEntitiesSubview(views) {
        views.push({
            title: "Unavailable",
            path: "unavailable",
            subview: true,
            strategy: {
                type: "custom:linus-strategy",
                options: { viewId: "unavailable" },
            },
        });
    }
    /**
     * Create subviews for each area.
     *
     * @param {LovelaceViewConfig[]} views Array of Lovelace view configurations.
     */
    static createAreaSubviews(views) {
        for (let area of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.orderedAreas) {
            if (!area.hidden) {
                views.push({
                    title: (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getAreaName)(area),
                    path: area.slug ?? area.name,
                    subview: true,
                    strategy: {
                        type: "custom:linus-strategy",
                        options: { area },
                    },
                });
            }
        }
    }
    /**
     * Create subviews for each floor.
     *
     * @param {LovelaceViewConfig[]} views Array of Lovelace view configurations.
     */
    static createFloorSubviews(views) {
        for (let floor of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.orderedFloors) {
            if (!floor.hidden) {
                views.push({
                    title: (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getFloorName)(floor),
                    path: floor.floor_id,
                    subview: true,
                    strategy: {
                        type: "custom:linus-strategy",
                        options: { floor },
                    },
                });
            }
        }
    }
    /**
     * Generate a view.
     *
     * Called when opening a subview.
     *
     * @param {generic.ViewInfo} info The view's strategy information object.
     * @return {Promise<LovelaceViewConfig>}
     */
    /**
     * Generate a view.
     *
     * Called when opening a subview.
     *
     * @param {generic.ViewInfo} info The view's strategy information object.
     * @return {Promise<LovelaceViewConfig>}
     */
    static async generateView(info) {
        const { viewId, floor, area } = info.view.strategy?.options ?? {};
        let view = {};
        if (area) {
            try {
                view = await new _views_AreaView__WEBPACK_IMPORTED_MODULE_2__.AreaView(area).getView();
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError(`View for '${area?.name}' couldn't be loaded!`, e);
            }
        }
        else if (floor) {
            try {
                view = await new _views_FloorView__WEBPACK_IMPORTED_MODULE_4__.FloorView(floor).getView();
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError(`View for '${floor?.name}' couldn't be loaded!`, e);
            }
        }
        else if (viewId) {
            try {
                if (viewId === "unavailable") {
                    const viewModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./views/UnavailableView */ "./src/views/UnavailableView.ts"));
                    view = await new viewModule.UnavailableView().getView();
                }
                else if (_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(viewId)) {
                    const viewModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./views/AggregateView */ "./src/views/AggregateView.ts"));
                    view = await new viewModule.AggregateView({ domain: viewId }).getView();
                }
                else if ([..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.binary_sensor, ..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.sensor].includes(viewId)) {
                    const domain = _variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.binary_sensor.includes(viewId) ? "binary_sensor" : "sensor";
                    const viewModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./views/AggregateView */ "./src/views/AggregateView.ts"));
                    view = await new viewModule.AggregateView({ domain, device_class: viewId }).getView();
                }
                else {
                    const viewType = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(viewId + "View");
                    const viewModule = await __webpack_require__("./src/views lazy recursive ^\\.\\/.*$")(`./${viewType}`);
                    view = await new viewModule[viewType](_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.views[viewId]).getView();
                }
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError(`View for '${viewId}' couldn't be loaded!`, e);
            }
        }
        return view;
    }
}
customElements.define("ll-strategy-linus-strategy", LinusStrategy);
const version = "v1.1.1-alpha.2";
console.info("%c Linus Strategy %c ".concat(version, " "), "color: #F5F5DC; background: #004225; font-weight: 700;", "color: #004225; background: #F5F5DC; font-weight: 700;");


/***/ }),

/***/ "./src/popups/AbstractPopup.ts":
/*!*************************************!*\
  !*** ./src/popups/AbstractPopup.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractPopup: () => (/* binding */ AbstractPopup)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");

/**
 * Abstract Popup class.
 *
 * To create a new Popup, extend this one.
 *
 * @class
 * @abstract
 */
class AbstractPopup {
    /**
     * Class Constructor.
     */
    constructor() {
        /**
         * Configuration of the Popup.
         *
         * @type {PopupActionConfig}
         */
        this.config = {
            action: "fire-dom-event",
            browser_mod: {}
        };
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
    }
    // noinspection JSUnusedGlobalSymbols Method is called on dymanically imported classes.
    /**
     * Get the Popup.
     *
     * @returns  {PopupActionConfig} A Popup.
     */
    getPopup() {
        return this.config;
    }
}



/***/ }),

/***/ "./src/popups/AggregateAreaListPopup.ts":
/*!**********************************************!*\
  !*** ./src/popups/AggregateAreaListPopup.ts ***!
  \**********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AggregateAreaListPopup: () => (/* binding */ AggregateAreaListPopup)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class AggregateAreaListPopup extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__.AbstractPopup {
    getDefaultConfig({ domain, device_class, area_slug }) {
        const device = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[area_slug ?? "global"];
        const magicEntity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(device?.entities[`aggregate_${device_class}`]?.entity_id);
        const groupedCards = [];
        const is_binary_sensor = ["motion", "window", "door", "health"].includes(device_class);
        let areaCards = [];
        for (const [i, entity_id] of magicEntity?.attributes.entity_id?.entries() ?? []) {
            // Get a card for the area.
            if (entity_id) {
                areaCards.push({
                    type: "tile",
                    entity: entity_id,
                    state_content: is_binary_sensor ? 'last-changed' : 'state',
                    color: is_binary_sensor ? 'red' : false,
                });
            }
            // Horizontally group every two area cards if all cards are created.
            if (i === magicEntity.attributes.entity_id.length - 1) {
                for (let i = 0; i < areaCards.length; i += 2) {
                    groupedCards.push({
                        type: "horizontal-stack",
                        cards: areaCards.slice(i, i + 2),
                    });
                }
            }
        }
        return {
            "action": "fire-dom-event",
            "browser_mod": {
                "service": "browser_mod.popup",
                "data": {
                    "title": _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize((0,_utils__WEBPACK_IMPORTED_MODULE_1__.getDomainTranslationKey)(domain, device_class)),
                    "content": {
                        "type": "vertical-stack",
                        "cards": [
                            ...(magicEntity ? [
                                {
                                    type: "custom:mushroom-entity-card",
                                    entity: magicEntity.entity_id,
                                    color: is_binary_sensor ? 'red' : false,
                                    secondary_info: is_binary_sensor ? 'last-changed' : 'state',
                                },
                                {
                                    "type": "history-graph",
                                    "hours_to_show": 10,
                                    "show_names": false,
                                    "entities": [
                                        {
                                            "entity": magicEntity.entity_id,
                                            "name": " "
                                        }
                                    ]
                                }
                            ] : []),
                            ...groupedCards,
                        ]
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.PopupActionConfig} options The chip options.
     */
    constructor(domain, device_class, area_slug) {
        super();
        const defaultConfig = this.getDefaultConfig({ domain, device_class, area_slug });
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/popups/AggregateListPopup.ts":
/*!******************************************!*\
  !*** ./src/popups/AggregateListPopup.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AggregateListPopup: () => (/* binding */ AggregateListPopup)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class AggregateListPopup extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__.AbstractPopup {
    getDefaultConfig({ domain, device_class, area_slug }) {
        const device = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[area_slug ?? "global"];
        const magicEntity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(device?.entities[`aggregate_${device_class}`]?.entity_id);
        const groupedCards = [];
        const is_binary_sensor = ["motion", "window", "door", "health"].includes(device_class);
        for (const floor of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.orderedFloors) {
            if (floor.areas_slug.length === 0)
                continue;
            groupedCards.push({
                type: "custom:mushroom-title-card",
                subtitle: floor.name,
                card_mod: {
                    style: `
            ha-card.header {
              padding-top: 8px;
            }
          `,
                }
            });
            let areaCards = [];
            for (const [i, area] of floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug]).entries()) {
                const entity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[area.slug]?.entities[`aggregate_${device_class}`];
                // Get a card for the area.
                // if (entity && !Helper.strategyOptions.areas[area.area_slug]?.hidden) {
                //   areaCards.push({
                //     type: "tile",
                //     entity: entity?.entity_id,
                //     primary: getAreaName(area),
                //     state_content: is_binary_sensor ? 'last-changed' : 'state',
                //     color: is_binary_sensor ? 'red' : false,
                //   });
                // }
                // Horizontally group every two area cards if all cards are created.
                if (i === floor.areas_slug.length - 1) {
                    for (let i = 0; i < areaCards.length; i += 2) {
                        groupedCards.push({
                            type: "horizontal-stack",
                            cards: areaCards.slice(i, i + 2),
                        });
                    }
                }
            }
            if (areaCards.length === 0)
                groupedCards.pop();
        }
        return {
            "action": "fire-dom-event",
            "browser_mod": {
                "service": "browser_mod.popup",
                "data": {
                    "title": _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize((0,_utils__WEBPACK_IMPORTED_MODULE_1__.getDomainTranslationKey)(domain, device_class)),
                    "content": {
                        "type": "vertical-stack",
                        "cards": [
                            ...(magicEntity ? [
                                {
                                    type: "custom:mushroom-entity-card",
                                    entity: magicEntity.entity_id,
                                    color: is_binary_sensor ? 'red' : false,
                                    secondary_info: is_binary_sensor ? 'last-changed' : 'state',
                                },
                                {
                                    "type": "history-graph",
                                    "hours_to_show": 10,
                                    "show_names": false,
                                    "entities": [
                                        {
                                            "entity": magicEntity.entity_id,
                                            "name": " "
                                        }
                                    ]
                                },
                            ] : []),
                            ...groupedCards,
                        ]
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.PopupActionConfig} options The chip options.
     */
    constructor(domain, area_slug, device_class) {
        super();
        const defaultConfig = this.getDefaultConfig({ domain, device_class, area_slug });
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/popups/AreaInformationsPopup.ts":
/*!*********************************************!*\
  !*** ./src/popups/AreaInformationsPopup.ts ***!
  \*********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AreaInformations: () => (/* binding */ AreaInformations)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class AreaInformations extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__.AbstractPopup {
    getDefaultConfig(device, minimalist) {
        const { area_state } = device?.entities ?? {};
        const { friendly_name, adjoining_areas, features, states, presence_sensors, on_states } = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(area_state?.entity_id)?.attributes ?? {};
        presence_sensors?.sort((a, b) => {
            const aState = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(a);
            const bState = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(b);
            const lastChangeA = new Date(aState?.last_changed).getTime();
            const lastChangeB = new Date(bState?.last_changed).getTime();
            if (a === `switch.magic_areas_presence_hold_${(0,_utils__WEBPACK_IMPORTED_MODULE_1__.slugify)(device?.name)}`) {
                return -1;
            }
            else if (b === `switch.magic_areas_presence_hold_${(0,_utils__WEBPACK_IMPORTED_MODULE_1__.slugify)(device?.name)}`) {
                return 1;
            }
            else {
                return lastChangeB - lastChangeA;
            }
        });
        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: friendly_name,
                    content: {
                        type: "vertical-stack",
                        cards: [
                            {
                                type: "horizontal-stack",
                                cards: [
                                    {
                                        type: "custom:mushroom-entity-card",
                                        entity: area_state?.entity_id,
                                        name: "Présence",
                                        secondary_info: "last-changed",
                                        color: "red",
                                        tap_action: device?.id ? {
                                            action: "fire-dom-event",
                                            browser_mod: {
                                                service: "browser_mod.sequence",
                                                data: {
                                                    sequence: [
                                                        {
                                                            service: "browser_mod.close_popup",
                                                            data: {}
                                                        },
                                                        {
                                                            service: "browser_mod.navigate",
                                                            data: { path: `/config/devices/device/${device?.id}` }
                                                        }
                                                    ]
                                                }
                                            }
                                        } : "more-info"
                                    },
                                    {
                                        type: "custom:mushroom-template-card",
                                        primary: "Recharger la pièce",
                                        icon: "mdi:refresh",
                                        icon_color: "blue",
                                        tap_action: {
                                            action: "call-service",
                                            service: `homeassistant.reload_config_entry`,
                                            target: { "device_id": device?.id },
                                        }
                                    },
                                ]
                            },
                            ...(!minimalist ? [
                                {
                                    type: "custom:mushroom-template-card",
                                    primary: `Configuration de la pièce :`,
                                    card_mod: {
                                        style: `ha-card {padding: 4px 12px!important;}`
                                    }
                                },
                                {
                                    type: "custom:mushroom-chips-card",
                                    chips: [
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Type : {{ state_attr('${area_state?.entity_id}', 'type') }}`,
                                            icon: `
                                          {% set type = state_attr('${area_state?.entity_id}', 'type') %}
                                          {% if type == "interior" %}
                                              mdi:home-import-outline
                                          {% elif type == "exterior" %}
                                              mdi:home-import-outline
                                          {% else %}
                                              mdi:home-alert
                                          {% endif %}
                                      `,
                                        },
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Étage : {{ state_attr('${area_state?.entity_id}', 'floor') }}`,
                                            icon: `
                                          {% set floor = state_attr('${area_state?.entity_id}', 'floor') %}
                                          {% if floor == "third" %}
                                              mdi:home-floor-3
                                          {% elif floor == "second" %}
                                              mdi:home-floor-2
                                          {% elif floor == "first" %}
                                              mdi:home-floor-1
                                          {% elif floor == "ground" %}
                                              mdi:home-floor-g
                                          {% elif floor == "basement" %}
                                              mdi:home-floor-b
                                          {% else %}
                                              mdi:home-alert
                                          {% endif %}
                                      `,
                                        },
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Délai pièce vide : {{ state_attr('${area_state?.entity_id}', 'clear_timeout') }}s`,
                                            icon: `mdi:camera-timer`,
                                        },
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Interval mise à jour : {{ state_attr('${area_state?.entity_id}', 'update_interval') }}s`,
                                            icon: `mdi:update`,
                                        },
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Pièces adjacentes : ${adjoining_areas?.length ? adjoining_areas.join(' ') : 'Non défini'}`,
                                            icon: `mdi:view-dashboard-variant`,
                                        },
                                    ],
                                    card_mod: {
                                        style: `ha-card .chip-container * {margin-bottom: 0px!important;}`
                                    }
                                }
                            ] : []),
                            {
                                type: "custom:mushroom-template-card",
                                primary: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.text.area_state_popup"),
                                card_mod: {
                                    style: `ha-card {padding: 4px 12px!important;}`
                                }
                            },
                            (minimalist ? {
                                type: "vertical-stack",
                                cards: presence_sensors?.map((sensor) => ({
                                    type: "custom:mushroom-entity-card",
                                    entity: sensor,
                                    content_info: "name",
                                    secondary_info: "last-changed",
                                    icon_color: sensor.includes('media_player.') ? "blue" : "red",
                                }))
                            } :
                                {
                                    type: "custom:mushroom-chips-card",
                                    chips: presence_sensors?.map((sensor) => ({
                                        type: "entity",
                                        entity: sensor,
                                        content_info: "name",
                                        icon_color: sensor.includes('media_player.') ? "blue" : "red",
                                        tap_action: {
                                            action: "more-info"
                                        }
                                    })),
                                    card_mod: {
                                        style: `ha-card .chip-container * {margin-bottom: 0px!important;}`
                                    }
                                }),
                            ...(!minimalist ? [
                                {
                                    type: "custom:mushroom-template-card",
                                    primary: `Présence détecté pour les états :`,
                                    card_mod: {
                                        style: `ha-card {padding: 4px 12px!important;}`
                                    }
                                },
                                {
                                    type: "custom:mushroom-chips-card",
                                    chips: on_states?.map((sensor) => ({
                                        type: "template",
                                        content: sensor,
                                    })),
                                    card_mod: {
                                        style: `ha-card .chip-container * {margin-bottom: 0px!important;}`
                                    }
                                },
                                {
                                    type: "custom:mushroom-template-card",
                                    primary: `Fonctionnalitées disponibles :`,
                                    card_mod: {
                                        style: `ha-card {padding: 4px 12px!important;}`
                                    }
                                },
                                {
                                    type: "custom:mushroom-chips-card",
                                    chips: features?.map((sensor) => ({
                                        type: "template",
                                        content: sensor,
                                    })),
                                    card_mod: {
                                        style: `ha-card .chip-container * {margin-bottom: 0px!important;}`
                                    }
                                },
                            ] : [])
                        ].filter(Boolean)
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.PopupActionConfig} options The chip options.
     */
    constructor(device, minimalist = false) {
        super();
        const defaultConfig = this.getDefaultConfig(device, minimalist);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/popups/LightSettingsPopup.ts":
/*!******************************************!*\
  !*** ./src/popups/LightSettingsPopup.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LightSettings: () => (/* binding */ LightSettings)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");




// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LightSettings extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_3__.AbstractPopup {
    getDefaultConfig(device) {
        const { aggregate_illuminance, adaptive_lighting_range, minimum_brightness, maximum_brightness, maximum_lighting_level } = device?.entities ?? {};
        const device_slug = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.slugify)(device?.name ?? "");
        const OPTIONS_ADAPTIVE_LIGHTING_RANGE = {
            "": 1,
            "Small": 10,
            "Medium": 25,
            "Large": 50,
            "Extra large": 100,
        };
        const adaptive_lighting_range_state = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(adaptive_lighting_range?.entity_id)?.state;
        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: "Configurer l'éclairage adaptatif",
                    content: {
                        type: "vertical-stack",
                        cards: [
                            {
                                type: "horizontal-stack",
                                cards: [
                                    {
                                        type: "tile",
                                        entity: `switch.adaptive_lighting_${device_slug}`,
                                        vertical: "true",
                                    },
                                    {
                                        type: "tile",
                                        entity: `switch.adaptive_lighting_adapt_brightness_${device_slug}`,
                                        vertical: "true",
                                    },
                                    {
                                        type: "tile",
                                        entity: `switch.adaptive_lighting_adapt_color_${device_slug}`,
                                        vertical: "true",
                                    },
                                    {
                                        type: "tile",
                                        entity: `switch.adaptive_lighting_sleep_mode_${device_slug}`,
                                        vertical: "true",
                                    }
                                ]
                            },
                            {
                                type: "custom:mushroom-select-card",
                                entity: adaptive_lighting_range?.entity_id,
                                secondary_info: "last-changed",
                                icon_color: "blue",
                            },
                            {
                                type: "horizontal-stack",
                                cards: [
                                    {
                                        type: "custom:mushroom-number-card",
                                        entity: maximum_lighting_level?.entity_id,
                                        icon_color: "red",
                                        card_mod: {
                                            style: `
                          :host {
                            --mush-control-height: 20px;
                          }
                        `
                                        }
                                    },
                                    {
                                        type: "custom:mushroom-template-card",
                                        primary: "Utiliser la valeur actuelle",
                                        icon: "mdi:pencil",
                                        layout: "vertical",
                                        tap_action: {
                                            action: "call-service",
                                            service: `${_variables__WEBPACK_IMPORTED_MODULE_2__.MAGIC_AREAS_DOMAIN}.area_lux_for_lighting_max`,
                                            data: {
                                                area: device?.name
                                            }
                                        },
                                    },
                                ],
                            },
                            {
                                type: "custom:mushroom-number-card",
                                entity: minimum_brightness?.entity_id,
                                icon_color: "green",
                                card_mod: {
                                    style: ":host {--mush-control-height: 10px;}"
                                }
                            },
                            {
                                type: "custom:mushroom-number-card",
                                entity: maximum_brightness?.entity_id,
                                icon_color: "green",
                                card_mod: {
                                    style: ":host {--mush-control-height: 10px;}"
                                }
                            },
                            {
                                type: "custom:apexcharts-card",
                                graph_span: "15h",
                                header: {
                                    show: true,
                                    title: "Luminosité en fonction du temps",
                                    show_states: true,
                                    colorize_states: true
                                },
                                yaxis: [
                                    {
                                        id: "illuminance",
                                        min: 0,
                                        apex_config: {
                                            tickAmount: 4
                                        }
                                    },
                                    {
                                        id: "brightness",
                                        opposite: true,
                                        min: 0,
                                        max: 100,
                                        apex_config: {
                                            tickAmount: 4
                                        }
                                    }
                                ],
                                series: [
                                    (aggregate_illuminance?.entity_id ? {
                                        entity: aggregate_illuminance?.entity_id,
                                        yaxis_id: "illuminance",
                                        color: "orange",
                                        name: "Luminosité ambiante (lx)",
                                        type: "line",
                                        group_by: {
                                            func: "last",
                                            duration: "30m"
                                        }
                                    } : undefined),
                                    {
                                        entity: adaptive_lighting_range?.entity_id,
                                        type: "area",
                                        yaxis_id: "illuminance",
                                        show: {
                                            in_header: false
                                        },
                                        color: "blue",
                                        name: "Zone d'éclairage adaptatif",
                                        unit: "lx",
                                        transform: `return parseInt(hass.states['${maximum_lighting_level?.entity_id}'].state) + ${OPTIONS_ADAPTIVE_LIGHTING_RANGE[adaptive_lighting_range_state]};`,
                                        group_by: {
                                            func: "last",
                                        }
                                    },
                                    {
                                        entity: maximum_lighting_level?.entity_id,
                                        type: "area",
                                        yaxis_id: "illuminance",
                                        name: "Zone d'éclairage à 100%",
                                        color: "red",
                                        show: {
                                            in_header: false
                                        },
                                        group_by: {
                                            func: "last",
                                        }
                                    },
                                ].filter(Boolean)
                            },
                        ]
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {PopupActionConfig} options The chip options.
     */
    constructor(device) {
        super();
        const defaultConfig = this.getDefaultConfig(device);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/popups/SceneSettingsPopup.ts":
/*!******************************************!*\
  !*** ./src/popups/SceneSettingsPopup.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SceneSettings: () => (/* binding */ SceneSettings)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Scene Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class SceneSettings extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__.AbstractPopup {
    getDefaultConfig(device) {
        const { scene_morning, scene_daytime, scene_evening, scene_night } = device?.entities ?? {};
        const selectControl = [scene_morning, scene_daytime, scene_evening, scene_night].filter(Boolean);
        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: "Configurer les scènes",
                    content: {
                        type: "vertical-stack",
                        cards: [
                            ...(selectControl.length ? _variables__WEBPACK_IMPORTED_MODULE_1__.TOD_ORDER.map(tod => ({
                                type: "custom:config-template-card",
                                variables: {
                                    SCENE_STATE: `states['${device?.entities[('scene_' + tod)]?.entity_id}'].state`
                                },
                                entities: [device?.entities[('scene_' + tod)]?.entity_id],
                                card: {
                                    type: "horizontal-stack",
                                    cards: [
                                        {
                                            type: "entities",
                                            entities: [device?.entities[('scene_' + tod)]?.entity_id]
                                        },
                                        {
                                            type: "conditional",
                                            conditions: [
                                                {
                                                    entity: "${SCENE_STATE}",
                                                    state: "on"
                                                },
                                                // {
                                                //   entity: "${SCENE_STATE}",
                                                //   state: "off"
                                                // }
                                            ],
                                            card: {
                                                type: "tile",
                                                entity: "${SCENE_STATE}",
                                                show_entity_picture: true,
                                                tap_action: {
                                                    action: "toggle"
                                                },
                                            }
                                        },
                                        {
                                            type: "conditional",
                                            conditions: [
                                                {
                                                    entity: "${SCENE_STATE}",
                                                    state: "unavailable"
                                                },
                                                // {
                                                //   entity: "${SCENE_STATE}",
                                                //   state: "off"
                                                // }
                                            ],
                                            card: {
                                                type: "custom:mushroom-template-card",
                                                secondary: "Utiliser l'éclairage actuel",
                                                multiline_secondary: true,
                                                icon: "mdi:pencil",
                                                layout: "vertical",
                                                tap_action: {
                                                    action: "call-service",
                                                    service: `${_variables__WEBPACK_IMPORTED_MODULE_1__.MAGIC_AREAS_DOMAIN}.snapshot_lights_as_tod_scene`,
                                                    data: {
                                                        area: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.slugify)(device.name),
                                                        tod
                                                    }
                                                },
                                            },
                                        }
                                    ]
                                }
                            })) : [{
                                    type: "custom:mushroom-template-card",
                                    primary: "Ajouter une nouvelle scène",
                                    secondary: `Cliquer ici pour vous rendre sur la page des scènes`,
                                    multiline_secondary: true,
                                    icon: `mdi:palette`,
                                    tap_action: {
                                        action: "fire-dom-event",
                                        browser_mod: {
                                            service: "browser_mod.sequence",
                                            data: {
                                                sequence: [
                                                    {
                                                        service: "browser_mod.navigate",
                                                        data: { path: `/config/scene/dashboard` }
                                                    },
                                                    {
                                                        service: "browser_mod.close_popup",
                                                        data: {}
                                                    }
                                                ]
                                            }
                                        }
                                    },
                                    card_mod: {
                                        style: `
              ha-card {
                box-shadow: none!important;
              }
            `
                                    }
                                }])
                        ].filter(Boolean)
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.PopupActionConfig} options The chip options.
     */
    constructor(device) {
        super();
        const defaultConfig = this.getDefaultConfig(device);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/popups/SettingsPopup.ts":
/*!*************************************!*\
  !*** ./src/popups/SettingsPopup.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SettingsPopup: () => (/* binding */ SettingsPopup)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _linus_strategy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../linus-strategy */ "./src/linus-strategy.ts");
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Linus Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class SettingsPopup extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__.AbstractPopup {
    getDefaultConfig() {
        const linusDeviceIds = Object.values(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices).map((area) => area?.id).flat();
        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.text.settings_chip.title"),
                    content: {
                        type: "vertical-stack",
                        cards: [
                            {
                                type: "horizontal-stack",
                                cards: [
                                    linusDeviceIds.length > 0 && {
                                        type: "custom:mushroom-template-card",
                                        primary: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.text.settings_chip.reload"),
                                        icon: "mdi:refresh",
                                        icon_color: "blue",
                                        tap_action: {
                                            action: "call-service",
                                            service: `homeassistant.reload_config_entry`,
                                            target: { "device_id": linusDeviceIds },
                                        }
                                    },
                                    {
                                        type: "custom:mushroom-template-card",
                                        primary: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.text.settings_chip.restart"),
                                        icon: "mdi:restart",
                                        icon_color: "red",
                                        tap_action: {
                                            action: "call-service",
                                            service: "homeassistant.restart",
                                        }
                                    },
                                ].filter(Boolean)
                            },
                            {
                                type: "markdown",
                                content: `Linus dashboard est en version ${_linus_strategy__WEBPACK_IMPORTED_MODULE_1__.version}.`,
                            },
                        ]
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.PopupActionConfig} options The chip options.
     */
    constructor() {
        super();
        const defaultConfig = this.getDefaultConfig();
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/popups/TeslaPopup.ts":
/*!**********************************!*\
  !*** ./src/popups/TeslaPopup.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   TeslaPopup: () => (/* binding */ TeslaPopup)
/* harmony export */ });
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Scene Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class TeslaPopup extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_0__.AbstractPopup {
    getDefaultConfig() {
        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: "Configurer les scènes",
                    content: {
                        type: "vertical-stack",
                        cards: [
                            {
                                type: "conditional",
                                condition: "and",
                                conditions: [
                                    {
                                        entity: "input_boolean.tesla_charger_menu",
                                        state: "off"
                                    },
                                    {
                                        entity: "input_boolean.tesla_controls_menu",
                                        state: "off"
                                    },
                                    {
                                        entity: "input_boolean.tesla_climate_menu",
                                        state: "off"
                                    }
                                ],
                                card: {
                                    type: "custom:stack-in-card",
                                    cards: [
                                        {
                                            type: "picture-elements",
                                            image: "/local/homeassistant-fe-tesla-main/images/models/3/red/baseWide.jpg",
                                            entity: "button.fennec_force_data_update",
                                            elements: [
                                                {
                                                    type: "state-label",
                                                    entity: "sensor.fennec_range",
                                                    style: {
                                                        top: "7.2%",
                                                        left: "22%",
                                                        fontweight: "bold",
                                                        fontsize: "100%",
                                                        color: "#8a8a8d",
                                                        fontfamily: "gotham"
                                                    }
                                                },
                                                {
                                                    type: "state-icon",
                                                    show_name: true,
                                                    title: "Refresh Data",
                                                    entity: "button.fennec_force_data_update",
                                                    icon: "mdi:refresh",
                                                    style: {
                                                        top: "9.5%",
                                                        left: "90%",
                                                        color: "#039be5",
                                                        width: "40px",
                                                        height: "50px"
                                                    },
                                                    tap_action: {
                                                        action: "call-service",
                                                        service: "button.press",
                                                        service_data: {},
                                                        target: {
                                                            entity_id: "button.fennec_force_data_update"
                                                        }
                                                    },
                                                    double_tap_action: "none",
                                                    hold_action: "none"
                                                },
                                                {
                                                    type: "image",
                                                    title: "Unlock",
                                                    style: {
                                                        top: "30%",
                                                        left: "90%",
                                                        width: "40px",
                                                        height: "40px"
                                                    },
                                                    state_image: {
                                                        locked: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Door_Lock.jpg",
                                                        unlocked: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Door_Unlock.jpg"
                                                    },
                                                    tap_action: {
                                                        action: "toggle"
                                                    },
                                                    entity: "lock.fennec_doors",
                                                    double_tap_action: "none",
                                                    hold_action: "none"
                                                },
                                                {
                                                    type: "image",
                                                    title: "ClimateIcon",
                                                    image: "/local/homeassistant-fe-tesla-main/images/buttonsTesla_Climate_Fan_On.jpg",
                                                    style: {
                                                        top: "50%",
                                                        left: "90%",
                                                        width: "40px",
                                                        height: "40px"
                                                    },
                                                    state_image: {
                                                        off: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Fan_Off.jpg"
                                                    },
                                                    tap_action: {
                                                        action: "toggle"
                                                    },
                                                    entity: "climate.fennec_hvac_climate_system",
                                                    double_tap_action: "none",
                                                    hold_action: "none"
                                                },
                                                {
                                                    type: "image",
                                                    title: "Unlock",
                                                    image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Charge_Port_Closed.jpg",
                                                    style: {
                                                        top: "72%",
                                                        left: "90%",
                                                        width: "40px",
                                                        height: "40px"
                                                    },
                                                    tap_action: {
                                                        action: "toggle"
                                                    },
                                                    entity: "input_boolean.tesla_charger_menu",
                                                    double_tap_action: "none",
                                                    hold_action: "none"
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "cover.fennec_charger_door",
                                                            state: "open"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "image",
                                                            title: "Charger_Door_Body",
                                                            style: {
                                                                top: "55.2%",
                                                                left: "50.9%",
                                                                width: "298px",
                                                                height: "298px"
                                                            },
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_ChargePort_Opened.jpg"
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "image",
                                                    title: "Frunk",
                                                    image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Frunk_Closed.jpg",
                                                    style: {
                                                        top: "90%",
                                                        left: "90%",
                                                        width: "40px",
                                                        height: "40px"
                                                    },
                                                    state_image: {
                                                        opened: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Frunk_Opened.jpg"
                                                    },
                                                    tap_action: {
                                                        action: "toggle"
                                                    },
                                                    entity: "cover.fennec_frunk",
                                                    double_tap_action: "none",
                                                    hold_action: "none"
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "cover.fennec_frunk",
                                                            state: "open"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "image",
                                                            title: "Frunk_Body",
                                                            style: {
                                                                top: "55%",
                                                                left: "50.9%",
                                                                width: "288px",
                                                                height: "288px"
                                                            },
                                                            image: "/local/homeassistant-fe-tesla-main/images/models/3/red/baseFrunkOpened.jpg"
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "cover.fennec_charger_door",
                                                            state: "open"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "icon",
                                                            icon: "mdi:ev-plug-tesla",
                                                            tap_action: "toggle",
                                                            double_tap_action: "none",
                                                            hold_action: "none",
                                                            style: {
                                                                top: "13%",
                                                                left: "21%",
                                                                color: "#039be5"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "cover.fennec_charger_door",
                                                            state_not: "open"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "icon",
                                                            icon: "mdi:ev-plug-tesla",
                                                            tap_action: "none",
                                                            double_tap_action: "none",
                                                            hold_action: "none",
                                                            style: {
                                                                top: "13%",
                                                                left: "21%",
                                                                color: "black"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "binary_sensor.fennec_charger",
                                                            state: "on"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "state-label",
                                                            entity: "sensor.fennec_charging_rate",
                                                            tap_action: "none",
                                                            double_tap_action: "none",
                                                            hold_action: "none",
                                                            style: {
                                                                top: "26%",
                                                                left: "21%",
                                                                fontsize: "100%",
                                                                fontweight: "normal",
                                                                color: "#039be5"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "binary_sensor.fennec_charger",
                                                            state: "on"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "state-label",
                                                            entity: "binary_sensor.fennec_charger",
                                                            attribute: "charging_state",
                                                            tap_action: "none",
                                                            double_tap_action: "none",
                                                            hold_action: "none",
                                                            style: {
                                                                top: "22%",
                                                                left: "21%",
                                                                fontsize: "100%",
                                                                fontweight: "normal",
                                                                color: "#039be5"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "image",
                                                    title: "Controls",
                                                    image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Controls_Button_Stateless.jpg",
                                                    style: {
                                                        top: "80%",
                                                        left: "42%",
                                                        width: "400px",
                                                        height: "100px"
                                                    },
                                                    tap_action: {
                                                        action: "toggle"
                                                    },
                                                    entity: "input_boolean.tesla_controls_menu",
                                                    double_tap_action: "none",
                                                    hold_action: "none"
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "climate.fennec_hvac_climate_system",
                                                            state: "off"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "image",
                                                            title: "ClimateControls",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Button_Off.jpg",
                                                            style: {
                                                                fontfamily: "gotham",
                                                                top: "96%",
                                                                left: "42%",
                                                                width: "400px",
                                                                height: "100px"
                                                            },
                                                            tap_action: {
                                                                action: "toggle"
                                                            },
                                                            entity: "input_boolean.tesla_climate_menu",
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "climate.fennec_hvac_climate_system",
                                                            state: "heat_cool"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "image",
                                                            title: "ClimateControls",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Button_On.jpg",
                                                            style: {
                                                                fontfamily: "gotham",
                                                                top: "96%",
                                                                left: "42%",
                                                                width: "400px",
                                                                height: "100px"
                                                            },
                                                            tap_action: {
                                                                action: "toggle"
                                                            },
                                                            entity: "input_boolean.tesla_climate_menu",
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "climate.fennec_hvac_climate_system",
                                                            state: "heat_cool"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "state-label",
                                                            entity: "sensor.fennec_temperature_inside",
                                                            style: {
                                                                top: "94.44%",
                                                                left: "41.3%",
                                                                fontsize: "97%",
                                                                color: "#8a8a8d",
                                                                fontfamily: "gotham"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "climate.fennec_hvac_climate_system",
                                                            state: "off"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "state-label",
                                                            entity: "sensor.fennec_temperature_inside",
                                                            style: {
                                                                top: "94.44%",
                                                                left: "30.3%",
                                                                fontsize: "97%",
                                                                color: "#8a8a8d",
                                                                fontfamily: "gotham"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "binary_sensor.fennec_ischarging",
                                                            state: "on"
                                                        },
                                                        {
                                                            entity: "device_tracker.fennec_location_tracker",
                                                            state: "home"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "icon",
                                                            icon: "mdi:home-lightning-bolt-outline",
                                                            tap_action: "none",
                                                            double_tap_action: "none",
                                                            hold_action: "none",
                                                            style: {
                                                                top: "84.7%",
                                                                left: "55%",
                                                                color: "green"
                                                            }
                                                        }
                                                    ]
                                                },
                                                {
                                                    type: "conditional",
                                                    conditions: [
                                                        {
                                                            entity: "binary_sensor.fennec_ischarging",
                                                            state: "on"
                                                        },
                                                        {
                                                            entity: "device_tracker.fennec_location_tracker",
                                                            state_not: "home"
                                                        }
                                                    ],
                                                    elements: [
                                                        {
                                                            type: "icon",
                                                            icon: "mdi:ev-station",
                                                            tap_action: "none",
                                                            double_tap_action: "none",
                                                            hold_action: "none",
                                                            style: {
                                                                top: "84.7%",
                                                                left: "55%",
                                                                color: "green"
                                                            }
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                type: "conditional",
                                conditions: [
                                    {
                                        entity: "input_boolean.tesla_charger_menu",
                                        state: "on"
                                    }
                                ],
                                card: {
                                    type: "custom:stack-in-card",
                                    cards: [
                                        {
                                            type: "horizontal-stack",
                                            cards: [
                                                {
                                                    type: "markdown",
                                                    content: "Charge limit: <font color=white> {{states('number.fennec_charge_limit')}} % </font>\n<font color=#8a8a8d> {{state_attr('sensor.fennec_energy_added', 'added_range')}} km added during last charging session </font>  ",
                                                    card_mod: {
                                                        style: "ha-card {\nfont-family: gotham;\nborder: none;\n}\n"
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            type: "entities",
                                            entities: [
                                                {
                                                    type: "custom:slider-entity-row",
                                                    entity: "number.fennec_charge_limit",
                                                    full_row: true,
                                                    step: 5,
                                                    max: 100,
                                                    min: 0,
                                                    colorize: true,
                                                    hide_state: true,
                                                    card_mod: {
                                                        style: "ha-card {\n  font-family: gotham;\n  border: none;\n}\n"
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            type: "horizontal-stack",
                                            cards: [
                                                {
                                                    type: "markdown",
                                                    content: "\\<",
                                                    card_mod: {
                                                        style: "ha-card {\n  font-family: gotham;\n  border: none;\n  text-align: left;\n}\n"
                                                    }
                                                },
                                                {
                                                    type: "glance",
                                                    entities: [
                                                        {
                                                            entity: "number.fennec_charging_amps"
                                                        }
                                                    ],
                                                    show_icon: false,
                                                    show_name: false,
                                                    card_mod: {
                                                        style: "ha-card {\n  font-family: gotham;\n  border: none;\n  color: white;\n  font-weight: bold;\n}\n"
                                                    }
                                                },
                                                {
                                                    type: "markdown",
                                                    content: "\\>",
                                                    card_mod: {
                                                        style: "ha-card {\n  font-family: gotham;\n  border: none;\n  text-align: right;\n}\n"
                                                    }
                                                }
                                            ]
                                        },
                                        {
                                            type: "button",
                                            tap_action: {
                                                action: "toggle"
                                            },
                                            entity: "input_boolean.tesla_charger_menu",
                                            show_state: false,
                                            show_icon: true,
                                            show_name: false,
                                            icon: "mdi:arrow-down",
                                            icon_height: "15px",
                                            card_mod: {
                                                style: "ha-card {\n  font-family: gotham;\n  font-weight: bold;\n  border: none;\n}\n"
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                type: "conditional",
                                conditions: [
                                    {
                                        entity: "input_boolean.tesla_controls_menu",
                                        state: "on"
                                    }
                                ],
                                card: {
                                    type: "custom:stack-in-card",
                                    cards: [
                                        {
                                            type: "horizontal-stack",
                                            cards: [
                                                {
                                                    type: "picture-elements",
                                                    image: "/local/homeassistant-fe-tesla-main/images/models/3/red/controlsBackground.jpg",
                                                    entity: "button.fennec_force_data_update",
                                                    elements: [
                                                        {
                                                            type: "state-label",
                                                            entity: "sensor.fennec_range",
                                                            style: {
                                                                top: "7.2%",
                                                                left: "22%",
                                                                fontweight: "bold",
                                                                fontsize: "100%",
                                                                color: "#8a8a8d",
                                                                fontfamily: "gotham"
                                                            },
                                                            card_mod: {
                                                                style: "ha-card {\n  font-family: gotham;\n  border: none;\n}\n"
                                                            }
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Flash",
                                                            entity: "button.fennec_flash_lights",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Flash_Lights_Button.jpg",
                                                            style: {
                                                                top: "20%",
                                                                left: "70%",
                                                                width: "40px",
                                                                height: "40px"
                                                            },
                                                            tap_action: {
                                                                action: "call-service",
                                                                service: "button.press",
                                                                service_data: {},
                                                                target: {
                                                                    entity_id: "button.fennec_flash_lights"
                                                                }
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Horn",
                                                            entity: "button.fennec_horn",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Horn_Button.jpg",
                                                            style: {
                                                                top: "40%",
                                                                left: "70%",
                                                                width: "40px",
                                                                height: "40px"
                                                            },
                                                            tap_action: {
                                                                action: "call-service",
                                                                service: "button.press",
                                                                service_data: {},
                                                                target: {
                                                                    entity_id: "button.fennec_horn"
                                                                }
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Remote Start",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Remote_Start_Button_Off.jpg",
                                                            style: {
                                                                top: "60%",
                                                                left: "70%",
                                                                width: "40px",
                                                                height: "40px"
                                                            },
                                                            tap_action: {
                                                                action: "call-service",
                                                                service: "button.press",
                                                                service_data: {},
                                                                target: {
                                                                    entity_id: "button.fennec_remote_start"
                                                                }
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Vent",
                                                            state_image: {
                                                                opened: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Close_Windows_Button.jpg",
                                                                closed: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Vent_Windows_Button.jpg"
                                                            },
                                                            style: {
                                                                top: "80%",
                                                                left: "70%",
                                                                width: "40px",
                                                                height: "40px"
                                                            },
                                                            tap_action: {
                                                                action: "toggle"
                                                            },
                                                            entity: "cover.fennec_windows",
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        }
                                                    ]
                                                }
                                            ]
                                        },
                                        {
                                            type: "button",
                                            tap_action: {
                                                action: "toggle"
                                            },
                                            entity: "input_boolean.tesla_controls_menu",
                                            show_state: false,
                                            show_icon: true,
                                            show_name: false,
                                            icon: "mdi:arrow-down",
                                            icon_height: "15px",
                                            card_mod: {
                                                style: "ha-card {\n  font-family: gotham;\n  font-weight: bold;\n  border: none;\n}\n"
                                            }
                                        }
                                    ]
                                }
                            },
                            {
                                type: "conditional",
                                conditions: [
                                    {
                                        entity: "input_boolean.tesla_climate_menu",
                                        state: "on"
                                    }
                                ],
                                card: {
                                    type: "custom:stack-in-card",
                                    cards: [
                                        {
                                            type: "horizontal-stack",
                                            cards: [
                                                {
                                                    type: "picture-elements",
                                                    image: "/local/homeassistant-fe-tesla-main/images/models/3/red/climateBackground_Fire8HD.jpg",
                                                    entity: "button.fennec_force_data_update",
                                                    elements: [
                                                        {
                                                            type: "image",
                                                            title: "Heated_Seat_Left",
                                                            entity: "select.fennec_heated_seat_left",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                                                            style: {
                                                                top: "31%",
                                                                left: "25.9%",
                                                                width: "25px",
                                                                height: "25px"
                                                            },
                                                            tap_action: {
                                                                action: "call-service",
                                                                service: "button.press",
                                                                service_data: {},
                                                                target: {
                                                                    entity_id: "select.fennec_heated_seat_left"
                                                                }
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Heated_Seat_Right",
                                                            entity: "select.fennec_heated_seat_right",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                                                            style: {
                                                                top: "31%",
                                                                left: "38%",
                                                                width: "25px",
                                                                height: "25px"
                                                            },
                                                            tap_action: {
                                                                action: "call-service",
                                                                service: "button.press",
                                                                service_data: {},
                                                                target: {
                                                                    entity_id: "select.fennec_heated_seat_right"
                                                                }
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Heated_Seat_Rear_Left",
                                                            entity: "select.fennec_heated_seat_rear_left",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                                                            style: {
                                                                top: "50%",
                                                                left: "25.9%",
                                                                width: "25px",
                                                                height: "25px"
                                                            },
                                                            tap_action: {
                                                                action: "call-service",
                                                                service: "button.press",
                                                                service_data: {},
                                                                target: {
                                                                    entity_id: "select.fennec_heated_seat_rear_left"
                                                                }
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Heated_Seat_Rear_Center",
                                                            entity: "select.fennec_heated_seat_rear_center",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                                                            style: {
                                                                top: "50%",
                                                                left: "31.5%",
                                                                width: "25px",
                                                                height: "25px"
                                                            },
                                                            tap_action: {
                                                                action: "call-service",
                                                                service: "button.press",
                                                                service_data: {},
                                                                target: {
                                                                    entity_id: "select.fennec_heated_seat_rear_center"
                                                                }
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Heated_Seat_Rear_Right",
                                                            entity: "select.fennec_heated_seat_rear_right",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                                                            style: {
                                                                top: "50%",
                                                                left: "37.2%",
                                                                width: "25px",
                                                                height: "25px"
                                                            },
                                                            tap_action: {
                                                                action: "call-service",
                                                                service: "button.press",
                                                                service_data: {},
                                                                target: {
                                                                    entity_id: "select.fennec_heated_seat_rear_right"
                                                                }
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "state-label",
                                                            prefix: "Interior ",
                                                            entity: "sensor.fennec_temperature_inside",
                                                            style: {
                                                                top: "20%",
                                                                left: "64%",
                                                                fontsize: "92%",
                                                                color: "#8a8a8d",
                                                                fontfamily: "gotham"
                                                            }
                                                        },
                                                        {
                                                            type: "state-label",
                                                            prefix: "- Exterior ",
                                                            entity: "sensor.fennec_temperature_outside",
                                                            style: {
                                                                top: "20%",
                                                                left: "87%",
                                                                fontsize: "92%",
                                                                color: "#8a8a8d",
                                                                fontfamily: "gotham"
                                                            }
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Climate",
                                                            entity: "climate.fennec_hvac_climate_system",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Button_Power_Off.jpg",
                                                            style: {
                                                                top: "40%",
                                                                left: "58%",
                                                                width: "50px",
                                                                height: "50px"
                                                            },
                                                            tap_action: {
                                                                action: "toggle",
                                                                entity_id: "climate.fennec_hvac_climate_system"
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "state-label",
                                                            entity: "climate.fennec_hvac_climate_system",
                                                            attribute: "temperature",
                                                            style: {
                                                                top: "42.5%",
                                                                left: "73.7%",
                                                                fontsize: "200%",
                                                                fontfamily: "gotham",
                                                                color: "white"
                                                            }
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Vent_Windows",
                                                            entity: "cover.fennec_windows",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Vent_Windows_Button.jpg",
                                                            style: {
                                                                top: "41%",
                                                                left: "90.5%",
                                                                width: "60px",
                                                                height: "60px"
                                                            },
                                                            tap_action: {
                                                                action: "toggle"
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Defrost",
                                                            entity: "cover.fennec_windows",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Button_Defrost_Off_324.jpg",
                                                            style: {
                                                                top: "77%",
                                                                left: "74.5%",
                                                                width: "210px",
                                                                height: "150px"
                                                            },
                                                            tap_action: {
                                                                action: "toggle"
                                                            },
                                                            double_tap_action: "none",
                                                            hold_action: "none"
                                                        },
                                                        {
                                                            type: "image",
                                                            title: "Defrost",
                                                            image: "/local/homeassistant-fe-tesla-main/images/buttons/Telsa_Back_Button.jpg",
                                                            style: {
                                                                top: "8%",
                                                                left: "7%",
                                                                width: "50px",
                                                                height: "50px"
                                                            },
                                                            tap_action: {
                                                                action: "toggle"
                                                            },
                                                            entity: "input_boolean.tesla_climate_menu"
                                                        }
                                                    ]
                                                }
                                            ]
                                        }
                                    ]
                                }
                            },
                            {
                                type: "map",
                                entities: [
                                    {
                                        entity: "device_tracker.fennec_location_tracker"
                                    }
                                ],
                                hours_to_show: 24,
                                dark_mode: true,
                                default_zoom: 12
                            }
                        ]
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.PopupActionConfig} options The chip options.
     */
    constructor() {
        super();
        const defaultConfig = this.getDefaultConfig();
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/popups/WeatherPopup.ts":
/*!************************************!*\
  !*** ./src/popups/WeatherPopup.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WeatherPopup: () => (/* binding */ WeatherPopup)
/* harmony export */ });
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Weather Chip class.
 *
 * Used to create a chip to indicate how many Weathers are on and to turn all off.
 */
class WeatherPopup extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_0__.AbstractPopup {
    getDefaultConfig(entityId) {
        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: "Météo",
                    content: {
                        type: "vertical-stack",
                        cards: [
                            {
                                type: "weather-forecast",
                                entity: entityId,
                                show_current: true,
                                show_forecast: true
                            },
                        ]
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.PopupActionConfig} options The chip options.
     */
    constructor(entity_id) {
        super();
        this.config = Object.assign(this.config, this.getDefaultConfig(entity_id));
    }
}



/***/ }),

/***/ "./src/types/homeassistant/data/area_registry.ts":
/*!*******************************************************!*\
  !*** ./src/types/homeassistant/data/area_registry.ts ***!
  \*******************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/homeassistant/data/climate.ts":
/*!*************************************************!*\
  !*** ./src/types/homeassistant/data/climate.ts ***!
  \*************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HVAC_MODES: () => (/* binding */ HVAC_MODES)
/* harmony export */ });
const HVAC_MODES = [
    "auto",
    "heat_cool",
    "heat",
    "cool",
    "dry",
    "fan_only",
    "off",
];
HVAC_MODES.reduce((order, mode, index) => {
    order[mode] = index;
    return order;
}, {});


/***/ }),

/***/ "./src/types/homeassistant/data/device_registry.ts":
/*!*********************************************************!*\
  !*** ./src/types/homeassistant/data/device_registry.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/homeassistant/data/entity_registry.ts":
/*!*********************************************************!*\
  !*** ./src/types/homeassistant/data/entity_registry.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/homeassistant/data/floor_registry.ts":
/*!********************************************************!*\
  !*** ./src/types/homeassistant/data/floor_registry.ts ***!
  \********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/homeassistant/data/frontend.ts":
/*!**************************************************!*\
  !*** ./src/types/homeassistant/data/frontend.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ResourceKeys: () => (/* binding */ ResourceKeys)
/* harmony export */ });
var ResourceKeys;
(function (ResourceKeys) {
    ResourceKeys["todo"] = "todo";
    ResourceKeys["fan"] = "fan";
    ResourceKeys["ffmpeg"] = "ffmpeg";
    ResourceKeys["water_heater"] = "water_heater";
    ResourceKeys["shopping_list"] = "shopping_list";
    ResourceKeys["siren"] = "siren";
    ResourceKeys["media_player"] = "media_player";
    ResourceKeys["input_boolean"] = "input_boolean";
    ResourceKeys["input_text"] = "input_text";
    ResourceKeys["cover"] = "cover";
    ResourceKeys["input_number"] = "input_number";
    ResourceKeys["counter"] = "counter";
    ResourceKeys["scene"] = "scene";
    ResourceKeys["notify"] = "notify";
    ResourceKeys["light"] = "light";
    ResourceKeys["humidifier"] = "humidifier";
    ResourceKeys["person"] = "person";
    ResourceKeys["lovelace"] = "lovelace";
    ResourceKeys["time"] = "time";
    ResourceKeys["zone"] = "zone";
    ResourceKeys["update"] = "update";
    ResourceKeys["timer"] = "timer";
    ResourceKeys["persistent_notification"] = "persistent_notification";
    ResourceKeys["button"] = "button";
    ResourceKeys["group"] = "group";
    ResourceKeys["date"] = "date";
    ResourceKeys["recorder"] = "recorder";
    ResourceKeys["number"] = "number";
    ResourceKeys["text"] = "text";
    ResourceKeys["climate"] = "climate";
    ResourceKeys["demo"] = "demo";
    ResourceKeys["schedule"] = "schedule";
    ResourceKeys["script"] = "script";
    ResourceKeys["alarm_control_panel"] = "alarm_control_panel";
    ResourceKeys["device_tracker"] = "device_tracker";
    ResourceKeys["system_log"] = "system_log";
    ResourceKeys["logbook"] = "logbook";
    ResourceKeys["conversation"] = "conversation";
    ResourceKeys["image_processing"] = "image_processing";
    ResourceKeys["automation"] = "automation";
    ResourceKeys["input_datetime"] = "input_datetime";
    ResourceKeys["homeassistant"] = "homeassistant";
    ResourceKeys["datetime"] = "datetime";
    ResourceKeys["logger"] = "logger";
    ResourceKeys["vacuum"] = "vacuum";
    ResourceKeys["weather"] = "weather";
    ResourceKeys["switch"] = "switch";
    ResourceKeys["backup"] = "backup";
    ResourceKeys["frontend"] = "frontend";
    ResourceKeys["calendar"] = "calendar";
    ResourceKeys["cloud"] = "cloud";
    ResourceKeys["camera"] = "camera";
    ResourceKeys["input_button"] = "input_button";
    ResourceKeys["select"] = "select";
    ResourceKeys["tts"] = "tts";
    ResourceKeys["input_select"] = "input_select";
    ResourceKeys["lock"] = "lock";
    ResourceKeys["tag"] = "tag";
    ResourceKeys["event"] = "event";
    ResourceKeys["stt"] = "stt";
    ResourceKeys["air_quality"] = "air_quality";
    ResourceKeys["sensor"] = "sensor";
    ResourceKeys["binary_sensor"] = "binary_sensor";
    ResourceKeys["wake_word"] = "wake_word";
})(ResourceKeys || (ResourceKeys = {}));


/***/ }),

/***/ "./src/types/homeassistant/data/light.ts":
/*!***********************************************!*\
  !*** ./src/types/homeassistant/data/light.ts ***!
  \***********************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/homeassistant/data/linus_dashboard.ts":
/*!*********************************************************!*\
  !*** ./src/types/homeassistant/data/linus_dashboard.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/homeassistant/data/lovelace.ts":
/*!**************************************************!*\
  !*** ./src/types/homeassistant/data/lovelace.ts ***!
  \**************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/homeassistant/lovelace/cards/types.ts":
/*!*********************************************************!*\
  !*** ./src/types/homeassistant/lovelace/cards/types.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/homeassistant/panels/lovelave/cards/types.ts":
/*!****************************************************************!*\
  !*** ./src/types/homeassistant/panels/lovelave/cards/types.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/homeassistant/types.ts":
/*!******************************************!*\
  !*** ./src/types/homeassistant/types.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/chips-card.ts":
/*!*********************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/chips-card.ts ***!
  \*********************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/climate-card-config.ts":
/*!******************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/climate-card-config.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/cover-card-config.ts":
/*!****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/cover-card-config.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/entity-card-config.ts":
/*!*****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/entity-card-config.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/fan-card-config.ts":
/*!**************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/fan-card-config.ts ***!
  \**************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/light-card-config.ts":
/*!****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/light-card-config.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/lock-card-config.ts":
/*!***************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/lock-card-config.ts ***!
  \***************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/media-player-card-config.ts":
/*!***********************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/media-player-card-config.ts ***!
  \***********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MEDIA_LAYER_MEDIA_CONTROLS: () => (/* binding */ MEDIA_LAYER_MEDIA_CONTROLS),
/* harmony export */   MEDIA_PLAYER_VOLUME_CONTROLS: () => (/* binding */ MEDIA_PLAYER_VOLUME_CONTROLS)
/* harmony export */ });
const MEDIA_LAYER_MEDIA_CONTROLS = [
    "on_off",
    "shuffle",
    "previous",
    "play_pause_stop",
    "next",
    "repeat",
];
const MEDIA_PLAYER_VOLUME_CONTROLS = [
    "volume_mute",
    "volume_set",
    "volume_buttons",
];


/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/number-card-config.ts":
/*!*****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/number-card-config.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DISPLAY_MODES: () => (/* binding */ DISPLAY_MODES)
/* harmony export */ });
const DISPLAY_MODES = ["slider", "buttons"];


/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/person-card-config.ts":
/*!*****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/person-card-config.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/scene-card-config.ts":
/*!****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/scene-card-config.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/swipe-card-config.ts":
/*!****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/swipe-card-config.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/template-card-config.ts":
/*!*******************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/template-card-config.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/title-card-config.ts":
/*!****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/title-card-config.ts ***!
  \****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/cards/vacuum-card-config.ts":
/*!*****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/cards/vacuum-card-config.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VACUUM_COMMANDS: () => (/* binding */ VACUUM_COMMANDS)
/* harmony export */ });
const VACUUM_COMMANDS = [
    "on_off",
    "start_pause",
    "stop",
    "locate",
    "clean_spot",
    "return_home",
];


/***/ }),

/***/ "./src/types/lovelace-mushroom/shared/config/actions-config.ts":
/*!*********************************************************************!*\
  !*** ./src/types/lovelace-mushroom/shared/config/actions-config.ts ***!
  \*********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/lovelace-mushroom/shared/config/appearance-config.ts":
/*!************************************************************************!*\
  !*** ./src/types/lovelace-mushroom/shared/config/appearance-config.ts ***!
  \************************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   appearanceSharedConfigStruct: () => (/* binding */ appearanceSharedConfigStruct)
/* harmony export */ });
/* harmony import */ var superstruct__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! superstruct */ "./node_modules/superstruct/dist/index.mjs");
/* harmony import */ var _utils_layout__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./utils/layout */ "./src/types/lovelace-mushroom/shared/config/utils/layout.ts");
/* harmony import */ var _utils_info__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./utils/info */ "./src/types/lovelace-mushroom/shared/config/utils/info.ts");



const appearanceSharedConfigStruct = (0,superstruct__WEBPACK_IMPORTED_MODULE_2__.object)({
    layout: (0,superstruct__WEBPACK_IMPORTED_MODULE_2__.optional)(_utils_layout__WEBPACK_IMPORTED_MODULE_0__.layoutStruct),
    fill_container: (0,superstruct__WEBPACK_IMPORTED_MODULE_2__.optional)((0,superstruct__WEBPACK_IMPORTED_MODULE_2__.boolean)()),
    primary_info: (0,superstruct__WEBPACK_IMPORTED_MODULE_2__.optional)((0,superstruct__WEBPACK_IMPORTED_MODULE_2__.enums)(_utils_info__WEBPACK_IMPORTED_MODULE_1__.INFOS)),
    secondary_info: (0,superstruct__WEBPACK_IMPORTED_MODULE_2__.optional)((0,superstruct__WEBPACK_IMPORTED_MODULE_2__.enums)(_utils_info__WEBPACK_IMPORTED_MODULE_1__.INFOS)),
    icon_type: (0,superstruct__WEBPACK_IMPORTED_MODULE_2__.optional)((0,superstruct__WEBPACK_IMPORTED_MODULE_2__.enums)(_utils_info__WEBPACK_IMPORTED_MODULE_1__.ICON_TYPES)),
});


/***/ }),

/***/ "./src/types/lovelace-mushroom/shared/config/entity-config.ts":
/*!********************************************************************!*\
  !*** ./src/types/lovelace-mushroom/shared/config/entity-config.ts ***!
  \********************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   entitySharedConfigStruct: () => (/* binding */ entitySharedConfigStruct)
/* harmony export */ });
/* harmony import */ var superstruct__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! superstruct */ "./node_modules/superstruct/dist/index.mjs");

const entitySharedConfigStruct = (0,superstruct__WEBPACK_IMPORTED_MODULE_0__.object)({
    entity: (0,superstruct__WEBPACK_IMPORTED_MODULE_0__.optional)((0,superstruct__WEBPACK_IMPORTED_MODULE_0__.string)()),
    name: (0,superstruct__WEBPACK_IMPORTED_MODULE_0__.optional)((0,superstruct__WEBPACK_IMPORTED_MODULE_0__.string)()),
    icon: (0,superstruct__WEBPACK_IMPORTED_MODULE_0__.optional)((0,superstruct__WEBPACK_IMPORTED_MODULE_0__.string)()),
});


/***/ }),

/***/ "./src/types/lovelace-mushroom/shared/config/utils/info.ts":
/*!*****************************************************************!*\
  !*** ./src/types/lovelace-mushroom/shared/config/utils/info.ts ***!
  \*****************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ICON_TYPES: () => (/* binding */ ICON_TYPES),
/* harmony export */   INFOS: () => (/* binding */ INFOS)
/* harmony export */ });
const INFOS = ["name", "state", "last-changed", "last-updated", "none"];
const ICON_TYPES = ["icon", "entity-picture", "none"];


/***/ }),

/***/ "./src/types/lovelace-mushroom/shared/config/utils/layout.ts":
/*!*******************************************************************!*\
  !*** ./src/types/lovelace-mushroom/shared/config/utils/layout.ts ***!
  \*******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   layoutStruct: () => (/* binding */ layoutStruct)
/* harmony export */ });
/* harmony import */ var superstruct__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! superstruct */ "./node_modules/superstruct/dist/index.mjs");

const layoutStruct = (0,superstruct__WEBPACK_IMPORTED_MODULE_0__.union)([(0,superstruct__WEBPACK_IMPORTED_MODULE_0__.literal)("horizontal"), (0,superstruct__WEBPACK_IMPORTED_MODULE_0__.literal)("vertical"), (0,superstruct__WEBPACK_IMPORTED_MODULE_0__.literal)("default")]);


/***/ }),

/***/ "./src/types/lovelace-mushroom/utils/info.ts":
/*!***************************************************!*\
  !*** ./src/types/lovelace-mushroom/utils/info.ts ***!
  \***************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   INFOS: () => (/* binding */ INFOS)
/* harmony export */ });
const INFOS = ["name", "state", "last-changed", "last-updated", "none"];


/***/ }),

/***/ "./src/types/lovelace-mushroom/utils/lovelace/chip/types.ts":
/*!******************************************************************!*\
  !*** ./src/types/lovelace-mushroom/utils/lovelace/chip/types.ts ***!
  \******************************************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/strategy/cards.ts":
/*!*************************************!*\
  !*** ./src/types/strategy/cards.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/strategy/chips.ts":
/*!*************************************!*\
  !*** ./src/types/strategy/chips.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/types/strategy/generic.ts":
/*!***************************************!*\
  !*** ./src/types/strategy/generic.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   generic: () => (/* binding */ generic)
/* harmony export */ });
var generic;
(function (generic) {
    const hiddenSectionList = ["chips", "persons", "greeting", "areas", "areasTitle"];
    /**
     * Checks if the given object is an instance of CallServiceActionConfig.
     *
     * @param {any} obj - The object to be checked.
     * @return {boolean} - Returns true if the object is an instance of CallServiceActionConfig, otherwise false.
     */
    function isCallServiceActionConfig(obj) {
        return obj && obj.action === "call-service" && ["action", "service"].every(key => key in obj);
    }
    generic.isCallServiceActionConfig = isCallServiceActionConfig;
    /**
     * Checks if the given object is an instance of HassServiceTarget.
     *
     * @param {any} obj - The object to check.
     * @return {boolean} - True if the object is an instance of HassServiceTarget, false otherwise.
     */
    function isCallServiceActionTarget(obj) {
        return obj && ["entity_id", "device_id", "area_id"].some(key => key in obj);
    }
    generic.isCallServiceActionTarget = isCallServiceActionTarget;
})(generic || (generic = {}));


/***/ }),

/***/ "./src/types/strategy/views.ts":
/*!*************************************!*\
  !*** ./src/types/strategy/views.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);



/***/ }),

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   addLightGroupsToEntities: () => (/* binding */ addLightGroupsToEntities),
/* harmony export */   createCardsFromList: () => (/* binding */ createCardsFromList),
/* harmony export */   createChipsFromList: () => (/* binding */ createChipsFromList),
/* harmony export */   getAggregateEntity: () => (/* binding */ getAggregateEntity),
/* harmony export */   getAreaName: () => (/* binding */ getAreaName),
/* harmony export */   getDomainTranslationKey: () => (/* binding */ getDomainTranslationKey),
/* harmony export */   getEntityDomain: () => (/* binding */ getEntityDomain),
/* harmony export */   getFloorName: () => (/* binding */ getFloorName),
/* harmony export */   getGlobalEntitiesExceptUndisclosed: () => (/* binding */ getGlobalEntitiesExceptUndisclosed),
/* harmony export */   getMAEntity: () => (/* binding */ getMAEntity),
/* harmony export */   getMagicAreaSlug: () => (/* binding */ getMagicAreaSlug),
/* harmony export */   getStateContent: () => (/* binding */ getStateContent),
/* harmony export */   getStateTranslationKey: () => (/* binding */ getStateTranslationKey),
/* harmony export */   groupBy: () => (/* binding */ groupBy),
/* harmony export */   groupEntitiesByDomain: () => (/* binding */ groupEntitiesByDomain),
/* harmony export */   navigateTo: () => (/* binding */ navigateTo),
/* harmony export */   processEntitiesForAreaOrFloorView: () => (/* binding */ processEntitiesForAreaOrFloorView),
/* harmony export */   processEntitiesForView: () => (/* binding */ processEntitiesForView),
/* harmony export */   processFloorsAndAreas: () => (/* binding */ processFloorsAndAreas),
/* harmony export */   slugify: () => (/* binding */ slugify)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Helper */ "./src/Helper.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./variables */ "./src/variables.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _cards_GroupedCard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./cards/GroupedCard */ "./src/cards/GroupedCard.ts");
/* harmony import */ var _cards_ImageAreaCard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cards/ImageAreaCard */ "./src/cards/ImageAreaCard.ts");





/**
 * Mémoïse une fonction pour éviter les calculs répétitifs.
 * @param {Function} fn - La fonction à mémoïser.
 * @returns {Function} - La fonction mémoïsée.
 */
function memoize(fn) {
    const cache = new Map();
    return function (...args) {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn(...args);
        cache.set(key, result);
        return result;
    };
}
/**
 * Groups the elements of an array based on a provided function
 * @param {T[]} array - The array to group
 * @param {(item: T) => K} fn - The function to determine the group key for each element
 * @returns {Record<K, T[]>} - An object where the keys are the group identifiers et the values sont arrays of grouped elements
 */
const groupBy = memoize(function groupBy(array, fn) {
    return array.reduce((result, item) => {
        const key = fn(item);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
        return result;
    }, {});
});
/**
 * Converts a string to a slug format.
 * @param {string | null} text - The text to slugify.
 * @param {string} [separator="_"] - The separator to use.
 * @returns {string} - The slugified text.
 */
const slugify = memoize(function slugify(text, separator = "_") {
    if (text === "" || text === null) {
        return "";
    }
    const slug = text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, separator)
        .replace(/-/g, "_");
    return slug === "" ? "unknown" : slug;
});
/**
 * Get the slug for a magic area device.
 * @param {MagicAreaRegistryEntry} device - The magic area device.
 * @returns {string} - The slug for the device.
 */
const getMagicAreaSlug = memoize(function getMagicAreaSlug(device) {
    return slugify(device.name ?? "".replace('-', '_'));
});
/**
 * Get the state content for an entity.
 * @param {string} entity_id - The entity ID.
 * @returns {string} - The state content.
 */
function getStateContent(entity_id) {
    return entity_id.startsWith('binary_sensor.') ? 'last-changed' : 'state';
}
/**
 * Create an action config for navigation.
 * @param {string} path - The navigation path.
 * @returns {ActionConfig} - The action config.
 */
function navigateTo(path) {
    return {
        action: "navigate",
        navigation_path: `${path}`,
    };
}
/**
 * Get aggregate entities for a device.
 * @param {MagicAreaRegistryEntry} device - The magic area device.
 * @param {string | string[]} domains - The domains to get entities for.
 * @param {string | string[]} [device_classes] - The device classes to get entities for.
 * @returns {EntityRegistryEntry[]} - The aggregate entities.
 */
const getAggregateEntity = memoize(function getAggregateEntity(device, domains, device_classes) {
    const aggregateKeys = [];
    const domainList = Array.isArray(domains) ? domains : [domains];
    const deviceClassList = Array.isArray(device_classes) ? device_classes : [device_classes];
    domainList.forEach(domain => {
        if (domain === "light") {
            Object.values(device?.entities ?? {}).forEach(entity => {
                if (entity.entity_id.endsWith('_lights')) {
                    aggregateKeys.push(entity);
                }
            });
        }
        else if (_variables__WEBPACK_IMPORTED_MODULE_1__.GROUP_DOMAINS.includes(domain)) {
            aggregateKeys.push(device?.entities[`${domain}_group`]);
        }
        else if (_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(domain)) {
            deviceClassList.forEach(device_class => {
                aggregateKeys.push(device?.entities[`aggregate_${device_class}`]);
            });
        }
    });
    return aggregateKeys.filter(Boolean);
});
/**
 * Get a magic area entity.
 * @param {string} magic_device_id - The magic device ID.
 * @param {string} domain - The domain.
 * @param {string} [device_class] - The device class.
 * @returns {EntityRegistryEntry | undefined} - The magic area entity.
 */
const getMAEntity = memoize(function getMAEntity(magic_device_id, domain, device_class) {
    const magicAreaDevice = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[magic_device_id];
    if (domain === _variables__WEBPACK_IMPORTED_MODULE_1__.LIGHT_DOMAIN)
        return magicAreaDevice?.entities?.[''] ?? magicAreaDevice?.entities?.['all_lights'];
    if (_variables__WEBPACK_IMPORTED_MODULE_1__.GROUP_DOMAINS.includes(domain))
        return magicAreaDevice?.entities?.[`${domain}_group${device_class ? `_${device_class}` : ''}`];
    if (device_class && [..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.binary_sensor, ..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.sensor].includes(device_class))
        return magicAreaDevice?.entities?.[`aggregate_${device_class}`];
    return magicAreaDevice?.entities?.[domain] ?? undefined;
});
/**
 * Get the domain of an entity.
 * @param {string} entityId - The entity ID.
 * @returns {string} - The domain.
 */
const getEntityDomain = memoize(function getEntityDomain(entityId) {
    return entityId.split(".")[0];
});
/**
 * Group entities by domain.
 * @param {string[]} entity_ids - The entity IDs.
 * @returns {Record<string, string[]>} - The grouped entities.
 */
const groupEntitiesByDomain = memoize(function groupEntitiesByDomain(entity_ids) {
    return entity_ids.reduce((acc, entity_id) => {
        let domain = getEntityDomain(entity_id);
        let device_class;
        if (Object.keys(_variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES).includes(domain)) {
            const entityState = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(entity_id);
            if (entityState?.attributes?.device_class) {
                device_class = entityState.attributes.device_class;
            }
        }
        const domainTag = `${domain}${device_class ? ":" + device_class : ""}`;
        if (!acc[domainTag]) {
            acc[domainTag] = [];
        }
        acc[domainTag].push(entity_id);
        return acc;
    }, {});
});
/**
 * Create items (chips or cards) from a list.
 * @param {string[]} itemList - The list of items.
 * @param {Partial<chips.AggregateChipOptions> | Partial<generic.StrategyEntity>} [itemOptions] - The item options.
 * @param {string} [magic_device_id="global"] - The magic device ID.
 * @param {string | string[]} [area_slug] - The area slug.
 * @param {boolean} isChip - Flag to determine if creating chips or cards.
 * @returns {Promise<LovelaceChipConfig[] | LovelaceCardConfig[]>} - The created items.
 */
async function createItemsFromList(itemList, itemOptions, magic_device_id = "global", area_slug, isChip = true) {
    const items = [];
    const area_slugs = area_slug ? Array.isArray(area_slug) ? area_slug : [area_slug] : [];
    const domains = magic_device_id === "global"
        ? Object.keys(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains)
        : area_slugs.flatMap(area_slug => Object.keys(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug]?.domains ?? {}));
    for (let itemType of itemList) {
        let domain = itemType;
        let device_class;
        if (itemType.includes(":")) {
            [domain, device_class] = itemType.split(":");
        }
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.excluded_domains?.includes(domain))
            continue;
        if (device_class && _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.excluded_device_classes?.includes(device_class))
            continue;
        if (!domains.includes(itemType))
            continue;
        if (getGlobalEntitiesExceptUndisclosed(domain, device_class).length === 0)
            continue;
        const magicAreasEntity = getMAEntity(magic_device_id, domain, device_class);
        const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + (isChip ? "Chip" : "Card"));
        try {
            let itemModule;
            let item;
            try {
                itemModule = await __webpack_require__("./src lazy recursive ^\\.\\/.*\\/.*$")(`./${isChip ? "chips" : "cards"}/${className}`);
                item = new itemModule[className]({ ...itemOptions, device_class, magic_device_id, area_slug }, magicAreasEntity);
            }
            catch {
                itemModule = await __webpack_require__("./src lazy recursive ^\\.\\/.*\\/Aggregate.*$")(`./${isChip ? "chips" : "cards"}/Aggregate${isChip ? "Chip" : "Card"}`);
                item = new itemModule[`Aggregate${isChip ? "Chip" : "Card"}`]({
                    ...itemOptions,
                    entity: magicAreasEntity,
                    domain,
                    device_class,
                    area_slug,
                    magic_device_id,
                    tap_action: navigateTo(domain === "binary_sensor" || domain === "sensor" ? device_class ?? domain : domain)
                }, magicAreasEntity);
            }
            items.push(item.getChip ? item.getChip() : item.getCard());
        }
        catch (e) {
            _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError(`An error occurred while creating the ${itemType} ${isChip ? "chip" : "card"}!`, e);
        }
    }
    return items;
}
/**
 * Create chips from a list.
 * @param {string[]} chipsList - The list of chips.
 * @param {Partial<chips.AggregateChipOptions>} [chipOptions] - The chip options.
 * @param {string} [magic_device_id="global"] - The magic device ID.
 * @param {string | string[]} [area_slug] - The area slug.
 * @returns {Promise<LovelaceChipConfig[]>} - The created chips.
 */
async function createChipsFromList(chipsList, chipOptions, magic_device_id = "global", area_slug) {
    return createItemsFromList(chipsList, chipOptions, magic_device_id, area_slug, true);
}
/**
 * Create cards from a list.
 * @param {string[]} cardsList - The list of cards.
 * @param {Partial<generic.StrategyEntity>} [cardOptions] - The card options.
 * @param {string} [magic_device_id="global"] - The magic device ID.
 * @param {string | string[]} [area_slug] - The area slug.
 * @returns {Promise<LovelaceCardConfig[]>} - The created cards.
 */
async function createCardsFromList(cardsList, cardOptions, magic_device_id = "global", area_slug) {
    return createItemsFromList(cardsList, cardOptions, magic_device_id, area_slug, false);
}
/**
 * Get the translation key for a domain.
 * @param {string} domain - The domain.
 * @param {string} [device_class] - The device class.
 * @returns {string} - The translation key.
 */
const getDomainTranslationKey = memoize(function getDomainTranslationKey(domain, device_class) {
    if (domain === 'scene')
        return 'ui.dialogs.quick-bar.commands.navigation.scene';
    if (_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(domain) && device_class)
        return `component.${domain}.entity_component.${device_class}.name`;
    return `component.${domain}.entity_component._.name`;
});
/**
 * Get the translation key for a state.
 * @param {string} state - The state.
 * @param {string} domain - The domain.
 * @param {string} [device_class] - The device class.
 * @returns {string} - The translation key.
 */
const getStateTranslationKey = memoize(function getStateTranslationKey(state, domain, device_class) {
    if (domain === 'scene')
        return 'ui.dialogs.quick-bar.commands.navigation.scene';
    if (_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(domain))
        return `component.${domain}.entity_component.${device_class}.state.${state}`;
    return `component.${domain}.entity_component._.name`;
});
/**
 * Get the name of a floor.
 * @param {StrategyFloor} floor - The floor.
 * @returns {string} - The floor name.
 */
const getFloorName = memoize(function getFloorName(floor) {
    return floor.floor_id === _variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED ? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("ui.components.area-picker.unassigned_areas") : floor.name;
});
/**
 * Get the name of an area.
 * @param {StrategyArea} area - The area.
 * @returns {string} - The area name.
 */
const getAreaName = memoize(function getAreaName(area) {
    return area.area_id === _variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED ? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("ui.card.area.area_not_found") : area.name;
});
/**
 * Get global entities except undisclosed.
 * @param {string} device_class - The device class.
 * @returns {string[]} - The global entities.
 */
const getGlobalEntitiesExceptUndisclosed = memoize(function getGlobalEntitiesExceptUndisclosed(domain, device_class) {
    const dc = domain === "binary_sensor" || domain === "sensor" || domain === "cover" ? device_class : undefined;
    const domainTag = `${domain}${dc ? ":" + dc : ""}`;
    const entities = (domain === "cover" && !device_class
        ? _variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.cover.flatMap(d => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains[`cover:${d}`] ?? [])
        : _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains[domainTag] ?? []);
    return entities?.filter(entity => !_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[_variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED].domains?.[domainTag]?.includes(entity.entity_id)).map(e => e.entity_id) ?? [];
});
/**
 * Add light groups to entities.
 * @param {generic.StrategyArea} area - The area.
 * @param {generic.StrategyEntity[]} entities - The entities.
 * @returns {generic.StrategyEntity[]} - The entities with light groups added.
 */
function addLightGroupsToEntities(area, entities) {
    const lightGroups = _variables__WEBPACK_IMPORTED_MODULE_1__.LIGHT_GROUPS
        .map(type => getMAEntity(area.slug, type))
        .filter(Boolean);
    for (const lightGroup of lightGroups) {
        if (!lightGroup)
            continue;
        const lightGroupState = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(lightGroup.entity_id);
        if (lightGroupState.attributes.entity_id?.length) {
            entities.unshift(lightGroup);
            lightGroupState.attributes.entity_id.forEach((entity_id) => {
                const index = entities.findIndex(entity => entity.entity_id === entity_id);
                if (index !== -1) {
                    entities.splice(index, 1);
                }
            });
        }
    }
    return entities;
}
/**
 * Process floors and areas to generate view sections.
 * @param {string} domain - The domain of the entities.
 * @param {string} [device_class] - The device class of the entities.
 * @param {Function} processEntities - Function to process entities and generate cards.
 * @param {LovelaceCardConfig[]} viewControllerCard - Array of view controller cards.
 * @returns {Promise<LovelaceGridCardConfig[]>} - Promise resolving to an array of view sections.
 */
async function processFloorsAndAreas(domain, device_class, processEntities, viewControllerCard) {
    const viewSections = [];
    let isFirstLoop = true;
    const floors = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.orderedFloors;
    for (const floor of floors) {
        if (floor.areas_slug.length === 0 || !_variables__WEBPACK_IMPORTED_MODULE_1__.AREA_CARDS_DOMAINS.includes(domain ?? ""))
            continue;
        const floorCards = [];
        for (const area of floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug])) {
            let entities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getAreaEntities(area, domain, device_class);
            const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card");
            const cardModule = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`);
            if (entities.length === 0 || !cardModule)
                continue;
            if (domain === "light")
                entities = addLightGroupsToEntities(area, entities);
            const entityCards = await processEntities(entities, area, domain);
            if (entityCards.length) {
                const areaCards = [new _cards_GroupedCard__WEBPACK_IMPORTED_MODULE_3__.GroupedCard(entityCards).getCard()];
                const titleCardOptions = {
                    ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].controllerCardOptions,
                    subtitle: getAreaName(area),
                    subtitleIcon: area.area_id === _variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED ? "mdi:help-circle" : area.icon ?? "mdi:floor-plan",
                    subtitleNavigate: area.slug
                };
                if (domain) {
                    if (area.slug !== _variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED && (!_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(domain) || device_class)) {
                        titleCardOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].showControls;
                        titleCardOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].extraControls;
                        titleCardOptions.controlChipOptions = { device_class, area_slug: area.slug };
                    }
                    else {
                        titleCardOptions.showControls = false;
                    }
                }
                const areaControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(titleCardOptions, domain, area.slug).createCard();
                floorCards.push(...areaControllerCard, ...areaCards);
            }
        }
        if (floorCards.length) {
            const titleSectionOptions = {
                ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].controllerCardOptions,
                title: getFloorName(floor),
                titleIcon: floor.icon ?? "mdi:floor-plan",
                titleNavigate: slugify(floor.name)
            };
            if (domain) {
                if (floor.floor_id !== _variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED && (!_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(domain) || device_class)) {
                    titleSectionOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].showControls;
                    titleSectionOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].extraControls;
                    titleSectionOptions.controlChipOptions = {
                        device_class,
                        area_slug: floor.areas_slug
                    };
                }
                else {
                    titleSectionOptions.showControls = false;
                }
            }
            const floorControllerCard = floors.length > 1 ? new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(titleSectionOptions, domain, floor.floor_id).createCard() : [];
            const section = { type: "grid", cards: [] };
            if (isFirstLoop) {
                section.cards.push(...viewControllerCard);
                isFirstLoop = false;
            }
            section.cards.push(...floorControllerCard);
            section.cards.push(...floorCards);
            viewSections.push(section);
        }
    }
    return viewSections;
}
/**
 * Process entities for a view based on domain and device class.
 * @param {string} domain - The domain of the entities.
 * @param {string} [device_class] - The device class of the entities.
 * @param {LovelaceCardConfig[]} viewControllerCard - Array of view controller cards.
 * @returns {Promise<LovelaceGridCardConfig[]>} - Promise resolving to an array of view sections.
 */
async function processEntitiesForView(domain, device_class, viewControllerCard) {
    return processFloorsAndAreas(domain, device_class, processEntities, viewControllerCard);
}
/**
 * Process entities for an area or floor view.
 * @param {object} params - The parameters object.
 * @param {StrategyArea} [params.area] - The area to process entities for.
 * @param {StrategyFloor} [params.floor] - The floor to process entities for.
 * @returns {Promise<LovelaceGridCardConfig[]>} - Promise resolving to an array of view sections.
 */
async function processEntitiesForAreaOrFloorView({ area, floor, }) {
    const viewSections = [];
    const exposedDomainIds = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getExposedDomainIds();
    const isFloorView = !!floor;
    const areas = isFloorView ? floor.areas_slug.map(slug => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[slug]) : [area];
    const domainCardsMap = {};
    const miscellaneousEntities = [];
    for (const area of areas) {
        // Create global section card if area is not undisclosed
        if (!isFloorView && area.area_id !== _variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED && area.picture) {
            viewSections.push({
                type: "grid",
                column_span: 1,
                cards: [new _cards_ImageAreaCard__WEBPACK_IMPORTED_MODULE_4__.ImageAreaCard(area.area_id).getCard()],
            });
        }
        for (const domain of exposedDomainIds) {
            if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.excluded_domains?.includes(domain))
                continue;
            if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.excluded_device_classes?.includes(domain))
                continue;
            if (domain === "default")
                continue;
            try {
                const cardModule = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card")}`);
                let entities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getAreaEntities(area, domain);
                const configEntityHidden = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain]?.hide_config_entities || _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities;
                if (entities.length) {
                    if (!domainCardsMap[domain]) {
                        domainCardsMap[domain] = [];
                        if (isFloorView) {
                            const floorTitleCardOptions = {
                                ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].controllerCardOptions,
                                title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(getDomainTranslationKey(domain)),
                                domain,
                                titleIcon: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons[domain]._?.default,
                                titleNavigate: domain,
                            };
                            if (domain) {
                                if (_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(domain)) {
                                    floorTitleCardOptions.showControls = false;
                                }
                                else {
                                    floorTitleCardOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].showControls;
                                    floorTitleCardOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].extraControls;
                                    floorTitleCardOptions.controlChipOptions = { area_slug: area.slug };
                                }
                            }
                            const floorTitleCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(floorTitleCardOptions, domain, area.slug).createCard();
                            domainCardsMap[domain].push(...floorTitleCard);
                        }
                    }
                    const titleCardOptions = {
                        ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].controllerCardOptions,
                        subtitle: isFloorView ? area.name : _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(getDomainTranslationKey(domain)),
                        subtitleIcon: isFloorView ? area.icon : _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons[domain]._?.default,
                        domain,
                        subtitleNavigate: domain,
                    };
                    if (domain) {
                        if (_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(domain)) {
                            titleCardOptions.showControls = false;
                        }
                        else {
                            titleCardOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].showControls;
                            titleCardOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].extraControls;
                            titleCardOptions.controlChipOptions = { area_slug: area.slug };
                        }
                    }
                    const titleCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(titleCardOptions, domain, area.slug).createCard();
                    if (domain === "light")
                        entities = addLightGroupsToEntities(area, entities);
                    const entityCards = entities
                        .filter(entity => {
                        const cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                        const deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                        return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity.entity_category === "config" && configEntityHidden);
                    })
                        .map(entity => {
                        const cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                        if (domain === "sensor" && _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(entity.entity_id)?.attributes.unit_of_measurement) {
                            return new cardModule[_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card")]({
                                type: "custom:mini-graph-card",
                                entities: [entity.entity_id],
                                ...cardOptions,
                            }, entity).getCard();
                        }
                        return new cardModule[_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card")](cardOptions, entity).getCard();
                    });
                    if (entityCards.length) {
                        domainCardsMap[domain].push(...titleCard);
                        domainCardsMap[domain].push(new _cards_GroupedCard__WEBPACK_IMPORTED_MODULE_3__.GroupedCard(entityCards).getCard());
                    }
                }
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the domain cards!", e);
            }
        }
        const areaDevices = area.devices.filter(device_id => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.devices[device_id].area_id === area.area_id);
        const areaEntities = area.entities.filter(entity_id => {
            const entity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities[entity_id];
            const entityLinked = areaDevices.includes(entity.device_id ?? "null") || entity.area_id === area.area_id;
            const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
            const domainExposed = exposedDomainIds.includes(entity.entity_id.split(".", 1)[0]);
            return entityUnhidden && !domainExposed && entityLinked;
        });
        miscellaneousEntities.push(...areaEntities);
    }
    for (const domain in domainCardsMap) {
        viewSections.push({
            type: "grid",
            column_span: 1,
            cards: domainCardsMap[domain],
        });
    }
    // Handle default domain if not hidden
    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.default.hidden && miscellaneousEntities.length) {
        try {
            const cardModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./cards/MiscellaneousCard */ "./src/cards/MiscellaneousCard.ts"));
            const miscellaneousEntityCards = miscellaneousEntities
                .filter(entity_id => {
                const entity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities[entity_id];
                const cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                const deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity.entity_category === "config" && _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities);
            })
                .map(entity_id => new cardModule.MiscellaneousCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity_id], _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities[entity_id]).getCard());
            const miscellaneousCards = new _cards_GroupedCard__WEBPACK_IMPORTED_MODULE_3__.GroupedCard(miscellaneousEntityCards).getCard();
            const titleCard = {
                type: "heading",
                heading: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("ui.panel.lovelace.editor.card.generic.other_cards"),
                heading_style: "subtitle",
                badges: [],
                layout_options: {
                    grid_columns: "full",
                    grid_rows: 1,
                },
            };
            viewSections.push({
                type: "grid",
                column_span: 1,
                cards: [titleCard, miscellaneousCards],
            });
        }
        catch (e) {
            _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the domain cards!", e);
        }
    }
    return viewSections;
}
/**
 * Process entities for a view.
 * @param {any[]} entities - The entities to process.
 * @param {any} area - The area of the entities.
 * @param {string} domain - The domain of the entities.
 * @returns {Promise<any[]>} - Promise resolving to an array of cards.
 */
async function processEntities(entities, area, domain) {
    const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card");
    const cardModule = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`);
    const configEntityHidden = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain]?.hide_config_entities || _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities;
    return entities
        .filter(entity => !_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden
        && !_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"]?.hidden
        && !(entity.entity_category === "config" && configEntityHidden))
        .map(entity => new cardModule[className]({}, entity).getCard());
}


/***/ }),

/***/ "./src/variables.ts":
/*!**************************!*\
  !*** ./src/variables.ts ***!
  \**************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AGGREGATE_DOMAINS: () => (/* binding */ AGGREGATE_DOMAINS),
/* harmony export */   AREA_CARDS_DOMAINS: () => (/* binding */ AREA_CARDS_DOMAINS),
/* harmony export */   AREA_CONTROL_ICONS: () => (/* binding */ AREA_CONTROL_ICONS),
/* harmony export */   AREA_EXPOSED_CHIPS: () => (/* binding */ AREA_EXPOSED_CHIPS),
/* harmony export */   AREA_STATE_ICONS: () => (/* binding */ AREA_STATE_ICONS),
/* harmony export */   CUSTOM_VIEWS: () => (/* binding */ CUSTOM_VIEWS),
/* harmony export */   DEVICE_CLASSES: () => (/* binding */ DEVICE_CLASSES),
/* harmony export */   DEVICE_ICONS: () => (/* binding */ DEVICE_ICONS),
/* harmony export */   DOMAINS_VIEWS: () => (/* binding */ DOMAINS_VIEWS),
/* harmony export */   GROUP_DOMAINS: () => (/* binding */ GROUP_DOMAINS),
/* harmony export */   HOME_EXPOSED_CHIPS: () => (/* binding */ HOME_EXPOSED_CHIPS),
/* harmony export */   LIGHT_DOMAIN: () => (/* binding */ LIGHT_DOMAIN),
/* harmony export */   LIGHT_GROUPS: () => (/* binding */ LIGHT_GROUPS),
/* harmony export */   MAGIC_AREAS_DOMAIN: () => (/* binding */ MAGIC_AREAS_DOMAIN),
/* harmony export */   MAGIC_AREAS_NAME: () => (/* binding */ MAGIC_AREAS_NAME),
/* harmony export */   SECURITY_EXPOSED_CHIPS: () => (/* binding */ SECURITY_EXPOSED_CHIPS),
/* harmony export */   SECURITY_EXPOSED_DOMAINS: () => (/* binding */ SECURITY_EXPOSED_DOMAINS),
/* harmony export */   SECURITY_EXPOSED_SENSORS: () => (/* binding */ SECURITY_EXPOSED_SENSORS),
/* harmony export */   SENSOR_STATE_CLASS_MEASUREMENT: () => (/* binding */ SENSOR_STATE_CLASS_MEASUREMENT),
/* harmony export */   SENSOR_STATE_CLASS_TOTAL: () => (/* binding */ SENSOR_STATE_CLASS_TOTAL),
/* harmony export */   SENSOR_STATE_CLASS_TOTAL_INCREASING: () => (/* binding */ SENSOR_STATE_CLASS_TOTAL_INCREASING),
/* harmony export */   TOD_ORDER: () => (/* binding */ TOD_ORDER),
/* harmony export */   UNAVAILABLE: () => (/* binding */ UNAVAILABLE),
/* harmony export */   UNDISCLOSED: () => (/* binding */ UNDISCLOSED),
/* harmony export */   VIEWS_ICONS: () => (/* binding */ VIEWS_ICONS)
/* harmony export */ });
const MAGIC_AREAS_DOMAIN = "magic_areas";
const MAGIC_AREAS_NAME = "Magic Areas";
const UNAVAILABLE = "unavailable";
const UNDISCLOSED = "undisclosed";
const TOD_ORDER = ["morning", "daytime", "evening", "night"];
const LIGHT_DOMAIN = "light";
const LIGHT_GROUPS = ["overhead_lights", "accent_lights", "task_lights", "sleep_lights"];
const GROUP_DOMAINS = ["climate", "media_player", "cover"];
const AGGREGATE_DOMAINS = ["binary_sensor", "sensor"];
const DEVICE_CLASSES = {
    cover: [
        "awning",
        "blind",
        "curtain",
        "damper",
        "door",
        "garage",
        "gate",
        "shade",
        "shutter",
        "window",
    ],
    sensor: [
        "temperature",
        "humidity",
        "illuminance",
        "battery",
        // "sensor",
        "apparent_power",
        "aqi",
        "area",
        "atmospheric_pressure",
        "blood_glucose_concentration",
        "carbon_dioxide",
        "carbon_monoxide",
        "current",
        "data_rate",
        "data_size",
        "date",
        "distance",
        "duration",
        "energy",
        "energy_storage",
        "enum",
        "frequency",
        "gas",
        "irradiance",
        // "moisture",
        "monetary",
        "nitrogen_dioxide",
        "nitrogen_monoxide",
        "nitrous_oxide",
        "ozone",
        "ph",
        "pm1",
        "pm25",
        "pm10",
        "power_factor",
        "power",
        "precipitation",
        "precipitation_intensity",
        "pressure",
        "reactive_power",
        "signal_strength",
        "sound_pressure",
        "speed",
        "sulphur_dioxide",
        "timestamp",
        "volatile_organic_compounds",
        "volatile_organic_compounds_parts",
        "voltage",
        "volume",
        "volume_flow_rate",
        "volume_storage",
        "water",
        "weight",
        "wind_speed",
    ],
    binary_sensor: [
        "battery_charging",
        "carbon_monoxide",
        "cold",
        "connectivity",
        "door",
        "garage_door",
        // "gas",
        "heat",
        // "light",
        "lock",
        "moisture",
        "motion",
        "moving",
        "occupancy",
        "opening",
        "plug",
        // "power",
        "presence",
        "problem",
        "running",
        "safety",
        "smoke",
        "sound",
        "tamper",
        "update",
        "vibration",
        "window",
    ],
};
const AREA_CARDS_DOMAINS = [LIGHT_DOMAIN, "switch", "climate", "fan", "vacuum", "media_player", "camera", "cover", "lock", "scene", "plant", "binary_sensor", "sensor"];
const CUSTOM_VIEWS = ["home", "security", "security-details"];
const DOMAINS_VIEWS = [...AREA_CARDS_DOMAINS, ...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor];
const HOME_EXPOSED_CHIPS = ["weather", "alarm", "spotify", LIGHT_DOMAIN, "climate", "fan", "media_player", "switch", "safety", ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "binary_sensor:motion", "binary_sensor:occupancy", "binary_sensor:door", "binary_sensor:window"];
const AREA_EXPOSED_CHIPS = [LIGHT_DOMAIN, ...GROUP_DOMAINS, ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "fan", "switch", "safety", ...DEVICE_CLASSES.binary_sensor.map(d => `binary_sensor:${d}`), ...DEVICE_CLASSES.sensor.map(d => `sensor:${d}`)];
const SECURITY_EXPOSED_DOMAINS = ["light", "alarm", "safety", ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "lock"];
const SECURITY_EXPOSED_SENSORS = ["binary_sensor:motion", "binary_sensor:occupancy", "binary_sensor:door", "binary_sensor:window"];
const SECURITY_EXPOSED_CHIPS = ["light", "alarm", "safety", ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "lock", ...SECURITY_EXPOSED_SENSORS];
const DEVICE_ICONS = {
    presence_hold: 'mdi:car-brake-hold'
};
const VIEWS_ICONS = {
    home: "mdi:home-assistant",
    security: "mdi:security",
};
const AREA_STATE_ICONS = {
    occupied: "mdi:account",
    extended: "mdi:account-clock",
    clear: "mdi:account-off",
    bright: "mdi:brightness-2",
    dark: "mdi:brightness-5",
    sleep: "mdi:bed",
};
const AREA_CONTROL_ICONS = {
    light: "mdi:lightbulb-auto-outline",
    climate: "mdi:thermostat-auto",
    media_player: "mdi:auto-mode",
};
const SENSOR_STATE_CLASS_MEASUREMENT = [
    "temperature",
    "humidity",
    "pressure",
    "illuminance",
    "power",
    "voltage",
    "current",
    "signal_strength",
    "sound_pressure",
    "air_quality",
    "gas",
    "wind_speed",
    "frequency",
    "speed"
];
const SENSOR_STATE_CLASS_TOTAL = [
    "energy",
    "water",
    "gas",
    "monetary",
    "weight",
    "volume",
    "duration",
    "count"
];
const SENSOR_STATE_CLASS_TOTAL_INCREASING = [
    "energy",
    "water",
    "gas",
    "monetary",
    "count"
];


/***/ }),

/***/ "./src/views/AbstractView.ts":
/*!***********************************!*\
  !*** ./src/views/AbstractView.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AbstractView: () => (/* binding */ AbstractView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
var __classPrivateFieldSet = (undefined && undefined.__classPrivateFieldSet) || function (receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return (kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value)), value;
};
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AbstractView_domain, _AbstractView_device_class;


/**
 * Abstract View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class AbstractView {
    /**
     * Class constructor.
     *
     * @param {string} [domain] The domain which the view is representing.
     * @param {string} [device_class] The device class which the view is representing.
     *
     * @throws {Error} If trying to instantiate this class.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(domain, device_class) {
        /**
         * Configuration of the view.
         *
         * @type {views.ViewConfig}
         */
        this.config = {
            icon: "mdi:view-dashboard",
            type: "sections",
            subview: false,
        };
        /**
         * A card to switch all entities in the view.
         *
         * @type {LovelaceCardConfig[]}
         */
        this.viewControllerCard = [];
        /**
         * The domain of which we operate the devices.
         *
         * @private
         * @readonly
         */
        _AbstractView_domain.set(this, void 0);
        /**
         * The device class of the view.
         *
         * @private
         * @readonly
         */
        _AbstractView_device_class.set(this, void 0);
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
        __classPrivateFieldSet(this, _AbstractView_domain, domain, "f");
        __classPrivateFieldSet(this, _AbstractView_device_class, device_class, "f");
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
     * @override
     */
    async createViewCards() {
        return [];
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
     * @override
     */
    async createSectionBadges() {
        return [];
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
     * @override
     */
    async createSectionCards() {
        return (0,_utils__WEBPACK_IMPORTED_MODULE_1__.processEntitiesForView)(__classPrivateFieldGet(this, _AbstractView_domain, "f"), __classPrivateFieldGet(this, _AbstractView_device_class, "f"), this.viewControllerCard);
    }
    /**
     * Get a view object.
     *
     * The view includes the cards which are created by method createViewCards().
     *
     * @returns {Promise<LovelaceViewConfig | LovelaceSectionConfig>} The view object.
     */
    async getView() {
        return {
            ...this.config,
            badges: await this.createSectionBadges(),
            sections: await this.createSectionCards(),
            cards: await this.createViewCards(),
        };
    }
    /**
     * Get a target of entity IDs for the given domain.
     *
     * @param {string} domain - The target domain to retrieve entity IDs from.
     * @return {HassServiceTarget} - A target for a service call.
     */
    targetDomain(domain) {
        return {
            entity_id: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains[domain]?.filter(entity => !entity.hidden_by
                && !_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden).map(entity => entity.entity_id),
        };
    }
}
_AbstractView_domain = new WeakMap(), _AbstractView_device_class = new WeakMap();



/***/ }),

/***/ "./src/views/AggregateView.ts":
/*!************************************!*\
  !*** ./src/views/AggregateView.ts ***!
  \************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AggregateView: () => (/* binding */ AggregateView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");





// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Aggregate View Class.
 *
 * Used to create a view for entities of the fan domain.
 *
 * @class AggregateView
 * @extends AbstractView
 */
class AggregateView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.AggregateViewOptions} [options={}] Options for the view.
     */
    constructor(options) {
        const domain = options?.device_class ? _variables__WEBPACK_IMPORTED_MODULE_3__.DEVICE_CLASSES.sensor.includes(options?.device_class) ? "sensor" : "binary_sensor" : options?.domain;
        super(domain, options?.device_class);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard({
            title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize((0,_utils__WEBPACK_IMPORTED_MODULE_4__.getDomainTranslationKey)(domain, options?.device_class)),
            showControls: domain !== "sensor",
            controlChipOptions: { device_class: options?.device_class },
        }, domain, "global").createCard();
    }
}



/***/ }),

/***/ "./src/views/AreaView.ts":
/*!*******************************!*\
  !*** ./src/views/AreaView.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AreaView: () => (/* binding */ AreaView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../chips/AreaStateChip */ "./src/chips/AreaStateChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../chips/UnavailableChip */ "./src/chips/UnavailableChip.ts");





// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area View Class.
 *
 * Used to create a Area view.
 *
 * @class AreaView
 */
class AreaView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(area, options = {}) {
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        this.config = {
            icon: "mdi:home-assistant",
            type: "sections",
            subview: true,
        };
        this.area = area;
        this.config = { ...this.config, ...options };
    }
    /**
     * Create the chips to include in the view.
     *
     * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
     * @override
     */
    async createSectionBadges() {
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("chips")) {
            // Chips section is hidden.
            return [];
        }
        const chips = [];
        chips.push(new _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_2__.AreaStateChip({ area: this.area, showContent: true }).getChip());
        const areaChips = await (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createChipsFromList)(_variables__WEBPACK_IMPORTED_MODULE_1__.AREA_EXPOSED_CHIPS, { show_content: true }, this.area.slug, this.area.slug);
        if (areaChips) {
            chips.push(...areaChips);
        }
        const unavailableChip = new _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_4__.UnavailableChip({ area_slug: this.area.slug }).getChip();
        if (unavailableChip)
            chips.push(unavailableChip);
        return chips.map(chip => ({
            type: "custom:mushroom-chips-card",
            alignment: "center",
            chips: [chip],
        }));
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
     * @override
     */
    async createSectionCards() {
        return (0,_utils__WEBPACK_IMPORTED_MODULE_3__.processEntitiesForAreaOrFloorView)({ area: this.area });
    }
    /**
     * Get a view object.
     *
     * The view includes the cards which are created by method createSectionCards().
     *
     * @returns {Promise<LovelaceViewConfig>} The view object.
     */
    async getView() {
        return {
            ...this.config,
            badges: await this.createSectionBadges(),
            sections: await this.createSectionCards(),
        };
    }
}



/***/ }),

/***/ "./src/views/CameraView.ts":
/*!*********************************!*\
  !*** ./src/views/CameraView.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CameraView: () => (/* binding */ CameraView)
/* harmony export */ });
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _CameraView_domain, _CameraView_defaultConfig, _CameraView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Camera View Class.
 *
 * Used to create a view for entities of the camera domain.
 *
 * @class CameraView
 * @extends AbstractView
 */
class CameraView extends _AbstractView__WEBPACK_IMPORTED_MODULE_1__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _CameraView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _CameraView_defaultConfig.set(this, {
            title: "Cameras",
            icon: "mdi:cctv",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _CameraView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.localize(`component.camera.entity_component._.name`)}s`,
            // subtitle: Helper.getCountTemplate(CameraView.#domain, "ne", "off") + ` ${Helper.localize("component.light.entity_component._.state.on")}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _CameraView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_0__.ControllerCard({
            ...__classPrivateFieldGet(this, _CameraView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.strategyOptions.domains.camera.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _CameraView_domain)).createCard();
    }
}
_a = CameraView, _CameraView_defaultConfig = new WeakMap(), _CameraView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_CameraView_domain = { value: "camera" };



/***/ }),

/***/ "./src/views/ClimateView.ts":
/*!**********************************!*\
  !*** ./src/views/ClimateView.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   ClimateView: () => (/* binding */ ClimateView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _ClimateView_domain, _ClimateView_defaultConfig, _ClimateView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate View Class.
 *
 * Used to create a view for entities of the climate domain.
 *
 * @class ClimateView
 * @extends AbstractView
 */
class ClimateView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _ClimateView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _ClimateView_defaultConfig.set(this, {
            title: "Climates",
            icon: "mdi:thermostat",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _ClimateView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.climate.entity_component._.name`)}s`,
            // subtitle: Helper.getCountTemplate(ClimateView.#domain, "ne", "off") + ` ${Helper.localize(`component.fan.entity_component._.state.on`)}s`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _ClimateView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard({
            ...__classPrivateFieldGet(this, _ClimateView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.climate.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _ClimateView_domain)).createCard();
    }
}
_a = ClimateView, _ClimateView_defaultConfig = new WeakMap(), _ClimateView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_ClimateView_domain = { value: "climate" };



/***/ }),

/***/ "./src/views/CoverView.ts":
/*!********************************!*\
  !*** ./src/views/CoverView.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   CoverView: () => (/* binding */ CoverView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _CoverView_domain, _CoverView_defaultConfig, _CoverView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover View Class.
 *
 * Used to create a view for entities of the cover domain.
 *
 * @class CoverView
 * @extends AbstractView
 */
class CoverView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _CoverView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _CoverView_defaultConfig.set(this, {
            title: "Covers",
            icon: "mdi:window-open",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _CoverView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.cover.entity_component._.name`)}`,
            // subtitle: Helper.getCountTemplate(CoverView.#domain, "eq", "open") + ` ${Helper.localize(`component.cover.entity_component._.state.open`)}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _CoverView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard({
            ...__classPrivateFieldGet(this, _CoverView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.cover.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _CoverView_domain)).createCard();
    }
}
_a = CoverView, _CoverView_defaultConfig = new WeakMap(), _CoverView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_CoverView_domain = { value: "cover" };



/***/ }),

/***/ "./src/views/FanView.ts":
/*!******************************!*\
  !*** ./src/views/FanView.ts ***!
  \******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FanView: () => (/* binding */ FanView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _FanView_domain, _FanView_defaultConfig, _FanView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Fan View Class.
 *
 * Used to create a view for entities of the fan domain.
 *
 * @class FanView
 * @extends AbstractView
 */
class FanView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _FanView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _FanView_defaultConfig.set(this, {
            title: "Fans",
            icon: "mdi:fan",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _FanView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.fan.entity_component._.name`)}s`,
            // subtitle: Helper.getCountTemplate(FanView.#domain, "eq", "on") + ` ${Helper.localize(`component.fan.entity_component._.state.on`)}s`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _FanView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard({
            ...__classPrivateFieldGet(this, _FanView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.fan.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _FanView_domain)).createCard();
    }
}
_a = FanView, _FanView_defaultConfig = new WeakMap(), _FanView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_FanView_domain = { value: "fan" };



/***/ }),

/***/ "./src/views/FloorView.ts":
/*!********************************!*\
  !*** ./src/views/FloorView.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   FloorView: () => (/* binding */ FloorView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../chips/AreaStateChip */ "./src/chips/AreaStateChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");




// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Floor View Class.
 *
 * Used to create a Floor view.
 *
 * @class FloorView
 */
class FloorView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(floor, options = {}) {
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        this.config = {
            icon: "mdi:home-assistant",
            type: "sections",
            subview: true,
        };
        this.floor = floor;
        this.config = { ...this.config, ...options };
    }
    /**
     * Create the chips to include in the view.
     *
     * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
     * @override
     */
    async createSectionBadges() {
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("chips")) {
            return [];
        }
        const chips = [];
        const device = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[this.floor.floor_id];
        if (device) {
            chips.push(new _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_2__.AreaStateChip({ floor: this.floor, showContent: true }).getChip());
        }
        const areaChips = await (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createChipsFromList)(_variables__WEBPACK_IMPORTED_MODULE_1__.AREA_EXPOSED_CHIPS, { show_content: true }, this.floor.floor_id, this.floor.areas_slug);
        if (areaChips) {
            chips.push(...areaChips);
        }
        return chips.map(chip => ({
            type: "custom:mushroom-chips-card",
            alignment: "center",
            chips: [chip],
        }));
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
     * @override
     */
    async createSectionCards() {
        return (0,_utils__WEBPACK_IMPORTED_MODULE_3__.processEntitiesForAreaOrFloorView)({ floor: this.floor });
    }
    /**
     * Get a view object.
     *
     * The view includes the cards which are created by method createSectionCards().
     *
     * @returns {Promise<LovelaceViewConfig>} The view object.
     */
    async getView() {
        return {
            ...this.config,
            badges: await this.createSectionBadges(),
            sections: await this.createSectionCards(),
        };
    }
}



/***/ }),

/***/ "./src/views/HomeView.ts":
/*!*******************************!*\
  !*** ./src/views/HomeView.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   HomeView: () => (/* binding */ HomeView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../chips/SettingsChip */ "./src/chips/SettingsChip.ts");
/* harmony import */ var _popups_SettingsPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../popups/SettingsPopup */ "./src/popups/SettingsPopup.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _chips_WeatherChip__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../chips/WeatherChip */ "./src/chips/WeatherChip.ts");
/* harmony import */ var _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../chips/UnavailableChip */ "./src/chips/UnavailableChip.ts");
/* harmony import */ var _cards_PersonCard__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../cards/PersonCard */ "./src/cards/PersonCard.ts");
/* harmony import */ var _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../chips/AggregateChip */ "./src/chips/AggregateChip.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HomeView_instances, _HomeView_createPersonCards;









// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Home View Class.
 *
 * Used to create a Home view.
 *
 * @class HomeView
 */
class HomeView {
    /**
     * Class constructor.
     *
     * @throws {Error} If trying to instantiate this class.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor() {
        _HomeView_instances.add(this);
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        this.config = {
            title: "Home",
            icon: "mdi:home-assistant",
            type: "sections",
            subview: false,
        };
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
    }
    /**
     * Create the chips to include in the view.
     *
     * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
     * @override
     */
    async createSectionBadges() {
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("chips")) {
            // Chips section is hidden.
            return [];
        }
        const chips = [];
        const chipOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.chips;
        // Weather chip.
        const weatherEntityId = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.weather_entity_id;
        if (weatherEntityId) {
            try {
                const weatherChip = new _chips_WeatherChip__WEBPACK_IMPORTED_MODULE_5__.WeatherChip(weatherEntityId);
                chips.push(weatherChip.getChip());
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the weather chip!", e);
            }
        }
        // Alarm chip.
        const alarmEntityId = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.alarm_entity_id;
        if (alarmEntityId) {
            try {
                const chipModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../chips/AlarmChip */ "./src/chips/AlarmChip.ts"));
                const alarmChip = new chipModule.AlarmChip(alarmEntityId);
                chips.push(alarmChip.getChip());
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the alarm chip!", e);
            }
        }
        // Spotify chip.
        const spotifyEntityId = chipOptions?.spotify_entity ?? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains.media_player?.find((entity) => entity.entity_id.startsWith("media_player.spotify_") && entity.disabled_by === null && entity.hidden_by === null)?.entity_id;
        if (spotifyEntityId) {
            try {
                const chipModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../chips/SpotifyChip */ "./src/chips/SpotifyChip.ts"));
                const spotifyChip = new chipModule.SpotifyChip(spotifyEntityId);
                chips.push(spotifyChip.getChip());
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the spotify chip!", e);
            }
        }
        // Home chips.
        const homeChips = await (0,_utils__WEBPACK_IMPORTED_MODULE_4__.createChipsFromList)(_variables__WEBPACK_IMPORTED_MODULE_3__.HOME_EXPOSED_CHIPS, { show_content: true });
        if (homeChips) {
            chips.push(...homeChips);
        }
        // Unavailable chip.
        const unavailableChip = new _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_6__.UnavailableChip().getChip();
        if (unavailableChip)
            chips.push(unavailableChip);
        // Settings chip.
        const linusSettings = new _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_1__.SettingsChip({ tap_action: new _popups_SettingsPopup__WEBPACK_IMPORTED_MODULE_2__.SettingsPopup().getPopup() });
        chips.push(linusSettings.getChip());
        return chips.map(chip => ({
            type: "custom:mushroom-chips-card",
            alignment: "center",
            chips: [chip],
        }));
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
     * @override
     */
    async createSectionCards() {
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("areas")) {
            // Areas section is hidden.
            return [];
        }
        const groupedSections = [];
        const floors = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.orderedFloors;
        let isFirstLoop = true;
        for (const floor of floors) {
            if (floor.areas_slug.length === 0)
                continue;
            let floorSection = {
                type: "grid",
                column_span: 1,
                cards: [],
            };
            if (isFirstLoop) {
                const personCards = await __classPrivateFieldGet(this, _HomeView_instances, "m", _HomeView_createPersonCards).call(this);
                floorSection.cards.push({
                    type: "horizontal-stack",
                    cards: personCards,
                });
                if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.hide_greeting) {
                    const tod = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices.global?.entities.time_of_the_day;
                    floorSection.cards.push({
                        type: "custom:mushroom-template-card",
                        primary: `
              {% set tod = states("${tod?.entity_id}") %}
              {% if (tod == "evening") %} ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.text.greeting.evening")} {{user}} !
              {% elif (tod == "daytime") %} ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.text.greeting.daytime")} {{user}} !
              {% elif (tod == "night") %} ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.text.greeting.night")} {{user}} !
              {% else %} ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.text.greeting.morning")} {{user}} !
              {% endif %}`,
                        icon: "mdi:hand-wave",
                        icon_color: "orange",
                        layout_options: {
                            grid_columns: 4,
                            grid_rows: 1,
                        },
                        tap_action: { action: "none" },
                        double_tap_action: { action: "none" },
                        hold_action: { action: "none" },
                    });
                }
                // Add quick access cards.
                if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.quick_access_cards) {
                    floorSection.cards.push(..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.quick_access_cards);
                }
                // Add custom cards.
                if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.extra_cards) {
                    floorSection.cards.push(..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.extra_cards);
                }
            }
            if (isFirstLoop && !_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("areasTitle")) {
                floorSection.cards.push({
                    type: "heading",
                    heading: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("ui.components.area-picker.area")}s`,
                    heading_style: "title",
                });
                isFirstLoop = false;
            }
            const temperatureEntities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityIds({ domain: "sensor", device_class: "temperature", area_slug: floor.areas_slug });
            if (floors.length > 1) {
                floorSection.cards.push({
                    type: "heading",
                    heading: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getFloorName)(floor),
                    heading_style: "subtitle",
                    icon: floor.icon ?? "mdi:floor-plan",
                    badges: [{
                            type: "custom:mushroom-chips-card",
                            alignment: "end",
                            chips: [
                                floor.floor_id !== _variables__WEBPACK_IMPORTED_MODULE_3__.UNDISCLOSED && temperatureEntities.length > 0 &&
                                    new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_8__.AggregateChip({
                                        device_class: "temperature",
                                        show_content: true,
                                        magic_device_id: floor.floor_id,
                                        area_slug: floor.areas_slug,
                                        tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.navigateTo)('temperature')
                                    }).getChip(),
                            ],
                            card_mod: {
                                style: `
                ha-card {
                  min-width: 100px;
                }
              `,
                            }
                        }],
                    tap_action: floor.floor_id !== _variables__WEBPACK_IMPORTED_MODULE_3__.UNDISCLOSED ? (0,_utils__WEBPACK_IMPORTED_MODULE_4__.navigateTo)((0,_utils__WEBPACK_IMPORTED_MODULE_4__.slugify)(floor.name)) : undefined,
                });
            }
            for (const area of floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug]).values()) {
                let module;
                let moduleName = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.slug]?.type ?? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas["_"]?.type ?? "default";
                // Load module by type in strategy options.
                try {
                    module = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${moduleName}`);
                }
                catch (e) {
                    // Fallback to the default strategy card.
                    module = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../cards/HomeAreaCard */ "./src/cards/HomeAreaCard.ts"));
                    if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.debug && moduleName !== "default") {
                        console.error(e);
                    }
                }
                // Get a card for the area.
                if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.slug]?.hidden) {
                    let options = {
                        ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas["_"],
                        ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.slug],
                        area_slug: area.slug,
                    };
                    floorSection.cards.push({
                        ...new module.HomeAreaCard(options).getCard(),
                        layout_options: {
                            grid_columns: 2
                        }
                    });
                }
            }
            if (floor.floor_id === _variables__WEBPACK_IMPORTED_MODULE_3__.UNDISCLOSED) {
                floorSection.cards.push({
                    type: "custom:mushroom-template-card",
                    primary: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.button.add_new_area.state.on"),
                    secondary: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.button.add_new_area.state.off"),
                    multiline_secondary: true,
                    icon: "mdi:view-dashboard-variant",
                    fill_container: true,
                    layout_options: {
                        grid_columns: 4,
                        grid_rows: 1,
                    },
                    tap_action: {
                        action: "navigate",
                        navigation_path: "/config/areas/dashboard",
                    },
                });
            }
            groupedSections.push(floorSection);
        }
        return groupedSections;
    }
    /**
     * Get a view object.
     *
     * The view includes the cards which are created by method createViewCards().
     *
     * @returns {Promise<LovelaceViewConfig>} The view object.
     */
    async getView() {
        return {
            ...this.config,
            badges: await this.createSectionBadges(),
            sections: await this.createSectionCards(),
        };
    }
}
_HomeView_instances = new WeakSet(), _HomeView_createPersonCards = 
/**
 * Create the person cards to include in the view.
 *
 * @return {Promise<PersonCardConfig[]>} A Person Card array.
 */
async function _HomeView_createPersonCards() {
    if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("persons")) {
        // Person section is hidden.
        return [];
    }
    const cards = [];
    const persons = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains.person.filter((entity) => {
        return entity.hidden_by == null && entity.disabled_by == null;
    });
    for (const person of persons) {
        cards.push(new _cards_PersonCard__WEBPACK_IMPORTED_MODULE_7__.PersonCard({}, person).getCard());
    }
    return cards;
};



/***/ }),

/***/ "./src/views/LightView.ts":
/*!********************************!*\
  !*** ./src/views/LightView.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LightView: () => (/* binding */ LightView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _LightView_domain, _LightView_defaultConfig, _LightView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light View Class.
 *
 * Used to create a view for entities of the light domain.
 *
 * @class LightView
 * @extends AbstractView
 */
class LightView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _LightView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _LightView_defaultConfig.set(this, {
            icon: "mdi:lightbulb-group",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _LightView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.light.entity_component._.name`)}s`,
            // subtitle: Helper.getCountTemplate(LightView.#domain, "eq", "on") + ` ${Helper.localize("component.light.entity_component._.state.on")}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _LightView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard({
            ...__classPrivateFieldGet(this, _LightView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.light.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _LightView_domain), "global").createCard();
    }
}
_a = LightView, _LightView_defaultConfig = new WeakMap(), _LightView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_LightView_domain = { value: "light" };



/***/ }),

/***/ "./src/views/MediaPlayerView.ts":
/*!**************************************!*\
  !*** ./src/views/MediaPlayerView.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MediaPlayerView: () => (/* binding */ MediaPlayerView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _MediaPlayerView_domain, _MediaPlayerView_defaultConfig, _MediaPlayerView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * MediaPlayer View Class.
 *
 * Used to create a view for entities of the media_player domain.
 *
 * @class MediaPlayerView
 * @extends AbstractView
 */
class MediaPlayerView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _MediaPlayerView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _MediaPlayerView_defaultConfig.set(this, {
            title: "MediaPlayers",
            icon: "mdi:cast",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _MediaPlayerView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.media_player.entity_component._.name`)}s`,
            // subtitle: Helper.getCountTemplate(MediaPlayerView.#domain, "ne", "off") + " media players on",
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _MediaPlayerView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard({
            ...__classPrivateFieldGet(this, _MediaPlayerView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.media_player.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _MediaPlayerView_domain)).createCard();
    }
}
_a = MediaPlayerView, _MediaPlayerView_defaultConfig = new WeakMap(), _MediaPlayerView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_MediaPlayerView_domain = { value: "media_player" };



/***/ }),

/***/ "./src/views/SceneView.ts":
/*!********************************!*\
  !*** ./src/views/SceneView.ts ***!
  \********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SceneView: () => (/* binding */ SceneView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _SceneView_domain, _SceneView_defaultConfig, _SceneView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Scene View Class.
 *
 * Used to create a view for entities of the scene domain.
 *
 * @class SceneView
 * @extends AbstractView
 */
class SceneView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _SceneView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _SceneView_defaultConfig.set(this, {
            title: "Scenes",
            icon: "mdi:palette",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _SceneView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`ui.dialogs.quick-bar.commands.navigation.scene`)}`,
            // subtitle: Helper.getCountTemplate(SceneView.#domain, "ne", "on") + ` ${Helper.localize(`ui.dialogs.quick-bar.commands.navigation.scene`)}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SceneView_defaultConfig, "f"), options);
        // Create a Controller card to scene all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard({
            ...__classPrivateFieldGet(this, _SceneView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.scene.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _SceneView_domain)).createCard();
    }
}
_a = SceneView, _SceneView_defaultConfig = new WeakMap(), _SceneView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_SceneView_domain = { value: "scene" };



/***/ }),

/***/ "./src/views/SecurityDetailsView.ts":
/*!******************************************!*\
  !*** ./src/views/SecurityDetailsView.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SecurityDetailsView: () => (/* binding */ SecurityDetailsView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_AggregateSection__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/AggregateSection */ "./src/cards/AggregateSection.ts");


/**
 * Security View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class SecurityDetailsView {
    /**
     * Class constructor.
     *
     * @throws {Error} If trying to instantiate this class.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor() {
        /**
         * Configuration of the view.
         *
         * @type {LovelaceViewConfig}
         */
        this.config = {
            title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.binary_sensor.entity_component.safety.name"),
            icon: "mdi:security",
            subview: true,
        };
        /**
         * A card to switch all entities in the view.
         *
         * @type {StackCardConfig}
         */
        this.viewControllerCard = {
            cards: [],
            type: "",
        };
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<(StackCardConfig | TitleCardConfig)[]>} An array of card objects.
     */
    async createViewCards() {
        const viewCards = [];
        const globalDevice = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices["global"];
        if (!globalDevice) {
            console.debug("Security view : Global device not found");
            return [];
        }
        const { aggregate_motion, aggregate_door, aggregate_window, } = globalDevice?.entities;
        if (aggregate_motion?.entity_id) {
            viewCards.push(new _cards_AggregateSection__WEBPACK_IMPORTED_MODULE_1__.AggregateSection('binary_sensor', { device_class: 'motion', title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.binary_sensor.entity_component.motion.name") }).createCard());
        }
        if (aggregate_door?.entity_id || aggregate_window?.entity_id) {
            viewCards.push(new _cards_AggregateSection__WEBPACK_IMPORTED_MODULE_1__.AggregateSection('binary_sensor', { device_class: ['door', 'window'], title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.binary_sensor.entity_component.opening.name") }).createCard());
        }
        return viewCards;
    }
    /**
     * Get a view object.
     *
     * The view includes the cards which are created by method createViewCards().
     *
     * @returns {Promise<LovelaceViewConfig>} The view object.
     */
    async getView() {
        return {
            ...this.config,
            cards: await this.createViewCards(),
        };
    }
}



/***/ }),

/***/ "./src/views/SecurityView.ts":
/*!***********************************!*\
  !*** ./src/views/SecurityView.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SecurityView: () => (/* binding */ SecurityView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_AlarmCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/AlarmCard */ "./src/cards/AlarmCard.ts");
/* harmony import */ var _cards_PersonCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../cards/PersonCard */ "./src/cards/PersonCard.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _cards_GroupedCard__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../cards/GroupedCard */ "./src/cards/GroupedCard.ts");







/**
 * Security View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class SecurityView {
    /**
     * Class constructor.
     *
     * @throws {Error} If trying to instantiate this class.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor() {
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        this.config = {
            title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.binary_sensor.entity_component.safety.name"),
            icon: "mdi:security",
            type: "sections",
        };
        /**
         * A card to switch all entities in the view.
         *
         * @type {LovelaceCardConfig[]}
         */
        this.viewControllerCard = [];
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
     * @override
     */
    async createViewBadges() {
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("chips")) {
            // Chips section is hidden.
            return [];
        }
        const chips = [];
        let chipModule;
        // Alarm chip.
        const alarmEntityId = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.alarm_entity_id;
        if (alarmEntityId) {
            try {
                chipModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../chips/AlarmChip */ "./src/chips/AlarmChip.ts"));
                const alarmChip = new chipModule.AlarmChip(alarmEntityId);
                chips.push(alarmChip.getChip());
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the alarm chip!", e);
            }
        }
        const homeChips = await (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createChipsFromList)(_variables__WEBPACK_IMPORTED_MODULE_5__.SECURITY_EXPOSED_CHIPS, { show_content: true });
        if (homeChips) {
            chips.push(...homeChips);
        }
        return chips.map(chip => ({
            type: "custom:mushroom-chips-card",
            alignment: "center",
            chips: [chip],
        }));
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
     */
    async createSectionCards() {
        const globalSection = {
            type: "grid",
            column_span: 1,
            cards: []
        };
        const alarmEntityId = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.linus_dashboard_config?.alarm_entity_id;
        if (alarmEntityId) {
            globalSection.cards.push({
                type: "heading",
                heading: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.binary_sensor.entity_component.safety.name"),
                heading_style: "title",
            });
            globalSection.cards.push({
                type: "heading",
                heading: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.alarm_control_panel.entity_component._.name"),
                heading_style: "subtitle",
            });
            globalSection.cards.push(new _cards_AlarmCard__WEBPACK_IMPORTED_MODULE_1__.AlarmCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities[alarmEntityId]).getCard());
        }
        const persons = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains.person;
        if (persons?.length) {
            globalSection.cards.push({
                type: "heading",
                heading: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("ui.dialogs.quick-bar.commands.navigation.person"),
                heading_style: "subtitle",
            });
            for (const person of persons) {
                globalSection.cards.push(new _cards_PersonCard__WEBPACK_IMPORTED_MODULE_2__.PersonCard({}, person).getCard());
            }
        }
        const securityCards = await (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createCardsFromList)(_variables__WEBPACK_IMPORTED_MODULE_5__.SECURITY_EXPOSED_DOMAINS, {}, "global", "global");
        if (securityCards) {
            globalSection.cards.push({
                type: "heading",
                heading: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("ui.components.device-picker.device") + "s",
                heading_style: "subtitle",
            });
            globalSection.cards.push(...securityCards);
        }
        const sensorCards = await (0,_utils__WEBPACK_IMPORTED_MODULE_3__.createCardsFromList)(_variables__WEBPACK_IMPORTED_MODULE_5__.SECURITY_EXPOSED_SENSORS, {}, "global");
        if (sensorCards) {
            globalSection.cards.push({
                type: "heading",
                heading: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.sensor.entity_component._.name") + "s",
                heading_style: "subtitle",
            });
            globalSection.cards.push(...sensorCards);
        }
        const sections = [globalSection];
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains.camera?.length)
            sections.push(await this.createCamerasSection());
        return sections;
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<LovelaceGridCardConfig >} An array of card objects.
     */
    async createCamerasSection() {
        const domain = "camera";
        const camerasSection = {
            type: "grid",
            column_span: 1,
            cards: [
                {
                    type: "heading",
                    heading: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.camera.entity_component._.name`)}s`,
                    heading_style: "title",
                    badges: [],
                    layout_options: {
                        grid_columns: "full",
                        grid_rows: 1
                    },
                    icon: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons[domain]._?.default,
                }
            ]
        };
        const floors = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.orderedFloors;
        for (const floor of floors) {
            if (floor.areas_slug.length === 0)
                continue;
            let floorCards = [
                {
                    type: "heading",
                    heading: (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getFloorName)(floor),
                    heading_style: "title",
                    badges: [],
                    layout_options: {
                        grid_columns: "full",
                        grid_rows: 1
                    },
                    icon: floor.icon ?? "mdi:floor-plan",
                }
            ];
            // Create cards for each area.
            for (const area of floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug])) {
                const entities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getAreaEntities(area, domain);
                const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card");
                const cardModule = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`);
                if (entities.length === 0 || !cardModule) {
                    continue;
                }
                // Set the target for controller cards to the current area.
                let target = {
                    area_id: [area.slug],
                };
                let areaCards = [];
                const entityCards = [];
                // Create a card for each domain-entity of the current area.
                for (const entity of entities) {
                    let cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                    let deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                    if (cardOptions?.hidden || deviceOptions?.hidden) {
                        continue;
                    }
                    const configEntityHidden = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain ?? "_"].hide_config_entities
                        || _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities;
                    if (entity.entity_category === "config" && configEntityHidden) {
                        continue;
                    }
                    entityCards.push(new cardModule[className](cardOptions, entity).getCard());
                }
                if (entityCards.length) {
                    areaCards.push(new _cards_GroupedCard__WEBPACK_IMPORTED_MODULE_6__.GroupedCard(entityCards).getCard());
                }
                // Vertical stack the area cards if it has entities.
                if (areaCards.length) {
                    const titleCardOptions = {};
                    titleCardOptions.subtitle = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getAreaName)(area);
                    titleCardOptions.subtitleIcon = area.icon ?? "mdi:floor-plan";
                    titleCardOptions.navigate = area.slug;
                    if (domain) {
                        titleCardOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].showControls;
                        titleCardOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].extraControls;
                    }
                    // Create and insert a Controller card.
                    areaCards.unshift(...new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_4__.ControllerCard(titleCardOptions, domain).createCard());
                    floorCards.push(...areaCards);
                }
            }
            if (floorCards.length > 1)
                camerasSection.cards.push(...floorCards);
        }
        return camerasSection;
    }
    /**
     * Get a view object.
     *
     * The view includes the cards which are created by method createViewCards().
     *
     * @returns {Promise<LovelaceViewConfig>} The view object.
     */
    async getView() {
        return {
            ...this.config,
            badges: await this.createViewBadges(),
            sections: await this.createSectionCards(),
        };
    }
}



/***/ }),

/***/ "./src/views/SwitchView.ts":
/*!*********************************!*\
  !*** ./src/views/SwitchView.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SwitchView: () => (/* binding */ SwitchView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _SwitchView_domain, _SwitchView_defaultConfig, _SwitchView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Switch View Class.
 *
 * Used to create a view for entities of the switch domain.
 *
 * @class SwitchView
 * @extends AbstractView
 */
class SwitchView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _SwitchView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _SwitchView_defaultConfig.set(this, {
            title: "Switches",
            icon: "mdi:dip-switch",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _SwitchView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.switch.entity_component._.name`)}s`,
            // subtitle: Helper.getCountTemplate(SwitchView.#domain, "eq", "on") + " switches on",
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SwitchView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard({
            ...__classPrivateFieldGet(this, _SwitchView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.switch.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _SwitchView_domain)).createCard();
    }
}
_a = SwitchView, _SwitchView_defaultConfig = new WeakMap(), _SwitchView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_SwitchView_domain = { value: "switch" };



/***/ }),

/***/ "./src/views/UnavailableView.ts":
/*!**************************************!*\
  !*** ./src/views/UnavailableView.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   UnavailableView: () => (/* binding */ UnavailableView)
/* harmony export */ });
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _cards_GroupedCard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../cards/GroupedCard */ "./src/cards/GroupedCard.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");





/**
 * Abstract View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class UnavailableView {
    /**
     * Class constructor.
     *
     * @throws {Error} If trying to instantiate this class.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor() {
        /**
         * Configuration of the view.
         *
         * @type {views.ViewConfig}
         */
        this.config = {
            title: _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.localize("state.default.unavailable"),
            icon: "mdi:view-dashboard",
            type: "sections",
            subview: true,
        };
        /**
         * A card to switch all entities in the view.
         *
         * @type {LovelaceCardConfig[]}
         */
        this.viewControllerCard = [];
        if (!_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
     * @override
     */
    async createSectionCards() {
        const viewSections = [];
        for (const floor of _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.orderedFloors) {
            if (floor.areas_slug.length === 0)
                continue;
            const floorCards = [];
            const floors = Array.from(floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.areas[area_slug]).values());
            for (const area of floors) {
                const entities = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.areas[area.slug].entities;
                const unavailableEntities = entities?.filter(entity_id => _variables__WEBPACK_IMPORTED_MODULE_0__.AREA_CARDS_DOMAINS.includes((0,_utils__WEBPACK_IMPORTED_MODULE_2__.getEntityDomain)(entity_id)) && _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getEntityState(entity_id)?.state === _variables__WEBPACK_IMPORTED_MODULE_0__.UNAVAILABLE).map(entity_id => _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.entities[entity_id]);
                const cardModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../cards/MiscellaneousCard */ "./src/cards/MiscellaneousCard.ts"));
                if (entities.length === 0 || !cardModule)
                    continue;
                let target = { area_id: [area.slug] };
                if (area.area_id === _variables__WEBPACK_IMPORTED_MODULE_0__.UNDISCLOSED) {
                    target = { entity_id: unavailableEntities.map(entity => entity.entity_id) };
                }
                const entityCards = unavailableEntities
                    .filter(entity => !_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden
                    && !_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"]?.hidden
                    && !(entity.entity_category === "config"))
                    .map(entity => new cardModule.MiscellaneousCard({}, entity).getCard());
                if (entityCards.length) {
                    const titleCardOptions = {
                        subtitle: (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getAreaName)(area),
                        subtitleIcon: area.area_id === _variables__WEBPACK_IMPORTED_MODULE_0__.UNDISCLOSED ? "mdi:help-circle" : area.icon ?? "mdi:floor-plan",
                        subtitleNavigate: area.slug,
                        showControls: false
                    };
                    const areaControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_4__.ControllerCard(titleCardOptions, "", area.slug).createCard();
                    floorCards.push(...areaControllerCard, new _cards_GroupedCard__WEBPACK_IMPORTED_MODULE_3__.GroupedCard(entityCards).getCard());
                }
            }
            if (floorCards.length) {
                const titleSectionOptions = {
                    title: (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getFloorName)(floor),
                    titleIcon: floor.icon ?? "mdi:floor-plan",
                    titleNavigate: (0,_utils__WEBPACK_IMPORTED_MODULE_2__.slugify)(floor.name),
                    showControls: false
                };
                const floorControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_4__.ControllerCard(titleSectionOptions, "", floor.floor_id).createCard();
                const section = { type: "grid", cards: [] };
                section.cards.push(...floorControllerCard);
                section.cards.push(...floorCards);
                viewSections.push(section);
            }
        }
        return viewSections;
    }
    /**
     * Get a view object.
     *
     * The view includes the cards which are created by method createViewCards().
     *
     * @returns {Promise<LovelaceViewConfig>} The view object.
     */
    async getView() {
        return {
            ...this.config,
            sections: await this.createSectionCards(),
        };
    }
    /**
     * Get a target of entity IDs for the given domain.
     *
     * @param {string} domain - The target domain to retrieve entity IDs from.
     * @return {HassServiceTarget} - A target for a service call.
     */
    targetDomain(domain) {
        return {
            entity_id: _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.domains[domain]?.filter(entity => !entity.hidden_by
                && !_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden).map(entity => entity.entity_id),
        };
    }
}



/***/ }),

/***/ "./src/views/VacuumView.ts":
/*!*********************************!*\
  !*** ./src/views/VacuumView.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   VacuumView: () => (/* binding */ VacuumView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _VacuumView_domain, _VacuumView_defaultConfig, _VacuumView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Vacuum View Class.
 *
 * Used to create a view for entities of the vacuum domain.
 *
 * @class VacuumView
 * @extends AbstractView
 */
class VacuumView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _VacuumView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _VacuumView_defaultConfig.set(this, {
            title: "Vacuums",
            icon: "mdi:robot-vacuum",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _VacuumView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.vacuum.entity_component._.name`)}s`,
            // subtitle: Helper.getCountTemplate(VacuumView.#domain, "ne", "off") + ` ${Helper.localize(`component.vacuum.entity_component._.state.on`)}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _VacuumView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard({
            ...__classPrivateFieldGet(this, _VacuumView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.vacuum.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _VacuumView_domain)).createCard();
    }
}
_a = VacuumView, _VacuumView_defaultConfig = new WeakMap(), _VacuumView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_VacuumView_domain = { value: "vacuum" };



/***/ }),

/***/ "./src/cards lazy recursive ^\\.\\/.*$":
/*!***************************************************!*\
  !*** ./src/cards/ lazy ^\.\/.*$ namespace object ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./AbstractCard": [
		"./src/cards/AbstractCard.ts",
		"main"
	],
	"./AbstractCard.ts": [
		"./src/cards/AbstractCard.ts",
		"main"
	],
	"./AggregateCard": [
		"./src/cards/AggregateCard.ts",
		"main"
	],
	"./AggregateCard.ts": [
		"./src/cards/AggregateCard.ts",
		"main"
	],
	"./AggregateSection": [
		"./src/cards/AggregateSection.ts",
		"main"
	],
	"./AggregateSection.ts": [
		"./src/cards/AggregateSection.ts",
		"main"
	],
	"./AlarmCard": [
		"./src/cards/AlarmCard.ts",
		"main"
	],
	"./AlarmCard.ts": [
		"./src/cards/AlarmCard.ts",
		"main"
	],
	"./BinarySensorCard": [
		"./src/cards/BinarySensorCard.ts",
		"main"
	],
	"./BinarySensorCard.ts": [
		"./src/cards/BinarySensorCard.ts",
		"main"
	],
	"./CameraCard": [
		"./src/cards/CameraCard.ts",
		"main"
	],
	"./CameraCard.ts": [
		"./src/cards/CameraCard.ts",
		"main"
	],
	"./ClimateCard": [
		"./src/cards/ClimateCard.ts",
		"main"
	],
	"./ClimateCard.ts": [
		"./src/cards/ClimateCard.ts",
		"main"
	],
	"./ControllerCard": [
		"./src/cards/ControllerCard.ts"
	],
	"./ControllerCard.ts": [
		"./src/cards/ControllerCard.ts"
	],
	"./CoverCard": [
		"./src/cards/CoverCard.ts",
		"main"
	],
	"./CoverCard.ts": [
		"./src/cards/CoverCard.ts",
		"main"
	],
	"./FanCard": [
		"./src/cards/FanCard.ts",
		"main"
	],
	"./FanCard.ts": [
		"./src/cards/FanCard.ts",
		"main"
	],
	"./GroupedCard": [
		"./src/cards/GroupedCard.ts"
	],
	"./GroupedCard.ts": [
		"./src/cards/GroupedCard.ts"
	],
	"./HomeAreaCard": [
		"./src/cards/HomeAreaCard.ts",
		"main"
	],
	"./HomeAreaCard.ts": [
		"./src/cards/HomeAreaCard.ts",
		"main"
	],
	"./ImageAreaCard": [
		"./src/cards/ImageAreaCard.ts"
	],
	"./ImageAreaCard.ts": [
		"./src/cards/ImageAreaCard.ts"
	],
	"./LightCard": [
		"./src/cards/LightCard.ts",
		"main"
	],
	"./LightCard.ts": [
		"./src/cards/LightCard.ts",
		"main"
	],
	"./LockCard": [
		"./src/cards/LockCard.ts",
		"main"
	],
	"./LockCard.ts": [
		"./src/cards/LockCard.ts",
		"main"
	],
	"./MediaPlayerCard": [
		"./src/cards/MediaPlayerCard.ts",
		"main"
	],
	"./MediaPlayerCard.ts": [
		"./src/cards/MediaPlayerCard.ts",
		"main"
	],
	"./MiscellaneousCard": [
		"./src/cards/MiscellaneousCard.ts",
		"main"
	],
	"./MiscellaneousCard.ts": [
		"./src/cards/MiscellaneousCard.ts",
		"main"
	],
	"./NumberCard": [
		"./src/cards/NumberCard.ts",
		"main"
	],
	"./NumberCard.ts": [
		"./src/cards/NumberCard.ts",
		"main"
	],
	"./PersonCard": [
		"./src/cards/PersonCard.ts",
		"main"
	],
	"./PersonCard.ts": [
		"./src/cards/PersonCard.ts",
		"main"
	],
	"./SceneCard": [
		"./src/cards/SceneCard.ts",
		"main"
	],
	"./SceneCard.ts": [
		"./src/cards/SceneCard.ts",
		"main"
	],
	"./SensorCard": [
		"./src/cards/SensorCard.ts",
		"main"
	],
	"./SensorCard.ts": [
		"./src/cards/SensorCard.ts",
		"main"
	],
	"./SwipeCard": [
		"./src/cards/SwipeCard.ts"
	],
	"./SwipeCard.ts": [
		"./src/cards/SwipeCard.ts"
	],
	"./SwitchCard": [
		"./src/cards/SwitchCard.ts",
		"main"
	],
	"./SwitchCard.ts": [
		"./src/cards/SwitchCard.ts",
		"main"
	],
	"./VacuumCard": [
		"./src/cards/VacuumCard.ts",
		"main"
	],
	"./VacuumCard.ts": [
		"./src/cards/VacuumCard.ts",
		"main"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(() => {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./src/cards lazy recursive ^\\.\\/.*$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./src/views lazy recursive ^\\.\\/.*$":
/*!***************************************************!*\
  !*** ./src/views/ lazy ^\.\/.*$ namespace object ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./AbstractView": [
		"./src/views/AbstractView.ts",
		"main"
	],
	"./AbstractView.ts": [
		"./src/views/AbstractView.ts",
		"main"
	],
	"./AggregateView": [
		"./src/views/AggregateView.ts",
		"main"
	],
	"./AggregateView.ts": [
		"./src/views/AggregateView.ts",
		"main"
	],
	"./AreaView": [
		"./src/views/AreaView.ts"
	],
	"./AreaView.ts": [
		"./src/views/AreaView.ts"
	],
	"./CameraView": [
		"./src/views/CameraView.ts",
		"main"
	],
	"./CameraView.ts": [
		"./src/views/CameraView.ts",
		"main"
	],
	"./ClimateView": [
		"./src/views/ClimateView.ts",
		"main"
	],
	"./ClimateView.ts": [
		"./src/views/ClimateView.ts",
		"main"
	],
	"./CoverView": [
		"./src/views/CoverView.ts",
		"main"
	],
	"./CoverView.ts": [
		"./src/views/CoverView.ts",
		"main"
	],
	"./FanView": [
		"./src/views/FanView.ts",
		"main"
	],
	"./FanView.ts": [
		"./src/views/FanView.ts",
		"main"
	],
	"./FloorView": [
		"./src/views/FloorView.ts"
	],
	"./FloorView.ts": [
		"./src/views/FloorView.ts"
	],
	"./HomeView": [
		"./src/views/HomeView.ts",
		"main"
	],
	"./HomeView.ts": [
		"./src/views/HomeView.ts",
		"main"
	],
	"./LightView": [
		"./src/views/LightView.ts",
		"main"
	],
	"./LightView.ts": [
		"./src/views/LightView.ts",
		"main"
	],
	"./MediaPlayerView": [
		"./src/views/MediaPlayerView.ts",
		"main"
	],
	"./MediaPlayerView.ts": [
		"./src/views/MediaPlayerView.ts",
		"main"
	],
	"./SceneView": [
		"./src/views/SceneView.ts",
		"main"
	],
	"./SceneView.ts": [
		"./src/views/SceneView.ts",
		"main"
	],
	"./SecurityDetailsView": [
		"./src/views/SecurityDetailsView.ts",
		"main"
	],
	"./SecurityDetailsView.ts": [
		"./src/views/SecurityDetailsView.ts",
		"main"
	],
	"./SecurityView": [
		"./src/views/SecurityView.ts",
		"main"
	],
	"./SecurityView.ts": [
		"./src/views/SecurityView.ts",
		"main"
	],
	"./SwitchView": [
		"./src/views/SwitchView.ts",
		"main"
	],
	"./SwitchView.ts": [
		"./src/views/SwitchView.ts",
		"main"
	],
	"./UnavailableView": [
		"./src/views/UnavailableView.ts",
		"main"
	],
	"./UnavailableView.ts": [
		"./src/views/UnavailableView.ts",
		"main"
	],
	"./VacuumView": [
		"./src/views/VacuumView.ts",
		"main"
	],
	"./VacuumView.ts": [
		"./src/views/VacuumView.ts",
		"main"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(() => {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./src/views lazy recursive ^\\.\\/.*$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./src lazy recursive ^\\.\\/.*\\/.*$":
/*!*************************************************!*\
  !*** ./src/ lazy ^\.\/.*\/.*$ namespace object ***!
  \*************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./cards/AbstractCard": [
		"./src/cards/AbstractCard.ts",
		9,
		"main"
	],
	"./cards/AbstractCard.ts": [
		"./src/cards/AbstractCard.ts",
		9,
		"main"
	],
	"./cards/AggregateCard": [
		"./src/cards/AggregateCard.ts",
		9,
		"main"
	],
	"./cards/AggregateCard.ts": [
		"./src/cards/AggregateCard.ts",
		9,
		"main"
	],
	"./cards/AggregateSection": [
		"./src/cards/AggregateSection.ts",
		9,
		"main"
	],
	"./cards/AggregateSection.ts": [
		"./src/cards/AggregateSection.ts",
		9,
		"main"
	],
	"./cards/AlarmCard": [
		"./src/cards/AlarmCard.ts",
		9,
		"main"
	],
	"./cards/AlarmCard.ts": [
		"./src/cards/AlarmCard.ts",
		9,
		"main"
	],
	"./cards/BinarySensorCard": [
		"./src/cards/BinarySensorCard.ts",
		9,
		"main"
	],
	"./cards/BinarySensorCard.ts": [
		"./src/cards/BinarySensorCard.ts",
		9,
		"main"
	],
	"./cards/CameraCard": [
		"./src/cards/CameraCard.ts",
		9,
		"main"
	],
	"./cards/CameraCard.ts": [
		"./src/cards/CameraCard.ts",
		9,
		"main"
	],
	"./cards/ClimateCard": [
		"./src/cards/ClimateCard.ts",
		9,
		"main"
	],
	"./cards/ClimateCard.ts": [
		"./src/cards/ClimateCard.ts",
		9,
		"main"
	],
	"./cards/ControllerCard": [
		"./src/cards/ControllerCard.ts",
		9
	],
	"./cards/ControllerCard.ts": [
		"./src/cards/ControllerCard.ts",
		9
	],
	"./cards/CoverCard": [
		"./src/cards/CoverCard.ts",
		9,
		"main"
	],
	"./cards/CoverCard.ts": [
		"./src/cards/CoverCard.ts",
		9,
		"main"
	],
	"./cards/FanCard": [
		"./src/cards/FanCard.ts",
		9,
		"main"
	],
	"./cards/FanCard.ts": [
		"./src/cards/FanCard.ts",
		9,
		"main"
	],
	"./cards/GroupedCard": [
		"./src/cards/GroupedCard.ts",
		9
	],
	"./cards/GroupedCard.ts": [
		"./src/cards/GroupedCard.ts",
		9
	],
	"./cards/HomeAreaCard": [
		"./src/cards/HomeAreaCard.ts",
		9,
		"main"
	],
	"./cards/HomeAreaCard.ts": [
		"./src/cards/HomeAreaCard.ts",
		9,
		"main"
	],
	"./cards/ImageAreaCard": [
		"./src/cards/ImageAreaCard.ts",
		9
	],
	"./cards/ImageAreaCard.ts": [
		"./src/cards/ImageAreaCard.ts",
		9
	],
	"./cards/LightCard": [
		"./src/cards/LightCard.ts",
		9,
		"main"
	],
	"./cards/LightCard.ts": [
		"./src/cards/LightCard.ts",
		9,
		"main"
	],
	"./cards/LockCard": [
		"./src/cards/LockCard.ts",
		9,
		"main"
	],
	"./cards/LockCard.ts": [
		"./src/cards/LockCard.ts",
		9,
		"main"
	],
	"./cards/MediaPlayerCard": [
		"./src/cards/MediaPlayerCard.ts",
		9,
		"main"
	],
	"./cards/MediaPlayerCard.ts": [
		"./src/cards/MediaPlayerCard.ts",
		9,
		"main"
	],
	"./cards/MiscellaneousCard": [
		"./src/cards/MiscellaneousCard.ts",
		9,
		"main"
	],
	"./cards/MiscellaneousCard.ts": [
		"./src/cards/MiscellaneousCard.ts",
		9,
		"main"
	],
	"./cards/NumberCard": [
		"./src/cards/NumberCard.ts",
		9,
		"main"
	],
	"./cards/NumberCard.ts": [
		"./src/cards/NumberCard.ts",
		9,
		"main"
	],
	"./cards/PersonCard": [
		"./src/cards/PersonCard.ts",
		9,
		"main"
	],
	"./cards/PersonCard.ts": [
		"./src/cards/PersonCard.ts",
		9,
		"main"
	],
	"./cards/SceneCard": [
		"./src/cards/SceneCard.ts",
		9,
		"main"
	],
	"./cards/SceneCard.ts": [
		"./src/cards/SceneCard.ts",
		9,
		"main"
	],
	"./cards/SensorCard": [
		"./src/cards/SensorCard.ts",
		9,
		"main"
	],
	"./cards/SensorCard.ts": [
		"./src/cards/SensorCard.ts",
		9,
		"main"
	],
	"./cards/SwipeCard": [
		"./src/cards/SwipeCard.ts",
		9
	],
	"./cards/SwipeCard.ts": [
		"./src/cards/SwipeCard.ts",
		9
	],
	"./cards/SwitchCard": [
		"./src/cards/SwitchCard.ts",
		9,
		"main"
	],
	"./cards/SwitchCard.ts": [
		"./src/cards/SwitchCard.ts",
		9,
		"main"
	],
	"./cards/VacuumCard": [
		"./src/cards/VacuumCard.ts",
		9,
		"main"
	],
	"./cards/VacuumCard.ts": [
		"./src/cards/VacuumCard.ts",
		9,
		"main"
	],
	"./chips/AbstractChip": [
		"./src/chips/AbstractChip.ts",
		9
	],
	"./chips/AbstractChip.ts": [
		"./src/chips/AbstractChip.ts",
		9
	],
	"./chips/AggregateChip": [
		"./src/chips/AggregateChip.ts",
		9
	],
	"./chips/AggregateChip.ts": [
		"./src/chips/AggregateChip.ts",
		9
	],
	"./chips/AlarmChip": [
		"./src/chips/AlarmChip.ts",
		9,
		"main"
	],
	"./chips/AlarmChip.ts": [
		"./src/chips/AlarmChip.ts",
		9,
		"main"
	],
	"./chips/AreaScenesChips": [
		"./src/chips/AreaScenesChips.ts",
		9,
		"main"
	],
	"./chips/AreaScenesChips.ts": [
		"./src/chips/AreaScenesChips.ts",
		9,
		"main"
	],
	"./chips/AreaStateChip": [
		"./src/chips/AreaStateChip.ts",
		9
	],
	"./chips/AreaStateChip.ts": [
		"./src/chips/AreaStateChip.ts",
		9
	],
	"./chips/ClimateChip": [
		"./src/chips/ClimateChip.ts",
		9
	],
	"./chips/ClimateChip.ts": [
		"./src/chips/ClimateChip.ts",
		9
	],
	"./chips/ConditionalChip": [
		"./src/chips/ConditionalChip.ts",
		9,
		"main"
	],
	"./chips/ConditionalChip.ts": [
		"./src/chips/ConditionalChip.ts",
		9,
		"main"
	],
	"./chips/ControlChip": [
		"./src/chips/ControlChip.ts",
		9
	],
	"./chips/ControlChip.ts": [
		"./src/chips/ControlChip.ts",
		9
	],
	"./chips/CoverChip": [
		"./src/chips/CoverChip.ts",
		9
	],
	"./chips/CoverChip.ts": [
		"./src/chips/CoverChip.ts",
		9
	],
	"./chips/FanChip": [
		"./src/chips/FanChip.ts",
		9
	],
	"./chips/FanChip.ts": [
		"./src/chips/FanChip.ts",
		9
	],
	"./chips/LightChip": [
		"./src/chips/LightChip.ts",
		9
	],
	"./chips/LightChip.ts": [
		"./src/chips/LightChip.ts",
		9
	],
	"./chips/MediaPlayerChip": [
		"./src/chips/MediaPlayerChip.ts",
		9
	],
	"./chips/MediaPlayerChip.ts": [
		"./src/chips/MediaPlayerChip.ts",
		9
	],
	"./chips/SafetyChip": [
		"./src/chips/SafetyChip.ts",
		9,
		"main"
	],
	"./chips/SafetyChip.ts": [
		"./src/chips/SafetyChip.ts",
		9,
		"main"
	],
	"./chips/SettingsChip": [
		"./src/chips/SettingsChip.ts",
		9
	],
	"./chips/SettingsChip.ts": [
		"./src/chips/SettingsChip.ts",
		9
	],
	"./chips/SpotifyChip": [
		"./src/chips/SpotifyChip.ts",
		9,
		"main"
	],
	"./chips/SpotifyChip.ts": [
		"./src/chips/SpotifyChip.ts",
		9,
		"main"
	],
	"./chips/SwitchChip": [
		"./src/chips/SwitchChip.ts",
		9
	],
	"./chips/SwitchChip.ts": [
		"./src/chips/SwitchChip.ts",
		9
	],
	"./chips/ToggleSceneChip": [
		"./src/chips/ToggleSceneChip.ts",
		9
	],
	"./chips/ToggleSceneChip.ts": [
		"./src/chips/ToggleSceneChip.ts",
		9
	],
	"./chips/UnavailableChip": [
		"./src/chips/UnavailableChip.ts",
		9
	],
	"./chips/UnavailableChip.ts": [
		"./src/chips/UnavailableChip.ts",
		9
	],
	"./chips/WeatherChip": [
		"./src/chips/WeatherChip.ts",
		9,
		"main"
	],
	"./chips/WeatherChip.ts": [
		"./src/chips/WeatherChip.ts",
		9,
		"main"
	],
	"./popups/AbstractPopup": [
		"./src/popups/AbstractPopup.ts",
		9
	],
	"./popups/AbstractPopup.ts": [
		"./src/popups/AbstractPopup.ts",
		9
	],
	"./popups/AggregateAreaListPopup": [
		"./src/popups/AggregateAreaListPopup.ts",
		9,
		"main"
	],
	"./popups/AggregateAreaListPopup.ts": [
		"./src/popups/AggregateAreaListPopup.ts",
		9,
		"main"
	],
	"./popups/AggregateListPopup": [
		"./src/popups/AggregateListPopup.ts",
		9,
		"main"
	],
	"./popups/AggregateListPopup.ts": [
		"./src/popups/AggregateListPopup.ts",
		9,
		"main"
	],
	"./popups/AreaInformationsPopup": [
		"./src/popups/AreaInformationsPopup.ts",
		9
	],
	"./popups/AreaInformationsPopup.ts": [
		"./src/popups/AreaInformationsPopup.ts",
		9
	],
	"./popups/LightSettingsPopup": [
		"./src/popups/LightSettingsPopup.ts",
		9
	],
	"./popups/LightSettingsPopup.ts": [
		"./src/popups/LightSettingsPopup.ts",
		9
	],
	"./popups/SceneSettingsPopup": [
		"./src/popups/SceneSettingsPopup.ts",
		9
	],
	"./popups/SceneSettingsPopup.ts": [
		"./src/popups/SceneSettingsPopup.ts",
		9
	],
	"./popups/SettingsPopup": [
		"./src/popups/SettingsPopup.ts",
		9,
		"main"
	],
	"./popups/SettingsPopup.ts": [
		"./src/popups/SettingsPopup.ts",
		9,
		"main"
	],
	"./popups/TeslaPopup": [
		"./src/popups/TeslaPopup.ts",
		9,
		"main"
	],
	"./popups/TeslaPopup.ts": [
		"./src/popups/TeslaPopup.ts",
		9,
		"main"
	],
	"./popups/WeatherPopup": [
		"./src/popups/WeatherPopup.ts",
		9,
		"main"
	],
	"./popups/WeatherPopup.ts": [
		"./src/popups/WeatherPopup.ts",
		9,
		"main"
	],
	"./types/homeassistant/README.md": [
		"./src/types/homeassistant/README.md",
		7,
		"main"
	],
	"./types/homeassistant/data/area_registry": [
		"./src/types/homeassistant/data/area_registry.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/area_registry.ts": [
		"./src/types/homeassistant/data/area_registry.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/climate": [
		"./src/types/homeassistant/data/climate.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/climate.ts": [
		"./src/types/homeassistant/data/climate.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/device_registry": [
		"./src/types/homeassistant/data/device_registry.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/device_registry.ts": [
		"./src/types/homeassistant/data/device_registry.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/entity_registry": [
		"./src/types/homeassistant/data/entity_registry.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/entity_registry.ts": [
		"./src/types/homeassistant/data/entity_registry.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/floor_registry": [
		"./src/types/homeassistant/data/floor_registry.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/floor_registry.ts": [
		"./src/types/homeassistant/data/floor_registry.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/frontend": [
		"./src/types/homeassistant/data/frontend.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/frontend.ts": [
		"./src/types/homeassistant/data/frontend.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/light": [
		"./src/types/homeassistant/data/light.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/light.ts": [
		"./src/types/homeassistant/data/light.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/linus_dashboard": [
		"./src/types/homeassistant/data/linus_dashboard.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/linus_dashboard.ts": [
		"./src/types/homeassistant/data/linus_dashboard.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/lovelace": [
		"./src/types/homeassistant/data/lovelace.ts",
		9,
		"main"
	],
	"./types/homeassistant/data/lovelace.ts": [
		"./src/types/homeassistant/data/lovelace.ts",
		9,
		"main"
	],
	"./types/homeassistant/lovelace/cards/types": [
		"./src/types/homeassistant/lovelace/cards/types.ts",
		9,
		"main"
	],
	"./types/homeassistant/lovelace/cards/types.ts": [
		"./src/types/homeassistant/lovelace/cards/types.ts",
		9,
		"main"
	],
	"./types/homeassistant/panels/lovelave/cards/types": [
		"./src/types/homeassistant/panels/lovelave/cards/types.ts",
		9,
		"main"
	],
	"./types/homeassistant/panels/lovelave/cards/types.ts": [
		"./src/types/homeassistant/panels/lovelave/cards/types.ts",
		9,
		"main"
	],
	"./types/homeassistant/types": [
		"./src/types/homeassistant/types.ts",
		9,
		"main"
	],
	"./types/homeassistant/types.ts": [
		"./src/types/homeassistant/types.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/README.md": [
		"./src/types/lovelace-mushroom/README.md",
		7,
		"main"
	],
	"./types/lovelace-mushroom/cards/chips-card": [
		"./src/types/lovelace-mushroom/cards/chips-card.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/chips-card.ts": [
		"./src/types/lovelace-mushroom/cards/chips-card.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/climate-card-config": [
		"./src/types/lovelace-mushroom/cards/climate-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/climate-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/climate-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/cover-card-config": [
		"./src/types/lovelace-mushroom/cards/cover-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/cover-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/cover-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/entity-card-config": [
		"./src/types/lovelace-mushroom/cards/entity-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/entity-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/entity-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/fan-card-config": [
		"./src/types/lovelace-mushroom/cards/fan-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/fan-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/fan-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/light-card-config": [
		"./src/types/lovelace-mushroom/cards/light-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/light-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/light-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/lock-card-config": [
		"./src/types/lovelace-mushroom/cards/lock-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/lock-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/lock-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/media-player-card-config": [
		"./src/types/lovelace-mushroom/cards/media-player-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/media-player-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/media-player-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/number-card-config": [
		"./src/types/lovelace-mushroom/cards/number-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/number-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/number-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/person-card-config": [
		"./src/types/lovelace-mushroom/cards/person-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/person-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/person-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/scene-card-config": [
		"./src/types/lovelace-mushroom/cards/scene-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/scene-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/scene-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/swipe-card-config": [
		"./src/types/lovelace-mushroom/cards/swipe-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/swipe-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/swipe-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/template-card-config": [
		"./src/types/lovelace-mushroom/cards/template-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/template-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/template-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/title-card-config": [
		"./src/types/lovelace-mushroom/cards/title-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/title-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/title-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/vacuum-card-config": [
		"./src/types/lovelace-mushroom/cards/vacuum-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/cards/vacuum-card-config.ts": [
		"./src/types/lovelace-mushroom/cards/vacuum-card-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/actions-config": [
		"./src/types/lovelace-mushroom/shared/config/actions-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/actions-config.ts": [
		"./src/types/lovelace-mushroom/shared/config/actions-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/appearance-config": [
		"./src/types/lovelace-mushroom/shared/config/appearance-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/appearance-config.ts": [
		"./src/types/lovelace-mushroom/shared/config/appearance-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/entity-config": [
		"./src/types/lovelace-mushroom/shared/config/entity-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/entity-config.ts": [
		"./src/types/lovelace-mushroom/shared/config/entity-config.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/utils/info": [
		"./src/types/lovelace-mushroom/shared/config/utils/info.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/utils/info.ts": [
		"./src/types/lovelace-mushroom/shared/config/utils/info.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/utils/layout": [
		"./src/types/lovelace-mushroom/shared/config/utils/layout.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/shared/config/utils/layout.ts": [
		"./src/types/lovelace-mushroom/shared/config/utils/layout.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/utils/info": [
		"./src/types/lovelace-mushroom/utils/info.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/utils/info.ts": [
		"./src/types/lovelace-mushroom/utils/info.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/utils/lovelace/chip/types": [
		"./src/types/lovelace-mushroom/utils/lovelace/chip/types.ts",
		9,
		"main"
	],
	"./types/lovelace-mushroom/utils/lovelace/chip/types.ts": [
		"./src/types/lovelace-mushroom/utils/lovelace/chip/types.ts",
		9,
		"main"
	],
	"./types/strategy/cards": [
		"./src/types/strategy/cards.ts",
		9,
		"main"
	],
	"./types/strategy/cards.ts": [
		"./src/types/strategy/cards.ts",
		9,
		"main"
	],
	"./types/strategy/chips": [
		"./src/types/strategy/chips.ts",
		9,
		"main"
	],
	"./types/strategy/chips.ts": [
		"./src/types/strategy/chips.ts",
		9,
		"main"
	],
	"./types/strategy/generic": [
		"./src/types/strategy/generic.ts",
		9
	],
	"./types/strategy/generic.ts": [
		"./src/types/strategy/generic.ts",
		9
	],
	"./types/strategy/views": [
		"./src/types/strategy/views.ts",
		9,
		"main"
	],
	"./types/strategy/views.ts": [
		"./src/types/strategy/views.ts",
		9,
		"main"
	],
	"./views/AbstractView": [
		"./src/views/AbstractView.ts",
		9,
		"main"
	],
	"./views/AbstractView.ts": [
		"./src/views/AbstractView.ts",
		9,
		"main"
	],
	"./views/AggregateView": [
		"./src/views/AggregateView.ts",
		9,
		"main"
	],
	"./views/AggregateView.ts": [
		"./src/views/AggregateView.ts",
		9,
		"main"
	],
	"./views/AreaView": [
		"./src/views/AreaView.ts",
		9
	],
	"./views/AreaView.ts": [
		"./src/views/AreaView.ts",
		9
	],
	"./views/CameraView": [
		"./src/views/CameraView.ts",
		9,
		"main"
	],
	"./views/CameraView.ts": [
		"./src/views/CameraView.ts",
		9,
		"main"
	],
	"./views/ClimateView": [
		"./src/views/ClimateView.ts",
		9,
		"main"
	],
	"./views/ClimateView.ts": [
		"./src/views/ClimateView.ts",
		9,
		"main"
	],
	"./views/CoverView": [
		"./src/views/CoverView.ts",
		9,
		"main"
	],
	"./views/CoverView.ts": [
		"./src/views/CoverView.ts",
		9,
		"main"
	],
	"./views/FanView": [
		"./src/views/FanView.ts",
		9,
		"main"
	],
	"./views/FanView.ts": [
		"./src/views/FanView.ts",
		9,
		"main"
	],
	"./views/FloorView": [
		"./src/views/FloorView.ts",
		9
	],
	"./views/FloorView.ts": [
		"./src/views/FloorView.ts",
		9
	],
	"./views/HomeView": [
		"./src/views/HomeView.ts",
		9,
		"main"
	],
	"./views/HomeView.ts": [
		"./src/views/HomeView.ts",
		9,
		"main"
	],
	"./views/LightView": [
		"./src/views/LightView.ts",
		9,
		"main"
	],
	"./views/LightView.ts": [
		"./src/views/LightView.ts",
		9,
		"main"
	],
	"./views/MediaPlayerView": [
		"./src/views/MediaPlayerView.ts",
		9,
		"main"
	],
	"./views/MediaPlayerView.ts": [
		"./src/views/MediaPlayerView.ts",
		9,
		"main"
	],
	"./views/SceneView": [
		"./src/views/SceneView.ts",
		9,
		"main"
	],
	"./views/SceneView.ts": [
		"./src/views/SceneView.ts",
		9,
		"main"
	],
	"./views/SecurityDetailsView": [
		"./src/views/SecurityDetailsView.ts",
		9,
		"main"
	],
	"./views/SecurityDetailsView.ts": [
		"./src/views/SecurityDetailsView.ts",
		9,
		"main"
	],
	"./views/SecurityView": [
		"./src/views/SecurityView.ts",
		9,
		"main"
	],
	"./views/SecurityView.ts": [
		"./src/views/SecurityView.ts",
		9,
		"main"
	],
	"./views/SwitchView": [
		"./src/views/SwitchView.ts",
		9,
		"main"
	],
	"./views/SwitchView.ts": [
		"./src/views/SwitchView.ts",
		9,
		"main"
	],
	"./views/UnavailableView": [
		"./src/views/UnavailableView.ts",
		9,
		"main"
	],
	"./views/UnavailableView.ts": [
		"./src/views/UnavailableView.ts",
		9,
		"main"
	],
	"./views/VacuumView": [
		"./src/views/VacuumView.ts",
		9,
		"main"
	],
	"./views/VacuumView.ts": [
		"./src/views/VacuumView.ts",
		9,
		"main"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return Promise.all(ids.slice(2).map(__webpack_require__.e)).then(() => {
		return __webpack_require__.t(id, ids[1] | 16)
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./src lazy recursive ^\\.\\/.*\\/.*$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./src lazy recursive ^\\.\\/.*\\/Aggregate.*$":
/*!**********************************************************!*\
  !*** ./src/ lazy ^\.\/.*\/Aggregate.*$ namespace object ***!
  \**********************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./cards/AggregateCard": [
		"./src/cards/AggregateCard.ts",
		"main"
	],
	"./cards/AggregateCard.ts": [
		"./src/cards/AggregateCard.ts",
		"main"
	],
	"./cards/AggregateSection": [
		"./src/cards/AggregateSection.ts",
		"main"
	],
	"./cards/AggregateSection.ts": [
		"./src/cards/AggregateSection.ts",
		"main"
	],
	"./chips/AggregateChip": [
		"./src/chips/AggregateChip.ts"
	],
	"./chips/AggregateChip.ts": [
		"./src/chips/AggregateChip.ts"
	],
	"./popups/AggregateAreaListPopup": [
		"./src/popups/AggregateAreaListPopup.ts",
		"main"
	],
	"./popups/AggregateAreaListPopup.ts": [
		"./src/popups/AggregateAreaListPopup.ts",
		"main"
	],
	"./popups/AggregateListPopup": [
		"./src/popups/AggregateListPopup.ts",
		"main"
	],
	"./popups/AggregateListPopup.ts": [
		"./src/popups/AggregateListPopup.ts",
		"main"
	],
	"./views/AggregateView": [
		"./src/views/AggregateView.ts",
		"main"
	],
	"./views/AggregateView.ts": [
		"./src/views/AggregateView.ts",
		"main"
	]
};
function webpackAsyncContext(req) {
	if(!__webpack_require__.o(map, req)) {
		return Promise.resolve().then(() => {
			var e = new Error("Cannot find module '" + req + "'");
			e.code = 'MODULE_NOT_FOUND';
			throw e;
		});
	}

	var ids = map[req], id = ids[0];
	return Promise.all(ids.slice(1).map(__webpack_require__.e)).then(() => {
		return __webpack_require__(id);
	});
}
webpackAsyncContext.keys = () => (Object.keys(map));
webpackAsyncContext.id = "./src lazy recursive ^\\.\\/.*\\/Aggregate.*$";
module.exports = webpackAsyncContext;

/***/ }),

/***/ "./node_modules/superstruct/dist/index.mjs":
/*!*************************************************!*\
  !*** ./node_modules/superstruct/dist/index.mjs ***!
  \*************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   Struct: () => (/* binding */ Struct),
/* harmony export */   StructError: () => (/* binding */ StructError),
/* harmony export */   any: () => (/* binding */ any),
/* harmony export */   array: () => (/* binding */ array),
/* harmony export */   assert: () => (/* binding */ assert),
/* harmony export */   assign: () => (/* binding */ assign),
/* harmony export */   bigint: () => (/* binding */ bigint),
/* harmony export */   boolean: () => (/* binding */ boolean),
/* harmony export */   coerce: () => (/* binding */ coerce),
/* harmony export */   create: () => (/* binding */ create),
/* harmony export */   date: () => (/* binding */ date),
/* harmony export */   defaulted: () => (/* binding */ defaulted),
/* harmony export */   define: () => (/* binding */ define),
/* harmony export */   deprecated: () => (/* binding */ deprecated),
/* harmony export */   dynamic: () => (/* binding */ dynamic),
/* harmony export */   empty: () => (/* binding */ empty),
/* harmony export */   enums: () => (/* binding */ enums),
/* harmony export */   func: () => (/* binding */ func),
/* harmony export */   instance: () => (/* binding */ instance),
/* harmony export */   integer: () => (/* binding */ integer),
/* harmony export */   intersection: () => (/* binding */ intersection),
/* harmony export */   is: () => (/* binding */ is),
/* harmony export */   lazy: () => (/* binding */ lazy),
/* harmony export */   literal: () => (/* binding */ literal),
/* harmony export */   map: () => (/* binding */ map),
/* harmony export */   mask: () => (/* binding */ mask),
/* harmony export */   max: () => (/* binding */ max),
/* harmony export */   min: () => (/* binding */ min),
/* harmony export */   never: () => (/* binding */ never),
/* harmony export */   nonempty: () => (/* binding */ nonempty),
/* harmony export */   nullable: () => (/* binding */ nullable),
/* harmony export */   number: () => (/* binding */ number),
/* harmony export */   object: () => (/* binding */ object),
/* harmony export */   omit: () => (/* binding */ omit),
/* harmony export */   optional: () => (/* binding */ optional),
/* harmony export */   partial: () => (/* binding */ partial),
/* harmony export */   pattern: () => (/* binding */ pattern),
/* harmony export */   pick: () => (/* binding */ pick),
/* harmony export */   record: () => (/* binding */ record),
/* harmony export */   refine: () => (/* binding */ refine),
/* harmony export */   regexp: () => (/* binding */ regexp),
/* harmony export */   set: () => (/* binding */ set),
/* harmony export */   size: () => (/* binding */ size),
/* harmony export */   string: () => (/* binding */ string),
/* harmony export */   struct: () => (/* binding */ struct),
/* harmony export */   trimmed: () => (/* binding */ trimmed),
/* harmony export */   tuple: () => (/* binding */ tuple),
/* harmony export */   type: () => (/* binding */ type),
/* harmony export */   union: () => (/* binding */ union),
/* harmony export */   unknown: () => (/* binding */ unknown),
/* harmony export */   validate: () => (/* binding */ validate)
/* harmony export */ });
/**
 * A `StructFailure` represents a single specific failure in validation.
 */
/**
 * `StructError` objects are thrown (or returned) when validation fails.
 *
 * Validation logic is design to exit early for maximum performance. The error
 * represents the first error encountered during validation. For more detail,
 * the `error.failures` property is a generator function that can be run to
 * continue validation and receive all the failures in the data.
 */
class StructError extends TypeError {
    constructor(failure, failures) {
        let cached;
        const { message, explanation, ...rest } = failure;
        const { path } = failure;
        const msg = path.length === 0 ? message : `At path: ${path.join('.')} -- ${message}`;
        super(explanation ?? msg);
        if (explanation != null)
            this.cause = msg;
        Object.assign(this, rest);
        this.name = this.constructor.name;
        this.failures = () => {
            return (cached ?? (cached = [failure, ...failures()]));
        };
    }
}

/**
 * Check if a value is an iterator.
 */
function isIterable(x) {
    return isObject(x) && typeof x[Symbol.iterator] === 'function';
}
/**
 * Check if a value is a plain object.
 */
function isObject(x) {
    return typeof x === 'object' && x != null;
}
/**
 * Check if a value is a plain object.
 */
function isPlainObject(x) {
    if (Object.prototype.toString.call(x) !== '[object Object]') {
        return false;
    }
    const prototype = Object.getPrototypeOf(x);
    return prototype === null || prototype === Object.prototype;
}
/**
 * Return a value as a printable string.
 */
function print(value) {
    if (typeof value === 'symbol') {
        return value.toString();
    }
    return typeof value === 'string' ? JSON.stringify(value) : `${value}`;
}
/**
 * Shifts (removes and returns) the first value from the `input` iterator.
 * Like `Array.prototype.shift()` but for an `Iterator`.
 */
function shiftIterator(input) {
    const { done, value } = input.next();
    return done ? undefined : value;
}
/**
 * Convert a single validation result to a failure.
 */
function toFailure(result, context, struct, value) {
    if (result === true) {
        return;
    }
    else if (result === false) {
        result = {};
    }
    else if (typeof result === 'string') {
        result = { message: result };
    }
    const { path, branch } = context;
    const { type } = struct;
    const { refinement, message = `Expected a value of type \`${type}\`${refinement ? ` with refinement \`${refinement}\`` : ''}, but received: \`${print(value)}\``, } = result;
    return {
        value,
        type,
        refinement,
        key: path[path.length - 1],
        path,
        branch,
        ...result,
        message,
    };
}
/**
 * Convert a validation result to an iterable of failures.
 */
function* toFailures(result, context, struct, value) {
    if (!isIterable(result)) {
        result = [result];
    }
    for (const r of result) {
        const failure = toFailure(r, context, struct, value);
        if (failure) {
            yield failure;
        }
    }
}
/**
 * Check a value against a struct, traversing deeply into nested values, and
 * returning an iterator of failures or success.
 */
function* run(value, struct, options = {}) {
    const { path = [], branch = [value], coerce = false, mask = false } = options;
    const ctx = { path, branch };
    if (coerce) {
        value = struct.coercer(value, ctx);
        if (mask &&
            struct.type !== 'type' &&
            isObject(struct.schema) &&
            isObject(value) &&
            !Array.isArray(value)) {
            for (const key in value) {
                if (struct.schema[key] === undefined) {
                    delete value[key];
                }
            }
        }
    }
    let status = 'valid';
    for (const failure of struct.validator(value, ctx)) {
        failure.explanation = options.message;
        status = 'not_valid';
        yield [failure, undefined];
    }
    for (let [k, v, s] of struct.entries(value, ctx)) {
        const ts = run(v, s, {
            path: k === undefined ? path : [...path, k],
            branch: k === undefined ? branch : [...branch, v],
            coerce,
            mask,
            message: options.message,
        });
        for (const t of ts) {
            if (t[0]) {
                status = t[0].refinement != null ? 'not_refined' : 'not_valid';
                yield [t[0], undefined];
            }
            else if (coerce) {
                v = t[1];
                if (k === undefined) {
                    value = v;
                }
                else if (value instanceof Map) {
                    value.set(k, v);
                }
                else if (value instanceof Set) {
                    value.add(v);
                }
                else if (isObject(value)) {
                    if (v !== undefined || k in value)
                        value[k] = v;
                }
            }
        }
    }
    if (status !== 'not_valid') {
        for (const failure of struct.refiner(value, ctx)) {
            failure.explanation = options.message;
            status = 'not_refined';
            yield [failure, undefined];
        }
    }
    if (status === 'valid') {
        yield [undefined, value];
    }
}

/**
 * `Struct` objects encapsulate the validation logic for a specific type of
 * values. Once constructed, you use the `assert`, `is` or `validate` helpers to
 * validate unknown input data against the struct.
 */
class Struct {
    constructor(props) {
        const { type, schema, validator, refiner, coercer = (value) => value, entries = function* () { }, } = props;
        this.type = type;
        this.schema = schema;
        this.entries = entries;
        this.coercer = coercer;
        if (validator) {
            this.validator = (value, context) => {
                const result = validator(value, context);
                return toFailures(result, context, this, value);
            };
        }
        else {
            this.validator = () => [];
        }
        if (refiner) {
            this.refiner = (value, context) => {
                const result = refiner(value, context);
                return toFailures(result, context, this, value);
            };
        }
        else {
            this.refiner = () => [];
        }
    }
    /**
     * Assert that a value passes the struct's validation, throwing if it doesn't.
     */
    assert(value, message) {
        return assert(value, this, message);
    }
    /**
     * Create a value with the struct's coercion logic, then validate it.
     */
    create(value, message) {
        return create(value, this, message);
    }
    /**
     * Check if a value passes the struct's validation.
     */
    is(value) {
        return is(value, this);
    }
    /**
     * Mask a value, coercing and validating it, but returning only the subset of
     * properties defined by the struct's schema.
     */
    mask(value, message) {
        return mask(value, this, message);
    }
    /**
     * Validate a value with the struct's validation logic, returning a tuple
     * representing the result.
     *
     * You may optionally pass `true` for the `withCoercion` argument to coerce
     * the value before attempting to validate it. If you do, the result will
     * contain the coerced result when successful.
     */
    validate(value, options = {}) {
        return validate(value, this, options);
    }
}
/**
 * Assert that a value passes a struct, throwing if it doesn't.
 */
function assert(value, struct, message) {
    const result = validate(value, struct, { message });
    if (result[0]) {
        throw result[0];
    }
}
/**
 * Create a value with the coercion logic of struct and validate it.
 */
function create(value, struct, message) {
    const result = validate(value, struct, { coerce: true, message });
    if (result[0]) {
        throw result[0];
    }
    else {
        return result[1];
    }
}
/**
 * Mask a value, returning only the subset of properties defined by a struct.
 */
function mask(value, struct, message) {
    const result = validate(value, struct, { coerce: true, mask: true, message });
    if (result[0]) {
        throw result[0];
    }
    else {
        return result[1];
    }
}
/**
 * Check if a value passes a struct.
 */
function is(value, struct) {
    const result = validate(value, struct);
    return !result[0];
}
/**
 * Validate a value against a struct, returning an error if invalid, or the
 * value (with potential coercion) if valid.
 */
function validate(value, struct, options = {}) {
    const tuples = run(value, struct, options);
    const tuple = shiftIterator(tuples);
    if (tuple[0]) {
        const error = new StructError(tuple[0], function* () {
            for (const t of tuples) {
                if (t[0]) {
                    yield t[0];
                }
            }
        });
        return [error, undefined];
    }
    else {
        const v = tuple[1];
        return [undefined, v];
    }
}

function assign(...Structs) {
    const isType = Structs[0].type === 'type';
    const schemas = Structs.map((s) => s.schema);
    const schema = Object.assign({}, ...schemas);
    return isType ? type(schema) : object(schema);
}
/**
 * Define a new struct type with a custom validation function.
 */
function define(name, validator) {
    return new Struct({ type: name, schema: null, validator });
}
/**
 * Create a new struct based on an existing struct, but the value is allowed to
 * be `undefined`. `log` will be called if the value is not `undefined`.
 */
function deprecated(struct, log) {
    return new Struct({
        ...struct,
        refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx),
        validator(value, ctx) {
            if (value === undefined) {
                return true;
            }
            else {
                log(value, ctx);
                return struct.validator(value, ctx);
            }
        },
    });
}
/**
 * Create a struct with dynamic validation logic.
 *
 * The callback will receive the value currently being validated, and must
 * return a struct object to validate it with. This can be useful to model
 * validation logic that changes based on its input.
 */
function dynamic(fn) {
    return new Struct({
        type: 'dynamic',
        schema: null,
        *entries(value, ctx) {
            const struct = fn(value, ctx);
            yield* struct.entries(value, ctx);
        },
        validator(value, ctx) {
            const struct = fn(value, ctx);
            return struct.validator(value, ctx);
        },
        coercer(value, ctx) {
            const struct = fn(value, ctx);
            return struct.coercer(value, ctx);
        },
        refiner(value, ctx) {
            const struct = fn(value, ctx);
            return struct.refiner(value, ctx);
        },
    });
}
/**
 * Create a struct with lazily evaluated validation logic.
 *
 * The first time validation is run with the struct, the callback will be called
 * and must return a struct object to use. This is useful for cases where you
 * want to have self-referential structs for nested data structures to avoid a
 * circular definition problem.
 */
function lazy(fn) {
    let struct;
    return new Struct({
        type: 'lazy',
        schema: null,
        *entries(value, ctx) {
            struct ?? (struct = fn());
            yield* struct.entries(value, ctx);
        },
        validator(value, ctx) {
            struct ?? (struct = fn());
            return struct.validator(value, ctx);
        },
        coercer(value, ctx) {
            struct ?? (struct = fn());
            return struct.coercer(value, ctx);
        },
        refiner(value, ctx) {
            struct ?? (struct = fn());
            return struct.refiner(value, ctx);
        },
    });
}
/**
 * Create a new struct based on an existing object struct, but excluding
 * specific properties.
 *
 * Like TypeScript's `Omit` utility.
 */
function omit(struct, keys) {
    const { schema } = struct;
    const subschema = { ...schema };
    for (const key of keys) {
        delete subschema[key];
    }
    switch (struct.type) {
        case 'type':
            return type(subschema);
        default:
            return object(subschema);
    }
}
/**
 * Create a new struct based on an existing object struct, but with all of its
 * properties allowed to be `undefined`.
 *
 * Like TypeScript's `Partial` utility.
 */
function partial(struct) {
    const schema = struct instanceof Struct ? { ...struct.schema } : { ...struct };
    for (const key in schema) {
        schema[key] = optional(schema[key]);
    }
    return object(schema);
}
/**
 * Create a new struct based on an existing object struct, but only including
 * specific properties.
 *
 * Like TypeScript's `Pick` utility.
 */
function pick(struct, keys) {
    const { schema } = struct;
    const subschema = {};
    for (const key of keys) {
        subschema[key] = schema[key];
    }
    return object(subschema);
}
/**
 * Define a new struct type with a custom validation function.
 *
 * @deprecated This function has been renamed to `define`.
 */
function struct(name, validator) {
    console.warn('superstruct@0.11 - The `struct` helper has been renamed to `define`.');
    return define(name, validator);
}

/**
 * Ensure that any value passes validation.
 */
function any() {
    return define('any', () => true);
}
function array(Element) {
    return new Struct({
        type: 'array',
        schema: Element,
        *entries(value) {
            if (Element && Array.isArray(value)) {
                for (const [i, v] of value.entries()) {
                    yield [i, v, Element];
                }
            }
        },
        coercer(value) {
            return Array.isArray(value) ? value.slice() : value;
        },
        validator(value) {
            return (Array.isArray(value) ||
                `Expected an array value, but received: ${print(value)}`);
        },
    });
}
/**
 * Ensure that a value is a bigint.
 */
function bigint() {
    return define('bigint', (value) => {
        return typeof value === 'bigint';
    });
}
/**
 * Ensure that a value is a boolean.
 */
function boolean() {
    return define('boolean', (value) => {
        return typeof value === 'boolean';
    });
}
/**
 * Ensure that a value is a valid `Date`.
 *
 * Note: this also ensures that the value is *not* an invalid `Date` object,
 * which can occur when parsing a date fails but still returns a `Date`.
 */
function date() {
    return define('date', (value) => {
        return ((value instanceof Date && !isNaN(value.getTime())) ||
            `Expected a valid \`Date\` object, but received: ${print(value)}`);
    });
}
function enums(values) {
    const schema = {};
    const description = values.map((v) => print(v)).join();
    for (const key of values) {
        schema[key] = key;
    }
    return new Struct({
        type: 'enums',
        schema,
        validator(value) {
            return (values.includes(value) ||
                `Expected one of \`${description}\`, but received: ${print(value)}`);
        },
    });
}
/**
 * Ensure that a value is a function.
 */
function func() {
    return define('func', (value) => {
        return (typeof value === 'function' ||
            `Expected a function, but received: ${print(value)}`);
    });
}
/**
 * Ensure that a value is an instance of a specific class.
 */
function instance(Class) {
    return define('instance', (value) => {
        return (value instanceof Class ||
            `Expected a \`${Class.name}\` instance, but received: ${print(value)}`);
    });
}
/**
 * Ensure that a value is an integer.
 */
function integer() {
    return define('integer', (value) => {
        return ((typeof value === 'number' && !isNaN(value) && Number.isInteger(value)) ||
            `Expected an integer, but received: ${print(value)}`);
    });
}
/**
 * Ensure that a value matches all of a set of types.
 */
function intersection(Structs) {
    return new Struct({
        type: 'intersection',
        schema: null,
        *entries(value, ctx) {
            for (const S of Structs) {
                yield* S.entries(value, ctx);
            }
        },
        *validator(value, ctx) {
            for (const S of Structs) {
                yield* S.validator(value, ctx);
            }
        },
        *refiner(value, ctx) {
            for (const S of Structs) {
                yield* S.refiner(value, ctx);
            }
        },
    });
}
function literal(constant) {
    const description = print(constant);
    const t = typeof constant;
    return new Struct({
        type: 'literal',
        schema: t === 'string' || t === 'number' || t === 'boolean' ? constant : null,
        validator(value) {
            return (value === constant ||
                `Expected the literal \`${description}\`, but received: ${print(value)}`);
        },
    });
}
function map(Key, Value) {
    return new Struct({
        type: 'map',
        schema: null,
        *entries(value) {
            if (Key && Value && value instanceof Map) {
                for (const [k, v] of value.entries()) {
                    yield [k, k, Key];
                    yield [k, v, Value];
                }
            }
        },
        coercer(value) {
            return value instanceof Map ? new Map(value) : value;
        },
        validator(value) {
            return (value instanceof Map ||
                `Expected a \`Map\` object, but received: ${print(value)}`);
        },
    });
}
/**
 * Ensure that no value ever passes validation.
 */
function never() {
    return define('never', () => false);
}
/**
 * Augment an existing struct to allow `null` values.
 */
function nullable(struct) {
    return new Struct({
        ...struct,
        validator: (value, ctx) => value === null || struct.validator(value, ctx),
        refiner: (value, ctx) => value === null || struct.refiner(value, ctx),
    });
}
/**
 * Ensure that a value is a number.
 */
function number() {
    return define('number', (value) => {
        return ((typeof value === 'number' && !isNaN(value)) ||
            `Expected a number, but received: ${print(value)}`);
    });
}
function object(schema) {
    const knowns = schema ? Object.keys(schema) : [];
    const Never = never();
    return new Struct({
        type: 'object',
        schema: schema ? schema : null,
        *entries(value) {
            if (schema && isObject(value)) {
                const unknowns = new Set(Object.keys(value));
                for (const key of knowns) {
                    unknowns.delete(key);
                    yield [key, value[key], schema[key]];
                }
                for (const key of unknowns) {
                    yield [key, value[key], Never];
                }
            }
        },
        validator(value) {
            return (isObject(value) || `Expected an object, but received: ${print(value)}`);
        },
        coercer(value) {
            return isObject(value) ? { ...value } : value;
        },
    });
}
/**
 * Augment a struct to allow `undefined` values.
 */
function optional(struct) {
    return new Struct({
        ...struct,
        validator: (value, ctx) => value === undefined || struct.validator(value, ctx),
        refiner: (value, ctx) => value === undefined || struct.refiner(value, ctx),
    });
}
/**
 * Ensure that a value is an object with keys and values of specific types, but
 * without ensuring any specific shape of properties.
 *
 * Like TypeScript's `Record` utility.
 */
function record(Key, Value) {
    return new Struct({
        type: 'record',
        schema: null,
        *entries(value) {
            if (isObject(value)) {
                for (const k in value) {
                    const v = value[k];
                    yield [k, k, Key];
                    yield [k, v, Value];
                }
            }
        },
        validator(value) {
            return (isObject(value) || `Expected an object, but received: ${print(value)}`);
        },
    });
}
/**
 * Ensure that a value is a `RegExp`.
 *
 * Note: this does not test the value against the regular expression! For that
 * you need to use the `pattern()` refinement.
 */
function regexp() {
    return define('regexp', (value) => {
        return value instanceof RegExp;
    });
}
function set(Element) {
    return new Struct({
        type: 'set',
        schema: null,
        *entries(value) {
            if (Element && value instanceof Set) {
                for (const v of value) {
                    yield [v, v, Element];
                }
            }
        },
        coercer(value) {
            return value instanceof Set ? new Set(value) : value;
        },
        validator(value) {
            return (value instanceof Set ||
                `Expected a \`Set\` object, but received: ${print(value)}`);
        },
    });
}
/**
 * Ensure that a value is a string.
 */
function string() {
    return define('string', (value) => {
        return (typeof value === 'string' ||
            `Expected a string, but received: ${print(value)}`);
    });
}
/**
 * Ensure that a value is a tuple of a specific length, and that each of its
 * elements is of a specific type.
 */
function tuple(Structs) {
    const Never = never();
    return new Struct({
        type: 'tuple',
        schema: null,
        *entries(value) {
            if (Array.isArray(value)) {
                const length = Math.max(Structs.length, value.length);
                for (let i = 0; i < length; i++) {
                    yield [i, value[i], Structs[i] || Never];
                }
            }
        },
        validator(value) {
            return (Array.isArray(value) ||
                `Expected an array, but received: ${print(value)}`);
        },
    });
}
/**
 * Ensure that a value has a set of known properties of specific types.
 *
 * Note: Unrecognized properties are allowed and untouched. This is similar to
 * how TypeScript's structural typing works.
 */
function type(schema) {
    const keys = Object.keys(schema);
    return new Struct({
        type: 'type',
        schema,
        *entries(value) {
            if (isObject(value)) {
                for (const k of keys) {
                    yield [k, value[k], schema[k]];
                }
            }
        },
        validator(value) {
            return (isObject(value) || `Expected an object, but received: ${print(value)}`);
        },
        coercer(value) {
            return isObject(value) ? { ...value } : value;
        },
    });
}
/**
 * Ensure that a value matches one of a set of types.
 */
function union(Structs) {
    const description = Structs.map((s) => s.type).join(' | ');
    return new Struct({
        type: 'union',
        schema: null,
        coercer(value) {
            for (const S of Structs) {
                const [error, coerced] = S.validate(value, { coerce: true });
                if (!error) {
                    return coerced;
                }
            }
            return value;
        },
        validator(value, ctx) {
            const failures = [];
            for (const S of Structs) {
                const [...tuples] = run(value, S, ctx);
                const [first] = tuples;
                if (!first[0]) {
                    return [];
                }
                else {
                    for (const [failure] of tuples) {
                        if (failure) {
                            failures.push(failure);
                        }
                    }
                }
            }
            return [
                `Expected the value to satisfy a union of \`${description}\`, but received: ${print(value)}`,
                ...failures,
            ];
        },
    });
}
/**
 * Ensure that any value passes validation, without widening its type to `any`.
 */
function unknown() {
    return define('unknown', () => true);
}

/**
 * Augment a `Struct` to add an additional coercion step to its input.
 *
 * This allows you to transform input data before validating it, to increase the
 * likelihood that it passes validation—for example for default values, parsing
 * different formats, etc.
 *
 * Note: You must use `create(value, Struct)` on the value to have the coercion
 * take effect! Using simply `assert()` or `is()` will not use coercion.
 */
function coerce(struct, condition, coercer) {
    return new Struct({
        ...struct,
        coercer: (value, ctx) => {
            return is(value, condition)
                ? struct.coercer(coercer(value, ctx), ctx)
                : struct.coercer(value, ctx);
        },
    });
}
/**
 * Augment a struct to replace `undefined` values with a default.
 *
 * Note: You must use `create(value, Struct)` on the value to have the coercion
 * take effect! Using simply `assert()` or `is()` will not use coercion.
 */
function defaulted(struct, fallback, options = {}) {
    return coerce(struct, unknown(), (x) => {
        const f = typeof fallback === 'function' ? fallback() : fallback;
        if (x === undefined) {
            return f;
        }
        if (!options.strict && isPlainObject(x) && isPlainObject(f)) {
            const ret = { ...x };
            let changed = false;
            for (const key in f) {
                if (ret[key] === undefined) {
                    ret[key] = f[key];
                    changed = true;
                }
            }
            if (changed) {
                return ret;
            }
        }
        return x;
    });
}
/**
 * Augment a struct to trim string inputs.
 *
 * Note: You must use `create(value, Struct)` on the value to have the coercion
 * take effect! Using simply `assert()` or `is()` will not use coercion.
 */
function trimmed(struct) {
    return coerce(struct, string(), (x) => x.trim());
}

/**
 * Ensure that a string, array, map, or set is empty.
 */
function empty(struct) {
    return refine(struct, 'empty', (value) => {
        const size = getSize(value);
        return (size === 0 ||
            `Expected an empty ${struct.type} but received one with a size of \`${size}\``);
    });
}
function getSize(value) {
    if (value instanceof Map || value instanceof Set) {
        return value.size;
    }
    else {
        return value.length;
    }
}
/**
 * Ensure that a number or date is below a threshold.
 */
function max(struct, threshold, options = {}) {
    const { exclusive } = options;
    return refine(struct, 'max', (value) => {
        return exclusive
            ? value < threshold
            : value <= threshold ||
                `Expected a ${struct.type} less than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
    });
}
/**
 * Ensure that a number or date is above a threshold.
 */
function min(struct, threshold, options = {}) {
    const { exclusive } = options;
    return refine(struct, 'min', (value) => {
        return exclusive
            ? value > threshold
            : value >= threshold ||
                `Expected a ${struct.type} greater than ${exclusive ? '' : 'or equal to '}${threshold} but received \`${value}\``;
    });
}
/**
 * Ensure that a string, array, map or set is not empty.
 */
function nonempty(struct) {
    return refine(struct, 'nonempty', (value) => {
        const size = getSize(value);
        return (size > 0 || `Expected a nonempty ${struct.type} but received an empty one`);
    });
}
/**
 * Ensure that a string matches a regular expression.
 */
function pattern(struct, regexp) {
    return refine(struct, 'pattern', (value) => {
        return (regexp.test(value) ||
            `Expected a ${struct.type} matching \`/${regexp.source}/\` but received "${value}"`);
    });
}
/**
 * Ensure that a string, array, number, date, map, or set has a size (or length, or time) between `min` and `max`.
 */
function size(struct, min, max = min) {
    const expected = `Expected a ${struct.type}`;
    const of = min === max ? `of \`${min}\`` : `between \`${min}\` and \`${max}\``;
    return refine(struct, 'size', (value) => {
        if (typeof value === 'number' || value instanceof Date) {
            return ((min <= value && value <= max) ||
                `${expected} ${of} but received \`${value}\``);
        }
        else if (value instanceof Map || value instanceof Set) {
            const { size } = value;
            return ((min <= size && size <= max) ||
                `${expected} with a size ${of} but received one with a size of \`${size}\``);
        }
        else {
            const { length } = value;
            return ((min <= length && length <= max) ||
                `${expected} with a length ${of} but received one with a length of \`${length}\``);
        }
    });
}
/**
 * Augment a `Struct` to add an additional refinement to the validation.
 *
 * The refiner function is guaranteed to receive a value of the struct's type,
 * because the struct's existing validation will already have passed. This
 * allows you to layer additional validation on top of existing structs.
 */
function refine(struct, name, refiner) {
    return new Struct({
        ...struct,
        *refiner(value, ctx) {
            yield* struct.refiner(value, ctx);
            const result = refiner(value, ctx);
            const failures = toFailures(result, ctx, struct, value);
            for (const failure of failures) {
                yield { ...failure, refinement: name };
            }
        },
    });
}


//# sourceMappingURL=index.mjs.map


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/create fake namespace object */
/******/ 	(() => {
/******/ 		var getProto = Object.getPrototypeOf ? (obj) => (Object.getPrototypeOf(obj)) : (obj) => (obj.__proto__);
/******/ 		var leafPrototypes;
/******/ 		// create a fake namespace object
/******/ 		// mode & 1: value is a module id, require it
/******/ 		// mode & 2: merge all properties of value into the ns
/******/ 		// mode & 4: return value when already ns object
/******/ 		// mode & 16: return value when it's Promise-like
/******/ 		// mode & 8|1: behave like require
/******/ 		__webpack_require__.t = function(value, mode) {
/******/ 			if(mode & 1) value = this(value);
/******/ 			if(mode & 8) return value;
/******/ 			if(typeof value === 'object' && value) {
/******/ 				if((mode & 4) && value.__esModule) return value;
/******/ 				if((mode & 16) && typeof value.then === 'function') return value;
/******/ 			}
/******/ 			var ns = Object.create(null);
/******/ 			__webpack_require__.r(ns);
/******/ 			var def = {};
/******/ 			leafPrototypes = leafPrototypes || [null, getProto({}), getProto([]), getProto(getProto)];
/******/ 			for(var current = mode & 2 && value; typeof current == 'object' && !~leafPrototypes.indexOf(current); current = getProto(current)) {
/******/ 				Object.getOwnPropertyNames(current).forEach((key) => (def[key] = () => (value[key])));
/******/ 			}
/******/ 			def['default'] = () => (value);
/******/ 			__webpack_require__.d(ns, def);
/******/ 			return ns;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		// The chunk loading function for additional chunks
/******/ 		// Since all referenced chunks are already included
/******/ 		// in this file, this function is empty here.
/******/ 		__webpack_require__.e = () => (Promise.resolve());
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/linus-strategy.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=linus-strategy.js.map