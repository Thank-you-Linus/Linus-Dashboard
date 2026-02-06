import { Helper } from "../Helper";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { AlarmCard } from "../cards/AlarmCard";
import { PersonCard } from "../cards/PersonCard";
import { SecurityStatusCard } from "../cards/SecurityStatusCard";
import { SecurityActivityCard } from "../cards/SecurityActivityCard";
import { getDomainTranslationKey } from "../utils";
import { parseDomainTag } from "../utils/domainTagHelper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { RefreshChip } from "../chips/RefreshChip";
import { UnavailableChip } from "../chips/UnavailableChip";
import { SettingsChip } from "../chips/SettingsChip";
import { SettingsPopup } from "../popups/SettingsPopup";
import { SECURITY_EXPOSED_CHIPS, SECURITY_EXPOSED_DOMAINS } from "../variables";
import { ChipFactory } from "../factories/ChipFactory";
import { PopupFactory } from "../services/PopupFactory";
import { AggregateChip } from "../chips/AggregateChip";

/**
 * Security View Class.
 *
 * To create a new view, extend the new class with this one.
 *
 * @class
 * @abstract
 */
class SecurityView {
  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  config: views.ViewConfig = {
    title: Helper.localize("component.binary_sensor.entity_component.safety.name"),
    icon: "mdi:security",
    type: "sections",
  };

  /**
   * A card to switch all entities in the view.
   *
   * @type {LovelaceCardConfig[]}
   */
  viewControllerCard: LovelaceCardConfig[] = []

  /**
   * Class constructor.
   *
   * @throws {Error} If trying to instantiate this class.
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor() {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {

    if (Helper.strategyOptions.home_view.hidden.includes("chips")) {
      // Chips section is hidden.

      return [];
    }

    const chips: LovelaceChipConfig[] = [];

    // Multi-alarmes : affiche un chip pour chaque alarme
    const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
    if (Array.isArray(alarmEntityIds) && alarmEntityIds.length > 0) {
      try {
        for (const alarmEntityId of alarmEntityIds) {
          const alarmChip = await ChipFactory.createChip("AlarmChip", alarmEntityId);
          if (alarmChip) chips.push(alarmChip);
        }
      } catch (e) {
        Helper.logError("An error occurred while creating the alarm chips!", e);
      }
    }

    // Create chips for security domains
    // Only show content (badge) if there are active entities (count > 0)
    for (const domainTag of SECURITY_EXPOSED_CHIPS) {
      const { domain, device_class } = parseDomainTag(domainTag);

      // Skip excluded domains
      if (Helper.linus_dashboard_config?.excluded_domains?.includes(domain)) {
        continue;
      }

      // Skip excluded device classes
      if (device_class && Helper.linus_dashboard_config?.excluded_device_classes?.includes(device_class)) {
        continue;
      }

      // Skip special domains handled separately
      if (domain === "weather" || domain === "alarm" || domain === "spotify" || domain === "safety") {
        continue;
      }

      // Get entities for this domain
      const entity_ids = Helper.getEntityIds({ domain, device_class });

      if (entity_ids.length === 0) {
        continue;
      }

      // Check if there are any active entities
      const states = entity_ids.map(id => Helper.getEntityState(id)).filter(s => s);
      const hasActiveEntities = states.some(state =>
        state.state === "on" || state.state === "open" || state.state === "opening" ||
        state.state === "playing" || state.state === "heat" || state.state === "cool" ||
        state.state === "auto"
      );

      // Only show content (badge) if there are active entities
      const chip = new AggregateChip({
        domain,
        device_class,
        scope: "global",
        show_content: hasActiveEntities,
        tapActionMode: "popup"
      }).getChip();

      if (chip) {
        chips.push(chip);
      }
    }

    // Unavailable chip - CRITIQUE pour sécurité
    const unavailableChip = new UnavailableChip().getChip();
    if (unavailableChip) chips.push(unavailableChip);

    // Refresh chip - allows manual refresh of registries
    const refreshChip = new RefreshChip();
    chips.push(refreshChip.getChip());

    // Settings chip - cohérence avec HomeView
    const settingsChip = new SettingsChip({
      tap_action: new SettingsPopup().getPopup()
    });
    chips.push(settingsChip.getChip());

    return chips.map(chip => ({
      type: "custom:mushroom-chips-card",
      alignment: "center",
      chips: [chip],
    }));
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    const globalSection: LovelaceGridCardConfig = {
      type: "grid",
      column_span: 1,
      cards: []
    };

    // Security Status Card - Vue d'ensemble du statut de sécurité
    const statusCard = new SecurityStatusCard();
    globalSection.cards.push(await statusCard.getCard());

    // Quick Actions - Single card that opens a popup with all actions (with confirmations)
    const lockIds = Helper.getEntityIds({ domain: "lock" });
    const lightIds = Helper.getEntityIds({ domain: "light" });
    const alarmIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
    const hasLocks = lockIds.length > 0;
    const hasLights = lightIds.length > 0;
    const hasAlarms = alarmIds.length > 0;

    // Build quick actions popup content
    const quickActionsCards: any[] = [];

    // Lock all button with confirmation
    if (hasLocks) {
      quickActionsCards.push({
        type: "custom:mushroom-template-card",
        primary: Helper.localize("component.linus_dashboard.entity.text.security_view.state.lock_all"),
        secondary: `${lockIds.length} ${Helper.localize("component.linus_dashboard.entity.text.security_view.state.locks")}`,
        icon: "mdi:lock",
        icon_color: "blue",
        tap_action: {
          action: "fire-dom-event",
          browser_mod: {
            service: "browser_mod.popup",
            data: {
              title: Helper.localize("component.linus_dashboard.entity.text.security_view.state.confirm_lock_all"),
              content: {
                type: "horizontal-stack",
                cards: [
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.security_view.state.cancel"),
                    icon: "mdi:close",
                    icon_color: "grey",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: { service: "browser_mod.close_popup" }
                    }
                  },
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.security_view.state.confirm"),
                    icon: "mdi:check",
                    icon_color: "green",
                    tap_action: {
                      action: "call-service",
                      service: "lock.lock",
                      target: { entity_id: lockIds }
                    }
                  }
                ]
              }
            }
          }
        }
      });
    }

    // Turn off lights button with confirmation
    if (hasLights) {
      quickActionsCards.push({
        type: "custom:mushroom-template-card",
        primary: Helper.localize("component.linus_dashboard.entity.text.security_view.state.turn_off_lights"),
        secondary: `${lightIds.length} ${Helper.localize("component.light.entity_component._.name")}s`,
        icon: "mdi:lightbulb-off",
        icon_color: "amber",
        tap_action: {
          action: "fire-dom-event",
          browser_mod: {
            service: "browser_mod.popup",
            data: {
              title: Helper.localize("component.linus_dashboard.entity.text.security_view.state.confirm_turn_off_lights"),
              content: {
                type: "horizontal-stack",
                cards: [
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.security_view.state.cancel"),
                    icon: "mdi:close",
                    icon_color: "grey",
                    tap_action: {
                      action: "fire-dom-event",
                      browser_mod: { service: "browser_mod.close_popup" }
                    }
                  },
                  {
                    type: "custom:mushroom-template-card",
                    primary: Helper.localize("component.linus_dashboard.entity.text.security_view.state.confirm"),
                    icon: "mdi:check",
                    icon_color: "green",
                    tap_action: {
                      action: "call-service",
                      service: "light.turn_off",
                      target: { entity_id: lightIds }
                    }
                  }
                ]
              }
            }
          }
        }
      });
    }

    // Alarm control (opens alarm control popup)
    if (hasAlarms) {
      quickActionsCards.push({
        type: "custom:mushroom-template-card",
        primary: Helper.localize("component.linus_dashboard.entity.text.security_view.state.arm_disarm"),
        secondary: `${alarmIds.length} ${Helper.localize("component.alarm_control_panel.entity_component._.name")}`,
        icon: "mdi:shield-home",
        icon_color: "red",
        tap_action: {
          action: "fire-dom-event",
          browser_mod: {
            service: "browser_mod.popup",
            data: {
              title: Helper.localize("component.alarm_control_panel.entity_component._.name") || "Alarmes",
              content: {
                type: "vertical-stack",
                cards: alarmIds.map((alarmId: string) => ({
                  type: "tile",
                  entity: alarmId,
                  features: [{
                    type: "alarm-modes",
                    modes: ["armed_home", "armed_away", "armed_night", "armed_vacation", "armed_custom_bypass", "disarmed"]
                  }]
                }))
              }
            }
          }
        }
      });
    }

    // Quick Actions + Activity cards on the same line (horizontal-stack)
    const activityCard = new SecurityActivityCard(10);
    const activityCardConfig = await activityCard.getCard();

    if (quickActionsCards.length > 0) {
      globalSection.cards.push({
        type: "horizontal-stack",
        cards: [
          {
            type: "custom:mushroom-template-card",
            primary: Helper.localize("component.linus_dashboard.entity.text.security_view.state.quick_actions"),
            secondary: `${quickActionsCards.length} actions`,
            icon: "mdi:lightning-bolt",
            icon_color: "purple",
            tap_action: {
              action: "fire-dom-event",
              browser_mod: {
                service: "browser_mod.popup",
                data: {
                  title: Helper.localize("component.linus_dashboard.entity.text.security_view.state.quick_actions"),
                  content: {
                    type: "vertical-stack",
                    cards: quickActionsCards
                  }
                }
              }
            }
          },
          activityCardConfig
        ]
      });
    } else {
      // No quick actions, just show activity card
      globalSection.cards.push(activityCardConfig);
    }

    // Multi-alarmes : affiche une carte pour chaque alarme
    const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
    if (Array.isArray(alarmEntityIds) && alarmEntityIds.length > 0) {
      globalSection.cards.push({
        type: "heading",
        heading: Helper.localize("component.alarm_control_panel.entity_component._.name"),
        heading_style: "title",
        icon: "mdi:alarm-light",
      });
      for (const alarmEntityId of alarmEntityIds) {
        if (Helper.entities[alarmEntityId]) {
          globalSection.cards.push(new AlarmCard(Helper.entities[alarmEntityId]).getCard());
        }
      }
    }

    const persons = Helper.domains.person
    if (persons?.length) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("ui.dialogs.quick-bar.commands.navigation.person"),
          heading_style: "title",
          icon: "mdi:account-group",
        })

      for (const person of persons) {
        globalSection.cards.push(new PersonCard({}, person).getCard());
      }
    }

    // Create aggregate cards for security domains (with popups)
    const securityAggregateCards: LovelaceCardConfig[] = [];

    for (const domainTag of SECURITY_EXPOSED_DOMAINS) {
      const { domain, device_class } = parseDomainTag(domainTag);

      // Skip excluded domains
      if (Helper.linus_dashboard_config?.excluded_domains?.includes(domain)) {
        continue;
      }

      // Skip excluded device classes
      if (device_class && Helper.linus_dashboard_config?.excluded_device_classes?.includes(device_class)) {
        continue;
      }

      // Skip special domains handled separately
      if (domain === "alarm" || domain === "safety") {
        continue;
      }

      // Get entities for this domain
      const entity_ids = Helper.getEntityIds({ domain, device_class });

      // Only create card if entities exist
      if (entity_ids.length === 0) {
        continue;
      }

      // Get domain-specific defaults from AggregateChip
      const chip = new AggregateChip({
        domain,
        device_class,
        scope: "global",
        show_content: true
      });
      const chipConfig = chip.getChip();

      // Only create card if chip was created (entities exist)
      if (!chipConfig) {
        continue;
      }

      // Create popup action
      const popupAction = PopupFactory.createPopup({
        domain,
        scope: "global",
        scopeName: Helper.localize(getDomainTranslationKey(domain, device_class)),
        serviceOn: "turn_on",
        serviceOff: "turn_off",
        activeStates: ["on"],
        translationKey: domain,
        linusBrainEntity: null,
        features: [],
        device_class
      });

      // Check if there are any active entities
      const states = entity_ids.map(id => Helper.getEntityState(id)).filter(s => s);
      const activeCount = states.filter(state =>
        state.state === "on" || state.state === "open" || state.state === "opening" ||
        state.state === "playing" || state.state === "heat" || state.state === "cool" ||
        state.state === "auto"
      ).length;

      // Create aggregate card with popup
      const icon = Helper.getIcon(domain, device_class, entity_ids);
      const icon_color = Helper.getIconColor(domain, device_class, entity_ids);
      const secondary = Helper.getLastChangedTemplate({ domain, device_class });

      const cardConfig: any = {
        type: "custom:mushroom-template-card",
        entity: entity_ids[0],
        entity_id: entity_ids,
        primary: Helper.localize(getDomainTranslationKey(domain, device_class)),
        secondary,
        icon_color,
        icon,
        badge_color: "black",
        tap_action: popupAction
      };

      // Only add badge_icon if there are active entities (count > 0)
      // This prevents showing "mdi:numeric-0" icon when no devices are active
      if (activeCount > 0) {
        const badgeContent = Helper.getContent(domain, device_class, entity_ids, true);
        cardConfig.badge_icon = badgeContent;
      }

      securityAggregateCards.push(cardConfig);
    }

    if (securityAggregateCards.length > 0) {
      globalSection.cards.push(
        {
          type: "heading",
          heading: Helper.localize("ui.components.device-picker.device") + "s",
          heading_style: "title",
          icon: "mdi:shield",
        });
      globalSection.cards.push(...securityAggregateCards);
    }

    // Organize sensors by category for better UX
    const criticalSensors = [
      "binary_sensor:smoke",
      "binary_sensor:gas",
      "binary_sensor:carbon_monoxide"
    ];

    const accessSensors = [
      "binary_sensor:door",
      "binary_sensor:window",
      "binary_sensor:garage_door",
      "binary_sensor:lock"
    ];

    const detectionSensors = [
      "binary_sensor:motion",
      "binary_sensor:occupancy",
      "binary_sensor:sound",
      "binary_sensor:vibration"
    ];

    const otherSensors = [
      "binary_sensor:tamper",
      "binary_sensor:moisture"
    ];

    // Helper function to create aggregate sensor cards with popups
    // priorityColor: 'red', 'orange', 'blue', 'grey' for visual hierarchy
    const createAggregateSensorCards = (sensorTags: string[], priorityColor?: string): LovelaceCardConfig[] => {
      const cards: LovelaceCardConfig[] = [];

      for (const sensorTag of sensorTags) {
        const { domain, device_class } = parseDomainTag(sensorTag);

        // Skip excluded
        if (Helper.linus_dashboard_config?.excluded_domains?.includes(domain)) continue;
        if (device_class && Helper.linus_dashboard_config?.excluded_device_classes?.includes(device_class)) continue;

        // Get entities
        const entity_ids = Helper.getEntityIds({ domain, device_class });
        if (entity_ids.length === 0) continue;

        // Check if there are any active entities
        const states = entity_ids.map(id => Helper.getEntityState(id)).filter(s => s);
        const activeCount = states.filter(state => state.state === "on").length;

        // Create popup action
        const popupAction = PopupFactory.createPopup({
          domain,
          scope: "global",
          scopeName: Helper.localize(getDomainTranslationKey(domain, device_class)),
          serviceOn: "turn_on",
          serviceOff: "turn_off",
          activeStates: ["on"],
          translationKey: domain,
          linusBrainEntity: null,
          features: [],
          device_class
        });

        // Get card properties
        const icon = Helper.getIcon(domain, device_class, entity_ids);
        let icon_color = Helper.getIconColor(domain, device_class, entity_ids);
        const secondary = Helper.getLastChangedTemplate({ domain, device_class });

        // Override icon_color with priorityColor if active and priorityColor is set
        if (activeCount > 0 && priorityColor) {
          icon_color = priorityColor;
        }

        const cardConfig: any = {
          type: "custom:mushroom-template-card",
          entity: entity_ids[0],
          entity_id: entity_ids,
          primary: Helper.localize(getDomainTranslationKey(domain, device_class)),
          secondary,
          icon_color,
          icon,
          badge_color: activeCount > 0 && priorityColor ? priorityColor : "black",
          tap_action: popupAction
        };

        // Only add badge_icon if there are active entities (count > 0)
        // This prevents showing "mdi:numeric-0" icon when no sensors are active
        if (activeCount > 0) {
          const badgeContent = Helper.getContent(domain, device_class, entity_ids, true);
          cardConfig.badge_icon = badgeContent;

          // Add pulse animation for critical sensors (smoke, gas, CO) when active
          const isCriticalSensor = device_class === "smoke" || device_class === "gas" || device_class === "carbon_monoxide";
          if (isCriticalSensor) {
            cardConfig.card_mod = {
              style: `
                ha-card {
                  animation: pulse 2s ease-in-out infinite;
                  border-left: 4px solid var(--red-color, red) !important;
                }
                @keyframes pulse {
                  0%, 100% { opacity: 1; }
                  50% { opacity: 0.7; }
                }
              `
            };
          }
        }

        cards.push(cardConfig);
      }

      return cards;
    };

    // Critical Safety Sensors (RED for critical alerts)
    const criticalCards = createAggregateSensorCards(criticalSensors, 'red');
    if (criticalCards.length > 0) {
      globalSection.cards.push({
        type: "heading",
        heading: "Critical Safety",
        heading_style: "subtitle",
        icon: "mdi:fire-alert",
      });
      globalSection.cards.push(...criticalCards);
    }

    // Access Control Sensors (ORANGE when open)
    const accessCards = createAggregateSensorCards(accessSensors, 'orange');
    if (accessCards.length > 0) {
      // Count total access entities
      const accessEntityCount = accessSensors.reduce((count, sensorTag) => {
        const { domain, device_class } = parseDomainTag(sensorTag);
        return count + Helper.getEntityIds({ domain, device_class }).length;
      }, 0);

      globalSection.cards.push({
        type: "heading",
        heading: `Access Control (${accessEntityCount})`,
        heading_style: "subtitle",
        icon: "mdi:door",
      });
      globalSection.cards.push(...accessCards);
    }

    // Detection Sensors (BLUE when active)
    const detectionCards = createAggregateSensorCards(detectionSensors, 'blue');
    if (detectionCards.length > 0) {
      // Count total detection entities
      const detectionEntityCount = detectionSensors.reduce((count, sensorTag) => {
        const { domain, device_class } = parseDomainTag(sensorTag);
        return count + Helper.getEntityIds({ domain, device_class }).length;
      }, 0);

      globalSection.cards.push({
        type: "heading",
        heading: `Detection (${detectionEntityCount})`,
        heading_style: "subtitle",
        icon: "mdi:motion-sensor",
      });
      globalSection.cards.push(...detectionCards);
    }

    // Other Security Sensors (GREY default)
    const otherCards = createAggregateSensorCards(otherSensors, 'grey');
    if (otherCards.length > 0) {
      globalSection.cards.push({
        type: "heading",
        heading: "Other",
        heading_style: "subtitle",
        icon: "mdi:shield-alert",
      });
      globalSection.cards.push(...otherCards);
    }

    return [globalSection];
  }

  /**
   * Get a view object.
   *
   * The view includes the cards which are created by method createViewCards().
   *
   * @returns {Promise<LovelaceViewConfig>} The view object.
   */
  async getView(): Promise<LovelaceViewConfig | LovelaceSectionConfig> {
    return {
      ...this.config,
      badges: await this.createSectionBadges(),
      sections: await this.createSectionCards(),
    };
  }
}

export { SecurityView };
