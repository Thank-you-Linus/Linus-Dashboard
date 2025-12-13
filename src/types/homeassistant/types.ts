import {Auth, Connection, HassConfig, HassEntities, HassServices, MessageBase,} from "home-assistant-js-websocket";

import {AreaRegistryEntry} from "./data/area_registry";
import {DeviceRegistryEntry} from "./data/device_registry";
import {EntityRegistryDisplayEntry} from "./data/entity_registry";

export interface Credential {
  auth_provider_type: string;
  auth_provider_id: string;
}

export interface MFAModule {
  id: string;
  name: string;
  enabled: boolean;
}

export interface CurrentUser {
  id: string;
  is_owner: boolean;
  is_admin: boolean;
  name: string;
  credentials: Credential[];
  mfa_modules: MFAModule[];
}

export interface PanelInfo<T = Record<string, any> | null> {
  component_name: string;
  config: T;
  icon: string | null;
  title: string | null;
  url_path: string;
  config_panel_domain?: string;
}

export type Panels = Record<string, PanelInfo>;


export interface Translation {
  nativeName: string;
  isRTL: boolean;
  hash: string;
}

export interface TranslationMetadata {
  fragments: string[];
  translations: Record<string, Translation>;
}

export type Resources = Record<string, Record<string, string>>;

export interface HomeAssistant {
  auth: Auth & { external?: any };
  connection: Connection;
  connected: boolean;
  states: HassEntities;
  entities: Record<string, EntityRegistryDisplayEntry>;
  devices: Record<string, DeviceRegistryEntry>;
  areas: Record<string, AreaRegistryEntry>;
  services: HassServices;
  config: HassConfig;
  themes: Record<string, any>;
  selectedTheme: Record<string, any> | null;
  panels: Panels;
  panelUrl: string;
  // i18n
  // current effective language in that order:
  //   - backend saved user selected language
  //   - language in local app storage
  //   - browser language
  //   - english (en)
  language: string;
  // local stored language, keep that name for backward compatibility
  selectedLanguage: string | null;
  locale: Record<string, any>;
  resources: Resources;
  localize: Function;
  translationMetadata: TranslationMetadata;
  suspendWhenHidden: boolean;
  enableShortcuts: boolean;
  vibrate: boolean;
  debugConnection: boolean;
  dockedSidebar: "docked" | "always_hidden" | "auto";
  defaultPanel: string;
  moreInfoEntityId: string | null;
  user?: CurrentUser;
  userData?: Record<string, any> | null;

  callWS<T>(msg: MessageBase): Promise<T>;
}
