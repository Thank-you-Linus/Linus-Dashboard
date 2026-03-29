# 🎉 Release Notes

---

## 🇬🇧 English

### ✨ New Features

- **Media player activity detection by device class** — Activity detection for media players now differentiates based on the device class (e.g., `tv`, `speaker`, `receiver`). Each device class uses appropriate state thresholds to determine whether the device is considered "active", resulting in more accurate presence and activity chips in your dashboard.

### 🐛 Bug Fixes

- **Aggregate chip icon corrected for multi-entity domains** — For domains where both active and inactive entities can coexist (light, fan, switch, cover, media_player), the aggregate chip icon now correctly shows the "on" icon as soon as any entity in the group is active. Previously, the presence of even one inactive entity could override the icon and show the "off" state. Also adds `paused` as an active state for media players, and uses `mdi:cast-connected` / `mdi:cast-off` for clearer visual feedback.

- **Activity sensor icons now resolve correctly in popups** — The activity detection popup now uses a native tile card instead of a mushroom template card, so entity icons are automatically resolved from their domain and device class without requiring explicit icon templates.

- **Reactive state in popups and chips** — Icon color, icon, and dynamic content in popups (ActivityDetectionPopup, LinusBrainPopup) and chips (AreaScenesChips) now use Jinja2 templates and update reactively when entity states change, instead of being computed once at creation time.

- **SpotifyChip now works for any Spotify entity** — The Spotify chip previously had a hardcoded entity ID (`media_player.spotify_juicy`). It now correctly uses the entity ID passed as a parameter, making SpotifyChip functional for all users regardless of their entity naming.

### ⚡ Improvements

- **Removal of Magic Areas integration support** — The Magic Areas integration dependency has been removed from Linus Dashboard. The dashboard now relies solely on Home Assistant's native areas and floors, simplifying setup and removing a third-party dependency. Users who were relying on Magic Areas entities for area state should migrate to native HA area sensors.

### 🧪 For Beta Testers

**What to test:**
- [ ] Aggregate chips for lights, fans, switches, and covers show the "on" icon when at least one entity is active
- [ ] Media player aggregate chips show `mdi:cast-connected` when any player is playing or paused
- [ ] Activity sensor icons display correctly in the activity detection popup
- [ ] Popup content (icon colors, counters, labels) updates reactively without needing to reopen the popup
- [ ] SpotifyChip works correctly with your own Spotify entity (not just `media_player.spotify_juicy`)
- [ ] Media player chips correctly reflect active/inactive state for `tv`, `speaker`, and `receiver` device classes
- [ ] Areas display correctly without Magic Areas integration installed
- [ ] No errors in Home Assistant logs related to missing Magic Areas entities after update

**Known Issues:**
- None currently

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **Détection d'activité des lecteurs multimédia par classe d'appareil** — La détection d'activité des lecteurs multimédia différencie désormais selon la classe d'appareil (par ex. `tv`, `speaker`, `receiver`). Chaque classe utilise des seuils d'état adaptés pour déterminer si l'appareil est considéré comme "actif", ce qui se traduit par des chips de présence et d'activité plus précises dans votre tableau de bord.

### 🐛 Corrections de bugs

- **Icône des chips agrégées corrigée pour les domaines multi-entités** — Pour les domaines où des entités actives et inactives peuvent coexister (lumière, ventilateur, interrupteur, volet, lecteur multimédia), l'icône de la chip agrégée affiche désormais correctement l'icône "allumé" dès qu'au moins une entité du groupe est active. Auparavant, la présence d'une seule entité inactive pouvait écraser l'icône et afficher l'état "éteint". L'état `paused` est également ajouté comme état actif pour les lecteurs multimédia, avec `mdi:cast-connected` / `mdi:cast-off` pour un retour visuel plus clair.

- **Icônes des capteurs d'activité résolues correctement dans les popups** — La popup de détection d'activité utilise désormais une carte native tile au lieu d'une carte mushroom template, de sorte que les icônes des entités sont automatiquement résolues depuis leur domaine et classe d'appareil, sans nécessiter de templates d'icônes explicites.

- **État réactif dans les popups et les chips** — La couleur de l'icône, l'icône elle-même et le contenu dynamique des popups (ActivityDetectionPopup, LinusBrainPopup) et des chips (AreaScenesChips) utilisent désormais des templates Jinja2 et se mettent à jour de façon réactive lors des changements d'état des entités, au lieu d'être calculés une seule fois à la création.

- **SpotifyChip fonctionne maintenant pour toute entité Spotify** — La chip Spotify avait précédemment un identifiant d'entité codé en dur (`media_player.spotify_juicy`). Elle utilise désormais correctement l'identifiant d'entité passé en paramètre, rendant SpotifyChip fonctionnelle pour tous les utilisateurs quelle que soit leur nomenclature d'entités.

### ⚡ Améliorations

- **Suppression du support de l'intégration Magic Areas** — La dépendance à l'intégration Magic Areas a été retirée de Linus Dashboard. Le tableau de bord repose désormais uniquement sur les zones et étages natifs de Home Assistant, simplifiant l'installation et supprimant une dépendance tierce. Les utilisateurs qui s'appuyaient sur des entités Magic Areas pour l'état des zones doivent migrer vers les capteurs de zones natifs de HA.

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] Les chips agrégées pour les lumières, ventilateurs, interrupteurs et volets affichent l'icône "allumé" dès qu'au moins une entité est active
- [ ] Les chips agrégées des lecteurs multimédia affichent `mdi:cast-connected` quand au moins un lecteur est en lecture ou en pause
- [ ] Les icônes des capteurs d'activité s'affichent correctement dans la popup de détection d'activité
- [ ] Le contenu des popups (couleurs d'icônes, compteurs, libellés) se met à jour de façon réactive sans avoir à rouvrir la popup
- [ ] La SpotifyChip fonctionne correctement avec votre propre entité Spotify (pas seulement `media_player.spotify_juicy`)
- [ ] Les chips des lecteurs multimédia reflètent correctement l'état actif/inactif pour les classes `tv`, `speaker` et `receiver`
- [ ] Les zones s'affichent correctement sans l'intégration Magic Areas installée
- [ ] Aucune erreur dans les logs Home Assistant liée à des entités Magic Areas manquantes après la mise à jour

**Problèmes connus :**
- Aucun actuellement

---

## 📊 Technical Details

### All Commits

- refactor: remove Magic Areas integration support (#126) (42ff05e)
  - fix(icons): correct aggregate chip icon for multi-entity domains (85b1cd2)
  - fix(spotify): replace hardcoded entity ID with dynamic entityId (51cbad9)
  - fix(icons): correct aggregate chip icon for multi-entity domains (85b1cd2)
- feat(media-player): differentiate activity detection by device class (5d8007e)
- fix: use tile card for activity sensors to get real entity icons (916d124)
- fix: use reactive Jinja2 templates instead of static state values in popups and chips (0a4aea8)

### Contributors

- @Juicy
