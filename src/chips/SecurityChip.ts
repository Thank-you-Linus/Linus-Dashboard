import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { navigateTo } from "../utils";

import { AbstractChip } from "./AbstractChip";

/**
 * Security Chip class.
 *
 * Used to create a chip showing the overall security status:
 * - 🟢 Green: All secure (alarm armed if present + no active sensors)
 * - 🟡 Orange: Attention (doors/windows open OR alarm disarmed)
 * - 🔴 Red: Alert (alarm triggered OR critical sensor active)
 *
 * All values are Jinja2 templates for real-time updates.
 * Tapping navigates to the security view.
 */
class SecurityChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @private
   * @readonly
   */
  readonly #defaultConfig: TemplateChipConfig;

  /**
   * Build Jinja2 variable declarations for security status checks (boolean version).
   * Generates: critical_active, alarm_triggered, alarm_disarmed, alarm_armed, access_open, detection_active
   */
  private static buildSecurityVariables(
    criticalSensorIds: string[],
    alarmEntityIds: string[],
    accessIds: string[],
    detectionIds: string[]
  ): string {
    const parts: string[] = [];

    // critical_active
    parts.push(criticalSensorIds.length > 0
      ? `{% set critical_active = ${criticalSensorIds.map(id => `is_state('${id}', 'on')`).join(' or ')} %}`
      : `{% set critical_active = false %}`);

    // alarm_triggered, alarm_disarmed, alarm_armed
    if (alarmEntityIds.length > 0) {
      parts.push(`{% set alarm_triggered = ${alarmEntityIds.map(id => `is_state('${id}', 'triggered')`).join(' or ')} %}`);
      parts.push(`{% set alarm_disarmed = ${alarmEntityIds.map(id => `is_state('${id}', 'disarmed')`).join(' and ')} %}`);
      parts.push(`{% set alarm_armed = ${alarmEntityIds.map(id =>
        `(is_state('${id}', 'armed_home') or is_state('${id}', 'armed_away') or is_state('${id}', 'armed_night') or is_state('${id}', 'armed_vacation'))`
      ).join(' or ')} %}`);
    } else {
      parts.push(`{% set alarm_triggered = false %}{% set alarm_disarmed = false %}{% set alarm_armed = false %}`);
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
   * Build Jinja2 variable declarations for counts (for content template).
   * Generates: critical_count, alarm_triggered, access_open_count, detection_count
   */
  private static buildCountVariables(
    criticalSensorIds: string[],
    alarmEntityIds: string[],
    accessIds: string[],
    detectionIds: string[]
  ): string {
    const parts: string[] = [];

    // critical_count
    parts.push(criticalSensorIds.length > 0
      ? `{% set critical_count = [${criticalSensorIds.map(id => `states('${id}')`).join(', ')}] | select('eq', 'on') | list | count %}`
      : `{% set critical_count = 0 %}`);

    // alarm_triggered
    parts.push(alarmEntityIds.length > 0
      ? `{% set alarm_triggered = ${alarmEntityIds.map(id => `is_state('${id}', 'triggered')`).join(' or ')} %}`
      : `{% set alarm_triggered = false %}`);

    // access_open_count
    parts.push(accessIds.length > 0
      ? `{% set access_open_count = [${accessIds.map(id => `states('${id}')`).join(', ')}] | select('eq', 'on') | list | count %}`
      : `{% set access_open_count = 0 %}`);

    // detection_count
    parts.push(detectionIds.length > 0
      ? `{% set detection_count = [${detectionIds.map(id => `states('${id}')`).join(', ')}] | select('eq', 'on') | list | count %}`
      : `{% set detection_count = 0 %}`);

    return parts.join('');
  }

  /**
   * Build Jinja2 template for security status icon
   */
  private static getIconTemplate(
    criticalSensorIds: string[],
    alarmEntityIds: string[],
    accessIds: string[],
    detectionIds: string[]
  ): string {
    return SecurityChip.buildSecurityVariables(criticalSensorIds, alarmEntityIds, accessIds, detectionIds) +
      `{% if alarm_triggered or critical_active %}mdi:shield-alert` +
      `{% elif access_open or alarm_disarmed or detection_active %}mdi:shield-half-full` +
      `{% elif alarm_armed %}mdi:shield-check` +
      `{% else %}mdi:shield-home{% endif %}`;
  }

  /**
   * Build Jinja2 template for security status color
   */
  private static getColorTemplate(
    criticalSensorIds: string[],
    alarmEntityIds: string[],
    accessIds: string[],
    detectionIds: string[]
  ): string {
    return SecurityChip.buildSecurityVariables(criticalSensorIds, alarmEntityIds, accessIds, detectionIds) +
      `{% if alarm_triggered or critical_active %}red` +
      `{% elif access_open or alarm_disarmed or detection_active %}orange` +
      `{% elif alarm_armed %}green` +
      `{% else %}teal{% endif %}`;
  }

  /**
   * Build Jinja2 template for content (warning count)
   */
  private static getContentTemplate(
    criticalSensorIds: string[],
    alarmEntityIds: string[],
    accessIds: string[],
    detectionIds: string[]
  ): string {
    return SecurityChip.buildCountVariables(criticalSensorIds, alarmEntityIds, accessIds, detectionIds) +
      `{% set alert_count = (1 if alarm_triggered else 0) + critical_count %}` +
      `{% set warning_count = access_open_count + detection_count %}` +
      `{% if alert_count > 0 %}{{ alert_count }}` +
      `{% elif warning_count > 0 %}{{ warning_count }}` +
      `{% endif %}`;
  }

  /**
   * Class Constructor.
   */
  constructor() {
    super();

    // Get entity IDs (these don't change during runtime)
    const criticalSensorIds = [
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "smoke" }),
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "gas" }),
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "carbon_monoxide" })
    ];

    const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];

    const accessIds = [
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "door" }),
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "window" }),
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "garage_door" })
    ];

    const detectionIds = [
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion" }),
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "occupancy" })
    ];

    // All entities for reactivity
    const allEntityIds = [
      ...criticalSensorIds,
      ...alarmEntityIds,
      ...accessIds,
      ...detectionIds
    ];

    this.#defaultConfig = {
      type: "template",
      entity: allEntityIds[0] || undefined,
      entity_id: allEntityIds.length > 0 ? allEntityIds : undefined,
      icon: SecurityChip.getIconTemplate(criticalSensorIds, alarmEntityIds, accessIds, detectionIds),
      icon_color: SecurityChip.getColorTemplate(criticalSensorIds, alarmEntityIds, accessIds, detectionIds),
      content: SecurityChip.getContentTemplate(criticalSensorIds, alarmEntityIds, accessIds, detectionIds),
      tap_action: navigateTo('security')
    };

    this.config = Object.assign(this.config, this.#defaultConfig);
  }
}

export { SecurityChip };
