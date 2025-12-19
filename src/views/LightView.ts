import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { RefreshChip } from "../chips/RefreshChip";
import { createSmartControlChip } from "../utils/smartControlChip";
import { DEVICE_CLASSES } from "../variables";

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

    // 1. Smart control chip (if no global entity exists)
    const smartChip = createSmartControlChip({
      domain: "light",
      serviceOn: "turn_on",
      serviceOff: "turn_off",
      activeStates: ["on"],
      translationKey: "light",
    });

    if (smartChip) {
      badges.push({
        type: "custom:mushroom-chips-card",
        chips: [smartChip],
        alignment: "start",
      });
    }

    // 2. Control chips for all lights (global)
    const chipModule = Helper.strategyOptions.domains[LightView.#domain]?.controlChip;
    if (chipModule && typeof chipModule === 'function') {
      const chipOptions = {
        show_content: true,
        magic_device_id: "global",
        area_slug: "global",
        domain: LightView.#domain,
        ...Helper.strategyOptions.domains.light?.controllerCardOptions?.controlChipOptions,
      };

      const magic_device = Helper.magicAreasDevices["global"];
      const deviceClasses = DEVICE_CLASSES[LightView.#domain as keyof typeof DEVICE_CLASSES] ?? [];
      const chips = deviceClasses
        .flatMap((device_class: string) =>
          new chipModule({ ...chipOptions, device_class }, magic_device).getChip()
        )
        .filter((chip: any) => chip?.icon !== undefined || chip.chip?.icon !== undefined);

      if (chips.length > 0) {
        badges.push({
          type: "custom:mushroom-chips-card",
          chips,
          alignment: "end",
        });
      }
    }

    // 3. Refresh chip (centered)
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
