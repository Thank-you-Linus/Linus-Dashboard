import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { RefreshChip } from "../chips/RefreshChip";
import { AggregateChip } from "../chips/AggregateChip";
import { DEVICE_CLASSES } from "../variables";

import { AbstractView } from "./AbstractView";

/**
 * Configuration for StandardDomainView
 */
export interface StandardDomainViewConfig {
  /** Domain to create view for (e.g., "light", "climate", "cover") */
  domain: string;
  /** Icon for the view (e.g., "mdi:lightbulb-group") */
  icon: string;
  /** Optional custom view configuration */
  viewOptions?: views.ViewConfig;
}

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Standard Domain View Class.
 *
 * Generic view class for standard domains (light, climate, cover, fan, switch, etc.).
 * Replaces 14 nearly-identical domain-specific view classes with a single configurable class.
 *
 * This class provides:
 * - Automatic badge creation with AggregateChip (global scope control)
 * - Automatic refresh chip
 * - Automatic section cards via AbstractView.createSectionCards()
 *
 * @class StandardDomainView
 * @extends AbstractView
 */
class StandardDomainView extends AbstractView {
  /**
   * Domain of the view's entities.
   */
  private readonly domain: string;

  /**
   * Default configuration of the view.
   */
  #defaultConfig: views.ViewConfig;

  /**
   * Class constructor.
   *
   * @param {StandardDomainViewConfig} config Configuration for the view
   */
  constructor(config: StandardDomainViewConfig) {
    super(config.domain);

    this.domain = config.domain;

    this.#defaultConfig = {
      icon: config.icon,
      subview: false,
    };

    this.config = Object.assign(this.config, this.#defaultConfig, config.viewOptions);

    // Empty viewControllerCard - global chips moved to badges
    this.viewControllerCard = [];
  }

  /**
   * Create the badges zone for this view.
   *
   * For domains with device_class support (cover, binary_sensor, sensor):
   * - Creates one badge containing all chips (generic + device_class-specific + refresh)
   *
   * For domains without device_class (light, climate, etc.):
   * - Creates one badge containing global chip + refresh chip
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>}
   * @override
   */
  override async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    console.log(`[StandardDomainView DEBUG] ========== createSectionBadges() called for domain: ${this.domain} ==========`);
    const chips: any[] = [];
    const deviceClasses = DEVICE_CLASSES[this.domain as keyof typeof DEVICE_CLASSES];
    console.log(`[StandardDomainView DEBUG] Device classes for ${this.domain}:`, deviceClasses);

    if (deviceClasses?.length > 0) {
      // Domain with device_class support (cover, binary_sensor, sensor)

      // Generic chip for entities without device_class
      const genericChip = new AggregateChip({
        domain: this.domain,
        scope: "global",
        scopeName: Helper.localize(`component.linus_dashboard.entity.text.aggregate_popup.state.title_${this.domain}`),
        show_content: true,
      });
      const genericChipResult = genericChip.getChip();
      console.log("[StandardDomainView DEBUG] Generic chip result:", genericChipResult);
      console.log("[StandardDomainView DEBUG] Has type?", genericChipResult?.type);
      console.log("[StandardDomainView DEBUG] Has icon?", (genericChipResult as any)?.icon);
      if (genericChipResult) chips.push(genericChipResult);

      // One chip per device_class
      for (const deviceClass of deviceClasses) {
        const chip = new AggregateChip({
          domain: this.domain,
          device_class: deviceClass,
          scope: "global",
          scopeName: Helper.localize(`component.linus_dashboard.entity.text.aggregate_popup.state.title_${this.domain}`),
          show_content: true,
        }).getChip();

        console.log(`[StandardDomainView DEBUG] Chip for ${this.domain}:${deviceClass}:`, chip);
        console.log(`[StandardDomainView DEBUG] Has type?`, chip?.type, "Has icon?", (chip as any)?.icon);
        if (chip) chips.push(chip);
      }
    } else {
      // Domain without device_class (light, climate, fan, etc.)
      const chip = new AggregateChip({
        domain: this.domain,
        scope: "global",
        scopeName: Helper.localize(`component.linus_dashboard.entity.text.aggregate_popup.state.title_${this.domain}`),
        show_content: true,
      }).getChip();

      if (chip) chips.push(chip);
    }

    // Refresh chip (always present)
    chips.push(new RefreshChip().getChip());

    console.log("[StandardDomainView DEBUG] Total chips collected:", chips.length);
    console.log("[StandardDomainView DEBUG] Chips details:", chips.map(c => ({ type: c?.type, icon: (c as any)?.icon })));

    // Return ONE badge containing ALL chips
    const validChips = chips.filter(chip => chip?.type && (chip as any)?.icon);
    console.log("[StandardDomainView DEBUG] Valid chips after filter:", validChips.length);
    console.log("[StandardDomainView DEBUG] Invalid chips filtered out:", chips.length - validChips.length);

    return validChips.length > 0
      ? [{
          type: "custom:mushroom-chips-card",
          alignment: "center",
          chips: validChips,
        }]
      : [];
  }
}

export { StandardDomainView };
