# Track: t_31a255e0 — Exclure les entités masquées et config-category des scans backend

**Status**: 🟢 Delivery Ready
**Start Date**: 2026-08-26
**Target Completion**: —

---

## Goal

Sur `main`, le backend Python (`entity_group.py`, `sensor.py`) ne filtre les entités
que sur `hidden_by`/`disabled_by` lors de la construction des groupes et des capteurs
agrégats (`scan_domain_members()`, `discover_device_classes()`,
`_build_aggregate_sensors()`, `_discover_numeric_device_classes()`) — il ne filtre
jamais sur `entity_category`. Les entités config-category fuient donc dans les groupes
et agrégats générés par le Dashboard.

Décision de cadrage validée (value analysis, 2026-08-26, voir [`brief.md`](brief.md)) :
la correction cible **exclusivement le backend Python**. Le frontend TypeScript
(`Helper.ts`, `AbstractView.ts`, `UnavailableView.ts`, `processEntities()`) est déjà
correct sur `main` — il filtre `hidden_by` et `entity_category === "config"` sans
régression — et reste inchangé dans ce track. Cette décision remplace le cadrage
initial (palier 1, frontend-only) : une revue de la fermeture de la PR #177 (closed
2026-08-26, sans merge) a montré que la régression décrite dans le cadrage initial
n'existe que sur une branche de travail non mergée, pas sur `main`, alors que le
backend `main` a lui un vrai gap de filtrage config-category. Voir
[`tickets/01-restaurer-masquage-entites.md`](tickets/01-restaurer-masquage-entites.md)
pour le détail de ce changement de cadrage.

---

## Scope

### Included ✅
- [ ] Ajouter le filtre `entity_category === "config"` dans `scan_domain_members()`
      et `discover_device_classes()` (`entity_group.py`)
- [ ] Ajouter le filtre `entity_category === "config"` dans
      `_build_aggregate_sensors()` et `_discover_numeric_device_classes()`
      (`sensor.py`)
- [ ] Couvrir ces ajouts par des tests Python (`tests/python/`)

### Excluded ❌
- Frontend TypeScript (`src/`) — déjà correct sur `main`, hors scope de ce track
- Exclusion `DIAGNOSTIC` des agrégats numériques (pollution batterie/RSSI) — bug
  backend réel et distinct, traité dans un ticket de suivi séparé
- Auto-exclusion `platform == DOMAIN` dans `_build_aggregate_sensors()` — change des
  valeurs d'agrégats sur des installations existantes, nécessite tests/documentation/
  release note dédiés ; traité dans un ticket de suivi séparé
- Toute modification du comportement `card_options` / `isCardHidden()` /
  `addLightGroupsToEntities()`, qui est correct et ne doit pas régresser

---

## Tickets

- [x] ~~[01-restaurer-masquage-entites.md](tickets/01-restaurer-masquage-entites.md)~~ — **Superseded**, cadrage frontend-only obsolète (voir note dans le fichier)
- [x] [02-exclure-entites-hidden-config-scans-backend.md](tickets/02-exclure-entites-hidden-config-scans-backend.md) — 👀 In Review — Exclure les entités hidden_by et config-category des scans backend

**Progress**: 1/1 ticket actif complete (100%) — ticket 01 superseded, exclu du décompte
**Status**: Delivery Ready
**Last updated**: 2026-08-26 (by /03-implement-ticket)

---

## Références

- [`brief.md`](brief.md) — value brief validé (2026-08-26), cadrage backend-only
- PR #177 (closed, non mergée) — commentaire de fermeture détaillant les 3 régressions
  frontend bloquantes (présentes seulement sur la branche de travail, pas sur `main`)
  et les 2 points backend à reconsidérer (DIAGNOSTIC, auto-exclusion `platform == DOMAIN`)
- Commit `8750a84` — tentative de correction backend, jamais mergée ; le filtrage
  config-category qu'elle introduisait est repris dans le ticket 02, à l'exclusion de
  l'auto-exclusion et du filtrage DIAGNOSTIC
