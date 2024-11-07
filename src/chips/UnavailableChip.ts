import { GroupListPopup } from "../popups/GroupListPopup";
import { AbstractChip } from "./AbstractChip";
import { EntityRegistryEntry } from '../types/homeassistant/data/entity_registry';

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Unavailable Chip class.
 *
 * Used to create a chip to indicate unable entities.
 */
class UnavailableChip extends AbstractChip {
    getDefaultConfig(entities: EntityRegistryEntry[]) {
        return {
            type: "template",
            icon_color: "orange",
            icon: 'mdi:help',
            tap_action: new GroupListPopup(entities, "Unavailable entities").getPopup()
        };
    }
    /**
     * Class Constructor.
     *
     * @param {EntityRegistryEntry[]} entities The chip entities.
     */
    constructor(entities: EntityRegistryEntry[]) {
        super();
        const defaultConfig = this.getDefaultConfig(entities);
        this.config = Object.assign(this.config, defaultConfig);
    }
}

export { UnavailableChip };
