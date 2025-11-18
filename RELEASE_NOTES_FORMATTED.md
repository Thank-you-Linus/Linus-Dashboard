# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

- **Full support for embedding external Lovelace dashboards** directly within Linus Dashboard
- **Admin-restricted panel visibility** matching Home Assistant's native dashboard behavior

<details>
<summary>📖 <b>View detailed descriptions / Voir les descriptions détaillées</b></summary>

### 🇬🇧 English


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


### 🇫🇷 Français


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


</details>

## 🐛 Bug Fixes

_No bug fixes in this release_

## ⚡ Improvements

- Improved performance when loading embedded dashboards
- Better error handling for missing or invalid dashboard configurations
- Enhanced documentation for new features

<details>
<summary>🇫🇷 <b>Version française</b></summary>

- Performance améliorée lors du chargement des dashboards embarqués
- Meilleure gestion des erreurs pour les configurations de dashboard manquantes ou invalides
- Documentation enrichie pour les nouvelles fonctionnalités

</details>

---

## 🧪 For Beta Testers

**What to test:**
- [ ] Test the embedded dashboard feature with different Lovelace dashboards
- [ ] Verify that external dashboards load correctly and display properly
- [ ] Test admin-only panel visibility with admin and non-admin users
- [ ] Verify that panels configured as admin-only are hidden from regular users
- [ ] Confirm that admin users can see all panels including admin-restricted ones

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] Tester la fonctionnalité de dashboard embarqué avec différents dashboards Lovelace
- [ ] Vérifier que les dashboards externes se chargent correctement et s'affichent proprement
- [ ] Tester la visibilité des panneaux admin-only avec des utilisateurs admin et non-admin
- [ ] Vérifier que les panneaux configurés comme admin-only sont cachés des utilisateurs réguliers
- [ ] Confirmer que les utilisateurs admin peuvent voir tous les panneaux y compris ceux restreints

</details>

**Known Issues:**
- Some custom cards in embedded dashboards may require page refresh
- Admin-only visibility requires proper user role configuration in Home Assistant

---

<details>
<summary>📊 <b>Technical Details</b></summary>


### All Commits

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

