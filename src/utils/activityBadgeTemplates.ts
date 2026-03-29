/**
 * Activity Badge Templates Utility
 *
 * Provides shared Jinja2 templates for activity detection badges and chips.
 * This ensures perfect synchronization between HomeAreaCard badge, ActivityDetectionChip,
 * and ActivityDetectionPopup chips.
 *
 * IMPORTANT: This is the single source of truth for activity logic.
 * Any changes to activity detection should be made here.
 */

import { Helper } from '../Helper';
import { MEDIA_SCREEN_CLASSES, MEDIA_SCREEN_INACTIVE_STATES } from '../variables';

// ─── Public interface ────────────────────────────────────────────────────────

/**
 * Split media player entities by category for per-device-class activity logic.
 *
 * - screenEntities: tv, receiver, soundbar — active when NOT off/standby
 * - audioEntities:  speaker + no device_class — active only when playing
 */
export interface MediaActivityConfig {
  screenEntities: string[];
  audioEntities: string[];
}

// ─── Central helper ──────────────────────────────────────────────────────────

/**
 * Build per-device-class Jinja2 conditions for media player activity.
 *
 * Screen devices (tv, receiver, soundbar): active when state is NOT in MEDIA_SCREEN_INACTIVE_STATES.
 * Audio devices (speaker + no device_class): active only when state is "playing".
 *
 * @param areaSlugs - Area slug or array of area slugs to fetch entities for
 * @returns Jinja2 condition strings + MediaActivityConfig for template callers
 */
export function buildMediaActiveConditions(areaSlugs: string | string[]): {
  isScreenActive: string;
  isAudioPlaying: string;
  isMediaActive: string;
  config: MediaActivityConfig;
} {
  const screenEntities: string[] = [];
  for (const dc of MEDIA_SCREEN_CLASSES) {
    screenEntities.push(
      ...Helper.getEntityIds({ domain: 'media_player', device_class: dc, area_slug: areaSlugs }),
    );
  }

  const allMedia = Helper.getEntityIds({ domain: 'media_player', area_slug: areaSlugs });
  const audioEntities = allMedia.filter(e => !screenEntities.includes(e));

  const inactiveList = MEDIA_SCREEN_INACTIVE_STATES.map(s => `"${s}"`).join(', ');

  const isScreenActive =
    screenEntities.length > 0
      ? `[${screenEntities.map(e => `states['${e}']`).join(', ')}] | rejectattr("state", "in", [${inactiveList}]) | list | count > 0`
      : 'false';

  const isAudioPlaying =
    audioEntities.length > 0
      ? `[${audioEntities.map(e => `states['${e}']`).join(', ')}] | selectattr("state", "eq", "playing") | list | count > 0`
      : 'false';

  const hasEntities = screenEntities.length > 0 || audioEntities.length > 0;
  const isMediaActive = hasEntities ? `(${isScreenActive}) or (${isAudioPlaying})` : 'false';

  return { isScreenActive, isAudioPlaying, isMediaActive, config: { screenEntities, audioEntities } };
}

// ─── Jinja2 template builders ─────────────────────────────────────────────────

/**
 * Build the Jinja2 `{% set screen_active %}` and `{% set audio_active %}` lines
 * used inside the 3 template functions below.
 */
function buildJinjaMediaVars(media: MediaActivityConfig): string {
  const inactiveList = MEDIA_SCREEN_INACTIVE_STATES.map(s => `"${s}"`).join(', ');

  const screenStr = media.screenEntities.map(e => `states['${e}']`).join(', ');
  const audioStr = media.audioEntities.map(e => `'${e}'`).join(', ');

  const screenCheck =
    media.screenEntities.length > 0
      ? `[${screenStr}] | rejectattr("state", "in", [${inactiveList}]) | list | count > 0`
      : 'false';

  const audioCheck =
    media.audioEntities.length > 0
      ? `[${audioStr}] | select('is_state', 'playing') | list | count > 0`
      : 'false';

  return [
    `    {% set screen_active = ${screenCheck} %}`,
    `    {% set audio_active = ${audioCheck} %}`,
    `    {% set media_active = screen_active or audio_active %}`,
  ].join('\n');
}

// ─── Exported template functions ─────────────────────────────────────────────

/**
 * Get the Jinja2 template for activity icon.
 *
 * Priority order:
 * 1. occupied  → mdi:account-check  (green)  — person present AND active
 * 2. movement  → mdi:walk           (orange) — movement detected
 * 3. inactive  → mdi:sleep          (grey)   — present but inactive
 * 4. media_active → mdi:television-play (red) — media device active
 * 5. empty     → (none)             (grey)   — room empty
 *
 * @param areaStateEntity - Entity ID of the area state sensor
 * @param media - Split media player entities by category
 * @returns Jinja2 template string for the icon
 */
export function getActivityIconTemplate(areaStateEntity: string, media: MediaActivityConfig): string {
  return `
    {% set state = states('${areaStateEntity}') %}
${buildJinjaMediaVars(media)}
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
 * Get the Jinja2 template for activity color.
 *
 * Color mapping:
 * - occupied:    green  (someone present and active)
 * - movement:    orange (motion detected, no sustained occupancy)
 * - inactive:    grey   (occupied but no recent activity)
 * - media_active: red   (media device active)
 * - empty:       grey   (no activity)
 *
 * @param areaStateEntity - Entity ID of the area state sensor
 * @param media - Split media player entities by category
 * @returns Jinja2 template string for the color
 */
export function getActivityColorTemplate(areaStateEntity: string, media: MediaActivityConfig): string {
  return `
    {% set state = states('${areaStateEntity}') %}
${buildJinjaMediaVars(media)}
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
 * Get the Jinja2 template for activity color (popup variant).
 *
 * Identical to getActivityColorTemplate except "inactive" maps to "blue"
 * for better visual distinction inside the activity popup.
 *
 * @param areaStateEntity - Entity ID of the area state sensor
 * @param media - Split media player entities by category
 * @returns Jinja2 template string for the color (popup variant)
 */
export function getActivityColorTemplateForPopup(
  areaStateEntity: string,
  media: MediaActivityConfig,
): string {
  return `
    {% set state = states('${areaStateEntity}') %}
${buildJinjaMediaVars(media)}
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

// ─── Formatting helpers ───────────────────────────────────────────────────────

/**
 * Format audio entity IDs for Jinja2 `select('is_state', ...)` templates.
 * Returns quoted entity ID strings: "'entity1', 'entity2'"
 *
 * @param entities - Array of media player entity IDs
 * @returns Comma-separated quoted entity ID string
 */
export function formatMediaEntitiesForTemplate(entities: string[]): string {
  return entities.map(e => `'${e}'`).join(', ');
}

/**
 * Format screen entity IDs as HA state object references for Jinja2 `rejectattr` templates.
 * Returns state object references: "states['entity1'], states['entity2']"
 *
 * @param entities - Array of media player entity IDs
 * @returns Comma-separated state object reference string
 */
export function formatScreenEntitiesForTemplate(entities: string[]): string {
  return entities.map(e => `states['${e}']`).join(', ');
}
