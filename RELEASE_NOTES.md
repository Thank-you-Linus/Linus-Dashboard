# 🎉 Beta Release 1.5.0-beta.2

This incremental beta release adds camera integration features and Home Assistant labels management.

---

## 🇬🇧 English

### ✨ New Features

- **CameraPopup with live camera feed** - View live camera streams directly in aggregate popups when clicking on camera entities. The popup displays the camera feed with controls for navigation and interaction.

- **TagsView and TagsChip for Home Assistant labels** - New interface for managing Home Assistant labels (tags) with a dedicated view and chip components. Quickly organize and filter your entities using the native Home Assistant labeling system.


### 🐛 Bug Fixes

- **CI workflow improvements** - Fixed release workflow to properly handle pre-releases created via GitHub UI and prevent duplicate workflows for beta/alpha tags

- **Badge scope correction** - Fixed badge rendering in AreaView and FloorView to use correct entity scope, ensuring badges display accurate information


### ⚡ Improvements

- **Enhanced aggregate popup UX** - Cleaner status display with improved visual hierarchy and better entity grouping

- **Optimized sensor organization** - Refined sensor constants and reduced Area/Floor chips for better performance and cleaner interface


### 🧪 For Beta Testers

**What to test:**
- [ ] Test CameraPopup in aggregate views - Click on camera entities in area/floor badges and verify live feed displays correctly
- [ ] Test TagsView and TagsChip - Create, edit, and filter entities using Home Assistant labels
- [ ] Verify badge popups show correct entity information in AreaView and FloorView
- [ ] Test aggregate popup navigation and status display improvements
- [ ] Check overall dashboard performance and responsiveness

**Known Issues:**
- None currently


---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **CameraPopup avec flux caméra en direct** - Visualisez les flux caméra en direct directement dans les popups agrégés lors du clic sur les entités caméra. Le popup affiche le flux avec des contrôles pour la navigation et l'interaction.

- **TagsView et TagsChip pour la gestion des étiquettes Home Assistant** - Nouvelle interface pour gérer les étiquettes (tags) Home Assistant avec une vue dédiée et des composants de puce. Organisez et filtrez rapidement vos entités en utilisant le système d'étiquetage natif de Home Assistant.


### 🐛 Corrections de bugs

- **Améliorations du workflow CI** - Correction du workflow de publication pour gérer correctement les pré-versions créées via l'interface GitHub et prévenir les workflows dupliqués pour les tags beta/alpha

- **Correction du scope des badges** - Correction de l'affichage des badges dans AreaView et FloorView pour utiliser le scope d'entité correct, garantissant que les badges affichent les bonnes informations


### ⚡ Améliorations

- **UX des popups agrégés améliorée** - Affichage du statut plus propre avec une hiérarchie visuelle améliorée et un meilleur regroupement des entités

- **Organisation optimisée des capteurs** - Constantes de capteurs affinées et réduction des puces Area/Floor pour de meilleures performances et une interface plus épurée


### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] Tester CameraPopup dans les vues agrégées - Cliquer sur les entités caméra dans les badges area/floor et vérifier que le flux en direct s'affiche correctement
- [ ] Tester TagsView et TagsChip - Créer, modifier et filtrer les entités en utilisant les étiquettes Home Assistant
- [ ] Vérifier que les popups de badges affichent les bonnes informations d'entité dans AreaView et FloorView
- [ ] Tester la navigation et l'affichage du statut amélioré des popups agrégés
- [ ] Vérifier les performances globales et la réactivité du tableau de bord

**Problèmes connus :**
- Aucun actuellement


---

## 📦 Installation

**Via HACS (Recommended):**
1. Open HACS → Integrations
2. Search for "Linus Dashboard"
3. Click Update
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

---

## 📊 Technical Details

### All Commits
- fix(ci): skip release workflow for prereleases created via GitHub UI (22e1d08)
- feat: add CameraPopup with live camera feed in aggregate popups (2e71248)
- feat: add TagsView and TagsChip for Home Assistant labels management (b2a3488)

### Contributors
- @Juicy

