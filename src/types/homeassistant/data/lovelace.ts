import { HassServiceTarget } from "home-assistant-js-websocket";

import { LovelaceGridCardConfig } from "../lovelace/cards/types";

export interface LovelaceStrategyConfig {
  type: string;
  [key: string]: any;
}

export interface LovelaceConfig {
  title?: string;
  strategy?: LovelaceStrategyConfig;
  views: LovelaceViewConfig[];
  background?: string;
}

/**
 * View Config.
 *
 * @see https://www.home-assistant.io/dashboards/views/
 */
export interface LovelaceViewConfig {
  index?: number;
  title?: string;
  type?: string;
  strategy?: LovelaceStrategyConfig;
  badges?: (string | LovelaceBadgeConfig)[];
  cards?: LovelaceCardConfig[];
  sections?: LovelaceCardConfig[];
  path?: string;
  icon?: string;
  theme?: string;
  panel?: boolean;
  background?: string;
  visible?: boolean | ShowViewConfig[];
  subview?: boolean;
  back_path?: string;
}

export interface ShowViewConfig {
  user?: string;
}

export interface LovelaceBadgeConfig {
  type: string;
  show_name?: boolean;
  show_state?: boolean;
  show_icon?: boolean;
  [key: string]: any;
}

export interface LovelaceCardConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  type: string;
  [key: string]: any;
}

export interface LovelaceSectionConfig {
  index?: number;
  view_index?: number;
  view_layout?: any;
  type: string;
  sections: LovelaceGridCardConfig[];
}

export interface ToggleActionConfig extends BaseActionConfig {
  action: "toggle";
}

export interface CallServiceActionConfig extends BaseActionConfig {
  action: "call-service";
  service: string;
  target?: HassServiceTarget;
  // Property "service_data" is kept for backwards compatibility. Replaced by "data".
  service_data?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export interface NavigateActionConfig extends BaseActionConfig {
  action: "navigate";
  navigation_path: string;
  navigation_replace?: boolean;
}

export interface UrlActionConfig extends BaseActionConfig {
  action: "url";
  url_path: string;
}

export interface MoreInfoActionConfig extends BaseActionConfig {
  action: "more-info";
}

export interface AssistActionConfig extends BaseActionConfig {
  action: "assist";
  pipeline_id?: string;
  start_listening?: boolean;
}

export interface NoActionConfig extends BaseActionConfig {
  action: "none";
}

export interface CustomActionConfig extends BaseActionConfig {
  action: "fire-dom-event";
}

export interface PopupActionConfig extends BaseActionConfig {
  action: "fire-dom-event";
  browser_mod: any
}

export interface BaseActionConfig {
  action: string;
  confirmation?: ConfirmationRestrictionConfig;
}

export interface ConfirmationRestrictionConfig {
  text?: string;
  exemptions?: RestrictionConfig[];
}

export interface RestrictionConfig {
  user: string;
}

export type ActionConfig =
  | ToggleActionConfig
  | CallServiceActionConfig
  | NavigateActionConfig
  | UrlActionConfig
  | MoreInfoActionConfig
  | AssistActionConfig
  | NoActionConfig
  | CustomActionConfig
  | PopupActionConfig;
