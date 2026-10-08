import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

import { AggregatePopup, AggregatePopupConfigWithEntities } from "./AggregatePopup";

/**
 * Icon used when a scene declares no icon of its own.
 */
const SCENE_FALLBACK_ICON = "mdi:palette";

/**
 * A scene, resolved at dashboard-generation time, ready to be turned into a chip.
 */
export interface SceneChipSource {
  /** The scene entity id (e.g. "scene.salon_soiree") */
  entity_id: string;
  /** Label shown on the chip (friendly name) */
  name: string;
}

/**
 * Build the scene shortcut chips.
 *
 * Pure function: no Helper access, no Home Assistant state lookup — the
 * caller resolves the scenes, this only maps them to chip configurations.
 *
 * `tap_action` is declared explicitly (rather than relying on the tile/chip
 * default, which is `more-info`) so a tap fires the scene without stacking a
 * dialog on top of the popup.
 *
 * @param scenes - Scenes to render, already scoped by the caller
 * @returns One template chip per scene (empty array for an empty input)
 */
export function buildSceneChips(scenes: SceneChipSource[]): TemplateChipConfig[] {
  return scenes.map(({ entity_id, name }) => ({
    type: "template",
    entity: entity_id,
    icon: `{{ state_attr('${entity_id}', 'icon') or '${SCENE_FALLBACK_ICON}' }}`,
    // Always a text label, never an icon alone (accessibility)
    content: name,
    tap_action: {
      action: "call-service",
      service: "scene.turn_on",
      data: { entity_id }
    },
    hold_action: {
      action: "more-info"
    }
  }));
}

/**
 * Light Popup Class
 *
 * Specialized popup for light aggregates with horizontal tile layout.
 * Extends AggregatePopup to provide light-specific presentation.
 */
class LightPopup extends AggregatePopup {

  /**
   * Override: Build light tile with inline features
   * Light tiles display brightness slider inline instead of in feature menu
   */
  protected override buildEntityTile(entity_id: string, config: any): any {
    return {
      type: "tile",
      entity: entity_id,
      features: config.features || [],
      features_position: "inline"
    };
  }

  /**
   * Override: quick access to the scenes of the popup's own scope.
   *
   * Rendered for the **area scope only**. This is a decision, not a fallback:
   * in floor and global scope the individual tiles are grouped hierarchically
   * by floor then area, so a flat scenes block at the top of the popup could
   * not be attributed to any of the sections below — the user would not know
   * which room's scene they are firing.
   *
   * Returns an empty array (hence: no title, no empty block) when the scope
   * isn't an area, or when the area has no scene.
   */
  protected override buildExtraSections(config: AggregatePopupConfigWithEntities): any[] {
    if (config.scope !== "area" || !config.area_slug) {
      return [];
    }

    // Resolved at generation time, same as the popup's other entities.
    // Magic Areas / Linus Brain / Linus Dashboard generated scenes are
    // already excluded upstream by Helper's own aggregate filtering.
    const scenes: SceneChipSource[] = Helper
      .getEntityIds({ domain: "scene", area_slug: config.area_slug })
      .map((entity_id) => ({
        entity_id,
        name: Helper.getEntityState(entity_id)?.attributes?.friendly_name ?? entity_id
      }));

    const chips = buildSceneChips(scenes);

    if (chips.length === 0) {
      return [];
    }

    return [
      {
        type: "custom:mushroom-title-card",
        subtitle: Helper.localize("component.linus_dashboard.entity.text.aggregate_popup.state.scenes"),
        card_mod: {
          style: `
          ha-card.header {
            padding-top: 8px;
            padding-bottom: 4px;
          }
        `
        }
      },
      {
        type: "custom:mushroom-chips-card",
        alignment: "center",
        chips
      }
    ];
  }
}

export { LightPopup };
