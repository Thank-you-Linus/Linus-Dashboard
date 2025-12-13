# 🚀 Système de Release Simplifié

## Utilisation Rapide

### Pour créer une pré-release beta (le plus courant)

```bash
npm run create:beta
```

### Pour créer une pré-release alpha (tests précoces)

```bash
npm run create:alpha
```

### Pour créer une release stable

```bash
npm run create:release
```

## Ce que fait le script automatiquement

1. ✅ Vérifie que git est propre
2. ✅ Génère `RELEASE_NOTES.md` depuis vos commits
3. ✅ Vous demande d'éditer les notes de release
4. ✅ Formate les notes pour GitHub
5. ✅ Exécute les smoke tests
6. ✅ Incrémente la version (major.minor.patch)
7. ✅ Crée le commit et le tag git
8. ✅ Pousse sur GitHub
9. ✅ Déclenche le workflow CI/CD automatiquement

## GitHub Actions fait ensuite

- Build du projet
- Tests de validation
- Création du ZIP
- Publication de la release
- Notification Discord
- Nettoyage automatique

## Documentation Complète

Voir `docs/RELEASE_GUIDE.md` pour tous les détails.

## Corrections Apportées

### Problème Discord résolu

Le script `notify-discord.sh` a été amélioré pour :
- Gérer les fichiers RELEASE_NOTES.md auto-générés (sans gras)
- Fallback automatique sur toutes les entrées si pas de gras
- Messages plus robustes même sans édition manuelle
- Meilleur extraction des changelogs FR/EN

### Scripts existants conservés

Les anciens scripts manuels sont toujours disponibles :
- `npm run bump:beta` - Juste bump la version
- `npm run release:notes` - Juste générer les notes
- etc.

## Versioning Sémantique

Le script suit le versioning sémantique classique :

```
1.3.0           (stable actuelle)
  ↓
1.4.0-beta.1    (première beta de la 1.4.0)
  ↓
1.4.0-beta.2    (corrections dans la beta)
  ↓
1.4.0           (release stable)
  ↓
1.4.1           (patch release)
  ↓
1.5.0-beta.1    (nouvelle version mineure)
```

## Conseils

- **Toujours** éditer RELEASE_NOTES.md avant de continuer
- **Marquer** les features importantes avec `**texte**` pour Discord
- **Traduire** en français les sections importantes
- **Tester** la beta avant de passer en stable
- **Ne pas skip** les smoke tests
