# Ticket 03: Invalidation du cache quand la visibilité d’une entité change

**Status**: ⏸️ Not Started
**Estimate**: Small
**Dependencies**: ticket 02

---

## Description

Le symptôme encore reproduit sur `main` — une entité masquée dans Home Assistant reste visible dans les groupes / agrégats du dashboard — ne vient plus du filtrage `hidden_by` lui-même. Le vrai trou est ailleurs : les listeners de rafraîchissement des groupes ne réagissent qu’aux changements `area_id` / `device_id` et ignorent les updates de visibilité (`hidden_by` / `disabled_by`).

Conséquence : quand Julien masque une entité, les structures de groupes/agrégats continuent d’utiliser l’instantané en cache jusqu’à un refresh manuel ou un autre changement d’area/device.

---

## Preuve / chemin d’appel

- `custom_components/linus_dashboard/group_manager.py:117-147`
  - le listener `entity_registry_updated` sort si `changes` ne contient pas `area_id` ou `device_id`.
  - un changement `hidden_by` / `disabled_by` ne déclenche donc aucun refresh.
- `custom_components/linus_dashboard/group_manager.py:284-321`
  - même logique côté `PlatformGroupManager` : seules les modifications d’area/device sont considérées.
- `custom_components/linus_dashboard/entity_group.py:159-170` et `custom_components/linus_dashboard/sensor.py:153-156`
  - les scans appliquent bien le filtre de visibilité, mais seulement au moment où le refresh les relance.
- `custom_components/linus_dashboard/__init__.py` (rafraîchissements déclenchés via les managers) + `Helper.refresh()` côté frontend
  - il n’existe pas de chemin automatique qui invalide le cache sur un simple masquage.

---

## Objectif du ticket

Déclencher un refresh/invalidation quand la visibilité d’une entité change, afin que le dashboard reconstrue ses groupes et agrégats après `hidden_by` / `disabled_by` sans attendre une action manuelle.

---

## Critères d’acceptation

- [ ] Un changement `hidden_by` ou `disabled_by` sur une entité monitoree provoque un refresh des groupes/agrégats.
- [ ] Le comportement existant sur les changements `area_id` / `device_id` reste intact.
- [ ] Le ticket documente clairement le chemin d’appel et le point d’invalidation exact.
- [ ] Aucun changement de scope vers `src/` n’est introduit par ce ticket d’investigation.
