import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { AbstractView } from "./AbstractView";
import { views } from "../types/strategy/views";
import { cards } from "../types/strategy/cards";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light View Class.
 *
 * Used to create a view for entities of the light domain.
 *
 * @class LightView
 * @extends AbstractView
 */
class LightView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "light";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    path: "lights",
    icon: "mdi:lightbulb-group",
    subview: false,
  };

  /**
   * Default configuration of the view's Controller card.
   *
   * @type {cards.ControllerCardOptions}
   * @private
   */
  #viewControllerCardConfig: cards.ControllerCardOptions = {
    title: `${Helper.localize(`component.light.entity_component._.name`)}s`,
    // subtitle: Helper.getCountTemplate(LightView.#domain, "eq", "on") + ` ${Helper.localize("component.light.entity_component._.state.on")}`,
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(LightView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Create a Controller card to switch all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      this.targetDomain(LightView.#domain),
      {
        ...this.#viewControllerCardConfig,
        ...Helper.strategyOptions.domains.light.controllerCardOptions,
      }, LightView.#domain, "global").createCard();

  }
}

export { LightView };
