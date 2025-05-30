import {Helper} from "../Helper";
import {chips} from "../types/strategy/chips";
import {AbstractChip} from "./AbstractChip";
import {TemplateChipConfig} from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Settings Chip class.
 *
 * Used to create a chip to indicate how many fans are on and to turn all off.
 */
class SettingsChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {TemplateChipConfig}
   *
   * @readonly
   * @private
   */
  readonly #defaultConfig: TemplateChipConfig = {
    "type": "template",
    "icon": "mdi:cog",
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

export {SettingsChip};
