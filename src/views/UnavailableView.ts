import { AREA_CARDS_DOMAINS, UNAVAILABLE, UNDISCLOSED } from '../variables';
import { Helper } from "../Helper";
import { LovelaceGridCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { getEntityDomain, getFloorName, slugify } from '../utils';
import { views } from '../types/strategy/views';
import { GroupedCard } from '../cards/GroupedCard';

/**
 * Abstract View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class UnavailableView {
  /**
   * Configuration of the view.
   *
   * @type {views.ViewConfig}
   */
  config: views.ViewConfig = {
    title: Helper.localize("state.default.unavailable"),
    icon: "mdi:view-dashboard",
    type: "sections",
    subview: true,
  };

  /**
   * A card to switch all entities in the view.
   *
   * @type {LovelaceCardConfig[]}
   */
  viewControllerCard: LovelaceCardConfig[] = []

  /**
   * Class constructor.
   *
   * @throws {Error} If trying to instantiate this class.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor() {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
   * @override
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    const viewSections: LovelaceGridCardConfig[] = [];

    for (const floor of Helper.orderedFloors) {
      if (floor.areas_slug.length === 0) continue;

      const floorCards = [];

      for (const area of floor.areas_slug.map(area_slug => Helper.areas[area_slug]).values()) {
        const entities = Helper.areas[area.slug].entities;
        const unavailableEntities = entities?.filter(entity_id => AREA_CARDS_DOMAINS.includes(getEntityDomain(entity_id)) && Helper.getEntityState(entity_id)?.state === UNAVAILABLE).map(entity_id => Helper.entities[entity_id]);
        const cardModule = await import(`../cards/MiscellaneousCard`);

        if (entities.length === 0 || !cardModule) continue;

        let target: HassServiceTarget = { area_id: [area.slug] };
        if (area.area_id === UNDISCLOSED) {
          target = { entity_id: unavailableEntities.map(entity => entity.entity_id) };
        }

        const entityCards = unavailableEntities
          .filter(entity => !Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden
            && !Helper.strategyOptions.card_options?.[entity.device_id ?? "null"]?.hidden
            && !(entity.entity_category === "config"))
          .map(entity => new cardModule.MiscellaneousCard(entity).getCard());

        if (entityCards.length) {
          floorCards.push(new GroupedCard(entityCards).getCard())
        }
      }

      if (floorCards.length) {
        const titleSectionOptions: any = {
          title: getFloorName(floor),
          titleIcon: floor.icon ?? "mdi:floor-plan",
          titleNavigate: slugify(floor.name)
        };
        viewSections.push({ type: "grid", cards: floorCards });
      }
    }

    if (viewSections.length) {
      viewSections.unshift({ type: "grid", cards: this.viewControllerCard });
    }

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
      entity_id: Helper.domains[domain]?.filter(
        entity =>
          !entity.hidden_by
          && !Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden
      ).map(entity => entity.entity_id),
    };
  }
}

export { UnavailableView };
