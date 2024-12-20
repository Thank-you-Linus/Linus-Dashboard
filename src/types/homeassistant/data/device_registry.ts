import { EntityRegistryEntry } from "./entity_registry";

/**
 * Device Entity.
 *
 * @property {string} id Unique ID of a device (generated by Home Assistant).
 * @property {string[]} config_entries
 * @property {Array} connections
 * @property {Array} identifiers
 * @property {string | null} manufacturer
 * @property {string | null} model
 * @property {string | null} name
 * @property {string | null} sw_version
 * @property {string | null} hw_version
 * @property {string | null} serial_number
 * @property {string | null} via_device_id
 * @property {string} area_id The Area which the device is placed in.
 * @property {string | null} name_by_user
 * @property {string[] | null} entry_type
 * @property {string | null} disabled_by Indicates by what this entity is disabled.
 * @property {string | null} configuration_url
 */
export interface DeviceRegistryEntry {
  id: string;
  config_entries: string[];
  connections: Array<[string, string]>;
  identifiers: Array<[string, string]>;
  manufacturer: string | null;
  model: string | null;
  name: string | null;
  sw_version: string | null;
  hw_version: string | null;
  serial_number: string | null;
  via_device_id: string | null;
  area_id: string | null;
  name_by_user: string | null;
  entry_type: "service" | null;
  disabled_by: "user" | "integration" | "config_entry" | null;
  configuration_url: string | null;
}
