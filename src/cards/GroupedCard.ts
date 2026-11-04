import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";
import { SwipeCardConfig } from "../types/lovelace-mushroom/cards/swipe-card-config";

import { AbstractCard } from "./AbstractCard";
import { SwipeCard } from "./SwipeCard";



// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Grouped Card Class
 *
 * Used to create a card for controlling an entity of the light domain.
 *
 * @class
 * @extends AbstractCard
 */
class GroupedCard {

  /**
   * Configuration of the card.
   *
   * @type {AbstractCard}
   */
  config: { cards: (AbstractCard | EntityCardConfig)[] } = {
    cards: [],
  };

  /**
   * Class constructor.
   *
   * @param {AbstractCard[]} cards The hass entity to create a card for.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor(cards: (AbstractCard | EntityCardConfig)[]) {

    this.config.cards = cards;
  }

  /**
   * Get a card.
   *
   * @return {AbstractCard} A card object.
   */
  getCard(): EntityCardConfig | SwipeCardConfig {

    // Group entity cards into pairs and create vertical stacks
    const groupedEntityCards = [];
    for (let i = 0; i < this.config.cards.length; i++) {

      // Otherwise, group into vertical stacks
      const stack = {
        type: "vertical-stack",
        cards: this.config.cards.slice(i, i + 2),
      };
      groupedEntityCards.push(stack);
      i++; // Skip the next card as it's already included in the stack

    }

    // If there are more than 2 groups, use a GroupedCard, otherwise use a horizontal stack
    const groupedCards = groupedEntityCards.length > 2
      ? new SwipeCard(groupedEntityCards).getCard()
      : {
        type: "horizontal-stack",
        cards: groupedEntityCards,
      }

    return groupedCards;
  }
}

export { GroupedCard };
