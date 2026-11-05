# 🚀 Release Commands - Linus Dashboard

Documentation complète des commandes de release intelligentes avec détection automatique de version.

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Commandes disponibles](#commandes-disponibles)
- [Workflow recommandé](#workflow-recommandé)
- [Détection intelligente de version](#détection-intelligente-de-version)
- [Exemples pratiques](#exemples-pratiques)
- [Dépannage](#dépannage)

---

## Vue d'ensemble

Le système de release de Linus Dashboard utilise l'IA pour analyser automatiquement les commits et suggérer le type de version approprié (patch/minor/major). Il s'adapte intelligemment selon le contexte :

- **Release beta incrémentale** → Auto-incrémente (beta.2 → beta.3)
- **Première beta après stable** → IA analyse les commits et suggère le type
- **Finalisation beta → stable** → Automatique, pas de validation
- **Release stable directe** → IA analyse + avertissement (recommande beta d'abord)

---

## Commandes disponibles

### `/release-beta`

Crée une pre-release beta pour les tests communautaires.

**Détection automatique :**
- Version actuelle stable (ex: `1.4.0`) → **Première beta** (IA analyse les commits)
- Version actuelle beta (ex: `1.4.0-beta.2`) → **Beta incrémentale** (auto-incrémente)

**Temps d'exécution :**
- Première beta : 5-10 min (avec analyse IA)
- Beta incrémentale : 3-5 min (pas d'analyse)

**Fichiers modifiés :**
- `package.json`, `package-lock.json`, `manifest.json`
- `RELEASE_NOTES.md` (généré et édité par IA)

**Validations automatiques :**
- Notes de release (format, sections, pas de TODO)
- Qualité du code (17 checks)
- Tests smoke (15 tests)

**Voir la documentation complète :** `.opencode/command/release-beta.md`

---

### `/release-stable`

Crée une release stable pour production.

**Détection automatique :**
- Version actuelle beta (ex: `1.5.0-beta.3`) → **Finalisation** (automatique)
- Version actuelle stable (ex: `1.4.0`) → **Release directe** (IA analyse + avertissement)

**Temps d'exécution :**
- Finalisation : 3-5 min (rapide, déjà testée)
- Release directe : 5-10 min (avec analyse IA et warning)

**Avertissements :**
- Release directe affiche un warning sur l'absence de tests beta
- Option de créer une beta à la place (recommandé)

**Validations automatiques :**
- Notes de release (format, sections, pas de section beta)
- Qualité du code (17 checks)
- Tests smoke (15 tests)

**Après publication :**
- Ouvrir les forums : `npm run forums:open`
- Poster les annonces (templates fournis)

**Voir la documentation complète :** `.opencode/command/release-stable.md`

---

### `/release-check`

Vérifie que tout est prêt pour une release (sans créer de release).

**Exécute :**
- 17 checks de qualité de code
- 15 tests smoke
- Validation des notes de release (si présentes)
- Vérification de la cohérence des versions

**Utilisation :**
```bash
/release-check
```

**Voir la documentation :** `.opencode/command/release-check.md`

---

### `/release-rollback`

Annule une release problématique et retourne à la version précédente.

**Utilisation :**
```bash
/release-rollback 1.5.0
```

**Actions effectuées :**
- Supprime le tag git
- Reset au commit précédent
- Supprime la release GitHub
- Nettoie les fichiers de release

**⚠️ Attention :** À utiliser seulement en cas de problème critique

**Voir la documentation :** `.opencode/command/release-rollback.md`

---

## Workflow recommandé

### Scénario 1 : Release normale (recommandé)

```
1.4.0 (stable)
  ↓ Développement de nouvelles fonctionnalités
  ↓
  ↓ /release-beta
  ↓ → IA analyse les commits
  ↓ → Suggère MINOR (1.5.0-beta.1)
  ↓ → Tu valides
  ↓
1.5.0-beta.1
  ↓ Tests communautaires (2-7 jours)
  ↓ Corrections de bugs trouvés
  ↓
  ↓ /release-beta
  ↓ → Détecte beta incrémentale
  ↓ → Auto-incrémente (pas de validation)
  ↓
1.5.0-beta.2
  ↓ Plus de tests
  ↓ Tout fonctionne bien
  ↓
  ↓ /release-stable
  ↓ → Détecte finalisation
  ↓ → Automatique (pas de validation)
  ↓
1.5.0 (stable)
  ↓ npm run forums:open
  ↓ Annonce publique
```

**Temps total :** 2-7 jours (incluant tests communautaires)

---

### Scénario 2 : Hotfix urgent

```
1.5.0 (stable)
  ↓ Bug critique découvert
  ↓ Correction immédiate
  ↓
  ↓ /release-stable
  ↓ → Détecte release directe
  ↓ → ⚠️ Avertit de l'absence de tests beta
  ↓ → IA suggère PATCH (1.5.1)
  ↓ → Tu confirmes (option [1])
  ↓
1.5.1 (stable)
  ↓ Déploiement immédiat
```

**⚠️ Note :** À utiliser seulement pour les correctifs critiques

---

## Détection intelligente de version

### Règles d'analyse IA

L'IA analyse les commits depuis le dernier tag et applique ces règles :

#### MAJOR (X.0.0) - Breaking Changes

**Déclencheurs :**
- Commits avec `BREAKING CHANGE:` dans le footer
- Type avec `!` après (ex: `feat!:`, `fix!:`)
- Changements incompatibles avec l'API existante
- Modifications du schéma de base de données
- Refactoring architectural majeur

**Exemple :**
```
feat!: Rewrite configuration system

BREAKING CHANGE: Old config format no longer supported.
Users must migrate to new YAML structure.
```

**Suggestion IA :** `2.0.0-beta.1` (MAJOR)

---

#### MINOR (X.Y.0) - Nouvelles fonctionnalités

**Déclencheurs :**
- Commits `feat:` (nouvelles fonctionnalités)
- Ajouts rétrocompatibles
- Nouveaux composants, vues, cartes
- Améliorations significatives

**Exemple :**
```
10 feat: Add climate view with HVAC controls
2 fix: Correct version consistency
0 BREAKING CHANGE
```

**Suggestion IA :** `1.5.0-beta.1` (MINOR)

---

#### PATCH (X.Y.Z) - Corrections seulement

**Déclencheurs :**
- Commits `fix:` uniquement
- Mises à jour de documentation (`docs:`)
- Petites améliorations/refactoring
- Mises à jour de traductions
- Mises à jour de dépendances

**Exemple :**
```
0 feat:
5 fix: Various bug fixes
0 BREAKING CHANGE
```

**Suggestion IA :** `1.4.1-beta.1` (PATCH)

---

#### AMBIGUOUS - Signaux mixtes

**Cas :**
- Mélange de signaux (ex: 5 feat + 1 BREAKING)
- Impact peu clair
- Doutes sur la classification

**Action :** L'IA demande à l'utilisateur de décider manuellement

**Exemple de prompt :**
```
⚠️ AMBIGUOUS COMMITS DETECTED

Analysis shows mixed signals:
- 5 feat: New features detected
- 1 BREAKING CHANGE: API modification
- 2 fix: Bug fixes

This could be either MINOR or MAJOR.

Please decide manually:
[1] MINOR - Breaking change is minor, keep 1.5.0
[2] MAJOR - Breaking change is significant, use 2.0.0
[3] CANCEL
```

---

## Exemples pratiques

### Exemple 1 : Première beta avec nouvelles fonctionnalités

**Contexte :**
- Version actuelle : `1.4.0`
- Commits depuis dernier tag : 10 feat, 2 fix

**Commande :**
```bash
/release-beta
```

**Processus :**
1. Détecte : Première beta après stable
2. Exécute : `npm run analyze:commits`
3. Analyse : 10 feat → Suggère MINOR
4. Présente :
   ```
   🎯 RELEASE PROPOSAL
   Current: 1.4.0
   Proposed: 1.5.0-beta.1
   Type: MINOR
   
   REASONING:
   ✓ 10 new features detected
   ✓ Backward compatible
   ✓ No breaking changes
   
   [1] APPROVE MINOR
   [2] DOWNGRADE TO PATCH
   [3] UPGRADE TO MAJOR
   [4] CANCEL
   ```
5. Tu choisis [1]
6. Crée `1.5.0-beta.1`

---

### Exemple 2 : Beta incrémentale (fixes)

**Contexte :**
- Version actuelle : `1.5.0-beta.1`
- Des bugs ont été trouvés et corrigés

**Commande :**
```bash
/release-beta
```

**Processus :**
1. Détecte : Beta incrémentale
2. Auto-incrémente : `1.5.0-beta.2`
3. Pas d'analyse, pas de validation
4. Génère notes, valide, publie
5. Temps : 3-5 min

---

### Exemple 3 : Finalisation beta → stable

**Contexte :**
- Version actuelle : `1.5.0-beta.3`
- Tests beta réussis, prêt pour production

**Commande :**
```bash
/release-stable
```

**Processus :**
1. Détecte : Finalisation beta
2. Retire `-beta.3` : `1.5.0`
3. Pas d'analyse, pas de validation
4. Message :
   ```
   🎉 FINALIZE BETA → STABLE
   Current: 1.5.0-beta.3
   Target: 1.5.0
   
   ✅ Proceeding automatically
   ```
5. Génère notes, valide, publie
6. Temps : 3-5 min

---

### Exemple 4 : Hotfix direct (non recommandé)

**Contexte :**
- Version actuelle : `1.5.0`
- Bug critique trouvé, besoin de correctif immédiat

**Commande :**
```bash
/release-stable
```

**Processus :**
1. Détecte : Release directe
2. **Avertissement :**
   ```
   ⚠️ DIRECT STABLE RELEASE
   
   You are creating a stable release without beta testing.
   
   RISKS:
   - No community feedback
   - Untested in real environments
   - Potential bugs reach production
   
   [1] YES - Continue (risky)
   [2] CREATE BETA INSTEAD - Safer
   [3] CANCEL
   ```
3. Tu choisis [1]
4. Exécute : `npm run analyze:commits`
5. Analyse : 5 fix → Suggère PATCH
6. Présente :
   ```
   🎯 RELEASE PROPOSAL
   Current: 1.5.0
   Proposed: 1.5.1
   Type: PATCH
   
   ⚠️ DIRECT RELEASE (SKIPPING BETA)
   
   [1] APPROVE PATCH
   [2] CREATE BETA INSTEAD
   [3] CANCEL
   ```
7. Tu choisis [1]
8. Crée `1.5.1` (stable)

---

## Dépannage

### Problème : "No commits found since last tag"

**Cause :** Aucun commit depuis le dernier tag

**Solution :**
```bash
# Vérifier les commits
git log $(git describe --tags --abbrev=0)..HEAD --oneline

# Si vide, créer des commits d'abord
```

---

### Problème : "Ambiguous commits detected"

**Cause :** Mélange de feat/fix/breaking, IA ne peut pas décider

**Solution :** L'IA te demande de choisir manuellement :
- Option [1] : PATCH
- Option [2] : MINOR  
- Option [3] : MAJOR
- Option [4] : CANCEL

---

### Problème : "Validation failed"

**Cause :** Les checks de qualité ont échoué

**Solutions :**
```bash
# Vérifier les erreurs
npm run lint:check
npm run type-check
npm run build

# Corriger les erreurs
npm run lint  # Auto-fix
npm run build

# Réessayer
/release-beta
```

---

### Problème : "Smoke tests failed"

**Cause :** Les tests smoke n'ont pas passé

**Solution :**
```bash
# Exécuter les tests manuellement
npm run test:smoke

# Corriger les tests qui échouent
# Réessayer
/release-beta
```

---

### Problème : Release créée par erreur

**Solution :**
```bash
# Annuler la release
/release-rollback 1.5.0

# Cela va :
# - Supprimer le tag
# - Reset au commit précédent  
# - Supprimer la release GitHub
```

---

## Scripts utilisés

### `scripts/analyze-commits.sh`

Analyse les commits depuis le dernier tag et retourne un JSON :

```bash
npm run analyze:commits
```

**Output :**
```json
{
  "status": "ok",
  "commits": {
    "total": 12,
    "breaking": 0,
    "feat": 10,
    "fix": 2,
    "refactor": 0,
    "chore": 0,
    "docs": 0
  },
  "commits_list": ["commit 1", "commit 2", ...],
  "last_tag": "1.4.0"
}
```

---

### `scripts/bump-version.sh`

Bumpe la version dans tous les fichiers avec support explicite des types :

**Usage :**
```bash
# Auto mode (incrémente selon la version actuelle)
bash scripts/bump-version.sh beta        # 1.4.0-beta.2 → 1.4.0-beta.3
bash scripts/bump-version.sh release     # 1.4.0-beta.3 → 1.4.0

# Explicit mode (pour IA)
bash scripts/bump-version.sh beta patch   # 1.4.0 → 1.4.1-beta.1
bash scripts/bump-version.sh beta minor   # 1.4.0 → 1.5.0-beta.1
bash scripts/bump-version.sh beta major   # 1.4.0 → 2.0.0-beta.1

bash scripts/bump-version.sh release patch # 1.4.0 → 1.4.1
bash scripts/bump-version.sh release minor # 1.4.0 → 1.5.0
bash scripts/bump-version.sh release major # 1.4.0 → 2.0.0
```

---

### `scripts/generate-release-notes.sh`

Génère les notes de release basées sur les commits :

```bash
bash scripts/generate-release-notes.sh
```

**Output :** `RELEASE_NOTES.md` (brouillon)

---

### `scripts/format-release-notes.sh`

Formate les notes de release (édite en place) :

```bash
bash scripts/format-release-notes.sh
```

**Modifications :** `RELEASE_NOTES.md` (formaté)

---

### `scripts/validate-release-notes.sh`

Valide le format des notes de release :

```bash
bash scripts/validate-release-notes.sh
```

**Checks :**
- Sections requises EN/FR présentes
- Pas de TODO
- Section beta testing remplie (pour beta)
- Format correct

---

### `scripts/check-release-ready.sh`

Exécute 17 checks de qualité :

```bash
bash scripts/check-release-ready.sh
```

**Checks :**
1. Git clean
2. Branch main
3. Up-to-date
4. Deps installed
5. Lint
6. Type-check
7. Build
8. Version consistency
9. No FIXME
10. CHANGELOG
11. manifest.json
12. hacs.json
13. No secrets
14. Python syntax
15. README
16. LICENSE
17. Smoke tests ready

---

## Logs

Chaque release est loggée dans :

```
.opencode/logs/release-beta-{timestamp}.log
.opencode/logs/release-stable-{timestamp}.log
```

**Contenu :**
- Timestamps
- Analyse de commits (si applicable)
- Raisonnement IA
- Décisions utilisateur
- Hashs git
- URLs
- Durée

---

## Commandes de développement

En bonus, tous les prompts de développement sont maintenant accessibles via `/` commands :

- `/debug` - Déboguer des erreurs systématiquement
- `/elaborate-plan` - Créer des plans techniques détaillés
- `/implement` - Implémenter des plans approuvés
- `/review` - Revue de code avant commit

**Documentation :** Voir les fichiers dans `.opencode/command/`

---

## Résumé des changements

### Avant (7 commandes)

```
/release-alpha      → Créer alpha
/release-beta       → Créer beta (simple)
/release-patch      → Créer patch
/release-minor      → Créer minor
/release-major      → Créer major
/release-check      → Vérifier
/release-rollback   → Annuler
```

**Problème :** Tu devais choisir le type manuellement (patch/minor/major)

---

### Après (4 commandes)

```
/release-beta       → Créer beta (IA détecte automatiquement)
/release-stable     → Créer stable (IA détecte automatiquement)
/release-check      → Vérifier
/release-rollback   → Annuler
```

**Avantages :**
- ✅ IA décide du type (patch/minor/major)
- ✅ Détection automatique du contexte
- ✅ Validation seulement quand nécessaire
- ✅ Workflow plus rapide
- ✅ Moins d'erreurs humaines

---

## Questions fréquentes

### Q : L'IA peut-elle se tromper ?

**R :** Oui, c'est pourquoi :
1. L'IA présente un raisonnement détaillé
2. Tu as toujours le choix final (approve/downgrade/upgrade/cancel)
3. En cas de doute, l'IA demande explicitement

---

### Q : Puis-je skip la validation IA ?

**R :** Non pour les décisions de version (première beta, release directe).  
Oui pour l'approbation finale avec `--skip-approval` (⚠️ risqué).

---

### Q : Combien de temps prend une release ?

**R :**
- Beta incrémentale : 3-5 min (rapide)
- Première beta : 5-10 min (avec analyse)
- Finalisation stable : 3-5 min (rapide)
- Release directe : 5-10 min (avec analyse + warning)

---

### Q : Que faire si je ne suis pas d'accord avec l'IA ?

**R :** Tu peux :
- Option [2] : Downgrade (MINOR → PATCH)
- Option [3] : Upgrade (MINOR → MAJOR)
- Option [4] : Cancel et ajuster les commits

---

### Q : Beta testing est-il vraiment nécessaire ?

**R :** Oui, fortement recommandé :
- ✅ Feedback communautaire
- ✅ Tests en environnements réels
- ✅ Découverte de bugs avant production
- ❌ Release directe = risque élevé

---

## Support

Pour plus d'aide :

1. Lire la documentation détaillée :
   - `.opencode/command/release-beta.md`
   - `.opencode/command/release-stable.md`

2. Vérifier les logs :
   - `.opencode/logs/release-*.log`

3. Demander à l'IA :
   - "Explique-moi le workflow de release"
   - "Pourquoi l'IA a suggéré MINOR ?"
   - "Comment annuler une release ?"

---

**Le système intelligent de release rend les releases plus rapides, plus sûres, et moins sujettes aux erreurs humaines. 🚀**
