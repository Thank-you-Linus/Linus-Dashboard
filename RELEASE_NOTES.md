# 🎉 Release Notes — 2.0.0-beta.1

_Covers every change since the last stable release, 1.5.1 (all of 1.6.0-beta.1's and this cycle's work — none of it has shipped as stable yet)._

---

## 🇬🇧 English

### ✨ New Features

- **Dedicated group entities for every domain, at area/floor/whole-house scope** — Light, switch, fan, cover, siren, binary_sensor (presence + every device_class), climate and media_player each now get their own real Home Assistant group entities, nested area → floor → whole house, built on Home Assistant core's own `group.<domain>` classes instead of hand-rolled logic so they stay correct as Home Assistant evolves. Opening "more info" on a floor or whole-house group now shows its rooms/floors as members, not a flat list of raw entities.
- **Aggregate sensor for every device_class, automatically discovered** — Previously limited to a fixed short list (temperature, humidity, illuminance, battery). Now covers any numeric `sensor` or `binary_sensor` device_class actually present in your home (motion, CO2, pressure, ...), with the correct sum/average/minimum aggregation per sensor based on its own `state_class` — battery always takes the minimum member rather than an average that would hide a depleted device.
- **Group control tiles and "Turn All On/Off" now target the right group** — Buttons and tiles at every scope (area/floor/whole house) act on the dedicated group entity for that scope when one exists, instead of a generic "call service on every matching entity" fallback.
- **Magic Areas support reintroduced** — Magic Areas integration was previously removed, which broke scene toggles, area-state detection, and light/climate/media_player group control for setups that relied on it. This release brings back full Magic Areas support (area state, light control, scene toggles, climate/media_player group control, settings UI) as a fallback tier, with entity resolution priority Linus Brain > Magic Areas > native. Installations using Linus Brain or neither integration are unaffected.
- **Activity Detection: one popup, not two** — Consolidated the separate "Linus Brain area" popup into the Activity Detection popup, augmented with a Controls section when Linus Brain is present, instead of two overlapping popups covering mostly the same ground. The chip now falls back to a native presence entity instead of a static icon when no richer source is available.

### 🐛 Bug Fixes

- **"Unavailable entities" sensor now updates live** — It used to compute its count once at Home Assistant startup and never again, so it could permanently list entities that had long since come back online (or miss ones that later went down). It now recomputes whenever a tracked entity's state changes.
- **The Unavailable view no longer goes blank when everything is fine** — Shows a confirmation card instead of an empty page.
- **Numeric aggregates for energy/water/gas/monetary sensors were silently averaged instead of summed** — Found and fixed while adding this release's test suite; every other device_class (temperature, humidity, battery, ...) was unaffected.
- Light group tile no longer shows an empty brightness slider for non-dimmable groups — falls back to a plain on/off tile.
- Fixed several regressions around dedicated group entities: voice-assistant hiding (silently broken since it was first added), missing binary_sensor/siren icon fallbacks, `MediaPlayerPopup` never receiving its dedicated group entity, drill-down separators losing their group-entity targeting, and a stray comment that broke the production build.

### ⚡ Improvements

- Backend group-computation code now reuses Home Assistant core's own reduction helpers (`group.util`) instead of hand-rolled equivalents, reducing the custom logic that needs to track upstream changes.
- Group control tiles, history graphs, and "Turn All On/Off" targeting rolled out consistently across switch/fan/cover/siren, matching light's existing behavior.
- De-duplicated per-domain chip-building and aggregate-chip data sourcing.

### 🧪 For Beta Testers

**What to test:**
- [ ] Group entities for light/switch/fan/cover/siren/binary_sensor/climate/media_player show up correctly per area, per floor, and for the whole house — and control the right members when toggled.
- [ ] "More info" on a floor or whole-house group entity shows its sub-groups (rooms/floors), not a flat list of raw entities.
- [ ] If you use Magic Areas: area state, light control, scene toggles, and climate/media_player group control all work again.
- [ ] Numeric aggregate sensors (temperature, humidity, and any other device_class you have, e.g. CO2 or illuminance) show sensible per-area/floor/whole-house values.
- [ ] The "Unavailable entities" sensor and its dashboard view correctly reflect entities going unavailable and coming back, without needing a restart.
- [ ] Activity Detection chip and popup behave correctly both with and without Linus Brain installed.
- [ ] Voice assistant exposure/hiding for the new group entities behaves as configured.

**Known Issues:**
- _None currently._

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **Entités groupe dédiées pour chaque domaine, à l'échelle zone/étage/maison** — Light, switch, fan, cover, siren, binary_sensor (présence + chaque device_class), climate et media_player ont maintenant chacun leurs propres entités groupe Home Assistant, imbriquées zone → étage → maison entière, construites sur les classes `group.<domain>` du cœur de Home Assistant plutôt que sur une logique maison, pour rester correctes au fil des évolutions de Home Assistant. Ouvrir "plus d'infos" d'un groupe étage ou maison affiche désormais ses pièces/étages comme membres, plus une liste plate d'entités brutes.
- **Capteur agrégé pour chaque device_class, détecté automatiquement** — Auparavant limité à une liste fixe (température, humidité, luminosité, batterie). Couvre maintenant n'importe quel device_class numérique de `sensor` ou `binary_sensor` réellement présent chez vous (mouvement, CO2, pression...), avec le bon mode d'agrégation (somme/moyenne/minimum) par capteur selon son propre `state_class` — la batterie prend toujours le minimum des membres plutôt qu'une moyenne qui masquerait un appareil déchargé.
- **Les tuiles de contrôle groupé et les boutons "Tout allumer/éteindre" visent le bon groupe** — Les boutons et tuiles à chaque échelle (zone/étage/maison) agissent sur l'entité groupe dédiée de cette échelle quand elle existe, plutôt que sur un appel de service générique à chaque entité correspondante.
- **Retour du support Magic Areas** — L'intégration Magic Areas avait été retirée, ce qui cassait les bascules de scènes, la détection d'état de zone, et le contrôle groupé lumière/climate/media_player pour les installations qui en dépendaient. Cette version restaure le support complet de Magic Areas (état de zone, contrôle lumière, bascules de scènes, contrôle groupé climate/media_player, UI de configuration) comme palier de repli, avec la priorité de résolution d'entité Linus Brain > Magic Areas > natif. Les installations utilisant Linus Brain ou aucune des deux intégrations ne sont pas affectées.
- **Détection d'activité : une seule popup, plus deux** — La popup séparée "zone Linus Brain" est fusionnée dans la popup de détection d'activité, augmentée d'une section Contrôles quand Linus Brain est présent, plutôt que deux popups qui se recoupaient largement. La chip utilise maintenant une entité de présence native en repli plutôt qu'une icône statique quand aucune source plus riche n'est disponible.

### 🐛 Corrections de bugs

- **Le capteur "entités indisponibles" se met maintenant à jour en direct** — Il calculait son décompte une seule fois au démarrage de Home Assistant et plus jamais ensuite, il pouvait donc afficher indéfiniment des entités redevenues disponibles depuis longtemps (ou manquer celles tombées en panne après coup). Il se recalcule maintenant à chaque changement d'état d'une entité suivie.
- **La vue "Indisponibles" n'affiche plus une page vide quand tout va bien** — Une carte de confirmation s'affiche à la place.
- **Les agrégats numériques pour les capteurs d'énergie/eau/gaz/monétaires étaient silencieusement moyennés au lieu d'être sommés** — Trouvé et corrigé en écrivant la suite de tests de cette version ; aucun autre device_class (température, humidité, batterie...) n'était affecté.
- La tuile de groupe lumière n'affiche plus un slider de luminosité vide pour les groupes non-dimmables — bascule sur une tuile simple on/off.
- Plusieurs régressions corrigées autour des entités groupe dédiées : masquage assistants vocaux (silencieusement cassé depuis son ajout), icônes de repli manquantes pour binary_sensor/siren, `MediaPlayerPopup` qui ne recevait jamais son entité groupe dédiée, séparateurs de navigation qui perdaient leur ciblage du groupe, et un commentaire erroné qui cassait le build de production.

### ⚡ Améliorations

- Le code de calcul des groupes côté backend réutilise maintenant les fonctions de réduction du cœur de Home Assistant (`group.util`) plutôt que des équivalents maison, réduisant la logique custom à maintenir face aux évolutions futures.
- Tuiles de contrôle groupé, graphiques d'historique et ciblage "Tout allumer/éteindre" déployés de façon cohérente sur switch/fan/cover/siren, alignés sur le comportement déjà existant de light.
- Dé-duplication de la construction des chips par domaine et de la source de données des chips agrégés.

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] Les entités groupe pour light/switch/fan/cover/siren/binary_sensor/climate/media_player apparaissent correctement par zone, par étage et pour toute la maison — et contrôlent les bons membres une fois activées.
- [ ] "Plus d'infos" sur un groupe étage ou maison affiche ses sous-groupes (pièces/étages), pas une liste plate d'entités brutes.
- [ ] Si vous utilisez Magic Areas : état de zone, contrôle lumière, bascules de scènes, et contrôle groupé climate/media_player fonctionnent tous à nouveau.
- [ ] Les capteurs agrégés numériques (température, humidité, et tout autre device_class que vous avez, ex. CO2 ou luminosité) affichent des valeurs cohérentes par zone/étage/maison.
- [ ] Le capteur "entités indisponibles" et sa vue reflètent correctement les entités qui deviennent indisponibles puis redisponibles, sans besoin de redémarrer.
- [ ] La chip et la popup de détection d'activité fonctionnent correctement avec et sans Linus Brain installé.
- [ ] Le masquage/exposition assistants vocaux pour les nouvelles entités groupe se comporte comme configuré.

**Problèmes connus :**
- _Aucun actuellement._

---

## 📊 Technical Details

### All Commits Since 1.5.1

- chore: correct version to 2.0.0-beta.1 (3194221)
- feat: area/floor/global group entities for presence, lights, and more (#161) (cde1c23)
- fix: sort imports in sensor.py (ruff I001) (fbe0fa7)
- ci: remove fake-house-smoke-test job, still failing after root-cause fix (90e521f)
- fix(ci): pre-install HA component requirements before starting hass (56cf4b9)
- fix(ci): poll entity states instead of checking once (startup race) (cd87dac)
- fix(ci): commit empty automations.yaml/scripts.yaml so fresh checkouts work (db8d52d)
- feat(dev-env): CI smoke test, persist admin credentials, fix README (2605d03)
- feat(dev-env): fully automated HA onboarding — zero manual steps to test (05e155a)
- fix: input_boolean entries need non-empty mapping to survive package merge (6f5cc8a)
- linting fixes, remove hardcoded s4piens path from devbox (f5be04a)
- fix(sensor): restore device_class-scoped aggregate sensors (957c683)
- fix(sensor): build aggregate membership from entity registry, not live state (13e18a6)
- fix: satisfy ruff lint (CI was failing on the new setup script) (494c0fe)
- feat: auto-provision the fake house on devcontainer start (4369472)
- feat: make fake house test env load automatically + easy to (re)provision (97c4cca)
- fix(AggregatePopup): show entities in global popups when no floor is configured (6724d66)
- feat: make fake house test env shareable (areas, floors, random sensors) (ffc048e)
- build(deps): update pip requirement from >=26.1.1 to >=26.1.2 (dcc59ce)
- build(deps): bump aiohasupervisor from 0.4.3 to 0.5.0 (#148) (72af532)
- build(deps): bump ruff from 0.15.12 to 0.15.20 (#157) (b41fb73)
- chore: Bump version to 1.6.0-beta.1 (ff9a39d)
- feat: reintroduce Magic Areas fallback support (#142) (705e56e)
- build(deps): bump actions/setup-python from 6.2.0 to 6.3.0 (9128ff6)
- build(deps): bump actions/checkout from 6 to 7 (d3d6843)
- fix light chip regression (883d69c)
- README and devcontainer changes (08a21d3)
- performance improvements (8a53c58)
- build(deps): bump actions/github-script from 7 to 9 (28c3496)
- build(deps): bump actions/upload-artifact from 4 to 7 (af0edcf)
- build(deps): update pip requirement from >=26.1 to >=26.1.1 (#141) (bcf8cbf)
- fix(ci): allow pip installs on GitHub runners (#92) (34ed5e6)
- fix: format config flow for ruff (#117) (5bbd5d3)
- build(deps): bump ruff from 0.15.9 to 0.15.12 (#140) (f15aa42)
- build(deps): bump softprops/action-gh-release from 2 to 3 (#133) (c6d5cf2)
- build(deps): bump actions/github-script from 8 to 9 (#134) (47c0187)
- build(deps): update pip requirement from >=21.3.1 to >=26.1 (#139) (82f2667)

### Contributors

- @dependabot[bot]
- @flatline84
- @root
- @s4piens
