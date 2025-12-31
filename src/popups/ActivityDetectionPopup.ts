import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { getActivityIconTemplate, getActivityColorTemplateForPopup, formatMediaEntitiesForTemplate } from "../utils/activityBadgeTemplates";

import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Activity Detection Popup class.
 *
 * Shows activity detection information with activity history graph and presence sensors.
 * 
 * POPUP STRUCTURE (designed to help understand room activity):
 * 1. STATUS CHIPS: Quick overview (Brightness, Activity, Presence, Duration, Config)
 * 2. HISTORY: 24h graphs (Linus Brain) or "Coming Soon" teaser (without LB)
 * 3. SENSORS LIST: All presence sensors sorted by state
 * 4. STATISTICS: Time in each state (Linus Brain only)
 * 
 * =============================================================================
 * FUTURE ENHANCEMENTS IDEAS (for AI-assisted development):
 * =============================================================================
 * 
 * 🚀 PRIORITY 1 - Timeline Visuelle
 * ----------------------------------
 * Replace simple history graph with annotated timeline:
 * 
 * Example:
 *   08:00 ━━━ Occupied (Motion + TV playing)
 *   09:30 ━━━ Empty
 *   12:15 ━━━ Movement (Kitchen sensor)
 *   13:00 ━━━ Occupied (Desk sensor)
 * 
 * Implementation ideas:
 * - Custom card with vertical timeline
 * - Show sensor type icons (motion/occupancy/presence/media)
 * - Color-coded by state (green=occupied, orange=movement, grey=empty)
 * - Click on event to see details
 * 
 * Value: Better understanding of what happened during the day
 * 
 * 
 * 🧠 PRIORITY 2 - Insights Automatiques
 * --------------------------------------
 * Add "Insights" section that analyzes patterns automatically:
 * 
 * Examples:
 * - "This room is most active in the morning (8-10am)"
 * - "Average occupancy: 3.2 hours/day"
 * - "Sensor 'Motion Kitchen' triggered 47 times today"
 * - "Unusual activity detected at 2:34 AM"
 * 
 * Implementation ideas:
 * - Analyze 7-day history to detect patterns
 * - Calculate statistics (avg occupancy, peak hours, sensor frequency)
 * - Detect anomalies (activity at unusual times)
 * - Display as markdown cards with icons
 * 
 * Value: Transform raw data into actionable information
 * 
 * 
 * 💡 PRIORITY 3 - Suggestions d'Automatisations
 * -----------------------------------------------
 * Detect patterns and suggest automations:
 * 
 * Examples:
 * - "💡 This room is occupied every weekday 8-9am"
 *   → Suggested automation: Turn on lights automatically
 * 
 * - "🌡️ Temperature drops when room is empty"
 *   → Suggested automation: Lower heating when unoccupied
 * 
 * Implementation ideas:
 * - Pattern detection engine (daily/weekly schedules)
 * - Cross-reference with other entities (lights, climate)
 * - Generate automation YAML snippet
 * - One-click "Create automation" button
 * 
 * Value: Proactive help to optimize smart home
 * 
 * 
 * 📊 PRIORITY 4 - Comparaison Contextualisée
 * -------------------------------------------
 * Compare with other days/rooms:
 * 
 * Examples:
 * - "Today: 4.5h occupied | Yesterday: 6.2h | Average: 5.8h"
 * - "Living room is 2x more active than bedroom"
 * - Sparkline graphs showing trends over 7 days
 * 
 * Implementation ideas:
 * - Store daily statistics in recorder
 * - Mini-charts (sparklines) for quick comparison
 * - Percentage comparison (+/- vs average)
 * 
 * Value: Put data in context
 * 
 * 
 * ⚠️ PRIORITY 5 - Alertes & Anomalies
 * ------------------------------------
 * Signal unusual behaviors:
 * 
 * Examples:
 * - "⚠️ Motion detected at 3:24 AM (unusual time)"
 * - "ℹ️ No activity for 48 hours (vacation mode?)"
 * - "🔥 Room occupied for 12+ hours (forgot to leave?)"
 * 
 * Implementation ideas:
 * - Define "normal" patterns from history
 * - Alert when deviating significantly
 * - Severity levels (info/warning/critical)
 * - Push notifications integration
 * 
 * Value: Security and awareness
 * 
 * 
 * 🏠 PRIORITY 6 - Mode Comparaison Multi-Pièces
 * ----------------------------------------------
 * Consolidated view of all rooms:
 * 
 * Example:
 *   Living Room: ████████░░ 80% active
 *   Kitchen:     ██████░░░░ 60% active
 *   Bedroom:     ███░░░░░░░ 30% active
 * 
 * Implementation ideas:
 * - New popup from home view
 * - Horizontal bar chart for all areas
 * - Click area to drill down to details
 * - Filter by floor/zone
 * 
 * Value: Overview of activity across entire home
 * 
 * =============================================================================
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
        const media_player_entities = Helper.getEntityIds({
            domain: "media_player",
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

        // Combine all entities and remove duplicates
        // Group members are included to ensure all Linus Brain sensors appear
        // even if they don't match the standard device_class filters
        const allPresenceEntities = [
            ...motion_entities,
            ...occupancy_entities,
            ...presence_entities,
            ...media_player_entities,
            ...groupMemberEntities
        ].filter((entity, index, self) => self.indexOf(entity) === index); // Remove duplicates

        const area = Helper.areas[area_slug];
        const areaName = area?.name || area_slug;

        const cards: any[] = [];

        // === UNIVERSAL STATUS OVERVIEW (Top of Popup - Compact Chips) ===
        const statusChips: any[] = [];

        // Chip 1: Brightness (ALWAYS visible - based on Linus Brain or sun.sun)
        if (isLinusBrain && activityEntity) {
            // Linus Brain: Use is_dark attribute - show only Dark/Bright state
            const darkLabel = Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.dark");
            const brightLabel = Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.bright");

            statusChips.push({
                type: "template",
                icon: `{% set is_dark = state_attr('${activityEntity}', 'is_dark') %}{{ 'mdi:weather-night' if is_dark else 'mdi:white-balance-sunny' }}`,
                icon_color: `{% set is_dark = state_attr('${activityEntity}', 'is_dark') %}{{ 'indigo' if is_dark else 'amber' }}`,
                content: `{{ '${darkLabel}' if state_attr('${activityEntity}', 'is_dark') else '${brightLabel}' }}`,
                entity: activityEntity,
                tap_action: { action: "more-info", entity: activityEntity }
            });
        } else {
            // Fallback: Use sun.sun - show only Dark/Bright state
            const darkLabel = Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.dark");
            const brightLabel = Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.bright");

            statusChips.push({
                type: "template",
                icon: `{{ 'mdi:weather-night' if is_state('sun.sun', 'below_horizon') else 'mdi:white-balance-sunny' }}`,
                icon_color: `{{ 'indigo' if is_state('sun.sun', 'below_horizon') else 'amber' }}`,
                content: `{{ '${darkLabel}' if is_state('sun.sun', 'below_horizon') else '${brightLabel}' }}`,
                entity: "sun.sun",
                tap_action: { action: "more-info", entity: "sun.sun" }
            });
        }

        // Chip 2: Activity (ONLY if Linus Brain)
        if (isLinusBrain && activityEntity) {
            // Get media player entities for detection
            const media_entities_str = formatMediaEntitiesForTemplate(media_player_entities);

            // Use shared templates to ensure synchronization with badge and activity chip
            statusChips.push({
                type: "template",
                entity: activityEntity,
                content: Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.activity"),
                icon: getActivityIconTemplate(activityEntity, media_entities_str),
                icon_color: getActivityColorTemplateForPopup(activityEntity, media_entities_str),
                tap_action: { action: "more-info", entity: activityEntity }
            });
        }

        // Chip 3: Presence (ONLY if Linus Brain)
        if (isLinusBrain) {
            const presenceLabel = Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.presence");
            if (presenceSensorEntity) {
                statusChips.push({
                    type: "template",
                    entity: presenceSensorEntity,
                    content: `${presenceLabel}`,
                    icon: `{{ state_attr('${presenceSensorEntity}', 'icon') or 'mdi:home-search' }}`,
                    icon_color: `{{ 'red' if is_state('${presenceSensorEntity}', 'on') else 'grey' }}`,
                    tap_action: { action: "more-info", entity: presenceSensorEntity }
                });
            }
        }

        // Chip 4: Duration (ONLY if Linus Brain)
        if (isLinusBrain) {
            const durationEntity = `sensor.linus_brain_activity_duration_${area_slug}`;
            const durationState = Helper.getEntityState(durationEntity);
            if (durationState && durationState.state !== "unavailable") {
                statusChips.push({
                    type: "entity",
                    entity: durationEntity,
                    name: Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.duration"),
                    icon_color: "blue",
                    tap_action: { action: "more-info" }
                });
            }
        }

        // Add mushroom chips card for compact status display
        cards.push({
            type: "custom:mushroom-chips-card",
            alignment: "center",
            chips: statusChips
        });

        // === Activity Details (ONLY if Linus Brain) ===
        if (isLinusBrain && activityEntity) {
            const activityState = Helper.getEntityState(activityEntity);

            if (activityState?.attributes) {
                // === Activity Details Markdown (Horizontal Format) ===
                const attrs = activityState.attributes;
                const markdownParts: string[] = [];

                // Build horizontal markdown based on available attributes
                if (attrs.seconds_until_timeout !== undefined && attrs.seconds_until_timeout > 0) {
                    markdownParts.push(`⏱️ ${attrs.seconds_until_timeout}s`);
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
        }

        // === HISTORY SECTION (ONLY if Linus Brain) ===
        if (isLinusBrain && activityEntity) {
            cards.push({
                type: "custom:mushroom-title-card",
                title: Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.history_title"),
                subtitle: Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.history_subtitle")
            });

            // Show activity + presence graphs
            const historyEntities: any[] = [
                {
                    entity: activityEntity,
                    name: Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.activity")
                }
            ];

            if (presenceSensorEntity) {
                historyEntities.push({
                    entity: presenceSensorEntity,
                    name: Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.presence")
                });
            }

            cards.push({
                type: "history-graph",
                entities: historyEntities,
                hours_to_show: 24,
                refresh_interval: 60
            });
        }

        // Count total sensors (excluding the group entity itself)
        const sensorCount = allPresenceEntities.filter(e => e !== presenceGroupEntity).length;

        // === PRESENCE SENSORS SECTION (ALWAYS visible) ===
        cards.push({
            type: "custom:mushroom-title-card",
            title: Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.sensors_title"),
            subtitle: sensorCount > 0 ? `${sensorCount} sensor${sensorCount !== 1 ? 's' : ''}` : Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.no_sensors_title")
        });

        if (allPresenceEntities.length > 0) {
            // Helper function to check if entity is active
            const isEntityActive = (entity: string): boolean => {
                const state = Helper.getEntityState(entity);
                if (!state) return false;

                // Media players: playing state is active
                if (entity.startsWith('media_player.')) {
                    return state.state === 'playing';
                }

                // Binary sensors: on state is active
                return state.state === 'on';
            };

            // Sort by state (active first) then by last changed (most recent first)
            const sortedEntities = allPresenceEntities
                .filter(e => e !== presenceGroupEntity) // Exclude the group itself
                .sort((a, b) => {
                    const aState = Helper.getEntityState(a);
                    const bState = Helper.getEntityState(b);
                    const aActive = isEntityActive(a);
                    const bActive = isEntityActive(b);

                    // First sort by state (active before inactive)
                    if (aActive && !bActive) return -1;
                    if (!aActive && bActive) return 1;

                    // Then by last changed
                    const lastChangeA = new Date(aState?.last_changed || 0).getTime();
                    const lastChangeB = new Date(bState?.last_changed || 0).getTime();
                    return lastChangeB - lastChangeA;
                });

            // Add entity cards for each sensor (compact)
            sortedEntities.forEach(entity => {
                const state = Helper.getEntityState(entity);
                const isActive = isEntityActive(entity);
                const isMediaPlayer = entity.startsWith('media_player.');

                // Color logic:
                // - Media players: blue when active, grey when inactive
                // - Binary sensors: red when active, grey when inactive
                let iconColor: string | undefined;
                if (isMediaPlayer) {
                    iconColor = isActive ? "blue" : "grey";
                } else {
                    iconColor = isActive ? "red" : "grey";
                }

                cards.push({
                    type: "custom:mushroom-entity-card",
                    entity: entity,
                    secondary_info: "last-changed",
                    icon_color: iconColor,
                    card_mod: {
                        style: "ha-card { box-shadow: none; margin: 2px 0; }"
                    }
                });
            });
        }

        // Always show "Add sensors" card (whether there are sensors or not)
        // This encourages users to add more detection points for better accuracy
        const addSensorMessage = allPresenceEntities.length === 0
            ? Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.no_sensors_message")
            : Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.add_more_sensors");

        const addSensorExplanation = Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.add_sensor_explanation");

        cards.push({
            type: "custom:mushroom-template-card",
            primary: addSensorMessage,
            secondary: addSensorExplanation,
            icon: "mdi:plus-circle-outline",
            icon_color: "blue",
            layout: "horizontal",
            tap_action: {
                action: "navigate",
                navigation_path: `/config/entities?area=${area_slug}`
            },
            card_mod: {
                style: `
                    ha-card { 
                        box-shadow: none;
                        background: rgba(var(--rgb-primary-color), 0.05);
                        cursor: pointer;
                        margin-top: ${allPresenceEntities.length > 0 ? '8px' : '0'};
                    }
                    ha-card:hover {
                        background: rgba(var(--rgb-primary-color), 0.1);
                    }
                `
            }
        });

        // === Statistics Section (ONLY if stats available) ===
        if (isLinusBrain) {
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

        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: `${areaName} - ${Helper.localize("component.linus_dashboard.entity.text.activity_detection_popup.state.popup_title")}`,
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
