import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ActivityDetectionPopup } from "../popups/ActivityDetectionPopup";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Activity Detection Chip class.
 *
 * Used to create a chip to indicate activity detection state.
 * Shows Linus Brain activity detection when available, otherwise shows sensor count.
 */
class ActivityDetectionChip extends AbstractChip {

  getDefaultConfig({ area_slug }: { area_slug: string }): TemplateChipConfig {

    const resolver = Helper.entityResolver;

    // Check for Linus Brain presence detection
    const presenceSensorResolution = resolver.resolvePresenceSensor(area_slug);
    const presenceSensorEntity = presenceSensorResolution.entity_id;
    const isLinusBrain = presenceSensorResolution.source === "linus_brain";

    // Get all presence-related entities in the area
    const motion_entities = Helper.getEntityIds({
      domain: "binary_sensor",
      device_class: "motion",
      area_slug
    });
    const occupancy_entities = Helper.getEntityIds({
      domain: "binary_sensor",
      device_class: "occupancy",
      area_slug
    });
    const presence_entities = Helper.getEntityIds({
      domain: "binary_sensor",
      device_class: "presence",
      area_slug
    });

    const allPresenceEntities = [
      ...motion_entities,
      ...occupancy_entities,
      ...presence_entities
    ];

    // Linus Brain configuration
    if (isLinusBrain && presenceSensorEntity) {
      // Get detection type entities for priority-based icon
      const motion_entities_str = motion_entities.map(e => `'${e}'`).join(', ');
      const occupancy_entities_str = occupancy_entities.map(e => `'${e}'`).join(', ');
      const presence_entities_str = presence_entities.map(e => `'${e}'`).join(', ');
      
      // Get media player entities for lowest priority detection
      const media_entities = Helper.getEntityIds({
        domain: "media_player",
        area_slug
      });
      const media_entities_str = media_entities.map(e => `'${e}'`).join(', ');
      
      // Priority-based icon: motion > occupancy > presence > media_player
      const priorityIcon = `
        {% set motion_active = [${motion_entities_str}] | select('is_state', 'on') | list | count > 0 %}
        {% set occupancy_active = [${occupancy_entities_str}] | select('is_state', 'on') | list | count > 0 %}
        {% set presence_active = [${presence_entities_str}] | select('is_state', 'on') | list | count > 0 %}
        {% set media_active = [${media_entities_str}] | select('is_state', 'playing') | list | count > 0 %}
        {% if motion_active %}
          mdi:motion-sensor
        {% elif occupancy_active %}
          mdi:account-check
        {% elif presence_active %}
          mdi:radar
        {% elif media_active %}
          mdi:cast
        {% else %}
          mdi:account-search
        {% endif %}
      `;
      
      return {
        type: "template",
        entity: presenceSensorEntity,
        icon: priorityIcon,
        icon_color: `
          {% if is_state('${presenceSensorEntity}', 'on') %}
            red
          {% else %}
            grey
          {% endif %}
        `,
        tap_action: new ActivityDetectionPopup(area_slug).getPopup(),
      };
    }

    // Fallback: Show count of active presence sensors
    if (allPresenceEntities.length > 0) {
      const isOn = '| selectattr("state","eq", "on") | list | count';
      const activeCount = `[${allPresenceEntities.map(e => `states['${e}']`).join(', ')}] ${isOn}`;

      return {
        type: "template",
        icon: "mdi:motion-sensor",
        icon_color: `
          {% set count = ${activeCount} %}
          {% if count > 0 %}
            red
          {% else %}
            grey
          {% endif %}
        `,
        content: `
          {% set count = ${activeCount} %}
          {{ count if count > 0 else '' }}
        `,
        tap_action: new ActivityDetectionPopup(area_slug).getPopup(),
      };
    }

    // No presence detection available - return undefined to skip chip creation
    return undefined as any;
  }

  /**
   * Class Constructor.
   *
   * @param {string} area_slug The area slug.
   */
  constructor({ area_slug }: { area_slug: string }) {
    super();

    const defaultConfig = this.getDefaultConfig({ area_slug });

    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { ActivityDetectionChip };
