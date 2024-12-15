import { generic } from "./types/strategy/generic";
import StrategyDefaults = generic.StrategyDefaults;
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { ControlChip } from "./chips/ControlChip";
import { SettingsChip } from "./chips/SettingsChip";
import { LightSettings } from "./popups/LightSettingsPopup";
import { ToggleSceneChip } from "./chips/ToggleSceneChip";
import { SceneSettings } from "./popups/SceneSettingsPopup";
import { UNDISCLOSED } from "./variables";
import { ClimateChip } from "./chips/ClimateChip";
import { AggregateChip } from "./chips/AggregateChip";
import { LightChip } from "./chips/LightChip";
import { MediaPlayerChip } from "./chips/MediaPlayerChip";
import { CoverChip } from "./chips/CoverChip";
import { FanChip } from "./chips/FanChip";
import { SwitchChip } from "./chips/SwitchChip";

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
  debug: true,
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
      controlChip: LightChip,
      extraControls: (device: MagicAreaRegistryEntry) => {
        const chips = [];
        if (device?.entities.light_control?.entity_id) {
          chips.push(new ControlChip("light", device?.entities.light_control?.entity_id).getChip());
        }
        if (device?.entities.all_lights?.entity_id) {
          chips.push(new SettingsChip({ tap_action: new LightSettings(device).getPopup() }).getChip());
        }
        return chips
      },
      controllerCardOptions: {
        onService: "light.turn_on",
        offService: "light.turn_off",
        toggleService: "light.toggle",
      },
      hidden: false,
      order: 1
    },
    climate: {
      showControls: true,
      controlChip: ClimateChip,
      controllerCardOptions: {
        onService: "climate.turn_on",
        offService: "climate.turn_off",
        toggleService: "climate.toggle",
      },
      hidden: false,
      order: 2,
      extraControls: (device: MagicAreaRegistryEntry) => {
        const chips = [];
        if (device?.entities.climate_control?.entity_id) {
          chips.push(new ControlChip("climate", device?.entities.climate_control?.entity_id).getChip());
        }
        return chips
      },
    },
    media_player: {
      showControls: true,
      controlChip: MediaPlayerChip,
      controllerCardOptions: {
        onService: "media_player.turn_on",
        offService: "media_player.turn_off",
        toggleService: "media_player.toggle",
      },
      hidden: false,
      order: 3,
      extraControls: (device: MagicAreaRegistryEntry) => {
        const chips = [];
        if (device?.entities.media_player_control?.entity_id) {
          chips.push(new ControlChip("media_player", device?.entities.media_player_control?.entity_id).getChip());
        }
        return chips
      },
    },
    cover: {
      showControls: true,
      controlChip: CoverChip,
      controllerCardOptions: {
        onService: "cover.open_cover",
        offService: "cover.close_cover",
        toggleService: "cover.toggle",
      },
      hidden: false,
      order: 4
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
      onService: "scene.turn_on",
      offService: "scene.turn_off",
      hidden: false,
      order: 5
    },
    fan: {
      showControls: true,
      controlChip: FanChip,
      controllerCardOptions: {
        onService: "fan.turn_on",
        offService: "fan.turn_off",
        toggleService: "fan.toggle",
      },
      hidden: false,
      order: 6
    },
    switch: {
      showControls: true,
      controlChip: SwitchChip,
      controllerCardOptions: {
        onService: "switch.turn_on",
        offService: "switch.turn_off",
        toggleService: "switch.toggle",
      },
      hidden: false,
      order: 7
    },
    camera: {
      showControls: false,
      controllerCardOptions: {
      },
      hidden: false,
      order: 8
    },
    lock: {
      showControls: false,
      controllerCardOptions: {
      },
      hidden: false,
      order: 9
    },
    vacuum: {
      showControls: true,
      controllerCardOptions: {
        onService: "vacuum.start",
        offService: "vacuum.stop",
      },
      hidden: false,
      order: 10
    },
    sensor: {
      controlChip: AggregateChip,
      showControls: true,
      hidden: false,
    },
    binary_sensor: {
      controlChip: AggregateChip,
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
