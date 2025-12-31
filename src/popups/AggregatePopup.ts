import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { getDomainTranslationKey } from "../utils";

import { AbstractPopup } from "./AbstractPopup";

/**
 * Configuration for AggregatePopup
 */
export interface AggregatePopupConfig {
  /** The domain (e.g., "light", "climate", "cover", etc.) */
  domain: string;
  /** Scope of control: global (all), floor (one floor), area (one area) */
  scope: "global" | "floor" | "area";
  /** Name to display in title (e.g., "Living Room", "Ground Floor", "Lights") */
  scopeName: string;
  /** Entity IDs to control */
  entity_ids: string[];
  /** Service name for turning on (e.g., "turn_on", "open_cover") */
  serviceOn: string;
  /** Service name for turning off (e.g., "turn_off", "close_cover") */
  serviceOff: string;
  /** States to count as "active" (e.g., ["on"], ["open", "opening"], etc.) */
  activeStates: string[];
  /** Translation key prefix for domain-specific text */
  translationKey: string;
  /** Linus Brain entity (if available, will use more-info instead of popup) */
  linusBrainEntity?: string | null;
  /** Features for tile cards (e.g., [{ type: "light-brightness" }]) */
  features?: any[];
  /** Device class (for covers, sensors, binary_sensors) */
  device_class?: string;
}

/**
 * Aggregate Popup Class
 * 
 * Creates a unified popup for controlling groups of entities across all views.
 * This replaces SmartControlPopup and provides a hybrid approach combining:
 * - Status display (X on • Y off)
 * - Bulk controls (Turn All On / Turn All Off)
 * - Individual entity controls (tile cards with features)
 * 
 * **Linus Brain Integration**:
 * If a Linus Brain group entity is detected, the popup automatically uses Home Assistant's
 * native more-info dialog instead of the custom popup.
 * 
 * **Magic Areas Filtering**:
 * All Magic Areas entities are automatically excluded from entity lists to avoid confusion
 * and ensure clean control groups.
 * 
 * **Home Assistant Translations**:
 * Uses HA's native translations for states (on/off, open/close, etc.) whenever possible.
 */
class AggregatePopup extends AbstractPopup {

  /**
   * Entity IDs included in this popup
   * @private
   */
  #entity_ids: string[] = [];

  /**
   * Returns the entity IDs included in this popup
   * Useful for checking if popup should be created (length > 0)
   */
  getEntityIds(): string[] {
    return this.#entity_ids;
  }

  getDefaultConfig(config: AggregatePopupConfig): PopupActionConfig {
    const { linusBrainEntity, entity_ids, domain } = config;

    // Store entity IDs
    this.#entity_ids = entity_ids;

    // If Linus Brain entity available → use more-info
    if (linusBrainEntity) {
      return {
        action: "more-info",
        entity: linusBrainEntity
      } as any; // Cast to any to allow more-info action
    }

    // Otherwise → custom popup
    const title = this.buildTitle(config);
    const cards: any[] = [];
    
    // Check if domain is sensor only (needs statistics)
    const statisticsDomains = ["sensor"];
    const needsStatistics = statisticsDomains.includes(domain);
    
    // Check if domain is read-only (binary_sensor and sensor don't have control buttons)
    const readOnlyDomains = ["binary_sensor", "sensor"];
    const isReadOnly = readOnlyDomains.includes(domain);

    // 1. Status card (X on • Y off) OR Statistics card (for sensors only)
    if (needsStatistics) {
      cards.push(this.buildStatisticsCard(config));
    } else {
      cards.push(this.buildStatusCard(config));
    }
    
    // 2. Control buttons (Turn All On / Turn All Off) - only for controllable domains
    if (!isReadOnly) {
      cards.push(this.buildControlButtons(config));
    }

    // 3. Separator (only if multiple entities)
    const separator = this.buildSeparator(config);
    if (separator) {
      cards.push(separator);
    }

    // 4. Individual entity cards
    cards.push(...this.buildIndividualCards(config));

    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title,
          content: {
            type: "vertical-stack",
            cards
          }
        }
      }
    };
  }

  /**
   * Build dynamic title based on scope
   * 
   * Examples:
   * - Global: "Lights"
   * - Floor: "Lights - Ground Floor"
   * - Area: "Living Room" or "Lights Living Room" (avoids duplication)
   */
  protected buildTitle(config: AggregatePopupConfig): string {
    // Get domain label using HA translations with device_class support
    // For sensor/binary_sensor with device_class: use device_class translation (e.g., "Temperature")
    // For other domains: use generic domain translation (e.g., "Lights")
    const translationKey = getDomainTranslationKey(config.domain, config.device_class);
    const haTranslation = Helper.localize(translationKey);
    const domainLabel =
      (haTranslation && haTranslation !== "translation not found" ? haTranslation : null) ||
      Helper.strategyOptions.domains[config.device_class ? `${config.domain}_${config.device_class}` : config.domain]?.title ||
      (config.translationKey ? config.translationKey.charAt(0).toUpperCase() + config.translationKey.slice(1) : null) ||
      (config.device_class ? config.device_class.charAt(0).toUpperCase() + config.device_class.slice(1) : null) ||
      config.domain.charAt(0).toUpperCase() + config.domain.slice(1);
    
    switch (config.scope) {
      case "global":
        return domainLabel; // "Lights", "Climates", etc.
      
      case "floor":
        return `${domainLabel} - ${config.scopeName}`; // "Lights - Ground Floor"
      
      case "area": {
        // Avoid duplication if area name already contains domain
        const lowerName = config.scopeName.toLowerCase();
        const lowerDomain = domainLabel.toLowerCase();
        if (lowerName.includes(lowerDomain)) {
          return config.scopeName; // "Living Room Lights" → "Living Room Lights"
        }
        return `${domainLabel} ${config.scopeName.toLowerCase()}`; // "Lights living room"
      }
    }
  }

  /**
   * Build status card showing count of active/inactive entities
   * Uses Home Assistant translations for states
   */
  protected buildStatusCard(config: AggregatePopupConfig) {
    const { entity_ids, activeStates } = config;
    
    // Create Jinja2 template for counting
    const statesArray = entity_ids.map(id => `states["${id}"]`).join(', ');
    const activeStatesCondition = activeStates.map(s => `'${s}'`).join(', ');
    
    // Use HA translations for "on"/"off" states
    // Fallback to generic localization if HA translation not available
    const stateOn = Helper.localize(`component.${config.domain}.entity_component._.state.on`) 
      || Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.state_on')
      || 'on';
    const stateOff = Helper.localize(`component.${config.domain}.entity_component._.state.off`)
      || Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.state_off')
      || 'off';
    
    return {
      type: "markdown",
      content: `
        {% set entities = [${statesArray}] %}
        {% set active = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
        {% set inactive = entities | count - active %}
        **{{ active }}** ${stateOn} • **{{ inactive }}** ${stateOff}
      `.trim()
    };
  }

  /**
   * Build statistics card for sensors (average or sum)
   * - For temperature, humidity, battery, etc.: Shows average
   * - For energy, power, etc.: Shows sum
   */
  protected buildStatisticsCard(config: AggregatePopupConfig) {
    const { entity_ids, device_class } = config;
    
    // Determine if we should use SUM or AVERAGE based on device_class
    const sumDeviceClasses = ["energy", "power", "gas", "water", "voltage", "current", "data_size"];
    const useSum = device_class && sumDeviceClasses.includes(device_class);
    
    // Create Jinja2 template for statistics
    const statesArray = entity_ids.map(id => `states["${id}"]`).join(', ');
    
    // Get unit from first entity state
    const firstEntityState = Helper.getEntityState(entity_ids[0]);
    const unit = firstEntityState?.attributes?.unit_of_measurement || '';
    
    const statLabel = useSum 
      ? (Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.total') || 'Total')
      : (Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.average') || 'Average');
    
    const jinjaCalculation = useSum
      ? `{% set entities = [${statesArray}] %}
         {% set valid = entities | selectattr('state', 'is_number') | map(attribute='state') | map('float') | list %}
         {% set result = valid | sum | round(1) if valid | length > 0 else '—' %}`
      : `{% set entities = [${statesArray}] %}
         {% set valid = entities | selectattr('state', 'is_number') | map(attribute='state') | map('float') | list %}
         {% set result = (valid | sum / valid | length) | round(1) if valid | length > 0 else '—' %}`;
    
    return {
      type: "markdown",
      content: `
        ${jinjaCalculation}
        **${statLabel}:** {{ result }} ${unit}
      `.trim()
    };
  }

  /**
   * Build control buttons (Turn All On / Turn All Off)
   * Uses Home Assistant service names
   */
  protected buildControlButtons(config: AggregatePopupConfig) {
    const { domain, serviceOn, serviceOff, entity_ids, translationKey } = config;
    
    // Use custom translations for action labels
    const actionOn = Helper.localize(`component.linus_dashboard.entity.text.aggregate_popup.state.action_on_${translationKey}`)
      || `Turn All On`;
    const actionOff = Helper.localize(`component.linus_dashboard.entity.text.aggregate_popup.state.action_off_${translationKey}`)
      || `Turn All Off`;
    
    return {
      type: "horizontal-stack",
      cards: [
        // Turn All ON button
        {
          type: "custom:mushroom-template-card",
          primary: actionOn,
          icon: "mdi:power-on",
          icon_color: "green",
          layout: "vertical",
          tap_action: {
            action: "call-service",
            service: `${domain}.${serviceOn}`,
            data: {
              entity_id: entity_ids
            }
          },
          hold_action: {
            action: "none"
          },
          double_tap_action: {
            action: "none"
          }
        },
        
        // Turn All OFF button
        {
          type: "custom:mushroom-template-card",
          primary: actionOff,
          icon: "mdi:power-off",
          icon_color: "red",
          layout: "vertical",
          tap_action: {
            action: "call-service",
            service: `${domain}.${serviceOff}`,
            data: {
              entity_id: entity_ids
            }
          },
          hold_action: {
            action: "none"
          },
          double_tap_action: {
            action: "none"
          }
        }
      ]
    };
  }

  /**
   * Build separator title (only shown if multiple entities)
   */
  protected buildSeparator(config: AggregatePopupConfig) {
    // Only show separator if more than one entity
    if (config.entity_ids.length <= 1) {
      return null;
    }
    
    const subtitle = Helper.localize("component.linus_dashboard.entity.text.aggregate_popup.state.individual_controls")
      || "Individual Controls";
    
    return {
      type: "custom:mushroom-title-card",
      subtitle,
      card_mod: {
        style: `
          ha-card.header {
            padding-top: 8px;
            padding-bottom: 4px;
          }
        `
      }
    };
  }

  /**
   * Build individual entity tile cards with features
   */
  protected buildIndividualCards(config: AggregatePopupConfig) {
    const { entity_ids, features } = config;
    
    return entity_ids.map(entity_id => ({
      type: "tile",
      entity: entity_id,
      features: features || []
    }));
  }

  /**
   * Class Constructor.
   * 
   * @param {AggregatePopupConfig} config - Configuration for the popup
   */
  constructor(config: AggregatePopupConfig) {
    super();
    const defaultConfig = this.getDefaultConfig(config);
    this.config = Object.assign(this.config, defaultConfig);
  }
}

export { AggregatePopup };
