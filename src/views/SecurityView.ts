import { Helper } from "../Helper";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { TitleCardConfig } from "../types/lovelace-mushroom/cards/title-card-config";
import { AlarmCard } from "../cards/AlarmCard";
import { PersonCard } from "../cards/PersonCard";
import { BinarySensorCard } from "../cards/BinarySensorCard";
import { getAreaName, getFloorName, navigateTo } from "../utils";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { SwipeCard } from "../cards/SwipeCard";
import { ControllerCard } from "../cards/ControllerCard";
import { DOMAIN_ICONS } from "../variables";

/**
 * Security View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
abstract class SecurityView {
  /**
   * Configuration of the view.
   *
   * @type {LovelaceViewConfig}
   */
  config: LovelaceViewConfig = {
    title: Helper.localize("component.binary_sensor.entity_component.safety.name"),
    path: "security",
    type: "sections",
    icon: "mdi:security",
  };

  /**
   * A card to switch all entities in the view.
   *
   * @type {StackCardConfig}
   */
  viewControllerCard: StackCardConfig = {
    cards: [],
    type: "",
  };

  /**
   * Class constructor.
   *
   * @throws {Error} If trying to instantiate this class.
   * @throws {Error} If the Helper module isn't initialized.
   */
  protected constructor() {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<(StackCardConfig | TitleCardConfig)[]>} An array of card objects.
   */
  async createSectionCards(): Promise<(StackCardConfig | TitleCardConfig)[]> {
    const globalSection: LovelaceGridCardConfig = {
      type: "grid",
      column_span: 1,
      cards: []
    };

    const alarmEntity = Helper.domains.alarm_control_panel[0]
    if (alarmEntity?.entity_id) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: "Sécurité",
          heading_style: "title",
        }
      )
      globalSection.cards.push(
        {
          type: "heading",
          heading: "Alarme",
          heading_style: "subtitle",
        })
      globalSection.cards.push(new AlarmCard(alarmEntity).getCard())
    }

    const persons = Helper.domains.person
    if (persons?.length) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: "Personnes",
          heading_style: "subtitle",
        })

      for (const person of persons) {
        globalSection.cards.push(new PersonCard(person, {
          layout: "horizontal",
          primary_info: "name",
          secondary_info: "state"
        }).getCard())
      }
    }

    const globalDevice = Helper.magicAreasDevices["global"];

    if (!globalDevice) {
      console.debug("Security view : Global device not found");
      return [];
    }

    const {
      aggregate_motion,
      aggregate_door,
      aggregate_window,
    } = globalDevice?.entities;

    if (aggregate_motion || aggregate_door || aggregate_window) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: "Capteurs",
          heading_style: "subtitle",
        })
      if (aggregate_motion?.entity_id) globalSection.cards.push(new BinarySensorCard(aggregate_motion, { tap_action: navigateTo('security-details') }).getCard());
      if (aggregate_door?.entity_id) globalSection.cards.push(new BinarySensorCard(aggregate_door, { tap_action: navigateTo('security-details') }).getCard());
      if (aggregate_window?.entity_id) globalSection.cards.push(new BinarySensorCard(aggregate_window, { tap_action: navigateTo('security-details') }).getCard());
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
          heading: `${Helper.localize(`component.${domain}.entity_component._.name`)}s`,
          heading_style: "title",
          badges: [],
          layout_options: {
            grid_columns: "full",
            grid_rows: 1
          },
          icon: DOMAIN_ICONS[domain],
        }]
    };

    const orderedFloors = Object.values(Helper.floors).sort((a, b) => {
      // Check if 'level' is undefined in either object
      if (a.level === undefined) return 1; // a should come after b
      if (b.level === undefined) return -1; // b should come after a

      // Both 'level' values are defined, compare them
      return a.level - b.level;
    });

    for (const floor of orderedFloors) {

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
      for (const [i, area] of floor.areas_slug.map(area_slug => Helper.areas[area_slug]).entries()) {
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
          if (entityCards.length > 2) {
            areaCards.push(new SwipeCard(entityCards).getCard());
          } else {
            areaCards.push(...entityCards);
          }
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
          areaCards.unshift(...new ControllerCard(target, titleCardOptions, domain).createCard())

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

export { SecurityView };
