# Implementation Guide: [Track Name]

## Setup

```bash
cd /data/linus-dashboard
npm install
```

Lire avant de commencer :
- [README.md](README.md) — objectif et scope
- [tickets/00-reference.md](tickets/00-reference.md) — contexte technique

---

## Workflow par ticket

### 1. Lire le ticket
```bash
cat tickets/01-xxx.md
```

### 2. Créer la branche
```bash
git checkout -b feat/[track-name]-01
```

### 3. Implémenter
```
/implement-ticket tickets/01-xxx.md
```
L'agent Implementer : analyse → code → tests → validation.

### 4. Quality check
```
/quality-check
```
Vérifie : lint + type-check + tests Vitest + build.
**Tout doit passer avant de continuer.**

### 5. Créer la PR
```
/create-mr
```

### 6. Revue
```
/review-mr <url>
```

### 7. Merge → ticket suivant

---

## Standards qualité Linus Dashboard

### TypeScript
- Strict mode activé — zéro `any`
- Interfaces PascalCase avec préfixe `I` (ex: `ICardConfig`)
- Fonctions < 50 lignes

### Tests (Vitest)
- Fichiers : `*.test.ts` à côté du source
- Coverage > 80% sur le nouveau code
- `npm run test:ci` doit passer

### Lint
```bash
npm run lint:check    # Vérifier
npm run lint          # Corriger
npm run type-check    # Types TypeScript
```

### Build
```bash
npm run build:prod    # Production — doit passer avant merge
```

---

## Clôture du track

```
/complete-track [track-name]
```

Le Quality Analyzer analyse le track complet et génère `DISCOVERIES.md` :
bugs trouvés, patterns détectés, countermeasures appliquées, learnings.

---

## Rollback

```bash
npm run release:rollback
```

---

## Ressources

- Contexte projet : `.sapiens/context/linus-dashboard.md`
- Standards code : `.sapiens/rules/coding-standards.md`
- Agents SAPIENS : `.sapiens/core/agents/`
- Commands SAPIENS : `.sapiens/core/commands/`
