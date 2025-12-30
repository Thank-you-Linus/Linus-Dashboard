import { Helper } from "./Helper";
import { EntityRegistryEntry } from "./types/homeassistant/data/entity_registry";
import { generic } from "./types/strategy/generic";
import { ActionConfig, LovelaceCardConfig } from "./types/homeassistant/data/lovelace";
import {
    DEVICE_CLASSES,
    AGGREGATE_DOMAINS,
    LIGHT_DOMAIN,
    GROUP_DOMAINS,
    UNDISCLOSED,
    AREA_CARDS_DOMAINS,
    LIGHT_GROUPS
} from "./variables";
import { LovelaceChipConfig } from "./types/lovelace-mushroom/utils/lovelace/chip/types";
import { chips } from "./types/strategy/chips";
import { ControllerCard } from "./cards/ControllerCard";
import { GroupedCard } from "./cards/GroupedCard";
import { LovelaceGridCardConfig } from "./types/homeassistant/lovelace/cards/types";
import { ResourceKeys } from "./types/homeassistant/data/frontend";
import { EntityCardConfig } from "./types/lovelace-mushroom/cards/entity-card-config";
import { ImageAreaCard } from "./cards/ImageAreaCard";
import { AggregateChip } from "./chips/AggregateChip";
import { AggregateCard } from "./cards/AggregateCard";
import { CardFactory } from "./factories/CardFactory";

import StrategyArea = generic.StrategyArea;
import StrategyFloor = generic.StrategyFloor;
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;

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
export const slugify = memoize(function slugify(text: string | null, separator = "_"): string {
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
 * Retourne les entités agrégées pour un device magic area, un ou plusieurs domaines et device_classes.
 * @param {any} device - Le device magic area.
 * @param {string | string[]} domains - Un ou plusieurs domaines.
 * @param {string | string[]} [device_classes] - Un ou plusieurs device_classes.
 * @returns {any[]} - Les entités agrégées trouvées.
 */
export function getAggregateEntity(device: any, domains: string | string[], device_classes?: string | string[]): any[] {
    if (!device || !device.entities) return [];
    const domainsArr = Array.isArray(domains) ? domains : [domains];
    const deviceClassesArr = device_classes ? (Array.isArray(device_classes) ? device_classes : [device_classes]) : [undefined];
    const aggregateEntities: any[] = [];
    for (const domain of domainsArr) {
        for (const device_class of deviceClassesArr) {
            if (device_class) {
                const key = `aggregate_${device_class}`;
                if (device.entities[key]) aggregateEntities.push(device.entities[key]);
            } else if (device.entities[domain]) {
                aggregateEntities.push(device.entities[domain]);
            }
        }
    }
    return aggregateEntities.filter(Boolean);
}

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
export const getEntityDomain = memoize(function getEntityDomain(entityId: string): string | undefined {
    return entityId.split(".")[0];
});

/**
 * Group entities by domain.
 * @param {string[]} entity_ids - The entity IDs.
 * @returns {Record<string, string[]>} - The grouped entities.
 */
export const groupEntitiesByDomain = memoize(function groupEntitiesByDomain(entity_ids: string[]): Record<string, string[]> {
    const grouped = entity_ids.reduce((acc: Record<string, string[]>, entity_id) => {
        const domain = getEntityDomain(entity_id);
        let device_class
        if (Object.keys(DEVICE_CLASSES).includes(domain)) {
            const entityState = Helper.getEntityState(entity_id);
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

    // Trier chaque groupe pour placer les entités unavailable/unknown à la fin
    Object.keys(grouped).forEach(domainTag => {
        const entities = grouped[domainTag];
        if (entities) {
            entities.sort((a, b) => {
                const stateA = Helper.getEntityState(a)?.state;
                const stateB = Helper.getEntityState(b)?.state;

                const isUnavailableA = stateA === "unavailable" || stateA === "unknown";
                const isUnavailableB = stateB === "unavailable" || stateB === "unknown";

                if (isUnavailableA && !isUnavailableB) return 1;
                if (!isUnavailableA && isUnavailableB) return -1;

                return 0;
            });
        }
    });

    return grouped;
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
async function createItemsFromList(
    itemList: string[],
    itemOptions?: Partial<chips.AggregateChipOptions> | Partial<generic.StrategyEntity>,
    magic_device_id = "global",
    area_slug?: string | string[],
    isChip = true
): Promise<LovelaceChipConfig[] | LovelaceCardConfig[]> {
    const items: (LovelaceChipConfig | LovelaceCardConfig)[] = [];
    const area_slugs = area_slug ? Array.isArray(area_slug) ? area_slug : [area_slug] : [];
    const domains = magic_device_id === "global"
        ? Object.keys(Helper.domains)
        : area_slugs.flatMap(area_slug => Object.keys(Helper.areas[area_slug]?.domains ?? {}));

    for (const itemType of itemList) {
        let domain = itemType;
        let device_class: string | undefined;

        if (itemType.includes(":")) {
            [domain, device_class] = itemType.split(":");
        }

        if (Helper.linus_dashboard_config?.excluded_domains?.includes(domain)) continue;
        if (device_class && Helper.linus_dashboard_config?.excluded_device_classes?.includes(device_class)) continue;
        if (!domains.includes(domain)) continue;

        if (getGlobalEntitiesExceptUndisclosed(domain, device_class).length === 0) continue;
        
        // For area-specific chips, check if the area has entities for this domain/device_class
        if (area_slug && magic_device_id !== "global") {
            const hasAreaEntities = area_slugs.some(slug => {
                const area = Helper.areas[slug];
                if (!area) return false;
                const entities = Helper.getAreaEntities(area, domain, device_class);
                return entities && entities.length > 0;
            });
            if (!hasAreaEntities) continue;
        }
        
        // For area-specific chips, check if the area has entities for this domain/device_class
        if (area_slug && magic_device_id !== "global") {
            const hasAreaEntities = area_slugs.some(slug => {
                const area = Helper.areas[slug];
                if (!area) return false;
                const entities = Helper.getAreaEntities(area, domain, device_class);
                return entities && entities.length > 0;
            });
            if (!hasAreaEntities) continue;
        }
        const magicAreasEntity = getMAEntity(magic_device_id, domain, device_class);
        const className = Helper.sanitizeClassName(device_class ?? domain + (isChip ? "Chip" : "Card"));

        try {
            let itemModule;
            let item;
            try {
                itemModule = await import(`./${isChip ? "chips" : "cards"}/${className}`);
                item = new itemModule[className]({ ...itemOptions, device_class, magic_device_id, area_slug }, magicAreasEntity);
            } catch {
                if (isChip) {
                    // Filter out icon property to let AggregateChip calculate it
                    const chipOptions: any = { ...itemOptions };
                    delete chipOptions.icon;
                    
                    item = new AggregateChip({
                        ...chipOptions,
                        domain,
                        device_class,
                        area_slug,
                        magic_device_id
                    });
                } else {
                    item = new AggregateCard({
                        ...itemOptions,
                        domain,
                        device_class,
                        area_slug,
                        magic_device_id,
                        tap_action: navigateTo(domain === "binary_sensor" || domain === "sensor" ? device_class ?? domain : domain)
                    });
                }
            }
            items.push(isChip ? item.getChip() : item.getCard());
        } catch (e) {
            Helper.logError(`An error occurred while creating the ${itemType} chip!`, e);
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
export async function createChipsFromList(
    chipsList: string[],
    chipOptions?: Partial<chips.AggregateChipOptions>,
    magic_device_id = "global",
    area_slug?: string | string[]
): Promise<LovelaceChipConfig[]> {
    return createItemsFromList(chipsList, chipOptions, magic_device_id, area_slug, true) as Promise<LovelaceChipConfig[]>;
}

/**
 * Create cards from a list.
 * @param {string[]} cardsList - The list of cards.
 * @param {Partial<generic.StrategyEntity>} [cardOptions] - The card options.
 * @param {string} [magic_device_id="global"] - The magic device ID.
 * @param {string | string[]} [area_slug] - The area slug.
 * @returns {Promise<LovelaceCardConfig[]>} - The created cards.
 */
export async function createCardsFromList(
    cardsList: string[],
    cardOptions?: Partial<generic.StrategyEntity>,
    magic_device_id = "global",
    area_slug?: string | string[]
): Promise<LovelaceCardConfig[]> {
    return createItemsFromList(cardsList, cardOptions, magic_device_id, area_slug, false) as Promise<LovelaceCardConfig[]>;
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
    return floor.floor_id === UNDISCLOSED ? Helper.localize("ui.components.area-picker.unassigned_areas") : floor.name
});

/**
 * Get the name of an area.
 * @param {StrategyArea} area - The area.
 * @returns {string} - The area name.
 */
export const getAreaName = memoize(function getAreaName(area: StrategyArea): string {
    return area.area_id === UNDISCLOSED ? Helper.localize("ui.card.area.area_not_found") : area.name
});

/**
 * Get global entities except undisclosed.
 * @param {string} device_class - The device class.
 * @returns {string[]} - The global entities.
 */
export const getGlobalEntitiesExceptUndisclosed = memoize(function getGlobalEntitiesExceptUndisclosed(domain: string, device_class?: string): string[] {
    const dc = domain === "binary_sensor" || domain === "sensor" || domain === "cover" ? device_class : undefined;
    const domainTag = `${domain}${dc ? ":" + dc : ""}`;
    const entities = (domain === "cover" && !device_class
        ? [
            ...(Helper.domains["cover"] ?? []),  // Covers WITHOUT device_class
            ...DEVICE_CLASSES.cover.flatMap(d => Helper.domains[`cover:${d}`] ?? [])  // Covers WITH device_class
          ]
        : domain === "sensor" && !device_class
        ? [
            ...(Helper.domains["sensor"] ?? []),  // Sensors WITHOUT device_class
            ...DEVICE_CLASSES.sensor.flatMap(d => Helper.domains[`sensor:${d}`] ?? [])  // Sensors WITH device_class
          ]
        : domain === "binary_sensor" && !device_class
        ? [
            ...(Helper.domains["binary_sensor"] ?? []),  // Binary sensors WITHOUT device_class
            ...DEVICE_CLASSES.binary_sensor.flatMap(d => Helper.domains[`binary_sensor:${d}`] ?? [])  // Binary sensors WITH device_class
          ]
        : Helper.domains[domainTag] ?? []);

    // Filter out entities in UNDISCLOSED area
    return entities?.filter(entity => {
        // For AGGREGATE_DOMAINS without device_class, check against all possible domainTags
        if (AGGREGATE_DOMAINS.includes(domain) && !device_class) {
            // Check base domain (e.g., "cover")
            if (Helper.areas[UNDISCLOSED]?.domains?.[domain]?.includes(entity.entity_id)) {
                return false;
            }
            // Check all device_class variants (e.g., "cover:blind", "cover:curtain", etc.)
            const deviceClasses = DEVICE_CLASSES[domain as keyof typeof DEVICE_CLASSES] ?? [];
            for (const dc of deviceClasses) {
                if (Helper.areas[UNDISCLOSED]?.domains?.[`${domain}:${dc}`]?.includes(entity.entity_id)) {
                    return false;
                }
            }
            return true;
        }
        // For other cases, use simple filter
        return !Helper.areas[UNDISCLOSED]?.domains?.[domainTag]?.includes(entity.entity_id);
    }).map(e => e.entity_id) ?? [];
}) as (domain: string, device_class?: string) => string[];

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
    processEntities: (entities: any[]) => Promise<any[]>,
    viewControllerCard: LovelaceCardConfig[]
): Promise<LovelaceGridCardConfig[]> {
    const viewSections: LovelaceGridCardConfig[] = [];
    let isFirstLoop = true;

    const floors = Helper.orderedFloors;

    for (const floor of floors) {
        if (floor.areas_slug.length === 0 || !AREA_CARDS_DOMAINS.includes(domain ?? "")) continue;

        const floorCards = [];

        for (const area of floor.areas_slug.map(area_slug => Helper.areas[area_slug])) {
            if (!area) continue;
            let entities = Helper.getAreaEntities(area, domain, device_class);

            if (entities.length === 0) continue;

            if (domain === "light") entities = addLightGroupsToEntities(area, entities);

            const entityCards = await processEntities(entities);

            if (entityCards.length) {
                const areaCards = [new GroupedCard(entityCards).getCard()]
                const titleCardOptions: any = {
                    subtitle: getAreaName(area),
                    subtitleIcon: area.area_id === UNDISCLOSED ? "mdi:help-circle" : area.icon ?? "mdi:floor-plan",
                    subtitleNavigate: area.slug
                };
                if (domain) {
                    if (area.slug !== UNDISCLOSED) {
                        // Always pass showControls and extraControls to ControllerCard
                        titleCardOptions.showControls = Helper.strategyOptions.domains[domain]?.showControls;
                        titleCardOptions.extraControls = Helper.strategyOptions.domains[domain]?.extraControls;
                        
                        // Always create controlChipOptions
                        titleCardOptions.controlChipOptions = { device_class, area_slug: area.slug };
                        
                        // Disable chips for sensor/binary_sensor (too many device_classes)
                        if (domain === "sensor" || domain === "binary_sensor") {
                            titleCardOptions.showControls = false;
                        }
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
                title: getFloorName(floor),
                titleIcon: floor.icon ?? "mdi:floor-plan",
                titleNavigate: floor.floor_id
            };
            if (domain) {
                if (floor.floor_id !== UNDISCLOSED) {
                    // Always pass showControls and extraControls to ControllerCard
                    titleSectionOptions.showControls = Helper.strategyOptions.domains[domain]?.showControls;
                    
                    // Disable chips for sensor/binary_sensor (too many device_classes)
                    if (domain === "sensor" || domain === "binary_sensor") {
                        titleSectionOptions.showControls = false;
                    }
                    
                    titleSectionOptions.extraControls = Helper.strategyOptions.domains[domain]?.extraControls;
                    
                    // Always create controlChipOptions
                    titleSectionOptions.controlChipOptions = {
                        device_class,
                        scope: "floor",
                        floor_id: floor.floor_id
                    };
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

/**
 * Process entities for a view based on domain and device class.
 * @param {string} domain - The domain of the entities.
 * @param {string} [device_class] - The device class of the entities.
 * @param {LovelaceCardConfig[]} viewControllerCard - Array of view controller cards.
 * @returns {Promise<LovelaceGridCardConfig[]>} - Promise resolving to an array of view sections.
 */
export async function processEntitiesForView(
    domain: string,
    device_class: string | undefined,
    viewControllerCard: LovelaceCardConfig[]
): Promise<LovelaceGridCardConfig[]> {
    return processFloorsAndAreas(domain, device_class, processEntities, viewControllerCard);
}

/**
 * Process entities for an area or floor view.
 * @param {object} params - The parameters object.
 * @param {StrategyArea} [params.area] - The area to process entities for.
 * @param {StrategyFloor} [params.floor] - The floor to process entities for.
 * @returns {Promise<LovelaceGridCardConfig[]>} - Promise resolving to an array of view sections.
 */
export async function processEntitiesForAreaOrFloorView({
    area,
    floor,
}: {
    area?: StrategyArea;
    floor?: StrategyFloor;
}): Promise<LovelaceGridCardConfig[]> {
    const viewSections: LovelaceGridCardConfig[] = [];
    const exposedDomainIds = Helper.getExposedDomainIds();
    const isFloorView = !!floor;

    const areas = isFloorView ? floor.areas_slug.map(slug => Helper.areas[slug]) : [area!];

    const domainCardsMap: Record<string, EntityCardConfig[]> = {};
    const miscellaneousEntities: string[] = [];

    for (const area of areas) {
        if (!area) continue;
        // Create global section card if area is not undisclosed
        if (!isFloorView && area.area_id !== UNDISCLOSED && area.picture) {
            viewSections.push({
                type: "grid",
                column_span: 1,
                cards: new ImageAreaCard(area.area_id).getCard(),
            });
        }

        for (const domain of exposedDomainIds) {
            if (Helper.linus_dashboard_config?.excluded_domains?.includes(domain)) continue;
            if (Helper.linus_dashboard_config?.excluded_device_classes?.includes(domain)) continue;
            if (domain === "default") continue;


            try {
                const domainOptions = Helper.strategyOptions.domains?.[domain] ?? {};
                let entities = Helper.getAreaEntities(area, domain) ?? [];
                if (entities.length) {
                    if (!domainCardsMap[domain]) {
                        domainCardsMap[domain] = [];

                        if (isFloorView) {
                            const floorTitleCardOptions: any = {
                                title: Helper.localize(getDomainTranslationKey(domain)),
                                domain,
                                titleIcon: Helper.icons[domain as ResourceKeys]?._?.default,
                                titleNavigate: domain,
                            };

                            if (domain) {
                                // Apply same logic for ALL domains (aggregate or not)
                                floorTitleCardOptions.showControls = domainOptions.showControls ?? false;
                                floorTitleCardOptions.extraControls = domainOptions.extraControls ?? [];
                                floorTitleCardOptions.controlChipOptions = { area_slug: area.slug };
                                
                                // Disable chips for sensor/binary_sensor (too many device_classes)
                                if (domain === "sensor" || domain === "binary_sensor") {
                                    floorTitleCardOptions.showControls = false;
                                }
                            }

                            const floorTitleCard = new ControllerCard(floorTitleCardOptions, domain, area.slug).createCard();
                            domainCardsMap[domain].push(...floorTitleCard);
                        }
                    }

                    const titleCardOptions: any = {
                        ...(isFloorView ? {
                            subtitle: area.name,
                            subtitleIcon: area.icon ?? "mdi:floor-plan",
                            subtitleNavigate: area.slug,
                        } : {
                            title: Helper.localize(getDomainTranslationKey(domain)),
                            titleIcon: Helper.icons[domain as ResourceKeys]?._?.default,
                            titleNavigate: domain,
                        }),
                        domain,
                    };

                    if (domain) {
                        // Apply same logic for ALL domains (aggregate or not)
                        titleCardOptions.showControls = domainOptions.showControls ?? false;
                        titleCardOptions.extraControls = domainOptions.extraControls ?? [];
                        titleCardOptions.controlChipOptions = { area_slug: area.slug };
                        
                        // Disable chips for sensor/binary_sensor (too many device_classes)
                        if (domain === "sensor" || domain === "binary_sensor") {
                            titleCardOptions.showControls = false;
                        }
                    }

                    const titleCard = new ControllerCard(titleCardOptions, domain, area.slug).createCard();

                    if (domain === "light") entities = addLightGroupsToEntities(area, entities);

                    let entityCards: any[] = [];
                    if (domain === "sensor") {
                        // Regroupe par device_class
                        const byDeviceClass: Record<string, any[]> = {};
                        for (const entity of entities) {
                            const entityState = Helper.getEntityState(entity.entity_id);
                            const deviceClass = entityState?.attributes?.device_class || "_";
                            if (!byDeviceClass[deviceClass]) byDeviceClass[deviceClass] = [];
                            byDeviceClass[deviceClass].push(entity);
                        }
                        for (const deviceClass in byDeviceClass) {
                            const cards = await processEntities(byDeviceClass[deviceClass] ?? []);
                            entityCards.push(...cards);
                        }
                    } else {
                        entityCards = await processEntities(entities);
                    }

                    if (entityCards.length) {
                        domainCardsMap[domain].push(...titleCard);
                        domainCardsMap[domain].push(new GroupedCard(entityCards).getCard());
                    }
                }
            } catch (e) {
                Helper.logError("An error occurred while creating the domain cards!", e);
            }
        }

        const areaDevices = Array.isArray(area.devices)
            ? area.devices.filter(device_id => Helper.devices?.[device_id]?.area_id === area.area_id)
            : [];
        const areaEntities = Array.isArray(area.entities)
            ? area.entities.filter(entity_id => {
                const entity = Helper.entities?.[entity_id];
                if (!entity) return false;
                const entityLinked = areaDevices.includes(entity.device_id ?? "null") || entity.area_id === area.area_id;
                const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
                const domainExposed = exposedDomainIds.includes((entity.entity_id ?? '').split(".", 1)[0] ?? "");
                return entityUnhidden && !domainExposed && entityLinked;
            })
            : [];
        miscellaneousEntities.push(...areaEntities);
    }

    for (const domain in domainCardsMap) {
        if (!domainCardsMap[domain]?.length) continue;
        viewSections.push({
            type: "grid",
            column_span: 1,
            cards: domainCardsMap[domain],
        });
    }

    // Handle default domain if not hidden
    if (!(Helper.strategyOptions.domains?.default?.hidden ?? true) && miscellaneousEntities.length) {
        try {
            const miscellaneousEntityCards = (await Promise.all(
                miscellaneousEntities
                    .filter(entity_id => {
                        const entity = Helper.entities[entity_id];
                        const cardOptions = Helper.strategyOptions.card_options?.[entity?.entity_id];
                        const deviceOptions = Helper.strategyOptions.card_options?.[entity?.device_id ?? "null"];
                        return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity?.entity_category === "config" && Helper.strategyOptions.domains["_"]?.hide_config_entities);
                    })
                    .map(async entity_id => {
                        const options = Helper.strategyOptions.card_options?.[entity_id];
                        const entity = Helper.entities[entity_id];
                        return await CardFactory.createCardByName("MiscellaneousCard", options, entity);
                    })
            )).filter((card): card is LovelaceCardConfig => card !== null);

            const miscellaneousCards = new GroupedCard(miscellaneousEntityCards).getCard();

            const titleCard = {
                type: "heading",
                heading: Helper.localize("ui.panel.lovelace.editor.card.generic.other_cards"),
                heading_style: "title",
                icon: "mdi:dots-horizontal",
                badges: [],
            };

            viewSections.push({
                type: "grid",
                column_span: 1,
                cards: [titleCard, miscellaneousCards],
            });
        } catch (e) {
            Helper.logError("An error occurred while creating the domain cards!", e);
        }
    }

    return viewSections;
}

/**
 * Process entities for a view.
 * @param {any[]} entities - The entities to process.
 * @param {any} area - The area of the entities.
 * @param {string} domain - The domain of the entities.
 * @param {string} [device_class] - The device class of the entities.
 * @returns {Promise<any[]>} - Promise resolving to an array of cards.
 */
async function processEntities(entities: any[]): Promise<any[]> {
    const cards: any[] = [];
    for (const entity of entities) {
        const state = Helper.getEntityState(entity.entity_id);
        const entityDomain = state?.entity_id?.split(".")[0];
        const domainOptions = entityDomain && Helper.strategyOptions.domains ? Helper.strategyOptions.domains[entityDomain] : undefined;
        const configEntityHidden = (domainOptions?.hide_config_entities ?? false) || (Helper.strategyOptions.domains?.["_"]?.hide_config_entities ?? false);
        if (Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden) continue;
        if (Helper.strategyOptions.card_options?.[entity.device_id ?? "null"]?.hidden) continue;
        if (entity.entity_category === "config" && configEntityHidden) continue;

        // Use CardFactory for consistent card creation with automatic fallback
        const card = await CardFactory.createCard(entity, {});
        if (card) {
            cards.push(card);
        }
    }
    return cards;
}