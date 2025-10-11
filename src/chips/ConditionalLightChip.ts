

import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

import { ConditionalChip } from "./ConditionalChip";
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

    const magicAreaAllLight = magic_device_id && Helper.magicAreasDevices[magic_device_id]?.entities?.all_lights;

    if (magicAreaAllLight) {
      this.config.push(new LightChip({ area_slug, magic_device_id, tap_action: { action: "toggle" } }).getChip());

    } else {
      const entity_ids = Helper.getEntityIds({
        domain: "light",
        area_slug,
      });

      if (entity_ids?.length) {
        this.config.push(new ConditionalChip(
          entity_ids.map(entity => ({ entity, state: "off" })),
          new LightChip({ area_slug, magic_device_id, tap_action: { action: "call-service", service: "light.turn_on", data: { entity_id: entity_ids } } }).getChip(),
        ).getChip())
        this.config.push(new ConditionalChip(
          [{ condition: "or", conditions: entity_ids.map(entity => ({ entity, state: "on", match: "any" })) }],
          new LightChip({ area_slug, magic_device_id, tap_action: { action: "call-service", service: "light.turn_off", data: { entity_id: entity_ids } } }).getChip(),
        ).getChip())

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
