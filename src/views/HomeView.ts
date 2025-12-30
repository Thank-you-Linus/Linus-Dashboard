import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceBadgeConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { PersonCardConfig } from "../types/lovelace-mushroom/cards/person-card-config";
import { SettingsChip } from "../chips/SettingsChip";
import { SettingsPopup } from "../popups/SettingsPopup";
import { DEVICE_CLASSES, HOME_EXPOSED_CHIPS, UNDISCLOSED } from "../variables";
import { createChipsFromList, getFloorName, navigateTo, slugify } from "../utils";
import { WeatherChip } from "../chips/WeatherChip";
import { UnavailableChip } from "../chips/UnavailableChip";
import { RefreshChip } from "../chips/RefreshChip";
import { PersonCard } from "../cards/PersonCard";
import { AggregateChip } from "../chips/AggregateChip";
import { WelcomeCard } from "../cards/WelcomeCard";
import { ConditionalLightChip } from "../chips/ConditionalLightChip";
import { ChipFactory } from "../factories/ChipFactory";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Home View Class.
 *
 * Used to create a Home view.
 *
 * @class HomeView
 */
class HomeView {
  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  config: views.ViewConfig = {
    title: "Home",
    icon: "mdi:home-assistant",
    type: "sections",
    subview: false,
  };

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
   * Create the chips to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig | LovelaceBadgeConfig)[]>} Promise a View Card array.
   * @override
   */
  async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig | LovelaceBadgeConfig)[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("chips")) {
      // Chips section is hidden.
      return [];
    }

    const chips: LovelaceChipConfig[] = [];
    const badges: LovelaceBadgeConfig[] = [];
    const chipOptions = Helper.strategyOptions.chips;

    const hideGreeting = Helper.linus_dashboard_config.hide_greeting;

    // Weather chip.
    const weatherEntityId = Helper.linus_dashboard_config?.weather_entity_id;
    if (weatherEntityId && hideGreeting) {
      try {
        const weatherChip = new WeatherChip(weatherEntityId);
        chips.push(weatherChip.getChip());
      } catch (e) {
        Helper.logError("An error occurred while creating the weather chip!", e);
      }
    }

    // Alarm chips.
    const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
    if (alarmEntityIds.length > 0 && hideGreeting) {
      try {
        const badgeModule = await import("../badges/AlarmBadge");
        // Créer un chip pour chaque alarme
        for (const alarmEntityId of alarmEntityIds) {
          if (alarmEntityId) {
            const alarmBadge = new badgeModule.AlarmBadge(alarmEntityId);
            badges.push(alarmBadge.getBadge());
          }
        }
      } catch (e) {
        Helper.logError("An error occurred while creating the alarm chips!", e);
      }
    }

    // Spotify chip.
    const spotifyEntityId = chipOptions?.spotify_entity ?? Helper.domains.media_player?.find(
      (entity) => entity.entity_id.startsWith("media_player.spotify_") && entity.disabled_by === null && entity.hidden_by === null,
    )?.entity_id;
    if (spotifyEntityId) {
      try {
        const spotifyChip = await ChipFactory.createChip("SpotifyChip", spotifyEntityId);
        if (spotifyChip) chips.push(spotifyChip);
      } catch (e) {
        Helper.logError("An error occurred while creating the spotify chip!", e);
      }
    }

    // Home chips.
    const homeChips = await createChipsFromList(
      HOME_EXPOSED_CHIPS, 
      { 
        show_content: true,
        tapActionMode: "navigation"  // Navigate to domain view on tap (HomeView only)
      }
    );
    if (homeChips) {
      chips.push(...homeChips);
    }

    // Unavailable chip.
    const unavailableChip = new UnavailableChip().getChip();
    if (unavailableChip) chips.push(unavailableChip);

    // LinusBrain chip.
    try {
      const linusBrainChip = await ChipFactory.createChip("LinusBrainChip", {});
      // Only add if chip has icon (checks if LinusBrain is installed)
      if (linusBrainChip && (linusBrainChip as any).icon && (linusBrainChip as any).icon !== "") {
        chips.push(linusBrainChip);
      }
    } catch (e) {
      Helper.logError("An error occurred while creating the Linus Brain chip!", e);
    }

    // MagicAreas chip.
    try {
      const magicAreasChip = await ChipFactory.createChip("MagicAreasChip", {});
      // Only add if chip has icon (checks if MagicAreas is installed)
      if (magicAreasChip && (magicAreasChip as any).icon && (magicAreasChip as any).icon !== "") {
        chips.push(magicAreasChip);
      }
    } catch (e) {
      Helper.logError("An error occurred while creating the Magic Areas chip!", e);
    }

    // Refresh chip - allows manual refresh of registries
    const refreshChip = new RefreshChip();
    chips.push(refreshChip.getChip());

    // Settings chip.
    const linusSettings = new SettingsChip({ tap_action: new SettingsPopup().getPopup() });
    chips.push(linusSettings.getChip());

    return [...badges, ...chips.map(chip => ({
      type: "custom:mushroom-chips-card",
      alignment: "center",
      chips: [chip],
    }))];
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
   * @override
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("areas")) {
      // Areas section is hidden.
      return [];
    }

    const groupedSections: LovelaceGridCardConfig[] = [];
    const floors = Helper.orderedFloors;
    let isFirstLoop = true;

    for (const floor of floors) {
      if (floor.areas_slug.length === 0) continue;

      const floorSection = {
        type: "grid",
        column_span: 1,
        cards: [],
      } as LovelaceGridCardConfig;

      if (isFirstLoop) {

        // Add WelcomeCard with clock, greeting, weather, alarms, and person chips

        if (!Helper.linus_dashboard_config?.hide_greeting) {
          const clockWelcomeCard = new WelcomeCard();
          floorSection.cards.push(await clockWelcomeCard.getCard());
        }

        const personCards = await this.#createPersonCards();
        floorSection.cards.push({
          type: "horizontal-stack",
          cards: personCards,
        } as StackCardConfig);

        // Add quick access cards.
        if (Helper.strategyOptions.quick_access_cards) {
          floorSection.cards.push(...Helper.strategyOptions.quick_access_cards);
        }

        // Add custom cards.
        if (Helper.strategyOptions.extra_cards) {
          floorSection.cards.push(...Helper.strategyOptions.extra_cards);
        }
      }

      if (isFirstLoop && !Helper.strategyOptions.home_view.hidden.includes("areasTitle")) {
        floorSection.cards.push({
          type: "heading",
          heading: `${Helper.localize("ui.components.area-picker.area")}s`,
          heading_style: "title",
        });
        isFirstLoop = false;
      }

      const lightEntities = Helper.getEntityIds({ domain: "light", area_slug: floor.areas_slug });
      const climateEntities = Helper.getEntityIds({ domain: "climate", area_slug: floor.areas_slug });
      const fanEntities = Helper.getEntityIds({ domain: "fan", area_slug: floor.areas_slug });

      const chips = floor.floor_id === UNDISCLOSED ? [] : [
        ...(lightEntities.length > 0 ? new ConditionalLightChip({ area_slug: floor.areas_slug, magic_device_id: floor.floor_id }).getChip() : []),
        climateEntities.length > 0 && new AggregateChip({
          domain: "climate",
          show_content: true,
          magic_device_id: floor.floor_id,
          area_slug: floor.areas_slug,
        }).getChip(),
        fanEntities.length > 0 && new AggregateChip({
          domain: "fan",
          show_content: true,
          magic_device_id: floor.floor_id,
          area_slug: floor.areas_slug,
        }).getChip(),
        // Add a chip for each cover type if entities exist
        ...DEVICE_CLASSES.cover.map(device_class => {
          const coverEntities = Helper.getEntityIds({
            domain: "cover",
            device_class,
            area_slug: floor.areas_slug,
          });

          if (coverEntities.length > 0) {
            return new AggregateChip({
              domain: "cover",
              device_class,
              show_content: true,
              magic_device_id: floor.floor_id,
              area_slug: floor.areas_slug,
            }).getChip();
          }
          return null;
        }),
      ].filter(Boolean);

      if (floors.length > 1) {
        floorSection.cards.push({
          type: "heading",
          heading: getFloorName(floor),
          heading_style: "subtitle",
          icon: floor.icon ?? "mdi:floor-plan",
          badges: [{
            type: "custom:mushroom-chips-card",
            alignment: "end",
            chips,
            card_mod: {
              style: `
                ha-card {
                  min-width: 200px;
                }
              `,
            }
          }],
          tap_action: floor.floor_id !== UNDISCLOSED ? navigateTo(slugify(floor.floor_id)) : undefined,
        });
      }

      for (const area of floor.areas_slug.map(area_slug => Helper.areas[area_slug]).values()) {
        if (!area) continue;
        type ModuleType = typeof import("../cards/HomeAreaCard");

        let module: ModuleType;
        const moduleName = Helper.strategyOptions.areas[area.slug]?.type ?? Helper.strategyOptions.areas["_"]?.type ?? "default";

        // Load module by type in strategy options.
        try {
          module = await import((`../cards/${moduleName}`));
        } catch (e) {
          // Fallback to the default strategy card.
          module = await import("../cards/HomeAreaCard");
          if (Helper.strategyOptions.debug && moduleName !== "default") {
            console.error(e);
          }
        }

        // Get a card for the area.
        if (!Helper.strategyOptions.areas[area.slug]?.hidden) {
          const options = {
            ...Helper.strategyOptions.areas["_"],
            ...Helper.strategyOptions.areas[area.slug],
            area_slug: area.slug,
          };

          floorSection.cards.push({
            ...new module.HomeAreaCard(options).getCard(),
          });
        }
      }

      if (floor.floor_id === UNDISCLOSED) {
        floorSection.cards.push({
          type: "custom:mushroom-template-card",
          primary: Helper.localize("component.linus_dashboard.entity.button.add_new_area.state.on"),
          secondary: Helper.localize("component.linus_dashboard.entity.button.add_new_area.state.off"),
          multiline_secondary: true,
          icon: "mdi:view-dashboard-variant",
          fill_container: true,
          grid_options: {
            columns: 12,
          },
          tap_action: {
            action: "navigate",
            navigation_path: "/config/areas/dashboard",
          },
        } as any);
      }

      groupedSections.push(floorSection);
    }

    return groupedSections;
  }

  /**
   * Create the person cards to include in the view.
   *
   * @return {Promise<PersonCardConfig[]>} A Person Card array.
   */
  async #createPersonCards(): Promise<PersonCardConfig[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("persons")) {
      // Person section is hidden.
      return [];
    }

    const cards: PersonCardConfig[] = [];
    const persons = Helper.domains.person?.filter((entity) => {
      return entity.hidden_by == null && entity.disabled_by == null;
    }) ?? [];

    for (const person of persons) {
      cards.push(new PersonCard({}, person).getCard());
    }

    return cards;
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

export { HomeView };
