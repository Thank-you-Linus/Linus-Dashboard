import { AbstractChip } from "./AbstractChip";
import { EntityChipConfig, TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Control Chip class.
 *
 * Used to create a chip to indicate how many lights are on and to turn all off.
 */
class ControlChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {EntityChipConfig}
   *
   * @readonly
   * @private
   */
  readonly #defaultConfig: EntityChipConfig = {
    type: "entity",
    entity: undefined,
    content_info: "none",
    // icon_color: "{% if is_state('switch.magic_areas_climate_groups_salon_climate_control', 'on') %}green{% else %}red{% endif %}",
    icon_color: `
      {% if states('switch.magic_areas_climate_groups_salon_climate_control') === 'off' %}
        green
      {% else %}
        blue
      {% endif %}
    `,
    tap_action: {
      action: "more-info"
    },

    // card_mod: {
    //   style: `
    //     ha-card {
    //       {% if states('switch.magic_areas_climate_groups_salon_climate_control') == 'on' %}
    //         --card-mod-icon-color: blue;
    //       {% else %}
    //         --card-mod-icon-color: green;
    //       {% endif %}
    //     }
    //   `
    // }

  };

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(entity_id: string) {
    super();

    this.#defaultConfig.entity = entity_id
    this.config = Object.assign(this.config, this.#defaultConfig);

  }
}

export { ControlChip };
