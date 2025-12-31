/**
 * Component Registry for Linus Dashboard
 *
 * Caches dynamically imported modules to avoid redundant imports.
 * Provides preloading for commonly used components to improve initial load performance.
 *
 * @example
 * // Get a card module (cached)
 * const LightCardModule = await ComponentRegistry.getCard('LightCard');
 * if (LightCardModule) {
 *   const card = new LightCardModule.LightCard(options, entity);
 * }
 *
 * // Preload common components during initialization
 * await ComponentRegistry.preloadCommon();
 *
 * // Check stats
 * console.log(ComponentRegistry.getStats());
 * // { cards: 8, chips: 5, views: 2, total: 15 }
 */

import { Helper } from "../Helper";

import { PerformanceProfiler } from "./performanceProfiler";

/**
 * Component Registry singleton class
 * Manages caching of dynamically imported Card, Chip, and View modules
 */
class ComponentRegistry {
  private static cardModules = new Map<string, any>();
  private static chipModules = new Map<string, any>();
  private static viewModules = new Map<string, any>();

  /**
   * Preload commonly used components
   * Called during Helper.initialize() to frontload imports
   *
   * This reduces latency when generating views by loading the most
   * frequently used cards and chips upfront during initialization.
   *
   * @returns Promise that resolves when all common components are loaded
   */
  static async preloadCommon(): Promise<void> {
    const perfKey = PerformanceProfiler.start('ComponentRegistry.preload');

    // Most common cards (based on typical Home Assistant usage patterns)
    const commonCards = [
      'LightCard',
      'SwitchCard',
      'SensorCard',
      'BinarySensorCard',
      'ClimateCard',
      'MediaPlayerCard',
      'CoverCard',
      'AggregateCard'
    ];

    // Most common chips
    const commonChips = [
      'AggregateChip',
      'RefreshChip',
      'SettingsChip',
      'WeatherChip',
      'UnavailableChip'
    ];

    try {
      // Parallel preload of all common components
      await Promise.all([
        ...commonCards.map(name => this.getCard(name)),
        ...commonChips.map(name => this.getChip(name))
      ]);

      PerformanceProfiler.end(perfKey, {
        cardsPreloaded: commonCards.length,
        chipsPreloaded: commonChips.length,
        totalPreloaded: commonCards.length + commonChips.length
      });
    } catch (error) {
      PerformanceProfiler.end(perfKey);
      if (Helper.debug) {
        Helper.logError('[ComponentRegistry] Preload failed (non-critical)', error);
      }
    }
  }

  /**
   * Get card module (cached)
   *
   * @param className - Card class name (e.g., 'LightCard')
   * @returns Promise resolving to module or null if not found
   */
  static async getCard(className: string): Promise<any> {
    // Return cached module if available
    if (this.cardModules.has(className)) {
      return this.cardModules.get(className);
    }

    try {
      const module = await import(`../cards/${className}`);
      this.cardModules.set(className, module);
      return module;
    } catch (_e) {
      // Module doesn't exist - return null for fallback logic
      // Don't cache null to allow retry if module is added later
      return null;
    }
  }

  /**
   * Get chip module (cached)
   *
   * @param className - Chip class name (e.g., 'LightChip')
   * @returns Promise resolving to module or null if not found
   */
  static async getChip(className: string): Promise<any> {
    // Return cached module if available
    if (this.chipModules.has(className)) {
      return this.chipModules.get(className);
    }

    try {
      const module = await import(`../chips/${className}`);
      this.chipModules.set(className, module);
      return module;
    } catch (_e) {
      // Module doesn't exist - return null for fallback logic
      return null;
    }
  }

  /**
   * Get view module (cached)
   *
   * @param className - View class name (e.g., 'HomeView')
   * @returns Promise resolving to module or null if not found
   */
  static async getView(className: string): Promise<any> {
    // Return cached module if available
    if (this.viewModules.has(className)) {
      return this.viewModules.get(className);
    }

    try {
      const module = await import(`../views/${className}`);
      this.viewModules.set(className, module);
      return module;
    } catch (_e) {
      // Module doesn't exist - return null
      return null;
    }
  }

  /**
   * Clear all cached modules
   * Useful for testing or when forcing a refresh
   */
  static clear(): void {
    this.cardModules.clear();
    this.chipModules.clear();
    this.viewModules.clear();
  }

  /**
   * Clear specific cache type
   *
   * @param type - Cache type to clear ('cards', 'chips', or 'views')
   */
  static clearType(type: 'cards' | 'chips' | 'views'): void {
    switch (type) {
      case 'cards':
        this.cardModules.clear();
        break;
      case 'chips':
        this.chipModules.clear();
        break;
      case 'views':
        this.viewModules.clear();
        break;
    }
  }

  /**
   * Get cache statistics
   *
   * @returns Object with cache sizes
   */
  static getStats() {
    return {
      cards: this.cardModules.size,
      chips: this.chipModules.size,
      views: this.viewModules.size,
      total: this.cardModules.size + this.chipModules.size + this.viewModules.size
    };
  }

  /**
   * Check if a specific component is cached
   *
   * @param type - Component type ('card', 'chip', or 'view')
   * @param className - Class name to check
   * @returns true if component is cached
   */
  static isCached(type: 'card' | 'chip' | 'view', className: string): boolean {
    switch (type) {
      case 'card':
        return this.cardModules.has(className);
      case 'chip':
        return this.chipModules.has(className);
      case 'view':
        return this.viewModules.has(className);
      default:
        return false;
    }
  }
}

export { ComponentRegistry };
