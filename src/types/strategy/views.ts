import { cards } from "./cards";
import { LovelaceViewConfig } from "../homeassistant/data/lovelace";

export namespace views {
  /**
   * Options for the extended View class.
   *
   * @property {cards.ControllerCardConfig} [controllerCardOptions] Options for the Controller card.
   */
  export interface ViewConfig extends LovelaceViewConfig {
    controllerCardOptions?: cards.ControllerCardOptions;
  }

  export type AggregateViewOptions = { domain: string, device_class?: string } & ViewConfig;
  export type InputViewOptions = { domain: string } & ViewConfig;
}




