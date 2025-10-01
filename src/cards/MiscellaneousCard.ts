import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";

/**
 * Miscellaneous Card Class
 *
 * Used to create a card an entity of any domain.
 *
 * @class
 * @extends AbstractCard
 */
class MiscellaneousCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {EntityCardConfig}
   * @private
   */
  #defaultConfig: EntityCardConfig = {
    type: "tile",
    icon: undefined,
    vertical: false,
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
  constructor(options: cards.EntityCardOptions = {}, entity?: EntityRegistryEntry) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { MiscellaneousCard };
