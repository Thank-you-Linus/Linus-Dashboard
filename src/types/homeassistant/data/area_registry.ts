/**
 * Area Entity.
 *
 * @property {string} area_id The id of the area.
 * @property {string} name Name of the area.
 * @property {string|null} picture URL to a picture that should be used instead of showing the domain icon.
 * @property {string[]} aliases Array of aliases of the area.
 * @property {string} [temperature_entity_id] Entity ID for the temperature sensor of this area.
 * @property {string} [humidity_entity_id] Entity ID for the humidity sensor of this area.
 * @property {number} [order] Manual ordering position (Home Assistant 2025.1+).
 */
export interface AreaRegistryEntry {
  area_id: string;
  name: string;
  picture: string | null;
  aliases: string[];
  icon?: string;
  floor_id?: string;
  temperature_entity_id?: string;
  humidity_entity_id?: string;
  order?: number;
}
