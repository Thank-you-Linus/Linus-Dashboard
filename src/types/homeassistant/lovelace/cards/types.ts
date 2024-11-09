import { ActionConfig, LovelaceBadgeConfig, LovelaceCardConfig } from "../../data/lovelace";

/**
 * Home Assistant Stack Card Config.
 *
 * @property {string} type The stack type.
 * @property {Object[]} cards The content of the stack.
 *
 * @see https://www.home-assistant.io/dashboards/horizontal-stack/
 * @see https://www.home-assistant.io/dashboards/vertical-stack/
 */
export interface StackCardConfig extends LovelaceCardConfig {
  cards: LovelaceCardConfig[];
  title?: string;
}

/**
 * Home Assistant Area Card Config.
 *
 * @see https://www.home-assistant.io/dashboards/area/
 */
export interface AreaCardConfig extends LovelaceCardConfig {
  area: string;
  navigation_path?: string;
  show_camera?: boolean;
}

/**
 * Home Assistant Tile Card Config.
 *
 * @see https://www.home-assistant.io/dashboards/tile/
 */
export interface TileCardConfig extends LovelaceCardConfig {
  type: "tile",
  features: any[]
}

export interface LovelaceGridCardConfig extends LovelaceCardConfig {
  type: "grid";
  cards: LovelaceCardConfig[];
  column_span?: number;
}

export interface LovelaceHeadingCardConfig extends LovelaceCardConfig {
  type: "heading";
  heading: string;
  heading_style: string;
  badges?: LovelaceBadgeConfig[];
  layout_options?: {
    grid_columns?: string;
    grid_rows?: number;
  };
  tap_action?: ActionConfig;
  icon?: string;
}

export interface LovelaceTileCardConfig extends LovelaceCardConfig {
  type: "tile";
  entity: string;
  hide_state?: boolean;
  vertical?: boolean;
  features?: Array<{
    type: string;
  }>;
}