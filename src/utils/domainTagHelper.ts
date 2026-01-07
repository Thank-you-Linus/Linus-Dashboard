/**
 * Domain Tag Helper Module
 *
 * Provides centralized utilities for creating and parsing domain tags.
 * Domain tags uniquely identify entity types by combining domain and device_class.
 *
 * Format:
 * - Without device_class: "light", "switch", "climate"
 * - With device_class: "cover:blind", "sensor:temperature"
 *
 * @module domainTagHelper
 */

/**
 * Create a domain tag from domain and optional device_class
 *
 * This is the single source of truth for domain tag construction across the codebase.
 * It handles null, undefined, and empty string values consistently.
 *
 * @param domain - The domain (e.g., "cover", "sensor", "light")
 * @param device_class - Optional device class (e.g., "blind", "temperature")
 * @returns Domain tag string (e.g., "cover:blind", "light")
 *
 * @example
 * createDomainTag('light') // "light"
 * createDomainTag('cover', 'blind') // "cover:blind"
 * createDomainTag('sensor', null) // "sensor" (explicit no device_class)
 * createDomainTag('sensor', undefined) // "sensor"
 * createDomainTag('sensor', '') // "sensor" (empty string treated as no device_class)
 */
export function createDomainTag(domain: string, device_class?: string | null): string {
  // Handle null, undefined, and empty string as "no device_class"
  if (!device_class) {
    return domain;
  }
  return `${domain}:${device_class}`;
}

/**
 * Parse a domain tag string into components
 *
 * Splits a domain tag into its domain and device_class parts.
 * If no colon is present, device_class will be undefined.
 *
 * @param domainTag - The domain tag to parse (e.g., "cover:blind", "light")
 * @returns Object with domain and optional device_class
 *
 * @example
 * parseDomainTag('light') // { domain: 'light', device_class: undefined }
 * parseDomainTag('cover:blind') // { domain: 'cover', device_class: 'blind' }
 * parseDomainTag('sensor:temperature:extra') // { domain: 'sensor', device_class: 'temperature' }
 */
export function parseDomainTag(domainTag: string): {
  domain: string;
  device_class?: string
} {
  const [domain, device_class] = domainTag.split(':', 2);
  return {
    domain,
    device_class: device_class || undefined
  };
}

/**
 * Check if a domain tag matches a domain and optional device_class
 *
 * This function supports three matching modes:
 * 1. Exact match: Both domain and device_class must match
 * 2. Domain-only match: Only domain must match (device_class ignored)
 * 3. Strict null match: Domain matches AND no device_class present
 *
 * @param domainTag - The domain tag to check
 * @param domain - The domain to match
 * @param device_class - Device class to match (undefined = match domain only, null = strict no device_class)
 * @returns True if matches according to the specified mode
 *
 * @example
 * matchesDomainTag('cover:blind', 'cover', 'blind') // true (exact match)
 * matchesDomainTag('cover:blind', 'cover') // true (domain-only match)
 * matchesDomainTag('cover:blind', 'cover', null) // false (strict: requires no device_class)
 * matchesDomainTag('cover', 'cover', null) // true (strict match: no device_class)
 * matchesDomainTag('cover:blind', 'light') // false (domain mismatch)
 */
export function matchesDomainTag(
  domainTag: string,
  domain: string,
  device_class?: string | null
): boolean {
  const parsed = parseDomainTag(domainTag);

  // Domain must match
  if (parsed.domain !== domain) {
    return false;
  }

  // If device_class is null, require exact match (no device_class)
  if (device_class === null) {
    return parsed.device_class === undefined;
  }

  // If device_class is undefined, match domain only (ignore device_class)
  if (device_class === undefined) {
    return true;
  }

  // Otherwise, require exact device_class match
  return parsed.device_class === device_class;
}

/**
 * Extract device_class from entity state
 *
 * Safely extracts the device_class attribute from an entity state object,
 * only if the domain supports device_class functionality.
 *
 * @param entityState - The entity state object from Home Assistant
 * @param domain - The domain of the entity
 * @param supportedDomains - List of domains that support device_class
 * @returns device_class if found and supported, undefined otherwise
 *
 * @example
 * const state = { attributes: { device_class: 'temperature' } };
 * extractDeviceClass(state, 'sensor', ['sensor']) // 'temperature'
 * extractDeviceClass(state, 'light', ['sensor']) // undefined (unsupported domain)
 * extractDeviceClass({}, 'sensor', ['sensor']) // undefined (no attributes)
 */
export function extractDeviceClass(
  entityState: any,
  domain: string,
  supportedDomains: string[]
): string | undefined {
  if (!supportedDomains.includes(domain)) {
    return undefined;
  }

  return entityState?.attributes?.device_class;
}

/**
 * Create a domain tag from entity_id and state
 *
 * This is a convenience function that combines entity parsing and domain tag creation.
 * It extracts the domain from the entity_id, gets the device_class from the state,
 * and creates the appropriate domain tag.
 *
 * @param entity_id - The entity ID (e.g., "sensor.living_room_temperature")
 * @param entityState - The entity state object
 * @param supportedDomains - List of domains that support device_class
 * @returns Domain tag string
 *
 * @example
 * const entity_id = 'sensor.living_room_temperature';
 * const state = { attributes: { device_class: 'temperature' } };
 * createDomainTagFromEntity(entity_id, state, ['sensor'])
 * // "sensor:temperature"
 *
 * @example
 * const entity_id = 'light.living_room';
 * const state = { attributes: {} };
 * createDomainTagFromEntity(entity_id, state, ['sensor'])
 * // "light"
 */
export function createDomainTagFromEntity(
  entity_id: string,
  entityState: any,
  supportedDomains: string[]
): string {
  const domain = entity_id.split('.')[0];
  const device_class = extractDeviceClass(entityState, domain, supportedDomains);
  return createDomainTag(domain, device_class);
}
