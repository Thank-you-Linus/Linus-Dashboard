# 🚀 Linus Dashboard 1.4.1

## 🇬🇧 English

### ✨ New Features

_No new features in this release_

### 🐛 Bug Fixes

- **Fixed smoke tests script** - Resolved issue with arithmetic operations in bash causing CI/CD failures with `set -e`

### ⚡ Improvements

- **Code refactoring** - Improved code structure for better readability and maintainability
- **Documentation updates** - Enhanced release notes formatting

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

---

## 🇫🇷 Français

### ✨ Nouvelles fonctionnalités

_Aucune nouvelle fonctionnalité dans cette version_

### 🐛 Corrections de bugs

- **Correction du script de smoke tests** - Résolution d'un problème avec les opérations arithmétiques en bash causant des échecs CI/CD avec `set -e`

### ⚡ Améliorations

- **Refactorisation du code** - Amélioration de la structure du code pour une meilleure lisibilité et maintenabilité
- **Mises à jour de la documentation** - Amélioration du formatage des notes de version

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

---

## 📊 Technical Details

### Version
- **Current**: 1.4.1
- **Previous**: 1.4.0

### Compatibility
- **Home Assistant**: 2023.9+ (2025.1+ recommended for manual ordering features from v1.4.0)
- **HACS**: Compatible
- **Python**: 3.11+
- **Node**: 18+

### Changes
- Fixed smoke tests script: replaced `((VAR++))` with `VAR=$((VAR + 1))` to work with `set -e`
- Code refactoring for better maintainability
- Documentation improvements

### Migration Notes
No breaking changes. This release is fully backward compatible with 1.4.0.

---

**Full Changelog**: https://github.com/Thank-you-Linus/Linus-Dashboard/compare/v1.4.0...v1.4.1
