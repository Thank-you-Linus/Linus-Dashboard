import { Helper } from "../Helper";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { AlarmCard } from "../cards/AlarmCard";
import { PersonCard } from "../cards/PersonCard";
import { createCardsFromList, createChipsFromList, processEntitiesForView } from "../utils";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { SECURITY_EXPOSED_CHIPS, SECURITY_EXPOSED_DOMAINS, SECURITY_EXPOSED_SENSORS } from "../variables";
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

    // Multi-alarmes : affiche un chip pour chaque alarme
    const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
    if (Array.isArray(alarmEntityIds) && alarmEntityIds.length > 0) {
      try {
        chipModule = await import("../chips/AlarmChip");
        for (const alarmEntityId of alarmEntityIds) {
          const alarmChip = new chipModule.AlarmChip(alarmEntityId);
          chips.push(alarmChip.getChip());
        }
      } catch (e) {
        Helper.logError("An error occurred while creating the alarm chips!", e);
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

    // Multi-alarmes : affiche une carte pour chaque alarme
    const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
    if (Array.isArray(alarmEntityIds) && alarmEntityIds.length > 0) {
      globalSection.cards.push({
        type: "heading",
        heading: Helper.localize("component.binary_sensor.entity_component.safety.name"),
        heading_style: "title",
        icon: "mdi:shield-home",
      });
      globalSection.cards.push({
        type: "heading",
        heading: Helper.localize("component.alarm_control_panel.entity_component._.name"),
        heading_style: "title",
        icon: "mdi:alarm-light",
      });
      for (const alarmEntityId of alarmEntityIds) {
        if (Helper.entities[alarmEntityId]) {
          globalSection.cards.push(new AlarmCard(Helper.entities[alarmEntityId]).getCard());
        }
      }
    }

    const persons = Helper.domains.person
    if (persons?.length) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("ui.dialogs.quick-bar.commands.navigation.person"),
          heading_style: "title",
          icon: "mdi:account-group",
        })

      for (const person of persons) {
        globalSection.cards.push(new PersonCard({}, person).getCard());
      }
    }

    const securityCards = await createCardsFromList(SECURITY_EXPOSED_DOMAINS, {}, "global", "global");
    if (securityCards) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("ui.components.device-picker.device") + "s",
          heading_style: "title",
          icon: "mdi:shield",
        });
      globalSection.cards.push(...securityCards);
    }

    const sensorCards = await createCardsFromList(SECURITY_EXPOSED_SENSORS, {}, "global", "global");
    if (sensorCards) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("component.sensor.entity_component._.name") + "s",
          heading_style: "title",
          icon: "mdi:motion-sensor",
        });
      globalSection.cards.push(...sensorCards);
    }

    const sections = [globalSection]
    if (Helper.domains.camera?.length) sections.push(...await this.createCamerasSection())

    return sections;
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig[] >} An array of card objects.
   */
  async createCamerasSection(): Promise<LovelaceGridCardConfig[]> {

    const sections = await processEntitiesForView("camera", undefined, []) ?? []
    if (sections.length > 0) {
      sections[0]?.cards.unshift(
        {
          type: "heading",
          heading: `${Helper.localize("component.camera.entity_component._.name")}s`,
          heading_style: "title",
          badges: [],
          icon: Helper.icons["camera"]._?.default,
        });
    }

    return sections

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
