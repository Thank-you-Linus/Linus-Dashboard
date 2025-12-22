import { LovelaceViewConfig } from "../homeassistant/data/lovelace";


export namespace views {
  /**
   * Options for the extended View class.
   */
  export interface ViewConfig extends LovelaceViewConfig {
  }

  export type AggregateViewOptions = { domain: string, device_class?: string } & ViewConfig;
  export type InputViewOptions = { domain: string } & ViewConfig;
}




