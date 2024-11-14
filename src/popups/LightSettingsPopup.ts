import { Helper } from "../Helper";
import { generic } from "../types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { slugify } from "../utils";
import { DOMAIN } from "../variables";
import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LightSettings extends AbstractPopup {

  getDefaultConfig(device: MagicAreaRegistryEntry): PopupActionConfig {

    const { aggregate_illuminance, adaptive_lighting_range, minimum_brightness, maximum_brightness, maximum_lighting_level } = device?.entities ?? {}

    const device_slug = slugify(device?.name ?? "")

    const OPTIONS_ADAPTIVE_LIGHTING_RANGE = {
      "": 1,
      "Small": 10,
      "Medium": 25,
      "Large": 50,
      "Extra large": 100,
    } as Record<string, number>

    const adaptive_lighting_range_state = Helper.getEntityState(adaptive_lighting_range?.entity_id)?.state

    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: "Configurer l'éclairage adaptatif",
          content: {
            type: "vertical-stack",
            cards: [
              {
                type: "horizontal-stack",
                cards: [
                  {
                    type: "tile",
                    entity: `switch.adaptive_lighting_${device_slug}`,
                    vertical: "true",
                  },
                  {
                    type: "tile",
                    entity: `switch.adaptive_lighting_adapt_brightness_${device_slug}`,
                    vertical: "true",
                  },
                  {
                    type: "tile",
                    entity: `switch.adaptive_lighting_adapt_color_${device_slug}`,
                    vertical: "true",
                  },
                  {
                    type: "tile",
                    entity: `switch.adaptive_lighting_sleep_mode_${device_slug}`,
                    vertical: "true",
                  }
                ]
              },
              {
                type: "custom:mushroom-select-card",
                entity: adaptive_lighting_range?.entity_id,
                secondary_info: "last-changed",
                icon_color: "blue",
              },
              {
                type: "horizontal-stack",
                cards: [
                  {
                    type: "custom:mushroom-number-card",
                    entity: maximum_lighting_level?.entity_id,
                    icon_color: "red",
                    card_mod: {
                      style: `
                          :host {
                            --mush-control-height: 20px;
                          }
                        `
                    }
                  },
                  {
                    type: "custom:mushroom-template-card",
                    primary: "Utiliser la valeur actuelle",
                    icon: "mdi:pencil",
                    layout: "vertical",
                    tap_action: {
                      action: "call-service",
                      service: `${DOMAIN}.area_lux_for_lighting_max`,
                      data: {
                        area: device?.name
                      }
                    },
                  },
                ],
              },
              {
                type: "custom:mushroom-number-card",
                entity: minimum_brightness?.entity_id,
                icon_color: "green",
                card_mod: {
                  style: ":host {--mush-control-height: 10px;}"
                }
              },
              {
                type: "custom:mushroom-number-card",
                entity: maximum_brightness?.entity_id,
                icon_color: "green",
                card_mod: {
                  style: ":host {--mush-control-height: 10px;}"
                }
              },
              {
                type: "custom:apexcharts-card",
                graph_span: "15h",
                header: {
                  show: true,
                  title: "Luminosité en fonction du temps",
                  show_states: true,
                  colorize_states: true
                },
                yaxis: [
                  {
                    id: "illuminance",
                    min: 0,
                    apex_config: {
                      tickAmount: 4
                    }
                  },
                  {
                    id: "brightness",
                    opposite: true,
                    min: 0,
                    max: 100,
                    apex_config: {
                      tickAmount: 4
                    }
                  }
                ],
                series: [
                  (aggregate_illuminance?.entity_id ? {
                    entity: aggregate_illuminance?.entity_id,
                    yaxis_id: "illuminance",
                    color: "orange",
                    name: "Luminosité ambiante (lx)",
                    type: "line",
                    group_by: {
                      func: "last",
                      duration: "30m"
                    }
                  } : undefined),
                  {
                    entity: adaptive_lighting_range?.entity_id,
                    type: "area",
                    yaxis_id: "illuminance",
                    show: {
                      in_header: false
                    },
                    color: "blue",
                    name: "Zone d'éclairage adaptatif",
                    unit: "lx",
                    transform: `return parseInt(hass.states['${maximum_lighting_level?.entity_id}'].state) + ${OPTIONS_ADAPTIVE_LIGHTING_RANGE[adaptive_lighting_range_state]};`,
                    group_by: {
                      func: "last",
                    }
                  },
                  {
                    entity: maximum_lighting_level?.entity_id,
                    type: "area",
                    yaxis_id: "illuminance",
                    name: "Zone d'éclairage à 100%",
                    color: "red",
                    show: {
                      in_header: false
                    },
                    group_by: {
                      func: "last",
                    }
                  },
                ].filter(Boolean)
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
   * @param {PopupActionConfig} options The chip options.
   */
  constructor(device: MagicAreaRegistryEntry) {
    super();

    const defaultConfig = this.getDefaultConfig(device)

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { LightSettings };
