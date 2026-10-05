# 🚀 Système de Release Simplifié

## Utilisation Rapide

### Pour créer une pré-release beta (le plus courant)

```bash
bash scripts/create-prerelease.sh beta
```

### Pour créer une pré-release alpha (tests précoces)

```bash
bash scripts/create-prerelease.sh alpha
```

### Pour créer une release stable

```bash
bash scripts/create-release.sh
```

> Note : il n'existe pas de script npm `create:beta` / `create:alpha` / `create:release`
> dans `package.json`. Utilisez les scripts shell ci-dessus, ou le bouton GitHub
> (section « Release from GitHub » plus bas).

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

## Release from GitHub

Sortir une pré-release sans terminal, depuis l'interface GitHub :

1. Aller dans **Actions** -> **Beta Release (manual)** -> **Run workflow**.
2. Choisir la branche `main` (obligatoire pour une vraie release).
3. Choisir le **channel** : `beta` (défaut) ou `alpha`.
4. Cliquer sur **Run workflow**.

Le workflow (`.github/workflows/beta-release.yml`, un seul job) enchaîne : lint, type-check, build,
calcul de la version suivante (ex. `2.0.0-beta.2` -> `2.0.0-beta.3`), génération des notes FR/EN depuis
les commits depuis le dernier tag, bump + commit + tag (sans préfixe `v`), smoke tests, ZIP,
`git push --atomic` du commit et du tag, publication de la pré-release GitHub et notification Discord.

Garde-fous (le workflow s'arrête avant tout push) :

- le tag de la version calculée existe déjà sur `origin` ;
- la version de `package.json` n'est pas le dernier tag ;
- canal `alpha` demandé alors que la version courante est une beta de la même base
  (`2.0.0-alpha.1` serait inférieur à `2.0.0-beta.N` pour semver/HACS) ;
- hors `dry_run`, la branche n'est pas `main`.

### Dry run

Cocher **dry_run** pour exécuter tous les contrôles et le bump local, puis s'arrêter juste avant le
push (rien n'est poussé, rien n'est publié). Autorisé depuis n'importe quelle branche : pratique pour
tester le chemin d'échec ou valider une modification du workflow.

### En cas d'échec

Le résumé du run (`$GITHUB_STEP_SUMMARY`) indique l'étape en échec :

- **Avant le push** : « Failed at: <étape> — nothing was pushed. » Corriger puis relancer.
- **Après le push** (étape de release GitHub) : le tag existe déjà sur `origin` et `main` contient le
  commit de bump. Supprimer le tag (`git push --delete origin <tag>`, et la release partielle
  éventuelle), puis relancer. Comme `package.json` doit correspondre au dernier tag, il faut aussi
  annuler le commit de bump sur `main` (ou recréer le tag dessus) avant de relancer.

### Protection de `main`

Le workflow pousse directement sur `main` avec `GITHUB_TOKEN`. Si la règle « Protect main » est un jour
activée, ajouter **GitHub Actions** comme bypass actor, sinon le push échouera (rien ne sera publié).

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
