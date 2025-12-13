/**
 * Lovelace Dashboard Embedding Module
 * 
 * Provides native integration of external Lovelace dashboards into Linus Dashboard
 * without using iframes or custom cards.
 * 
 * @module embedLovelace
 */

import { Helper } from "./Helper";
import { LovelaceCardConfig, LovelaceConfig, LovelaceViewConfig } from "./types/homeassistant/data/lovelace";
import { EmbedViewCardConfig, EmbeddedDashboardResult } from "./types/strategy/embed";

/**
 * Apply embedded view metadata to a target view configuration.
 * Updates the view with all metadata from the embedded view for perfect replication.
 * 
 * @param targetView - View configuration to update
 * @param metadata - Metadata from the embedded view
 * @param hasCards - Whether the embedded view has cards
 */
export function applyEmbeddedViewMetadata(
    targetView: LovelaceViewConfig,
    metadata: NonNullable<EmbeddedDashboardResult["viewMetadata"]>,
    hasCards: boolean
): void {
    const view = targetView as any;

    // Title: Use embedded view's title if available
    if (metadata.title) {
        targetView.title = metadata.title;
    }

    // Icon: Use embedded view's icon, or remove to show text
    if (metadata.icon) {
        targetView.icon = metadata.icon;
    } else {
        delete view.icon;
    }

    // Layout type (masonry, sidebar, panel, etc.)
    if (metadata.type) {
        view.type = metadata.type;
    }

    // Sections (for section-based views) - CRITICAL for layout!
    if (metadata.sections?.length) {
        view.sections = metadata.sections;
        // If view has ONLY sections (no cards), remove cards array
        if (!hasCards) {
            delete view.cards;
        }
    }

    // Copy all other view properties for perfect replication
    if (metadata.theme) view.theme = metadata.theme;
    if (metadata.background) view.background = metadata.background;
    if (metadata.visible !== undefined) view.visible = metadata.visible;
    if (metadata.subview !== undefined) view.subview = metadata.subview;
    if (metadata.back_path) view.back_path = metadata.back_path;
    if (metadata.max_columns) view.max_columns = metadata.max_columns;
    if (metadata.badges?.length) view.badges = metadata.badges;
}

/**
 * Create an error card for failed dashboard embedding.
 * 
 * @param error - Error message
 * @returns Markdown card with error message
 */
function createErrorCard(error: string): LovelaceCardConfig {
    return {
        type: "markdown",
        content: `⚠️ **Embedding Error**\n\n${error}`,
    };
}

/**
 * Load an external Lovelace dashboard and extract a specific view's cards.
 * 
 * This function fetches a Lovelace dashboard configuration via Home Assistant's
 * websocket API and extracts all cards from a specified view.
 * 
 * @param hass - Home Assistant instance
 * @param dashboardId - Dashboard URL key (e.g., "lovelace-energy", "lovelace-solar")
 * @param viewIndex - Index of the view to extract (0-based)
 * @param viewPath - Alternative: path of the view to extract (e.g., "energy", "solar")
 * @returns Promise resolving to embedded dashboard result with cards or error
 * 
 * @example
 * ```typescript
 * const result = await loadEmbeddedDashboard(hass, "lovelace-energy", 0);
 * if (!result.error) {
 *   console.log("Loaded cards:", result.cards);
 * }
 * ```
 */
export async function loadEmbeddedDashboard(
    hass: any,
    dashboardId: string,
    viewIndex?: number,
    viewPath?: string
): Promise<EmbeddedDashboardResult> {
    try {
        // Fetch the dashboard configuration
        const dashboardConfig: LovelaceConfig = await hass.callWS({
            type: "lovelace/config",
            url_path: dashboardId,
        });

        if (!dashboardConfig?.views) {
            const error = `Dashboard "${dashboardId}" not found or has no views`;
            console.error("[Linus Dashboard]", error);
            return { cards: [], error };
        }

        // Find the target view
        let targetView: LovelaceViewConfig | undefined;

        if (viewPath) {
            targetView = dashboardConfig.views.find((view) => view.path === viewPath);
            if (!targetView) {
                return {
                    cards: [],
                    error: `View with path "${viewPath}" not found in dashboard "${dashboardId}"`,
                };
            }
        } else {
            const index = viewIndex ?? 0;
            if (index < 0 || index >= dashboardConfig.views.length) {
                return {
                    cards: [],
                    error: `View index ${index} is out of range (0-${dashboardConfig.views.length - 1}) in dashboard "${dashboardId}"`,
                };
            }
            targetView = dashboardConfig.views[index];
        }

        if (!targetView) {
            return {
                cards: [],
                error: `Could not find target view in dashboard "${dashboardId}"`,
            };
        }

        // Handle strategy-based views (not supported)
        if (targetView.strategy) {
            return {
                cards: [],
                error: `View in dashboard "${dashboardId}" uses a strategy, which cannot be embedded`,
            };
        }

        // Extract cards from the view
        const cards: LovelaceCardConfig[] = targetView.cards ? [...targetView.cards] : [];

        // Successfully loaded cards

        return {
            cards,
            viewMetadata: {
                title: targetView.title,
                icon: targetView.icon,
                type: targetView.type,
                path: targetView.path,
                theme: targetView.theme,
                background: targetView.background,
                visible: targetView.visible,
                sections: targetView.sections,
                badges: targetView.badges,
                subview: (targetView as any).subview,
                back_path: (targetView as any).back_path,
                max_columns: (targetView as any).max_columns,
            }
        };
    } catch (error: any) {
        const errorMsg = `Error loading dashboard "${dashboardId}": ${error.message || "Unknown error"}`;
        Helper.logError(errorMsg, error);
        return { cards: [], error: errorMsg };
    }
}

/**
 * Process embedded view cards in a view configuration.
 * 
 * This function scans through a view's cards array, finds any cards with type
 * "linus.embed_view", loads the referenced external dashboard, and replaces
 * the embed card with the actual cards from the external view.
 * 
 * @param hass - Home Assistant instance
 * @param cards - Array of card configurations to process
 * @returns Promise resolving to processed cards array
 * 
 * @example
 * ```typescript
 * const cards = [
 *   { type: "linus.embed_view", dashboard: "lovelace-energy", view_index: 0 },
 *   { type: "markdown", content: "# Hello" }
 * ];
 * const processed = await processEmbeddedViews(hass, cards);
 * // Result: [energy dashboard cards..., markdown card]
 * ```
 */
export async function processEmbeddedViews(
    hass: any,
    cards: LovelaceCardConfig[]
): Promise<LovelaceCardConfig[]> {
    if (!Array.isArray(cards)) {
        console.warn("[Linus Dashboard] processEmbeddedViews: Invalid cards array");
        return [];
    }

    const processedCards: LovelaceCardConfig[] = [];

    for (const card of cards) {
        if (card.type === "linus.embed_view") {
            const embedConfig = card as EmbedViewCardConfig;

            const result = await loadEmbeddedDashboard(
                hass,
                embedConfig.dashboard,
                embedConfig.view_index,
                embedConfig.view_path
            );

            if (result.error) {
                console.error("[Linus Dashboard] Embedding error:", result.error);
                processedCards.push(createErrorCard(result.error));
                Helper.logError(`Failed to embed dashboard "${embedConfig.dashboard}"`, new Error(result.error));
            } else {
                processedCards.push(...result.cards);
                // Embedded cards successfully
            }
        } else {
            processedCards.push(card);
        }
    }

    return processedCards;
}

/**
 * Check if a card configuration is an embed view card.
 * 
 * @param card - Card configuration to check
 * @returns True if the card is an embed view card
 */
export function isEmbedViewCard(card: LovelaceCardConfig): card is EmbedViewCardConfig {
    return card.type === "linus.embed_view";
}
