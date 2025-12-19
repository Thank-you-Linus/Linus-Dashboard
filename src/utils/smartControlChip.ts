import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { MAGIC_AREAS_DOMAIN, LINUS_BRAIN_DOMAIN } from "../variables";

/**
 * Configuration for creating a smart control chip
 */
export interface SmartControlChipConfig {
  /** The domain (e.g., "switch", "fan", "media_player", "cover") */
  domain: string;
  /** The service name for turning on (e.g., "turn_on", "open_cover") */
  serviceOn: string;
  /** The service name for turning off (e.g., "turn_off", "close_cover") */
  serviceOff: string;
  /** States to count as "active" (e.g., ["on"] for switch, ["open", "opening"] for cover) */
  activeStates: string[];
  /** Translation key prefix (e.g., "switch", "fan", "media_player", "cover") */
  translationKey: string;
  /** Color to use when entities are active (defaults to domain-specific color) */
  activeColor?: string;
}

/**
 * Domain color mapping for smart control chips
 */
const DOMAIN_COLORS: Record<string, string> = {
  light: "amber",
  switch: "yellow",
  fan: "cyan",
  media_player: "light-blue",
  cover: "purple",
};

/**
 * Creates a smart control chip for a given domain
 * 
 * Features:
 * - Shows current state (count of active entities)
 * - Opens popup with two action buttons (turn on / turn off)
 * - Excludes Magic Areas and Linus Brain entities
 * - Only shows if entities exist in areas (no global Magic Areas entity)
 * 
 * @param config - Configuration for the smart control chip
 * @returns TemplateChipConfig or null if no entities found
 */
export function createSmartControlChip(config: SmartControlChipConfig): TemplateChipConfig | null {
  const { domain, serviceOn, serviceOff, activeStates, translationKey, activeColor } = config;

  // Get all entities for this domain that are assigned to areas
  const all_entity_ids = Helper.getEntityIds({
    domain,
    area_slug: undefined, // Get all entities from all areas (excluding global/undisclosed)
  }).filter(id => id && typeof id === 'string' && id.includes('.')); // Filter out invalid entity IDs

  // Exclude Magic Areas and Linus Brain entities
  const entity_ids = all_entity_ids.filter(id => {
    const entity = Helper.entities[id];
    return entity && entity.platform !== MAGIC_AREAS_DOMAIN && entity.platform !== LINUS_BRAIN_DOMAIN;
  });

  // If no entities found, don't create chip
  if (entity_ids.length === 0) {
    return null;
  }

  // Create state objects array for Jinja2 templates
  // Use double quotes for state keys to avoid conflicts with Jinja2 strings
  const statesArray = entity_ids.map(id => `states["${id}"]`).join(', ');

  // Build active states condition for Jinja2
  const activeStatesCondition = activeStates.map(state => `'${state}'`).join(', ');

  // Determine the color to use based on domain or custom config
  const domainColor = activeColor || DOMAIN_COLORS[domain] || "amber";

  // Icon color: domain color when active, grey when all inactive
  const iconColor = `
    {% set entities = [${statesArray}] %}
    {% set active_count = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
    {{ '${domainColor}' if active_count > 0 else 'grey' }}
  `.trim();

  // Content: Just show the count of active entities
  const content = `
    {% set entities = [${statesArray}] %}
    {% set active_count = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
    {{ active_count }}
  `.trim();

  // Get translations using Helper.localize
  const title = Helper.localize(`component.linus_dashboard.entity.text.smart_control.state.title_${translationKey}`);
  const stateOn = Helper.localize('component.linus_dashboard.entity.text.smart_control.state.state_on');
  const stateOff = Helper.localize('component.linus_dashboard.entity.text.smart_control.state.state_off');
  const actionOn = Helper.localize(`component.linus_dashboard.entity.text.smart_control.state.action_on_${translationKey}`);
  const actionOff = Helper.localize(`component.linus_dashboard.entity.text.smart_control.state.action_off_${translationKey}`);

  // Popup with two action buttons (turn on / turn off)
  const tapAction = {
    action: "fire-dom-event" as const,
    browser_mod: {
      service: "browser_mod.popup",
      data: {
        title: title,
        content: {
          type: "vertical-stack",
          cards: [
            // Status message showing active/inactive counts
            {
              type: "markdown",
              content: `
                {% set entities = [${statesArray}] %}
                {% set active = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
                {% set inactive = entities | count - active %}
                **{{ active }}** ${stateOn} • **{{ inactive }}** ${stateOff}
              `.trim()
            },

            // Two action buttons (horizontal layout)
            {
              type: "horizontal-stack",
              cards: [
                // Turn All ON button
                {
                  type: "custom:mushroom-template-card",
                  primary: actionOn,
                  icon: "mdi:power-on",
                  icon_color: "green",
                  layout: "vertical",
                  tap_action: {
                    action: "call-service" as const,
                    service: `${domain}.${serviceOn}`,
                    data: {
                      entity_id: entity_ids
                    }
                  },
                  // Close popup and show notification after action
                  hold_action: {
                    action: "none" as const
                  }
                },

                // Turn All OFF button
                {
                  type: "custom:mushroom-template-card",
                  primary: actionOff,
                  icon: "mdi:power-off",
                  icon_color: "red",
                  layout: "vertical",
                  tap_action: {
                    action: "call-service" as const,
                    service: `${domain}.${serviceOff}`,
                    data: {
                      entity_id: entity_ids
                    }
                  },
                  hold_action: {
                    action: "none" as const
                  }
                }
              ]
            }
          ]
        }
      }
    }
  };

  return {
    type: "template",
    icon: "mdi:power",
    icon_color: iconColor,
    content: content,
    tap_action: tapAction,
  };
}
