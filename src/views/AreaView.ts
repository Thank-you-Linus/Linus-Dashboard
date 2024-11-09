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

    // Create a global section for the main area card
    const globalSection: LovelaceGridCardConfig = {
      type: "grid",
      column_span: 1,
      cards: []
    };

    if (this.area.area_id !== "undisclosed") {
      globalSection.cards.push(new MainAreaCard(this.area).getCard());
    }

    if (globalSection.cards.length) {
      viewSections.push(globalSection);
    }

    // Set the target for controller cards to the current area
    let target: HassServiceTarget = {
      area_id: [this.area.area_id],
    };

    // Create cards for each domain
    for (const domain of exposedDomainIds) {
      if (domain === "default") continue;

      const className = Helper.sanitizeClassName(domain + "Card");

      try {
        const domainSections = await import(`../cards/${className}`).then(cardModule => {
          const entities = Helper.getDeviceEntities(this.area, domain);
          const configEntityHidden = Helper.strategyOptions.domains[domain]?.hide_config_entities || Helper.strategyOptions.domains["_"].hide_config_entities;
          const magicAreasDevice = Helper.magicAreasDevices[this.area.slug];
          const magicAreasKey = domain === "light" ? 'all_lights' : `${domain}_group`;

          // Set the target for controller cards to linus aggregate entity if exist
          target["entity_id"] = magicAreasDevice?.entities[magicAreasKey]?.entity_id;

          // Set the target for controller cards to entities without an area
          if (this.area.area_id === "undisclosed") {
            target = {
              entity_id: entities.map(entity => entity.entity_id),
            };
          }

          const domainCards: EntityCardConfig[] = [];

          if (entities.length) {
            // Create a Controller card for the current domain
            const title = Helper.localize(domain === 'scene' ? 'ui.dialogs.quick-bar.commands.navigation.scene' : `component.${domain}.entity_component._.name`);
            const titleCard = new ControllerCard(target, { ...Helper.strategyOptions.domains[domain], domain, title }).createCard();

            if (domain === "sensor") {
              // Create a card for each entity-sensor of the current area
              const sensorStates = Helper.getStateEntities(this.area, "sensor");
              const sensorCards: EntityCardConfig[] = [];

              for (const sensor of entities) {
                const sensorState = sensorStates.find(state => state.entity_id === sensor.entity_id);
                let cardOptions = Helper.strategyOptions.card_options?.[sensor.entity_id];
                let deviceOptions = Helper.strategyOptions.card_options?.[sensor.device_id ?? "null"];

                if (!cardOptions?.hidden && !deviceOptions?.hidden) {
                  if (sensorState?.attributes.unit_of_measurement) {
                    cardOptions = {
                      type: "custom:mini-graph-card",
                      entities: [sensor.entity_id],
                      ...cardOptions,
                    };
                  }

                  sensorCards.push(new SensorCard(sensor, cardOptions).getCard());
                }
              }

              if (sensorCards.length) {
                domainCards.push(new SwipeCard(sensorCards).getCard());
                domainCards.unshift(...titleCard);
              }

              return {
                type: "grid",
                column_span: 1,
                cards: domainCards
              };
            }

            // Create a card for each other domain-entity of the current area
            for (const entity of entities) {
              let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
              let deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];

              if (cardOptions?.hidden || deviceOptions?.hidden) continue;
              if (entity.entity_category === "config" && configEntityHidden) continue;

              domainCards.push(new cardModule[className](entity, cardOptions).getCard());
            }

            if (domainCards.length) {
              domainCards.unshift(...titleCard);
              // domainCards.push(new SwipeCard(domainCards).getCard());
            }
          }

          return {
            type: "grid",
            column_span: 1,
            cards: domainCards
          } as LovelaceGridCardConfig;
        });

        if (domainSections.cards.length) {
          viewSections.push({
            type: "grid",
            column_span: 1,
            cards: domainSections.cards
          });
        }
      } catch (e) {
        Helper.logError("An error occurred while creating the domain cards!", e);
      }
    }

    // Create cards for any other domain
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
          const miscellaneousCards = await import("../cards/MiscellaneousCard").then(cardModule => {
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

            return [...cards, new SwipeCard(swipeCard).getCard()];
          });

          viewSections.push({
            type: "grid",
            column_span: 1,
            cards: miscellaneousCards
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
