import { cards } from "../types/strategy/cards";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";

import { AbstractCard } from "./AbstractCard";

/**
 * Battery Card Class
 *
 * Used to create a card for controlling an entity of the battery domain.
 *
 * @class
 * @extends AbstractCard
 */
class BatteryCard extends AbstractCard {
  /**
   * Default configuration of the card.
   *
   * @type {EntityCardConfig}
   * @private
   */
  #defaultConfig: EntityCardConfig = {
    type: "tile",
    animate: true,
    icon: undefined,
    features: [
      {
        type: "bar-gauge",
      }
    ],
    features_position: "bottom",
    card_mod: {
      style: `
        ha-card {
          --card-mod-icon:
            {% set battery_level = states(config.entity) | int %}
            {% if battery_level >= 90 %}
              mdi:battery
            {% elif battery_level >= 80 %}
              mdi:battery-90
            {% elif battery_level >= 70 %}
              mdi:battery-80
            {% elif battery_level >= 60 %}
              mdi:battery-70
            {% elif battery_level >= 50 %}
              mdi:battery-60
            {% elif battery_level >= 40 %}
              mdi:battery-50
            {% elif battery_level >= 30 %}
              mdi:battery-40
            {% elif battery_level >= 20 %}
              mdi:battery-30
            {% elif battery_level >= 10 %}
              mdi:battery-20
            {% else %}
              mdi:battery-10
            {% endif %};
        }
      `
    }
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

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { BatteryCard };
