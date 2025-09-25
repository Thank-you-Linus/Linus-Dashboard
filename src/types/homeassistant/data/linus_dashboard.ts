export interface LinusDashboardConfig {
    alarm_entity_ids?: string[]; // multi-alarmes
    weather_entity_id?: string | null;
    hide_greeting?: boolean;
    excluded_targets?: {
        entity_id?: string[];
        device_id?: string[];
        area_id?: string[];
        label_id?: string[];
    };
    excluded_domains?: string[];
    excluded_device_classes?: string[];
    excluded_integrations?: string[];
}
