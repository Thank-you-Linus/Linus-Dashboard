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
 * - Group control using two conditional cards to simulate a group entity
 * - State is calculated: "on" if at least one light is on, "off" if all are off
 * - Badge shows the count of lights currently on (only when lights are on)
 * - Smart action: turns ON when all off, turns OFF when any on (standard light group behavior)
 * - Individual light controls below with brightness sliders
 * 
 * Technical Implementation:
 * - Uses two conditional mushroom-template-cards:
 *   1. Turn ON card (visible when all lights are off)
 *   2. Turn OFF card (visible when at least one light is on)
 * - Icon and color change dynamically based on group state
 * - Badge with count only appears on the "turn off" card
 * - No brightness control at group level (too complex for template-based approach)
 */
class LightsGroupPopup extends AbstractPopup {

  getDefaultConfig({ area_slug, entity_ids }: {
    area_slug: string | string[],
    entity_ids: string[]
  }): PopupActionConfig {

    // Determine the area name for the popup title
    const areaName = Array.isArray(area_slug)
      ? `${area_slug.length} ${Helper.localize("component.linus_dashboard.entity.text.settings_popup.state.areas")}`
      : Helper.areas[area_slug]?.name ?? Helper.localize("component.linus_dashboard.entity.text.lights_group_popup.state.title");

    // Build the title: "Lights {area_name}" or just "{area_name}" if it already contains "lights"
    const lightsLabel = Helper.localize("component.linus_dashboard.entity.text.lights_group_popup.state.title");
    const popupTitle = Array.isArray(area_slug) || areaName.toLowerCase().includes(lightsLabel.toLowerCase())
      ? areaName
      : `${lightsLabel} ${areaName.toLowerCase()}`;

    // Create template strings for group state calculation
    // State is 'on' if at least one light is on, 'off' if all are off
    const statesArray = entity_ids.map(id => `states['${id}']`).join(', ');

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

    // Group control card - TURN ON (shown when all lights are off)
    const groupControlCardTurnOn = {
      type: "conditional",
      conditions: allOffConditions,
      card: {
        type: "custom:mushroom-template-card",
        primary: areaName,
        icon: "mdi:lightbulb-group-outline",
        icon_color: "disabled",
        tap_action: {
          action: "call-service",
          service: "light.turn_on",
          data: { entity_id: entity_ids }
        },
        hold_action: {
          action: "none"
        },
        double_tap_action: {
          action: "none"
        }
      }
    };

    // Group control card - TURN OFF (shown when at least one light is on)
    const groupControlCardTurnOff = {
      type: "conditional",
      conditions: anyOnConditions,
      card: {
        type: "custom:mushroom-template-card",
        primary: areaName,
        icon: "mdi:lightbulb-group",
        icon_color: "amber",
        badge_icon: `
          {% set lights = [${statesArray}] %}
          {% set on_count = lights | selectattr('state', 'eq', 'on') | list | count %}
          {% if on_count > 0 %}
            mdi:numeric-{{ on_count if on_count < 10 else '9-plus' }}-box
          {% endif %}
        `.trim(),
        badge_color: "amber",
        tap_action: {
          action: "call-service",
          service: "light.turn_off",
          data: { entity_id: entity_ids }
        },
        hold_action: {
          action: "none"
        },
        double_tap_action: {
          action: "none"
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
          title: popupTitle,
          content: {
            type: "vertical-stack",
            cards: [
              // Group control cards (conditional: turn on when all off, turn off when any on)
              groupControlCardTurnOn,
              groupControlCardTurnOff,

              // Separator (only if there are multiple lights)
              ...(entity_ids.length > 1 ? [{
                type: "custom:mushroom-title-card",
                subtitle: Helper.localize("component.linus_dashboard.entity.text.lights_group_popup.state.individual_controls"),
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
