import { HomeAssistant } from "../types/homeassistant/types";
import { Helper } from "../Helper";

/**
 * Entity Resolution Result
 *
 * Represents the result of resolving an entity from Linus Brain.
 */
export interface EntityResolution {
  /** The resolved entity ID, or null if not found */
  entity_id: string | null;
  /** The source of the entity */
  source: "linus_brain" | "native";
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
 */
export class EntityResolver {
  private hasLinusBrain: boolean;

  constructor(private hass: HomeAssistant) {
    this.hasLinusBrain = this.detectLinusBrain();
  }

  /**
   * Resolves the area state entity
   *
   * Priority: Linus Brain > null
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
          return { entity_id: linusEntity, source: "linus_brain" };
        }
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
   * Priority: Linus Brain > null
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
          return { entity_id: linusEntity, source: "linus_brain" };
        }
      }
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the all-lights group entity for an area
   *
   * Source: Linus Dashboard native (light.linus_dashboard_all_lights_area_{area}).
   * No Linus Brain fallback — see class docstring.
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveAllLights(area_slug: string): EntityResolution {
    const entity_id = `light.linus_dashboard_all_lights_area_${area_slug}`;
    if (this.hass.states[entity_id]) {
      return { entity_id, source: "native" };
    }
    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the all-lights group entity for a floor
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
   * Resolves the climate group entity
   *
   * @param _area_slug - The area slug (unused, kept for API compatibility)
   * @returns EntityResolution with null (no Linus Brain climate group)
   */
  resolveClimateGroup(_area_slug: string): EntityResolution {
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

    return null;
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

    const linusBrainMainSensor = this.hass.states["sensor.linus_brain_rooms"];
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
    hasMagicAreas: false;
    mode: "linus_brain" | "none";
  } {
    return {
      hasLinusBrain: this.hasLinusBrain,
      hasMagicAreas: false,
      mode: this.hasLinusBrain ? "linus_brain" : "none",
    };
  }
}
