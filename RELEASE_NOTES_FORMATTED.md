# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

- **Smart version management with package.json as single source of truth**

<details>
<summary>📖 <b>View detailed descriptions / Voir les descriptions détaillées</b></summary>

### 🇬🇧 English


- **Smart version management with package.json as single source of truth**
  Implemented a centralized version management system that uses `package.json` as the single source of truth for all version numbers across the project. This eliminates version inconsistencies and simplifies the release process by automatically syncing versions across Python manifest, TypeScript, and build files. The new system ensures all components always reference the same version, reducing deployment errors and maintenance overhead.


### 🇫🇷 Français


- **Gestion intelligente des versions avec package.json comme source unique de vérité**
  Mise en place d'un système centralisé de gestion des versions qui utilise `package.json` comme source unique de vérité pour tous les numéros de version du projet. Cela élimine les incohérences de version et simplifie le processus de publication en synchronisant automatiquement les versions à travers le manifeste Python, TypeScript et les fichiers de build. Le nouveau système garantit que tous les composants référencent toujours la même version, réduisant les erreurs de déploiement et la charge de maintenance.


</details>

## 🐛 Bug Fixes

- **Fixed version consistency check to use proper Python import mechanism**
- **Enforced linting rule for __VERSION__ naming convention**

## ⚡ Improvements

_No improvements in this release_

---

## 🧪 For Beta Testers

**What to test:**
- [ ] **Version consistency** - Verify that all version numbers displayed in the dashboard UI, logs, and manifest match the beta version
- [ ] **Dashboard loading** - Ensure the dashboard loads correctly without version-related errors in browser console
- [ ] **Update process** - Test updating from beta.3 to beta.4 through HACS or manual installation
- [ ] **Build integrity** - Check that all custom cards and components load properly with the new version system

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] **Cohérence des versions** - Vérifier que tous les numéros de version affichés dans l'interface du tableau de bord, les logs et le manifeste correspondent à la version beta
- [ ] **Chargement du tableau de bord** - S'assurer que le tableau de bord se charge correctement sans erreurs liées aux versions dans la console du navigateur
- [ ] **Processus de mise à jour** - Tester la mise à jour de la beta.3 vers la beta.4 via HACS ou installation manuelle
- [ ] **Intégrité du build** - Vérifier que toutes les cartes personnalisées et composants se chargent correctement avec le nouveau système de version

</details>

**Known Issues:**
- None currently
   - Clear description of the problem
   - Steps to reproduce
   - Your Home Assistant version
   - Browser console errors (if any)
---
- **Gestion intelligente des versions avec package.json comme source unique de vérité**
- **Correction de la vérification de cohérence des versions pour utiliser le mécanisme d'import Python approprié**
- **Application de la règle de linting pour la convention de nommage __VERSION__**
- [ ] **Cohérence des versions** - Vérifier que tous les numéros de version affichés dans l'interface du tableau de bord, les logs et le manifeste correspondent à la version beta
- [ ] **Chargement du tableau de bord** - S'assurer que le tableau de bord se charge correctement sans erreurs liées aux versions dans la console du navigateur
- [ ] **Processus de mise à jour** - Tester la mise à jour de la beta.3 vers la beta.4 via HACS ou installation manuelle
- [ ] **Intégrité du build** - Vérifier que toutes les cartes personnalisées et composants se chargent correctement avec le nouveau système de version
- Aucun actuellement
   - Description claire du problème
   - Étapes pour reproduire
   - Votre version de Home Assistant
   - Erreurs de la console du navigateur (le cas échéant)
---
- feat: Implement smart version management with package.json as single source of truth (7b7b455)
- fix: Update version consistency check to use Python import for CONST_VERSION (ad50dd6)
- fix: Add eslint-disable for __VERSION__ naming convention and enforce linting rule (1b0e73c)
- @github-actions[bot]
- @Julien-Decoen

---

<details>
<summary>📊 <b>Technical Details</b></summary>


### Key Commits

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

