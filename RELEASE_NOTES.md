# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

_No new features in this release_

## 🐛 Bug Fixes

- **Badge icon visibility** - Badge icons are now properly hidden when the count reaches zero, keeping your interface clean and preventing visual clutter from empty notification indicators.
- **Security view real-time updates** - The security view now uses Jinja2 templates for real-time state updates, ensuring that alarm status, door/window sensors, and security device states refresh instantly without manual page reloads.
- **Duplicate cover entities** - Fixed an issue where cover entities (blinds, shutters, garage doors) were appearing multiple times in chips and badges, which could cause confusion and layout issues.
- **UNDISCLOSED entity handling** - UNDISCLOSED entities are now properly filtered from global popups, and cover icon colors now display correctly with the appropriate state-based styling.
- **Floor-level aggregate chips** - Aggregate chips now correctly use floor scope instead of area scope, providing accurate summaries for multi-area floors and improving consistency in entity grouping.

## ⚡ Improvements

- **Performance optimization** - Deferred component preloading and parallelized embedded dashboard/resource registration significantly improve initial page load times and overall dashboard responsiveness, especially on systems with many custom cards or complex configurations.

<details>
<summary>🇫🇷 <b>Version française</b></summary>

- **Optimisation des performances** - Le préchargement différé des composants et la parallélisation du chargement des dashboards intégrés/ressources améliorent significativement les temps de chargement initial et la réactivité globale du tableau de bord, en particulier sur les systèmes avec de nombreuses cartes personnalisées ou des configurations complexes.

</details>

---

## 🧪 For Beta Testers

**What to test:**
- [ ] **Badge icons**: Verify that badge icons disappear when notification counts reach zero (test with notifications, updates, alerts)
- [ ] **Security view**: Check that alarm panels and security sensors update in real-time without page refresh
- [ ] **Cover entities**: Confirm that blinds, shutters, and garage doors appear only once in chips and badges (no duplicates)
- [ ] **Global popups**: Verify that UNDISCLOSED entities don't appear in popups and cover icons show correct colors
- [ ] **Floor aggregates**: Test that floor-level chips show correct entity counts across multiple areas

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] **Icônes de badge** : Vérifier que les icônes de badge disparaissent lorsque les compteurs de notification atteignent zéro (tester avec notifications, mises à jour, alertes)
- [ ] **Vue sécurité** : Vérifier que les panneaux d'alarme et capteurs de sécurité se mettent à jour en temps réel sans rechargement de page
- [ ] **Entités de couverture** : Confirmer que les stores, volets et portes de garage n'apparaissent qu'une seule fois dans les chips et badges (pas de doublons)
- [ ] **Popups globales** : Vérifier que les entités UNDISCLOSED n'apparaissent pas dans les popups et que les icônes de couverture affichent les bonnes couleurs
- [ ] **Agrégats d'étage** : Tester que les chips au niveau de l'étage affichent les bons nombres d'entités sur plusieurs zones

</details>

**Known Issues:**
- None currently

---

<details>
<summary>📊 <b>Technical Details</b></summary>

### Contributors
- @Juicy

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

