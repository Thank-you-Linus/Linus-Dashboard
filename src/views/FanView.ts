import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { RefreshChip } from "../chips/RefreshChip";
import { createSmartControlChip } from "../utils/smartControlChip";

import { AbstractView } from "./AbstractView";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Fan View Class.
 *
 * Used to create a view for entities of the fan domain.
 *
 * @class FanView
 * @extends AbstractView
 */
class FanView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain = "fan";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    icon: "mdi:fan",
    subview: false,
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(FanView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Empty viewControllerCard - no global chips for this domain
    this.viewControllerCard = [];
  }

  /**
   * Create the badges to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>}
   * @override
   */
  override async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    const badges: (StackCardConfig | TemplateCardConfig | ChipsCardConfig)[] = [];

    // 1. Smart control chip (if no global entity exists)
    const smartChip = createSmartControlChip({
      domain: "fan",
      serviceOn: "turn_on",
      serviceOff: "turn_off",
      activeStates: ["on"],
      translationKey: "fan",
    });

    if (smartChip) {
      badges.push({
        type: "custom:mushroom-chips-card",
        chips: [smartChip],
        alignment: "start",
      });
    }

    // 2. Refresh chip (centered)
    const refreshChip = new RefreshChip();
    badges.push({
      type: "custom:mushroom-chips-card",
      alignment: "center",
      chips: [refreshChip.getChip()],
    });

    return badges;
  }
}

export { FanView };
