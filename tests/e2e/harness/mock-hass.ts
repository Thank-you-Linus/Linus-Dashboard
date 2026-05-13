/**
 * Mock Home Assistant Implementation
 *
 * Provides a minimal HomeAssistant-like object for testing the Linus Strategy
 * without requiring a full HA backend.
 */

import type { HAFixture } from './fixture-loader';

export interface MockHass {
  states: Record<string, any>;
  user: { name: string; is_admin: boolean };
  localize: (key: string, ...args: any[]) => string;
  callWS: (msg: any) => Promise<any>;
  panels: Record<string, any>;
  config: {
    components: string[];
    location_name: string;
    latitude: number;
    longitude: number;
    currency: string;
  };
}

/**
 * Create a mock HomeAssistant object from a fixture.
 */
export function createMockHass(fixture: HAFixture): MockHass {
  const mockHass: MockHass = {
    states: fixture.states,
    user: {
      name: 'Test User',
      is_admin: true,
    },
    localize: createLocalizeMock(),
    callWS: createCallWSMock(fixture),
    panels: {
      lovelace: {
        title: 'Dashboard',
        icon: 'mdi:view-dashboard',
        url_path: 'lovelace',
      },
    },
    config: {
      components: [
        'climate',
        'light',
        'media_player',
        'sensor',
        'binary_sensor',
        'switch',
        'cover',
        'lock',
        'camera',
        'weather',
        'fan',
        'device_tracker',
      ],
      location_name: 'Home',
      latitude: 40.7128,
      longitude: -74.006,
      currency: 'USD',
    },
  };

  return mockHass;
}

/**
 * Create a mock localize function.
 */
function createLocalizeMock(): (key: string, ...args: any[]) => string {
  const translations: Record<string, string> = {
    'ui.components.weather.attributes.temperature': 'Temperature',
    'ui.components.weather.attributes.humidity': 'Humidity',
    'ui.card.climate.currently': 'Currently',
    'ui.card.climate.operation': 'Operation',
    'ui.card.light.brightness': 'Brightness',
    'ui.card.media_player.source': 'Source',
    'ui.card.cover.position': 'Position',
    'state.default.on': 'On',
    'state.default.off': 'Off',
    'state.climate.cool': 'Cool',
    'state.climate.heat': 'Heat',
    'state.climate.off': 'Off',
    'state.climate.auto': 'Auto',
    'state.media_player.playing': 'Playing',
    'state.media_player.paused': 'Paused',
    'state.media_player.idle': 'Idle',
    'state.media_player.off': 'Off',
    'state.cover.open': 'Open',
    'state.cover.closed': 'Closed',
    'state.lock.locked': 'Locked',
    'state.lock.unlocked': 'Unlocked',
    'state.binary_sensor.on': 'Detected',
    'state.binary_sensor.off': 'Clear',
    'state.weather.sunny': 'Sunny',
    'state.weather.cloudy': 'Cloudy',
    'state.weather.rainy': 'Rainy',
  };

  return (key: string, ...args: any[]) => {
    let translation = translations[key] || key.split('.').pop() || key;

    // Simple placeholder replacement
    args.forEach((arg, index) => {
      translation = translation.replace(`{${index}}`, String(arg));
    });

    return translation;
  };
}

/**
 * Create a mock WebSocket call handler.
 */
function createCallWSMock(fixture: HAFixture): (msg: any) => Promise<any> {
  return async (msg: any): Promise<any> => {
    const { type, category } = msg;

    switch (type) {
      case 'config/entity_registry/list':
        return fixture.entityRegistry;

      case 'config/device_registry/list':
        return fixture.deviceRegistry;

      case 'config/area_registry/list':
        return fixture.areaRegistry;

      case 'config/floor_registry/list':
        return fixture.floorRegistry;

      case 'config/label_registry/list':
        return fixture.labelRegistry;

      case 'frontend/get_icons':
        if (category === 'entity_component' || category === 'services') {
          return { resources: fixture.icons.resources || fixture.icons };
        }
        return { resources: {} };

      case 'linus_dashboard/get_config':
        return fixture.linusConfig;

      default:
        console.warn(`Unhandled WebSocket call: ${type}`);
        return null;
    }
  };
}

/**
 * Create a mock dashboard info object for strategy testing.
 */
export function createDashboardInfo(
  mockHass: MockHass,
  config: any = {}
): {
  hass: MockHass;
  config: any;
  narrow: boolean;
  panel: any;
  route: any;
} {
  return {
    hass: mockHass,
    config: {
      strategy: {
        type: 'custom:linus-strategy',
        options: {},
      },
      views: [],
      ...config,
    },
    narrow: false,
    panel: {
      config: {
        title: 'Linus Dashboard',
      },
    },
    route: {
      prefix: '',
      path: '/lovelace',
    },
  };
}

/**
 * Create a mock view info object for generateView testing.
 */
export function createViewInfo(
  mockHass: MockHass,
  viewOptions: any = {}
): {
  hass: MockHass;
  view: any;
  narrow: boolean;
  panel: any;
  route: any;
} {
  return {
    hass: mockHass,
    view: {
      strategy: {
        type: 'custom:linus-strategy',
        options: viewOptions,
      },
    },
    narrow: false,
    panel: {
      config: {
        title: 'Linus Dashboard',
      },
    },
    route: {
      prefix: '',
      path: '/lovelace',
    },
  };
}
