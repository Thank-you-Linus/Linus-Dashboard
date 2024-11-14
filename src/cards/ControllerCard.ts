import { cards } from "../types/strategy/cards";
import { LovelaceBadgeConfig, LovelaceCardConfig } from "../types/homeassistant/data/lovelace";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { Helper } from "../Helper";
import { getMAEntity } from "../utils";

/**
 * Controller Card class.
 *
 * Used for creating a Title Card with controls.
 *
 * @class
 */
class ControllerCard {
  /**
   * @type {HassServiceTarget} The target to control the entities of.
   * @private
   */
  readonly #target: HassServiceTarget;

  /**
   * @type {string} The target to control the entities of.
   * @private
   */
  readonly #domain?: string;

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
   * @param {HassServiceTarget} target The target to control the entities of.
   * @param {cards.ControllerCardOptions} options Controller Card options.
   */
  constructor(target: HassServiceTarget, options: cards.ControllerCardOptions = {}, domain?: string) {
    this.#target = target;
    this.#domain = domain;
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
        ...(this.#defaultConfig.navigate && {
          tap_action: {
            action: "navigate",
            navigation_path: this.#defaultConfig.navigate
          },
        })
      })
    }

    if (this.#defaultConfig.subtitle) {
      cards.push({
        type: "heading",
        heading: this.#defaultConfig.subtitle,
        icon: this.#defaultConfig.subtitleIcon,
        heading_style: "subtitle",
        badges: [],
        layout_options: {
          grid_columns: "full",
          grid_rows: 1
        },
        ...(this.#defaultConfig.navigate && {
          tap_action: {
            action: "navigate",
            navigation_path: this.#defaultConfig.navigate
          },
        })
      })
    }

    if (this.#defaultConfig.showControls || this.#defaultConfig.extraControls) {
      const areaId = Array.isArray(this.#target.area_id) ? this.#target.area_id[0] : this.#target.area_id;
      const areaSlug = Helper.areas[areaId!]?.slug;
      const linusDevice = areaSlug ? Helper.magicAreasDevices[areaSlug] : undefined;
      const magicAreasEntity = linusDevice && this.#domain && getMAEntity(linusDevice, this.#domain);

      const badges: LovelaceBadgeConfig[] = [];

      if (this.#defaultConfig.showControls) {
        badges.push({
          type: "custom:mushroom-chips-card",
          alignment: "end",
          chips: [magicAreasEntity ?
            {
              type: this.#domain === "light" ? "light" : "entity",
              entity: magicAreasEntity.entity_id,
              icon_color: "",
              content_info: "none",
              tap_action: {
                action: "toggle"
              },
              hold_action: {
                action: "more-info"
              }
            } :
            {
              type: "template",
              entity: this.#target.entity_id,
              icon: this.#defaultConfig.iconOff,
              tap_action: {
                action: "call-service",
                service: this.#defaultConfig.offService,
                target: this.#target,
                data: {},
              },
            }
          ]
        });
      }

      if (magicAreasEntity && this.#defaultConfig.extraControls) {
        badges.push(...this.#defaultConfig.extraControls(linusDevice)?.map((chip: any) => {
          return {
            type: "custom:mushroom-chips-card",
            alignment: "end",
            chips: [chip]
          }
        }));
      }

      if (badges.length) {
        cards[0].badges = badges;
      }
    }

    return cards;
  }
}

export { ControllerCard };
