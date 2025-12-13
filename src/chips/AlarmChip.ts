import { chips } from "../types/strategy/chips";
import { AlarmChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { navigateTo } from "../utils";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols False positive.
/**
 * Alarm Chip class.
 *
 * Used to create a chip for showing the alarm.
 */
class AlarmChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @private
   * @readonly
   */
  readonly #defaultConfig: AlarmChipConfig = {
    type: "alarm-control-panel",
    tap_action: navigateTo('security')
  };

  /**
   * Class Constructor.
   *
   * @param {string} entityId Id of a alarm entity.
   * @param {chips.AlarmChipOptions} options Alarm Chip options.
   */
  constructor(entityId: string, options: chips.AlarmChipOptions = {}) {
    super();
    this.#defaultConfig = {
      ...this.#defaultConfig,
      ...{ entity: entityId },
      ...options,
    };

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { AlarmChip };
