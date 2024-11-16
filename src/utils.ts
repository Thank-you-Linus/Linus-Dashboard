import { Helper } from "./Helper";
import { EntityRegistryEntry } from "./types/homeassistant/data/entity_registry";
import { generic } from "./types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { ActionConfig } from "./types/homeassistant/data/lovelace";
import { DEVICE_CLASSES, MAGIC_AREAS_AGGREGATE_DOMAINS, MAGIC_AREAS_GROUP_DOMAINS, MAGIC_AREAS_LIGHT_DOMAINS, SENSOR_DOMAINS, UNAVAILABLE_STATES } from "./variables";
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


export function slugify(name: string | null): string {
    if (name === null) {
        return "";
    }
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, "_");
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

export function getAggregateEntity(device: MagicAreaRegistryEntry, domains: string | string[], deviceClasses?: string | string[]): EntityRegistryEntry[] {

    const aggregateKeys = []

    for (const domain of Array.isArray(domains) ? domains : [domains]) {

        if (domain === "light") {
            Object.values(device?.entities ?? {})?.map(entity => {
                if (entity.entity_id.endsWith('_lights')) {
                    aggregateKeys.push(entity)
                }
            })
        }

        if (MAGIC_AREAS_GROUP_DOMAINS.includes(domain)) {
            aggregateKeys.push(device?.entities[`${domain}_group` as 'cover_group'])
        }

        if (MAGIC_AREAS_AGGREGATE_DOMAINS.includes(domain)) {
            for (const deviceClass of Array.isArray(deviceClasses) ? deviceClasses : [deviceClasses]) {
                aggregateKeys.push(device?.entities[`aggregate_${deviceClass}` as 'aggregate_motion'])
            }

        }
    }

    return aggregateKeys.filter(Boolean)
}

export function getMAEntity(device_id: string, domain: string, deviceClass?: string): EntityRegistryEntry {
    const magicAreaDevice = Helper.magicAreasDevices[device_id];
    // TODO remove '' when new release
    if (MAGIC_AREAS_LIGHT_DOMAINS === domain) return magicAreaDevice?.entities?.['all_lights'] ?? magicAreaDevice?.entities?.['']
    if (MAGIC_AREAS_GROUP_DOMAINS.includes(domain)) return magicAreaDevice?.entities?.[`${domain}_group` as 'cover_group']
    if (deviceClass && [...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor].includes(deviceClass)) return magicAreaDevice?.entities?.[`aggregate_${deviceClass}` as 'aggregate_motion']
    return magicAreaDevice?.entities?.[domain]
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
export async function createChipsFromList(chipsList: string[], chipOptions?: Partial<chips.AggregateChipOptions>, area_id?: string) {
    const chips: LovelaceChipConfig[] = [];
    for (let chipType of chipsList) {
        if (((area_id ? Helper.areas[area_id] : Helper)?.domains[chipType] ?? []).length === 0) continue;


        const className = Helper.sanitizeClassName(chipType + "Chip");

        try {
            let chipModule;
            if ([...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor].includes(chipType)) {
                chipModule = await import("./chips/AggregateChip");
                const chip = new chipModule.AggregateChip({ ...chipOptions, device_class: chipType, area_id });
                chips.push(chip.getChip());
            } else {
                chipModule = await import("./chips/" + className);
                const chip = new chipModule[className]({ ...chipOptions, area_id });
                chips.push(chip.getChip());
            }
        } catch (e) {
            Helper.logError(`An error occurred while creating the ${chipType} chip!`, e);

        }
    }

    const unavailableChip = new UnavailableChip(area_id).getChip();
    if (unavailableChip) chips.push(unavailableChip);

    return chips;
}