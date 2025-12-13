import { Helper } from "../Helper";
import { TemplateChipConfig } from "../types/lovelace-mushroom/utils/lovelace/chip/types";

import { AbstractChip } from "./AbstractChip";

// noinspection JSUnusedGlobalSymbols Class is dynamically imported.
/**
 * Spotify Chip class.
 *
 * Used to create a chip to indicate climate level.
 */
class SpotifyChip extends AbstractChip {
  /**
   * Default configuration of the chip.
   *
   * @type {ConditionalChipConfig}
   *
   */
  getDefaultConfig(entityId: string): TemplateChipConfig {

    return {
      type: "template",
      entity: entityId,
      icon_color: `{{ 'green' if is_state('${entityId}', 'playing') else 'grey' }}`,
      content: '{{ states(entity) }}',
      icon: "mdi:spotify",
      // content: show_content ? `{{ states('${entityId}') if not states('${entityId}') == 'on' else '' }}` : "",
      tap_action: {
        action: "fire-dom-event",
        browser_mod: {
          service: "browser_mod.popup",
          data: {
            title: "Spotify",
            "content":
            {
              type: "vertical-stack",
              cards: [
                ...([entityId].map(x => {

                  const entity = Helper.getEntityState(x)
                  const source_list = entity.attributes.source_list
                  const chunkSize = 3;
                  const source_cards_chunk = []

                  for (let i = 0; i < source_list.length; i += chunkSize) {
                    const chunk = source_list.slice(i, i + chunkSize);
                    source_cards_chunk.push(chunk)
                  }

                  return {
                    type: "custom:stack-in-card",
                    cards: [
                      {
                        type: "custom:mushroom-media-player-card",
                        entity: "media_player.spotify_juicy",
                        icon: "mdi:spotify",
                        icon_color: "green",
                        use_media_info: true,
                        use_media_artwork: false,
                        show_volume_level: false,
                        media_controls: [
                          "play_pause_stop",
                          "previous",
                          "next"
                        ],
                        volume_controls: [
                          "volume_buttons",
                          "volume_set"
                        ],
                        fill_container: false,
                        card_mod: {
                          style: "ha-card {\n  --rgb-state-media-player: var(--rgb-green);\n}\n"
                        }
                      },
                      {
                        type: "custom:swipe-card",
                        parameters: null,
                        spaceBetween: 8,
                        scrollbar: null,
                        start_card: 1,
                        hide: false,
                        draggable: true,
                        snapOnRelease: true,
                        slidesPerView: 2.2,
                        cards: [
                          ...(source_cards_chunk.map(source_cards => (
                            {
                              type: "horizontal-stack",
                              cards: [
                                ...(source_cards.map((source: string) => (
                                  {
                                    type: "custom:mushroom-template-card",
                                    icon: "mdi:speaker-play",
                                    icon_color: `{% if states[entity].attributes.source == '${source}' %}\namber\n{% else %}\ngrey\n{% endif %}`,
                                    primary: null,
                                    secondary: source,
                                    entity: entity.entity_id,
                                    multiline_secondary: false,
                                    tap_action: {
                                      action: "call-service",
                                      service: "spotcast.start",
                                      data: {
                                        device_name: source,
                                        force_playback: true
                                      }
                                    },
                                    layout: "vertical",
                                    style: "mushroom-card \n  background-size: 42px 32px;\nmushroom-shape-icon {\n  --shape-color: none !important;\n}  \n  ha-card { \n  background: rgba(#1a1a2a;, 1.25);\n  {% if is_state('media_player.cuisine_media_players', 'playing') %}\n  {% else %}\n    background: rgba(var(--rgb-primary-background-color), 0.8);\n  {% endif %}    \n    width: 115px;\n    border-radius: 30px;\n    margin-top: 10px;\n    margin-left: auto;\n    margin-right: auto;\n    margin-bottom: 20px;\n  }\n",
                                    card_mode: {
                                      style: ":host {\n  background: rgba(var(--rgb-primary-background-color), 0.8);\n  border-radius: 50px;!important\n} \n"
                                    },
                                    line_width: 8,
                                    line_color: "#FF6384",
                                    card_mod: {
                                      style: `
                                      :host {
                                        --mush-icon-symbol-size: 0.75em;
                                      }
                                      `
                                    }

                                  }))
                                ).filter(Boolean),
                              ]
                            }))
                          ).filter(Boolean),
                        ]
                      },
                      {
                        type: "custom:spotify-card",
                        always_play_random_song: true,
                        hide_currently_playing: true,
                        hide_playback_controls: true,
                        hide_top_header: true,
                        hide_warning: true,
                        hide_chromecast_devices: true,
                        display_style: "Grid",
                        grid_covers_per_row: 5,
                        limit: 20
                      }
                    ],
                    card_mod: {
                      style: "ha-card {\n  {% if not is_state('media_player.spotify_juicy', 'off') and not is_state('media_player.spotify_juicy', 'idle') %}\n    background: url( '{{ state_attr(\"media_player.spotify_juicy\", \"entity_picture\") }}' ), linear-gradient(to left, transparent, rgb(var(--rgb-card-background-color)) 100%);\n\n    {% if state_attr('media_player.spotify_juicy', 'media_content_type') == 'tvshow' %}\n      background-size: auto 100%, cover;\n    {% else %}\n      background-size: 130% auto, cover;\n    {% endif %}\n\n    background-position: top right;\n    background-repeat: no-repeat;\n    background-blend-mode: saturation;\n  {% endif %}\n}\n"
                    }
                  }
                })
                ).filter(Boolean),
              ],
              card_mod: {
                style: "ha-card {\n  background:#4a1a1a;\n}\n"
              }
            }
          }
        }
      }
    }
  }

  /**
   * Class Constructor.
   *
   * @param {chips.TemplateChipOptions} options The chip options.
   */
  constructor(entityId: string) {
    super();

    const defaultConfig = this.getDefaultConfig(entityId)

    this.config = Object.assign(this.config, defaultConfig);

  }
}

export { SpotifyChip };
