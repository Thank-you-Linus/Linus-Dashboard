import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Weather Chip class.
 *
 * Used to create a chip to indicate how many Weathers are on and to turn all off.
 */
class WeatherPopup extends AbstractPopup {

  getDefaultConfig(entityId: string): PopupActionConfig {
    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: "Météo",
          content: {
            type: "vertical-stack",
            cards: [
              {
                type: "weather-forecast",
                entity: entityId,
                show_current: true,
                show_forecast: true
              },
            ]
          }
        }
      }
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.PopupActionConfig} options The chip options.
   */
  constructor(entity_id: string) {
    super();

    this.config = Object.assign(this.config, this.getDefaultConfig(entity_id));


  }
}

export {WeatherPopup};
