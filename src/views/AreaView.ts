import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { generic } from "../types/strategy/generic";
import StrategyArea = generic.StrategyArea;
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";
import { ControllerCard } from "../cards/ControllerCard";
import { ImageAreaCard } from "../cards/ImageAreaCard";
import { AGGREGATE_DOMAINS, AREA_EXPOSED_CHIPS, UNDISCLOSED } from "../variables";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AreaStateChip } from "../chips/AreaStateChip";
import { addLightGroupsToEntities, createChipsFromList, getDomainTranslationKey } from "../utils";
import { ResourceKeys } from "../types/homeassistant/data/frontend";
import { UnavailableChip } from "../chips/UnavailableChip";
import { GroupedCard } from "../cards/GroupedCard";


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
  async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {

    if (Helper.strategyOptions.home_view.hidden.includes("chips")) {
      // Chips section is hidden.

      return [];
    }

    const chips: LovelaceChipConfig[] = [];

    chips.push(new AreaStateChip({ area: this.area, showContent: true }).getChip());

    const areaChips = await createChipsFromList(AREA_EXPOSED_CHIPS, { show_content: true }, this.area.slug, this.area.slug);
    if (areaChips) {
      chips.push(...areaChips);
    }

    const unavailableChip = new UnavailableChip({ area_slug: this.area.slug }).getChip();
    if (unavailableChip) chips.push(unavailableChip);

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
    if (this.area.area_id !== UNDISCLOSED && this.area.picture) {
      viewSections.push({
        type: "grid",
        column_span: 1,
        cards: [new ImageAreaCard(this.area.area_id).getCard()],
      });
    }


    for (const domain of exposedDomainIds) {
      if (Helper.linus_dashboard_config?.excluded_domains?.includes(domain)) continue;
      if (Helper.linus_dashboard_config?.excluded_device_classes?.includes(domain)) continue;
      if (domain === "default") continue;

      try {
        const cardModule = await import(`../cards/${Helper.sanitizeClassName(domain + "Card")}`);
        let entities = Helper.getAreaEntities(this.area, domain);
        const configEntityHidden = Helper.strategyOptions.domains[domain]?.hide_config_entities || Helper.strategyOptions.domains["_"].hide_config_entities;

        const domainCards: EntityCardConfig[] = [];

        if (entities.length) {
          const titleCardOptions = {
            ...Helper.strategyOptions.domains[domain].controllerCardOptions,
            subtitle: Helper.localize(getDomainTranslationKey(domain)),
            domain,
            subtitleIcon: Helper.icons[domain as ResourceKeys]._?.default,
            subtitleNavigate: domain,
          };

          if (domain) {
            if (AGGREGATE_DOMAINS.includes(domain)) {
              titleCardOptions.showControls = false
            } else {
              titleCardOptions.showControls = Helper.strategyOptions.domains[domain].showControls;
              titleCardOptions.extraControls = Helper.strategyOptions.domains[domain].extraControls;
              titleCardOptions.controlChipOptions = { area_slug: this.area.slug };
            }
          }

          const titleCard = new ControllerCard(titleCardOptions, domain, this.area.slug).createCard();

          if (domain === "light") entities = addLightGroupsToEntities(this.area, entities);

          const entityCards = entities
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
            domainCards.push(new GroupedCard(entityCards).getCard())
            domainCards.unshift(...titleCard);
          }

          viewSections.push({
            type: "grid",
            column_span: 1,
            cards: domainCards,
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

          const miscellaneousEntityCards = miscellaneousEntities
            .filter(entity_id => {
              const entity = Helper.entities[entity_id];
              const cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
              const deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];
              return !cardOptions?.hidden && !deviceOptions?.hidden && !(entity.entity_category === "config" && Helper.strategyOptions.domains["_"].hide_config_entities);
            })
            .map(entity_id => new cardModule.MiscellaneousCard(Helper.entities[entity_id], Helper.strategyOptions.card_options?.[entity_id]).getCard());

          const miscellaneousCards = new GroupedCard(miscellaneousEntityCards).getCard()

          const titleCard = {
            type: "heading",
            heading: Helper.localize("ui.panel.lovelace.editor.card.generic.other_cards"),
            // icon: this.#defaultConfig.titleIcon,
            heading_style: "subtitle",
            badges: [],
            layout_options: {
              grid_columns: "full",
              grid_rows: 1
            },
          }

          viewSections.push({
            type: "grid",
            column_span: 1,
            cards: [titleCard, miscellaneousCards],
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