# OpenCode Commands - Référence rapide

Documentation des commandes personnalisées pour Linus Dashboard.

---

## 🚀 Releases

Il n'y a plus de commande de release : une release part **uniquement** des boutons GitHub Actions
**Beta Release (manual)** et **Stable Release (manual)** (Actions → le bouton → Run workflow, cocher
`dry_run` d'abord). Aucun workflow n'écoute les tags : un tag poussé à la main ne publie rien.

Procédure complète, CHANGELOG, rollback manuel et annonce de la stable :
[docs/RELEASE_GUIDE.md](../docs/RELEASE_GUIDE.md).

---

## 🛠️ Développement

### `/debug`
Debug des erreurs de manière systématique.

- Checklist de debug
- Outils disponibles
- Patterns d'erreurs courants
- Solutions documentées

[Détails](./commands/debug.md)

---

### `/elaborate-plan`
Crée un plan technique détaillé avant implémentation.

- Analyse des requirements
- Architecture proposée
- Tâches step-by-step
- Critères d'acceptance

[Détails](./commands/elaborate-plan.md)

---

### `/implement`
Implémente un plan approuvé avec précision.

- Patterns de code TypeScript/Python
- Checklist de validation
- Troubleshooting
- Success criteria

[Détails](./commands/implement.md)

---

### `/review`
Revue de code avant commit.

- Quality checks
- Security audit
- Performance review
- HA patterns validation

[Détails](./commands/review.md)

---

## 📊 Scripts disponibles

```bash
# Vérifier la qualité
npm run lint:check
npm run type-check

# Build
npm run build

# Tests
npm run test:smoke
npm run test:ci

# Avant de cliquer un bouton de release
npm run release:check

# Ouvrir les forums après une stable
npm run forums:open
```

---

## 🆘 Aide rapide

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

## 📚 Documentation complète

- **Releases :** [docs/RELEASE_GUIDE.md](../docs/RELEASE_GUIDE.md)
- **Debug :** [commands/debug.md](./commands/debug.md)
- **Planning :** [commands/elaborate-plan.md](./commands/elaborate-plan.md)
- **Implémentation :** [commands/implement.md](./commands/implement.md)
- **Review :** [commands/review.md](./commands/review.md)
