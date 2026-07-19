import { Helper } from "../Helper";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ActivityDetectionPopup } from "../popups/ActivityDetectionPopup";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Activity Detection Chip class.
 *
 * Used to create a chip to indicate activity detection state. Shows Linus
 * Brain's activity/context entity when available (richer: movement/
 * inactive/empty/sleep/... with its own icon per state), falling back to
 * the native presence entity (binary_sensor.linus_dashboard_
 * presence_detection_area_X — just on/off, but a real dynamic signal) when
 * Brain isn't installed, and only a static icon if neither exists.
 */
class ActivityDetectionChip extends AbstractChip {

  getDefaultConfig({ area_slug }: { area_slug: string }): LovelaceChipConfig {

    const resolver = Helper.entityResolver;

    // Check for Linus Brain activity/context entity. Previously this
    // derived "is Brain installed" from resolvePresenceSensor()'s source —
    // that stopped working once presence detection moved to a Dashboard-
    // native entity (resolvePresenceSensor no longer ever returns
    // "linus_brain"). Check resolveAreaState's own source directly instead,
    // since that's the entity actually being displayed below and it's still
    // Brain-only.
    const areaStateResolution = resolver.resolveAreaState(area_slug);
    const areaStateEntity = areaStateResolution.entity_id;
    const isLinusBrain = areaStateResolution.source === "linus_brain";

    // Linus Brain configuration - Use activity entity chip directly
    if (isLinusBrain && areaStateEntity) {
      return {
        type: "entity",
        entity: areaStateEntity,
        content_info: "none",
        tap_action: new ActivityDetectionPopup(area_slug).getPopup(),
      };
    }

    // No Brain — fall back to the native presence entity, if this area has
    // one, rather than a static icon that never reflects anything.
    const presenceSensorEntity = resolver.resolvePresenceSensor(area_slug).entity_id;
    if (presenceSensorEntity) {
      return {
        type: "entity",
        entity: presenceSensorEntity,
        content_info: "none",
        tap_action: new ActivityDetectionPopup(area_slug).getPopup(),
      };
    }

    // Neither Brain nor a presence entity for this area — static icon.
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
