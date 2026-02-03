import { Helper } from "../Helper";

/**
 * Configuration for building a section
 */
export interface SectionConfig {
  // Heading
  heading?: string;
  heading_style?: "title" | "subtitle";
  icon?: string;
  tap_action?: any;

  // Badges
  showBadge?: boolean;
  showAggregateChip?: boolean;
  badgeTapAction?: any;
  extraChips?: any[];

  // Cards (flexible: either entity_ids for auto-tiles OR custom cards)
  customCards?: any[];
  entity_ids?: string[];
  features?: any[];

  // Aggregate chip data (for badge content)
  domain?: string;
  device_class?: string;
  activeStates?: string[];
}

/**
 * Configuration for building a heading card
 */
interface HeadingConfig {
  heading: string;
  heading_style: "title" | "subtitle";
  icon?: string;
  tap_action?: any;
  badges: any[];
}

/**
 * Section Builder
 * 
 * Creates consistent sections for both views and popups:
 * - Heading (type: "heading") with optional icon and tap_action
 * - Badges (mushroom-chips-card with aggregate chips)
 * - Cards (swipe cards, tiles, or custom cards)
 * 
 * Used to maintain visual consistency between HomeView, FloorView, AreaView and AggregatePopup.
 */
export class SectionBuilder {
  /**
   * Build a complete section with heading + badges + cards
   * 
   * @param config - Section configuration
   * @returns Array of cards [heading?, ...customCards? OR ...auto-tiles?]
   * 
   * Note: If customCards is defined (even as empty array []), it will be used instead of auto-generating tiles.
   * This allows creating heading-only sections (separators) without duplicate tiles.
   */
  static buildSection(config: SectionConfig): any[] {
    const cards = [];

    // 1. Heading with badges (if requested)
    if (config.heading) {
      const headingCard = this.buildHeadingWithBadge(config);
      cards.push(headingCard);
    }

    // 2. Cards (flexible: custom cards OR auto-generated tiles)
    if (config.customCards !== undefined) {
      // customCards is explicitly defined (even if empty array) → use it
      // This allows creating heading-only sections without auto-generating tiles
      cards.push(...config.customCards);
    } else if (config.entity_ids && config.entity_ids.length > 0) {
      // No customCards defined → auto-create simple tile cards
      for (const entity_id of config.entity_ids) {
        cards.push({
          type: "tile",
          entity: entity_id,
          features: config.features || []
        });
      }
    }

    return cards;
  }

  /**
   * Build heading card with integrated badges
   * 
   * @param config - Section configuration
   * @returns Heading card with badges property
   */
  private static buildHeadingWithBadge(config: SectionConfig): any {
    const badges = config.showBadge ? this.buildBadges(config) : [];

    return {
      type: "heading",
      heading: config.heading,
      heading_style: config.heading_style || "subtitle",
      ...(config.icon && { icon: config.icon }),
      badges,
      ...(config.tap_action && { tap_action: config.tap_action })
    };
  }

  /**
   * Build badges (mushroom-chips-card with aggregate chips)
   * 
   * Returns array with single mushroom-chips-card containing all chips
   * 
   * @param config - Section configuration
   * @returns Array with mushroom-chips-card or empty array
   */
  private static buildBadges(config: SectionConfig): any[] {
    if (!config.entity_ids || config.entity_ids.length === 0) {
      return [];
    }

    const chips = [];

    // Build aggregate chip (if requested)
    if (config.showAggregateChip) {
      const aggregateChip = this.buildAggregateChip(config);
      if (aggregateChip) chips.push(aggregateChip);
    }

    // Add extra chips (if any)
    if (config.extraChips) {
      chips.push(...config.extraChips);
    }

    if (chips.length === 0) return [];

    // Return single mushroom-chips-card with all chips
    return [{
      type: "custom:mushroom-chips-card",
      alignment: "end",
      chips,
      card_mod: {
        style: `
          ha-card {
            width: max-content;
          }
        `
      }
    }];
  }

  /**
   * Build aggregate chip (template chip with icon, color, content, and tap_action)
   * 
   * Shows count of active entities (e.g., "3" for 3 lights on)
   * 
   * @param config - Section configuration
   * @returns Template chip configuration or null
   */
  private static buildAggregateChip(config: SectionConfig): any | null {
    const { domain, device_class, entity_ids, activeStates } = config;

    if (!entity_ids || !activeStates || entity_ids.length === 0) {
      return null;
    }

    // Build Jinja2 template for content (count of active entities)
    const statesArray = entity_ids.map(id => `states["${id}"]`).join(', ');
    const activeStatesCondition = activeStates.map(s => `'${s}'`).join(', ');

    return {
      type: "template",
      icon: Helper.getIcon(domain || "", device_class || undefined, entity_ids),
      icon_color: Helper.getIconColor(domain || "", device_class || undefined, entity_ids),
      content: `
        {% set entities = [${statesArray}] %}
        {% set active = entities | selectattr('state', 'in', [${activeStatesCondition}]) | list | count %}
        {{ active }}
      `.trim(),
      tap_action: config.badgeTapAction || { action: "none" }
    };
  }
}
