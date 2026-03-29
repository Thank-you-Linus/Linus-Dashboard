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
 * Resolves entities from Linus Brain when available, otherwise returns null.
 *
 * **Entities provided by Linus Brain:**
 * - area_state → sensor.linus_brain_activity_{area}
 * - presence → binary_sensor.linus_brain_presence_detection_{area}
 * - light_control → switch.linus_brain_feature_automatic_lighting_{area}
 * - all_lights → light.linus_brain_all_lights_{area}
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
   * Resolves the presence detection binary sensor
   *
   * Priority: Linus Brain > null
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolvePresenceSensor(area_slug: string): EntityResolution {
    if (this.hasLinusBrain) {
      const linusEntity = `binary_sensor.linus_brain_presence_detection_${area_slug}`;
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
   * Resolves the all lights group entity
   *
   * Priority: Linus Brain > null
   *
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveAllLights(area_slug: string): EntityResolution {
    if (this.hasLinusBrain) {
      const linusEntity = `light.linus_brain_all_lights_${area_slug}`;
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
