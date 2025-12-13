import { PopupActionConfig } from "../types/homeassistant/data/lovelace";

import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Scene Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class TeslaPopup extends AbstractPopup {

  getDefaultConfig(): PopupActionConfig {

    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: "Configurer les scènes",
          content: {
            type: "vertical-stack",
            cards: [
              {
                type: "conditional",
                condition: "and",
                conditions: [
                  {
                    entity: "input_boolean.tesla_charger_menu",
                    state: "off"
                  },
                  {
                    entity: "input_boolean.tesla_controls_menu",
                    state: "off"
                  },
                  {
                    entity: "input_boolean.tesla_climate_menu",
                    state: "off"
                  }
                ],
                card: {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "picture-elements",
                      image: "/local/homeassistant-fe-tesla-main/images/models/3/red/baseWide.jpg",
                      entity: "button.fennec_force_data_update",
                      elements: [
                        {
                          type: "state-label",
                          entity: "sensor.fennec_range",
                          style: {
                            top: "7.2%",
                            left: "22%",
                            fontweight: "bold",
                            fontsize: "100%",
                            color: "#8a8a8d",
                            fontfamily: "gotham"
                          }
                        },
                        {
                          type: "state-icon",
                          show_name: true,
                          title: "Refresh Data",
                          entity: "button.fennec_force_data_update",
                          icon: "mdi:refresh",
                          style: {
                            top: "9.5%",
                            left: "90%",
                            color: "#039be5",
                            width: "40px",
                            height: "50px"
                          },
                          tap_action: {
                            action: "call-service",
                            service: "button.press",
                            service_data: {},
                            target: {
                              entity_id: "button.fennec_force_data_update"
                            }
                          },
                          double_tap_action: "none",
                          hold_action: "none"
                        },
                        {
                          type: "image",
                          title: "Unlock",
                          style: {
                            top: "30%",
                            left: "90%",
                            width: "40px",
                            height: "40px"
                          },
                          state_image: {
                            locked: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Door_Lock.jpg",
                            unlocked: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Door_Unlock.jpg"
                          },
                          tap_action: {
                            action: "toggle"
                          },
                          entity: "lock.fennec_doors",
                          double_tap_action: "none",
                          hold_action: "none"
                        },
                        {
                          type: "image",
                          title: "ClimateIcon",
                          image: "/local/homeassistant-fe-tesla-main/images/buttonsTesla_Climate_Fan_On.jpg",
                          style: {
                            top: "50%",
                            left: "90%",
                            width: "40px",
                            height: "40px"
                          },
                          state_image: {
                            off: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Fan_Off.jpg"
                          },
                          tap_action: {
                            action: "toggle"
                          },
                          entity: "climate.fennec_hvac_climate_system",
                          double_tap_action: "none",
                          hold_action: "none"
                        },
                        {
                          type: "image",
                          title: "Unlock",
                          image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Charge_Port_Closed.jpg",
                          style: {
                            top: "72%",
                            left: "90%",
                            width: "40px",
                            height: "40px"
                          },
                          tap_action: {
                            action: "toggle"
                          },
                          entity: "input_boolean.tesla_charger_menu",
                          double_tap_action: "none",
                          hold_action: "none"
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "cover.fennec_charger_door",
                              state: "open"
                            }
                          ],
                          elements: [
                            {
                              type: "image",
                              title: "Charger_Door_Body",
                              style: {
                                top: "55.2%",
                                left: "50.9%",
                                width: "298px",
                                height: "298px"
                              },
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_ChargePort_Opened.jpg"
                            }
                          ]
                        },
                        {
                          type: "image",
                          title: "Frunk",
                          image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Frunk_Closed.jpg",
                          style: {
                            top: "90%",
                            left: "90%",
                            width: "40px",
                            height: "40px"
                          },
                          state_image: {
                            opened: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Frunk_Opened.jpg"
                          },
                          tap_action: {
                            action: "toggle"
                          },
                          entity: "cover.fennec_frunk",
                          double_tap_action: "none",
                          hold_action: "none"
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "cover.fennec_frunk",
                              state: "open"
                            }
                          ],
                          elements: [
                            {
                              type: "image",
                              title: "Frunk_Body",
                              style: {
                                top: "55%",
                                left: "50.9%",
                                width: "288px",
                                height: "288px"
                              },
                              image: "/local/homeassistant-fe-tesla-main/images/models/3/red/baseFrunkOpened.jpg"
                            }
                          ]
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "cover.fennec_charger_door",
                              state: "open"
                            }
                          ],
                          elements: [
                            {
                              type: "icon",
                              icon: "mdi:ev-plug-tesla",
                              tap_action: "toggle",
                              double_tap_action: "none",
                              hold_action: "none",
                              style: {
                                top: "13%",
                                left: "21%",
                                color: "#039be5"
                              }
                            }
                          ]
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "cover.fennec_charger_door",
                              state_not: "open"
                            }
                          ],
                          elements: [
                            {
                              type: "icon",
                              icon: "mdi:ev-plug-tesla",
                              tap_action: "none",
                              double_tap_action: "none",
                              hold_action: "none",
                              style: {
                                top: "13%",
                                left: "21%",
                                color: "black"
                              }
                            }
                          ]
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "binary_sensor.fennec_charger",
                              state: "on"
                            }
                          ],
                          elements: [
                            {
                              type: "state-label",
                              entity: "sensor.fennec_charging_rate",
                              tap_action: "none",
                              double_tap_action: "none",
                              hold_action: "none",
                              style: {
                                top: "26%",
                                left: "21%",
                                fontsize: "100%",
                                fontweight: "normal",
                                color: "#039be5"
                              }
                            }
                          ]
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "binary_sensor.fennec_charger",
                              state: "on"
                            }
                          ],
                          elements: [
                            {
                              type: "state-label",
                              entity: "binary_sensor.fennec_charger",
                              attribute: "charging_state",
                              tap_action: "none",
                              double_tap_action: "none",
                              hold_action: "none",
                              style: {
                                top: "22%",
                                left: "21%",
                                fontsize: "100%",
                                fontweight: "normal",
                                color: "#039be5"
                              }
                            }
                          ]
                        },
                        {
                          type: "image",
                          title: "Controls",
                          image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Controls_Button_Stateless.jpg",
                          style: {
                            top: "80%",
                            left: "42%",
                            width: "400px",
                            height: "100px"
                          },
                          tap_action: {
                            action: "toggle"
                          },
                          entity: "input_boolean.tesla_controls_menu",
                          double_tap_action: "none",
                          hold_action: "none"
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "climate.fennec_hvac_climate_system",
                              state: "off"
                            }
                          ],
                          elements: [
                            {
                              type: "image",
                              title: "ClimateControls",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Button_Off.jpg",
                              style: {
                                fontfamily: "gotham",
                                top: "96%",
                                left: "42%",
                                width: "400px",
                                height: "100px"
                              },
                              tap_action: {
                                action: "toggle"
                              },
                              entity: "input_boolean.tesla_climate_menu",
                              double_tap_action: "none",
                              hold_action: "none"
                            }
                          ]
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "climate.fennec_hvac_climate_system",
                              state: "heat_cool"
                            }
                          ],
                          elements: [
                            {
                              type: "image",
                              title: "ClimateControls",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Button_On.jpg",
                              style: {
                                fontfamily: "gotham",
                                top: "96%",
                                left: "42%",
                                width: "400px",
                                height: "100px"
                              },
                              tap_action: {
                                action: "toggle"
                              },
                              entity: "input_boolean.tesla_climate_menu",
                              double_tap_action: "none",
                              hold_action: "none"
                            }
                          ]
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "climate.fennec_hvac_climate_system",
                              state: "heat_cool"
                            }
                          ],
                          elements: [
                            {
                              type: "state-label",
                              entity: "sensor.fennec_temperature_inside",
                              style: {
                                top: "94.44%",
                                left: "41.3%",
                                fontsize: "97%",
                                color: "#8a8a8d",
                                fontfamily: "gotham"
                              }
                            }
                          ]
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "climate.fennec_hvac_climate_system",
                              state: "off"
                            }
                          ],
                          elements: [
                            {
                              type: "state-label",
                              entity: "sensor.fennec_temperature_inside",
                              style: {
                                top: "94.44%",
                                left: "30.3%",
                                fontsize: "97%",
                                color: "#8a8a8d",
                                fontfamily: "gotham"
                              }
                            }
                          ]
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "binary_sensor.fennec_ischarging",
                              state: "on"
                            },
                            {
                              entity: "device_tracker.fennec_location_tracker",
                              state: "home"
                            }
                          ],
                          elements: [
                            {
                              type: "icon",
                              icon: "mdi:home-lightning-bolt-outline",
                              tap_action: "none",
                              double_tap_action: "none",
                              hold_action: "none",
                              style: {
                                top: "84.7%",
                                left: "55%",
                                color: "green"
                              }
                            }
                          ]
                        },
                        {
                          type: "conditional",
                          conditions: [
                            {
                              entity: "binary_sensor.fennec_ischarging",
                              state: "on"
                            },
                            {
                              entity: "device_tracker.fennec_location_tracker",
                              state_not: "home"
                            }
                          ],
                          elements: [
                            {
                              type: "icon",
                              icon: "mdi:ev-station",
                              tap_action: "none",
                              double_tap_action: "none",
                              hold_action: "none",
                              style: {
                                top: "84.7%",
                                left: "55%",
                                color: "green"
                              }
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              },
              {
                type: "conditional",
                conditions: [
                  {
                    entity: "input_boolean.tesla_charger_menu",
                    state: "on"
                  }
                ],
                card: {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "horizontal-stack",
                      cards: [
                        {
                          type: "markdown",
                          content: "Charge limit: <font color=white> {{states('number.fennec_charge_limit')}} % </font>\n<font color=#8a8a8d> {{state_attr('sensor.fennec_energy_added', 'added_range')}} km added during last charging session </font>  ",
                          card_mod: {
                            style: "ha-card {\nfont-family: gotham;\nborder: none;\n}\n"
                          }
                        }
                      ]
                    },
                    {
                      type: "entities",
                      entities: [
                        {
                          type: "custom:slider-entity-row",
                          entity: "number.fennec_charge_limit",
                          full_row: true,
                          step: 5,
                          max: 100,
                          min: 0,
                          colorize: true,
                          hide_state: true,
                          card_mod: {
                            style: "ha-card {\n  font-family: gotham;\n  border: none;\n}\n"
                          }
                        }
                      ]
                    },
                    {
                      type: "horizontal-stack",
                      cards: [
                        {
                          type: "markdown",
                          content: "\\<",
                          card_mod: {
                            style: "ha-card {\n  font-family: gotham;\n  border: none;\n  text-align: left;\n}\n"
                          }
                        },
                        {
                          type: "glance",
                          entities: [
                            {
                              entity: "number.fennec_charging_amps"
                            }
                          ],
                          show_icon: false,
                          show_name: false,
                          card_mod: {
                            style: "ha-card {\n  font-family: gotham;\n  border: none;\n  color: white;\n  font-weight: bold;\n}\n"
                          }
                        },
                        {
                          type: "markdown",
                          content: "\\>",
                          card_mod: {
                            style: "ha-card {\n  font-family: gotham;\n  border: none;\n  text-align: right;\n}\n"
                          }
                        }
                      ]
                    },
                    {
                      type: "button",
                      tap_action: {
                        action: "toggle"
                      },
                      entity: "input_boolean.tesla_charger_menu",
                      show_state: false,
                      show_icon: true,
                      show_name: false,
                      icon: "mdi:arrow-down",
                      icon_height: "15px",
                      card_mod: {
                        style: "ha-card {\n  font-family: gotham;\n  font-weight: bold;\n  border: none;\n}\n"
                      }
                    }
                  ]
                }
              },
              {
                type: "conditional",
                conditions: [
                  {
                    entity: "input_boolean.tesla_controls_menu",
                    state: "on"
                  }
                ],
                card: {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "horizontal-stack",
                      cards: [
                        {
                          type: "picture-elements",
                          image: "/local/homeassistant-fe-tesla-main/images/models/3/red/controlsBackground.jpg",
                          entity: "button.fennec_force_data_update",
                          elements: [
                            {
                              type: "state-label",
                              entity: "sensor.fennec_range",
                              style: {
                                top: "7.2%",
                                left: "22%",
                                fontweight: "bold",
                                fontsize: "100%",
                                color: "#8a8a8d",
                                fontfamily: "gotham"
                              },
                              card_mod: {
                                style: "ha-card {\n  font-family: gotham;\n  border: none;\n}\n"
                              }
                            },
                            {
                              type: "image",
                              title: "Flash",
                              entity: "button.fennec_flash_lights",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Flash_Lights_Button.jpg",
                              style: {
                                top: "20%",
                                left: "70%",
                                width: "40px",
                                height: "40px"
                              },
                              tap_action: {
                                action: "call-service",
                                service: "button.press",
                                service_data: {},
                                target: {
                                  entity_id: "button.fennec_flash_lights"
                                }
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "image",
                              title: "Horn",
                              entity: "button.fennec_horn",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Horn_Button.jpg",
                              style: {
                                top: "40%",
                                left: "70%",
                                width: "40px",
                                height: "40px"
                              },
                              tap_action: {
                                action: "call-service",
                                service: "button.press",
                                service_data: {},
                                target: {
                                  entity_id: "button.fennec_horn"
                                }
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "image",
                              title: "Remote Start",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Remote_Start_Button_Off.jpg",
                              style: {
                                top: "60%",
                                left: "70%",
                                width: "40px",
                                height: "40px"
                              },
                              tap_action: {
                                action: "call-service",
                                service: "button.press",
                                service_data: {},
                                target: {
                                  entity_id: "button.fennec_remote_start"
                                }
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "image",
                              title: "Vent",
                              state_image: {
                                opened: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Close_Windows_Button.jpg",
                                closed: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Vent_Windows_Button.jpg"
                              },
                              style: {
                                top: "80%",
                                left: "70%",
                                width: "40px",
                                height: "40px"
                              },
                              tap_action: {
                                action: "toggle"
                              },
                              entity: "cover.fennec_windows",
                              double_tap_action: "none",
                              hold_action: "none"
                            }
                          ]
                        }
                      ]
                    },
                    {
                      type: "button",
                      tap_action: {
                        action: "toggle"
                      },
                      entity: "input_boolean.tesla_controls_menu",
                      show_state: false,
                      show_icon: true,
                      show_name: false,
                      icon: "mdi:arrow-down",
                      icon_height: "15px",
                      card_mod: {
                        style: "ha-card {\n  font-family: gotham;\n  font-weight: bold;\n  border: none;\n}\n"
                      }
                    }
                  ]
                }
              },
              {
                type: "conditional",
                conditions: [
                  {
                    entity: "input_boolean.tesla_climate_menu",
                    state: "on"
                  }
                ],
                card: {
                  type: "custom:stack-in-card",
                  cards: [
                    {
                      type: "horizontal-stack",
                      cards: [
                        {
                          type: "picture-elements",
                          image: "/local/homeassistant-fe-tesla-main/images/models/3/red/climateBackground_Fire8HD.jpg",
                          entity: "button.fennec_force_data_update",
                          elements: [
                            {
                              type: "image",
                              title: "Heated_Seat_Left",
                              entity: "select.fennec_heated_seat_left",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                              style: {
                                top: "31%",
                                left: "25.9%",
                                width: "25px",
                                height: "25px"
                              },
                              tap_action: {
                                action: "call-service",
                                service: "button.press",
                                service_data: {},
                                target: {
                                  entity_id: "select.fennec_heated_seat_left"
                                }
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "image",
                              title: "Heated_Seat_Right",
                              entity: "select.fennec_heated_seat_right",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                              style: {
                                top: "31%",
                                left: "38%",
                                width: "25px",
                                height: "25px"
                              },
                              tap_action: {
                                action: "call-service",
                                service: "button.press",
                                service_data: {},
                                target: {
                                  entity_id: "select.fennec_heated_seat_right"
                                }
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "image",
                              title: "Heated_Seat_Rear_Left",
                              entity: "select.fennec_heated_seat_rear_left",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                              style: {
                                top: "50%",
                                left: "25.9%",
                                width: "25px",
                                height: "25px"
                              },
                              tap_action: {
                                action: "call-service",
                                service: "button.press",
                                service_data: {},
                                target: {
                                  entity_id: "select.fennec_heated_seat_rear_left"
                                }
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "image",
                              title: "Heated_Seat_Rear_Center",
                              entity: "select.fennec_heated_seat_rear_center",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                              style: {
                                top: "50%",
                                left: "31.5%",
                                width: "25px",
                                height: "25px"
                              },
                              tap_action: {
                                action: "call-service",
                                service: "button.press",
                                service_data: {},
                                target: {
                                  entity_id: "select.fennec_heated_seat_rear_center"
                                }
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "image",
                              title: "Heated_Seat_Rear_Right",
                              entity: "select.fennec_heated_seat_rear_right",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Heated_Seat_Off.jpg",
                              style: {
                                top: "50%",
                                left: "37.2%",
                                width: "25px",
                                height: "25px"
                              },
                              tap_action: {
                                action: "call-service",
                                service: "button.press",
                                service_data: {},
                                target: {
                                  entity_id: "select.fennec_heated_seat_rear_right"
                                }
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "state-label",
                              prefix: "Interior ",
                              entity: "sensor.fennec_temperature_inside",
                              style: {
                                top: "20%",
                                left: "64%",
                                fontsize: "92%",
                                color: "#8a8a8d",
                                fontfamily: "gotham"
                              }
                            },
                            {
                              type: "state-label",
                              prefix: "- Exterior ",
                              entity: "sensor.fennec_temperature_outside",
                              style: {
                                top: "20%",
                                left: "87%",
                                fontsize: "92%",
                                color: "#8a8a8d",
                                fontfamily: "gotham"
                              }
                            },
                            {
                              type: "image",
                              title: "Climate",
                              entity: "climate.fennec_hvac_climate_system",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Button_Power_Off.jpg",
                              style: {
                                top: "40%",
                                left: "58%",
                                width: "50px",
                                height: "50px"
                              },
                              tap_action: {
                                action: "toggle",
                                entity_id: "climate.fennec_hvac_climate_system"
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "state-label",
                              entity: "climate.fennec_hvac_climate_system",
                              attribute: "temperature",
                              style: {
                                top: "42.5%",
                                left: "73.7%",
                                fontsize: "200%",
                                fontfamily: "gotham",
                                color: "white"
                              }
                            },
                            {
                              type: "image",
                              title: "Vent_Windows",
                              entity: "cover.fennec_windows",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Vent_Windows_Button.jpg",
                              style: {
                                top: "41%",
                                left: "90.5%",
                                width: "60px",
                                height: "60px"
                              },
                              tap_action: {
                                action: "toggle"
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "image",
                              title: "Defrost",
                              entity: "cover.fennec_windows",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Tesla_Climate_Button_Defrost_Off_324.jpg",
                              style: {
                                top: "77%",
                                left: "74.5%",
                                width: "210px",
                                height: "150px"
                              },
                              tap_action: {
                                action: "toggle"
                              },
                              double_tap_action: "none",
                              hold_action: "none"
                            },
                            {
                              type: "image",
                              title: "Defrost",
                              image: "/local/homeassistant-fe-tesla-main/images/buttons/Telsa_Back_Button.jpg",
                              style: {
                                top: "8%",
                                left: "7%",
                                width: "50px",
                                height: "50px"
                              },
                              tap_action: {
                                action: "toggle"
                              },
                              entity: "input_boolean.tesla_climate_menu"
                            }
                          ]
                        }
                      ]
                    }
                  ]
                }
              },
              {
                type: "map",
                entities: [
                  {
                    entity: "device_tracker.fennec_location_tracker"
                  }
                ],
                hours_to_show: 24,
                dark_mode: true,
                default_zoom: 12
              }
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

export { TeslaPopup };
