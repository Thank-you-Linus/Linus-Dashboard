import { ControllerCard } from "../cards/ControllerCard";
import { views } from "../types/strategy/views";
import { cards } from "../types/strategy/cards";
import { Helper } from "../Helper";

import { AbstractView } from "./AbstractView";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Camera View Class.
 *
 * Used to create a view for entities of the camera domain.
 *
 * @class CameraView
 * @extends AbstractView
 */
class CameraView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain = "camera";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    title: "Cameras",
    icon: "mdi:cctv",
    subview: false,
  };

  /**
   * Default configuration of the view's Controller card.
   *
   * @type {cards.ControllerCardOptions}
   * @private
   */
  #viewControllerCardConfig: cards.ControllerCardOptions = {
    title: `${Helper.localize(`component.camera.entity_component._.name`)}s`,
    // subtitle: Helper.getCountTemplate(CameraView.#domain, "ne", "off") + ` ${Helper.localize("component.light.entity_component._.state.on")}`,
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(CameraView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Create a Controller card to switch all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      {
        ...this.#viewControllerCardConfig,
        ...Helper.strategyOptions.domains.camera?.controllerCardOptions,
      }, CameraView.#domain).createCard();
  }
}

export { CameraView };
