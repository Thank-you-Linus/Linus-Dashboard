import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { AbstractView } from "./AbstractView";
import { views } from "../types/strategy/views";
import { DEVICE_CLASSES } from "../variables";
import { getDomainTranslationKey } from "../utils";

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
   * Class constructor.
   *
   * @param {views.AggregateViewOptions} [options={}] Options for the view.
   */
  constructor(options: views.AggregateViewOptions) {
    const domain = options?.device_class ? DEVICE_CLASSES.sensor.includes(options?.device_class) ? "sensor" : "binary_sensor" : options?.domain;
    super(domain, options?.device_class);

    // Create a Controller card to switch all entities of the domain.
    this.viewControllerCard = new ControllerCard(
      {
        title: Helper.localize(getDomainTranslationKey(domain, options?.device_class)),
        // subtitle: Helper.getDeviceClassCountTemplate(options?.device_class, "eq", "on") + ` ${Helper.localize(getStateTranslationKey("on", domain, options?.device_class))}s`,
        showControls: !!options?.device_class,
        controlChipOptions: { device_class: options?.device_class },
      }, domain, "global").createCard();

  }
}

export { AggregateView };
