import { AggregateAreaListPopup } from "../popups/AggregateAreaListPopup";
import { AggregateListPopup } from "../popups/AggregateListPopup";
import { MagicAreaRegistryEntry } from "../types/homeassistant/data/device_registry";
import { ConditionalChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { DOMAIN_ICONS } from "../variables";
import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class LinusAggregateChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig | undefined}
   *
   */
  getDefaultConfig(device: MagicAreaRegistryEntry, deviceClass: string, showContent: boolean, by_area: boolean = false): ConditionalChipConfig | undefined {

    const entity = device?.entities[`aggregate_${deviceClass}`]

    if (!entity?.entity_id) return undefined

    const domain = entity?.entity_id.split(".")[0]

    let icon = DOMAIN_ICONS[deviceClass as "motion"]
    let icon_color = ''
    let content = ''

    if (domain === "binary_sensor") {
      icon_color = `{{ 'red' if expand(states.${entity?.entity_id}.attributes.sensors is defined and states.${entity?.entity_id}.attributes.sensors) | selectattr( 'state', 'eq', 'on') | list | count > 0 else 'grey' }}`
      content = showContent ? `{{ expand(states.${entity?.entity_id}.attributes.sensors is defined and states.${entity?.entity_id}.attributes.sensors) | selectattr( 'state', 'eq', 'on') | list | count }}` : ""
    }

    if (domain === "sensor") {
      if (deviceClass === "battery") {
        icon_color = `{% set bl = states('${entity?.entity_id}') %}
        {% if bl == 'unknown' or bl == 'unavailable' %}
        {% elif bl | int() < 30 %} red
        {% elif bl | int() < 50 %} orange
        {% elif bl | int() <= 100 %} green
        {% else %} disabled{% endif %}`
        icon = `{% set bl = states('${entity?.entity_id}') %}
        {% if bl == 'unknown' or bl == 'unavailable' %}
        {% elif bl | int() < 10 %}mdi:battery-outline
        {% elif bl | int() < 20 %}  mdi:battery1
        {% elif bl | int() < 30 %}  mdi:battery-20
        {% elif bl | int() < 40 %}  mdi:battery-30
        {% elif bl | int() < 50 %}  mdi:battery-40
        {% elif bl | int() < 60 %}  mdi:battery-50
        {% elif bl | int() < 70 %}  mdi:battery-60
        {% elif bl | int() < 80 %}  mdi:battery-70
        {% elif bl | int() < 90 %}  mdi:battery-80
        {% elif bl | int() < 100 %}  mdi:battery-90
        {% elif bl | int() == 100 %}  mdi:battery
        {% else %}  mdi:battery{% endif %} `
        content = showContent ? `{{ states('${entity?.entity_id}') | int | round(1) }} %` : ""
      }
      if (deviceClass === "temperature") icon_color = `{% set bl = states('${entity?.entity_id}') | int() %} {% if bl < 20 %} blue
      {% elif bl < 30 %} orange
      {% elif bl >= 30 %} red{% else %} disabled{% endif %}`
      if (deviceClass === "illuminance") icon_color = `{{ 'blue' if 'dark' in state_attr('${device?.entities.area_state?.entity_id}', 'states') else 'amber' }}`

      content = showContent ? `{{ states.${entity?.entity_id}.state | float | round(1) }} {{ states.${entity?.entity_id}.attributes.unit_of_measurement }}` : ""
    }

    if (deviceClass === "cover") {
      icon_color = `{{ 'red' if is_state('${entity?.entity_id}', 'open') else 'grey' }}`
      content = showContent ? `{{ expand(states.${entity?.entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'open') | list | count }}` : ""
    }

    if (deviceClass === "health") {
      icon_color = `{{ 'red' if is_state(entity, 'on') else 'green' }}`
    }

    const tap_action = by_area ? new AggregateAreaListPopup(entity?.entity_id, deviceClass).getPopup() : new AggregateListPopup(entity?.entity_id, deviceClass).getPopup()

    return {
      type: "conditional",
      conditions: [
        {
          entity: entity?.entity_id ?? "",
          state_not: "unavailable"
        }
      ],
      chip: {
        type: "template",
        entity: entity?.entity_id,
        icon_color: icon_color,
        icon: icon,
        content: content,
        tap_action: tap_action
      },
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(device: MagicAreaRegistryEntry, deviceClass: string, showContent: boolean = false, by_area: boolean = false) {
    super();

    const defaultConfig = this.getDefaultConfig(device, deviceClass, showContent, by_area)

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { LinusAggregateChip };
