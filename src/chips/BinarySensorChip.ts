import { Helper } from "../Helper";
import { AbstractChip } from "./AbstractChip";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { DOMAIN_ICONS } from "../variables";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * BinarySensor Chip class.
 *
 * Used to create a chip to indicate how many climates are operating.
 */
class BinarySensorChip extends AbstractChip {
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
    icon: DOMAIN_ICONS["binary_sensor"],
    icon_color: "orange",
    content: Helper.getCountTemplate("binary_sensor", "eq", "on"),
    tap_action: {
      action: "navigate",
      navigation_path: "binary_sensors",
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

export { BinarySensorChip };
