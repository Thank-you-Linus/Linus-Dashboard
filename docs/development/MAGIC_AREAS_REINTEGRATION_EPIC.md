# Magic Areas — Sapiens Epic

## Value analysis

- **Problème** : la suppression de Magic Areas a retiré des comportements historiques utiles pour certains setups Linus Dashboard.
- **Impact utilisateur** : scene toggle cassé, certaines actions groupées absentes, et chemin UI vers l’intégration MA manquant.
- **Valeur métier** : rétablir la compatibilité ascendante sans casser les installations actuelles ni le fallback natif.
- **Décision proposée** : réintégrer Magic Areas comme couche de compatibilité avec priorité **Linus Brain > Magic Areas > natif**.

## Epic

### Objectif
Restaurer le support Magic Areas de façon conditionnelle et réversible, sans régression sur les installs qui n’utilisent ni Linus Brain ni Magic Areas.

### Périmètre
- Détection Magic Areas via `Helper`
- Réintégration du `ToggleSceneChip`
- Réactivation des entrées UI dans `SettingsPopup`
- Exclusion explicite des entités Magic Areas des listes/popup quand nécessaire
- Maintien des traductions MA utiles
- Résolution des entités avec priorité LB > MA > natif

### Hors périmètre
- Refonte backend Home Assistant
- Nouveau modèle de groupement
- Réécriture complète des popups
- Nouvelles fonctionnalités non liées à la compatibilité MA

### Fichiers à toucher
- `src/Helper.ts`
- `src/utils/entityResolver.ts`
- `src/chips/ToggleSceneChip.ts`
- `src/popups/SettingsPopup.ts`
- `src/configurationDefaults.ts`
- `src/utils.ts`
- `src/views/*`
- `src/popups/*`
- `custom_components/linus_dashboard/translations/*.json`
- éventuellement `src/cards/*` / `src/chips/*` selon les appels MA historiques

### Dépendances / risques
- Les noms d’entités Magic Areas peuvent varier selon les versions
- Risque de doublons si MA et LB cohabitent sans priorité stricte
- Il faut garder le fallback natif intact
- La détection MA doit rester cacheable et peu coûteuse

### Plan de validation
1. **Linus Brain seul** : comportement inchangé
2. **Magic Areas seul** : scene toggle + UI MA reviennent
3. **LB + MA** : LB prioritaire, MA ignoré
4. **Aucun des deux** : fallback natif inchangé
5. `npm run build` + `npm run lint`

## Tickets

### Ticket 1 — EntityResolver + détection MA
- Ajouter la détection Magic Areas
- Étendre la source de résolution à `linus_brain | magic_areas | native`
- Ajouter les résolutions MA pour les entités historiques
- Rendre `hasMagicAreas` dynamique

### Ticket 2 — ToggleSceneChip + SettingsPopup
- Réactiver le scene toggle si MA est détecté
- Réintroduire le lien/refresh Magic Areas dans le popup settings

### Ticket 3 — configurationDefaults
- Brancher les extra controls sur la résolution MA quand LB n’est pas présent
- Conserver le fallback natif

### Ticket 4 — Nettoyage des appels et des filtres
- Remplacer les usages fragiles de `magic_device_id`
- Réintégrer les filtres d’exclusion MA dans les listes/popup
- Conserver les traductions utiles

### Ticket 5 — Tests et validation
- Tests unitaires des 4 scénarios de détection
- Validation manuelle LB / MA / LB+MA / aucun
- Build et lint
