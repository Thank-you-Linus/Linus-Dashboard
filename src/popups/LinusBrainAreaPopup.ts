import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";

import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Linus Brain Area Popup class.
 *
 * Shows Linus Brain status and controls specific to an area.
 */
class LinusBrainAreaPopup extends AbstractPopup {

    getDefaultConfig(area_slug: string): PopupActionConfig {

        const cards: any[] = [];
        const area = Helper.areas[area_slug];
        const areaName = area?.name || area_slug;

        // Get area-specific Linus Brain entities
        const activityEntity = `sensor.linus_brain_activity_${area_slug}`;
        const presenceEntity = `binary_sensor.linus_brain_presence_detection_${area_slug}`;
        const automaticLightingEntity = `switch.linus_brain_feature_automatic_lighting_${area_slug}`;
        const allLightsEntity = `light.linus_brain_all_lights_${area_slug}`;
        const activityDurationEntity = `sensor.linus_brain_activity_duration_${area_slug}`;
        const timeOccupiedEntity = `sensor.linus_brain_time_occupied_${area_slug}`;

        // Check if Linus Brain is available for this area
        const hasLinusBrain = !!Helper.entities[activityEntity] || !!Helper.entities[presenceEntity];

        if (!hasLinusBrain) {
            return {
                action: "fire-dom-event",
                browser_mod: {
                    service: "browser_mod.popup",
                    data: {
                        title: `Linus Brain - ${areaName}`,
                        content: {
                            type: "vertical-stack",
                            cards: [{
                                type: "custom:mushroom-template-card",
                                primary: "Linus Brain not configured",
                                secondary: "This area is not monitored by Linus Brain",
                                icon: "mdi:brain",
                                icon_color: "grey"
                            }]
                        }
                    }
                }
            };
        }

        // === Title ===
        cards.push({
            type: "custom:mushroom-title-card",
            title: `Linus Brain - ${areaName}`,
            subtitle: "Area intelligence status"
        });

        // === Activity & Presence Section ===
        const statusCards: any[] = [];

        // Activity state
        if (Helper.entities[activityEntity]) {
            statusCards.push({
                type: "custom:mushroom-entity-card",
                entity: activityEntity,
                name: "Activity State",
                icon: "mdi:motion-sensor",
                layout: "vertical",
                tap_action: { action: "more-info" },
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        // Presence detection
        if (Helper.entities[presenceEntity]) {
            statusCards.push({
                type: "custom:mushroom-entity-card",
                entity: presenceEntity,
                name: "Presence",
                icon: "mdi:account-eye",
                layout: "vertical",
                tap_action: { action: "more-info" },
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        // Activity duration
        if (Helper.entities[activityDurationEntity]) {
            statusCards.push({
                type: "custom:mushroom-entity-card",
                entity: activityDurationEntity,
                name: "Duration",
                icon: "mdi:timer-outline",
                layout: "vertical",
                tap_action: { action: "more-info" },
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        if (statusCards.length > 0) {
            cards.push({
                type: "horizontal-stack",
                cards: statusCards
            });
        }

        // === Statistics ===
        if (Helper.entities[timeOccupiedEntity]) {
            cards.push({
                type: "custom:mushroom-entity-card",
                entity: timeOccupiedEntity,
                name: "Time Occupied Today",
                icon: "mdi:clock-time-four-outline",
                tap_action: { action: "more-info" }
            });
        }

        // === Controls Section ===
        cards.push({
            type: "custom:mushroom-title-card",
            title: "Controls",
            subtitle: "Manage area automation"
        });

        const controlCards: any[] = [];

        // Automatic lighting switch
        if (Helper.entities[automaticLightingEntity]) {
            controlCards.push({
                type: "custom:mushroom-entity-card",
                entity: automaticLightingEntity,
                name: "Automatic Lighting",
                icon: "mdi:lightbulb-auto",
                layout: "vertical",
                tap_action: { action: "toggle" },
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        // All lights control
        if (Helper.entities[allLightsEntity]) {
            controlCards.push({
                type: "custom:mushroom-light-card",
                entity: allLightsEntity,
                name: "All Lights",
                icon: "mdi:lightbulb-group",
                layout: "vertical",
                use_light_color: true,
                show_brightness_control: true,
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        if (controlCards.length > 0) {
            cards.push({
                type: "horizontal-stack",
                cards: controlCards
            });
        }

        // === Configuration Link ===
        // Find the Linus Brain device for this area
        const linusBrainDevice = Object.values(Helper.devices).find(
            device => device.manufacturer === "Linus Brain" && 
                      device.model === "Area Intelligence" &&
                      device.area_id === area_slug
        );

        if (linusBrainDevice) {
            cards.push({
                type: "custom:mushroom-template-card",
                primary: "View Device Configuration",
                icon: "mdi:cog",
                icon_color: "cyan",
                tap_action: {
                    action: "fire-dom-event",
                    browser_mod: {
                        service: "browser_mod.sequence",
                        data: {
                            sequence: [
                                { service: "browser_mod.close_popup", data: {} },
                                { service: "browser_mod.navigate", data: { path: `/config/devices/device/${linusBrainDevice.id}` } }
                            ]
                        }
                    }
                }
            });
        }

        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: `Linus Brain - ${areaName}`,
                    content: {
                        type: "vertical-stack",
                        cards: cards
                    }
                }
            }
        };
    }

    /**
     * Class Constructor.
     */
    constructor(area_slug: string) {
        super();
        
        this.config = this.getDefaultConfig(area_slug);
    }
}

export { LinusBrainAreaPopup };
