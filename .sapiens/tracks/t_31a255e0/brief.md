# Value Brief: Filtrage backend des entités masquées et config-category dans les groupes et agrégats

**Date**: 2026-08-26
**Statut**: Draft

## Problème

Sur `main`, le backend Python (`custom_components/linus_dashboard/entity_group.py`,
`sensor.py`) ne filtre les entités que sur `hidden_by`/`disabled_by` lors de la
construction des groupes et des capteurs agrégats (`scan_domain_members()`,
`discover_device_classes()`, `_build_aggregate_sensors()`,
`_discover_numeric_device_classes()`). Il ne filtre jamais sur `entity_category`. Les
entités config-category (ex. entités de configuration exposées par des intégrations
tierces) fuient donc dans les groupes et agrégats générés par le Dashboard, alors que
côté frontend, ce même type d'entité est déjà correctement exclu de l'affichage.

Une tentative de correction a été produite (PR #177, commit `8750a84`,
`should_skip_entity_entry()` / `isCardHidden()`), mais fermée sans merge le
2026-08-26 : le diff touchait aussi le frontend TypeScript et y supprimait par erreur
des filtres `hidden_by` qui fonctionnaient correctement sur `main` (trois régressions
bloquantes), et le tout n'avait jamais été réellement revu (le diff a été produit
directement par un agent, publié par cherry-pick, et les deux tentatives de revue
déléguée ont échoué silencieusement). Le commentaire de fermeture demande de repartir
du besoin utilisateur avec une frontière frontend/backend décidée explicitement, plutôt
que de corriger ce diff en place.

Décision de cadrage (validée par le PM) : ce track est **strictement backend**. Le
frontend sur `main` est correct aujourd'hui et n'est pas concerné.

## Utilisateurs impactés

Les utilisateurs de Linus Dashboard dont l'installation Home Assistant contient des
entités `hidden_by`/`disabled_by` ou classées `config`-category : ces entités polluent
les group entities et sensors agrégés générés par le backend (comptages erronés,
membres de groupe indésirables), même si elles n'apparaissent plus dans l'UI du
dashboard (déjà correct côté frontend).

## Valeur attendue

Le backend exclut de façon fiable et testée les entités `hidden_by`/`disabled_by` et
`entity_category === "config"` de la construction des groupes et des agrégats
(`scan_domain_members`, `discover_device_classes`, `_build_aggregate_sensors`,
`_discover_numeric_device_classes`), sans toucher au frontend. Succès mesurable :
- les entités masquées et config-category n'apparaissent plus dans les groupes ni les
  agrégats numériques générés par le backend ;
- couverture de tests Python (`tests/python/`) sur ce filtrage, pour les deux critères
  (masquage HA et config-category) ;
- aucun fichier sous `src/` (frontend) n'est modifié par ce track.

## Critères de succès

- Les entités `hidden_by`/`disabled_by` restent exclues des groupes et agrégats
  backend (comportement déjà correct sur `main`, non régressé).
- Les entités `entity_category === "config"` sont désormais exclues des groupes et
  agrégats backend (`scan_domain_members`, `discover_device_classes`,
  `_build_aggregate_sensors`, `_discover_numeric_device_classes`) — gap actuellement
  ouvert sur `main`.
- Tests Python nouveaux/mis à jour couvrant les deux critères ci-dessus, suite de tests
  existante toujours verte.

## Contraintes

- Scope strictement backend Python (`custom_components/linus_dashboard/`) ; le
  frontend TypeScript (`src/`) est hors scope car déjà correct sur `main`.
- Repartir de `main` (pas du travail de la PR #177 fermée) pour éviter d'hériter de la
  régression frontend ou du manque de revue qui a motivé sa fermeture.
- Projet en beta (2.0.0-beta.2) : tout changement de comportement d'agrégat existant
  doit être testé et documenté avant merge.

## Périmètre (hors scope)

- **Exclusion DIAGNOSTIC des agrégats numériques** (capteurs batterie/RSSI polluant les
  agrégats numériques) — bug backend réel et distinct, traité dans un ticket de suivi
  séparé.
- **Auto-exclusion `platform == DOMAIN` dans `_build_aggregate_sensors()`** (évite le
  double-comptage d'entités créées par le Dashboard lui-même) — fix backend légitime
  mais qui modifie les valeurs d'agrégats sur les installations existantes ; nécessite
  tests, documentation et une note de release dédiés. Traité dans un ticket de suivi
  séparé, pour ne pas embarquer ce changement de valeur avec le fix de fuite
  masquage/config-category.
- Toute modification du frontend TypeScript (`src/`) — déjà correct sur `main`, hors
  scope de ce track.
