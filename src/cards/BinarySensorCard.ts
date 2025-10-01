import { SensorCard } from "./SensorCard";
import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Sensor Card Class
 *
 * Used to create a card for controlling an entity of the binary_sensor domain.
 *
 * @class
 * @extends SensorCard
 */
class BinarySensorCard extends SensorCard {
  /**
   * Default configuration of the card.
   *
   * @type {EntityCardConfig}
   * @private
   */
  #defaultConfig: EntityCardConfig = {
    type: "tile",
    icon: undefined,
    state_content: "last_changed",
    vertical: false,
    features: [
      // {
      //   type: "trend-graph",
      //   hours_to_show: 20,
      // }
    ],
    features_position: "bottom",
    grid_options: {
      columns: 6,
    },
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.EntityCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(options: cards.EntityCardOptions, entity: EntityRegistryEntry) {
    super(options, entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { BinarySensorCard };
