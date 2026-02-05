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
   * Determine security status based on hybrid criteria.
   */
  private getSecurityStatus(): { color: string, icon: string, content: string } {
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
    let alarmArmed = false;

    if (alarmEntityIds.length > 0) {
      alarmTriggered = alarmEntityIds.some((id: string) => {
        const state = Helper.getEntityState(id);
        return state && state.state === "triggered";
      });

      alarmDisarmed = alarmEntityIds.every((id: string) => {
        const state = Helper.getEntityState(id);
        return state && state.state === "disarmed";
      });

      alarmArmed = alarmEntityIds.some((id: string) => {
        const state = Helper.getEntityState(id);
        return state && (state.state === "armed_home" || state.state === "armed_away" ||
          state.state === "armed_night" || state.state === "armed_vacation");
      });
    }

    // 🔴 ALERT: Alarm triggered OR critical sensor active
    if (alarmTriggered || criticalActive) {
      const alertCount = (alarmTriggered ? 1 : 0) + criticalSensors.filter(id => {
        const state = Helper.getEntityState(id);
        return state && state.state === "on";
      }).length;

      return {
        color: 'red',
        icon: 'mdi:shield-alert',
        content: alertCount > 0 ? `${alertCount}` : ''
      };
    }

    // Check access sensors (doors, windows, garage doors)
    const accessSensors = [
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "door" }),
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "window" }),
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "garage_door" })
    ];

    const accessOpenCount = accessSensors.filter(id => {
      const state = Helper.getEntityState(id);
      return state && (state.state === "on" || state.state === "open");
    }).length;

    // Check motion/detection sensors
    const motionSensors = [
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "motion" }),
      ...Helper.getEntityIds({ domain: "binary_sensor", device_class: "occupancy" })
    ];

    const motionActiveCount = motionSensors.filter(id => {
      const state = Helper.getEntityState(id);
      return state && state.state === "on";
    }).length;

    // 🟡 WARNING: Access open OR alarm disarmed OR motion detected
    if (accessOpenCount > 0 || alarmDisarmed || motionActiveCount > 0) {
      const warningCount = accessOpenCount + motionActiveCount;
      return {
        color: 'orange',
        icon: 'mdi:shield-half-full',
        content: warningCount > 0 ? `${warningCount}` : ''
      };
    }

    // 🟢 OK: Everything fine (alarm armed if present, nothing active)
    return {
      color: alarmArmed ? 'green' : 'teal',
      icon: alarmArmed ? 'mdi:shield-check' : 'mdi:shield-home',
      content: ''
    };
  }

  /**
   * Class Constructor.
   */
  constructor() {
    super();

    const status = this.getSecurityStatus();

    this.#defaultConfig = {
      type: "template",
      icon: status.icon,
      icon_color: status.color,
      content: status.content || undefined,
      tap_action: navigateTo('security')
    };

    this.config = Object.assign(this.config, this.#defaultConfig);
  }
}

export { SecurityChip };
