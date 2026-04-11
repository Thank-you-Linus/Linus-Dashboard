# Track: [Track Name]

**Status**: 🔵 Planning | 🟡 In Progress | 🟢 Complete
**Start Date**: [YYYY-MM-DD]
**Target Completion**: [YYYY-MM-DD]

---

## Goal

[1-3 paragraphes : ce que ce track accomplit et pourquoi c'est important pour Linus Dashboard]

---

## Scope

### Included ✅
- [ ] [Feature/component 1]
- [ ] [Feature/component 2]

### Excluded ❌
- [Hors scope 1 et pourquoi]

---

## Tickets

- [00-reference.md](tickets/00-reference.md) - Contexte, architecture, contraintes
- [ ] [01-ticket-name.md](tickets/01-ticket-name.md) - Description
- [ ] [02-ticket-name.md](tickets/02-ticket-name.md) - Description

**Progress**: 0/2 tickets complete (0%)

---

## SAPIENS Integration

### Agents (via `.sapiens/core/agents/`)
- **implementer** — Implémentation complète par ticket
- **quality-checker** — lint + types + tests + build
- **reviewer** — Revue de code avant merge
- **architect** — Design si complexité élevée

### Commands
- `/implement-ticket tickets/01-xxx.md` — Implémente un ticket
- `/quality-check` — Valide la qualité
- `/create-mr` — Crée la PR
- `/review-mr <url>` — Revue de la PR
- `/complete-track [track-name]` — Clôture + DISCOVERIES.md

---

## Architecture Overview

[Comment cette feature s'intègre dans Linus Dashboard]

```
src/
├── cards/          ← Si nouveau type de carte
├── views/          ← Si nouvelle vue
├── popups/         ← Si nouveau popup
└── chips/          ← Si nouveau chip
```

---

## Success Criteria

### Functional
- [ ] [Requirement 1]
- [ ] [Cas limite 1 géré]

### Technical
- [ ] TypeScript strict — zéro erreur de type
- [ ] ESLint — zéro erreur
- [ ] Tests Vitest — 100% pass
- [ ] Build production OK
- [ ] Smoke tests OK (15/15)

### Release
- [ ] `/release-check` passe (17 checks)
- [ ] `/release-beta` effectué

---

**Pour les instructions d'exécution** : [IMPLEMENTATION-GUIDE.md](IMPLEMENTATION-GUIDE.md)
