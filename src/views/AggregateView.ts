import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { AbstractView } from "./AbstractView";
import { views } from "../types/strategy/views";
import { cards } from "../types/strategy/cards";
import { DEVICE_CLASSES, DEVICE_ICONS, DOMAIN_ICONS, MAGIC_AREAS_AGGREGATE_DOMAINS, SENSOR_DOMAINS } from "../variables";
import { getDomainTranslationKey, getStateTranslationKey } from "../utils";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Aggregate View Class.
 *
 * Used to create a view for entities of the fan domain.
 *
 * @class AggregateView
 * @extends AbstractView
 */
class AggregateView extends AbstractView {

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    title: "Aggregates",
    path: "aggregates",
    icon: "mdi:fan",
    subview: true,
  };

  /**
   * Default configuration of the view's Controller card.
   *
   * @type {cards.ControllerCardOptions}
   * @private
   */
  #viewControllerCardConfig: cards.ControllerCardOptions = {
    // title: `${Helper.localize(`component.fan.entity_component._.name`)}s`,
  };

  /**
   * Class constructor.
   *
   * @param {views.AggregateViewOptions} [options={}] Options for the view.
   */
  constructor(options: views.AggregateViewOptions) {
    const domain = DEVICE_CLASSES.sensor.includes(options?.device_class) ? "sensor" : "binary_sensor";

    super(domain, options?.device_class);

    this.#defaultConfig.title = `${Helper.localize(getDomainTranslationKey(domain, options?.device_class))}s`;
    this.#defaultConfig.icon = DOMAIN_ICONS[options?.device_class as keyof typeof DOMAIN_ICONS];
    this.#defaultConfig.path = options?.device_class;

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Create a Controller card to switch all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      this.targetDomain(options?.device_class),
      {
        ...this.#viewControllerCardConfig,
        title: this.#defaultConfig.title,
        // subtitle: Helper.getDeviceClassCountTemplate(options?.device_class, "eq", "on") + ` ${Helper.localize(getStateTranslationKey("on", domain, options?.device_class))}s`,
        ...("controllerCardOptions" in this.config ? this.config.controllerCardOptions : {}) as cards.ControllerCardConfig,
      }, options?.device_class).createCard();

  }
}

export { AggregateView };
