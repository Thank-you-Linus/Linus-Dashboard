import { HomeAssistant } from "../types/homeassistant/types";
import { Helper } from "../Helper";

/**
 * Entity Resolution Result
 *
 * Represents the result of resolving an entity from Linus Brain, Magic Areas, or native HA.
 */
export interface EntityResolution {
  /** The resolved entity ID, or null if not found */
  entity_id: string | null;
  /** The source of the entity */
  source: "linus_brain" | "magic_areas" | "native";
  /** Fallback entity ID if the primary one is not available */
  fallback?: string;
}

/**
 * Entity Resolver
 *
 * Resolves entities from Linus Brain when available, otherwise returns null
 * (for the two entities Brain still owns) or a Linus Dashboard-native entity
 * (for the two that moved here — see below).
 *
 * **Entities still provided by Linus Brain (unchanged):**
 * - area_state → sensor.linus_brain_activity_{area}
 * - light_control → switch.linus_brain_feature_automatic_lighting_{area}
 *
 * **Entities now provided natively by Linus Dashboard (no Brain needed):**
 * - presence → binary_sensor.linus_dashboard_presence_detection_area_{area}
 * - all_lights → light.linus_dashboard_all_lights_area_{area}
 *
 * Presence and all_lights used to be Brain-only (`source: "linus_brain"` with
 * a `null` fallback when Brain wasn't installed). They're mechanical
 * aggregation (an OR-gate over motion/presence/occupancy sensors, a group of
 * every light in the area) rather than anything AI-driven, so they moved to
 * Dashboard to be available to every user, not just those with the
 * (optional, experimental) Brain companion integration installed. No
 * backward compatibility with the old `linus_brain_presence_detection_*` /
 * `linus_brain_all_lights_*` entity_id is kept — clean cut, not a dual
 * fallback (see PR description for the reasoning).
 *
 * **Entities kept from Magic Areas (fallback, when Brain doesn't provide them,
 * or — for the dedicated-group domains below — when the native entity is
 * unavailable):**
 * - area_state, light_control, all_lights, climate_group, media_player_group
 * - All aggregates (aggregate_*), groups (climate_group, media_player_group)
 * - TOD scene services, presence_hold
 */
export class EntityResolver {
  private hasLinusBrain: boolean;
  private hasMagicAreas: boolean;

  constructor(private hass: HomeAssistant) {
    this.hasMagicAreas = this.detectMagicAreas();
    this.hasLinusBrain = this.detectLinusBrain();
  }

  /**
   * Resolves the area state entity
   *
   * Priority: Linus Brain > Magic Areas > native
   *
   * @param area_slug - The area slug (e.g., "salon", "kitchen")
   * @returns EntityResolution with the resolved entity
   */
  resolveAreaState(area_slug: string): EntityResolution {
    if (this.hasLinusBrain) {
      const linusEntity = `sensor.linus_brain_activity_${area_slug}`;
      if (this.hass.states[linusEntity]) {
        const state = this.hass.states[linusEntity];
        if (state.state !== "unavailable" && state.state !== "unknown") {
          return {
            entity_id: linusEntity,
            source: "linus_brain",
            fallback: Helper.magicAreasDevices[area_slug]?.entities?.area_state?.entity_id
          };
        }
      }
    }

    if (this.hasMagicAreas) {
      const magicEntity = Helper.magicAreasDevices[area_slug]?.entities?.area_state?.entity_id;
      if (magicEntity) {
        return { entity_id: magicEntity, source: "magic_areas" };
      }
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the presence detection binary sensor for an area
   *
   * Source: Linus Dashboard native (binary_sensor.linus_dashboard_presence_detection_area_{area}).
   * No Linus Brain fallback — see class docstring.
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolvePresenceSensor(area_slug: string): EntityResolution {
    const entity_id = `binary_sensor.linus_dashboard_presence_detection_area_${area_slug}`;
    if (this.hass.states[entity_id]) {
      return { entity_id, source: "native" };
    }
    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the presence detection binary sensor for a floor
   *
   * @param floor_slug - The floor slug
   * @returns EntityResolution with the resolved entity
   */
  resolvePresenceSensorForFloor(floor_slug: string): EntityResolution {
    const entity_id = `binary_sensor.linus_dashboard_presence_detection_floor_${floor_slug}`;
    if (this.hass.states[entity_id]) {
      return { entity_id, source: "native" };
    }
    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the automatic light control switch
   *
   * Priority: Linus Brain > Magic Areas > native
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveLightControlSwitch(area_slug: string): EntityResolution {
    if (this.hasLinusBrain) {
      const linusEntity = `switch.linus_brain_feature_automatic_lighting_${area_slug}`;
      if (this.hass.states[linusEntity]) {
        const state = this.hass.states[linusEntity];
        if (state.state !== "unavailable" && state.state !== "unknown") {
          return {
            entity_id: linusEntity,
            source: "linus_brain",
            fallback: Helper.magicAreasDevices[area_slug]?.entities?.light_control?.entity_id
          };
        }
      }
    }

    if (this.hasMagicAreas) {
      const magicEntity = Helper.magicAreasDevices[area_slug]?.entities?.light_control?.entity_id;
      if (magicEntity) {
        return { entity_id: magicEntity, source: "magic_areas" };
      }
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the all-lights group entity for an area
   *
   * Priority: Linus Dashboard native (light.linus_dashboard_all_lights_area_{area})
   * > Magic Areas > native. No Linus Brain branch — see class docstring.
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveAllLights(area_slug: string): EntityResolution {
    const entity_id = `light.linus_dashboard_all_lights_area_${area_slug}`;
    if (this.hass.states[entity_id]) {
      return { entity_id, source: "native" };
    }

    if (this.hasMagicAreas) {
      const magicEntity = Helper.magicAreasDevices[area_slug]?.entities?.all_lights?.entity_id;
      if (magicEntity) {
        return { entity_id: magicEntity, source: "magic_areas" };
      }
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the all-lights group entity for a floor
   *
   * Linus Dashboard native only — Magic Areas has no floor concept.
   *
   * @param floor_slug - The floor slug
   * @returns EntityResolution with the resolved entity
   */
  resolveAllLightsForFloor(floor_slug: string): EntityResolution {
    const entity_id = `light.linus_dashboard_all_lights_floor_${floor_slug}`;
    if (this.hass.states[entity_id]) {
      return { entity_id, source: "native" };
    }
    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves a Linus Dashboard native area-scope group entity for domains
   * with no Magic Areas equivalent (switch/fan/cover/siren — Magic Areas
   * only provides light/climate/media_player groups). One generic method
   * rather than one per domain since the resolution logic is identical;
   * only the entity_id's domain and "all_X" slug vary.
   *
   * @param domain - switch/fan/cover/siren
   * @param groupSlug - the slug each platform uses in its unique_id, e.g.
   *   "all_switches" for switch.py, "all_fans" for fan.py
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveGroupEntity(domain: string, groupSlug: string, area_slug: string): EntityResolution {
    const entity_id = `${domain}.linus_dashboard_${groupSlug}_area_${area_slug}`;
    if (this.hass.states[entity_id]) {
      return { entity_id, source: "native" };
    }
    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the climate group entity
   *
   * Priority: Linus Brain (future) > Magic Areas > native
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveClimateGroup(area_slug: string): EntityResolution {
    if (this.hasMagicAreas) {
      return this.resolveMagicAreasEntity(area_slug, "climate_group");
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the media player group entity
   *
   * Priority: Magic Areas > native. Unlike climate, there IS a Linus
   * Dashboard-native media_player group too (media_player.py) — but
   * AggregateChip's getAggregateSensorId already tries that one first, at
   * every scope, before this ever gets called (see AggregateChip's
   * getGroupEntity, area-scope only, secondary fallback for when the native
   * entity happens to be unavailable). Magic Areas' own media_player_group
   * (homeassistant.components.group.media_player.MediaPlayerGroup under the
   * hood) is a real media_player entity, unlike media_player_control
   * (a boolean switch — can't serve as this tile's target).
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveMediaPlayerGroup(area_slug: string): EntityResolution {
    if (this.hasMagicAreas) {
      return this.resolveMagicAreasEntity(area_slug, "media_player_group");
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the climate control switch entity
   *
   * Priority: Magic Areas > native
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveClimateControlSwitch(area_slug: string): EntityResolution {
    if (this.hasMagicAreas) {
      return this.resolveMagicAreasEntity(area_slug, "climate_control");
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the media player control switch entity
   *
   * Priority: Magic Areas > native
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveMediaPlayerControlSwitch(area_slug: string): EntityResolution {
    if (this.hasMagicAreas) {
      return this.resolveMagicAreasEntity(area_slug, "media_player_control");
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves Magic Areas entities that don't have Linus Brain equivalents
   *
   * @param area_slug - The area slug
   * @param entity_type - The entity type key (e.g., "aggregate_health", "climate_group")
   * @returns EntityResolution with the Magic Areas entity
   */
  resolveMagicAreasEntity(area_slug: string, entity_type: string): EntityResolution {
    const entity = Helper.magicAreasDevices[area_slug]?.entities?.[entity_type];

    if (entity?.entity_id) {
      return { entity_id: entity.entity_id, source: "magic_areas" };
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Gets activity information for an area
   *
   * Returns state and duration (if available from Linus Brain)
   *
   * @param area_slug - The area slug
   * @returns Activity info object or null
   */
  getActivityInfo(area_slug: string): {
    state: string;
    duration?: number;
    source: string;
  } | null {
    const resolution = this.resolveAreaState(area_slug);

    if (!resolution.entity_id) return null;

    const stateEntity = this.hass.states[resolution.entity_id];
    if (!stateEntity) return null;

    if (resolution.source === "linus_brain") {
      const durationEntity = this.hass.states[`sensor.linus_brain_activity_duration_${area_slug}`];
      return {
        state: stateEntity.state,
        duration: durationEntity ? parseFloat(durationEntity.state) : undefined,
        source: "linus_brain"
      };
    }

    if (resolution.source === "magic_areas") {
      return {
        state: stateEntity.state,
        source: "magic_areas"
      };
    }

    return null;
  }

  /**
   * Detects if Magic Areas integration is installed and enabled
   *
   * Checks for any enabled MA device entity, trying area_state first,
   * then falling back to any other entity on the device.
   *
   * @returns true if Magic Areas is detected and has at least one enabled entity
   */
  private detectMagicAreas(): boolean {
    if (Object.keys(Helper.magicAreasDevices).length === 0) {
      return false;
    }

    for (const magicDevice of Object.values(Helper.magicAreasDevices)) {
      // Primary check: area_state entity
      const areaStateEntity = magicDevice.entities?.area_state?.entity_id;
      if (areaStateEntity) {
        const state = this.hass.states[areaStateEntity];
        if (state && state.state !== "unavailable") {
          return true;
        }
      }

      // Fallback: any other entity on this MA device
      for (const entity of Object.values(magicDevice.entities)) {
        if (entity?.entity_id) {
          const state = this.hass.states[entity.entity_id];
          if (state && state.state !== "unavailable") {
            return true;
          }
        }
      }
    }

    return false;
  }

  /**
   * Detects if Linus Brain integration is installed and enabled
   *
   * @returns true if Linus Brain is detected and has at least one enabled entity
   */
  private detectLinusBrain(): boolean {
    const devices = Object.values(Helper.devices);
    const linusBrainDevices = devices.filter(
      device => device.manufacturer === "Linus Brain" && device.model === "Area Intelligence"
    );

    if (linusBrainDevices.length === 0) {
      return false;
    }

    const linusBrainMainSensor = this.hass.states["sensor.linus_brain_monitored_areas"];
    if (linusBrainMainSensor && linusBrainMainSensor.state !== "unavailable") {
      return true;
    }

    const linusBrainEntities = Object.keys(this.hass.states).filter(
      entity_id => entity_id.includes("linus_brain")
    );

    return linusBrainEntities.some(
      entity_id => this.hass.states[entity_id]?.state !== "unavailable"
    );
  }

  /**
   * Gets the detection status
   *
   * @returns Object with detection flags
   */
  getDetectionStatus(): {
    hasLinusBrain: boolean;
    hasMagicAreas: boolean;
    mode: "linus_brain" | "magic_areas" | "hybrid" | "none";
  } {
    const mode = this.hasLinusBrain && this.hasMagicAreas
      ? "hybrid"
      : this.hasLinusBrain
        ? "linus_brain"
        : this.hasMagicAreas
          ? "magic_areas"
          : "none";

    return {
      hasLinusBrain: this.hasLinusBrain,
      hasMagicAreas: this.hasMagicAreas,
      mode
    };
  }
}
