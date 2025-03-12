import { Helper } from "../Helper";
import { version } from "../linus-strategy";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Linus Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class SettingsPopup extends AbstractPopup {

  getDefaultConfig(): PopupActionConfig {

    const linusDeviceIds = Object.values(Helper.magicAreasDevices).map((area) => area?.id).flat()

    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: Helper.localize("component.linus_dashboard.entity.text.settings_chip.title"),
          content: {
            type: "vertical-stack",
            cards: [
              {
                type: "horizontal-stack",
                cards: [
                  linusDeviceIds.length > 0 && {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_chip.reload"),
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
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_chip.restart"),
                    icon: "mdi:restart",
                    icon_color: "red",
                    tap_action: {
                      action: "call-service",
                      service: "homeassistant.restart",
                    }
                  },
                ].filter(Boolean)
              },
              {
                type: "markdown",
                content: `Linus dashboard est en version ${version}.`,
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
   * @param {chips.PopupActionConfig} options The chip options.
   */
  constructor() {
    super();

    const defaultConfig = this.getDefaultConfig()

    this.config = Object.assign(this.config, defaultConfig);


  }
}

export { SettingsPopup };
