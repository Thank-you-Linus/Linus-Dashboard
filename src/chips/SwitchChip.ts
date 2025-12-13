import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { navigateTo } from "../utils";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Switch Chip class.
 *
 * Used to create a chip to indicate how many switches are on and to turn all off.
 */
class SwitchChip extends AbstractChip {
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
    icon: "mdi:dip-switch",
    content: "",
    tap_action: navigateTo('switch'),
    hold_action: navigateTo('switch'),
  };

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor(options: chips.ChipOptions, entity?: EntityRegistryEntry) {
    super();

    const entities = Helper.getEntityIds({
      domain: "switch",
      area_slug: options?.area_slug,
    });

    if (!entities.length) {
      if (Helper.debug) console.warn("No entities found for switch chip");
      return;
    }

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getContent("switch", undefined, entities);
    }

    this.#defaultConfig.icon = Helper.getIcon("switch", undefined, entities);
    this.#defaultConfig.icon_color = Helper.getIconColor("switch", undefined, entities);

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { SwitchChip };
