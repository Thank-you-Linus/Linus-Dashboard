import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";
import { navigateTo } from "../utils";

import { AbstractCard } from "./AbstractCard";
import { AggregateCard } from "./AggregateCard";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Switch Card Class
 *
 * Used to create a card for controlling an entity of the switch domain.
 *
 * @class
 * @extends AbstractCard
 */
class SwitchCard extends AbstractCard {
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
    features: [
      {
        type: "toggle"
      }
    ]
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.EntityCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(options: cards.EntityCardOptions, entity: EntityRegistryEntry) {
    super(entity);

    if (!entity) this.#defaultConfig = new AggregateCard({ domain: "switch", tap_action: navigateTo("switch") }).config;

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { SwitchCard };
