import {AbstractChip} from "./AbstractChip";
import {TemplateChipConfig} from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LightControlChip extends AbstractChip {
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
      entity: undefined,
      icon: "mdi:lightbulb-auto",
      icon_color: "{% if is_state(config.entity, 'on') %}green{% else %}red{% endif %}",
      tap_action: {
        action: "more-info"
      },
      // double_tap_action: {
      //   action: "call-service",
      //   service: "switch.toggle",
      //   data: {
      //     entity_id: undefined
      //   }
      // }
  };

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(entity_id: string) {
    super();

    this.#defaultConfig.entity = entity_id
    this.config = Object.assign(this.config, this.#defaultConfig);

  }
}

export {LightControlChip};
