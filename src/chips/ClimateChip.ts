import { Helper } from "../Helper";
import { AbstractChip } from "./AbstractChip";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { getMAEntity } from "../utils";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate how many climates are operating.
 */
class ClimateChip extends AbstractChip {
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
    icon: "mdi:thermostat",
    icon_color: "orange",
    content: "none",
    tap_action: {
      action: "navigate",
      navigation_path: "climates",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor(options: chips.ChipOptions = {}) {
    super();

    this.#defaultConfig.content = Helper.getCountTemplate("climate", "ne", "off", options?.area_id);

    const magicAreaDevice = Helper.magicAreasDevices[options?.area_id ?? options?.floor_id ?? "global"]
    const magicAreasLight = getMAEntity(magicAreaDevice, "climate");

    if (magicAreasLight) {
      this.#defaultConfig.entity = magicAreasLight.entity_id;
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { ClimateChip };
