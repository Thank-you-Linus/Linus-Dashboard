import { AggregateAreaListPopup } from "../popups/AggregateAreaListPopup";
import { AggregateListPopup } from "../popups/AggregateListPopup";
import { chips } from "../types/strategy/chips";
import { generic } from "../types/strategy/generic";
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { DEVICE_CLASSES, DOMAIN_ICONS, DOMAIN_STATE_ICONS, SENSOR_DOMAINS } from "../variables";
import { AbstractChip } from "./AbstractChip";
import { Helper } from "../Helper";
import { getMAEntity } from "../utils";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class AggregateChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {TemplateChipConfig | undefined}
   *
   */
  getDefaultConfig({ device_class, show_content = true, area_id }: chips.AggregateChipOptions) {

    const domain = DEVICE_CLASSES.sensor.includes(device_class) ? "sensor" : "binary_sensor"
    let icon = DOMAIN_ICONS[device_class as "motion"]
    let icon_color = ""
    let content = ""

    const device = Helper.magicAreasDevices[area_id ?? "global"]
    const magicEntity = device?.entities[`aggregate_${device_class}`]

    if (!magicEntity) return undefined

    if (domain === "binary_sensor") {
      content = Helper.getDeviceClassCountTemplate(domain, device_class, "ne", "off", area_id)

      icon_color = `{{ 'red' if expand(states.${magicEntity.entity_id}.attributes.sensors is defined and states.${magicEntity.entity_id}.attributes.sensors) | selectattr( 'state', 'eq', 'on') | list | count > 0 else 'grey' }}`
      content = show_content ? `{{ expand(states.${magicEntity.entity_id}.attributes.sensors is defined and states.${magicEntity.entity_id}.attributes.sensors) | selectattr( 'state', 'eq', 'on') | list | count }}` : ""
    }

    if (domain === "sensor") {
      content = Helper.getAverageStateTemplate("temperature", area_id)

      if (device_class === "battery") {
        icon_color = `{% set bl = states('${magicEntity.entity_id}') %}
        {% if bl == 'unknown' or bl == 'unavailable' %}
        {% elif bl | int() < 30 %} red
        {% elif bl | int() < 50 %} orange
        {% elif bl | int() <= 100 %} green
        {% else %} disabled{% endif %}`
        icon = `{% set bl = states('${magicEntity.entity_id}') %}
        {% if bl == 'unknown' or bl == 'unavailable' %}
        {% elif bl | int() < 10 %}mdi:battery-outline
        {% elif bl | int() < 20 %}  mdi:battery1
        {% elif bl | int() < 30 %}  mdi:battery-20
        {% elif bl | int() < 40 %}  mdi:battery-30
        {% elif bl | int() < 50 %}  mdi:battery-40
        {% elif bl | int() < 60 %}  mdi:battery-50
        {% elif bl | int() < 70 %}  mdi:battery-60
        {% elif bl | int() < 80 %}  mdi:battery-70
        {% elif bl | int() < 90 %}  mdi:battery-80
        {% elif bl | int() < 100 %}  mdi:battery-90
        {% elif bl | int() == 100 %}  mdi:battery
        {% else %}  mdi:battery{% endif %}`
        content = show_content ? `{{ states('${magicEntity.entity_id}') | int | round(1) }} %` : ""
      }
      if (device_class === "temperature") icon_color = `{% set bl = states('${magicEntity.entity_id}') | int() %} {% if bl < 20 %} blue
      {% elif bl < 30 %} orange
      {% elif bl >= 30 %} red{% else %} disabled{% endif %}`
      if (device_class === "illuminance") icon_color = `{{ 'blue' if 'dark' in state_attr('${device?.entities.area_state?.entity_id}', 'states') else 'amber' }}`

      content = show_content ? `{{ states.${magicEntity.entity_id}.state | float | round(1) }} {{ states.${magicEntity.entity_id}.attributes.unit_of_measurement }}` : ""
    }

    if (device_class === "cover") {
      icon_color = `{{ 'red' if is_state('${magicEntity.entity_id}', 'open') else 'grey' }}`
      content = show_content ? `{{ expand(states.${magicEntity.entity_id}.attributes.entity_id) | selectattr( 'state', 'eq', 'open') | list | count }}` : ""
    }

    if (device_class === "health") {
      icon_color = `{{ 'red' if is_state(entity, 'on') else 'green' }}`
    }

    const tap_action = area_id ? new AggregateAreaListPopup(magicEntity.entity_id, device_class).getPopup() : new AggregateListPopup(magicEntity.entity_id, device_class).getPopup()

    return {
      entity: magicEntity.entity_id,
      icon_color: icon_color,
      icon: icon,
      content: content,
      tap_action: tap_action
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.AggregateChipOptions} options The chip options.
   */
  constructor(options: chips.AggregateChipOptions) {
    super();

    const { device_class, show_content = true, area_id } = options

    const defaultConfig = this.getDefaultConfig({ device_class, show_content, area_id })

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { AggregateChip };
