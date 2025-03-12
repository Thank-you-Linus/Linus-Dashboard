import { chips } from "../types/strategy/chips";
import { DEVICE_CLASSES } from "../variables";
import { AbstractChip } from "./AbstractChip";
import { Helper } from "../Helper";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";

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
  getDefaultConfig({ device_class, show_content = true, magic_device_id = "global", area_slug, tap_action }: chips.AggregateChipOptions) {

    const domain = DEVICE_CLASSES.sensor.includes(device_class) ? "sensor" : "binary_sensor"
    let icon = device_class !== "motion" ? Helper.icons[domain][device_class]?.default : Helper.icons[domain][device_class]?.state?.on
    let icon_color = ""
    let content = ""

    const device = Helper.magicAreasDevices[magic_device_id]
    const magicEntity = device?.entities[`aggregate_${device_class}`]

    if (domain === "binary_sensor") {
      content = show_content ? Helper.getCountTemplate({ domain, device_class, operator: "eq", value: "on", area_slug }) : ""
      icon_color = Helper.getBinarySensorColorFromState(device_class, "eq", "on", "red", "grey", area_slug)
    }

    if (domain === "sensor") {

      content = show_content ? Helper.getSensorStateTemplate(device_class, area_slug) : ""
      icon_color = Helper.getSensorColorFromState(device_class, area_slug!) ?? "white"
      icon = Helper.getSensorIconFromState(device_class, area_slug!) ?? icon

      if (device_class === "illuminance") {
        if (magicEntity) {
          icon_color = `{{ 'blue' if 'dark' in state_attr('${device?.entities.area_state?.entity_id}', 'states') else 'amber' }}`
        }
      }
    }

    if (device_class === "cover") {

      if (magicEntity) {
        icon_color = `{{ 'red' if is_state('${magicEntity.entity_id}', 'open') else 'grey' }}`
        content = show_content ? Helper.getCountTemplate({ domain: "cover", operator: "eq", value: "open", area_slug }) : ""
      }
    }

    if (device_class === "health") {
      icon_color = `{{ 'red' if is_state(entity, 'on') else 'green' }}`
    }

    return {
      entity: magicEntity?.entity_id,
      icon_color,
      icon,
      content: content,
      tap_action: tap_action ?? { action: "none" }
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.AggregateChipOptions} options The chip options.
   */
  constructor(options: chips.AggregateChipOptions, entity?: EntityRegistryEntry) {
    super();

    const defaultConfig = this.getDefaultConfig(options)

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { AggregateChip };
