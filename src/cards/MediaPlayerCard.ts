import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { MediaPlayerCardConfig } from "../types/lovelace-mushroom/cards/media-player-card-config";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Mediaplayer Card Class
 *
 * Used to create a card for controlling an entity of the media_player domain.
 *
 * @class
 * @extends AbstractCard
 */
class MediaPlayerCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {MediaPlayerCardConfig}
   * @private
   */
  #defaultConfig: MediaPlayerCardConfig = {
    type: "tile",
    icon: undefined,
    use_media_info: true,
    features: [{
      type: "media-player-playback"
    }]

  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.MediaPlayerCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(options: cards.MediaPlayerCardOptions, entity: EntityRegistryEntry) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { MediaPlayerCard };
