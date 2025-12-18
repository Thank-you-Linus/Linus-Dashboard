import { Helper } from "../Helper";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ActivityDetectionPopup } from "../popups/ActivityDetectionPopup";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Activity Detection Chip class.
 *
 * Used to create a chip to indicate activity detection state.
 * Shows Linus Brain activity entity when available, otherwise shows static home search icon.
 */
class ActivityDetectionChip extends AbstractChip {

  getDefaultConfig({ area_slug }: { area_slug: string }): LovelaceChipConfig {

    const resolver = Helper.entityResolver;

    // Check for Linus Brain presence detection
    const presenceSensorResolution = resolver.resolvePresenceSensor(area_slug);
    const presenceSensorEntity = presenceSensorResolution.entity_id;
    const isLinusBrain = presenceSensorResolution.source === "linus_brain";

    // Linus Brain configuration - Use activity entity chip directly
    if (isLinusBrain && presenceSensorEntity) {
      const areaStateResolution = resolver.resolveAreaState(area_slug);
      const areaStateEntity = areaStateResolution.entity_id;
      
      if (areaStateEntity) {
        return {
          type: "entity",
          entity: areaStateEntity,
          content_info: "none",
          tap_action: new ActivityDetectionPopup(area_slug).getPopup(),
        };
      }
    }

    // Without Linus Brain - static activity search icon
    return {
      type: "template",
      icon: "mdi:home-search",
      icon_color: "grey",
      content: "",
      tap_action: new ActivityDetectionPopup(area_slug).getPopup(),
    };
  }

  /**
   * Class Constructor.
   *
   * @param {string} area_slug The area slug.
   */
  constructor({ area_slug }: { area_slug: string }) {
    super();

    const defaultConfig = this.getDefaultConfig({ area_slug });

    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { ActivityDetectionChip };
