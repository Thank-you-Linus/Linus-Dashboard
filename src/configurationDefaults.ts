import { generic } from "./types/strategy/generic";

import StrategyDefaults = generic.StrategyDefaults;

import { ControlChip } from "./chips/ControlChip";
import { SettingsChip } from "./chips/SettingsChip";
import { LightSettings } from "./popups/LightSettingsPopup";
import { ToggleSceneChip } from "./chips/ToggleSceneChip";
import { SceneSettings } from "./popups/SceneSettingsPopup";
import { UNDISCLOSED } from "./variables";

import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;

/**
 * Default configuration for the mushroom strategy.
 */
export const configurationDefaults: StrategyDefaults = {
  areas: {
    undisclosed: {
      slug: UNDISCLOSED,
      aliases: [],
      area_id: UNDISCLOSED,
      name: "Non assigné",
      picture: null,
      hidden: false,
      domains: {},
      devices: [],
      entities: [],
    }
  },
  floors: {
    undisclosed: {
      aliases: [],
      floor_id: UNDISCLOSED,
      name: "Non assigné",
      hidden: false,
      areas_slug: [UNDISCLOSED]
    }
  },
  debug: false,
  domains: {
    _: {
      hide_config_entities: false,
    },
    default: {
      showControls: false,
      hidden: false,
    },
    light: {
      showControls: true,
      extraControls: (device: MagicAreaRegistryEntry) => {
        const { adaptive_lighting_range, minimum_brightness, maximum_brightness, maximum_lighting_level } = device?.entities ?? {}
        const chips = [];

        // Use EntityResolver to get light control switch (Linus Brain or Magic Areas)
        // Helper is imported dynamically to avoid circular dependency
        const Helper = require("./Helper").Helper;
        if (Helper.isInitialized()) {
          const resolver = Helper.entityResolver;

          // Add light control switch (Linus Brain or Magic Areas)
          const lightControlResolution = resolver.resolveLightControlSwitch(device.slug);
          const lightControlEntity = lightControlResolution.entity_id;

          if (lightControlEntity) {
            chips.push(new ControlChip("light", lightControlEntity).getChip());
          }
        }

        if (adaptive_lighting_range && minimum_brightness && maximum_brightness && maximum_lighting_level) {
          chips.push(new SettingsChip({ tap_action: new LightSettings(device).getPopup() }).getChip());
        }
        return chips
      },
      hidden: false,
      order: 1
    },
    climate: {
      showControls: true,
      hidden: false,
      order: 2,
      extraControls: (device: MagicAreaRegistryEntry) => {
        const chips = [];
        // Add control switch if available
        if (device?.entities.climate_control?.entity_id) {
          chips.push(new ControlChip("climate", device?.entities.climate_control?.entity_id).getChip());
        }
        return chips
      },
    },
    media_player: {
      showControls: true,
      hidden: false,
      order: 3,
      extraControls: (device: MagicAreaRegistryEntry) => {
        const chips = [];
        // Add control switch if available
        if (device?.entities.media_player_control?.entity_id) {
          chips.push(new ControlChip("media_player", device?.entities.media_player_control?.entity_id).getChip());
        }
        return chips
      },
    },
    cover: {
      showControls: true,
      hidden: false,
      order: 4,
    },
    scene: {
      showControls: false,
      extraControls: (device: MagicAreaRegistryEntry) => {
        const chips = [];
        if (device?.entities.all_lights?.entity_id) {
          chips.push(new ToggleSceneChip(device).getChip());
          chips.push(new SettingsChip({ tap_action: new SceneSettings(device).getPopup() }).getChip());
        }
        return chips
      },
      hidden: false,
      order: 5
    },
    fan: {
      showControls: true,
      hidden: false,
      order: 6,
    },
    switch: {
      showControls: true,
      hidden: false,
      order: 7,
    },
    camera: {
      showControls: false,
      hidden: false,
      order: 8
    },
    lock: {
      showControls: false,
      hidden: false,
      order: 9
    },
    vacuum: {
      showControls: true,
      hidden: false,
      order: 10
    },
    siren: {
      showControls: true,
      hidden: false,
      order: 11
    },
    sensor: {
      showControls: true,
      hidden: false,
    },
    binary_sensor: {
      showControls: true,
      hidden: false,
    },
    number: {
      showControls: false,
      hidden: false,
    },
  },
  home_view: {
    hidden: [],
  },
  views: {
    home: {
      order: 1,
      hidden: false,
    },
    security: {
      order: 2,
      hidden: false,
    },
    light: {
      order: 3,
      hidden: false,
    },
    climate: {
      order: 4,
      hidden: false,
    },
    media_player: {
      order: 5,
      hidden: false,
    },
    cover: {
      order: 6,
      hidden: false,
    },
    scene: {
      order: 7,
      hidden: false,
    },
    fan: {
      order: 8,
      hidden: false,
    },
    switch: {
      order: 9,
      hidden: false,
    },
    camera: {
      order: 10,
      hidden: false,
    },
    vacuum: {
      order: 11,
      hidden: false,
    },
    siren: {
      order: 12,
      hidden: false,
    },
    sensor: {
      hidden: false,
    },
    binary_sensor: {
      hidden: false,
    },
    securityDetails: {
      hidden: false,
    },
    battery: {
      hidden: false,
    },
    battery_charging: {
      hidden: false,
    },
    carbon_monoxide: {
      hidden: false,
    },
    cold: {
      hidden: false,
    },
    connectivity: {
      hidden: false,
    },
    door: {
      hidden: false,
    },
    garage_door: {
      hidden: false,
    },
    gas: {
      hidden: false,
    },
    heat: {
      hidden: false,
    },
    lock: {
      hidden: false,
    },
    moisture: {
      hidden: false,
    },
    motion: {
      hidden: false,
    },
    moving: {
      hidden: false,
    },
    occupancy: {
      hidden: false,
    },
    opening: {
      hidden: false,
    },
    plug: {
      hidden: false,
    },
    power: {
      hidden: false,
    },
    presence: {
      hidden: false,
    },
    problem: {
      hidden: false,
    },
    running: {
      hidden: false,
    },
    safety: {
      hidden: false,
    },
    smoke: {
      hidden: false,
    },
    sound: {
      hidden: false,
    },
    tamper: {
      hidden: false,
    },
    update: {
      hidden: false,
    },
    vibration: {
      hidden: false,
    },
    window: {
      hidden: false,
    },
    apparent_power: {
      hidden: false,
    },
    aqi: {
      hidden: false,
    },
    area: {
      hidden: false,
    },
    atmospheric_pressure: {
      hidden: false,
    },
    blood_glucose_concentration: {
      hidden: false,
    },
    carbon_dioxide: {
      hidden: false,
    },
    current: {
      hidden: false,
    },
    data_rate: {
      hidden: false,
    },
    data_size: {
      hidden: false,
    },
    date: {
      hidden: false,
    },
    distance: {
      hidden: false,
    },
    duration: {
      hidden: false,
    },
    energy: {
      hidden: false,
    },
    energy_storage: {
      hidden: false,
    },
    enum: {
      hidden: false,
    },
    frequency: {
      hidden: false,
    },
    humidity: {
      hidden: false,
    },
    illuminance: {
      hidden: false,
    },
    irradiance: {
      hidden: false,
    },
    monetary: {
      hidden: false,
    },
    nitrogen_dioxide: {
      hidden: false,
    },
    nitrogen_monoxide: {
      hidden: false,
    },
    nitrous_oxide: {
      hidden: false,
    },
    ozone: {
      hidden: false,
    },
    ph: {
      hidden: false,
    },
    pm1: {
      hidden: false,
    },
    pm25: {
      hidden: false,
    },
    pm10: {
      hidden: false,
    },
    power_factor: {
      hidden: false,
    },
    precipitation: {
      hidden: false,
    },
    precipitation_intensity: {
      hidden: false,
    },
    pressure: {
      hidden: false,
    },
    reactive_power: {
      hidden: false,
    },
    signal_strength: {
      hidden: false,
    },
    sound_pressure: {
      hidden: false,
    },
    speed: {
      hidden: false,
    },
    sulphur_dioxide: {
      hidden: false,
    },
    temperature: {
      hidden: false,
    },
    timestamp: {
      hidden: false,
    },
    volatile_organic_compounds: {
      hidden: false,
    },
    volatile_organic_compounds_parts: {
      hidden: false,
    },
    voltage: {
      hidden: false,
    },
    volume: {
      hidden: false,
    },
    volume_flow_rate: {
      hidden: false,
    },
    volume_storage: {
      hidden: false,
    },
    water: {
      hidden: false,
    },
    weight: {
      hidden: false,
    },
    wind_speed: {
      hidden: false,
    },
  }
};
