# Release 1.5.0

---

## 🇬🇧 English

### ✨ New Features

- **17 supplemental domains for exclusion options** - Added support for 17 new entity domains in exclusion settings, giving users finer control over which entities appear in their dashboard views
- **Camera popup with live feed** - New CameraPopup component displays live camera feeds directly within aggregate popups, providing quick visual monitoring without leaving the dashboard
- **Tags view and TagsChip** - New dedicated TagsView and TagsChip components for managing Home Assistant labels, allowing users to organize and filter entities by tags
- **SecurityView enhancements with siren domain** - Overhauled security view with aggregate cards, siren domain support, and Jinja2 templates for real-time security status updates
- **Floor-level exclusion support** - Added `floor_id` support to `excluded_targets`, enabling users to exclude entire floors from dashboard views and improving popup navigation

### 🐛 Bug Fixes

- **Badge popup hierarchy corrected** - Badge popups now follow proper hierarchical grouping (Floor -> Area -> Entity) for consistent navigation
- **Correct badge scope in views** - AreaView and FloorView now use the correct scope for badges, fixing mismatched entity displays
- **Version read from manifest.json** - Version is now correctly read from `manifest.json` instead of being hardcoded, with debug logging cleaned up (fixes #106)

### ⚡ Improvements

- **Deferred component preload** - Component preloading is now deferred, and embedded dashboards and resource registration run in parallel, resulting in faster initial load times
- **Aggregate popup UX improvements** - Cleaner status display in aggregate popups for improved readability
- **Sensor constants reorganization** - Sensor constants have been organized and Area/Floor chips simplified for better maintainability
- **SecurityView layout cleanup** - Improved SecurityView layout with stats card removed for a cleaner interface
- **Exclusion utility methods** - New shared exclusion utility methods reduce code duplication across components

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **17 domaines supplementaires pour les options d'exclusion** - Ajout du support de 17 nouveaux domaines d'entites dans les parametres d'exclusion, offrant un controle plus precis sur les entites affichees dans le tableau de bord
- **Popup camera avec flux en direct** - Le nouveau composant CameraPopup affiche les flux camera en direct directement dans les popups agreges, permettant une surveillance visuelle rapide sans quitter le tableau de bord
- **Vue Tags et TagsChip** - Nouveaux composants TagsView et TagsChip pour gerer les etiquettes Home Assistant, permettant d'organiser et filtrer les entites par tags
- **Ameliorations SecurityView avec support du domaine sirene** - Vue securite revisitee avec des cartes agregees, le support du domaine sirene et des templates Jinja2 pour les mises a jour de statut de securite en temps reel
- **Support d'exclusion au niveau des etages** - Ajout du support `floor_id` dans `excluded_targets`, permettant d'exclure des etages entiers des vues du tableau de bord et ameliorant la navigation dans les popups

### 🐛 Corrections de bugs

- **Hierarchie des popups de badges corrigee** - Les popups de badges suivent desormais un regroupement hierarchique correct (Etage -> Zone -> Entite) pour une navigation coherente
- **Portee correcte des badges dans les vues** - AreaView et FloorView utilisent maintenant la bonne portee pour les badges, corrigeant les affichages d'entites inadaptes
- **Version lue depuis manifest.json** - La version est maintenant correctement lue depuis `manifest.json` au lieu d'etre codee en dur, avec un nettoyage des logs de debogage (corrige #106)

### ⚡ Améliorations

- **Prechargement differe des composants** - Le prechargement des composants est maintenant differe, et les tableaux de bord embarques ainsi que l'enregistrement des ressources s'executent en parallele, resultant en des temps de chargement initiaux plus rapides
- **Amelioration de l'UX des popups agreges** - Affichage de statut plus clair dans les popups agreges pour une meilleure lisibilite
- **Reorganisation des constantes de capteurs** - Les constantes de capteurs ont ete organisees et les chips Area/Floor simplifies pour une meilleure maintenabilite
- **Nettoyage de la mise en page SecurityView** - Mise en page SecurityView amelioree avec suppression de la carte de statistiques pour une interface plus epuree
- **Methodes utilitaires d'exclusion** - Nouvelles methodes utilitaires d'exclusion partagees reduisant la duplication de code entre les composants

---

## 📊 Technical Details

### All Commits

- feat: add 17 supplemental domains to exclusion options (bc5fd50)
- feat: add CameraPopup with live camera feed in aggregate popups (2e71248)
- feat: add TagsView and TagsChip for Home Assistant labels management (b2a3488)
- feat: add SecurityView enhancements and siren domain support (676c597)
- feat: add siren domain and improve SecurityView with aggregate cards (bb38903)
- feat: add floor_id support to excluded_targets and fix popup navigation (27567fa)
- fix: harmonize badge popups with hierarchical Floor -> Area -> Entity grouping (47f2744)
- fix: use correct scope for badges in AreaView and FloorView (1e4c532)
- fix: read version from manifest.json and clean up debug logging (ff3acbd)
- perf: defer component preload, parallelize embedded dashboards and resource registration (439838d)
- refactor: improve aggregate popup UX with cleaner status display (1994f36)
- refactor: organize sensor constants and reduce Area/Floor chips (66e3e1a)
- refactor: improve SecurityView layout and remove stats card (0bfb5b0)
- refactor: add exclusion utility methods to reduce code duplication (2976850)

### Contributors

- @Julien-Decoen
