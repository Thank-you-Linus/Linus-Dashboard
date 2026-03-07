# 🎉 Release Notes - 1.5.1-beta.1

---

## 🇬🇧 English

### ✨ New Features

_No new features in this patch release._

### 🐛 Bug Fixes

- **Areas and floors now respect HA user-defined order** — The dashboard now correctly preserves the order you have configured for areas and floors in Home Assistant. Previously the order could differ from what was set in HA settings, causing confusion when navigating rooms. (#120)
- **Bundled libraries updated and custom-elements-guard added** — Internal dependencies have been refreshed to their latest versions. A `custom-elements-guard` has been introduced to prevent conflicts when multiple custom elements are registered, improving compatibility with other HACS integrations.

### 🧪 For Beta Testers

**What to test:**
- [ ] Verify that areas and floors appear in the same order as configured in HA Settings → Areas & Zones
- [ ] Install alongside another HACS frontend integration and verify no custom element conflicts occur
- [ ] Reload the dashboard after changing area/floor order in HA and confirm the new order is reflected immediately

**Known Issues:**
- None currently

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

_Aucune nouvelle fonctionnalité dans cette version patch._

### 🐛 Corrections de bugs

- **L'ordre des pièces et étages défini dans HA est maintenant respecté** — Le tableau de bord préserve désormais correctement l'ordre que vous avez configuré pour les pièces et les étages dans Home Assistant. Auparavant, cet ordre pouvait différer de celui défini dans les paramètres HA, causant de la confusion lors de la navigation entre les pièces. (#120)
- **Bibliothèques intégrées mises à jour et ajout du custom-elements-guard** — Les dépendances internes ont été actualisées vers leurs dernières versions. Un `custom-elements-guard` a été introduit pour éviter les conflits lors de l'enregistrement de plusieurs éléments personnalisés, améliorant la compatibilité avec d'autres intégrations HACS.

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] Vérifier que les pièces et étages apparaissent dans le même ordre que celui configuré dans Paramètres HA → Zones & Pièces
- [ ] Installer en parallèle avec une autre intégration HACS frontend et vérifier qu'aucun conflit d'éléments personnalisés ne se produit
- [ ] Recharger le tableau de bord après avoir modifié l'ordre des pièces/étages dans HA et confirmer que le nouvel ordre est immédiatement pris en compte

**Problèmes connus :**
- Aucun actuellement

---

## 📊 Technical Details

### All Commits

- fix: preserve HA user-defined order for areas and floors (#120) (4a52bf8)
- fix(deps): update bundled libs and add custom-elements-guard (a4dbfbf)

### Contributors

- @Juicy
