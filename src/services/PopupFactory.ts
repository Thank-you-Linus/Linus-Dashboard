/**
 * Popup Factory Service
 *
 * Centralizes popup creation logic for aggregate chips and cards.
 * Automatically selects the appropriate popup type based on domain and configuration.
 */

export interface PopupConfig {
  /** Domain of entities (light, climate, cover, etc.) */
  domain: string;
  /** Scope of control (global, floor, area) */
  scope: "global" | "floor" | "area";
  /** Display name for scope */
  scopeName: string;
  /** Entity IDs to control */
  entity_ids: string[];
  /** Service to turn on */
  serviceOn: string;
  /** Service to turn off */
  serviceOff: string;
  /** States considered active */
  activeStates: string[];
  /** Translation key for domain */
  translationKey: string;
  /** Linus Brain entity if available */
  linusBrainEntity: string | null;
  /** Optional features for tile cards */
  features?: any[];
  /** Optional device class */
  device_class?: string;
}

/**
 * Factory for creating domain-specific popups
 */
export class PopupFactory {
  /**
   * Create appropriate popup for domain
   *
   * @param config - Popup configuration
   * @returns Popup action object (tap_action or hold_action)
   */
  static createPopup(config: PopupConfig): any {
    // If Linus Brain group available, use more-info
    if (config.linusBrainEntity) {
      return {
        action: "more-info",
        entity: config.linusBrainEntity,
      };
    }

    // Otherwise, create domain-specific popup
    return this.createDomainPopup(config);
  }

  /**
   * Create domain-specific popup
   *
   * @param config - Popup configuration
   * @returns Popup action object
   * @private
   */
  private static createDomainPopup(config: PopupConfig): any {
    switch (config.domain) {
      case "media_player":
        return this.createMediaPlayerPopup(config);

      case "cover":
        return this.createCoverPopup(config);

      default:
        return this.createAggregatePopup(config);
    }
  }

  /**
   * Create MediaPlayerPopup (extends AggregatePopup with media controls)
   *
   * @param config - Popup configuration
   * @returns Popup action object
   * @private
   */
  private static createMediaPlayerPopup(config: PopupConfig): any {
    const { MediaPlayerPopup } = require("../popups/MediaPlayerPopup");
    const popup = new MediaPlayerPopup({
      domain: config.domain,
      scope: config.scope,
      scopeName: config.scopeName,
      entity_ids: config.entity_ids,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      linusBrainEntity: null,
      features: config.features,
      device_class: config.device_class,
    });
    return popup.getPopup();
  }

  /**
   * Create CoverPopup (extends AggregatePopup with device_class-specific icons)
   *
   * @param config - Popup configuration
   * @returns Popup action object
   * @private
   */
  private static createCoverPopup(config: PopupConfig): any {
    const { CoverPopup } = require("../popups/CoverPopup");
    const popup = new CoverPopup({
      domain: config.domain,
      scope: config.scope,
      scopeName: config.scopeName,
      entity_ids: config.entity_ids,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      linusBrainEntity: null,
      features: config.features,
      device_class: config.device_class,
    });
    return popup.getPopup();
  }

  /**
   * Create AggregatePopup (generic popup for all other domains)
   *
   * @param config - Popup configuration
   * @returns Popup action object
   * @private
   */
  private static createAggregatePopup(config: PopupConfig): any {
    const { AggregatePopup } = require("../popups/AggregatePopup");
    const popup = new AggregatePopup({
      domain: config.domain,
      scope: config.scope,
      scopeName: config.scopeName,
      entity_ids: config.entity_ids,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      linusBrainEntity: null,
      features: config.features,
      device_class: config.device_class,
    });
    return popup.getPopup();
  }
}
