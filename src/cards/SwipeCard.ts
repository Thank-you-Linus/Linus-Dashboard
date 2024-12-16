import { AbstractCard } from "./AbstractCard";
import { SwipeCardConfig } from "../types/lovelace-mushroom/cards/swipe-card-config";
import { SwiperOptions } from "swiper/types/swiper-options";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Swipe Card Class
 *
 * Used to create a card for controlling an entity of the light domain.
 *
 * @class
 * @extends AbstractCard
 */
class SwipeCard {

  /**
   * Configuration of the card.
   *
   * @type {SwipeCardConfig}
   */
  config: SwipeCardConfig = {
    type: "custom:swipe-card",
    start_card: 1,
    parameters: {
      centeredSlides: false,
      followFinger: true,
      spaceBetween: 16,
      grabCursor: true,
    },
    cards: [],
  };

  /**
   * Class constructor.
   *
   * @param {AbstractCard[]} cards The hass entity to create a card for.
   * @param {SwiperOptions} [options={}] Options for the card.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(cards: (AbstractCard | EntityCardConfig)[], options?: SwiperOptions) {

    this.config.cards = cards;

    const multipleSlicesPerView = 2.2
    const slidesPerView = cards.length > 2 ? multipleSlicesPerView : cards.length ?? 1

    this.config.parameters = { ...this.config.parameters, slidesPerView, ...options };
  }

  /**
   * Get a card.
   *
   * @return {SwipeCardConfig} A card object.
   */
  getCard(): SwipeCardConfig {
    return this.config;
  }
}

export { SwipeCard };
