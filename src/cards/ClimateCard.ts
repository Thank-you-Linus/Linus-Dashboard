import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { ClimateCardConfig } from "../types/lovelace-mushroom/cards/climate-card-config";

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
    type: "thermostat",
    icon: undefined,
    vertical: false,
    features: [
      {
        type: "target-temperature"
      },
      {
        type: "climate-preset-modes",
        style: "icons",
        preset_modes: ["home", "eco", "comfort", "away", "boost"]
      },
      {
        type: "climate-hvac-modes",
        hvac_modes: [
          "auto",
          "heat_cool",
          "heat",
          "cool",
          "dry",
          "fan_only",
          "off",
        ]
      },
      {
        type: "climate-fan-modes",
        style: "icons",
        fan_modes: [
          "off",
          "low",
          "medium",
          "high",
        ]
      }
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
  constructor(entity: EntityRegistryEntry, options: cards.ClimateCardOptions = {}) {
    super(entity);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { ClimateCard };
