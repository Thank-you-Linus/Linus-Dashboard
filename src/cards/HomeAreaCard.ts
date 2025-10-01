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
import { FanChip } from "../chips/FanChip";
import { TemplateChipConfig } from "@/types/lovelace-mushroom/utils/lovelace/chip/types";

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

    this.magicDevice = Helper.magicAreasDevices[options.area_slug]!;
    this.area = Helper.areas[options.area_slug]!;

    this.config = { ...this.config, ...options };
  }

  getDefaultConfig(area: StrategyArea): TemplateCardConfig {

    const { all_lights } = this.magicDevice?.entities || {};

    const cards = [
      this.getMainCard(),
    ];

    cards.push(this.getChipsCard());

    if (all_lights && Helper.getEntityState(all_lights.entity_id).state !== UNAVAILABLE) {
      cards.push(this.getLightCard(all_lights));
    }

    return {
      type: "custom:stack-in-card",
      cards: cards,
      grid_options: {
        columns: 6,
      },

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
      card_mod: { style: this.getCardModStyle() },
      grid_options: {
        columns: 6,
        rows: 1.5,
      },
    };
  }

  getMainCard(): any {

    const { area_state } = this.magicDevice?.entities || {};
    const icon = this.area.icon || "mdi:home-outline";

    // const hasBattery = this.area.domains?.['sensor:battery'] && this.area.domains['sensor:battery'].length > 0;
    // const badge_icon = hasBattery && Helper.getIcon("sensor", "battery", Helper.getEntityIds({ domain: "sensor", device_class: "battery", area_slug: this.area.slug }))
    // const badge_color = Helper.getIconColor('sensor', "battery", Helper.getEntityIds({ domain: "sensor", device_class: "battery", area_slug: this.area.slug }))

    const areaState = new AreaStateChip({ area: this.area }).getChip() as TemplateChipConfig;
    const badge_icon = areaState?.icon
    const badge_color = areaState?.icon_color

    const secondarySensors = `${Helper.getSensorStateTemplate("temperature", this.area.slug)} ${Helper.getSensorStateTemplate("humidity", this.area.slug)}`


    return {
      type: "custom:mushroom-template-card",
      primary: getAreaName(this.area),
      secondary: secondarySensors,
      icon: icon,
      icon_color: this.getIconColorTemplate(area_state),
      fill_container: true,
      layout: "horizontal",
      badge_icon,
      badge_color,
      tap_action: { action: "navigate", navigation_path: this.area.slug },
      card_mod: { style: this.getCardModStyle() }
    };
  }

  getChipsCard(): any {

    const { light_control, aggregate_health, climate_group, aggregate_window, aggregate_door, aggregate_cover } = this.magicDevice?.entities || {};
    const { health } = this.area.domains ?? {};
    const magicLight = getMAEntity(this.magicDevice?.id, "light") as EntityRegistryEntry;
    const magicClimate = getMAEntity(this.magicDevice?.id, "climate") as EntityRegistryEntry;
    const magicFan = getMAEntity(this.magicDevice?.id, "fan") as EntityRegistryEntry;

    const motion = Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion", area_slug: this.area.slug });
    const occupancy = Helper.getEntityIds({ domain: "binary_sensor", device_class: "occupancy", area_slug: this.area.slug });
    const presence = Helper.getEntityIds({ domain: "binary_sensor", device_class: "presence", area_slug: this.area.slug });
    const climate = Helper.getEntityIds({ domain: "climate", area_slug: this.area.slug });
    const fan = Helper.getEntityIds({ domain: "fan", area_slug: this.area.slug });
    const door = Helper.getEntityIds({ domain: "binary_sensor", device_class: "door", area_slug: this.area.slug });
    const window = Helper.getEntityIds({ domain: "binary_sensor", device_class: "window", area_slug: this.area.slug });
    const cover = Helper.getEntityIds({ domain: "cover", area_slug: this.area.slug });
    const light = Helper.getEntityIds({ domain: "light", area_slug: this.area.slug });

    return {
      type: "custom:mushroom-chips-card",
      alignment: "end",
      chips: [
        (motion || occupancy || presence) && new AreaStateChip({ area: this.area }).getChip(),
        health?.length && new ConditionalChip(
          aggregate_health ? [{ entity: aggregate_health?.entity_id, state: "on" }] : health.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "health", device_class: "health" }).getChip()
        ).getChip(),
        window?.length && new ConditionalChip(
          aggregate_window ? [{ entity: aggregate_window?.entity_id, state: "on" }] : window.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "binary_sensor", device_class: "window", magic_device_id: this.area.slug, area_slug: this.area.slug, show_content: false }).getChip()
        ).getChip(),
        door?.length && new ConditionalChip(
          aggregate_door ? [{ entity: aggregate_door?.entity_id, state: "on" }] : door.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "binary_sensor", device_class: "door", magic_device_id: this.area.slug, area_slug: this.area.slug, show_content: false }).getChip()
        ).getChip(),
        cover?.length && new ConditionalChip(
          aggregate_cover ? [{ entity: aggregate_cover?.entity_id, state: "on" }] : cover.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "cover", magic_device_id: this.area.slug, area_slug: this.area.slug, device_class: "cover", show_content: false }).getChip()
        ).getChip(),
        climate?.length && new ConditionalChip(
          climate_group ? [{ entity: climate_group?.entity_id, state: "on" }] : cover.map(entity => ({ entity, state: "on" })),
          new ClimateChip({ magic_device_id: this.area.slug, area_slug: this.area.slug }, magicClimate,).getChip(),
        ).getChip(),
        fan?.length && new FanChip({ magic_device_id: this.area.slug, area_slug: this.area.slug }, magicFan).getChip(),
        light?.length && new LightChip({ area_slug: this.area.slug, magic_device_id: this.area.slug, tap_action: { action: "toggle" } }).getChip(),
        this.magicDevice?.entities?.all_lights?.entity_id && light_control?.entity_id && new ConditionalChip(
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

  getIconColorTemplate(area_state?: EntityRegistryEntry): string {
    const condition = area_state?.entity_id ? `"dark" in state_attr('${area_state?.entity_id}', 'states')` : `not is_state("sun.sun", "below_horizon")`;
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
