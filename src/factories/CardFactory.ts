import { Helper } from "../Helper";
import { LovelaceCardConfig } from "../types/homeassistant/data/lovelace";
import { StrategyEntity } from "../types/strategy/generic";

/**
 * Card Factory
 *
 * Centralizes the logic for dynamically loading and creating cards.
 * Provides automatic fallback from device_class-specific cards to domain cards.
 *
 * Benefits:
 * - Single place for card creation logic
 * - Consistent error handling
 * - Easy to extend with caching or other optimizations
 * - Cleaner code in utils.ts and view files
 *
 * @example
 * ```typescript
 * const card = await CardFactory.createCard(entity, {});
 * if (card) cards.push(card);
 * ```
 */
export class CardFactory {
  /**
   * Create a card for an entity with automatic fallback logic.
   *
   * Strategy:
   * 1. Try to load device_class-specific card (e.g., "MotionCard" for binary_sensor.motion)
   * 2. If not found, fallback to domain card (e.g., "BinarySensorCard")
   * 3. Instantiate the card class and return the config
   *
   * @param entity - The entity to create a card for
   * @param options - Optional card configuration options
   * @param basePath - Base import path (default: "../cards")
   * @returns Promise<LovelaceCardConfig | null> - The card config, or null if creation failed
   */
  static async createCard(
    entity: StrategyEntity,
    options: any = {},
    basePath: string = "../cards"
  ): Promise<LovelaceCardConfig | null> {
    try {
      const state = Helper.getEntityState(entity.entity_id);
      const entityDomain = state?.entity_id?.split(".")[0];
      const entityDeviceClass = state?.attributes?.device_class;

      // Try device_class-specific card first
      if (entityDeviceClass) {
        try {
          const className = Helper.sanitizeClassName(entityDeviceClass + "Card");
          const cardModule = await import(`${basePath}/${className}`);
          return new cardModule[className](options, entity).getCard();
        } catch {
          // Fallback to domain card (will be caught by outer try-catch)
        }
      }

      // Fallback to domain card
      const className = Helper.sanitizeClassName(entityDomain + "Card");
      const cardModule = await import(`${basePath}/${className}`);
      return new cardModule[className](options, entity).getCard();

    } catch (error) {
      if (Helper.debug) {
        Helper.logError(`Failed to create card for entity ${entity.entity_id}`, error);
      }
      return null;
    }
  }

  /**
   * Create a card by explicit class name (for specific card types).
   *
   * @param className - The card class name (e.g., "MiscellaneousCard", "HomeAreaCard")
   * @param options - Card configuration options
   * @param entity - Optional entity (required for most cards)
   * @param basePath - Base import path (default: "../cards")
   * @returns Promise<LovelaceCardConfig | null> - The card config, or null if creation failed
   *
   * @example
   * ```typescript
   * const card = await CardFactory.createCardByName("MiscellaneousCard", {}, entity);
   * ```
   */
  static async createCardByName(
    className: string,
    options: any = {},
    entity?: StrategyEntity,
    basePath: string = "../cards"
  ): Promise<LovelaceCardConfig | null> {
    try {
      const sanitizedClassName = Helper.sanitizeClassName(className);
      const cardModule = await import(`${basePath}/${sanitizedClassName}`);

      if (entity) {
        return new cardModule[sanitizedClassName](options, entity).getCard();
      } else {
        return new cardModule[sanitizedClassName](options).getCard();
      }
    } catch (error) {
      if (Helper.debug) {
        Helper.logError(`Failed to create card ${className}`, error);
      }
      return null;
    }
  }

  /**
   * Create multiple cards for a list of entities.
   *
   * @param entities - Array of entities
   * @param options - Card options (applied to all cards)
   * @returns Promise<LovelaceCardConfig[]> - Array of card configs
   *
   * @example
   * ```typescript
   * const cards = await CardFactory.createCards(entities, {});
   * ```
   */
  static async createCards(
    entities: StrategyEntity[],
    options: any = {}
  ): Promise<LovelaceCardConfig[]> {
    const cards: LovelaceCardConfig[] = [];

    for (const entity of entities) {
      const card = await this.createCard(entity, options);
      if (card) {
        cards.push(card);
      }
    }

    return cards;
  }
}
