import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { TitleCardConfig } from "../types/lovelace-mushroom/cards/title-card-config";
import { groupBy } from "../utils";
import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class AggregateAreaListPopup extends AbstractPopup {

  getDefaultConfig(aggregate_entity: any, deviceClass: string, is_binary_sensor: boolean): PopupActionConfig {

    const groupedCards: (TitleCardConfig | StackCardConfig)[] = [];


    let areaCards: (TemplateCardConfig)[] = [];

    for (const [i, entity_id] of aggregate_entity.attributes.entity_id?.entries() ?? []) {

      // Get a card for the area.
      if (entity_id) {

        areaCards.push({
          type: "tile",
          entity: entity_id,
          // primary: area.name,
          state_content: is_binary_sensor ? 'last-changed' : 'state',
          color: is_binary_sensor ? 'red' : false,
          // badge_icon: "mdi:numeric-9",
          // badge_color: "red",
        });
      }
        
      // Horizontally group every two area cards if all cards are created.
      if (i === aggregate_entity.attributes.entity_id.length - 1) {
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
          "title": aggregate_entity?.attributes?.friendly_name,
          "content": {
            "type": "vertical-stack",
            "cards": [
              {
                type: "custom:mushroom-entity-card",
                entity: aggregate_entity.entity_id,
                color: is_binary_sensor ? 'red' : false,
                secondary_info: is_binary_sensor ? 'last-changed' : 'state',
              },
              {
                "type": "history-graph",
                "hours_to_show": 10,
                "show_names": false,
                "entities": [
                  {
                    "entity": aggregate_entity.entity_id,
                    "name": " "
                  }
                ]
              },
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
  constructor(entity_id: string, type: string) {
    super();

    const aggregate_entity = Helper.getEntityState(entity_id)

    if (aggregate_entity) {
      const is_binary_sensor = ["motion", "window", "door", "health"].includes(type)

      const defaultConfig = this.getDefaultConfig(aggregate_entity, type, is_binary_sensor)

      this.config = Object.assign(this.config, defaultConfig);
    }

  }
}

export { AggregateAreaListPopup };
