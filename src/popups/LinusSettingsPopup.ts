import { Helper } from "../Helper";
import { version } from "../mushroom-strategy";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Linus Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LinusSettings extends AbstractPopup {

  getDefaultConfig(): PopupActionConfig {

    const linusDeviceIds = Object.values(Helper.magicAreasDevices).map((area) => area?.id).flat()

    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: "Paramètre de Linus",
          content: {
            type: "vertical-stack",
            cards: [
              {
                type: "horizontal-stack",
                cards: [
                  {
                    type: "custom:mushroom-template-card",
                    primary: "Recharger Magic Areas",
                    icon: "mdi:refresh",
                    icon_color: "blue",
                    tap_action: {
                      action: "call-service",
                      service: `homeassistant.reload_config_entry`,
                      target: { "device_id": linusDeviceIds },
                    }
                  },
                  {
                    type: "custom:mushroom-template-card",
                    primary: "Redémarrer HA",
                    icon: "mdi:restart",
                    icon_color: "red",
                    tap_action: {
                      action: "call-service",
                      service: "homeassistant.restart",
                    }
                  },
                ]
              },
              {
                type: "markdown",
                content: `Linus dashboard est en version ${version}.`,
              },
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
  constructor() {
    super();

    const defaultConfig = this.getDefaultConfig()

    this.config = Object.assign(this.config, defaultConfig);


  }
}

export { LinusSettings };
