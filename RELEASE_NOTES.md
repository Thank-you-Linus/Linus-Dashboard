# 🎉 Linus Dashboard 1.4.1

## 🇬🇧 English

### 🐛 Bug Fixes

- **Cover Popup UX Improvements**: Fixed cover aggregate popups to show both "Open All" and "Close All" buttons side-by-side, matching the behavior of other aggregate types (media_player, climate, lights)
- **Individual Cover Entities**: Cover popups now display individual cover entities instead of showing only the Magic Area group entity, providing better control and visibility
- **French Translations**: Added missing French translations for cover popup buttons ("Tout Ouvrir", "Tout Fermer")

### 📝 Details

The cover popup has been completely redesigned to align with other aggregate popups:
- **Side-by-side action buttons**: Both "Open All" and "Close All" buttons are now always visible, replacing the previous conditional single-button display
- **Individual entity cards**: Each cover is now shown as a separate card with its own controls, instead of a single Magic Area group
- **Consistent UX**: Cover aggregates now behave identically to media_player, climate, and light aggregates

---

## 🇫🇷 Français

### 🐛 Corrections de bugs

- **Amélioration UX Popup Volets**: Correction des popups aggregate de volets pour afficher les boutons "Tout Ouvrir" et "Tout Fermer" côte à côte, aligné sur le comportement des autres aggregates (media_player, climate, lights)
- **Entités Individuelles de Volets**: Les popups de volets affichent maintenant les entités individuelles au lieu d'afficher uniquement l'entité groupe Magic Area, offrant un meilleur contrôle et une meilleure visibilité
- **Traductions Françaises**: Ajout des traductions françaises manquantes pour les boutons de popup de volets ("Tout Ouvrir", "Tout Fermer")

### 📝 Détails

La popup des volets a été complètement repensée pour s'aligner sur les autres popups aggregate :
- **Boutons d'action côte à côte**: Les boutons "Tout Ouvrir" et "Tout Fermer" sont maintenant toujours visibles, remplaçant l'affichage conditionnel d'un seul bouton
- **Cartes d'entités individuelles**: Chaque volet est maintenant affiché comme une carte séparée avec ses propres contrôles, au lieu d'un seul groupe Magic Area
- **UX cohérente**: Les aggregates de volets se comportent maintenant de manière identique aux aggregates media_player, climate et lights

---

## 📊 Technical Details

### Modified Files
- `src/popups/CoverPopup.ts` - Replaced vertical-stack with horizontal-stack for control buttons, removed conditional rendering
- `src/Helper.ts` - Excluded covers from Magic Area group entity usage to show individual entities
- `custom_components/linus_dashboard/translations/en.json` - Added cover_popup section
- `custom_components/linus_dashboard/translations/fr.json` - Added French translations for cover popup

### Commits
- fix: improve cover popup UX with side-by-side buttons and individual entities
- chore: bump version to 1.4.1
