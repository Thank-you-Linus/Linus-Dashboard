import { MagicAreaRegistryEntry } from "../types/homeassistant/data/device_registry";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { DOMAIN } from "../variables";
import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class ToggleSceneChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig}
   *
   */
  getDefaultConfig(device: MagicAreaRegistryEntry): TemplateChipConfig {
    return {
      type: "template",
      entity: device?.entities.light_control?.entity_id,
      icon: "mdi:recycle-variant",
      // icon_color: "{% if is_state(config.entity, 'on') %}green{% else %}red{% endif %}",
      tap_action: {
        action: "call-service",
        service: `${DOMAIN}.area_scene_toggle`,
        data: {
          area: device?.name,
        }
      },
      hold_action: {
        action: "more-info"
      }
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(device: MagicAreaRegistryEntry) {
    super();

    const defaultConfig = this.getDefaultConfig(device)

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { ToggleSceneChip };
