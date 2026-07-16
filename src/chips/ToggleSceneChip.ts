import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { MAGIC_AREAS_DOMAIN } from "../variables";

import { AbstractChip } from "./AbstractChip";

class ToggleSceneChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {TemplateChipConfig}
   *
   */
  getDefaultConfig(device: any): TemplateChipConfig {
    // If device has no entities, try to resolve the full MA device by slug
    const hasEntities = device?.entities && Object.keys(device.entities).length > 0;
    const effectiveDevice = (!hasEntities && device?.slug)
      ? Helper.magicAreasDevices[device.slug] || device
      : device;

    return {
      type: "template",
      entity: effectiveDevice?.entities?.light_control?.entity_id,
      icon: "mdi:recycle-variant",
      tap_action: {
        action: "call-service",
        service: `${MAGIC_AREAS_DOMAIN}.area_scene_toggle`,
        data: {
          area: effectiveDevice?.name || effectiveDevice?.slug,
        }
      },
      hold_action: { action: "more-info" }
    }
  }

  /**
   * Class Constructor.
   *
   * @param {any} device The device options.
   */
  constructor(device: any) {
    super();

    const defaultConfig = this.getDefaultConfig(device);

    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { ToggleSceneChip };
