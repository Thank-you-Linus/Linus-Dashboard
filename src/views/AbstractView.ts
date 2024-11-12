import { AREA_CARDS_DOMAINS } from './../variables';
import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceBadgeConfig, LovelaceCardConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { groupBy } from "../utils";
import { TemplateCardConfig } from '../types/lovelace-mushroom/cards/template-card-config';
import { ChipsCardConfig } from '../types/lovelace-mushroom/cards/chips-card';
import { SwipeCard } from '../cards/SwipeCard';

/**
 * Abstract View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
abstract class AbstractView {
  /**
   * Configuration of the view.
   *
   * @type {LovelaceViewConfig}
   */
  config: LovelaceViewConfig = {
    icon: "mdi:view-dashboard",
    type: "sections",
    subview: false,
  };

  /**
   * A card to switch all entities in the view.
   *
   * @type {LovelaceBadgeConfig}
   */
  viewControllerCard: LovelaceBadgeConfig = {
    cards: [],
    type: "",
  };

  /**
   * The domain of which we operate the devices.
   *
   * @private
   * @readonly
   */
  readonly #domain: string;

  /**
   * Class constructor.
   *
   * @param {string} [domain] The domain which the view is representing.
   *
   * @throws {Error} If trying to instantiate this class.
   * @throws {Error} If the Helper module isn't initialized.
   */
  protected constructor(domain: string = "") {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.#domain = domain;
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createViewCards(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    return []
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
   * @override
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    const viewSections: LovelaceGridCardConfig[] = [];
    const configEntityHidden =
      Helper.strategyOptions.domains[this.#domain ?? "_"].hide_config_entities
      || Helper.strategyOptions.domains["_"].hide_config_entities;

    const areasByFloor = groupBy(Helper.areas, (e) => e.floor_id ?? "undisclosed");


    for (const floor of [...Helper.floors, Helper.strategyOptions.floors.undisclosed]) {

      if (!AREA_CARDS_DOMAINS.includes(this.#domain ?? "")) continue
      if (!(floor.floor_id in areasByFloor) || areasByFloor[floor.floor_id].length === 0) continue

      let floorCards = {
        type: "grid",
        cards: [
          {
            type: "heading",
            heading: floor.name,
            heading_style: "title",
            badges: [],
            layout_options: {
              grid_columns: "full",
              grid_rows: 1
            },
            icon: floor.icon ?? "mdi:floor-plan",
          }
        ]
      } as LovelaceGridCardConfig

      // Create cards for each area.
      for (const [i, area] of areasByFloor[floor.floor_id].entries()) {
        const entities = Helper.getDeviceEntities(area, this.#domain ?? "");
        const className = Helper.sanitizeClassName(this.#domain + "Card");
        const cardModule = await import(`../cards/${className}`);

        if (entities.length === 0 || !cardModule) {
          continue;
        }

        // Set the target for controller cards to the current area.
        let target: HassServiceTarget = {
          area_id: [area.area_id],
        };

        // Set the target for controller cards to entities without an area.
        if (area.area_id === "undisclosed") {

          if (this.#domain === 'light')
            target = {
              entity_id: entities.map(entity => entity.entity_id),
            }
        }

        let areaCards: LovelaceCardConfig[] = [];

        const entityCards = []

        // Create a card for each domain-entity of the current area.
        for (const entity of entities) {
          let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
          let deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];

          if (cardOptions?.hidden || deviceOptions?.hidden) {
            continue;
          }

          if (entity.entity_category === "config" && configEntityHidden) {
            continue;
          }
          entityCards.push(new cardModule[className](entity, cardOptions).getCard());
        }

        if (entityCards.length) {
          if (entityCards.length > 2) {
            areaCards.push(new SwipeCard(entityCards).getCard());
          } else {
            areaCards.push(...entityCards);
          }
        }

        // Vertical stack the area cards if it has entities.
        if (areaCards.length) {
          const titleCardOptions: any = ("controllerCardOptions" in this.config) ? this.config.controllerCardOptions : {};
          titleCardOptions.subtitle = area.name
          titleCardOptions.subtitleIcon = area.icon ?? "mdi:floor-plan";
          titleCardOptions.navigate = area.slug;
          if (this.#domain) {
            titleCardOptions.showControls = Helper.strategyOptions.domains[this.#domain].showControls;
            titleCardOptions.extraControls = Helper.strategyOptions.domains[this.#domain].extraControls;
          }

          // Create and insert a Controller card.
          areaCards.unshift(...new ControllerCard(target, titleCardOptions, this.#domain).createCard())

          floorCards.cards.push(...areaCards);
        }
      }

      if (floorCards.cards.length > 1) viewSections.push(floorCards)
    }

    // // Add a Controller Card for all the entities in the view.
    // if (viewSections.length) {
    //   viewSections.unshift(this.viewControllerCard);
    // }


    return viewSections;
  }

  /**
   * Get a view object.
   *
   * The view includes the cards which are created by method createViewCards().
   *
   * @returns {Promise<LovelaceViewConfig>} The view object.
   */
  async getView(): Promise<LovelaceViewConfig | LovelaceSectionConfig> {
    return {
      ...this.config,
      cards: await this.createViewCards(),
      sections: await this.createSectionCards(),
    };
  }

  /**
   * Get a target of entity IDs for the given domain.
   *
   * @param {string} domain - The target domain to retrieve entity IDs from.
   * @return {HassServiceTarget} - A target for a service call.
   */
  targetDomain(domain: string): HassServiceTarget {
    return {
      entity_id: Helper.entities.filter(
        entity =>
          entity.entity_id.startsWith(domain + ".")
          && !entity.hidden_by
          && !Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden
      ).map(entity => entity.entity_id),
    };
  }
}

export { AbstractView };
