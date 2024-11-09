import { cards } from "../types/strategy/cards";
import { LovelaceCardConfig } from "../types/homeassistant/data/lovelace";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { Helper } from "../Helper";

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
  constructor(target: HassServiceTarget, options: cards.ControllerCardOptions = {}) {
    this.#target = target;
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
        heading: this.#defaultConfig.title,
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
      const linusDevice = areaId ? Helper.magicAreasDevices[areaId] : undefined;

      cards[0].badges.push({
        type: "custom:mushroom-chips-card",
        alignment: "end",
        chips: [
          (this.#defaultConfig.showControls &&
            (this.#target.entity_id && typeof this.#target.entity_id === "string" ?
              {
                type: "template",
                entity: this.#target.entity_id,
                icon: `{{ '${this.#defaultConfig.iconOn}' if states(entity) == 'on' else '${this.#defaultConfig.iconOff}' }}`,
                icon_color: `{{ 'amber' if states(entity) == 'on' else 'red' }}`,
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
              })
          ),
          ...(this.#defaultConfig.extraControls && this.#target ? this.#defaultConfig.extraControls(linusDevice) : [])
        ],
      });
    }

    return cards;
  }
}

export { ControllerCard };
