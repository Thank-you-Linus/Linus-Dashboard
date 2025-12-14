# 🧪 Beta Release

> **This is a pre-release version for testing.**  
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## ✨ What's New

_No new features in this release_

## 🐛 Bug Fixes

- **Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts**
- **Eliminate blocking I/O operations in async event loop**
- **Modernize linting configuration and resolve all CI errors**

## ⚡ Improvements

- **Simplify release system and make CI checks blocking**
- **Clean up scripts directory**
- **Enhanced HomeAreaCard icon color logic**

<details>
<summary>🇫🇷 <b>Version française</b></summary>

- **Simplification du système de release et validation des vérifications CI**
- **Nettoyage du répertoire scripts**
- **Amélioration de la logique de couleur d'icône pour HomeAreaCard**

</details>

---

## 🧪 For Beta Testers

**What to test:**
- [ ] **Dashboard loading** - Verify that the dashboard loads correctly without CustomElementRegistry errors
- [ ] **Performance** - Check that the dashboard is responsive and doesn't freeze during normal use
- [ ] **Card rendering** - Ensure all cards (HomeAreaCard, etc.) render properly with correct icon colors
- [ ] **Resource loading** - Test that resources load correctly without duplicate registration issues

<details>
<summary>🇫🇷 <b>Quoi tester</b></summary>

- [ ] **Chargement du tableau de bord** - Vérifier que le tableau de bord se charge correctement sans erreurs CustomElementRegistry
- [ ] **Performance** - Vérifier que le tableau de bord est réactif et ne gèle pas pendant l'utilisation normale
- [ ] **Rendu des cartes** - S'assurer que toutes les cartes (HomeAreaCard, etc.) s'affichent correctement avec les bonnes couleurs d'icônes
- [ ] **Chargement des ressources** - Tester que les ressources se chargent correctement sans problèmes de duplication d'enregistrement

</details>

**Known Issues:**
- None currently
   - Clear description of the problem
   - Steps to reproduce
   - Your Home Assistant version
   - Browser console errors (if any)
---
- **Nettoyage automatique des versions de ressources dupliquées pour éviter les conflits CustomElementRegistry**
- **Élimination des opérations d'E/S bloquantes dans la boucle d'événements asynchrone**
- **Modernisation de la configuration de linting et résolution de toutes les erreurs CI**
- **Simplification du système de release et validation des vérifications CI**
- **Nettoyage du répertoire scripts**
- **Amélioration de la logique de couleur d'icône pour HomeAreaCard**
- **Annulation de la logique de détection des dépendances problématique**
- **Ajout d'un guide de référence rapide pour le nouveau système de release**
- [ ] **Chargement du tableau de bord** - Vérifier que le tableau de bord se charge correctement sans erreurs CustomElementRegistry
- [ ] **Performance** - Vérifier que le tableau de bord est réactif et ne gèle pas pendant l'utilisation normale
- [ ] **Rendu des cartes** - S'assurer que toutes les cartes (HomeAreaCard, etc.) s'affichent correctement avec les bonnes couleurs d'icônes
- [ ] **Chargement des ressources** - Tester que les ressources se chargent correctement sans problèmes de duplication d'enregistrement
- Aucun actuellement
   - Description claire du problème
   - Étapes pour reproduire
   - Votre version de Home Assistant
   - Erreurs de la console du navigateur (le cas échéant)
---
- fix: Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts (724af3e)
- revert: Remove problematic dependency detection logic that prevented cards from loading (b845581)
- Enhance HomeAreaCard icon color logic and update version mismatch notification (42999cc)
- fix: eliminate blocking I/O operations in async event loop (b757bbc)
- fix: modernize linting configuration and resolve all CI errors (2f1f431)
- refactor: Simplify release system and make CI checks blocking (c463ac1)
- docs: Add quick reference guide for new release system (ce79af4)
- @Julien-Decoen
- @dependabot[bot]
- @github-actions[bot]

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

