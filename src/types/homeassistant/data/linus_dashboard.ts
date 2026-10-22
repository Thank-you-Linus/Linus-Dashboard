export interface EmbeddedDashboardConfig {
    dashboard: string;
    view_index?: number;
    view_path?: string;
    title?: string;
    icon?: string;
    path?: string;
}

/**
 * A color of a Home Assistant scene, as detected by the backend:
 * either an RGB color or a white temperature in Kelvin.
 */
export interface SceneColor {
    rgb?: [number, number, number];
    kelvin?: number;
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
        floor_id?: string[];
    };
    excluded_domains?: string[];
    excluded_device_classes?: string[];
    excluded_integrations?: string[];
    embedded_dashboards?: EmbeddedDashboardConfig[];
    /** Detected scene colors, dominant first (admin accounts only; absent on older backends) */
    scene_colors?: Record<string, SceneColor[]>;
    /** Colors chosen in the integration options, as "#rrggbb" */
    scene_color_overrides?: Record<string, string>;
    debug?: boolean;
}
