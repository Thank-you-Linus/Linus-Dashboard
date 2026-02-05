import { Helper } from "../Helper";
import { cards } from "../types/strategy/cards";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";

/**
 * Security Status Card Class.
 *
 * Creates a comprehensive security status card showing:
 * - Global security status (🟢🟡🔴)
 * - Alarm state
 * - Access control summary (doors, windows, locks)
 * - Detection status
 * - Last activity
 */
class SecurityStatusCard {

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
     * Determine security status based on hybrid criteria:
     * 🟢 Tout OK (alarme armée si présente + aucun capteur actif)
     * 🟡 Portes/fenêtres ouvertes OU alarme désarmée
     * 🔴 Alarme déclenchée OU capteur critique actif (smoke, gas, CO)
     */
    private getSecurityStatus(): { status: 'ok' | 'warning' | 'alert', color: string, icon: string, label: string } {
        // Check critical sensors (smoke, gas, carbon monoxide)
        const criticalSensors = [
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "smoke" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "gas" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "carbon_monoxide" })
        ];

        const criticalActive = criticalSensors.some(id => {
            const state = Helper.getEntityState(id);
            return state && state.state === "on";
        });

        // Check alarm status
        const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
        let alarmTriggered = false;
        let alarmDisarmed = false;

        if (alarmEntityIds.length > 0) {
            alarmTriggered = alarmEntityIds.some(id => {
                const state = Helper.getEntityState(id);
                return state && state.state === "triggered";
            });

            alarmDisarmed = alarmEntityIds.every(id => {
                const state = Helper.getEntityState(id);
                return state && state.state === "disarmed";
            });
        }

        // 🔴 ALERT: Alarm triggered OR critical sensor active
        if (alarmTriggered || criticalActive) {
            return {
                status: 'alert',
                color: 'red',
                icon: 'mdi:shield-alert',
                label: this.t("status_alert")
            };
        }

        // Check access sensors (doors, windows, garage doors)
        const accessSensors = [
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "door" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "window" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "garage_door" })
        ];

        const accessOpen = accessSensors.some(id => {
            const state = Helper.getEntityState(id);
            return state && (state.state === "on" || state.state === "open");
        });

        // 🟡 WARNING: Access open OR alarm disarmed
        if (accessOpen || alarmDisarmed) {
            return {
                status: 'warning',
                color: 'orange',
                icon: 'mdi:shield-half-full',
                label: this.t("status_warning")
            };
        }

        // 🟢 OK: Everything fine
        return {
            status: 'ok',
            color: 'green',
            icon: 'mdi:shield-check',
            label: this.t("status_ok")
        };
    }

    /**
     * Get alarm status summary
     */
    private getAlarmSummary(): string {
        const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
        if (alarmEntityIds.length === 0) return this.t("no_alarm_configured");

        const states = alarmEntityIds.map(id => Helper.getEntityState(id)).filter(s => s);
        if (states.length === 0) return this.t("alarm_unavailable");

        const firstState = states[0];
        const stateLabels: Record<string, string> = {
            'disarmed': this.t("alarm_disarmed"),
            'armed_home': this.t("alarm_armed_home"),
            'armed_away': this.t("alarm_armed_away"),
            'armed_night': this.t("alarm_armed_night"),
            'armed_vacation': this.t("alarm_armed_vacation"),
            'armed_custom_bypass': this.t("alarm_armed_custom"),
            'triggered': this.t("alarm_triggered"),
            'arming': this.t("alarm_arming"),
            'pending': this.t("alarm_pending")
        };

        return `${this.t("alarm_label")}: ${stateLabels[firstState.state] || firstState.state}`;
    }

    /**
     * Get access control summary
     */
    private getAccessSummary(): string {
        const doors = Helper.getEntityIds({ domain: "binary_sensor", device_class: "door" });
        const windows = Helper.getEntityIds({ domain: "binary_sensor", device_class: "window" });
        const locks = Helper.getEntityIds({ domain: "lock" });

        const doorsOpen = doors.filter(id => {
            const state = Helper.getEntityState(id);
            return state && (state.state === "on" || state.state === "open");
        }).length;

        const windowsOpen = windows.filter(id => {
            const state = Helper.getEntityState(id);
            return state && (state.state === "on" || state.state === "open");
        }).length;

        const locksLocked = locks.filter(id => {
            const state = Helper.getEntityState(id);
            return state && state.state === "locked";
        }).length;

        const parts: string[] = [];
        if (doors.length > 0) {
            parts.push(`${doors.length - doorsOpen}/${doors.length} ${this.t("doors_closed")}`);
        }
        if (windows.length > 0) {
            parts.push(`${windows.length - windowsOpen}/${windows.length} ${this.t("windows_closed")}`);
        }
        if (locks.length > 0) {
            parts.push(`${locksLocked}/${locks.length} ${this.t("locks_locked")}`);
        }

        return parts.length > 0 ? `${this.t("access_label")}: ${parts.join(', ')}` : this.t("no_access_sensor");
    }

    /**
     * Get detection status
     */
    private getDetectionSummary(): string {
        const motionSensors = Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion" });
        const occupancySensors = Helper.getEntityIds({ domain: "binary_sensor", device_class: "occupancy" });

        const activeDetection = [...motionSensors, ...occupancySensors].filter(id => {
            const state = Helper.getEntityState(id);
            return state && state.state === "on";
        }).length;

        if (activeDetection > 0) {
            return `${this.t("detection_label")}: ${activeDetection} ${this.t("sensors_active")}`;
        }

        return `${this.t("detection_label")}: ${this.t("no_activity")}`;
    }

    /**
     * Get camera status
     */
    private getCameraSummary(): string {
        const cameras = Helper.domains.camera || [];
        const activeCameras = cameras.filter(camera => {
            const state = Helper.getEntityState(camera.entity_id);
            return state && state.state !== "unavailable" && state.state !== "unknown";
        }).length;

        return cameras.length > 0 ? `${this.t("cameras_label")}: ${activeCameras}/${cameras.length} ${this.t("cameras_active")}` : "";
    }

    /**
     * Get last security event
     */
    private getLastActivity(): string {
        // Get all security-related entities
        const securityEntities = [
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "door" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "window" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion" }),
            ...Helper.getEntityIds({ domain: "lock" }),
            ...Helper.linus_dashboard_config?.alarm_entity_ids || []
        ];

        // Find most recent state change
        let lastChanged: Date | null = null;
        const lastEntity: string | null = null;

        for (const entityId of securityEntities) {
            const state = Helper.getEntityState(entityId);
            if (state && state.last_changed) {
                const changed = new Date(state.last_changed);
                if (!lastChanged || changed > lastChanged) {
                    lastChanged = changed;
                    // lastEntity = state.attributes?.friendly_name || entityId;
                }
            }
        }

        if (!lastChanged) return this.t("no_recent_activity");

        return `{{ relative_time(states['${securityEntities[0]}'].last_changed) }}`;
    }

    /**
     * Get the complete security status card
     */
    async getCard(): Promise<cards.AbstractCardConfig> {
        const status = this.getSecurityStatus();
        const alarmSummary = this.getAlarmSummary();
        const accessSummary = this.getAccessSummary();
        const detectionSummary = this.getDetectionSummary();
        const cameraSummary = this.getCameraSummary();

        // Build secondary info
        const secondaryLines = [
            alarmSummary,
            accessSummary,
            detectionSummary,
            cameraSummary
        ].filter(line => line !== "");

        return {
            type: "custom:mushroom-template-card",
            primary: status.label,
            secondary: secondaryLines.join('\n'),
            icon: status.icon,
            icon_color: status.color,
            multiline_secondary: true,
            fill_container: false,
            grid_options: {
                columns: 12,
            },
            tap_action: {
                action: "none" // TODO: Could open a detailed security popup
            },
            card_mod: {
                style: `
                    ha-card {
                        border-left: 4px solid var(--${status.color}-color, ${status.color}) !important;
                    }
                `
            }
        } as TemplateCardConfig;
    }
}

export { SecurityStatusCard };
