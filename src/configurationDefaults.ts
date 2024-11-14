import { generic } from "./types/strategy/generic";
import StrategyDefaults = generic.StrategyDefaults;
import MagicAreaRegistryEntry = generic.MagicAreaRegistryEntry;
import { ControlChip } from "./chips/ControlChip";
import { SettingsChip } from "./chips/SettingsChip";
import { LightSettings } from "./popups/LightSettingsPopup";
import { ToggleSceneChip } from "./chips/ToggleSceneChip";
import { SceneSettings } from "./popups/SceneSettingsPopup";

/**
 * Default configuration for the mushroom strategy.
 */
export const configurationDefaults: StrategyDefaults = {
  areas: {
    undisclosed: {
      slug: "undisclosed",
      aliases: [],
      area_id: "undisclosed",
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
      floor_id: "undisclosed",
      name: "Non assigné",
      hidden: false,
      areas: ["undisclosed"]
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
        return [
          new ControlChip(device?.entities.light_control?.entity_id).getChip(),
          new SettingsChip({ tap_action: new LightSettings(device).getPopup() }).getChip()
        ]
      },
      iconOn: "mdi:lightbulb-group",
      iconOff: "mdi:lightbulb-group-off",
      onService: "light.turn_on",
      offService: "light.turn_off",
      hidden: false,
      order: 1
    },
    scene: {
      title: "Scènes",
      showControls: false,
      extraControls: (device: MagicAreaRegistryEntry) => {

        return [
          {
            type: "conditional",
            conditions: [{
              entity: device?.entities.all_lights?.entity_id,
              state_not: "unavailable"
            }],
            chip: new ToggleSceneChip(device).getChip(),
          },
          new SettingsChip({ tap_action: new SceneSettings(device).getPopup() }).getChip()
        ]
      },
      iconOn: "mdi:lightbulb",
      iconOff: "mdi:lightbulb-off",
      onService: "scene.turn_on",
      hidden: false,
      order: 2
    },
    fan: {
      title: "Fans",
      showControls: true,
      iconOn: "mdi:fan",
      iconOff: "mdi:fan-off",
      onService: "fan.turn_on",
      offService: "fan.turn_off",
      hidden: false,
      order: 4
    },
    cover: {
      title: "Covers",
      showControls: true,
      iconOn: "mdi:arrow-up",
      iconOff: "mdi:arrow-down",
      onService: "cover.open_cover",
      offService: "cover.close_cover",
      hidden: false,
      order: 8
    },
    switch: {
      title: "Switches",
      showControls: true,
      iconOn: "mdi:power-plug",
      iconOff: "mdi:power-plug-off",
      onService: "switch.turn_on",
      offService: "switch.turn_off",
      hidden: false,
      order: 5
    },
    camera: {
      title: "Cameras",
      showControls: false,
      hidden: false,
      order: 6
    },
    lock: {
      title: "Locks",
      showControls: false,
      hidden: false,
      order: 7
    },
    climate: {
      title: "Climates",
      showControls: true,
      hidden: false,
      order: 3,
      extraControls: (device: MagicAreaRegistryEntry) => {
        return [
          new ControlChip(device?.entities.climate_control?.entity_id).getChip()
        ]
      },
    },
    media_player: {
      title: "Media Players",
      showControls: true,
      hidden: false,
      order: 9,
      extraControls: (device: MagicAreaRegistryEntry) => {
        return [
          new ControlChip(device?.entities.media_player_control?.entity_id).getChip()
        ]
      },
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
    vacuum: {
      title: "Vacuums",
      showControls: true,
      hidden: false,
      order: 10
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
    media_player: {
      order: 4,
      hidden: false,
    },
    climate: {
      order: 5,
      hidden: false,
    },
    fan: {
      order: 6,
      hidden: false,
    },
    cover: {
      order: 7,
      hidden: false,
    },
    camera: {
      order: 8,
      hidden: false,
    },
    switch: {
      order: 9,
      hidden: false,
    },
    vacuum: {
      order: 10,
      hidden: false,
    },
    scene: {
      order: 11,
      hidden: false,
    },
    securityDetails: {
      hidden: false,
    },
  }
};
