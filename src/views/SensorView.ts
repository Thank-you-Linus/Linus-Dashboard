import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { AbstractView } from "./AbstractView";
import { views } from "../types/strategy/views";
import { cards } from "../types/strategy/cards";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Sensor View Class.
 *
 * Used to create a view for entities of the scene domain.
 *
 * @class SensorView
 * @extends AbstractView
 */
class SensorView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "sensor";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    title: "Sensors",
    icon: "mdi:palette",
    subview: false,
  };

  /**
   * Default configuration of the view's Controller card.
   *
   * @type {cards.ControllerCardOptions}
   * @private
   */
  #viewControllerCardConfig: cards.ControllerCardOptions = {
    title: `${Helper.localize(`component.sensor.entity_component._.name`)}s`,
    // subtitle: Helper.getCountTemplate(SensorView.#domain, "ne", "on") + ` ${Helper.localize(`ui.dialogs.quick-bar.commands.navigation.scene`)}`,
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(SensorView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Create a Controller card to scene all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      this.targetDomain(SensorView.#domain),
      {
        ...this.#viewControllerCardConfig,
        ...Helper.strategyOptions.domains.scene.controllerCardOptions,
      }, SensorView.#domain).createCard();
  }
}

export { SensorView };
