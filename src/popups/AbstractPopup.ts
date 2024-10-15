import {Helper} from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";

/**
 * Abstract Popup class.
 *
 * To create a new Popup, extend this one.
 *
 * @class
 * @abstract
 */
abstract class AbstractPopup {
  /**
   * Configuration of the Popup.
   *
   * @type {PopupActionConfig}
   */
  config: PopupActionConfig = {
    action: "fire-dom-event",
    browser_mod: {}
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
   * Get the Popup.
   *
   * @returns  {PopupActionConfig} A Popup.
   */
  getPopup(): PopupActionConfig {
    return this.config;
  }
}

export {AbstractPopup};
