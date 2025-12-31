import { Helper } from "../Helper";

import { AggregatePopup, AggregatePopupConfig } from "./AggregatePopup";

/**
 * Media Player Popup Class
 * 
 * Extends AggregatePopup to provide media player-specific controls.
 * 
 * Features:
 * - Status card showing "X playing • Y not playing" instead of "on/off"
 * - Control buttons: "Play All" / "Pause All" instead of "Turn All On/Off"
 * - Individual media player tile cards with play/pause and volume controls
 * - Conditional display: shows "Play All" when all stopped, "Pause All" when any playing
 * 
 * This popup integrates seamlessly with the uniformized chip system while
 * providing domain-specific controls for media players.
 */
class MediaPlayerPopup extends AggregatePopup {

  /**
   * Override: Build status card showing count of playing/not playing media players
   * Uses "playing" as the active state instead of generic "on"
   */
  protected override buildStatusCard(config: AggregatePopupConfig): any {
    const { entity_ids } = config;

    // Create Jinja2 template for counting
    const statesArray = entity_ids.map(id => `states["${id}"]`).join(', ');

    // Use HA translations for media player states
    const statePlaying = Helper.localize('component.media_player.entity_component._.state.playing')
      || 'playing';
    const stateNotPlaying = Helper.localize('component.linus_dashboard.entity.text.media_player_popup.state.not_playing')
      || 'not playing';

    return {
      type: "markdown",
      content: `
        {% set entities = [${statesArray}] %}
        {% set playing = entities | selectattr('state', 'eq', 'playing') | list | count %}
        {% set not_playing = entities | count - playing %}
        **{{ playing }}** ${statePlaying} • **{{ not_playing }}** ${stateNotPlaying}
      `.trim()
    };
  }

  /**
   * Override: Build control buttons for media players
   * Shows "Play All" / "Pause All" with conditional display based on state
   */
  protected override buildControlButtons(config: AggregatePopupConfig): any {
    const { entity_ids } = config;

    // Check if all media players are NOT playing (for conditional display)
    const allNotPlayingConditions = entity_ids.map(entity => ({
      entity,
      state_not: "playing"
    }));

    // Check if any media player is playing (for conditional display)
    const anyPlayingConditions = [{
      condition: "or" as const,
      conditions: entity_ids.map(entity => ({
        entity,
        state: "playing"
      }))
    }];

    // Use translations for buttons
    const playAllLabel = Helper.localize('component.linus_dashboard.entity.text.media_player_popup.state.play_all')
      || 'Play All';
    const pauseAllLabel = Helper.localize('component.linus_dashboard.entity.text.media_player_popup.state.pause_all')
      || 'Pause All';

    return {
      type: "vertical-stack",
      cards: [
        // PLAY ALL button (shown when all media players are not playing)
        {
          type: "conditional",
          conditions: allNotPlayingConditions,
          card: {
            type: "custom:mushroom-template-card",
            primary: playAllLabel,
            icon: "mdi:play",
            icon_color: "green",
            tap_action: {
              action: "call-service",
              service: "media_player.media_play",
              data: { entity_id: entity_ids }
            },
            hold_action: { action: "none" },
            double_tap_action: { action: "none" }
          }
        },

        // PAUSE ALL button (shown when at least one media player is playing)
        {
          type: "conditional",
          conditions: anyPlayingConditions,
          card: {
            type: "custom:mushroom-template-card",
            primary: pauseAllLabel,
            icon: "mdi:pause",
            icon_color: "red",
            tap_action: {
              action: "call-service",
              service: "media_player.media_pause",
              data: { entity_id: entity_ids }
            },
            hold_action: { action: "none" },
            double_tap_action: { action: "none" }
          }
        }
      ]
    };
  }

  /**
   * Override: Build individual media player tile cards with media controls and volume
   */
  protected override buildIndividualCards(config: AggregatePopupConfig): any {
    const { entity_ids } = config;

    return entity_ids.map(entity_id => ({
      type: "tile",
      entity: entity_id,
      features: [
        { type: "media-player-playback" },
        { type: "media-player-volume-slider" }
      ]
    }));
  }
}

export { MediaPlayerPopup };
