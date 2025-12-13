import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";

import { AbstractPopup } from "./AbstractPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Person Information Popup class.
 *
 * Used to create a popup with detailed information about a person.
 */
class PersonInformationsPopup extends AbstractPopup {

    /**
     * Class Constructor.
     *
     * @param {EntityRegistryEntry} entity The person entity
     */
    constructor(entity: EntityRegistryEntry) {
        super();

        this.config = Object.assign(this.config, this.getDefaultConfig(entity));
    }

    /**
     * Get the default popup configuration for a person.
     *
     * @param {EntityRegistryEntry} entity - The person entity
     * @returns {PopupActionConfig} The popup configuration
     */
    getDefaultConfig(entity: EntityRegistryEntry): PopupActionConfig {
        const entityId = entity.entity_id;
        const entityState = Helper.getEntityState(entityId);
        const friendlyName = entityState?.attributes?.friendly_name || entity.entity_id;

        // Find related mobile device entities for this person
        const personName = entityId.replace('person.', '');

        // Get device tracker entities that might belong to this person
        const deviceTrackerEntities = Helper.getEntityIds({ domain: "device_tracker" })
            .filter(e => e.toLowerCase().includes(personName.toLowerCase()) ||
                e.toLowerCase().includes('pixel'));

        // Get sensor entities that might belong to this person's phone
        const sensorEntities = Helper.getEntityIds({ domain: "sensor" })
            .filter(e => {
                const entity = Helper.entities[e];
                const device = entity?.device_id ? Helper.devices[entity.device_id] : null;
                return device?.manufacturer?.toLowerCase().includes('google') &&
                    (e.toLowerCase().includes('pixel') || e.toLowerCase().includes(personName.toLowerCase()));
            });

        // Combine device entities
        const deviceEntities = [...deviceTrackerEntities, ...sensorEntities];

        return {
            action: "fire-dom-event",
            browser_mod: {
                service: "browser_mod.popup",
                data: {
                    title: `Informations - ${friendlyName}`,
                    content: {
                        type: "vertical-stack",
                        cards: [
                            // Main person card
                            {
                                type: "horizontal-stack",
                                cards: [
                                    {
                                        type: "custom:mushroom-person-card",
                                        entity: entityId,
                                        icon_type: "entity-picture",
                                        secondary_info: "last-updated",
                                        primary_info: "state"
                                    }
                                ]
                            },
                            // History graph
                            {
                                type: "history-graph",
                                entities: [
                                    {
                                        entity: entityId
                                    }
                                ]
                            },
                            // Device entities (mobile phone sensors)
                            ...(deviceEntities.length > 0 ? [{
                                type: "custom:auto-entities",
                                filter: {
                                    include: deviceEntities.map(entityId => ({
                                        entity_id: entityId,
                                        options: {
                                            type: "entity"
                                        }
                                    })),
                                    exclude: []
                                },
                                card: {
                                    type: "custom:mushroom-chips-card"
                                },
                                card_param: "chips"
                            }] : []),
                            // Map with person location
                            {
                                type: "map",
                                entities: [
                                    {
                                        entity: entityId
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
        };
    }
}

export { PersonInformationsPopup };
