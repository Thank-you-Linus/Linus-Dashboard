import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";

import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Linus Brain Popup class.
 *
 * Shows global Linus Brain integration status, diagnostics, and actions.
 */
class LinusBrainPopup extends AbstractPopup {

    getDefaultConfig(): PopupActionConfig {

        const cards: any[] = [];

        // Get global Linus Brain entities
        const cloudHealthEntity = "sensor.linus_brain_cloud_health";
        const lastSyncEntity = "sensor.linus_brain_sync";
        const errorsEntity = "sensor.linus_brain_errors";
        const roomsEntity = "sensor.linus_brain_rooms";
        const ruleEngineEntity = "sensor.linus_brain_rule_engine_stats";
        const syncButtonEntity = "button.linus_brain_sync";

        // Get states
        const cloudHealthState = Helper.getEntityState(cloudHealthEntity);
        const lastSyncState = Helper.getEntityState(lastSyncEntity);
        const errorsState = Helper.getEntityState(errorsEntity);
        const roomsState = Helper.getEntityState(roomsEntity);
        const ruleEngineState = Helper.getEntityState(ruleEngineEntity);

        // Get device IDs for reload action
        const linusBrainDevices = Object.values(Helper.devices).filter(
            device => device.manufacturer === "Linus Brain" && device.model === "Area Intelligence"
        );
        const linusBrainDeviceIds = linusBrainDevices.map(device => device.id);

        // === Status Section ===
        cards.push({
            type: "custom:mushroom-title-card",
            title: "Linus Brain Status",
            subtitle: "Integration diagnostics"
        });

        // Status chips (horizontal stack)
        const statusChips: any[] = [];

        // Cloud Health
        if (cloudHealthState && cloudHealthState.state !== "unavailable") {
            const healthValue = cloudHealthState.state;
            let healthColor = "green";
            let healthIcon = "mdi:check-circle";
            
            if (healthValue === "disconnected") {
                healthColor = "red";
                healthIcon = "mdi:close-circle";
            } else if (healthValue === "degraded") {
                healthColor = "orange";
                healthIcon = "mdi:alert-circle";
            }

            statusChips.push({
                type: "custom:mushroom-template-card",
                primary: "Cloud",
                secondary: healthValue.charAt(0).toUpperCase() + healthValue.slice(1),
                icon: healthIcon,
                icon_color: healthColor,
                layout: "vertical",
                tap_action: { action: "more-info", entity: cloudHealthEntity },
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        // Last Sync
        if (lastSyncState && lastSyncState.state !== "unavailable") {
            statusChips.push({
                type: "custom:mushroom-entity-card",
                entity: lastSyncEntity,
                name: "Last Sync",
                icon: "mdi:clock-check-outline",
                icon_color: "blue",
                layout: "vertical",
                secondary_info: "last-changed",
                tap_action: { action: "more-info" },
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        // Errors
        if (errorsState && errorsState.state !== "unavailable") {
            const errorCount = parseInt(errorsState.state) || 0;
            const successRate = errorsState.attributes?.success_rate || "N/A";
            
            statusChips.push({
                type: "custom:mushroom-template-card",
                primary: "Errors",
                secondary: `${errorCount} (${successRate}% success)`,
                icon: errorCount > 0 ? "mdi:alert" : "mdi:check",
                icon_color: errorCount > 5 ? "red" : errorCount > 0 ? "orange" : "green",
                layout: "vertical",
                tap_action: { action: "more-info", entity: errorsEntity },
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        if (statusChips.length > 0) {
            cards.push({
                type: "horizontal-stack",
                cards: statusChips
            });
        }

        // === Monitored Areas ===
        if (roomsState && roomsState.state !== "unavailable") {
            cards.push({
                type: "custom:mushroom-title-card",
                title: "Monitored Areas",
                subtitle: `${roomsState.state} active room${parseInt(roomsState.state) !== 1 ? 's' : ''}`
            });

            // Get list of areas from Linus Brain devices
            const linusBrainAreas = linusBrainDevices
                .map(device => {
                    // Extract area_id from device
                    const areaId = device.area_id;
                    if (areaId && Helper.areas[areaId]) {
                        const area = Helper.areas[areaId];
                        return {
                            area_id: areaId,
                            area_name: area.name || areaId,
                            device_id: device.id
                        };
                    }
                    return null;
                })
                .filter(Boolean);

            if (linusBrainAreas.length > 0) {
                // Show list of areas as chips
                const areaChips = linusBrainAreas
                    .filter((areaInfo): areaInfo is NonNullable<typeof areaInfo> => areaInfo !== null)
                    .map(areaInfo => ({
                        type: "custom:mushroom-template-card",
                        primary: areaInfo.area_name,
                        icon: "mdi:home-map-marker",
                        icon_color: "cyan",
                        layout: "horizontal",
                        tap_action: {
                            action: "navigate",
                            navigation_path: `/config/devices/device/${areaInfo.device_id}`
                        },
                        card_mod: {
                            style: `ha-card { box-shadow: none; margin: 4px 0; }`
                        }
                    }));

                areaChips.forEach(chip => cards.push(chip));
            } else {
                cards.push({
                    type: "custom:mushroom-template-card",
                    primary: "No area details available",
                    secondary: "Configure Linus Brain devices to see monitored areas",
                    icon: "mdi:information-outline",
                    icon_color: "grey"
                });
            }
        }

        // === Rule Engine Stats ===
        if (ruleEngineState && ruleEngineState.state !== "unavailable") {
            cards.push({
                type: "custom:mushroom-entity-card",
                entity: ruleEngineEntity,
                name: "Rule Engine Statistics",
                icon: "mdi:engine",
                secondary_info: "state",
                tap_action: { action: "more-info" }
            });
        }

        // === Performance Graphs ===
        cards.push({
            type: "custom:mushroom-title-card",
            title: "Performance Metrics",
            subtitle: "Error rate and sync history"
        });

        // Error history graph
        if (errorsState && errorsState.state !== "unavailable") {
            cards.push({
                type: "history-graph",
                entities: [
                    {
                        entity: errorsEntity,
                        name: "Errors"
                    }
                ],
                hours_to_show: 24,
                refresh_interval: 0
            });
        }

        // === Actions Section ===
        cards.push({
            type: "custom:mushroom-title-card",
            title: "Actions",
            subtitle: "Manage Linus Brain integration"
        });

        const actionButtons: any[] = [];

        // Sync Now button
        if (Helper.entities[syncButtonEntity]) {
            actionButtons.push({
                type: "custom:mushroom-template-card",
                primary: "Sync Now",
                icon: "mdi:sync",
                icon_color: "cyan",
                layout: "vertical",
                tap_action: {
                    action: "call-service",
                    service: "button.press",
                    target: { entity_id: syncButtonEntity },
                    confirmation: {
                        text: "Force synchronization with Linus Brain cloud?"
                    }
                },
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        // Reload integration button
        if (linusBrainDeviceIds.length > 0) {
            actionButtons.push({
                type: "custom:mushroom-template-card",
                primary: "Reload",
                icon: "mdi:refresh",
                icon_color: "blue",
                layout: "vertical",
                tap_action: {
                    action: "call-service",
                    service: "homeassistant.reload_config_entry",
                    target: { device_id: linusBrainDeviceIds },
                    confirmation: {
                        text: "Reload Linus Brain integration?"
                    }
                },
                card_mod: {
                    style: `ha-card { box-shadow: none; margin: 2px; }`
                }
            });
        }

        // Configure button
        actionButtons.push({
            type: "custom:mushroom-template-card",
            primary: "Configure",
            icon: "mdi:cog",
            icon_color: "cyan",
            layout: "vertical",
            tap_action: {
                action: "fire-dom-event",
                browser_mod: {
                    service: "browser_mod.sequence",
                    data: {
                        sequence: [
                            { service: "browser_mod.close_popup", data: {} },
                            { service: "browser_mod.navigate", data: { path: `/config/integrations/integration/linus_brain` } }
                        ]
                    }
                }
            },
            card_mod: {
                style: `ha-card { box-shadow: none; margin: 2px; }`
            }
        });

        if (actionButtons.length > 0) {
            cards.push({
                type: "horizontal-stack",
                cards: actionButtons
            });
        }

        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: "Linus Brain",
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
    constructor() {
        super();
        
        this.config = this.getDefaultConfig();
    }
}

export { LinusBrainPopup };
