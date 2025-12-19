import { Helper } from "../Helper";
import { ControllerCard } from "../cards/ControllerCard";
import { views } from "../types/strategy/views";
import { DEVICE_CLASSES } from "../variables";
import { getDomainTranslationKey } from "../utils";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { RefreshChip } from "../chips/RefreshChip";

import { AbstractView } from "./AbstractView";

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
        showControls: domain !== "sensor",
        controlChipOptions: { device_class: options?.device_class },
      }, domain, "global").createCard();
  }

  /**
   * Create the badges to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>}
   * @override
   */
  override async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    const chips: LovelaceChipConfig[] = [];

    // Refresh chip - allows manual refresh of registries
    const refreshChip = new RefreshChip();
    chips.push(refreshChip.getChip());

    return chips.map(chip => ({
      type: "custom:mushroom-chips-card",
      alignment: "center",
      chips: [chip],
    }));
  }
}

export { AggregateView };
