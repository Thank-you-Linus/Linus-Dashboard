
import { navigateTo } from "../utils";
import { LovelaceBadgeConfig } from "@/types/homeassistant/data/lovelace";
import { AbstractBadge } from "./AbstractBadge";

// noinspection JSUnusedGlobalSymbols False positive.
/**
 * Alarm Badge class.
 *
 * Used to create a badge for showing the alarm.
 */
class AlarmBadge extends AbstractBadge {
  /**
   * Default configuration of the badge.
   *
   * @private
   * @readonly
   */
  readonly #defaultConfig: LovelaceBadgeConfig = {
    type: "entity",
    show_name: true,
    show_state: true,
    show_icon: true,
    tap_action: navigateTo('security')
  };

  /**
   * Class Constructor.
   *
   * @param {string} entityId Id of a alarm entity.
   * @param {chips.AlarmBadgeOptions} options Alarm Badge options.
   */
  constructor(entityId: string, options?: LovelaceBadgeConfig) {
    super();
    this.#defaultConfig = {
      ...this.#defaultConfig,
      ...{ entity: entityId },
      ...options,
    };

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { AlarmBadge };
