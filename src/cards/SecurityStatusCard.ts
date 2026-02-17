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
 *
 * All values are Jinja2 templates for real-time updates.
 */
class SecurityStatusCard {
    // Entity IDs cached at construction
    private readonly criticalSensorIds: string[];
    private readonly alarmEntityIds: string[];
    private readonly doorIds: string[];
    private readonly windowIds: string[];
    private readonly lockIds: string[];
    private readonly motionIds: string[];
    private readonly occupancyIds: string[];
    private readonly cameraIds: string[];

    constructor() {
        if (!Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }

        // Cache entity IDs (these don't change during runtime)
        this.criticalSensorIds = [
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "smoke" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "gas" }),
            ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "carbon_monoxide" })
        ];
        this.alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
        this.doorIds = Helper.getEntityIds({ domain: "binary_sensor", device_class: "door" });
        this.windowIds = Helper.getEntityIds({ domain: "binary_sensor", device_class: "window" });
        this.lockIds = Helper.getEntityIds({ domain: "lock" });
        this.motionIds = Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion" });
        this.occupancyIds = Helper.getEntityIds({ domain: "binary_sensor", device_class: "occupancy" });
        this.cameraIds = (Helper.domains.camera || []).map(c => c.entity_id);
    }

    /**
     * Helper to get localized security view text
     */
    private t(key: string): string {
        return Helper.localize(`component.linus_dashboard.entity.text.security_view.state.${key}`);
    }

    /**
     * Build Jinja2 variable declarations for security status checks.
     * Generates: critical_active, alarm_triggered, alarm_disarmed, alarm_armed, access_open, detection_active
     * @param includeArmed - Whether to include alarm_armed variable (not needed for primary label)
     */
    private getSecurityVariablesTemplate(includeArmed = true): string {
        const parts: string[] = [];
        const accessIds = [...this.doorIds, ...this.windowIds];
        const detectionIds = [...this.motionIds, ...this.occupancyIds];

        // critical_active
        parts.push(this.criticalSensorIds.length > 0
            ? `{% set critical_active = ${this.criticalSensorIds.map(id => `is_state('${id}', 'on')`).join(' or ')} %}`
            : `{% set critical_active = false %}`);

        // alarm_triggered, alarm_disarmed, alarm_armed
        if (this.alarmEntityIds.length > 0) {
            parts.push(`{% set alarm_triggered = ${this.alarmEntityIds.map(id => `is_state('${id}', 'triggered')`).join(' or ')} %}`);
            parts.push(`{% set alarm_disarmed = ${this.alarmEntityIds.map(id => `is_state('${id}', 'disarmed')`).join(' and ')} %}`);
            if (includeArmed) {
                parts.push(`{% set alarm_armed = ${this.alarmEntityIds.map(id =>
                    `(is_state('${id}', 'armed_home') or is_state('${id}', 'armed_away') or is_state('${id}', 'armed_night') or is_state('${id}', 'armed_vacation'))`
                ).join(' or ')} %}`);
            }
        } else {
            parts.push(`{% set alarm_triggered = false %}{% set alarm_disarmed = false %}`);
            if (includeArmed) parts.push(`{% set alarm_armed = false %}`);
        }

        // access_open
        parts.push(accessIds.length > 0
            ? `{% set access_open = ${accessIds.map(id => `is_state('${id}', 'on')`).join(' or ')} %}`
            : `{% set access_open = false %}`);

        // detection_active
        parts.push(detectionIds.length > 0
            ? `{% set detection_active = ${detectionIds.map(id => `is_state('${id}', 'on')`).join(' or ')} %}`
            : `{% set detection_active = false %}`);

        return parts.join('');
    }

    /**
     * Build Jinja2 template for security status icon
     */
    private getIconTemplate(): string {
        return this.getSecurityVariablesTemplate() +
            `{% if alarm_triggered or critical_active %}mdi:shield-alert` +
            `{% elif access_open or alarm_disarmed or detection_active %}mdi:shield-half-full` +
            `{% elif alarm_armed %}mdi:shield-check` +
            `{% else %}mdi:shield-home{% endif %}`;
    }

    /**
     * Build Jinja2 template for security status color
     */
    private getIconColorTemplate(): string {
        return this.getSecurityVariablesTemplate() +
            `{% if alarm_triggered or critical_active %}red` +
            `{% elif access_open or alarm_disarmed or detection_active %}orange` +
            `{% elif alarm_armed %}green` +
            `{% else %}teal{% endif %}`;
    }

    /**
     * Build Jinja2 template for primary label
     */
    private getPrimaryTemplate(): string {
        return this.getSecurityVariablesTemplate(false) +
            `{% if alarm_triggered or critical_active %}${this.t("status_alert")}` +
            `{% elif access_open or alarm_disarmed or detection_active %}${this.t("status_warning")}` +
            `{% else %}${this.t("status_ok")}{% endif %}`;
    }

    /**
     * Build Jinja2 template for alarm summary line
     */
    private getAlarmSummaryTemplate(): string {
        if (this.alarmEntityIds.length === 0) {
            return this.t("no_alarm_configured");
        }

        const firstAlarmId = this.alarmEntityIds[0];
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

        let template = `{% set alarm_state = states('${firstAlarmId}') %}`;
        template += `{% if alarm_state == 'unavailable' or alarm_state == 'unknown' %}${this.t("alarm_unavailable")}`;

        for (const [state, label] of Object.entries(stateLabels)) {
            template += `{% elif alarm_state == '${state}' %}${this.t("alarm_label")}: ${label}`;
        }

        template += `{% else %}${this.t("alarm_label")}: {{ alarm_state }}{% endif %}`;

        return template;
    }

    /**
     * Build Jinja2 template for access control summary line
     */
    private getAccessSummaryTemplate(): string {
        const parts: string[] = [];
        const summaryParts: string[] = [];

        // Doors
        if (this.doorIds.length > 0) {
            const doorStates = this.doorIds.map(id => `states('${id}')`);
            parts.push(`{% set doors_open = [${doorStates.join(', ')}] | select('eq', 'on') | list | count %}`);
            summaryParts.push(`{{ ${this.doorIds.length} - doors_open }}/${this.doorIds.length} ${this.t("doors_closed")}`);
        }

        // Windows
        if (this.windowIds.length > 0) {
            const windowStates = this.windowIds.map(id => `states('${id}')`);
            parts.push(`{% set windows_open = [${windowStates.join(', ')}] | select('eq', 'on') | list | count %}`);
            summaryParts.push(`{{ ${this.windowIds.length} - windows_open }}/${this.windowIds.length} ${this.t("windows_closed")}`);
        }

        // Locks
        if (this.lockIds.length > 0) {
            const lockStates = this.lockIds.map(id => `states('${id}')`);
            parts.push(`{% set locks_locked = [${lockStates.join(', ')}] | select('eq', 'locked') | list | count %}`);
            summaryParts.push(`{{ locks_locked }}/${this.lockIds.length} ${this.t("locks_locked")}`);
        }

        if (summaryParts.length === 0) {
            return this.t("no_access_sensor");
        }

        return parts.join('') + `${this.t("access_label")}: ${summaryParts.join(', ')}`;
    }

    /**
     * Build Jinja2 template for detection summary line
     */
    private getDetectionSummaryTemplate(): string {
        const allDetectionIds = [...this.motionIds, ...this.occupancyIds];

        if (allDetectionIds.length === 0) {
            return `${this.t("detection_label")}: ${this.t("no_activity")}`;
        }

        const detectionStates = allDetectionIds.map(id => `states('${id}')`);
        let template = `{% set active_detection = [${detectionStates.join(', ')}] | select('eq', 'on') | list | count %}`;
        template += `${this.t("detection_label")}: {% if active_detection > 0 %}{{ active_detection }} ${this.t("sensors_active")}{% else %}${this.t("no_activity")}{% endif %}`;

        return template;
    }

    /**
     * Build Jinja2 template for camera summary line
     */
    private getCameraSummaryTemplate(): string {
        if (this.cameraIds.length === 0) {
            return "";
        }

        const cameraStates = this.cameraIds.map(id => `states('${id}')`);
        let template = `{% set active_cameras = [${cameraStates.join(', ')}] | reject('in', ['unavailable', 'unknown']) | list | count %}`;
        template += `${this.t("cameras_label")}: {{ active_cameras }}/${this.cameraIds.length} ${this.t("cameras_active")}`;

        return template;
    }

    /**
     * Get the complete security status card with Jinja2 templates
     */
    async getCard(): Promise<cards.AbstractCardConfig> {
        // Build secondary template by combining all summary lines
        const secondaryLines: string[] = [];

        const alarmSummary = this.getAlarmSummaryTemplate();
        if (alarmSummary) secondaryLines.push(alarmSummary);

        const accessSummary = this.getAccessSummaryTemplate();
        if (accessSummary) secondaryLines.push(accessSummary);

        const detectionSummary = this.getDetectionSummaryTemplate();
        if (detectionSummary) secondaryLines.push(detectionSummary);

        const cameraSummary = this.getCameraSummaryTemplate();
        if (cameraSummary) secondaryLines.push(cameraSummary);

        // Get color for card_mod (needs to be a template too for dynamic border)
        const iconColorTemplate = this.getIconColorTemplate();

        // All entities that this card depends on for reactivity
        const allEntityIds = [
            ...this.criticalSensorIds,
            ...this.alarmEntityIds,
            ...this.doorIds,
            ...this.windowIds,
            ...this.lockIds,
            ...this.motionIds,
            ...this.occupancyIds,
            ...this.cameraIds
        ];

        return {
            type: "custom:mushroom-template-card",
            entity: allEntityIds[0] || undefined, // Primary entity for reactivity
            entity_id: allEntityIds, // All entities for state tracking
            primary: this.getPrimaryTemplate(),
            secondary: secondaryLines.join('\n'),
            icon: this.getIconTemplate(),
            icon_color: iconColorTemplate,
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
                        border-left: 4px solid {% if ${this.criticalSensorIds.map(id => `is_state('${id}', 'on')`).join(' or ') || 'false'} or ${this.alarmEntityIds.map(id => `is_state('${id}', 'triggered')`).join(' or ') || 'false'} %}var(--red-color, red){% elif ${[...this.doorIds, ...this.windowIds].map(id => `is_state('${id}', 'on')`).join(' or ') || 'false'} or ${this.alarmEntityIds.length > 0 ? this.alarmEntityIds.map(id => `is_state('${id}', 'disarmed')`).join(' and ') : 'false'} %}var(--orange-color, orange){% else %}var(--green-color, green){% endif %} !important;
                    }
                `
            }
        } as TemplateCardConfig;
    }
}

export { SecurityStatusCard };
