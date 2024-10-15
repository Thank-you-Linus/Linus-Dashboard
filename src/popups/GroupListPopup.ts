import { Helper } from "../Helper";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { groupBy } from "../utils";
import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class GroupListPopup extends AbstractPopup {
  getDefaultConfig(entities: EntityRegistryEntry[], title: string) {
      const entitiesByArea = groupBy(entities, (e) => e.area_id ?? "undisclosed");
      
      return {
          "action": "fire-dom-event",
          "browser_mod": {
              "service": "browser_mod.popup",
              "data": {
                  "title": title,
                  "content": {
                      "type": "vertical-stack",
                      "cards": Object.entries(entitiesByArea).map(([area_id, entities]) => ([
                          {
                              type: "markdown",
                              content: `${Helper.areas.find(a => a.area_id === area_id)?.name}`,
                          },
                          {
                              type: "custom:layout-card",
                              layout_type: "custom:horizontal-layout",
                              layout: {
                                  width: 150,
                              },
                              cards: entities?.map((entity) => ({
                                  type: "custom:mushroom-entity-card",
                                  vertical: true,
                                  entity: entity.entity_id,
                                  secondary_info: 'last-changed',
                              })),
                          }
                      ])).flat()
                  }
              }
          }
      };
  }
  /**
   * Class Constructor.
   *
   * @param {EntityRegistryEntry[]} entities The chip entities.
   * @param {string} title The chip title.
   */
  constructor(entities: EntityRegistryEntry[], title: string) {
      super();
      const defaultConfig = this.getDefaultConfig(entities, title);
      this.config = Object.assign(this.config, defaultConfig);
  }
}

export {GroupListPopup};
