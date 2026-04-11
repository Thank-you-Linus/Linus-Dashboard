# 🎉 Release Notes

---

## 🇬🇧 English

### ✨ New Features

- **Smart media player activity detection by device class** — TVs, receivers, and soundbars are now considered active whenever their state is not `off`, `standby`, `unavailable`, or `unknown`. Speakers and audio devices without a device class are only considered active when explicitly `playing`. This brings more accurate room occupancy detection and badge colors for media setups with mixed device types.

### 🐛 Bug Fixes

- **Areas and floors now respect your HA-defined order** — Areas and floors are displayed in the same order as configured in Home Assistant Settings → Areas (drag & drop order). Previously, Linus Dashboard was ignoring the user-defined order and displaying them arbitrarily.

- **Popups and chips now update reactively** — Replaced static values computed at render time with Jinja2 templates in `ActivityDetectionPopup`, `LinusBrainPopup`, and `AreaScenesChips`. Icon colors, icons, and content now update live when entity states change, instead of being frozen at the moment the popup was opened.

- **Activity sensor icons now auto-resolve correctly** — Replaced the `mushroom-template-card` with a native `tile` card in the Activity Detection popup. Entity icons are now automatically resolved based on domain and device class, instead of requiring explicit icon templates that could be missing or incorrect.

- **Fixed startup crash on Home Assistant 2026.4.0** — Added the missing `aiohasupervisor==0.4.3` dependency required by the `hassio` component at startup. Without it, Linus Dashboard would fail to initialize with a `ModuleNotFoundError` on HA 2026.4.0.

### ⚡ Improvements

- **Removed Magic Areas integration support** — All code, chips, views, popups, and utilities related to the [Magic Areas](https://github.com/jseidl/hass-magic_areas) third-party integration have been removed. Linus Dashboard now relies exclusively on native Home Assistant areas and Linus Brain for area management. If you were using Magic Areas, service calls have been replaced with `action: none` or native HA alternatives. See the updated README for details.

- **Cleaner home view layout** — Removed the redundant "Areas" section title from the home view for a less cluttered dashboard.

### 📝 Documentation

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

- **Détection d'activité intelligente des lecteurs multimédia par classe d'appareil** — Les TV, amplis et barres de son sont désormais considérés comme actifs dès que leur état n'est pas `off`, `standby`, `unavailable` ou `unknown`. Les enceintes et appareils audio sans classe d'appareil ne sont actifs que lorsqu'ils sont explicitement en état `playing`. Cela apporte une détection de présence plus précise et des couleurs de badge plus pertinentes pour les configurations multimédia avec des types d'appareils mixtes.

### 🐛 Corrections de bugs

- **Les pièces et étages respectent désormais votre ordre défini dans HA** — Les pièces et étages s'affichent dans le même ordre que celui configuré dans Paramètres → Zones de Home Assistant (ordre par glisser-déposer). Auparavant, Linus Dashboard ignorait cet ordre et les affichait de manière arbitraire.

- **Les popups et chips se mettent à jour de façon réactive** — Remplacement des valeurs statiques calculées au moment du rendu par des templates Jinja2 dans `ActivityDetectionPopup`, `LinusBrainPopup` et `AreaScenesChips`. Les couleurs d'icônes, icônes et contenus se mettent désormais à jour en temps réel lorsque les états des entités changent, au lieu d'être figés à l'ouverture de la popup.

- **Les icônes des capteurs d'activité se résolvent maintenant correctement** — Remplacement du `mushroom-template-card` par une carte native `tile` dans la popup de détection d'activité. Les icônes des entités sont désormais résolues automatiquement en fonction du domaine et de la classe d'appareil, sans nécessiter de templates d'icônes explicites.

- **Correction du crash au démarrage sur Home Assistant 2026.4.0** — Ajout de la dépendance manquante `aiohasupervisor==0.4.3`, requise par le composant `hassio` au démarrage. Sans elle, Linus Dashboard échouait à s'initialiser avec une `ModuleNotFoundError` sur HA 2026.4.0.

### ⚡ Améliorations

- **Suppression du support de l'intégration Magic Areas** — Tout le code, les chips, vues, popups et utilitaires liés à l'intégration tierce [Magic Areas](https://github.com/jseidl/hass-magic_areas) ont été supprimés. Linus Dashboard s'appuie désormais exclusivement sur les zones natives de Home Assistant et Linus Brain pour la gestion des pièces. Si vous utilisiez Magic Areas, les appels de services ont été remplacés par `action: none` ou des alternatives natives HA. Consultez le README mis à jour pour plus de détails.

- **Interface vue principale plus épurée** — Suppression du titre de section "Areas" redondant dans la vue principale pour un tableau de bord plus lisible.

### 📝 Documentation

---

## 📊 Technical Details

### All Commits

- Update/ha 2026.4.0 (#132) (a43d853)
- build(deps): bump actions/setup-python from 6.1.0 to 6.2.0 (#107) (1f3c9cb)
- build(deps): bump ruff from 0.14.10 to 0.15.9 (#130) (5414c12)
- chore: SAPIENS setup — commands, opencode config, BOOT.md, track templates (3b42a7c)
- refactor: remove Magic Areas integration support (#126) (42ff05e)
- feat(media-player): differentiate activity detection by device class (5d8007e)
- fix: use tile card for activity sensors to get real entity icons (916d124)
- fix: use reactive Jinja2 templates instead of static state values in popups and chips (0a4aea8)
- fix: preserve HA user-defined order for areas and floors (#120) (4a52bf8)
- fix(deps): update bundled libs and add custom-elements-guard (a4dbfbf)

### Contributors

- @Julien Decoen
- @dependabot[bot]
