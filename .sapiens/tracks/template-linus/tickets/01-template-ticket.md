# Ticket 01: [Ticket Name]

**Track**: [track-name]
**Branch**: `feat/[track-name]-01`
**Depends on**: 00-reference

---

## Description

[2-3 paragraphes décrivant ce que ce ticket implémente et pourquoi]

---

## Acceptance Criteria

- [ ] [Critère testable 1]
- [ ] [Critère testable 2]
- [ ] TypeScript strict — zéro erreur de type
- [ ] Tests Vitest écrits et passants
- [ ] ESLint — zéro erreur
- [ ] Build production OK

---

## Technical Details

### Fichiers à créer
- `src/[path]/[File.ts]` — [rôle]

### Fichiers à modifier
- `src/[path]/[File.ts]` — [changement]

### Types à définir
```typescript
interface IMyConfig {
  // ...
}
```

---

## Implementation Steps

1. [Étape 1]
2. [Étape 2]
3. [Étape 3]
4. Écrire les tests Vitest
5. `npm run lint && npm run type-check && npm run test`

---

## SAPIENS Workflow

```
/implement-ticket tickets/01-[name].md
/quality-check
/create-mr
```

---

## Validation

### Automatique
```bash
npm run test:ci       # Tests + lint + types
npm run build:prod    # Build production
```

### Manuelle
- [ ] [Action manuelle 1 à vérifier]

---

## Edge Cases

- [Edge case 1 à gérer]
- Entité absente → [comportement attendu]
- HA déconnecté → [comportement attendu]

---

## Rollback

Si problème : `git revert <commit>` ou `npm run release:rollback`
