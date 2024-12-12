import { AreaInformations } from "../popups/AreaInformationsPopup";
import { generic } from "../types/strategy/generic";
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
  getDefaultConfig({ area, floor, showContent = false }: { area?: generic.StrategyArea, floor?: generic.StrategyFloor, showContent?: boolean }): TemplateChipConfig {

    const device_id = area?.slug ?? floor?.floor_id

    const device = device_id ? Helper.magicAreasDevices[device_id] : undefined
    const { area_state, presence_hold, all_media_players, aggregate_motion, aggregate_presence, aggregate_occupancy } = device?.entities ?? {}

    const motion_entities = aggregate_motion ? [aggregate_motion.entity_id] : area?.domains.motion ?? []
    const presence_entities = aggregate_presence ? [aggregate_presence.entity_id] : area?.domains.presence ?? []
    const occupancy_entities = aggregate_occupancy ? [aggregate_occupancy.entity_id] : area?.domains.occupancy ?? []
    const media_player_entities = all_media_players ? [all_media_players.entity_id] : area?.domains.media_player ?? []

    const isOn = '| selectattr("state","eq", "on") | list | count > 0'
    const isSomeone = `[${[...motion_entities, ...presence_entities, ...occupancy_entities]?.map(e => `states['${e}']`)}] ${isOn}`
    const isMotion = `[${motion_entities?.map(e => `states['${e}']`)}] ${isOn}`
    const isPresence = `[${presence_entities?.map(e => `states['${e}']`)}] ${isOn}`
    const isOccupancy = `[${occupancy_entities?.map(e => `states['${e}']`)}] ${isOn}`
    const isMediaPlaying = `[${media_player_entities?.map(e => `states['${e}']`)}] | selectattr("state","eq", "playing") | list | count > 0`

    return {
      type: "template",
      entity: area_state?.entity_id,
      icon_color: `
          {% set presence_hold = states('${presence_hold?.entity_id}')%}
          {% set motion = ${isSomeone} %}
          {% set media_player = ${isMediaPlaying} %}
          {% set bl = state_attr('${area_state?.entity_id}', 'states') or [] %}
          {% if motion %}
              red
          {% elif media_player %}
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
          {% set motion = ${isMotion} %}
          {% set presence = ${isPresence} %}
          {% set occupancy = ${isOccupancy} %}
          {% set media_player = ${isMediaPlaying} %}
          {% set bl = state_attr('${area_state?.entity_id}', 'states') or [] %}
          {% if motion %}
            ${Helper.icons.binary_sensor.motion?.state?.on}
          {% elif presence %}
            ${Helper.icons.binary_sensor.presence?.state?.on}
          {% elif occupancy %}
            ${Helper.icons.binary_sensor.occupancy?.state?.on}
          {% elif media_player %}
            ${Helper.icons.media_player._?.state?.playing}
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
      tap_action: device ? new AreaInformations(device, true).getPopup() : { action: "none" },
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(options: { area?: generic.StrategyArea, floor?: generic.StrategyFloor, showContent?: boolean }) {
    super();

    const defaultConfig = this.getDefaultConfig(options)

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { AreaStateChip };
