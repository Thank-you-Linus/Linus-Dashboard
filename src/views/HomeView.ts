import { Helper } from "../Helper";
import { AbstractView } from "./AbstractView";
import { views } from "../types/strategy/views";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ChipsCardConfig, TemplateCardConfig, TitleCardConfig, PersonCardConfig } from "../types/lovelace-mushroom/cards";
import { StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { ActionConfig } from "../types/homeassistant/data/lovelace";
import { UNAVAILABLE_STATES } from "../variables";
import { groupBy } from "../utils";
import { generic } from "../types/strategy/generic";
import isCallServiceActionConfig = generic.isCallServiceActionConfig;

/**
 * Home View Class.
 * Used to create a Home view.
 * @class HomeView
 * @extends AbstractView
 */
class HomeView extends AbstractView {
  #defaultConfig: views.ViewConfig = {
    title: "Home",
    icon: "mdi:home-assistant",
    path: "home",
    subview: false,
  };

  constructor(options: views.ViewConfig = {}) {
    super();
    this.config = { ...this.config, ...this.#defaultConfig, ...options };
  }

  /**
   * Create the cards to include in the view.
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise a View Card array.
   * @override
   */
  async createViewCards(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    const [chips, personCards, areaCards] = await Promise.all([
      this.#createChips(),
      this.#createPersonCards(),
      this.#createAreaSection(),
    ]);

    const homeViewCards = [];

    if (chips.length) {
      homeViewCards.push({
        type: "custom:mushroom-chips-card",
        alignment: "center",
        chips,
      } as ChipsCardConfig);
    }

    if (personCards.length) {
      homeViewCards.push({
        type: "horizontal-stack",
        cards: personCards,
      } as StackCardConfig);
    }

    if (!Helper.strategyOptions.home_view.hidden.includes("greeting")) {
      const tod = Helper.magicAreasDevices.Global?.entities.time_of_the_day;
      homeViewCards.push({
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
        tap_action: { action: "none" } as ActionConfig,
        double_tap_action: { action: "none" } as ActionConfig,
        hold_action: { action: "none" } as ActionConfig,
      } as TemplateCardConfig);
    }

    if (Helper.strategyOptions.quick_access_cards) {
      homeViewCards.push(...Helper.strategyOptions.quick_access_cards);
    }

    homeViewCards.push({
      type: "vertical-stack",
      cards: areaCards,
    } as StackCardConfig);

    if (Helper.strategyOptions.extra_cards) {
      homeViewCards.push(...Helper.strategyOptions.extra_cards);
    }

    return homeViewCards;
  }

  /**
   * Create the chips to include in the view.
   * @return {Promise<LovelaceChipConfig[]>} Promise a chip array.
   */
  async #createChips(): Promise<LovelaceChipConfig[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("chips")) return [];

    const chips: LovelaceChipConfig[] = [];
    const chipOptions = Helper.strategyOptions.chips;
    const exposedChips = ["light", "fan", "cover", "switch", "climate", "safety", "motion", "door", "window"];
    const areaIds = Helper.areas.map(area => area.area_id ?? "");

    const addChip = async (chipType: string, chipClass: string, entityId: string) => {
      try {
        const chipModule = await import(`../chips/${chipClass}`);
        const chip = new chipModule[chipClass](entityId);
        if ("tap_action" in this.config && isCallServiceActionConfig(this.config.tap_action)) {
          chip.setTapActionTarget({ area_id: areaIds });
        }
        chips.push(chip.getChip());
      } catch (e) {
        Helper.logError(`An error occurred while creating the ${chipType} chip!`, e);
      }
    };

    const weatherEntityId = chipOptions?.weather_entity ?? Helper.entities.find(
      (entity) => entity.entity_id.startsWith("weather.") && entity.disabled_by === null && entity.hidden_by === null,
    )?.entity_id;
    if (weatherEntityId) await addChip("weather", "WeatherChip", weatherEntityId);

    const alarmEntityId = chipOptions?.alarm_entity ?? Helper.getAlarmEntity()?.entity_id;
    if (alarmEntityId) await addChip("alarm", "AlarmChip", alarmEntityId);

    const spotifyEntityId = chipOptions?.spotify_entity ?? Helper.entities.find(
      (entity) => entity.entity_id.startsWith("media_player.spotify_") && entity.disabled_by === null && entity.hidden_by === null,
    )?.entity_id;
    if (spotifyEntityId) await addChip("spotify", "SpotifyChip", spotifyEntityId);

    for (const chipType of exposedChips) {
      if ((Helper.domains[chipType] ?? []).length === 0) continue;
      if (chipOptions?.[`${chipType}_count` as string] ?? true) {
        await addChip(chipType, Helper.sanitizeClassName(chipType + "Chip"), Helper.magicAreasDevices["global"]);
      }
    }

    if (chipOptions?.extra_chips) {
      chips.push(...chipOptions.extra_chips);
    }

    const unavailableEntities = Object.values(Helper.magicAreasDevices["Global"]?.entities ?? {}).filter((e) => {
      const entityState = Helper.getEntityState(e.entity_id);
      return (exposedChips.includes(e.entity_id.split(".", 1)[0]) || exposedChips.includes(entityState?.attributes.device_class || '')) &&
        UNAVAILABLE_STATES.includes(entityState?.state);
    });

    if (unavailableEntities.length) {
      await addChip("unavailable", "UnavailableChip", unavailableEntities);
    }

    try {
      const { SettingsChip } = await import("../chips/SettingsChip");
      const { LinusSettings } = await import("../popups/LinusSettingsPopup");
      const linusSettings = new SettingsChip({ tap_action: new LinusSettings().getPopup() });
      chips.push(linusSettings.getChip());
    } catch (e) {
      Helper.logError("An error occurred while creating the settings chip!", e);
    }

    return chips;
  }

  /**
   * Create the person cards to include in the view.
   * @return {PersonCardConfig[]} A Person Card array.
   */
  #createPersonCards(): PersonCardConfig[] {
    if (Helper.strategyOptions.home_view.hidden.includes("persons")) return [];

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
   * Area cards are grouped into two areas per row.
   * @return {Promise<(TitleCardConfig | StackCardConfig)[]>} Promise an Area Card Section.
   */
  async #createAreaSection(): Promise<(TitleCardConfig | StackCardConfig)[]> {
    if (Helper.strategyOptions.home_view.hidden.includes("areas")) return [];

    const groupedCards: (TitleCardConfig | StackCardConfig)[] = [];

    if (!Helper.strategyOptions.home_view.hidden.includes("areasTitle")) {
      groupedCards.push({
        type: "custom:mushroom-title-card",
        title: `${Helper.localize("ui.components.area-picker.area")}s`,
      });
    }

    const areasByFloor = groupBy(Helper.areas, (e) => e.floor_id ?? "undisclosed");

    for (const floor of [...Helper.floors, Helper.strategyOptions.floors.undisclosed]) {
      if (!(floor.floor_id in areasByFloor)) continue;

      groupedCards.push({
        type: "custom:mushroom-title-card",
        subtitle: floor.name,
        card_mod: { style: `ha-card.header { padding-top: 8px; }` },
      });

      const areaCards = await Promise.all(
        areasByFloor[floor.floor_id].map(async (area) => {
          if (Helper.strategyOptions.areas[area.area_id]?.hidden) return null;

          const moduleName = Helper.strategyOptions.areas[area.area_id]?.type ?? Helper.strategyOptions.areas["_"]?.type ?? "default";
          let module;
          module = await import("../cards/AreaCard");


          const options = { ...Helper.strategyOptions.areas["_"], ...Helper.strategyOptions.areas[area.area_id] };
          return new module.AreaCard(area, options).getCard();
        })
      );

      const validAreaCards = areaCards.filter(Boolean);
      for (const card of validAreaCards) {
        groupedCards.push({
          type: "vertical-stack",
          cards: [card],
        } as StackCardConfig);
      }
    }

    groupedCards.push({
      type: "custom:mushroom-template-card",
      primary: "Ajouter une nouvelle pièce",
      secondary: "Cliquer ici pour vous rendre sur la page des pièces",
      multiline_secondary: true,
      icon: "mdi:view-dashboard-variant",
      fill_container: true,
      tap_action: {
        action: "navigate",
        navigation_path: "/config/areas/dashboard",
      },
    } as any);

    return groupedCards;
  }
}

export { HomeView };
