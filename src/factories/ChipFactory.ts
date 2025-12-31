import { Helper } from "../Helper";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { ComponentRegistry } from "../utils/componentRegistry";

/**
 * Chip Factory
 *
 * Centralizes the logic for dynamically loading and creating chips.
 * Provides consistent error handling and optional caching.
 *
 * Benefits:
 * - Single place for chip creation logic
 * - Consistent error handling
 * - Easy to extend with caching
 * - Cleaner code in view files
 *
 * @example
 * ```typescript
 * // Create a specific chip
 * const spotifyChip = await ChipFactory.createChip("SpotifyChip", { entity_id: "media_player.spotify" });
 *
 * // Create with auto-detection
 * const chip = await ChipFactory.createChipByType("alarm", options);
 * ```
 */
export class ChipFactory {
  /**
   * Create a chip by explicit class name.
   *
   * @param chipClassName - The chip class name (e.g., "SpotifyChip", "AlarmChip", "LinusBrainChip")
   * @param options - Chip configuration options
   * @param basePath - Base import path (default: "../chips")
   * @returns Promise<LovelaceChipConfig | null> - The chip config, or null if creation failed
   *
   * @example
   * ```typescript
   * const chip = await ChipFactory.createChip("SpotifyChip", { entity_id: "media_player.spotify" });
   * if (chip) chips.push(chip);
   * ```
   */
  static async createChip(
    chipClassName: string,
    options: any = {}
  ): Promise<LovelaceChipConfig | null> {
    try {
      const sanitizedClassName = Helper.sanitizeClassName(chipClassName);
      const chipModule = await ComponentRegistry.getChip(sanitizedClassName);

      if (!chipModule || !chipModule[sanitizedClassName]) {
        return null;
      }

      const chipInstance = new chipModule[sanitizedClassName](options);
      return chipInstance.getChip();

    } catch (error) {
      if (Helper.debug) {
        Helper.logError(`Failed to create chip ${chipClassName}`, error);
      }
      return null;
    }
  }

  /**
   * Create a chip by type (auto-appends "Chip" suffix).
   *
   * @param chipType - The chip type (e.g., "Spotify", "Alarm", "LinusBrain")
   * @param options - Chip configuration options
   * @returns Promise<LovelaceChipConfig | null> - The chip config, or null if creation failed
   *
   * @example
   * ```typescript
   * const chip = await ChipFactory.createChipByType("Spotify", { entity_id: "media_player.spotify" });
   * ```
   */
  static async createChipByType(
    chipType: string,
    options: any = {}
  ): Promise<LovelaceChipConfig | null> {
    const className = chipType.endsWith("Chip") ? chipType : chipType + "Chip";
    return this.createChip(className, options);
  }

  /**
   * Create multiple chips from a list of types/options.
   *
   * @param chipSpecs - Array of { type, options } objects
   * @returns Promise<LovelaceChipConfig[]> - Array of chip configs (null entries filtered out)
   *
   * @example
   * ```typescript
   * const chips = await ChipFactory.createChips([
   *   { type: "Spotify", options: { entity_id: "media_player.spotify" } },
   *   { type: "Alarm", options: { entity_id: "alarm_control_panel.home" } }
   * ]);
   * ```
   */
  static async createChips(
    chipSpecs: { type: string; options: any }[]
  ): Promise<LovelaceChipConfig[]> {
    const chips: LovelaceChipConfig[] = [];

    for (const spec of chipSpecs) {
      const chip = await this.createChipByType(spec.type, spec.options);
      if (chip) {
        chips.push(chip);
      }
    }

    return chips;
  }

  /**
   * Create a chip with automatic error handling and optional wrapping.
   *
   * @param chipClassName - The chip class name
   * @param options - Chip options
   * @param wrapInMushroom - If true, wraps chip in mushroom-chips-card
   * @returns Promise<any | null> - The chip config (optionally wrapped), or null
   *
   * @example
   * ```typescript
   * // Without wrapping
   * const chip = await ChipFactory.createChipSafe("RefreshChip", {});
   *
   * // With mushroom wrapping
   * const wrappedChip = await ChipFactory.createChipSafe("RefreshChip", {}, true);
   * // Returns: { type: "custom:mushroom-chips-card", chips: [chip], alignment: "center" }
   * ```
   */
  static async createChipSafe(
    chipClassName: string,
    options: any = {},
    wrapInMushroom = false
  ): Promise<any | null> {
    const chip = await this.createChip(chipClassName, options);

    if (!chip) {
      return null;
    }

    if (wrapInMushroom) {
      return {
        type: "custom:mushroom-chips-card",
        chips: [chip],
        alignment: "center",
      };
    }

    return chip;
  }
}
