import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig } from "../types/homeassistant/data/lovelace";
import { HassServiceTarget } from "home-assistant-js-websocket";
import { getAggregateEntity, getStateContent, groupBy } from "../utils";
import { Helper } from "../Helper";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";

interface AggregateCardConfig {
  title?: string;
  subtitle?: string;
  device_name?: string;
  device_class?: string | string[];
}

/**
 * Aggregate Card class.
 *
 * Used for creating a Title Card with controls.
 *
 * @class
 */
class AggregateCard {
  /**
   * @type {string} The domain to control the entities of.
   * @private
   */
  readonly #domain: string;

  /**
   * Default configuration of the card.
   *
   * @type {AggregateCardConfig}
   * @private
   */
  readonly #defaultConfig: AggregateCardConfig = {
    device_name: "Global",
  };

  /**
   * Class constructor.
   *
   * @param {string} domain The domain to control the entities of.
   * @param {AggregateCardConfig} options Aggregate Card options.
   */
  constructor(domain: string, options: AggregateCardConfig = {}) {
    this.#domain = domain;
    this.#defaultConfig = {
      ...this.#defaultConfig,
      ...options,
    };
  }

  /**
   * Create a Aggregate card.
   *
   * @return {StackCardConfig} A Aggregate card.
   */
  createCard(): StackCardConfig {

    const domains = typeof (this.#domain) === "string" ? [this.#domain] : this.#domain;
    const deviceClasses = this.#defaultConfig.device_class && typeof (this.#defaultConfig.device_class) === "string" ? [this.#defaultConfig.device_class] : this.#defaultConfig.device_class;

    const cards: LovelaceCardConfig[] = [];

    const globalEntities = getAggregateEntity(Helper.magicAreasDevices["global"], domains, deviceClasses)[0] ?? false

    if (globalEntities) {
      cards.push({
        type: "tile",
        entity: globalEntities.entity_id,
        state_content: getStateContent(globalEntities.entity_id),
        color: globalEntities.entity_id.startsWith('binary_sensor.') ? 'red' : false,
        icon_tap_action: this.#domain === "light" ? "more-info" : "toggle",
      });
    }

    const areasByFloor = groupBy(Helper.areas, (e) => e.floor_id ?? "undisclosed");

    for (const floor of [...Helper.floors, Helper.strategyOptions.floors.undisclosed]) {

      if (!(floor.floor_id in areasByFloor) || areasByFloor[floor.floor_id].length === 0) continue

      let floorCards: (TemplateCardConfig)[] = [];
      floorCards.push({
        type: "custom:mushroom-title-card",
        subtitle: floor.name,
        card_mod: {
          style: `
            ha-card.header {
              padding-top: 8px;
            }
          `,
        }
      });

      let areaCards: (TemplateCardConfig)[] = [];

      for (const [i, area] of areasByFloor[floor.floor_id].entries()) {

        if (Helper.strategyOptions.areas[area.slug]?.hidden) continue

        if (area.slug !== "undisclosed") {
          const areaEntities = getAggregateEntity(Helper.magicAreasDevices[area.slug], domains, deviceClasses).map(e => e.entity_id).filter(Boolean)

          for (const areaEntity of areaEntities) {
            areaCards.push({
              type: "tile",
              entity: areaEntity,
              primary: area.name,
              state_content: getStateContent(areaEntity),
              color: areaEntity.startsWith('binary_sensor.') ? 'red' : false,
            });
          }
        }

        // Horizontally group every two area cards if all cards are created.
        if (i === areasByFloor[floor.floor_id].length - 1) {
          for (let i = 0; i < areaCards.length; i += 2) {
            floorCards.push({
              type: "horizontal-stack",
              cards: areaCards.slice(i, i + 2),
            });
          }
        }

      }

      if (areaCards.length === 0) floorCards.pop()

      if (floorCards.length > 1) cards.push(...floorCards)

    }

    return {
      type: "vertical-stack",
      cards: cards,
    };
  }
}

export { AggregateCard };
