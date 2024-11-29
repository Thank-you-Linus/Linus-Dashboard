export const MAGIC_AREAS_DOMAIN = "magic_areas";
export const MAGIC_AREAS_NAME = "Magic Areas";

export const UNAVAILABLE = "unavailable";
export const UNDISCLOSED = "undisclosed";

export const TOD_ORDER = ["morning", "daytime", "evening", "night"];

export const LIGHT_DOMAIN = "light";
export const GROUP_DOMAINS = ["climate", "media_player", "cover"];
export const AGGREGATE_DOMAINS = ["binary_sensor", "sensor"];

export const DEVICE_CLASSES = {
  sensor: ["illuminance", "temperature", "humidity", "battery", "energy", "power"],
  binary_sensor: ["motion", "door", "window", "vibration", "moisture", "smoke"],
};

export const AREA_CARDS_DOMAINS = [LIGHT_DOMAIN, "switch", "climate", "fan", "camera", "cover", "vacuum", "media_player", "lock", "scene", "plant", "binary_sensor", "sensor"];

export const CUSTOM_VIEWS = ["home", "security", "security-details"];

export const DOMAINS_VIEWS = [...AREA_CARDS_DOMAINS, ...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor];

export const HOME_EXPOSED_CHIPS = ["weather", "alarm", "spotify", LIGHT_DOMAIN, ...GROUP_DOMAINS, "fan", "switch", "safety", "motion", "door", "window"];
export const AREA_EXPOSED_CHIPS = [LIGHT_DOMAIN, ...GROUP_DOMAINS, "fan", "switch", "safety", ...DEVICE_CLASSES.binary_sensor, ...DEVICE_CLASSES.sensor];

export const DEVICE_ICONS = {
  presence_hold: 'mdi:car-brake-hold'
};

export const DOMAIN_STATE_ICONS = {
  light: { on: "mdi:lightbulb-group", off: "mdi:lightbulb-group-off" },
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
  vacuum: { on: "mdi:robot-vacuum", off: "mdi:robot-vacuum-off" },
  media_player: { on: "mdi:cast-connected", off: "mdi:cast-off" },
  lock: { on: "mdi:lock-open", off: "mdi:lock-close" },
  climate: { on: "mdi:thermostat", off: "mdi:thermostat" },
  camera: { on: "mdi:video" },
  cover: { on: "mdi:window-shutter-open", off: "mdi:window-shutter" },
  plant: { on: "mdi:flower", off: "mdi:flower" },
};

export const DOMAIN_ICONS = {
  home: "mdi:home-assistant",
  security: "mdi:security",
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
  battery: 'mdi:battery',
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
