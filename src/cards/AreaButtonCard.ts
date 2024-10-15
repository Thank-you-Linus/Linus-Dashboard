import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { AreaRegistryEntry } from "../types/homeassistant/data/area_registry";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { Helper } from "../Helper";
import { LightControlChip } from "../chips/LightControlChip";
import { LinusLightChip } from "../chips/LinusLightChip";
import { LinusClimateChip } from "../chips/LinusClimateChip";
import { LinusAggregateChip } from "../chips/LinusAggregateChip";
import { AreaStateChip } from "../chips/AreaStateChip";

import { MagicAreaRegistryEntry } from "../types/homeassistant/data/device_registry";
import { slugify } from "../utils";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area Button Card Class
 *
 * Used to create a card for an entity of the area domain.
 *
 * @class
 * @extends AbstractCard
 */
class AreaCard extends AbstractCard {

  getDefaultConfig(area: AreaRegistryEntry, device: MagicAreaRegistryEntry): TemplateCardConfig {

    if (area.area_id === "undisclosed") {
      return {
        type: "custom:stack-in-card",
        cards: [
          {
            type: "custom:stack-in-card",
            mode: "horizontal",
            cards: [
              {
                type: "custom:mushroom-template-card",
                primary: area.name,
                secondary: null,
                icon: "mdi:devices",
                icon_color: "grey",
                fill_container: true,
                layout: "horizontal",
                multiline_secondary: false,
                tap_action: {
                  action: "navigate",
                  navigation_path: slugify(area.name),
                },
                hold_action: {
                  action: "none",
                },
                double_tap_action: {
                  action: "none"
                },
                card_mod: {
                  style: `
                  :host {
                    background: #1f1f1f;
                    --mush-icon-size: 74px;
                    height: 66px;
                    margin-left: -26px !important;
                  }
                  mushroom-badge-icon {
                      left: 178px;
                      top: 17px;
                  }
                  ha-card {
                    box-shadow: none!important;
                    border: none;
                  }
                `,
                }
              }
            ],
            card_mod: {
              style: `
              ha-card {
                box-shadow: none!important;
                border: none;
              }
            `
            }
          }
        ]
      }
    }

    const {
      area_state,
      all_lights,
      aggregate_temperature,
      aggregate_battery,
      aggregate_door,
      aggregate_window,
      aggregate_health,
      aggregate_climate,
      aggregate_cover,
      light_control
    } = device.entities

    const icon = area.icon || "mdi:home-outline"

    return {
      type: "custom:stack-in-card",
      cards: [
        {
          type: "custom:stack-in-card",
          mode: "horizontal",
          cards: [
            {
              type: "custom:mushroom-template-card",
              primary: area.name,
              secondary: `
          {% set t = states('${aggregate_temperature?.entity_id}') %}
          {% if t != 'unknown' and t != 'unavailable' %}
            {{ t | float | round(1) }}{{ state_attr('${aggregate_temperature?.entity_id}', 'unit_of_measurement')}}
          {% endif %}
          `,
              icon: icon,
              icon_color: `
          {{ "indigo" if "dark" in state_attr('${area_state?.entity_id}', 'states') else "amber" }}
          `,
              fill_container: true,
              layout: "horizontal",
              multiline_secondary: false,
              badge_icon: `
          {% set bl = states('${aggregate_battery?.entity_id}') %}
          {% if bl == 'unknown' or bl == 'unavailable' %}
          {% elif bl | int() < 10 %} mdi:battery-outline
          {% elif bl | int() < 20 %} mdi:battery-10
          {% elif bl | int() < 30 %} mdi:battery-20
          {% elif bl | int() < 40 %} mdi:battery-30
          {% elif bl | int() < 50 %} mdi:battery-40
          {% elif bl | int() < 60 %} mdi:battery-50
          {% elif bl | int() < 70 %} mdi:battery-60
          {% elif bl | int() < 80 %} mdi:battery-70
          {% elif bl | int() < 90 %} mdi:battery-80
          {% elif bl | int() < 100 %} mdi:battery-90
          {% elif bl | int() == 100 %} mdi:battery
          {% else %} mdi:battery-unknown
          {% endif %}
          `,
              badge_color: `{% set bl = states('${aggregate_battery?.entity_id}') %}
          {% if bl == 'unknown' or bl == 'unavailable' %} disabled
          {% elif bl | int() < 10 %} red
          {% elif bl | int() < 20 %} red
          {% elif bl | int() < 30 %} red
          {% elif bl | int() < 40 %} orange
          {% elif bl | int() < 50 %} orange
          {% elif bl | int() < 60 %} green
          {% elif bl | int() < 70 %} green
          {% elif bl | int() < 80 %} green
          {% elif bl | int() < 90 %} green
          {% elif bl | int() < 100 %} green
          {% elif bl | int() == 100 %} green
          {% else %} disabled
          {% endif %}
          `,
              tap_action: {
                action: "navigate",
                navigation_path: slugify(area.name),
              },
              hold_action: {
                action: "none",
              },
              double_tap_action: {
                action: "none"
              },
              card_mod: {
                style: `
            :host {
              background: transparent;
              --mush-icon-size: 74px;
              height: 66px;
              margin-left: -26px !important;
            }
            mushroom-badge-icon {
              top: 17px;
            }
            ha-card {
              box-shadow: none!important;
              border: none;
            }
          `,
              }
            },
            {
              type: "custom:mushroom-chips-card",
              alignment: "end",
              chips: [
                area_state?.entity_id && {
                  type: "conditional",
                  conditions: [
                    {
                      entity: area_state?.entity_id,
                      state_not: "unavailable"
                    }
                  ],
                  chip: new AreaStateChip(device).getChip(),
                },
                aggregate_health?.entity_id && {
                  type: "conditional",
                  conditions: [
                    {
                      entity: aggregate_health?.entity_id,
                      state: "on"
                    }
                  ],
                  chip: new LinusAggregateChip(device, "health").getChip(),
                },
                aggregate_window?.entity_id && {
                  type: "conditional",
                  conditions: [
                    {
                      entity: aggregate_window?.entity_id,
                      state: "on"
                    }
                  ],
                  chip: new LinusAggregateChip(device, "window").getChip(),
                },
                aggregate_door?.entity_id && {
                  type: "conditional",
                  conditions: [
                    {
                      entity: aggregate_door?.entity_id,
                      state: "on"
                    }
                  ],
                  chip: new LinusAggregateChip(device, "door").getChip(),
                },
                aggregate_cover?.entity_id && {
                  type: "conditional",
                  conditions: [
                    {
                      entity: aggregate_cover?.entity_id,
                      state: "on"
                    }
                  ],
                  chip: new LinusAggregateChip(device, "cover").getChip(),
                },
                aggregate_climate?.entity_id && {
                  "type": "conditional",
                  "conditions": [
                    {
                      "entity": aggregate_climate?.entity_id,
                      "state_not": "unavailable"
                    }
                  ],
                  "chip": new LinusClimateChip(device).getChip()
                },
                all_lights?.entity_id && {
                  "type": "conditional",
                  "conditions": [
                    {
                      "entity": all_lights?.entity_id,
                      "state_not": "unavailable"
                    }
                  ],
                  "chip": new LinusLightChip(device, area.area_id).getChip()
                },
                all_lights?.entity_id && {
                  "type": "conditional",
                  "conditions": [
                    {
                      "entity": all_lights?.entity_id,
                      "state_not": "unavailable"
                    }
                  ],
                  "chip": new LightControlChip(light_control?.entity_id).getChip()
                },
              ].filter(Boolean),
              card_mod: {
                style: `
            ha-card {
              --chip-box-shadow: none;
              --chip-spacing: 0px;
              width: -webkit-fill-available;
              position: absolute;
              top: 16px;
              right: 8px;
            }
            .chip-container {
              position: absolute;
              right: 0px;
            }
          `
              }
            }
          ],
          card_mod: {
            style: `
          ha-card {
            box-shadow: none!important;
            border: none;
          }
        `
          }
        },
        {
          type: "custom:mushroom-light-card",
          entity: all_lights?.entity_id,
          fill_container: true,
          show_brightness_control: true,
          icon_type: "none",
          primary_info: "none",
          secondary_info: "none",
          use_light_color: true,
          layout: "horizontal",
          card_mod: {
            style: `
          :host {
            --mush-control-height: 1rem;
          }
          ha-card {
            box-shadow: none!important;
            border: none;
          }
        `
          }
        }
      ]
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
    if (options.type === "AreaButtonCard") {
      delete options.type;
    }

    const device = Helper.magicAreasDevices[area.name];

    if (device) {
      const defaultConfig = this.getDefaultConfig(area, device)
      this.config = Object.assign(this.config, defaultConfig, options);
    }
  }
}

export { AreaCard };
