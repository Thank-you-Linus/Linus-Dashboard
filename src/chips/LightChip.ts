import { Helper } from "../Helper";
import { chips } from "../types/strategy/chips";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { getMAEntity, navigateTo } from "../utils";
import { PopupFactory } from "../services/PopupFactory";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Light Chip class.
 *
 * Used to create a chip to indicate how many lights are on and control them.
 */
class LightChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {TemplateChipConfig}
   *
   * @readonly
   * @private
   */
  readonly #defaultConfig: TemplateChipConfig = {
    type: "template",
    icon_color: "amber",
    content: "",
    tap_action: navigateTo('light'),
    hold_action: navigateTo('light'),
  };

  /**
   * Class Constructor.
   *
   * @param {chips.ChipOptions} options The chip options.
   */
  constructor(options: chips.ChipOptions) {
    super();


    const entities = Helper.getEntityIds({
      domain: "light",
      area_slug: options?.area_slug,
    });

    if (!entities.length) {
      if (Helper.debug) console.warn("No entities found for light chip");
      return;
    }

    if (options?.show_content) {
      this.#defaultConfig.content = Helper.getContent("light", undefined, entities);
    }

    this.#defaultConfig.icon = Helper.getIcon("light", undefined, entities);
    this.#defaultConfig.icon_color = Helper.getIconColor("light", undefined, entities);

    // Use EntityResolver to get all_lights entity (Linus Brain or Magic Areas)
    let allLightsEntity: string | null = null;

    if (options?.magic_device_id && options.magic_device_id !== "global") {
      const resolver = Helper.entityResolver;
      const allLightsResolution = resolver.resolveAllLights(options.magic_device_id);
      allLightsEntity = allLightsResolution.entity_id;
    } else {
      // For global, fallback to Magic Areas
      const magicAreasEntity = getMAEntity("global", "light");
      allLightsEntity = magicAreasEntity?.entity_id ?? null;
    }

    if (allLightsEntity) {
      // Linus Brain or Magic Areas entity exists
      this.#defaultConfig.entity = allLightsEntity;

      // UNIFORMISATION: Always use more-info for Linus Brain and Magic Areas
      this.#defaultConfig.tap_action = { action: "more-info" };
      this.#defaultConfig.hold_action = navigateTo('light');

    } else {
      // No entity resolver match - use aggregate popup via PopupFactory
      const area_slug = Array.isArray(options?.area_slug) ? options?.area_slug : [options?.area_slug];
      const entity_id = area_slug.flatMap((area) => Helper.areas[area ?? "global"]?.domains?.light ?? []);
      this.#defaultConfig.entity_id = entity_id;

      if (entity_id.length > 0) {
        // Use PopupFactory to create an aggregate popup (consistent with other views)
        const scopeName = Helper.localize("component.linus_dashboard.entity.text.aggregate_popup.state.title_light");
        this.#defaultConfig.tap_action = PopupFactory.createPopup({
          domain: "light",
          scope: options?.magic_device_id === "global" ? "global" : "area",
          scopeName,
          entity_ids: entity_id,
          serviceOn: "turn_on",
          serviceOff: "turn_off",
          activeStates: ["on"],
          translationKey: "light",
          linusBrainEntity: null,
          features: [
            { type: "light-brightness" },
          ],
        });
        this.#defaultConfig.hold_action = navigateTo('light');
      }

      if (options.hold_action) {
        this.#defaultConfig.hold_action = options.hold_action;
      }
    }

    this.config = Object.assign(this.config, this.#defaultConfig, options);
  }
}

export { LightChip };
