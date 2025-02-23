import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { CoverCardConfig } from "../types/lovelace-mushroom/cards/cover-card-config";
import { getDomainTranslationKey, getMAEntity } from "../utils";
import { Helper } from "../Helper";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { AggregateCard } from "./AggregateCard";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover Card Class
 *
 * Used to create a card for controlling an entity of the cover domain.
 *
 * @class
 * @extends AbstractCard
 */
class CoverCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {CoverCardConfig}
   * @private
   */
  #defaultConfig: CoverCardConfig | AggregateCard = {
    type: "tile",
    icon: undefined,
    features: [
      {
        type: "cover-open-close"
      }
    ]
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.CoverCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(entity?: EntityRegistryEntry, options: cards.CoverCardOptions = {}) {
    super(entity);

    const magicAreasEntity = getMAEntity(options?.magic_device_id ?? "global", "cover", "shutter");

    if (magicAreasEntity) {
      this.#defaultConfig.entity = magicAreasEntity.entity_id;
    } else {
      this.#defaultConfig = new AggregateCard({ domain: "cover", device_class: "shutter" }).config;
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { CoverCard };
