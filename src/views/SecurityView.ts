import { Helper } from "../Helper";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceCardConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { AlarmCard } from "../cards/AlarmCard";
import { PersonCard } from "../cards/PersonCard";
import { processEntitiesForView, getDomainTranslationKey } from "../utils";
import { parseDomainTag } from "../utils/domainTagHelper";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { RefreshChip } from "../chips/RefreshChip";
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
  async createViewBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {

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

    // Refresh chip - allows manual refresh of registries
    const refreshChip = new RefreshChip();
    chips.push(refreshChip.getChip());

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

    // Multi-alarmes : affiche une carte pour chaque alarme
    const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
    if (Array.isArray(alarmEntityIds) && alarmEntityIds.length > 0) {
      globalSection.cards.push({
        type: "heading",
        heading: Helper.localize("component.binary_sensor.entity_component.safety.name"),
        heading_style: "title",
        icon: "mdi:shield-home",
      });
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
    const createAggregateSensorCards = (sensorTags: string[]): LovelaceCardConfig[] => {
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
        // This prevents showing "mdi:numeric-0" icon when no sensors are active
        if (activeCount > 0) {
          const badgeContent = Helper.getContent(domain, device_class, entity_ids, true);
          cardConfig.badge_icon = badgeContent;
        }

        cards.push(cardConfig);
      }

      return cards;
    };

    // Critical Safety Sensors
    const criticalCards = createAggregateSensorCards(criticalSensors);
    if (criticalCards.length > 0) {
      globalSection.cards.push({
        type: "heading",
        heading: "🔥 Critical Safety",
        heading_style: "subtitle",
        icon: "mdi:fire-alert",
      });
      globalSection.cards.push(...criticalCards);
    }

    // Access Control Sensors
    const accessCards = createAggregateSensorCards(accessSensors);
    if (accessCards.length > 0) {
      globalSection.cards.push({
        type: "heading",
        heading: "🚪 Access Control",
        heading_style: "subtitle",
        icon: "mdi:door",
      });
      globalSection.cards.push(...accessCards);
    }

    // Detection Sensors
    const detectionCards = createAggregateSensorCards(detectionSensors);
    if (detectionCards.length > 0) {
      globalSection.cards.push({
        type: "heading",
        heading: "👁️ Detection",
        heading_style: "subtitle",
        icon: "mdi:motion-sensor",
      });
      globalSection.cards.push(...detectionCards);
    }

    // Other Security Sensors
    const otherCards = createAggregateSensorCards(otherSensors);
    if (otherCards.length > 0) {
      globalSection.cards.push({
        type: "heading",
        heading: "🛡️ Other",
        heading_style: "subtitle",
        icon: "mdi:shield-alert",
      });
      globalSection.cards.push(...otherCards);
    }

    const sections = [globalSection]
    if (Helper.domains.camera?.length) sections.push(...await this.createCamerasSection())

    return sections;
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig[] >} An array of card objects.
   */
  async createCamerasSection(): Promise<LovelaceGridCardConfig[]> {

    const sections = await processEntitiesForView("camera", undefined, []) ?? []
    if (sections.length > 0) {
      sections[0]?.cards.unshift(
        {
          type: "heading",
          heading: `${Helper.localize("component.camera.entity_component._.name")}s`,
          heading_style: "title",
          badges: [],
          icon: Helper.icons["camera"]._?.default,
        });
    }

    return sections

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
      badges: await this.createViewBadges(),
      sections: await this.createSectionCards(),
    };
  }
}

export { SecurityView };
