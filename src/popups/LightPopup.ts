import { AggregatePopup } from "./AggregatePopup";

/**
 * Light Popup Class
 *
 * Specialized popup for light aggregates with horizontal tile layout.
 * Extends AggregatePopup to provide light-specific presentation.
 */
class LightPopup extends AggregatePopup {

  /**
   * Override: Build light tile with inline features
   * Light tiles display brightness slider inline instead of in feature menu
   */
  protected override buildEntityTile(entity_id: string, config: any): any {
    return {
      type: "tile",
      entity: entity_id,
      features: config.features || [],
      features_position: "inline"
    };
  }
}

export { LightPopup };
