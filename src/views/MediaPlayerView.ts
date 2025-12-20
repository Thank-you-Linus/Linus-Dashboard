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
 * MediaPlayer View Class.
 *
 * Used to create a view for entities of the media_player domain.
 *
 * @class MediaPlayerView
 * @extends AbstractView
 */
class MediaPlayerView extends AbstractView {
  /**
   * Domain of the view's entities.
   *
   * @type {string}
   * @static
   * @private
   */
  static #domain = "media_player";

  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    icon: "mdi:cast",
    subview: false,
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super(MediaPlayerView.#domain);

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

    // Create aggregate chip for global media player control
    const aggregateChip = new AggregateChip({
      domain: "media_player",
      scope: "global",
      scopeName: Helper.localize("component.linus_dashboard.entity.text.aggregate_popup.state.title_media_player"),
      serviceOn: "media_play",
      serviceOff: "media_pause",
      activeStates: ["playing", "paused"],
      translationKey: "media_player",
      features: [],
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

export { MediaPlayerView };
