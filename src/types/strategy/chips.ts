import { AlarmChipConfig, TemplateChipConfig, WeatherChipConfig } from "../lovelace-mushroom/utils/lovelace/chip/types";

export namespace chips {
  export type AggregateChipOptions = { device_class: string, show_content?: boolean } & SensorChipOptions;
  export type SensorChipOptions = { device_class?: string } & ChipOptions;
  export type ChipOptions = { area_id?: string, floor_id?: string } & TemplateChipOptions;
  export type TemplateChipOptions = Omit<TemplateChipConfig, "type">;
  export type WeatherChipOptions = Omit<WeatherChipConfig, "type">;
  export type AlarmChipOptions = Omit<AlarmChipConfig, "type">;
}

