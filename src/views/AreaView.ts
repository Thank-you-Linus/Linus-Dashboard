import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceBadgeConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { generic } from "../types/strategy/generic";
import StrategyArea = generic.StrategyArea;
import { SwipeCard } from "../cards/SwipeCard";
import { SensorCard } from "../cards/SensorCard";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";
import { ControllerCard } from "../cards/ControllerCard";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { MainAreaCard } from "../cards/MainAreaCard";
import { SwipeCardConfig } from "../types/lovelace-mushroom/cards/swipe-card-config";
import { DOMAIN_ICONS } from "../variables";


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area View Class.
 *
 * Used to create a Area view.
 *
 * @class AreaView
 */
class AreaView {
  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  config: views.ViewConfig = {
    icon: "mdi:home-assistant",
    type: "sections",
    path: "home",
    subview: true,
  };


  /**
   * Default configuration of the view.
   *
   * @type {StrategyArea}
   * @private
   */
  area: StrategyArea

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(area: StrategyArea, options: views.ViewConfig = {}) {

    this.area = area;

    this.config = { ...this.config, ...options };
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
    const exposedDomainIds = Helper.getExposedDomainIds();

    // Create global section card if area is not undisclosed
    const globalSection: LovelaceGridCardConfig = {
      type: "grid",
      column_span: 1,
      cards: this.area.area_id !== "undisclosed" ? [new MainAreaCard(this.area).getCard()] : []
    };

    if (globalSection.cards.length) {
      viewSections.push(globalSection);
    }

    let target: HassServiceTarget = {
      area_id: [this.area.area_id],
    };

    for (const domain of exposedDomainIds) {
      if (domain === "default") continue;

      const className = Helper.sanitizeClassName(domain + "Card");

      try {
        const cardModule = await import(`../cards/${className}`);
        const entities = Helper.getDeviceEntities(this.area, domain);
        const configEntityHidden = Helper.strategyOptions.domains[domain]?.hide_config_entities || Helper.strategyOptions.domains["_"].hide_config_entities;

        if (this.area.area_id === "undisclosed") {
          target = {
            entity_id: entities.map(entity => entity.entity_id),
          };
        }

        const domainCards: EntityCardConfig[] = [];

        if (entities.length) {
          const titleCardOptions: any = ("controllerCardOptions" in this.config) ? this.config.controllerCardOptions : {};
          titleCardOptions.subtitle = Helper.localize(domain === 'scene' ? 'ui.dialogs.quick-bar.commands.navigation.scene' : `component.${domain}.entity_component._.name`);
          titleCardOptions.domain = domain;
          titleCardOptions.subtitleIcon = DOMAIN_ICONS[domain as keyof typeof DOMAIN_ICONS];
          titleCardOptions.navigate = domain + "s";
          titleCardOptions.showControls = Helper.strategyOptions.domains[domain].showControls;
          titleCardOptions.extraControls = Helper.strategyOptions.domains[domain].extraControls;

          const titleCard = new ControllerCard(target, titleCardOptions, domain).createCard();

          const entityCards: EntityCardConfig[] = [];

          for (const entity of entities) {
            let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
            let deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];

            if (cardOptions?.hidden || deviceOptions?.hidden) continue;
            if (entity.entity_category === "config" && configEntityHidden) continue;

            if (domain === "sensor" && Helper.getEntityState(entity.entity_id)?.attributes.unit_of_measurement) {
              cardOptions = {
                type: "custom:mini-graph-card",
                entities: [entity.entity_id],
                ...cardOptions,
              };
            }

            entityCards.push(new cardModule[className](entity, cardOptions).getCard());
          }

          if (entityCards.length) {
            if (entityCards.length > 2) {
              domainCards.push(new SwipeCard(entityCards).getCard());
            } else {
              domainCards.push(...entityCards);
            }
            domainCards.unshift(...titleCard);
          }

          viewSections.push({
            type: "grid",
            column_span: 1,
            cards: domainCards
          });
        }
      } catch (e) {
        Helper.logError("An error occurred while creating the domain cards!", e);
      }
    }

    // Handle default domain if not hidden
    if (!Helper.strategyOptions.domains.default.hidden) {
      const areaDevices = Helper.devices.filter(device => device.area_id === this.area.area_id).map(device => device.id);
      const miscellaneousEntities = Helper.entities.filter(entity => {
        const entityLinked = areaDevices.includes(entity.device_id ?? "null") || entity.area_id === this.area.area_id;
        const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
        const domainExposed = exposedDomainIds.includes(entity.entity_id.split(".", 1)[0]);

        return entityUnhidden && !domainExposed && entityLinked;
      });

      if (miscellaneousEntities.length) {
        try {
          const cardModule = await import("../cards/MiscellaneousCard");
          const cards: (LovelaceBadgeConfig | EntityCardConfig)[] = [
            new ControllerCard(target, Helper.strategyOptions.domains.default).createCard(),
          ];

          const swipeCard: SwipeCardConfig[] = [];

          for (const entity of miscellaneousEntities) {
            let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
            let deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];

            if (cardOptions?.hidden || deviceOptions?.hidden) continue;
            if (entity.entity_category === "config" && Helper.strategyOptions.domains["_"].hide_config_entities) continue;

            swipeCard.push(new cardModule.MiscellaneousCard(entity, cardOptions).getCard());
          }

          viewSections.push({
            type: "grid",
            column_span: 1,
            cards: [...cards, new SwipeCard(swipeCard).getCard()]
          });
        } catch (e) {
          Helper.logError("An error occurred while creating the domain cards!", e);
        }
      }
    }

    return viewSections;
  }


  /**
   * Get a view object.
   *
   * The view includes the cards which are created by method createSectionCards().
   *
   * @returns {Promise<LovelaceViewConfig>} The view object.
   */
  async getView(): Promise<LovelaceViewConfig> {
    return {
      ...this.config,
      sections: await this.createSectionCards(),
    };
  }

}

export { AreaView };
