import { MagicAreaRegistryEntry } from "./types/homeassistant/data/device_registry";
import { EntityRegistryEntry } from "./types/homeassistant/data/entity_registry";
import { ActionConfig } from "./types/homeassistant/data/lovelace";
import { MAGIC_AREAS_AGGREGATE_DOMAINS, MAGIC_AREAS_GROUP_DOMAINS } from "./variables";

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
        navigation_path: `/dashboard/${path}`,
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
                aggregateKeys.push(device.entities[`aggregate_${deviceClass}` as 'aggregate_motion'])
            }

        }
    }

    return aggregateKeys.filter(Boolean)
}