import { Helper } from "../Helper";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { AlarmCard } from "../cards/AlarmCard";
import { PersonCard } from "../cards/PersonCard";
import { BinarySensorCard } from "../cards/BinarySensorCard";
import { createCardsFromList, createChipsFromList, getAreaName, getFloorName, navigateTo } from "../utils";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { ControllerCard } from "../cards/ControllerCard";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { SECURITY_EXPOSED_CHIPS } from "../variables";
import { GroupedCard } from "../cards/GroupedCard";

/**
 * Security View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class SecurityView {
  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  config: views.ViewConfig = {
    title: Helper.localize("component.binary_sensor.entity_component.safety.name"),
    icon: "mdi:security",
    type: "sections",
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
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createViewBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {

    if (Helper.strategyOptions.home_view.hidden.includes("chips")) {
      // Chips section is hidden.

      return [];
    }

    const chips: LovelaceChipConfig[] = [];

    let chipModule;

    // Alarm chip.
    const alarmEntityId = Helper.linus_dashboard_config?.alarm_entity_id

    if (alarmEntityId) {
      try {
        chipModule = await import("../chips/AlarmChip");
        const alarmChip = new chipModule.AlarmChip(alarmEntityId);

        chips.push(alarmChip.getChip());
      } catch (e) {
        Helper.logError("An error occurred while creating the alarm chip!", e);
      }
    }

    const homeChips = await createChipsFromList(SECURITY_EXPOSED_CHIPS, { show_content: true });
    if (homeChips) {
      chips.push(...homeChips);
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
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    const globalSection: LovelaceGridCardConfig = {
      type: "grid",
      column_span: 1,
      cards: []
    };

    const alarmEntityId = Helper.linus_dashboard_config?.alarm_entity_id
    if (alarmEntityId) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("component.binary_sensor.entity_component.safety.name"),
          heading_style: "title",
        }
      )
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("component.alarm_control_panel.entity_component._.name"),
          heading_style: "subtitle",
        })
      globalSection.cards.push(new AlarmCard(Helper.entities[alarmEntityId]).getCard())
    }

    const persons = Helper.domains.person
    if (persons?.length) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("ui.dialogs.quick-bar.commands.navigation.person"),
          heading_style: "subtitle",
        })

      for (const person of persons) {
        globalSection.cards.push(new PersonCard(person).getCard());
      }
    }

    const globalDevice = Helper.magicAreasDevices["global"];

    const {
      aggregate_motion,
      aggregate_door,
      aggregate_window,
    } = globalDevice?.entities ?? {};

    if (aggregate_motion || aggregate_door || aggregate_window) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("component.sensor.entity_component._.name") + "s",
          heading_style: "subtitle",
        })
      if (aggregate_motion?.entity_id) globalSection.cards.push(new BinarySensorCard(aggregate_motion, { tap_action: navigateTo('security-details') }).getCard());
      if (aggregate_door?.entity_id) globalSection.cards.push(new BinarySensorCard(aggregate_door, { tap_action: navigateTo('security-details') }).getCard());
      if (aggregate_window?.entity_id) globalSection.cards.push(new BinarySensorCard(aggregate_window, { tap_action: navigateTo('security-details') }).getCard());
    }

    const securityCards = await createCardsFromList(SECURITY_EXPOSED_CHIPS, {}, "global");
    if (securityCards) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("component.sensor.entity_component._.name") + "s",
          heading_style: "subtitle",
        });
      globalSection.cards.push(...securityCards);
    }


    const sections = [globalSection]
    if (Helper.domains.camera?.length) sections.push(await this.createCamerasSection())

    return sections;
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig >} An array of card objects.
   */
  async createCamerasSection(): Promise<LovelaceGridCardConfig> {
    const domain = "camera";
    const camerasSection: LovelaceGridCardConfig = {
      type: "grid",
      column_span: 1,
      cards: [
        {
          type: "heading",
          heading: `${Helper.localize(`component.camera.entity_component._.name`)}s`,
          heading_style: "title",
          badges: [],
          layout_options: {
            grid_columns: "full",
            grid_rows: 1
          },
          icon: Helper.icons[domain]._?.default,
        }]
    };

    const floors = Helper.orderedFloors;

    for (const floor of floors) {

      if (floor.areas_slug.length === 0) continue

      let floorCards: LovelaceCardConfig[] = [
        {
          type: "heading",
          heading: getFloorName(floor),
          heading_style: "title",
          badges: [],
          layout_options: {
            grid_columns: "full",
            grid_rows: 1
          },
          icon: floor.icon ?? "mdi:floor-plan",
        }
      ]

      // Create cards for each area.
      for (const area of floor.areas_slug.map(area_slug => Helper.areas[area_slug])) {
        const entities = Helper.getAreaEntities(area, domain);
        const className = Helper.sanitizeClassName(domain + "Card");

        const cardModule = await import(`../cards/${className}`);

        if (entities.length === 0 || !cardModule) {
          continue;
        }

        // Set the target for controller cards to the current area.
        let target: HassServiceTarget = {
          area_id: [area.slug],
        };

        let areaCards: LovelaceCardConfig[] = [];

        const entityCards = []

        // Create a card for each domain-entity of the current area.
        for (const entity of entities) {
          let cardOptions = Helper.strategyOptions.card_options?.[entity.entity_id];
          let deviceOptions = Helper.strategyOptions.card_options?.[entity.device_id ?? "null"];

          if (cardOptions?.hidden || deviceOptions?.hidden) {
            continue;
          }

          const configEntityHidden =
            Helper.strategyOptions.domains[domain ?? "_"].hide_config_entities
            || Helper.strategyOptions.domains["_"].hide_config_entities;
          if (entity.entity_category === "config" && configEntityHidden) {
            continue;
          }
          entityCards.push(new cardModule[className](entity, cardOptions).getCard());
        }

        if (entityCards.length) {
          areaCards.push(new GroupedCard(entityCards).getCard())
        }

        // Vertical stack the area cards if it has entities.
        if (areaCards.length) {
          const titleCardOptions: any = {};
          titleCardOptions.subtitle = getAreaName(area)
          titleCardOptions.subtitleIcon = area.icon ?? "mdi:floor-plan";
          titleCardOptions.navigate = area.slug;
          if (domain) {
            titleCardOptions.showControls = Helper.strategyOptions.domains[domain].showControls;
            titleCardOptions.extraControls = Helper.strategyOptions.domains[domain].extraControls;
          }

          // Create and insert a Controller card.
          areaCards.unshift(...new ControllerCard(titleCardOptions, domain).createCard())

          floorCards.push(...areaCards);
        }
      }

      if (floorCards.length > 1) camerasSection.cards.push(...floorCards)
    }

    return camerasSection;
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
      badges: await this.createViewBadges(),
      sections: await this.createSectionCards(),
    };
  }
}

export { SecurityView };
