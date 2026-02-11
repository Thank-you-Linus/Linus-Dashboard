import { Helper } from "../Helper";
import { LovelaceGridCardConfig, StackCardConfig } from "../types/homeassistant/lovelace/cards/types";
import { LovelaceViewConfig } from "../types/homeassistant/data/lovelace";
import { views } from "../types/strategy/views";
import { ChipsCardConfig } from "../types/lovelace-mushroom/cards/chips-card";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { RefreshChip } from "../chips/RefreshChip";
import { UnavailableChip } from "../chips/UnavailableChip";
import { LabelRegistryEntry } from "../types/homeassistant/data/label_registry";
import { navigateTo } from "../utils";
import { UNDISCLOSED } from "../variables";

/**
 * Tags View Class.
 *
 * Displays all labels/tags with their entities, showing aggregate cards per label.
 * Clicking a label card opens a popup with all entities that have that label.
 *
 * @class
 */
class TagsView {
  /**
   * Default configuration of the view.
   *
   * @type {views.ViewConfig}
   * @private
   */
  config: views.ViewConfig = {
    title: Helper.localize("component.linus_dashboard.entity.text.tags_view.state.title") || "Tags",
    icon: "mdi:tag-multiple",
    type: "sections",
    subview: false,
  };

  /**
   * Class constructor.
   *
   * @throws {Error} If the Helper module isn't initialized.
   */
  constructor() {
    if (!Helper.isInitialized()) {
      throw new Error("The Helper module must be initialized before using this one.");
    }
  }

  /**
   * Create the badges (chips) to include in the view.
   *
   * @return {Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]>} Promise with chip cards.
   */
  async createSectionBadges(): Promise<(StackCardConfig | TemplateCardConfig | ChipsCardConfig)[]> {
    const chips: any[] = [];

    // Unavailable chip
    try {
      const unavailableChip = new UnavailableChip().getChip();
      if (unavailableChip) chips.push(unavailableChip);
    } catch (e) {
      Helper.logError("An error occurred while creating the unavailable chip!", e);
    }

    // Refresh chip
    try {
      chips.push(new RefreshChip().getChip());
    } catch (e) {
      Helper.logError("An error occurred while creating the refresh chip!", e);
    }

    return chips.map(chip => ({
      type: "custom:mushroom-chips-card",
      alignment: "center",
      chips: [chip],
    }));
  }

  /**
   * Get all entities grouped by their first label.
   * Returns entity IDs for each label.
   *
   * @returns {Record<string, string[]>} Label ID to entity IDs mapping
   * @private
   */
  private getEntitiesByLabel(): Record<string, string[]> {
    const result: Record<string, string[]> = {};

    for (const [entityId, entity] of Object.entries(Helper.entities)) {
      const entityLabels = entity.labels || [];

      if (entityLabels.length === 0) {
        // Entity has no labels - add to "no label" group
        if (!result['__no_label__']) {
          result['__no_label__'] = [];
        }
        result['__no_label__'].push(entityId);
      } else {
        // Add to ALL label groups (entity appears in each)
        for (const labelId of entityLabels) {
          if (!result[labelId]) {
            result[labelId] = [];
          }
          result[labelId].push(entityId);
        }
      }
    }

    return result;
  }

  /**
   * Create an aggregate card for a label.
   *
   * @param labelId - Label ID
   * @param labelInfo - Label info object
   * @param entityIds - Array of entity IDs with this label
   * @returns Card configuration
   * @private
   */
  private createLabelCard(
    labelId: string,
    labelInfo: LabelRegistryEntry,
    entityIds: string[]
  ): TemplateCardConfig {
    // Count entities text
    const entitiesText = Helper.localize("component.linus_dashboard.entity.text.tags_view.state.entities") || "entities";

    // Build secondary text: description (if exists) + entity count
    let secondaryText = `${entityIds.length} ${entitiesText}`;
    if (labelInfo.description) {
      secondaryText = `${labelInfo.description}\n${entityIds.length} ${entitiesText}`;
    }

    // Build popup content with hierarchical floor/area structure
    const popupCards = this.buildLabelPopupContent(labelId, labelInfo, entityIds);

    // Create popup action
    const popupAction = {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: labelInfo.name,
          content: {
            type: "vertical-stack",
            cards: popupCards,
          },
        },
      },
    };

    return {
      type: "custom:mushroom-template-card",
      primary: labelInfo.name,
      secondary: secondaryText,
      icon: labelInfo.icon ?? "mdi:tag",
      icon_color: labelInfo.color ?? "blue",
      multiline_secondary: true,
      tap_action: popupAction as any,
    } as TemplateCardConfig;
  }

  /**
   * Build popup content with hierarchical floor/area structure.
   * Similar to AggregatePopup but for label-based entity grouping.
   *
   * @param labelId - Label ID
   * @param labelInfo - Label info object
   * @param entityIds - Array of entity IDs with this label
   * @returns Array of card configurations for the popup
   * @private
   */
  private buildLabelPopupContent(
    labelId: string,
    labelInfo: LabelRegistryEntry,
    entityIds: string[]
  ): any[] {
    const cards: any[] = [];

    // 1. Status card + "View All" button on same line (horizontal-stack)
    const entitiesText = Helper.localize("component.linus_dashboard.entity.text.tags_view.state.entities") || "entities";
    const viewLabel = Helper.localize("component.linus_dashboard.entity.text.aggregate_popup.state.view_all") || "View All";
    const currentPath = window.location.pathname;

    const statusCard = {
      type: "markdown",
      content: `**${entityIds.length}** ${entitiesText}`,
    };

    if (!currentPath.includes("/tags")) {
      cards.push({
        type: "horizontal-stack",
        cards: [
          statusCard,
          {
            type: "custom:mushroom-template-card",
            primary: viewLabel,
            icon: "mdi:arrow-right",
            icon_color: "blue",
            layout: "horizontal",
            tap_action: navigateTo("tags"),
            hold_action: { action: "none" },
            double_tap_action: { action: "none" },
          }
        ]
      });
    } else {
      cards.push(statusCard);
    }

    // 3. Separator "Individual Controls"
    if (entityIds.length > 1) {
      const subtitle = Helper.localize("component.linus_dashboard.entity.text.aggregate_popup.state.individual_controls") || "Individual Controls";
      cards.push({
        type: "custom:mushroom-title-card",
        subtitle,
        card_mod: {
          style: `
            ha-card.header {
              padding-top: 8px;
              padding-bottom: 4px;
            }
          `,
        },
      });
    }

    // 4. Build hierarchical floor → area → entities
    const hierarchicalCards = this.buildHierarchicalEntityCards(entityIds);
    cards.push(...hierarchicalCards);

    return cards;
  }

  /**
   * Build hierarchical entity cards organized by floor and area.
   *
   * @param entityIds - Array of entity IDs
   * @returns Array of card configurations
   * @private
   */
  private buildHierarchicalEntityCards(entityIds: string[]): any[] {
    const cards: any[] = [];

    // Group entities by floor and area
    const entityByFloorArea: Record<string, Record<string, string[]>> = {};
    const undisclosedEntities: string[] = [];

    for (const entityId of entityIds) {
      // Use Helper.getEntityArea which handles device inheritance
      const area = Helper.getEntityArea(entityId);
      const floorId = area?.floor_id ?? UNDISCLOSED;
      const areaSlug = area?.slug ?? UNDISCLOSED;

      if (floorId === UNDISCLOSED || areaSlug === UNDISCLOSED) {
        undisclosedEntities.push(entityId);
        continue;
      }

      if (!entityByFloorArea[floorId]) {
        entityByFloorArea[floorId] = {};
      }
      if (!entityByFloorArea[floorId][areaSlug]) {
        entityByFloorArea[floorId][areaSlug] = [];
      }
      entityByFloorArea[floorId][areaSlug].push(entityId);
    }

    // Process floors in order
    const orderedFloorIds = Helper.orderedFloors
      .map(f => f.floor_id)
      .filter(fid => fid !== UNDISCLOSED && entityByFloorArea[fid]);

    for (const floorId of orderedFloorIds) {
      const floor = Helper.floors[floorId];
      if (!floor) continue;

      const areasInFloor = entityByFloorArea[floorId];

      // Floor separator
      cards.push({
        type: "heading",
        heading: floor.name,
        heading_style: "title",
        icon: floor.icon ?? "mdi:floor-plan",
      });

      // Process areas in this floor
      for (const areaSlug of Object.keys(areasInFloor)) {
        const area = Helper.areas[areaSlug];
        if (!area) continue;

        const areaEntityIds = areasInFloor[areaSlug];

        // Area separator
        cards.push({
          type: "heading",
          heading: area.name,
          heading_style: "subtitle",
          icon: area.icon ?? "mdi:home",
        });

        // Entity tiles
        for (const entityId of areaEntityIds) {
          cards.push({
            type: "tile",
            entity: entityId,
          });
        }
      }
    }

    // Add undisclosed entities at the end if any
    if (undisclosedEntities.length > 0) {
      const undisclosedLabel = Helper.localize("ui.card.area.area_not_found") || "Unassigned";
      cards.push({
        type: "heading",
        heading: undisclosedLabel,
        heading_style: "subtitle",
        icon: "mdi:help-circle",
      });

      for (const entityId of undisclosedEntities) {
        cards.push({
          type: "tile",
          entity: entityId,
        });
      }
    }

    return cards;
  }

  /**
   * Create the cards to include in the view.
   *
   * @return {Promise<LovelaceGridCardConfig[]>} Promise with view sections.
   */
  async createSectionCards(): Promise<LovelaceGridCardConfig[]> {
    const globalSection: LovelaceGridCardConfig = {
      type: "grid",
      column_span: 1,
      cards: []
    };

    // Get all labels
    const labels = Helper.labels;

    // Get all entities grouped by label
    const entitiesByLabel = this.getEntitiesByLabel();

    // Sort labels by name
    const sortedLabelIds = Object.keys(labels).sort((a, b) => {
      const nameA = labels[a]?.name || a;
      const nameB = labels[b]?.name || b;
      return nameA.localeCompare(nameB);
    });

    // Create a card for each label that has entities
    for (const labelId of sortedLabelIds) {
      const labelInfo = labels[labelId];
      const entityIds = entitiesByLabel[labelId] || [];

      if (entityIds.length === 0) continue;

      // Create aggregate card for this label
      const card = this.createLabelCard(labelId, labelInfo, entityIds);
      globalSection.cards.push(card);
    }

    // If no labels exist at all, show a message
    if (globalSection.cards.length === 0) {
      globalSection.cards.push({
        type: "custom:mushroom-template-card",
        primary: Helper.localize("component.linus_dashboard.entity.text.tags_view.state.no_entities") || "No labels found",
        icon: "mdi:tag-off",
        icon_color: "grey",
      } as TemplateCardConfig);
    }

    return [globalSection];
  }

  /**
   * Get the complete view configuration.
   *
   * @return {Promise<LovelaceViewConfig>} The complete view configuration.
   */
  async getView(): Promise<LovelaceViewConfig> {
    return {
      ...this.config,
      badges: await this.createSectionBadges(),
      sections: await this.createSectionCards(),
    };
  }
}

export { TagsView };
