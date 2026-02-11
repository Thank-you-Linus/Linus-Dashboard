import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { navigateTo } from "../utils";
import { LabelRegistryEntry } from "../types/homeassistant/data/label_registry";
import { UNDISCLOSED } from "../variables";

import { AbstractChip } from "./AbstractChip";

/**
 * Tags Chip Options
 */
export interface TagsChipOptions {
  /** Optional area slug to filter entities */
  area_slug?: string;
}

/**
 * Tags Chip class.
 *
 * Used to create a chip showing the count of labeled entities.
 * Tapping navigates to the Tags view.
 */
class TagsChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @private
   * @readonly
   */
  readonly #defaultConfig: TemplateChipConfig;

  /**
   * Area slug for filtering (optional)
   */
  private areaSlug?: string;

  /**
   * Get labels in use with their entity IDs.
   *
   * @returns Map of label ID to entity IDs array
   * @private
   */
  private getLabelsWithEntities(): Map<string, string[]> {
    const labelEntities = new Map<string, string[]>();
    for (const [entityId, entity] of Object.entries(Helper.entities)) {
      // Filter by area if specified
      if (this.areaSlug && entity.area_id !== this.areaSlug) {
        continue;
      }
      if (entity.labels) {
        for (const labelId of entity.labels) {
          if (!labelEntities.has(labelId)) {
            labelEntities.set(labelId, []);
          }
          labelEntities.get(labelId)!.push(entityId);
        }
      }
    }
    return labelEntities;
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
   * Build popup action for a single label.
   *
   * @param labelId - Label ID
   * @param labelInfo - Label info object
   * @param entityIds - Array of entity IDs with this label
   * @returns Popup action configuration
   * @private
   */
  private buildLabelPopupAction(labelId: string, labelInfo: LabelRegistryEntry | undefined, entityIds: string[]): any {
    const cards: any[] = [];

    // 1. Status card + "View All" button on same line
    const entitiesText = Helper.localize("component.linus_dashboard.entity.text.tags_view.state.entities") || "entities";
    const viewLabel = Helper.localize("component.linus_dashboard.entity.text.aggregate_popup.state.view_all") || "View All";

    cards.push({
      type: "horizontal-stack",
      cards: [
        {
          type: "markdown",
          content: `**${entityIds.length}** ${entitiesText}`,
        },
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

    // 2. Separator "Individual Controls"
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

    // 3. Build hierarchical floor → area → entities
    const hierarchicalCards = this.buildHierarchicalEntityCards(entityIds);
    cards.push(...hierarchicalCards);

    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: labelInfo?.name ?? labelId,
          content: {
            type: "vertical-stack",
            cards,
          },
        },
      },
    };
  }

  /**
   * Build the popup action for displaying all labels.
   *
   * @param labelEntities - Map of label ID to entity IDs
   * @returns Popup action configuration
   * @private
   */
  private buildPopupAction(labelEntities: Map<string, string[]>): any {
    const cards: any[] = [];

    // 1. Status card + "View All" button on same line (horizontal-stack)
    const tagsText = Helper.localize("component.linus_dashboard.entity.text.tags_view.state.title") || "Tags";
    const viewLabel = Helper.localize("component.linus_dashboard.entity.text.aggregate_popup.state.view_all") || "View All";

    cards.push({
      type: "horizontal-stack",
      cards: [
        {
          type: "markdown",
          content: `**${labelEntities.size}** ${tagsText.toLowerCase()}`,
        },
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

    // 2. Separator
    if (labelEntities.size > 0) {
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

    // 3. Label cards sorted by name - each opens its own popup
    const sortedLabelIds = Array.from(labelEntities.keys()).sort((a, b) => {
      const nameA = Helper.getLabelName(a);
      const nameB = Helper.getLabelName(b);
      return nameA.localeCompare(nameB);
    });

    const entitiesText = Helper.localize("component.linus_dashboard.entity.text.tags_view.state.entities") || "entities";

    for (const labelId of sortedLabelIds) {
      const labelInfo = Helper.getLabel(labelId);
      const entityIds = labelEntities.get(labelId) || [];

      cards.push({
        type: "custom:mushroom-template-card",
        primary: labelInfo?.name ?? labelId,
        secondary: `${entityIds.length} ${entitiesText}`,
        icon: labelInfo?.icon ?? "mdi:tag",
        icon_color: labelInfo?.color ?? "blue",
        tap_action: this.buildLabelPopupAction(labelId, labelInfo, entityIds),
        hold_action: { action: "none" },
        double_tap_action: { action: "none" },
      });
    }

    const popupTitle = Helper.localize("component.linus_dashboard.entity.text.tags_view.state.title") || "Tags";

    return {
      action: "fire-dom-event",
      browser_mod: {
        service: "browser_mod.popup",
        data: {
          title: popupTitle,
          content: {
            type: "vertical-stack",
            cards,
          },
        },
      },
    };
  }

  /**
   * Class Constructor.
   *
   * @param options - Optional configuration
   */
  constructor(options?: TagsChipOptions) {
    super();

    this.areaSlug = options?.area_slug;

    const labelEntities = this.getLabelsWithEntities();

    // Only show chip if there are labels in use
    if (labelEntities.size === 0) {
      this.#defaultConfig = {
        type: "template",
        icon: "",
        content: "",
        tap_action: { action: "none" }
      };
      return;
    }

    this.#defaultConfig = {
      type: "template",
      icon: "mdi:tag-multiple",
      icon_color: "blue",
      content: `${labelEntities.size}`,
      tap_action: this.buildPopupAction(labelEntities)
    };

    this.config = Object.assign(this.config, this.#defaultConfig);
  }
}

export { TagsChip };
