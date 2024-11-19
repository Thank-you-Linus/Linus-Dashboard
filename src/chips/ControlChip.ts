import { AbstractChip } from "./AbstractChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AREA_CONTROL_ICONS } from "../variables";

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
   * @type {TemplateChipConfig}
   *
   * @readonly
   * @private
   */
  readonly #defaultConfig: TemplateChipConfig = {
    type: "template",
    entity: undefined,
    content: "",
    icon: AREA_CONTROL_ICONS.media_player,
    icon_color: "green",
    tap_action: {
      action: "more-info"
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(domain: string, entity_id: string) {
    super();

    this.#defaultConfig.entity = entity_id
    this.#defaultConfig.icon = AREA_CONTROL_ICONS[domain as "media_player"]
    this.#defaultConfig.icon_color = `{{ "green" if states("${entity_id}") == "on" else "red" }}`;

    this.config = Object.assign(this.config, this.#defaultConfig);

  }
}

export { ControlChip };
