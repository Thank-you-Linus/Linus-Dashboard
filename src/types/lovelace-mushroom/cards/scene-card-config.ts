import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";


/**
 * Scene Card Config.
 */
export type SceneCardConfig = LovelaceCardConfig &
  ActionsSharedConfig & {
};
