import { generic } from "./types/strategy/generic";
import StrategyDefaults = generic.StrategyDefaults;
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { ControlChip } from "./chips/ControlChip";
import { SettingsChip } from "./chips/SettingsChip";
import { LightSettings } from "./popups/LightSettingsPopup";
import { ToggleSceneChip } from "./chips/ToggleSceneChip";
import { SceneSettings } from "./popups/SceneSettingsPopup";
import { DOMAIN_STATE_ICONS, UNDISCLOSED } from "./variables";

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
      title: "Divers",
      showControls: false,
      hidden: false,
    },
    light: {
      // title: "Lights",
      showControls: true,
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
        iconOn: DOMAIN_STATE_ICONS.light.on,
        iconOff: DOMAIN_STATE_ICONS.light.off,
        onService: "light.turn_on",
        offService: "light.turn_off",
        toggleService: "light.toggle",
      },
      hidden: false,
      order: 1
    },
    climate: {
      title: "Climates",
      showControls: true,
      controllerCardOptions: {
        iconOn: DOMAIN_STATE_ICONS.climate.on,
        iconOff: DOMAIN_STATE_ICONS.climate.off,
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
      title: "Media Players",
      showControls: true,
      controllerCardOptions: {
        iconOn: DOMAIN_STATE_ICONS.media_player.on,
        iconOff: DOMAIN_STATE_ICONS.media_player.off,
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
      title: "Covers",
      showControls: true,
      controllerCardOptions: {
        iconOn: DOMAIN_STATE_ICONS.cover.on,
        iconOff: DOMAIN_STATE_ICONS.cover.off,
        onService: "cover.open_cover",
        offService: "cover.close_cover",
        toggleService: "cover.toggle",
      },
      hidden: false,
      order: 4
    },
    scene: {
      title: "Scènes",
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
      title: "Fans",
      showControls: true,
      controllerCardOptions: {
        iconOn: DOMAIN_STATE_ICONS.fan.on,
        iconOff: DOMAIN_STATE_ICONS.fan.off,
        onService: "fan.turn_on",
        offService: "fan.turn_off",
        toggleService: "fan.toggle",
      },
      hidden: false,
      order: 6
    },
    switch: {
      title: "Switches",
      showControls: true,
      controllerCardOptions: {
        iconOn: DOMAIN_STATE_ICONS.switch.on,
        iconOff: DOMAIN_STATE_ICONS.switch.off,
        onService: "switch.turn_on",
        offService: "switch.turn_off",
        toggleService: "switch.toggle",
      },
      hidden: false,
      order: 7
    },
    camera: {
      title: "Cameras",
      showControls: false,
      controllerCardOptions: {
        iconOn: DOMAIN_STATE_ICONS.camera.on,
        iconOff: DOMAIN_STATE_ICONS.camera.on,
      },
      hidden: false,
      order: 8
    },
    lock: {
      title: "Locks",
      showControls: false,
      controllerCardOptions: {
        iconOn: DOMAIN_STATE_ICONS.lock.on,
        iconOff: DOMAIN_STATE_ICONS.lock.off,
      },
      hidden: false,
      order: 9
    },
    vacuum: {
      title: "Vacuums",
      showControls: true,
      controllerCardOptions: {
        iconOn: DOMAIN_STATE_ICONS.vacuum.on,
        iconOff: DOMAIN_STATE_ICONS.vacuum.off,
        onService: "vacuum.start",
        offService: "vacuum.stop",
      },
      hidden: false,
      order: 10
    },
    sensor: {
      title: "Sensors",
      showControls: false,
      hidden: false,
    },
    binary_sensor: {
      title: "Binary Sensors",
      showControls: false,
      hidden: false,
    },
    number: {
      title: "Numbers",
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
    securityDetails: {
      hidden: false,
    },
    motion: {
      hidden: false,
    },
    window: {
      hidden: false,
    },
    door: {
      hidden: false,
    },
    battery: {
      hidden: false,
    },
    temperature: {
      hidden: false,
    },
  }
};
