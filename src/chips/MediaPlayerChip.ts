import { Helper } from "../Helper";
import { AbstractChip } from "./AbstractChip";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { getMAEntity, navigateTo } from "../utils";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * MediaPlayer Chip class.
 *
 * Used to create a chip to indicate how many climates are operating.
 */
class MediaPlayerChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {TemplateChipConfig}
   *
   * @readonly
   * @private
   */
  readonly #defaultConfig: TemplateChipConfig = {
    type: "template",
    icon: Helper.icons.media_player._.default,
    content: "",
    tap_action: {
      action: "navigate",
      navigation_path: "media_player",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor(options: chips.ChipOptions, entity?: EntityRegistryEntry) {
    super();

    const entities = Helper.getEntityIds({
      domain: "media_player",
      area_slug: options?.area_slug,
    });

    if (!entities.length) {
      console.debug("No entities found for media_player chip");
      return;
    }

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getContent("media_player", undefined, entities);
    }


    this.#defaultConfig.icon = Helper.getIcon("media_player", undefined, entities);
    this.#defaultConfig.icon_color = Helper.getIconColor("media_player", undefined, entities);

    const magicAreasEntity = getMAEntity(options?.magic_device_id ?? "global", "media_player");

    if (magicAreasEntity) {
      this.#defaultConfig.entity = magicAreasEntity.entity_id;
      this.#defaultConfig.tap_action = undefined
      this.#defaultConfig.hold_action = navigateTo('media_player')
    } else {

      const area_slug = Array.isArray(options?.area_slug) ? options?.area_slug : [options?.area_slug]
      const entity_id = area_slug.flatMap((area) => Helper.areas[area ?? "global"]?.domains?.light ?? []);
      this.#defaultConfig.entity_id = entity_id

      if (entity_id.length == 1) {
        this.#defaultConfig.entity = entity_id[0]
        this.#defaultConfig.tap_action = undefined
      }
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { MediaPlayerChip };
