import { AreaInformations } from "../popups/AreaInformationsPopup";
import { generic } from "../types/strategy/generic";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { Helper } from "../Helper";
import { buildMediaActiveConditions } from "../utils/activityBadgeTemplates";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area state Chip class.
 *
 * Used to create a chip to indicate area state.
 * Supports Linus Brain (activity sensor) only.
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
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig}
   *
   */
  getDefaultConfig({ area, floor, showContent = false, showClearState = true }: { area?: generic.StrategyArea, floor?: generic.StrategyFloor, showContent?: boolean, showClearState?: boolean }): TemplateChipConfig {

    const device_id = area?.slug ?? floor?.floor_id;

    // Use EntityResolver to get area state entity (Linus Brain only)
    const resolver = Helper.entityResolver;
    const areaStateResolution = device_id ? resolver.resolveAreaState(device_id) : { entity_id: null, source: "native" as const };
    const area_state_entity = areaStateResolution.entity_id;
    const isLinusBrain = areaStateResolution.source === "linus_brain";

    const areaSlugs = floor ? floor.areas_slug : area?.slug;
    const { isMediaActive: _isMediaPlaying } = buildMediaActiveConditions(areaSlugs as string | string[]);

    // No entity available - return undefined to skip chip creation
    if (!area_state_entity || !isLinusBrain) {
      return undefined as any;
    }

    return this.getLinusBrainConfig(
      area_state_entity,
      showContent,
      showClearState,
      undefined
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
