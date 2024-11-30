import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceCardConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { generic } from "../types/strategy/generic";
import StrategyFloor = generic.StrategyFloor;
import { SwipeCard } from "../cards/SwipeCard";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";
import { ControllerCard } from "../cards/ControllerCard";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { ImageAreaCard } from "../cards/ImageAreaCard";
import { AREA_EXPOSED_CHIPS, DOMAIN_ICONS, UNDISCLOSED } from "../variables";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AreaStateChip } from "../chips/AreaStateChip";
import { createChipsFromList, getDomainTranslationKey } from "../utils";


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Floor View Class.
 *
 * Used to create a Floor view.
 *
 * @class FloorView
 */
class FloorView {
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
   * @type {StrategyFloor}
   * @private
   */
  floor: StrategyFloor;

  /**
   * View controller card.
   *
   * @type {LovelaceGridCardConfig[]}
   * @private
   */
  viewControllerCard: LovelaceGridCardConfig[] = [];

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(floor: StrategyFloor, options: views.ViewConfig = {}) {

    this.floor = floor;

    this.config = { ...this.config, ...options };
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

    const device = Helper.magicAreasDevices[this.floor.floor_id];

    if (device) {
      chips.push(new AreaStateChip(device, true).getChip());
    }

    const areaChips = await createChipsFromList(AREA_EXPOSED_CHIPS, { show_content: true }, this.floor.floor_id, this.floor.areas_slug);
    if (areaChips) {
      chips.push(...areaChips);
    }

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
    let isFirstLoop = true;

    let target: HassServiceTarget = { area_id: this.floor.areas_slug };

    for (const domain of exposedDomainIds) {
      if (domain === "default") continue;

      const domainCards: LovelaceCardConfig[] = [];

      try {
        const cardModule = await import(`../cards/${Helper.sanitizeClassName(domain + "Card")}`);
        const configEntityHidden = Helper.strategyOptions.domains[domain]?.hide_config_entities || Helper.strategyOptions.domains["_"].hide_config_entities;

        for (const area of this.floor.areas_slug.map(area_slug => Helper.areas[area_slug])) {

          if (!area) continue


          const areaEntities = Helper.getAreaEntities(area, domain);

          if (areaEntities.length) {
            const entityCards: EntityCardConfig[] = areaEntities
              .filter(entity => {
                const cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
                const deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
                return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity.entity_category === "config" && configEntityHidden);
              })
              .map(entity => {
                const cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
                if (domain === "sensor" && Helper.getEntityState(entity.entity_id)?.attributes.unit_of_measurement) {
                  return new cardModule[Helper.sanitizeClassName(domain + "Card")](entity, {
                    type: "custom:mini-graph-card",
                    entities: [entity.entity_id],
                    ...cardOptions,
                  }).getCard();
                }
                return new cardModule[Helper.sanitizeClassName(domain + "Card")](entity, cardOptions).getCard();
              });

            if (entityCards.length) {
              const titleCardOptions = {
                ...Helper.strategyOptions.domains[domain].controllerCardOptions,
                subtitle: area.name,
                domain,
                subtitleIcon: area.icon,
                subtitleNavigate: area.slug,
              };

              if (domain) {
                titleCardOptions.showControls = Helper.strategyOptions.domains[domain].showControls;
                titleCardOptions.extraControls = Helper.strategyOptions.domains[domain].extraControls;
                titleCardOptions.controlChipOptions = { area_slug: area.slug };
              }

              const titleCard = new ControllerCard(target, titleCardOptions, domain, area.slug).createCard();

              let areaCards;
              areaCards = entityCards.length > 2 ? [new SwipeCard(entityCards).getCard()] : entityCards;
              areaCards.unshift(...titleCard);

              domainCards.push(...areaCards);
            }
          }
        }

        if (domainCards.length) {
          const titleSectionOptions: any = {
            ...Helper.strategyOptions.domains[domain].controllerCardOptions,
            title: Helper.localize(getDomainTranslationKey(domain)),
            titleIcon: DOMAIN_ICONS[domain as keyof typeof DOMAIN_ICONS] ?? "mdi:floor-plan",
            titleNavigate: domain,
          };
          if (domain) {
            titleSectionOptions.showControls = Helper.strategyOptions.domains[domain].showControls;
            titleSectionOptions.extraControls = Helper.strategyOptions.domains[domain].extraControls;
            titleSectionOptions.controlChipOptions = { area_slug: this.floor.areas_slug };
          }

          const area_ids = this.floor.areas_slug.map(area_slug => Helper.areas[area_slug].area_id);
          const domainControllerCard = new ControllerCard(
            { area_id: area_ids },
            titleSectionOptions,
            domain,
            this.floor.floor_id
          ).createCard();

          const section = { type: "grid", cards: [] } as LovelaceGridCardConfig;
          if (isFirstLoop) {
            section.cards.push(...this.viewControllerCard);
            isFirstLoop = false;
          }

          section.cards.push(...domainControllerCard);
          section.cards.push(...domainCards);
          viewSections.push(section);
        }


        // // Handle default domain if not hidden
        // if (!Helper.strategyOptions.domains.default.hidden) {
        //   const areaDevices = area.devices.filter(device_id => Helper.devices[device_id].area_id === floor.area_id);
        //   const miscellaneousEntities = floor.entities.filter(entity_id => {
        //     const entity = Helper.entities[entity_id];
        //     const entityLinked = areaDevices.includes(entity.device_id ?? "null") || entity.area_id === floor.area_id;
        //     const entityUnhidden = entity.hidden_by === null && entity.disabled_by === null;
        //     const domainExposed = exposedDomainIds.includes(entity.entity_id.split(".", 1)[0]);

        //     return entityUnhidden && !domainExposed && entityLinked;
        //   });

        //   if (miscellaneousEntities.length) {
        //     try {
        //       const cardModule = await import("../cards/MiscellaneousCard");

        //       const swipeCard = miscellaneousEntities
        //         .filter(entity_id => {
        //           const entity = Helper.entities[entity_id];
        //           const cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
        //           const deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
        //           return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity.entity_category === "config" && Helper.strategyOptions.domains["_"].hide_config_entities);
        //         })
        //         .map(entity_id => new cardModule.MiscellaneousCard(Helper.entities[entity_id], Helper.strategyOptions.card_options?.[entity_id]).getCard());

        //       viewSections.push({
        //         type: "grid",
        //         column_span: 1,
        //         cards: [new SwipeCard(swipeCard).getCard()],
        //       });
        //     } catch (e) {
        //       Helper.logError("An error occurred while creating the domain cards!", e);
        //     }
        //   }
        // }
      } catch (e) {
        Helper.logError("An error occurred while creating the domain cards!", e);
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

export { FloorView };
