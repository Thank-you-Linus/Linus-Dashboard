import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { getMAEntity } from "../utils";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LightChip extends AbstractChip {
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
    icon: "mdi:lightbulb-group",
    icon_color: "amber",
    content: "",
    tap_action: {
      action: "navigate",
      navigation_path: "lights",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor(options: chips.ChipOptions) {
    super();

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getCountTemplate("light", "eq", "on", options?.area_slug);
    }

    this.#defaultConfig.icon_color = Helper.getDomainColorFromState({ domain: "light", area_slug: options?.area_slug })

    const magicAreasEntity = getMAEntity(options?.area_slug ?? options?.floor_id ?? "global", "light");

    if (magicAreasEntity) {
      this.#defaultConfig.entity = magicAreasEntity.entity_id;
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);

  }
}

export { LightChip };
