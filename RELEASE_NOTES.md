# 🎉 Beta Release 1.4.3-beta.1

This incremental beta release focuses on UX improvements and code organization for better maintainability.

---

## 🇬🇧 English

### ✨ New Features

_No new features in this release_

### 🐛 Bug Fixes

- **Badge scope correction in Area and Floor views** - Fixed incorrect badge scoping that was causing inconsistent status displays in AreaView and FloorView. Badges now correctly reflect the status of entities within their designated scope, ensuring accurate at-a-glance information.

### ⚡ Improvements

- **Enhanced aggregate popup UX** - Redesigned the aggregate popup interface with a cleaner status display, making it easier to understand entity states at a glance. The new layout reduces visual clutter and improves readability.

- **Optimized sensor organization** - Reorganized sensor constants for better code maintainability and reduced the number of Area/Floor chips displayed, focusing on the most relevant information to avoid overwhelming users.

- **Improved SecurityView layout** - Refined the SecurityView interface by removing the redundant stats card and optimizing the layout for better visual hierarchy and usability.

### 🧪 For Beta Testers

**What to test:**
- [ ] Verify badge displays correctly show entity status in Area and Floor views
- [ ] Test the aggregate popup to ensure status information is clear and accurate
- [ ] Check that Area/Floor chips display the right amount of information (not too many)
- [ ] Review the SecurityView layout and confirm it's more intuitive
- [ ] Ensure no visual regressions in entity status indicators

**Known Issues:**
- None currently

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

_Aucune nouvelle fonctionnalité dans cette version_

### 🐛 Corrections de bugs

- **Correction de la portée des badges dans les vues Zone et Étage** - Correction d'une erreur de portée des badges qui causait des affichages d'état incohérents dans AreaView et FloorView. Les badges reflètent maintenant correctement l'état des entités dans leur portée désignée, garantissant des informations précises en un coup d'œil.

### ⚡ Améliorations

- **Interface popup agrégée améliorée** - Refonte de l'interface du popup agrégé avec un affichage d'état plus épuré, facilitant la compréhension des états d'entités en un coup d'œil. La nouvelle disposition réduit l'encombrement visuel et améliore la lisibilité.

- **Organisation des capteurs optimisée** - Réorganisation des constantes de capteurs pour une meilleure maintenabilité du code et réduction du nombre de puces Zone/Étage affichées, en se concentrant sur les informations les plus pertinentes pour éviter de submerger les utilisateurs.

- **Mise en page SecurityView améliorée** - Amélioration de l'interface SecurityView en supprimant la carte de statistiques redondante et en optimisant la mise en page pour une meilleure hiérarchie visuelle et utilisabilité.

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] Vérifier que les badges affichent correctement l'état des entités dans les vues Zone et Étage
- [ ] Tester le popup agrégé pour s'assurer que les informations d'état sont claires et précises
- [ ] Vérifier que les puces Zone/Étage affichent la bonne quantité d'informations (pas trop)
- [ ] Examiner la mise en page SecurityView et confirmer qu'elle est plus intuitive
- [ ] S'assurer qu'il n'y a pas de régressions visuelles dans les indicateurs d'état des entités

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
- refactor: improve aggregate popup UX with cleaner status display (1994f36)
- refactor: organize sensor constants and reduce Area/Floor chips (66e3e1a)
- fix: use correct scope for badges in AreaView and FloorView (1e4c532)
- refactor: improve SecurityView layout and remove stats card (0bfb5b0)

### Contributors
- @Juicy
