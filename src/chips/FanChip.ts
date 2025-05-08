import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { getMAEntity, navigateTo } from "../utils";

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

    const entities = Helper.getEntityIds({
      domain: "fan",
      area_slug: options?.area_slug,
    });

    if (!entities.length) {
      console.debug("No entities found for fan chip");
      return;
    }

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getContent("fan", undefined, entities);
    }

    this.#defaultConfig.icon = Helper.getIcon("fan", undefined, entities);
    this.#defaultConfig.icon_color = Helper.getIconColor("fan", undefined, entities);


    const magicAreasEntity = getMAEntity(options?.magic_device_id ?? "global", "fan");

    if (magicAreasEntity) {
      this.#defaultConfig.tap_action = undefined
      this.#defaultConfig.hold_action = navigateTo('fan')
    } else {
      const area_slug = Array.isArray(options?.area_slug) ? options?.area_slug : [options?.area_slug]
      const entity_id = area_slug.flatMap((area) => Helper.areas[area ?? "global"]?.domains?.fan ?? []);
      this.#defaultConfig.entity_id = entity_id

      if (entity_id.length == 1) {
        this.#defaultConfig.entity = entity_id[0]
        this.#defaultConfig.tap_action = undefined
      }
    }



    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { FanChip };
