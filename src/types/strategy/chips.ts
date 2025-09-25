import { AlarmChipConfig, TemplateChipConfig, WeatherChipConfig } from "../lovelace-mushroom/utils/lovelace/chip/types";

export namespace chips {
  export type AggregateChipOptions = { domain: string, device_class?: string, magic_device_id?: string } & ChipOptions;
  export type DeviceClassChipOptions = { device_class?: string } & ChipOptions;
  export type ChipOptions = { area_slug?: string | string[], magic_device_id?: string, show_content?: boolean } & TemplateChipOptions;
  export type TemplateChipOptions = Omit<TemplateChipConfig, "type">;
  export type WeatherChipOptions = Omit<WeatherChipConfig, "type">;
  export type AlarmChipOptions = Omit<AlarmChipConfig, "type">;
}

