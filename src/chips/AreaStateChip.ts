import { AreaInformations } from "../popups/AreaInformationsPopup";
import { generic } from "../types/strategy/generic";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AREA_STATE_ICONS, DEVICE_ICONS } from "../variables";
import { Helper } from "../Helper";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area state Chip class.
 *
 * Used to create a chip to indicate area state.
 * Supports both Linus Brain (activity sensor) and Magic Areas (area_state).
 */
class AreaStateChip extends AbstractChip {
  /**
   * Get configuration for Linus Brain activity sensor
   * 
   * Linus Brain states: empty, inactive, movement, occupied
   */
  private getLinusBrainConfig(
    entity_id: string, 
    showContent: boolean, 
    showClearState: boolean, 
    device: any
  ): TemplateChipConfig {
    return {
      type: "template",
      entity: entity_id,
      icon_color: `
        {% set state = states('${entity_id}') %}
        {% if state == 'occupied' %}
          green
        {% elif state == 'movement' %}
          orange
        {% elif state == 'inactive' %}
          grey
        {% else %}
          grey
        {% endif %}
      `,
      icon: `
        {% set state = states('${entity_id}') %}
        {% if state == 'occupied' %}
          mdi:account-check
        {% elif state == 'movement' %}
          mdi:walk
        {% elif state == 'inactive' %}
          mdi:sleep
        {% else %}
          ${showClearState ? 'mdi:home-outline' : ''}
        {% endif %}
      `,
      content: showContent ? `
        {% set state = states('${entity_id}') %}
        {% if state == 'occupied' %}
          {{ '${Helper.localize("component.linus_dashboard.entity.text.area_states.state.occupied")}' }}
        {% elif state == 'movement' %}
          Movement
        {% elif state == 'inactive' %}
          Inactive
        {% else %}
          {{ '${Helper.localize("component.linus_dashboard.entity.text.area_states.state.clear")}' }}
        {% endif %}
      ` : "",
      tap_action: device ? new AreaInformations(device, true).getPopup() : { action: "none" },
    };
  }

  /**
   * Get configuration for Magic Areas area_state sensor
   * 
   * Magic Areas states: occupied, extended, clear, bright, dark, sleep
   */
  private getMagicAreasConfig(
    entity_id: string,
    presence_hold_entity: string | undefined,
    showContent: boolean,
    showClearState: boolean,
    device: any,
    isSomeone: string,
    isMotion: string,
    isPresence: string,
    isOccupancy: string,
    isMediaPlaying: string
  ): TemplateChipConfig {
    return {
      type: "template",
      entity: entity_id,
      icon_color: `
          {% set presence_hold = states('${presence_hold_entity || 'unavailable'}') %}
          {% set motion = ${isSomeone} %}
          {% set media_player = ${isMediaPlaying} %}
          {% set bl = state_attr('${entity_id || 'unavailable'}', 'states') or [] %}
          {% if motion %}
            red
          {% elif media_player %}
              light-blue
          {% elif presence_hold == 'on' %}
              pink
          {% elif 'sleep' in bl %}
              purple
          {% elif 'extended' in bl %}
              deep-orange
          {% elif 'occupied' in bl %}
              orange
          {% else %}
              grey
          {% endif %}
        `,
      icon: `
          {% set presence_hold = states('${presence_hold_entity || 'unavailable'}') %}
          {% set motion = ${isMotion} %}
          {% set presence = ${isPresence} %}
          {% set occupancy = ${isOccupancy} %}
          {% set media_player = ${isMediaPlaying} %}
          {% set bl = state_attr('${entity_id || 'unavailable'}', 'states') or [] %}
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
            ${showClearState ? AREA_STATE_ICONS.clear : ''}
          {% endif %}`,
      content: showContent ? `
          {% set presence_hold = states('${presence_hold_entity || 'unavailable'}') %}
          {% set bl = state_attr('${entity_id || 'unavailable'}', 'states') or [] %}
          {% if presence_hold == 'on' %}
            {{ '${Helper.localize("component.linus_dashboard.entity.text.area_states.state.presence_hold")}' }}
          {% elif 'sleep' in bl %}
            {{ '${Helper.localize("component.linus_dashboard.entity.text.area_states.state.sleep")}' }}
          {% elif 'extended' in bl %}
            {{ '${Helper.localize("component.linus_dashboard.entity.text.area_states.state.extended")}' }}
          {% elif 'occupied' in bl %}
            {{ '${Helper.localize("component.linus_dashboard.entity.text.area_states.state.occupied")}' }}
          {% else %}
             {{ '${Helper.localize("component.linus_dashboard.entity.text.area_states.state.clear")}' }}
          {% endif %}` : "",
      tap_action: device ? new AreaInformations(device, true).getPopup() : { action: "none" },
    };
  }

  /**
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig}
   *
   */
  getDefaultConfig({ area, floor, showContent = false, showClearState = true }: { area?: generic.StrategyArea, floor?: generic.StrategyFloor, showContent?: boolean, showClearState?: boolean }): TemplateChipConfig {

    const device_id = area?.slug ?? floor?.floor_id;
    const device = device_id ? Helper.magicAreasDevices[device_id] : undefined;
    
    // Use EntityResolver to get area state entity (Linus Brain or Magic Areas)
    const resolver = Helper.entityResolver;
    const areaStateResolution = device_id ? resolver.resolveAreaState(device_id) : { entity_id: null, source: "native" as const };
    const area_state_entity = areaStateResolution.entity_id;
    const isLinusBrain = areaStateResolution.source === "linus_brain";
    
    // presence_hold is Magic Areas only
    const { presence_hold } = device?.entities ?? {};

    const motion_entities = Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion", area_slug: floor ? floor.areas_slug : area?.slug });
    const occupancy_entities = Helper.getEntityIds({ domain: "binary_sensor", device_class: "occupancy", area_slug: floor ? floor.areas_slug : area?.slug });
    const presence_entities = Helper.getEntityIds({ domain: "binary_sensor", device_class: "presence", area_slug: floor ? floor.areas_slug : area?.slug });
    const media_player_entities = Helper.getEntityIds({ domain: "media_player", area_slug: floor ? floor.areas_slug : area?.slug });

    const isOn = '| selectattr("state","eq", "on") | list | count > 0';
    const isSomeone = `[${[...motion_entities, ...presence_entities, ...occupancy_entities]?.map(e => `states['${e}']`)}] ${isOn}`;
    const isMotion = `[${motion_entities?.map(e => `states['${e}']`)}] ${isOn}`;
    const isPresence = `[${presence_entities?.map(e => `states['${e}']`)}] ${isOn}`;
    const isOccupancy = `[${occupancy_entities?.map(e => `states['${e}']`)}] ${isOn}`;
    const isMediaPlaying = `[${media_player_entities?.map(e => `states['${e}']`)}] | selectattr("state","eq", "playing") | list | count > 0`;

    // No entity available - return undefined to skip chip creation
    if (!area_state_entity) {
      return undefined as any;
    }

    // Generate template based on source (Linus Brain or Magic Areas)
    if (isLinusBrain) {
      return this.getLinusBrainConfig(
        area_state_entity, 
        showContent, 
        showClearState, 
        device
      );
    }

    // Magic Areas configuration
    return this.getMagicAreasConfig(
      area_state_entity,
      presence_hold?.entity_id,
      showContent,
      showClearState,
      device,
      isSomeone,
      isMotion,
      isPresence,
      isOccupancy,
      isMediaPlaying
    );
  }

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(options: { area?: generic.StrategyArea, floor?: generic.StrategyFloor, showContent?: boolean, showClearState?: boolean }) {
    super();

    const defaultConfig = this.getDefaultConfig(options);

    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { AreaStateChip };
