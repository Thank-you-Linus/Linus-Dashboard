import { ActionConfig } from "../../../../homeassistant/data/lovelace";
import { Info } from "../../info";

/**
 * Action Chip Config
 *
 * @property {"action"} type Type of the chip.
 * @property {string} [icon] Custom icon.
 * @property {string} [icon_color] Custom color for icon.
 * @property {ActionConfig} [tap_action] Home assistant action to perform on tap.
 * @property {ActionConfig} [hold_action] Home assistant action to perform on hold.
 * @property {ActionConfig} [double_tap_action] Home assistant action to perform on double_tap.
 */
export interface ActionChipConfig {
  type: "action";
  icon?: string;
  icon_color?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

/**
 * Alarm Control Panel Chip Config
 *
 * @property {"alarm-control-panel"} type Type of the chip.
 * @property {string} [entity] Entity.
 * @property {string} [name] Custom name.
 * @property {string} [content_info] Custom content.
 * @property {string} [icon] Custom icon.
 * @property {string} [icon_color] Custom color for icon.
 * @property {ActionConfig} [tap_action] Home assistant action to perform on tap.
 * @property {ActionConfig} [hold_action] Home assistant action to perform on hold.
 * @property {ActionConfig} [double_tap_action] Home assistant action to perform on double_tap.
 */
export interface AlarmControlPanelChipConfig {
  type: "alarm-control-panel";
  entity?: string;
  name?: string;
  content_info?: Info;
  icon?: string;
  icon_color?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

/**
 * Back Chip Config
 *
 * @property {"back"} type Type of the chip.
 * @property {string} [icon] Custom icon.
 */
export interface BackChipConfig {
  type: "back";
  icon?: string;
}

/**
 * Entity Chip Config
 *
 * @property {"entity"} type Type of the chip.
 * @property {string} [entity] Entity.
 * @property {string} [name] Custom name.
 * @property {string} [content_info] Custom content.
 * @property {string} [icon] Custom icon.
 * @property {string} [icon_color] Custom color for icon.
 * @property {boolean} [use_entity_picture]
 * @property {ActionConfig} [tap_action] Home assistant action to perform on tap.
 * @property {ActionConfig} [hold_action] Home assistant action to perform on hold.
 * @property {ActionConfig} [double_tap_action] Home assistant action to perform on double_tap.
 */
export interface EntityChipConfig {
  type: "entity";
  entity?: string;
  name?: string;
  content_info?: Info;
  icon?: string;
  icon_color?: string;
  use_entity_picture?: boolean;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  card_mod?: any;
}

/**
 * Menu Chip Config
 *
 * @property {"menu"} type Type of the chip.
 * @property {string} [icon] Custom icon.
 */
export interface MenuChipConfig {
  type: "menu";
  icon?: string;
}

export interface AlarmChipConfig {
  type: "alarm-control-panel";
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

/**
 * Weather Chip Config
 *
 * @property {"weather"} type Type of the chip.
 * @property {string} [entity] Entity.
 * @property {ActionConfig} [tap_action] Home assistant action to perform on tap.
 * @property {ActionConfig} [hold_action] Home assistant action to perform on hold.
 * @property {ActionConfig} [double_tap_action] Home assistant action to perform on double_tap.
 * @property {boolean} [show_temperature] Show the temperature.
 * @property {boolean} [show_conditions] Show the conditions.
 */
export interface WeatherChipConfig {
  type: "weather";
  entity?: string;
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  show_temperature?: boolean;
  show_conditions?: boolean;
}

/**
 * Template Chip Config
 *
 * @property {"template"} type Type of the chip.
 * @property {string} [entity] Entity.
 * @property {ActionConfig} [tap_action] Home assistant action to perform on tap.
 * @property {ActionConfig} [hold_action] Home assistant action to perform on hold.
 * @property {ActionConfig} [double_tap_action] Home assistant action to perform on double_tap.
 * @property {string} [content]
 * @property {string} [icon] Custom icon.
 * @property {string} [icon_color] Custom color for icon.
 * @property {string} [picture]
 * @property {string | string[]} [entity_id]
 */
export interface TemplateChipConfig {
  type: "template";
  entity?: string;
  hold_action?: ActionConfig;
  tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
  content?: string;
  icon?: string;
  icon_color?: string;
  picture?: string;
  entity_id?: string | string[];
}

/**
 * Conditional Chip Config
 *
 * @property {"conditional"} type Type of the chip.
 * @property {LovelaceChipConfig} [chip] A chip configuration.
 * @property {[]} conditions
 */
interface OrCondition {
  condition: "or";
  conditions?: ChipCondition[];
}
interface AndCondition {
  condition: "and";
  conditions?: ChipCondition[];
}
type StateCondition =
  | {
    entity: string;
    state_not?: string;
    match?: "all" | "any";
  }
  | {
    entity: string;
    state?: string;
    match?: "all" | "any";
  };

type ChipCondition = OrCondition | AndCondition | StateCondition;


export interface ConditionalChipConfig {
  type: "conditional";
  chip: LovelaceChipConfig;
  conditions?: ChipCondition[];
}

/**
 * Light Chip Config
 *
 * @property {"light"} type Type of the chip.
 * @property {string} [entity] Entity.
 * @property {string} [name]
 * @property {Info} [content_info]
 * @property {string} [icon] Custom icon.
 * @property {boolean} [use_light_color] Colorize the icon and slider according light temperature or color.
 * @property {ActionConfig} [tap_action] Home assistant action to perform on tap.
 * @property {ActionConfig} [hold_action] Home assistant action to perform on hold.
 * @property {ActionConfig} [double_tap_action] Home assistant action to perform on double_tap.
 */
export interface LightChipConfig {
  type: "light";
  entity?: string;
  name?: string;
  content_info?: Info;
  icon?: string;
  use_light_color?: boolean;
  hold_action?: ActionConfig;
  tap_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

/**
 * Spacer Chip Config
 *
 * @property {"spacer"} type Type of the chip.
 */
export interface SpacerChipConfig {
  type: "spacer";
}

export type LovelaceChipConfig =
  | ActionChipConfig
  | AlarmControlPanelChipConfig
  | BackChipConfig
  | EntityChipConfig
  | MenuChipConfig
  | WeatherChipConfig
  | TemplateChipConfig
  | ConditionalChipConfig
  | LightChipConfig
  | SpacerChipConfig;
