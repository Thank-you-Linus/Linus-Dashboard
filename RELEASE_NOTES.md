# 🚀 Linus Dashboard 1.4.1

## 🇬🇧 English

### 📦 What's New

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

### 📥 Installation

#### Via HACS (Recommended)

1. Open HACS
2. Go to "Integrations"
3. Search for "Linus Dashboard"
4. Click "Update"

#### Manual Installation

1. Download `linus-dashboard-1.4.1.zip` from the release
2. Extract to `config/custom_components/linus_dashboard/`
3. Restart Home Assistant

### 🧪 For Beta Testers

This is a maintenance release with code improvements and documentation updates.

**What to test:**

- Verify that manual area and floor ordering still works correctly
- Check that embedded dashboards function properly
- Ensure all existing features work as expected after the refactoring

**Feedback:**
Please report any issues on GitHub or Discord.

---

## 🇫🇷 Français

### 📦 Nouveautés

#### 🔧 Améliorations

- **Refactorisation de la structure du code** pour une meilleure lisibilité et maintenabilité
- Mise à jour des notes de version avec le titre "Intégrer n'importe quoi" et amélioration de l'accent sur les tableaux de bord personnalisés
- Support amélioré de la réorganisation manuelle des zones et étages

### 📥 Installation

#### Via HACS (Recommandé)

1. Ouvrez HACS
2. Allez dans "Intégrations"
3. Recherchez "Linus Dashboard"
4. Cliquez sur "Mettre à jour"

#### Installation manuelle

1. Téléchargez `linus-dashboard-1.4.1.zip` depuis la release
2. Extrayez dans `config/custom_components/linus_dashboard/`
3. Redémarrez Home Assistant

### 🧪 Pour les testeurs Beta

Ceci est une version de maintenance avec des améliorations du code et des mises à jour de la documentation.

**Ce qu'il faut tester :**

- Vérifier que l'ordre manuel des zones et étages fonctionne toujours correctement
- Vérifier que les tableaux de bord intégrés fonctionnent correctement
- S'assurer que toutes les fonctionnalités existantes fonctionnent comme prévu après la refactorisation

**Retours :**
Merci de signaler tout problème sur GitHub ou Discord.

---

## 📊 Technical Details

### Version

- **Current**: 1.4.1
- **Previous**: 1.4.0

### Compatibility

- **Home Assistant**: 2023.9+ (2025.1+ recommended for manual ordering)
- **HACS**: Compatible
- **Python**: 3.11+
- **Node**: 18+

### Files Changed

- 3 commits since 1.4.0
- Code refactoring for better maintainability
- Documentation improvements

### Migration Notes

No breaking changes. This release is fully backward compatible with 1.4.0.

---

**Full Changelog**: https://github.com/Thank-you-Linus/Linus-Dashboard/compare/v1.4.0...v1.4.1
