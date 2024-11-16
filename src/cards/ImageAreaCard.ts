import { cards } from "../types/strategy/cards";
import { LovelaceCardConfig } from "../types/homeassistant/data/lovelace";


export interface ImageAreaCardConfig extends LovelaceCardConfig {
  type: "area";
  area: string;
  show_camera: boolean;
  alert_classes?: string[];
  sensor_classes?: string[];
  card_mod?: {
    style: string;
  };
}

/**
 * Scene Card Class
 *
 * Used to create a card for an entity of the Scene domain.
 *
 * @class
 */
class ImageAreaCard {
  /**
   * Configuration of the card.
   *
   * @type {EntityCardConfig}
   */
  config: ImageAreaCardConfig = {
    type: "area",
    area: "",
    show_camera: true,
    alert_classes: [],
    sensor_classes: [],
    card_mod: {
      style: `
        .sensors {
          display: none;
        }
        .buttons {
          display: none;
        }
      `
    }
  };

  /**
   * Class constructor.
   *
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(area_id: string) {

    this.config.area = area_id;
  }

  /**
   * Get a card.
   *
   * @return {cards.AbstractCardConfig} A card object.
   */
  getCard(): cards.AbstractCardConfig {
    return this.config;
  }
}

export { ImageAreaCard };
