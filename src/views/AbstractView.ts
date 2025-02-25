import { AGGREGATE_DOMAINS, AREA_CARDS_DOMAINS, UNDISCLOSED } from './../variables';
import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { TemplateCardConfig } from '../types/lovelace-mushroom/cards/template-card-config';
import { ChipsCardConfig } from '../types/lovelace-mushroom/cards/chips-card';
import { processEntitiesForView } from '../utils';
import { views } from '../types/strategy/views';

/**
 * Abstract View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
abstract class AbstractView {
  /**
   * Configuration of the view.
   *
   * @type {views.ViewConfig}
   */
  config: views.ViewConfig = {
    icon: "mdi:view-dashboard",
    type: "sections",
    subview: false,
  };

  /**
   * A card to switch all entities in the view.
   *
   * @type {LovelaceCardConfig[]}
   */
  viewControllerCard: LovelaceCardConfig[] = []

  /**
   * The domain of which we operate the devices.
   *
   * @private
   * @readonly
   */
  readonly #domain: string;

  /**
   * The device class of the view.
   *
   * @private
   * @readonly
   */
  readonly #device_class?: string;

  /**
   * Class constructor.
   *
   * @param {string} [domain] The domain which the view is representing.
   * @param {string} [device_class] The device class which the view is representing.
   *
   * @throws {Error} If trying to instantiate this class.
   * @throws {Error} If the Helper module isn't initialized.
   */
  protected constructor(domain: string, device_class?: string) {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.#domain = domain;
    this.#device_class = device_class;
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createViewCards(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    return [];
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    return [];
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
   * @override
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    return processEntitiesForView(this.#domain, this.#device_class, this.viewControllerCard);
  }

  /**
   * Get a view object.
   *
   * The view includes the cards which are created by method createViewCards().
   *
   * @returns {Promise<LovelaceViewConfig | LovelaceSectionConfig>} The view object.
   */
  async getView(): Promise<LovelaceViewConfig | LovelaceSectionConfig> {
    return {
      ...this.config,
      badges: await this.createSectionBadges(),
      sections: await this.createSectionCards(),
      cards: await this.createViewCards(),
    };
  }

  /**
   * Get a target of entity IDs for the given domain.
   *
   * @param {string} domain - The target domain to retrieve entity IDs from.
   * @return {HassServiceTarget} - A target for a service call.
   */
  targetDomain(domain: string): HassServiceTarget {
    return {
      entity_id: Helper.domains[domain]?.filter(
        entity =>
          !entity.hidden_by
          && !Helper.strategyOptions.card_options?.[entity.entity_id]?.hidden
      ).map(entity => entity.entity_id),
    };
  }
}

export { AbstractView };

