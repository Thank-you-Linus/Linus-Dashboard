import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { getMAEntity } from "../utils";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Cover Chip class.
 *
 * Used to create a chip to indicate how many covers aren't closed.
 */
class CoverChip extends AbstractChip {
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
    content: "",
    tap_action: {
      action: "navigate",
      navigation_path: "cover",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.DeviceClassChipOptions} options The chip options.
   */
  constructor(options: chips.DeviceClassChipOptions, entity?: EntityRegistryEntry) {
    super();

    const entities = Helper.getEntityIds({
      domain: "cover",
      area_slug: options?.area_slug,
      device_class: options?.device_class,
    });

    if (!entities.length) {
      console.debug("No entities found for cover chip");
      return;
    }

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getContent("cover", options.device_class, entities);
    }

    this.#defaultConfig.icon = Helper.getIcon("cover", options.device_class, entities);
    this.#defaultConfig.icon_color = Helper.getIconColor("cover", options.device_class, entities);

    const magicAreasEntity = getMAEntity(options?.magic_device_id ?? "global", "cover", options?.device_class);

    if (magicAreasEntity) {
      this.#defaultConfig.entity = magicAreasEntity.entity_id;
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { CoverChip };
