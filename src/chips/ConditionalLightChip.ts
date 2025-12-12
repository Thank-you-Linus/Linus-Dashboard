

import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

import { LightChip } from "./LightChip";
import { Helper } from "../Helper";

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

    // Use EntityResolver to get all_lights entity (Linus Brain or Magic Areas)
    const allLightsResolution = magic_device_id
      ? Helper.entityResolver.resolveAllLights(magic_device_id)
      : { entity_id: null, source: "native" as const };

    const allLightsEntity = allLightsResolution.entity_id;

    if (allLightsEntity) {
      // Let LightChip decide the tap_action based on source (Linus Brain or Magic Areas)
      this.config.push(new LightChip({ area_slug, magic_device_id }).getChip());

    } else {
      const entity_ids = Helper.getEntityIds({
        domain: "light",
        area_slug,
      });

      if (entity_ids?.length) {
        // Let LightChip handle tap_action (will use popup for native case)
        this.config.push(new LightChip({ area_slug, magic_device_id }).getChip());
      }


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
