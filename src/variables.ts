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
