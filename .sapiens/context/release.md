# Release — déclaration du projet

## Renvoi

La méthode de release par défaut n'est pas redéfinie dans ce dépôt : elle est décrite dans le dépôt de référence ci-dessous. Tout ce qui n'est pas listé dans « Écarts assumés » suit cette méthode.

- Dépôt : Julien-Decoen/sapiens
- Chemin : shared/release.md (aussi via `.sapiens/core/shared/release.md` quand le cœur Sapiens est installé) (chemin relatif à la racine du dépôt de référence)
- Prérequis d'accès : droit de lecture sur le dépôt privé Julien-Decoen/sapiens.

## Écarts assumés

| Écart | Raison | Propriété perdue |
|-------|--------|------------------|
| Le contrôle « prêt » (`scripts/check-release-ready.sh`, `npm run release:check`) ne compare pas la version source au CHANGELOG : il vérifie seulement que `CHANGELOG.md` existe (avertissement sinon) et que `package.json`, `manifest.json` et `const.py` s'accordent. | Le script existe avant le standard et n'est pas migré dans ce ticket. | Fraîcheur : rien ne bloque une release dont la section du CHANGELOG est absente, vide ou en retard sur la version source. |
| `scripts/bump-version.sh` appelé sans option fait `git add`, commit et tag (`chore: Bump version to X`). Seule l'option `--files-only` (scripts npm `bump:beta`, `bump:alpha`, `bump:release`) respecte le contrat « ne commite, ne tague, ne pousse jamais ». | `scripts/create-release.sh`, `scripts/create-prerelease.sh` et `.github/workflows/beta-release.yml` s'appuient sur ce commit et ce tag. | « Les gestes de commit et de tag restent humains » : ces trois chemins les font sans validation humaine intermédiaire. |
| Les notes d'une release viennent de `RELEASE_NOTES.md` (`release.yml` : vérification puis `body_path`, lignes 89 à 107), non de la section du CHANGELOG. | Le fichier est produit par `scripts/generate-release-notes.sh` avant le tag ; migrer le flux de publication est hors périmètre. | Source unique : le corps de la release et la section du CHANGELOG peuvent diverger. |
| `release.yml` garde le déclencheur `release: published` (avec son `if` sur `prerelease == false`) en plus du push de tag `X.Y.Z`. | Publier une release depuis l'interface GitHub reste un usage en place. | Déclenchement sur tag poussé seul : une release créée à la main n'est pas liée à un tag validé par le flux. |
| Des workflows poussent sur `main` : `prerelease.yml` au nettoyage de `RELEASE_NOTES.md` (`git push origin HEAD:main`, étape 14) et `beta-release.yml` (`git push --atomic origin HEAD:main "refs/tags/$TAG"`, vers la ligne 155). | Le nettoyage des notes et la coupe d'une pré-release en un clic sont des flux automatisés existants. | Aucune écriture automatique sur la branche par défaut : la poussée n'est pas un geste humain. |
| Historique du CHANGELOG figé tel que commité : ordre non semver (par exemple `1.6.0-beta.1` puis `1.5.1-beta.*` avant `1.5.1`), sections `2.0.0-beta.1` et `2.0.0-beta.2` absentes, aucune section pour les alphas. | Le générateur ne réécrit jamais les sections existantes ; les corriger rétroactivement fausserait des dates et des notes déjà publiées. | Ordre semver et complétude de l'historique : le fichier ne reflète pas fidèlement la liste des tags. |
| Aucun flux ne commite `CHANGELOG.md` : `prerelease.yml` et `release.yml` le génèrent dans l'espace de travail du runner pour le paquet, sans le versionner. La section de la version source doit être générée (`npm run release:changelog`) et commitée par un humain avant le tag. | Le standard fixe le générateur, pas l'étape qui le commite ; aucun flux existant ne le fait. | Fraîcheur garantie par le flux : le CHANGELOG du dépôt peut rester en retard (en-tête `1.6.0-beta.1` alors que la source est `2.0.0-beta.3`). |
