import { Helper } from "../Helper";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { TitleCardConfig } from "../types/lovelace-mushroom/cards/title-card-config";
import { AlarmCard } from "../cards/AlarmCard";
import { PersonCard } from "../cards/PersonCard";
import { BinarySensorCard } from "../cards/BinarySensorCard";
import { navigateTo } from "../utils";

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

    const alarmEntity = Helper.getAlarmEntity();
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

    const persons = Helper.getPersonsEntity()
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

    return [globalSection];
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
