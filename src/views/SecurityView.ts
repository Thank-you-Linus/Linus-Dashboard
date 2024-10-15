import { Helper } from "../Helper";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
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
    icon: "mdi:security",
    subview: false,
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
  async createViewCards(): Promise<(StackCardConfig | TitleCardConfig)[]> {
    const viewCards: LovelaceCardConfig[] = [];

    const alarmEntity = Helper.getAlarmEntity();
    if (alarmEntity?.entity_id) {
      viewCards.push({
        type: "custom:mushroom-title-card",
        subtitle: "Alarme",
        card_mod: {
          style: `ha-card.header { padding-top: 8px; }`,
        }
      })
      viewCards.push(new AlarmCard(alarmEntity).getCard())
    }

    const persons = Helper.getPersonsEntity()
    if (persons?.length) {
      viewCards.push({
        type: "custom:mushroom-title-card",
        subtitle: "Personnes",
        card_mod: {
          style: `ha-card.header { padding-top: 8px; }`,
        }
      })

      for (const person of persons) {
        viewCards.push(new PersonCard(person, {
          layout: "horizontal",
          primary_info: "name",
          secondary_info: "state"
        }).getCard())
      }
    }

    const globalDevice = Helper.magicAreasDevices["Global"];

    const {
      aggregate_motion,
      aggregate_door,
      aggregate_window,
    } = globalDevice?.entities;

    if (aggregate_motion || aggregate_door || aggregate_window) {
      viewCards.push({
        type: "custom:mushroom-title-card",
        subtitle: "Capteurs",
        card_mod: {
          style: `ha-card.header { padding-top: 8px; }`,
        }
      })
      if (aggregate_motion?.entity_id) viewCards.push(new BinarySensorCard(aggregate_motion, { tap_action: navigateTo('security-details') }).getCard());
      if (aggregate_door?.entity_id) viewCards.push(new BinarySensorCard(aggregate_door, { tap_action: navigateTo('security-details') }).getCard());
      if (aggregate_window?.entity_id) viewCards.push(new BinarySensorCard(aggregate_window, { tap_action: navigateTo('security-details') }).getCard());
    }


    return viewCards;
  }

  /**
   * Get a view object.
   *
   * The view includes the cards which are created by method createViewCards().
   *
   * @returns {Promise<LovelaceViewConfig>} The view object.
   */
  async getView(): Promise<LovelaceViewConfig> {
    return {
      ...this.config,
      cards: await this.createViewCards(),
    };
  }
}

export { SecurityView };
