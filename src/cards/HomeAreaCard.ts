import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { Helper } from "../Helper";
import { ControlChip } from "../chips/ControlChip";
import { AggregateChip } from "../chips/AggregateChip";
import { AreaStateChip } from "../chips/AreaStateChip";
import { generic } from "../types/strategy/generic";
import StrategyArea = generic.StrategyArea;
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { getAreaName, getMAEntity, slugify } from "../utils";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { ClimateChip } from "../chips/ClimateChip";
import { LightChip } from "../chips/LightChip";
import { ConditionalChip } from "../chips/ConditionalChip";
import { UNAVAILABLE, UNDISCLOSED } from "../variables";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";

// Utility function to generate badge icon and color
const getBadgeIcon = (entityId: string) => `
  {% set bl = states('${entityId}') %}
  {% if bl == 'unknown' or bl == 'unavailable' %}
  {% elif bl | int() < 10 %} mdi:battery-outline
  {% elif bl | int() < 20 %} mdi:battery-10
  {% elif bl | int() < 30 %} mdi:battery-20
  {% elif bl | int() < 40 %} mdi:battery-30
  {% elif bl | int() < 50 %} mdi:battery-40
  {% elif bl | int() < 60 %} mdi:battery-50
  {% elif bl | int() < 70 %} mdi:battery-60
  {% elif bl | int() < 80 %} mdi:battery-70
  {% elif bl | int() < 90 %} mdi:battery-80
  {% elif bl | int() < 100 %} mdi:battery-90
  {% elif bl | int() == 100 %} mdi:battery
  {% else %} mdi:battery-unknown
  {% endif %}
`;

const getBadgeColor = (entityId: string) => `
  {% set bl = states('${entityId}') %}
  {% if bl == 'unknown' or bl == 'unavailable' %} disabled
  {% elif bl | int() < 10 %} red
  {% elif bl | int() < 20 %} red
  {% elif bl | int() < 30 %} red
  {% elif bl | int() < 40 %} orange
  {% elif bl | int() < 50 %} orange
  {% elif bl | int() < 60 %} green
  {% elif bl | int() < 70 %} green
  {% elif bl | int() < 80 %} green
  {% elif bl | int() < 90 %} green
  {% elif bl | int() == 100 %} green
  {% else %} disabled
  {% endif %}
`;

class HomeAreaCard {
  /**
   * Magic area device to create the card for.
   *
   * @type {MagicAreaRegistryEntry}
   */
  magicDevice: MagicAreaRegistryEntry

  /**
   * Default configuration of the view.
   *
   * @type {StrategyArea}
   * @private
   */
  area: StrategyArea

  /**
   * Configuration of the card.
   *
   * @type {EntityCardConfig}
   */
  config: EntityCardConfig = {
    type: "custom:mushroom-entity-card",
    icon: "mdi:help-circle",
  };

  constructor(options: cards.HomeAreaCardOptions) {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }

    this.magicDevice = Helper.magicAreasDevices[options.area_slug];
    this.area = Helper.areas[options.area_slug];

    this.config = { ...this.config, ...options };
  }

  getDefaultConfig(area: StrategyArea): TemplateCardConfig {

    const { all_lights } = this.magicDevice?.entities || {};
    const icon = area.icon || "mdi:home-outline";

    const cards = [
      this.getMainCard(),
    ];

    cards.push(this.getChipsCard());

    if (all_lights) {
      cards.push(this.getLightCard(all_lights));
    }

    return {
      type: "custom:stack-in-card",
      cards: cards
    };
  }

  getUndisclosedAreaConfig(area: StrategyArea): TemplateCardConfig {
    return {
      type: "custom:mushroom-template-card",
      primary: getAreaName(area),
      icon: "mdi:devices",
      icon_color: "grey",
      fill_container: true,
      layout: "horizontal",
      tap_action: { action: "navigate", navigation_path: area.slug },
      card_mod: { style: this.getCardModStyle() }
    };
  }

  getMainCard(): any {

    const { area_state, aggregate_temperature, aggregate_battery } = this.magicDevice?.entities || {};
    const icon = this.area.icon || "mdi:home-outline";

    return {
      type: "custom:mushroom-template-card",
      primary: getAreaName(this.area),
      secondary: aggregate_temperature && this.getTemperatureTemplate(aggregate_temperature),
      icon: icon,
      icon_color: this.getIconColorTemplate(area_state),
      fill_container: true,
      layout: "horizontal",
      badge_icon: getBadgeIcon(aggregate_battery?.entity_id),
      badge_color: getBadgeColor(aggregate_battery?.entity_id),
      tap_action: { action: "navigate", navigation_path: this.area.slug },
      card_mod: { style: this.getCardModStyle() }
    };
  }

  getChipsCard(): any {

    const { light_control, aggregate_health, aggregate_window, aggregate_door, aggregate_cover } = this.magicDevice?.entities || {};
    const { motion, occupancy, presence, window, climate, door, cover, health, light } = this.area.domains ?? {};

    return {
      type: "custom:mushroom-chips-card",
      alignment: "end",
      chips: [
        (motion || occupancy || presence) && new AreaStateChip({ area: this.area }).getChip(),
        health && new ConditionalChip(
          aggregate_health ? [{ entity: aggregate_health?.entity_id, state: "on" }] : health.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ device_class: "health" }).getChip()
        ).getChip(),
        window?.length && new ConditionalChip(
          aggregate_window ? [{ entity: aggregate_window?.entity_id, state: "on" }] : window.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "window", show_content: false }).getChip()
        ).getChip(),
        door && new ConditionalChip(
          aggregate_door ? [{ entity: aggregate_door?.entity_id, state: "on" }] : door.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "door", show_content: false }).getChip()
        ).getChip(),
        cover && new ConditionalChip(
          aggregate_cover ? [{ entity: aggregate_cover?.entity_id, state: "on" }] : cover.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "cover", show_content: false }).getChip()
        ).getChip(),
        climate && new ClimateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug }).getChip(),
        light && new LightChip({ area_slug: this.area.slug, magic_device_id: this.area.slug, tap_action: { action: "toggle" } }).getChip(),
        new ConditionalChip(
          [{ entity: this.magicDevice?.entities?.all_lights?.entity_id, state_not: UNAVAILABLE }],
          new ControlChip("light", light_control?.entity_id).getChip()
        ).getChip()
      ].filter(Boolean),
      card_mod: { style: this.getChipsCardModStyle() }
    };
  }

  getLightCard(all_lights: EntityRegistryEntry): any {
    return {
      type: "tile",
      features: [{ type: "light-brightness" }],
      hide_state: true,
      entity: all_lights.entity_id,
      card_mod: { style: this.getLightCardModStyle() }
    };
  }

  getTemperatureTemplate(aggregate_temperature: EntityRegistryEntry): string {
    if (!aggregate_temperature) return Helper.getAverageStateTemplate("temperature");
    return `
      {% set t = states('${aggregate_temperature?.entity_id}') %}
      {% if t != 'unknown' and t != 'unavailable' %}
        {{ t | float | round(1) }}{{ state_attr('${aggregate_temperature?.entity_id}', 'unit_of_measurement')}}
      {% endif %}
    `;
  }

  getIconColorTemplate(area_state: EntityRegistryEntry): string {
    const condition = area_state?.entity_id ? `"dark" in state_attr('${area_state?.entity_id}', 'states')` : `not is_state("sun.sun", "above_horizon")`;
    return `
      {{ "indigo" if ${condition} else "amber" }}
    `;
  }

  getCardModStyle(): string {
    return `
      :host {
        background: #1f1f1f;
        height: 66px;
      }
      mushroom-badge-icon {
        left: 24px;
        top: 0px;
      }
      ha-card {
        box-shadow: none!important;
        border: none;
      }
      ha-state-icon {
        --icon-symbol-size: 40px;
      }

    `;
  }

  getChipsCardModStyle(): string {
    return `
      ha-card {
        --chip-box-shadow: none;
        --chip-spacing: 0px;
        width: -webkit-fill-available;
        margin-top: -12px;
      }
    `;
  }

  getLightCardModStyle(): string {
    return `
      ha-card {
        box-shadow: none!important;
        border: none;
        margin-top: -12px;
      }
      ha-tile-icon {
        display: none;
      }
      ha-tile-info {
        display: none;
      }
    `;
  }

  /**
   * Get a card.
   *
   * @return {cards.AbstractCardConfig} A card object.
   */
  getCard(): cards.AbstractCardConfig {
    const defaultConfig = this.area.slug === UNDISCLOSED ? this.getUndisclosedAreaConfig(this.area) : this.getDefaultConfig(this.area);
    const magicAreasEntity: EntityRegistryEntry = getMAEntity(this.magicDevice?.id, "area_state") as EntityRegistryEntry;

    return {
      ...defaultConfig,
      entity: magicAreasEntity ? magicAreasEntity.entity_id : undefined,
    };
  }
}

export { HomeAreaCard };
