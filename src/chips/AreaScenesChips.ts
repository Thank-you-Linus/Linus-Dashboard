
import { Helper } from "../Helper";
import { generic } from "../types/strategy/generic";

import StrategyArea = generic.StrategyArea;

import { LovelaceChipConfig, TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { TOD_ORDER } from "../variables";
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
  getDefaultConfig(device: any, area: StrategyArea): TemplateChipConfig[] {

    const selects = TOD_ORDER.map(tod => Helper.getEntityState(device?.entities[`scene_${tod as 'morning'}`]?.entity_id)).filter(Boolean)

    const chips = [] as TemplateChipConfig[]

    selects.forEach((scene, index) => {
      if (scene?.state === "Scène instantanée") {
        const entity_id = `scene.${slugify(device.name)}_${TOD_ORDER[index]}_snapshot_scene`
        chips.push({
          type: "template",
          entity: scene?.entity_id,
          icon: `{{ state_attr('${scene?.entity_id}', 'icon') }}`,
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
          icon: `{{ state_attr('${scene?.entity_id}', 'icon') }}`,
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
  constructor(device: any, area: StrategyArea) {

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
