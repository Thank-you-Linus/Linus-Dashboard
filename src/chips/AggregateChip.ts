import { chips } from "../types/strategy/chips";
import { DEVICE_CLASSES, DOMAIN_ICONS } from "../variables";
import { AbstractChip } from "./AbstractChip";
import { Helper } from "../Helper";
import { navigateTo } from "../utils";

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

    if (domain === "binary_sensor") {
      content = show_content ? Helper.getDeviceClassCountTemplate(device_class, "eq", "on", area_id) : ""
      icon_color = Helper.getBinarySensorColorFromState(device_class, "eq", "on", "red", "grey", area_id)
    }

    if (domain === "sensor") {

      content = show_content ? Helper.getAverageStateTemplate(device_class, area_id) : ""
      icon_color = Helper.getSensorColorFromState(device_class, area_id!)
      icon = Helper.getSensorIconFromState(device_class, area_id!)

      if (device_class === "illuminance") {
        if (magicEntity) {
          icon_color = `{{ 'blue' if 'dark' in state_attr('${device?.entities.area_state?.entity_id}', 'states') else 'amber' }}`
        }
      }
    }

    if (device_class === "cover") {

      if (magicEntity) {
        icon_color = `{{ 'red' if is_state('${magicEntity.entity_id}', 'open') else 'grey' }}`
        content = show_content ? Helper.getDeviceClassCountTemplate(device_class, "eq", "open", area_id) : ""
      }
    }

    if (device_class === "health") {
      icon_color = `{{ 'red' if is_state(entity, 'on') else 'green' }}`
    }

    const tap_action = navigateTo(device_class)

    return {
      entity: magicEntity?.entity_id,
      icon_color,
      icon,
      content: content,
      tap_action,
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.AggregateChipOptions} options The chip options.
   */
  constructor(options: chips.AggregateChipOptions) {
    super();

    const { device_class, show_content = false, area_id } = options

    const defaultConfig = this.getDefaultConfig({ device_class, show_content, area_id })

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { AggregateChip };
