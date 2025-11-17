/**
 * Type definitions for embedded Lovelace dashboards
 */

import { LovelaceCardConfig } from "../homeassistant/data/lovelace";

/**
 * Configuration for embedding an external Lovelace view
 */
export interface EmbedViewCardConfig extends LovelaceCardConfig {
    type: "linus.embed_view";
    dashboard: string;
    view_index?: number;
    view_path?: string;
}

/**
 * Result of loading an embedded dashboard
 */
export interface EmbeddedDashboardResult {
    cards: LovelaceCardConfig[];
    error?: string;
    requireAdmin?: boolean;
    viewMetadata?: {
        title?: string;
        icon?: string;
        type?: string;
        path?: string;
        theme?: string;
        background?: string;
        visible?: boolean | { user?: string }[];
        sections?: any[];
        badges?: any[];
        subview?: boolean;
        back_path?: string;
        max_columns?: number;
    };
}
