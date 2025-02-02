import { Helper } from "./Helper";
import { EntityRegistryEntry } from "./types/homeassistant/data/entity_registry";
import { generic } from "./types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import StrategyFloor = generic.StrategyFloor;
import StrategyArea = generic.StrategyArea;
import { ActionConfig, LovelaceCardConfig } from "./types/homeassistant/data/lovelace";
import { DEVICE_CLASSES, AGGREGATE_DOMAINS, GROUP_DOMAINS, LIGHT_DOMAIN, UNDISCLOSED, LIGHT_GROUPS, AREA_CARDS_DOMAINS } from "./variables";
import { LovelaceChipConfig } from "./types/lovelace-mushroom/utils/lovelace/chip/types";
import { chips } from "./types/strategy/chips";
import { ControllerCard } from "./cards/ControllerCard";
import { GroupedCard } from "./cards/GroupedCard";
import { LovelaceGridCardConfig } from "./types/homeassistant/lovelace/cards/types";

/**
 * Mémoïse une fonction pour éviter les calculs répétitifs.
 * @param {Function} fn - La fonction à mémoïser.
 * @returns {Function} - La fonction mémoïsée.
 */
function memoize(fn: Function): Function {
    const cache = new Map();
    return function (...args: any[]) {
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
export const groupBy = memoize(function groupBy<T, K extends string | number | symbol>(array: T[], fn: (item: T) => K): Record<K, T[]> {
    return array.reduce((result, item) => {
        const key = fn(item);
        if (!result[key]) {
            result[key] = [];
        }
        result[key].push(item);
        return result;
    }, {} as Record<K, T[]>);
});

/**
 * Converts a string to a slug format.
 * @param {string | null} text - The text to slugify.
 * @param {string} [separator="_"] - The separator to use.
 * @returns {string} - The slugified text.
 */
export const slugify = memoize(function slugify(text: string | null, separator: string = "_"): string {
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
export const getMagicAreaSlug = memoize(function getMagicAreaSlug(device: MagicAreaRegistryEntry): string {
    return slugify(device.name ?? "".replace('-', '_'));
});

/**
 * Get the state content for an entity.
 * @param {string} entity_id - The entity ID.
 * @returns {string} - The state content.
 */
export function getStateContent(entity_id: string): string {
    return entity_id.startsWith('binary_sensor.') ? 'last-changed' : 'state'
}

/**
 * Create an action config for navigation.
 * @param {string} path - The navigation path.
 * @returns {ActionConfig} - The action config.
 */
export function navigateTo(path: string): ActionConfig {
    return {
        action: "navigate",
        navigation_path: `${path}`,
    }
}

/**
 * Get aggregate entities for a device.
 * @param {MagicAreaRegistryEntry} device - The magic area device.
 * @param {string | string[]} domains - The domains to get entities for.
 * @param {string | string[]} [device_classes] - The device classes to get entities for.
 * @returns {EntityRegistryEntry[]} - The aggregate entities.
 */
export const getAggregateEntity = memoize(function getAggregateEntity(device: MagicAreaRegistryEntry, domains: string | string[], device_classes?: string | string[]): EntityRegistryEntry[] {
    const aggregateKeys: EntityRegistryEntry[] = [];
    const domainList = Array.isArray(domains) ? domains : [domains];
    const deviceClassList = Array.isArray(device_classes) ? device_classes : [device_classes];

    domainList.forEach(domain => {
        if (domain === "light") {
            Object.values(device?.entities ?? {}).forEach(entity => {
                if (entity.entity_id.endsWith('_lights')) {
                    aggregateKeys.push(entity);
                }
            });
        } else if (GROUP_DOMAINS.includes(domain)) {
            aggregateKeys.push(device?.entities[`${domain}_group` as 'cover_group']);
        } else if (AGGREGATE_DOMAINS.includes(domain)) {
            deviceClassList.forEach(device_class => {
                aggregateKeys.push(device?.entities[`aggregate_${device_class}` as 'aggregate_motion']);
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
export const getMAEntity = memoize(function getMAEntity(magic_device_id: string, domain: string, device_class?: string): EntityRegistryEntry | undefined {
    const magicAreaDevice = Helper.magicAreasDevices[magic_device_id];

    if (domain === LIGHT_DOMAIN) return magicAreaDevice?.entities?.[''] ?? magicAreaDevice?.entities?.['all_lights']
    if (GROUP_DOMAINS.includes(domain)) return magicAreaDevice?.entities?.[`${domain}_group${device_class ? `_${device_class}` : ''}` as 'cover_group']
    if (device_class && [...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor].includes(device_class)) return magicAreaDevice?.entities?.[`aggregate_${device_class}` as 'aggregate_motion']
    return magicAreaDevice?.entities?.[domain] ?? undefined
}) as (magic_device_id: string, domain: string, device_class?: string) => EntityRegistryEntry | undefined;

/**
 * Get the domain of an entity.
 * @param {string} entityId - The entity ID.
 * @returns {string} - The domain.
 */
export const getEntityDomain = memoize(function getEntityDomain(entityId: string): string {
    return entityId.split(".")[0];
});

/**
 * Group entities by domain.
 * @param {string[]} entity_ids - The entity IDs.
 * @returns {Record<string, string[]>} - The grouped entities.
 */
export const groupEntitiesByDomain = memoize(function groupEntitiesByDomain(entity_ids: string[]): Record<string, string[]> {
    return entity_ids.reduce((acc: Record<string, string[]>, entity_id) => {
        let domain = getEntityDomain(entity_id);
        if (Object.keys(DEVICE_CLASSES).includes(domain)) {
            const entityState = Helper.getEntityState(entity_id);
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
});

/**
 * Create chips from a list.
 * @param {string[]} chipsList - The list of chips.
 * @param {Partial<chips.AggregateChipOptions>} [chipOptions] - The chip options.
 * @param {string} [magic_device_id="global"] - The magic device ID.
 * @param {string | string[]} [area_slug] - The area slug.
 * @returns {Promise<LovelaceChipConfig[]>} - The created chips.
 */
export async function createChipsFromList(chipsList: string[], chipOptions?: Partial<chips.AggregateChipOptions>, magic_device_id: string = "global", area_slug?: string | string[]) {
    const chips: LovelaceChipConfig[] = [];
    const area_slugs = area_slug ? Array.isArray(area_slug) ? area_slug : [area_slug] : [];
    const domains = magic_device_id === "global"
        ? Object.keys(Helper.domains)
        : area_slugs.flatMap(area_slug => Object.keys(Helper.areas[area_slug]?.domains ?? {}));

    for (let chipType of chipsList) {
        if (Helper.linus_dashboard_config?.excluded_domains?.includes(chipType)) continue;
        if (Helper.linus_dashboard_config?.excluded_device_classes?.includes(chipType)) continue;
        if (!domains.includes(chipType)) continue;

        const className = Helper.sanitizeClassName(chipType + "Chip");

        try {
            let chipModule;
            if ([...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor].includes(chipType)) {
                chipModule = await import("./chips/AggregateChip");
                const chip = new chipModule.AggregateChip({ ...chipOptions, device_class: chipType, area_slug, magic_device_id, tap_action: navigateTo(chipType) });
                chips.push(chip.getChip());
            } else {
                chipModule = await import("./chips/" + className);
                const chip = new chipModule[className]({ ...chipOptions, area_slug });
                chips.push(chip.getChip());
            }
        } catch (e) {
            Helper.logError(`An error occurred while creating the ${chipType} chip!`, e);
        }
    }

    return chips;
}

/**
 * Get the translation key for a domain.
 * @param {string} domain - The domain.
 * @param {string} [device_class] - The device class.
 * @returns {string} - The translation key.
 */
export const getDomainTranslationKey = memoize(function getDomainTranslationKey(domain: string, device_class?: string) {
    if (domain === 'scene') return 'ui.dialogs.quick-bar.commands.navigation.scene'
    if (AGGREGATE_DOMAINS.includes(domain) && device_class) return `component.${domain}.entity_component.${device_class}.name`
    return `component.${domain}.entity_component._.name`
});

/**
 * Get the translation key for a state.
 * @param {string} state - The state.
 * @param {string} domain - The domain.
 * @param {string} [device_class] - The device class.
 * @returns {string} - The translation key.
 */
export const getStateTranslationKey = memoize(function getStateTranslationKey(state: string, domain: string, device_class?: string) {
    if (domain === 'scene') return 'ui.dialogs.quick-bar.commands.navigation.scene'
    if (AGGREGATE_DOMAINS.includes(domain)) return `component.${domain}.entity_component.${device_class}.state.${state}`
    return `component.${domain}.entity_component._.name`
});

/**
 * Get the name of a floor.
 * @param {StrategyFloor} floor - The floor.
 * @returns {string} - The floor name.
 */
export const getFloorName = memoize(function getFloorName(floor: StrategyFloor): string {
    return floor.floor_id === UNDISCLOSED ? Helper.localize("ui.components.area-picker.unassigned_areas") : floor.name!
});

/**
 * Get the name of an area.
 * @param {StrategyArea} area - The area.
 * @returns {string} - The area name.
 */
export const getAreaName = memoize(function getAreaName(area: StrategyArea): string {
    return area.area_id === UNDISCLOSED ? Helper.localize("ui.card.area.area_not_found") : area.name!
});

/**
 * Get global entities except undisclosed.
 * @param {string} device_class - The device class.
 * @returns {string[]} - The global entities.
 */
export const getGlobalEntitiesExceptUndisclosed = memoize(function getGlobalEntitiesExceptUndisclosed(device_class: string): string[] {
    return Helper.domains[device_class]?.filter(entity =>
        !Helper.areas[UNDISCLOSED].domains?.[device_class]?.includes(entity.entity_id)
    ).map(e => e.entity_id) ?? [];
}) as (device_class: string) => string[];

/**
 * Add light groups to entities.
 * @param {generic.StrategyArea} area - The area.
 * @param {generic.StrategyEntity[]} entities - The entities.
 * @returns {generic.StrategyEntity[]} - The entities with light groups added.
 */
export function addLightGroupsToEntities(area: generic.StrategyArea, entities: generic.StrategyEntity[]) {
    const lightGroups = LIGHT_GROUPS
        .map(type => getMAEntity(area.slug, type))
        .filter(Boolean);

    for (const lightGroup of lightGroups) {
        if (!lightGroup) continue;
        const lightGroupState = Helper.getEntityState(lightGroup.entity_id);
        if (lightGroupState.attributes.entity_id?.length) {
            entities.unshift(lightGroup as generic.StrategyEntity);
            lightGroupState.attributes.entity_id.forEach((entity_id: string) => {
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
export async function processFloorsAndAreas(
    domain: string,
    device_class: string | undefined,
    processEntities: (entities: any[], area: any, domain: string) => Promise<any[]>,
    viewControllerCard: LovelaceCardConfig[]
): Promise<LovelaceGridCardConfig[]> {
    const viewSections: LovelaceGridCardConfig[] = [];
    let isFirstLoop = true;

    const floors = Helper.orderedFloors;

    for (const floor of floors) {
        if (floor.areas_slug.length === 0 || !AREA_CARDS_DOMAINS.includes(domain ?? "")) continue;

        const floorCards = [];

        for (const area of floor.areas_slug.map(area_slug => Helper.areas[area_slug])) {
            let entities = Helper.getAreaEntities(area, device_class ?? domain);
            const className = Helper.sanitizeClassName(domain + "Card");
            const cardModule = await import(`./cards/${className}`);

            if (entities.length === 0 || !cardModule) continue;

            if (domain === "light") entities = addLightGroupsToEntities(area, entities);

            const entityCards = await processEntities(entities, area, domain);

            if (entityCards.length) {
                const areaCards = [new GroupedCard(entityCards).getCard()]
                const titleCardOptions = {
                    ...Helper.strategyOptions.domains[domain].controllerCardOptions,
                    subtitle: getAreaName(area),
                    subtitleIcon: area.area_id === UNDISCLOSED ? "mdi:help-circle" : area.icon ?? "mdi:floor-plan",
                    subtitleNavigate: area.slug
                } as any;
                if (domain) {
                    if (area.slug !== UNDISCLOSED && (!AGGREGATE_DOMAINS.includes(domain) || device_class)) {
                        titleCardOptions.showControls = Helper.strategyOptions.domains[domain].showControls;
                        titleCardOptions.extraControls = Helper.strategyOptions.domains[domain].extraControls;
                        titleCardOptions.controlChipOptions = { device_class, area_slug: area.slug }
                    } else {
                        titleCardOptions.showControls = false;
                    }
                }

                const areaControllerCard = new ControllerCard(titleCardOptions, domain, area.slug).createCard();

                floorCards.push(...areaControllerCard, ...areaCards);
            }
        }

        if (floorCards.length) {
            const titleSectionOptions: any = {
                ...Helper.strategyOptions.domains[domain].controllerCardOptions,
                title: getFloorName(floor),
                titleIcon: floor.icon ?? "mdi:floor-plan",
                titleNavigate: slugify(floor.name)
            };
            if (domain) {
                if (floor.floor_id !== UNDISCLOSED && (!AGGREGATE_DOMAINS.includes(domain) || device_class)) {
                    titleSectionOptions.showControls = Helper.strategyOptions.domains[domain].showControls;
                    titleSectionOptions.extraControls = Helper.strategyOptions.domains[domain].extraControls;
                    titleSectionOptions.controlChipOptions = {
                        device_class,
                        area_slug: floor.areas_slug
                    }
                } else {
                    titleSectionOptions.showControls = false;
                }
            }

            const floorControllerCard = floors.length > 1 ? new ControllerCard(
                titleSectionOptions,
                domain,
                floor.floor_id
            ).createCard() : [];

            const section = { type: "grid", cards: [] } as LovelaceGridCardConfig;
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