# 🎉 Release Notes - 1.5.1-beta.2

---

## 🇬🇧 English

### ✨ New Features

_No new features in this patch release._

### 🐛 Bug Fixes

- **Reactive Jinja2 templates in popups and chips** — Popups and chips now use reactive Jinja2 templates that automatically update when entity states change, instead of static state values. This ensures the UI always displays the most current information without requiring manual refresh. (#121)
- **Tile card for activity sensors** — Activity sensors now use the tile card to display real entity icons, providing a more consistent and informative user experience.
- **Devcontainer venv installation resolved** — Fixed an issue with the devcontainer that prevented proper virtual environment installation, improving the development setup experience.
- **Home Assistant requirement updated to 2026.2.3** — Updated the minimum Home Assistant version requirement to the latest stable release.

### 🧪 For Beta Testers

**What to test:**
- [ ] Verify that popup content updates automatically when entity states change
- [ ] Confirm that chip values reflect real-time state changes without page reload
- [ ] Test activity sensor tiles display correct entity icons
- [ ] Verify the devcontainer setup works correctly for local development

**Known Issues:**
- None currently

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

_Aucune nouvelle fonctionnalité dans cette version patch._

### 🐛 Corrections de bugs

- **Modèles Jinja2 réactifs dans les popups et chips** — Les popups et chips utilisent désormais des modèles Jinja2 réactifs qui se mettent à jour automatiquement lorsque les états des entités changent, au lieu de valeurs statiques. Cela garantit que l'interface affiche toujours les informations les plus récentes sans nécessiter de rafraîchissement manuel. (#121)
- **Carte tuile pour les capteurs d'activité** — Les capteurs d'activité utilisent maintenant la carte tuile pour afficher les真正的 icônes d'entités, offrant une expérience utilisateur plus cohérente et informative.
- **Résolution de l'installation venv du devcontainer** — Correction d'un problème avec le devcontainer qui empêchait l'installation correcte de l'environnement virtuel, améliorant l'expérience de configuration de développement.
- **Exigence Home Assistant mise à jour vers 2026.2.3** — Mise à jour de la version minimale de Home Assistant vers la dernière version stable.

### 🧪 Pour les Beta Testeurs

**Quoi tester :**
- [ ] Vérifier que le contenu des popups se met à jour automatiquement lorsque les états des entités changent
- [ ] Confirmer que les valeurs des chips reflètent les changements d'état en temps réel sans rechargement de page
- [ ] Tester que les tuiles des capteurs d'activité affichent les vraies icônes d'entités
- [ ] Vérifier que la configuration du devcontainer fonctionne correctement pour le développement local

**Problèmes connus :**
- Aucun actuellement

---

## 📊 Technical Details

### All Commits

- fix: use reactive Jinja2 templates instead of static state values in popups and chips (0a4aea8)
- fix: use tile card for activity sensors to get real entity icons (916d124)
- fix: resolve devcontainer venv installation (a56ac6d)
- chore: update HA requirement to 2026.2.3 and rebuild (9cb2a50)

### Contributors

- @Juicy
