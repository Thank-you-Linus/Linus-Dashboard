import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

/**
 * Configuration for creating a smart control chip
 */
export interface SmartControlChipConfig {
  /** The domain (e.g., "switch", "fan", "media_player") */
  domain: string;
  /** The service name for turning on (e.g., "turn_on") */
  serviceOn: string;
  /** The service name for turning off (e.g., "turn_off") */
  serviceOff: string;
  /** States to count as "active" (e.g., ["on"] for switch, ["playing", "paused"] for media_player) */
  activeStates: string[];
  /** Translation key prefix (e.g., "switch", "fan", "media_player") */
  translationKey: string;
}

/**
 * Creates a smart control chip for a given domain
 * 
 * Features:
 * - Shows current state (count of active entities)
 * - Suggests action (turn all on/off)
 * - Requires confirmation before executing
 * - Only shows if entities exist in areas (no global Magic Areas entity)
 * 
 * @param config - Configuration for the smart control chip
 * @returns TemplateChipConfig or null if no entities found
 */
export function createSmartControlChip(config: SmartControlChipConfig): TemplateChipConfig | null {
  const { domain, serviceOn, serviceOff, activeStates, translationKey } = config;

  // Get all entities for this domain that are assigned to areas
  const entity_ids = Helper.getEntityIds({
    domain,
    area_slug: undefined, // Get all entities from all areas (excluding global/undisclosed)
  });

  // If no entities found, don't create chip
  if (entity_ids.length === 0) {
    return null;
  }

  // Create state objects array for Jinja2 templates
  const statesArray = entity_ids.map(id => `states['${id}']`).join(', ');

  // Build active states condition for Jinja2
  const activeStatesCondition = activeStates.map(state => `'${state}'`).join(', ');

  // Icon color: red when active entities exist, green when all inactive
  const iconColor = `
    {% set entities = [${statesArray}] %}
    {% set active_count = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
    {{ 'red' if active_count > 0 else 'green' }}
  `.trim();

  // Get localized strings
  const turnAllOffText = Helper.localize(`component.linus_dashboard.entity.text.smart_control.turn_all_off`);
  const turnAllOnText = Helper.localize(`component.linus_dashboard.entity.text.smart_control.turn_all_on`);
  const confirmationTitle = Helper.localize(`component.linus_dashboard.entity.text.smart_control.confirmation_title`);
  const confirmText = Helper.localize(`component.linus_dashboard.entity.text.smart_control.confirm`);
  const confirmTurnOffMessage = Helper.localize(`component.linus_dashboard.entity.text.smart_control.confirm_turn_off_${translationKey}`);
  const confirmTurnOnMessage = Helper.localize(`component.linus_dashboard.entity.text.smart_control.confirm_turn_on_${translationKey}`);

  // Content: "Turn All Off (X on)" or "Turn All On"
  const content = `
    {% set entities = [${statesArray}] %}
    {% set active_count = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
    {% if active_count > 0 %}
      ${turnAllOffText} ({{ active_count }})
    {% else %}
      ${turnAllOnText}
    {% endif %}
  `.trim();

  // Confirmation popup with simple message and confirm button
  const tapAction = {
    action: "fire-dom-event" as const,
    browser_mod: {
      service: "browser_mod.popup",
      data: {
        title: confirmationTitle,
        content: {
          type: "vertical-stack",
          cards: [
            // Message explaining the action
            {
              type: "markdown",
              content: `
                {% set entities = [${statesArray}] %}
                {% set active_count = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
                {% set total_count = entities | count %}
                {% if active_count > 0 %}
                  ${confirmTurnOffMessage.replace('{count}', '**{{ active_count }}**')}
                {% else %}
                  ${confirmTurnOnMessage.replace('{count}', '**{{ total_count }}**')}
                {% endif %}
              `.trim()
            },
            // Confirm button with conditional service call
            {
              type: "custom:mushroom-template-card",
              primary: confirmText,
              icon: "mdi:check",
              icon_color: "green",
              layout: "horizontal",
              tap_action: {
                action: "call-service" as const,
                service: `
                  {% set entities = [${statesArray}] %}
                  {% set active_count = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
                  {{ '${domain}.${serviceOff}' if active_count > 0 else '${domain}.${serviceOn}' }}
                `.trim(),
                data: {
                  entity_id: entity_ids
                }
              }
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
