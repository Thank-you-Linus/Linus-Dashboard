import { AlarmChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import {AbstractChip} from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class LinusAlarmChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig}
   *
   */
  getDefaultConfig(entity_id: any): AlarmChipConfig {
    return {
      type: "alarm-control-panel",
      entity: entity_id,
      tap_action: {
        action: "more-info"
      },
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(entityId: string) {
    super();

    const defaultConfig = this.getDefaultConfig(entityId)

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export {LinusAlarmChip};
