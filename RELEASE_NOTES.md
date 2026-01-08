# 🧪 Linus Dashboard 1.4.1-beta.1 - Beta Test Release

> **⚠️ This is a BETA release for testing purposes**
> Please report any issues on [GitHub Issues](https://github.com/Thank-you-Linus/Linus-Dashboard/issues)

---

## 🇬🇧 English

### 🐛 Bug Fixes

#### **Fixed Magic Areas Integration Issues**

Magic Areas integration was causing problems with binary sensor popups, showing only the aggregate entity instead of individual sensors.

- **Binary Sensor Popups** - Now correctly displays all individual sensors (motion, occupancy, door, window, etc.) instead of just the Magic Areas aggregate entity
- **Sensor Popups** - Fixed same issue for regular sensors (temperature, humidity, battery, etc.)
- **Global Chips** - Global occupation/motion chips now show proper entity lists
- **Improved Entity Resolution** - Smart logic to use Magic Areas aggregates for controllable domains (lights, climate) but individual entities for sensors

**Technical Details:**
- Modified [Helper.ts:1261-1265](src/Helper.ts#L1261-L1265) to skip Magic Areas for binary_sensor/sensor domains
- Ensures individual entity visibility for monitoring devices while keeping smart aggregation for control devices

#### **Fixed Navigation Button Labels and Translations**

Navigation buttons in aggregate popups were showing incorrect labels like "View All Binary_sensors" instead of the proper device class name.

- **Device Class Support** - Buttons now show proper device class names (e.g., "View All Occupation", "View All Temperature")
- **French Translations** - Navigation buttons fully translated (e.g., "Voir tout Occupation", "Voir tout Température")
- **Consistent Labels** - All domains now use Home Assistant's native translations when available
- **Added Translation Key** - New `view_all_prefix` translation key for "View All" / "Voir tout"

**Technical Details:**
- Enhanced [AggregatePopup.ts:329-348](src/popups/AggregatePopup.ts#L329-L348) to use `getDomainTranslationKey()`
- Added translations in [fr.json:214](custom_components/linus_dashboard/translations/fr.json#L214) and [en.json:214](custom_components/linus_dashboard/translations/en.json#L214)

### 🧪 Beta Testing Checklist

**Please test the following:**

- [ ] **Magic Areas Integration**: Verify that clicking on global occupation/motion/door/window chips shows all individual sensors, not just aggregate entities
- [ ] **Binary Sensor Popups**: Check that area/floor level binary sensor popups display complete entity lists
- [ ] **Navigation Buttons**: Confirm that "View All X" buttons show correct translated device class names (French and English)
- [ ] **Sensor Statistics**: Verify that sensor aggregates (temperature, humidity, battery) still display correct average/sum calculations
- [ ] **Control Domains**: Ensure that lights, climate, and covers still use Magic Areas aggregates when available

**Known Testing Environment:**
- Home Assistant: Latest stable version recommended
- Magic Areas: If installed, test with both aggregate and individual entities
- Browser Mod: Required for popup functionality
- Languages: Test both French and English UI

### 📝 Known Issues

None at this time. Please report any issues you encounter!

### 🔄 Migration Notes

No breaking changes. This is a bug fix release that improves existing functionality.

---

## 🇫🇷 Français

### 🐛 Corrections de Bugs

#### **Correction des Problèmes d'Intégration Magic Areas**

L'intégration Magic Areas causait des problèmes avec les popups de capteurs binaires, affichant seulement l'entité agrégée au lieu des capteurs individuels.

- **Popups de Capteurs Binaires** - Affiche maintenant correctement tous les capteurs individuels (mouvement, occupation, porte, fenêtre, etc.) au lieu de juste l'entité agrégée Magic Areas
- **Popups de Capteurs** - Correction du même problème pour les capteurs réguliers (température, humidité, batterie, etc.)
- **Chips Globales** - Les chips globales d'occupation/mouvement affichent maintenant les listes d'entités appropriées
- **Résolution d'Entités Améliorée** - Logique intelligente pour utiliser les agrégats Magic Areas pour les domaines contrôlables (lumières, climat) mais les entités individuelles pour les capteurs

**Détails Techniques :**
- Modifié [Helper.ts:1261-1265](src/Helper.ts#L1261-L1265) pour ignorer Magic Areas pour les domaines binary_sensor/sensor
- Garantit la visibilité des entités individuelles pour les appareils de monitoring tout en gardant l'agrégation intelligente pour les appareils de contrôle

#### **Correction des Labels et Traductions des Boutons de Navigation**

Les boutons de navigation dans les popups agrégées affichaient des labels incorrects comme "View All Binary_sensors" au lieu du nom de classe d'appareil approprié.

- **Support des Classes d'Appareils** - Les boutons affichent maintenant les noms de classes d'appareils appropriés (ex: "Voir tout Occupation", "Voir tout Température")
- **Traductions Françaises** - Boutons de navigation entièrement traduits (ex: "Voir tout Occupation", "Voir tout Température")
- **Labels Cohérents** - Tous les domaines utilisent maintenant les traductions natives de Home Assistant quand disponibles
- **Ajout de Clé de Traduction** - Nouvelle clé de traduction `view_all_prefix` pour "View All" / "Voir tout"

**Détails Techniques :**
- Amélioré [AggregatePopup.ts:329-348](src/popups/AggregatePopup.ts#L329-L348) pour utiliser `getDomainTranslationKey()`
- Ajout des traductions dans [fr.json:214](custom_components/linus_dashboard/translations/fr.json#L214) et [en.json:214](custom_components/linus_dashboard/translations/en.json#L214)

### 🧪 Checklist de Test Beta

**Merci de tester les points suivants :**

- [ ] **Intégration Magic Areas** : Vérifier que cliquer sur les chips globales d'occupation/mouvement/porte/fenêtre affiche tous les capteurs individuels, pas seulement les entités agrégées
- [ ] **Popups de Capteurs Binaires** : Vérifier que les popups de capteurs binaires au niveau zone/étage affichent les listes complètes d'entités
- [ ] **Boutons de Navigation** : Confirmer que les boutons "Voir tout X" affichent les noms de classes d'appareils corrects et traduits (français et anglais)
- [ ] **Statistiques de Capteurs** : Vérifier que les agrégats de capteurs (température, humidité, batterie) affichent toujours les calculs de moyenne/somme corrects
- [ ] **Domaines de Contrôle** : S'assurer que les lumières, le climat et les volets utilisent toujours les agrégats Magic Areas quand disponibles

**Environnement de Test Recommandé :**
- Home Assistant : Dernière version stable recommandée
- Magic Areas : Si installé, tester avec à la fois les entités agrégées et individuelles
- Browser Mod : Requis pour la fonctionnalité de popup
- Langues : Tester à la fois l'interface française et anglaise

### 📝 Problèmes Connus

Aucun pour le moment. Merci de signaler tout problème rencontré !

### 🔄 Notes de Migration

Aucun changement cassant. Ceci est une release de correction de bugs qui améliore les fonctionnalités existantes.

---

## 📊 Technical Details

### Changes Since 1.4.0

**Bug Fixes:**
- Fixed Magic Areas integration showing only aggregate entities for binary_sensor/sensor domains
- Fixed navigation button labels to show correct device_class translations
- Added missing `view_all_prefix` translation key

**Files Modified:**
- `src/Helper.ts` (lines 1261-1265) - Entity resolution logic
- `src/popups/AggregatePopup.ts` (lines 329-348) - Navigation button labels
- `custom_components/linus_dashboard/translations/fr.json` (line 214) - French translations
- `custom_components/linus_dashboard/translations/en.json` (line 214) - English translations

**Commits:**
- e7dd125 - refactor: consolidate domain tag construction and improve code maintainability
- e287f4e - fix: enhance domain checking logic for device classes in createItemsFromList function

---

**Ready to test?** Update through HACS (enable beta versions) or manually download from [GitHub Releases](https://github.com/Thank-you-Linus/Linus-Dashboard/releases)!
