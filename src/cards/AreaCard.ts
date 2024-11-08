import { AbstractCard } from "./AbstractCard";
import { cards } from "../types/strategy/cards";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { Helper } from "../Helper";
import { LightControlChip } from "../chips/LightControlChip";
import { LinusLightChip } from "../chips/LinusLightChip";
import { LinusClimateChip } from "../chips/LinusClimateChip";
import { LinusAggregateChip } from "../chips/LinusAggregateChip";
import { AreaStateChip } from "../chips/AreaStateChip";
import { MagicAreaRegistryEntry } from "../types/homeassistant/data/device_registry";
import { generic } from "../types/strategy/generic";
import StrategyArea = generic.StrategyArea;
import { slugify } from "../utils";

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

class AreaCard extends AbstractCard {
  constructor(area: StrategyArea, options: cards.TemplateCardOptions = {}) {
    super(area);
    const device = Helper.magicAreasDevices[area.slug];
    const defaultConfig = this.getDefaultConfig(area, device);
    this.config = { ...this.config, ...defaultConfig, ...options };
  }

  getDefaultConfig(area: StrategyArea, device: MagicAreaRegistryEntry): TemplateCardConfig {
    if (area.area_id === "undisclosed") {
      return this.getUndisclosedAreaConfig(area);
    }

    const { area_state, all_lights, aggregate_temperature, aggregate_battery, aggregate_health, aggregate_window, aggregate_door, aggregate_cover, aggregate_climate, light_control } = device?.entities || {};
    const icon = area.icon || "mdi:home-outline";

    return {
      type: "vertical-stack",
      cards: [
        this.getMainCard(area, icon, aggregate_temperature, aggregate_battery, area_state),
        this.getChipsCard(area, device, area_state, aggregate_health, aggregate_window, aggregate_door, aggregate_cover, aggregate_climate, all_lights, light_control),
        this.getLightCard(all_lights)
      ]
    };
  }

  getUndisclosedAreaConfig(area: StrategyArea): TemplateCardConfig {
    return {
      type: "custom:mushroom-template-card",
      primary: area.name,
      icon: "mdi:devices",
      icon_color: "grey",
      fill_container: true,
      layout: "horizontal",
      tap_action: { action: "navigate", navigation_path: area.slug },
      card_mod: { style: this.getCardModStyle() }
    };
  }

  getMainCard(area: StrategyArea, icon: string, aggregate_temperature: any, aggregate_battery: any, area_state: any): any {
    console.log('area ', area)
    return {
      type: "custom:mushroom-template-card",
      primary: area.name,
      secondary: this.getTemperatureTemplate(aggregate_temperature),
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

  getChipsCard(area: StrategyArea, device: MagicAreaRegistryEntry, area_state: any, aggregate_health: any, aggregate_window: any, aggregate_door: any, aggregate_cover: any, aggregate_climate: any, all_lights: any, light_control: any): any {
    return {
      type: "custom:mushroom-chips-card",
      alignment: "end",
      chips: [
        this.getConditionalChip(area_state?.entity_id, "unavailable", new AreaStateChip(device).getChip()),
        this.getConditionalChip(aggregate_health?.entity_id, "on", new LinusAggregateChip(device, "health").getChip()),
        this.getConditionalChip(aggregate_window?.entity_id, "on", new LinusAggregateChip(device, "window").getChip()),
        this.getConditionalChip(aggregate_door?.entity_id, "on", new LinusAggregateChip(device, "door").getChip()),
        this.getConditionalChip(aggregate_cover?.entity_id, "on", new LinusAggregateChip(device, "cover").getChip()),
        this.getConditionalChip(aggregate_climate?.entity_id, "unavailable", new LinusClimateChip(device).getChip()),
        this.getConditionalChip(all_lights?.entity_id, "unavailable", new LinusLightChip(device, area.slug).getChip()),
        this.getConditionalChip(all_lights?.entity_id, "unavailable", new LightControlChip(light_control?.entity_id).getChip())
      ].filter(Boolean),
      card_mod: { style: this.getChipsCardModStyle() }
    };
  }

  getLightCard(all_lights: any): any {
    return {
      type: "custom:mushroom-light-card",
      entity: all_lights?.entity_id,
      show_brightness_control: true,
      icon_type: "none",
      primary_info: "none",
      secondary_info: "none",
      use_light_color: true,
      card_mod: { style: this.getLightCardModStyle() }
    };
  }

  getTemperatureTemplate(aggregate_temperature: any): string {
    if (!aggregate_temperature) return Helper.getAverageStateTemplate("temperature");
    return `
      {% set t = states('${aggregate_temperature?.entity_id}') %}
      {% if t != 'unknown' and t != 'unavailable' %}
        {{ t | float | round(1) }}{{ state_attr('${aggregate_temperature?.entity_id}', 'unit_of_measurement')}}
      {% endif %}
    `;
  }

  getIconColorTemplate(area_state: any): string {
    return `
      {{ "indigo" if "dark" in state_attr('${area_state?.entity_id}', 'states') else "amber" }}
    `;
  }

  getConditionalChip(entityId: string, state: string, chip: any): any {
    return entityId && {
      type: "conditional",
      conditions: [{ entity: entityId, state_not: state }],
      chip: chip
    };
  }

  getCardModStyle(): string {
    return `
      :host {
        background: #1f1f1f;
        height: 66px;
      }
      mushroom-badge-icon {
        left: 178px;
        top: 17px;
      }
      ha-card {
        box-shadow: none!important;
        border: none;
      }
      ha-state-icon {
        --icon-symbol-size: 30px;
      }

    `;
  }

  getChipsCardModStyle(): string {
    return `
      ha-card {
        --chip-box-shadow: none;
        --chip-spacing: 0px;
        width: -webkit-fill-available;
      }
    `;
  }

  getLightCardModStyle(): string {
    return `
      ha-card {
        box-shadow: none!important;
        border: none;
      }

      #TODO: Fix this
      mushroom-light-brightness-control$:
        mushroom-slider$: |
          .slider {
            width: 16px !important;
            height: 16px !important;
          }
      mushroom-light-color-control$:
        mushroom-slider$: |
          .slider {
            width: 16px !important;
            height: 16px !important;
          }
      mushroom-light-color-temp-control$:
        mushroom-slider$: |
          .slider {
            width: 16px !important;
            height: 16px !important;
          }
      .: |
        mushroom-light-brightness-control {
          height: 16px;
        }
        mushroom-light-color-control {
          height: 16px;
        }
        mushroom-light-color-temp-control {
          height: 16px;
        }
      }


    `;
  }
}

export { AreaCard };
