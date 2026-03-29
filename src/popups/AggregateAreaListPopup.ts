import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { TitleCardConfig } from "../types/lovelace-mushroom/cards/title-card-config";
import { getDomainTranslationKey } from "../utils";

import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class AggregateAreaListPopup extends AbstractPopup {

  getDefaultConfig({ domain, device_class, area_slug }: { area_slug?: string; device_class: string; domain: string }): PopupActionConfig {

    const groupedCards: (TitleCardConfig | StackCardConfig)[] = [];
    const is_binary_sensor = ["motion", "window", "door", "health"].includes(device_class)

    const areaCards: (TemplateCardConfig)[] = [];

    const entityIds = Helper.getEntityIds({ area_slug: area_slug ?? "global", domain, device_class });

    for (const [i, entity_id] of entityIds.entries()) {
      if (entity_id) {
        areaCards.push({
          type: "tile",
          entity: entity_id,
          state_content: is_binary_sensor ? 'last-changed' : 'state',
          color: is_binary_sensor ? 'red' : false,
        });
      }

      if (i === entityIds.length - 1) {
        for (let i = 0; i < areaCards.length; i += 2) {
          groupedCards.push({
            type: "horizontal-stack",
            cards: areaCards.slice(i, i + 2),
          } as StackCardConfig);
        }
      }
    }

    return {
      "action": "fire-dom-event",
      "browser_mod": {
        "service": "browser_mod.popup",
        "data": {
          "title": Helper.localize(getDomainTranslationKey(domain, device_class)),
          "content": {
            "type": "vertical-stack",
            "cards": [
              ...groupedCards,
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
  constructor(domain: string, device_class: string, area_slug: string) {
    super();

    const defaultConfig = this.getDefaultConfig({ domain, device_class, area_slug })

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { AggregateAreaListPopup };
