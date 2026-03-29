import { cards } from "../types/strategy/cards";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { Helper } from "../Helper";
import { ControlChip } from "../chips/ControlChip";
import { AggregateChip } from "../chips/AggregateChip";
import { ActivityDetectionChip } from "../chips/ActivityDetectionChip";
import { generic } from "../types/strategy/generic";
import { getAreaName } from "../utils";
import { ConditionalChip } from "../chips/ConditionalChip";
import { UNAVAILABLE, UNDISCLOSED } from "../variables";
import { buildMediaActiveConditions } from "../utils/activityBadgeTemplates";
import { EntityCardConfig } from "../types/lovelace-mushroom/cards/entity-card-config";

import StrategyArea = generic.StrategyArea;

class HomeAreaCard {
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

    this.area = Helper.areas[options.area_slug]!;

    this.config = { ...this.config, ...options };
  }

  getDefaultConfig(): TemplateCardConfig {

    // Use EntityResolver to get all_lights entity (Linus Brain only)
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

    // Use EntityResolver for area state (Linus Brain only)
    const resolver = Helper.entityResolver;
    const areaStateResolution = resolver.resolveAreaState(this.area.slug);
    const area_state_entity = areaStateResolution.entity_id;
    const icon = this.area.icon || "mdi:home-outline";

    // Badge: Always show sensor icons based on active sensors (consistent behavior)
    const motion_entities = Helper.getEntityIds({
      domain: "binary_sensor",
      device_class: "motion",
      area_slug: this.area.slug
    });
    const occupancy_entities = Helper.getEntityIds({
      domain: "binary_sensor",
      device_class: "occupancy",
      area_slug: this.area.slug
    });
    const { isMediaActive } = buildMediaActiveConditions(this.area.slug);

    const isOn = '| selectattr("state","eq", "on") | list | count > 0';
    const isMotion = motion_entities.length > 0 ? `[${motion_entities.map(e => `states['${e}']`).join(', ')}] ${isOn}` : 'false';
    const isOccupancy = occupancy_entities.length > 0 ? `[${occupancy_entities.map(e => `states['${e}']`).join(', ')}] ${isOn}` : 'false';

    // Priority: motion > occupancy > media_player
    const badge_icon = `
      {% if ${isMotion} %}
        mdi:motion-sensor
      {% elif ${isOccupancy} %}
        mdi:home-account
      {% elif ${isMediaActive} %}
        mdi:play-circle
      {% else %}
        
      {% endif %}
    `;

    const badge_color = `
      {% if ${isMotion} or ${isOccupancy} %}
        red
      {% elif ${isMediaActive} %}
        blue
      {% else %}
        grey
      {% endif %}
    `;

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

    // Use EntityResolver for Linus Brain support
    const resolver = Helper.entityResolver;
    const lightControlResolution = resolver.resolveLightControlSwitch(this.area.slug);
    const light_control_entity = lightControlResolution.entity_id;
    const allLightsResolution = resolver.resolveAllLights(this.area.slug);
    const all_lights_entity = allLightsResolution.entity_id;

    const { health } = this.area.domains ?? {};

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
        // Show ActivityDetectionChip for all areas (will handle its own display logic)
        new ActivityDetectionChip({ area_slug: this.area.slug }).getChip(),
        health?.length && new ConditionalChip(
          health.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "health", device_class: "health" }).getChip()
        ).getChip(),
        window?.length && new ConditionalChip(
          window.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "binary_sensor", device_class: "window", area_slug: this.area.slug, show_content: false }).getChip()
        ).getChip(),
        door?.length && new ConditionalChip(
          door.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "binary_sensor", device_class: "door", area_slug: this.area.slug, show_content: false }).getChip()
        ).getChip(),
        cover?.length && new ConditionalChip(
          cover.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "cover", area_slug: this.area.slug, show_content: false }).getChip()
        ).getChip(),
        climate?.length && new ConditionalChip(
          climate.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "climate", area_slug: this.area.slug, show_content: false }).getChip(),
        ).getChip(),
        fan?.length && new ConditionalChip(
          fan.map(entity => ({ entity, state: "on" })),
          new AggregateChip({ domain: "fan", area_slug: this.area.slug, show_content: false }).getChip()
        ).getChip(),
        light?.length && new AggregateChip({ domain: "light", area_slug: this.area.slug, show_content: false }).getChip(),
        // Light control switch - supports Linus Brain
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
    // Fallback: use sun position (indigo when dark/night, amber when bright/day)
    return `
      {{ "indigo" if is_state("sun.sun", "below_horizon") else "amber" }}
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

    // Use EntityResolver to get area state entity (Linus Brain only)
    const resolver = Helper.entityResolver;
    const areaStateResolution = resolver.resolveAreaState(this.area.slug);
    const areaStateEntity = areaStateResolution.entity_id;

    return {
      ...defaultConfig,
      entity: areaStateEntity,
    };
  }
}

export { HomeAreaCard };
