import { AggregatePopup } from "./AggregatePopup";

/**
 * Camera Popup Class
 *
 * Specialized popup for camera aggregates displaying live camera feeds.
 * Extends AggregatePopup to show picture-entity cards with live camera view
 * instead of standard tile cards.
 */
class CameraPopup extends AggregatePopup {

  /**
   * Override: Build camera card with live feed
   * Uses picture-entity card type with camera_view: "live" for real-time streaming
   */
  protected override buildEntityTile(entity_id: string, config: any): any {
    return {
      type: "picture-entity",
      entity: entity_id,
      camera_view: "live",
      show_name: true,
      show_state: false
    };
  }
}

export { CameraPopup };
