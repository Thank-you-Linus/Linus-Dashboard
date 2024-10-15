/**
 * Floor Entity.
 *
 * @property {string} floor_id The id of the floor.
 * @property {string} name Name of the floor.
 * @property {string|null} picture URL to a picture that should be used instead of showing the domain icon.
 * @property {string[]} aliases Array of aliases of the floor.
 */
export interface FloorRegistryEntry {
  floor_id: string;
  name: string;
  aliases: string[];
  icon?: string;
  level?: number;
}
