import { Helper } from "../Helper";
import { PopupActionConfig } from "../types/homeassistant/data/lovelace";
import { getDomainTranslationKey } from "../utils";
import { UNDISCLOSED } from "../variables";
import { generic } from "../types/strategy/generic";

import { AbstractPopup } from "./AbstractPopup";

type StrategyFloor = generic.StrategyFloor;

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
  /** Floor ID (for floor scope) - used to query entities dynamically */
  floor_id?: string;
  /** Area slug (for area scope) - used to query entities dynamically */
  area_slug?: string;
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
  /** Show navigation button to domain view (default: true for area/floor scope) */
  showNavigationButton?: boolean;
}

/**
 * Internal config type with entity_ids populated (used by build methods)
 * @private
 */
type AggregatePopupConfigWithEntities = AggregatePopupConfig & {
  entity_ids: string[];
};

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
    const { linusBrainEntity, domain, scope, floor_id, area_slug, device_class } = config;

    // Query entities dynamically based on scope
    const queryOptions: any = {
      domain,
      device_class
    };

    if (scope === "floor" && floor_id) {
      queryOptions.floor_id = floor_id;
    } else if (scope === "area" && area_slug) {
      queryOptions.area_slug = area_slug;
    }
    // For global scope, no additional filters needed

    const entity_ids = Helper.getEntityIds(queryOptions);

    // Store entity IDs
    this.#entity_ids = entity_ids;


    // Create config with entity_ids for backward compatibility with methods
    const configWithEntities = { ...config, entity_ids };


    // Always create custom popup (even if Linus Brain entity exists)
    const title = this.buildTitle(configWithEntities);
    const cards: any[] = [];

    // Check if domain is sensor only (needs statistics)
    const statisticsDomains = ["sensor"];
    const needsStatistics = statisticsDomains.includes(domain);

    // Check if domain is read-only (binary_sensor and sensor don't have control buttons)
    const readOnlyDomains = ["binary_sensor", "sensor"];
    const isReadOnly = readOnlyDomains.includes(domain);

    // 1. First line: Status + Navigation button (horizontal)
    const statusCard = needsStatistics
      ? this.buildStatisticsCard(configWithEntities)
      : this.buildStatusCard(configWithEntities);

    const showNavButton = config.showNavigationButton !== false;

    if (showNavButton) {
      const navButton = this.buildNavigationButton(configWithEntities);
      if (navButton) {
        // Horizontal layout with automatic sizing
        cards.push({
          type: "horizontal-stack",
          cards: [statusCard, navButton]
        });
      }
    } else {
      // No navigation button: just show status card
      cards.push(statusCard);
    }

    // 2. Second line: Control buttons (Turn All On / Turn All Off) - only for controllable domains
    if (!isReadOnly) {
      const controlButtons = this.buildControlButtons(configWithEntities);
      // Control buttons are already in horizontal-stack
      cards.push(controlButtons);
    }

    // 3. Linus Brain section (if exists) - positioned AFTER control buttons
    if (linusBrainEntity) {
      cards.push(this.buildLinusBrainSection(linusBrainEntity));
    }


    // 4. Separator (only if multiple entities)
    const separator = this.buildSeparator(configWithEntities);
    if (separator) {
      cards.push(separator);
    }


    // 5. Individual entity cards
    cards.push(...this.buildIndividualCards(configWithEntities));


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
  protected buildTitle(config: AggregatePopupConfigWithEntities): string {
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
   * Get status labels for active/inactive entities
   * Override this method in child classes for domain-specific labels
   * 
   * @param config - Popup configuration
   * @returns Object with active and inactive labels
   * @protected
   */
  protected getStatusLabels(config: AggregatePopupConfigWithEntities): {
    active: string;
    inactive: string
  } {
    const { domain } = config;

    // Domain-specific state translations - use our translations with (s) for plurals
    if (domain === 'cover') {
      // "ouvert(s)" / "fermé(s)"
      return {
        active: Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.state_open') || 'open',
        inactive: Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.state_closed') || 'closed'
      };
    }

    if (domain === 'lock') {
      return {
        active: Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.state_locked') || 'locked',
        inactive: Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.state_unlocked') || 'unlocked'
      };
    }

    // Default: on/off - use our translations with (s)
    return {
      active: Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.state_on') || 'on',
      inactive: Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.state_off') || 'off'
    };
  }

  /**
   * Build status card showing count of active/inactive entities
   * Uses Home Assistant translations for states
   */
  protected buildStatusCard(config: AggregatePopupConfigWithEntities) {
    const { entity_ids, activeStates } = config;

    // Create Jinja2 template for counting
    const statesArray = entity_ids.map(id => `states["${id}"]`).join(', ');
    const activeStatesCondition = activeStates.map(s => `'${s}'`).join(', ');

    // Get the "on" state label
    const labels = this.getStatusLabels(config);

    // Format: "5/6 allumé(s)" or "5/6 on"
    return {
      type: "markdown",
      content: `
        {% set entities = [${statesArray}] %}
        {% set active = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
        {% set total = entities | count %}
        **{{ active }}/{{ total }}** ${labels.active}
      `.trim()
    };
  }

  /**
   * Build statistics card for sensors (average or sum)
   * - For temperature, humidity, battery, etc.: Shows average
   * - For energy, power, etc.: Shows sum
   */
  protected buildStatisticsCard(config: AggregatePopupConfigWithEntities) {
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
  protected buildControlButtons(config: AggregatePopupConfigWithEntities) {
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
          layout: "horizontal",
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
          layout: "horizontal",
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
   * Build navigation button to domain view
   */
  protected buildNavigationButton(config: AggregatePopupConfigWithEntities) {
    const { domain, device_class } = config;

    // Determine navigation path
    // Only sensor and binary_sensor navigate to device_class view
    // Other domains (cover, etc.) navigate to domain view
    let navigationPath = domain;
    if (device_class && (domain === "sensor" || domain === "binary_sensor")) {
      navigationPath = device_class;
    }

    // Check if we're already on the navigation target page
    // Don't show navigation button if we're already there
    const currentPath = window.location.pathname;
    if (currentPath.includes(`/${navigationPath}`)) {
      return null; // Don't show button if already on target page
    }

    // Simple "View All" / "Voir tout" label
    const viewLabel = Helper.localize('component.linus_dashboard.entity.text.aggregate_popup.state.view_all')
      || 'View All';

    return {
      type: "custom:mushroom-template-card",
      primary: viewLabel,
      icon: "mdi:arrow-right",
      icon_color: "blue",
      layout: "horizontal",
      tap_action: {
        action: "navigate",
        navigation_path: navigationPath
      },
      hold_action: {
        action: "none"
      },
      double_tap_action: {
        action: "none"
      }
    };
  }

  /**
   * Build Linus Brain section (tile card for Linus Brain group entity)
   */
  protected buildLinusBrainSection(linusBrainEntity: string) {
    return {
      type: "tile",
      entity: linusBrainEntity,
      features: [
        { type: "light-brightness" },
      ],
      features_position: "inline"
    };
  }

  /**
   * Build separator title (only shown if multiple entities)
   */
  protected buildSeparator(config: AggregatePopupConfigWithEntities) {
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
   * Build clickable floor separator with aggregate badge (for global scope)
   * Shows status and opens floor sub-popup when clicked
   * 
   * Creates heading card with badges property (browser_mod compatible)
   *
   * @param config - Aggregate popup configuration
   * @param floorId - Floor ID for the separator
   * @param entityIds - Entity IDs for this floor (for badge display)
   * @returns Array with single heading card (with integrated badges) or empty array if no entities
   */
  protected buildFloorSeparator(
    config: AggregatePopupConfig,
    floorId: string,
    entityIds: string[]
  ): any[] {
    const { domain, device_class } = config;

    if (entityIds.length === 0) {
      return [];
    }

    // DEBUG: Log separator creation
    if (Helper.strategyOptions.debug) {
      console.warn(`[AggregatePopup] buildFloorSeparator(${floorId}): ${entityIds.length} entities passed`);
    }

    // Get floor info
    const floor = Helper.floors[floorId];
    if (!floor) return [];

    // Build sub-popup configuration for floor scope
    const { PopupFactory } = require("../services/PopupFactory");

    const subPopupAction = PopupFactory.createPopup({
      domain,
      device_class,
      scope: "floor",
      scopeName: floor.name,
      floor_id: floorId,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      linusBrainEntity: null,
      features: config.features,
      showNavigationButton: true,
    });

    // Create aggregate chip for floor control
    const { AggregateChip } = require("../chips/AggregateChip");
    const chip = new AggregateChip({
      domain,
      device_class,
      scope: "floor",
      floor_id: floorId,
      magic_device_id: "global",
      area_slug: "global",
      show_content: true
    }).getChip();

    // Build badges array (only if chip is valid)
    const badges: any[] = [];
    if (chip && chip.icon) {
      badges.push({
        type: "custom:mushroom-chips-card",
        chips: [chip],
        alignment: "end"
      });
    }

    // Return single heading card with integrated badges
    return [{
      type: "heading",
      heading: floor.name,
      heading_style: "title",
      icon: floor.icon ?? "mdi:floor-plan",
      tap_action: subPopupAction,
      badges
    }];
  }

  /**
   * Build clickable area separator with aggregate badge
   * Shows status and opens area sub-popup when clicked
   * 
   * Creates heading card with badges property (browser_mod compatible)
   *
   * @param config - Aggregate popup configuration
   * @param areaSlug - Area slug for the separator
   * @param entityIds - Entity IDs for this area (for badge display)
   * @returns Array with single heading card (with integrated badges) or empty array if no entities
   */
  protected buildAreaSeparator(
    config: AggregatePopupConfig,
    areaSlug: string,
    entityIds: string[]
  ): any[] {
    const { domain, device_class } = config;

    if (entityIds.length === 0) {
      return [];
    }

    // DEBUG: Log separator creation
    if (Helper.strategyOptions.debug) {
      console.warn(`[AggregatePopup] buildAreaSeparator(${areaSlug}): ${entityIds.length} entities`);
    }

    // Get area info
    const area = Helper.areas[areaSlug];
    if (!area) return [];

    // Build sub-popup configuration for area scope
    const { PopupFactory } = require("../services/PopupFactory");

    const subPopupAction = PopupFactory.createPopup({
      domain,
      device_class,
      scope: "area",
      scopeName: area.name,
      area_slug: areaSlug,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      linusBrainEntity: null,
      features: config.features,
      showNavigationButton: true,
    });

    // Create aggregate chip for area control
    const { AggregateChip } = require("../chips/AggregateChip");
    const chip = new AggregateChip({
      domain,
      device_class,
      scope: "area",
      area_slug: areaSlug,
      magic_device_id: areaSlug,
      show_content: true
    }).getChip();

    // Build badges array (only if chip is valid)
    const badges: any[] = [];
    if (chip && chip.icon) {
      badges.push({
        type: "custom:mushroom-chips-card",
        chips: [chip],
        alignment: "end"
      });
    }

    // Return single heading card with integrated badges
    return [{
      type: "heading",
      heading: area.name,
      heading_style: "subtitle",
      icon: area.icon ?? "mdi:home",
      tap_action: subPopupAction,
      badges
    }];
  }

  /**
   * Build non-clickable separator for undisclosed/unassigned entities
   * Shows a simple heading without badge or tap action
   *
   * @returns Array of cards [heading only]
   */
  protected buildUndisclosedSeparator(): any[] {
    // Get translation for "Non assigné" / "Unassigned"
    const undisclosedLabel = Helper.localize("ui.card.area.area_not_found") || "Non assigné";

    // Use SectionBuilder to create heading only (no badge, not clickable)
    const { SectionBuilder } = require("../builders/SectionBuilder");

    return SectionBuilder.buildSection({
      heading: undisclosedLabel,
      heading_style: "subtitle",
      icon: "mdi:help-circle",
      tap_action: undefined,  // Not clickable
      showBadge: false,  // No badge
      showAggregateChip: false,
      badgeTapAction: undefined,
      entity_ids: [],
      domain: "",
      device_class: undefined,
      activeStates: []
    });
  }

  /**
   * Build clickable floor/area separator with aggregate badge
   * Shows status and opens sub-popup when clicked
   *
   * @param config - Aggregate popup configuration
   * @param floorId - Floor ID for the separator
   * @param areaSlug - Optional area slug (for area separators in floor scope)
   * @returns Array of cards [heading with badge] or empty array if no entities
   */
  protected buildFloorAreaSeparators(
    config: AggregatePopupConfig,
    floorId: string,
    areaSlug?: string | null
  ): any[] {
    const { domain, device_class, activeStates } = config;

    // Get entities for this floor/area
    const getOptions: any = {
      domain,
      device_class
    };

    if (areaSlug) {
      // Area separator (in floor scope popup)
      getOptions.area_slug = areaSlug;
    } else {
      // Floor separator (in global scope popup)
      getOptions.floor_id = floorId;
    }

    const entityIds = Helper.getEntityIds(getOptions);

    if (entityIds.length === 0) {
      return [];
    }

    // Get floor/area info
    const floor = Helper.floors[floorId];
    const area = areaSlug ? Helper.areas[areaSlug] : null;
    const name = area ? area.name : (floor ? floor.name : "Unknown");
    const icon = area ? area.icon : (floor ? floor.icon : "mdi:home");

    // Build sub-popup configuration
    const { PopupFactory } = require("../services/PopupFactory");

    const subPopupScope = areaSlug ? "area" : "floor";
    const subPopupConfig: any = {
      domain,
      device_class,
      scope: subPopupScope,
      scopeName: name,
      entity_ids: entityIds,
      serviceOn: config.serviceOn,
      serviceOff: config.serviceOff,
      activeStates: config.activeStates,
      translationKey: config.translationKey,
      linusBrainEntity: null,
      features: config.features,
      showNavigationButton: true  // Don't show nav button in sub-popups
    };

    if (areaSlug) {
      subPopupConfig.area_slug = areaSlug;
    } else {
      subPopupConfig.floor_id = floorId;
    }

    const subPopupAction = PopupFactory.createPopup(subPopupConfig);

    // Use SectionBuilder to create heading + badge
    const { SectionBuilder } = require("../builders/SectionBuilder");

    return SectionBuilder.buildSection({
      heading: name,
      heading_style: "subtitle",
      icon: icon ?? "mdi:home",
      tap_action: subPopupAction,
      showBadge: true,
      showAggregateChip: true,
      badgeTapAction: subPopupAction,
      entity_ids: entityIds,
      domain,
      device_class,
      activeStates
    });
  }



  /**
   * Build individual cards using hierarchical floor → area iteration
   * (same logic as processFloorsAndAreas in utils.ts)
   * 
   * This method eliminates entity duplications by querying entities once per area
   * instead of re-querying with Helper.getEntityIds() multiple times.
   * 
   * @param config - Popup configuration with entity_ids
   * @param targetFloorId - Optional floor ID to limit scope (for floor scope)
   * @returns Array of card configurations
   */
  protected buildIndividualCardsHierarchical(
    config: AggregatePopupConfigWithEntities,
    targetFloorId?: string
  ): any[] {
    const { domain, device_class, scope } = config;
    const cards: any[] = [];

    // Determine which floors to iterate
    let floors = targetFloorId
      ? [Helper.floors[targetFloorId]].filter(Boolean)
      : Helper.orderedFloors;

    // For global scope: separate UNDISCLOSED floor to display at the end
    let undisclosedFloor: StrategyFloor | undefined;
    if (scope === "global") {
      undisclosedFloor = floors.find(f => f.floor_id === UNDISCLOSED);
      floors = floors.filter(f => f.floor_id !== UNDISCLOSED);
    }

    // Helper to process a single floor
    const processFloor = (floor: StrategyFloor, addFloorSeparator: boolean) => {
      // Skip excluded floors
      if (Helper.isFloorExcluded(floor.floor_id)) return;

      if (!floor.areas_slug || floor.areas_slug.length === 0) return;

      const floorCards: any[] = [];
      const floorEntityIds: string[] = [];

      for (const area_slug of floor.areas_slug) {
        const area = Helper.areas[area_slug];
        if (!area) continue;

        // Skip excluded areas
        if (Helper.isAreaExcluded(area.area_id)) continue;

        // Get entities for this area ONLY (single query per area)
        const entities = Helper.getAreaEntities(area, domain, device_class);
        if (entities.length === 0) continue;

        // Extract entity IDs
        const areaEntityIds = entities.map(e => e.entity_id);
        floorEntityIds.push(...areaEntityIds);

        // Add area separator/heading (using ControllerCard)
        const areaSeparator = this.buildAreaSeparator(config, area.slug, areaEntityIds);
        floorCards.push(...areaSeparator);

        // Add individual entity tiles (simple flat list - no GroupedCard wrapper)
        for (const entity of entities) {
          floorCards.push(this.buildEntityTile(entity.entity_id, config));
        }
      }

      // If floor has entities and we need floor separator (global scope)
      if (floorCards.length > 0) {
        if (addFloorSeparator) {
          const floorSeparator = this.buildFloorSeparator(config, floor.floor_id, floorEntityIds);
          cards.push(...floorSeparator);
        }
        cards.push(...floorCards);
      }
    };

    // Process regular floors
    for (const floor of floors) {
      processFloor(floor, scope === "global");
    }

    // Process UNDISCLOSED floor at the end (global scope only)
    if (undisclosedFloor) {
      processFloor(undisclosedFloor, false); // No floor separator for UNDISCLOSED
    }

    return cards;
  }

  /**
   * Build a tile card for an individual entity
   * Override this method in child classes to customize tile configuration
   * 
   * @param entity_id - Entity ID
   * @param config - Popup configuration
   * @returns Tile card configuration
   * @protected
   */
  protected buildEntityTile(entity_id: string, config: AggregatePopupConfigWithEntities): any {
    return {
      type: "tile",
      entity: entity_id,
      features: config.features || []
    };
  }

  /**
   * Build individual cards for area scope (no floor/area separators needed)
   * Returns simple flat list of tiles
   * 
   * @param config - Popup configuration with entity_ids
   * @returns Array of tile cards sorted by floor and area
   */
  protected buildIndividualCardsForArea(
    config: AggregatePopupConfigWithEntities
  ): any[] {
    const { entity_ids } = config;

    // Sort entities by floor and area for consistent ordering
    const sortedIds = Helper.sortEntitiesByFloorAndArea(entity_ids);

    // Build tile cards (simple flat list - no GroupedCard wrapper)
    return sortedIds.map(entity_id => this.buildEntityTile(entity_id, config));
  }

  /**
   * Build individual entity tile cards with features
   * Delegates to hierarchical builder for global/floor scopes
   * 
   * @param config - Popup configuration with entity_ids
   * @returns Array of card configurations
   */
  protected buildIndividualCards(config: AggregatePopupConfigWithEntities) {
    const { scope, floor_id, entity_ids } = config;

    if (Helper.strategyOptions.debug) {
      console.warn(`[AggregatePopup] buildIndividualCards()`, {
        scope,
        floor_id,
        entity_count: entity_ids.length,
      });
    }

    if (scope === "global") {
      // Global scope: iterate all floors → areas
      return this.buildIndividualCardsHierarchical(config);

    } else if (scope === "floor" && floor_id) {
      // Floor scope: iterate one floor → its areas
      return this.buildIndividualCardsHierarchical(config, floor_id);

    } else if (scope === "area") {
      // Area scope: simple tile list (no separators)
      return this.buildIndividualCardsForArea(config);

    } else {
      console.error(`[AggregatePopup] Invalid scope or missing floor_id`, { scope, floor_id });
      return [];
    }
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
