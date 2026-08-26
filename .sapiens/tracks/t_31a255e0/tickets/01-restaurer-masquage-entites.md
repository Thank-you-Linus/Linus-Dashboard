# Ticket 01: Restaurer le masquage des entités (hidden_by, hide_config_entities, UnavailableView)

**Status**: 🚫 Superseded — ne pas implémenter
**Estimate**: Medium
**Dependencies**: aucune

---

## ⚠️ Superseded (2026-08-26)

Ce ticket part d'un cadrage obsolète : il suppose que `hidden_by`, `hide_config_entities`
et les filtres de `UnavailableView` sont cassés sur `main` et doivent y être restaurés
côté frontend. Une revue de la fermeture de la PR #177 a montré que cette régression
n'existe que sur une branche de travail non mergée (commit `8750a84`) — **le frontend
sur `main` est déjà correct** et n'a besoin d'aucune restauration.

Le value brief validé le 2026-08-26 ([`../brief.md`](../brief.md)) recadre ce track
sur un vrai gap, côté backend cette fois : `entity_category === "config"` n'est filtré
nulle part dans `entity_group.py`/`sensor.py`. Ce travail est repris dans
[`02-exclure-entites-hidden-config-scans-backend.md`](02-exclure-entites-hidden-config-scans-backend.md).

Ce ticket est conservé pour historique mais **ne doit pas être implémenté**.

---

## Description

Des entités masquées dans Home Assistant continuent d'apparaître sur le dashboard
Linus. La revue de fermeture de la PR #177 (closed 2026-08-26) a identifié trois
régressions frontend bloquantes, introduites lors du remplacement des vérifications
`hidden_by` / `entity_category === "config"` par un unique lookup `card_options` :

1. `hidden_by` n'est plus filtré nulle part : `Helper.ts` (init de `this.#entities`,
   `~L743-750`) ne teste plus `entity.hidden_by`, et les checks `!entity.hidden_by`
   supprimés dans `AbstractView.ts` et `UnavailableView.ts` n'ont jamais été remplacés.
   Les entités masquées côté HA remontent donc dans `Helper.entities` /
   `Helper.domains`.
2. `hide_config_entities` est mort pour les cartes de domaine standard :
   `processEntities()` (`src/utils.ts`, la fonction principale utilisée pour les
   cartes de domaine/device_class, pas le chemin "Miscellaneous") ne filtre plus que
   via `isCardHidden()` (`card_options` uniquement) — le check
   `entity_category === "config"` a disparu de ce chemin.
3. `UnavailableView` a perdu son filtre config-category et ne conserve que le filtre
   `card_options.hidden` (`src/views/UnavailableView.ts`, méthodes
   `createSectionCards()` et `targetDomain()`), sans option qui le gate.

Décision palier 1 : correction **frontend TypeScript uniquement**. Le backend Python
(`should_skip_entity_entry()`, `entity_group.py`, `sensor.py`, commit `8750a84`) est
sound et ne doit pas être modifié dans ce ticket.

L'objectif est de restaurer un masquage à deux couches — `hidden_by`/`disabled_by`
(source HA) **et** `card_options.hidden` (source Linus) — sans revenir sur le
comportement `card_options` / `isCardHidden()` / `addLightGroupsToEntities()` déjà
correct, et sans réintroduire la classe de bug qui a fait échouer la PR #177 (un layer
de filtrage supprimé sous prétexte qu'il serait "redondant" avec un autre qui, en
réalité, filtrait autre chose).

---

## Critères d'acceptation

- [ ] **Given** une entité a `entity.hidden_by !== null` (ou `entity.disabled_by !== null`) côté Home Assistant, **When** `Helper.initialize()` construit `this.#entities`/`this.#domains`, **Then** cette entité est exclue de `Helper.entities` et `Helper.domains`, en plus (et non à la place) du filtre `card_options.hidden` existant.

- [ ] **Given** une entité est masquée via `card_options` (hidden au niveau `entity_id` ou `device_id`), **When** n'importe quelle vue ou agrégat consomme `Helper.entities` / `isCardHidden()`, **Then** cette entité reste exclue exactement comme avant ce ticket — aucune régression sur le comportement `card_options` existant (y compris `addLightGroupsToEntities()`, qui n'est pas touché par ce ticket).

- [ ] **Given** une entité a `entity_category === "config"` et l'option `hide_config_entities` applicable (globale via `domains["_"]` ou par domaine) est activée, **When** `processEntities()` construit les cartes pour un domaine standard (pas uniquement le chemin "Miscellaneous"), **Then** cette entité est exclue des cartes générées.

- [ ] **Given** une entité `UNAVAILABLE` est soit masquée (`hidden_by` ou `card_options.hidden`), soit config-category avec `hide_config_entities` actif, **When** `UnavailableView.createSectionCards()` (et `targetDomain()`) construit ses sections/cibles, **Then** cette entité n'apparaît pas dans les cartes "unavailable" ni dans la cible du service call.

- [ ] **Given** ce ticket est implémenté, **When** on inspecte le diff, **Then** aucun fichier sous `custom_components/linus_dashboard/` (backend Python) n'est modifié — le filtrage backend (`should_skip_entity_entry()`, `entity_group.py`, `sensor.py`) reste inchangé.

- [ ] **Given** les trois filtres restaurés (`hidden_by` dans `Helper.ts`, `hide_config_entities` dans `processEntities()`, filtres dans `UnavailableView.ts`), **When** on exécute `npm run test`, **Then** des tests Vitest nouveaux ou mis à jour couvrent chacun des trois cas ci-dessus, et l'ensemble de la suite (y compris `tests/unit/addLightGroupsToEntities.test.ts`, non modifié) passe.

- [ ] 🔍 [Manual] **Given** un dashboard réel avec des entités masquées côté HA (`hidden_by`), des entités `card_options.hidden`, et des entités config-category avec `hide_config_entities` activé, **When** on recharge le dashboard, **Then** aucune de ces entités n'apparaît dans les vues de domaine, les groupes de lumières, ni dans `UnavailableView`.

---

## Notes

- Contexte complet : commentaire de fermeture de la PR #177
  (`Thank-you-Linus/Linus-Dashboard#177`, 2026-08-26) — liste exhaustive des 3
  régressions frontend et des 2 points backend hors scope (dont `DIAGNOSTIC` non
  exclu des agrégats numériques, volontairement laissé de côté ici).
- Ne pas supprimer un filtre existant en le jugeant "redondant" sans vérifier qu'un
  autre layer couvre exactement le même cas — c'est précisément ce qui a cassé la
  PR #177.
