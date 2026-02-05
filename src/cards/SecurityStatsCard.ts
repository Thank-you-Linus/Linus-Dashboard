import { Helper } from "../Helper";
import { cards } from "../types/strategy/cards";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";

/**
 * Security Stats Card Class.
 *
 * Creates a statistics card showing security device counts:
 * - Access sensors (doors/windows) - total and closed
 * - Locks - total and locked
 * - Cameras - total and active
 * - Sensors with low battery
 */
class SecurityStatsCard {

    constructor() {
        if (!Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
    }

    /**
     * Helper to get localized security view text
     */
    private t(key: string): string {
        return Helper.localize(`component.linus_dashboard.entity.text.security_view.state.${key}`);
    }

    /**
     * Get access sensors statistics
     */
    private getAccessStats(): { total: number, closed: number } {
        const doors = Helper.getEntityIds({ domain: "binary_sensor", device_class: "door" });
        const windows = Helper.getEntityIds({ domain: "binary_sensor", device_class: "window" });
        const garageDoors = Helper.getEntityIds({ domain: "binary_sensor", device_class: "garage_door" });

        const allAccess = [...doors, ...windows, ...garageDoors];
        const closed = allAccess.filter(id => {
            const state = Helper.getEntityState(id);
            return state && (state.state === "off" || state.state === "closed");
        }).length;

        return { total: allAccess.length, closed };
    }

    /**
     * Get locks statistics
     */
    private getLockStats(): { total: number, locked: number } {
        const locks = Helper.getEntityIds({ domain: "lock" });
        const locked = locks.filter(id => {
            const state = Helper.getEntityState(id);
            return state && state.state === "locked";
        }).length;

        return { total: locks.length, locked };
    }

    /**
     * Get camera statistics
     */
    private getCameraStats(): { total: number, active: number } {
        const cameras = Helper.domains.camera || [];
        const active = cameras.filter(camera => {
            const state = Helper.getEntityState(camera.entity_id);
            return state && state.state !== "unavailable" && state.state !== "unknown";
        }).length;

        return { total: cameras.length, active };
    }

    /**
     * Get low battery sensor count
     */
    private getLowBatteryCount(): number {
        let lowBatteryCount = 0;

        // Check all binary_sensors for battery level
        const securitySensors = [
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "door" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "window" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "smoke" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "gas" }),
            ...Helper.getEntityIds({ domain: "lock" })
        ];

        for (const entityId of securitySensors) {
            const state = Helper.getEntityState(entityId);
            if (state && state.attributes) {
                const batteryLevel = state.attributes.battery_level ?? state.attributes.battery;
                if (typeof batteryLevel === 'number' && batteryLevel < 20) {
                    lowBatteryCount++;
                }
            }
        }

        return lowBatteryCount;
    }

    /**
     * Get motion sensors statistics
     */
    private getMotionStats(): { total: number, active: number } {
        const motion = Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion" });
        const occupancy = Helper.getEntityIds({ domain: "binary_sensor", device_class: "occupancy" });

        const allMotion = [...motion, ...occupancy];
        const active = allMotion.filter(id => {
            const state = Helper.getEntityState(id);
            return state && state.state === "on";
        }).length;

        return { total: allMotion.length, active };
    }

    /**
     * Get the complete stats card
     */
    async getCard(): Promise<cards.AbstractCardConfig> {
        const accessStats = this.getAccessStats();
        const lockStats = this.getLockStats();
        const cameraStats = this.getCameraStats();
        const motionStats = this.getMotionStats();
        const lowBatteryCount = this.getLowBatteryCount();

        // Build secondary info with stats
        const lines: string[] = [];

        if (accessStats.total > 0) {
            const statusIcon = accessStats.closed === accessStats.total ? '✅' : '⚠️';
            lines.push(`🚪 ${accessStats.total} ${this.t("access_sensors")} ${statusIcon} ${accessStats.closed} ${this.t("closed")}`);
        }

        if (lockStats.total > 0) {
            const statusIcon = lockStats.locked === lockStats.total ? '✅' : '🔓';
            lines.push(`🔒 ${lockStats.total} ${this.t("locks")} ${statusIcon} ${lockStats.locked} ${this.t("locked")}`);
        }

        if (cameraStats.total > 0) {
            const statusIcon = cameraStats.active === cameraStats.total ? '✅' : '⚠️';
            lines.push(`📹 ${cameraStats.total} ${this.t("cameras")} ${statusIcon} ${cameraStats.active} ${this.t("cameras_active")}`);
        }

        if (motionStats.total > 0) {
            const statusIcon = motionStats.active > 0 ? '👁️' : '✅';
            lines.push(`🏃 ${motionStats.total} ${this.t("detectors")} ${statusIcon} ${motionStats.active} ${this.t("active")}`);
        }

        if (lowBatteryCount > 0) {
            lines.push(`🔋 ⚠️ ${lowBatteryCount} ${this.t("low_battery")}`);
        }

        const secondary = lines.length > 0 ? lines.join('\n') : this.t("no_stats_available");

        return {
            type: "custom:mushroom-template-card",
            primary: this.t("statistics"),
            secondary,
            icon: "mdi:chart-box",
            icon_color: "teal",
            multiline_secondary: true,
            fill_container: false,
            grid_options: {
                columns: 12,
            },
            tap_action: {
                action: "none"
            },
            card_mod: {
                style: `
                    ha-card {
                        --card-secondary-font-size: 12px;
                    }
                `
            }
        } as TemplateCardConfig;
    }
}

export { SecurityStatsCard };
