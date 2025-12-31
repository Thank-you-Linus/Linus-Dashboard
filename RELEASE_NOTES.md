# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

_No new features in this release_

## 🐛 Bug Fixes

- **Domain handling and type safety** - Improved entity domain extraction with null checks to prevent runtime errors. Refactored the RegistryManager to build domain mappings more efficiently, ensuring proper entity grouping by domain and device class. This fix enhances stability when processing entities with missing or malformed domain information

## ⚡ Improvements

_No improvements in this release_

---

## 🧪 For Beta Testers

**What to test:**
- [ ] Verify that all entities display correctly in area views
- [ ] Test entity filtering and grouping by domain and device class
- [ ] Check that dashboard loads without console errors related to entity domains
- [ ] Ensure aggregate views properly group entities
- [ ] Test with entities that have unusual or missing domain information

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] Vérifier que toutes les entités s'affichent correctement dans les vues de zone
- [ ] Tester le filtrage et le regroupement des entités par domaine et classe de dispositif
- [ ] Vérifier que le tableau de bord se charge sans erreurs de console liées aux domaines d'entités
- [ ] S'assurer que les vues agrégées regroupent correctement les entités
- [ ] Tester avec des entités ayant des informations de domaine inhabituelles ou manquantes

</details>

**Known Issues:**
- _None currently_

---

<details>
<summary>📊 <b>Technical Details</b></summary>

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

