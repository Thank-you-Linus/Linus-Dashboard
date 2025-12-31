# 🧪 Beta Release v1.4.0-beta.6

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

- **State-aware dynamic icons for badges** - Badge icons now dynamically change based on entity state (e.g., climate heating/cooling, cover open/closed), providing instant visual feedback without opening the popup
- **Navigation mode for HomeView chips** - HomeView chips can now navigate directly to area views instead of opening popups, offering faster access to specific rooms
- **Device class-specific chips for covers** - Cover entities now display specialized control chips based on their device class (blinds, shutters, curtains), with appropriate icons and controls
- **Smart control chips for Switch, Fan, and MediaPlayer** - Added intelligent control chips that provide quick actions directly from the view without opening popups (toggle switches, fan speed control, media playback)
- **RefreshChip on all dashboard views** - Added a refresh button to all views with improved visual feedback, allowing manual registry refresh without reloading the entire dashboard
- **Manual registry refresh with browser_mod.javascript** - Integrated browser_mod support for triggering registry updates directly from the UI, eliminating the need for page reloads

<details>
<summary>📖 <b>View detailed descriptions / Voir les descriptions détaillées</b></summary>

### 🇬🇧 English


- **State-aware dynamic icons for badges** - Badge icons now dynamically change based on entity state (e.g., climate heating/cooling, cover open/closed), providing instant visual feedback without opening the popup
- **Navigation mode for HomeView chips** - HomeView chips can now navigate directly to area views instead of opening popups, offering faster access to specific rooms
- **Device class-specific chips for covers** - Cover entities now display specialized control chips based on their device class (blinds, shutters, curtains), with appropriate icons and controls
- **Smart control chips for Switch, Fan, and MediaPlayer** - Added intelligent control chips that provide quick actions directly from the view without opening popups (toggle switches, fan speed control, media playback)
- **RefreshChip on all dashboard views** - Added a refresh button to all views with improved visual feedback, allowing manual registry refresh without reloading the entire dashboard
- **Manual registry refresh with browser_mod.javascript** - Integrated browser_mod support for triggering registry updates directly from the UI, eliminating the need for page reloads



### 🇫🇷 Français


- **Icônes dynamiques selon l'état des badges** - Les icônes des badges changent dynamiquement selon l'état de l'entité (ex: climatisation chauffe/refroidit, volet ouvert/fermé), offrant un retour visuel instantané sans ouvrir le popup
- **Mode navigation pour les chips HomeView** - Les chips de la vue d'accueil peuvent maintenant naviguer directement vers les vues de pièces au lieu d'ouvrir des popups, offrant un accès plus rapide aux pièces spécifiques
- **Chips spécifiques par classe d'appareil pour les volets** - Les volets affichent maintenant des chips de contrôle spécialisées selon leur classe d'appareil (stores, volets roulants, rideaux), avec des icônes et contrôles appropriés
- **Chips de contrôle intelligentes pour Switch, Fan et MediaPlayer** - Ajout de chips intelligentes offrant des actions rapides directement depuis la vue sans ouvrir de popup (basculer interrupteurs, contrôle vitesse ventilateur, lecture média)
- **RefreshChip sur toutes les vues** - Ajout d'un bouton de rafraîchissement sur toutes les vues avec retour visuel amélioré, permettant de rafraîchir le registre manuellement sans recharger tout le tableau de bord
- **Rafraîchissement manuel du registre avec browser_mod.javascript** - Intégration du support browser_mod pour déclencher les mises à jour du registre directement depuis l'interface, éliminant le besoin de recharger la page



</details>

## 🐛 Bug Fixes

- **TypeScript type errors in RegistryManager and CardFactory** - Fixed critical type mismatches that prevented proper compilation
- **EntityResolver import path case sensitivity** - Corrected import paths to ensure proper module resolution across different file systems
- **Cover chip device_class filtering and badge layout** - Fixed issues where cover chips were not properly filtered by device class, and badges displayed incorrect layouts
- **Literal import paths in factories** - Changed to literal import paths for webpack compatibility, resolving bundling issues
- **CardFactory basePath correction** - Removed incorrect relative paths that caused card loading failures
- **Entity count display in global badges** - Global badges now correctly display entity counts; disabled sensor/binary_sensor chips that were causing performance issues
- **Control chips for all domains in AreaView and FloorView** - Enabled control chips across all supported domains, not just lights
- **ExtraControls for aggregate domains** - Fixed extraControls support for aggregate domains that don't have a device_class (like switch, fan)
- **Floor aggregate chips and cover extraControls** - Corrected chip generation for floor-level aggregates and cover extra controls
- **Magic Areas entities exclusion** - Excluded Magic Areas virtual entities from chip lists and improved chip color consistency

## ⚡ Improvements

- **Phase 3 architecture completion** - Implemented factories and services pattern for better code organization and maintainability
- **StandardDomainView unification** - Eliminated domain view code duplication by creating a unified StandardDomainView class
- **Simplified domain configuration** - Removed unused configuration options and streamlined domain setup

<details>
<summary>🇫🇷 <b>Version française</b></summary>

- **Finalisation de l'architecture Phase 3** - Implémentation du pattern factories et services pour une meilleure organisation et maintenabilité du code
- **Unification StandardDomainView** - Élimination de la duplication de code des vues de domaine en créant une classe StandardDomainView unifiée
- **Simplification de la configuration des domaines** - Suppression des options de configuration inutilisées et rationalisation de la configuration des domaines

</details>

---

## 🧪 For Beta Testers

**What to test:**
- [ ] **State-aware badge icons** - Verify that badge icons change correctly based on entity state (climate, covers, lights, switches)
- [ ] **HomeView chip navigation** - Test that chips correctly navigate to area views when navigation mode is enabled
- [ ] **Cover device class chips** - Check that different cover types (blinds, shutters, curtains) display appropriate control chips
- [ ] **Smart control chips** - Test quick actions on Switch, Fan, and MediaPlayer entities without opening popups
- [ ] **RefreshChip functionality** - Test the refresh button on different views and verify registry updates work correctly

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] **Icônes dynamiques des badges** - Vérifier que les icônes des badges changent correctement selon l'état des entités (climatisation, volets, lumières, interrupteurs)
- [ ] **Navigation des chips HomeView** - Tester que les chips naviguent correctement vers les vues de pièces quand le mode navigation est activé
- [ ] **Chips par classe d'appareil pour volets** - Vérifier que les différents types de volets (stores, volets roulants, rideaux) affichent les chips de contrôle appropriées
- [ ] **Chips de contrôle intelligentes** - Tester les actions rapides sur les entités Switch, Fan et MediaPlayer sans ouvrir de popups
- [ ] **Fonctionnalité RefreshChip** - Tester le bouton de rafraîchissement sur différentes vues et vérifier que les mises à jour du registre fonctionnent correctement

</details>

**Known Issues:**
- None currently

---

<details>
<summary>📊 <b>Technical Details</b></summary>

### Key Commits
- feat: add state-aware dynamic icons for StandardDomainView badges (9578c3c)
- feat: add navigation mode for HomeView chips and debug logs for CoverView (5133e3d)
- feat: add device_class-specific chips for covers and filter empty area badges (28144a9)
- feat: add smart control chips for Switch, Fan, and MediaPlayer views (7559814)
- feat: add RefreshChip to all dashboard views with improved user feedback (d5e2be4)
- feat: add manual registry refresh with browser_mod.javascript (99fe1a0)
- fix: resolve TypeScript type errors in RegistryManager and CardFactory (6186e13)
- fix: exclude Magic Areas entities and improve chip colors (6ecce88)
- refactor: implement factories and services for Phase 3 completion (aa8e1f3)
- refactor: eliminate domain view duplication with StandardDomainView (54077ca)
- refactor: unify chip system with AggregateChip and specialized popups (a890822)
- docs: add comprehensive chip system architecture documentation (5f3c22e)

### Contributors
- @Julien-Decoen

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

