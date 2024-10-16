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
var _a, _Helper_entities, _Helper_devices, _Helper_areas, _Helper_floors, _Helper_hassStates, _Helper_hassLocalize, _Helper_initialized, _Helper_strategyOptions, _Helper_magicAreasDevices, _Helper_debug, _Helper_areaFilterCallback, _Helper_getObjectKeysByPropertyValue;



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
     * @returns {StrategyArea[]}
     * @static
     */
    static get areas() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_areas);
    }
    /**
     * Get the entities from Home Assistant's floor registry.
     *
     * @returns {StrategyFloor[]}
     * @static
     */
    static get floors() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_floors).sort((a, b) => {
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
     * @returns {DeviceRegistryEntry[]}
     * @static
     */
    static get devices() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_devices);
    }
    /**
     * Get the entities from Home Assistant's entity registry.
     *
     * @returns {EntityRegistryEntry[]}
     * @static
     */
    static get entities() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_entities);
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
        console.log('info.hass.resources.fr', info.hass.resources.fr);
        __classPrivateFieldSet(this, _a, deepmerge__WEBPACK_IMPORTED_MODULE_1___default()(_configurationDefaults__WEBPACK_IMPORTED_MODULE_0__.configurationDefaults, info.config?.strategy?.options ?? {}), "f", _Helper_strategyOptions);
        __classPrivateFieldSet(this, _a, __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).debug, "f", _Helper_debug);
        try {
            // Query the registries of Home Assistant.
            // noinspection ES6MissingAwait False positive? https://youtrack.jetbrains.com/issue/WEB-63746
            [({ set value(_b) { __classPrivateFieldSet(_a, _a, _b, "f", _Helper_entities); } }).value, ({ set value(_b) { __classPrivateFieldSet(_a, _a, _b, "f", _Helper_devices); } }).value, ({ set value(_b) { __classPrivateFieldSet(_a, _a, _b, "f", _Helper_areas); } }).value, ({ set value(_b) { __classPrivateFieldSet(_a, _a, _b, "f", _Helper_floors); } }).value] = await Promise.all([
                info.hass.callWS({ type: "config/entity_registry/list" }),
                info.hass.callWS({ type: "config/device_registry/list" }),
                info.hass.callWS({ type: "config/area_registry/list" }),
                info.hass.callWS({ type: "config/floor_registry/list" }),
            ]);
        }
        catch (e) {
            _a.logError("An error occurred while querying Home assistant's registries!", e);
            throw 'Check the console for details';
        }
        // Create and add the undisclosed area if not hidden in the strategy options.
        if (!__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed?.hidden) {
            __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed = {
                ..._configurationDefaults__WEBPACK_IMPORTED_MODULE_0__.configurationDefaults.areas.undisclosed,
                ...__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed,
            };
            // Make sure the custom configuration of the undisclosed area doesn't overwrite the area_id.
            __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed.area_id = "undisclosed";
            __classPrivateFieldGet(this, _a, "f", _Helper_areas).push(__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas.undisclosed);
        }
        // Merge custom areas of the strategy options into strategy areas.
        __classPrivateFieldSet(this, _a, _a.areas.map(area => {
            return { ...area, ...__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).areas?.[area.area_id] };
        }), "f", _Helper_areas);
        // Sort strategy areas by order first and then by name.
        __classPrivateFieldGet(this, _a, "f", _Helper_areas).sort((a, b) => {
            return (a.order ?? Infinity) - (b.order ?? Infinity) || a.name.localeCompare(b.name);
        });
        // Find undisclosed and put it in last position.
        const indexUndisclosed = __classPrivateFieldGet(this, _a, "f", _Helper_areas).findIndex(item => item.area_id === "undisclosed");
        if (indexUndisclosed !== -1) {
            const areaUndisclosed = __classPrivateFieldGet(this, _a, "f", _Helper_areas).splice(indexUndisclosed, 1)[0];
            __classPrivateFieldGet(this, _a, "f", _Helper_areas).push(areaUndisclosed);
        }
        // Sort custom and default views of the strategy options by order first and then by title.
        __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).views = Object.fromEntries(Object.entries(__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).views).sort(([, a], [, b]) => {
            return (a.order ?? Infinity) - (b.order ?? Infinity) || (a.title ?? "undefined").localeCompare(b.title ?? "undefined");
        }));
        // Sort custom and default domains of the strategy options by order first and then by title.
        __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).domains = Object.fromEntries(Object.entries(__classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).domains).sort(([, a], [, b]) => {
            return (a.order ?? Infinity) - (b.order ?? Infinity) || (a.title ?? "undefined").localeCompare(b.title ?? "undefined");
        }));
        // Get magic areas devices.
        __classPrivateFieldSet(this, _a, _a.devices
            .filter(device => device.manufacturer === 'Magic Areas')
            .reduce((acc, device) => {
            acc[device.name] = {
                ...device,
                area_name: device.name,
                entities: __classPrivateFieldGet(this, _a, "f", _Helper_entities).filter(entity => entity.device_id === device.id)?.reduce((entities, entity) => {
                    entities[entity.translation_key] = entity;
                    return entities;
                }, {})
            };
            return acc;
        }, {}), "f", _Helper_magicAreasDevices);
        console.log('this.#magicAreasDevices', __classPrivateFieldGet(this, _a, "f", _Helper_magicAreasDevices));
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
    static getCountTemplate(domain, operator, value, area_id) {
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
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        // Get the ID of the devices which are linked to the given area.
        for (const area of __classPrivateFieldGet(this, _a, "f", _Helper_areas)) {
            if (area_id && area.area_id !== area_id)
                continue;
            const areaDeviceIds = __classPrivateFieldGet(this, _a, "f", _Helper_devices).filter((device) => {
                return device.area_id === area.area_id;
            }).map((device) => {
                return device.id;
            });
            // Get the entities of which all conditions of the callback function are met. @see areaFilterCallback.
            const newStates = __classPrivateFieldGet(this, _a, "f", _Helper_entities).filter(__classPrivateFieldGet(this, _a, "m", _Helper_areaFilterCallback), {
                area: area,
                domain: domain,
                areaDeviceIds: areaDeviceIds,
            })
                .map((entity) => `states['${entity.entity_id}']`);
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
    static getDeviceClassCountTemplate(domain, device_class, operator, value, area_id) {
        // noinspection JSMismatchedCollectionQueryUpdate (False positive per 17-04-2023)
        /**
         * Array of entity state-entries, filtered by device_class.
         *
         * Each element contains a template-string which is used to access home assistant's state machine (state object) in
         * a template.
         * E.g. "states['light.kitchen']"
         *
         * The array excludes hidden and disabled entities.
         *
         * @type {string[]}
         */
        const states = [];
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        // Get the ID of the devices which are linked to the given area.
        for (const area of __classPrivateFieldGet(this, _a, "f", _Helper_areas)) {
            if (area_id && area.area_id !== area_id)
                continue;
            const areaDeviceIds = __classPrivateFieldGet(this, _a, "f", _Helper_devices).filter((device) => {
                return device.area_id === area.area_id;
            }).map((device) => {
                return device.id;
            });
            // Get the entities of which all conditions of the callback function are met. @see areaFilterCallback.
            const newStates = __classPrivateFieldGet(this, _a, "f", _Helper_entities).filter(__classPrivateFieldGet(this, _a, "m", _Helper_areaFilterCallback), {
                area: area,
                domain: domain,
                areaDeviceIds: areaDeviceIds,
            })
                .map((entity) => `states['${entity.entity_id}']`);
            states.push(...newStates);
        }
        return `{% set entities = [${states}] %} {{ entities | selectattr('attributes.device_class', 'defined') | selectattr('attributes.device_class', 'eq', '${device_class}') | selectattr('state','${operator}','${value}') | list | count }}`;
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
     * @return {EntityRegistryEntry[]} Array of device entities.
     * @static
     */
    static getDeviceEntities(area, domain) {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        // Get the ID of the devices which are linked to the given area.
        const areaDeviceIds = __classPrivateFieldGet(this, _a, "f", _Helper_devices).filter((device) => {
            return (device.area_id ?? "undisclosed") === area.area_id;
        }).map((device) => {
            return device.id;
        });
        // Return the entities of which all conditions of the callback function are met. @see areaFilterCallback.
        let device_entities = __classPrivateFieldGet(this, _a, "f", _Helper_entities).filter(__classPrivateFieldGet(this, _a, "m", _Helper_areaFilterCallback), {
            area: area,
            domain: domain,
            areaDeviceIds: areaDeviceIds,
        })
            .sort((a, b) => {
            return (a.original_name ?? "undefined").localeCompare(b.original_name ?? "undefined");
        });
        if (domain == "light") {
            const device_lights = Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_magicAreasDevices)[area.name]?.entities ?? [])
                .filter(e => e.translation_key !== 'all_lights' && e.entity_id.endsWith('_lights'));
            device_lights.forEach(light => {
                const child_lights = __classPrivateFieldGet(_a, _a, "f", _Helper_hassStates)[light.entity_id].attributes?.entity_id;
                const filteredEntities = device_entities.filter(entity => !child_lights.includes(entity.entity_id));
                device_entities = [light, ...filteredEntities];
            });
        }
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
    static getStateEntities(area, domain) {
        if (!this.isInitialized()) {
            console.warn("Helper class should be initialized before calling this method!");
        }
        const states = [];
        // Create a map for the hassEntities and devices {id: object} to improve lookup speed.
        const entityMap = Object.fromEntries(__classPrivateFieldGet(this, _a, "f", _Helper_entities).map((entity) => [entity.entity_id, entity]));
        const deviceMap = Object.fromEntries(__classPrivateFieldGet(this, _a, "f", _Helper_devices).map((device) => [device.id, device]));
        // Get states whose entity-id starts with the given string.
        const stateEntities = Object.values(__classPrivateFieldGet(this, _a, "f", _Helper_hassStates)).filter((state) => state.entity_id.startsWith(`${domain}.`));
        for (const state of stateEntities) {
            const hassEntity = entityMap[state.entity_id];
            const device = deviceMap[hassEntity?.device_id ?? ""];
            // Collect states of which any (whichever comes first) of the conditions below are met:
            // 1. The linked entity is linked to the given area.
            // 2. The entity is linked to a device, and the linked device is linked to the given area.
            if ((hassEntity?.area_id === area.area_id)
                || (device && device.area_id === area.area_id)) {
                states.push(state);
            }
        }
        return states;
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
     * Get entity domain.
     *
     * @return {string}
     */
    static getEntityDomain(entityId) {
        return entityId.split(".")[0];
    }
    /**
     * Get translation.
     *
     * @return {string}
     */
    static localize(translationKey) {
        return __classPrivateFieldGet(this, _a, "f", _Helper_hassLocalize).call(this, translationKey);
    }
    /**
     * Get valid entity.
     *
     * @return {EntityRegistryEntry}
     */
    static getValidEntity(entity) {
        return entity.disabled_by === null && entity.hidden_by === null;
    }
    /**
     * Get Main Alarm entity.
     *
     * @return {EntityRegistryEntry}
     */
    static getAlarmEntity() {
        return __classPrivateFieldGet(_a, _a, "f", _Helper_entities).find((entity) => entity.entity_id.startsWith("alarm_control_panel.") && _a.getValidEntity(entity));
    }
    /**
     * Get Persons entity.
     *
     * @return {EntityRegistryEntry}
     */
    static getPersonsEntity() {
        return __classPrivateFieldGet(_a, _a, "f", _Helper_entities).filter((entity) => entity.entity_id.startsWith("person.") && _a.getValidEntity(entity));
    }
    /**
     * Get Cameras entity.
     *
     * @return {EntityRegistryEntry}
     */
    static getCamerasEntity() {
        return __classPrivateFieldGet(_a, _a, "f", _Helper_entities).filter((entity) => entity.entity_id.startsWith("camera.") && _a.getValidEntity(entity));
    }
}
_a = Helper, _Helper_areaFilterCallback = function _Helper_areaFilterCallback(entity) {
    const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
    const domainMatches = entity.entity_id.startsWith(`${this.domain}.`);
    const linusDeviceIds = __classPrivateFieldGet(_a, _a, "f", _Helper_devices).filter(d => [_variables__WEBPACK_IMPORTED_MODULE_2__.DOMAIN, "adaptive_lighting"].includes(d.identifiers[0]?.[0])).map(e => e.id);
    const isLinusEntity = linusDeviceIds.includes(entity.device_id ?? "") || entity.platform === _variables__WEBPACK_IMPORTED_MODULE_2__.DOMAIN;
    const entityLinked = this.area.area_id === "undisclosed"
        // Undisclosed area;
        // nor the entity itself, neither the entity's linked device (if any) is linked to any area.
        ? !entity.area_id && (this.areaDeviceIds.includes(entity.device_id ?? "") || !entity.device_id)
        // Area is a hass entity;
        // The entity's linked device or the entity itself is linked to the given area.
        : this.areaDeviceIds.includes(entity.device_id ?? "") || entity.area_id === this.area.area_id;
    return (!isLinusEntity && entityUnhidden && domainMatches && entityLinked);
}, _Helper_getObjectKeysByPropertyValue = function _Helper_getObjectKeysByPropertyValue(object, property, value) {
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
 * @type {EntityRegistryEntry[]}
 * @private
 */
_Helper_entities = { value: void 0 };
/**
 * An array of entities from Home Assistant's device registry.
 *
 * @type {DeviceRegistryEntry[]}
 * @private
 */
_Helper_devices = { value: void 0 };
/**
 * An array of entities from Home Assistant's area registry.
 *
 * @type {StrategyArea[]}
 * @private
 */
_Helper_areas = { value: [] };
/**
 * An array of entities from Home Assistant's area registry.
 *
 * @type {StrategyFloor[]}
 * @private
 */
_Helper_floors = { value: [] };
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
_Helper_magicAreasDevices = { value: void 0 };
/**
 * Set to true for more verbose information in the console.
 *
 * @type {boolean}
 * @private
 */
_Helper_debug = { value: void 0 };



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
            entity: "entity_id" in this.entity ? this.entity.entity_id : undefined,
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
        const globalEntities = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getAggregateEntity)(_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.magicAreasDevices["Global"], domains, deviceClasses)[0] ?? false;
        if (globalEntities) {
            cards.push({
                type: "tile",
                entity: globalEntities.entity_id,
                state_content: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getStateContent)(globalEntities.entity_id),
                color: globalEntities.entity_id.startsWith('binary_sensor.') ? 'red' : false,
                icon_tap_action: __classPrivateFieldGet(this, _AggregateCard_domain, "f") === "light" ? "more-info" : "toggle",
            });
        }
        const areasByFloor = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.groupBy)(_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.areas, (e) => e.floor_id ?? "undisclosed");
        for (const floor of [..._Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.floors, _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.floors.undisclosed]) {
            if (!(floor.floor_id in areasByFloor) || areasByFloor[floor.floor_id].length === 0)
                continue;
            let floorCards = [];
            floorCards.push({
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
            for (const [i, area] of areasByFloor[floor.floor_id].entries()) {
                if (_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.areas[area.area_id]?.hidden)
                    continue;
                if (area.area_id !== "undisclosed") {
                    const areaEntities = (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getAggregateEntity)(_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.magicAreasDevices[area.name], domains, deviceClasses).map(e => e.entity_id).filter(Boolean);
                    for (const areaEntity of areaEntities) {
                        areaCards.push({
                            type: "tile",
                            entity: areaEntity,
                            primary: area.name,
                            state_content: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.getStateContent)(areaEntity),
                            color: areaEntity.startsWith('binary_sensor.') ? 'red' : false,
                        });
                    }
                }
                // Horizontally group every two area cards if all cards are created.
                if (i === areasByFloor[floor.floor_id].length - 1) {
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

/***/ "./src/cards/AreaButtonCard.ts":
/*!*************************************!*\
  !*** ./src/cards/AreaButtonCard.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AreaCard: () => (/* binding */ AreaCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _chips_LightControlChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../chips/LightControlChip */ "./src/chips/LightControlChip.ts");
/* harmony import */ var _chips_LinusLightChip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../chips/LinusLightChip */ "./src/chips/LinusLightChip.ts");
/* harmony import */ var _chips_LinusClimateChip__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../chips/LinusClimateChip */ "./src/chips/LinusClimateChip.ts");
/* harmony import */ var _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../chips/LinusAggregateChip */ "./src/chips/LinusAggregateChip.ts");
/* harmony import */ var _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../chips/AreaStateChip */ "./src/chips/AreaStateChip.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");








// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area Button Card Class
 *
 * Used to create a card for an entity of the area domain.
 *
 * @class
 * @extends AbstractCard
 */
class AreaCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    getDefaultConfig(area, device) {
        if (area.area_id === "undisclosed") {
            return {
                type: "custom:stack-in-card",
                cards: [
                    {
                        type: "custom:stack-in-card",
                        mode: "horizontal",
                        cards: [
                            {
                                type: "custom:mushroom-template-card",
                                primary: area.name,
                                secondary: null,
                                icon: "mdi:devices",
                                icon_color: "grey",
                                fill_container: true,
                                layout: "horizontal",
                                multiline_secondary: false,
                                tap_action: {
                                    action: "navigate",
                                    navigation_path: (0,_utils__WEBPACK_IMPORTED_MODULE_7__.slugify)(area.name),
                                },
                                hold_action: {
                                    action: "none",
                                },
                                double_tap_action: {
                                    action: "none"
                                },
                                card_mod: {
                                    style: `
                  :host {
                    background: #1f1f1f;
                    --mush-icon-size: 74px;
                    height: 66px;
                    margin-left: -26px !important;
                  }
                  mushroom-badge-icon {
                      left: 178px;
                      top: 17px;
                  }
                  ha-card {
                    box-shadow: none!important;
                    border: none;
                  }
                `,
                                }
                            }
                        ],
                        card_mod: {
                            style: `
              ha-card {
                box-shadow: none!important;
                border: none;
              }
            `
                        }
                    }
                ]
            };
        }
        const { area_state, all_lights, aggregate_temperature, aggregate_battery, aggregate_door, aggregate_window, aggregate_health, aggregate_climate, aggregate_cover, light_control } = device.entities;
        const icon = area.icon || "mdi:home-outline";
        return {
            type: "custom:stack-in-card",
            cards: [
                {
                    type: "custom:stack-in-card",
                    mode: "horizontal",
                    cards: [
                        {
                            type: "custom:mushroom-template-card",
                            primary: area.name,
                            secondary: `
          {% set t = states('${aggregate_temperature?.entity_id}') %}
          {% if t != 'unknown' and t != 'unavailable' %}
            {{ t | float | round(1) }}{{ state_attr('${aggregate_temperature?.entity_id}', 'unit_of_measurement')}}
          {% endif %}
          `,
                            icon: icon,
                            icon_color: `
          {{ "indigo" if "dark" in state_attr('${area_state?.entity_id}', 'states') else "amber" }}
          `,
                            fill_container: true,
                            layout: "horizontal",
                            multiline_secondary: false,
                            badge_icon: `
          {% set bl = states('${aggregate_battery?.entity_id}') %}
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
          `,
                            badge_color: `{% set bl = states('${aggregate_battery?.entity_id}') %}
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
          {% elif bl | int() < 100 %} green
          {% elif bl | int() == 100 %} green
          {% else %} disabled
          {% endif %}
          `,
                            tap_action: {
                                action: "navigate",
                                navigation_path: (0,_utils__WEBPACK_IMPORTED_MODULE_7__.slugify)(area.name),
                            },
                            hold_action: {
                                action: "none",
                            },
                            double_tap_action: {
                                action: "none"
                            },
                            card_mod: {
                                style: `
            :host {
              background: transparent;
              --mush-icon-size: 74px;
              height: 66px;
              margin-left: -26px !important;
            }
            mushroom-badge-icon {
              top: 17px;
            }
            ha-card {
              box-shadow: none!important;
              border: none;
            }
          `,
                            }
                        },
                        {
                            type: "custom:mushroom-chips-card",
                            alignment: "end",
                            chips: [
                                area_state?.entity_id && {
                                    type: "conditional",
                                    conditions: [
                                        {
                                            entity: area_state?.entity_id,
                                            state_not: "unavailable"
                                        }
                                    ],
                                    chip: new _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_6__.AreaStateChip(device).getChip(),
                                },
                                aggregate_health?.entity_id && {
                                    type: "conditional",
                                    conditions: [
                                        {
                                            entity: aggregate_health?.entity_id,
                                            state: "on"
                                        }
                                    ],
                                    chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_5__.LinusAggregateChip(device, "health").getChip(),
                                },
                                aggregate_window?.entity_id && {
                                    type: "conditional",
                                    conditions: [
                                        {
                                            entity: aggregate_window?.entity_id,
                                            state: "on"
                                        }
                                    ],
                                    chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_5__.LinusAggregateChip(device, "window").getChip(),
                                },
                                aggregate_door?.entity_id && {
                                    type: "conditional",
                                    conditions: [
                                        {
                                            entity: aggregate_door?.entity_id,
                                            state: "on"
                                        }
                                    ],
                                    chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_5__.LinusAggregateChip(device, "door").getChip(),
                                },
                                aggregate_cover?.entity_id && {
                                    type: "conditional",
                                    conditions: [
                                        {
                                            entity: aggregate_cover?.entity_id,
                                            state: "on"
                                        }
                                    ],
                                    chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_5__.LinusAggregateChip(device, "cover").getChip(),
                                },
                                aggregate_climate?.entity_id && {
                                    "type": "conditional",
                                    "conditions": [
                                        {
                                            "entity": aggregate_climate?.entity_id,
                                            "state_not": "unavailable"
                                        }
                                    ],
                                    "chip": new _chips_LinusClimateChip__WEBPACK_IMPORTED_MODULE_4__.LinusClimateChip(device).getChip()
                                },
                                all_lights?.entity_id && {
                                    "type": "conditional",
                                    "conditions": [
                                        {
                                            "entity": all_lights?.entity_id,
                                            "state_not": "unavailable"
                                        }
                                    ],
                                    "chip": new _chips_LinusLightChip__WEBPACK_IMPORTED_MODULE_3__.LinusLightChip(device, area.area_id).getChip()
                                },
                                all_lights?.entity_id && {
                                    "type": "conditional",
                                    "conditions": [
                                        {
                                            "entity": all_lights?.entity_id,
                                            "state_not": "unavailable"
                                        }
                                    ],
                                    "chip": new _chips_LightControlChip__WEBPACK_IMPORTED_MODULE_2__.LightControlChip(light_control?.entity_id).getChip()
                                },
                            ].filter(Boolean),
                            card_mod: {
                                style: `
            ha-card {
              --chip-box-shadow: none;
              --chip-spacing: 0px;
              width: -webkit-fill-available;
              position: absolute;
              top: 16px;
              right: 8px;
            }
            .chip-container {
              position: absolute;
              right: 0px;
            }
          `
                            }
                        }
                    ],
                    card_mod: {
                        style: `
          ha-card {
            box-shadow: none!important;
            border: none;
          }
        `
                    }
                },
                {
                    type: "custom:mushroom-light-card",
                    entity: all_lights?.entity_id,
                    fill_container: true,
                    show_brightness_control: true,
                    icon_type: "none",
                    primary_info: "none",
                    secondary_info: "none",
                    use_light_color: true,
                    layout: "horizontal",
                    card_mod: {
                        style: `
          :host {
            --mush-control-height: 1rem;
          }
          ha-card {
            box-shadow: none!important;
            border: none;
          }
        `
                    }
                }
            ]
        };
    }
    /**
     * Class constructor.
     *
     * @param {AreaRegistryEntry} area The area entity to create a card for.
     * @param {cards.TemplateCardOptions} [options={}] Options for the card.
     *
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(area, options = {}) {
        super(area);
        // Don't override the default card type if default is set in the strategy options.
        if (options.type === "AreaButtonCard") {
            delete options.type;
        }
        const device = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.magicAreasDevices[area.name];
        if (device) {
            const defaultConfig = this.getDefaultConfig(area, device);
            this.config = Object.assign(this.config, defaultConfig, options);
        }
    }
}



/***/ }),

/***/ "./src/cards/AreaCard.ts":
/*!*******************************!*\
  !*** ./src/cards/AreaCard.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AreaCard: () => (/* binding */ AreaCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AreaCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area Card Class
 *
 * Used to create a card for an entity of the area domain.
 *
 * @class
 * @extends AbstractCard
 */
class AreaCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {AreaRegistryEntry} area The area entity to create a card for.
     * @param {cards.TemplateCardOptions} [options={}] Options for the card.
     *
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(area, options = {}) {
        super(area);
        /**
         * Default configuration of the card.
         *
         * @type {TemplateCardConfig}
         * @private
         */
        _AreaCard_defaultConfig.set(this, {
            type: "custom:mushroom-template-card",
            primary: undefined,
            icon: "mdi:texture-box",
            icon_color: "blue",
            tap_action: {
                action: "navigate",
                navigation_path: "",
            },
            hold_action: {
                action: "none",
            },
        });
        // Don't override the default card type if default is set in the strategy options.
        if (options.type === "default") {
            delete options.type;
        }
        // Initialize the default configuration.
        __classPrivateFieldGet(this, _AreaCard_defaultConfig, "f").primary = area.name;
        if (__classPrivateFieldGet(this, _AreaCard_defaultConfig, "f").tap_action && ("navigation_path" in __classPrivateFieldGet(this, _AreaCard_defaultConfig, "f").tap_action)) {
            __classPrivateFieldGet(this, _AreaCard_defaultConfig, "f").tap_action.navigation_path = area.area_id;
        }
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _AreaCard_defaultConfig, "f"), options);
    }
}
_AreaCard_defaultConfig = new WeakMap();



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
            type: "tile",
            icon: undefined,
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
var _ControllerCard_target, _ControllerCard_defaultConfig;

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
    constructor(target, options = {}) {
        /**
         * @type {HassServiceTarget} The target to control the entities of.
         * @private
         */
        _ControllerCard_target.set(this, void 0);
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
        __classPrivateFieldSet(this, _ControllerCard_defaultConfig, {
            ...__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f"),
            ...options,
        }, "f");
    }
    /**
     * Create a Controller card.
     *
     * @return {StackCardConfig} A Controller card.
     */
    createCard() {
        const cards = [
            {
                type: "custom:mushroom-title-card",
                title: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").title,
                subtitle: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").subtitle,
            },
        ];
        if (__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").showControls || __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").extraControls) {
            const area = Array.isArray(__classPrivateFieldGet(this, _ControllerCard_target, "f").area_id) ? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas.find(a => a && a.name && a.name === __classPrivateFieldGet(this, _ControllerCard_target, "f").area_id?.[0]) : undefined;
            const linusDevice = area ? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[area.name] : undefined;
            cards.push({
                type: "custom:mushroom-chips-card",
                alignment: "end",
                chips: [
                    (__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").showControls &&
                        (__classPrivateFieldGet(this, _ControllerCard_target, "f").entity_id && typeof __classPrivateFieldGet(this, _ControllerCard_target, "f").entity_id === "string" ?
                            {
                                type: "template",
                                entity: __classPrivateFieldGet(this, _ControllerCard_target, "f").entity_id,
                                icon: `{{ '${__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").iconOn}' if states(entity) == 'on' else '${__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").iconOff}' }}`,
                                icon_color: `{{ 'amber' if states(entity) == 'on' else 'red' }}`,
                                tap_action: {
                                    action: "toggle"
                                },
                                hold_action: {
                                    action: "more-info"
                                }
                            } :
                            {
                                type: "template",
                                entity: __classPrivateFieldGet(this, _ControllerCard_target, "f").entity_id,
                                icon: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").iconOff,
                                tap_action: {
                                    action: "call-service",
                                    service: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").offService,
                                    target: __classPrivateFieldGet(this, _ControllerCard_target, "f"),
                                    data: {},
                                },
                            })),
                    ...(__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").extraControls && __classPrivateFieldGet(this, _ControllerCard_target, "f") ? __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").extraControls(linusDevice) : [])
                ],
                card_mod: {
                    style: `ha-card {padding: var(--title-padding);}`
                }
            });
        }
        return {
            type: "horizontal-stack",
            cards: cards,
        };
    }
}
_ControllerCard_target = new WeakMap(), _ControllerCard_defaultConfig = new WeakMap();



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

/***/ "./src/cards/HaAreaCard.ts":
/*!*********************************!*\
  !*** ./src/cards/HaAreaCard.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   AreaCard: () => (/* binding */ AreaCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _AreaCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * HA Area Card Class
 *
 * Used to create a card for an entity of the area domain using the built-in type 'area'.
 *
 * @class
 * @extends AbstractCard
 */
class AreaCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {AreaRegistryEntry} area The area entity to create a card for.
     * @param {cards.AreaCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(area, options = {}) {
        super(area);
        /**
         * Default configuration of the card.
         *
         * @type {AreaCardConfig}
         * @private
         */
        _AreaCard_defaultConfig.set(this, {
            type: "area",
            area: "",
        });
        // Initialize the default configuration.
        __classPrivateFieldGet(this, _AreaCard_defaultConfig, "f").area = area.area_id;
        __classPrivateFieldGet(this, _AreaCard_defaultConfig, "f").navigation_path = __classPrivateFieldGet(this, _AreaCard_defaultConfig, "f").area;
        // Enforce the card type.
        delete options.type;
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _AreaCard_defaultConfig, "f"), options);
    }
}
_AreaCard_defaultConfig = new WeakMap();



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

/***/ "./src/cards/MainAreaCard.ts":
/*!***********************************!*\
  !*** ./src/cards/MainAreaCard.ts ***!
  \***********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MainAreaCard: () => (/* binding */ MainAreaCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../chips/LinusAggregateChip */ "./src/chips/LinusAggregateChip.ts");
/* harmony import */ var _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../chips/AreaStateChip */ "./src/chips/AreaStateChip.ts");
/* harmony import */ var _chips_AreaScenesChips__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../chips/AreaScenesChips */ "./src/chips/AreaScenesChips.ts");





// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area Card Class
 *
 * Used to create a card for an entity of the area domain.
 *
 * @class
 * @extends AbstractCard
 */
class MainAreaCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    getDefaultConfig(area) {
        const device = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.magicAreasDevices[area.name];
        const { area_state, aggregate_temperature, aggregate_humidity, aggregate_illuminance, aggregate_window, aggregate_door, aggregate_health, aggregate_cover, } = device.entities;
        return {
            type: "custom:layout-card",
            layout_type: "custom:masonry-layout",
            card_mod: {},
            cards: [
                {
                    type: "custom:mod-card",
                    style: `
            ha-card {
              position: relative;
            }
            .card-content {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
          `,
                    card: {
                        type: "vertical-stack",
                        cards: [
                            {
                                type: "custom:mushroom-chips-card",
                                alignment: "end",
                                chips: [
                                    aggregate_temperature?.entity_id && {
                                        type: "conditional",
                                        conditions: [
                                            {
                                                entity: aggregate_temperature?.entity_id,
                                                state_not: "unavailable"
                                            }
                                        ],
                                        chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_2__.LinusAggregateChip(device, "temperature", true, true).getChip(),
                                    },
                                    aggregate_humidity?.entity_id && {
                                        type: "conditional",
                                        conditions: [
                                            {
                                                entity: aggregate_humidity?.entity_id,
                                                state_not: "unavailable"
                                            }
                                        ],
                                        chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_2__.LinusAggregateChip(device, "humidity", true, true).getChip(),
                                    },
                                    aggregate_illuminance?.entity_id && {
                                        type: "conditional",
                                        conditions: [
                                            {
                                                entity: aggregate_illuminance?.entity_id,
                                                state_not: "unavailable"
                                            }
                                        ],
                                        chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_2__.LinusAggregateChip(device, "illuminance", true, true).getChip(),
                                    },
                                ].filter(Boolean),
                                card_mod: {
                                    style: `
                    ha-card {
                      position: absolute;
                      top: 24px;
                      left: 0px;
                      right: 8px;
                      z-index: 2;
                    }
                  `
                                }
                            },
                            {
                                type: "custom:mushroom-chips-card",
                                alignment: "end",
                                chips: [
                                    aggregate_window?.entity_id && {
                                        type: "conditional",
                                        conditions: [
                                            {
                                                entity: aggregate_window?.entity_id,
                                                state_not: "unavailable"
                                            }
                                        ],
                                        chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_2__.LinusAggregateChip(device, "window", true, true).getChip(),
                                    },
                                    aggregate_door?.entity_id && {
                                        type: "conditional",
                                        conditions: [
                                            {
                                                entity: aggregate_door?.entity_id,
                                                state_not: "unavailable"
                                            }
                                        ],
                                        chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_2__.LinusAggregateChip(device, "door", true, true).getChip(),
                                    },
                                    aggregate_health?.entity_id && {
                                        type: "conditional",
                                        conditions: [
                                            {
                                                entity: aggregate_health?.entity_id,
                                                state_not: "unavailable"
                                            }
                                        ],
                                        chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_2__.LinusAggregateChip(device, "health", true, true).getChip(),
                                    },
                                    aggregate_cover?.entity_id && {
                                        type: "conditional",
                                        conditions: [
                                            {
                                                entity: aggregate_cover?.entity_id,
                                                state_not: "unavailable"
                                            }
                                        ],
                                        chip: new _chips_LinusAggregateChip__WEBPACK_IMPORTED_MODULE_2__.LinusAggregateChip(device, "cover", true, true).getChip(),
                                    },
                                    area_state?.entity_id && {
                                        type: "conditional",
                                        conditions: [
                                            {
                                                entity: area_state?.entity_id,
                                                state_not: "unavailable"
                                            }
                                        ],
                                        chip: new _chips_AreaStateChip__WEBPACK_IMPORTED_MODULE_3__.AreaStateChip(device, true).getChip(),
                                    },
                                ].filter(Boolean),
                                card_mod: {
                                    style: `
                    ha-card {
                      position: absolute;
                      bottom: 8px;
                      left: 0px;
                      right: 8px;
                      z-index: 2;
                    }
                  `
                                }
                            },
                            {
                                type: "area",
                                area: area.area_id,
                                show_camera: true,
                                alert_classes: [],
                                sensor_classes: [],
                                aspect_ratio: "16:9",
                                card_mod: {
                                    style: `
                    ha-card {
                      position: relative;
                      z-index: 1;
                    }
                    .sensors {
                      display: none;
                    }
                    .buttons {
                      display: none;
                    }
                  `
                                }
                            }
                        ]
                    }
                },
                (device.entities.all_lights && device.entities.all_lights.entity_id !== "unavailable" ? {
                    type: "custom:mushroom-chips-card",
                    alignment: "center",
                    chips: new _chips_AreaScenesChips__WEBPACK_IMPORTED_MODULE_4__.AreaScenesChips(device, area).getChips()
                } : undefined)
            ].filter(Boolean)
        };
    }
    /**
     * Class constructor.
     *
     * @param {AreaRegistryEntry} area The area entity to create a card for.
     * @param {cards.TemplateCardOptions} [options={}] Options for the card.
     *
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(area, options = {}) {
        super(area);
        // Don't override the default card type if default is set in the strategy options.
        if (options.type === "LinusMainAreaCard") {
            delete options.type;
        }
        const defaultConfig = this.getDefaultConfig(area);
        this.config = Object.assign(this.config, defaultConfig, options);
    }
}



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
            layout: "vertical",
            primary_info: "none",
            secondary_info: "none",
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
        const selects = _variables__WEBPACK_IMPORTED_MODULE_1__.todOrder.map(tod => _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(device.entities[`scene_${tod}`]?.entity_id)).filter(Boolean);
        const chips = [];
        if (selects.find(scene => scene?.state == "Adaptive lighting")) {
            chips.push({
                type: "template",
                icon: "mdi:theme-light-dark",
                content: "AD",
                tap_action: {
                    action: "call-service",
                    service: `${_variables__WEBPACK_IMPORTED_MODULE_1__.DOMAIN}.area_light_adapt`,
                    data: {
                        area: (0,_utils__WEBPACK_IMPORTED_MODULE_2__.slugify)(device.name),
                    }
                },
            });
        }
        selects.forEach((scene, index) => {
            if (scene?.state === "Scène instantanée") {
                const entity_id = `scene.${(0,_utils__WEBPACK_IMPORTED_MODULE_2__.slugify)(device.name)}_${_variables__WEBPACK_IMPORTED_MODULE_1__.todOrder[index]}_snapshot_scene`;
                chips.push({
                    type: "template",
                    entity: scene?.entity_id,
                    icon: scene?.attributes.icon,
                    content: _variables__WEBPACK_IMPORTED_MODULE_1__.todOrder[index],
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
                    content: _variables__WEBPACK_IMPORTED_MODULE_1__.todOrder[index],
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
    getDefaultConfig(device, showContent = false) {
        const { area_state, presence_hold, all_media_players, aggregate_motion } = device.entities;
        return {
            "type": "template",
            "entity": area_state?.entity_id,
            "icon_color": `
          {% set presence_hold = states('${presence_hold?.entity_id}')%}
          {% set motion = states('${aggregate_motion?.entity_id}')%}
          {% set media_player = states('${all_media_players?.entity_id}')%}
          {% set bl = state_attr('${area_state?.entity_id}', 'states')%}
          {% if motion == 'on' %}
              red
          {% elif media_player in ['on', 'playing'] %}
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
            "icon": `
          {% set presence_hold = states('${presence_hold?.entity_id}')%}
          {% set motion = states('${aggregate_motion?.entity_id}')%}
          {% set media_player = states('${all_media_players?.entity_id}')%}
          {% set bl = state_attr('${area_state?.entity_id}', 'states')%}
          {% if motion == 'on' %}
            ${_variables__WEBPACK_IMPORTED_MODULE_1__.DOMAIN_ICONS.motion}
          {% elif media_player in ['on', 'playing'] %}
            ${_variables__WEBPACK_IMPORTED_MODULE_1__.DOMAIN_ICONS.media_player}
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
            "content": showContent ? `
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
            "tap_action": new _popups_AreaInformationsPopup__WEBPACK_IMPORTED_MODULE_0__.AreaInformations(device, true).getPopup()
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, showContent = false) {
        super();
        const defaultConfig = this.getDefaultConfig(device, showContent);
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
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate how many climates are operating.
 */
class ClimateChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_2__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(entity_id) {
        const icon = _variables__WEBPACK_IMPORTED_MODULE_1__.DOMAIN_STATE_ICONS.climate;
        return {
            type: "conditional",
            conditions: [
                {
                    entity: entity_id,
                    state_not: "unavailable"
                }
            ],
            chip: {
                type: "template",
                entity: entity_id,
                icon_color: "{{ 'red' if is_state(entity, 'on') else 'grey' }}",
                icon: icon.on,
                content: `{{ expand(states.${entity_id}.attributes.entity_id is defined and states.${entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count }}`,
                tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.navigateTo)('climate'),
            },
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, options = {}) {
        super();
        if (!device.entities.climate_group?.entity_id) {
            throw new Error(`No aggregate motion entity found for device: ${device.name}`);
        }
        const defaultConfig = this.getDefaultConfig(device.entities.climate_group.entity_id);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



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
        _CoverChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:window-open",
            icon_color: "cyan",
            content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("cover", "eq", "open"),
            tap_action: {
                action: "navigate",
                navigation_path: "covers",
            },
            hold_action: {
                action: "navigate",
                navigation_path: "covers",
            },
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _CoverChip_defaultConfig, "f"), options);
    }
}
_CoverChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/DoorChip.ts":
/*!*******************************!*\
  !*** ./src/chips/DoorChip.ts ***!
  \*******************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   DoorChip: () => (/* binding */ DoorChip)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Door Chip class.
 *
 * Used to create a chip to indicate how many doors are on and to turn all off.
 */
class DoorChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_2__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(entity_id) {
        const icon = _variables__WEBPACK_IMPORTED_MODULE_1__.DOMAIN_STATE_ICONS.binary_sensor.door;
        return {
            type: "conditional",
            conditions: [
                {
                    entity: entity_id,
                    state_not: "unavailable"
                }
            ],
            chip: {
                type: "template",
                entity: entity_id,
                icon_color: "{{ 'red' if is_state(entity, 'on') else 'grey' }}",
                icon: `{{ '${icon.on}' if is_state(entity, 'on') else '${icon.off}' }}`,
                content: `{{ expand(states.${entity_id}.attributes.entity_id is defined and states.${entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count }}`,
                tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.navigateTo)('security-details'),
            },
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, options = {}) {
        super();
        if (device.entities.aggregate_door?.entity_id) {
            const defaultConfig = this.getDefaultConfig(device.entities.aggregate_door.entity_id);
            this.config = Object.assign(this.config, defaultConfig);
        }
    }
}



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
        _FanChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:fan",
            icon_color: "green",
            content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("fan", "eq", "on"),
            tap_action: {
                action: "call-service",
                service: "fan.turn_off",
            },
            hold_action: {
                action: "navigate",
                navigation_path: "fans",
            },
        });
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
        _LightChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:lightbulb-group",
            icon_color: "amber",
            content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("light", "eq", "on"),
            tap_action: {
                action: "call-service",
                service: "light.turn_off",
            },
            hold_action: {
                action: "navigate",
                navigation_path: "lights",
            },
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _LightChip_defaultConfig, "f"), options);
    }
}
_LightChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/LightControlChip.ts":
/*!***************************************!*\
  !*** ./src/chips/LightControlChip.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LightControlChip: () => (/* binding */ LightControlChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LightControlChip_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LightControlChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(entity_id) {
        super();
        /**
         * Default configuration of the chip.
         *
         * @type {TemplateChipConfig}
         *
         * @readonly
         * @private
         */
        _LightControlChip_defaultConfig.set(this, {
            type: "template",
            entity: undefined,
            icon: "mdi:lightbulb-auto",
            icon_color: "{% if is_state(config.entity, 'on') %}green{% else %}red{% endif %}",
            tap_action: {
                action: "more-info"
            },
            // double_tap_action: {
            //   action: "call-service",
            //   service: "switch.toggle",
            //   data: {
            //     entity_id: undefined
            //   }
            // }
        });
        __classPrivateFieldGet(this, _LightControlChip_defaultConfig, "f").entity = entity_id;
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _LightControlChip_defaultConfig, "f"));
    }
}
_LightControlChip_defaultConfig = new WeakMap();



/***/ }),

/***/ "./src/chips/LinusAggregateChip.ts":
/*!*****************************************!*\
  !*** ./src/chips/LinusAggregateChip.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LinusAggregateChip: () => (/* binding */ LinusAggregateChip)
/* harmony export */ });
/* harmony import */ var _popups_AggregateAreaListPopup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../popups/AggregateAreaListPopup */ "./src/popups/AggregateAreaListPopup.ts");
/* harmony import */ var _popups_AggregateListPopup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../popups/AggregateListPopup */ "./src/popups/AggregateListPopup.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");




// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class LinusAggregateChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_3__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig | undefined}
     *
     */
    getDefaultConfig(device, deviceClass, showContent, by_area = false) {
        const entity = device.entities[`aggregate_${deviceClass}`];
        if (!entity?.entity_id)
            return undefined;
        const domain = entity?.entity_id.split(".")[0];
        let icon = _variables__WEBPACK_IMPORTED_MODULE_2__.DOMAIN_ICONS[deviceClass];
        let icon_color = '';
        let content = '';
        if (domain === "binary_sensor") {
            icon_color = `{{ 'red' if expand(states.${entity?.entity_id}.attributes.sensors is defined and states.${entity?.entity_id}.attributes.sensors) | selectattr( 'state', 'eq', 'on') | list | count > 0 else 'grey' }}`;
            content = showContent ? `{{ expand(states.${entity?.entity_id}.attributes.sensors is defined and states.${entity?.entity_id}.attributes.sensors) | selectattr( 'state', 'eq', 'on') | list | count }}` : "";
        }
        if (domain === "sensor") {
            if (deviceClass === "battery") {
                icon_color = `{% set bl = states('${entity?.entity_id}') %}
        {% if bl == 'unknown' or bl == 'unavailable' %}
        {% elif bl | int() < 30 %} red
        {% elif bl | int() < 50 %} orange
        {% elif bl | int() <= 100 %} green
        {% else %} disabled{% endif %}`;
                icon = `{% set bl = states('${entity?.entity_id}') %}
        {% if bl == 'unknown' or bl == 'unavailable' %}
        {% elif bl | int() < 10 %}mdi:battery-outline
        {% elif bl | int() < 20 %}  mdi:battery1
        {% elif bl | int() < 30 %}  mdi:battery-20
        {% elif bl | int() < 40 %}  mdi:battery-30
        {% elif bl | int() < 50 %}  mdi:battery-40
        {% elif bl | int() < 60 %}  mdi:battery-50
        {% elif bl | int() < 70 %}  mdi:battery-60
        {% elif bl | int() < 80 %}  mdi:battery-70
        {% elif bl | int() < 90 %}  mdi:battery-80
        {% elif bl | int() < 100 %}  mdi:battery-90
        {% elif bl | int() == 100 %}  mdi:battery
        {% else %}  mdi:battery{% endif %} `;
                content = showContent ? `{{ states('${entity?.entity_id}') | int | round(1) }} %` : "";
            }
            if (deviceClass === "temperature")
                icon_color = `{% set bl = states('${entity?.entity_id}') | int() %} {% if bl < 20 %} blue
      {% elif bl < 30 %} orange
      {% elif bl >= 30 %} red{% else %} disabled{% endif %}`;
            if (deviceClass === "illuminance")
                icon_color = `{{ 'blue' if 'dark' in state_attr('${device.entities.area_state?.entity_id}', 'states') else 'amber' }}`;
            content = showContent ? `{{ states.${entity?.entity_id}.state | float | round(1) }} {{ states.${entity?.entity_id}.attributes.unit_of_measurement }}` : "";
        }
        if (deviceClass === "cover") {
            icon_color = `{{ 'red' if is_state('${entity?.entity_id}', 'open') else 'grey' }}`;
            content = showContent ? `{{ expand(states.${entity?.entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'open') | list | count }}` : "";
        }
        if (deviceClass === "health") {
            icon_color = `{{ 'red' if is_state(entity, 'on') else 'green' }}`;
        }
        const tap_action = by_area ? new _popups_AggregateAreaListPopup__WEBPACK_IMPORTED_MODULE_0__.AggregateAreaListPopup(entity?.entity_id, deviceClass).getPopup() : new _popups_AggregateListPopup__WEBPACK_IMPORTED_MODULE_1__.AggregateListPopup(entity?.entity_id, deviceClass).getPopup();
        return {
            type: "conditional",
            conditions: [
                {
                    entity: entity?.entity_id ?? "",
                    state_not: "unavailable"
                }
            ],
            chip: {
                type: "template",
                entity: entity?.entity_id,
                icon_color: icon_color,
                icon: icon,
                content: content,
                tap_action: tap_action
            },
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, deviceClass, showContent = false, by_area = false) {
        super();
        const defaultConfig = this.getDefaultConfig(device, deviceClass, showContent, by_area);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/chips/LinusAlarmChip.ts":
/*!*************************************!*\
  !*** ./src/chips/LinusAlarmChip.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LinusAlarmChip: () => (/* binding */ LinusAlarmChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class LinusAlarmChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(entity_id) {
        return {
            type: "alarm-control-panel",
            entity: entity_id,
            tap_action: {
                action: "more-info"
            },
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

/***/ "./src/chips/LinusClimateChip.ts":
/*!***************************************!*\
  !*** ./src/chips/LinusClimateChip.ts ***!
  \***************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LinusClimateChip: () => (/* binding */ LinusClimateChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class LinusClimateChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(device, showContent) {
        return {
            "type": "template",
            "entity": device.entities.aggregate_climate?.entity_id,
            "icon_color": `{{ 'orange' if is_state('${device.entities.aggregate_climate?.entity_id}', 'heat') else 'grey' }}`,
            "icon": "mdi:thermostat",
            "content": showContent ? `{{ states.${device.entities.aggregate_climate?.entity_id}.attributes.preset_mode }}` : "",
            // "tap_action": climateList(hass, area)
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, showContent = false) {
        super();
        const defaultConfig = this.getDefaultConfig(device, showContent);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/chips/LinusLightChip.ts":
/*!*************************************!*\
  !*** ./src/chips/LinusLightChip.ts ***!
  \*************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LinusLightChip: () => (/* binding */ LinusLightChip)
/* harmony export */ });
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");
/* harmony import */ var _popups_AggregateListPopup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../popups/AggregateListPopup */ "./src/popups/AggregateListPopup.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LinusLightChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_0__.AbstractChip {
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, area_id, show_content, show_group) {
        super();
        const defaultConfig = {
            type: "template",
            entity: device.entities.all_lights?.entity_id,
            icon_color: `{{ 'amber' if expand(states.${device.entities.all_lights?.entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count > 0 else 'grey' }}`,
            icon: "mdi:lightbulb-group",
            content: show_content ? `{{ expand(states.${device.entities.all_lights?.entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count }}` : "",
            tap_action: show_group ? new _popups_AggregateListPopup__WEBPACK_IMPORTED_MODULE_1__.AggregateListPopup(device.entities.all_lights?.entity_id, "light").getPopup() : {
                action: "call-service",
                service: `${_variables__WEBPACK_IMPORTED_MODULE_2__.DOMAIN}.area_light_toggle`,
                data: {
                    area: area_id
                }
            }
        };
        this.config = Object.assign(this.config, defaultConfig);
    }
}



/***/ }),

/***/ "./src/chips/MotionChip.ts":
/*!*********************************!*\
  !*** ./src/chips/MotionChip.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   MotionChip: () => (/* binding */ MotionChip)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Motion Chip class.
 *
 * Used to create a chip to indicate how many motions are on and to turn all off.
 */
class MotionChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_2__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(entity_id) {
        const icon = _variables__WEBPACK_IMPORTED_MODULE_1__.DOMAIN_STATE_ICONS.binary_sensor.motion;
        return {
            type: "conditional",
            conditions: [
                {
                    entity: entity_id,
                    state_not: "unavailable"
                }
            ],
            chip: {
                type: "template",
                entity: entity_id,
                icon_color: "{{ 'red' if is_state(entity, 'on') else 'grey' }}",
                icon: `{{ '${icon.on}' if is_state(entity, 'on') else '${icon.off}' }}`,
                content: `{{ expand(states.${entity_id}.attributes.entity_id is defined and states.${entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count }}`,
                tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.navigateTo)('security-details'),
            },
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, options = {}) {
        super();
        if (device.entities.aggregate_motion?.entity_id) {
            const defaultConfig = this.getDefaultConfig(device.entities.aggregate_motion.entity_id);
            this.config = Object.assign(this.config, defaultConfig);
        }
    }
}



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
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Safety Chip class.
 *
 * Used to create a chip to indicate how many safetys are on and to turn all off.
 */
class SafetyChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_2__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(entity_id) {
        const icon = _variables__WEBPACK_IMPORTED_MODULE_1__.DOMAIN_STATE_ICONS.binary_sensor.safety;
        return {
            type: "conditional",
            conditions: [
                {
                    entity: entity_id,
                    state_not: "unavailable"
                }
            ],
            chip: {
                type: "template",
                entity: entity_id,
                icon_color: "{{ 'red' if is_state(entity, 'on') else 'grey' }}",
                icon: `{{ '${icon.on}' if is_state(entity, 'on') else '${icon.off}' }}`,
                content: `{{ expand(states.${entity_id}.attributes.entity_id is defined and states.${entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count }}`,
                tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.navigateTo)('security-details'),
            },
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, options = {}) {
        super();
        if (device.entities.aggregate_safety?.entity_id) {
            const defaultConfig = this.getDefaultConfig(device.entities.aggregate_safety.entity_id);
            this.config = Object.assign(this.config, defaultConfig);
        }
    }
}



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
        _SwitchChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:dip-switch",
            icon_color: "blue",
            content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("switch", "eq", "on"),
            tap_action: {
                action: "navigate",
                navigation_path: "switches",
            },
            hold_action: {
                action: "navigate",
                navigation_path: "switches",
            },
        });
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
            entity: device.entities.light_control?.entity_id,
            icon: "mdi:recycle-variant",
            // icon_color: "{% if is_state(config.entity, 'on') %}green{% else %}red{% endif %}",
            tap_action: {
                action: "call-service",
                service: `${_variables__WEBPACK_IMPORTED_MODULE_0__.DOMAIN}.area_scene_toggle`,
                data: {
                    area: device.name,
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
/* harmony import */ var _popups_GroupListPopup__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../popups/GroupListPopup */ "./src/popups/GroupListPopup.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Unavailable Chip class.
 *
 * Used to create a chip to indicate unable entities.
 */
class UnavailableChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_1__.AbstractChip {
    getDefaultConfig(entities) {
        return {
            type: "template",
            icon_color: "orange",
            icon: 'mdi:help',
            tap_action: new _popups_GroupListPopup__WEBPACK_IMPORTED_MODULE_0__.GroupListPopup(entities, "Unavailable entities").getPopup()
        };
    }
    /**
     * Class Constructor.
     *
     * @param {EntityRegistryEntry[]} entities The chip entities.
     */
    constructor(entities) {
        super();
        const defaultConfig = this.getDefaultConfig(entities);
        this.config = Object.assign(this.config, defaultConfig);
    }
}



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

/***/ "./src/chips/WindowChip.ts":
/*!*********************************!*\
  !*** ./src/chips/WindowChip.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   WindowChip: () => (/* binding */ WindowChip)
/* harmony export */ });
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _AbstractChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractChip */ "./src/chips/AbstractChip.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Window Chip class.
 *
 * Used to create a chip to indicate how many windows are on and to turn all off.
 */
class WindowChip extends _AbstractChip__WEBPACK_IMPORTED_MODULE_2__.AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {ConditionalChipConfig}
     *
     */
    getDefaultConfig(entity_id) {
        const icon = _variables__WEBPACK_IMPORTED_MODULE_1__.DOMAIN_STATE_ICONS.binary_sensor.window;
        return {
            type: "conditional",
            conditions: [
                {
                    entity: entity_id,
                    state_not: "unavailable"
                }
            ],
            chip: {
                type: "template",
                entity: entity_id,
                icon_color: "{{ 'red' if is_state(entity, 'on') else 'grey' }}",
                icon: `{{ '${icon.on}' if is_state(entity, 'on') else '${icon.off}' }}`,
                content: `{{ expand(states.${entity_id}.attributes.entity_id is defined and states.${entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count }}`,
                tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_0__.navigateTo)('security-details'),
            },
        };
    }
    /**
     * Class Constructor.
     *
     * @param {chips.TemplateChipOptions} options The chip options.
     */
    constructor(device, options = {}) {
        super();
        if (device.entities?.aggregate_window?.entity_id) {
            const defaultConfig = this.getDefaultConfig(device.entities.aggregate_window.entity_id);
            this.config = Object.assign(this.config, defaultConfig);
        }
    }
}



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
/* harmony import */ var _chips_LightControlChip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./chips/LightControlChip */ "./src/chips/LightControlChip.ts");
/* harmony import */ var _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./chips/SettingsChip */ "./src/chips/SettingsChip.ts");
/* harmony import */ var _popups_LightSettingsPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./popups/LightSettingsPopup */ "./src/popups/LightSettingsPopup.ts");
/* harmony import */ var _chips_ToggleSceneChip__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./chips/ToggleSceneChip */ "./src/chips/ToggleSceneChip.ts");
/* harmony import */ var _popups_SceneSettingsPopup__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./popups/SceneSettingsPopup */ "./src/popups/SceneSettingsPopup.ts");





/**
 * Default configuration for the mushroom strategy.
 */
const configurationDefaults = {
    areas: {
        undisclosed: {
            aliases: [],
            area_id: "undisclosed",
            name: "Non assigné",
            picture: null,
            hidden: false,
        }
    },
    floors: {
        undisclosed: {
            aliases: [],
            floor_id: "undisclosed",
            name: "Non assigné",
            hidden: false,
        }
    },
    debug: true,
    domains: {
        _: {
            hide_config_entities: false,
        },
        default: {
            title: "Divers",
            showControls: false,
            hidden: false,
        },
        light: {
            // title: "Lights",
            showControls: true,
            extraControls: (device) => {
                return [
                    new _chips_LightControlChip__WEBPACK_IMPORTED_MODULE_0__.LightControlChip(device.entities.light_control?.entity_id).getChip(),
                    new _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_1__.SettingsChip({ tap_action: new _popups_LightSettingsPopup__WEBPACK_IMPORTED_MODULE_2__.LightSettings(device).getPopup() }).getChip()
                ];
            },
            iconOn: "mdi:lightbulb",
            iconOff: "mdi:lightbulb-off",
            onService: "light.turn_on",
            offService: "light.turn_off",
            hidden: false,
            order: 1
        },
        scene: {
            title: "Scènes",
            showControls: false,
            extraControls: (device) => {
                return [
                    {
                        type: "conditional",
                        conditions: [{
                                entity: device.entities.all_lights?.entity_id,
                                state_not: "unavailable"
                            }],
                        chip: new _chips_ToggleSceneChip__WEBPACK_IMPORTED_MODULE_3__.ToggleSceneChip(device).getChip(),
                    },
                    new _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_1__.SettingsChip({ tap_action: new _popups_SceneSettingsPopup__WEBPACK_IMPORTED_MODULE_4__.SceneSettings(device).getPopup() }).getChip()
                ];
            },
            iconOn: "mdi:lightbulb",
            iconOff: "mdi:lightbulb-off",
            onService: "scene.turn_on",
            hidden: false,
            order: 2
        },
        fan: {
            title: "Fans",
            showControls: true,
            iconOn: "mdi:fan",
            iconOff: "mdi:fan-off",
            onService: "fan.turn_on",
            offService: "fan.turn_off",
            hidden: false,
            order: 4
        },
        cover: {
            title: "Covers",
            showControls: true,
            iconOn: "mdi:arrow-up",
            iconOff: "mdi:arrow-down",
            onService: "cover.open_cover",
            offService: "cover.close_cover",
            hidden: false,
            order: 8
        },
        switch: {
            title: "Switches",
            showControls: true,
            iconOn: "mdi:power-plug",
            iconOff: "mdi:power-plug-off",
            onService: "switch.turn_on",
            offService: "switch.turn_off",
            hidden: false,
            order: 5
        },
        camera: {
            title: "Cameras",
            showControls: false,
            hidden: false,
            order: 6
        },
        lock: {
            title: "Locks",
            showControls: false,
            hidden: false,
            order: 7
        },
        climate: {
            title: "Climates",
            showControls: true,
            hidden: false,
            order: 3
        },
        media_player: {
            title: "Media Players",
            showControls: true,
            hidden: false,
            order: 9
        },
        sensor: {
            title: "Sensors",
            showControls: false,
            hidden: false,
        },
        binary_sensor: {
            title: "Binary Sensors",
            showControls: false,
            hidden: false,
        },
        number: {
            title: "Numbers",
            showControls: false,
            hidden: false,
        },
        vacuum: {
            title: "Vacuums",
            showControls: true,
            hidden: false,
            order: 10
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
        media_player: {
            order: 4,
            hidden: false,
        },
        climate: {
            order: 5,
            hidden: false,
        },
        fan: {
            order: 6,
            hidden: false,
        },
        cover: {
            order: 7,
            hidden: false,
        },
        camera: {
            order: 8,
            hidden: false,
        },
        switch: {
            order: 9,
            hidden: false,
        },
        vacuum: {
            order: 10,
            hidden: false,
        },
        scene: {
            order: 11,
            hidden: false,
        },
        securityDetails: {
            hidden: false,
        },
    }
};


/***/ }),

/***/ "./src/mushroom-strategy.ts":
/*!**********************************!*\
  !*** ./src/mushroom-strategy.ts ***!
  \**********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   version: () => (/* binding */ version)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_SensorCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./cards/SensorCard */ "./src/cards/SensorCard.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cards/ControllerCard */ "./src/cards/ControllerCard.ts");
/* harmony import */ var _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./cards/SwipeCard */ "./src/cards/SwipeCard.ts");
/* harmony import */ var _cards_MainAreaCard__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ./cards/MainAreaCard */ "./src/cards/MainAreaCard.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ./utils */ "./src/utils.ts");






/**
 * Mushroom Dashboard Strategy.<br>
 * <br>
 * Mushroom dashboard strategy provides a strategy for Home-Assistant to create a dashboard automatically.<br>
 * The strategy makes use Mushroom and Mini Graph cards to represent your entities.<br>
 * <br>
 * Features:<br>
 *     🛠 Automatically create dashboard with three lines of yaml.<br>
 *     😍 Built-in Views for several standard domains.<br>
 *     🎨 Many options to customize to your needs.<br>
 * <br>
 * Check the [Repository]{@link https://github.com/AalianKhan/mushroom-strategy} for more information.
 */
class MushroomStrategy extends HTMLTemplateElement {
    /**
     * Generate a dashboard.
     *
     * Called when opening a dashboard.
     *
     * @param {generic.DashBoardInfo} info Dashboard strategy information object.
     * @return {Promise<LovelaceConfig>}
     */
    static async generateDashboard(info) {
        await _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.initialize(info);
        // Create views.
        const views = info.config?.views ?? [];
        let viewModule;
        // Create a view for each exposed domain.
        for (let viewId of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getExposedViewIds()) {
            try {
                const viewType = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(viewId + "View");
                viewModule = await __webpack_require__("./src/views lazy recursive ^\\.\\/.*$")(`./${viewType}`);
                const view = await new viewModule[viewType](_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.views[viewId]).getView();
                if (view.cards?.length) {
                    views.push(view);
                }
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError(`View '${viewId}' couldn't be loaded!`, e);
            }
        }
        // Create subviews for each area.
        for (let area of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas) {
            if (!area.hidden) {
                views.push({
                    title: area.name,
                    path: (0,_utils__WEBPACK_IMPORTED_MODULE_5__.slugify)(area.name),
                    subview: true,
                    strategy: {
                        type: "custom:mushroom-strategy",
                        options: {
                            area,
                        },
                    },
                });
            }
        }
        // Add custom views.
        if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.extra_views) {
            views.push(..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.extra_views);
        }
        // Return the created views.
        return {
            views: views,
        };
    }
    /**
     * Generate a view.
     *
     * Called when opening a subview.
     *
     * @param {generic.ViewInfo} info The view's strategy information object.
     * @return {Promise<LovelaceViewConfig>}
     */
    static async generateView(info) {
        const exposedDomainIds = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getExposedDomainIds();
        const area = info.view.strategy?.options?.area ?? {};
        const viewCards = [...(area.extra_cards ?? [])];
        if (area.area_id !== "undisclosed")
            viewCards.push(new _cards_MainAreaCard__WEBPACK_IMPORTED_MODULE_4__.MainAreaCard(area).getCard());
        // Set the target for controller cards to the current area.
        let target = {
            area_id: [area.area_id],
        };
        // Create cards for each domain.
        for (const domain of exposedDomainIds) {
            if (domain === "default") {
                continue;
            }
            const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(domain + "Card");
            let domainCards = [];
            try {
                domainCards = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`).then(cardModule => {
                    let domainCards = [];
                    const entities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getDeviceEntities(area, domain);
                    let configEntityHidden = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain ?? "_"].hide_config_entities
                        || _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities;
                    const magicAreasDevice = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[area.name];
                    const magicAreasKey = domain === "light" ? 'all_lights' : `${domain}_group`;
                    // Set the target for controller cards to linus aggregate entity if exist.
                    if (magicAreasDevice && magicAreasDevice.entities[magicAreasKey]) {
                        target["entity_id"] = magicAreasDevice.entities[magicAreasKey].entity_id;
                    }
                    else {
                        target["entity_id"] = undefined;
                    }
                    // Set the target for controller cards to entities without an area.
                    if (area.area_id === "undisclosed") {
                        target = {
                            entity_id: entities.map(entity => entity.entity_id),
                        };
                    }
                    if (entities.length) {
                        // Create a Controller card for the current domain.
                        const title = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(domain === 'scene' ? 'ui.dialogs.quick-bar.commands.navigation.scene' : `component.${domain}.entity_component._.name`);
                        const titleCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(target, { ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain], domain, title }).createCard();
                        if (domain === "sensor") {
                            // Create a card for each entity-sensor of the current area.
                            const sensorStates = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getStateEntities(area, "sensor");
                            const sensorCards = [];
                            for (const sensor of entities) {
                                // Find the state of the current sensor.
                                const sensorState = sensorStates.find(state => state.entity_id === sensor.entity_id);
                                let cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[sensor.entity_id];
                                let deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[sensor.device_id ?? "null"];
                                if (!cardOptions?.hidden && !deviceOptions?.hidden) {
                                    if (sensorState?.attributes.unit_of_measurement) {
                                        cardOptions = {
                                            ...{
                                                type: "custom:mini-graph-card",
                                                entities: [sensor.entity_id],
                                            },
                                            ...cardOptions,
                                        };
                                    }
                                    sensorCards.push(new _cards_SensorCard__WEBPACK_IMPORTED_MODULE_1__.SensorCard(sensor, cardOptions).getCard());
                                }
                            }
                            if (sensorCards.length) {
                                domainCards.push(new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_3__.SwipeCard(sensorCards).getCard());
                                domainCards.unshift(titleCard);
                            }
                            return domainCards;
                        }
                        // Create a card for each other domain-entity of the current area.
                        for (const entity of entities) {
                            let deviceOptions;
                            let cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                            if (entity.device_id) {
                                deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id];
                            }
                            // Don't include the entity if hidden in the strategy options.
                            if (cardOptions?.hidden || deviceOptions?.hidden) {
                                continue;
                            }
                            // Don't include the config-entity if hidden in the strategy options.
                            if (entity.entity_category === "config" && configEntityHidden) {
                                continue;
                            }
                            domainCards.push(new cardModule[className](entity, cardOptions).getCard());
                        }
                        domainCards = [new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_3__.SwipeCard(domainCards).getCard()];
                        if (domainCards.length) {
                            domainCards.unshift(titleCard);
                        }
                    }
                    return domainCards;
                });
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the domain cards!", e);
            }
            if (domainCards.length) {
                viewCards.push({
                    type: "vertical-stack",
                    cards: domainCards,
                });
            }
        }
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.default.hidden) {
            // Create cards for any other domain.
            // Collect device entities of the current area.
            const areaDevices = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.devices.filter((device) => device.area_id === area.area_id)
                .map((device) => device.id);
            // Collect the remaining entities of which all conditions below are met:
            // 1. The entity is not hidden.
            // 2. The entity's domain isn't exposed (entities of exposed domains are already included).
            // 3. The entity is linked to a device which is linked to the current area,
            //    or the entity itself is linked to the current area.
            const miscellaneousEntities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities.filter((entity) => {
                const entityLinked = areaDevices.includes(entity.device_id ?? "null") || entity.area_id === area.area_id;
                const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
                const domainExposed = exposedDomainIds.includes(entity.entity_id.split(".", 1)[0]);
                return entityUnhidden && !domainExposed && entityLinked;
            });
            // Create a column of miscellaneous entity cards.
            if (miscellaneousEntities.length) {
                let miscellaneousCards = [];
                try {
                    miscellaneousCards = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ./cards/MiscellaneousCard */ "./src/cards/MiscellaneousCard.ts")).then(cardModule => {
                        const miscellaneousCards = [
                            new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(target, _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains.default).createCard(),
                        ];
                        const swipeCard = [];
                        for (const entity of miscellaneousEntities) {
                            let cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                            let deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                            // Don't include the entity if hidden in the strategy options.
                            if (cardOptions?.hidden || deviceOptions?.hidden) {
                                continue;
                            }
                            // Don't include the config-entity if hidden in the strategy options
                            if (entity.entity_category === "config" && _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities) {
                                continue;
                            }
                            swipeCard.push(new cardModule.MiscellaneousCard(entity, cardOptions).getCard());
                        }
                        return [...miscellaneousCards, new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_3__.SwipeCard(swipeCard).getCard()];
                    });
                }
                catch (e) {
                    _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the domain cards!", e);
                }
                viewCards.push({
                    type: "vertical-stack",
                    cards: miscellaneousCards,
                });
            }
        }
        // Return cards.
        return {
            cards: viewCards,
        };
    }
}
customElements.define("ll-strategy-mushroom-strategy", MushroomStrategy);
const version = "v4.0.1";
console.info("%c Linus Strategy %c ".concat(version, " "), "color: white; background: coral; font-weight: 700;", "color: coral; background: white; font-weight: 700;");


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
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class AggregateAreaListPopup extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_1__.AbstractPopup {
    getDefaultConfig(aggregate_entity, deviceClass, is_binary_sensor) {
        const groupedCards = [];
        let areaCards = [];
        for (const [i, entity_id] of aggregate_entity.attributes.entity_id?.entries() ?? []) {
            // Get a card for the area.
            if (entity_id) {
                areaCards.push({
                    type: "tile",
                    entity: entity_id,
                    // primary: area.name,
                    state_content: is_binary_sensor ? 'last-changed' : 'state',
                    color: is_binary_sensor ? 'red' : false,
                    // badge_icon: "mdi:numeric-9",
                    // badge_color: "red",
                });
            }
            // Horizontally group every two area cards if all cards are created.
            if (i === aggregate_entity.attributes.entity_id.length - 1) {
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
                    "title": aggregate_entity?.attributes?.friendly_name,
                    "content": {
                        "type": "vertical-stack",
                        "cards": [
                            {
                                type: "custom:mushroom-entity-card",
                                entity: aggregate_entity.entity_id,
                                color: is_binary_sensor ? 'red' : false,
                                secondary_info: is_binary_sensor ? 'last-changed' : 'state',
                            },
                            {
                                "type": "history-graph",
                                "hours_to_show": 10,
                                "show_names": false,
                                "entities": [
                                    {
                                        "entity": aggregate_entity.entity_id,
                                        "name": " "
                                    }
                                ]
                            },
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
    constructor(entity_id, type) {
        super();
        const aggregate_entity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(entity_id);
        if (aggregate_entity) {
            const is_binary_sensor = ["motion", "window", "door", "health"].includes(type);
            const defaultConfig = this.getDefaultConfig(aggregate_entity, type, is_binary_sensor);
            this.config = Object.assign(this.config, defaultConfig);
        }
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
    getDefaultConfig(aggregate_entity, deviceClass, is_binary_sensor) {
        const groupedCards = [];
        const areasByFloor = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.groupBy)(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas, (e) => e.floor_id ?? "undisclosed");
        for (const floor of [..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.floors, _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.floors.undisclosed]) {
            if (!(floor.floor_id in areasByFloor) || areasByFloor[floor.floor_id].length === 0)
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
            for (const [i, area] of areasByFloor[floor.floor_id].entries()) {
                const entity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices[area.name]?.entities[`aggregate_${aggregate_entity.attributes?.device_class}`];
                // Get a card for the area.
                if (entity && !_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.area_id]?.hidden) {
                    areaCards.push({
                        type: "tile",
                        entity: entity?.entity_id,
                        primary: area.name,
                        state_content: is_binary_sensor ? 'last-changed' : 'state',
                        color: is_binary_sensor ? 'red' : false,
                        // badge_icon: "mdi:numeric-9",
                        // badge_color: "red",
                    });
                }
                // Horizontally group every two area cards if all cards are created.
                if (i === areasByFloor[floor.floor_id].length - 1) {
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
                    "title": aggregate_entity?.attributes?.friendly_name,
                    "content": {
                        "type": "vertical-stack",
                        "cards": [
                            {
                                type: "custom:mushroom-entity-card",
                                entity: aggregate_entity.entity_id,
                                color: is_binary_sensor ? 'red' : false,
                                secondary_info: is_binary_sensor ? 'last-changed' : 'state',
                            },
                            {
                                "type": "history-graph",
                                "hours_to_show": 10,
                                "show_names": false,
                                "entities": [
                                    {
                                        "entity": aggregate_entity.entity_id,
                                        "name": " "
                                    }
                                ]
                            },
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
    constructor(entity_id, type) {
        super();
        const aggregate_entity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(entity_id);
        if (aggregate_entity) {
            const is_binary_sensor = ["motion", "window", "door", "health"].includes(type);
            const defaultConfig = this.getDefaultConfig(aggregate_entity, type, is_binary_sensor);
            this.config = Object.assign(this.config, defaultConfig);
        }
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
        const { area_state } = device.entities;
        const { friendly_name, adjoining_areas, features, states, presence_sensors, on_states } = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(area_state?.entity_id)?.attributes;
        presence_sensors?.sort((a, b) => {
            const aState = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(a);
            const bState = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(b);
            const lastChangeA = new Date(aState?.last_changed).getTime();
            const lastChangeB = new Date(bState?.last_changed).getTime();
            if (a === `switch.magic_areas_presence_hold_${(0,_utils__WEBPACK_IMPORTED_MODULE_1__.slugify)(device.name)}`) {
                return -1;
            }
            else if (b === `switch.magic_areas_presence_hold_${(0,_utils__WEBPACK_IMPORTED_MODULE_1__.slugify)(device.name)}`) {
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
                                        tap_action: device.id ? {
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
                                                            data: { path: `/config/devices/device/${device.id}` }
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
                                            target: { "device_id": device.id },
                                        }
                                    },
                                ]
                            },
                            // {
                            //     type: "horizontal-stack",
                            //     cards: [
                            //         {
                            //             type: "custom:mushroom-chips-card",
                            //             alignment: "end",
                            //             chips: currentStateChip(states),
                            //         },
                            //     ]
                            // },
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
                                primary: `Capteurs utilisé pour la détection de présence :`,
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

/***/ "./src/popups/GroupListPopup.ts":
/*!**************************************!*\
  !*** ./src/popups/GroupListPopup.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   GroupListPopup: () => (/* binding */ GroupListPopup)
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
class GroupListPopup extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__.AbstractPopup {
    getDefaultConfig(entities, title) {
        const entitiesByArea = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.groupBy)(entities, (e) => e.area_id ?? "undisclosed");
        return {
            "action": "fire-dom-event",
            "browser_mod": {
                "service": "browser_mod.popup",
                "data": {
                    "title": title,
                    "content": {
                        "type": "vertical-stack",
                        "cards": Object.entries(entitiesByArea).map(([area_id, entities]) => ([
                            {
                                type: "markdown",
                                content: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas.find(a => a.area_id === area_id)?.name}`,
                            },
                            {
                                type: "custom:layout-card",
                                layout_type: "custom:horizontal-layout",
                                layout: {
                                    width: 150,
                                },
                                cards: entities?.map((entity) => ({
                                    type: "custom:mushroom-entity-card",
                                    vertical: true,
                                    entity: entity.entity_id,
                                    secondary_info: 'last-changed',
                                })),
                            }
                        ])).flat()
                    }
                }
            }
        };
    }
    /**
     * Class Constructor.
     *
     * @param {EntityRegistryEntry[]} entities The chip entities.
     * @param {string} title The chip title.
     */
    constructor(entities, title) {
        super();
        const defaultConfig = this.getDefaultConfig(entities, title);
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
        const { aggregate_illuminance, adaptive_lighting_range, minimum_brightness, maximum_brightness, maximum_lighting_level } = device.entities;
        const device_slug = (0,_utils__WEBPACK_IMPORTED_MODULE_1__.slugify)(device.name);
        const OPTIONS_ADAPTIVE_LIGHTING_RANGE = {
            "": 1,
            "Small": 10,
            "Medium": 25,
            "Large": 50,
            "Extra large": 100,
        };
        const adaptive_lighting_range_state = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(adaptive_lighting_range?.entity_id).state;
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
                                            service: `${_variables__WEBPACK_IMPORTED_MODULE_2__.DOMAIN}.area_lux_for_lighting_max`,
                                            data: {
                                                area: device.name
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

/***/ "./src/popups/LinusSettingsPopup.ts":
/*!******************************************!*\
  !*** ./src/popups/LinusSettingsPopup.ts ***!
  \******************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   LinusSettings: () => (/* binding */ LinusSettings)
/* harmony export */ });
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ../Helper */ "./src/Helper.ts");
/* harmony import */ var _mushroom_strategy__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../mushroom-strategy */ "./src/mushroom-strategy.ts");
/* harmony import */ var _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./AbstractPopup */ "./src/popups/AbstractPopup.ts");



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Linus Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LinusSettings extends _AbstractPopup__WEBPACK_IMPORTED_MODULE_2__.AbstractPopup {
    getDefaultConfig() {
        const linusDeviceIds = Object.values(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices).map((area) => area?.id).flat();
        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: "Paramètre de Linus",
                    content: {
                        type: "vertical-stack",
                        cards: [
                            {
                                type: "horizontal-stack",
                                cards: [
                                    {
                                        type: "custom:mushroom-template-card",
                                        primary: "Recharger Linus",
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
                                        primary: "Redémarrer Linus",
                                        icon: "mdi:restart",
                                        icon_color: "red",
                                        tap_action: {
                                            action: "call-service",
                                            service: "homeassistant.restart",
                                        }
                                    },
                                ]
                            },
                            {
                                type: "markdown",
                                content: `Linus est en version ${_mushroom_strategy__WEBPACK_IMPORTED_MODULE_1__.version}.`,
                            },
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
    constructor() {
        super();
        const defaultConfig = this.getDefaultConfig();
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
        const { scene_morning, scene_daytime, scene_evening, scene_night } = device.entities;
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
                            ...(selectControl.length ? _variables__WEBPACK_IMPORTED_MODULE_1__.todOrder.map(tod => ({
                                type: "custom:config-template-card",
                                variables: {
                                    SCENE_STATE: `states['${device.entities[('scene_' + tod)]?.entity_id}'].state`
                                },
                                entities: [device.entities[('scene_' + tod)]?.entity_id],
                                card: {
                                    type: "horizontal-stack",
                                    cards: [
                                        {
                                            type: "entities",
                                            entities: [device.entities[('scene_' + tod)]?.entity_id]
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
                                                    service: `${_variables__WEBPACK_IMPORTED_MODULE_1__.DOMAIN}.snapshot_lights_as_tod_scene`,
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
/* harmony export */   getAggregateEntity: () => (/* binding */ getAggregateEntity),
/* harmony export */   getStateContent: () => (/* binding */ getStateContent),
/* harmony export */   groupBy: () => (/* binding */ groupBy),
/* harmony export */   navigateTo: () => (/* binding */ navigateTo),
/* harmony export */   slugify: () => (/* binding */ slugify)
/* harmony export */ });
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./variables */ "./src/variables.ts");

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
function slugify(name) {
    if (name === null) {
        return "";
    }
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
}
function getStateContent(entity_id) {
    return entity_id.startsWith('binary_sensor.') ? 'last-changed' : 'state';
}
function navigateTo(path) {
    return {
        action: "navigate",
        navigation_path: `/dashboard/${path}`,
    };
}
function getAggregateEntity(device, domains, deviceClasses) {
    const aggregateKeys = [];
    for (const domain of Array.isArray(domains) ? domains : [domains]) {
        if (domain === "light") {
            Object.values(device.entities)?.map(entity => {
                if (entity.entity_id.endsWith('_lights')) {
                    aggregateKeys.push(entity);
                }
            });
        }
        if (_variables__WEBPACK_IMPORTED_MODULE_0__.MAGIC_AREAS_GROUP_DOMAINS.includes(domain)) {
            aggregateKeys.push(device.entities[`${domain}_group`]);
        }
        if (_variables__WEBPACK_IMPORTED_MODULE_0__.MAGIC_AREAS_AGGREGATE_DOMAINS.includes(domain)) {
            for (const deviceClass of Array.isArray(deviceClasses) ? deviceClasses : [deviceClasses]) {
                aggregateKeys.push(device.entities[`aggregate_${deviceClass}`]);
            }
        }
    }
    return aggregateKeys.filter(Boolean);
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
/* harmony export */   ALARM_ICONS: () => (/* binding */ ALARM_ICONS),
/* harmony export */   ALERT_DOMAINS: () => (/* binding */ ALERT_DOMAINS),
/* harmony export */   AREA_CARDS_DOMAINS: () => (/* binding */ AREA_CARDS_DOMAINS),
/* harmony export */   AREA_CARD_SENSORS_CLASS: () => (/* binding */ AREA_CARD_SENSORS_CLASS),
/* harmony export */   AREA_STATE_ICONS: () => (/* binding */ AREA_STATE_ICONS),
/* harmony export */   CLIMATE_DOMAINS: () => (/* binding */ CLIMATE_DOMAINS),
/* harmony export */   CLIMATE_PRESET_ICONS: () => (/* binding */ CLIMATE_PRESET_ICONS),
/* harmony export */   DEVICE_CLASSES: () => (/* binding */ DEVICE_CLASSES),
/* harmony export */   DEVICE_ICONS: () => (/* binding */ DEVICE_ICONS),
/* harmony export */   DOMAIN: () => (/* binding */ DOMAIN),
/* harmony export */   DOMAIN_ICONS: () => (/* binding */ DOMAIN_ICONS),
/* harmony export */   DOMAIN_STATE_ICONS: () => (/* binding */ DOMAIN_STATE_ICONS),
/* harmony export */   HOUSE_INFORMATION_DOMAINS: () => (/* binding */ HOUSE_INFORMATION_DOMAINS),
/* harmony export */   MAGIC_AREAS_AGGREGATE_DOMAINS: () => (/* binding */ MAGIC_AREAS_AGGREGATE_DOMAINS),
/* harmony export */   MAGIC_AREAS_DOMAINS: () => (/* binding */ MAGIC_AREAS_DOMAINS),
/* harmony export */   MAGIC_AREAS_GROUP_DOMAINS: () => (/* binding */ MAGIC_AREAS_GROUP_DOMAINS),
/* harmony export */   MAGIC_AREAS_LIGHT_DOMAINS: () => (/* binding */ MAGIC_AREAS_LIGHT_DOMAINS),
/* harmony export */   OTHER_DOMAINS: () => (/* binding */ OTHER_DOMAINS),
/* harmony export */   SENSOR_DOMAINS: () => (/* binding */ SENSOR_DOMAINS),
/* harmony export */   STATES_OFF: () => (/* binding */ STATES_OFF),
/* harmony export */   SUPPORTED_CARDS_WITH_ENTITY: () => (/* binding */ SUPPORTED_CARDS_WITH_ENTITY),
/* harmony export */   TOGGLE_DOMAINS: () => (/* binding */ TOGGLE_DOMAINS),
/* harmony export */   UNAVAILABLE: () => (/* binding */ UNAVAILABLE),
/* harmony export */   UNAVAILABLE_STATES: () => (/* binding */ UNAVAILABLE_STATES),
/* harmony export */   UNKNOWN: () => (/* binding */ UNKNOWN),
/* harmony export */   WEATHER_ICONS: () => (/* binding */ WEATHER_ICONS),
/* harmony export */   todOrder: () => (/* binding */ todOrder)
/* harmony export */ });
const DOMAIN = "magic_areas";
const WEATHER_ICONS = {
    "clear-night": "mdi:weather-night",
    cloudy: "mdi:weather-cloudy",
    overcast: "mdi:weather-cloudy-arrow-right",
    fog: "mdi:weather-fog",
    hail: "mdi:weather-hail",
    lightning: "mdi:weather-lightning",
    "lightning-rainy": "mdi:weather-lightning-rainy",
    partlycloudy: "mdi:weather-partly-cloudy",
    pouring: "mdi:weather-pouring",
    rainy: "mdi:weather-rainy",
    snowy: "mdi:weather-snowy",
    "snowy-rainy": "mdi:weather-snowy-rainy",
    sunny: "mdi:weather-sunny",
    windy: "mdi:weather-windy",
    "windy-variant": "mdi:weather-windy-variant",
};
const ALARM_ICONS = {
    "armed_away": "mdi:shield-lock",
    "armed_vacation": "mdi:shield-airplane",
    "armed_home": "mdi:shield-home",
    "armed_night": "mdi:shield-moon",
    "armed_custom_bypass": "mdi:security",
    "pending": "mdi:shield-outline",
    "triggered": "mdi:bell-ring",
    disarmed: "mdi:shield-off",
};
const UNAVAILABLE = "unavailable";
const UNKNOWN = "unknown";
const todOrder = ["morning", "daytime", "evening", "night"];
const STATES_OFF = ["closed", "locked", "off", "docked", "idle", "standby", "paused", "auto", "ok"];
const UNAVAILABLE_STATES = ["unavailable", "unknown"];
const MAGIC_AREAS_LIGHT_DOMAINS = "light";
const MAGIC_AREAS_GROUP_DOMAINS = ["cover", "climate", "media_player"];
const MAGIC_AREAS_AGGREGATE_DOMAINS = ["binary_sensor", "sensor"];
const MAGIC_AREAS_DOMAINS = [MAGIC_AREAS_LIGHT_DOMAINS, ...MAGIC_AREAS_GROUP_DOMAINS, ...MAGIC_AREAS_AGGREGATE_DOMAINS];
const SENSOR_DOMAINS = ["sensor"];
const ALERT_DOMAINS = ["binary_sensor", "health"];
const TOGGLE_DOMAINS = ["light", "switch"];
const CLIMATE_DOMAINS = ["climate", "fan"];
const HOUSE_INFORMATION_DOMAINS = ["camera", "cover", "vacuum", "media_player", "lock", "plant"];
const OTHER_DOMAINS = ["camera", "cover", "vacuum", "media_player", "lock", "scene", "plant"];
const AREA_CARDS_DOMAINS = [...TOGGLE_DOMAINS, ...CLIMATE_DOMAINS, ...OTHER_DOMAINS, "binary_sensor", "sensor"];
const DEVICE_CLASSES = {
    sensor: ["illuminance", "temperature", "humidity", "battery", "energy", "power"],
    binary_sensor: ["motion", "door", "window", "vibration", "moisture", "smoke"],
};
const AREA_CARD_SENSORS_CLASS = ["temperature"];
const DEVICE_ICONS = {
    presence_hold: 'mdi:car-brake-hold'
};
const DOMAIN_STATE_ICONS = {
    light: { on: "mdi:lightbulb", off: "mdi:lightbulb-outline" },
    switch: { on: "mdi:power-plug", off: "mdi:power-plug" },
    fan: { on: "mdi:fan", off: "mdi:fan-off" },
    sensor: { humidity: "mdi:water-percent", temperature: "mdi:thermometer", pressure: "mdi:gauge" },
    binary_sensor: {
        motion: { on: "mdi:motion-sensor", off: "mdi:motion-sensor-off" },
        door: { on: "mdi:door-open", off: "mdi:door-closed" },
        window: { on: "mdi:window-open-variant", off: "mdi:window-closed-variant" },
        safety: { on: "mdi:alert-circle", off: "mdi:check-circle" },
        vibration: "mdi:vibrate",
        moisture: "mdi:water-alert",
        smoke: "mdi:smoke-detector-variant-alert",
    },
    vacuum: { on: "mdi:robot-vacuum" },
    media_player: { on: "mdi:cast-connected" },
    lock: { on: "mdi:lock-open" },
    climate: { on: "mdi:thermostat" },
    camera: { on: "mdi:video" },
    cover: { on: "mdi:window-shutter-open", off: "mdi:window-shutter" },
    plant: { on: "mdi:flower", off: "mdi:flower" },
};
const DOMAIN_ICONS = {
    light: "mdi:lightbulb",
    climate: "mdi:thermostat",
    switch: "mdi:power-plug",
    fan: "mdi:fan",
    sensor: "mdi:eye",
    humidity: "mdi:water-percent",
    pressure: "mdi:gauge",
    illuminance: "mdi:brightness-5",
    temperature: "mdi:thermometer",
    energy: "mdi:lightning-bolt",
    power: "mdi:flash",
    binary_sensor: "mdi:radiobox-blank",
    motion: "mdi:motion-sensor",
    door: "mdi:door-open",
    window: "mdi:window-open-variant",
    vibration: "mdi:vibrate",
    moisture: "mdi:water-alert",
    vacuum: "mdi:robot-vacuum",
    media_player: "mdi:cast-connected",
    camera: "mdi:video",
    cover: "mdi:window-shutter",
    remote: "mdi:remote",
    scene: "mdi:palette",
    number: "mdi:ray-vertex",
    button: "mdi:gesture-tap-button",
    water_heater: "mdi:thermometer",
    select: "mdi:format-list-bulleted",
    lock: "mdi:lock",
    device_tracker: "mdi:radar",
    person: "mdi:account-multiple",
    weather: "mdi:weather-cloudy",
    automation: "mdi:robot-outline",
    alarm_control_panel: "mdi:shield-home",
    plant: 'mdi:flower',
    input_boolean: 'mdi:toggle-switch',
    health: 'mdi:shield-check-outline',
};
const SUPPORTED_CARDS_WITH_ENTITY = [
    "button",
    "calendar",
    "entity",
    "gauge",
    "history-graph",
    "light",
    "media-control",
    "picture-entity",
    "sensor",
    "thermostat",
    "weather-forecast",
    "custom:button-card",
    "custom:mushroom-fan-card",
    "custom:mushroom-cover-card",
    "custom:mushroom-entity-card",
    "custom:mushroom-light-card",
    "tile",
];
const AREA_STATE_ICONS = {
    occupied: "mdi:account",
    extended: "mdi:account-clock",
    clear: "mdi:account-off",
    bright: "mdi:brightness-2",
    dark: "mdi:brightness-5",
    sleep: "mdi:bed",
};
const CLIMATE_PRESET_ICONS = {
    away: 'mdi:home',
    eco: 'mdi:leaf',
    boost: 'mdi:fire',
    comfort: 'mdi:sofa',
    home: 'mdi:home-account',
    sleep: 'mdi:weather-night',
    activity: 'mdi:briefcase',
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
/* harmony import */ var _cards_AggregateCard__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../cards/AggregateCard */ "./src/cards/AggregateCard.ts");
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
var _AbstractView_domain;






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
     *
     * @throws {Error} If trying to instantiate this class.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(domain = "") {
        /**
         * Configuration of the view.
         *
         * @type {LovelaceViewConfig}
         */
        this.config = {
            icon: "mdi:view-dashboard",
            subview: false,
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
        /**
         * The domain of which we operate the devices.
         *
         * @private
         * @readonly
         */
        _AbstractView_domain.set(this, void 0);
        if (!_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
        if (domain) {
            __classPrivateFieldSet(this, _AbstractView_domain, domain, "f");
        }
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<(StackCardConfig | TitleCardConfig)[]>} An array of card objects.
     */
    async createViewCards() {
        const viewCards = [];
        const configEntityHidden = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _AbstractView_domain, "f") ?? "_"].hide_config_entities
            || _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.domains["_"].hide_config_entities;
        if (__classPrivateFieldGet(this, _AbstractView_domain, "f") && _variables__WEBPACK_IMPORTED_MODULE_0__.MAGIC_AREAS_DOMAINS.includes(__classPrivateFieldGet(this, _AbstractView_domain, "f"))) {
            viewCards.push(new _cards_AggregateCard__WEBPACK_IMPORTED_MODULE_5__.AggregateCard(__classPrivateFieldGet(this, _AbstractView_domain, "f")).createCard());
        }
        const areasByFloor = (0,_utils__WEBPACK_IMPORTED_MODULE_4__.groupBy)(_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.areas, (e) => e.floor_id ?? "undisclosed");
        for (const floor of [..._Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.floors, _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.floors.undisclosed]) {
            if (__classPrivateFieldGet(this, _AbstractView_domain, "f") && _variables__WEBPACK_IMPORTED_MODULE_0__.MAGIC_AREAS_DOMAINS.includes(__classPrivateFieldGet(this, _AbstractView_domain, "f")) && floor.floor_id !== "undisclosed")
                continue;
            if (!(floor.floor_id in areasByFloor) || areasByFloor[floor.floor_id].length === 0)
                continue;
            let floorCards = [];
            if (floor.floor_id !== "undisclosed") {
                floorCards.push({
                    type: "custom:mushroom-title-card",
                    title: floor.name,
                    card_mod: {
                        style: `ha-card.header {padding-top: 8px;}`,
                    }
                });
            }
            let areaCards = [];
            // Create cards for each area.
            for (const [i, area] of areasByFloor[floor.floor_id].entries()) {
                areaCards = [];
                if (__classPrivateFieldGet(this, _AbstractView_domain, "f") && _variables__WEBPACK_IMPORTED_MODULE_0__.MAGIC_AREAS_DOMAINS.includes(__classPrivateFieldGet(this, _AbstractView_domain, "f")) && area.area_id !== "undisclosed")
                    continue;
                const entities = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.getDeviceEntities(area, __classPrivateFieldGet(this, _AbstractView_domain, "f") ?? "");
                const className = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.sanitizeClassName(__classPrivateFieldGet(this, _AbstractView_domain, "f") + "Card");
                const cardModule = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`);
                // Set the target for controller cards to the current area.
                let target = {
                    area_id: [area.area_id],
                };
                // Set the target for controller cards to entities without an area.
                if (area.area_id === "undisclosed") {
                    if (__classPrivateFieldGet(this, _AbstractView_domain, "f") === 'light')
                        target = {
                            entity_id: entities.map(entity => entity.entity_id),
                        };
                }
                const swipeCard = [];
                // Create a card for each domain-entity of the current area.
                for (const entity of entities) {
                    let cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.card_options?.[entity.entity_id];
                    let deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                    if (cardOptions?.hidden || deviceOptions?.hidden) {
                        continue;
                    }
                    if (entity.entity_category === "config" && configEntityHidden) {
                        continue;
                    }
                    swipeCard.push(new cardModule[className](entity, cardOptions).getCard());
                }
                if (swipeCard.length) {
                    areaCards.push(new _cards_SwipeCard__WEBPACK_IMPORTED_MODULE_3__.SwipeCard(swipeCard).getCard());
                }
                // Vertical stack the area cards if it has entities.
                if (areaCards.length) {
                    const titleCardOptions = ("controllerCardOptions" in this.config) ? this.config.controllerCardOptions : {};
                    // Create and insert a Controller card.
                    areaCards.unshift(new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(target, Object.assign({ subtitle: area.name }, titleCardOptions)).createCard());
                    floorCards.push({
                        type: "vertical-stack",
                        cards: areaCards,
                    });
                }
            }
            if (floorCards.length > 0)
                viewCards.push(...floorCards);
        }
        // Add a Controller Card for all the entities in the view.
        if (viewCards.length) {
            viewCards.unshift(this.viewControllerCard);
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
    /**
     * Get a target of entity IDs for the given domain.
     *
     * @param {string} domain - The target domain to retrieve entity IDs from.
     * @return {HassServiceTarget} - A target for a service call.
     */
    targetDomain(domain) {
        return {
            entity_id: _Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.entities.filter(entity => entity.entity_id.startsWith(domain + ".")
                && !entity.hidden_by
                && !_Helper__WEBPACK_IMPORTED_MODULE_1__.Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden).map(entity => entity.entity_id),
        };
    }
}
_AbstractView_domain = new WeakMap();



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
            path: "cameras",
            icon: "mdi:cctv",
            subview: false,
            controllerCardOptions: {
                showControls: false,
            },
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _CameraView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.localize(`component.camera.entity_component._.name`)}s`,
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _CameraView_domain), "ne", "off") + ` ${_Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.localize("component.light.entity_component._.state.on")}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _CameraView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_0__.ControllerCard({}, {
            ...__classPrivateFieldGet(this, _CameraView_viewControllerCardConfig, "f"),
            ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}),
        }).createCard();
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
            path: "climates",
            icon: "mdi:thermostat",
            subview: false,
            controllerCardOptions: {
                showControls: false,
            },
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _ClimateView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.climate.entity_component._.name`)}s`,
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _ClimateView_domain), "ne", "off") + ` ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.fan.entity_component._.state.on`)}s`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _ClimateView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _ClimateView_domain)), {
            ...__classPrivateFieldGet(this, _ClimateView_viewControllerCardConfig, "f"),
            ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}),
        }).createCard();
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
            path: "covers",
            icon: "mdi:window-open",
            subview: false,
            controllerCardOptions: {
                iconOn: "mdi:arrow-up",
                iconOff: "mdi:arrow-down",
                onService: "cover.open_cover",
                offService: "cover.close_cover",
            },
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _CoverView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.cover.entity_component._.name`)}`,
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _CoverView_domain), "eq", "open") + ` ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.cover.entity_component._.state.open`)}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _CoverView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _CoverView_domain)), {
            ...__classPrivateFieldGet(this, _CoverView_viewControllerCardConfig, "f"),
            ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}),
        }).createCard();
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
            path: "fans",
            icon: "mdi:fan",
            subview: false,
            controllerCardOptions: {
                iconOn: "mdi:fan",
                iconOff: "mdi:fan-off",
                onService: "fan.turn_on",
                offService: "fan.turn_off",
            },
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _FanView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.fan.entity_component._.name`)}s`,
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _FanView_domain), "eq", "on") + ` ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.fan.entity_component._.state.on`)}s`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _FanView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _FanView_domain)), {
            ...__classPrivateFieldGet(this, _FanView_viewControllerCardConfig, "f"),
            ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}),
        }).createCard();
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
/* harmony import */ var _AbstractView__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./AbstractView */ "./src/views/AbstractView.ts");
/* harmony import */ var _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ../chips/SettingsChip */ "./src/chips/SettingsChip.ts");
/* harmony import */ var _popups_LinusSettingsPopup__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ../popups/LinusSettingsPopup */ "./src/popups/LinusSettingsPopup.ts");
/* harmony import */ var _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! ../chips/UnavailableChip */ "./src/chips/UnavailableChip.ts");
/* harmony import */ var _variables__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! ../variables */ "./src/variables.ts");
/* harmony import */ var _utils__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! ../utils */ "./src/utils.ts");
/* harmony import */ var _types_strategy_generic__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! ../types/strategy/generic */ "./src/types/strategy/generic.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HomeView_instances, _HomeView_defaultConfig, _HomeView_createChips, _HomeView_createPersonCards, _HomeView_createAreaSection;








var isCallServiceActionConfig = _types_strategy_generic__WEBPACK_IMPORTED_MODULE_7__.generic.isCallServiceActionConfig;
// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Home View Class.
 *
 * Used to create a Home view.
 *
 * @class HomeView
 * @extends AbstractView
 */
class HomeView extends _AbstractView__WEBPACK_IMPORTED_MODULE_1__.AbstractView {
    /**
     * Class constructor.
     *
     * @param {views.ViewConfig} [options={}] Options for the view.
     */
    constructor(options = {}) {
        super();
        _HomeView_instances.add(this);
        /**
         * Default configuration of the view.
         *
         * @type {views.ViewConfig}
         * @private
         */
        _HomeView_defaultConfig.set(this, {
            title: "Home",
            icon: "mdi:home-assistant",
            path: "home",
            subview: false,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _HomeView_defaultConfig, "f"), options);
    }
    /**
     * Create the cards to include in the view.
     *
     * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
     * @override
     */
    async createViewCards() {
        return await Promise.all([
            __classPrivateFieldGet(this, _HomeView_instances, "m", _HomeView_createChips).call(this),
            __classPrivateFieldGet(this, _HomeView_instances, "m", _HomeView_createPersonCards).call(this),
            __classPrivateFieldGet(this, _HomeView_instances, "m", _HomeView_createAreaSection).call(this),
        ]).then(([chips, personCards, areaCards]) => {
            const options = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions;
            const homeViewCards = [];
            if (chips.length) {
                // TODO: Create the Chip card at this.#createChips()
                homeViewCards.push({
                    type: "custom:mushroom-chips-card",
                    alignment: "center",
                    chips: chips,
                });
            }
            if (personCards.length) {
                // TODO: Create the stack at this.#createPersonCards()
                homeViewCards.push({
                    type: "horizontal-stack",
                    cards: personCards,
                });
            }
            if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("greeting")) {
                const tod = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices.Global.entities.time_of_the_day;
                homeViewCards.push({
                    type: "custom:mushroom-template-card",
                    primary: `
          {% set tod = states("${tod?.entity_id}") %}
          {% if (tod == "evening") %} Bonne soirée, {{user}}!
          {% elif (tod == "daytime") %} Bonne après-midi, {{user}}!
          {% elif (tod == "morning") %} Bonjour, {{user}}!
          {% else %} Bonne nuit, {{user}}!
          {% endif %}`,
                    icon: "mdi:hand-wave",
                    icon_color: "orange",
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
                homeViewCards.push(...options.quick_access_cards);
            }
            // Add area cards.
            homeViewCards.push({
                type: "vertical-stack",
                cards: areaCards,
            });
            // Add custom cards.
            if (options.extra_cards) {
                homeViewCards.push(...options.extra_cards);
            }
            return homeViewCards;
        });
    }
}
_HomeView_defaultConfig = new WeakMap(), _HomeView_instances = new WeakSet(), _HomeView_createChips = 
/**
 * Create the chips to include in the view.
 *
 * @return {Promise<LovelaceChipConfig[]>} Promise a chip array.
 */
async function _HomeView_createChips() {
    if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("chips")) {
        // Chips section is hidden.
        return [];
    }
    const chips = [];
    const chipOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.chips;
    // TODO: Get domains from config.
    const exposedChips = ["light", "fan", "cover", "switch", "climate", "safety", "motion", "door", "window"];
    // Create a list of area-ids, used for switching all devices via chips
    const areaIds = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas.map(area => area.area_id ?? "");
    let chipModule;
    // Weather chip.
    const weatherEntityId = chipOptions?.weather_entity ?? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities.find((entity) => entity.entity_id.startsWith("weather.") && entity.disabled_by === null && entity.hidden_by === null)?.entity_id;
    if (weatherEntityId) {
        try {
            chipModule = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../chips/WeatherChip */ "./src/chips/WeatherChip.ts"));
            const weatherChip = new chipModule.WeatherChip(weatherEntityId);
            chips.push(weatherChip.getChip());
        }
        catch (e) {
            _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError("An error occurred while creating the weather chip!", e);
        }
    }
    // Alarm chip.
    const alarmEntityId = chipOptions?.alarm_entity ?? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getAlarmEntity()?.entity_id;
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
    const spotifyEntityId = chipOptions?.spotify_entity ?? _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities.find((entity) => entity.entity_id.startsWith("media_player.spotify_") && entity.disabled_by === null && entity.hidden_by === null)?.entity_id;
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
    // Numeric chips.
    for (let chipType of exposedChips) {
        if (chipOptions?.[`${chipType}_count`] ?? true) {
            const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(chipType + "Chip");
            try {
                chipModule = await __webpack_require__("./src/chips lazy recursive ^\\.\\/.*$")(`./${className}`);
                const chip = new chipModule[className](_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices["Global"]);
                if ("tap_action" in this.config && isCallServiceActionConfig(this.config.tap_action)) {
                    chip.setTapActionTarget({ area_id: areaIds });
                }
                chips.push(chip.getChip());
            }
            catch (e) {
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.logError(`An error occurred while creating the ${chipType} chip!`, e);
            }
        }
    }
    // Extra chips.
    if (chipOptions?.extra_chips) {
        chips.push(...chipOptions.extra_chips);
    }
    // Unavailable chip.
    const unavailableEntities = Object.values(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices["Global"]?.entities)?.filter((e) => {
        const entityState = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getEntityState(e.entity_id);
        return (exposedChips.includes(e.entity_id.split(".", 1)[0]) || exposedChips.includes(entityState?.attributes.device_class || '')) &&
            _variables__WEBPACK_IMPORTED_MODULE_5__.UNAVAILABLE_STATES.includes(entityState?.state);
    });
    if (unavailableEntities.length) {
        const unavailableChip = new _chips_UnavailableChip__WEBPACK_IMPORTED_MODULE_4__.UnavailableChip(unavailableEntities);
        chips.push(unavailableChip.getChip());
    }
    const linusSettings = new _chips_SettingsChip__WEBPACK_IMPORTED_MODULE_2__.SettingsChip({ tap_action: new _popups_LinusSettingsPopup__WEBPACK_IMPORTED_MODULE_3__.LinusSettings().getPopup() });
    chips.push(linusSettings.getChip());
    return chips;
}, _HomeView_createPersonCards = function _HomeView_createPersonCards() {
    if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("persons")) {
        // Person section is hidden.
        return [];
    }
    const cards = [];
    Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../cards/PersonCard */ "./src/cards/PersonCard.ts")).then(personModule => {
        for (const person of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities.filter((entity) => {
            return entity.entity_id.startsWith("person.")
                && entity.hidden_by == null
                && entity.disabled_by == null;
        })) {
            cards.push(new personModule.PersonCard(person).getCard());
        }
    });
    return cards;
}, _HomeView_createAreaSection = 
/**
 * Create the area cards to include in the view.
 *
 * Area cards are grouped into two areas per row.
 *
 * @return {Promise<(TitleCardConfig | StackCardConfig)[]>} Promise an Area Card Section.
 */
async function _HomeView_createAreaSection() {
    if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("areas")) {
        // Areas section is hidden.
        return [];
    }
    const groupedCards = [];
    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("areasTitle")) {
        groupedCards.push({
            type: "custom:mushroom-title-card",
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("ui.components.area-picker.area")}s`,
        });
    }
    const areasByFloor = (0,_utils__WEBPACK_IMPORTED_MODULE_6__.groupBy)(_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas, (e) => e.floor_id ?? "undisclosed");
    for (const floor of [..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.floors, _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.floors.undisclosed]) {
        let areaCards = [];
        if (!(floor.floor_id in areasByFloor))
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
        for (const [i, area] of areasByFloor[floor.floor_id].entries()) {
            let module;
            let moduleName = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.area_id]?.type ??
                _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas["_"]?.type ??
                "default";
            // Load module by type in strategy options.
            try {
                module = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${moduleName}`);
            }
            catch (e) {
                // Fallback to the default strategy card.
                module = await Promise.resolve(/*! import() */).then(__webpack_require__.bind(__webpack_require__, /*! ../cards/AreaCard */ "./src/cards/AreaCard.ts"));
                if (_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.debug && moduleName !== "default") {
                    console.error(e);
                }
            }
            // Get a card for the area.
            if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.area_id]?.hidden) {
                let options = {
                    ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas["_"],
                    ..._Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.areas[area.area_id],
                };
                areaCards.push(new module.AreaCard(area, options).getCard());
            }
            // Horizontally group every two area cards if all cards are created.
            if (i === areasByFloor[floor.floor_id].length - 1) {
                for (let i = 0; i < areaCards.length; i += 1) {
                    groupedCards.push({
                        type: "vertical-stack",
                        cards: areaCards.slice(i, i + 1),
                    });
                }
            }
        }
    }
    groupedCards.push({
        type: "custom:mushroom-template-card",
        primary: "Ajouter une nouvelle pièce",
        secondary: `Cliquer ici pour vous rendre sur la page des pièces`,
        multiline_secondary: true,
        icon: `mdi:view-dashboard-variant`,
        fill_container: true,
        tap_action: {
            action: "navigate",
            navigation_path: '/config/areas/dashboard'
        },
    });
    return groupedCards;
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
            path: "lights",
            icon: "mdi:lightbulb-group",
            subview: false,
            controllerCardOptions: {
                iconOn: "mdi:lightbulb",
                iconOff: "mdi:lightbulb-off",
                onService: "light.turn_on",
                offService: "light.turn_off",
            },
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _LightView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.light.entity_component._.name`)}s`,
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _LightView_domain), "eq", "on") + ` ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.light.entity_component._.state.on")}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _LightView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _LightView_domain)), {
            ...__classPrivateFieldGet(this, _LightView_viewControllerCardConfig, "f"),
            ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}),
        }).createCard();
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
            path: "media_players",
            icon: "mdi:cast",
            subview: false,
            controllerCardOptions: {
                showControls: false,
            },
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _MediaPlayerView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.media_player.entity_component._.name`)}s`,
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _MediaPlayerView_domain), "ne", "off") + " media players on",
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _MediaPlayerView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _MediaPlayerView_domain)), {
            ...__classPrivateFieldGet(this, _MediaPlayerView_viewControllerCardConfig, "f"),
            ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}),
        }).createCard();
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
            path: "scenes",
            icon: "mdi:palette",
            subview: false,
            controllerCardOptions: {
                showControls: false,
            },
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _SceneView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`ui.dialogs.quick-bar.commands.navigation.scene`)}`,
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _SceneView_domain), "ne", "on") + ` ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`ui.dialogs.quick-bar.commands.navigation.scene`)}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SceneView_defaultConfig, "f"), options);
        // Create a Controller card to scene all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _SceneView_domain)), {
            ...__classPrivateFieldGet(this, _SceneView_viewControllerCardConfig, "f"),
            ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}),
        }).createCard();
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
            path: "security-details",
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
        const globalDevice = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices["Global"];
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
         * Configuration of the view.
         *
         * @type {LovelaceViewConfig}
         */
        this.config = {
            title: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize("component.binary_sensor.entity_component.safety.name"),
            path: "security",
            icon: "mdi:security",
            subview: false,
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
        const alarmEntity = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getAlarmEntity();
        if (alarmEntity?.entity_id) {
            viewCards.push({
                type: "custom:mushroom-title-card",
                subtitle: "Alarme",
                card_mod: {
                    style: `ha-card.header { padding-top: 8px; }`,
                }
            });
            viewCards.push(new _cards_AlarmCard__WEBPACK_IMPORTED_MODULE_1__.AlarmCard(alarmEntity).getCard());
        }
        const persons = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getPersonsEntity();
        if (persons?.length) {
            viewCards.push({
                type: "custom:mushroom-title-card",
                subtitle: "Personnes",
                card_mod: {
                    style: `ha-card.header { padding-top: 8px; }`,
                }
            });
            for (const person of persons) {
                viewCards.push(new _cards_PersonCard__WEBPACK_IMPORTED_MODULE_2__.PersonCard(person, {
                    layout: "horizontal",
                    primary_info: "name",
                    secondary_info: "state"
                }).getCard());
            }
        }
        const globalDevice = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.magicAreasDevices["Global"];
        const { aggregate_motion, aggregate_door, aggregate_window, } = globalDevice?.entities;
        if (aggregate_motion || aggregate_door || aggregate_window) {
            viewCards.push({
                type: "custom:mushroom-title-card",
                subtitle: "Capteurs",
                card_mod: {
                    style: `ha-card.header { padding-top: 8px; }`,
                }
            });
            if (aggregate_motion?.entity_id)
                viewCards.push(new _cards_BinarySensorCard__WEBPACK_IMPORTED_MODULE_3__.BinarySensorCard(aggregate_motion, { tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.navigateTo)('security-details') }).getCard());
            if (aggregate_door?.entity_id)
                viewCards.push(new _cards_BinarySensorCard__WEBPACK_IMPORTED_MODULE_3__.BinarySensorCard(aggregate_door, { tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.navigateTo)('security-details') }).getCard());
            if (aggregate_window?.entity_id)
                viewCards.push(new _cards_BinarySensorCard__WEBPACK_IMPORTED_MODULE_3__.BinarySensorCard(aggregate_window, { tap_action: (0,_utils__WEBPACK_IMPORTED_MODULE_4__.navigateTo)('security-details') }).getCard());
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
            path: "switches",
            icon: "mdi:dip-switch",
            subview: false,
            controllerCardOptions: {
                iconOn: "mdi:power-plug",
                iconOff: "mdi:power-plug-off",
                onService: "switch.turn_on",
                offService: "switch.turn_off",
            },
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _SwitchView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.switch.entity_component._.name`)}s`,
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _SwitchView_domain), "eq", "on") + " switches on",
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SwitchView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _SwitchView_domain)), {
            ...__classPrivateFieldGet(this, _SwitchView_viewControllerCardConfig, "f"),
            ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}),
        }).createCard();
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
            path: "vacuums",
            icon: "mdi:robot-vacuum",
            subview: false,
            controllerCardOptions: {
                iconOn: "mdi:robot-vacuum",
                iconOff: "mdi:robot-vacuum-off",
                onService: "vacuum.start",
                offService: "vacuum.stop",
            },
        });
        /**
         * Default configuration of the view's Controller card.
         *
         * @type {cards.ControllerCardOptions}
         * @private
         */
        _VacuumView_viewControllerCardConfig.set(this, {
            title: `${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.vacuum.entity_component._.name`)}s`,
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _VacuumView_domain), "ne", "off") + ` ${_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.localize(`component.vacuum.entity_component._.state.on`)}`,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _VacuumView_defaultConfig, "f"), options);
        // Create a Controller card to switch all entities of the domain.
        this.viewControllerCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(this.targetDomain(__classPrivateFieldGet(_a, _a, "f", _VacuumView_domain)), {
            ...__classPrivateFieldGet(this, _VacuumView_viewControllerCardConfig, "f"),
            ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}),
        }).createCard();
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
		"./src/cards/AbstractCard.ts"
	],
	"./AbstractCard.ts": [
		"./src/cards/AbstractCard.ts"
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
	"./AreaButtonCard": [
		"./src/cards/AreaButtonCard.ts",
		"main"
	],
	"./AreaButtonCard.ts": [
		"./src/cards/AreaButtonCard.ts",
		"main"
	],
	"./AreaCard": [
		"./src/cards/AreaCard.ts",
		"main"
	],
	"./AreaCard.ts": [
		"./src/cards/AreaCard.ts",
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
	"./HaAreaCard": [
		"./src/cards/HaAreaCard.ts",
		"main"
	],
	"./HaAreaCard.ts": [
		"./src/cards/HaAreaCard.ts",
		"main"
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
	"./MainAreaCard": [
		"./src/cards/MainAreaCard.ts"
	],
	"./MainAreaCard.ts": [
		"./src/cards/MainAreaCard.ts"
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
		"./src/cards/SensorCard.ts"
	],
	"./SensorCard.ts": [
		"./src/cards/SensorCard.ts"
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
	"./AlarmChip": [
		"./src/chips/AlarmChip.ts",
		"main"
	],
	"./AlarmChip.ts": [
		"./src/chips/AlarmChip.ts",
		"main"
	],
	"./AreaScenesChips": [
		"./src/chips/AreaScenesChips.ts"
	],
	"./AreaScenesChips.ts": [
		"./src/chips/AreaScenesChips.ts"
	],
	"./AreaStateChip": [
		"./src/chips/AreaStateChip.ts"
	],
	"./AreaStateChip.ts": [
		"./src/chips/AreaStateChip.ts"
	],
	"./ClimateChip": [
		"./src/chips/ClimateChip.ts",
		"main"
	],
	"./ClimateChip.ts": [
		"./src/chips/ClimateChip.ts",
		"main"
	],
	"./CoverChip": [
		"./src/chips/CoverChip.ts",
		"main"
	],
	"./CoverChip.ts": [
		"./src/chips/CoverChip.ts",
		"main"
	],
	"./DoorChip": [
		"./src/chips/DoorChip.ts",
		"main"
	],
	"./DoorChip.ts": [
		"./src/chips/DoorChip.ts",
		"main"
	],
	"./FanChip": [
		"./src/chips/FanChip.ts",
		"main"
	],
	"./FanChip.ts": [
		"./src/chips/FanChip.ts",
		"main"
	],
	"./LightChip": [
		"./src/chips/LightChip.ts",
		"main"
	],
	"./LightChip.ts": [
		"./src/chips/LightChip.ts",
		"main"
	],
	"./LightControlChip": [
		"./src/chips/LightControlChip.ts"
	],
	"./LightControlChip.ts": [
		"./src/chips/LightControlChip.ts"
	],
	"./LinusAggregateChip": [
		"./src/chips/LinusAggregateChip.ts"
	],
	"./LinusAggregateChip.ts": [
		"./src/chips/LinusAggregateChip.ts"
	],
	"./LinusAlarmChip": [
		"./src/chips/LinusAlarmChip.ts",
		"main"
	],
	"./LinusAlarmChip.ts": [
		"./src/chips/LinusAlarmChip.ts",
		"main"
	],
	"./LinusClimateChip": [
		"./src/chips/LinusClimateChip.ts",
		"main"
	],
	"./LinusClimateChip.ts": [
		"./src/chips/LinusClimateChip.ts",
		"main"
	],
	"./LinusLightChip": [
		"./src/chips/LinusLightChip.ts",
		"main"
	],
	"./LinusLightChip.ts": [
		"./src/chips/LinusLightChip.ts",
		"main"
	],
	"./MotionChip": [
		"./src/chips/MotionChip.ts",
		"main"
	],
	"./MotionChip.ts": [
		"./src/chips/MotionChip.ts",
		"main"
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
		"./src/chips/SwitchChip.ts",
		"main"
	],
	"./SwitchChip.ts": [
		"./src/chips/SwitchChip.ts",
		"main"
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
	],
	"./WindowChip": [
		"./src/chips/WindowChip.ts",
		"main"
	],
	"./WindowChip.ts": [
		"./src/chips/WindowChip.ts",
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
	return __webpack_require__.e(ids[1]).then(() => {
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
/******/ 	var __webpack_exports__ = __webpack_require__("./src/mushroom-strategy.ts");
/******/ 	
/******/ })()
;
//# sourceMappingURL=linus-strategy.js.map