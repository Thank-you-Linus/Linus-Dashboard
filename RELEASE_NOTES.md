# 🎉 Release Notes

> **Beta Release** - This version includes new features for testing before stable release.
> 
> **Version Beta** - Cette version inclut de nouvelles fonctionnalités à tester avant la sortie stable.

---

## 🇬🇧 English

### ✨ New Features

#### Embedded Dashboard Support
- **Full support for embedding external Lovelace dashboards** directly within Linus Dashboard
- Allows seamless integration of custom dashboards from other integrations
- Provides a unified user experience by consolidating multiple dashboards into one interface
- Compatible with all standard Home Assistant dashboard types

#### Admin-Only Panel Visibility
- **Admin-restricted panel visibility** matching Home Assistant's native dashboard behavior
- Configure panels to be visible only to administrator users
- Uses Home Assistant's built-in user roles and permissions system
- Perfect for debug information, system statistics, or administrative controls
- Works exactly like Home Assistant's dashboard visibility configuration

### 🐛 Bug Fixes

_No bug fixes in this release_

### ⚡ Improvements

- Improved performance when loading embedded dashboards
- Better error handling for missing or invalid dashboard configurations
- Enhanced documentation for new features

### 🧪 For Beta Testers

**What to test:**
- [ ] Test the embedded dashboard feature with different Lovelace dashboards
- [ ] Verify that external dashboards load correctly and display properly
- [ ] Test admin-only panel visibility with admin and non-admin users
- [ ] Verify that panels configured as admin-only are hidden from regular users
- [ ] Confirm that admin users can see all panels including admin-restricted ones
- [ ] Test with multiple embedded dashboards to verify performance
- [ ] Verify compatibility with Home Assistant 2024.11 and 2024.12
- [ ] Test on different browsers (Chrome, Firefox, Safari, Edge)
- [ ] Verify mobile responsiveness of embedded dashboards

**Known Issues:**
- Some custom cards in embedded dashboards may require page refresh
- Admin-only visibility requires proper user role configuration in Home Assistant

**How to Report Issues:**
Please report any issues on GitHub: https://github.com/Thank-you-Linus/Linus-Dashboard/issues

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

#### Support des Dashboards Embarqués
- **Support complet pour l'intégration de dashboards Lovelace externes** directement dans Linus Dashboard
- Permet l'intégration fluide de dashboards personnalisés provenant d'autres intégrations
- Offre une expérience utilisateur unifiée en consolidant plusieurs dashboards en une seule interface
- Compatible avec tous les types de dashboards standards de Home Assistant

#### Visibilité des Panneaux Restreinte aux Admins
- **Visibilité des panneaux réservée aux administrateurs** correspondant au comportement natif des dashboards Home Assistant
- Configurez les panneaux pour qu'ils soient visibles uniquement par les utilisateurs administrateurs
- Utilise le système de rôles et permissions intégré de Home Assistant
- Parfait pour les informations de debug, statistiques système ou contrôles administratifs
- Fonctionne exactement comme la configuration de visibilité des dashboards Home Assistant

### 🐛 Corrections de bugs

_Aucune correction de bug dans cette version_

### ⚡ Améliorations

- Performance améliorée lors du chargement des dashboards embarqués
- Meilleure gestion des erreurs pour les configurations de dashboard manquantes ou invalides
- Documentation enrichie pour les nouvelles fonctionnalités

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] Tester la fonctionnalité de dashboard embarqué avec différents dashboards Lovelace
- [ ] Vérifier que les dashboards externes se chargent correctement et s'affichent proprement
- [ ] Tester la visibilité des panneaux admin-only avec des utilisateurs admin et non-admin
- [ ] Vérifier que les panneaux configurés comme admin-only sont cachés des utilisateurs réguliers
- [ ] Confirmer que les utilisateurs admin peuvent voir tous les panneaux y compris ceux restreints
- [ ] Tester avec plusieurs dashboards embarqués pour vérifier les performances
- [ ] Vérifier la compatibilité avec Home Assistant 2024.11 et 2024.12
- [ ] Tester sur différents navigateurs (Chrome, Firefox, Safari, Edge)
- [ ] Vérifier la réactivité mobile des dashboards embarqués

**Problèmes connus :**
- Certaines cartes personnalisées dans les dashboards embarqués peuvent nécessiter un rafraîchissement de la page
- La visibilité admin-only nécessite une configuration appropriée des rôles utilisateurs dans Home Assistant

**Comment signaler des problèmes :**
Merci de signaler tout problème sur GitHub : https://github.com/Thank-you-Linus/Linus-Dashboard/issues

---

## 📊 Technical Details

### All Commits

- feat: Add comprehensive release management system (599f00f)
- feat: Add support for embedding external Lovelace dashboards (144c590)

### Contributors

- @Juicy

### Compatibility

- Home Assistant: 2024.11+
- Browsers: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
- Mobile: iOS 14+, Android 10+

### Installation

**Via HACS (Recommended):**
1. Open HACS → Integrations
2. Search for "Linus Dashboard"
3. Click Update (if already installed) or Install
4. Restart Home Assistant
5. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)

**Manual Installation:**
1. Download the release ZIP
2. Extract to `custom_components/linus_dashboard/`
3. Restart Home Assistant
4. Clear browser cache

### Configuration

**To configure admin-only panels:**
```yaml
# In your Home Assistant dashboard configuration
views:
  - title: Admin Panel
    visible:
      - user: admin_user_id
    # Your admin-specific cards here
```

This works seamlessly with Linus Dashboard's embedded dashboard feature.
