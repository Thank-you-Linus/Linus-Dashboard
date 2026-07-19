# 🎉 Release Notes — 2.0.0-beta.2

_Covers every change since the last stable release, 1.5.1 (all of 1.6.0-beta.1's, 2.0.0-beta.1's, and this cycle's work — none of it has shipped as stable yet)._

---

## 🇬🇧 English

### ✨ New Features

- **Dedicated group entities for every domain, at area/floor/whole-house scope** — Light, switch, fan, cover, siren, binary_sensor (presence + every device_class), climate and media_player each now get their own real Home Assistant group entities, nested area → floor → whole house, built on Home Assistant core's own `group.<domain>` classes instead of hand-rolled logic so they stay correct as Home Assistant evolves. Opening "more info" on a floor or whole-house group now shows its rooms/floors as members, not a flat list of raw entities.
- **Cover and media player groups, by device type** — Covers (gate, garage door, shutter, ...) and media players (TV, speaker, receiver, ...) now get their own dedicated group per type, per room/floor/whole house — matching what binary sensors (motion, door, window, ...) already had. Each group shows its own name and icon instead of a generic one shared with every other cover/media player in the same room.
- **Aggregate sensor for every device_class, automatically discovered** — Previously limited to a fixed short list (temperature, humidity, illuminance, battery). Now covers any numeric `sensor` or `binary_sensor` device_class actually present in your home (motion, CO2, pressure, ...), with the correct sum/average/minimum aggregation per sensor based on its own `state_class` — battery always takes the minimum member rather than an average that would hide a depleted device.
- **Group control tiles and "Turn All On/Off" now target the right group** — Buttons and tiles at every scope (area/floor/whole house) act on the dedicated group entity for that scope when one exists, instead of a generic "call service on every matching entity" fallback.
- **Magic Areas support reintroduced** — Magic Areas integration was previously removed, which broke scene toggles, area-state detection, and light/climate/media_player group control for setups that relied on it. This release brings back full Magic Areas support (area state, light control, scene toggles, climate/media_player group control, settings UI) as a fallback tier, with entity resolution priority Linus Brain > Magic Areas > native. Installations using Linus Brain or neither integration are unaffected.
- **Activity Detection: one popup, not two** — Consolidated the separate "Linus Brain area" popup into the Activity Detection popup, augmented with a Controls section when Linus Brain is present, instead of two overlapping popups covering mostly the same ground. The chip now falls back to a native presence entity instead of a static icon when no richer source is available.
- **Camera chip on the Home view** — The Home view now shows a chip for all your cameras, the same aggregation already used on the Security view, just available one level up too.

### 🐛 Bug Fixes

- **Cover and media player labels/icons no longer show a generic fallback** — A gate or garage door now shows its own name and icon (e.g. "Portail", "Garage") instead of the generic "Opening"/window icon shared by every cover; same fix for media players (TV, speaker, receiver each get their own icon instead of a generic cast icon). This affects these entities everywhere they appear: Home, Area, Floor and Security views.
- **The light tile no longer leaves an empty gap above the brightness slider** — When a light group's name/icon row is hidden to show just the on/off + brightness control, the tile no longer reserves extra empty space where that row used to be.
- **Dynamic entity lists no longer crash when a referenced entity doesn't currently exist** — Badge colors/icons and aggregate popups across the app could fail outright if one of the entities they reference isn't currently known to Home Assistant; they now simply skip it instead.
- **The "unavailable entities" sensor no longer silently loses data on large homes** — On a home with many entities, a burst of entities going offline at once could produce a list too large for Home Assistant to store, silently dropping the whole thing. The count stays accurate either way; only the detailed list is capped.
- **"Unavailable entities" sensor now updates live** — It used to compute its count once at Home Assistant startup and never again, so it could permanently list entities that had long since come back online (or miss ones that later went down). It now recomputes whenever a tracked entity's state changes.
- **The Unavailable view no longer goes blank when everything is fine** — Shows a confirmation card instead of an empty page.
- **Numeric aggregates for energy/water/gas/monetary sensors were silently averaged instead of summed** — Found and fixed while adding this release's test suite; every other device_class (temperature, humidity, battery, ...) was unaffected.
- Light group tile no longer shows an empty brightness slider for non-dimmable groups — falls back to a plain on/off tile.
- Fixed several regressions around dedicated group entities: voice-assistant hiding (silently broken since it was first added), missing binary_sensor/siren icon fallbacks, `MediaPlayerPopup` never receiving its dedicated group entity, drill-down separators losing their group-entity targeting, and a stray comment that broke the production build.
- A handful of leftover diagnostic sensors from the cover/media player grouping work above could get stuck showing "unavailable" forever; they're now cleaned up automatically on update.

### ⚡ Improvements

- **Cleaner device names for room/floor/whole-house groups** — Devices created for a room, floor, or the whole house are now named just after the room/floor (e.g. "Salon" instead of "Linus Dashboard - Salon"); the "Linus Dashboard" attribution is still shown on the device's own info page.
- Backend group-computation code now reuses Home Assistant core's own reduction helpers (`group.util`) instead of hand-rolled equivalents, reducing the custom logic that needs to track upstream changes.
- Group control tiles, history graphs, and "Turn All On/Off" targeting rolled out consistently across switch/fan/cover/siren, matching light's existing behavior.
- De-duplicated per-domain chip-building and aggregate-chip data sourcing.

### 🧪 For Beta Testers

**What to test:**
- [ ] Group entities for light/switch/fan/cover/siren/binary_sensor/climate/media_player show up correctly per area, per floor, and for the whole house — and control the right members when toggled.
- [ ] Cover and media player groups show up per device type (gate, garage, shutter / TV, speaker, receiver) with their own distinct name and icon, not a generic one shared with other groups in the same room.
- [ ] "More info" on a floor or whole-house group entity shows its sub-groups (rooms/floors), not a flat list of raw entities.
- [ ] The light tile's brightness slider (Area cards) doesn't show extra empty space above it when the name/icon row is hidden.
- [ ] If you use Magic Areas: area state, light control, scene toggles, and climate/media_player group control all work again.
- [ ] Numeric aggregate sensors (temperature, humidity, and any other device_class you have, e.g. CO2 or illuminance) show sensible per-area/floor/whole-house values.
- [ ] The "Unavailable entities" sensor and its dashboard view correctly reflect entities going unavailable and coming back, without needing a restart, even on a home with many entities.
- [ ] Activity Detection chip and popup behave correctly both with and without Linus Brain installed.
- [ ] The camera chip shows up on the Home view if you have cameras.
- [ ] Voice assistant exposure/hiding for the new group entities behaves as configured.
- [ ] Room/floor/whole-house device names in Settings → Devices show just the room/floor name (e.g. "Salon"), not prefixed with "Linus Dashboard -".

**Known Issues:**
- _None currently._

**How to Report Issues:**
Open an issue on GitHub with your Home Assistant version, a description of what you expected vs. what happened, and screenshots/logs if relevant.

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **Entités groupe dédiées pour chaque domaine, à l'échelle zone/étage/maison** — Light, switch, fan, cover, siren, binary_sensor (présence + chaque device_class), climate et media_player ont maintenant chacun leurs propres entités groupe Home Assistant, imbriquées zone → étage → maison entière, construites sur les classes `group.<domain>` du cœur de Home Assistant plutôt que sur une logique maison, pour rester correctes au fil des évolutions de Home Assistant. Ouvrir "plus d'infos" d'un groupe étage ou maison affiche désormais ses pièces/étages comme membres, plus une liste plate d'entités brutes.
- **Groupes cover et media player, par type d'appareil** — Les covers (portail, porte de garage, volet...) et les media players (TV, enceinte, ampli...) ont maintenant leur propre groupe dédié par type, par pièce/étage/maison entière — comme c'était déjà le cas pour les binary_sensor (mouvement, porte, fenêtre...). Chaque groupe affiche son propre nom et sa propre icône au lieu d'une icône générique partagée avec tous les autres covers/media players de la même pièce.
- **Capteur agrégé pour chaque device_class, détecté automatiquement** — Auparavant limité à une liste fixe (température, humidité, luminosité, batterie). Couvre maintenant n'importe quel device_class numérique de `sensor` ou `binary_sensor` réellement présent chez vous (mouvement, CO2, pression...), avec le bon mode d'agrégation (somme/moyenne/minimum) par capteur selon son propre `state_class` — la batterie prend toujours le minimum des membres plutôt qu'une moyenne qui masquerait un appareil déchargé.
- **Les tuiles de contrôle groupé et les boutons "Tout allumer/éteindre" visent le bon groupe** — Les boutons et tuiles à chaque échelle (zone/étage/maison) agissent sur l'entité groupe dédiée de cette échelle quand elle existe, plutôt que sur un appel de service générique à chaque entité correspondante.
- **Retour du support Magic Areas** — L'intégration Magic Areas avait été retirée, ce qui cassait les bascules de scènes, la détection d'état de zone, et le contrôle groupé lumière/climate/media_player pour les installations qui en dépendaient. Cette version restaure le support complet de Magic Areas (état de zone, contrôle lumière, bascules de scènes, contrôle groupé climate/media_player, UI de configuration) comme palier de repli, avec la priorité de résolution d'entité Linus Brain > Magic Areas > natif. Les installations utilisant Linus Brain ou aucune des deux intégrations ne sont pas affectées.
- **Détection d'activité : une seule popup, plus deux** — La popup séparée "zone Linus Brain" est fusionnée dans la popup de détection d'activité, augmentée d'une section Contrôles quand Linus Brain est présent, plutôt que deux popups qui se recoupaient largement. La chip utilise maintenant une entité de présence native en repli plutôt qu'une icône statique quand aucune source plus riche n'est disponible.
- **Chip caméras sur la vue Accueil** — La vue Accueil affiche maintenant une chip regroupant toutes vos caméras, la même agrégation déjà utilisée sur la vue Sécurité, désormais aussi disponible un niveau plus haut.

### 🐛 Corrections de bugs

- **Les labels/icônes des covers et media players n'affichent plus de repli générique** — Un portail ou une porte de garage affiche maintenant son propre nom et sa propre icône (ex. "Portail", "Garage") au lieu de l'icône générique "Ouverture"/fenêtre partagée par tous les covers ; même correction pour les media players (TV, enceinte, ampli ont chacun leur propre icône au lieu d'une icône cast générique). Ça concerne ces entités partout où elles apparaissent : vues Accueil, Zone, Étage et Sécurité.
- **La tuile lumière ne laisse plus un vide au-dessus du slider de luminosité** — Quand la ligne nom/icône d'un groupe lumière est cachée pour n'afficher que le contrôle on/off + luminosité, la tuile ne réserve plus d'espace vide inutile à la place de cette ligne.
- **Les listes d'entités dynamiques ne plantent plus quand une entité référencée n'existe pas** — Les couleurs/icônes des badges et les popups d'agrégats de toute l'app pouvaient planter purement et simplement si une des entités référencées n'était pas connue de Home Assistant ; elles l'ignorent maintenant simplement.
- **Le capteur "entités indisponibles" ne perd plus silencieusement ses données sur une grande maison** — Sur une maison avec beaucoup d'entités, une vague d'entités qui deviennent indisponibles en même temps pouvait produire une liste trop grande pour que Home Assistant puisse la stocker, faisant disparaître silencieusement toute la donnée. Le compte reste exact dans tous les cas ; seule la liste détaillée est plafonnée.
- **Le capteur "entités indisponibles" se met maintenant à jour en direct** — Il calculait son décompte une seule fois au démarrage de Home Assistant et plus jamais ensuite, il pouvait donc afficher indéfiniment des entités redevenues disponibles depuis longtemps (ou manquer celles tombées en panne après coup). Il se recalcule maintenant à chaque changement d'état d'une entité suivie.
- **La vue "Indisponibles" n'affiche plus une page vide quand tout va bien** — Une carte de confirmation s'affiche à la place.
- **Les agrégats numériques pour les capteurs d'énergie/eau/gaz/monétaires étaient silencieusement moyennés au lieu d'être sommés** — Trouvé et corrigé en écrivant la suite de tests de cette version ; aucun autre device_class (température, humidité, batterie...) n'était affecté.
- La tuile de groupe lumière n'affiche plus un slider de luminosité vide pour les groupes non-dimmables — bascule sur une tuile simple on/off.
- Plusieurs régressions corrigées autour des entités groupe dédiées : masquage assistants vocaux (silencieusement cassé depuis son ajout), icônes de repli manquantes pour binary_sensor/siren, `MediaPlayerPopup` qui ne recevait jamais son entité groupe dédiée, séparateurs de navigation qui perdaient leur ciblage du groupe, et un commentaire erroné qui cassait le build de production.
- Quelques capteurs de diagnostic laissés par le travail de groupement cover/media player ci-dessus pouvaient rester bloqués "indisponible" indéfiniment ; ils sont maintenant nettoyés automatiquement à la mise à jour.

### ⚡ Améliorations

- **Noms d'appareil plus propres pour les groupes pièce/étage/maison** — Les appareils créés pour une pièce, un étage ou toute la maison portent maintenant juste le nom de la pièce/étage (ex. "Salon" au lieu de "Linus Dashboard - Salon") ; l'attribution "Linus Dashboard" reste visible sur la fiche info de l'appareil.
- Le code de calcul des groupes côté backend réutilise maintenant les fonctions de réduction du cœur de Home Assistant (`group.util`) plutôt que des équivalents maison, réduisant la logique custom à maintenir face aux évolutions futures.
- Tuiles de contrôle groupé, graphiques d'historique et ciblage "Tout allumer/éteindre" déployés de façon cohérente sur switch/fan/cover/siren, alignés sur le comportement déjà existant de light.
- Dé-duplication de la construction des chips par domaine et de la source de données des chips agrégés.

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] Les entités groupe pour light/switch/fan/cover/siren/binary_sensor/climate/media_player apparaissent correctement par zone, par étage et pour toute la maison — et contrôlent les bons membres une fois activées.
- [ ] Les groupes cover et media player apparaissent par type d'appareil (portail, garage, volet / TV, enceinte, ampli) avec leur propre nom et icône distincts, pas une icône générique partagée avec d'autres groupes de la même pièce.
- [ ] "Plus d'infos" sur un groupe étage ou maison affiche ses sous-groupes (pièces/étages), pas une liste plate d'entités brutes.
- [ ] La tuile lumière (cartes de zone) n'affiche plus d'espace vide superflu au-dessus du slider de luminosité quand la ligne nom/icône est cachée.
- [ ] Si vous utilisez Magic Areas : état de zone, contrôle lumière, bascules de scènes, et contrôle groupé climate/media_player fonctionnent tous à nouveau.
- [ ] Les capteurs agrégés numériques (température, humidité, et tout autre device_class que vous avez, ex. CO2 ou luminosité) affichent des valeurs cohérentes par zone/étage/maison.
- [ ] Le capteur "entités indisponibles" et sa vue reflètent correctement les entités qui deviennent indisponibles puis redisponibles, sans besoin de redémarrer, même sur une maison avec beaucoup d'entités.
- [ ] La chip et la popup de détection d'activité fonctionnent correctement avec et sans Linus Brain installé.
- [ ] La chip caméras apparaît sur la vue Accueil si vous avez des caméras.
- [ ] Le masquage/exposition assistants vocaux pour les nouvelles entités groupe se comporte comme configuré.
- [ ] Les noms d'appareil pièce/étage/maison dans Paramètres → Appareils affichent juste le nom de la pièce/étage (ex. "Salon"), sans le préfixe "Linus Dashboard -".

**Problèmes connus :**
- _Aucun actuellement._

**Comment signaler un problème :**
Ouvrez une issue sur GitHub avec votre version de Home Assistant, ce que vous attendiez vs. ce qui s'est passé, et des captures d'écran/logs si pertinent.

---

## 📊 Technical Details

### All Commits Since 1.5.1

- refactor: drop the "Linus Dashboard - " prefix from area/floor/global device names (ddd39dc)
- fix: Plan A left device_class hidden-sensor buckets (binary_sensor/cover/media_player) orphaned in the registry (f0fa576)
- feat: Plan A consolidation — dedicated device_class groups for cover/media_player, retire the hidden counting-sensor fallback for them (a7a0a81)
- fix: cover/media_player device_class icons always showed the generic domain icon (b03469c)
- test: add cover/media_player fixtures with real device_class values (f7b5651)
- revert: .content collapse for the light tile did nothing useful, restore icon/info hiding (7b8bd57)
- fix: dynamic-entity Jinja templates crashed when a referenced entity had no live state (cdcc79b)
- fix: cover/media_player device_class labels fell back to the generic domain name everywhere (8e33afd)
- docs: rewrite release notes to cover changes since last stable (1.5.1), not just since the last beta tag (98374e4)
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
