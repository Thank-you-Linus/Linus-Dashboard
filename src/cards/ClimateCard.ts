import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { ClimateCardConfig } from "../types/lovelace-mushroom/cards/climate-card-config";
import { Helper } from "../Helper";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Card Class
 *
 * Used to create a card for controlling an entity of the climate domain.
 *
 * @class
 * @extends AbstractCard
 */
class ClimateCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {ClimateCardConfig}
   * @private
   */
  #defaultConfig: ClimateCardConfig = {
    type: "tile",
    icon: undefined,
    show_current_as_primary: true,
    vertical: false,
    features: [
    ],

    layout_options: {
      grid_columns: 2,
      grid_rows: 1,
    },
  };

  /**
   * Class constructor.
   *
   * @param {EntityRegistryEntry} entity The hass entity to create a card for.
   * @param {cards.ClimateCardOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(options: cards.ClimateCardOptions, entity: EntityRegistryEntry) {
    super(entity);

    const { preset_modes, hvac_modes, fan_modes } = Helper.getEntityState(entity.entity_id)?.attributes ?? {};

    if (preset_modes) {
      this.#defaultConfig.features.push({
        type: "climate-preset-modes",
        preset_modes: preset_modes
      });
    } else if (hvac_modes) {
      this.#defaultConfig.features.push({
        type: "climate-hvac-modes",
        hvac_modes: hvac_modes
      });
    } else if (fan_modes) {
      this.#defaultConfig.features.push({
        type: "climate-fan-modes",
        fan_modes: fan_modes
      });
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { ClimateCard };
