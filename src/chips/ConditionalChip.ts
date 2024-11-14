import { chips } from "../types/strategy/chips";
import { ConditionalChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { getMAEntity } from "../utils";
import { generic } from "../types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
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
    // chip: {},
  };

  /**
   * Class Constructor.
   *
   * @param {MagicAreaRegistryEntry} device The chip device.
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(device: MagicAreaRegistryEntry, options: chips.TemplateChipOptions = {}) {
    super();

    const aggregate_motion = getMAEntity(device, "binary_sensor", "motion");

    console.log("aggregate_motion", aggregate_motion);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { ConditionalChip };
