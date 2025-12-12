import { HomeAssistant } from "../types/homeassistant/types";
import { Helper } from "../Helper";

/**
 * Entity Resolution Result
 * 
 * Represents the result of resolving an entity from either Linus Brain or Magic Areas.
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
 * Resolves entities by prioritizing Linus Brain when available, then falling back to Magic Areas.
 * This enables hybrid support where both integrations can coexist.
 * 
 * **Entities replaced by Linus Brain (when present):**
 * - area_state → sensor.linus_brain_activity_{area}
 * - presence → binary_sensor.linus_brain_presence_detection_{area}
 * - light_control → switch.linus_brain_automatic_lighting_{area}
 * - all_lights → light.linus_brain_all_lights_{area}
 * 
 * **Entities kept from Magic Areas:**
 * - All aggregates (aggregate_*)
 * - All groups (climate_group, fan_group, etc.)
 * - All services (TOD scenes, light adaptation, etc.)
 */
export class EntityResolver {
  private hasLinusBrain: boolean;
  private hasMagicAreas: boolean;

  constructor(private hass: HomeAssistant) {
    this.hasLinusBrain = this.detectLinusBrain();
    this.hasMagicAreas = Object.keys(Helper.magicAreasDevices).length > 0;
  }

  /**
   * Resolves the area state entity
   * 
   * Priority: Linus Brain > Magic Areas > null
   * 
   * @param area_slug - The area slug (e.g., "salon", "kitchen")
   * @returns EntityResolution with the resolved entity
   */
  resolveAreaState(area_slug: string): EntityResolution {
    // 1. Try Linus Brain first
    if (this.hasLinusBrain) {
      const linusEntity = `sensor.linus_brain_activity_${area_slug}`;
      if (this.hass.states[linusEntity]) {
        return {
          entity_id: linusEntity,
          source: "linus_brain",
          fallback: Helper.magicAreasDevices[area_slug]?.entities?.area_state?.entity_id
        };
      }
    }

    // 2. Fallback to Magic Areas
    const magicEntity = Helper.magicAreasDevices[area_slug]?.entities?.area_state?.entity_id;
    if (magicEntity) {
      return { entity_id: magicEntity, source: "magic_areas" };
    }

    // 3. No entity available
    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the presence detection binary sensor
   * 
   * Priority: Linus Brain > null
   * Note: Magic Areas doesn't have a direct equivalent binary_sensor for presence
   * 
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolvePresenceSensor(area_slug: string): EntityResolution {
    // 1. Try Linus Brain
    if (this.hasLinusBrain) {
      const linusEntity = `binary_sensor.linus_brain_presence_detection_${area_slug}`;
      if (this.hass.states[linusEntity]) {
        return { entity_id: linusEntity, source: "linus_brain" };
      }
    }

    // 2. Magic Areas doesn't have a direct equivalent
    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the automatic light control switch
   * 
   * Priority: Linus Brain > Magic Areas > null
   * 
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveLightControlSwitch(area_slug: string): EntityResolution {
    // 1. Try Linus Brain with correct format: switch.linus_brain_automatic_lighting_{area}
    if (this.hasLinusBrain) {
      const linusEntity = `switch.linus_brain_feature_automatic_lighting_${area_slug}`;
      if (this.hass.states[linusEntity]) {
        return {
          entity_id: linusEntity,
          source: "linus_brain",
          fallback: Helper.magicAreasDevices[area_slug]?.entities?.light_control?.entity_id
        };
      }
    }

    // 2. Fallback to Magic Areas
    const magicEntity = Helper.magicAreasDevices[area_slug]?.entities?.light_control?.entity_id;
    if (magicEntity) {
      return { entity_id: magicEntity, source: "magic_areas" };
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves the all lights group entity
   * 
   * Priority: Linus Brain > Magic Areas > null
   * 
   * @param area_slug - The area slug
   * @returns EntityResolution with the resolved entity
   */
  resolveAllLights(area_slug: string): EntityResolution {
    // 1. Try Linus Brain with format: light.linus_brain_all_lights_{area}
    if (this.hasLinusBrain) {
      const linusEntity = `light.linus_brain_all_lights_${area_slug}`;
      if (this.hass.states[linusEntity]) {
        return {
          entity_id: linusEntity,
          source: "linus_brain",
          fallback: Helper.magicAreasDevices[area_slug]?.entities?.all_lights?.entity_id
        };
      }
    }

    // 2. Fallback to Magic Areas
    const magicEntity = Helper.magicAreasDevices[area_slug]?.entities?.all_lights?.entity_id;
    if (magicEntity) {
      return { entity_id: magicEntity, source: "magic_areas" };
    }

    return { entity_id: null, source: "native" };
  }

  /**
   * Resolves Magic Areas entities that don't have Linus Brain equivalents
   * 
   * This includes: aggregates, groups (climate, fan, media_player, cover), etc.
   * These entities are always returned from Magic Areas without replacement.
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

    // If Linus Brain, also fetch duration
    if (resolution.source === "linus_brain") {
      const durationEntity = this.hass.states[`sensor.linus_brain_activity_duration_${area_slug}`];
      return {
        state: stateEntity.state,
        duration: durationEntity ? parseFloat(durationEntity.state) : undefined,
        source: "linus_brain"
      };
    }

    // If Magic Areas
    return {
      state: stateEntity.state,
      source: "magic_areas"
    };
  }

  /**
   * Detects if Linus Brain integration is installed
   * 
   * Checks for presence of Linus Brain devices by looking for devices with
   * manufacturer="Linus Brain" and model="Area Intelligence"
   * 
   * @returns true if Linus Brain is detected
   */
  private detectLinusBrain(): boolean {
    const devices = Object.values(Helper.devices);
    const linusBrainDevices = devices.filter(
      device => device.manufacturer === "Linus Brain" && device.model === "Area Intelligence"
    );
    return linusBrainDevices.length > 0;
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
