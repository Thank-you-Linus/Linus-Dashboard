import { Helper } from "../Helper";
import { cards } from "../types/strategy/cards";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";

/**
 * Security Activity Card Class.
 *
 * Creates a timeline card showing the 10 most recent security events:
 * - Door/window open/close
 * - Lock/unlock
 * - Motion detection
 * - Person arrivals/departures
 * - Alarm state changes
 */
class SecurityActivityCard {

    private readonly maxEvents: number;

    constructor(maxEvents = 10) {
        if (!Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
        this.maxEvents = maxEvents;
    }

    /**
     * Helper to get localized security view text
     */
    private t(key: string): string {
        return Helper.localize(`component.linus_dashboard.entity.text.security_view.state.${key}`);
    }

    /**
     * Get security-related entity IDs to monitor
     */
    private getSecurityEntityIds(): string[] {
        const entities: string[] = [];

        // Access sensors
        entities.push(...Helper.getEntityIds({ domain: "binary_sensor", device_class: "door" }));
        entities.push(...Helper.getEntityIds({ domain: "binary_sensor", device_class: "window" }));
        entities.push(...Helper.getEntityIds({ domain: "binary_sensor", device_class: "garage_door" }));

        // Locks
        entities.push(...Helper.getEntityIds({ domain: "lock" }));

        // Motion/presence
        entities.push(...Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion" }));
        entities.push(...Helper.getEntityIds({ domain: "binary_sensor", device_class: "occupancy" }));

        // Persons
        const persons = Helper.domains.person || [];
        entities.push(...persons.map(p => p.entity_id));

        // Alarms
        const alarmIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
        entities.push(...alarmIds);

        return entities;
    }

    /**
     * Get icon for entity based on domain/device_class
     */
    private getEntityIcon(entityId: string): string {
        const parts = entityId.split('.');
        const domain = parts[0];

        if (domain === 'person') return 'mdi:account';
        if (domain === 'lock') return 'mdi:lock';
        if (domain === 'alarm_control_panel') return 'mdi:shield';

        // Get device_class for binary_sensor
        const state = Helper.getEntityState(entityId);
        const deviceClass = state?.attributes?.device_class;

        if (deviceClass === 'door') return 'mdi:door';
        if (deviceClass === 'window') return 'mdi:window-closed';
        if (deviceClass === 'garage_door') return 'mdi:garage';
        if (deviceClass === 'motion') return 'mdi:motion-sensor';
        if (deviceClass === 'occupancy') return 'mdi:home-account';

        return 'mdi:bell';
    }

    /**
     * Build Jinja2 template for recent activity display
     */
    private buildActivityTemplate(): string {
        const entityIds = this.getSecurityEntityIds();
        if (entityIds.length === 0) {
            return this.t("no_security_sensor");
        }

        // Build a Jinja2 template that sorts entities by last_changed and shows the most recent
        const entityList = entityIds.map(id => `'${id}'`).join(', ');

        return `{% set security_entities = [${entityList}] %}
{% set events = [] %}
{% for entity_id in security_entities %}
  {% set state = states(entity_id) %}
  {% if state and state not in ['unknown', 'unavailable'] %}
    {% set last_changed = states[entity_id].last_changed %}
    {% set friendly_name = state_attr(entity_id, 'friendly_name') or entity_id %}
    {% set events = events + [(last_changed, entity_id, friendly_name, state)] %}
  {% endif %}
{% endfor %}
{% set sorted_events = events | sort(attribute='0', reverse=true) %}
{% for event in sorted_events[:${this.maxEvents}] %}
{{ event[2] }}: {{ event[3] }}
{% endfor %}`;
    }

    /**
     * Get the complete activity card
     */
    async getCard(): Promise<cards.AbstractCardConfig> {
        const entityIds = this.getSecurityEntityIds();
        const firstEntityId = entityIds.length > 0 ? entityIds[0] : undefined;

        return {
            type: "custom:mushroom-template-card",
            primary: this.t("recent_activity"),
            secondary: this.buildActivityTemplate(),
            icon: "mdi:history",
            icon_color: "purple",
            multiline_secondary: true,
            entity: firstEntityId,
            entity_id: entityIds,
            fill_container: false,
            grid_options: {
                columns: 12,
            },
            tap_action: {
                action: "navigate",
                navigation_path: "/logbook"
            },
            card_mod: {
                style: `
                    ha-card {
                        --card-secondary-font-size: 11px;
                    }
                `
            }
        } as TemplateCardConfig;
    }
}

export { SecurityActivityCard };
