/**
 * Version Check Module for Linus Dashboard
 * 
 * Automatically checks if the frontend JS version matches the backend version
 * and triggers a reload if there's a mismatch (after an update).
 * 
 * Based on Browser Mod's version checking mechanism.
 * https://github.com/thomasloven/hass-browser_mod/blob/master/js/plugin/version.ts
 */

import { version } from "./linus-strategy";
import { Helper } from "./Helper";

// Flag to prevent multiple notification attempts
let versionNotificationPending = false;

/**
 * Show a persistent notification with reload action
 */
async function showVersionMismatchNotification(serverVersion: string, clientVersion: string, hass: any): Promise<void> {

    const title = Helper.localize("component.linus_dashboard.entity.text.version_check.name");
    const mismatchText = Helper.localize("component.linus_dashboard.entity.text.version_check.state.mismatch");
    const browserText = Helper.localize("component.linus_dashboard.entity.text.version_check.state.browser");
    const backendText = Helper.localize("component.linus_dashboard.entity.text.version_check.state.backend");
    const instructions = Helper.localize("component.linus_dashboard.entity.text.version_check.state.instructions");

    // Build message with translations
    const message = `${mismatchText}\n${browserText}: ${clientVersion}\n${backendText}: ${serverVersion}`;

    console.warn(`[Linus Dashboard] Version mismatch! Browser: ${clientVersion}, Home Assistant: ${serverVersion}`);

    // Use Home Assistant's persistent notification system
    // No dependency on browser_mod integration required
    if (hass?.callService) {
        try {
            await hass.callService("persistent_notification", "create", {
                title: title,
                message: `${message}\n\n${instructions}`,
                notification_id: "linus_dashboard_version_mismatch",
            });
        } catch (error) {
            console.warn("[Linus Dashboard] Failed to create persistent notification:", error);
        }
    }
}

/**
 * Check if versions match and show notification if needed
 */
async function checkVersion(backendVersion: string, hass: any): Promise<void> {
    if (backendVersion && backendVersion !== version) {
        if (!versionNotificationPending) {
            versionNotificationPending = true;
            await showVersionMismatchNotification(backendVersion, version, hass);
        }
    }
}

/**
 * Initialize version checking
 * Called when Linus Dashboard strategy loads
 */
export async function initVersionCheck(hass: any): Promise<void> {
    try {
        // Fetch backend version from WebSocket
        const config = await hass.callWS({
            type: "linus_dashboard/get_config",
        });

        const backendVersion = config?.version;

        if (!backendVersion) {
            console.warn("[Linus Dashboard] Backend version not available in config");
            return;
        }

        // Check version and show notification if mismatch
        await checkVersion(backendVersion, hass);

        // Version check completed
    } catch (error) {
        console.error("[Linus Dashboard] Version check failed:", error);
    }
}

/**
 * Reset version notification flag (useful after disconnection)
 */
export function resetVersionNotification(): void {
    versionNotificationPending = false;
    // Version notification flag reset
}

// Expose to window for debugging
if (typeof window !== "undefined") {
    // @ts-ignore - Attach to window for debugging
    (window as any).linusDashboard = {
        ...((window as any).linusDashboard || {}),
        version: version,
        checkVersion: (hass: any) => checkVersion("0.0.1", hass),
        resetVersionNotification,
        help: () => {
            const helpText = `
🔧 Linus Dashboard Version Check - Debug Commands

Current version: ${version}

Commands:
- window.linusDashboard.version                  // Show current version
- window.linusDashboard.checkVersion(hass)       // Force version check with old version
- window.linusDashboard.resetVersionNotification() // Reset notification flag

Version checking happens automatically when the dashboard loads.
If versions don't match, you'll see a persistent notification with a Reload button.
            `;
            console.warn(helpText);
        },
    };
}
