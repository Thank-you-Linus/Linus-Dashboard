import { cards } from "../types/strategy/cards";
import { LovelaceBadgeConfig, LovelaceCardConfig } from "../types/homeassistant/data/lovelace";
import { ExtendedHassServiceTarget } from "home-assistant-js-websocket";
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
   * @type {ExtendedHassServiceTarget} The target to control the entities of.
   * @private
   */
  readonly #target: ExtendedHassServiceTarget;

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
   * @param {ExtendedHassServiceTarget} target The target to control the entities of.
   * @param {cards.ControllerCardOptions} options Controller Card options.
   */
  constructor(target: ExtendedHassServiceTarget, options: cards.ControllerCardOptions = {}, domain: string) {
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
      const floor_areas_ids = this.#target.floor_id && Helper.floors[this.#target.floor_id[0]]?.areas_slug.map(area_slug => Helper.areas[area_slug].area_id);
      const areaId = this.#target.floor_id ?? Array.isArray(this.#target.area_id) ? this.#target.area_id?.[0] : this.#target.area_id;
      const area_slug = Helper.areas[areaId!]?.slug || "global";
      const magicAreasEntity = this.#domain && getMAEntity(area_slug, this.#domain);

      const badges: LovelaceBadgeConfig[] = [];

      const icon = Helper.getDomainColorFromState({ domain: this.#domain!, ifReturn: this.#defaultConfig.iconOn, elseReturn: this.#defaultConfig.iconOff, area_slug: area_slug })
      const icon_color = Helper.getDomainColorFromState({ domain: this.#domain!, area_slug: area_slug })

      console.log('areaId', areaId)
      console.log('area_slug', this.#domain, area_slug)
      console.log('icon', icon)
      console.log('icon_color', icon_color)
      console.log('magicAreasEntity', magicAreasEntity)

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
                target: this.#target.floor_id ? floor_areas_ids : this.#target,
                data: {},
              },
              ...(magicAreasEntity ? {
                hold_action: {
                  action: "more-info"
                }
              } : {})
            }
          ]
        });
      }

      if (magicAreasEntity && this.#defaultConfig.extraControls) {
        badges.push(...this.#defaultConfig.extraControls(Helper.magicAreasDevices[area_slug])?.map((chip: any) => {
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
