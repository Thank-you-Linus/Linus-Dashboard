export const MAGIC_AREAS_DOMAIN = "magic_areas";
export const MAGIC_AREAS_NAME = "Magic Areas";

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

export const CUSTOM_VIEWS = ["home", "security", "security-details"];

export const DOMAINS_VIEWS = [...AREA_CARDS_DOMAINS, ...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor];

export const HOME_EXPOSED_CHIPS = ["weather", "alarm", "spotify", LIGHT_DOMAIN, "climate", "fan", "media_player", "switch", "safety", ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "binary_sensor:motion", "binary_sensor:occupancy", "binary_sensor:door", "binary_sensor:window"];
export const AREA_EXPOSED_CHIPS = [LIGHT_DOMAIN, ...GROUP_DOMAINS, ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "fan", "switch", "safety", ...DEVICE_CLASSES.binary_sensor.map(d => `binary_sensor:${d}`), ...DEVICE_CLASSES.sensor.map(d => `sensor:${d}`)];
export const SECURITY_EXPOSED_DOMAINS = ["light", "alarm", "safety", ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "lock"];
export const SECURITY_EXPOSED_SENSORS = ["binary_sensor:motion", "binary_sensor:occupancy", "binary_sensor:door", "binary_sensor:window"];
export const SECURITY_EXPOSED_CHIPS = ["light", "alarm", "safety", ...DEVICE_CLASSES.cover.map(d => `cover:${d}`), "lock", ...SECURITY_EXPOSED_SENSORS];

export const DEVICE_ICONS = {
  presence_hold: 'mdi:car-brake-hold'
};

export const VIEWS_ICONS = {
  home: "mdi:home-assistant",
  security: "mdi:security",
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
