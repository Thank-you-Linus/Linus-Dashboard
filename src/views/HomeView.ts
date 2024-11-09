import { Helper } from "../Helper";
import { AbstractView } from "./AbstractView";
import { views } from "../types/strategy/views";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { ActionConfig, LovelaceSectionConfig } from "../types/homeassistant/data/lovelace";
import { TitleCardConfig } from "../types/lovelace-mushroom/cards/title-card-config";
import { PersonCardConfig } from "../types/lovelace-mushroom/cards/person-card-config";
import { SettingsChip } from "../chips/SettingsChip";
import { LinusSettings } from "../popups/LinusSettingsPopup";
import { UnavailableChip } from "../chips/UnavailableChip";
import { UNAVAILABLE_STATES } from "../variables";
import { groupBy } from "../utils";
import { generic } from "../types/strategy/generic";
import isCallServiceActionConfig = generic.isCallServiceActionConfig;


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
   * @return {Promise<LovelaceGridCardConfig[]>} Promise a View Card array.
   * @override
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    return await Promise.all([
      this.#createChips(),
      this.#createPersonCards(),
      this.#createAreaSection(),
    ]).then(([chips, personCards, areaCards]) => {
      const options = Helper.strategyOptions;
      const firstSection: LovelaceGridCardConfig = {
        type: "grid",
        column_span: 1,
        cards: []
      };

      if (chips.length) {
        // TODO: Create the Chip card at this.#createChips()
        firstSection.cards.push({
          type: "custom:mushroom-chips-card",
          alignment: "center",
          chips: chips,
        } as ChipsCardConfig)
      }

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
   * Create the chips to include in the view.
   *
   * @return {Promise<LovelaceChipConfig[]>} Promise a chip array.
   */
  async #createChips(): Promise<LovelaceChipConfig[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("chips")) {
      // Chips section is hidden.

      return [];
    }

    const chips: LovelaceChipConfig[] = [];
    const chipOptions = Helper.strategyOptions.chips;

    // TODO: Get domains from config.
    const exposedChips = ["light", "fan", "cover", "switch", "climate", "safety", "motion", "door", "window"];
    // Create a list of area-ids, used for switching all devices via chips
    const areaIds = Helper.areas.map(area => area.area_id ?? "");

    let chipModule;

    // Weather chip.
    const weatherEntityId = chipOptions?.weather_entity ?? Helper.entities.find(
      (entity) => entity.entity_id.startsWith("weather.") && entity.disabled_by === null && entity.hidden_by === null,
    )?.entity_id;

    if (weatherEntityId) {
      try {
        chipModule = await import("../chips/WeatherChip");
        const weatherChip = new chipModule.WeatherChip(weatherEntityId);

        chips.push(weatherChip.getChip());
      } catch (e) {
        Helper.logError("An error occurred while creating the weather chip!", e);
      }
    }

    // Alarm chip.
    const alarmEntityId = chipOptions?.alarm_entity ?? Helper.getAlarmEntity()?.entity_id;

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
    const spotifyEntityId = chipOptions?.spotify_entity ?? Helper.entities.find(
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

    // Numeric chips.
    for (let chipType of exposedChips) {
      if (chipOptions?.[`${chipType}_count` as string] ?? true) {
        const className = Helper.sanitizeClassName(chipType + "Chip");
        try {
          chipModule = await import((`../chips/${className}`));
          const chip = new chipModule[className](Helper.magicAreasDevices["global"]);

          if ("tap_action" in this.config && isCallServiceActionConfig(this.config.tap_action)) {
            chip.setTapActionTarget({ area_id: areaIds });
          }
          chips.push(chip.getChip());
        } catch (e) {
          Helper.logError(`An error occurred while creating the ${chipType} chip!`, e);
        }
      }
    }

    // Extra chips.
    if (chipOptions?.extra_chips) {
      chips.push(...chipOptions.extra_chips);
    }

    // Unavailable chip.
    const unavailableEntities = Object.values(Helper.magicAreasDevices["global"]?.entities ?? [])?.filter((e) => {
      const entityState = Helper.getEntityState(e.entity_id);
      return (exposedChips.includes(e.entity_id.split(".", 1)[0]) || exposedChips.includes(entityState?.attributes.device_class || '')) &&
        UNAVAILABLE_STATES.includes(entityState?.state);
    });


    if (unavailableEntities.length) {
      const unavailableChip = new UnavailableChip(unavailableEntities);
      chips.push(unavailableChip.getChip());
    }

    const linusSettings = new SettingsChip({ tap_action: new LinusSettings().getPopup() })

    chips.push(linusSettings.getChip());

    return chips;
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
      for (const person of Helper.entities.filter((entity) => {
        return entity.entity_id.startsWith("person.")
          && entity.hidden_by == null
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

    const areasByFloor = groupBy(Helper.areas, (e) => e.floor_id ?? "undisclosed");

    for (const floor of [...Helper.floors, Helper.strategyOptions.floors.undisclosed]) {
      if (!(floor.floor_id in areasByFloor)) continue

      groupedCards.push(
        {
          type: "heading",
          heading: floor.name,
          heading_style: "subtitle",
        }
      );

      for (const [i, area] of areasByFloor[floor.floor_id].entries()) {

        type ModuleType = typeof import("../cards/AreaCard");

        let module: ModuleType;
        let moduleName =
          Helper.strategyOptions.areas[area.area_id]?.type ??
          Helper.strategyOptions.areas["_"]?.type ??
          "default";

        // Load module by type in strategy options.
        try {
          module = await import((`../cards/${moduleName}`));
        } catch (e) {
          // Fallback to the default strategy card.
          module = await import("../cards/AreaCard");

          if (Helper.strategyOptions.debug && moduleName !== "default") {
            console.error(e);
          }
        }

        // Get a card for the area.
        if (!Helper.strategyOptions.areas[area.area_id as string]?.hidden) {
          let options = {
            ...Helper.strategyOptions.areas["_"],
            ...Helper.strategyOptions.areas[area.area_id],
          };

          groupedCards.push({
            ...new module.AreaCard(area, options).getCard(),
            layout_options: {
              grid_columns: 2
            }
          });
        }
      }
    }

    groupedCards.push({
      type: "custom:mushroom-template-card",
      primary: "Ajouter une nouvelle pièce",
      secondary: `Cliquer ici pour vous rendre sur la page des pièces`,
      multiline_secondary: true,
      icon: `mdi:view-dashboard-variant`,
      fill_container: true,
      tap_action: {
        action: "navigate",
        navigation_path: '/config/areas/dashboard'
      },
    } as any)

    return groupedCards;
  }
}

export { HomeView };
