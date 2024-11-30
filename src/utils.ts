import { Helper } from "./Helper";
import { EntityRegistryEntry } from "./types/homeassistant/data/entity_registry";
import { generic } from "./types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import StrategyFloor = generic.StrategyFloor;
import StrategyArea = generic.StrategyArea;
import { ActionConfig } from "./types/homeassistant/data/lovelace";
import { DEVICE_CLASSES, AGGREGATE_DOMAINS, GROUP_DOMAINS, LIGHT_DOMAIN, UNDISCLOSED } from "./variables";
import { LovelaceChipConfig } from "./types/lovelace-mushroom/utils/lovelace/chip/types";
import { UnavailableChip } from "./chips/UnavailableChip";
import { chips } from "./types/strategy/chips";

/**
 * Groups the elements of an array based on a provided function
 * @param {T[]} array - The array to group
 * @param {(item: T) => K} fn - The function to determine the group key for each element
 * @returns {Record<K, T[]>} - An object where the keys are the group identifiers and the values are arrays of grouped elements
 */
export function groupBy<T, K extends string | number | symbol>(array: T[], fn: (item: T) => K): Record<K, T[]> {
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
    }, {} as Record<K, T[]>);
}

export function slugify(text: string | null, separator: string = "_"): string {
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

export function getMagicAreaSlug(device: MagicAreaRegistryEntry): string {
    return slugify(device.name ?? "".replace('-', '_'));
}

export function getStateContent(entity_id: string): string {
    return entity_id.startsWith('binary_sensor.') ? 'last-changed' : 'state'
}

export function navigateTo(path: string): ActionConfig {
    return {
        action: "navigate",
        navigation_path: `${path}`,
    }
}

export function getAggregateEntity(device: MagicAreaRegistryEntry, domains: string | string[], device_classes?: string | string[]): EntityRegistryEntry[] {

    const aggregateKeys = []

    for (const domain of Array.isArray(domains) ? domains : [domains]) {

        if (domain === "light") {
            Object.values(device?.entities ?? {})?.map(entity => {
                if (entity.entity_id.endsWith('_lights')) {
                    aggregateKeys.push(entity)
                }
            })
        }

        if (GROUP_DOMAINS.includes(domain)) {
            aggregateKeys.push(device?.entities[`${domain}_group` as 'cover_group'])
        }

        if (AGGREGATE_DOMAINS.includes(domain)) {
            for (const device_class of Array.isArray(device_classes) ? device_classes : [device_classes]) {
                aggregateKeys.push(device?.entities[`aggregate_${device_class}` as 'aggregate_motion'])
            }

        }
    }

    return aggregateKeys.filter(Boolean)
}

export function getMAEntity(magic_device_id: string, domain: string, device_class?: string): EntityRegistryEntry | undefined {
    const magicAreaDevice = Helper.magicAreasDevices[magic_device_id];

    // TODO remove '' when new release
    if (domain === LIGHT_DOMAIN) return magicAreaDevice?.entities?.[''] ?? magicAreaDevice?.entities?.['all_lights']
    if (GROUP_DOMAINS.includes(domain)) return magicAreaDevice?.entities?.[`${domain}_group` as 'cover_group']
    if (device_class && [...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor].includes(device_class)) return magicAreaDevice?.entities?.[`aggregate_${device_class}` as 'aggregate_motion']
    return undefined
}

export function groupEntitiesByDomain(entity_ids: string[]): Record<string, string[]> {
    return entity_ids
        .reduce((acc: Record<string, string[]>, entity_id) => {
            let domain = entity_id.split(".")[0];

            if (Object.keys(DEVICE_CLASSES).includes(domain)) {
                const entityState = Helper.getEntityState(entity_id);

                if (entityState?.attributes?.device_class) {
                    domain = entityState.attributes.device_class
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
export async function createChipsFromList(chipsList: string[], chipOptions?: Partial<chips.AggregateChipOptions>, magic_device_id: string = "global", area_slug?: string | string[]) {
    const chips: LovelaceChipConfig[] = [];

    const area_slugs = area_slug ? Array.isArray(area_slug) ? area_slug : [area_slug] : [];

    const domains = magic_device_id === "global"
        ? Object.keys(Helper.domains)
        : area_slugs.flatMap(area_slug => Object.keys(Helper.areas[area_slug]?.domains ?? {}));

    for (let chipType of chipsList) {
        if (!domains.includes(chipType)) continue;

        const className = Helper.sanitizeClassName(chipType + "Chip");

        try {
            let chipModule;
            if ([...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor].includes(chipType)) {
                chipModule = await import("./chips/AggregateChip");
                const chip = new chipModule.AggregateChip({ ...chipOptions, device_class: chipType, area_slug, magic_device_id });
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

    const unavailableChip = new UnavailableChip({ area_slug }).getChip();
    if (unavailableChip) chips.push(unavailableChip);

    return chips;
}

export function getDomainTranslationKey(domain: string, device_class?: string) {
    if (domain === 'scene') return 'ui.dialogs.quick-bar.commands.navigation.scene'

    if (AGGREGATE_DOMAINS.includes(domain) && device_class) return `component.${domain}.entity_component.${device_class}.name`
    return `component.${domain}.entity_component._.name`
}

export function getStateTranslationKey(state: string, domain: string, device_class?: string) {
    if (domain === 'scene') return 'ui.dialogs.quick-bar.commands.navigation.scene'

    if (AGGREGATE_DOMAINS.includes(domain)) return `component.${domain}.entity_component.${device_class}.state.${state}`

    return `component.${domain}.entity_component._.name`
}

export function getFloorName(floor: StrategyFloor): string {
    return floor.floor_id === UNDISCLOSED ? Helper.localize("component.linus_dashboard.entity.button.floor_not_found.name") : floor.name!
}

export function getAreaName(area: StrategyArea): string {
    return area.area_id === UNDISCLOSED ? Helper.localize("ui.card.area.area_not_found") : area.name!
}