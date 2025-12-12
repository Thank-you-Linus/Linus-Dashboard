# Guide de mise à jour de Home Assistant

Ce guide explique comment mettre à jour la version de Home Assistant utilisée dans Linus Dashboard.

## Vue d'ensemble

Le projet Linus Dashboard dépend de plusieurs packages issus du frontend Home Assistant. Lorsqu'une nouvelle version de Home Assistant est publiée, il est important de synchroniser les dépendances pour bénéficier des dernières fonctionnalités et corrections de bugs.

## Processus automatisé

### Prérequis

- Node.js installé
- Git configuré
- Accès au repository

### Utilisation du script

Le script `update-ha-version.sh` automatise l'ensemble du processus de mise à jour.

**Mode interactif (recommandé):**
```bash
# Lance le menu de sélection des versions
./scripts/update-ha-version.sh

# ou via npm
npm run update:ha
```

Le script détectera automatiquement votre version actuelle et affichera uniquement les versions **plus récentes** disponibles dans un format lisible (format des release notes HA).

**Mode direct:**
```bash
# Si vous connaissez déjà la version (format: YYYYMMDD.X)
./scripts/update-ha-version.sh 20241203.0

# ou via npm
npm run update:ha 20241203.0
```

### Ce que fait le script

1. **Détection de la version actuelle**
   - Lit la version de `home-assistant-js-websocket` dans votre `package.json`
   - Trouve la version frontend correspondante
   - Affiche votre version actuelle

2. **Filtrage des versions**
   - Récupère les releases depuis l'API GitHub
   - Affiche uniquement les versions **plus récentes** que la vôtre
   - Format lisible : `2025.12.2` (format des release notes)

3. **Validation de la version**
   - Vérifie que le format de version est valide (YYYYMMDD.X)
   - Vérifie que la version existe dans le repository Home Assistant

4. **Création d'une branche**
   - Crée automatiquement une branche `update/ha-YYYYMMDD.X`
   - Permet de travailler de manière isolée

5. **Récupération du package.json HA**
   - Télécharge le `package.json` de la version spécifiée depuis le repository Home Assistant frontend
   - Valide que le fichier est accessible

6. **Synchronisation des dépendances**
   - Met à jour automatiquement les packages suivants:
     - `home-assistant-js-websocket`
     - `superstruct`
     - `core-js`
     - `typescript`
     - Packages Babel (`@babel/*`)
     - `babel-loader`
     - `ts-loader`
     - Packages ESLint (`eslint`, `eslint-*`)
     - Packages TypeScript ESLint (`@typescript-eslint/*`)

7. **Installation des dépendances**
   - Exécute `npm install` pour installer les nouvelles versions
   - Met à jour `package-lock.json`

8. **Mise à jour de requirements.txt**
   - Convertit la version frontend (YYYYMMDD.X) vers la version Core (YYYY.M.P)
   - Met à jour automatiquement `homeassistant==X.Y.Z` dans requirements.txt

9. **Réinstallation des dépendances Python**
   - Propose d'exécuter `./scripts/setup` pour réinstaller l'environnement Python
   - Permet de débugger avec la nouvelle version de Home Assistant

10. **Vérification**
   - Exécute `npm run type-check` pour vérifier la compatibilité TypeScript
   - Exécute `npm run build` pour vérifier que le build fonctionne

### Exemple de sortie

**Mode interactif:**

```
========================================
Mise à jour de Home Assistant - Sélection de version
========================================

ℹ️  Recherche de la version frontend correspondante...
✅ Version actuelle détectée: 2025.11.1 (20251105.1)

========================================
Récupération des dernières versions Home Assistant
========================================

ℹ️  Interrogation de l'API GitHub...
✅ 6 version(s) plus récente(s) disponible(s)

========================================
Sélection de la version
========================================

Version actuelle: home-assistant-js-websocket 9.5.0

Versions disponibles:

   1) 2025.12.2 (20251203.2)
   2) 2025.12.1 (20251203.1)
   3) 2025.12.0 (20251203.0)
   4) 2025.12.0 (20251201.0)
   5) 2025.11.0 (20251127.0)
   6) 2025.11.0 (20251126.0)

   q) Quitter

Choisissez une version (1-6) ou 'q' pour quitter: 1

✅ Version sélectionnée: 2025.12.2 (20251203.2)

Confirmer la mise à jour vers 2025.12.2 ? (Y/n): y

========================================
Mise à jour vers Home Assistant 20251203.2
========================================

ℹ️  Création de la branche: update/ha-2024.12.0
✅ Branche créée/activée: update/ha-2024.12.0

========================================
Étape 1/4: Récupération du package.json HA
========================================

ℹ️  URL: https://raw.githubusercontent.com/home-assistant/frontend/2024.12.0/package.json
✅ Package.json HA récupéré avec succès
ℹ️  Version du package HA frontend: 20241212.0

========================================
Étape 2/4: Synchronisation des dépendances
========================================

ℹ️  Analyse des dépendances à mettre à jour...

📦 5 package(s) mis à jour:

   home-assistant-js-websocket
   9.5.0 → 9.6.0 [devDependencies]

   typescript
   5.9.2 → 5.10.0 [devDependencies]

   ...

✅ Dépendances synchronisées

========================================
Étape 3/6: Installation des dépendances
========================================

ℹ️  Exécution de npm install...
✅ Dépendances installées

========================================
Étape 4/6: Mise à jour de requirements.txt
========================================

ℹ️  Conversion de la version frontend vers version Core...
ℹ️  Version Core correspondante: 2024.12.0
✅ requirements.txt mis à jour: 2024.10.1 → 2024.12.0

========================================
Étape 5/6: Réinstallation des dépendances Python
========================================

ℹ️  Voulez-vous réinstaller les dépendances Python maintenant ?
Réinstaller avec ./scripts/setup ? (y/N): y

ℹ️  Exécution de ./scripts/setup...
✅ Dépendances Python réinstallées

========================================
Étape 6/6: Vérification
========================================

ℹ️  Vérification du type checking...
✅ Type checking réussi
ℹ️  Vérification du build...
✅ Build réussi

========================================
Résumé de la mise à jour
========================================

✅ Version HA frontend cible: 20241212.0
✅ Version HA core cible: 2024.12.0
✅ Branche: update/ha-2024.12.0
ℹ️  Fichiers modifiés:
ℹ️    - package.json
ℹ️    - package-lock.json
ℹ️    - requirements.txt

ℹ️  Prochaines étapes:
  1. Vérifiez les changements: git diff
  2. Testez l'application: npm run build
  3. Committez les changements: git add package.json package-lock.json requirements.txt && git commit -m 'chore: update to Home Assistant 20241212.0'
  4. Poussez la branche: git push -u origin update/ha-2024.12.0
  5. Créez une pull request

✅ Mise à jour terminée avec succès! 🎉
```

## Utilisation via npm

Vous pouvez utiliser la commande npm:

```bash
# Mode interactif (affiche le menu)
npm run update:ha

# Mode direct avec version spécifiée (format YYYYMMDD.X)
npm run update:ha 20241203.0
```

## Format de version

Les versions de Home Assistant frontend utilisent le format `YYYYMMDD.X` où :
- `YYYYMMDD` = date de release (année/mois/jour)
- `X` = numéro de patch (0, 1, 2...)

Exemples techniques : `20251203.0`, `20251203.1`, `20251203.2`

Le script affiche les versions au format des release notes HA :
- `2025.12.0` = première release de décembre 2025
- `2025.12.1` = première correction (patch 1)
- `2025.12.2` = deuxième correction (patch 2)

## Avantages du mode interactif

- ✅ **Détection automatique** de votre version actuelle
- ✅ Affiche **uniquement les versions plus récentes**
- ✅ Format lisible : `2025.12.2` (format des release notes HA)
- ✅ Affiche aussi le format technique entre parenthèses
- ✅ Pas besoin de chercher manuellement les versions
- ✅ Évite les erreurs de frappe
- ✅ Gain de temps considérable

## Processus manuel (alternative)

Si vous préférez faire la mise à jour manuellement:

### 1. Identifier la version Home Assistant

Consultez les releases: https://github.com/home-assistant/frontend/releases

### 2. Analyser les différences

Utilisez le script d'analyse des dépendances:

```bash
node scripts/sync-dependencies.js
```

Ce script compare vos dépendances avec celles de Home Assistant et affiche:
- Les packages à mettre à jour
- Les nouveaux packages recommandés
- Vos packages spécifiques

### 3. Mettre à jour package.json

Modifiez manuellement les versions dans `package.json` en vous basant sur le `package.json` de Home Assistant frontend.

### 4. Installer les dépendances

```bash
npm install
```

### 5. Vérifier la compatibilité

```bash
npm run type-check
npm run build
```

## Gestion des problèmes

### Erreurs de type checking

Si `npm run type-check` échoue après la mise à jour:

1. Vérifiez les changements dans les types TypeScript
2. Consultez les breaking changes de la version HA
3. Ajustez votre code en conséquence

### Erreurs de build

Si le build échoue:

1. Vérifiez la configuration rspack/webpack
2. Consultez les changements dans les loaders
3. Vérifiez les dépendances peer

### Rollback

Si vous devez annuler la mise à jour:

```bash
git checkout main
git branch -D update/ha-X.Y.Z
```

Si vous avez déjà commité:

```bash
git revert <commit-hash>
```

## Packages ignorés

Les packages suivants ne sont **pas** synchronisés avec Home Assistant car ils sont spécifiques à Linus Dashboard:

- `@rspack/cli`, `@rspack/core`, `@rspack/dev-server` (build tools)
- `version-bump-prompt` (release management)
- `ignore-loader` (configuration spécifique)
- `concurrently`, `rimraf` (scripts utilitaires)

## Vérification post-mise à jour

Après la mise à jour, vérifiez:

1. ✅ Le type checking passe: `npm run type-check`
2. ✅ Le build fonctionne: `npm run build`
3. ✅ Le linter passe: `npm run lint:check`
4. ✅ L'application démarre: tester dans Home Assistant
5. ✅ Les fonctionnalités principales fonctionnent

## Fréquence des mises à jour

Il est recommandé de mettre à jour:
- À chaque version majeure de Home Assistant (ex: 2024.12.0 → 2025.1.0)
- Pour les corrections de sécurité critiques
- Lorsque de nouvelles fonctionnalités HA sont nécessaires

## Ressources

- [Home Assistant Frontend Releases](https://github.com/home-assistant/frontend/releases)
- [Home Assistant Release Notes](https://www.home-assistant.io/blog/categories/release-notes/)
- [Breaking Changes](https://www.home-assistant.io/blog/categories/breaking-changes/)

## Support

En cas de problème lors de la mise à jour:

1. Consultez les [issues GitHub](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)
2. Vérifiez les discussions sur Discord
3. Créez une issue si le problème persiste
