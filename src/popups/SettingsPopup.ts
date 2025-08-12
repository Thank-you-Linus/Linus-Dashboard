import { Helper } from "../Helper";
import { version } from "../linus-strategy";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { navigateTo } from "../utils";
import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Settings Popup class.
 *
 * Used to create a comprehensive settings popup for Linus Dashboard.
 */
class SettingsPopup extends AbstractPopup {

  getDefaultConfig(): PopupActionConfig {

    const linusDeviceIds = Object.values(Helper.magicAreasDevices).map((area) => area?.id).flat();
    const totalEntities = Object.keys(Helper.entities).length;
    const totalDevices = Object.keys(Helper.devices).length;
    const totalAreas = Object.keys(Helper.areas).length;
    const totalFloors = Object.keys(Helper.floors).length;

    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: Helper.localize("component.linus_dashboard.entity.text.settings_popup.name"),
          content: {
            type: "vertical-stack",
            cards: [
              // Message de bienvenue simple
              {
                type: "custom:mushroom-template-card",
                primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.welcome_message"),
                icon: "mdi:bow-tie",
                icon_color: "#FFB001",
                layout: "horizontal",
                tap_action: { action: "none" },
                card_mod: {
                  style: `
                    ha-card {
                      background: linear-gradient(45deg, #004226, #004226);
                      color: #F5F5DC !important;
                      box-shadow: none;
                      margin-bottom: 12px;
                      font-weight: bold;
                    }
                    .primary {
                      color: #F5F5DC !important;
                    }
                  `
                }
              },

              // Statistiques avec chips minimalistes
              {
                type: "custom:mushroom-chips-card",
                chips: [
                  {
                    type: "template",
                    content: `${totalAreas} ${Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.areas")}`,
                    icon: "mdi:floor-plan",
                    icon_color: "blue",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: {
                        service: "browser_mod.sequence",
                        data: {
                          sequence: [
                            { service: "browser_mod.close_popup", data: {} },
                            { service: "browser_mod.navigate", data: { path: `/config/areas` } }
                          ]
                        }
                      }
                    }
                  },
                  {
                    type: "template",
                    content: `${totalFloors} ${Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.floors")}`,
                    icon: "mdi:layers",
                    icon_color: "green",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: {
                        service: "browser_mod.sequence",
                        data: {
                          sequence: [
                            { service: "browser_mod.close_popup", data: {} },
                            { service: "browser_mod.navigate", data: { path: `/config/areas` } }
                          ]
                        }
                      }
                    }
                  },
                  {
                    type: "template",
                    content: `${totalDevices} ${Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.devices")}`,
                    icon: "mdi:devices",
                    icon_color: "purple",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: {
                        service: "browser_mod.sequence",
                        data: {
                          sequence: [
                            { service: "browser_mod.close_popup", data: {} },
                            { service: "browser_mod.navigate", data: { path: `/config/devices/dashboard` } }
                          ]
                        }
                      }
                    }
                  },
                  {
                    type: "template",
                    content: `${totalEntities} ${Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.entities")}`,
                    icon: "mdi:eye",
                    icon_color: "orange",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: {
                        service: "browser_mod.sequence",
                        data: {
                          sequence: [
                            { service: "browser_mod.close_popup", data: {} },
                            { service: "browser_mod.navigate", data: { path: `/config/entities` } }
                          ]
                        }
                      }
                    }
                  },
                  linusDeviceIds.length > 0 && {
                    type: "template",
                    content: `${linusDeviceIds.length} Magic Areas`,
                    icon: "mdi:magic-staff",
                    icon_color: "amber",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: {
                        service: "browser_mod.sequence",
                        data: {
                          sequence: [
                            { service: "browser_mod.close_popup", data: {} },
                            { service: "browser_mod.navigate", data: { path: `/config/integrations/integration/magic_areas` } }
                          ]
                        }
                      }
                    }
                  }
                ].filter(Boolean),
                card_mod: {
                  style: `ha-card { box-shadow: none; margin: 0; }`
                }
              },


              // Séparateur minimal
              {
                type: "custom:mushroom-template-card",
                primary: "",
                card_mod: {
                  style: `
                    ha-card {
                      height: 1px;
                      background: var(--divider-color);
                      box-shadow: none;
                      margin: 12px 0;
                    }
                  `
                }
              },

              // Actions rapides - Magic Areas & HA
              {
                type: "horizontal-stack",
                cards: [
                  linusDeviceIds.length > 0 && {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.reload_magic_areas"),
                    secondary: "Magic Areas",
                    icon: "mdi:refresh",
                    icon_color: "blue",
                    layout: "vertical",
                    tap_action: {
                      action: "call-service",
                      service: `homeassistant.reload_config_entry`,
                      target: { "device_id": linusDeviceIds },
                      confirmation: {
                        text: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.reload_confirm")
                      }
                    },
                    card_mod: {
                      style: `ha-card { box-shadow: none; margin: 2px; }`
                    }
                  },
                  linusDeviceIds.length > 0 && {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.magic_areas"),
                    icon: "mdi:magic-staff",
                    icon_color: "amber",
                    layout: "vertical",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: {
                        service: "browser_mod.sequence",
                        data: {
                          sequence: [
                            { service: "browser_mod.close_popup", data: {} },
                            { service: "browser_mod.navigate", data: { path: `/config/integrations/integration/magic_areas` } }
                          ]
                        }
                      }
                    },
                    card_mod: {
                      style: `ha-card { box-shadow: none; margin: 2px; }`
                    }
                  },
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.restart"),
                    icon: "mdi:restart",
                    icon_color: "red",
                    layout: "vertical",
                    tap_action: {
                      action: "call-service",
                      service: "homeassistant.restart",
                      confirmation: {
                        text: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.restart_confirm")
                      }
                    },
                    card_mod: {
                      style: `ha-card { box-shadow: none; margin: 2px; }`
                    }
                  }
                ].filter(Boolean)
              },

              // Configuration Home Assistant
              {
                type: "horizontal-stack",
                cards: [
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.dashboard_config"),
                    icon: "mdi:view-dashboard-edit",
                    icon_color: "cyan",
                    layout: "vertical",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: {
                        service: "browser_mod.sequence",
                        data: {
                          sequence: [
                            { service: "browser_mod.close_popup", data: {} },
                            { service: "browser_mod.navigate", data: { path: `/config/lovelace/dashboards` } }
                          ]
                        }
                      }
                    },
                    card_mod: {
                      style: `ha-card { box-shadow: none; margin: 2px; }`
                    }
                  },
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.logs"),
                    icon: "mdi:math-log",
                    icon_color: "amber",
                    layout: "vertical",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: {
                        service: "browser_mod.sequence",
                        data: {
                          sequence: [
                            { service: "browser_mod.close_popup", data: {} },
                            { service: "browser_mod.navigate", data: { path: `/config/logs` } }
                          ]
                        }
                      }
                    },
                    card_mod: {
                      style: `ha-card { box-shadow: none; margin: 2px; }`
                    }
                  }
                ]
              },

              // Séparateur minimal
              {
                type: "custom:mushroom-template-card",
                primary: "",
                card_mod: {
                  style: `
                    ha-card {
                      height: 1px;
                      background: var(--divider-color);
                      box-shadow: none;
                      margin: 12px 0;
                    }
                  `
                }
              },

              // Support & Documentation
              {
                type: "horizontal-stack",
                cards: [
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.github"),
                    icon: "mdi:github",
                    icon_color: "grey",
                    layout: "vertical",
                    tap_action: {
                      action: "url",
                      url_path: "https://github.com/Thank-you-Linus/Linus-Dashboard"
                    },
                    card_mod: {
                      style: `ha-card { box-shadow: none; margin: 2px; }`
                    }
                  },
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.documentation"),
                    icon: "mdi:book-open",
                    icon_color: "cyan",
                    layout: "vertical",
                    tap_action: {
                      action: "url",
                      url_path: "https://github.com/Thank-you-Linus/Linus-Dashboard#readme"
                    },
                    card_mod: {
                      style: `ha-card { box-shadow: none; margin: 2px; }`
                    }
                  },
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.issues"),
                    icon: "mdi:bug",
                    icon_color: "red",
                    layout: "vertical",
                    tap_action: {
                      action: "url",
                      url_path: "https://github.com/Thank-you-Linus/Linus-Dashboard/issues"
                    },
                    card_mod: {
                      style: `ha-card { box-shadow: none; margin: 2px; }`
                    }
                  }
                ]
              },

              // Message d'encouragement à mettre une étoile
              {
                type: "custom:mushroom-template-card",
                primary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.thank_you"),
                secondary: Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.star_message"),
                icon: "mdi:heart",
                icon_color: "red",
                layout: "horizontal",
                tap_action: {
                  action: "url",
                  url_path: "https://github.com/Thank-you-Linus/Linus-Dashboard"
                },
                card_mod: {
                  style: `
                    ha-card {
                      background: rgba(var(--rgb-primary-color), 0.1);
                      border: 1px solid rgba(var(--rgb-primary-color), 0.3);
                      box-shadow: none;
                      margin-top: 12px;
                      cursor: pointer;
                    }
                    ha-card:hover {
                      background: rgba(var(--rgb-primary-color), 0.15);
                    }
                  `
                }
              },

              // Version en bas
              {
                type: "custom:mushroom-template-card",
                primary: `${Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.version_info")} ${version}`,
                icon: "mdi:information",
                icon_color: "grey",
                layout: "horizontal",
                tap_action: { action: "none" },
                card_mod: {
                  style: `
                    ha-card {
                      background: transparent;
                      box-shadow: none;
                      margin-top: 8px;
                      font-size: 0.9em;
                      opacity: 0.7;
                    }
                  `
                }
              },
            ].filter(Boolean),
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
