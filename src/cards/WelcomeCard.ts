import { Helper } from "../Helper";
import { cards } from "../types/strategy/cards";
import { TemplateCardConfig } from "../types/lovelace-mushroom/cards/template-card-config";
import { LovelaceChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { WeatherChip } from "../chips/WeatherChip";
import { AlarmChip } from "../chips/AlarmChip";

/**
 * Welcome Card Class.
 * 
 * Creates a comprehensive welcome card with clock, greeting, weather, alarms, and person chips.
 */
class WelcomeCard {

    constructor() {
        if (!Helper.isInitialized()) {
            throw new Error("The Helper module must be initialized before using this one.");
        }
    }

    /**
     * Get the main clock card
     */
    private getClockCard(): any {
        return {
            type: "clock",
            clock_size: "large",
            show_seconds: true,
            card_mod: {
                style: `
          ha-card {
            box-shadow: none !important;
            border: none;
            background: transparent;
          }
        `
            }
        };
    }

    /**
     * Create chips for alarms, weather, and persons
     */
    private async getChipsCard(): Promise<any> {
        const chips: LovelaceChipConfig[] = [];

        // Weather chip
        const weatherEntityId = Helper.linus_dashboard_config?.weather_entity_id;
        if (weatherEntityId) {
            try {
                const weatherChip = new WeatherChip(weatherEntityId);
                chips.push(weatherChip.getChip());
            } catch (e) {
                Helper.logError("An error occurred while creating the weather chip for WelcomeCard!", e);
            }
        }

        // Alarm chips
        const alarmEntityIds = Helper.linus_dashboard_config?.alarm_entity_ids || [];
        if (alarmEntityIds.length > 0) {
            try {
                for (const alarmEntityId of alarmEntityIds) {
                    if (alarmEntityId) {
                        const alarmChip = await new AlarmChip(alarmEntityId);
                        chips.push(alarmChip.getChip());
                    }
                }
            } catch (e) {
                Helper.logError("An error occurred while creating the alarm chips for WelcomeCard!", e);
            }
        }

        if (chips.length === 0) return null;

        return {
            type: "custom:mushroom-chips-card",
            alignment: "center",
            chips: chips,
            card_mod: {
                style: `
          ha-card {
            --chip-box-shadow: none;
            --chip-spacing: 8px;
            box-shadow: none !important;
            border: none;
            background: transparent;
            margin-top: -8px;
          }
        `
            }
        };
    }

    /**
     * Get the complete welcome card
     */
    async getCard(): Promise<cards.AbstractCardConfig> {
        const cards: any[] = [];

        // Add clock
        if (!Helper.linus_dashboard_config?.hide_greeting) {
            cards.push(this.getClockCard());
        }

        // Add chips
        const chipsCard = await this.getChipsCard();
        if (chipsCard) {
            cards.push(chipsCard);
        }

        return {
            type: "custom:stack-in-card",
            mode: "vertical",
            cards: cards,
            grid_options: {
                columns: 12,
            },
            card_mod: {
                style: `
          ha-card {
            background: #1f1f1f;
            border-radius: 12px;
            padding: 16px;
          }
        `
            }
        } as TemplateCardConfig;
    }
}

export { WelcomeCard };
