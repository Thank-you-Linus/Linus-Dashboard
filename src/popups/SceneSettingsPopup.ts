
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { slugify } from "../utils";
import { MAGIC_AREAS_DOMAIN, TOD_ORDER } from "../variables";
import { generic } from "../types/strategy/generic";

import { AbstractPopup } from "./AbstractPopup";

import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Scene Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class SceneSettings extends AbstractPopup {

  getDefaultConfig(device: MagicAreaRegistryEntry): PopupActionConfig {

    const { scene_morning, scene_daytime, scene_evening, scene_night } = device?.entities ?? {}
    const selectControl = [scene_morning, scene_daytime, scene_evening, scene_night].filter(Boolean)

    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: "Configurer les scènes",
          content: {
            type: "vertical-stack",
            cards: [
              ...(selectControl.length ? TOD_ORDER.map(tod => (
                {
                  type: "horizontal-stack",
                  cards: [
                    {
                      type: "entities",
                      entities: [device?.entities[('scene_' + tod) as "scene_morning"]?.entity_id]
                    },
                    {
                      type: "conditional",
                      conditions: [
                        {
                          entity: device?.entities[('scene_' + tod) as "scene_morning"]?.entity_id,
                          state: "on"
                        }
                      ],
                      card: {
                        type: "tile",
                        entity: device?.entities[('scene_' + tod) as "scene_morning"]?.entity_id,
                        show_entity_picture: true,
                        tap_action: {
                          action: "toggle"
                        },
                      }
                    },
                    {
                      type: "conditional",
                      conditions: [
                        {
                          entity: device?.entities[('scene_' + tod) as "scene_morning"]?.entity_id,
                          state: "unavailable"
                        }
                      ],
                      card: {
                        type: "custom:mushroom-template-card",
                        secondary: "Utiliser l'éclairage actuel",
                        multiline_secondary: true,
                        icon: "mdi:pencil",
                        layout: "vertical",
                        tap_action: {
                          action: "call-service",
                          service: `${MAGIC_AREAS_DOMAIN}.snapshot_lights_as_tod_scene`,
                          data: {
                            area: slugify(device.name),
                            tod
                          }
                        },
                      },
                    }
                  ]
                }
              )) : [{
                type: "custom:mushroom-template-card",
                primary: "Ajouter une nouvelle scène",
                secondary: `Cliquer ici pour vous rendre sur la page des scènes`,
                multiline_secondary: true,
                icon: `mdi:palette`,
                tap_action: {
                  action: "fire-dom-event",
                  browser_mod: {
                    service: "browser_mod.sequence",
                    data: {
                      sequence: [
                        {
                          service: "browser_mod.navigate",
                          data: { path: `/config/scene/dashboard` }
                        },
                        {
                          service: "browser_mod.close_popup",
                          data: {}
                        }
                      ]
                    }
                  }
                },
                card_mod: {
                  style: `
          ha-card {
          box-shadow: none!important;
          }
        `
                }
              }])
            ].filter(Boolean)
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
  constructor(device: MagicAreaRegistryEntry) {
    super();

    const defaultConfig = this.getDefaultConfig(device)

    this.config = Object.assign(this.config, defaultConfig);


  }
}

export { SceneSettings };
