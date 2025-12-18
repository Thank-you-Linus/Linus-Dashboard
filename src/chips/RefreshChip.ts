import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Refresh Chip class.
 * 
 * Used to create a chip that allows manual refresh of Home Assistant registries
 * (entities, devices, areas, floors) without requiring a full browser cache reload.
 * 
 * @class RefreshChip
 * @extends AbstractChip
 */
class RefreshChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   * 
   * @type {TemplateChipConfig}
   * @readonly
   * @private
   */
  readonly #defaultConfig: TemplateChipConfig = {
    type: "template",
    icon: "mdi:refresh",
    icon_color: "blue",
    content: "",
    tap_action: {
      action: "fire-dom-event",
      browser_mod: {
        service: "javascript",
        data: {
          code: `
            (async () => {
              const lang = hass.language || 'en';
              const messages = {
                en: {
                  success: 'Dashboard refreshed',
                  error: 'Refresh failed',
                  notAvailable: 'Refresh function not available'
                },
                fr: {
                  success: 'Tableau de bord rafraîchi',
                  error: 'Échec du rafraîchissement',
                  notAvailable: 'Fonction de rafraîchissement non disponible'
                }
              };
              const t = messages[lang] || messages.en;
              
              try {
                if (window.refreshLinusDashboard) {
                  await window.refreshLinusDashboard();
                  service('notification', {
                    message: t.success,
                    duration: 2000
                  });
                } else {
                  console.error('[Linus Dashboard] Refresh function not available');
                  service('notification', {
                    message: t.notAvailable,
                    duration: 3000
                  });
                }
              } catch (error) {
                console.error('[Linus Dashboard] Refresh error:', error);
                service('notification', {
                  message: t.error,
                  duration: 3000
                });
              }
            })();
          `
        }
      }
    },
  };

  /**
   * Class Constructor.
   */
  constructor() {
    super();
    
    this.config = Object.assign(this.config, this.#defaultConfig);
  }
}

export { RefreshChip };
