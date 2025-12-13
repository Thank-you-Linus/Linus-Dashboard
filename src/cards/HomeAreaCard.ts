import { cards } from "../types/strategy/cards";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { Helper } from "../Helper";
import { ControlChip } from "../chips/ControlChip";
import { AggregateChip } from "../chips/AggregateChip";
import { AreaStateChip } from "../chips/AreaStateChip";
import { ActivityDetectionChip } from "../chips/ActivityDetectionChip";
import { generic } from "../types/strategy/generic";
import { getAreaName, getMAEntity } from "../utils";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";
import { ClimateChip } from "../chips/ClimateChip";
import { ConditionalChip } from "../chips/ConditionalChip";
import { UNAVAILABLE, UNDISCLOSED } from "../variables";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";
import { FanChip } from "../chips/FanChip";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ConditionalLightChip } from "../chips/ConditionalLightChip";

import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import StrategyArea = generic.StrategyArea;

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

  getDefaultConfig(): TemplateCardConfig {

    // Use EntityResolver to get all_lights entity (Linus Brain or Magic Areas)
    const resolver = Helper.entityResolver;
    const allLightsResolution = resolver.resolveAllLights(this.area.slug);
    const all_lights_entity = allLightsResolution.entity_id;

    const cards = [
      this.getMainCard(),
    ];

    const chipsCard = this.getChipsCard();
    if (chipsCard.chips.length > 0) {
      cards.push(chipsCard);
    }

    if (all_lights_entity && Helper.getEntityState(all_lights_entity).state !== UNAVAILABLE) {
      cards.push(this.getLightCard(all_lights_entity));
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

    // Use EntityResolver for area state (Linus Brain or Magic Areas)
    const resolver = Helper.entityResolver;
    const areaStateResolution = resolver.resolveAreaState(this.area.slug);
    const area_state_entity = areaStateResolution.entity_id;
    const isLinusBrain = areaStateResolution.source === "linus_brain";
    const icon = this.area.icon || "mdi:home-outline";

    // Badge: Use activity state for Linus Brain, or area state chip for Magic Areas
    let badge_icon: string | undefined;
    let badge_color: string | undefined;

    if (isLinusBrain && area_state_entity) {
      // Linus Brain: Show activity state in badge
      badge_icon = `
        {% set state = states('${area_state_entity}') %}
        {% if state == 'occupied' %}
          mdi:account
        {% elif state == 'movement' %}
          mdi:run
        {% elif state == 'inactive' %}
          mdi:account-clock
        {% else %}
          mdi:account-off
        {% endif %}
      `;
      badge_color = `
        {% set state = states('${area_state_entity}') %}
        {% if state == 'occupied' %}
          green
        {% elif state == 'movement' %}
          orange
        {% elif state == 'inactive' %}
          grey
        {% else %}
          grey
        {% endif %}
      `;
    } else {
      // Magic Areas: Use AreaStateChip for badge
      const areaState = new AreaStateChip({ area: this.area, showClearState: false }).getChip() as TemplateChipConfig;
      badge_icon = areaState?.icon;
      badge_color = areaState?.icon_color;
    }

    const secondarySensors = `${Helper.getSensorStateTemplate("temperature", this.area.slug)} ${Helper.getSensorStateTemplate("humidity", this.area.slug)}`


    return {
      type: "custom:mushroom-template-card",
      primary: getAreaName(this.area),
      secondary: secondarySensors,
      icon: icon,
      icon_color: this.getIconColorTemplate(area_state_entity),
      fill_container: true,
      layout: "horizontal",
      badge_icon,
      badge_color,
      tap_action: { action: "navigate", navigation_path: this.area.slug },
      card_mod: { style: this.getCardModStyle() }
    };
  }

  getChipsCard(): any {

    // Use EntityResolver for Linus Brain / Magic Areas hybrid support
    const resolver = Helper.entityResolver;
    const lightControlResolution = resolver.resolveLightControlSwitch(this.area.slug);
    const light_control_entity = lightControlResolution.entity_id;
    const allLightsResolution = resolver.resolveAllLights(this.area.slug);
    const all_lights_entity = allLightsResolution.entity_id;

    // Check if Linus Brain presence detection is available
    const presenceResolution = resolver.resolvePresenceSensor(this.area.slug);
    const hasLinusBrainPresence = presenceResolution.source === "linus_brain";

    // Keep other Magic Areas entities unchanged (aggregates, groups)
    const { aggregate_health, climate_group, aggregate_window, aggregate_door, aggregate_cover } = this.magicDevice?.entities || {};
    const { health } = this.area.domains ?? {};
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
        // Show only ONE chip for activity/area state:
        // - If Linus Brain presence is available: show ActivityDetectionChip
        // - Otherwise if there are presence sensors: show AreaStateChip (Magic Areas fallback)
        // - If neither, don't show anything
        (hasLinusBrainPresence || motion?.length || occupancy?.length || presence?.length) && (
          hasLinusBrainPresence
            ? new ActivityDetectionChip({ area_slug: this.area.slug }).getChip()
            : new AreaStateChip({ area: this.area }).getChip()
        ),
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
        // Two conditional light chips: one for ON state (turns off), one for OFF state (turns on)
        ...(light?.length ? new ConditionalLightChip({ area_slug: this.area.slug, magic_device_id: this.area.slug }).getChip() : []),
        // Light control switch - now supports Linus Brain or Magic Areas
        all_lights_entity && light_control_entity && new ConditionalChip(
          [{ entity: all_lights_entity, state_not: UNAVAILABLE }],
          new ControlChip("light", light_control_entity).getChip()
        ).getChip()
      ].filter(Boolean),
      card_mod: { style: this.getChipsCardModStyle() }
    };
  }

  getLightCard(all_lights_entity_id: string): any {
    return {
      type: "tile",
      features: [{ type: "light-brightness" }],
      hide_state: true,
      entity: all_lights_entity_id,
      card_mod: { style: this.getLightCardModStyle() }
    };
  }

  getIconColorTemplate(area_state_entity_id?: string | null): string {
    const condition = area_state_entity_id ? `"dark" in state_attr('${area_state_entity_id}', 'states')` : `not is_state("sun.sun", "below_horizon")`;
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
    const defaultConfig = this.area.slug === UNDISCLOSED ? this.getUndisclosedAreaConfig(this.area) : this.getDefaultConfig();

    // Use EntityResolver to get area state entity (Linus Brain or Magic Areas)
    const resolver = Helper.entityResolver;
    const areaStateResolution = resolver.resolveAreaState(this.area.slug);
    const areaStateEntity = areaStateResolution.entity_id ||
      (getMAEntity(this.magicDevice?.id, "area_state") as EntityRegistryEntry)?.entity_id;

    return {
      ...defaultConfig,
      entity: areaStateEntity,
    };
  }
}

export { HomeAreaCard };
