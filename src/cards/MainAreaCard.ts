import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { AreaRegistryEntry } from "../types/homeassistant/data/area_registry";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { Helper } from "../Helper";
import { LinusAggregateChip } from "../chips/LinusAggregateChip";
import { AreaStateChip } from "../chips/AreaStateChip";

import { AreaScenesChips } from "../chips/AreaScenesChips";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area Card Class
 *
 * Used to create a card for an entity of the area domain.
 *
 * @class
 * @extends AbstractCard
 */
class MainAreaCard extends AbstractCard {

  getDefaultConfig(area: AreaRegistryEntry): TemplateCardConfig {

    const device = Helper.magicAreasDevices[area.name];

    const {
      area_state,
      aggregate_temperature,
      aggregate_humidity,
      aggregate_illuminance,
      aggregate_window,
      aggregate_door,
      aggregate_health,
      aggregate_cover,
    } = device.entities

    return {
      type: "custom:layout-card",
      layout_type: "custom:masonry-layout",
      card_mod: {
      },
      cards: [
        {
          type: "custom:mod-card",
          style: `
            ha-card {
              position: relative;
            }
            .card-content {
              position: absolute;
              top: 0;
              left: 0;
              width: 100%;
              height: 100%;
            }
          `,
          card: {
            type: "vertical-stack",
            cards: [

              {
                type: "custom:mushroom-chips-card",
                alignment: "end",
                chips: [
                  aggregate_temperature?.entity_id && {
                    type: "conditional",
                    conditions: [
                      {
                        entity: aggregate_temperature?.entity_id,
                        state_not: "unavailable"
                      }
                    ],
                    chip: new LinusAggregateChip(device, "temperature", true, true).getChip(),
                  },
                  aggregate_humidity?.entity_id && {
                    type: "conditional",
                    conditions: [
                      {
                        entity: aggregate_humidity?.entity_id,
                        state_not: "unavailable"
                      }
                    ],
                    chip: new LinusAggregateChip(device, "humidity", true, true).getChip(),
                  },
                  aggregate_illuminance?.entity_id && {
                    type: "conditional",
                    conditions: [
                      {
                        entity: aggregate_illuminance?.entity_id,
                        state_not: "unavailable"
                      }
                    ],
                    chip: new LinusAggregateChip(device, "illuminance", true, true).getChip(),
                  },
                ].filter(Boolean),
                card_mod: {
                  style: `
                    ha-card {
                      position: absolute;
                      top: 24px;
                      left: 0px;
                      right: 8px;
                      z-index: 2;
                    }
                  `
                }
              },
              {
                type: "custom:mushroom-chips-card",
                alignment: "end",
                chips: [
                  aggregate_window?.entity_id && {
                    type: "conditional",
                    conditions: [
                      {
                        entity: aggregate_window?.entity_id,
                        state_not: "unavailable"
                      }
                    ],
                    chip: new LinusAggregateChip(device, "window", true, true).getChip(),
                  },
                  aggregate_door?.entity_id && {
                    type: "conditional",
                    conditions: [
                      {
                        entity: aggregate_door?.entity_id,
                        state_not: "unavailable"
                      }
                    ],
                    chip: new LinusAggregateChip(device, "door", true, true).getChip(),
                  },
                  aggregate_health?.entity_id && {
                    type: "conditional",
                    conditions: [
                      {
                        entity: aggregate_health?.entity_id,
                        state_not: "unavailable"
                      }
                    ],
                    chip: new LinusAggregateChip(device, "health", true, true).getChip(),
                  },
                  aggregate_cover?.entity_id && {
                    type: "conditional",
                    conditions: [
                      {
                        entity: aggregate_cover?.entity_id,
                        state_not: "unavailable"
                      }
                    ],
                    chip: new LinusAggregateChip(device, "cover", true, true).getChip(),
                  },
                  area_state?.entity_id && {
                    type: "conditional",
                    conditions: [
                      {
                        entity: area_state?.entity_id,
                        state_not: "unavailable"
                      }
                    ],
                    chip: new AreaStateChip(device, true).getChip(),
                  },
                ].filter(Boolean),
                card_mod: {
                  style: `
                    ha-card {
                      position: absolute;
                      bottom: 8px;
                      left: 0px;
                      right: 8px;
                      z-index: 2;
                    }
                  `
                }
              },

              {
                type: "area",
                area: area.area_id,
                show_camera: true,
                alert_classes: [],
                sensor_classes: [],
                aspect_ratio: "16:9",

                card_mod: {
                  style: `
                    ha-card {
                      position: relative;
                      z-index: 1;
                    }
                    .sensors {
                      display: none;
                    }
                    .buttons {
                      display: none;
                    }
                  `
                }
              }
            ]
          }
        },
        (device.entities.all_lights && device.entities.all_lights.entity_id !== "unavailable" ? {
          type: "custom:mushroom-chips-card",
          alignment: "center",
          chips: new AreaScenesChips(device, area).getChips()
        } : undefined)
      ].filter(Boolean)
    }
  }

  /**
   * Class constructor.
   *
   * @param {AreaRegistryEntry} area The area entity to create a card for.
   * @param {cards.TemplateCardOptions} [options={}] Options for the card.
   *
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(area: AreaRegistryEntry, options: cards.TemplateCardOptions = {}) {
    super(area);

    // Don't override the default card type if default is set in the strategy options.
    if (options.type === "LinusMainAreaCard") {
      delete options.type;
    }

    const defaultConfig = this.getDefaultConfig(area)

    this.config = Object.assign(this.config, defaultConfig, options);
  }
}

export { MainAreaCard };
