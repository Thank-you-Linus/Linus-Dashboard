import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { navigateTo } from "../utils";
import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { UNAVAILABLE } from "../variables";

import { AbstractChip } from "./AbstractChip";

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
        icon: 'mdi:alert-circle-outline',
        icon_color: "orange",
        content: "",
    };

    /**
     * Class Constructor.
     *
   * @param {chips.ChipOptions} options The chip options.
   */
    constructor(options: chips.ChipOptions = {}) {
        super();

        const entityIds = Helper.getEntityIds({
            domain: "all",
            ...(options?.area_slug && { area_slug: options.area_slug })
        });

        // Build the states array once and reuse via {% set %} to avoid repeating
        // the entity list in icon, icon_color, and content templates separately.
        const states = entityIds.map(id => `states['${id}']`).join(',');
        const entitiesExpr = `[${states}]`;
        const countExpr = `${entitiesExpr} | selectattr('state','eq','${UNAVAILABLE}') | list | count`;

        this.#defaultConfig.content = `{% set count = ${countExpr} %}{% if count > 0 %}{{ count }}{% endif %}`;
        this.#defaultConfig.icon = `{% if ${countExpr} > 0 %}mdi:alert-circle-outline{% else %}mdi:alert-circle-check-outline{% endif %}`;
        this.#defaultConfig.icon_color = `{% if ${countExpr} > 0 %}orange{% else %}green{% endif %}`;

        // Set entity_id for targeted Mushroom re-evaluation
        (this.#defaultConfig as any).entity_id = entityIds;

        this.#defaultConfig.tap_action = navigateTo("unavailable");

        this.config = Object.assign(this.config, this.#defaultConfig);
    }
}

export { UnavailableChip };
