

import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { Helper } from "../Helper";

import { LightChip } from "./LightChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and control them.
 */
class ConditionalLightChip {
  /**
   * Configuration of the chip.
   *
   * @type {LovelaceChipConfig[]}
   */
  config: LovelaceChipConfig[] = [];

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor({ area_slug, magic_device_id }: { area_slug: string | string[], magic_device_id?: string }) {

    // LightChip handles all resolution logic internally (Linus Brain, Magic Areas, or native)
    // Only create the chip if light entities exist in the area
    const entity_ids = Helper.getEntityIds({
      domain: "light",
      area_slug,
    });

    if (entity_ids?.length) {
      this.config.push(new LightChip({ area_slug, magic_device_id }).getChip());
    }

  }



  // noinspection JSUnusedGlobalSymbols Method is called on dymanically imported classes.
  /**
   * Get the chip.
   *
   * @returns  {LovelaceChipConfig} A chip.
   */
  getChip(): LovelaceChipConfig[] {
    return this.config;
  }
}

export { ConditionalLightChip };
