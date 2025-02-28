import { Helper } from "../Helper";
import { AbstractChip } from "./AbstractChip";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { getMAEntity } from "../utils";
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
  constructor(entity?: EntityRegistryEntry, options: chips.ChipOptions = {}) {
    super();

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getCountTemplate({ domain: "media_player", operator: "eq", value: "playing", area_slug: options?.area_slug });
    }

    this.#defaultConfig.icon_color = Helper.getFromDomainState({ domain: "media_player", area_slug: options?.area_slug })
    this.#defaultConfig.icon = Helper.icons.media_player._.default,

      // const magicAreasEntity = getMAEntity(options?.magic_device_id ?? "global", "media_player");

      // if (magicAreasEntity) {
      //   this.#defaultConfig.entity = magicAreasEntity.entity_id;
      // }

      this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { MediaPlayerChip };
