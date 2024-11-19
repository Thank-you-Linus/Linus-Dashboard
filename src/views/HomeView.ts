import { Helper } from "../Helper";
import { AbstractView } from "./AbstractView";
import { views } from "../types/strategy/views";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { ActionConfig } from "../types/homeassistant/data/lovelace";
import { TitleCardConfig } from "../types/lovelace-mushroom/cards/title-card-config";
import { PersonCardConfig } from "../types/lovelace-mushroom/cards/person-card-config";
import { SettingsChip } from "../chips/SettingsChip";
import { SettingsPopup } from "../popups/SettingsPopup";
import { HOME_EXPOSED_CHIPS, UNDISCLOSED } from "../variables";
import { createChipsFromList, getFloorName, navigateTo, slugify } from "../utils";
import { WeatherChip } from "../chips/WeatherChip";


// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Home View Class.
 *
 * Used to create a Home view.
 *
 * @class HomeView
 * @extends AbstractView
 */
class HomeView extends AbstractView {
  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  #defaultConfig: views.ViewConfig = {
    title: "Home",
    icon: "mdi:home-assistant",
    type: "sections",
    path: "home",
    subview: false,
  };

  /**
   * Class constructor.
   *
   * @param {views.ViewConfig} [options={}] Options for the view.
   */
  constructor(options: views.ViewConfig = {}) {
    super();

    this.config = { ...this.config, ...this.#defaultConfig, ...options };
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createViewCards(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    return []
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
    const chipOptions = Helper.strategyOptions.chips;

    // Create a list of area-ids, used for switching all devices via chips
    const areaIds = Helper.orderedAreas.map(area => area.area_id ?? "");

    let chipModule;

    // Weather chip.
    const weatherEntityId = chipOptions?.weather_entity ?? Helper.domains.weather[0]?.entity_id;

    if (weatherEntityId) {
      try {
        const weatherChip = new WeatherChip(weatherEntityId);
        chips.push(weatherChip.getChip());
      } catch (e) {
        Helper.logError("An error occurred while creating the weather chip!", e);
      }
    }

    // Alarm chip.
    const alarmEntityId = chipOptions?.alarm_entity ?? Helper.domains.alarm_control_panel[0]?.entity_id;

    if (alarmEntityId) {
      try {
        chipModule = await import("../chips/AlarmChip");
        const alarmChip = new chipModule.AlarmChip(alarmEntityId);

        chips.push(alarmChip.getChip());
      } catch (e) {
        Helper.logError("An error occurred while creating the alarm chip!", e);
      }
    }

    // Spotify chip.
    const spotifyEntityId = chipOptions?.spotify_entity ?? Helper.domains.media_player?.find(
      (entity) => entity.entity_id.startsWith("media_player.spotify_") && entity.disabled_by === null && entity.hidden_by === null,
    )?.entity_id;

    if (spotifyEntityId) {
      try {
        chipModule = await import("../chips/SpotifyChip");
        const spotifyChip = new chipModule.SpotifyChip(spotifyEntityId);

        chips.push(spotifyChip.getChip());
      } catch (e) {
        Helper.logError("An error occurred while creating the spotify chip!", e);
      }
    }

    const homeChips = await createChipsFromList(HOME_EXPOSED_CHIPS, { show_content: true });
    if (homeChips) {
      chips.push(...homeChips);
    }

    const linusSettings = new SettingsChip({ tap_action: new SettingsPopup().getPopup() })

    chips.push(linusSettings.getChip());

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
   * @override
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    return await Promise.all([
      this.#createPersonCards(),
      this.#createAreaSection(),
    ]).then(([personCards, areaCards]) => {
      const options = Helper.strategyOptions;
      const firstSection: LovelaceGridCardConfig = {
        type: "grid",
        column_span: 1,
        cards: []
      };

      if (personCards.length) {
        // TODO: Create the stack at this.#createPersonCards()
        firstSection.cards.push({
          type: "horizontal-stack",
          cards: personCards,
        } as StackCardConfig);
      }

      if (!Helper.strategyOptions.home_view.hidden.includes("greeting")) {
        const tod = Helper.magicAreasDevices.global?.entities.time_of_the_day;

        firstSection.cards.push({
          type: "custom:mushroom-template-card",
          primary: `
          {% set tod = states("${tod?.entity_id}") %}
          {% if (tod == "evening") %} Bonne soirée, {{user}} !
          {% elif (tod == "daytime") %} Bonne après-midi, {{user}} !
          {% elif (tod == "night") %} Bonne nuit, {{user}} !
          {% else %} Bonjour, {{user}} !
          {% endif %}`,
          icon: "mdi:hand-wave",
          icon_color: "orange",
          layout_options: {
            grid_columns: 4,
            grid_rows: 1,
          },
          tap_action: {
            action: "none",
          } as ActionConfig,
          double_tap_action: {
            action: "none",
          } as ActionConfig,
          hold_action: {
            action: "none",
          } as ActionConfig,
        } as TemplateCardConfig);
      }


      // Add quick access cards.
      if (options.quick_access_cards) {
        firstSection.cards.push(...options.quick_access_cards);
      }

      // Add custom cards.
      if (options.extra_cards) {
        firstSection.cards.push(...options.extra_cards);
      }

      // Add area cards.
      const secondSection: LovelaceGridCardConfig = {
        type: "grid",
        column_span: 1,
        cards: areaCards,
      };

      return [firstSection, secondSection];
    });
  }

  /**
   * Create the person cards to include in the view.
   *
   * @return {PersonCardConfig[]} A Person Card array.
   */
  #createPersonCards(): PersonCardConfig[] {
    if (Helper.strategyOptions.home_view.hidden.includes("persons")) {
      // Person section is hidden.

      return [];
    }

    const cards: PersonCardConfig[] = [];

    import("../cards/PersonCard").then(personModule => {
      for (const person of Helper.domains.person.filter((entity) => {
        return entity.hidden_by == null
          && entity.disabled_by == null;
      })) {
        cards.push(new personModule.PersonCard(person).getCard());
      }
    });

    return cards;
  }

  /**
   * Create the area cards to include in the view.
   *
   * Area cards are grouped into two areas per row.
   *
   * @return {Promise<(TitleCardConfig | StackCardConfig)[]>} Promise an Area Card Section.
   */
  async #createAreaSection(): Promise<(TitleCardConfig | StackCardConfig)[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("areas")) {
      // Areas section is hidden.

      return [];
    }

    const groupedCards: (TitleCardConfig | StackCardConfig)[] = [];

    if (!Helper.strategyOptions.home_view.hidden.includes("areasTitle")) {
      groupedCards.push(
        {
          type: "heading",
          heading: `${Helper.localize("ui.components.area-picker.area")}s`,
          heading_style: "title",
        },
      );
    }


    console.log("floors", Helper.floors);
    console.log("areas", Helper.areas);


    for (const floor of Helper.orderedFloors) {
      if (floor.areas_slug.length === 0) continue

      groupedCards.push(
        {
          type: "heading",
          heading: getFloorName(floor),
          heading_style: "subtitle",
          icon: floor.icon ?? "mdi:floor-plan",
          tap_action: floor.floor_id !== UNDISCLOSED ? navigateTo(slugify(floor.name)) : undefined,
        }
      );

      for (const area of floor.areas_slug.map(area_slug => Helper.areas[area_slug]).values()) {

        type ModuleType = typeof import("../cards/HomeAreaCard");

        let module: ModuleType;
        let moduleName =
          Helper.strategyOptions.areas[area.slug]?.type ??
          Helper.strategyOptions.areas["_"]?.type ??
          "default";

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
        if (!Helper.strategyOptions.areas[area.slug as string]?.hidden) {
          let options = {
            ...Helper.strategyOptions.areas["_"],
            ...Helper.strategyOptions.areas[area.slug],
            area_slug: area.slug,
          };

          groupedCards.push({
            ...new module.HomeAreaCard(options).getCard(),
            layout_options: {
              grid_columns: 2
            }
          });
        }
      }
    }

    groupedCards.push({
      type: "custom:mushroom-template-card",
      primary: Helper.localize("component.linus_dashboard.entity.button.add_new_area.state.on"),
      secondary: Helper.localize("component.linus_dashboard.entity.button.add_new_area.state.off"),
      multiline_secondary: true,
      icon: "mdi:view-dashboard-variant",
      fill_container: true,
      layout_options: {
        grid_columns: 4,
        grid_rows: 1,
      },
      tap_action: {
        action: "navigate",
        navigation_path: "/config/areas/dashboard",
      },
    } as any);

    return groupedCards;
  }
}

export { HomeView };
