import { cards } from "../types/strategy/cards";
import { LovelaceBadgeConfig, LovelaceCardConfig } from "../types/homeassistant/data/lovelace";
import { Helper } from "../Helper";
import { generic } from "../types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { getMAEntity, navigateTo } from "../utils";
import { HassServiceTarget } from "home-assistant-js-websocket";

/**
 * Controller Card class.
 *
 * Used for creating a Title Card with controls.
 *
 * @class
 */
class ControllerCard {
  /**
   * @type {ExtendedHassServiceTarget} The target to control the entities of.
   * @private
   */
  readonly #target: HassServiceTarget;

  /**
   * @type {string} The target to control the entities of.
   * @private
   */
  readonly #domain?: string;

  /**
   * @type {string} The target to control the entities of.
   * @private
   */
  readonly #magic_entity_id?: string;

  /**
   * Default configuration of the card.
   *
   * @type {cards.ControllerCardConfig}
   * @private
   */
  readonly #defaultConfig: cards.ControllerCardConfig = {
    type: "custom:mushroom-title-card",
    showControls: false,
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
  constructor(target: HassServiceTarget, options: cards.ControllerCardOptions = {}, domain: string, magic_entity_id?: string) {
    this.#target = target;
    this.#domain = domain;
    this.#magic_entity_id = magic_entity_id;
    this.#defaultConfig = {
      ...this.#defaultConfig,
      ...Helper.strategyOptions.domains[domain],
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
          tap_action: navigateTo(this.#defaultConfig.subtitleNavigate),
        })
      })
    }

    if (this.#defaultConfig.showControls || this.#defaultConfig.extraControls) {

      const magic_device = Helper.magicAreasDevices[this.#magic_entity_id ?? ""]
      const magicAreasEntity = this.#magic_entity_id && this.#domain && getMAEntity(this.#magic_entity_id, this.#domain);

      const badges: LovelaceBadgeConfig[] = [];

      const icon = Helper.getFromDomainState({ domain: this.#domain!, ifReturn: this.#defaultConfig.iconOn, elseReturn: this.#defaultConfig.iconOff, area_slug: this.#target.area_id })
      const icon_color = Helper.getFromDomainState({ domain: this.#domain!, area_slug: this.#target.area_id })

      console.log('domain', this.#domain, this.#defaultConfig.showControls)

      if (this.#defaultConfig.showControls) {
        badges.push({
          type: "custom:mushroom-chips-card",
          chips: [
            {
              type: "template",
              entity: magicAreasEntity ? magicAreasEntity?.entity_id : this.#target.entity_id,
              icon,
              icon_color,
              tap_action: magicAreasEntity ? {
                action: "toggle"
              } : {
                action: "call-service",
                service: this.#defaultConfig.toggleService ?? this.#defaultConfig.offService,
                target: this.#target,
                data: {},
              },
              ...(magic_device ? {
                hold_action: {
                  action: "more-info"
                }
              } : {})
            }
          ]
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

    console.log('cards', cards)

    return cards;
  }
}

export { ControllerCard };
