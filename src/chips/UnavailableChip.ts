import { GroupListPopup } from "../popups/GroupListPopup";
import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { Helper } from "../Helper";
import { UNAVAILABLE_STATES } from "../variables";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Unavailable Chip class.
 *
 * Used to create a chip to indicate unable entities.
 */
class UnavailableChip extends AbstractChip {
    /**
     * Default configuration of the chip.
     *
     * @type {TemplateChipConfig}
     *
     * @readonly
     * @private
     */
    readonly #defaultConfig: TemplateChipConfig = {
        type: "template",
        icon: 'mdi:help',
        icon_color: "orange",
        content: Helper.getCountTemplate("switch", "eq", "on"),
        tap_action: {
            action: "navigate",
            navigation_path: "switches",
        },
    };

    /**
     * Class Constructor.
     *
     * @param {EntityRegistryEntry[]} entities The chip entities.
     */
    constructor(area_id?: string) {
        super();

        const entities = area_id ? Helper.areas[area_id]?.entities : Object.values(Helper.areas).reduce((acc: string[], area) => {
            if (area.slug === 'unavailable') return acc;
            return [...acc, ...area.entities] as string[];
        }, [])

        const unavailableEntities = entities?.filter(entity_id => UNAVAILABLE_STATES.includes(Helper.getEntityState(entity_id)?.state)).map(entity_id => Helper.entities[entity_id]);


        this.#defaultConfig.tap_action = new GroupListPopup(unavailableEntities, "Unavailable entities").getPopup()
        this.config = Object.assign(this.config, this.#defaultConfig);
    }
}

export { UnavailableChip };
