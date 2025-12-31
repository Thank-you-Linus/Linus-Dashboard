import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { DEVICE_CLASSES } from "../variables";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { RefreshChip } from "../chips/RefreshChip";
import { AggregateChip } from "../chips/AggregateChip";

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
   * Domain of the view's entities.
   *
   * @type {string}
   * @private
   */
  #domain: string;

  /**
   * Device class for chip generation.
   *
   * @type {string}
   * @private
   */
  #device_class?: string;

  /**
   * Class constructor.
   *
   * @param {views.AggregateViewOptions} [options={}] Options for the view.
   */
  constructor(options: views.AggregateViewOptions) {
    const domain = options?.device_class ? DEVICE_CLASSES.sensor.includes(options?.device_class) ? "sensor" : "binary_sensor" : options?.domain;
    super(domain, options?.device_class);

    // Save domain and device_class for createSectionBadges()
    this.#domain = domain;
    this.#device_class = options?.device_class;

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

    // 1. Scope navigation chips (global, floors, areas)
    const scopeChips = this.createScopeNavigationChips();
    if (scopeChips.length > 0) {
      badges.push({
        type: "custom:mushroom-chips-card",
        chips: scopeChips,
        alignment: "end",
      });
    }

    // 2. Control chips for all entities (global - if applicable)
    const shouldShowControls = this.#domain !== "sensor";

    if (shouldShowControls) {
      const chipModule = Helper.strategyOptions.domains[this.#domain]?.controlChip;
      if (chipModule && typeof chipModule === 'function') {
        const chipOptions = {
          show_content: true,
          magic_device_id: "global",
          area_slug: "global",
          domain: this.#domain,
          device_class: this.#device_class,
        };

        const magic_device = Helper.magicAreasDevices["global"];
        const deviceClasses = this.#device_class
          ? [this.#device_class]
          : DEVICE_CLASSES[this.#domain as keyof typeof DEVICE_CLASSES] ?? [];

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

  /**
   * Create aggregate chip showing the global average/sum for this device_class.
   *
   * This chip displays the aggregated value (average for temperature/humidity, sum for energy/power)
   * for all entities of this device_class across all areas.
   *
   * @private
   * @returns {any[]} Array containing the global aggregate chip
   */
  private createScopeNavigationChips(): any[] {
    const chips: any[] = [];

    // Global chip - shows aggregated value (average/sum) for all entities
    const globalChip = new AggregateChip({
      domain: this.#domain,
      device_class: this.#device_class,
      scope: "global",
      magic_device_id: "global",
      area_slug: "global",
      show_content: true, // IMPORTANT: Display the value (average/sum)
    });
    const globalConfig = globalChip.getChip();
    if (globalConfig) {
      chips.push(globalConfig);
    }

    return chips;
  }
}

export { AggregateView };
