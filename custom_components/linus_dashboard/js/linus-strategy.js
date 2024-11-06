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
var _a, _Helper_entities, _Helper_devices, _Helper_areas, _Helper_hassStates, _Helper_initialized, _Helper_strategyOptions, _Helper_debug, _Helper_areaFilterCallback, _Helper_getObjectKeysByPropertyValue;


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
     * Get the entities from Home Assistant's area registry.
     *
     * @returns {StrategyArea[]}
     * @static
     */
    static get areas() {
        return __classPrivateFieldGet(this, _a, "f", _Helper_areas);
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
        __classPrivateFieldSet(this, _a, deepmerge__WEBPACK_IMPORTED_MODULE_1___default()(_configurationDefaults__WEBPACK_IMPORTED_MODULE_0__.configurationDefaults, info.config?.strategy?.options ?? {}), "f", _Helper_strategyOptions);
        __classPrivateFieldSet(this, _a, __classPrivateFieldGet(this, _a, "f", _Helper_strategyOptions).debug, "f", _Helper_debug);
        try {
            // Query the registries of Home Assistant.
            // noinspection ES6MissingAwait False positive? https://youtrack.jetbrains.com/issue/WEB-63746
            [({ set value(_b) { __classPrivateFieldSet(_a, _a, _b, "f", _Helper_entities); } }).value, ({ set value(_b) { __classPrivateFieldSet(_a, _a, _b, "f", _Helper_devices); } }).value, ({ set value(_b) { __classPrivateFieldSet(_a, _a, _b, "f", _Helper_areas); } }).value] = await Promise.all([
                info.hass.callWS({ type: "config/entity_registry/list" }),
                info.hass.callWS({ type: "config/device_registry/list" }),
                info.hass.callWS({ type: "config/area_registry/list" }),
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
     * @param {string} domain The domain of the entities.
     * @param {string} operator The Comparison operator between state and value.
     * @param {string} value The value to which the state is compared against.
     *
     * @return {string} The template string.
     * @static
     */
    static getCountTemplate(domain, operator, value) {
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
        return __classPrivateFieldGet(this, _a, "f", _Helper_entities).filter(__classPrivateFieldGet(this, _a, "m", _Helper_areaFilterCallback), {
            area: area,
            domain: domain,
            areaDeviceIds: areaDeviceIds,
        })
            .sort((a, b) => {
            return (a.original_name ?? "undefined").localeCompare(b.original_name ?? "undefined");
        });
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
}
_a = Helper, _Helper_areaFilterCallback = function _Helper_areaFilterCallback(entity) {
    const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
    const domainMatches = entity.entity_id.startsWith(`${this.domain}.`);
    const entityLinked = this.area.area_id === "undisclosed"
        // Undisclosed area;
        // nor the entity itself, neither the entity's linked device (if any) is linked to any area.
        ? !entity.area_id && (this.areaDeviceIds.includes(entity.device_id ?? "") || !entity.device_id)
        // Area is a hass entity;
        // The entity's linked device or the entity itself is linked to the given area.
        : this.areaDeviceIds.includes(entity.device_id ?? "") || entity.area_id === this.area.area_id;
    return (entityUnhidden && domainMatches && entityLinked);
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
 * An array of state entities from Home Assistant's Hass object.
 *
 * @type {HassEntities}
 * @private
 */
_Helper_hassStates = { value: void 0 };
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
            type: "custom:mushroom-entity-card",
            icon: "mdi:power-cycle",
            icon_color: "green",
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
            type: "custom:mushroom-climate-card",
            icon: undefined,
            hvac_modes: [
                "off",
                "cool",
                "heat",
                "fan_only",
            ],
            show_temperature_control: true,
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
            type: "mushroom-title-card",
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
        if (__classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").showControls) {
            cards.push({
                type: "horizontal-stack",
                cards: [
                    {
                        type: "custom:mushroom-template-card",
                        icon: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").iconOff,
                        layout: "vertical",
                        icon_color: "red",
                        tap_action: {
                            action: "call-service",
                            service: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").offService,
                            target: __classPrivateFieldGet(this, _ControllerCard_target, "f"),
                            data: {},
                        },
                    },
                    {
                        type: "custom:mushroom-template-card",
                        icon: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").iconOn,
                        layout: "vertical",
                        icon_color: "amber",
                        tap_action: {
                            action: "call-service",
                            service: __classPrivateFieldGet(this, _ControllerCard_defaultConfig, "f").onService,
                            target: __classPrivateFieldGet(this, _ControllerCard_target, "f"),
                            data: {},
                        },
                    },
                ],
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
            type: "custom:mushroom-cover-card",
            icon: undefined,
            show_buttons_control: true,
            show_position_control: true,
            show_tilt_position_control: true,
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
            type: "custom:mushroom-fan-card",
            icon: undefined,
            show_percentage_control: true,
            show_oscillate_control: true,
            icon_animation: true,
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

/***/ "./src/cards/InputSelectCard.ts":
/*!**************************************!*\
  !*** ./src/cards/InputSelectCard.ts ***!
  \**************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   InputSelectCard: () => (/* binding */ InputSelectCard)
/* harmony export */ });
/* harmony import */ var _SelectCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./SelectCard */ "./src/cards/SelectCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _InputSelectCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported
/**
 * InputSelect Card Class
 *
 * Used to create a card for controlling an entity of the input_select domain.
 *
 * @class
 * @extends AbstractCard
 */
class InputSelectCard extends _SelectCard__WEBPACK_IMPORTED_MODULE_0__.SelectCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.InputSelectCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(entity, options = {}) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {SelectCardConfig}
         * @private
         */
        _InputSelectCard_defaultConfig.set(this, {
            type: "custom:mushroom-select-card",
            icon: undefined,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _InputSelectCard_defaultConfig, "f"), options);
    }
}
_InputSelectCard_defaultConfig = new WeakMap();



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
/* harmony import */ var _types_strategy_generic__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../types/strategy/generic */ "./src/types/strategy/generic.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _LightCard_defaultConfig;


var isCallServiceActionConfig = _types_strategy_generic__WEBPACK_IMPORTED_MODULE_1__.generic.isCallServiceActionConfig;
var isCallServiceActionTarget = _types_strategy_generic__WEBPACK_IMPORTED_MODULE_1__.generic.isCallServiceActionTarget;
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
            type: "custom:mushroom-light-card",
            icon: undefined,
            show_brightness_control: true,
            show_color_control: true,
            show_color_temp_control: true,
            use_light_color: true,
            double_tap_action: {
                action: "call-service",
                service: "light.turn_on",
                target: {
                    entity_id: undefined,
                },
                data: {
                    rgb_color: [255, 255, 255],
                },
            },
        });
        // Set the target for double-tap action.
        if (isCallServiceActionConfig(__classPrivateFieldGet(this, _LightCard_defaultConfig, "f").double_tap_action)
            && isCallServiceActionTarget(__classPrivateFieldGet(this, _LightCard_defaultConfig, "f").double_tap_action.target)) {
            __classPrivateFieldGet(this, _LightCard_defaultConfig, "f").double_tap_action.target.entity_id = entity.entity_id;
        }
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
            type: "custom:mushroom-entity-card",
            icon_color: "blue-grey",
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

/***/ "./src/cards/SelectCard.ts":
/*!*********************************!*\
  !*** ./src/cards/SelectCard.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   SelectCard: () => (/* binding */ SelectCard)
/* harmony export */ });
/* harmony import */ var _AbstractCard__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./AbstractCard */ "./src/cards/AbstractCard.ts");
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _SelectCard_defaultConfig;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported
/**
 * Select Card Class
 *
 * Used to create a card for controlling an entity of the select domain.
 *
 * @class
 * @extends AbstractCard
 */
class SelectCard extends _AbstractCard__WEBPACK_IMPORTED_MODULE_0__.AbstractCard {
    /**
     * Class constructor.
     *
     * @param {EntityRegistryEntry} entity The hass entity to create a card for.
     * @param {cards.SelectCardOptions} [options={}] Options for the card.
     * @throws {Error} If the Helper module isn't initialized.
     */
    constructor(entity, options = {}) {
        super(entity);
        /**
         * Default configuration of the card.
         *
         * @type {SelectCardConfig}
         * @private
         */
        _SelectCard_defaultConfig.set(this, {
            type: "custom:mushroom-select-card",
            icon: undefined,
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _SelectCard_defaultConfig, "f"), options);
    }
}
_SelectCard_defaultConfig = new WeakMap();



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
            type: "custom:mushroom-entity-card",
            icon: undefined,
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
        _ClimateChip_defaultConfig.set(this, {
            type: "template",
            icon: "mdi:thermostat",
            icon_color: "orange",
            content: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate("climate", "ne", "off"),
            tap_action: {
                action: "none",
            },
            hold_action: {
                action: "navigate",
                navigation_path: "climates",
            },
        });
        this.config = Object.assign(this.config, __classPrivateFieldGet(this, _ClimateChip_defaultConfig, "f"), options);
    }
}
_ClimateChip_defaultConfig = new WeakMap();



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
                action: "none",
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
                action: "call-service",
                service: "switch.turn_off",
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
            ...{ entity: entityId },
            ...options,
        }, "f");
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
/**
 * Default configuration for the mushroom strategy.
 */
const configurationDefaults = {
    areas: {
        undisclosed: {
            aliases: [],
            area_id: "undisclosed",
            name: "Undisclosed",
            picture: null,
            hidden: false,
        }
    },
    debug: false,
    domains: {
        _: {
            hide_config_entities: false,
        },
        default: {
            title: "Miscellaneous",
            showControls: false,
            hidden: false,
        },
        light: {
            title: "Lights",
            showControls: true,
            iconOn: "mdi:lightbulb",
            iconOff: "mdi:lightbulb-off",
            onService: "light.turn_on",
            offService: "light.turn_off",
            hidden: false,
        },
        fan: {
            title: "Fans",
            showControls: true,
            iconOn: "mdi:fan",
            iconOff: "mdi:fan-off",
            onService: "fan.turn_on",
            offService: "fan.turn_off",
            hidden: false,
        },
        cover: {
            title: "Covers",
            showControls: true,
            iconOn: "mdi:arrow-up",
            iconOff: "mdi:arrow-down",
            onService: "cover.open_cover",
            offService: "cover.close_cover",
            hidden: false,
        },
        switch: {
            title: "Switches",
            showControls: true,
            iconOn: "mdi:power-plug",
            iconOff: "mdi:power-plug-off",
            onService: "switch.turn_on",
            offService: "switch.turn_off",
            hidden: false,
        },
        camera: {
            title: "Cameras",
            showControls: false,
            hidden: false,
        },
        lock: {
            title: "Locks",
            showControls: false,
            hidden: false,
        },
        climate: {
            title: "Climates",
            showControls: false,
            hidden: false,
        },
        media_player: {
            title: "Media Players",
            showControls: false,
            hidden: false,
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
        },
        select: {
            title: "Selects",
            showControls: false,
            hidden: false,
        },
        input_select: {
            title: "Input Selects",
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
        light: {
            order: 2,
            hidden: false,
        },
        fan: {
            order: 3,
            hidden: false,
        },
        cover: {
            order: 4,
            hidden: false,
        },
        switch: {
            order: 5,
            hidden: false,
        },
        climate: {
            order: 6,
            hidden: false,
        },
        camera: {
            order: 7,
            hidden: false,
        },
        vacuum: {
            order: 8,
            hidden: false,
        },
    }
};


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
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ../cards/ControllerCard */ "./src/cards/ControllerCard.ts");
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
        if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.isInitialized()) {
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
        const configEntityHidden = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[__classPrivateFieldGet(this, _AbstractView_domain, "f") ?? "_"].hide_config_entities
            || _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains["_"].hide_config_entities;
        // Create cards for each area.
        for (const area of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas) {
            const areaCards = [];
            const entities = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getDeviceEntities(area, __classPrivateFieldGet(this, _AbstractView_domain, "f") ?? "");
            const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(__classPrivateFieldGet(this, _AbstractView_domain, "f") + "Card");
            const cardModule = await __webpack_require__("./src/cards lazy recursive ^\\.\\/.*$")(`./${className}`);
            // Set the target for controller cards to the current area.
            let target = {
                area_id: [area.area_id],
            };
            // Set the target for controller cards to entities without an area.
            if (area.area_id === "undisclosed") {
                target = {
                    entity_id: entities.map(entity => entity.entity_id),
                };
            }
            // Create a card for each domain-entity of the current area.
            for (const entity of entities) {
                let cardOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id];
                let deviceOptions = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                if (cardOptions?.hidden || deviceOptions?.hidden) {
                    continue;
                }
                if (entity.entity_category === "config" && configEntityHidden) {
                    continue;
                }
                areaCards.push(new cardModule[className](entity, cardOptions).getCard());
            }
            // Vertical stack the area cards if it has entities.
            if (areaCards.length) {
                const titleCardOptions = ("controllerCardOptions" in this.config) ? this.config.controllerCardOptions : {};
                // Create and insert a Controller card.
                areaCards.unshift(new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_1__.ControllerCard(target, Object.assign({ title: area.name }, titleCardOptions)).createCard());
                viewCards.push({
                    type: "vertical-stack",
                    cards: areaCards,
                });
            }
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
            entity_id: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.entities.filter(entity => entity.entity_id.startsWith(domain + ".")
                && !entity.hidden_by
                && !_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden).map(entity => entity.entity_id),
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
            title: "All Cameras",
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_2__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _CameraView_domain), "ne", "off") + " cameras on",
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
            title: "All Climates",
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _ClimateView_domain), "ne", "off") + " climates on",
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
            title: "All Covers",
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _CoverView_domain), "eq", "open") + " covers open",
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
            title: "All Fans",
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _FanView_domain), "eq", "on") + " fans on",
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
var __classPrivateFieldGet = (undefined && undefined.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _HomeView_instances, _HomeView_defaultConfig, _HomeView_createChips, _HomeView_createPersonCards, _HomeView_createAreaSection;


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
                homeViewCards.push({
                    type: "custom:mushroom-template-card",
                    primary: "{% set time = now().hour %} {% if (time >= 18) %} Good Evening, {{user}}! {% elif (time >= 12) %} Good Afternoon, {{user}}! {% elif (time >= 5) %} Good Morning, {{user}}! {% else %} Hello, {{user}}! {% endif %}",
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
    const exposedChips = ["light", "fan", "cover", "switch", "climate"];
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
    // Numeric chips.
    for (let chipType of exposedChips) {
        if (chipOptions?.[`${chipType}_count`] ?? true) {
            const className = _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.sanitizeClassName(chipType + "Chip");
            try {
                chipModule = await __webpack_require__("./src/chips lazy recursive ^\\.\\/.*$")(`./${className}`);
                const chip = new chipModule[className]();
                chip.setTapActionTarget({ area_id: areaIds });
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
    let areaCards = [];
    if (!_Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.home_view.hidden.includes("areasTitle")) {
        groupedCards.push({
            type: "custom:mushroom-title-card",
            title: "Areas",
        });
    }
    for (const [i, area] of _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas.entries()) {
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
        if (i === _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.areas.length - 1) {
            for (let i = 0; i < areaCards.length; i += 2) {
                groupedCards.push({
                    type: "horizontal-stack",
                    cards: areaCards.slice(i, i + 2),
                });
            }
        }
    }
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
            title: "Lights",
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
            title: "All Lights",
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _LightView_domain), "eq", "on") + " lights on",
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
            title: "All Switches",
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
            title: "All Vacuums",
            subtitle: _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.getCountTemplate(__classPrivateFieldGet(_a, _a, "f", _VacuumView_domain), "ne", "off") + " vacuums on",
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
	"./InputSelectCard": [
		"./src/cards/InputSelectCard.ts",
		"main"
	],
	"./InputSelectCard.ts": [
		"./src/cards/InputSelectCard.ts",
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
	"./SelectCard": [
		"./src/cards/SelectCard.ts",
		"main"
	],
	"./SelectCard.ts": [
		"./src/cards/SelectCard.ts",
		"main"
	],
	"./SensorCard": [
		"./src/cards/SensorCard.ts"
	],
	"./SensorCard.ts": [
		"./src/cards/SensorCard.ts"
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
		"./src/chips/AbstractChip.ts",
		"main"
	],
	"./AbstractChip.ts": [
		"./src/chips/AbstractChip.ts",
		"main"
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
	"./SwitchChip": [
		"./src/chips/SwitchChip.ts",
		"main"
	],
	"./SwitchChip.ts": [
		"./src/chips/SwitchChip.ts",
		"main"
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
	return __webpack_require__.e(ids[1]).then(() => {
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
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
/*!**********************************!*\
  !*** ./src/mushroom-strategy.ts ***!
  \**********************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _Helper__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./Helper */ "./src/Helper.ts");
/* harmony import */ var _cards_SensorCard__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./cards/SensorCard */ "./src/cards/SensorCard.ts");
/* harmony import */ var _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./cards/ControllerCard */ "./src/cards/ControllerCard.ts");



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
                    path: area.area_id ?? area.name,
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
                    // Set the target for controller cards to entities without an area.
                    if (area.area_id === "undisclosed") {
                        target = {
                            entity_id: entities.map(entity => entity.entity_id),
                        };
                    }
                    if (entities.length) {
                        // Create a Controller card for the current domain.
                        const titleCard = new _cards_ControllerCard__WEBPACK_IMPORTED_MODULE_2__.ControllerCard(target, _Helper__WEBPACK_IMPORTED_MODULE_0__.Helper.strategyOptions.domains[domain]).createCard();
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
                                domainCards.push({
                                    type: "vertical-stack",
                                    cards: sensorCards,
                                });
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
                        if (domain === "binary_sensor") {
                            // Horizontally group every two binary sensor cards.
                            const horizontalCards = [];
                            for (let i = 0; i < domainCards.length; i += 2) {
                                horizontalCards.push({
                                    type: "horizontal-stack",
                                    cards: domainCards.slice(i, i + 2),
                                });
                            }
                            domainCards = horizontalCards;
                        }
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
                            miscellaneousCards.push(new cardModule.MiscellaneousCard(entity, cardOptions).getCard());
                        }
                        return miscellaneousCards;
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
const version = "v2.1.0";
console.info("%c Mushroom Strategy %c ".concat(version, " "), "color: white; background: coral; font-weight: 700;", "color: coral; background: white; font-weight: 700;");

})();

/******/ })()
;
//# sourceMappingURL=linus-strategy.js.map