import { Helper } from "../Helper";
import { views } from "../types/strategy/views";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { ActionConfig, LovelaceSectionConfig, LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { PersonCardConfig } from "../types/lovelace-mushroom/cards/person-card-config";
import { SettingsChip } from "../chips/SettingsChip";
import { SettingsPopup } from "../popups/SettingsPopup";
import { DEVICE_CLASSES, HOME_EXPOSED_CHIPS, UNDISCLOSED } from "../variables";
import { createChipsFromList, getFloorName, navigateTo, slugify } from "../utils";
import { WeatherChip } from "../chips/WeatherChip";
import { UnavailableChip } from "../chips/UnavailableChip";
import { PersonCard } from "../cards/PersonCard";
import { AggregateChip } from "../chips/AggregateChip";
import { LightChip } from "../chips/LightChip";
import { ClimateChip } from "../chips/ClimateChip";
import { FanChip } from "../chips/FanChip";

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

    // Weather chip.
    const weatherEntityId = Helper.linus_dashboard_config?.weather_entity_id;
    if (weatherEntityId) {
      try {
        const weatherChip = new WeatherChip(weatherEntityId);
        chips.push(weatherChip.getChip());
      } catch (e) {
        Helper.logError("An error occurred while creating the weather chip!", e);
      }
    }

    // Alarm chip.
    const alarmEntityId = Helper.linus_dashboard_config?.alarm_entity_id;
    if (alarmEntityId) {
      try {
        const chipModule = await import("../chips/AlarmChip");
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
        const chipModule = await import("../chips/SpotifyChip");
        const spotifyChip = new chipModule.SpotifyChip(spotifyEntityId);
        chips.push(spotifyChip.getChip());
      } catch (e) {
        Helper.logError("An error occurred while creating the spotify chip!", e);
      }
    }

    // Home chips.
    const homeChips = await createChipsFromList(HOME_EXPOSED_CHIPS, { show_content: true });
    if (homeChips) {
      chips.push(...homeChips);
    }

    // Unavailable chip.
    const unavailableChip = new UnavailableChip().getChip();
    if (unavailableChip) chips.push(unavailableChip);

    // Settings chip.
    const linusSettings = new SettingsChip({ tap_action: new SettingsPopup().getPopup() });
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
    if (Helper.strategyOptions.home_view.hidden.includes("areas")) {
      // Areas section is hidden.
      return [];
    }

    const groupedSections: LovelaceGridCardConfig[] = [];
    const floors = Helper.orderedFloors;
    let isFirstLoop = true;

    for (const floor of floors) {
      if (floor.areas_slug.length === 0) continue;

      let floorSection = {
        type: "grid",
        column_span: 1,
        cards: [],
      } as LovelaceGridCardConfig;

      if (isFirstLoop) {
        const personCards = await this.#createPersonCards();
        floorSection.cards.push({
          type: "horizontal-stack",
          cards: personCards,
        } as StackCardConfig);

        if (!Helper.linus_dashboard_config?.hide_greeting) {
          const tod = Helper.magicAreasDevices.global?.entities.time_of_the_day;
          floorSection.cards.push({
            type: "custom:mushroom-template-card",
            primary: `
              {% set tod = states("${tod?.entity_id}") %}
              {% if (tod == "evening") %} ${Helper.localize("component.linus_dashboard.entity.text.greeting.state.evening")} {{user}} !
              {% elif (tod == "daytime") %} ${Helper.localize("component.linus_dashboard.entity.text.greeting.state.daytime")} {{user}} !
              {% elif (tod == "night") %} ${Helper.localize("component.linus_dashboard.entity.text.greeting.state.night")} {{user}} !
              {% else %} ${Helper.localize("component.linus_dashboard.entity.text.greeting.state.morning")} {{user}} !
              {% endif %}`,
            icon: "mdi:hand-wave",
            icon_color: "orange",
            layout_options: {
              grid_columns: 4,
              grid_rows: 1,
            },
            tap_action: { action: "none" } as ActionConfig,
            double_tap_action: { action: "none" } as ActionConfig,
            hold_action: { action: "none" } as ActionConfig,
          } as TemplateCardConfig);
        }

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
        lightEntities.length > 0 && new LightChip({
          magic_device_id: floor.floor_id,
          area_slug: floor.areas_slug,
        }).getChip(),
        climateEntities.length > 0 && new ClimateChip({
          magic_device_id: floor.floor_id,
          area_slug: floor.areas_slug,
        }).getChip(),
        fanEntities.length > 0 && new FanChip({
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
              tap_action: navigateTo(device_class),
            }).getChip();
          }
          return null;
        }),
      ].filter(Boolean) as LovelaceChipConfig[];

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
          tap_action: floor.floor_id !== UNDISCLOSED ? navigateTo(slugify(floor.name)) : undefined,
        });
      }

      for (const area of floor.areas_slug.map(area_slug => Helper.areas[area_slug]).values()) {
        type ModuleType = typeof import("../cards/HomeAreaCard");

        let module: ModuleType;
        let moduleName = Helper.strategyOptions.areas[area.slug]?.type ?? Helper.strategyOptions.areas["_"]?.type ?? "default";

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

          floorSection.cards.push({
            ...new module.HomeAreaCard(options).getCard(),
            layout_options: {
              grid_columns: 2
            }
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
          layout_options: {
            grid_columns: 4,
            grid_rows: 1,
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
    const persons = Helper.domains.person.filter((entity) => {
      return entity.hidden_by == null && entity.disabled_by == null;
    });

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
