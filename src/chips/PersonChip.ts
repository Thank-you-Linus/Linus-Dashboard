import { ActionConfig } from "../types/homeassistant/data/lovelace";
import { LovelaceChipConfig, TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";
import { EntityRegistryEntry } from "../types/homeassistant/data/entity_registry";

/**
 * Person Chip Class
 *
 * Used to create a chip for a person entity.
 */
class PersonChip {
    /**
     * Person entity.
     */
    person: EntityRegistryEntry;

    /**
     * Default configuration of the chip.
     */
    defaultConfig = {
        icon: "mdi:account",
        icon_color: "grey",
        content_info: "name",
    };

    constructor(options: any = {}, person: EntityRegistryEntry) {
        this.person = person;
        this.defaultConfig = { ...this.defaultConfig, ...options };
    }

    /**
     * Get a chip.
     *
     * @return {LovelaceChipConfig} A chip object.
     */
    getChip(): LovelaceChipConfig {
        return {
            type: "template",
            entity: this.person.entity_id,
            icon: `{{ state_attr('${this.person.entity_id}', 'entity_picture') or '${this.defaultConfig.icon}' }}`,
            icon_type: "entity-picture",
            icon_color: `
                {% set state = states('${this.person.entity_id}') %}
                {% if state == 'home' %}
                green
                {% elif state == 'not_home' %}
                red
                {% else %}
                grey
                {% endif %}
            `,
            content: `{{ state_attr('${this.person.entity_id}', 'friendly_name') or '${this.person.name}' }}`,
            tap_action: {
                action: "more-info",
                entity: this.person.entity_id,
            } as ActionConfig,
        } as TemplateChipConfig;
    }
}

export { PersonChip };
