import { MagicAreaRegistryEntry } from "../types/homeassistant/data/device_registry";
import { ConditionalChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { chips } from "../types/strategy/chips";
import { navigateTo } from "../utils";
import { DOMAIN_STATE_ICONS } from "../variables";
import { AbstractChip } from "./AbstractChip";

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
   * @type {ConditionalChipConfig}
   *
   */
  getDefaultConfig(entity_id: string): ConditionalChipConfig {
    const icon = DOMAIN_STATE_ICONS.climate
    return {
      type: "conditional",
      conditions: [
        {
          entity: entity_id,
          state_not: "unavailable"
        }
      ],
      chip: {
        type: "template",
        entity: entity_id,
        icon_color: "{{ 'red' if is_state(entity, 'on') else 'grey' }}",
        icon: icon.on,
        content: `{{ expand(states.${entity_id}.attributes.entity_id is defined and states.${entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count }}`,
        tap_action: navigateTo('climate'),
      },
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(device: MagicAreaRegistryEntry, options: chips.TemplateChipOptions = {}) {
    super();

    if (!device.entities.climate_group?.entity_id) {
      throw new Error(`No aggregate motion entity found for device: ${device.name}`);
    }

    const defaultConfig = this.getDefaultConfig(device.entities.climate_group.entity_id)
    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { ClimateChip };
