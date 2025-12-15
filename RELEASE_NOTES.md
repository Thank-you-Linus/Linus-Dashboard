# 🎉 Release Notes - v1.4.0-beta.4

---

## 🇬🇧 English

### ✨ New Features

- **Smart version management with package.json as single source of truth**
  Implemented a centralized version management system that uses `package.json` as the single source of truth for all version numbers across the project. This eliminates version inconsistencies and simplifies the release process by automatically syncing versions across Python manifest, TypeScript, and build files. The new system ensures all components always reference the same version, reducing deployment errors and maintenance overhead.

### 🐛 Bug Fixes

- **Fixed version consistency check to use proper Python import mechanism**
  Resolved an issue where the version consistency checker wasn't properly reading the version from Python's `const.py` file. The fix now uses Python's import system to read the `CONST_VERSION` variable, ensuring accurate version validation across all project files.

- **Enforced linting rule for __VERSION__ naming convention**
  Added an ESLint disable directive for the `__VERSION__` constant to comply with naming conventions while maintaining code quality. This fix ensures the linter doesn't incorrectly flag the version constant, which uses a special naming convention recognized by the build system.

### 🧪 For Beta Testers

**What to test:**
- [ ] **Version consistency** - Verify that all version numbers displayed in the dashboard UI, logs, and manifest match the beta version
- [ ] **Dashboard loading** - Ensure the dashboard loads correctly without version-related errors in browser console
- [ ] **Update process** - Test updating from beta.3 to beta.4 through HACS or manual installation
- [ ] **Build integrity** - Check that all custom cards and components load properly with the new version system

**Known Issues:**
- None currently

**How to report issues:**
1. Check if the issue already exists in [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)
2. If not, create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Your Home Assistant version
   - Browser console errors (if any)

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **Gestion intelligente des versions avec package.json comme source unique de vérité**
  Mise en place d'un système centralisé de gestion des versions qui utilise `package.json` comme source unique de vérité pour tous les numéros de version du projet. Cela élimine les incohérences de version et simplifie le processus de publication en synchronisant automatiquement les versions à travers le manifeste Python, TypeScript et les fichiers de build. Le nouveau système garantit que tous les composants référencent toujours la même version, réduisant les erreurs de déploiement et la charge de maintenance.

### 🐛 Corrections de bugs

- **Correction de la vérification de cohérence des versions pour utiliser le mécanisme d'import Python approprié**
  Résolution d'un problème où le vérificateur de cohérence des versions ne lisait pas correctement la version depuis le fichier `const.py` Python. La correction utilise maintenant le système d'import de Python pour lire la variable `CONST_VERSION`, assurant une validation précise des versions à travers tous les fichiers du projet.

- **Application de la règle de linting pour la convention de nommage __VERSION__**
  Ajout d'une directive ESLint disable pour la constante `__VERSION__` afin de respecter les conventions de nommage tout en maintenant la qualité du code. Cette correction assure que le linter ne signale pas incorrectement la constante de version, qui utilise une convention de nommage spéciale reconnue par le système de build.

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] **Cohérence des versions** - Vérifier que tous les numéros de version affichés dans l'interface du tableau de bord, les logs et le manifeste correspondent à la version beta
- [ ] **Chargement du tableau de bord** - S'assurer que le tableau de bord se charge correctement sans erreurs liées aux versions dans la console du navigateur
- [ ] **Processus de mise à jour** - Tester la mise à jour de la beta.3 vers la beta.4 via HACS ou installation manuelle
- [ ] **Intégrité du build** - Vérifier que toutes les cartes personnalisées et composants se chargent correctement avec le nouveau système de version

**Problèmes connus :**
- Aucun actuellement

**Comment signaler des problèmes :**
1. Vérifier si le problème existe déjà dans [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)
2. Si non, créer un nouveau ticket avec :
   - Description claire du problème
   - Étapes pour reproduire
   - Votre version de Home Assistant
   - Erreurs de la console du navigateur (le cas échéant)

---

## 📊 Technical Details

### Key Commits

- feat: Implement smart version management with package.json as single source of truth (7b7b455)
- fix: Update version consistency check to use Python import for CONST_VERSION (ad50dd6)
- fix: Add eslint-disable for __VERSION__ naming convention and enforce linting rule (1b0e73c)

### Contributors

- @github-actions[bot]
- @Julien-Decoen

