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
class AggregateListPopup extends AbstractPopup {

  getDefaultConfig({ domain, device_class, area_slug: _area_slug }: { domain: string, area_slug: string; device_class: string }): PopupActionConfig {

    const groupedCards: (TitleCardConfig | StackCardConfig)[] = [];
    const _is_binary_sensor = ["motion", "window", "door", "health"].includes(device_class)

    for (const floor of Helper.orderedFloors) {
      // Skip excluded floors
      if (Helper.isFloorExcluded(floor.floor_id)) continue;

      if (floor.areas_slug.length === 0) continue

      groupedCards.push({
        type: "custom:mushroom-title-card",
        subtitle: floor.name,
        card_mod: {
          style: `
            ha-card.header {
              padding-top: 8px;
            }
          `,
        }
      });

      const areaCards: (TemplateCardConfig)[] = [];

      for (const [i, area] of floor.areas_slug.map(area_slug => Helper.areas[area_slug]).entries()) {
        // Skip excluded areas
        if (Helper.isAreaExcluded(area?.area_id)) continue;

        // Horizontally group every two area cards if all cards are created.
        if (i === floor.areas_slug.length - 1) {
          for (let j = 0; j < areaCards.length; j += 2) {
            groupedCards.push({
              type: "horizontal-stack",
              cards: areaCards.slice(j, j + 2),
            } as StackCardConfig);
          }
        }

      }

      if (areaCards.length === 0) groupedCards.pop()

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
  constructor(domain: string, area_slug: string, device_class: string) {
    super();

    const defaultConfig = this.getDefaultConfig({ domain, device_class, area_slug })

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { AggregateListPopup };
