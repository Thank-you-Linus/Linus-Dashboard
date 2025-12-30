export const MAGIC_AREAS_DOMAIN = "magic_areas";
export const MAGIC_AREAS_NAME = "Magic Areas";
export const LINUS_BRAIN_DOMAIN = "linus_brain";

export const UNAVAILABLE = "unavailable";
export const UNDISCLOSED = "undisclosed";

export const TOD_ORDER = ["morning", "daytime", "evening", "night"];

export const LIGHT_DOMAIN = "light";
export const LIGHT_GROUPS = ["overhead_lights", "accent_lights", "task_lights", "sleep_lights"];
export const GROUP_DOMAINS = ["climate", "media_player", "cover"];
export const AGGREGATE_DOMAINS = ["binary_sensor", "sensor"];

export const DEVICE_CLASSES = {
  cover: [
    "awning",
    "blind",
    "curtain",
    "damper",
    "door",
    "garage",
    "gate",
    "shade",
    "shutter",
    "window",
  ],
  media_player: [
    "tv",
    "speaker",
    "receiver",
  ],
  sensor: [
    "temperature",
    "humidity",
    "illuminance",

    "battery",

    // "sensor",
    "apparent_power",
    "aqi",
    "area",
    "atmospheric_pressure",
    "blood_glucose_concentration",
    "carbon_dioxide",
    "carbon_monoxide",
    "current",
    "data_rate",
    "data_size",
    "date",
    "distance",
    "duration",
    "energy",
    "energy_storage",
    "enum",
    "frequency",
    "gas",
    "irradiance",
    // "moisture",
    "monetary",
    "nitrogen_dioxide",
    "nitrogen_monoxide",
    "nitrous_oxide",
    "ozone",
    "ph",
    "pm1",
    "pm25",
    "pm10",
    "power_factor",
    "power",
    "precipitation",
    "precipitation_intensity",
    "pressure",
    "reactive_power",
    "signal_strength",
    "sound_pressure",
    "speed",
    "sulphur_dioxide",
    "timestamp",
    "volatile_organic_compounds",
    "volatile_organic_compounds_parts",
    "voltage",
    "volume",
    "volume_flow_rate",
    "volume_storage",
    "water",
    "weight",
    "wind_speed",
  ],
  binary_sensor: [
    "battery_charging",
    "carbon_monoxide",
    "cold",
    "connectivity",
    "door",
    "garage_door",
    // "gas",
    "heat",
    // "light",
    "lock",
    "moisture",
    "motion",
    "moving",
    "occupancy",
    "opening",
    "plug",
    // "power",
    "presence",
    "problem",
    "running",
    "safety",
    "smoke",
    "sound",
    "tamper",
    "update",
    "vibration",
    "window",
  ],
};

export const AREA_CARDS_DOMAINS = [LIGHT_DOMAIN, "switch", "climate", "fan", "vacuum", "media_player", "camera", "cover", "lock", "scene", "plant", "binary_sensor", "sensor"];

export const ALL_HOME_ASSISTANT_DOMAINS = [
  // Core domains
  "alarm_control_panel", "automation", "binary_sensor", "button", "calendar", "camera", "climate",
  "cover", "device_tracker", "fan", "group", "input_boolean", "input_button", "input_datetime",
  "input_number", "input_select", "input_text", "light", "lock", "media_player", "notify",
  "number", "person", "plant", "scene", "script", "select", "sensor", "siren", "sun",
  "switch", "timer", "update", "vacuum", "water_heater", "weather", "zone",

  // Additional domains
  "air_quality", "counter", "date", "datetime", "event", "humidifier", "image", "lawn_mower",
  "proximity", "remote", "tag", "text", "time", "todo", "valve", "wake_word"
];

export const CUSTOM_VIEWS = ["home", "security", "security-details"];

export const DOMAINS_VIEWS = [...AREA_CARDS_DOMAINS, ...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor];

export const HOME_EXPOSED_CHIPS = ["weather", "alarm", "spotify", LIGHT_DOMAIN, "climate", "fan", "media_player", "switch", "safety", ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "binary_sensor:motion", "binary_sensor:occupancy", "binary_sensor:door", "binary_sensor:window"];
export const AREA_EXPOSED_CHIPS = [LIGHT_DOMAIN, ...GROUP_DOMAINS, ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "fan", "switch", "safety", ...DEVICE_CLASSES.binary_sensor.map(d => `binary_sensor:${d}`), ...DEVICE_CLASSES.sensor.map(d => `sensor:${d}`)];
export const SECURITY_EXPOSED_DOMAINS = ["light", "alarm", "safety", ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "lock"];
export const SECURITY_EXPOSED_SENSORS = [
  "binary_sensor:motion", 
  "binary_sensor:occupancy", 
  "binary_sensor:door", 
  "binary_sensor:window", 
  "binary_sensor:smoke",
  "binary_sensor:gas",
  "binary_sensor:carbon_monoxide",
  "binary_sensor:garage_door",
  "binary_sensor:tamper",
  "binary_sensor:sound",
  "binary_sensor:vibration",
  "binary_sensor:lock",
  "binary_sensor:moisture"
];
export const SECURITY_EXPOSED_CHIPS = ["light", "alarm", "safety", "lock", ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), ...SECURITY_EXPOSED_SENSORS];

export const DEVICE_ICONS = {
  presence_hold: 'mdi:car-brake-hold'
};

export const VIEWS_ICONS = {
  home: "mdi:home-assistant",
  security: "mdi:security",
};

/**
 * Standard domain view configurations.
 * Maps domain names to their view icons for StandardDomainView.
 * Domains in this list will use StandardDomainView instead of dedicated view classes.
 */
export const STANDARD_DOMAIN_ICONS: Record<string, string> = {
  light: "mdi:lightbulb-group",
  climate: "mdi:thermostat",
  cover: "mdi:window-open",
  fan: "mdi:fan",
  switch: "mdi:toggle-switch",
  vacuum: "mdi:robot-vacuum",
  scene: "mdi:palette",
  media_player: "mdi:speaker",
  camera: "mdi:cctv",
};

export const AREA_STATE_ICONS = {
  occupied: "mdi:account",
  extended: "mdi:account-clock",
  clear: "mdi:account-off",
  bright: "mdi:brightness-2",
  dark: "mdi:brightness-5",
  sleep: "mdi:bed",
};

export const AREA_CONTROL_ICONS = {
  light: "mdi:lightbulb-auto-outline",
  climate: "mdi:thermostat-auto",
  media_player: "mdi:auto-mode",
};

export const SENSOR_STATE_CLASS_MEASUREMENT: string[] = [
  "temperature",
  "humidity",
  "pressure",
  "illuminance",
  "power",
  "voltage",
  "current",
  "signal_strength",
  "sound_pressure",
  "air_quality",
  "gas",
  "wind_speed",
  "frequency",
  "speed"
];

export const SENSOR_STATE_CLASS_TOTAL: string[] = [
  "energy",
  "water",
  "gas",
  "monetary",
  "weight",
  "volume",
  "duration",
  "count"
];

export const SENSOR_STATE_CLASS_TOTAL_INCREASING: string[] = [
  "energy",
  "water",
  "gas",
  "monetary",
  "count"
];


export const colorMapping: Record<string, Record<string, string | Record<number, string> | Record<string, string | Record<string, string>>>> = {
  light: { '_': { state: { on: "amber" } } },
  climate: { '_': { state: { heat: "deep-orange", cool: "blue" } } },
  cover: Object.fromEntries(
    ['_', ...DEVICE_CLASSES.cover].map(deviceClass => [
      deviceClass,
      { state: { open: "purple", opening: "purple", closing: "purple" } }
    ])
  ),
  fan: { '_': { state: { on: "cyan" } } },
  media_player: Object.fromEntries(
    ['_', ...DEVICE_CLASSES.media_player].map(deviceClass => [
      deviceClass,
      { state: { playing: "light-blue", paused: "grey", stopped: "grey" } }
    ])
  ),
  switch: { '_': { state: { on: "yellow" } } },
  binary_sensor: {
    motion: { state: { on: "red" } },
    door: { state: { on: "orange" } },
    window: { state: { on: "red" } },
    smoke: { state: { on: "red" } },
    gas: { state: { on: "red" } },
    moisture: { state: { on: "lightblue" } },
    tamper: { state: { on: "red" } },
    battery_charging: { state: { on: "green" } },
    carbon_monoxide: { state: { on: "red" } },
    cold: { state: { on: "blue" } },
    connectivity: { state: { on: "green" } },
    garage_door: { state: { on: "orange" } },
    heat: { state: { on: "red" } },
    lock: { state: { on: "amber" } },
    occupancy: { state: { on: "green" } },
    opening: { state: { on: "orange" } },
    plug: { state: { on: "green" } },
    presence: { state: { on: "blue" } },
    problem: { state: { on: "red" } },
    running: { state: { on: "blue" } },
    safety: { state: { on: "red" } },
    sound: { state: { on: "blue" } },
    update: { state: { on: "purple" } },
    vibration: { state: { on: "purple" } },
  },
  sensor: {
    battery: {
      state: {
        75: "green",
        50: "amber",
        25: "orange",
        0: "red"
      }
    },
    temperature: {
      state: {
        0: "blue",
        20: "green",
        30: "amber",
        40: "red"
      }
    },
    humidity: {
      state: {
        0: "red",
        30: "amber",
        60: "green",
        100: "blue"
      }
    },
    illuminance: {
      state: {
        0: "grey",
        100: "amber",
        1000: "orange",
        10000: "white"
      }
    },
    pressure: {
      state: {
        900: "blue",
        1013: "green",
        1100: "red"
      }
    },
    power: {
      state: {
        0: "grey",
        100: "amber",
        500: "orange",
        1000: "red"
      }
    },
    voltage: {
      state: {
        0: "grey",
        110: "green",
        220: "orange",
        240: "red"
      }
    },
    current: {
      state: {
        0: "grey",
        10: "amber",
        20: "orange",
        30: "red"
      }
    },
    signal_strength: {
      state: {
        0: "red",
        50: "orange",
        75: "amber",
        100: "green"
      }
    },
    sound_pressure: {
      state: {
        0: "blue",
        50: "green",
        70: "amber",
        90: "red"
      }
    },
    air_quality: {
      state: {
        0: "green",
        50: "amber",
        100: "orange",
        150: "red"
      }
    },
    gas: {
      state: {
        0: "green",
        50: "amber",
        100: "orange",
        200: "red"
      }
    },
    wind_speed: {
      state: {
        0: "blue",
        10: "green",
        20: "amber",
        30: "red"
      }
    },
    frequency: {
      state: {
        0: "grey",
        50: "green",
        60: "amber",
        70: "red"
      }
    },
    speed: {
      state: {
        0: "blue",
        30: "green",
        60: "amber",
        100: "red"
      }
    },
    energy: {
      state: {
        0: "grey",
        100: "amber",
        500: "orange",
        1000: "red"
      }
    },
  },
};
