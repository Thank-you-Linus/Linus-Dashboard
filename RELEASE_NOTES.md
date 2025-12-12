# 🎉 Release Notes

> **Stable Release** - Version 1.4.0 brings enhanced customization and improved organization.

---

## 🇬🇧 English

### ✨ New Features

#### Manual Area & Floor Ordering (Home Assistant 2025.1+)
- **Full support for manual reordering** of areas and floors introduced in Home Assistant 2025.1
- **Drag & drop** your areas and floors in any order you prefer
- **Backward compatible** - works seamlessly with older Home Assistant versions
- **Automatic detection** - Linus Dashboard respects your custom order immediately
- **Smart sorting priority**: Manual order → Numeric level (floors) → Alphabetical fallback

#### Enhanced Embedded Dashboards
- Embedded dashboards feature now **prominently featured** in main documentation
- **Comprehensive guides** added for embedding custom dashboards
- Better positioning as a **core feature** accessible to all users
- Detailed use cases: Energy monitoring, Security cameras, Media control, Climate tracking

### 📚 Documentation Improvements

#### Streamlined README
- **Concise presentation** with "Key highlights" section
- Embedded dashboards added to **main feature list** (no longer hidden in advanced section)
- Removed redundant sections to improve readability
- **Inclusive positioning** - features accessible to all users, not just "power users"

#### Dedicated Feature Documentation
- New **docs/EMBEDDED_DASHBOARDS.md** - Comprehensive 199-line guide with examples
- New **docs/MANUAL_ORDERING.md** - Complete 211-line guide with backward compatibility details
- Reorganized internal documentation to **docs/development/** folder
- **Bilingual support** (English + French) for all new documentation

### ⚡ Improvements

- **Better discoverability** of key features through improved documentation structure
- **Cleaner project organization** with documentation properly categorized
- **Improved maintainability** with modular documentation (1 feature = 1 file)

### 🐛 Bug Fixes

_No bug fixes in this release_

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

#### Réorganisation manuelle des zones et étages (Home Assistant 2025.1+)
- **Support complet de la réorganisation manuelle** des zones et étages introduite dans Home Assistant 2025.1
- **Glissez-déposez** vos zones et étages dans l'ordre de votre choix
- **Rétrocompatible** - fonctionne parfaitement avec les anciennes versions de Home Assistant
- **Détection automatique** - Linus Dashboard respecte immédiatement votre ordre personnalisé
- **Priorité de tri intelligente** : Ordre manuel → Niveau numérique (étages) → Ordre alphabétique

#### Tableaux de bord intégrés améliorés
- La fonctionnalité de tableaux de bord intégrés est maintenant **mise en avant** dans la documentation principale
- **Guides complets** ajoutés pour l'intégration de tableaux de bord personnalisés
- Meilleur positionnement comme **fonctionnalité principale** accessible à tous les utilisateurs
- Cas d'usage détaillés : Monitoring énergie, Caméras de sécurité, Contrôle média, Suivi climatique

### 📚 Améliorations de la documentation

#### README simplifié
- **Présentation concise** avec section "Principaux avantages"
- Tableaux de bord intégrés ajoutés à la **liste des fonctionnalités principales** (plus caché dans la section avancée)
- Sections redondantes supprimées pour améliorer la lisibilité
- **Positionnement inclusif** - fonctionnalités accessibles à tous les utilisateurs, pas seulement les "utilisateurs avancés"

#### Documentation dédiée par fonctionnalité
- Nouveau **docs/EMBEDDED_DASHBOARDS.md** - Guide complet de 199 lignes avec exemples
- Nouveau **docs/MANUAL_ORDERING.md** - Guide complet de 211 lignes avec détails de compatibilité
- Documentation interne réorganisée dans le dossier **docs/development/**
- **Support bilingue** (Anglais + Français) pour toute la nouvelle documentation

### ⚡ Améliorations

- **Meilleure découvrabilité** des fonctionnalités clés grâce à une structure de documentation améliorée
- **Organisation du projet plus propre** avec documentation correctement catégorisée
- **Maintenabilité améliorée** avec documentation modulaire (1 fonctionnalité = 1 fichier)

### 🐛 Corrections de bugs

_Aucune correction de bug dans cette version_

---

## 📊 Technical Details

### Version
- **Current**: 1.4.0
- **Previous**: 1.4.0-beta.1

### Compatibility
- **Home Assistant**: 2023.9+ (2025.1+ recommended for manual ordering)
- **HACS**: Compatible
- **Python**: 3.11+
- **Node**: 18+

### Files Changed
- 5 files modified
- 427 lines added
- 14 lines removed
- 2 new documentation files
- 1 file reorganized

### Migration Notes
No breaking changes. This release is fully backward compatible with 1.4.0-beta.1.

### What's Next
- Continue improving documentation
- Add more use case examples
- Enhance embedded dashboard configuration UI
