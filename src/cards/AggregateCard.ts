import { cards } from "../types/strategy/cards";
import { AbstractCard } from "./AbstractCard";
import { Helper } from "../Helper";
import { getDomainTranslationKey, getMAEntity } from "../utils";
import { ResourceKeys } from "../types/homeassistant/data/frontend";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";

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
   * @param {cards.AggregateCardOptions} options The options object containing the parameters.
   * @returns {TemplateChipConfig} The default configuration.
   */
  getDefaultConfig({
    domain,
    device_class,
    show_content = true,
    magic_device_id = "global",
    area_slug,
    tap_action
  }: cards.AggregateCardOptions): TemplateCardConfig {
    const magicEntity = getMAEntity(magic_device_id, domain, device_class);
    const entity_id = magicEntity?.entity_id ? [magicEntity?.entity_id] : Helper.getEntityIds({ domain, device_class, area_slug });


    const icon = Helper.getIcon(domain, device_class, entity_id);
    const icon_color = Helper.getIconColor(domain, device_class, entity_id);
    const content = Helper.getContent(domain, device_class, entity_id);

    const secondary = Helper.getLastChangedTemplate({ domain, device_class, area_slug });

    return {
      type: "custom:mushroom-template-card",
      entity: entity_id[0],
      entity_id: Helper.getEntityIds({ domain, device_class, area_slug }),
      primary: Helper.localize(getDomainTranslationKey(domain, device_class)),
      secondary,
      icon_color,
      icon,
      badge_icon: show_content ? content : "",
      badge_color: "black",
      tap_action: tap_action ?? { action: "none" }
    };
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
