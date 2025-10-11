import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { AbstractView } from "./AbstractView";
import { views } from "../types/strategy/views";
import { cards } from "../types/strategy/cards";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Vacuum View Class.
 *
 * Used to create a view for entities of the vacuum domain.
 *
 * @class VacuumView
 * @extends AbstractView
 */
class VacuumView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "vacuum";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    title: "Vacuums",
    icon: "mdi:robot-vacuum",
    subview: false,
  };

  /**
   * Default configuration of the view's Controller card.
   *
   * @type {cards.ControllerCardOptions}
   * @private
   */
  #viewControllerCardConfig: cards.ControllerCardOptions = {
    title: `${Helper.localize(`component.vacuum.entity_component._.name`)}s`,
    // subtitle: Helper.getCountTemplate(VacuumView.#domain, "ne", "off") + ` ${Helper.localize(`component.vacuum.entity_component._.state.on`)}`,
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(VacuumView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Create a Controller card to switch all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      {
        ...this.#viewControllerCardConfig,
        ...Helper.strategyOptions.domains.vacuum?.controllerCardOptions,
      }, VacuumView.#domain).createCard();
  }
}

export { VacuumView };
