import { cards } from "../types/strategy/cards";
import { LovelaceBadgeConfig, LovelaceCardConfig } from "../types/homeassistant/data/lovelace";
import { Helper } from "../Helper";
import { getMAEntity, navigateTo } from "../utils";

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
  readonly #magic_device_id: string;

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
    onService: "none",
    offService: "none",
  };

  /**
   * Class constructor.
   *
   * @param {cards.ControllerCardOptions} options Controller Card options.
   */
  constructor(options: cards.ControllerCardOptions = {}, domain: string, magic_device_id: string = "global") {
    this.#domain = domain;
    this.#magic_device_id = magic_device_id;
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
        layout_options: {
          grid_columns: "full",
          grid_rows: 1
        },
        ...(this.#defaultConfig.titleNavigate && {
          tap_action: navigateTo(this.#defaultConfig.titleNavigate)
        })
      })
    }

    if (this.#defaultConfig.subtitle) {
      cards.push({
        type: "heading",
        heading_style: "subtitle",
        badges: [],
        heading: this.#defaultConfig.subtitle,
        icon: this.#defaultConfig.subtitleIcon,
        layout_options: {
          grid_columns: "full",
          grid_rows: 1
        },
        ...(this.#defaultConfig.subtitleNavigate && {
          tap_action: this.#defaultConfig.tap_action ?? navigateTo(this.#defaultConfig.subtitleNavigate),
        })
      })
    }

    if (this.#defaultConfig.showControls || this.#defaultConfig.extraControls) {

      const magic_device = Helper.magicAreasDevices[this.#magic_device_id ?? ""]
      const badges: LovelaceBadgeConfig[] = [];

      if (this.#defaultConfig.showControls) {

        const chipModule = Helper.strategyOptions.domains[this.#domain]?.controlChip;
        const chipOptions = {
          show_content: true,
          magic_device_id: this.#magic_device_id,
          tap_action: { action: "more-info" },
          ...this.#defaultConfig.controlChipOptions,
        };
        const chip = typeof chipModule === 'function' && new chipModule(chipOptions).getChip();

        badges.push({
          type: "custom:mushroom-chips-card",
          chips: [chip],
          alignment: "end",
          card_mod: this.#domain === "sensor" && {
            style: `
            ha-card {
              min-width: 100px;
              }
              `,
          }
        });
      }

      if (magic_device && this.#defaultConfig.extraControls) {
        badges.push(...this.#defaultConfig.extraControls(magic_device)?.map((chip: any) => {
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
