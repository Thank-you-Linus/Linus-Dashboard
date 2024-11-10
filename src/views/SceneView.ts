import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { AbstractView } from "./AbstractView";
import { views } from "../types/strategy/views";
import { cards } from "../types/strategy/cards";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Scene View Class.
 *
 * Used to create a view for entities of the scene domain.
 *
 * @class SceneView
 * @extends AbstractView
 */
class SceneView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain: string = "scene";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    title: "Scenes",
    path: "scenes",
    icon: "mdi:palette",
    subview: false,
    controllerCardOptions: {
      showControls: false,
    },
  };

  /**
   * Default configuration of the view's Controller card.
   *
   * @type {cards.ControllerCardOptions}
   * @private
   */
  #viewControllerCardConfig: cards.ControllerCardOptions = {
    title: `${Helper.localize(`ui.dialogs.quick-bar.commands.navigation.scene`)}`,
    subtitle: Helper.getCountTemplate(SceneView.#domain, "ne", "on") + ` ${Helper.localize(`ui.dialogs.quick-bar.commands.navigation.scene`)}`,
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(SceneView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Create a Controller card to scene all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      this.targetDomain(SceneView.#domain),
      {
        ...this.#viewControllerCardConfig,
        ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}) as cards.ControllerCardConfig,
      }, SceneView.#domain).createCard();
  }
}

export { SceneView };
