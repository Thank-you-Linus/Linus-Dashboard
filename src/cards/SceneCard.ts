import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { SceneCardConfig } from "../types/lovelace-mushroom/cards/scene-card-config";

import { AbstractCard } from "./AbstractCard";

/**
 * Scene Card Class
 *
 * Used to create a card for an entity of the Scene domain.
 *
 * @class
 * @extends AbstractCard
 */
class SceneCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {SceneCardConfig}
   * @private
   */
  #defaultConfig: SceneCardConfig = {
    type: "tile",
    icon: undefined,
    vertical: false,
    icon_type: "entity-picture",
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.SceneCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(options: cards.SceneCardOptions, entity: EntityRegistryEntry) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { SceneCard };
