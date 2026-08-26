# Ticket 02: Exclure les entités hidden_by et config-category des scans backend (groupes et agrégats)

**Status**: 👀 In Review
**Estimate**: Small
**Dependencies**: aucune

---

## Description

Sur `main`, le backend Python (`custom_components/linus_dashboard/entity_group.py`,
`sensor.py`) ne filtre les entités que sur `hidden_by`/`disabled_by` lors de la
construction des groupes et des capteurs agrégats (`scan_domain_members()`,
`discover_device_classes()`, `_build_aggregate_sensors()`,
`_discover_numeric_device_classes()`). Il ne filtre jamais sur `entity_category`. Les
entités config-category fuient donc dans les groupes et agrégats générés par le
Dashboard, alors que côté frontend ce type d'entité est déjà correctement exclu de
l'affichage.

Ce ticket ajoute le filtre `entity_category === "config"` à ces quatre fonctions, en
plus (et non à la place) des checks `hidden_by`/`disabled_by` existants.

Scope strictement backend : le frontend TypeScript (`src/`) est correct sur `main` et
n'est pas concerné par ce ticket.

Hors scope (traité dans des tickets de suivi séparés, voir `README.md` du track) :
- Exclusion `DIAGNOSTIC` des agrégats numériques (pollution batterie/RSSI).
- Auto-exclusion `platform == DOMAIN` dans `_build_aggregate_sensors()` — `scan_domain_members()`
  a déjà ce filtre sur `main`, ne pas le dupliquer ni l'étendre à `sensor.py` ici : ce
  changement modifie des valeurs d'agrégats sur des installations existantes et
  nécessite ses propres tests/documentation/release note.

---

## Acceptance Criteria

- [x] **Given** une entité a `entity_entry.hidden_by` ou `entity_entry.disabled_by` non
  nul, **When** `scan_domain_members()` ou `discover_device_classes()`
  (`entity_group.py`) construisent la liste des membres d'un domaine, **Then** cette
  entité reste exclue (comportement déjà correct sur `main`, non régressé).

- [x] **Given** une entité a `entity_category == "config"`, **When**
  `scan_domain_members()` ou `discover_device_classes()` (`entity_group.py`)
  construisent la liste des membres d'un domaine, **Then** cette entité est exclue.

- [x] **Given** une entité a `entity_category == "config"`, **When**
  `_build_aggregate_sensors()` ou `_discover_numeric_device_classes()` (`sensor.py`)
  construisent les capteurs agrégats, **Then** cette entité est exclue.

- [x] **Given** ce ticket est implémenté, **When** on inspecte le diff, **Then** aucun
  fichier sous `src/` (frontend) n'est modifié, l'auto-exclusion `platform == DOMAIN`
  n'est pas ajoutée à `_build_aggregate_sensors()`, et aucun filtre `DIAGNOSTIC` n'est
  ajouté.

- [x] **Given** les filtres config-category ajoutés aux quatre fonctions, **When** on
  exécute la suite de tests Python (`tests/python/`), **Then** des tests nouveaux ou
  mis à jour couvrent chacun des deux cas ci-dessus (masquage HA et config-category)
  pour `entity_group.py` et `sensor.py`, et l'ensemble de la suite passe.

- [ ] 🔍 [Manual] **Given** une installation Home Assistant réelle avec des entités
  `hidden_by` et des entités `entity_category == "config"`, **When** le Dashboard
  scanne les domaines et construit ses agrégats, **Then** aucune de ces entités
  n'apparaît dans les groupes ni dans les capteurs agrégats générés.

---

## Notes

- Contexte complet : `../brief.md` (value brief validé) et la revue de fermeture de la
  PR #177 (`Thank-you-Linus/Linus-Dashboard#177`, fermée 2026-08-26 sans merge) —
  commit `8750a84` avait déjà tenté ce filtrage via `should_skip_entity_entry()`, mais
  la PR a été fermée car elle touchait aussi (et cassait) le frontend, et n'avait
  jamais été réellement revue.
- Ne pas réintroduire l'auto-exclusion `platform == DOMAIN` dans `sensor.py` ni le
  filtre `DIAGNOSTIC` ici — ce sont des changements de valeurs d'agrégats distincts,
  volontairement scindés en tickets de suivi séparés (voir `README.md`).
