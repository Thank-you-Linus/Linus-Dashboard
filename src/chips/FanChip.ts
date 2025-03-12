import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Fan Chip class.
 *
 * Used to create a chip to indicate how many fans are on and to turn all off.
 */
class FanChip extends AbstractChip {
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
    icon: "mdi:fan",
    content: Helper.getCountTemplate({ domain: "fan", operator: "eq", value: "on" }),
    tap_action: {
      action: "navigate",
      navigation_path: "fan",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor(options: chips.ChipOptions, entity?: EntityRegistryEntry) {
    super();

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getCountTemplate({ domain: "fan", operator: "eq", value: "on", area_slug: options?.area_slug });
    }

    this.#defaultConfig.icon_color = Helper.getFromDomainState({ domain: "fan", area_slug: options?.area_slug })


    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { FanChip };
