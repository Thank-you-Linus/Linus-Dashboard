import { cards } from "../types/strategy/cards";
import { AbstractCard } from "./AbstractCard";
import { Helper } from "../Helper";
import { getDomainTranslationKey } from "../utils";
import { ResourceKeys } from "../types/homeassistant/data/frontend";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Climate Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class AggregateCard extends AbstractCard {
  /**
   * Default configuration of the chip.
   *
   * @type {TemplateChipConfig | undefined}
   *
   */
  getDefaultConfig({ domain, device_class, show_content = true, magic_device_id = "global", area_slug, tap_action }: cards.AggregateCardOptions) {

    let icon = device_class ? device_class !== "motion" ? Helper.icons[domain as ResourceKeys][device_class]?.default : Helper.icons[domain as ResourceKeys][device_class]?.state?.on : device_class !== "motion" ? Helper.icons[domain as ResourceKeys]["_"]?.default : Helper.icons[domain as ResourceKeys]["_"]?.state?.on
    let icon_color = ""
    let content = ""

    const device = Helper.magicAreasDevices[magic_device_id]
    const magicEntity = device?.entities[`aggregate_${device_class}`]

    if (domain === "binary_sensor" && device_class) {
      icon_color = Helper.getBinarySensorColorFromState(device_class, "eq", "on", "red", "grey", area_slug)
      content = show_content ? Helper.getCountTemplate({ domain, device_class, operator: "eq", value: "on", area_slug, prefix: "mdi:numeric-" }) : ""
    }

    if (domain === "sensor" && device_class) {

      content = show_content ? Helper.getSensorStateTemplate(device_class, area_slug) : ""
      icon_color = Helper.getSensorColorFromState(device_class, area_slug!) ?? "white"
      icon = Helper.getSensorIconFromState(device_class, area_slug!) ?? icon

      if (device_class === "illuminance") {
        if (magicEntity) {
          icon_color = `{{ 'blue' if 'dark' in state_attr('${device?.entities.area_state?.entity_id}', 'states') else 'amber' }}`
        }
      }
    }

    if (domain === "cover") {
      if (magicEntity) {
        icon_color = `{{ 'red' if is_state('${magicEntity.entity_id}', 'open') else 'grey' }}`
      } else {
        icon_color = Helper.getFromDomainState({ domain, area_slug, }) ?? "grey"
      }
      show_content ? Helper.getCountTemplate({ domain, device_class, operator: "eq", value: "open", area_slug, prefix: "mdi:numeric-" }) : ""
    }

    if (device_class === "health") {
      icon_color = `{{ 'red' if is_state(entity, 'on') else 'green' }}`
    }

    const secondary = Helper.getLastChangedTemplate({ domain, device_class, area_slug })


    return {
      entity: magicEntity?.entity_id,
      entity_id: Helper.getEntityIds({ domain, device_class, area_slug }),
      primary: Helper.localize(getDomainTranslationKey(domain, device_class)),
      secondary,
      icon_color,
      icon,
      badge_icon: content,
      badge_color: "black",
      tap_action: tap_action ?? { action: "none" }
    }
  }

  /**
   * Class Constructor.
   *
   * @param {cards.AggregateCardOptions} options The chip options.
   */
  constructor(options: cards.AggregateCardOptions) {
    super(options.entity);

    const defaultConfig = this.getDefaultConfig(options)

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { AggregateCard };
