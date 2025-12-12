import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { AbstractPopup } from "./AbstractPopup";

/**
 * Lights Group Popup Class
 * 
 * Creates a popup that mimics the more-info dialog for light groups
 * when neither Linus Brain nor Magic Areas is available.
 * 
 * Features:
 * - Group control tile at the top (fake toggle with conditional cards)
 * - Individual light controls below
 * - Brightness sliders for all lights
 */
class LightsGroupPopup extends AbstractPopup {
  
  getDefaultConfig({ area_slug, entity_ids }: { 
    area_slug: string | string[], 
    entity_ids: string[] 
  }): PopupActionConfig {
    
    // Determine the area name for the popup title
    const areaName = Array.isArray(area_slug) 
      ? `${area_slug.length} zones`
      : Helper.areas[area_slug]?.name ?? "Lumières";
    
    // Check if all lights are off (for conditional display)
    const allOffConditions = entity_ids.map(entity => ({ 
      entity, 
      state: "off" 
    }));
    
    // Check if any light is on (for conditional display)
    const anyOnConditions = [{ 
      condition: "or" as const, 
      conditions: entity_ids.map(entity => ({ 
        entity, 
        state: "on"
      })) 
    }];
    
    // Group control card - Turn ON (shown when all lights are off)
    const groupControlCardOn = {
      type: "conditional",
      conditions: allOffConditions,
      card: {
        type: "tile",
        entity: entity_ids[0],
        name: areaName,
        icon: "mdi:lightbulb-group-outline",
        color: "disabled",
        features: [],
        tap_action: {
          action: "call-service",
          service: "light.turn_on",
          data: { entity_id: entity_ids }
        }
      }
    };
    
    // Group control card - Turn OFF (shown when any light is on)
    const groupControlCardOff = {
      type: "conditional",
      conditions: anyOnConditions,
      card: {
        type: "tile",
        entity: entity_ids[0],
        name: areaName,
        icon: "mdi:lightbulb-group",
        color: "amber",
        features: [
          { type: 'light-brightness' }
        ],
        tap_action: {
          action: "call-service",
          service: "light.turn_off",
          data: { entity_id: entity_ids }
        }
      }
    };
    
    // Individual light cards
    const individualLightCards = entity_ids.map(entity_id => ({
      type: "tile",
      entity: entity_id,
      features: [
        { type: 'light-brightness' }
      ]
    }));
    
    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: areaName,
          content: {
            type: "vertical-stack",
            cards: [
              // Group control (fake toggle with conditional cards)
              groupControlCardOn,
              groupControlCardOff,
              
              // Separator (only if there are multiple lights)
              ...(entity_ids.length > 1 ? [{
                type: "custom:mushroom-title-card",
                subtitle: "Contrôles individuels",
                card_mod: {
                  style: `
                    ha-card.header {
                      padding-top: 8px;
                      padding-bottom: 4px;
                    }
                  `
                }
              }] : []),
              
              // Individual lights
              ...individualLightCards
            ]
          }
        }
      }
    };
  }
  
  /**
   * Class Constructor.
   * 
   * @param {string | string[]} area_slug - The area slug(s)
   * @param {string[]} entity_ids - The light entity IDs
   */
  constructor(area_slug: string | string[], entity_ids: string[]) {
    super();
    const defaultConfig = this.getDefaultConfig({ area_slug, entity_ids });
    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { LightsGroupPopup };
