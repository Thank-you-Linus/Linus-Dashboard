export const DOMAIN = "magic_areas";
export const WEATHER_ICONS = {
  "clear-night": "mdi:weather-night",
  cloudy: "mdi:weather-cloudy",
  overcast: "mdi:weather-cloudy-arrow-right",
  fog: "mdi:weather-fog",
  hail: "mdi:weather-hail",
  lightning: "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy",
  partlycloudy: "mdi:weather-partly-cloudy",
  pouring: "mdi:weather-pouring",
  rainy: "mdi:weather-rainy",
  snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy",
  sunny: "mdi:weather-sunny",
  windy: "mdi:weather-windy",
  "windy-variant": "mdi:weather-windy-variant",
};

export const ALARM_ICONS = {
  "armed_away": "mdi:shield-lock",
  "armed_vacation": "mdi:shield-airplane",
  "armed_home": "mdi:shield-home",
  "armed_night": "mdi:shield-moon",
  "armed_custom_bypass": "mdi:security",
  "pending": "mdi:shield-outline",
  "triggered": "mdi:bell-ring",
  disarmed: "mdi:shield-off",
};

export const UNAVAILABLE = "unavailable";
export const UNKNOWN = "unknown";


export const todOrder = ["morning", "daytime", "evening", "night"];


export const STATES_OFF = ["closed", "locked", "off", "docked", "idle", "standby", "paused", "auto", "ok"];

export const UNAVAILABLE_STATES = ["unavailable", "unknown"];

export const MAGIC_AREAS_LIGHT_DOMAINS = "light";
export const MAGIC_AREAS_GROUP_DOMAINS = ["cover", "climate", "media_player"];
export const MAGIC_AREAS_AGGREGATE_DOMAINS = ["binary_sensor", "sensor"];

export const MAGIC_AREAS_DOMAINS = [MAGIC_AREAS_LIGHT_DOMAINS, ...MAGIC_AREAS_GROUP_DOMAINS, ...MAGIC_AREAS_AGGREGATE_DOMAINS];

export const SENSOR_DOMAINS = ["sensor"];

export const ALERT_DOMAINS = ["binary_sensor", "health"];

export const TOGGLE_DOMAINS = ["light", "switch"];

export const CLIMATE_DOMAINS = ["climate", "fan"];

export const HOUSE_INFORMATION_DOMAINS = ["camera", "cover", "vacuum", "media_player", "lock", "plant"];

export const OTHER_DOMAINS = ["camera", "cover", "vacuum", "media_player", "lock", "scene", "plant"];

export const AREA_CARDS_DOMAINS = [...TOGGLE_DOMAINS, ...CLIMATE_DOMAINS, ...OTHER_DOMAINS, "binary_sensor", "sensor"];

export const DEVICE_CLASSES = {
  sensor: ["illuminance", "temperature", "humidity", "battery", "energy", "power"],
  binary_sensor: ["motion", "door", "window", "vibration", "moisture", "smoke"],
};

export const AREA_CARD_SENSORS_CLASS = ["temperature"];

export const DEVICE_ICONS = {
  presence_hold: 'mdi:car-brake-hold'
};

export const DOMAIN_STATE_ICONS = {
  light: { on: "mdi:lightbulb", off: "mdi:lightbulb-outline" },
  switch: { on: "mdi:power-plug", off: "mdi:power-plug" },
  fan: { on: "mdi:fan", off: "mdi:fan-off" },
  sensor: { humidity: "mdi:water-percent", temperature: "mdi:thermometer", pressure: "mdi:gauge" },
  binary_sensor: {
    motion: { on: "mdi:motion-sensor", off: "mdi:motion-sensor-off" },
    door: { on: "mdi:door-open", off: "mdi:door-closed" },
    window: { on: "mdi:window-open-variant", off: "mdi:window-closed-variant" },
    safety: { on: "mdi:alert-circle", off: "mdi:check-circle" },
    vibration: "mdi:vibrate",
    moisture: "mdi:water-alert",
    smoke: "mdi:smoke-detector-variant-alert",
  },
  vacuum: { on: "mdi:robot-vacuum" },
  media_player: { on: "mdi:cast-connected" },
  lock: { on: "mdi:lock-open" },
  climate: { on: "mdi:thermostat" },
  camera: { on: "mdi:video" },
  cover: { on: "mdi:window-shutter-open", off: "mdi:window-shutter" },
  plant: { on: "mdi:flower", off: "mdi:flower" },
};

export const DOMAIN_ICONS = {
  light: "mdi:lightbulb",
  climate: "mdi:thermostat",
  switch: "mdi:power-plug",
  fan: "mdi:fan",
  sensor: "mdi:eye",
  humidity: "mdi:water-percent",
  pressure: "mdi:gauge",
  illuminance: "mdi:brightness-5",
  temperature: "mdi:thermometer",
  energy: "mdi:lightning-bolt",
  power: "mdi:flash",
  binary_sensor: "mdi:radiobox-blank",
  motion: "mdi:motion-sensor",
  door: "mdi:door-open",
  window: "mdi:window-open-variant",
  vibration: "mdi:vibrate",
  moisture: "mdi:water-alert",
  vacuum: "mdi:robot-vacuum",
  media_player: "mdi:cast-connected",
  camera: "mdi:video",
  cover: "mdi:window-shutter",
  remote: "mdi:remote",
  scene: "mdi:palette",
  number: "mdi:ray-vertex",
  button: "mdi:gesture-tap-button",
  water_heater: "mdi:thermometer",
  select: "mdi:format-list-bulleted",
  lock: "mdi:lock",
  device_tracker: "mdi:radar",
  person: "mdi:account-multiple",
  weather: "mdi:weather-cloudy",
  automation: "mdi:robot-outline",
  alarm_control_panel: "mdi:shield-home",
  plant: 'mdi:flower',
  input_boolean: 'mdi:toggle-switch',
  health: 'mdi:shield-check-outline',
};

export const SUPPORTED_CARDS_WITH_ENTITY = [
  "button",
  "calendar",
  "entity",
  "gauge",
  "history-graph",
  "light",
  "media-control",
  "picture-entity",
  "sensor",
  "thermostat",
  "weather-forecast",
  "custom:button-card",
  "custom:mushroom-fan-card",
  "custom:mushroom-cover-card",
  "custom:mushroom-entity-card",
  "custom:mushroom-light-card",
  "tile",
];

export const AREA_STATE_ICONS = {
  occupied: "mdi:account",
  extended: "mdi:account-clock",
  clear: "mdi:account-off",
  bright: "mdi:brightness-2",
  dark: "mdi:brightness-5",
  sleep: "mdi:bed",
};

export const CLIMATE_PRESET_ICONS = {
  away: 'mdi:home',
  eco: 'mdi:leaf',
  boost: 'mdi:fire',
  comfort: 'mdi:sofa',
  home: 'mdi:home-account',
  sleep: 'mdi:weather-night',
  activity: 'mdi:briefcase',
};
