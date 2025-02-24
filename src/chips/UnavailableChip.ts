import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { navigateTo } from "../utils";
import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { UNAVAILABLE } from "../variables";

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

        this.#defaultConfig.content = Helper.getCountTemplate({ domain: "all", operator: "eq", value: UNAVAILABLE, area_slug: options?.area_slug, allowUnavailable: true });

        this.#defaultConfig.icon = Helper.getFromDomainState({
            domain: "all",
            operator: "eq",
            value: UNAVAILABLE,
            ifReturn: this.#defaultConfig.icon,
            elseReturn: "mdi:alert-circle-check-outline",
            area_slug: options?.area_slug,
            allowUnavailable: true
        });


        this.#defaultConfig.icon_color = Helper.getFromDomainState({
            domain: "all",
            operator: "eq",
            value: UNAVAILABLE,
            ifReturn: this.#defaultConfig.icon_color,
            elseReturn: "green",
            area_slug: options?.area_slug,
            allowUnavailable: true
        });

        this.#defaultConfig.tap_action = navigateTo("unavailable")

        this.config = Object.assign(this.config, this.#defaultConfig);
    }
}

export { UnavailableChip };
