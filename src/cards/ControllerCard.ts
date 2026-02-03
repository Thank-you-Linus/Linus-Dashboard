import { cards } from "../types/strategy/cards";
import { LovelaceBadgeConfig, LovelaceCardConfig } from "../types/homeassistant/data/lovelace";
import { navigateTo } from "../utils";
import { DEVICE_CLASSES } from "../variables";
import { AggregateChip } from "../chips/AggregateChip";

/**
 * Controller Card class.
 *
 * Used for creating a Title Card with controls.
 *
 * @class
 */
class ControllerCard {

  /**
   * @type {string} The target to control the entities of.
   * @private
   */
  readonly #domain: string;

  /**
   * @type {string} The target to control the entities of.
   * @private
   */
  readonly #area_slug: string;

  /**
   * Default configuration of the card.
   *
   * @type {cards.ControllerCardConfig}
   * @private
   */
  readonly #defaultConfig: cards.ControllerCardConfig = {
    type: "custom:mushroom-title-card",
    showControls: true,
    iconOn: "mdi:power-on",
    iconOff: "mdi:power-off",
  };

  /**
   * Class constructor.
   *
   * @param {cards.ControllerCardOptions} options Controller Card options.
   */
  constructor(options: cards.ControllerCardOptions = {}, domain: string, area_slug = "global") {
    this.#domain = domain;
    this.#area_slug = area_slug;
    this.#defaultConfig = {
      ...this.#defaultConfig,
      ...options,
    };
  }

  /**
   * Create a Controller card.
   *
   * @return {LovelaceCardConfig[]} A Controller card.
   */
  createCard(): LovelaceCardConfig[] {
    const cards: LovelaceCardConfig[] = [];

    if (this.#defaultConfig.title) {
      cards.push({
        type: "heading",
        heading: this.#defaultConfig.title ?? "No title",
        icon: this.#defaultConfig.titleIcon,
        heading_style: "title",
        badges: [],
        ...(this.#defaultConfig.titleNavigate && {
          tap_action: navigateTo(this.#defaultConfig.titleNavigate)
        })
      })
    }

    if (this.#defaultConfig.subtitle) {
      cards.push({
        type: "heading",
        heading_style: "subtitle",
        heading: this.#defaultConfig.subtitle,
        icon: this.#defaultConfig.subtitleIcon,
        badges: [],
        ...(this.#defaultConfig.subtitleNavigate && {
          tap_action: this.#defaultConfig.tap_action ?? navigateTo(this.#defaultConfig.subtitleNavigate),
        })
      })
    }

    if (this.#defaultConfig.showControls || this.#defaultConfig.extraControls?.length) {

      const badges: LovelaceBadgeConfig[] = [];

      if (this.#defaultConfig.showControls) {
        // Always use AggregateChip when showControls is true
        const chipOptions = {
          show_content: true,
          magic_device_id: this.#area_slug,
          domain: this.#domain,
          ...this.#defaultConfig.controlChipOptions,
        };

        // Determine device classes to create chips for
        // If device_class is explicitly set in options, use only that one
        // Otherwise, check if domain supports device_class (has DEVICE_CLASSES entry)
        const domainDeviceClasses = DEVICE_CLASSES[this.#domain as keyof typeof DEVICE_CLASSES];
        const deviceClasses = chipOptions.device_class
          ? [chipOptions.device_class]
          : domainDeviceClasses?.length > 0
            ? [null, ...domainDeviceClasses]  // Generic + each device_class
            : [undefined]; // Create ONE chip for the entire domain

        // Collect all valid chips first
        const allChips: any[] = [];
        for (const device_class of deviceClasses) {
          const chip = new AggregateChip({ ...chipOptions, device_class }).getChip();

          // Only add chip if it's valid (has type and icon)
          const hasIcon = (chip as any)?.icon !== undefined && (chip as any)?.icon !== ''
            || (chip as any)?.chip?.icon !== undefined && (chip as any)?.chip?.icon !== '';

          if (chip && chip.type && hasIcon) {
            allChips.push(chip);
          }
        }

        // Create ONE badge containing ALL chips (like StandardDomainView does)
        if (allChips.length > 0) {
          badges.push({
            type: "custom:mushroom-chips-card",
            chips: allChips,  // ALL chips in ONE card
            alignment: "end",
            card_mod: {
              style: `
              ha-card {
                width: max-content;
                }
                `,
            }
          });
        }
      }

      if (typeof this.#defaultConfig.extraControls === 'function') {
        // Create a minimal device object for backward compatibility
        const deviceForExtraControls = { slug: this.#area_slug, entities: {} };
        badges.push(...this.#defaultConfig.extraControls(deviceForExtraControls)?.map((chip: any) => {
          return {
            type: "custom:mushroom-chips-card",
            chips: [chip]
          }
        }));
      }

      if (cards[0]?.badges && badges.length) {
        cards[0].badges = badges;
      }
    }

    return cards;
  }
}

export { ControllerCard };
