import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Magic Areas Chip class.
 *
 * Used to create a simple chip showing Magic Areas count with navigation to integration.
 */
class MagicAreasChip extends AbstractChip {

  getDefaultConfig(): TemplateChipConfig {

    const detectionStatus = Helper.entityResolver?.getDetectionStatus();
    const hasMagicAreas = detectionStatus?.hasMagicAreas || false;

    if (!hasMagicAreas) {
      // Don't show chip if Magic Areas is not installed
      return {
        type: "template",
        icon: "",
        icon_color: "grey",
        content: "",
        tap_action: { action: "none" },
      };
    }

    return {
      type: "template",
      icon: "mdi:magic-staff",
      icon_color: "amber",
      tap_action: {
        action: "navigate",
        navigation_path: "/config/integrations/integration/magic_areas"
      },
    };
  }

  /**
   * Class Constructor.
   */
  constructor() {
    super();

    const defaultConfig = this.getDefaultConfig();

    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { MagicAreasChip };
