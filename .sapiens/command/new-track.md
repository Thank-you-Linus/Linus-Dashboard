# Command: /new-track

Crée la structure complète d'un nouveau track SAPIENS pour Linus Dashboard.

## Usage

```
/new-track [track-name]
```

## Workflow

1. **Demande les informations** manquantes si pas fournies :
   - Nom du track (kebab-case, ex: `light-dimmer-popup`)
   - Objectif en 1-2 phrases
   - Liste estimée de tickets (3-8 recommandés)

2. **Crée la structure** dans `.sapiens/tracks/{track-name}/` en copiant depuis `.sapiens/tracks/template-linus/` :
   ```
   .sapiens/tracks/{track-name}/
   ├── README.md               ← Rempli avec objectif + tickets
   ├── IMPLEMENTATION-GUIDE.md ← Adapté au track
   ├── CHANGELOG.md            ← Initialisé vide
   └── tickets/
       ├── 00-reference.md     ← Architecture et contraintes
       ├── 01-[name].md        ← Ticket 1
       └── 02-[name].md        ← Ticket 2...
   ```

3. **Remplit les fichiers** avec les informations fournies :
   - README.md : nom, objectif, liste de tickets avec checkboxes
   - 00-reference.md : contexte et architecture actuelle (lire `src/` si besoin)
   - Tickets 01-N : description, acceptance criteria, fichiers à toucher

4. **Affiche un résumé** du track créé et la commande pour commencer :
   ```
   Track créé : .sapiens/tracks/{track-name}/

   Pour commencer :
   git checkout -b feat/{track-name}-01
   /implement-ticket tickets/01-{name}.md
   ```

## Notes

- Le nom du track doit être en kebab-case
- 5-8 tickets est optimal (1-3 jours chacun)
- Le ticket 00-reference.md est de la doc — pas d'implémentation
- Lire `.sapiens/context/linus-dashboard.md` pour le contexte projet si besoin
