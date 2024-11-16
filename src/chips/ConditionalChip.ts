import { chips } from "../types/strategy/chips";
import { ConditionalChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { getMAEntity } from "../utils";
import { generic } from "../types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
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
    conditions: [],
  };

  /**
   * Class Constructor.
   *
   * @param {MagicAreaRegistryEntry} device The chip device.
   * @param {ConditionalChipOptions} options The chip options.
   */
  constructor(options: ConditionalChipOptions = { conditions: [] }) {
    super();

    this.#defaultConfig.conditions = options.conditions;
    this.#defaultConfig.chip = options.chip;


    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { ConditionalChip };
