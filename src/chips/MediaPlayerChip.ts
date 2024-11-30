import { Helper } from "../Helper";
import { AbstractChip } from "./AbstractChip";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { DOMAIN_ICONS } from "../variables";
import { getMAEntity } from "../utils";

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
    icon: DOMAIN_ICONS["media_player"],
    content: "",
    tap_action: {
      action: "navigate",
      navigation_path: "media_players",
    },
  };

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor(options: chips.ChipOptions) {
    super();

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getCountTemplate("media_player", "eq", "playing", options?.area_slug);
    }

    this.#defaultConfig.icon_color = Helper.getFromDomainState({ domain: "media_player", area_slug: options?.area_slug })

    const magicAreasEntity = getMAEntity(options?.magic_device_id ?? "global", "media_player");

    if (magicAreasEntity) {
      this.#defaultConfig.entity = magicAreasEntity.entity_id;
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { MediaPlayerChip };
