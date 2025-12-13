import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { LightCardConfig } from "../types/lovelace-mushroom/cards/light-card-config";
import { navigateTo } from "../utils";

import { AggregateCard } from "./AggregateCard";
import { AbstractCard } from "./AbstractCard";


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Card Class
 *
 * Used to create a card for controlling an entity of the light domain.
 *
 * @class
 * @extends AbstractCard
 */
class LightCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {LightCardConfig}
   * @private
   */
  #defaultConfig: LightCardConfig = {
    type: "tile",
    icon: undefined,
    vertical: false,
    features: [
      { type: 'light-brightness' },
      // { type: 'toggle' },
    ],
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.LightCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(options: cards.LightCardOptions, entity?: EntityRegistryEntry) {
    super(entity);

    if (!entity) this.#defaultConfig = new AggregateCard({ domain: "light", tap_action: navigateTo("light") }).config;

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { LightCard };
