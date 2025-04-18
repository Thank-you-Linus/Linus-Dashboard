import { ConditionalChipConfig, LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AbstractChip } from "./AbstractChip";

type ConditionalChipOptions = Omit<ConditionalChipConfig, "type">

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
  };

  /**
   * Class Constructor.
   *
   * @param {MagicAreaRegistryEntry} device The chip device.
   * @param {ConditionalChipOptions} options The chip options.
   */
  constructor(conditions: Array<{ entity: string; state_not?: string; state?: string; }>, chip: LovelaceChipConfig) {
    super();

    this.#defaultConfig.conditions = conditions;
    this.#defaultConfig.chip = chip;

    this.config = Object.assign(this.config, this.#defaultConfig);
  }
}

export { ConditionalChip };
