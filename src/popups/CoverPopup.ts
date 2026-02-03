import { Helper } from "../Helper";

import { AggregatePopup, AggregatePopupConfig } from "./AggregatePopup";

type AggregatePopupConfigWithEntities = AggregatePopupConfig & { entity_ids: string[] };

/**
 * Cover Popup Class
 * 
 * Extends AggregatePopup to provide cover-specific controls and icons.
 * 
 * Features:
 * - Status card showing "X open • Y closed"
 * - Control buttons: "Open All" / "Close All" 
 * - Individual cover tile cards with open/close/stop/position controls
 * - Device class-aware icons (blind, curtain, shutter, window, door, garage, etc.)
 * - Device class translations in title
 * 
 * This popup integrates seamlessly with the uniformized chip system while
 * providing domain-specific controls and icons for covers based on device_class.
 */
class CoverPopup extends AggregatePopup {

  /**
   * Map of icons by device_class
   * Each device_class has a 'closed' and 'open' icon
   */
  private static readonly COVER_ICONS: Record<string, { closed: string; open: string }> = {
    blind: { closed: "mdi:blinds", open: "mdi:blinds-open" },
    curtain: { closed: "mdi:curtains", open: "mdi:curtains-closed" },
    shutter: { closed: "mdi:window-shutter", open: "mdi:window-shutter-open" },
    window: { closed: "mdi:window-closed", open: "mdi:window-open" },
    door: { closed: "mdi:door-closed", open: "mdi:door-open" },
    garage: { closed: "mdi:garage", open: "mdi:garage-open" },
    gate: { closed: "mdi:gate", open: "mdi:gate-open" },
    awning: { closed: "mdi:window-shutter", open: "mdi:window-shutter-open" },
    damper: { closed: "mdi:valve-closed", open: "mdi:valve-open" },
    shade: { closed: "mdi:roller-shade", open: "mdi:roller-shade-closed" },
    default: { closed: "mdi:window-shutter", open: "mdi:window-shutter-open" }
  };

  /**
   * Override: Build title with device_class translation
   * Examples:
   * - "Blinds - Living Room"
   * - "Curtains - Bedroom"
   * - "Garage Doors"
   */
  protected override buildTitle(config: AggregatePopupConfig): string {
    // Get device_class translation if available
    let domainLabel: string;

    if (config.device_class) {
      // Try to get device_class-specific translation from Home Assistant
      // Priority: 1. HA translation, 2. Strategy options, 3. Translation key, 4. device_class name
      const haTranslation = Helper.localize(`component.cover.entity_component.${config.device_class}.name`);
      domainLabel = (haTranslation && haTranslation !== "translation not found" ? haTranslation : null)
        || Helper.strategyOptions.domains[`${config.domain}_${config.device_class}`]?.title
        || (config.translationKey ? config.translationKey.charAt(0).toUpperCase() + config.translationKey.slice(1) : null)
        || config.device_class.charAt(0).toUpperCase() + config.device_class.slice(1);
    } else {
      // Fallback to generic "Covers" with HA translations
      // Priority: 1. HA translation, 2. Strategy options, 3. Translation key, 4. domain name
      const haTranslation = Helper.localize(`component.${config.domain}.title`);
      domainLabel = (haTranslation && haTranslation !== "translation not found" ? haTranslation : null)
        || Helper.strategyOptions.domains[config.domain]?.title
        || (config.translationKey ? config.translationKey.charAt(0).toUpperCase() + config.translationKey.slice(1) : null)
        || config.domain.charAt(0).toUpperCase() + config.domain.slice(1);
    }

    switch (config.scope) {
      case "global":
        return domainLabel; // "Blinds", "Curtains", etc.

      case "floor":
        return `${domainLabel} - ${config.scopeName}`; // "Blinds - Ground Floor"

      case "area": {
        // Avoid duplication if area name already contains domain
        const lowerName = config.scopeName.toLowerCase();
        const lowerDomain = domainLabel.toLowerCase();
        if (lowerName.includes(lowerDomain)) {
          return config.scopeName; // "Living Room Blinds" → "Living Room Blinds"
        }
        return `${domainLabel} ${config.scopeName.toLowerCase()}`; // "Blinds living room"
      }
    }
  }

  /**
   * Override: Get status labels for covers
   * Shows "open" / "closed" instead of generic "on"/"off"
   */
  protected override getStatusLabels(_config: any): { active: string; inactive: string } {
    return {
      active: Helper.localize('component.cover.entity_component._.state.open') || 'open',
      inactive: Helper.localize('component.cover.entity_component._.state.closed') || 'closed'
    };
  }

  /**
   * Override: Build control buttons for covers
   * Shows "Open All" and "Close All" buttons side-by-side
   * Uses device_class-specific icons
   */
  protected override buildControlButtons(config: AggregatePopupConfigWithEntities): any {
    const { entity_ids, device_class } = config;

    // Get appropriate icons based on device_class
    const icons = CoverPopup.COVER_ICONS[device_class || 'default'] || CoverPopup.COVER_ICONS.default;

    // Use translations for buttons
    const openAllLabel = Helper.localize('component.linus_dashboard.entity.text.cover_popup.state.open_all')
      || 'Open All';
    const closeAllLabel = Helper.localize('component.linus_dashboard.entity.text.cover_popup.state.close_all')
      || 'Close All';

    return {
      type: "horizontal-stack",
      cards: [
        // OPEN ALL button (always visible)
        {
          type: "custom:mushroom-template-card",
          primary: openAllLabel,
          icon: icons.open,
          icon_color: "blue",
          layout: "horizontal",
          tap_action: {
            action: "call-service",
            service: "cover.open_cover",
            data: {
              entity_id: entity_ids
            }
          },
          hold_action: {
            action: "none"
          },
          double_tap_action: {
            action: "none"
          }
        },

        // CLOSE ALL button (always visible)
        {
          type: "custom:mushroom-template-card",
          primary: closeAllLabel,
          icon: icons.closed,
          icon_color: "disabled",
          layout: "horizontal",
          tap_action: {
            action: "call-service",
            service: "cover.close_cover",
            data: {
              entity_id: entity_ids
            }
          },
          hold_action: {
            action: "none"
          },
          double_tap_action: {
            action: "none"
          }
        }
      ]
    };
  }

  /**
   * Helper: Build cover features dynamically based on supported_features
   */
  private buildCoverFeatures(entity_id: string): any[] {
    const features: any[] = [{ type: "cover-open-close" }];
    const entityState = Helper.getEntityState(entity_id);
    const supportedFeatures = entityState?.attributes?.supported_features || 0;
    const supportsPosition = Math.floor(supportedFeatures / 4) % 2 === 1;
    if (supportsPosition) {
      features.push({ type: "cover-position" });
    }
    return features;
  }

  /**
   * Override: Build cover tile with dynamic features
   * Features vary based on supported_features (position control, tilt, etc.)
   */
  protected override buildEntityTile(entity_id: string, _config: any): any {
    return {
      type: "tile",
      entity: entity_id,
      features: this.buildCoverFeatures(entity_id)
    };
  }
}

export { CoverPopup };
