import {ActionConfig} from "../../../homeassistant/data/lovelace";

export interface ActionsSharedConfig {
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}
