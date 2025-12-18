/**
 * Activity Badge Templates Utility
 * 
 * Provides shared Jinja2 templates for activity detection badges and chips.
 * This ensures perfect synchronization between HomeAreaCard badge, ActivityDetectionChip,
 * and ActivityDetectionPopup chips.
 * 
 * IMPORTANT: This is the single source of truth for activity icons and colors.
 * Any changes to the activity detection logic should be made here.
 */

/**
 * Get the Jinja2 template for activity icon
 * 
 * Priority order (distinctive icons to avoid confusion with sensors):
 * 1. occupied -> mdi:account-check (green) - Person present AND active
 * 2. movement -> mdi:walk (orange) - Movement detected (distinct from motion-sensor)
 * 3. inactive -> mdi:sleep (grey/blue) - Present but inactive
 * 4. media_active -> mdi:television-play (red) - Media playing (distinct from cast/media_player)
 * 5. empty -> mdi:home-outline (grey) - Room empty
 * 
 * @param areaStateEntity - Entity ID of the area state sensor (e.g., 'sensor.linus_brain_activity_salon')
 * @param mediaEntitiesStr - Comma-separated string of media player entity IDs (e.g., "'media_player.tv', 'media_player.speakers'")
 * @returns Jinja2 template string for the icon
 */
export function getActivityIconTemplate(areaStateEntity: string, mediaEntitiesStr: string): string {
  return `
    {% set state = states('${areaStateEntity}') %}
    {% set media_active = [${mediaEntitiesStr}] | select('is_state', 'playing') | list | count > 0 %}
    {% if state == 'occupied' %}
      mdi:account-check
    {% elif state == 'movement' %}
      mdi:walk
    {% elif state == 'inactive' %}
      mdi:sleep
    {% elif media_active %}
      mdi:television-play
    {% else %}
      
    {% endif %}
  `;
}

/**
 * Get the Jinja2 template for activity color
 * 
 * Color mapping:
 * - occupied: green (someone is present and active)
 * - movement: orange (motion detected but no sustained occupancy)
 * - inactive: grey (occupied but no recent activity)
 * - media_active: red (media player is playing)
 * - empty: grey (no activity)
 * 
 * @param areaStateEntity - Entity ID of the area state sensor (e.g., 'sensor.linus_brain_activity_salon')
 * @param mediaEntitiesStr - Comma-separated string of media player entity IDs (e.g., "'media_player.tv', 'media_player.speakers'")
 * @returns Jinja2 template string for the color
 */
export function getActivityColorTemplate(areaStateEntity: string, mediaEntitiesStr: string): string {
  return `
    {% set state = states('${areaStateEntity}') %}
    {% set media_active = [${mediaEntitiesStr}] | select('is_state', 'playing') | list | count > 0 %}
    {% if state == 'occupied' %}
      green
    {% elif state == 'movement' %}
      orange
    {% elif state == 'inactive' %}
      grey
    {% elif media_active %}
      red
    {% else %}
      grey
    {% endif %}
  `;
}

/**
 * Get the Jinja2 template for activity color (popup variant)
 * 
 * This variant uses 'blue' for inactive state instead of 'grey' for better visual distinction in popups.
 * 
 * Color mapping:
 * - occupied: green
 * - movement: orange
 * - inactive: blue (different from badge to stand out in popup)
 * - media_active: red
 * - empty: grey
 * 
 * @param areaStateEntity - Entity ID of the area state sensor
 * @param mediaEntitiesStr - Comma-separated string of media player entity IDs
 * @returns Jinja2 template string for the color (popup variant)
 */
export function getActivityColorTemplateForPopup(areaStateEntity: string, mediaEntitiesStr: string): string {
  return `
    {% set state = states('${areaStateEntity}') %}
    {% set media_active = [${mediaEntitiesStr}] | select('is_state', 'playing') | list | count > 0 %}
    {% if state == 'occupied' %}
      green
    {% elif state == 'movement' %}
      orange
    {% elif state == 'inactive' %}
      blue
    {% elif media_active %}
      red
    {% else %}
      grey
    {% endif %}
  `;
}

/**
 * Get media entities string for Jinja2 templates
 * 
 * Helper function to format media player entity IDs for use in Jinja2 templates.
 * 
 * @param mediaEntities - Array of media player entity IDs
 * @returns Comma-separated string of quoted entity IDs (e.g., "'entity1', 'entity2'")
 */
export function formatMediaEntitiesForTemplate(mediaEntities: string[]): string {
  return mediaEntities.map(e => `'${e}'`).join(', ');
}
