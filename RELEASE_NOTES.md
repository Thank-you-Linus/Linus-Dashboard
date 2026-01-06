# 🎉 Release Notes - v1.4.0-beta.9

## 🇬🇧 English

### ✨ New Features

**Claude Code Skills Integration**
- Added 7 comprehensive Claude Code skills for streamlined development workflow
- Skills include: release management (beta, stable, check, rollback), code review, debugging, and implementation
- Skills automatically trigger based on natural language requests
- Complete compatibility with existing OpenCode commands

**Enhanced NPM Scripts**
- Added 5 missing npm scripts for release management: `release:check`, `release:validate`, `release:changelog`, `release:notes`, `release:format-notes`
- All scripts now properly integrated with both Claude Code skills and OpenCode commands
- Improved developer experience with consistent tooling

### 🐛 Bug Fixes

**Version Consistency Check**
- Fixed `check-release-ready.sh` to correctly detect dynamic version in `const.py`
- Now properly validates `_get_version()` function that reads from `package.json`
- Eliminates false version mismatch errors during pre-release validation

**Code Formatting**
- Resolved Ruff formatting issues in Python codebase
- Removed deprecated linting rules
- Improved code quality and consistency

### ⚡ Improvements

**Light Chip Handling**
- Refactored light chip rendering for better performance
- Improved aggregate popup behavior for light controls
- Enhanced user experience when managing multiple lights

### 🧪 For Beta Testers

**What to test:**
- Test the new Claude Code skills by asking natural language questions (e.g., "verify release readiness", "review my code")
- Verify all npm release scripts work correctly: `npm run release:check`, `npm run release:validate`
- Check that light chips display and function properly in aggregate popups
- Confirm version consistency across all files (package.json, manifest.json, const.py)

**Known Issues:**
- None currently identified

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

**Intégration des Skills Claude Code**
- Ajout de 7 skills Claude Code complets pour un workflow de développement optimisé
- Skills inclus : gestion des releases (beta, stable, vérification, rollback), revue de code, débogage et implémentation
- Déclenchement automatique des skills basé sur des requêtes en langage naturel
- Compatibilité complète avec les commandes OpenCode existantes

**Scripts NPM Améliorés**
- Ajout de 5 scripts npm manquants pour la gestion des releases : `release:check`, `release:validate`, `release:changelog`, `release:notes`, `release:format-notes`
- Tous les scripts sont maintenant correctement intégrés avec les skills Claude Code et les commandes OpenCode
- Expérience développeur améliorée avec des outils cohérents

### 🐛 Corrections de bugs

**Vérification de Cohérence des Versions**
- Correction de `check-release-ready.sh` pour détecter correctement la version dynamique dans `const.py`
- Validation appropriée de la fonction `_get_version()` qui lit depuis `package.json`
- Élimine les fausses erreurs de désynchronisation de version pendant la validation pré-release

**Formatage du Code**
- Résolution des problèmes de formatage Ruff dans le code Python
- Suppression des règles de linting dépréciées
- Amélioration de la qualité et cohérence du code

### ⚡ Améliorations

**Gestion des Chips de Lumière**
- Refonte du rendu des chips de lumière pour de meilleures performances
- Amélioration du comportement des popups agrégées pour les contrôles de lumière
- Expérience utilisateur améliorée lors de la gestion de plusieurs lumières

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- Tester les nouveaux skills Claude Code en posant des questions en langage naturel (ex: "vérifie si prêt pour release", "revois mon code")
- Vérifier que tous les scripts npm de release fonctionnent correctement : `npm run release:check`, `npm run release:validate`
- Vérifier que les chips de lumière s'affichent et fonctionnent correctement dans les popups agrégées
- Confirmer la cohérence des versions dans tous les fichiers (package.json, manifest.json, const.py)

**Problèmes connus :**
- Aucun problème identifié actuellement
