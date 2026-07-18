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
  /** Floor ID for floor scope (entities will be queried dynamically) */
  floor_id?: string;
  /** Area slug for area scope (entities will be queried dynamically) */
  area_slug?: string;
  /** Service to turn on */
  serviceOn: string;
  /** Service to turn off */
  serviceOff: string;
  /** States considered active */
  activeStates: string[];
  /** Translation key for domain */
  translationKey: string;
  /** Area's group entity if available (Dashboard native or Magic Areas) */
  groupEntity: string | null;
  /**
   * The dedicated group entity backing this chip's own scope, not just
   * area (light.linus_dashboard_all_lights_floor_X / _global too), when
   * one exists for this domain. Lets the popup's Turn All On/Off buttons
   * target this single controllable entity instead of every raw member —
   * same resolution AggregateChip already did for its own rendering
   * (getAggregateSensorId), just threaded through instead of re-derived
   * here.
   */
  dedicatedGroupEntity?: string | null;
  /** Optional features for tile cards */
  features?: any[];
  /** Optional device class. Pass null to get ONLY entities without device_class */
  device_class?: string | null;
  /** Show navigation button to domain view (default: true for area/floor scope) */
  showNavigationButton?: boolean;
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
      case "light":
        return this.createLightPopup(config);

      case "media_player":
        return this.createMediaPlayerPopup(config);

      case "cover":
        return this.createCoverPopup(config);

      case "camera":
        return this.createCameraPopup(config);

      default:
        return this.createAggregatePopup(config);
    }
  }

  /**
   * Create LightPopup (extends AggregatePopup with horizontal tile layout)
   *
   * @param config - Popup configuration
   * @returns Popup action object
   * @private
   */
  private static createLightPopup(config: PopupConfig): any {
    const { LightPopup } = require("../popups/LightPopup");
    const popup = new LightPopup({
      domain: config.domain,
      scope: config.scope,
      scopeName: config.scopeName,
      floor_id: config.floor_id,
      area_slug: config.area_slug,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      groupEntity: config.groupEntity,
      dedicatedGroupEntity: config.dedicatedGroupEntity,
      features: config.features,
      device_class: config.device_class,
      showNavigationButton: config.showNavigationButton,
    });
    return popup.getPopup();
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
      floor_id: config.floor_id,
      area_slug: config.area_slug,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      groupEntity: null,
      // No Magic Areas media_player *group* equivalent (groupEntity stays
      // null, see AggregateChip's getGroupEntity), but media_player.py now
      // provides a real dedicated group — this was missing entirely here,
      // so the group control tile never showed and Play All/Pause All
      // always targeted the raw entity list even when the group existed.
      dedicatedGroupEntity: config.dedicatedGroupEntity,
      features: config.features,
      device_class: config.device_class,
      showNavigationButton: config.showNavigationButton,
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
      floor_id: config.floor_id,
      area_slug: config.area_slug,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      groupEntity: config.groupEntity,
      dedicatedGroupEntity: config.dedicatedGroupEntity,
      features: config.features,
      device_class: config.device_class,
      showNavigationButton: config.showNavigationButton,
    });
    return popup.getPopup();
  }

  /**
   * Create CameraPopup (extends AggregatePopup with live camera feed cards)
   *
   * @param config - Popup configuration
   * @returns Popup action object
   * @private
   */
  private static createCameraPopup(config: PopupConfig): any {
    const { CameraPopup } = require("../popups/CameraPopup");
    const popup = new CameraPopup({
      domain: config.domain,
      scope: config.scope,
      scopeName: config.scopeName,
      floor_id: config.floor_id,
      area_slug: config.area_slug,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      groupEntity: null,
      features: config.features,
      device_class: config.device_class,
      showNavigationButton: config.showNavigationButton,
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
      floor_id: config.floor_id,
      area_slug: config.area_slug,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      groupEntity: config.groupEntity,
      dedicatedGroupEntity: config.dedicatedGroupEntity,
      features: config.features,
      device_class: config.device_class,
      showNavigationButton: config.showNavigationButton,
    });
    return popup.getPopup();
  }
}
