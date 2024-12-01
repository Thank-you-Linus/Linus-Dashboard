import { Helper } from "../Helper";
import { AbstractChip } from "./AbstractChip";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Safety Chip class.
 *
 * Used to create a chip to indicate how many safetys are operating.
 */
class SafetyChip extends AbstractChip {
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
    icon: Helper.icons.binary_sensor.safety?.default,
    icon_color: "grey",
    content: Helper.getDeviceClassCountTemplate("safety", "ne", "off"),
    tap_action: {
      action: "none",
    },
    hold_action: {
      action: "navigate",
      navigation_path: "safety",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(options: chips.TemplateChipOptions = {}) {
    super();

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { SafetyChip };
