export interface LinusDashboardConfig {
    alarm_entity_id?: string | null;
    alarm_entity_ids?: string[]; // multi-alarmes
    weather_entity_id?: string | null;
    excluded_domains?: string[];
    excluded_entities?: string[];
    hide_greeting?: boolean;
    excluded_device_classes?: string[];
    excluded_label?: string;
    excluded_integrations?: string[];
}
