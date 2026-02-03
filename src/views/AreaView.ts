import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { generic } from "../types/strategy/generic";
import { AREA_EXPOSED_CHIPS } from "../variables";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { createGlobalScopeChips, processEntitiesForAreaOrFloorView } from "../utils";
import { UnavailableChip } from "../chips/UnavailableChip";
import { RefreshChip } from "../chips/RefreshChip";
import { ChipFactory } from "../factories/ChipFactory";

import StrategyArea = generic.StrategyArea;

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Area View Class.
 *
 * Used to create a Area view.
 *
 * @class AreaView
 */
class AreaView {
  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  config: views.ViewConfig = {
    icon: "mdi:home-assistant",
    type: "sections",
    subview: true,
  };

  /**
   * Default configuration of the view.
   *
   * @type {StrategyArea}
   * @private
   */
  area: StrategyArea;

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(area: StrategyArea, options: views.ViewConfig = {}) {
    this.area = area;
    this.config = { ...this.config, ...options };
  }

  /**
   * Create the chips to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("chips")) {
      // Chips section is hidden.
      return [];
    }

    const chips: LovelaceChipConfig[] = [];

    // Check if Linus Brain is configured for this area
    const resolver = Helper.entityResolver;
    const activityResolution = resolver.resolveAreaState(this.area.slug);
    const hasLinusBrain = activityResolution.source === "linus_brain";

    // FIRST: Activity Detection chip (ALWAYS show, with or without Linus Brain)
    try {
      const activityDetectionChip = await ChipFactory.createChip("ActivityDetectionChip", { area_slug: this.area.slug });
      if (activityDetectionChip) {
        chips.push(activityDetectionChip);
      }
    } catch (e) {
      Helper.logError("An error occurred while creating the Activity Detection chip!", e);
    }

    // Domain aggregate chips with global scope (hierarchical popup display)
    const areaChips = createGlobalScopeChips(AREA_EXPOSED_CHIPS, {
      show_content: true
    });
    chips.push(...areaChips);

    const unavailableChip = new UnavailableChip({ area_slug: this.area.slug }).getChip();
    if (unavailableChip) chips.push(unavailableChip);

    // Refresh chip - allows manual refresh of registries
    const refreshChip = new RefreshChip();
    chips.push(refreshChip.getChip());

    // LinusBrain area-specific chip.
    try {
      if (hasLinusBrain) {
        const linusBrainPopupModule = await import("../popups/LinusBrainAreaPopup");
        const linusBrainPopup = new linusBrainPopupModule.LinusBrainAreaPopup(this.area.slug);
        
        chips.push({
          type: "template",
          icon: "mdi:brain",
          icon_color: "cyan",
          content: "Linus Brain",
          tap_action: linusBrainPopup.getPopup(),
        });
      }
    } catch (e) {
      Helper.logError("An error occurred while creating the Linus Brain area chip!", e);
    }

    // MagicAreas area-specific chip.
    try {
      // Check if Magic Areas is configured for this area
      const magicAreaDevice = Object.values(Helper.devices).find(
        device => device.manufacturer === "Magic Areas" && device.area_id === this.area.slug
      );
      
      if (magicAreaDevice) {
        chips.push({
          type: "template",
          icon: "mdi:magic-staff",
          icon_color: "amber",
          content: "Magic Areas",
          tap_action: {
            action: "navigate",
            navigation_path: `/config/devices/device/${magicAreaDevice.id}`
          },
        });
      }
    } catch (e) {
      Helper.logError("An error occurred while creating the Magic Areas area chip!", e);
    }

    return chips
      .filter(chip => chip && chip.type) // Filter out undefined or invalid chips
      .map(chip => ({
        type: "custom:mushroom-chips-card",
        alignment: "center",
        chips: [chip],
      }));
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
   * @override
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    return processEntitiesForAreaOrFloorView({ area: this.area });
  }

  /**
   * Get a view object.
   *
   * The view includes the cards which are created by method createSectionCards().
   *
   * @returns {Promise<LovelaceViewConfig>} The view object.
   */
  async getView(): Promise<LovelaceViewConfig> {

    return {
      ...this.config,
      badges: await this.createSectionBadges(),
      sections: await this.createSectionCards(),
    };
  }

}

export { AreaView };