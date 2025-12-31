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

  getDefaultConfig({ domain, device_class, area_slug }: { domain: string, area_slug: string; device_class: string }): PopupActionConfig {

    const device = Helper.magicAreasDevices[area_slug ?? "global"]
    const magicEntity = Helper.getEntityState(device?.entities[`aggregate_${device_class}`]?.entity_id)

    const groupedCards: (TitleCardConfig | StackCardConfig)[] = [];
    const is_binary_sensor = ["motion", "window", "door", "health"].includes(device_class)

    for (const floor of Helper.orderedFloors) {

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

        const _entity = Helper.magicAreasDevices[area.slug]?.entities[`aggregate_${device_class}`]

        // Get a card for the area.
        // if (entity && !Helper.strategyOptions.areas[area.area_slug]?.hidden) {

        //   areaCards.push({
        //     type: "tile",
        //     entity: entity?.entity_id,
        //     primary: getAreaName(area),
        //     state_content: is_binary_sensor ? 'last-changed' : 'state',
        //     color: is_binary_sensor ? 'red' : false,
        //   });
        // }

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
              ...(magicEntity ? [
                {
                  type: "custom:mushroom-entity-card",
                  entity: magicEntity.entity_id,
                  color: is_binary_sensor ? 'red' : false,
                  secondary_info: is_binary_sensor ? 'last-changed' : 'state',
                },
                {
                  "type": "history-graph",
                  "hours_to_show": 10,
                  "show_names": false,
                  "entities": [
                    {
                      "entity": magicEntity.entity_id,
                      "name": " "
                    }
                  ]
                },
              ] : []),
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
