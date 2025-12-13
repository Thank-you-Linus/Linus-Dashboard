
import { Helper } from "../Helper";
import { generic } from "../types/strategy/generic";

import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import StrategyArea = generic.StrategyArea;

import { LovelaceChipConfig, TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { MAGIC_AREAS_DOMAIN, TOD_ORDER } from "../variables";
import { slugify } from "../utils";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area selects Chips class.
 *
 * Used to create a chip to indicate climate level.
 */
class AreaScenesChips {
  /**
   * Configuration of the chip.
   *
   * @type {LovelaceChipConfig[]}
   */
  config: LovelaceChipConfig[] = [];
  /**
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig}
   *
   */
  getDefaultConfig(device: MagicAreaRegistryEntry, area: StrategyArea): TemplateChipConfig[] {

    const selects = TOD_ORDER.map(tod => Helper.getEntityState(device?.entities[`scene_${tod as 'morning'}`]?.entity_id)).filter(Boolean)

    const chips = [] as TemplateChipConfig[]

    if (selects.find(scene => scene?.state == "Adaptive lighting")) {
      chips.push({
        type: "template",
        icon: "mdi:theme-light-dark",
        content: "AD",
        tap_action: {
          action: "call-service",
          service: `${MAGIC_AREAS_DOMAIN}.area_light_adapt`,
          data: {
            area: slugify(device.name),
          }
        },
      })
    }

    selects.forEach((scene, index) => {
      if (scene?.state === "Scène instantanée") {
        const entity_id = `scene.${slugify(device.name)}_${TOD_ORDER[index]}_snapshot_scene`
        chips.push({
          type: "template",
          entity: scene?.entity_id,
          icon: scene?.attributes.icon,
          content: TOD_ORDER[index],
          tap_action: {
            action: "call-service",
            service: "scene.turn_on",
            data: { entity_id }
          },
          hold_action: {
            action: "more-info"
          }
        })
      } else if (scene?.state !== "Adaptive lighting") {
        const sceneEntityId = Helper.getStateEntities(area, "scene").find(s => s.attributes.friendly_name === scene?.state)?.entity_id
        chips.push({
          type: "template",
          entity: scene?.entity_id,
          icon: scene?.attributes.icon,
          content: TOD_ORDER[index],
          tap_action: {
            action: "call-service",
            service: "scene.turn_on",
            data: {
              entity_id: sceneEntityId,
            }
          },
          hold_action: {
            action: "more-info"
          }
        })
      }
    })

    return chips

  }

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(device: MagicAreaRegistryEntry, area: StrategyArea) {

    this.config = this.getDefaultConfig(device, area);

  }


  // noinspection JSUnusedGlobalSymbols Method is called on dymanically imported classes.
  /**
   * Get the chip.
   *
   * @returns  {LovelaceChipConfig} A chip.
   */
  getChips(): LovelaceChipConfig[] {
    return this.config;
  }
}

export { AreaScenesChips };
