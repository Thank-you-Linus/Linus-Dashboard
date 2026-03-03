import { Helper } from "../Helper";

import { AggregatePopup, AggregatePopupConfig } from "./AggregatePopup";

type AggregatePopupConfigWithEntities = AggregatePopupConfig & { entity_ids: string[] };

/**
 * Camera Popup Class
 *
 * Specialized popup for camera aggregates displaying live camera feeds.
 * Extends AggregatePopup to show picture-entity cards with live camera view
 * instead of standard tile cards.
 *
 * Cameras don't have on/off states - they use idle/streaming/recording.
 * The status card shows the total number of available cameras instead of
 * an active/inactive count.
 */
class CameraPopup extends AggregatePopup {

  /**
   * Override: Build camera card with live feed
   * Uses picture-entity card type with camera_view: "live" for real-time streaming
   */
  protected override buildEntityTile(entity_id: string, _config: any): any {
    return {
      type: "picture-entity",
      entity: entity_id,
      camera_view: "live",
      show_name: true,
      show_state: false
    };
  }

  /**
   * Override: Build status card showing available cameras count
   * Cameras don't have on/off — show available (not unavailable/unknown) vs total
   */
  protected override buildStatusCard(config: AggregatePopupConfigWithEntities) {
    const { entity_ids } = config;

    const statesArray = entity_ids.map(id => `states["${id}"]`).join(', ');

    const label = Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.state_available')
      || 'available';

    return {
      type: "markdown",
      content: `
        {% set entities = [${statesArray}] %}
        {% set available = entities | rejectattr('state', 'in', ['unavailable', 'unknown']) | list | count %}
        {% set total = entities | count %}
        **{{ available }}/{{ total }}** ${label}
      `.trim()
    };
  }
}

export { CameraPopup };
