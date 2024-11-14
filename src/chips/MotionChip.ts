import { Helper } from "../Helper";
import { AbstractChip } from "./AbstractChip";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { DOMAIN_STATE_ICONS } from "../variables";
import { generic } from "../types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { getMAEntity } from "../utils";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Motion Chip class.
 *
 * Used to create a chip to indicate how many motions are operating.
 */
class MotionChip extends AbstractChip {
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
    icon: DOMAIN_STATE_ICONS.binary_sensor.motion.on,
    icon_color: "grey",
    content: Helper.getDeviceClassCountTemplate("binary_sensor", "motion", "ne", "off"),
    tap_action: {
      action: "navigate",
      navigation_path: "security-details",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(device: MagicAreaRegistryEntry, options: chips.TemplateChipOptions = {}) {
    super();

    const aggregate_motion = getMAEntity(device, "binary_sensor", "motion");

    if (aggregate_motion) {
      this.#defaultConfig.entity = aggregate_motion.entity_id;
      this.#defaultConfig.hold_action = { action: "more-info" };
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { MotionChip };
