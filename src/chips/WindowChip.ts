import { Helper } from "../Helper";
import { AbstractChip } from "./AbstractChip";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { DOMAIN_STATE_ICONS } from "../variables";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Window Chip class.
 *
 * Used to create a chip to indicate how many windows are operating.
 */
class WindowChip extends AbstractChip {
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
    icon: DOMAIN_STATE_ICONS.binary_sensor.window.on,
    icon_color: "grey",
    content: Helper.getDeviceClassCountTemplate("binary_sensor", "window", "ne", "off"),
    tap_action: {
      action: "navigate",
      navigation_path: "security-details",
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

export { WindowChip };
