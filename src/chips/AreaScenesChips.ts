import { shiftIterator } from "superstruct/dist/utils";
import { Helper } from "../Helper";
import { MagicAreaRegistryEntry } from "../types/homeassistant/data/device_registry";
import { LovelaceChipConfig, TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { DOMAIN, todOrder } from "../variables";
import { slugify } from "../utils";
import { AreaRegistryEntry } from "../types/homeassistant/data/area_registry";

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
  getDefaultConfig(device: MagicAreaRegistryEntry, area: AreaRegistryEntry): TemplateChipConfig[] {

    const selects = todOrder.map(tod => Helper.getEntityState(device.entities[`scene_${tod as 'morning'}`]?.entity_id)).filter(Boolean)

    const chips = [] as TemplateChipConfig[]

    if (selects.find(scene => scene?.state == "Adaptive lighting")) {
      chips.push({
        type: "template",
        icon: "mdi:theme-light-dark",
        content: "AD",
        tap_action: {
          action: "call-service",
          service: `${DOMAIN}.area_light_adapt`,
          data: {
            area: slugify(device.name),
          }
        },
      })
    }

    selects.forEach((scene, index) => {
      if (scene?.state === "Scène instantanée") {
        const entity_id = `scene.${slugify(device.name)}_${todOrder[index]}_snapshot_scene`
        chips.push({
          type: "template",
          entity: scene?.entity_id,
          icon: scene?.attributes.icon,
          content: todOrder[index],
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
        const sceneEntity_id = Helper.getStateEntities(area, "scene").find(s => s.attributes.friendly_name === scene?.state)?.entity_id
        chips.push({
          type: "template",
          entity: scene?.entity_id,
          icon: scene?.attributes.icon,
          content: todOrder[index],
          tap_action: {
            action: "call-service",
            service: "scene.turn_on",
            data: {
              entity_id: sceneEntity_id,
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
  constructor(device: MagicAreaRegistryEntry, area: AreaRegistryEntry) {

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
