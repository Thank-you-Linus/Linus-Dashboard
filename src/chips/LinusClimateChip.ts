import { MagicAreaRegistryEntry } from "../types/homeassistant/data/device_registry";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class LinusClimateChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig}
   *
   */
  getDefaultConfig(device: MagicAreaRegistryEntry, showContent: boolean): TemplateChipConfig {
    return {
      "type": "template",
      "entity": device.entities.aggregate_climate?.entity_id,
      "icon_color": `{{ 'orange' if is_state('${device.entities.aggregate_climate?.entity_id}', 'heat') else 'grey' }}`,
      "icon": "mdi:thermostat",
      "content": showContent ? `{{ states.${device.entities.aggregate_climate?.entity_id}.attributes.preset_mode }}` : "",
      // "tap_action": climateList(hass, area)
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(device: MagicAreaRegistryEntry, showContent: boolean = false) {
    super();

    const defaultConfig = this.getDefaultConfig(device, showContent)

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { LinusClimateChip };
