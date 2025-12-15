# OpenCode Commands - Référence rapide

Documentation des commandes personnalisées pour Linus Dashboard.

---

## 🚀 Releases

### `/release-beta`
Crée une pre-release beta avec détection IA automatique.

- **Première beta** → IA analyse et suggère patch/minor/major
- **Beta incrémentale** → Auto-incrémente (pas de validation)
- **Temps :** 3-10 min selon le type

[Documentation complète](./RELEASE_COMMANDS.md) | [Détails](./command/release-beta.md)

---

### `/release-stable`
Crée une release stable avec détection automatique.

- **Depuis beta** → Finalise automatiquement (pas de validation)
- **Release directe** → IA analyse + avertissement (recommande beta)
- **Temps :** 3-10 min selon le type

[Documentation complète](./RELEASE_COMMANDS.md) | [Détails](./command/release-stable.md)

---

### `/release-check`
Vérifie que tout est prêt pour release (sans créer de release).

- **17 checks** de qualité de code
- **15 tests** smoke
- **Validation** des notes de release

[Détails](./command/release-check.md)

---

### `/release-rollback <version>`
Annule une release problématique.

```bash
/release-rollback 1.5.0
```

⚠️ À utiliser seulement en cas de problème critique

[Détails](./command/release-rollback.md)

---

## 🛠️ Développement

### `/debug`
Debug des erreurs de manière systématique.

- Checklist de debug
- Outils disponibles
- Patterns d'erreurs courants
- Solutions documentées

[Détails](./command/debug.md)

---

### `/elaborate-plan`
Crée un plan technique détaillé avant implémentation.

- Analyse des requirements
- Architecture proposée
- Tâches step-by-step
- Critères d'acceptance

[Détails](./command/elaborate-plan.md)

---

### `/implement`
Implémente un plan approuvé avec précision.

- Patterns de code TypeScript/Python
- Checklist de validation
- Troubleshooting
- Success criteria

[Détails](./command/implement.md)

---

### `/review`
Revue de code avant commit.

- Quality checks
- Security audit
- Performance review
- HA patterns validation

[Détails](./command/review.md)

---

## 🎯 Workflow recommandé

### Release normale (recommandé)

```
1.4.0 (stable)
  ↓ Développement
  ↓
  ↓ /release-beta → IA suggère MINOR → 1.5.0-beta.1
  ↓ Tests communautaires (2-7 jours)
  ↓
  ↓ /release-beta → Auto-incrémente → 1.5.0-beta.2
  ↓ Plus de tests
  ↓
  ↓ /release-stable → Finalise automatiquement → 1.5.0
  ↓
1.5.0 (stable)
```

**Temps total :** 2-7 jours (incluant tests)

---

### Hotfix urgent

```
1.5.0 (stable)
  ↓ Bug critique
  ↓ Fix immédiat
  ↓
  ↓ /release-stable → IA suggère PATCH → 1.5.1
  ↓
1.5.1 (stable)
```

⚠️ Seulement pour correctifs critiques

---

## 🧠 Détection IA

L'IA analyse les commits et applique ces règles :

| Type | Déclencheurs | Exemple |
|------|-------------|---------|
| **MAJOR** | `BREAKING CHANGE:`, `feat!:`, `fix!:` | `2.0.0` |
| **MINOR** | `feat:` (nouvelles fonctionnalités) | `1.5.0` |
| **PATCH** | `fix:`, `docs:`, petits changements | `1.4.1` |
| **AMBIGUOUS** | Signaux mixtes | Demande manuelle |

[Documentation complète sur la détection IA](./RELEASE_COMMANDS.md#détection-intelligente-de-version)

---

## 📊 Scripts disponibles

```bash
# Analyser les commits
npm run analyze:commits

# Vérifier la qualité
npm run lint:check
npm run type-check

# Build
npm run build

# Tests
npm run test:smoke
npm run test:ci

# Ouvrir les forums après release
npm run forums:open
```

---

## 📝 Logs

Les releases sont loggées dans :

```
.opencode/logs/release-beta-{timestamp}.log
.opencode/logs/release-stable-{timestamp}.log
```

---

## 🆘 Aide rapide

### Release bloquée ?

```bash
# Vérifier l'état
/release-check

# Vérifier les logs
tail -f .opencode/logs/release-*.log

# Annuler si erreur
/release-rollback <version>
```

---

### Build échoue ?

```bash
# Nettoyer et rebuilder
npm run build

# Vérifier les types
npm run type-check

# Linter
npm run lint
```

---

### IA suggère le mauvais type ?

Tu peux overrider :
- **[1] APPROVE** → Utilise la suggestion IA
- **[2] DOWNGRADE** → Réduit (MINOR → PATCH)
- **[3] UPGRADE** → Augmente (MINOR → MAJOR)
- **[4] CANCEL** → Annule

---

## 📚 Documentation complète

- **Releases :** [RELEASE_COMMANDS.md](./RELEASE_COMMANDS.md)
- **Release beta :** [command/release-beta.md](./command/release-beta.md)
- **Release stable :** [command/release-stable.md](./command/release-stable.md)
- **Debug :** [command/debug.md](./command/debug.md)
- **Planning :** [command/elaborate-plan.md](./command/elaborate-plan.md)
- **Implémentation :** [command/implement.md](./command/implement.md)
- **Review :** [command/review.md](./command/review.md)

---

## 🎯 Changements principaux

### Avant → Après

**Avant :** 7 commandes release, choix manuel du type (patch/minor/major)

**Après :** 4 commandes release, IA décide automatiquement

### Avantages

- ✅ IA analyse et suggère le bon type
- ✅ Détection automatique du contexte
- ✅ Validation seulement quand nécessaire
- ✅ Workflow plus rapide
- ✅ Moins d'erreurs

---

**Pour toute question, demande à l'IA : "Explique-moi [commande/concept]" 🤖**
