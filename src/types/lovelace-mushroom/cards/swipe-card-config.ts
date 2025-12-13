import { SwiperOptions } from "swiper/types/swiper-options";

import {ActionsSharedConfig} from "../shared/config/actions-config";
import {LovelaceCardConfig} from "../../homeassistant/data/lovelace";


/**
 * Swipe Card Config.
 *
 * @property {SwiperOptions} [parameters] Object with Swiper params
 *
 * @see https://github.com/bramkragten/swipe-card
 */
export type SwipeCardConfig = LovelaceCardConfig &
  ActionsSharedConfig & {
  parameters?: SwiperOptions;
};
