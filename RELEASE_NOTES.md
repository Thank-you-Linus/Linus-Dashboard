# 🎉 Release Notes - Version 1.5.0-beta.1

---

## 🇬🇧 English

### ✨ New Features

- **Siren Domain Support** - Full integration of siren devices into the security ecosystem. Siren entities now appear in SecurityView cards and chips, with proper color coding (red when active) and service controls (turn_on/turn_off). Includes support for aggregate popups and domain configuration.

- **Floor and Area Exclusion Filtering** - Added `floor_id` and `area_id` support to `excluded_targets` configuration. You can now exclude entire floors or specific areas from all views, popups, and components. Empty floor sections are automatically hidden when all areas are excluded, and the WelcomeCard no longer displays when the first floor has no visible areas.

- **Enhanced SecurityView with New Cards** - Complete redesign of the security monitoring experience:
  - **SecurityStatusCard**: Real-time overview displaying current security status with color-coded indicators
  - **SecurityActivityCard**: Track recent security events and changes across all security devices
  - **SecurityStatsCard**: Comprehensive statistics dashboard showing active devices, response times, and security metrics
  - **SecurityChip**: Quick-access chip in the header for instant security status visibility

- **Smart Quick Actions with Confirmations** - Replaced the 2x2 grid of quick action buttons with a streamlined popup-based system. All security actions (lock all, unlock all, lights control, alarm control) now require confirmation before execution, preventing accidental triggers. Each action displays the number of affected devices and uses intuitive color coding.

- **Aggregate Security Cards** - Individual entity cards replaced with aggregate cards that open hierarchical popups. Each security domain (devices, critical safety, access control, detection) now shows a single card that displays active device counts with badges and opens detailed entity lists on tap.

- **Dynamic Last Changed Updates** - Security device timestamps now update automatically every minute without requiring page refresh. Time displays remain current and accurate throughout monitoring sessions.

### 🐛 Bug Fixes

- **Badge Display Fix** - Resolved issue where cards and chips displayed "mdi:numeric-0" badge when no entities were active. Badges now only appear when there are actually active entities to report.

- **Version Reading Fix** (#106) - Corrected production installation issue where version was read from non-existent `/config/package.json`. Now properly reads from `manifest.json` which is always present in Home Assistant installations.

- **Hierarchical Popup Navigation** - Fixed popup navigation across HomeView, FloorView, and AreaView to use consistent Floor → Area → Entity hierarchy. Navigation buttons now work correctly with smart page detection.

### ⚡ Improvements

- **Code Refactoring** - Added utility methods (`isFloorExcluded()`, `isAreaExcluded()`, `isEntityExcluded()`, `isDeviceExcluded()`) to reduce code duplication. Replaced 12 instances of inline exclusion checks, improving maintainability and slightly reducing bundle size.

- **Debug Logging Cleanup** - Removed verbose debug logging from area slug retrieval and cleaned up trailing whitespace across codebase.

### 🧪 For Beta Testers

**What to test:**
- [ ] **Siren devices**: Verify siren entities appear correctly in SecurityView and respond to service calls
- [ ] **Floor and area exclusions**: Test `floor_id` and `area_id` exclusion in configuration and confirm filtered floors/areas don't appear
- [ ] **New security cards**: Check that SecurityStatusCard, SecurityActivityCard, and SecurityStatsCard display accurate data
- [ ] **Quick actions confirmations**: Trigger each quick action (lock all, unlock all, lights, alarm) and verify confirmation popups work
- [ ] **Aggregate card popups**: Tap aggregate cards and verify hierarchical entity lists open correctly
- [ ] **Badge displays**: Confirm badges only show when entities are active (no "0" badges)
- [ ] **Dynamic timestamps**: Watch "last changed" times and verify they update automatically each minute
- [ ] **French translations**: If using French, verify all new security strings are properly translated

**Known Issues:**
- `relative_time()` filter returns English text only (Home Assistant core limitation)

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **Support du domaine Sirène** - Intégration complète des dispositifs de sirène dans l'écosystème de sécurité. Les entités sirène apparaissent maintenant dans les cartes et puces de SecurityView, avec codage couleur approprié (rouge quand actif) et contrôles de service (turn_on/turn_off). Inclut le support des popups agrégées et la configuration du domaine.

- **Filtrage d'exclusion par étage et zone** - Ajout du support `floor_id` et `area_id` à la configuration `excluded_targets`. Vous pouvez maintenant exclure des étages entiers ou des zones spécifiques de toutes les vues, popups et composants. Les sections d'étages vides sont automatiquement masquées lorsque toutes les zones sont exclues, et la WelcomeCard ne s'affiche plus quand le premier étage n'a aucune zone visible.

- **SecurityView améliorée avec nouvelles cartes** - Refonte complète de l'expérience de surveillance de sécurité :
  - **SecurityStatusCard** : Aperçu en temps réel affichant le statut de sécurité actuel avec indicateurs colorés
  - **SecurityActivityCard** : Suivi des événements de sécurité récents et changements sur tous les appareils de sécurité
  - **SecurityStatsCard** : Tableau de bord statistique complet montrant les appareils actifs, temps de réponse et métriques de sécurité
  - **SecurityChip** : Puce d'accès rapide dans l'en-tête pour visibilité instantanée du statut de sécurité

- **Actions rapides intelligentes avec confirmations** - Remplacement de la grille 2x2 de boutons d'action rapide par un système simplifié basé sur des popups. Toutes les actions de sécurité (verrouiller tout, déverrouiller tout, contrôle des lumières, contrôle de l'alarme) nécessitent maintenant une confirmation avant exécution, évitant les déclenchements accidentels. Chaque action affiche le nombre d'appareils affectés et utilise un codage couleur intuitif.

- **Cartes de sécurité agrégées** - Les cartes d'entités individuelles sont remplacées par des cartes agrégées qui ouvrent des popups hiérarchiques. Chaque domaine de sécurité (appareils, sécurité critique, contrôle d'accès, détection) affiche maintenant une seule carte qui montre le nombre d'appareils actifs avec badges et ouvre des listes d'entités détaillées au tap.

- **Mises à jour dynamiques "Dernière modification"** - Les horodatages des appareils de sécurité se mettent maintenant à jour automatiquement chaque minute sans nécessiter de rafraîchissement de page. Les affichages temporels restent actuels et précis tout au long des sessions de surveillance.

### 🐛 Corrections de bugs

- **Correction de l'affichage des badges** - Résolution du problème où les cartes et puces affichaient un badge "mdi:numeric-0" quand aucune entité n'était active. Les badges n'apparaissent maintenant que lorsqu'il y a réellement des entités actives à signaler.

- **Correction de la lecture de version** (#106) - Correction du problème d'installation en production où la version était lue depuis `/config/package.json` inexistant. Lit maintenant correctement depuis `manifest.json` qui est toujours présent dans les installations Home Assistant.

- **Navigation popup hiérarchique** - Correction de la navigation popup à travers HomeView, FloorView et AreaView pour utiliser une hiérarchie Étage → Zone → Entité cohérente. Les boutons de navigation fonctionnent maintenant correctement avec détection intelligente de page.

### ⚡ Améliorations

- **Refactorisation du code** - Ajout de méthodes utilitaires (`isFloorExcluded()`, `isAreaExcluded()`, `isEntityExcluded()`, `isDeviceExcluded()`) pour réduire la duplication de code. Remplacement de 12 instances de vérifications d'exclusion inline, améliorant la maintenabilité et réduisant légèrement la taille du bundle.

- **Nettoyage de la journalisation de débogage** - Suppression de la journalisation de débogage verbeuse de la récupération des slugs de zone et nettoyage des espaces de fin dans la base de code.

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] **Appareils sirène** : Vérifier que les entités sirène apparaissent correctement dans SecurityView et répondent aux appels de service
- [ ] **Exclusions d'étage et de zone** : Tester l'exclusion `floor_id` et `area_id` dans la configuration et confirmer que les étages/zones filtrés n'apparaissent pas
- [ ] **Nouvelles cartes de sécurité** : Vérifier que SecurityStatusCard, SecurityActivityCard et SecurityStatsCard affichent des données précises
- [ ] **Confirmations des actions rapides** : Déclencher chaque action rapide (verrouiller tout, déverrouiller tout, lumières, alarme) et vérifier que les popups de confirmation fonctionnent
- [ ] **Popups de cartes agrégées** : Taper sur les cartes agrégées et vérifier que les listes d'entités hiérarchiques s'ouvrent correctement
- [ ] **Affichage des badges** : Confirmer que les badges ne s'affichent que lorsque les entités sont actives (pas de badges "0")
- [ ] **Horodatages dynamiques** : Observer les temps "dernière modification" et vérifier qu'ils se mettent à jour automatiquement chaque minute
- [ ] **Traductions françaises** : Si vous utilisez le français, vérifier que toutes les nouvelles chaînes de sécurité sont correctement traduites

**Problèmes connus :**
- Le filtre `relative_time()` retourne du texte en anglais uniquement (limitation du noyau Home Assistant)

---

## 📊 Technical Details

### All Commits

- feat: add siren domain and improve SecurityView with aggregate cards (bb38903)
- fix: read version from manifest.json and clean up debug logging (fixes #106) (ff3acbd)
- refactor: add exclusion utility methods to reduce code duplication (2976850)
- feat: add floor_id support to excluded_targets and fix popup navigation (27567fa)
- chore: add SectionBuilder, sapiens config, and misc updates (7d26df1)
- fix: harmonize badge popups with hierarchical Floor → Area → Entity grouping (47f2744)

### Files Changed
- 4 new TypeScript files (SecurityStatusCard, SecurityActivityCard, SecurityStatsCard, SecurityChip)
- SecurityView.ts: Major refactoring (+277 lines, -61 lines)
- 110 new translation strings added (English + French)
- Updated variables.ts, HomeView.ts

### Contributors

- @Juicy
