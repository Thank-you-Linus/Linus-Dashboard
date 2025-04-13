import { Helper } from "../Helper";
import { generic } from "../types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { slugify } from "../utils";
import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class AreaInformations extends AbstractPopup {

    getDefaultConfig(minimalist: boolean, all_entities: string[], device?: MagicAreaRegistryEntry): PopupActionConfig {



        const { area_state } = device?.entities ?? {}

        const { adjoining_areas, features, presence_sensors, on_states } = Helper.getEntityState(area_state?.entity_id)?.attributes ?? {}

        const presenceEntities = presence_sensors ?? all_entities;

        presenceEntities?.sort((a: string, b: string) => {
            const aState = Helper.getEntityState(a);
            const bState = Helper.getEntityState(b);
            const lastChangeA = new Date(aState?.last_changed).getTime();
            const lastChangeB = new Date(bState?.last_changed).getTime();
            if (a === `switch.magic_areas_presence_hold_${slugify(device?.name)}`) {
                return -1;
            } else if (b === `switch.magic_areas_presence_hold_${slugify(device?.name)}`) {
                return 1;
            } else {
                return lastChangeB - lastChangeA;
            }
        });

        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: Helper.localize("component.linus_dashboard.entity.text.area_state_popup_title"),
                    content: {
                        type: "vertical-stack",
                        cards: [
                            (device && {
                                type: "horizontal-stack",
                                cards: [
                                    {
                                        type: "custom:mushroom-entity-card",
                                        entity: area_state?.entity_id,
                                        name: "Présence",
                                        secondary_info: "last-changed",
                                        color: "red",
                                        tap_action: device?.id ? {
                                            action: "fire-dom-event",
                                            browser_mod: {
                                                service: "browser_mod.sequence",
                                                data: {
                                                    sequence: [
                                                        {
                                                            service: "browser_mod.close_popup",
                                                            data: {}
                                                        },
                                                        {
                                                            service: "browser_mod.navigate",
                                                            data: { path: `/config/devices/device/${device?.id}` }
                                                        }
                                                    ]
                                                }
                                            }
                                        } : "more-info"
                                    },
                                    {
                                        type: "custom:mushroom-template-card",
                                        primary: "Recharger la pièce",
                                        icon: "mdi:refresh",
                                        icon_color: "blue",
                                        tap_action: {
                                            action: "call-service",
                                            service: `homeassistant.reload_config_entry`,
                                            target: { "device_id": device?.id },
                                        }
                                    },
                                ]
                            }),
                            ...(!minimalist ? [
                                {
                                    type: "custom:mushroom-template-card",
                                    primary: `Configuration de la pièce :`,
                                    card_mod: {
                                        style: `ha-card {padding: 4px 12px!important;}`
                                    }
                                },
                                {
                                    type: "custom:mushroom-chips-card",
                                    chips: [
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Type : {{ state_attr('${area_state?.entity_id}', 'type') }}`,
                                            icon: `
                                          {% set type = state_attr('${area_state?.entity_id}', 'type') %}
                                          {% if type == "interior" %}
                                              mdi:home-import-outline
                                          {% elif type == "exterior" %}
                                              mdi:home-import-outline
                                          {% else %}
                                              mdi:home-alert
                                          {% endif %}
                                      `,
                                        },
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Étage : {{ state_attr('${area_state?.entity_id}', 'floor') }}`,
                                            icon: `
                                          {% set floor = state_attr('${area_state?.entity_id}', 'floor') %}
                                          {% if floor == "third" %}
                                              mdi:home-floor-3
                                          {% elif floor == "second" %}
                                              mdi:home-floor-2
                                          {% elif floor == "first" %}
                                              mdi:home-floor-1
                                          {% elif floor == "ground" %}
                                              mdi:home-floor-g
                                          {% elif floor == "basement" %}
                                              mdi:home-floor-b
                                          {% else %}
                                              mdi:home-alert
                                          {% endif %}
                                      `,
                                        },
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Délai pièce vide : {{ state_attr('${area_state?.entity_id}', 'clear_timeout') }}s`,
                                            icon: `mdi:camera-timer`,
                                        },
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Interval mise à jour : {{ state_attr('${area_state?.entity_id}', 'update_interval') }}s`,
                                            icon: `mdi:update`,
                                        },
                                        {
                                            type: "template",
                                            entity: area_state?.entity_id,
                                            content: `Pièces adjacentes : ${adjoining_areas?.length ? adjoining_areas.join(' ') : 'Non défini'}`,
                                            icon: `mdi:view-dashboard-variant`,
                                        },
                                    ],
                                    card_mod: {
                                        style: `ha-card .chip-container * {margin-bottom: 0px!important;}`
                                    }
                                }
                            ] : []),
                            {
                                type: "custom:mushroom-template-card",
                                primary: Helper.localize("component.linus_dashboard.entity.text.area_state_popup"),
                                card_mod: {
                                    style: `ha-card {padding: 4px 12px!important;}`
                                }
                            },
                            (minimalist ? {
                                type: "vertical-stack",
                                cards: presenceEntities?.map((sensor: string) => ({
                                    type: "custom:mushroom-entity-card",
                                    entity: sensor,
                                    content_info: "name",
                                    secondary_info: "last-changed",
                                    icon_color: sensor.includes('media_player.') ? "blue" : "red",
                                }))
                            } :
                                {
                                    type: "custom:mushroom-chips-card",
                                    chips: presenceEntities?.map((sensor: string) => ({
                                        type: "entity",
                                        entity: sensor,
                                        content_info: "name",
                                        icon_color: sensor.includes('media_player.') ? "blue" : "red",
                                        tap_action: {
                                            action: "more-info"
                                        }
                                    })),
                                    card_mod: {
                                        style: `ha-card .chip-container * {margin-bottom: 0px!important;}`
                                    }
                                }),
                            ...(device && !minimalist ? [
                                {
                                    type: "custom:mushroom-template-card",
                                    primary: `Présence détecté pour les états :`,
                                    card_mod: {
                                        style: `ha-card {padding: 4px 12px!important;}`
                                    }
                                },
                                {
                                    type: "custom:mushroom-chips-card",
                                    chips: on_states?.map((sensor: string) => ({
                                        type: "template",
                                        content: sensor,
                                    })),
                                    card_mod: {
                                        style: `ha-card .chip-container * {margin-bottom: 0px!important;}`
                                    }
                                },
                                {
                                    type: "custom:mushroom-template-card",
                                    primary: `Fonctionnalitées disponibles :`,
                                    card_mod: {
                                        style: `ha-card {padding: 4px 12px!important;}`
                                    }
                                },
                                {
                                    type: "custom:mushroom-chips-card",
                                    chips: features?.map((sensor: string) => ({
                                        type: "template",
                                        content: sensor,
                                    })),
                                    card_mod: {
                                        style: `ha-card .chip-container * {margin-bottom: 0px!important;}`
                                    }
                                },
                            ] : [])
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
    constructor(minimalist: boolean = false, all_entities: string[], device?: MagicAreaRegistryEntry) {
        super();

        const defaultConfig = this.getDefaultConfig(minimalist, all_entities, device);

        this.config = Object.assign(this.config, defaultConfig);

    }
}

export { AreaInformations };
