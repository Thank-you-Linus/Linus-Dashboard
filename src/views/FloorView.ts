import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { generic } from "../types/strategy/generic";
import StrategyFloor = generic.StrategyFloor;
import { AREA_EXPOSED_CHIPS } from "../variables";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { AreaStateChip } from "../chips/AreaStateChip";
import { createChipsFromList, processEntitiesForAreaOrFloorView } from "../utils";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Floor View Class.
 *
 * Used to create a Floor view.
 *
 * @class FloorView
 */
class FloorView {
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
   * @type {StrategyFloor}
   * @private
   */
  floor: StrategyFloor;

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(floor: StrategyFloor, options: views.ViewConfig = {}) {
    this.floor = floor;
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
      return [];
    }

    const chips: LovelaceChipConfig[] = [];

    const areas = this.floor.areas_slug.map(area_slug => Helper.areas[area_slug]);

    const motion = Helper.getAreaEntities(areas, "binary_sensor", "motion")
    const occupancy = Helper.getAreaEntities(areas, "binary_sensor", "occupancy")
    const presence = Helper.getAreaEntities(areas, "binary_sensor", "presence")
    if (motion.length > 0 || occupancy.length > 0 || presence.length > 0) {
      chips.push(new AreaStateChip({ floor: this.floor, motion, occupancy, presence, showContent: true }).getChip());
    }

    const areaChips = await createChipsFromList(AREA_EXPOSED_CHIPS, { show_content: true }, this.floor.floor_id, this.floor.areas_slug);
    if (areaChips) {
      chips.push(...areaChips);
    }

    return chips.map(chip => ({
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
    return processEntitiesForAreaOrFloorView({ floor: this.floor });
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

export { FloorView };
