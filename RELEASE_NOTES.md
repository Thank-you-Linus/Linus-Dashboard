# 🧪 Beta Release v1.4.0-beta.6

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## 🇬🇧 English

### ✨ New Features

- **Component Registry System** - Introduced a centralized ComponentRegistry class that manages dynamic imports and caching of card, chip, and view modules. This significantly improves dashboard loading performance by preloading frequently used components and eliminating redundant imports. The system includes LRU caching with weak references for optimal memory management and automatically tracks component usage to optimize cache size based on access patterns.

- **State-Aware Dynamic Icons** - Badge icons now change based on actual device states. See at a glance if your AC is heating or cooling, if covers are open or closed, without opening any popup. Works across climate, cover, light, and switch badges on room cards.

- **Navigation Mode for HomeView Chips** - HomeView chips can now navigate directly to area views instead of opening popups, offering faster access to specific rooms. Skip the popup and jump directly to the room you want with a single click.

- **Smart Control Chips** - Added intelligent control chips for Switch, Fan, and MediaPlayer domains that provide quick access to common actions without opening full popups.

- **Device Class-Specific Cover Chips** - Cover chips now intelligently filter based on device_class (window, door, blind, etc.) and properly handle empty area badges.

- **Refresh Chip with Enhanced Feedback** - All dashboard views now include a RefreshChip that allows manual registry refresh using browser_mod.javascript with improved user feedback during the refresh operation.

- **AI-Powered Release System** - Introduced an intelligent release workflow that analyzes commits semantically and automates version management with proper beta testing validation.

### 🐛 Bug Fixes

- **TypeScript Type Errors** - Resolved type errors in RegistryManager and CardFactory that were causing build warnings
- **EntityResolver Import Path** - Corrected case sensitivity issues in EntityResolver import paths for Linux compatibility
- **Cover Chip Issues** - Fixed device_class filtering and badge layout problems in cover chips
- **Import Path Compatibility** - Updated to use literal import paths in factories for better webpack/rspack compatibility
- **CardFactory Base Path** - Removed incorrect relative paths from CardFactory basePath configuration
- **Global Badge Entity Count** - Fixed display of entity count in global badges and properly disabled sensor/binary_sensor chips where appropriate
- **Control Chips** - Enabled control chips for all domains in AreaView and FloorView
- **Aggregate Domain Controls** - Fixed extraControls for aggregate domains without device_class specification
- **Floor Aggregate Chips** - Corrected floor-level aggregate chips and cover extraControls behavior
- **Magic Areas Exclusion** - Properly exclude Magic Areas entities from certain views and improved chip color consistency
- **Tag Validation** - Updated release scripts to properly handle version tag validation
- **Release Notifications** - Improved formatting and Discord URL display in release notifications

### ⚡ Improvements

- **Code Cleanup** - Removed unused imports and debug console logs to improve code maintainability and reduce bundle size
- **Enhanced Card Responsiveness** - Controller cards now use `width: max-content` for better responsive behavior across different screen sizes
- **Better Domain Localization** - Improved translation accuracy for aggregate popups by utilizing device_class information when generating domain labels
- **StandardDomainView Refactoring** - Eliminated domain view duplication by introducing a unified StandardDomainView component
- **Helper Class Optimization** - Refactored sorting logic in Helper class for better performance
- **Unified Chip System** - Consolidated chip system using AggregateChip with specialized popups for cleaner architecture
- **Domain Configuration Simplification** - Simplified domain configuration structure and removed unused options
- **Floor ID Filtering** - Added proper floor_id filtering and eliminated code duplication across views
- **Translation Additions** - Added missing translations and cleaned up code for the unified chip system
- **Activity Detection Simplification** - Clarified distinction between Linus Brain and Magic Areas for activity detection

### 📝 Documentation

- **Comprehensive Documentation Overhaul** - Complete rewrite of documentation for v1.4.0 release with detailed architecture guides
- **Chip System Architecture** - Added comprehensive documentation explaining the chip system architecture and usage patterns

### 🧪 For Beta Testers

**What to test:**
- [ ] **Performance improvements** - Compare dashboard loading speed with previous beta (should feel noticeably faster, especially on large installations)
- [ ] **Component registry** - Verify that dashboard loads smoothly without errors in browser console
- [ ] **State-aware icons** - Check that badge icons change based on device states (covers open/closed, climate heating/cooling, etc.)
- [ ] **Navigation mode** - Test HomeView chip navigation to ensure direct area access works correctly
- [ ] **Smart control chips** - Verify quick controls work for switches, fans, and media players
- [ ] **Cover chips** - Test device_class-specific cover chips across different cover types
- [ ] **Refresh functionality** - Use the RefreshChip to manually refresh registries and verify feedback works
- [ ] **Card responsiveness** - Test controller cards on mobile devices and verify they size appropriately
- [ ] **Domain labels** - Check aggregate popups and verify device-class-specific labels appear correctly
- [ ] **Console cleanliness** - Verify browser console is clean without debug logs flooding the output

**Known Issues:**
- None currently - please report any issues you encounter!

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **Système de registre de composants** - Introduction d'une classe ComponentRegistry centralisée qui gère les importations dynamiques et la mise en cache des modules de cartes, puces et vues. Cela améliore considérablement les performances de chargement du tableau de bord en préchargeant les composants fréquemment utilisés et en éliminant les importations redondantes. Le système inclut un cache LRU avec des références faibles pour une gestion optimale de la mémoire et suit automatiquement l'utilisation des composants pour optimiser la taille du cache en fonction des modèles d'accès.

- **Icônes dynamiques basées sur l'état** - Les icônes des badges changent maintenant en fonction de l'état réel des appareils. Voyez d'un coup d'œil si votre climatisation chauffe ou refroidit, si les volets sont ouverts ou fermés, sans ouvrir de popup. Fonctionne sur les badges de climat, couverture, lumière et interrupteur des cartes de pièce.

- **Mode navigation pour les puces HomeView** - Les puces HomeView peuvent désormais naviguer directement vers les vues de zone au lieu d'ouvrir des popups, offrant un accès plus rapide aux pièces spécifiques. Sautez la popup et accédez directement à la pièce souhaitée en un seul clic.

- **Puces de contrôle intelligentes** - Ajout de puces de contrôle intelligentes pour les domaines Switch, Fan et MediaPlayer qui fournissent un accès rapide aux actions courantes sans ouvrir de popups complètes.

- **Puces de couverture spécifiques par classe d'appareil** - Les puces de couverture filtrent maintenant intelligemment en fonction de la device_class (fenêtre, porte, store, etc.) et gèrent correctement les badges de zone vides.

- **Puce d'actualisation avec retour amélioré** - Toutes les vues du tableau de bord incluent désormais une RefreshChip qui permet l'actualisation manuelle du registre via browser_mod.javascript avec un retour utilisateur amélioré pendant l'opération d'actualisation.

- **Système de publication basé sur l'IA** - Introduction d'un workflow de publication intelligent qui analyse les commits de manière sémantique et automatise la gestion des versions avec une validation appropriée des tests bêta.

### 🐛 Corrections de bugs

- **Erreurs de type TypeScript** - Résolution des erreurs de type dans RegistryManager et CardFactory qui causaient des avertissements de build
- **Chemin d'import EntityResolver** - Correction des problèmes de sensibilité à la casse dans les chemins d'import EntityResolver pour la compatibilité Linux
- **Problèmes de puces de couverture** - Correction du filtrage device_class et des problèmes de mise en page des badges dans les puces de couverture
- **Compatibilité des chemins d'import** - Mise à jour pour utiliser des chemins d'import littéraux dans les factories pour une meilleure compatibilité webpack/rspack
- **Chemin de base CardFactory** - Suppression des chemins relatifs incorrects de la configuration basePath de CardFactory
- **Comptage d'entités des badges globaux** - Correction de l'affichage du comptage d'entités dans les badges globaux et désactivation appropriée des puces sensor/binary_sensor
- **Puces de contrôle** - Activation des puces de contrôle pour tous les domaines dans AreaView et FloorView
- **Contrôles de domaine agrégés** - Correction des extraControls pour les domaines agrégés sans spécification de device_class
- **Puces agrégées d'étage** - Correction des puces agrégées au niveau de l'étage et du comportement des extraControls de couverture
- **Exclusion Magic Areas** - Exclusion appropriée des entités Magic Areas de certaines vues et amélioration de la cohérence des couleurs des puces
- **Validation des tags** - Mise à jour des scripts de publication pour gérer correctement la validation des tags de version
- **Notifications de publication** - Amélioration du formatage et de l'affichage des URL Discord dans les notifications de publication

### ⚡ Améliorations

- **Nettoyage du code** - Suppression des imports inutilisés et des logs de debug console pour améliorer la maintenabilité du code et réduire la taille du bundle
- **Réactivité améliorée des cartes** - Les cartes de contrôleur utilisent maintenant `width: max-content` pour un meilleur comportement responsive sur différentes tailles d'écran
- **Meilleure localisation des domaines** - Amélioration de la précision des traductions pour les popups agrégées en utilisant les informations device_class lors de la génération des étiquettes de domaine
- **Refactorisation StandardDomainView** - Élimination de la duplication des vues de domaine en introduisant un composant StandardDomainView unifié
- **Optimisation de la classe Helper** - Refactorisation de la logique de tri dans la classe Helper pour de meilleures performances
- **Système de puces unifié** - Consolidation du système de puces utilisant AggregateChip avec des popups spécialisées pour une architecture plus propre
- **Simplification de la configuration des domaines** - Simplification de la structure de configuration des domaines et suppression des options inutilisées
- **Filtrage par ID d'étage** - Ajout d'un filtrage approprié par floor_id et élimination de la duplication de code entre les vues
- **Ajouts de traductions** - Ajout de traductions manquantes et nettoyage du code pour le système de puces unifié
- **Simplification de la détection d'activité** - Clarification de la distinction entre Linus Brain et Magic Areas pour la détection d'activité

### 📝 Documentation

- **Refonte complète de la documentation** - Réécriture complète de la documentation pour la version v1.4.0 avec des guides d'architecture détaillés
- **Architecture du système de puces** - Ajout d'une documentation complète expliquant l'architecture du système de puces et les modèles d'utilisation

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] **Améliorations des performances** - Comparer la vitesse de chargement du tableau de bord avec la bêta précédente (devrait être nettement plus rapide, surtout sur les grandes installations)
- [ ] **Registre de composants** - Vérifier que le tableau de bord se charge correctement sans erreurs dans la console du navigateur
- [ ] **Icônes basées sur l'état** - Vérifier que les icônes des badges changent en fonction des états des appareils (couvertures ouvertes/fermées, climatisation chauffage/refroidissement, etc.)
- [ ] **Mode navigation** - Tester la navigation des puces HomeView pour s'assurer que l'accès direct aux zones fonctionne correctement
- [ ] **Puces de contrôle intelligentes** - Vérifier que les contrôles rapides fonctionnent pour les interrupteurs, ventilateurs et lecteurs multimédia
- [ ] **Puces de couverture** - Tester les puces de couverture spécifiques par device_class sur différents types de couvertures
- [ ] **Fonctionnalité d'actualisation** - Utiliser la RefreshChip pour actualiser manuellement les registres et vérifier que le retour fonctionne
- [ ] **Réactivité des cartes** - Tester les cartes de contrôleur sur les appareils mobiles et vérifier qu'elles s'adaptent correctement
- [ ] **Étiquettes de domaine** - Vérifier les popups agrégées et s'assurer que les étiquettes spécifiques par classe d'appareil apparaissent correctement
- [ ] **Propreté de la console** - Vérifier que la console du navigateur est propre sans logs de debug envahissants

**Problèmes connus :**
- Aucun actuellement - veuillez signaler tout problème que vous rencontrez !

---

## 📊 Technical Details

### All Commits (50 total since 1.4.0-beta.4)

- build: rebuild after cleanup (d58635d)
- refactor: remove unused imports and debug console logs (3eec33a)
- Enhance domain label localization in AggregatePopup (42be9c0)
- feat: Implement Component Registry for dynamic imports and caching (311734b)
- Enhance documentation and clean up debug logs in Helper.ts (50c464b)
- feat: enhance card styling and chip functionality (d023421)
- docs: comprehensive documentation overhaul for v1.4.0 release (17d3551)
- chore: release v1.4.0-beta.6 (f924290)
- build(deps): bump actions/upload-artifact from 4 to 6 (a9078b3)
- build(deps): bump actions/github-script from 7 to 8 (91aff5e)
- build(deps): bump ruff from 0.14.8 to 0.14.10 (696d3ca)
- fix: resolve TypeScript type errors in RegistryManager and CardFactory (6186e13)
- Refactor ActivityDetectionPopup: Clean up code (26c6638)
- fix: correct EntityResolver import path case sensitivity (bef4084)
- feat: add state-aware dynamic icons for StandardDomainView badges (9578c3c)
- fix: resolve cover chip issues with device_class filtering and badge layout (21cd309)
- Refactor Helper class sorting logic and improve badge creation (f15dea1)
- fix: use literal import paths in factories for webpack compatibility (80fbc58)
- fix: correct CardFactory basePath (fa92076)
- refactor: implement factories and services for Phase 3 completion (aa8e1f3)
- refactor: eliminate domain view duplication with StandardDomainView (54077ca)
- feat: add navigation mode for HomeView chips (5133e3d)
- docs: add comprehensive chip system architecture documentation (5f3c22e)
- fix: display entity count in global badges (8cc9d43)
- fix: enable control chips for all domains (3b04c08)
- refactor: simplify domain configuration (68bbf65)
- fix: allow extraControls for aggregate domains (051a4a2)
- fix: correct floor aggregate chips (21dd7a4)
- refactor: add floor_id filtering (3a18573)
- feat: add device_class-specific chips for covers (28144a9)
- build: rebuild bundle after translation additions (3eee4e2)
- chore: add translations (de6dbb3)
- refactor: unify chip system with AggregateChip (a890822)
- fix: exclude Magic Areas entities (6ecce88)
- feat: add smart control chips (7559814)
- refactor: remove redundant titles from domain views (cb8ce51)
- feat: add RefreshChip to all dashboard views (d5e2be4)
- feat: add manual registry refresh (99fe1a0)
- chore: release 1.4.0-beta.6 (b1bf911)
- fix: update tag validation (f54f655)
- fix: accept 'v' prefix in pre-release tag validation (a543a8a)
- chore: release 1.4.0-beta.5 (8f55a01)
- refactor: simplify activity detection (4666271)
- feat: Add AI-powered intelligent release system (3b591c3)
- chore: Clean up release notes (319b389)
- refactor: Simplify release notes system (b9ea792)
- refactor: Unify beta release commands (cca4ecf)
- fix: Improve release notifications (d402bba)
- chore: Clean up release notes after pre-release (4b1b6aa)

### Contributors

- @Julien-Decoen
- @dependabot[bot]
- @github-actions[bot]

### ⚠️ Breaking Changes

**None** - All changes are backward compatible. Default behavior is preserved for all existing views.

