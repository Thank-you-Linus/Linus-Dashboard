import { AreaInformations } from "../popups/AreaInformationsPopup";
import { generic } from "../types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AREA_STATE_ICONS, DEVICE_ICONS } from "../variables";
import { AbstractChip } from "./AbstractChip";
import { Helper } from "../Helper";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area state Chip class.
 *
 * Used to create a chip to indicate area state.
 */
class AreaStateChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig}
   *
   */
  getDefaultConfig(device: MagicAreaRegistryEntry, showContent: boolean = false): TemplateChipConfig {

    const { area_state, presence_hold, all_media_players, aggregate_motion } = device?.entities ?? {}
    return {
      type: "template",
      entity: area_state?.entity_id,
      icon_color: `
          {% set presence_hold = states('${presence_hold?.entity_id}')%}
          {% set motion = states('${aggregate_motion?.entity_id}')%}
          {% set media_player = states('${all_media_players?.entity_id}')%}
          {% set bl = state_attr('${area_state?.entity_id}', 'states')%}
          {% if motion == 'on' %}
              red
          {% elif media_player in ['on', 'playing'] %}
              blue
          {% elif presence_hold == 'on' %}
              red
          {% elif 'sleep' in bl %}
              blue
          {% elif 'extended' in bl %}
              orange
          {% elif 'occupied' in bl %}
              grey
          {% else %}
              transparent
          {% endif %}
        `,
      icon: `
          {% set presence_hold = states('${presence_hold?.entity_id}')%}
          {% set motion = states('${aggregate_motion?.entity_id}')%}
          {% set media_player = states('${all_media_players?.entity_id}')%}
          {% set bl = state_attr('${area_state?.entity_id}', 'states')%}
          {% if motion == 'on' %}
            ${Helper.icons.binary_sensor.motion?.default}
          {% elif media_player in ['on', 'playing'] %}
            ${Helper.icons.media_player._?.default}
          {% elif presence_hold == 'on' %}
            ${DEVICE_ICONS.presence_hold}
          {% elif 'sleep' in bl %}
            ${AREA_STATE_ICONS.sleep}
          {% elif 'extended' in bl %}
            ${AREA_STATE_ICONS.extended}
          {% elif 'occupied' in bl %}
            ${AREA_STATE_ICONS.occupied}
          {% else %}
            ${AREA_STATE_ICONS.clear}
          {% endif %}`,
      content: showContent ? `
          {% set presence_hold = states('${presence_hold?.entity_id}')%}
          {% set bl = state_attr('${area_state?.entity_id}', 'states')%}
          {% if presence_hold == 'on' %}
            presence_hold
          {% elif 'sleep' in bl %}
            sleep
          {% elif 'extended' in bl %}
            extended
          {% elif 'occupied' in bl %}
            occupied
          {% else %}
            clear
          {% endif %}` : "",
      tap_action: new AreaInformations(device, true).getPopup() as any
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

export { AreaStateChip };
