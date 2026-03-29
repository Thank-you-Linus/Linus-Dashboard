import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Toggle Scene Chip class.
 *
 * Previously used Magic Areas area_scene_toggle service.
 * Magic Areas support has been removed; this chip is now a no-op stub.
 */
class ToggleSceneChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {TemplateChipConfig}
   *
   */
  getDefaultConfig(_device: any): TemplateChipConfig {
    return {
      type: "template",
      icon: "mdi:recycle-variant",
      tap_action: { action: "none" },
      hold_action: { action: "more-info" }
    };
  }

  /**
   * Class Constructor.
   *
   * @param {any} device The device options (unused, kept for backward compatibility).
   */
  constructor(device: any) {
    super();

    const defaultConfig = this.getDefaultConfig(device);

    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { ToggleSceneChip };
