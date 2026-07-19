# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

- **Dedicated group entities for every domain, at area/floor/whole-house scope** — Light, switch, fan, cover, siren, binary_sensor (presence + every device_class), climate and media_player each now get their own real Home Assistant group entities, nested area → floor → whole house, built on Home Assistant core's own `group.<domain>` classes instead of hand-rolled logic so they stay correct as Home Assistant evolves. Opening "more info" on a floor or whole-house group now shows its rooms/floors as members, not a flat list of raw entities.
- **Aggregate sensor for every device_class, automatically discovered** — Previously limited to a fixed short list (temperature, humidity, illuminance, battery). Now covers any numeric `sensor` or `binary_sensor` device_class actually present in your home (motion, CO2, pressure, ...), with the correct sum/average/minimum aggregation per sensor based on its own `state_class` — battery always takes the minimum member rather than an average that would hide a depleted device.
- **Group control tiles and "Turn All On/Off" now target the right group** — Buttons and tiles at every scope (area/floor/whole house) act on the dedicated group entity for that scope when one exists, instead of a generic "call service on every matching entity" fallback.
- **Magic Areas media_player fallback restored** — Matches the climate group's existing behavior: entity resolution priority is Linus Brain > Magic Areas > native, so media_player group control keeps working for Magic Areas users too.
- **Activity Detection: one popup, not two** — Consolidated the separate "Linus Brain area" popup into the Activity Detection popup, augmented with a Controls section when Linus Brain is present, instead of two overlapping popups covering mostly the same ground. The chip now falls back to a native presence entity instead of a static icon when no richer source is available.

<details>
<summary>📖 <b>View detailed descriptions / Voir les descriptions détaillées</b></summary>

### 🇬🇧 English


- **Dedicated group entities for every domain, at area/floor/whole-house scope** — Light, switch, fan, cover, siren, binary_sensor (presence + every device_class), climate and media_player each now get their own real Home Assistant group entities, nested area → floor → whole house, built on Home Assistant core's own `group.<domain>` classes instead of hand-rolled logic so they stay correct as Home Assistant evolves. Opening "more info" on a floor or whole-house group now shows its rooms/floors as members, not a flat list of raw entities.
- **Aggregate sensor for every device_class, automatically discovered** — Previously limited to a fixed short list (temperature, humidity, illuminance, battery). Now covers any numeric `sensor` or `binary_sensor` device_class actually present in your home (motion, CO2, pressure, ...), with the correct sum/average/minimum aggregation per sensor based on its own `state_class` — battery always takes the minimum member rather than an average that would hide a depleted device.
- **Group control tiles and "Turn All On/Off" now target the right group** — Buttons and tiles at every scope (area/floor/whole house) act on the dedicated group entity for that scope when one exists, instead of a generic "call service on every matching entity" fallback.
- **Magic Areas media_player fallback restored** — Matches the climate group's existing behavior: entity resolution priority is Linus Brain > Magic Areas > native, so media_player group control keeps working for Magic Areas users too.
- **Activity Detection: one popup, not two** — Consolidated the separate "Linus Brain area" popup into the Activity Detection popup, augmented with a Controls section when Linus Brain is present, instead of two overlapping popups covering mostly the same ground. The chip now falls back to a native presence entity instead of a static icon when no richer source is available.


### 🇫🇷 Français


- **Entités groupe dédiées pour chaque domaine, à l'échelle zone/étage/maison** — Light, switch, fan, cover, siren, binary_sensor (présence + chaque device_class), climate et media_player ont maintenant chacun leurs propres entités groupe Home Assistant, imbriquées zone → étage → maison entière, construites sur les classes `group.<domain>` du cœur de Home Assistant plutôt que sur une logique maison, pour rester correctes au fil des évolutions de Home Assistant. Ouvrir "plus d'infos" d'un groupe étage ou maison affiche désormais ses pièces/étages comme membres, plus une liste plate d'entités brutes.
- **Capteur agrégé pour chaque device_class, détecté automatiquement** — Auparavant limité à une liste fixe (température, humidité, luminosité, batterie). Couvre maintenant n'importe quel device_class numérique de `sensor` ou `binary_sensor` réellement présent chez vous (mouvement, CO2, pression...), avec le bon mode d'agrégation (somme/moyenne/minimum) par capteur selon son propre `state_class` — la batterie prend toujours le minimum des membres plutôt qu'une moyenne qui masquerait un appareil déchargé.
- **Les tuiles de contrôle groupé et les boutons "Tout allumer/éteindre" visent le bon groupe** — Les boutons et tuiles à chaque échelle (zone/étage/maison) agissent sur l'entité groupe dédiée de cette échelle quand elle existe, plutôt que sur un appel de service générique à chaque entité correspondante.
- **Retour du fallback Magic Areas pour media_player** — Aligné sur le comportement déjà existant du groupe climate : la résolution d'entité suit la priorité Linus Brain > Magic Areas > natif, le contrôle groupé media_player refonctionne donc aussi pour les utilisateurs de Magic Areas.
- **Détection d'activité : une seule popup, plus deux** — La popup séparée "zone Linus Brain" est fusionnée dans la popup de détection d'activité, augmentée d'une section Contrôles quand Linus Brain est présent, plutôt que deux popups qui se recoupaient largement. La chip utilise maintenant une entité de présence native en repli plutôt qu'une icône statique quand aucune source plus riche n'est disponible.


</details>

## 🐛 Bug Fixes

- **"Unavailable entities" sensor now updates live** — It used to compute its count once at Home Assistant startup and never again, so it could permanently list entities that had long since come back online (or miss ones that later went down). It now recomputes whenever a tracked entity's state changes.
- **The Unavailable view no longer goes blank when everything is fine** — Shows a confirmation card instead of an empty page.
- **Numeric aggregates for energy/water/gas/monetary sensors were silently averaged instead of summed** — Found and fixed while adding this release's test suite; every other device_class (temperature, humidity, battery, ...) was unaffected.

<details>
<summary>📖 <b>View details / Voir les détails</b></summary>

### 🇬🇧 English


- **"Unavailable entities" sensor now updates live** — It used to compute its count once at Home Assistant startup and never again, so it could permanently list entities that had long since come back online (or miss ones that later went down). It now recomputes whenever a tracked entity's state changes.
- **The Unavailable view no longer goes blank when everything is fine** — Shows a confirmation card instead of an empty page.
- **Numeric aggregates for energy/water/gas/monetary sensors were silently averaged instead of summed** — Found and fixed while adding this release's test suite; every other device_class (temperature, humidity, battery, ...) was unaffected.
- Light group tile no longer shows an empty brightness slider for non-dimmable groups — falls back to a plain on/off tile.
- Fixed several regressions around dedicated group entities: voice-assistant hiding (silently broken since it was first added), missing binary_sensor/siren icon fallbacks, `MediaPlayerPopup` never receiving its dedicated group entity, drill-down separators losing their group-entity targeting, and a stray comment that broke the production build.


### 🇫🇷 Français


- **Le capteur "entités indisponibles" se met maintenant à jour en direct** — Il calculait son décompte une seule fois au démarrage de Home Assistant et plus jamais ensuite, il pouvait donc afficher indéfiniment des entités redevenues disponibles depuis longtemps (ou manquer celles tombées en panne après coup). Il se recalcule maintenant à chaque changement d'état d'une entité suivie.
- **La vue "Indisponibles" n'affiche plus une page vide quand tout va bien** — Une carte de confirmation s'affiche à la place.
- **Les agrégats numériques pour les capteurs d'énergie/eau/gaz/monétaires étaient silencieusement moyennés au lieu d'être sommés** — Trouvé et corrigé en écrivant la suite de tests de cette version ; aucun autre device_class (température, humidité, batterie...) n'était affecté.
- La tuile de groupe lumière n'affiche plus un slider de luminosité vide pour les groupes non-dimmables — bascule sur une tuile simple on/off.
- Plusieurs régressions corrigées autour des entités groupe dédiées : masquage assistants vocaux (silencieusement cassé depuis son ajout), icônes de repli manquantes pour binary_sensor/siren, `MediaPlayerPopup` qui ne recevait jamais son entité groupe dédiée, séparateurs de navigation qui perdaient leur ciblage du groupe, et un commentaire erroné qui cassait le build de production.


</details>

## ⚡ Improvements

- Backend group-computation code now reuses Home Assistant core's own reduction helpers (`group.util`) instead of hand-rolled equivalents, reducing the custom logic that needs to track upstream changes.
- De-duplicated per-domain chip-building and aggregate-chip data sourcing.

<details>
<summary>🇫🇷 <b>Version française</b></summary>

- Le code de calcul des groupes côté backend réutilise maintenant les fonctions de réduction du cœur de Home Assistant (`group.util`) plutôt que des équivalents maison, réduisant la logique custom à maintenir face aux évolutions futures.
- Dé-duplication de la construction des chips par domaine et de la source de données des chips agrégés.

</details>

---

## 🧪 For Beta Testers

**What to test:**
- [ ] Group entities for light/switch/fan/cover/siren/binary_sensor/climate/media_player show up correctly per area, per floor, and for the whole house — and control the right members when toggled.
- [ ] "More info" on a floor or whole-house group entity shows its sub-groups (rooms/floors), not a flat list of raw entities.
- [ ] If you use Magic Areas: media_player group control works again.
- [ ] Numeric aggregate sensors (temperature, humidity, and any other device_class you have, e.g. CO2 or illuminance) show sensible per-area/floor/whole-house values.
- [ ] The "Unavailable entities" sensor and its dashboard view correctly reflect entities going unavailable and coming back, without needing a restart.

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] Les entités groupe pour light/switch/fan/cover/siren/binary_sensor/climate/media_player apparaissent correctement par zone, par étage et pour toute la maison — et contrôlent les bons membres une fois activées.
- [ ] "Plus d'infos" sur un groupe étage ou maison affiche ses sous-groupes (pièces/étages), pas une liste plate d'entités brutes.
- [ ] Si vous utilisez Magic Areas : le contrôle groupé media_player refonctionne.
- [ ] Les capteurs agrégés numériques (température, humidité, et tout autre device_class que vous avez, ex. CO2 ou luminosité) affichent des valeurs cohérentes par zone/étage/maison.
- [ ] Le capteur "entités indisponibles" et sa vue reflètent correctement les entités qui deviennent indisponibles puis redisponibles, sans besoin de redémarrer.

</details>

**Known Issues:**
- _None currently._

---

<details>
<summary>📊 <b>Technical Details</b></summary>

### Contributors
- @dependabot[bot]
- @flatline84
- @root
- @s4piens

</details>


---

## 📦 Installation

**Via HACS (Recommended):**
1. Open HACS → Integrations
2. Search for "Linus Dashboard"
3. Click Update (if already installed) or Install
4. Restart Home Assistant
5. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

**Manual Installation:**
1. Download the `linus_dashboard.zip` file from this release
2. Extract to `custom_components/linus_dashboard/`
3. Restart Home Assistant
4. Clear browser cache

---

## 🔗 Links

- 📖 [Documentation](https://github.com/Thank-you-Linus/Linus-Dashboard)
- 🐛 [Report Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)
- 💬 [Discord Community](https://discord.gg/your-discord-link)

