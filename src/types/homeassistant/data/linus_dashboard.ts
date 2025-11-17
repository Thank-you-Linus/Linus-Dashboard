export interface EmbeddedDashboardConfig {
    dashboard: string;
    view_index?: number;
    view_path?: string;
    title?: string;
    icon?: string;
    path?: string;
}

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
    embedded_dashboards?: EmbeddedDashboardConfig[];
}
