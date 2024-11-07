import { Helper } from "../Helper";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { TitleCardConfig } from "../types/lovelace-mushroom/cards/title-card-config";
import { AggregateCard } from "../cards/AggregateCard";

/**
 * Security View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
abstract class SecurityDetailsView {
  /**
   * Configuration of the view.
   *
   * @type {LovelaceViewConfig}
   */
  config: LovelaceViewConfig = {
    title: Helper.localize("component.binary_sensor.entity_component.safety.name"),
    path: "security-details",
    icon: "mdi:security",
    subview: true,
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

    const globalDevice = Helper.magicAreasDevices["global"];

    if (!globalDevice) return [];

    const {
      aggregate_motion,
      aggregate_door,
      aggregate_window,
    } = globalDevice?.entities;


    if (aggregate_motion?.entity_id) {
      viewCards.push(new AggregateCard('binary_sensor', { device_class: 'motion', title: Helper.localize("component.binary_sensor.entity_component.motion.name") }).createCard())
      // viewCards.push(new AggregateCard({ entity_id: aggregate_motion.entity_id }, { title: `${Helper.localize("component.binary_sensor.entity_component.motion.name")}s` }).createCard())
    }

    if (aggregate_door?.entity_id || aggregate_window?.entity_id) {
      viewCards.push(new AggregateCard('binary_sensor', { device_class: ['door', 'window'], title: Helper.localize("component.binary_sensor.entity_component.opening.name") }).createCard())
      // viewCards.push(new AggregateCard({ entity_id: [aggregate_door?.entity_id, aggregate_window?.entity_id] }, { title: `${Helper.localize("component.binary_sensor.entity_component.opening.name")}s` }).createCard())
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

export { SecurityDetailsView };
