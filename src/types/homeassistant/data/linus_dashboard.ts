export interface LinusDashboardConfig {
    alarm_entity_id?: string | null;
    weather_entity_id?: string | null;
    excluded_domains?: string[];
    excluded_entities?: string[];
    hide_greeting?: boolean;
    excluded_device_classes?: string[];
}
