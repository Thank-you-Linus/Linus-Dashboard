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
import { UNAVAILABLE } from "../variables";

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

class HomeAreaCard extends AbstractCard {
  constructor(options: cards.HomeAreaCardOptions) {

    const magicAreasEntity: EntityRegistryEntry = getMAEntity(options.area_id, "area_state") as EntityRegistryEntry;

    const area = Helper.areas[options.area_id];

    super(magicAreasEntity);
    const defaultConfig = options?.area_id === "undisclosed" ? this.getUndisclosedAreaConfig(area) : this.getDefaultConfig(area);
    this.config = { ...this.config, ...defaultConfig, ...options };
  }

  getDefaultConfig(area: StrategyArea): TemplateCardConfig {

    const device = Helper.magicAreasDevices[area.slug];

    const { area_state, all_lights, aggregate_temperature, aggregate_battery, aggregate_health, aggregate_window, aggregate_door, aggregate_cover, aggregate_climate, light_control } = device?.entities || {};
    const icon = area.icon || "mdi:home-outline";

    const cards = [
      this.getMainCard(area, icon, aggregate_temperature, aggregate_battery, area_state),
    ];

    if (device) {
      cards.push(this.getChipsCard(area, device, area_state, aggregate_health, aggregate_window, aggregate_door, aggregate_cover, aggregate_climate, all_lights, light_control))
    }

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

  getMainCard(area: StrategyArea, icon: string, aggregate_temperature: EntityRegistryEntry, aggregate_battery: EntityRegistryEntry, area_state: EntityRegistryEntry): any {
    return {
      type: "custom:mushroom-template-card",
      primary: getAreaName(area),
      secondary: aggregate_temperature && this.getTemperatureTemplate(aggregate_temperature),
      icon: icon,
      icon_color: this.getIconColorTemplate(area_state),
      fill_container: true,
      layout: "horizontal",
      badge_icon: getBadgeIcon(aggregate_battery?.entity_id),
      badge_color: getBadgeColor(aggregate_battery?.entity_id),
      tap_action: { action: "navigate", navigation_path: slugify(area.name) },
      card_mod: { style: this.getCardModStyle() }
    };
  }

  getChipsCard(area: StrategyArea, device: MagicAreaRegistryEntry, area_state: EntityRegistryEntry, aggregate_health: EntityRegistryEntry, aggregate_window: EntityRegistryEntry, aggregate_door: EntityRegistryEntry, aggregate_cover: EntityRegistryEntry, aggregate_climate: EntityRegistryEntry, all_lights: EntityRegistryEntry, light_control: EntityRegistryEntry): any {
    return {
      type: "custom:mushroom-chips-card",
      alignment: "end",
      chips: [
        new ConditionalChip({
          conditions: [{ entity: area_state?.entity_id, state_not: UNAVAILABLE }],
          chip: new AreaStateChip(device).getChip()
        }).getChip(),
        new ConditionalChip({
          conditions: [{ entity: aggregate_health?.entity_id, state_not: "on" }],
          chip: new AggregateChip({ device_class: "health" }).getChip()
        }).getChip(),
        new ConditionalChip({
          conditions: [{ entity: aggregate_window?.entity_id, state_not: "on" }],
          chip: new AggregateChip({ device_class: "window" }).getChip()
        }).getChip(),
        new ConditionalChip({
          conditions: [{ entity: aggregate_door?.entity_id, state_not: "on" }],
          chip: new AggregateChip({ device_class: "door" }).getChip()
        }).getChip(),
        new ConditionalChip({
          conditions: [{ entity: aggregate_cover?.entity_id, state_not: "on" }],
          chip: new AggregateChip({ device_class: "cover" }).getChip()
        }).getChip(),
        new ConditionalChip({
          conditions: [{ entity: aggregate_climate?.entity_id, state_not: UNAVAILABLE }],
          chip: new ClimateChip().getChip()
        }).getChip(),
        new ConditionalChip({
          conditions: [{ entity: all_lights?.entity_id, state_not: UNAVAILABLE, }],
          chip: new LightChip({ area_id: area.slug, tap_action: { action: "toggle" } }).getChip()
        }).getChip(),
        new ConditionalChip({
          conditions: [{ entity: all_lights?.entity_id, state_not: UNAVAILABLE }],
          chip: new ControlChip("light", light_control?.entity_id).getChip()
        }).getChip()
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
    return `
      {{ "indigo" if "dark" in state_attr('${area_state?.entity_id}', 'states') else "amber" }}
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
}

export { HomeAreaCard };
