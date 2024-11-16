import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceBadgeConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { generic } from "../types/strategy/generic";
import isCallServiceActionConfig = generic.isCallServiceActionConfig;
import StrategyArea = generic.StrategyArea;
import { SwipeCard } from "../cards/SwipeCard";
import { SensorCard } from "../cards/SensorCard";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";
import { ControllerCard } from "../cards/ControllerCard";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { ImageAreaCard } from "../cards/ImageAreaCard";
import { SwipeCardConfig } from "../types/lovelace-mushroom/cards/swipe-card-config";
import { AREA_CARDS_DOMAINS, AREA_EXPOSED_CHIPS, DOMAIN_ICONS, HOME_EXPOSED_CHIPS, UNAVAILABLE_STATES } from "../variables";
import { UnavailableChip } from "../chips/UnavailableChip";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AreaStateChip } from "../chips/AreaStateChip";
import { createChipsFromList } from "../utils";


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
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {

    if (Helper.strategyOptions.home_view.hidden.includes("chips")) {
      // Chips section is hidden.

      return [];
    }

    const chips: LovelaceChipConfig[] = [];
    const chipOptions = Helper.strategyOptions.chips;

    const device = Helper.magicAreasDevices[this.area.slug];

    if (device) {
      chips.push(new AreaStateChip(device, true).getChip());
    }


    const areaChips = await createChipsFromList(AREA_EXPOSED_CHIPS, { show_content: true }, this.area.slug);
    if (areaChips) {
      chips.push(...areaChips);
    }


    // (device?.entities.all_lights && device?.entities.all_lights.entity_id !== "unavailable" ? {
    //   type: "custom:mushroom-chips-card",
    //   alignment: "center",
    //   chips: new AreaScenesChips(device, area).getChips()
    // } : undefined)

    return chips.map(chip => ({
      type: "custom:mushroom-chips-card",
      alignment: "center",
      chips: [chip],
    }));
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
      cards: this.area.area_id !== "undisclosed" ? [new ImageAreaCard(this.area.area_id).getCard()] : []
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
        const entities = Helper.getAreaEntities(this.area, domain);
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
      const areaDevices = this.area.devices.filter(device_id => Helper.devices[device_id].area_id === this.area.area_id);
      const miscellaneousEntities = this.area.entities.filter(entity_id => {
        const entity = Helper.entities[entity_id];
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

          for (const entity_id of miscellaneousEntities) {
            const entity = Helper.entities[entity_id];
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
      badges: await this.createSectionBadges(),
      sections: await this.createSectionCards(),
    };
  }

}

export { AreaView };
