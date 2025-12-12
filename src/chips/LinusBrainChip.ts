import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AbstractChip } from "./AbstractChip";
import { LinusBrainPopup } from "../popups/LinusBrainPopup";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Linus Brain Chip class.
 *
 * Used to create a smart chip showing Linus Brain status with priority-based display:
 * 1. Alert state (errors > 5 OR cloud_health = disconnected): Red with error count or "Disconnected"
 * 2. Degraded state (errors > 0 OR cloud_health = degraded): Orange with error count or "Degraded"
 * 3. Normal state (healthy, no errors): Cyan with room count
 */
class LinusBrainChip extends AbstractChip {

  getDefaultConfig(): TemplateChipConfig {

    const cloudHealthEntity = "sensor.linus_brain_cloud_health";
    const errorsEntity = "sensor.linus_brain_errors";
    const roomsEntity = "sensor.linus_brain_rooms";

    // Check if Linus Brain is installed
    const hasLinusBrain = !!Helper.entities[roomsEntity] || !!Helper.entities[cloudHealthEntity];

    if (!hasLinusBrain) {
      // Don't show chip if Linus Brain is not installed
      return {
        type: "template",
        icon: "",
        icon_color: "grey",
        content: "",
        tap_action: { action: "none" },
      };
    }

    return {
      type: "template",
      icon: `
        {% set errors = states('${errorsEntity}') | int(0) %}
        {% set health = states('${cloudHealthEntity}') %}
        {% if errors > 5 or health == 'disconnected' %}
          mdi:alert-circle
        {% elif errors > 0 or health == 'degraded' %}
          mdi:alert
        {% else %}
          mdi:brain
        {% endif %}
      `,
      entity: roomsEntity,
      icon_color: `
        {% set errors = states('${errorsEntity}') | int(0) %}
        {% set health = states('${cloudHealthEntity}') %}
        {% if errors > 5 or health == 'disconnected' %}
          red
        {% elif errors > 0 or health == 'degraded' %}
          orange
        {% else %}
          cyan
        {% endif %}
      `,
      tap_action: new LinusBrainPopup().getPopup(),
    };
  }

  /**
   * Class Constructor.
   */
  constructor() {
    super();

    const defaultConfig = this.getDefaultConfig();

    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { LinusBrainChip };
