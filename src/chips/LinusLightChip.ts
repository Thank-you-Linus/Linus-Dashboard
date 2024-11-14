import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AggregateListPopup } from "../popups/AggregateListPopup";
import { generic } from "../types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { DOMAIN } from "../variables";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class LinusLightChip extends AbstractChip {

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(device: MagicAreaRegistryEntry, area_id: string, show_content?: boolean, show_group?: boolean) {
    super();

    const defaultConfig: TemplateChipConfig = {
      type: "template",
      entity: device?.entities.all_lights?.entity_id,
      icon_color: `{{ 'amber' if expand(states.${device?.entities.all_lights?.entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count > 0 else 'grey' }}`,
      icon: "mdi:lightbulb-group",
      content: show_content ? `{{ expand(states.${device?.entities.all_lights?.entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'on') | list | count }}` : "",
      tap_action: show_group ? new AggregateListPopup(device?.entities.all_lights?.entity_id, "light").getPopup() : {
        action: "call-service",
        service: `${DOMAIN}.area_light_toggle`,
        data: {
          area: area_id
        }
      }
    }

    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { LinusLightChip };
