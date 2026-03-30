# Reference: [Track Name]

## Context

### Pourquoi ce track existe
[Problème ou besoin business à l'origine de cette feature]

### Valeur pour Linus Dashboard
- [Bénéfice 1 pour les utilisateurs HA]
- [Bénéfice 2]

---

## Architecture

### État actuel
[Comment ça marche aujourd'hui]

### État cible
[Comment ça marchera après ce track]

### Fichiers clés impactés
```
src/
├── [fichier 1] — [rôle]
├── [fichier 2] — [rôle]
└── [fichier 3] — [rôle]
```

---

## Contraintes techniques

### Obligatoire
- Compatible Home Assistant 2025.5.0+
- Suivre le pattern Lovelace Strategy
- TypeScript strict — zéro `any`
- Tests Vitest pour toute logique métier

### Interdit
- Hardcoder des entity IDs
- Casser la rétrocompatibilité YAML existante
- Dépendances circulaires

---

## Patterns à suivre

### Cartes (src/cards/)
```typescript
// Hériter de AbstractCard
export class MyCard extends AbstractCard {
  // ...
}
```

### Vues (src/views/)
```typescript
// Pattern existant : AreaView, HomeView, etc.
```

### Popups (src/popups/)
```typescript
// Utiliser PopupFactory pour router vers le popup approprié
```

---

## Questions ouvertes
- [Question 1 à résoudre avant d'implémenter]

---

**Voir** [README.md](../README.md) pour la liste des tickets.
