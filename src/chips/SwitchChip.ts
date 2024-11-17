import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Switch Chip class.
 *
 * Used to create a chip to indicate how many switches are on and to turn all off.
 */
class SwitchChip extends AbstractChip {
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
    icon: "mdi:dip-switch",
    content: "none",
    tap_action: {
      action: "navigate",
      navigation_path: "switches",
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
      this.#defaultConfig.content = Helper.getCountTemplate("switch", "eq", "on", options?.area_id);
    }
    this.#defaultConfig.icon_color = Helper.getDomainColorFromState({ domain: "switch", area_id: options?.area_id })

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { SwitchChip };
