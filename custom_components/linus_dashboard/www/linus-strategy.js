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
        // Dictionnaires pour un accès rapide
        const areasById = Object.fromEntries(areas.map(a => [a.area_id, a]));
        const floorsById = Object.fromEntries(floors.map(f => [f.floor_id, f]));
        const devicesByAreaIdMap = Object.fromEntries(devices.map(device => [device.id, device.area_id]));
        const entitiesByDeviceId = {};
        const entitiesByAreaId = {};
        const devicesByAreaId = {};
        __classPrivateFieldSet(this, _a, entities.reduce((acc, entity) => {
            if (!(entity.entity_id in __classPrivateFieldGet(this, _a, "f", _Helper_hassStates)) || entity.hidden_by)
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
            let domain = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getEntityDomain)(entity.entity_id);
            if (Object.keys(_variables__WEBPACK_IMPORTED_MODULE_2__.DEVICE_CLASSES).includes(domain)) {
                const entityState = _a.getEntityState(entity.entity_id);
                if (entityState?.attributes?.device_class)
                    domain = entityState.attributes.device_class;
            }
            if (!__classPrivateFieldGet(this, _a, "f", _Helper_domains)[domain])
                __classPrivateFieldGet(this, _a, "f", _Helper_domains)[domain] = [];
            if (entity.platform !== _variables__WEBPACK_IMPORTED_MODULE_2__.MAGIC_AREAS_DOMAIN)
                __classPrivateFieldGet(this, _a, "f", _Helper_domains)[domain].push(enrichedEntity);
            return acc;
        }, {}), "f", _Helper_entities);
        // Enrichir les appareils
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
                    entities: entitiesInDevice
                        .reduce((entities, entity) => {
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
        // Enrichir les zones
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
        // Enrichir les étages
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
        // console.log('this.#areas', info, this.#areas, this.#magicAreasDevices)
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
     * @param {string} domain The domain of the entities.
     * @param {string} operator The Comparison operator between state and value.
     * @param {string} value The value to which the state is compared against.
     * @param {string} area_id
     *
     * @return {string} The template string.
     * @static
     */
    static getCountTemplate(domain, operator, value, area_slug) {
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        for (const slug of areaSlugs) {
            if (slug) {
                const newStates = domain === "all"
                    ? __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.entities.map((entity_id) => `states['${entity_id}']`)
                    : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains[domain]?.map((entity_id) => `states['${entity_id}']`);
                if (newStates) {
                    states.push(...newStates);
                }
            }
            else {
                for (const area of Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_areas))) {
                    if (area.area_id === _variables__WEBPACK_IMPORTED_MODULE_2__.UNDISCLOSED)
                        continue;
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
    static getDeviceClassCountTemplate(device_class, operator, value, area_slug = "global") {
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const area_slugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        for (const slug of area_slugs) {
            const entities = area_slug === "global" ? (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getGlobalEntitiesExceptUndisclosed)(device_class) : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains[device_class];
            const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
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
    /**
     * Get a template string to define the average state of sensor entities with a given device class.
     *
     * @param {string} device_class The device class of the entities.
     * @param {string | string[]} area_slug The area slug(s) to filter entities by.
     *
     * @return {string} The template string.
     * @static
     */
    static getAverageStateTemplate(device_class, area_slug = "global") {
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        for (const slug of areaSlugs) {
            const magic_entity = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, "sensor", device_class);
            const newStates = magic_entity
                ? [`states['${magic_entity.entity_id}']`]
                : slug
                    ? __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`) || []
                    : [];
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
    static getAreaEntities(area, domain) {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        if (domain) {
            return area.domains[domain]?.map(entity_id => __classPrivateFieldGet(this, _a, "f", _Helper_entities)[entity_id]) ?? [];
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
        const stateEntities = __classPrivateFieldGet(this, _a, "f", _Helper_areas)[area.slug].domains[domain]?.map(entity_id => __classPrivateFieldGet(this, _a, "f", _Helper_hassStates)[entity_id]);
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
    static getFromDomainState({ domain, operator, value, ifReturn, elseReturn, area_slug }) {
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        for (const slug of areaSlugs) {
            if (slug) {
                const magic_entity = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, domain);
                const entities = magic_entity ? [magic_entity] : area_slug === "global" ? (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getGlobalEntitiesExceptUndisclosed)(domain) : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains[domain];
                const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
                if (newStates) {
                    states.push(...newStates);
                }
            }
            else {
                // Get the ID of the devices which are linked to the given area.
                for (const area of Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_areas))) {
                    if (area.area_id === _variables__WEBPACK_IMPORTED_MODULE_2__.UNDISCLOSED)
                        continue;
                    const newStates = domain === "all"
                        ? __classPrivateFieldGet(this, _a, "f", _Helper_areas)[area.slug]?.entities.map((entity_id) => `states['${entity_id}']`)
                        : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[area.slug]?.domains[domain]?.map((entity_id) => `states['${entity_id}']`);
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
    static getBinarySensorColorFromState(device_class, operator, value, ifReturn, elseReturn, area_slug = "global") {
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        for (const slug of areaSlugs) {
            const magic_entity = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, "binary_sensor", device_class);
            const entities = magic_entity ? [magic_entity] : area_slug === "global" ? (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getGlobalEntitiesExceptUndisclosed)(device_class) : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains[device_class];
            const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
            if (newStates)
                states.push(...newStates);
        }
        return `
      {% set entities = [${states}] %}
      {{ '${ifReturn}' if entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | selectattr('state','${operator}','${value}') | list | count else '${elseReturn}' }}`;
    }
    static getSensorColorFromState(device_class, area_slug = "global") {
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        for (const slug of areaSlugs) {
            const magic_entity = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, "binary_sensor", device_class);
            const entities = magic_entity ? [magic_entity] : area_slug === "global" ? (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getGlobalEntitiesExceptUndisclosed)(device_class) : __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains[device_class];
            const newStates = entities?.map((entity_id) => `states['${entity_id}']`);
            if (newStates)
                states.push(...newStates);
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
      `;
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
      `;
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
      `;
        }
        return undefined;
    }
    static getSensorIconFromState(device_class, area_slug = "global") {
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const areaSlugs = Array.isArray(area_slug) ? area_slug : [area_slug];
        for (const slug of areaSlugs) {
            const magic_entity = (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getMAEntity)(slug, "sensor", device_class);
            const newStates = magic_entity
                ? [`states['${magic_entity.entity_id}']`]
                : slug
                    ? __classPrivateFieldGet(this, _a, "f", _Helper_areas)[slug]?.domains[device_class]?.map((entity_id) => `states['${entity_id}']`) || []
                    : [];
            states.push(...newStates);
        }
        if (device_class === "battery") {
            return `
        {% set entities = [${states}] %}
        {% set bl = entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute='state') | map('float') | sum / entities | length %}
        {% if bl == 'unknown' or bl == 'unavailable' %}
        {% elif bl < 10 %} mdi:battery-outline
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
      `;
        }
        if (device_class === "temperature") {
            return `
        {% set entities = [${states}] %}
        {% set bl = entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | map(attribute='state') | map('float') | sum / entities | length %}
        {% if bl < 20 %}
          mdi:thermometer-low
        {% elif bl < 30 %}
          mdi:thermometer
        {% elif bl >= 30 %}
          mdi:thermometer-high
        {% else %}
          disabled
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
var _AggregateCard_domain, _AggregateCard_defaultConfig;



/**
 * Aggregate Card class.
 *
 * Used for creating a Title Card with controls.
 *
 * @class
 */
class AggregateCard {
    /**
     * Class constructor.
     *
     * @param {string} domain The domain to control the entities of.
     * @param {AggregateCardConfig} options Aggregate Card options.
     */
    constructor(domain, options = {}) {
        /**
         * @type {string} The domain to control the entities of.
         * @private
         */
        _AggregateCard_domain.set(this, void 0);
        /**
         * Default configuration of the card.
         *
         * @type {AggregateCardConfig}
         * @private
         */
        _AggregateCard_defaultConfig.set(this, {
            device_name: "Global",
        });
        __classPrivateFieldSet(this, _AggregateCard_domain, domain, "f");
        __classPrivateFieldSet(this, _AggregateCard_defaultConfig, {
            ...__classPrivateFieldGet(this, _AggregateCard_defaultConfig, "f"),
            ...options,
        }, "f");
    }
    /**
     * Create a Aggregate card.
     *
     * @return {StackCardConfig} A Aggregate card.
     */
    createCard() {
        const domains = typeof (__classPrivateFieldGet(this, _AggregateCard_domain, "f")) === "string" ? [__classPrivateFieldGet(this, _AggregateCard_domain, "f")] : __classPrivateFieldGet(this, _AggregateCard_domain, "f");
        const deviceClasses = __classPrivateFieldGet(this, _AggregateCard_defaultConfig, "f").device_class && typeof (__classPrivateFieldGet(this, _AggregateCard_defaultConfig, "f").device_class) === "string" ? [__classPrivateFieldGet(this, _AggregateCard_defaultConfig, "f").device_class] : __classPrivateFieldGet(this, _AggregateCard_defaultConfig, "f").device_class;
        const cards = [];
        const globalEntities = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getAggregateEntity)(_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.magicAreasDevices["global"], domains, deviceClasses)[0] ?? false;
        if (globalEntities) {
            cards.push({
                type: "tile",
                entity: globalEntities.entity_id,
                state_content: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getStateContent)(globalEntities.entity_id),
                color: globalEntities.entity_id.startsWith('binary_sensor.') ? 'red' : false,
                icon_tap_action: __classPrivateFieldGet(this, _AggregateCard_domain, "f") === "light" ? "more-info" : "toggle",
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
                    const areaEntities = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getAggregateEntity)(_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.magicAreasDevices[area.slug], domains, deviceClasses).map(e => e.entity_id).filter(Boolean);
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
_AggregateCard_domain = new WeakMap(), _AggregateCard_defaultConfig = new WeakMap();



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
    constructor(entity, options = {}) {
        super(entity);
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
    constructor(entity, options = {}) {
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
            camera_view: "live",
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
    constructor(entity, options = {}) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {ClimateCardConfig}
         * @private
         */
        _ClimateCard_defaultConfig.set(this, {
            type: "thermostat",
            icon: undefined,
            show_current_as_primary: true,
            vertical: false,
            features: [
                {
                    type: "target-temperature"
                },
                {
                    type: "climate-preset-modes",
                    style: "icons",
                    preset_modes: ["home", "eco", "comfort", "away", "boost"]
                },
                {
                    type: "climate-hvac-modes",
                    hvac_modes: [
                        "auto",
                        "heat_cool",
                        "heat",
                        "cool",
                        "dry",
                        "fan_only",
                        "off",
                    ]
                },
                {
                    type: "climate-fan-modes",
                    style: "icons",
                    fan_modes: [
                        "off",
                        "low",
                        "medium",
                        "high",
                    ]
                }
            ],
            layout_options: {
                grid_columns: 2,
                grid_rows: 1,
            },
        });
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
var _ControllerCard_target, _ControllerCard_domain, _ControllerCard_magic_device_id, _ControllerCard_defaultConfig;


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
     * @param {HassServiceTarget} target The target to control the entities of.
     * @param {cards.ControllerCardOptions} options Controller Card options.
     */
    constructor(target, options = {}, domain, magic_device_id = "global") {
        /**
         * @type {ExtendedHassServiceTarget} The target to control the entities of.
         * @private
         */
        _ControllerCard_target.set(this, void 0);
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
        __classPrivateFieldSet(this, _ControllerCard_target, target, "f");
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
                    tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_1__.navigateTo)(__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").subtitleNavigate),
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
                    tap_action: { action: "more-info" },
                    ...__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").controlChipOptions,
                };
                const chip = typeof chipModule === 'function' && new chipModule(chipOptions).getChip();
                badges.push({
                    type: "custom:mushroom-chips-card",
                    chips: [chip],
                    card_mod: {
                        style: `
            ha-card {
              min-width: 80px;
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
_ControllerCard_target = new WeakMap(), _ControllerCard_domain = new WeakMap(), _ControllerCard_magic_device_id = new WeakMap(), _ControllerCard_defaultConfig = new WeakMap();



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
    constructor(entity, options = {}) {
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
    constructor(entity, options = {}) {
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
        const { light_control, aggregate_health, aggregate_window, aggregate_door, aggregate_cover, aggregate_climate } = this.magicDevice?.entities || {};
        const { motion, occupancy, presence, window, climate, door, cover, health, light } = this.area.domains;
        return {
            type: "custom:mushroom-chips-card",
            alignment: "end",
            chips: [
                (motion || occupancy || presence) && new _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_3__.AreaStateChip({ area: this.area }).getChip(),
                health && new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__.ConditionalChip(aggregate_health ? [{ entity: aggregate_health?.entity_id, state: "on" }] : health.map(entity => ({ entity, state: "on" })), new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_2__.AggregateChip({ device_class: "health" }).getChip()).getChip(),
                window?.length && new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__.ConditionalChip(aggregate_window ? [{ entity: aggregate_window?.entity_id, state: "on" }] : window.map(entity => ({ entity, state: "on" })), new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_2__.AggregateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "window", show_content: false }).getChip()).getChip(),
                door && new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__.ConditionalChip(aggregate_door ? [{ entity: aggregate_door?.entity_id, state: "on" }] : door.map(entity => ({ entity, state: "on" })), new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_2__.AggregateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "door", show_content: false }).getChip()).getChip(),
                cover && new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_7__.ConditionalChip(aggregate_cover ? [{ entity: aggregate_cover?.entity_id, state: "on" }] : cover.map(entity => ({ entity, state: "on" })), new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_2__.AggregateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "cover", show_content: false }).getChip()).getChip(),
                climate && new _chips_ClimateChip__WEBPACK_IMPORTED_MODULE_5__.ClimateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug }).getChip(),
                light && new _chips_LightChip__WEBPACK_IMPORTED_MODULE_6__.LightChip({ area_slug: this.area.slug, magic_device_id: this.area.slug, tap_action: { action: "toggle" } }).getChip(),
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
            return _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getAverageStateTemplate("temperature");
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
    constructor(entity, options = {}) {
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
    constructor(entity, options = {}) {
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
    constructor(entity, options = {}) {
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
    constructor(entity, options = {}) {
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
    constructor(entity, options = {}) {
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
    constructor(entity, options = {}) {
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
    constructor(entity, options = {}) {
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
    constructor(entity, options = {}) {
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
        return {
            ...this.config,
        };
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
    constructor(entity, options = {}) {
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
    constructor(entity, options = {}) {
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
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");




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
            content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getDeviceClassCountTemplate(device_class, "eq", "on", area_slug) : "";
            icon_color = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getBinarySensorColorFromState(device_class, "eq", "on", "red", "grey", area_slug);
        }
        if (domain === "sensor") {
            content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getAverageStateTemplate(device_class, area_slug) : "";
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
                content = show_content ? _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getDeviceClassCountTemplate(device_class, "eq", "open", area_slug) : "";
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
            tap_action: magicEntity?.entity_id ? tap_action : (0,_utils__WEBPACK_IMPORTED_MODULE_3__.navigateTo)(device_class),
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.AggregateChipOptions} options The chip options.
     */
    constructor(options) {
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
        const motion_entities = aggregate_motion ? [aggregate_motion.entity_id] : area?.domains.motion ?? [];
        const presence_entities = aggregate_presence ? [aggregate_presence.entity_id] : area?.domains.presence ?? [];
        const occupancy_entities = aggregate_occupancy ? [aggregate_occupancy.entity_id] : area?.domains.occupancy ?? [];
        const media_player_entities = all_media_players ? [all_media_players.entity_id] : area?.domains.media_player ?? [];
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
            __classPrivateFieldGet(this, _ClimateChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("climate", "ne", "off", options?.area_slug);
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
        _CoverChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:window-open",
            content: "",
            tap_action: {
                action: "navigate",
                navigation_path: "cover",
            },
        });
        if (options?.show_content) {
            __classPrivateFieldGet(this, _CoverChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("cover", "eq", "open", options?.area_slug);
        }
        __classPrivateFieldGet(this, _CoverChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getFromDomainState({ domain: "cover", area_slug: options?.area_slug });
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
        _FanChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:fan",
            content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("fan", "eq", "on"),
            tap_action: {
                action: "navigate",
                navigation_path: "fan",
            },
        });
        if (options?.show_content) {
            __classPrivateFieldGet(this, _FanChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("fan", "eq", "on", options?.area_slug);
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
    constructor(options) {
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
            __classPrivateFieldGet(this, _LightChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("light", "eq", "on", options?.area_slug);
        }
        __classPrivateFieldGet(this, _LightChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getFromDomainState({ domain: "light", area_slug: options?.area_slug });
        const magicAreasEntity = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getMAEntity)(options?.magic_device_id ?? "global", "light");
        if (magicAreasEntity) {
            __classPrivateFieldGet(this, _LightChip_defaultConfig, "f").entity = magicAreasEntity.entity_id;
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
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
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
    constructor(options) {
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
            __classPrivateFieldGet(this, _MediaPlayerChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("media_player", "eq", "playing", options?.area_slug);
        }
        __classPrivateFieldGet(this, _MediaPlayerChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getFromDomainState({ domain: "media_player", area_slug: options?.area_slug });
        const magicAreasEntity = (0,_utils__WEBPACK_IMPORTED_MODULE_2__.getMAEntity)(options?.magic_device_id ?? "global", "media_player");
        if (magicAreasEntity) {
            __classPrivateFieldGet(this, _MediaPlayerChip_defaultConfig, "f").entity = magicAreasEntity.entity_id;
        }
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
        _SafetyChip_defaultConfig.set(this, {
            type: "template",
            icon: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons.binary_sensor.safety?.default,
            icon_color: "grey",
            content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getDeviceClassCountTemplate("safety", "ne", "off"),
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
            __classPrivateFieldGet(this, _SwitchChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("switch", "eq", "on", options?.area_slug);
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
        __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").content = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getCountTemplate("all", "eq", _variables__WEBPACK_IMPORTED_MODULE_3__.UNAVAILABLE, options?.area_slug);
        __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").icon = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getFromDomainState({
            domain: "all",
            operator: "eq",
            value: _variables__WEBPACK_IMPORTED_MODULE_3__.UNAVAILABLE,
            ifReturn: __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").icon,
            elseReturn: "mdi:alert-circle-check-outline",
            area_slug: options?.area_slug
        });
        __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").icon_color = _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getFromDomainState({
            domain: "all",
            operator: "eq",
            value: _variables__WEBPACK_IMPORTED_MODULE_3__.UNAVAILABLE,
            ifReturn: __classPrivateFieldGet(this, _UnavailableChip_defaultConfig, "f").icon_color,
            elseReturn: "green",
            area_slug: options?.area_slug
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
            if (![..._variables__WEBPACK_IMPORTED_MODULE_1__.CUSTOM_VIEWS, ..._variables__WEBPACK_IMPORTED_MODULE_1__.DOMAINS_VIEWS].includes(viewId))
                return;
            if (_variables__WEBPACK_IMPORTED_MODULE_1__.DOMAINS_VIEWS.includes(viewId) && (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains[viewId] ?? []).length === 0)
                return;
            let domain = viewId;
            let device_class = "_";
            if (_variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.binary_sensor.includes(viewId)) {
                domain = "binary_sensor";
                device_class = viewId;
            }
            else if (_variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.sensor.includes(viewId)) {
                domain = "sensor";
                device_class = viewId;
            }
            views.push({
                title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize((0,_utils__WEBPACK_IMPORTED_MODULE_3__.getDomainTranslationKey)(domain, device_class)),
                icon: _variables__WEBPACK_IMPORTED_MODULE_1__.VIEWS_ICONS[viewId] ?? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons[device_class === "battery" ? "binary_sensor" : domain]?.[device_class]?.default,
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
                else if ([..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.binary_sensor, ..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.sensor].includes(viewId)) {
                    const viewModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./views/AggregateView */ "./src/views/AggregateView.ts"));
                    view = await new viewModule.AggregateView({ device_class: viewId }).getView();
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
const version = "v1.0.3";
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
                                primary: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.button.area_state_popup.name"),
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
                    title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.button.settings_chip.name"),
                    content: {
                        type: "vertical-stack",
                        cards: [
                            {
                                type: "horizontal-stack",
                                cards: [
                                    linusDeviceIds.length > 0 && {
                                        type: "custom:mushroom-template-card",
                                        primary: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.button.settings_chip.state.on"),
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
                                        primary: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.button.settings_chip.state.off"),
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

/***/ "./src/utils.ts":
/*!**********************!*\
  !*** ./src/utils.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
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
/* harmony export */   slugify: () => (/* binding */ slugify)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Helper */ "./src/Helper.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./variables */ "./src/variables.ts");


/**
 * Groups the elements of an array based on a provided function
 * @param {T[]} array - The array to group
 * @param {(item: T) => K} fn - The function to determine the group key for each element
 * @returns {Record<K, T[]>} - An object where the keys are the group identifiers and the values are arrays of grouped elements
 */
function groupBy(array, fn) {
    return array.reduce((result, item) => {
        // Determine the group key for the current item
        const key = fn(item);
        // If the group key does not exist in the result, create an array for it
        if (!result[key]) {
            result[key] = [];
        }
        // Add the current item to the group
        result[key].push(item);
        return result;
    }, {});
}
function slugify(text, separator = "_") {
    if (text === "" || text === null) {
        return "";
    }
    const slug = text.toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, separator)
        .replace(/-/g, "_");
    return slug === "" ? "unknown" : slug;
}
function getMagicAreaSlug(device) {
    return slugify(device.name ?? "".replace('-', '_'));
}
function getStateContent(entity_id) {
    return entity_id.startsWith('binary_sensor.') ? 'last-changed' : 'state';
}
function navigateTo(path) {
    return {
        action: "navigate",
        navigation_path: `${path}`,
    };
}
function getAggregateEntity(device, domains, device_classes) {
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
}
function getMAEntity(magic_device_id, domain, device_class) {
    const magicAreaDevice = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[magic_device_id];
    // TODO remove '' when new release
    if (domain === _variables__WEBPACK_IMPORTED_MODULE_1__.LIGHT_DOMAIN)
        return magicAreaDevice?.entities?.[''] ?? magicAreaDevice?.entities?.['all_lights'];
    if (_variables__WEBPACK_IMPORTED_MODULE_1__.GROUP_DOMAINS.includes(domain))
        return magicAreaDevice?.entities?.[`${domain}_group`];
    if (device_class && [..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.binary_sensor, ..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.sensor].includes(device_class))
        return magicAreaDevice?.entities?.[`aggregate_${device_class}`];
    return undefined;
}
function getEntityDomain(entityId) {
    let domain = entityId.split(".")[0];
    return domain;
}
function groupEntitiesByDomain(entity_ids) {
    return entity_ids
        .reduce((acc, entity_id) => {
        let domain = getEntityDomain(entity_id);
        if (Object.keys(_variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES).includes(domain)) {
            const entityState = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(entity_id);
            if (entityState?.attributes?.device_class) {
                domain = entityState.attributes.device_class;
            }
        }
        if (!acc[domain]) {
            acc[domain] = [];
        }
        acc[domain].push(entity_id);
        return acc;
    }, {});
}
// Numeric chips.
async function createChipsFromList(chipsList, chipOptions, magic_device_id = "global", area_slug) {
    const chips = [];
    const area_slugs = area_slug ? Array.isArray(area_slug) ? area_slug : [area_slug] : [];
    const domains = magic_device_id === "global"
        ? Object.keys(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains)
        : area_slugs.flatMap(area_slug => Object.keys(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug]?.domains ?? {}));
    for (let chipType of chipsList) {
        if (!domains.includes(chipType))
            continue;
        const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(chipType + "Chip");
        try {
            let chipModule;
            if ([..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.binary_sensor, ..._variables__WEBPACK_IMPORTED_MODULE_1__.DEVICE_CLASSES.sensor].includes(chipType)) {
                chipModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./chips/AggregateChip */ "./src/chips/AggregateChip.ts"));
                const chip = new chipModule.AggregateChip({ ...chipOptions, device_class: chipType, area_slug, magic_device_id });
                chips.push(chip.getChip());
            }
            else {
                chipModule = await __webpack_require__("./src/chips lazy recursive ^\\.\\/.*$")("./" + className);
                const chip = new chipModule[className]({ ...chipOptions, area_slug });
                chips.push(chip.getChip());
            }
        }
        catch (e) {
            _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError(`An error occurred while creating the ${chipType} chip!`, e);
        }
    }
    return chips;
}
function getDomainTranslationKey(domain, device_class) {
    if (domain === 'scene')
        return 'ui.dialogs.quick-bar.commands.navigation.scene';
    if (_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(domain) && device_class)
        return `component.${domain}.entity_component.${device_class}.name`;
    return `component.${domain}.entity_component._.name`;
}
function getStateTranslationKey(state, domain, device_class) {
    if (domain === 'scene')
        return 'ui.dialogs.quick-bar.commands.navigation.scene';
    if (_variables__WEBPACK_IMPORTED_MODULE_1__.AGGREGATE_DOMAINS.includes(domain))
        return `component.${domain}.entity_component.${device_class}.state.${state}`;
    return `component.${domain}.entity_component._.name`;
}
function getFloorName(floor) {
    return floor.floor_id === _variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED ? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.linus_dashboard.entity.button.floor_not_found.name") : floor.name;
}
function getAreaName(area) {
    return area.area_id === _variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED ? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("ui.card.area.area_not_found") : area.name;
}
function getGlobalEntitiesExceptUndisclosed(device_class) {
    return _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains[device_class]?.filter(entity => !_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[_variables__WEBPACK_IMPORTED_MODULE_1__.UNDISCLOSED].domains[device_class]?.includes(entity.entity_id)).map(e => e.entity_id) ?? [];
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
/* harmony export */   MAGIC_AREAS_DOMAIN: () => (/* binding */ MAGIC_AREAS_DOMAIN),
/* harmony export */   MAGIC_AREAS_NAME: () => (/* binding */ MAGIC_AREAS_NAME),
/* harmony export */   SECURITY_EXPOSED_CHIPS: () => (/* binding */ SECURITY_EXPOSED_CHIPS),
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
const GROUP_DOMAINS = ["climate", "media_player", "cover"];
const AGGREGATE_DOMAINS = ["binary_sensor", "sensor"];
const DEVICE_CLASSES = {
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
const AREA_CARDS_DOMAINS = [LIGHT_DOMAIN, "switch", "climate", "fan", "camera", "cover", "vacuum", "media_player", "lock", "scene", "plant", "binary_sensor", "sensor"];
const CUSTOM_VIEWS = ["home", "security", "security-details"];
const DOMAINS_VIEWS = [...AREA_CARDS_DOMAINS, ...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor];
const HOME_EXPOSED_CHIPS = ["weather", "alarm", "spotify", LIGHT_DOMAIN, ...GROUP_DOMAINS, "fan", "switch", "safety", "motion", "occupancy", "door", "window"];
const AREA_EXPOSED_CHIPS = [LIGHT_DOMAIN, ...GROUP_DOMAINS, "fan", "switch", "safety", ...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor];
const SECURITY_EXPOSED_CHIPS = ["alarm", "safety", "motion", "occupancy", "door", "window"];
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
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./../variables */ "./src/variables.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../cards/SwipeCard */ "./src/cards/SwipeCard.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
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
        if (!_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.isInitialized()) {
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
        const viewSections = [];
        const configEntityHidden = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _AbstractView_domain, "f") ?? "_"].hide_config_entities
            || _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains["_"].hide_config_entities;
        let isFirstLoop = true;
        const floors = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.orderedFloors;
        for (const floor of floors) {
            if (floor.areas_slug.length === 0 || !_variables__WEBPACK_IMPORTED_MODULE_0__.AREA_CARDS_DOMAINS.includes(__classPrivateFieldGet(this, _AbstractView_domain, "f") ?? ""))
                continue;
            const floorCards = [];
            for (const area of floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.areas[area_slug])) {
                const entities = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getAreaEntities(area, __classPrivateFieldGet(this, _AbstractView_device_class, "f") ?? __classPrivateFieldGet(this, _AbstractView_domain, "f"));
                const className = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.sanitizeClassName(__classPrivateFieldGet(this, _AbstractView_domain, "f") + "Card");
                const cardModule = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`);
                if (entities.length === 0 || !cardModule)
                    continue;
                let target = { area_id: [area.slug] };
                if (area.area_id === _variables__WEBPACK_IMPORTED_MODULE_0__.UNDISCLOSED) {
                    target = { entity_id: entities.map(entity => entity.entity_id) };
                }
                const entityCards = entities
                    .filter(entity => !_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden
                    && !_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"]?.hidden
                    && !(entity.entity_category === "config" && configEntityHidden))
                    .map(entity => new cardModule[className](entity).getCard());
                if (entityCards.length) {
                    const areaCards = entityCards.length > 2 ? [new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_3__.SwipeCard(entityCards).getCard()] : entityCards;
                    const titleCardOptions = {
                        ..._Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _AbstractView_domain, "f")].controllerCardOptions,
                        subtitle: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getAreaName)(area),
                        subtitleIcon: area.area_id === _variables__WEBPACK_IMPORTED_MODULE_0__.UNDISCLOSED ? "mdi:help-circle" : area.icon ?? "mdi:floor-plan",
                        subtitleNavigate: area.slug
                    };
                    if (__classPrivateFieldGet(this, _AbstractView_domain, "f")) {
                        titleCardOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _AbstractView_domain, "f")].showControls;
                        titleCardOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _AbstractView_domain, "f")].extraControls;
                        titleCardOptions.controlChipOptions = { device_class: __classPrivateFieldGet(this, _AbstractView_device_class, "f"), area_slug: area.slug };
                    }
                    const areaControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(target, titleCardOptions, __classPrivateFieldGet(this, _AbstractView_domain, "f"), area.slug).createCard();
                    floorCards.push(...areaControllerCard, ...areaCards);
                }
            }
            if (floorCards.length) {
                const titleSectionOptions = {
                    ..._Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _AbstractView_domain, "f")].controllerCardOptions,
                    title: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getFloorName)(floor),
                    titleIcon: floor.icon ?? "mdi:floor-plan",
                    titleNavigate: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.slugify)(floor.name)
                };
                if (__classPrivateFieldGet(this, _AbstractView_domain, "f")) {
                    titleSectionOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _AbstractView_domain, "f")].showControls;
                    titleSectionOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _AbstractView_domain, "f")].extraControls;
                    titleSectionOptions.controlChipOptions = {
                        device_class: __classPrivateFieldGet(this, _AbstractView_device_class, "f"),
                        area_slug: floor.areas_slug
                    };
                }
                const area_ids = floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.areas[area_slug].area_id);
                const floorControllerCard = floors.length > 1 ? new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard({ area_id: area_ids }, titleSectionOptions, __classPrivateFieldGet(this, _AbstractView_domain, "f"), floor.floor_id).createCard() : [];
                const section = { type: "grid", cards: [] };
                if (isFirstLoop) {
                    section.cards.push(...this.viewControllerCard);
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
            entity_id: _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.domains[domain]?.filter(entity => !entity.hidden_by
                && !_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden).map(entity => entity.entity_id),
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
        const domain = _variables__WEBPACK_IMPORTED_MODULE_3__.DEVICE_CLASSES.sensor.includes(options?.device_class) ? "sensor" : "binary_sensor";
        super(domain, options?.device_class);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(options?.device_class), {
            title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize((0,_utils__WEBPACK_IMPORTED_MODULE_4__.getDomainTranslationKey)(domain, options?.device_class)),
            // subtitle: Helper.getDeviceClassCountTemplate(options?.device_class, "eq", "on") + ` ${Helper.localize(getStateTranslationKey("on", domain, options?.device_class))}s`,
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
/* harmony import */ var _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/SwipeCard */ "./src/cards/SwipeCard.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _cards_ImageAreaCard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../cards/ImageAreaCard */ "./src/cards/ImageAreaCard.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../chips/AreaStateChip */ "./src/chips/AreaStateChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../chips/UnavailableChip */ "./src/chips/UnavailableChip.ts");








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
     * Create the cards to include in the view.
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
        chips.push(new _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_5__.AreaStateChip({ area: this.area, showContent: true }).getChip());
        const areaChips = await (0,_utils__WEBPACK_IMPORTED_MODULE_6__.createChipsFromList)(_variables__WEBPACK_IMPORTED_MODULE_4__.AREA_EXPOSED_CHIPS, { show_content: true }, this.area.slug, this.area.slug);
        if (areaChips) {
            chips.push(...areaChips);
        }
        const unavailableChip = new _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_7__.UnavailableChip({ area_slug: this.area.slug }).getChip();
        if (unavailableChip)
            chips.push(unavailableChip);
        // (device?.entities.all_lights && device?.entities.all_lights.entity_id !== "unavailable" ? {
        //   type: "custom:mushroom-chips-card",
        //   alignment: "center",
        //   chips: new AreaScenesChips(device, area).getChips()
        // } : undefined)
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
        const viewSections = [];
        const exposedDomainIds = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getExposedDomainIds();
        // Create global section card if area is not undisclosed
        if (this.area.area_id !== _variables__WEBPACK_IMPORTED_MODULE_4__.UNDISCLOSED && this.area.picture) {
            viewSections.push({
                type: "grid",
                column_span: 1,
                cards: [new _cards_ImageAreaCard__WEBPACK_IMPORTED_MODULE_3__.ImageAreaCard(this.area.area_id).getCard()],
            });
        }
        let target = { area_id: [this.area.slug] };
        for (const domain of exposedDomainIds) {
            if (domain === "default")
                continue;
            try {
                const cardModule = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card")}`);
                const entities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getAreaEntities(this.area, domain);
                const configEntityHidden = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain]?.hide_config_entities || _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities;
                if (this.area.area_id === _variables__WEBPACK_IMPORTED_MODULE_4__.UNDISCLOSED) {
                    target = { entity_id: entities.map(entity => entity.entity_id) };
                }
                const domainCards = [];
                if (entities.length) {
                    const titleCardOptions = {
                        ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].controllerCardOptions,
                        subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize((0,_utils__WEBPACK_IMPORTED_MODULE_6__.getDomainTranslationKey)(domain)),
                        domain,
                        subtitleIcon: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons[domain]._?.default,
                        subtitleNavigate: domain,
                    };
                    if (domain) {
                        if (_variables__WEBPACK_IMPORTED_MODULE_4__.AGGREGATE_DOMAINS.includes(domain)) {
                            titleCardOptions.showControls = false;
                        }
                        else {
                            titleCardOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].showControls;
                            titleCardOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].extraControls;
                            titleCardOptions.controlChipOptions = { area_slug: this.area.slug };
                        }
                    }
                    const titleCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(target, titleCardOptions, domain, this.area.slug).createCard();
                    const entityCards = entities
                        .filter(entity => {
                        const cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                        const deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                        return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity.entity_category === "config" && configEntityHidden);
                    })
                        .map(entity => {
                        const cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                        if (domain === "sensor" && _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(entity.entity_id)?.attributes.unit_of_measurement) {
                            return new cardModule[_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card")](entity, {
                                type: "custom:mini-graph-card",
                                entities: [entity.entity_id],
                                ...cardOptions,
                            }).getCard();
                        }
                        return new cardModule[_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card")](entity, cardOptions).getCard();
                    });
                    if (entityCards.length) {
                        domainCards.push(...(entityCards.length > 2 ? [new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_1__.SwipeCard(entityCards).getCard()] : entityCards));
                        domainCards.unshift(...titleCard);
                    }
                    viewSections.push({
                        type: "grid",
                        column_span: 1,
                        cards: domainCards,
                    });
                }
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the domain cards!", e);
            }
        }
        // Handle default domain if not hidden
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.default.hidden) {
            const areaDevices = this.area.devices.filter(device_id => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.devices[device_id].area_id === this.area.area_id);
            const miscellaneousEntities = this.area.entities.filter(entity_id => {
                const entity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities[entity_id];
                const entityLinked = areaDevices.includes(entity.device_id ?? "null") || entity.area_id === this.area.area_id;
                const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
                const domainExposed = exposedDomainIds.includes(entity.entity_id.split(".", 1)[0]);
                return entityUnhidden && !domainExposed && entityLinked;
            });
            if (miscellaneousEntities.length) {
                try {
                    const cardModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../cards/MiscellaneousCard */ "./src/cards/MiscellaneousCard.ts"));
                    const miscellaneousEntityCards = miscellaneousEntities
                        .filter(entity_id => {
                        const entity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities[entity_id];
                        const cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                        const deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                        return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity.entity_category === "config" && _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities);
                    })
                        .map(entity_id => new cardModule.MiscellaneousCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities[entity_id], _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity_id]).getCard());
                    const miscellaneousCards = miscellaneousEntityCards.length > 2 ? [new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_1__.SwipeCard(miscellaneousEntityCards).getCard()] : miscellaneousEntityCards;
                    const titleCard = {
                        type: "heading",
                        heading: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("ui.panel.lovelace.editor.card.generic.other_cards"),
                        // icon: this.#defaultConfig.titleIcon,
                        heading_style: "subtitle",
                        badges: [],
                        layout_options: {
                            grid_columns: "full",
                            grid_rows: 1
                        },
                    };
                    viewSections.push({
                        type: "grid",
                        column_span: 1,
                        cards: [titleCard, ...miscellaneousCards],
                    });
                }
                catch (e) {
                    _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the domain cards!", e);
                }
            }
        }
        return viewSections;
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
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_0__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _CameraView_domain)), {
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
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _ClimateView_domain)), {
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
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _CoverView_domain)), {
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
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _FanView_domain)), {
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
/* harmony import */ var _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/SwipeCard */ "./src/cards/SwipeCard.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../chips/AreaStateChip */ "./src/chips/AreaStateChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");






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
        /**
         * View controller card.
         *
         * @type {LovelaceGridCardConfig[]}
         * @private
         */
        this.viewControllerCard = [];
        this.floor = floor;
        this.config = { ...this.config, ...options };
    }
    /**
     * Create the cards to include in the view.
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
        const device = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[this.floor.floor_id];
        if (device) {
            chips.push(new _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_4__.AreaStateChip({ floor: this.floor, showContent: true }).getChip());
        }
        const areaChips = await (0,_utils__WEBPACK_IMPORTED_MODULE_5__.createChipsFromList)(_variables__WEBPACK_IMPORTED_MODULE_3__.AREA_EXPOSED_CHIPS, { show_content: true }, this.floor.floor_id, this.floor.areas_slug);
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
        const viewSections = [];
        const exposedDomainIds = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getExposedDomainIds();
        let isFirstLoop = true;
        let target = { area_id: this.floor.areas_slug };
        for (const domain of exposedDomainIds) {
            if (domain === "default")
                continue;
            const domainCards = [];
            try {
                const cardModule = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card")}`);
                const configEntityHidden = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain]?.hide_config_entities || _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities;
                for (const area of this.floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug])) {
                    if (!area)
                        continue;
                    const areaEntities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getAreaEntities(area, domain);
                    if (areaEntities.length) {
                        const entityCards = areaEntities
                            .filter(entity => {
                            const cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                            const deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                            return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity.entity_category === "config" && configEntityHidden);
                        })
                            .map(entity => {
                            const cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                            if (domain === "sensor" && _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(entity.entity_id)?.attributes.unit_of_measurement) {
                                return new cardModule[_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card")](entity, {
                                    type: "custom:mini-graph-card",
                                    entities: [entity.entity_id],
                                    ...cardOptions,
                                }).getCard();
                            }
                            return new cardModule[_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card")](entity, cardOptions).getCard();
                        });
                        if (entityCards.length) {
                            const titleCardOptions = {
                                ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].controllerCardOptions,
                                subtitle: area.name,
                                domain,
                                subtitleIcon: area.icon,
                                subtitleNavigate: area.slug,
                            };
                            if (domain) {
                                titleCardOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].showControls;
                                titleCardOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].extraControls;
                                titleCardOptions.controlChipOptions = { area_slug: area.slug };
                            }
                            const titleCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(target, titleCardOptions, domain, area.slug).createCard();
                            let areaCards;
                            areaCards = entityCards.length > 2 ? [new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_1__.SwipeCard(entityCards).getCard()] : entityCards;
                            areaCards.unshift(...titleCard);
                            domainCards.push(...areaCards);
                        }
                    }
                }
                if (domainCards.length) {
                    const titleSectionOptions = {
                        ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].controllerCardOptions,
                        title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize((0,_utils__WEBPACK_IMPORTED_MODULE_5__.getDomainTranslationKey)(domain)),
                        titleIcon: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.icons[domain]._?.default ?? "mdi:floor-plan",
                        titleNavigate: domain,
                    };
                    if (domain) {
                        titleSectionOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].showControls;
                        titleSectionOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].extraControls;
                        titleSectionOptions.controlChipOptions = { area_slug: this.floor.areas_slug };
                    }
                    const area_ids = this.floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug].area_id);
                    const domainControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard({ area_id: area_ids }, titleSectionOptions, domain, this.floor.floor_id).createCard();
                    const section = { type: "grid", cards: [] };
                    if (isFirstLoop) {
                        section.cards.push(...this.viewControllerCard);
                        isFirstLoop = false;
                    }
                    section.cards.push(...domainControllerCard);
                    section.cards.push(...domainCards);
                    viewSections.push(section);
                }
                // // Handle default domain if not hidden
                // if (!Helper.strategyOptions.domains.default.hidden) {
                //   const areaDevices = area.devices.filter(device_id => Helper.devices[device_id].area_id === floor.area_id);
                //   const miscellaneousEntities = floor.entities.filter(entity_id => {
                //     const entity = Helper.entities[entity_id];
                //     const entityLinked = areaDevices.includes(entity.device_id ?? "null") || entity.area_id === floor.area_id;
                //     const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
                //     const domainExposed = exposedDomainIds.includes(entity.entity_id.split(".", 1)[0]);
                //     return entityUnhidden && !domainExposed && entityLinked;
                //   });
                //   if (miscellaneousEntities.length) {
                //     try {
                //       const cardModule = await import("../cards/MiscellaneousCard");
                //       const swipeCard = miscellaneousEntities
                //         .filter(entity_id => {
                //           const entity = Helper.entities[entity_id];
                //           const cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
                //           const deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                //           return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity.entity_category === "config" && Helper.strategyOptions.domains["_"].hide_config_entities);
                //         })
                //         .map(entity_id => new cardModule.MiscellaneousCard(Helper.entities[entity_id], Helper.strategyOptions.card_options?.[entity_id]).getCard());
                //       viewSections.push({
                //         type: "grid",
                //         column_span: 1,
                //         cards: [new SwipeCard(swipeCard).getCard()],
                //       });
                //     } catch (e) {
                //       Helper.logError("An error occurred while creating the domain cards!", e);
                //     }
                //   }
                // }
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the domain cards!", e);
            }
        }
        return viewSections;
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
/* harmony import */ var _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../chips/AggregateChip */ "./src/chips/AggregateChip.ts");
/* harmony import */ var _cards_PersonCard__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../cards/PersonCard */ "./src/cards/PersonCard.ts");
/* harmony import */ var _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(/*! ../chips/ConditionalChip */ "./src/chips/ConditionalChip.ts");
/* harmony import */ var _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(/*! ../chips/UnavailableChip */ "./src/chips/UnavailableChip.ts");
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
     * Create the cards to include in the view.
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
        let chipModule;
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
                chipModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../chips/AlarmChip */ "./src/chips/AlarmChip.ts"));
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
                chipModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../chips/SpotifyChip */ "./src/chips/SpotifyChip.ts"));
                const spotifyChip = new chipModule.SpotifyChip(spotifyEntityId);
                chips.push(spotifyChip.getChip());
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the spotify chip!", e);
            }
        }
        const homeChips = await (0,_utils__WEBPACK_IMPORTED_MODULE_4__.createChipsFromList)(_variables__WEBPACK_IMPORTED_MODULE_3__.HOME_EXPOSED_CHIPS, { show_content: true });
        if (homeChips) {
            chips.push(...homeChips);
        }
        const unavailableChip = new _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_9__.UnavailableChip().getChip();
        if (unavailableChip)
            chips.push(unavailableChip);
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
            const options = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions;
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
                if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("greeting")) {
                    const tod = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices.global?.entities.time_of_the_day;
                    floorSection.cards.push({
                        type: "custom:mushroom-template-card",
                        primary: `
          {% set tod = states("${tod?.entity_id}") %}
          {% if (tod == "evening") %} Bonne soirée, {{user}} !
          {% elif (tod == "daytime") %} Bonne après-midi, {{user}} !
          {% elif (tod == "night") %} Bonne nuit, {{user}} !
          {% else %} Bonjour, {{user}} !
          {% endif %}`,
                        icon: "mdi:hand-wave",
                        icon_color: "orange",
                        layout_options: {
                            grid_columns: 4,
                            grid_rows: 1,
                        },
                        tap_action: {
                            action: "none",
                        },
                        double_tap_action: {
                            action: "none",
                        },
                        hold_action: {
                            action: "none",
                        },
                    });
                }
                // Add quick access cards.
                if (options.quick_access_cards) {
                    floorSection.cards.push(...options.quick_access_cards);
                }
                // Add custom cards.
                if (options.extra_cards) {
                    floorSection.cards.push(...options.extra_cards);
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
            const temperatureEntity = (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getMAEntity)(floor.floor_id, "sensor", "temperature");
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
                                new _chips_ConditionalChip__WEBPACK_IMPORTED_MODULE_8__.ConditionalChip([{ entity: temperatureEntity?.entity_id, state_not: _variables__WEBPACK_IMPORTED_MODULE_3__.UNAVAILABLE }], new _chips_AggregateChip__WEBPACK_IMPORTED_MODULE_6__.AggregateChip({ device_class: "temperature", show_content: true, magic_device_id: floor.floor_id, area_slug: floor.areas_slug }).getChip()).getChip(),
                            ],
                            card_mod: {
                                style: `
                ha-card {
                  min-width: 80px;
                }
              `,
                            }
                        }],
                    tap_action: floor.floor_id !== _variables__WEBPACK_IMPORTED_MODULE_3__.UNDISCLOSED ? (0,_utils__WEBPACK_IMPORTED_MODULE_4__.navigateTo)((0,_utils__WEBPACK_IMPORTED_MODULE_4__.slugify)(floor.name)) : undefined,
                });
            }
            for (const area of floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug]).values()) {
                let module;
                let moduleName = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.slug]?.type ??
                    _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas["_"]?.type ??
                    "default";
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
        return entity.hidden_by == null
            && entity.disabled_by == null;
    });
    for (const person of persons) {
        cards.push(new _cards_PersonCard__WEBPACK_IMPORTED_MODULE_7__.PersonCard(person).getCard());
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
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _LightView_domain)), {
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
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _MediaPlayerView_domain)), {
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
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _SceneView_domain)), {
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
/* harmony import */ var _cards_AggregateCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/AggregateCard */ "./src/cards/AggregateCard.ts");


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
            viewCards.push(new _cards_AggregateCard__WEBPACK_IMPORTED_MODULE_1__.AggregateCard('binary_sensor', { device_class: 'motion', title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.binary_sensor.entity_component.motion.name") }).createCard());
            // viewCards.push(new AggregateCard({ entity_id: aggregate_motion.entity_id }, { title: `${Helper.localize("component.binary_sensor.entity_component.motion.name")}s` }).createCard())
        }
        if (aggregate_door?.entity_id || aggregate_window?.entity_id) {
            viewCards.push(new _cards_AggregateCard__WEBPACK_IMPORTED_MODULE_1__.AggregateCard('binary_sensor', { device_class: ['door', 'window'], title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.binary_sensor.entity_component.opening.name") }).createCard());
            // viewCards.push(new AggregateCard({ entity_id: [aggregate_door?.entity_id, aggregate_window?.entity_id] }, { title: `${Helper.localize("component.binary_sensor.entity_component.opening.name")}s` }).createCard())
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
/* harmony import */ var _cards_BinarySensorCard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../cards/BinarySensorCard */ "./src/cards/BinarySensorCard.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../cards/SwipeCard */ "./src/cards/SwipeCard.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");








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
        const homeChips = await (0,_utils__WEBPACK_IMPORTED_MODULE_4__.createChipsFromList)(_variables__WEBPACK_IMPORTED_MODULE_7__.SECURITY_EXPOSED_CHIPS, { show_content: true });
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
                heading: "Sécurité",
                heading_style: "title",
            });
            globalSection.cards.push({
                type: "heading",
                heading: "Alarme",
                heading_style: "subtitle",
            });
            globalSection.cards.push(new _cards_AlarmCard__WEBPACK_IMPORTED_MODULE_1__.AlarmCard(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities[alarmEntityId]).getCard());
        }
        const persons = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.domains.person;
        if (persons?.length) {
            globalSection.cards.push({
                type: "heading",
                heading: "Personnes",
                heading_style: "subtitle",
            });
            for (const person of persons) {
                globalSection.cards.push(new _cards_PersonCard__WEBPACK_IMPORTED_MODULE_2__.PersonCard(person, {
                    layout: "horizontal",
                    primary_info: "name",
                    secondary_info: "state"
                }).getCard());
            }
        }
        const globalDevice = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices["global"];
        const { aggregate_motion, aggregate_door, aggregate_window, } = globalDevice?.entities ?? {};
        if (aggregate_motion || aggregate_door || aggregate_window) {
            globalSection.cards.push({
                type: "heading",
                heading: "Capteurs",
                heading_style: "subtitle",
            });
            if (aggregate_motion?.entity_id)
                globalSection.cards.push(new _cards_BinarySensorCard__WEBPACK_IMPORTED_MODULE_3__.BinarySensorCard(aggregate_motion, { tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.navigateTo)('security-details') }).getCard());
            if (aggregate_door?.entity_id)
                globalSection.cards.push(new _cards_BinarySensorCard__WEBPACK_IMPORTED_MODULE_3__.BinarySensorCard(aggregate_door, { tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.navigateTo)('security-details') }).getCard());
            if (aggregate_window?.entity_id)
                globalSection.cards.push(new _cards_BinarySensorCard__WEBPACK_IMPORTED_MODULE_3__.BinarySensorCard(aggregate_window, { tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.navigateTo)('security-details') }).getCard());
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
        const orderedFloors = Object.values(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.floors).sort((a, b) => {
            // Check if 'level' is undefined in either object
            if (a.level === undefined)
                return 1; // a should come after b
            if (b.level === undefined)
                return -1; // b should come after a
            // Both 'level' values are defined, compare them
            return a.level - b.level;
        });
        for (const floor of orderedFloors) {
            if (floor.areas_slug.length === 0)
                continue;
            let floorCards = [
                {
                    type: "heading",
                    heading: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getFloorName)(floor),
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
            for (const [i, area] of floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas[area_slug]).entries()) {
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
                    entityCards.push(new cardModule[className](entity, cardOptions).getCard());
                }
                if (entityCards.length) {
                    if (entityCards.length > 2) {
                        areaCards.push(new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_5__.SwipeCard(entityCards).getCard());
                    }
                    else {
                        areaCards.push(...entityCards);
                    }
                }
                // Vertical stack the area cards if it has entities.
                if (areaCards.length) {
                    const titleCardOptions = {};
                    titleCardOptions.subtitle = (0,_utils__WEBPACK_IMPORTED_MODULE_4__.getAreaName)(area);
                    titleCardOptions.subtitleIcon = area.icon ?? "mdi:floor-plan";
                    titleCardOptions.navigate = area.slug;
                    if (domain) {
                        titleCardOptions.showControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].showControls;
                        titleCardOptions.extraControls = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain].extraControls;
                    }
                    // Create and insert a Controller card.
                    areaCards.unshift(...new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_6__.ControllerCard(target, titleCardOptions, domain).createCard());
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

/***/ "./src/views/SensorView.ts":
/*!*********************************!*\
  !*** ./src/views/SensorView.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SensorView: () => (/* binding */ SensorView)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _a, _SensorView_domain, _SensorView_defaultConfig, _SensorView_viewControllerCardConfig;



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Sensor View Class.
 *
 * Used to create a view for entities of the scene domain.
 *
 * @class SensorView
 * @extends AbstractView
 */
class SensorView extends _AbstractView__WEBPACK_IMPORTED_MODULE_2__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super(__classPrivateFieldGet(_a, _a, "f", _SensorView_domain));
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _SensorView_defaultConfig.set(this, {
            title: "Sensors",
            icon: "mdi:palette",
            subview: false,
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _SensorView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.sensor.entity_component._.name`)}s`,
            // subtitle: Helper.getCountTemplate(SensorView.#domain, "ne", "on") + ` ${Helper.localize(`ui.dialogs.quick-bar.commands.navigation.scene`)}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SensorView_defaultConfig, "f"), options);
        // Create a Controller card to scene all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _SensorView_domain)), {
            ...__classPrivateFieldGet(this, _SensorView_viewControllerCardConfig, "f"),
            ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.scene.controllerCardOptions,
        }, __classPrivateFieldGet(_a, _a, "f", _SensorView_domain)).createCard();
    }
}
_a = SensorView, _SensorView_defaultConfig = new WeakMap(), _SensorView_viewControllerCardConfig = new WeakMap();
/**
 * Domain of the view's entities.
 *
 * @type {string}
 * @static
 * @private
 */
_SensorView_domain = { value: "sensor" };



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
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _SwitchView_domain)), {
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
/* harmony import */ var _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../cards/SwipeCard */ "./src/cards/SwipeCard.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");




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
            for (const area of floor.areas_slug.map(area_slug => _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.areas[area_slug]).values()) {
                const entities = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.areas[area.slug].entities;
                const unavailableEntities = entities?.filter(entity_id => _variables__WEBPACK_IMPORTED_MODULE_0__.AREA_CARDS_DOMAINS.includes((0,_utils__WEBPACK_IMPORTED_MODULE_3__.getEntityDomain)(entity_id)) && _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getEntityState(entity_id)?.state === _variables__WEBPACK_IMPORTED_MODULE_0__.UNAVAILABLE).map(entity_id => _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.entities[entity_id]);
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
                    .map(entity => new cardModule.MiscellaneousCard(entity).getCard());
                if (entityCards.length) {
                    const areaCards = entityCards.length > 2 ? [new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_2__.SwipeCard(entityCards).getCard()] : entityCards;
                    floorCards.push(...areaCards);
                }
            }
            if (floorCards.length) {
                const titleSectionOptions = {
                    title: (0,_utils__WEBPACK_IMPORTED_MODULE_3__.getFloorName)(floor),
                    titleIcon: floor.icon ?? "mdi:floor-plan",
                    titleNavigate: (0,_utils__WEBPACK_IMPORTED_MODULE_3__.slugify)(floor.name)
                };
                viewSections.push({ type: "grid", cards: floorCards });
            }
        }
        if (viewSections.length) {
            viewSections.unshift({ type: "grid", cards: this.viewControllerCard });
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
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _VacuumView_domain)), {
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

/***/ "./src/chips lazy recursive ^\\.\\/.*$":
/*!***************************************************!*\
  !*** ./src/chips/ lazy ^\.\/.*$ namespace object ***!
  \***************************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var map = {
	"./AbstractChip": [
		"./src/chips/AbstractChip.ts"
	],
	"./AbstractChip.ts": [
		"./src/chips/AbstractChip.ts"
	],
	"./AggregateChip": [
		"./src/chips/AggregateChip.ts"
	],
	"./AggregateChip.ts": [
		"./src/chips/AggregateChip.ts"
	],
	"./AlarmChip": [
		"./src/chips/AlarmChip.ts",
		"main"
	],
	"./AlarmChip.ts": [
		"./src/chips/AlarmChip.ts",
		"main"
	],
	"./AreaScenesChips": [
		"./src/chips/AreaScenesChips.ts",
		"main"
	],
	"./AreaScenesChips.ts": [
		"./src/chips/AreaScenesChips.ts",
		"main"
	],
	"./AreaStateChip": [
		"./src/chips/AreaStateChip.ts"
	],
	"./AreaStateChip.ts": [
		"./src/chips/AreaStateChip.ts"
	],
	"./ClimateChip": [
		"./src/chips/ClimateChip.ts"
	],
	"./ClimateChip.ts": [
		"./src/chips/ClimateChip.ts"
	],
	"./ConditionalChip": [
		"./src/chips/ConditionalChip.ts",
		"main"
	],
	"./ConditionalChip.ts": [
		"./src/chips/ConditionalChip.ts",
		"main"
	],
	"./ControlChip": [
		"./src/chips/ControlChip.ts"
	],
	"./ControlChip.ts": [
		"./src/chips/ControlChip.ts"
	],
	"./CoverChip": [
		"./src/chips/CoverChip.ts"
	],
	"./CoverChip.ts": [
		"./src/chips/CoverChip.ts"
	],
	"./FanChip": [
		"./src/chips/FanChip.ts"
	],
	"./FanChip.ts": [
		"./src/chips/FanChip.ts"
	],
	"./LightChip": [
		"./src/chips/LightChip.ts"
	],
	"./LightChip.ts": [
		"./src/chips/LightChip.ts"
	],
	"./MediaPlayerChip": [
		"./src/chips/MediaPlayerChip.ts"
	],
	"./MediaPlayerChip.ts": [
		"./src/chips/MediaPlayerChip.ts"
	],
	"./SafetyChip": [
		"./src/chips/SafetyChip.ts",
		"main"
	],
	"./SafetyChip.ts": [
		"./src/chips/SafetyChip.ts",
		"main"
	],
	"./SettingsChip": [
		"./src/chips/SettingsChip.ts"
	],
	"./SettingsChip.ts": [
		"./src/chips/SettingsChip.ts"
	],
	"./SpotifyChip": [
		"./src/chips/SpotifyChip.ts",
		"main"
	],
	"./SpotifyChip.ts": [
		"./src/chips/SpotifyChip.ts",
		"main"
	],
	"./SwitchChip": [
		"./src/chips/SwitchChip.ts"
	],
	"./SwitchChip.ts": [
		"./src/chips/SwitchChip.ts"
	],
	"./ToggleSceneChip": [
		"./src/chips/ToggleSceneChip.ts"
	],
	"./ToggleSceneChip.ts": [
		"./src/chips/ToggleSceneChip.ts"
	],
	"./UnavailableChip": [
		"./src/chips/UnavailableChip.ts"
	],
	"./UnavailableChip.ts": [
		"./src/chips/UnavailableChip.ts"
	],
	"./WeatherChip": [
		"./src/chips/WeatherChip.ts",
		"main"
	],
	"./WeatherChip.ts": [
		"./src/chips/WeatherChip.ts",
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
webpackAsyncContext.id = "./src/chips lazy recursive ^\\.\\/.*$";
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
	"./SensorView": [
		"./src/views/SensorView.ts",
		"main"
	],
	"./SensorView.ts": [
		"./src/views/SensorView.ts",
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