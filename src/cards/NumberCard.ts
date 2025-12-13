import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { NumberCardConfig } from "../types/lovelace-mushroom/cards/number-card-config";

import { AbstractCard } from "./AbstractCard";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported
/**
 * Number Card Class
 *
 * Used to create a card for controlling an entity of the number domain.
 *
 * @class
 * @extends AbstractCard
 */
class NumberCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {NumberCardConfig}
   * @private
   */
  #defaultConfig: NumberCardConfig = {
    type: "custom:mushroom-number-card",
    icon: undefined,
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.NumberCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(options: cards.NumberCardOptions, entity: EntityRegistryEntry) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { NumberCard };
