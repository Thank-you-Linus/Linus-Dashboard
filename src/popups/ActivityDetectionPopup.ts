import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Activity Detection Popup class.
 *
 * Shows activity detection information with activity history graph and presence sensors.
 */
class ActivityDetectionPopup extends AbstractPopup {

    getDefaultConfig(area_slug: string): PopupActionConfig {

        const resolver = Helper.entityResolver;
        
        // Get Linus Brain entities
        const activityResolution = resolver.resolveAreaState(area_slug);
        const activityEntity = activityResolution.entity_id;
        const presenceSensorResolution = resolver.resolvePresenceSensor(area_slug);
        const presenceSensorEntity = presenceSensorResolution.entity_id;
        const isLinusBrain = activityResolution.source === "linus_brain";

        // Get all presence-related entities in the area
        const motion_entities = Helper.getEntityIds({ 
            domain: "binary_sensor", 
            device_class: "motion", 
            area_slug 
        });
        const occupancy_entities = Helper.getEntityIds({ 
            domain: "binary_sensor", 
            device_class: "occupancy", 
            area_slug 
        });
        const presence_entities = Helper.getEntityIds({ 
            domain: "binary_sensor", 
            device_class: "presence", 
            area_slug 
        });

        // Get entities from Linus Brain presence detection group if it exists
        const presenceGroupEntity = `binary_sensor.linus_brain_presence_detection_${area_slug}`;
        const presenceGroupState = Helper.getEntityState(presenceGroupEntity);
        const groupMemberEntities: string[] = [];
        
        if (presenceGroupState?.attributes?.entity_id) {
            // Add group members to the list
            const members = presenceGroupState.attributes.entity_id;
            if (Array.isArray(members)) {
                groupMemberEntities.push(...members);
            }
        }

        const allPresenceEntities = [
            ...motion_entities,
            ...occupancy_entities,
            ...presence_entities,
            ...groupMemberEntities
        ].filter((entity, index, self) => self.indexOf(entity) === index); // Remove duplicates

        const area = Helper.areas[area_slug];
        const areaName = area?.name || area_slug;

        const cards: any[] = [];

        // Activity history graph (for Linus Brain)
        if (isLinusBrain && activityEntity) {
            // Get Linus Brain device_id from the activity entity
            const activityEntityRegistry = Helper.entities[activityEntity];
            const linusBrainDeviceId = activityEntityRegistry?.device_id;

            // === COMPACT: Activity & Presence Status ===
            const statusChips: any[] = [];
            
            // Activity entity with dynamic icon - NO secondary to avoid redundancy
            statusChips.push({
                type: "custom:mushroom-template-card",
                primary: "Activity",
                icon: `
                    {% set state = states('${activityEntity}') %}
                    {% if state == 'occupied' %}
                        mdi:account
                    {% elif state == 'movement' %}
                        mdi:run
                    {% elif state == 'inactive' %}
                        mdi:account-clock
                    {% else %}
                        mdi:account-off
                    {% endif %}
                `,
                icon_color: `
                    {% set state = states('${activityEntity}') %}
                    {% if state == 'occupied' %}
                        green
                    {% elif state == 'movement' %}
                        orange
                    {% elif state == 'inactive' %}
                        blue
                    {% else %}
                        grey
                    {% endif %}
                `,
                layout: "vertical",
                tap_action: { action: "more-info", entity: activityEntity },
                card_mod: {
                    style: "ha-card { box-shadow: none; margin: 2px; }"
                }
            });

            // Duration if available
            const durationEntity = `sensor.linus_brain_activity_duration_${area_slug}`;
            const durationState = Helper.getEntityState(durationEntity);
            if (durationState && durationState.state !== "unavailable") {
                statusChips.push({
                    type: "custom:mushroom-entity-card",
                    entity: durationEntity,
                    name: "Duration",
                    icon: "mdi:timer-outline",
                    layout: "vertical",
                    tap_action: { action: "more-info" },
                    card_mod: {
                        style: "ha-card { box-shadow: none; margin: 2px; }"
                    }
                });
            }

            // Presence if available - NO secondary to avoid redundancy
            if (presenceSensorEntity) {
                statusChips.push({
                    type: "custom:mushroom-template-card",
                    primary: "Presence",
                    icon: "mdi:account-search",
                    icon_color: `{{ 'red' if is_state('${presenceSensorEntity}', 'on') else 'grey' }}`,
                    layout: "vertical",
                    tap_action: { action: "more-info", entity: presenceSensorEntity },
                    card_mod: {
                        style: "ha-card { box-shadow: none; margin: 2px; }"
                    }
                });
            }

            // Linus Brain config button if available
            if (linusBrainDeviceId) {
                statusChips.push({
                    type: "custom:mushroom-template-card",
                    primary: "Config",
                    icon: "mdi:cog",
                    icon_color: "blue",
                    layout: "vertical",
                    tap_action: {
                        action: "navigate",
                        navigation_path: `/config/devices/device/${linusBrainDeviceId}`
                    },
                    card_mod: {
                        style: "ha-card { box-shadow: none; margin: 2px; }"
                    }
                });
            }

            // Add horizontal stack with all status chips
            cards.push({
                type: "horizontal-stack",
                cards: statusChips
            });

            // === Activity Details ===
            const activityState = Helper.getEntityState(activityEntity);
            
            if (activityState?.attributes) {
                // === Activity Details Markdown (Horizontal Format) ===
                const attrs = activityState.attributes;
                const markdownParts: string[] = [];
                
                // Build horizontal markdown based on available attributes
                if (attrs.seconds_until_timeout !== undefined && attrs.seconds_until_timeout > 0) {
                    markdownParts.push(`⏱️ ${attrs.seconds_until_timeout}s`);
                }
                
                if (attrs.is_dark !== undefined) {
                    const isDark = attrs.is_dark === true || attrs.is_dark === "true";
                    markdownParts.push(`${isDark ? '🌙 Dark' : '☀️ Bright'}`);
                }
                
                // Show active sensor names instead of count
                if (attrs.active_presence_entities !== undefined && Array.isArray(attrs.active_presence_entities)) {
                    const activeEntities = attrs.active_presence_entities;
                    if (activeEntities.length > 0) {
                        // Get friendly names of active sensors
                        const sensorNames = activeEntities.map(entityId => {
                            const state = Helper.getEntityState(entityId);
                            const friendlyName = state?.attributes?.friendly_name || entityId;
                            // Extract short name (remove area prefix if present)
                            return friendlyName.replace(new RegExp(`^${areaName}\\s+`, 'i'), '');
                        }).join(', ');
                        markdownParts.push(`👥 ${sensorNames}`);
                    }
                }
                
                // Add markdown card if we have content (horizontal single line)
                if (markdownParts.length > 0) {
                    cards.push({
                        type: "markdown",
                        content: markdownParts.join(' • '),
                        card_mod: {
                            style: "ha-card { box-shadow: none; padding: 8px 16px; }"
                        }
                    });
                }
            }

            // === REORGANIZE LIKE MORE-INFO MODAL ===
            // 1. Combined History Graphs (Activity + Presence)
            const historyEntities: any[] = [
                {
                    entity: activityEntity,
                    name: "Activity"
                }
            ];
            
            if (presenceSensorEntity) {
                historyEntities.push({
                    entity: presenceSensorEntity,
                    name: "Presence"
                });
            }
            
            // Count total sensors (excluding the group entity itself)
            const sensorCount = allPresenceEntities.filter(e => e !== presenceGroupEntity).length;
            
            cards.push({
                type: "custom:mushroom-title-card",
                title: "History",
                subtitle: `Last 24 hours`
            });
            
            cards.push({
                type: "history-graph",
                entities: historyEntities,
                hours_to_show: 24,
                refresh_interval: 60
            });

            // 2. Presence Sensors Section
            if (presenceSensorEntity || allPresenceEntities.length > 0) {
                cards.push({
                    type: "custom:mushroom-title-card",
                    title: "Presence Sensors",
                    subtitle: `${sensorCount} sensor${sensorCount !== 1 ? 's' : ''}`
                });

                // Show individual sensors if available
                if (allPresenceEntities.length > 0) {
                    // Sort by state (on first) then by last changed (most recent first)
                    const sortedEntities = allPresenceEntities
                        .filter(e => e !== presenceGroupEntity) // Exclude the group itself
                        .sort((a, b) => {
                            const aState = Helper.getEntityState(a);
                            const bState = Helper.getEntityState(b);
                            
                            // First sort by state (on before off)
                            if (aState?.state === "on" && bState?.state !== "on") return -1;
                            if (aState?.state !== "on" && bState?.state === "on") return 1;
                            
                            // Then by last changed
                            const lastChangeA = new Date(aState?.last_changed || 0).getTime();
                            const lastChangeB = new Date(bState?.last_changed || 0).getTime();
                            return lastChangeB - lastChangeA;
                        });

                    // Add entity cards for each sensor (compact)
                    sortedEntities.forEach(entity => {
                        const state = Helper.getEntityState(entity);
                        cards.push({
                            type: "custom:mushroom-entity-card",
                            entity: entity,
                            secondary_info: "last-changed",
                            icon_color: state?.state === "on" ? "red" : "grey",
                            card_mod: {
                                style: "ha-card { box-shadow: none; margin: 2px 0; }"
                            }
                        });
                    });
                }
            }

            // === Statistics Section (ONLY if stats available) ===
            const timeOccupiedEntity = `sensor.linus_brain_time_occupied_${area_slug}`;
            const timeMovementEntity = `sensor.linus_brain_time_movement_${area_slug}`;
            const timeInactiveEntity = `sensor.linus_brain_time_inactive_${area_slug}`;
            const timeEmptyEntity = `sensor.linus_brain_time_empty_${area_slug}`;

            const statsChips: any[] = [];
            [
                { entity: timeOccupiedEntity, name: "Occupied", icon: "mdi:account-clock" },
                { entity: timeMovementEntity, name: "Movement", icon: "mdi:run-fast" },
                { entity: timeInactiveEntity, name: "Inactive", icon: "mdi:sleep" },
                { entity: timeEmptyEntity, name: "Empty", icon: "mdi:account-off-outline" }
            ].forEach(({ entity, name, icon }) => {
                const state = Helper.getEntityState(entity);
                if (state && state.state !== "unavailable" && state.state !== "unknown") {
                    statsChips.push({
                        type: "custom:mushroom-entity-card",
                        entity: entity,
                        name: name,
                        icon: icon,
                        layout: "vertical",
                        card_mod: {
                            style: "ha-card { box-shadow: none; margin: 2px; }"
                        }
                    });
                }
            });

            // Only show statistics section if we have stats
            if (statsChips.length > 0) {
                cards.push({
                    type: "custom:mushroom-title-card",
                    title: "Statistics",
                    subtitle: "Time in each state"
                });

                // Show stats in rows of 2 for compact display
                for (let i = 0; i < statsChips.length; i += 2) {
                    const row = statsChips.slice(i, i + 2);
                    cards.push({
                        type: "horizontal-stack",
                        cards: row
                    });
                }
            }
        }



        // If no Linus Brain and no presence sensors
        if (!isLinusBrain && allPresenceEntities.length === 0) {
            cards.push({
                type: "custom:mushroom-template-card",
                primary: "No activity detection available",
                secondary: "Install Linus Brain or add activity sensors",
                icon: "mdi:information-outline",
                icon_color: "grey"
            });
        }

        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: `${areaName} - Activity Detection`,
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
     *
     * @param {string} area_slug The area slug.
     */
    constructor(area_slug: string) {
        super();
        
        this.config = this.getDefaultConfig(area_slug);
    }
}

export { ActivityDetectionPopup };
