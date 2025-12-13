import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { TileCardConfig } from "../types/homeassistant/lovelace/cards/types";

import { AbstractCard } from "./AbstractCard";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Alarm Card Class
 *
 * Used to create a card for controlling an entity of the fan domain.
 *
 * @class
 * @extends AbstractCard
 */
class AlarmCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {TileCardConfig}
   * @private
   */
  #defaultConfig: TileCardConfig = {
    type: "tile",
    entity: undefined,
    icon: undefined,
    features: [
      {
        type: "alarm-modes",
        modes: ["armed_home", "armed_away", "armed_night", "armed_vacation", "armed_custom_bypass", "disarmed"]
      }
    ]
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity: EntityRegistryEntry) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig);
  }
}

export { AlarmCard };
