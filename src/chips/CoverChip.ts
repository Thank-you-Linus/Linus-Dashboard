import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover Chip class.
 *
 * Used to create a chip to indicate how many covers aren't closed.
 */
class CoverChip extends AbstractChip {
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
    icon: "mdi:window-open",
    content: "",
    tap_action: {
      action: "navigate",
      navigation_path: "cover",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor(options: chips.ChipOptions = {}) {
    super();

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getCountTemplate("cover", "eq", "open", options?.area_slug);
    }

    this.#defaultConfig.icon_color = Helper.getFromDomainState({ domain: "cover", area_slug: options?.area_slug })

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { CoverChip };
