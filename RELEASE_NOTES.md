# 🎉 Release Notes - v1.4.0-beta.3

---

## 🇬🇧 English

### ✨ New Features

**None in this beta** - This release focuses primarily on critical bug fixes and stability improvements.

### 🐛 Bug Fixes

- **Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts**
  Fixed a critical issue where duplicate custom element registrations could cause dashboard loading failures. The system now automatically detects and cleans up duplicate resource versions to ensure smooth operation.

- **Eliminate blocking I/O operations in async event loop**
  Resolved performance issues caused by blocking I/O operations in the async event loop. This fix improves dashboard responsiveness and prevents UI freezing.

- **Modernize linting configuration and resolve all CI errors**
  Updated the linting configuration to use modern standards and fixed all CI pipeline errors, ensuring code quality and consistency.

### ⚡ Improvements

- **Simplify release system and make CI checks blocking**
  Streamlined the release process and made CI checks mandatory to prevent releases with failing tests or linting errors.

- **Clean up scripts directory**
  Removed obsolete and redundant scripts to simplify maintenance and reduce confusion.

- **Enhanced HomeAreaCard icon color logic**
  Improved the icon color logic for HomeAreaCard and updated version mismatch notifications for better user experience.

- **Revert problematic dependency detection logic**
  Removed dependency detection logic that was preventing cards from loading properly in some configurations.

### 📝 Documentation

- **Add quick reference guide for new release system**
  Added comprehensive documentation for the new one-command release system to make it easier for contributors.

### 🧪 For Beta Testers

**What to test:**
- [ ] **Dashboard loading** - Verify that the dashboard loads correctly without CustomElementRegistry errors
- [ ] **Performance** - Check that the dashboard is responsive and doesn't freeze during normal use
- [ ] **Card rendering** - Ensure all cards (HomeAreaCard, etc.) render properly with correct icon colors
- [ ] **Resource loading** - Test that resources load correctly without duplicate registration issues

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

**Aucune dans cette beta** - Cette version se concentre principalement sur des corrections de bugs critiques et des améliorations de stabilité.

### 🐛 Corrections de bugs

- **Nettoyage automatique des versions de ressources dupliquées pour éviter les conflits CustomElementRegistry**
  Correction d'un problème critique où l'enregistrement d'éléments personnalisés dupliqués pouvait causer des échecs de chargement du tableau de bord. Le système détecte et nettoie maintenant automatiquement les versions de ressources dupliquées pour assurer un fonctionnement fluide.

- **Élimination des opérations d'E/S bloquantes dans la boucle d'événements asynchrone**
  Résolution des problèmes de performance causés par des opérations d'E/S bloquantes dans la boucle d'événements asynchrone. Cette correction améliore la réactivité du tableau de bord et empêche le gel de l'interface utilisateur.

- **Modernisation de la configuration de linting et résolution de toutes les erreurs CI**
  Mise à jour de la configuration de linting pour utiliser les standards modernes et correction de toutes les erreurs du pipeline CI, garantissant la qualité et la cohérence du code.

### ⚡ Améliorations

- **Simplification du système de release et validation des vérifications CI**
  Rationalisation du processus de release et mise en place de vérifications CI obligatoires pour empêcher les releases avec des tests échouants ou des erreurs de linting.

- **Nettoyage du répertoire scripts**
  Suppression des scripts obsolètes et redondants pour simplifier la maintenance et réduire la confusion.

- **Amélioration de la logique de couleur d'icône pour HomeAreaCard**
  Amélioration de la logique de couleur d'icône pour HomeAreaCard et mise à jour des notifications de non-concordance de version pour une meilleure expérience utilisateur.

- **Annulation de la logique de détection des dépendances problématique**
  Suppression de la logique de détection des dépendances qui empêchait le chargement correct des cartes dans certaines configurations.

### 📝 Documentation

- **Ajout d'un guide de référence rapide pour le nouveau système de release**
  Ajout d'une documentation complète pour le nouveau système de release en une commande afin de faciliter la contribution.

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] **Chargement du tableau de bord** - Vérifier que le tableau de bord se charge correctement sans erreurs CustomElementRegistry
- [ ] **Performance** - Vérifier que le tableau de bord est réactif et ne gèle pas pendant l'utilisation normale
- [ ] **Rendu des cartes** - S'assurer que toutes les cartes (HomeAreaCard, etc.) s'affichent correctement avec les bonnes couleurs d'icônes
- [ ] **Chargement des ressources** - Tester que les ressources se chargent correctement sans problèmes de duplication d'enregistrement

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

- fix: Automatically clean up duplicate resource versions to prevent CustomElementRegistry conflicts (724af3e)
- revert: Remove problematic dependency detection logic that prevented cards from loading (b845581)
- Enhance HomeAreaCard icon color logic and update version mismatch notification (42999cc)
- fix: eliminate blocking I/O operations in async event loop (b757bbc)
- fix: modernize linting configuration and resolve all CI errors (2f1f431)
- refactor: Simplify release system and make CI checks blocking (c463ac1)
- docs: Add quick reference guide for new release system (ce79af4)

### Contributors

- @Julien-Decoen
- @dependabot[bot]
- @github-actions[bot]
