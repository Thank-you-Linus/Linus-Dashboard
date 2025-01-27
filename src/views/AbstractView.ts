import { AGGREGATE_DOMAINS, AREA_CARDS_DOMAINS, UNDISCLOSED } from './../variables';
import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { TemplateCardConfig } from '../types/lovelace-mushroom/cards/template-card-config';
import { ChipsCardConfig } from '../types/lovelace-mushroom/cards/chips-card';
import { addLightGroupsToEntities, getAreaName, getFloorName, slugify } from '../utils';
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
abstract class AbstractView {
  /**
   * Configuration of the view.
   *
   * @type {views.ViewConfig}
   */
  config: views.ViewConfig = {
    icon: "mdi:view-dashboard",
    type: "sections",
    subview: false,
  };

  /**
   * A card to switch all entities in the view.
   *
   * @type {LovelaceCardConfig[]}
   */
  viewControllerCard: LovelaceCardConfig[] = []

  /**
   * The domain of which we operate the devices.
   *
   * @private
   * @readonly
   */
  readonly #domain: string;

  /**
   * The device class of the view.
   *
   * @private
   * @readonly
   */
  readonly #device_class?: string;

  /**
   * Class constructor.
   *
   * @param {string} [domain] The domain which the view is representing.
   * @param {string} [device_class] The device class which the view is representing.
   *
   * @throws {Error} If trying to instantiate this class.
   * @throws {Error} If the Helper module isn't initialized.
   */
  protected constructor(domain: string, device_class?: string) {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.#domain = domain;
    this.#device_class = device_class;
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
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
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
    const configEntityHidden = Helper.strategyOptions.domains[this.#domain ?? "_"].hide_config_entities
      || Helper.strategyOptions.domains["_"].hide_config_entities;
    let isFirstLoop = true;

    const floors = Helper.orderedFloors;

    for (const floor of floors) {
      if (floor.areas_slug.length === 0 || !AREA_CARDS_DOMAINS.includes(this.#domain ?? "")) continue;

      const floorCards = [];

      for (const area of floor.areas_slug.map(area_slug => Helper.areas[area_slug])) {
        let entities = Helper.getAreaEntities(area, this.#device_class ?? this.#domain);
        const className = Helper.sanitizeClassName(this.#domain + "Card");
        const cardModule = await import(`../cards/${className}`);

        if (entities.length === 0 || !cardModule) continue;

        if (this.#domain === "light") entities = addLightGroupsToEntities(area, entities);

        const entityCards = entities
          .filter(entity => !Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden
            && !Helper.strategyOptions.card_options?.[entity.device_id ?? "null"]?.hidden
            && !(entity.entity_category === "config" && configEntityHidden))
          .map(entity => new cardModule[className](entity).getCard());

        if (entityCards.length) {
          const areaCards = [new GroupedCard(entityCards).getCard()]
          const titleCardOptions = {
            ...Helper.strategyOptions.domains[this.#domain].controllerCardOptions,
            subtitle: getAreaName(area),
            subtitleIcon: area.area_id === UNDISCLOSED ? "mdi:help-circle" : area.icon ?? "mdi:floor-plan",
            subtitleNavigate: area.slug
          } as any;
          if (this.#domain) {
            if (area.slug !== UNDISCLOSED && (!AGGREGATE_DOMAINS.includes(this.#domain) || this.#device_class)) {
              titleCardOptions.showControls = Helper.strategyOptions.domains[this.#domain].showControls;
              titleCardOptions.extraControls = Helper.strategyOptions.domains[this.#domain].extraControls;
              titleCardOptions.controlChipOptions = { device_class: this.#device_class, area_slug: area.slug }
            } else {
              titleCardOptions.showControls = false;
            }
          }

          const areaControllerCard = new ControllerCard(titleCardOptions, this.#domain, area.slug).createCard();

          floorCards.push(...areaControllerCard, ...areaCards);
        }
      }

      if (floorCards.length) {
        const titleSectionOptions: any = {
          ...Helper.strategyOptions.domains[this.#domain].controllerCardOptions,
          title: getFloorName(floor),
          titleIcon: floor.icon ?? "mdi:floor-plan",
          titleNavigate: slugify(floor.name)
        };
        if (this.#domain) {
          if (floor.floor_id !== UNDISCLOSED && (!AGGREGATE_DOMAINS.includes(this.#domain) || this.#device_class)) {
            titleSectionOptions.showControls = Helper.strategyOptions.domains[this.#domain].showControls;
            titleSectionOptions.extraControls = Helper.strategyOptions.domains[this.#domain].extraControls;
            titleSectionOptions.controlChipOptions = {
              device_class: this.#device_class,
              area_slug: floor.areas_slug
            }
          } else {
            titleSectionOptions.showControls = false;
          }
        }

        const floorControllerCard = floors.length > 1 ? new ControllerCard(
          titleSectionOptions,
          this.#domain,
          floor.floor_id
        ).createCard() : [];

        const section = { type: "grid", cards: [] } as LovelaceGridCardConfig;
        if (isFirstLoop) {
          section.cards.push(...this.viewControllerCard);
          isFirstLoop = false;
        }

        section.cards.push(...floorControllerCard);
        section.cards.push(...floorCards);
        viewSections.push(section);
      }
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
      badges: await this.createSectionBadges(),
      sections: await this.createSectionCards(),
      cards: await this.createViewCards(),
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

export { AbstractView };

