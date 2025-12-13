import { ConditionalChipConfig, LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

import { AbstractChip } from "./AbstractChip";


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Motion Chip class.
 *
 * Used to create a chip to indicate how many motions are operating.
 */
class ConditionalChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig}
   *
   * @readonly
   * @private
   */
  readonly #defaultConfig: ConditionalChipConfig = {
    type: "conditional",
    conditions: [],
    chip: {
      type: "template",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {MagicAreaRegistryEntry} device The chip device.
   * @param {ConditionalChipOptions} options The chip options.
   */
  constructor(conditions: ConditionalChipConfig["conditions"], chip: LovelaceChipConfig) {
    super();

    this.#defaultConfig.conditions = conditions;
    this.#defaultConfig.chip = chip;

    this.config = Object.assign(this.config, this.#defaultConfig);
  }
}

export { ConditionalChip };
