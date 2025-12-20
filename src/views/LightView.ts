import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { RefreshChip } from "../chips/RefreshChip";
import { AggregateChip } from "../chips/AggregateChip";

import { AbstractView } from "./AbstractView";

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
  static #domain = "light";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    icon: "mdi:lightbulb-group",
    subview: false,
  };



  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(LightView.#domain);

    this.config = Object.assign(this.config, this.#defaultConfig, options);

    // Empty viewControllerCard - global chips moved to badges
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

    // Create aggregate chip for global light control
    const aggregateChip = new AggregateChip({
      domain: "light",
      scope: "global",
      scopeName: Helper.localize("component.linus_dashboard.entity.text.aggregate_popup.state.title_light"),
      serviceOn: "turn_on",
      serviceOff: "turn_off",
      activeStates: ["on"],
      translationKey: "light",
      features: [{ type: "light-brightness" }],
    });

    if (aggregateChip.getChip()) {
      badges.push({
        type: "custom:mushroom-chips-card",
        chips: [aggregateChip.getChip()],
        alignment: "center",
      });
    }

    // Refresh chip (centered)
    const refreshChip = new RefreshChip();
    badges.push({
      type: "custom:mushroom-chips-card",
      alignment: "center",
      chips: [refreshChip.getChip()],
    });

    return badges;
  }
}

export { LightView };
