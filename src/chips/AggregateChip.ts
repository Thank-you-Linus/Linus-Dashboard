import { chips } from "../types/strategy/chips";
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
   * @param {chips.AggregateChipOptions} options The options object containing the parameters.
   * @returns {TemplateChipConfig} The default configuration.
   */
  getDefaultConfig({ domain, device_class, show_content = true, magic_device_id = "global", area_slug, tap_action }: chips.AggregateChipOptions) {
    const magicEntity = getMAEntity(magic_device_id, domain, device_class,);
    const entity_id = magicEntity?.entity_id ? [magicEntity?.entity_id] : Helper.getEntityIds({ domain, device_class, area_slug });

    const icon = Helper.getIcon(domain, device_class, entity_id);
    const icon_color = Helper.getIconColor(domain, device_class, entity_id);
    // console.log('couleur = ', domain, device_class, icon_color)
    const content = Helper.getContent(domain, device_class, entity_id);

    return {
      entity: entity_id,
      icon_color,
      icon,
      content: show_content ? content : "",
      tap_action: tap_action ?? { action: "none" }
    };
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
