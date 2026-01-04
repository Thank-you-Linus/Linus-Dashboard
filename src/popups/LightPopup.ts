import { AggregatePopup, AggregatePopupConfig } from "./AggregatePopup";

/**
 * Light Popup Class
 * 
 * Specialized popup for light aggregates with horizontal tile layout.
 * Extends AggregatePopup to provide light-specific presentation.
 */
class LightPopup extends AggregatePopup {
  
  /**
   * Override: Build individual light tile cards with inline feature layout
   * Features are displayed to the right of the entity name
   */
  protected override buildIndividualCards(config: AggregatePopupConfig): any {
    const { entity_ids, features } = config;

    // Create tile cards for each light with inline feature layout
    return entity_ids.map(entity_id => ({
      type: "tile",
      entity: entity_id,
      features: features || [],
      features_position: "inline"  // Features displayed inline to the right
    }));
  }
}

export { LightPopup };
