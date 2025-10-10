import { HassServiceTarget } from "home-assistant-js-websocket";

import { Helper } from "../Helper";
import { generic } from "../types/strategy/generic";
import isCallServiceActionConfig = generic.isCallServiceActionConfig;
import { LovelaceBadgeConfig } from "@/types/homeassistant/data/lovelace";

/**
 * Abstract Badge class.
 *
 * To create a new badge, extend this one.
 *
 * @class
 * @abstract
 */
abstract class AbstractBadge {
  /**
   * Configuration of the badge.
   *
   * @type {LovelaceBadgeConfig}
   */
  config: LovelaceBadgeConfig = {
    type: "template"
  };

  /**
   * Class Constructor.
   */
  protected constructor() {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }
  }

  // noinspection JSUnusedGlobalSymbols Method is called on dymanically imported classes.
  /**
   * Get the badge.
   *
   * @returns  {LovelaceBadgeConfig} A badge.
   */
  getBadge(): LovelaceBadgeConfig {
    return this.config;
  }

  /**
   * Set the target to switch.
   *
   * @param {HassServiceTarget} target Target to switch.
   */
  setTapActionTarget(target: HassServiceTarget) {
    if ("tap_action" in this.config && isCallServiceActionConfig(this.config.tap_action)) {
      this.config.tap_action.target = target;

      return;
    }

    if (Helper.debug) {
      console.warn(
        this.constructor.name
        + " - Target not set: Invalid target or tap action.");
    }
  }
}

export { AbstractBadge };
