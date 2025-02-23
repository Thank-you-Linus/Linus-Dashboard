import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { getMAEntity } from "../utils";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LightChip extends AbstractChip {
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
    icon: "mdi:lightbulb-group",
    icon_color: "amber",
    content: "",
    tap_action: {
      action: "navigate",
      navigation_path: "light",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor(options: chips.ChipOptions) {
    super();

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getCountTemplate({ domain: "light", operator: "eq", value: "on", area_slug: options?.area_slug });
    }

    this.#defaultConfig.icon_color = Helper.getFromDomainState({ domain: "light", area_slug: options?.area_slug })

    const magicAreasEntity = getMAEntity(options?.magic_device_id ?? "global", "light");

    if (magicAreasEntity) {
      this.#defaultConfig.entity = magicAreasEntity.entity_id;
    } else {
      const area_slug = Array.isArray(options?.area_slug) ? options?.area_slug : [options?.area_slug]
      this.#defaultConfig.entity_id = area_slug.flatMap((area) => Helper.areas[area ?? "global"]?.domains?.light ?? []);
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { LightChip };
