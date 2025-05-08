import { chips } from "../types/strategy/chips";
import { AbstractChip } from "./AbstractChip";
import { Helper } from "../Helper";
import { getMAEntity, navigateTo } from "../utils";
import { EntityChipConfig, TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

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
   * @param {chips.AggregateChipOptions} options The options object containing the parameters.
   * @returns {TemplateChipConfig} The default configuration.
   */
  getDefaultConfig({ domain, device_class, show_content = true, magic_device_id = "global", area_slug, tap_action }: chips.AggregateChipOptions): TemplateChipConfig | EntityChipConfig {
    const magicEntity = getMAEntity(magic_device_id, domain, device_class);
    const entity_id = Helper.getEntityIds({ domain, device_class, area_slug })

    let config: TemplateChipConfig | EntityChipConfig = {
      type: "template",
      entity: entity_id.length == 1 ? entity_id[0] : undefined,
      entity_id: Helper.getEntityIds({ domain, device_class, area_slug }),
      icon_color: Helper.getIconColor(domain, device_class, entity_id),
      icon: Helper.getIcon(domain, device_class, entity_id),
      content: show_content ? Helper.getContent(domain, device_class, entity_id) : "",
      tap_action: tap_action ?? entity_id.length == 1 ? undefined : navigateTo(device_class ?? domain),
      hold_action: navigateTo(device_class ?? domain),
    }

    if (magicEntity) {
      config.type = "template";
      config.entity = magicEntity.entity_id;
      config.tap_action = { action: "more-info" }
    }

    return config;
  }

  /**
   * Class Constructor.
   *
   * @param {chips.AggregateChipOptions} options The chip options.
   */
  constructor(options: chips.AggregateChipOptions) {
    super();

    const defaultConfig = this.getDefaultConfig(options);

    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { AggregateChip };
